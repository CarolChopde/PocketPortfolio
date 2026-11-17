import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatCurrency, formatPercent } from '../utils/formatCurrency';

interface SummaryCardProps {
  totalValue: number;
  totalInvested: number;
  profitLoss: number;
  returnPercentage: number;
  investmentCount: number;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  totalValue,
  totalInvested,
  profitLoss,
  returnPercentage,
  investmentCount,
}) => {
  const isPositive = profitLoss >= 0;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Total Portfolio Value</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{investmentCount} Assets</Text>
        </View>
      </View>

      <Text style={styles.mainValue}>{formatCurrency(totalValue)}</Text>

      <View style={styles.divider} />

      <View style={styles.statsRow}>
        <View style={styles.statCol}>
          <Text style={styles.statLabel}>Total Invested</Text>
          <Text style={styles.statValue}>{formatCurrency(totalInvested)}</Text>
        </View>

        <View style={styles.statColRight}>
          <Text style={styles.statLabel}>Total Profit / Loss</Text>
          <View style={styles.pnlRow}>
            <Text
              style={[
                styles.statValue,
                { color: isPositive ? '#16A34A' : '#DC2626' },
              ]}
            >
              {isPositive ? '+' : ''}
              {formatCurrency(profitLoss)}
            </Text>
            <View
              style={[
                styles.pnlBadge,
                { backgroundColor: isPositive ? '#DCFCE7' : '#FEE2E2' },
              ]}
            >
              <Text
                style={[
                  styles.pnlBadgeText,
                  { color: isPositive ? '#15803D' : '#B91C1C' },
                ]}
              >
                {formatPercent(returnPercentage)}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  badge: {
    backgroundColor: '#EEF2F6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#475569',
  },
  mainValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#0F172A',
    marginVertical: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 14,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCol: {
    flex: 1,
  },
  statColRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
  },
  pnlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pnlBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  pnlBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
