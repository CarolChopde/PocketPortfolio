import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Investment } from '../types';
import { formatCurrency, formatPercent, formatDate } from '../utils/formatCurrency';

interface InvestmentCardProps {
  investment: Investment;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const InvestmentCard: React.FC<InvestmentCardProps> = ({
  investment,
  onPress,
  onEdit,
  onDelete,
}) => {
  const invested = Number(investment.investedAmount);
  const current = Number(investment.currentValue);
  const pnl = current - invested;
  const pnlPercent = invested > 0 ? (pnl / invested) * 100 : 0;
  const isPositive = pnl >= 0;

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Equity':
        return { bg: '#E0F2FE', text: '#0284C7' };
      case 'Mutual Funds':
        return { bg: '#EDE9FE', text: '#7C3AED' };
      case 'Gold':
        return { bg: '#FEF3C7', text: '#D97706' };
      case 'Fixed Deposits':
        return { bg: '#DCFCE7', text: '#16A34A' };
      default:
        return { bg: '#F1F5F9', text: '#475569' };
    }
  };

  const catStyle = getCategoryColor(investment.category);

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={onPress ? 0.7 : 1}
      onPress={onPress}
    >
      <View style={styles.topRow}>
        <View style={styles.nameContainer}>
          <Text style={styles.name} numberOfLines={1}>
            {investment.name}
          </Text>
          <View style={[styles.categoryBadge, { backgroundColor: catStyle.bg }]}>
            <Text style={[styles.categoryText, { color: catStyle.text }]}>
              {investment.category}
            </Text>
          </View>
        </View>

        <View style={styles.valueContainer}>
          <Text style={styles.currentValue}>{formatCurrency(current)}</Text>
          <Text
            style={[
              styles.pnlText,
              { color: isPositive ? '#16A34A' : '#DC2626' },
            ]}
          >
            {isPositive ? '+' : ''}
            {formatCurrency(pnl)} ({formatPercent(pnlPercent)})
          </Text>
        </View>
      </View>

      <View style={styles.bottomRow}>
        <Text style={styles.dateText}>
          Invested: {formatCurrency(invested)} • {formatDate(investment.purchaseDate)}
        </Text>

        {(onEdit || onDelete) && (
          <View style={styles.actionsRow}>
            {onEdit && (
              <TouchableOpacity style={styles.actionBtn} onPress={onEdit}>
                <Text style={styles.editBtnText}>Edit</Text>
              </TouchableOpacity>
            )}
            {onDelete && (
              <TouchableOpacity style={styles.actionBtn} onPress={onDelete}>
                <Text style={styles.deleteBtnText}>Delete</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  nameContainer: {
    flex: 1,
    marginRight: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
  },
  valueContainer: {
    alignItems: 'flex-end',
  },
  currentValue: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  pnlText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  dateText: {
    fontSize: 12,
    color: '#64748B',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  editBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563EB',
  },
  deleteBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#DC2626',
  },
});
