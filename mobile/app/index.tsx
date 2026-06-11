import { useEffect, useState } from "react";
import { Redirect } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { hasSignedInBefore } from "../lib/authStorage";

export default function IndexScreen() {
  const { isSignedIn, isLoaded } = useAuth();
  // null = not yet loaded. Decides where a signed-out user lands.
  const [signedInBefore, setSignedInBefore] = useState<boolean | null>(null);

  // Load whether this device has authenticated before, so a signed-out
  // *returning* user (e.g. their Clerk session expired) goes to /sign-in
  // while a brand-new install lands on /sign-up.
  useEffect(() => {
    hasSignedInBefore().then(setSignedInBefore);
  }, []);

  if (!isLoaded || (!isSignedIn && signedInBefore === null)) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (isSignedIn) {
    return <Redirect href="/(tabs)" />;
  }

  // Signed out — returning users (e.g. expired session) go straight to
  // sign-in; new installs start at sign-up. A /splash onboarding screen
  // can slot in here as the new-install destination.
  return <Redirect href={signedInBefore ? "/sign-in" : "/sign-up"} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
});
