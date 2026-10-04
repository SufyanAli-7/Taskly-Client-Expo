import React from 'react';
import { StyleSheet, View, Text, Pressable, Alert } from 'react-native';
import { Image } from 'expo-image';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '@/theme/colors';
import Badge from '@/components/ui/badge';

export default function TodoItem({ todo, onToggle, onEdit, onDelete }) {
  const isCompleted = todo.isCompleted;

  const handleDelete = () => {
    Alert.alert(
      'Delete Task',
      `Are you sure you want to delete "${todo.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => onDelete(todo.id) },
      ]
    );
  };

  return (
    <View style={[styles.card, isCompleted && styles.cardCompleted]}>
      {/* Checkbox */}
      <Pressable
        onPress={() => onToggle(todo)}
        style={styles.checkboxTouch}
        hitSlop={8}
      >
        <View style={[styles.checkbox, isCompleted && styles.checkboxActive]}>
          {isCompleted && (
            <Ionicons name="checkmark" size={16} color={colors.textInverse} />
          )}
        </View>
      </Pressable>

      {/* Main Info */}
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text
            style={[styles.title, isCompleted && styles.titleCompleted]}
            numberOfLines={2}
          >
            {todo.title}
          </Text>
          <Badge priority={todo.priority} />
        </View>

        {todo.description ? (
          <Text
            style={[styles.description, isCompleted && styles.descCompleted]}
            numberOfLines={2}
          >
            {todo.description}
          </Text>
        ) : null}

        {/* Bottom meta row: Due date & attached image badge */}
        <View style={styles.metaRow}>
          {todo.dueDate ? (
            <View style={styles.dateBadge}>
              <Ionicons name="calendar-outline" size={13} color={colors.textSecondary} />
              <Text style={styles.dateText}>{todo.dueDate}</Text>
            </View>
          ) : null}

          {todo.imageURL ? (
            <View style={styles.imageBadge}>
              <Ionicons name="image-outline" size={13} color={colors.primary} />
              <Text style={styles.imageBadgeText}>Photo attached</Text>
            </View>
          ) : null}
        </View>

        {/* Thumbnail if imageURL is present */}
        {todo.imageURL ? (
          <Image
            source={{ uri: todo.imageURL }}
            style={styles.thumbnail}
            contentFit="cover"
            transition={200}
          />
        ) : null}
      </View>

      {/* Action Buttons: Edit & Delete */}
      <View style={styles.actions}>
        <Pressable
          onPress={() => onEdit(todo)}
          hitSlop={8}
          style={({ pressed }) => [styles.actionButton, pressed && styles.actionPressed]}
        >
          <Ionicons name="pencil-outline" size={18} color={colors.primary} />
        </Pressable>

        <Pressable
          onPress={handleDelete}
          hitSlop={8}
          style={({ pressed }) => [styles.actionButton, pressed && styles.actionPressed]}
        >
          <Ionicons name="trash-outline" size={18} color={colors.error} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  cardCompleted: {
    backgroundColor: '#F8FAFC',
    borderColor: colors.borderLight,
    opacity: 0.75,
  },
  checkboxTouch: {
    paddingTop: 2,
    marginRight: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.textTertiary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  checkboxActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  content: {
    flex: 1,
    paddingRight: 8,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    lineHeight: 22,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  description: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  descCompleted: {
    textDecorationLine: 'line-through',
    color: colors.textTertiary,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  imageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  imageBadgeText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
  thumbnail: {
    width: '100%',
    height: 140,
    borderRadius: 12,
    marginTop: 10,
  },
  actions: {
    flexDirection: 'column',
    gap: 4,
  },
  actionButton: {
    padding: 6,
    borderRadius: 8,
  },
  actionPressed: {
    backgroundColor: colors.primarySoft,
  },
});
