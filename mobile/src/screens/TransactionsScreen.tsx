import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { InputField } from '../components/InputField';
import { CustomButton } from '../components/CustomButton';
import { Transaction, Investment, TransactionType } from '../types';
import { formatCurrency, formatDate } from '../utils/formatCurrency';

interface TransactionsScreenProps {
  transactions: Transaction[];
  investments: Investment[];
  loading: boolean;
  onRefresh: () => void;
  onAddTransaction: (data: {
    investmentId: string;
    type: TransactionType;
    amount: number;
    transactionDate: string;
    description?: string;
  }) => Promise<void>;
  onDeleteTransaction: (id: string) => Promise<void>;
  navigation: any;
}

export const TransactionsScreen: React.FC<TransactionsScreenProps> = ({
  transactions,
  investments,
  loading,
  onRefresh,
  onAddTransaction,
  onDeleteTransaction,
  navigation,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedInvestmentId, setSelectedInvestmentId] = useState('');
  const [txType, setTxType] = useState<TransactionType>('BUY');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const handleOpenModal = () => {
    if (investments.length === 0) {
      Alert.alert(
        'No Investments Found',
        'You must add at least one investment before recording a transaction.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Add Investment', onPress: () => navigation.navigate('AddInvestment') },
        ]
      );
      return;
    }
    setSelectedInvestmentId(investments[0]?.id || '');
    setTxType('BUY');
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    setDescription('');
    setFormError('');
    setModalVisible(true);
  };

  const handleSaveTransaction = async () => {
    setFormError('');

    if (!selectedInvestmentId) {
      setFormError('Please select an investment.');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setFormError('Transaction amount must be greater than 0.');
      return;
    }

    if (!date) {
      setFormError('Transaction date is required (YYYY-MM-DD).');
      return;
    }

    try {
      setSaving(true);
      await onAddTransaction({
        investmentId: selectedInvestmentId,
        type: txType,
        amount: numAmount,
        transactionDate: new Date(date).toISOString(),
        description: description.trim() || undefined,
      });

      setModalVisible(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to record transaction.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (tx: Transaction) => {
    Alert.alert(
      'Delete Transaction',
      `Delete this ${tx.type} transaction of ${formatCurrency(Number(tx.amount))}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await onDeleteTransaction(tx.id);
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to delete transaction.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Transactions</Text>
          <Text style={styles.subtitle}>History of purchases & sales</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={handleOpenModal}>
          <Text style={styles.addBtnText}>+ Record</Text>
        </TouchableOpacity>
      </View>

      {/* Transaction List */}
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={onRefresh} colors={['#1E3A8A']} />
        }
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const isBuy = item.type === 'BUY';
          return (
            <View style={styles.card}>
              <View style={styles.topRow}>
                <View style={styles.badgeAndName}>
                  <View
                    style={[
                      styles.typeBadge,
                      { backgroundColor: isBuy ? '#DCFCE7' : '#FEE2E2' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.typeBadgeText,
                        { color: isBuy ? '#16A34A' : '#DC2626' },
                      ]}
                    >
                      {item.type}
                    </Text>
                  </View>
                  <Text style={styles.assetName} numberOfLines={1}>
                    {item.investment?.name || 'Investment'}
                  </Text>
                </View>

                <Text style={styles.amountText}>
                  {formatCurrency(Number(item.amount))}
                </Text>
              </View>

              <View style={styles.bottomRow}>
                <Text style={styles.metaText}>
                  {formatDate(item.transactionDate)}
                  {item.description ? ` • ${item.description}` : ''}
                </Text>

                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => confirmDelete(item)}
                >
                  <Text style={styles.deleteBtnText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No transactions recorded</Text>
            <Text style={styles.emptyDesc}>
              Record buy and sell actions for any of your investments to build an audit history.
            </Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={handleOpenModal}>
              <Text style={styles.emptyBtnText}>+ Record First Transaction</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Add Transaction Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Record Transaction</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView>
              {formError ? (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorBannerText}>{formError}</Text>
                </View>
              ) : null}

              {/* Transaction Type Buttons */}
              <Text style={styles.fieldLabel}>Transaction Type</Text>
              <View style={styles.typeSelectorRow}>
                <TouchableOpacity
                  style={[
                    styles.typeSelectBtn,
                    txType === 'BUY' ? styles.buyActive : null,
                  ]}
                  onPress={() => setTxType('BUY')}
                >
                  <Text
                    style={[
                      styles.typeSelectText,
                      txType === 'BUY' ? styles.activeText : null,
                    ]}
                  >
                    BUY
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.typeSelectBtn,
                    txType === 'SELL' ? styles.sellActive : null,
                  ]}
                  onPress={() => setTxType('SELL')}
                >
                  <Text
                    style={[
                      styles.typeSelectText,
                      txType === 'SELL' ? styles.activeText : null,
                    ]}
                  >
                    SELL
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Investment Picker */}
              <Text style={styles.fieldLabel}>Select Investment Asset</Text>
              <View style={styles.invPickerGrid}>
                {investments.map((inv) => {
                  const isSelected = selectedInvestmentId === inv.id;
                  return (
                    <TouchableOpacity
                      key={inv.id}
                      style={[
                        styles.invPickChip,
                        isSelected ? styles.invPickChipSelected : null,
                      ]}
                      onPress={() => setSelectedInvestmentId(inv.id)}
                    >
                      <Text
                        style={[
                          styles.invPickText,
                          isSelected ? styles.invPickTextSelected : null,
                        ]}
                        numberOfLines={1}
                      >
                        {inv.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <InputField
                label="Transaction Amount ($) *"
                placeholder="0.00"
                keyboardType="decimal-pad"
                value={amount}
                onChangeText={setAmount}
              />

              <InputField
                label="Transaction Date (YYYY-MM-DD) *"
                placeholder="YYYY-MM-DD"
                value={date}
                onChangeText={setDate}
              />

              <InputField
                label="Optional Description / Notes"
                placeholder="e.g. Dividend reinvestment, sold 10 units"
                value={description}
                onChangeText={setDescription}
              />

              <CustomButton
                title="Save Transaction"
                onPress={handleSaveTransaction}
                loading={saving}
                style={styles.modalSubmitBtn}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    paddingBottom: 12,
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
  listContent: {
    padding: 16,
    paddingTop: 4,
    flexGrow: 1,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeAndName: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  assetName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    flex: 1,
  },
  amountText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
    paddingTop: 6,
  },
  metaText: {
    fontSize: 12,
    color: '#64748B',
    flex: 1,
  },
  deleteBtn: {
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  deleteBtnText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '600',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  closeBtn: {
    fontSize: 20,
    color: '#64748B',
    padding: 4,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
  typeSelectorRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  typeSelectBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  buyActive: {
    backgroundColor: '#16A34A',
    borderColor: '#16A34A',
  },
  sellActive: {
    backgroundColor: '#DC2626',
    borderColor: '#DC2626',
  },
  typeSelectText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  activeText: {
    color: '#FFFFFF',
  },
  invPickerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  invPickChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  invPickChipSelected: {
    backgroundColor: '#1E3A8A',
    borderColor: '#1E3A8A',
  },
  invPickText: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '500',
  },
  invPickTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  modalSubmitBtn: {
    marginTop: 10,
    marginBottom: 20,
  },
  errorBanner: {
    backgroundColor: '#FEE2E2',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  errorBannerText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '500',
  },
});
