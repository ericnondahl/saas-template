import { useCallback, useEffect, useState } from "react";
import { Platform } from "react-native";
import { useRouter } from "expo-router";
import { useAuth, useSignIn, useSignUp, useSSO } from "@clerk/clerk-expo";
import * as AppleAuthentication from "expo-apple-authentication";
import * as Application from "expo-application";
import * as Crypto from "expo-crypto";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { latchSignedIn } from "./authGuard";
import { markSignedInBefore } from "./authStorage";

// Required for OAuth to work properly on web - only call on web platform
if (Platform.OS === "web") {
  WebBrowser.maybeCompleteAuthSession();
}

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

type SyncName = { firstName?: string; lastName?: string };

/**
 * Sync the signed-in user to the database. `name` carries the name captured
 * from Apple's native credential — Apple provides it only on the first
 * authorization, and never through the OAuth flow.
 */
export async function syncUserToDatabase(
  getToken: () => Promise<string | null>,
  name?: SyncName
): Promise<void> {
  try {
    console.log("Syncing user to database");
    const token = await getToken();
    if (!token) {
      console.warn("No token available for sync");
      return;
    }

    const response = await fetch(`${API_URL}/api/sync-user`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...name,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        platform: Platform.OS,
        clientVersion: Application.nativeApplicationVersion ?? undefined,
      }),
    });

    if (!response.ok) {
      console.warn("Failed to sync user:", response.status);
    } else {
      console.log("User synced to database");
    }
  } catch (err) {
    // Don't block auth if sync fails
    console.warn("Error syncing user:", err);
  }
}

/**
 * Google and Apple auth flows shared by the sign-in and sign-up screens.
 * Clerk treats social auth uniformly — an existing user signs in, a new one
 * transfers to sign-up — so both screens use the exact same handlers.
 */
export function useSocialAuth() {
  const { signIn, setActive } = useSignIn();
  const { signUp } = useSignUp();
  const { startSSOFlow } = useSSO();
  const { getToken } = useAuth();
  const router = useRouter();

  const [isSocialLoading, setIsSocialLoading] = useState(false);
  const [socialError, setSocialError] = useState<string | null>(null);

  // Warm up the browser for faster OAuth on Android
  useEffect(() => {
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);

  // Common post-setActive steps for every auth flow (email ones included —
  // the screens call this too). Latch BEFORE navigating so the (tabs) guard
  // can't bounce us back on a transient signed-out read while Clerk reloads
  // resources — see lib/authGuard.ts.
  const completeSignIn = useCallback(
    async (name?: SyncName) => {
      latchSignedIn();
      // Remember this device has authenticated, so a later expired-session
      // cold start routes to /sign-in rather than the new-install flow.
      markSignedInBefore();
      await syncUserToDatabase(getToken, name);
      router.replace("/(tabs)");
    },
    [getToken, router]
  );

  // Google OAuth via Clerk's hosted flow
  const signInWithGoogle = useCallback(async () => {
    try {
      setIsSocialLoading(true);
      setSocialError(null);

      const redirectUrl = Linking.createURL("oauth-callback");
      console.log("Starting OAuth with redirect URL:", redirectUrl);

      const result = await startSSOFlow({
        strategy: "oauth_google",
        redirectUrl,
      });

      // Note: Don't JSON.stringify the result - it has getters that access window.location
      // which doesn't exist in React Native and causes "href of undefined" errors
      console.log("OAuth completed, sessionId:", result.createdSessionId);

      if (result.createdSessionId) {
        await result.setActive!({ session: result.createdSessionId });
        await completeSignIn();
      } else if (result.signIn || result.signUp) {
        // Handle cases where additional steps might be needed
        console.log("OAuth requires additional steps");
        setSocialError("Please complete the sign-up process");
      }
    } catch (err: any) {
      console.error("Google sign in error:", err);
      setSocialError(
        err.errors?.[0]?.message || "Failed to sign in with Google. Try email sign-in instead."
      );
    } finally {
      setIsSocialLoading(false);
    }
  }, [startSSOFlow, completeSignIn]);

  // Apple - native on iOS, OAuth on Android
  const signInWithApple = useCallback(async () => {
    try {
      setIsSocialLoading(true);
      setSocialError(null);

      if (Platform.OS === "ios") {
        // Custom native Apple authentication to capture the user's name
        // (Clerk's OAuth flow discards the name from Apple's credential,
        // and Apple only provides it on the very first authorization)
        const nonce = Crypto.randomUUID();

        const credential = await AppleAuthentication.signInAsync({
          requestedScopes: [
            AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
            AppleAuthentication.AppleAuthenticationScope.EMAIL,
          ],
          nonce,
        });

        const appleFirstName = credential.fullName?.givenName ?? undefined;
        const appleLastName = credential.fullName?.familyName ?? undefined;

        const { identityToken } = credential;
        if (!identityToken) {
          setSocialError("No identity token received from Apple Sign-In.");
          return;
        }

        // Exchange the Apple ID token with Clerk
        await signIn!.create({
          strategy: "oauth_token_apple",
          token: identityToken,
        });

        // Check if user needs to be created (transfer from sign-in to sign-up)
        const userNeedsToBeCreated = signIn!.firstFactorVerification.status === "transferable";

        let sessionId: string | null;
        if (userNeedsToBeCreated) {
          await signUp!.create({ transfer: true });
          sessionId = signUp!.createdSessionId;
        } else {
          sessionId = signIn!.createdSessionId;
        }

        if (sessionId) {
          await setActive!({ session: sessionId });
          await completeSignIn({ firstName: appleFirstName, lastName: appleLastName });
        }
      } else {
        // Use OAuth-based flow on Android
        const redirectUrl = Linking.createURL("oauth-callback");
        console.log("Starting Apple OAuth with redirect URL:", redirectUrl);

        const result = await startSSOFlow({
          strategy: "oauth_apple",
          redirectUrl,
        });

        if (result.createdSessionId) {
          await result.setActive!({ session: result.createdSessionId });
          await completeSignIn();
        } else if (result.signIn || result.signUp) {
          console.log("Apple OAuth requires additional steps");
          setSocialError("Please complete the sign-in process");
        }
      }
    } catch (err: any) {
      if (err.code === "ERR_REQUEST_CANCELED") {
        // User cancelled - not an error
        return;
      }
      if (err.errors?.[0]?.code === "session_exists") {
        router.replace("/(tabs)");
        return;
      }
      console.error("Apple sign in error:", err);
      setSocialError(err.errors?.[0]?.message || "Failed to sign in with Apple");
    } finally {
      setIsSocialLoading(false);
    }
  }, [signIn, signUp, setActive, startSSOFlow, router, completeSignIn]);

  return { signInWithGoogle, signInWithApple, completeSignIn, isSocialLoading, socialError };
}
