import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useUser } from '@clerk/clerk-expo';

export default function HomeScreen() {
  const { user } = useUser();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>
          Welcome back{user?.firstName ? `, ${user.firstName}` : ''}!
        </Text>
        <Text style={styles.subtitle}>
          Your SaaS mobile app is ready to go
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>🚀 Getting Started</Text>
          <Text style={styles.cardText}>
            This is a template for building a SaaS mobile app with Expo and React Native.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>📱 Features</Text>
          <Text style={styles.cardText}>
            • Authentication with Clerk{'\n'}
            • Shared types with web app{'\n'}
            • Expo Router navigation{'\n'}
            • TypeScript support
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>🔧 Development</Text>
          <Text style={styles.cardText}>
            Run `npm run dev:mobile` from the root to start the development server.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#6b7280',
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  cardText: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
  },
});
