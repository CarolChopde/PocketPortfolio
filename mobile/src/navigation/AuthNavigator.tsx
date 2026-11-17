import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';

const Stack = createNativeStackNavigator();

interface AuthNavigatorProps {
  onLogin: (email: string, pass: string) => Promise<void>;
  onRegister: (name: string, email: string, pass: string, confirm: string) => Promise<void>;
}

export const AuthNavigator: React.FC<AuthNavigatorProps> = ({ onLogin, onRegister }) => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#1E3A8A' },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Stack.Screen name="Login" options={{ headerShown: false }}>
        {(props) => <LoginScreen {...props} onLogin={onLogin} />}
      </Stack.Screen>

      <Stack.Screen
        name="Register"
        options={{ title: 'Create Account', headerBackTitle: 'Login' }}
      >
        {(props) => <RegisterScreen {...props} onRegister={onRegister} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
};
