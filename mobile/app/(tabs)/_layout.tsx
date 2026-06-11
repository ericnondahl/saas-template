import { useState, useEffect, useRef } from "react";
import { Tabs, Redirect } from "expo-router";
import { useAuth, getClerkInstance } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { View, ActivityIndicator } from "react-native";
import { evaluateAuthGuard, latchSignedIn, isSessionLatched } from "../../lib/authGuard";

export default function TabsLayout() {
  const { isSignedIn, isLoaded } = useAuth();
  const [authSettled, setAuthSettled] = useState(false);
  const wasSignedIn = useRef(false);

  // Read directly from the Clerk singleton — `setActive()` updates this
  // synchronously, while useAuth().isSignedIn lags by N render frames.
  // Used as a fallback so a stale React context can't bounce a freshly-
  // signed-in user back to /sign-in.
  let hasActiveSession = false;
  try {
    hasActiveSession = !!getClerkInstance().session?.id;
  } catch {
    hasActiveSession = false;
  }

  useEffect(() => {
    if (isSignedIn || hasActiveSession) {
      wasSignedIn.current = true;
      // Latch at module scope so a later remount (the loop's own churn) still
      // remembers the user is authenticated, even if isSignedIn/hasActiveSession
      // briefly read false during a post-setActive resource reload.
      latchSignedIn();
    }
  }, [isSignedIn, hasActiveSession]);

  useEffect(() => {
    if (isLoaded && !isSignedIn && !hasActiveSession && !wasSignedIn.current) {
      const timeout = setTimeout(() => setAuthSettled(true), 300);
      return () => {
        clearTimeout(timeout);
        setAuthSettled(false);
      };
    }
    setAuthSettled(false);
  }, [isLoaded, isSignedIn, hasActiveSession]);

  const decision = evaluateAuthGuard({
    isLoaded: !!isLoaded,
    isSignedIn: !!isSignedIn,
    hasActiveSession,
    // Either a sign-in observed by this mount, or the module-level latch set by
    // an earlier mount / the auth flow — the latter survives the loop remounts.
    wasSignedIn: wasSignedIn.current || isSessionLatched(),
    authSettled,
  });

  if (decision === "redirect-signin") {
    return <Redirect href="/sign-in" />;
  }
  if (decision === "loading") {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#3b82f6",
        headerShown: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
