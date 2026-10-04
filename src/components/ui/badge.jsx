import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

const PRIORITY_CONFIG = {
  high: {
    bg: '#FEE2E2', // Red 100
    text: '#DC2626', // Red 600
    label: 'High',
  },
  medium: {
    bg: '#FEF3C7', // Amber 100
    text: '#D97706', // Amber 600
    label: 'Medium',
  },
  low: {
    bg: '#ECFDF5', // Emerald 100
    text: '#059669', // Emerald 600
    label: 'Low',
  },
};

export default function Badge({ priority = 'medium', style, textStyle }) {
  const normalized = (priority || 'medium').toLowerCase();
  const config = PRIORITY_CONFIG[normalized] || PRIORITY_CONFIG.medium;

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }, style]}>
      <Text style={[styles.text, { color: config.text }, textStyle]}>
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
});
