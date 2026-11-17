import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { InputField } from '../components/InputField';
import { CustomButton } from '../components/CustomButton';
import { Investment, InvestmentCategory } from '../types';

interface AddInvestmentScreenProps {
  route: any;
  navigation: any;
  onSave: (data: {
    id?: string;
    name: string;
    category: InvestmentCategory;
    investedAmount: number;
    currentValue: number;
    purchaseDate: string;
    description?: string;
  }) => Promise<void>;
}

const CATEGORIES: InvestmentCategory[] = [
  'Equity',
  'Mutual Funds',
  'Gold',
  'Fixed Deposits',
  'Other',
];

export const AddInvestmentScreen: React.FC<AddInvestmentScreenProps> = ({
  route,
  navigation,
  onSave,
}) => {
  const existing: Investment | undefined = route?.params?.investment;
  const isEditing = Boolean(existing);

  const [name, setName] = useState(existing?.name || '');
  const [category, setCategory] = useState<InvestmentCategory>(
    existing?.category || 'Equity'
  );
  const [investedAmount, setInvestedAmount] = useState(
    existing ? String(existing.investedAmount) : ''
  );
  const [currentValue, setCurrentValue] = useState(
    existing ? String(existing.currentValue) : ''
  );
  const [purchaseDate, setPurchaseDate] = useState(
    existing?.purchaseDate
      ? new Date(existing.purchaseDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]
  );
  const [description, setDescription] = useState(existing?.description || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setError('');

    if (!name.trim()) {
      setError('Investment name is required.');
      return;
    }

    const numInvested = parseFloat(investedAmount);
    if (isNaN(numInvested) || numInvested <= 0) {
      setError('Invested amount must be a positive number.');
      return;
    }

    const numCurrent = parseFloat(currentValue);
    if (isNaN(numCurrent) || numCurrent < 0) {
      setError('Current value must be a non-negative number.');
      return;
    }

    if (!purchaseDate) {
      setError('Purchase date is required (YYYY-MM-DD).');
      return;
    }

    try {
      setLoading(true);
      await onSave({
        id: existing?.id,
        name: name.trim(),
        category,
        investedAmount: numInvested,
        currentValue: numCurrent,
        purchaseDate: new Date(purchaseDate).toISOString(),
        description: description.trim() || undefined,
      });

      navigation.goBack();
    } catch (err: any) {
      setError(err.message || 'Failed to save investment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>
          {isEditing ? 'Edit Investment' : 'New Investment'}
        </Text>
        <Text style={styles.subtitle}>
          Enter your asset details and manual valuation.
        </Text>

        {error ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.card}>
          <InputField
            label="Investment / Asset Name *"
            placeholder="e.g. Apple Inc. / S&P 500 Index"
            value={name}
            onChangeText={setName}
          />

          {/* Category Selector */}
          <View style={styles.categoryContainer}>
            <Text style={styles.fieldLabel}>Category *</Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryChip,
                      isSelected ? styles.categoryChipSelected : null,
                    ]}
                    onPress={() => setCategory(cat)}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        isSelected ? styles.categoryChipTextSelected : null,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <InputField
            label="Total Invested Amount ($) *"
            placeholder="0.00"
            keyboardType="decimal-pad"
            value={investedAmount}
            onChangeText={setInvestedAmount}
          />

          <InputField
            label="Current Valuation ($) *"
            placeholder="0.00"
            keyboardType="decimal-pad"
            value={currentValue}
            onChangeText={setCurrentValue}
          />

          <InputField
            label="Purchase Date (YYYY-MM-DD) *"
            placeholder="YYYY-MM-DD"
            value={purchaseDate}
            onChangeText={setPurchaseDate}
          />

          <InputField
            label="Optional Description / Notes"
            placeholder="e.g. Bought via broker, monthly SIP"
            multiline
            numberOfLines={3}
            value={description}
            onChangeText={setDescription}
            style={styles.multilineInput}
          />

          <CustomButton
            title={isEditing ? 'Update Investment' : 'Save Investment'}
            onPress={handleSave}
            loading={loading}
            style={styles.saveBtn}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
  categoryContainer: {
    marginBottom: 16,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  categoryChipSelected: {
    backgroundColor: '#1E3A8A',
    borderColor: '#1E3A8A',
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#334155',
  },
  categoryChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  multilineInput: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  saveBtn: {
    marginTop: 10,
  },
  errorBanner: {
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 14,
  },
  errorBannerText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '500',
  },
});
