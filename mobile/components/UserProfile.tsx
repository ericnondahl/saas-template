import { View, Text, StyleSheet, Image } from 'react-native';
import { UserDTO } from '@saas-template/shared';

interface UserProfileProps {
  user: UserDTO;
}

/**
 * UserProfile component that displays user information using the shared UserDTO type.
 * This demonstrates type reusability across web and mobile apps - same interface,
 * different UI implementation!
 */
export function UserProfile({ user }: UserProfileProps) {
  const displayName = user.firstName && user.lastName
    ? `${user.firstName} ${user.lastName}`
    : user.firstName || 'User';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {user.imageUrl ? (
          <Image 
            source={{ uri: user.imageUrl }} 
            style={styles.avatar}
          />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {user.firstName?.[0] || user.email?.[0]?.toUpperCase() || 'User'}
            </Text>
          </View>
        )}
        <Text style={styles.name}>{displayName}</Text>
        <Text style={styles.email}>{user.email}</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>User Details</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>User ID</Text>
          <Text style={styles.infoValue}>{user.id.slice(0, 12)}...</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Clerk ID</Text>
          <Text style={styles.infoValue}>{user.clerkId.slice(0, 12)}...</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>First Name</Text>
          <Text style={styles.infoValue}>{user.firstName || 'Not set'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Last Name</Text>
          <Text style={styles.infoValue}>{user.lastName || 'Not set'}</Text>
        </View>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoBoxText}>
          <Text style={styles.infoBoxBold}>💡 Shared Type: </Text>
          This component uses the UserDTO type from @saas-template/shared,
          ensuring type safety across web and mobile!
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '600',
    color: '#6b7280',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#6b7280',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#6b7280',
  },
  infoValue: {
    fontSize: 15,
    color: '#111827',
    fontFamily: 'monospace',
  },
  infoBox: {
    backgroundColor: '#dbeafe',
    borderWidth: 1,
    borderColor: '#93c5fd',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  infoBoxText: {
    fontSize: 13,
    color: '#1e3a8a',
    lineHeight: 18,
  },
  infoBoxBold: {
    fontWeight: 'bold',
  },
});
