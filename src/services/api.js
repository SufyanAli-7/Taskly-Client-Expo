import axios from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { storage } from '@/utils/storage';

// Base API URL configuration
// 1. If physical device via Expo Go: auto-detect computer LAN IP from Constants.expoConfig.hostUri
// 2. If EXPO_PUBLIC_API_URL is explicitly provided: use it
// 3. Fallback: Android emulator (10.0.2.2) or localhost for web/iOS
const getDefaultBaseUrl = () => {
  // 1. Explicitly configured API URL (.env) has the highest priority
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // 2. Fallback: Auto-detect computer IP when developing locally with Expo Go
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
      return `http://${ip}:8000`;
    }
  }

  // 3. Fallback: Android emulator
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8000';
  }

  return 'http://localhost:8000';
};

export const API_BASE_URL = getDefaultBaseUrl();

console.log('📡 Connected Backend API URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: automatically attach Authorization header
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await storage.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn('Could not attach auth token to request:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle errors cleanly
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // If token is invalid or expired
    if (error.response?.status === 401 && error.config?.url?.includes('/auth/user')) {
      await storage.clearAuth();
    }
    return Promise.reject(error);
  }
);

export default api;
