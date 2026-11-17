import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { SummaryCard } from '../components/SummaryCard';
import { InvestmentCard } from '../components/InvestmentCard';
import { DashboardSummary, User } from '../types';
import { formatCurrency, formatDate } from '../utils/formatCurrency';

interface DashboardScreenProps {
  user?: User | null;
  summary: DashboardSummary | null;
  loading: boolean;
  onRefresh: () => void;
  navigation: any;
}

const screenWidth = Dimensions.get('window').width;

// Consistent category colors matching investment cards
const CATEGORY_CHART_COLORS: Record<string, string> = {
  Equity: '#0284C7',
  'Mutual Funds': '#7C3AED',
  Gold: '#F59E0B',
  'Fixed Deposits': '#10B981',
  Other: '#64748B',
};

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  user,
  summary,
  loading,
  onRefresh,
  navigation,
}) => {
  // Format data for PieChart
  const pieData =
    summary?.categoryAllocation && summary.categoryAllocation.length > 0
      ? summary.categoryAllocation.map((item) => ({
          name: item.category,
          population: item.value,
          color: CATEGORY_CHART_COLORS[item.category] || '#94A3B8',
          legendFontColor: '#334155',
          legendFontSize: 12,
        }))
      : [];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={onRefresh} colors={['#1E3A8A']} />
      }
    >
      {/* Welcome Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.name || 'Investor'}</Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('AddInvestment')}
        >
          <Text style={styles.addBtnText}>+ Add Asset</Text>
        </TouchableOpacity>
      </View>

      {/* Summary Value Card */}
      <SummaryCard
        totalValue={summary?.totalPortfolioValue || 0}
        totalInvested={summary?.totalInvestedAmount || 0}
        profitLoss={summary?.totalProfitLoss || 0}
        returnPercentage={summary?.returnPercentage || 0}
        investmentCount={summary?.investmentCount || 0}
      />

      {/* Asset Allocation Chart */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Asset Allocation</Text>
        {pieData.length > 0 ? (
          <View style={styles.chartContainer}>
            <PieChart
              data={pieData}
              width={screenWidth - 60}
              height={180}
              chartConfig={{
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              }}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="10"
              center={[0, 0]}
              absolute={false}
            />

            {/* Percentage breakdown table */}
            <View style={styles.allocationList}>
              {summary?.categoryAllocation.map((cat) => (
                <View key={cat.category} style={styles.allocationRow}>
                  <View style={styles.catLeft}>
                    <View
                      style={[
                        styles.colorDot,
                        { backgroundColor: CATEGORY_CHART_COLORS[cat.category] || '#94A3B8' },
                      ]}
                    />
                    <Text style={styles.catName}>{cat.category}</Text>
                  </View>
                  <Text style={styles.catValue}>
                    {formatCurrency(cat.value)} ({cat.percentage}%)
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.emptyChart}>
            <Text style={styles.emptyText}>No investments recorded yet.</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AddInvestment')}>
              <Text style={styles.emptyActionText}>Add your first asset to see allocation</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Recent Investments */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Recent Assets</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Investments')}>
          <Text style={styles.seeAllText}>See all ({summary?.investmentCount || 0})</Text>
        </TouchableOpacity>
      </View>

      {summary?.recentInvestments && summary.recentInvestments.length > 0 ? (
        summary.recentInvestments.slice(0, 3).map((item) => (
          <InvestmentCard
            key={item.id}
            investment={item}
            onPress={() => navigation.navigate('AddInvestment', { investment: item })}
          />
        ))
      ) : (
        <View style={styles.emptySection}>
          <Text style={styles.emptyText}>No recent investments.</Text>
        </View>
      )}

      {/* Recent Transactions */}
      <View style={[styles.sectionHeaderRow, { marginTop: 12 }]}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Transactions')}>
          <Text style={styles.seeAllText}>View all</Text>
        </TouchableOpacity>
      </View>

      {summary?.recentTransactions && summary.recentTransactions.length > 0 ? (
        summary.recentTransactions.slice(0, 3).map((tx) => (
          <View key={tx.id} style={styles.txItem}>
            <View style={styles.txLeft}>
              <View
                style={[
                  styles.txBadge,
                  { backgroundColor: tx.type === 'BUY' ? '#DCFCE7' : '#FEE2E2' },
                ]}
              >
                <Text
                  style={[
                    styles.txBadgeText,
                    { color: tx.type === 'BUY' ? '#16A34A' : '#DC2626' },
                  ]}
                >
                  {tx.type}
                </Text>
              </View>
              <View>
                <Text style={styles.txName}>{tx.investment?.name || 'Investment'}</Text>
                <Text style={styles.txDate}>{formatDate(tx.transactionDate)}</Text>
              </View>
            </View>
            <Text style={styles.txAmount}>{formatCurrency(Number(tx.amount))}</Text>
          </View>
        ))
      ) : (
        <View style={styles.emptySection}>
          <Text style={styles.emptyText}>No recent transactions.</Text>
        </View>
      )}
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
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  greeting: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  userName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  addBtn: {
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 10,
  },
  chartContainer: {
    alignItems: 'center',
  },
  allocationList: {
    width: '100%',
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
  },
  allocationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  catLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  catName: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '500',
  },
  catValue: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '600',
  },
  emptyChart: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 14,
    marginBottom: 6,
  },
  emptyActionText: {
    color: '#1E3A8A',
    fontWeight: '600',
    fontSize: 13,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  seeAllText: {
    color: '#1E3A8A',
    fontSize: 13,
    fontWeight: '600',
  },
  emptySection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  txItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  txLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  txBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  txBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  txName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  txDate: {
    fontSize: 11,
    color: '#64748B',
  },
  txAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
});
