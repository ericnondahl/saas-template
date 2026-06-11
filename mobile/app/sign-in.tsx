import { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter, Link } from "expo-router";
import { useSignIn, useSignUp, useSSO, useAuth } from "@clerk/clerk-expo";
import * as AppleAuthentication from "expo-apple-authentication";
import * as Application from "expo-application";
import * as Crypto from "expo-crypto";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { Ionicons } from "@expo/vector-icons";
import { latchSignedIn } from "../lib/authGuard";
import { markSignedInBefore } from "../lib/authStorage";

// Required for OAuth to work properly on web - only call on web platform
if (Platform.OS === "web") {
  WebBrowser.maybeCompleteAuthSession();
}

// API URL for syncing user to database
const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

// Warm up browser for faster OAuth on Android
const useWarmUpBrowser = () => {
  useEffect(() => {
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);
};

export default function SignInScreen() {
  useWarmUpBrowser();

  const { signIn, setActive, isLoaded } = useSignIn();
  const { signUp: clerkSignUp } = useSignUp();
  const { startSSOFlow } = useSSO();
  const { getToken } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needs2FA, setNeeds2FA] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");

  // Debug: Listen for incoming URLs to see if redirect is received
  useEffect(() => {
    const subscription = Linking.addEventListener("url", (event) => {
      console.log("Received URL:", event.url);
    });

    // Check if app was opened with a URL
    Linking.getInitialURL().then((url) => {
      if (url) {
        console.log("Initial URL:", url);
      }
    });

    return () => subscription.remove();
  }, []);

  // Sync user to database after sign-in. `name` carries the name captured
  // from Apple's native credential — Apple provides it only on the first
  // authorization, and never through the OAuth flow.
  const syncUserToDatabase = async (name?: { firstName?: string; lastName?: string }) => {
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
      // Don't block sign-in if sync fails
      console.warn("Error syncing user:", err);
    }
  };

  // Common post-setActive steps for every auth flow. Latch BEFORE navigating
  // so the (tabs) guard can't bounce us back on a transient signed-out read
  // while Clerk reloads resources — see lib/authGuard.ts.
  const completeSignIn = async (name?: { firstName?: string; lastName?: string }) => {
    latchSignedIn();
    // Remember this device has authenticated, so a later expired-session
    // cold start routes to /sign-in rather than the new-install flow.
    markSignedInBefore();
    await syncUserToDatabase(name);
    router.replace("/(tabs)");
  };

  // Handle Google OAuth sign in using Clerk's hosted OAuth
  const handleGoogleSignIn = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

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
        setError("Please complete the sign-up process");
      }
    } catch (err: any) {
      console.error("Google sign in error:", err);
      setError(
        err.errors?.[0]?.message || "Failed to sign in with Google. Try email sign-in instead."
      );
    } finally {
      setIsLoading(false);
    }
  }, [startSSOFlow, router, getToken]);

  // Handle Apple sign in - native on iOS, OAuth on Android
  const handleAppleSignIn = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

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
          setError("No identity token received from Apple Sign-In.");
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
          await clerkSignUp!.create({ transfer: true });
          sessionId = clerkSignUp!.createdSessionId;
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
          setError("Please complete the sign-in process");
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
      setError(err.errors?.[0]?.message || "Failed to sign in with Apple");
    } finally {
      setIsLoading(false);
    }
  }, [signIn, clerkSignUp, setActive, startSSOFlow, router]);

  // Handle email/password sign in
  const handleEmailSignIn = async () => {
    if (!isLoaded) return;

    if (!email || !password) {
      setError("Please enter your email and password");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log("Attempting sign in with email:", email);

      const result = await signIn.create({
        identifier: email,
        password,
      });

      console.log("Sign in result status:", result.status);
      console.log("Supported second factors:", result.supportedSecondFactors);

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        await completeSignIn();
      } else if (result.status === "needs_first_factor") {
        // Need to complete first factor auth (e.g., password)
        // Try to prepare the first factor
        const firstFactor = result.supportedFirstFactors?.find((f) => f.strategy === "password");
        if (firstFactor) {
          const attemptResult = await signIn.attemptFirstFactor({
            strategy: "password",
            password,
          });

          if (attemptResult.status === "complete") {
            await setActive({ session: attemptResult.createdSessionId });
            await completeSignIn();
          } else {
            console.log("First factor attempt result:", attemptResult);
            setError("Sign in requires additional verification");
          }
        } else {
          setError("Password authentication not available for this account");
        }
      } else if (result.status === "needs_second_factor") {
        // 2FA is enabled - check for email_code strategy
        console.log("2FA required. Second factors:", result.supportedSecondFactors);

        const emailCodeFactor = result.supportedSecondFactors?.find(
          (f) => f.strategy === "email_code"
        );

        if (emailCodeFactor) {
          // Prepare the second factor - this sends the email
          await signIn.prepareSecondFactor({
            strategy: "email_code",
          });
          setNeeds2FA(true);
          setError(null);
          console.log("2FA code sent to email");
        } else {
          setError("Unsupported 2FA method. Please use the web app to sign in.");
        }
      } else {
        console.log("Unexpected sign in status:", result.status);
        setError(`Sign in incomplete (status: ${result.status}). Please try again.`);
      }
    } catch (err: any) {
      console.error("Sign in error:", err?.message || err);
      setError(
        err.errors?.[0]?.longMessage || err.errors?.[0]?.message || "Invalid email or password"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle 2FA code verification
  const handle2FAVerification = async () => {
    if (!isLoaded || !verificationCode) {
      setError("Please enter the verification code");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const result = await signIn.attemptSecondFactor({
        strategy: "email_code",
        code: verificationCode,
      });

      console.log("2FA verification result:", result.status);

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        await completeSignIn();
      } else {
        setError("Verification incomplete. Please try again.");
      }
    } catch (err: any) {
      console.error("2FA verification error:", err?.message || err);
      setError(
        err.errors?.[0]?.longMessage || err.errors?.[0]?.message || "Invalid verification code"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Resend 2FA code
  const resend2FACode = async () => {
    if (!signIn) return;

    try {
      setIsLoading(true);
      await signIn.prepareSecondFactor({
        strategy: "email_code",
      });
      setError(null);
      console.log("2FA code resent");
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Failed to resend code");
    } finally {
      setIsLoading(false);
    }
  };

  // 2FA Verification UI
  if (needs2FA) {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <Ionicons name="mail" size={48} color="#3b82f6" />
            </View>
            <Text style={styles.title}>Check Your Email</Text>
            <Text style={styles.subtitle}>
              We sent a verification code to{"\n"}
              <Text style={styles.emailHighlight}>{email}</Text>
            </Text>

            {error && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={20} color="#dc2626" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Verification Code</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter 6-digit code"
                placeholderTextColor="#9ca3af"
                value={verificationCode}
                onChangeText={setVerificationCode}
                keyboardType="number-pad"
                maxLength={6}
                editable={!isLoading}
              />
            </View>

            <Pressable
              style={[styles.signInButton, isLoading && styles.buttonDisabled]}
              onPress={handle2FAVerification}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.signInButtonText}>Verify</Text>
              )}
            </Pressable>

            <Pressable style={styles.resendButton} onPress={resend2FACode} disabled={isLoading}>
              <Text style={styles.resendButtonText}>Resend Code</Text>
            </Pressable>

            <Pressable
              style={styles.backButton}
              onPress={() => {
                setNeeds2FA(false);
                setVerificationCode("");
                setError(null);
              }}
            >
              <Ionicons name="arrow-back" size={16} color="#6b7280" />
              <Text style={styles.backButtonText}>Back to Sign In</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>

          {error && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={20} color="#dc2626" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Google Sign In Button */}
          <Pressable
            style={[styles.googleButton, isLoading && styles.buttonDisabled]}
            onPress={handleGoogleSignIn}
            disabled={isLoading}
          >
            <Ionicons name="logo-google" size={20} color="#ffffff" />
            <Text style={styles.googleButtonText}>Continue with Google</Text>
          </Pressable>

          {/* Apple Sign In Button */}
          <Pressable
            style={[styles.appleButton, isLoading && styles.buttonDisabled]}
            onPress={handleAppleSignIn}
            disabled={isLoading}
          >
            <Ionicons name="logo-apple" size={20} color="#ffffff" />
            <Text style={styles.appleButtonText}>Continue with Apple</Text>
          </Pressable>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#9ca3af"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              editable={!isLoading}
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor="#9ca3af"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
              editable={!isLoading}
            />
          </View>

          {/* Sign In Button */}
          <Pressable
            style={[styles.signInButton, isLoading && styles.buttonDisabled]}
            onPress={handleEmailSignIn}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.signInButtonText}>Sign In</Text>
            )}
          </Pressable>

          {/* Sign Up Link */}
          <View style={styles.signUpContainer}>
            <Text style={styles.signUpText}>Don't have an account? </Text>
            <Link href="/sign-up" asChild>
              <Pressable>
                <Text style={styles.signUpLink}>Sign Up</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#111827",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 32,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef2f2",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    color: "#dc2626",
    fontSize: 14,
    flex: 1,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4285f4",
    paddingVertical: 14,
    borderRadius: 8,
    gap: 12,
  },
  googleButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  appleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000000",
    paddingVertical: 14,
    borderRadius: 8,
    gap: 12,
    marginTop: 12,
  },
  appleButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e5e7eb",
  },
  dividerText: {
    color: "#9ca3af",
    paddingHorizontal: 16,
    fontSize: 14,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#111827",
  },
  signInButton: {
    backgroundColor: "#3b82f6",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  signInButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  signUpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  signUpText: {
    color: "#6b7280",
    fontSize: 14,
  },
  signUpLink: {
    color: "#3b82f6",
    fontSize: 14,
    fontWeight: "600",
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  emailHighlight: {
    color: "#3b82f6",
    fontWeight: "600",
  },
  resendButton: {
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  resendButtonText: {
    color: "#3b82f6",
    fontSize: 14,
    fontWeight: "600",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 24,
  },
  backButtonText: {
    color: "#6b7280",
    fontSize: 14,
  },
});
