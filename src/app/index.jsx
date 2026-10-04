import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { Redirect } from 'expo-router';
import { Image } from 'expo-image';
import { useAuth } from '@/context/auth-context';
import { colors } from '@/theme/colors';

const logoSource = require('../../assets/Glossy 3D Task List Icon.png');

export default function IndexRoute() {
  const { user, token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Image
          source={logoSource}
          style={styles.logoImage}
          contentFit="contain"
        />
        <Text style={styles.appName}>Taskly</Text>
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
  logoImage: {
    width: 88,
    height: 88,
    borderRadius: 24,
    marginBottom: 14,
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
