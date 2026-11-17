import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { CustomButton } from '../components/CustomButton';
import { User } from '../types';
import { formatDate } from '../utils/formatCurrency';

interface ProfileScreenProps {
  user?: User | null;
  onLogout: () => Promise<void>;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ user, onLogout }) => {
  const confirmLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out of PocketPortfolio?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            await onLogout();
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Account & Profile</Text>

      {/* User Card */}
      <View style={styles.card}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </Text>
        </View>

        <Text style={styles.userName}>{user?.name || 'Investor'}</Text>
        <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Member Since</Text>
          <Text style={styles.infoValue}>
            {user?.createdAt ? formatDate(user.createdAt) : 'Recent'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Security</Text>
          <Text style={styles.infoValue}>JWT + bcrypt encryption</Text>
        </View>
      </View>

      {/* App Info Card */}
      <View style={styles.card}>
        <Text style={styles.cardHeader}>About PocketPortfolio</Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Version</Text>
          <Text style={styles.infoValue}>1.0.0</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Backend</Text>
          <Text style={styles.infoValue}>Node.js + Express + TypeScript</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Database</Text>
          <Text style={styles.infoValue}>PostgreSQL + Prisma ORM</Text>
        </View>

        <View style={styles.disclaimerBox}>
          <Text style={styles.disclaimerText}>
            PocketPortfolio is a personal investment tracking tool. All valuations and transactions are maintained securely by you.
          </Text>
        </View>
      </View>

      {/* Logout Button */}
      <CustomButton
        title="Log Out"
        variant="danger"
        onPress={confirmLogout}
        style={styles.logoutBtn}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 16,
    paddingBottom: 36,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#1E3A8A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '800',
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  userEmail: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  divider: {
    height: 1,
    width: '100%',
    backgroundColor: '#F1F5F9',
    marginVertical: 16,
  },
  cardHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  disclaimerBox: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    width: '100%',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  disclaimerText: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
    textAlign: 'center',
  },
  logoutBtn: {
    marginTop: 8,
  },
});
