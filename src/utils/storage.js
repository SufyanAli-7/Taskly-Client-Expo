import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

// Check if SecureStore is available (for native iOS/Android it is; on web it may not be)
const isSecureStoreAvailable = () => {
  return Platform.OS !== 'web';
};

export const storage = {
  async setToken(token) {
    try {
      if (isSecureStoreAvailable()) {
        await SecureStore.setItemAsync(TOKEN_KEY, token);
      } else if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(TOKEN_KEY, token);
      }
    } catch (error) {
      console.error('Error saving auth token:', error);
    }
  },

  async getToken() {
    try {
      if (isSecureStoreAvailable()) {
        return await SecureStore.getItemAsync(TOKEN_KEY);
      } else if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(TOKEN_KEY);
      }
      return null;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  },

  async removeToken() {
    try {
      if (isSecureStoreAvailable()) {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
      } else if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(TOKEN_KEY);
      }
    } catch (error) {
      console.error('Error removing auth token:', error);
    }
  },

  async setUserData(user) {
    try {
      const serialized = JSON.stringify(user);
      if (isSecureStoreAvailable()) {
        await SecureStore.setItemAsync(USER_KEY, serialized);
      } else if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(USER_KEY, serialized);
      }
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  },

  async getUserData() {
    try {
      let raw = null;
      if (isSecureStoreAvailable()) {
        raw = await SecureStore.getItemAsync(USER_KEY);
      } else if (typeof window !== 'undefined' && window.localStorage) {
        raw = window.localStorage.getItem(USER_KEY);
      }
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  },

  async removeUserData() {
    try {
      if (isSecureStoreAvailable()) {
        await SecureStore.deleteItemAsync(USER_KEY);
      } else if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(USER_KEY);
      }
    } catch (error) {
      console.error('Error removing user data:', error);
    }
  },

  async clearAuth() {
    await this.removeToken();
    await this.removeUserData();
  }
};
