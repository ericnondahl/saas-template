import { useEffect } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';

// This handles the OAuth callback redirect
// The maybeCompleteAuthSession() in sign-in.tsx should process this,
// but we need this route to exist so Expo Router doesn't show "Not Found"

export default function OAuthCallback() {
  const router = useRouter();

  useEffect(() => {
    // Complete any pending auth session
    WebBrowser.maybeCompleteAuthSession();
    
    // Give it a moment to process, then redirect to home
    // The OAuth flow should handle the session automatically
    const timeout = setTimeout(() => {
      router.replace('/');
    }, 1000);

    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#3b82f6" />
      <Text style={styles.text}>Completing sign in...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
});
