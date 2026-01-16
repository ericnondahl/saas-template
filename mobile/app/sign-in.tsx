import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSignIn } from '@clerk/clerk-expo';

export default function SignInScreen() {
  const { signIn, setActive } = useSignIn();
  const router = useRouter();

  const handleSignIn = async () => {
    try {
      // In a real app, you would collect email/password from inputs
      // For this template, we'll show the Clerk-hosted sign-in page
      // You can customize this with your own sign-in form
      
      // This is a placeholder - implement your sign-in logic here
      alert('Implement sign-in logic here. See Clerk documentation for examples.');
    } catch (err) {
      console.error('Sign in error:', err);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to SaaS Template</Text>
        <Text style={styles.subtitle}>
          Sign in to access your account
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardText}>
            This is a template sign-in screen. Implement your authentication flow using Clerk:
          </Text>
          <Text style={styles.bulletPoint}>• Email/Password authentication</Text>
          <Text style={styles.bulletPoint}>• OAuth providers (Google, GitHub, etc.)</Text>
          <Text style={styles.bulletPoint}>• Magic link authentication</Text>
        </View>

        <Pressable 
          style={styles.button}
          onPress={handleSignIn}
        >
          <Text style={styles.buttonText}>Sign In</Text>
        </Pressable>

        <Text style={styles.helpText}>
          See Clerk documentation for implementing authentication flows
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardText: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
    marginBottom: 12,
  },
  bulletPoint: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
    marginLeft: 8,
  },
  button: {
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  helpText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 16,
  },
});
