import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { Redirect } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAuth } from '@/context/auth-context';
import { colors } from '@/theme/colors';

export default function IndexRoute() {
  const { user, token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.logoBadge}>
          <Ionicons name="checkbox" size={44} color={colors.primary} />
        </View>
        <Text style={styles.appName}>Todo App</Text>
        <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
      </View>
    );
  }

  if (token && user) {
    return <Redirect href="/(main)" />;
  }

  return <Redirect href="/(auth)/login" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoBadge: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  appName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.3,
  },
  loader: {
    marginTop: 24,
  },
});
