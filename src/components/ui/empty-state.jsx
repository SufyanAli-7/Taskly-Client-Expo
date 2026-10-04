import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Image } from 'expo-image';
import { colors } from '@/theme/colors';
import Button from './button';

const logoSource = require('../../../assets/Glossy 3D Task List Icon.png');

export default function EmptyState({
  title = 'No tasks found',
  subtitle = 'Create a task to get started and organize your day.',
  actionTitle = 'Create Task',
  onAction,
}) {
  return (
    <View style={styles.container}>
      <Image source={logoSource} style={styles.image} contentFit="contain" />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      {onAction && (
        <Button
          title={actionTitle}
          onPress={onAction}
          size="medium"
          style={styles.button}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 60,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 90,
    height: 90,
    marginBottom: 18,
    opacity: 0.9,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
    maxWidth: 260,
  },
  button: {
    paddingHorizontal: 28,
  },
});
