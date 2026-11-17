import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { InvestmentCard } from '../components/InvestmentCard';
import { Investment, InvestmentCategory } from '../types';

interface InvestmentsScreenProps {
  investments: Investment[];
  loading: boolean;
  onRefresh: () => void;
  onDeleteInvestment: (id: string) => Promise<void>;
  navigation: any;
}

const CATEGORIES: ('All' | InvestmentCategory)[] = [
  'All',
  'Equity',
  'Mutual Funds',
  'Gold',
  'Fixed Deposits',
  'Other',
];

export const InvestmentsScreen: React.FC<InvestmentsScreenProps> = ({
  investments,
  loading,
  onRefresh,
  onDeleteInvestment,
  navigation,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'All' | InvestmentCategory>('All');

  const filteredInvestments =
    selectedCategory === 'All'
      ? investments
      : investments.filter((item) => item.category === selectedCategory);

  const confirmDelete = (investment: Investment) => {
    Alert.alert(
      'Delete Investment',
      `Are you sure you want to delete "${investment.name}"? This will also delete all of its recorded transactions.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await onDeleteInvestment(investment.id);
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to delete investment.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header with Title and Add Button */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>My Portfolio</Text>
          <Text style={styles.subtitle}>{investments.length} total investments</Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('AddInvestment')}
        >
          <Text style={styles.addBtnText}>+ Add Asset</Text>
        </TouchableOpacity>
      </View>

      {/* Category Filter Chips */}
      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(item) => item}
          renderItem={({ item }) => {
            const isSelected = selectedCategory === item;
            return (
              <TouchableOpacity
                style={[styles.chip, isSelected ? styles.activeChip : null]}
                onPress={() => setSelectedCategory(item)}
              >
                <Text
                  style={[styles.chipText, isSelected ? styles.activeChipText : null]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
          contentContainerStyle={styles.chipsContent}
        />
      </View>

      {/* Investment List */}
      <FlatList
        data={filteredInvestments}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={onRefresh} colors={['#1E3A8A']} />
        }
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <InvestmentCard
            investment={item}
            onEdit={() => navigation.navigate('AddInvestment', { investment: item })}
            onDelete={() => confirmDelete(item)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>
              {selectedCategory === 'All'
                ? 'No investments added yet'
                : `No investments in "${selectedCategory}"`}
            </Text>
            <Text style={styles.emptyDesc}>
              Keep track of your stocks, mutual funds, gold, or FDs by recording them manually.
            </Text>
            <TouchableOpacity
              style={styles.emptyBtn}
              onPress={() => navigation.navigate('AddInvestment')}
            >
              <Text style={styles.emptyBtnText}>+ Add Your First Investment</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  addBtn: {
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 8,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  filterContainer: {
    paddingVertical: 10,
  },
  chipsContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  activeChip: {
    backgroundColor: '#1E3A8A',
    borderColor: '#1E3A8A',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#475569',
  },
  activeChipText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    paddingTop: 4,
    flexGrow: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  emptyBtn: {
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  emptyBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
