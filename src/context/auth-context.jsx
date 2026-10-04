import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { storage } from '@/utils/storage';
import { authService } from '@/services/auth-service';

const AuthContext = createContext({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticating: false,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Restore session from SecureStore on app launch
  const checkSession = useCallback(async () => {
    try {
      setIsLoading(true);
      const savedToken = await storage.getToken();
      const savedUser = await storage.getUserData();

      if (savedToken) {
        setToken(savedToken);
        if (savedUser) {
          setUser(savedUser);
        }

        // Validate token by fetching latest user data from server
        try {
          const userRes = await authService.getCurrentUser();
          if (userRes && userRes.user) {
            setUser(userRes.user);
            await storage.setUserData(userRes.user);
          }
        } catch (serverError) {
          console.warn('Session verification warning:', serverError.message);
          // If server says unauthorized, clear session
          if (serverError.response?.status === 401) {
            await storage.clearAuth();
            setUser(null);
            setToken(null);
          }
        }
      }
    } catch (error) {
      console.error('Failed to restore session:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  // Login handler
  const login = async (email, password) => {
    setIsAuthenticating(true);
    try {
      const res = await authService.login({ email, password });
      const authToken = res.token;

      if (!authToken) {
        throw new Error('Token not received from server');
      }

      // Save token in SecureStore
      await storage.setToken(authToken);
      setToken(authToken);

      // Fetch user profile using the new token
      const profileRes = await authService.getCurrentUser();
      const userData = profileRes?.user || null;

      if (userData) {
        await storage.setUserData(userData);
        setUser(userData);
      }

      return { success: true, message: res.message || 'Login successful' };
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.message ||
        'Login failed. Please check your credentials.';
      return { success: false, message: msg };
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Register handler
  const register = async (fullName, email, password) => {
    setIsAuthenticating(true);
    try {
      const res = await authService.register({ fullName, email, password });
      return {
        success: true,
        message: res.message || 'Registration successful. Please login.',
        user: res.user,
      };
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.message ||
        'Registration failed. Please try again.';
      return { success: false, message: msg };
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Logout handler
  const logout = async () => {
    try {
      await storage.clearAuth();
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      setUser(null);
      setToken(null);
    }
  };

  const refreshUser = async () => {
    try {
      const res = await authService.getCurrentUser();
      if (res?.user) {
        setUser(res.user);
        await storage.setUserData(res.user);
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticating,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
