import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'pocketportfolio_jwt_token';

let customApiUrl: string | null = null;

export const setApiUrl = (url: string) => {
  customApiUrl = url;
};

export const getApiUrl = (): string => {
  if (customApiUrl) return customApiUrl;
  if (Platform.OS === 'web') {
    return 'http://localhost:5000';
  }
  // For both iOS and Android physical devices running Expo Go
  return 'http://192.168.29.211:5000';
};

// Secure Token Storage helpers using Expo SecureStore
export const saveToken = async (token: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  } catch (error) {
    console.error('Failed to save auth token:', error);
  }
};

export const getToken = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch (error) {
    console.error('Failed to get auth token:', error);
    return null;
  }
};

export const deleteToken = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch (error) {
    console.error('Failed to delete auth token:', error);
  }
};

/**
 * Universal Native Fetch Wrapper
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const baseUrl = getApiUrl();
  const url = `${baseUrl}${endpoint}`;

  console.log(`[API REQUEST] ${options.method || 'GET'} ${url}`);

  const token = await getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (netError: any) {
    console.error(`[API NETWORK ERROR] Cannot reach ${url}:`, netError);
    throw new Error(
      `Cannot connect to server at ${baseUrl}. Ensure your phone is on the same Wi-Fi network and the backend is running.`
    );
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMessage =
      data?.error || data?.message || `Request failed with status ${response.status}`;
    throw new Error(errorMessage);
  }

  return data as T;
}
