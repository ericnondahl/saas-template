import { useEffect } from "react";
import { Stack, useSegments, usePathname } from "expo-router";
import { ClerkProvider, ClerkLoaded, useUser } from "@clerk/clerk-expo";
import * as SecureStore from "expo-secure-store";
import * as SplashScreen from "expo-splash-screen";
import { PostHogProvider, usePostHog } from "posthog-react-native";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || "";
const POSTHOG_KEY = process.env.EXPO_PUBLIC_POSTHOG_KEY || "";
const POSTHOG_HOST = process.env.EXPO_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

// Token cache for Clerk
const tokenCache = {
  async getToken(key: string) {
    try {
      return SecureStore.getItemAsync(key);
    } catch (err) {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (err) {
      return;
    }
  },
};

// Component to handle user identification and screen tracking
function PostHogUserIdentifier({ children }: { children: React.ReactNode }) {
  const posthog = usePostHog();
  const { user, isSignedIn } = useUser();
  const pathname = usePathname();
  const segments = useSegments();

  // Track screen views using Expo Router's pathname
  useEffect(() => {
    if (posthog && pathname) {
      posthog.screen(pathname);
    }
  }, [pathname, posthog]);

  // Identify user when signed in
  useEffect(() => {
    if (isSignedIn && user && posthog) {
      const properties: Record<string, string> = {};
      if (user.primaryEmailAddress?.emailAddress) {
        properties.email = user.primaryEmailAddress.emailAddress;
      }
      if (user.fullName) {
        properties.name = user.fullName;
      }
      posthog.identify(user.id, properties);
    } else if (posthog) {
      posthog.reset();
    }
  }, [isSignedIn, user, posthog]);

  return children;
}

export default function RootLayout() {
  useEffect(() => {
    // Hide splash screen after a short delay
    setTimeout(() => {
      SplashScreen.hideAsync();
    }, 1000);
  }, []);

  return (
    <PostHogProvider
      apiKey={POSTHOG_KEY}
      autocapture={false}
      options={{
        host: POSTHOG_HOST,
        enableSessionReplay: true,
        sessionReplayConfig: {
          maskAllTextInputs: true,
          maskAllImages: false,
        },
      }}
    >
      <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} tokenCache={tokenCache}>
        <ClerkLoaded>
          <PostHogUserIdentifier>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="sign-in" options={{ title: "Sign In" }} />
              <Stack.Screen name="sign-up" options={{ title: "Sign Up" }} />
              <Stack.Screen name="oauth-callback" options={{ headerShown: false }} />
            </Stack>
          </PostHogUserIdentifier>
        </ClerkLoaded>
      </ClerkProvider>
    </PostHogProvider>
  );
}
