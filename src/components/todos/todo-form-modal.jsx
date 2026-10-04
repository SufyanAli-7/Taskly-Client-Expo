import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors } from '@/theme/colors';
import Input from '@/components/ui/input';
import Button from '@/components/ui/button';

const PRIORITIES = [
  { key: 'low', label: 'Low', color: '#10B981', bg: '#ECFDF5' },
  { key: 'medium', label: 'Medium', color: '#F59E0B', bg: '#FEF3C7' },
  { key: 'high', label: 'High', color: '#EF4444', bg: '#FEE2E2' },
];

export default function TodoFormModal({
  visible,
  onClose,
  onSubmit,
  initialData = null,
  isSubmitting = false,
}) {
  const isEditing = Boolean(initialData && initialData.id);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dateObj, setDateObj] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [priority, setPriority] = useState('medium');
  const [imageUri, setImageUri] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState('');
  const [error, setError] = useState('');

  // Reset or populate fields when modal opens
  useEffect(() => {
    if (visible) {
      if (initialData) {
        setTitle(initialData.title || '');
        setDescription(initialData.description || '');
        setDueDate(initialData.dueDate || '');
        const parsed = initialData.dueDate ? new Date(initialData.dueDate) : null;
        setDateObj(parsed && !isNaN(parsed.getTime()) ? parsed : new Date());
        setPriority(initialData.priority || 'medium');
        setExistingImageUrl(initialData.imageURL || '');
        setImageUri(null);
      } else {
        setTitle('');
        setDescription('');
        setDueDate('');
        setDateObj(new Date());
        setPriority('medium');
        setImageUri(null);
        setExistingImageUrl('');
      }
      setShowDatePicker(false);
      setError('');
    }
  }, [visible, initialData]);

  // DatePicker Value & Dismiss Handlers
  const handleDateValueChange = (event, selectedDate) => {
    setShowDatePicker(false);
    const dateToUse = selectedDate || (event?.nativeEvent?.timestamp ? new Date(event.nativeEvent.timestamp) : null);
    if (dateToUse) {
      setDateObj(dateToUse);
      const formatted = dateToUse.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      setDueDate(formatted);
    }
  };

  const handleDateDismiss = () => {
    setShowDatePicker(false);
  };

  // Quick Date Shortcut buttons (Today, Tomorrow, +7 Days)
  const handleQuickDate = (daysFromNow) => {
    const target = new Date();
    target.setDate(target.getDate() + daysFromNow);
    setDateObj(target);
    const formatted = target.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    setDueDate(formatted);
  };

  // Pick an image using expo-image-picker
  const handlePickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Denied', 'Permission to access photo gallery is required.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setImageUri(result.assets[0].uri);
      }
    } catch (err) {
      console.error('Error selecting image:', err);
      Alert.alert('Error', 'Could not select image.');
    }
  };

  const handleRemoveImage = () => {
    setImageUri(null);
    setExistingImageUrl('');
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    onSubmit({
      id: initialData?.id,
      title: title.trim(),
      description: description.trim(),
      dueDate: dueDate.trim(),
      priority,
      imageUri,
      status: initialData?.status || 'active',
      isCompleted: initialData?.isCompleted || false,
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {isEditing ? 'Edit Task' : 'New Task'}
            </Text>
            <Pressable onPress={onClose} hitSlop={10} style={styles.closeButton}>
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollBody}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Title */}
            <Input
              label="Task Title *"
              placeholder="e.g. Complete presentation"
              value={title}
              onChangeText={(text) => {
                setTitle(text);
                if (error) setError('');
              }}
              error={error}
              autoCapitalize="sentences"
            />

            {/* Description */}
            <Input
              label="Description (Optional)"
              placeholder="Add more details about this task..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              autoCapitalize="sentences"
            />

            {/* Due Date Picker */}
            <View style={styles.fieldSection}>
              <Text style={styles.sectionLabel}>Due Date (Optional)</Text>

              <Pressable
                onPress={() => setShowDatePicker(true)}
                style={[styles.dateTrigger, Boolean(dueDate) && styles.dateTriggerActive]}
              >
                <View style={styles.dateLeft}>
                  <Ionicons
                    name="calendar"
                    size={20}
                    color={dueDate ? colors.primary : colors.textTertiary}
                  />
                  <Text style={[styles.dateValueText, !dueDate && styles.datePlaceholderText]}>
                    {dueDate || 'Tap to choose due date'}
                  </Text>
                </View>

                {dueDate ? (
                  <Pressable
                    onPress={() => {
                      setDueDate('');
                      setDateObj(new Date());
                    }}
                    hitSlop={8}
                    style={styles.clearDateBtn}
                  >
                    <Ionicons name="close-circle" size={18} color={colors.textTertiary} />
                  </Pressable>
                ) : (
                  <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
                )}
              </Pressable>

              {/* Quick Preset Date Chips */}
              <View style={styles.quickDateRow}>
                <Pressable
                  onPress={() => handleQuickDate(0)}
                  style={styles.quickDatePill}
                >
                  <Text style={styles.quickDateText}>Today</Text>
                </Pressable>

                <Pressable
                  onPress={() => handleQuickDate(1)}
                  style={styles.quickDatePill}
                >
                  <Text style={styles.quickDateText}>Tomorrow</Text>
                </Pressable>

                <Pressable
                  onPress={() => handleQuickDate(7)}
                  style={styles.quickDatePill}
                >
                  <Text style={styles.quickDateText}>+7 Days</Text>
                </Pressable>
              </View>

              {/* Native Android / iOS DateTimePicker */}
              {showDatePicker && (
                <DateTimePicker
                  value={dateObj}
                  mode="date"
                  display="default"
                  minimumDate={new Date()}
                  onValueChange={handleDateValueChange}
                  onDismiss={handleDateDismiss}
                />
              )}
            </View>

            {/* Priority Selector */}
            <View style={styles.prioritySection}>
              <Text style={styles.sectionLabel}>Priority</Text>
              <View style={styles.priorityRow}>
                {PRIORITIES.map((p) => {
                  const isSelected = priority === p.key;
                  return (
                    <Pressable
                      key={p.key}
                      onPress={() => setPriority(p.key)}
                      style={[
                        styles.priorityPill,
                        { borderColor: p.color },
                        isSelected && { backgroundColor: p.bg, borderWidth: 2 },
                      ]}
                    >
                      <View style={[styles.dot, { backgroundColor: p.color }]} />
                      <Text
                        style={[
                          styles.priorityText,
                          { color: isSelected ? p.color : colors.textSecondary },
                          isSelected && styles.priorityTextActive,
                        ]}
                      >
                        {p.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Photo Attachment Section */}
            <View style={styles.imageSection}>
              <Text style={styles.sectionLabel}>Attachment (Optional)</Text>

              {imageUri || existingImageUrl ? (
                <View style={styles.previewContainer}>
                  <Image
                    source={{ uri: imageUri || existingImageUrl }}
                    style={styles.previewImage}
                    contentFit="cover"
                  />
                  <Pressable
                    onPress={handleRemoveImage}
                    style={styles.removeImageBadge}
                    hitSlop={8}
                  >
                    <Ionicons name="close" size={16} color={colors.textInverse} />
                  </Pressable>
                </View>
              ) : (
                <Pressable onPress={handlePickImage} style={styles.pickButton}>
                  <Ionicons name="camera-outline" size={20} color={colors.primary} />
                  <Text style={styles.pickButtonText}>Attach an image / photo</Text>
                </Pressable>
              )}
            </View>

            {/* Submit & Cancel Buttons */}
            <View style={styles.buttonRow}>
              <Button
                title={isEditing ? 'Save Changes' : 'Create Task'}
                onPress={handleSubmit}
                loading={isSubmitting}
                style={styles.saveButton}
              />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 24,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  closeButton: {
    padding: 6,
    borderRadius: 8,
  },
  scrollBody: {
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 20,
  },
  fieldSection: {
    marginBottom: 18,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  dateTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
  },
  dateTriggerActive: {
    borderColor: colors.primary,
  },
  dateLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  dateValueText: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '500',
  },
  datePlaceholderText: {
    color: colors.textTertiary,
    fontWeight: '400',
  },
  clearDateBtn: {
    padding: 4,
  },
  quickDateRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  quickDatePill: {
    backgroundColor: colors.surfaceVariant,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  quickDateText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  prioritySection: {
    marginBottom: 18,
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 10,
  },
  priorityPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 10,
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 13,
    fontWeight: '600',
  },
  priorityTextActive: {
    fontWeight: '700',
  },
  imageSection: {
    marginBottom: 24,
  },
  pickButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.border,
    borderRadius: 14,
    paddingVertical: 16,
    gap: 8,
    backgroundColor: colors.surfaceVariant,
  },
  pickButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  previewContainer: {
    position: 'relative',
    borderRadius: 14,
    overflow: 'hidden',
    height: 160,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  removeImageBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    borderRadius: 14,
    padding: 5,
  },
  buttonRow: {
    marginTop: 8,
  },
  saveButton: {
    width: '100%',
  },
});
