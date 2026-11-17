import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DashboardScreen } from '../screens/DashboardScreen';
import { InvestmentsScreen } from '../screens/InvestmentsScreen';
import { TransactionsScreen } from '../screens/TransactionsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { AddInvestmentScreen } from '../screens/AddInvestmentScreen';
import { User, Investment, Transaction, DashboardSummary, InvestmentCategory, TransactionType } from '../types';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

interface AppNavigatorProps {
  user: User | null;
  summary: DashboardSummary | null;
  investments: Investment[];
  transactions: Transaction[];
  loading: boolean;
  onRefresh: () => void;
  onSaveInvestment: (data: {
    id?: string;
    name: string;
    category: InvestmentCategory;
    investedAmount: number;
    currentValue: number;
    purchaseDate: string;
    description?: string;
  }) => Promise<void>;
  onDeleteInvestment: (id: string) => Promise<void>;
  onAddTransaction: (data: {
    investmentId: string;
    type: TransactionType;
    amount: number;
    transactionDate: string;
    description?: string;
  }) => Promise<void>;
  onDeleteTransaction: (id: string) => Promise<void>;
  onLogout: () => Promise<void>;
}

// 4 Bottom Tabs
const BottomTabs: React.FC<AppNavigatorProps> = (props) => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        headerStyle: { backgroundColor: '#1E3A8A' },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: '700' },
        tabBarActiveTintColor: '#1E3A8A',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E2E8F0',
          paddingBottom: 6,
          paddingTop: 6,
          height: 60,
        },
        tabBarIcon: ({ color, size }) => {
          // Simple emoji / icon representations
          let icon = '📊';
          if (route.name === 'Dashboard') icon = '📈';
          else if (route.name === 'Investments') icon = '💼';
          else if (route.name === 'Transactions') icon = '🔄';
          else if (route.name === 'Profile') icon = '👤';

          return <Text style={{ fontSize: size - 2 }}>{icon}</Text>;
        },
      })}
    >
      <Tab.Screen name="Dashboard">
        {(navProps) => (
          <DashboardScreen
            {...navProps}
            user={props.user}
            summary={props.summary}
            loading={props.loading}
            onRefresh={props.onRefresh}
          />
        )}
      </Tab.Screen>

      <Tab.Screen name="Investments">
        {(navProps) => (
          <InvestmentsScreen
            {...navProps}
            investments={props.investments}
            loading={props.loading}
            onRefresh={props.onRefresh}
            onDeleteInvestment={props.onDeleteInvestment}
          />
        )}
      </Tab.Screen>

      <Tab.Screen name="Transactions">
        {(navProps) => (
          <TransactionsScreen
            {...navProps}
            transactions={props.transactions}
            investments={props.investments}
            loading={props.loading}
            onRefresh={props.onRefresh}
            onAddTransaction={props.onAddTransaction}
            onDeleteTransaction={props.onDeleteTransaction}
          />
        )}
      </Tab.Screen>

      <Tab.Screen name="Profile">
        {() => <ProfileScreen user={props.user} onLogout={props.onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

// Root Stack containing Tabs + AddInvestment Modal
export const AppNavigator: React.FC<AppNavigatorProps> = (props) => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="MainTabs" options={{ headerShown: false }}>
        {() => <BottomTabs {...props} />}
      </Stack.Screen>

      <Stack.Screen
        name="AddInvestment"
        options={{
          presentation: 'modal',
          title: 'Investment Asset',
          headerStyle: { backgroundColor: '#1E3A8A' },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: '700' },
        }}
      >
        {(navProps) => (
          <AddInvestmentScreen
            {...navProps}
            onSave={props.onSaveInvestment}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
};
