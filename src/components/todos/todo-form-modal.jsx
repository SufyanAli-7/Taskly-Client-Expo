import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  ScrollView,
  Pressable,
  Alert,
  Platform,
  Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors } from '@/theme/colors';
import Input from '@/components/ui/input';
import Button from '@/components/ui/button';

const formatDatePart = (date) => {
  if (!date) return '';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const formatTimePart = (date) => {
  if (!date) return '';
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

const formatFullDateTime = (date, withTime) => {
  if (!date) return '';
  const d = formatDatePart(date);
  if (!withTime) return d;
  const t = formatTimePart(date);
  return `${d}, ${t}`;
};

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
  const [hasTime, setHasTime] = useState(false);
  const [pickerMode, setPickerMode] = useState(null); // 'date' | 'time' | null
  const isSequenceRef = useRef(false);
  const [priority, setPriority] = useState('medium');
  const [imageUri, setImageUri] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState('');
  const [error, setError] = useState('');
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  // Safe area bottom inset for modal sheet (ensures submit button is above Android navigation bar when keyboard is closed)
  const insets = useSafeAreaInsets();
  const modalBottomPadding = Math.max(insets.bottom, Platform.OS === 'android' ? 28 : 16) + 12;

  // Track keyboard visibility so we eliminate bottom padding when keyboard is up
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, () => setIsKeyboardVisible(true));
    const hideSub = Keyboard.addListener(hideEvent, () => setIsKeyboardVisible(false));

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Reset or populate fields when modal opens
  useEffect(() => {
    if (visible) {
      if (initialData) {
        setTitle(initialData.title || '');
        setDescription(initialData.description || '');
        setDueDate(initialData.dueDate || '');
        const parsed = initialData.dueDate ? new Date(initialData.dueDate) : null;
        const valid = Boolean(parsed && !isNaN(parsed.getTime()));
        setDateObj(valid ? parsed : new Date());
        setHasTime(Boolean(valid && (/:\d{2}/i.test(initialData.dueDate) || /AM|PM/i.test(initialData.dueDate))));
        setPriority(initialData.priority || 'medium');
        setExistingImageUrl(initialData.imageURL || '');
        setImageUri(null);
      } else {
        setTitle('');
        setDescription('');
        setDueDate('');
        setDateObj(new Date());
        setHasTime(false);
        setPriority('medium');
        setImageUri(null);
        setExistingImageUrl('');
      }
      setPickerMode(null);
      isSequenceRef.current = false;
      setError('');
    }
  }, [visible, initialData]);

  // Open Date picker (optionally auto-transition to Time picker after date is picked)
  const openDatePicker = (isSequence = false) => {
    Keyboard.dismiss();
    isSequenceRef.current = isSequence;
    if (Platform.OS === 'android') {
      setTimeout(() => {
        setPickerMode('date');
      }, 100);
    } else {
      setPickerMode('date');
    }
  };

  // Open Time picker directly
  const openTimePicker = () => {
    Keyboard.dismiss();
    isSequenceRef.current = false;
    if (Platform.OS === 'android') {
      setTimeout(() => {
        setPickerMode('time');
      }, 100);
    } else {
      setPickerMode('time');
    }
  };

  // DateTimePicker Value Change Handler
  const handlePickerChange = (event, selectedDate) => {
    const currentMode = pickerMode;
    setPickerMode(null);

    const dateToUse =
      selectedDate ||
      (event?.nativeEvent?.timestamp ? new Date(event.nativeEvent.timestamp) : null);

    if (!dateToUse) {
      isSequenceRef.current = false;
      return;
    }

    if (currentMode === 'date') {
      const updated = new Date(dateObj);
      updated.setFullYear(dateToUse.getFullYear(), dateToUse.getMonth(), dateToUse.getDate());
      setDateObj(updated);
      setDueDate(formatFullDateTime(updated, hasTime));

      // If user started from the combined "Set Date & Time" flow, open Time Picker next
      if (isSequenceRef.current) {
        isSequenceRef.current = false;
        setTimeout(() => {
          setPickerMode('time');
        }, 300);
      }
    } else if (currentMode === 'time') {
      const updated = new Date(dateObj);
      updated.setHours(dateToUse.getHours(), dateToUse.getMinutes(), 0, 0);
      setDateObj(updated);
      setHasTime(true);
      setDueDate(formatFullDateTime(updated, true));
      isSequenceRef.current = false;
    }
  };

  const handlePickerDismiss = () => {
    setPickerMode(null);
    isSequenceRef.current = false;
  };

  // Clear date & time
  const handleClearDateTime = () => {
    Keyboard.dismiss();
    setDueDate('');
    setHasTime(false);
    setDateObj(new Date());
    isSequenceRef.current = false;
  };

  // Quick Date Shortcut buttons (Today, Tomorrow, +7 Days)
  const handleQuickDate = (daysFromNow) => {
    Keyboard.dismiss();
    const target = new Date();
    target.setDate(target.getDate() + daysFromNow);
    if (hasTime) {
      target.setHours(dateObj.getHours(), dateObj.getMinutes(), 0, 0);
    }
    setDateObj(target);
    setDueDate(formatFullDateTime(target, hasTime));
  };

  // Quick Time Shortcut buttons (9 AM, 1 PM, 6 PM, 9 PM)
  const handleQuickTime = (hours, minutes) => {
    Keyboard.dismiss();
    const target = new Date(dateObj);
    target.setHours(hours, minutes, 0, 0);
    setDateObj(target);
    setHasTime(true);
    setDueDate(formatFullDateTime(target, true));
  };

  // Pick an image using expo-image-picker
  const handlePickImage = async () => {
    Keyboard.dismiss();
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
    Keyboard.dismiss();
    setImageUri(null);
    setExistingImageUrl('');
  };

  const handleSubmit = () => {
    Keyboard.dismiss();
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
        <View
          style={[
            styles.sheetContainer,
            { paddingBottom: isKeyboardVisible ? 0 : modalBottomPadding },
          ]}
        >
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

            {/* Due Date & Time Picker */}
            <View style={styles.fieldSection}>
              <Text style={styles.sectionLabel}>Due Date & Time (Optional)</Text>

              {!dueDate ? (
                /* Unselected State: 1-Tap flow that opens Date and then Time */
                <Pressable
                  onPress={() => openDatePicker(true)}
                  style={styles.dateTrigger}
                >
                  <View style={styles.dateLeft}>
                    <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                    <Text style={styles.datePlaceholderText}>Tap to choose Date & Time</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
                </Pressable>
              ) : (
                /* Selected State: Split interactive cards for Date and Time + Clear */
                <View style={styles.dateTimeActiveContainer}>
                  {/* Date Card */}
                  <Pressable
                    onPress={() => openDatePicker(false)}
                    style={styles.dateTimeBadge}
                  >
                    <Ionicons name="calendar" size={16} color={colors.primary} />
                    <Text style={styles.dateTimeBadgeText} numberOfLines={1}>
                      {formatDatePart(dateObj)}
                    </Text>
                  </Pressable>

                  {/* Time Card */}
                  <Pressable
                    onPress={openTimePicker}
                    style={[styles.dateTimeBadge, hasTime && styles.dateTimeBadgeHighlight]}
                  >
                    <Ionicons
                      name="time"
                      size={16}
                      color={hasTime ? colors.primary : colors.textTertiary}
                    />
                    <Text
                      style={[
                        styles.dateTimeBadgeText,
                        !hasTime && styles.dateTimeBadgePlaceholder,
                      ]}
                      numberOfLines={1}
                    >
                      {hasTime ? formatTimePart(dateObj) : 'Add Time'}
                    </Text>
                  </Pressable>

                  {/* Clear Button */}
                  <Pressable
                    onPress={handleClearDateTime}
                    hitSlop={8}
                    style={styles.clearDateBtn}
                  >
                    <Ionicons name="close-circle" size={22} color={colors.textTertiary} />
                  </Pressable>
                </View>
              )}

              {/* Quick Preset Date & Time Chips */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.quickDateRow}
                style={styles.quickDateScroll}
              >
                <Pressable onPress={() => handleQuickDate(0)} style={styles.quickDatePill}>
                  <Text style={styles.quickDateText}>Today</Text>
                </Pressable>

                <Pressable onPress={() => handleQuickDate(1)} style={styles.quickDatePill}>
                  <Text style={styles.quickDateText}>Tomorrow</Text>
                </Pressable>

                <Pressable onPress={() => handleQuickDate(7)} style={styles.quickDatePill}>
                  <Text style={styles.quickDateText}>+7 Days</Text>
                </Pressable>

                <Pressable onPress={() => handleQuickTime(9, 0)} style={styles.quickTimePill}>
                  <Ionicons name="time-outline" size={13} color={colors.textSecondary} />
                  <Text style={styles.quickTimeText}>9:00 AM</Text>
                </Pressable>

                <Pressable onPress={() => handleQuickTime(13, 0)} style={styles.quickTimePill}>
                  <Ionicons name="time-outline" size={13} color={colors.textSecondary} />
                  <Text style={styles.quickTimeText}>1:00 PM</Text>
                </Pressable>

                <Pressable onPress={() => handleQuickTime(18, 0)} style={styles.quickTimePill}>
                  <Ionicons name="time-outline" size={13} color={colors.textSecondary} />
                  <Text style={styles.quickTimeText}>6:00 PM</Text>
                </Pressable>

                <Pressable onPress={() => handleQuickTime(21, 0)} style={styles.quickTimePill}>
                  <Ionicons name="time-outline" size={13} color={colors.textSecondary} />
                  <Text style={styles.quickTimeText}>9:00 PM</Text>
                </Pressable>
              </ScrollView>

              {/* Native Android / iOS DateTimePicker */}
              {pickerMode && (
                <DateTimePicker
                  value={dateObj}
                  mode={pickerMode}
                  display="default"
                  minimumDate={pickerMode === 'date' ? new Date() : undefined}
                  is24Hour={false}
                  onValueChange={handlePickerChange}
                  onDismiss={handlePickerDismiss}
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
                      onPress={() => {
                        Keyboard.dismiss();
                        setPriority(p.key);
                      }}
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
  dateLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  datePlaceholderText: {
    color: colors.textTertiary,
    fontSize: 15,
    fontWeight: '400',
  },
  dateTimeActiveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateTimeBadge: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: colors.surfaceVariant,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  dateTimeBadgeHighlight: {
    borderColor: colors.primary,
    backgroundColor: colors.card,
  },
  dateTimeBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  dateTimeBadgePlaceholder: {
    color: colors.textTertiary,
    fontWeight: '500',
  },
  clearDateBtn: {
    padding: 6,
  },
  quickDateScroll: {
    marginTop: 8,
  },
  quickDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quickDatePill: {
    backgroundColor: colors.surfaceVariant,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickDateText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  quickTimePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  quickTimeText: {
    fontSize: 11,
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
