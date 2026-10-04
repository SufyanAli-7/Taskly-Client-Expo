import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { colors } from '@/theme/colors';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'completed', label: 'Done' },
];

export default function TodoFilter({ activeFilter, onSelectFilter, counts = {} }) {
  return (
    <View style={styles.container}>
      {FILTERS.map((item) => {
        const isSelected = activeFilter === item.key;
        const count = counts[item.key] ?? 0;

        return (
          <Pressable
            key={item.key}
            onPress={() => onSelectFilter(item.key)}
            style={[styles.tab, isSelected && styles.tabActive]}
          >
            <Text style={[styles.label, isSelected && styles.labelActive]}>
              {item.label}
            </Text>
            <View style={[styles.countBadge, isSelected && styles.countBadgeActive]}>
              <Text style={[styles.countText, isSelected && styles.countTextActive]}>
                {count}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9', // Slate 100
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  tabActive: {
    backgroundColor: colors.card,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  labelActive: {
    color: colors.primary,
  },
  countBadge: {
    backgroundColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  countBadgeActive: {
    backgroundColor: colors.primarySoft,
  },
  countText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  countTextActive: {
    color: colors.primary,
  },
});
