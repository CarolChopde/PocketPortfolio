import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { AuthNavigator } from './src/navigation/AuthNavigator';
import { AppNavigator } from './src/navigation/AppNavigator';
import { investmentService } from './src/services/investmentService';
import { transactionService } from './src/services/transactionService';
import { Investment, Transaction, DashboardSummary, InvestmentCategory, TransactionType } from './src/types';

const MainNavigator = () => {
  const { user, loading: authLoading, login, register, logout } = useAuth();

  const [investments, setInvestments] = useState<Investment[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [dataLoading, setDataLoading] = useState<boolean>(false);

  // Fetch live portfolio data from backend when user is logged in
  const fetchAllData = useCallback(async () => {
    if (!user) return;
    try {
      setDataLoading(true);
      const [sumData, invData, txData] = await Promise.all([
        investmentService.getDashboardSummary(),
        investmentService.getInvestments(),
        transactionService.getTransactions(),
      ]);
      setSummary(sumData);
      setInvestments(invData);
      setTransactions(txData);
    } catch (error) {
      console.error('Error loading portfolio data:', error);
    } finally {
      setDataLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchAllData();
    } else {
      // Clear data on logout
      setInvestments([]);
      setTransactions([]);
      setSummary(null);
    }
  }, [user, fetchAllData]);

  // Handler for creating or updating an investment
  const handleSaveInvestment = async (data: {
    id?: string;
    name: string;
    category: InvestmentCategory;
    investedAmount: number;
    currentValue: number;
    purchaseDate: string;
    description?: string;
  }) => {
    if (data.id) {
      await investmentService.updateInvestment(data.id, {
        name: data.name,
        category: data.category,
        investedAmount: data.investedAmount,
        currentValue: data.currentValue,
        purchaseDate: data.purchaseDate,
        description: data.description,
      });
    } else {
      await investmentService.createInvestment({
        name: data.name,
        category: data.category,
        investedAmount: data.investedAmount,
        currentValue: data.currentValue,
        purchaseDate: data.purchaseDate,
        description: data.description,
      });
    }
    // Refresh all data to update dashboard, pie chart, and investment list
    await fetchAllData();
  };

  // Handler for deleting an investment
  const handleDeleteInvestment = async (id: string) => {
    await investmentService.deleteInvestment(id);
    await fetchAllData();
  };

  // Handler for adding a transaction
  const handleAddTransaction = async (data: {
    investmentId: string;
    type: TransactionType;
    amount: number;
    transactionDate: string;
    description?: string;
  }) => {
    await transactionService.createTransaction(data);
    await fetchAllData();
  };

  // Handler for deleting a transaction
  const handleDeleteTransaction = async (id: string) => {
    await transactionService.deleteTransaction(id);
    await fetchAllData();
  };

  // Splash / Loading state while checking token
  if (authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingLogo}>PocketPortfolio</Text>
        <ActivityIndicator size="large" color="#1E3A8A" style={styles.spinner} />
        <Text style={styles.loadingSub}>Loading your secure portfolio...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      {user ? (
        <AppNavigator
          user={user}
          summary={summary}
          investments={investments}
          transactions={transactions}
          loading={dataLoading}
          onRefresh={fetchAllData}
          onSaveInvestment={handleSaveInvestment}
          onDeleteInvestment={handleDeleteInvestment}
          onAddTransaction={handleAddTransaction}
          onDeleteTransaction={handleDeleteTransaction}
          onLogout={logout}
        />
      ) : (
        <AuthNavigator onLogin={login} onRegister={register} />
      )}
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <MainNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingLogo: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1E3A8A',
    letterSpacing: -0.5,
  },
  spinner: {
    marginVertical: 20,
  },
  loadingSub: {
    fontSize: 14,
    color: '#64748B',
  },
});
