import React from 'react';
import { StyleSheet, Text, Pressable, ActivityIndicator, View } from 'react-native';
import { colors } from '@/theme/colors';

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'large',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
}) {
  const isOutline = variant === 'outline';
  const isSecondary = variant === 'secondary';
  const isGhost = variant === 'ghost';

  const getBackgroundColor = (pressed) => {
    if (disabled) return colors.borderLight;
    if (isOutline || isGhost) {
      return pressed ? colors.primarySoft : 'transparent';
    }
    if (isSecondary) {
      return pressed ? '#0891B2' : colors.secondary;
    }
    return pressed ? colors.primaryDark : colors.primary;
  };

  const getTextColor = () => {
    if (disabled) return colors.textTertiary;
    if (isOutline || isGhost) return colors.primary;
    return colors.textInverse;
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      android_ripple={{
        color: isOutline ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.25)',
        borderless: false,
      }}
      style={({ pressed }) => [
        styles.button,
        styles[size],
        {
          backgroundColor: getBackgroundColor(pressed),
          borderColor: isOutline ? colors.primary : 'transparent',
          borderWidth: isOutline ? 1.5 : 0,
          opacity: disabled && !isOutline ? 0.7 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={isOutline || isGhost ? colors.primary : colors.textInverse}
        />
      ) : (
        <View style={styles.contentRow}>
          {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}
          <Text
            style={[
              styles.text,
              styles[`text_${size}`],
              { color: getTextColor() },
              textStyle,
            ]}
          >
            {title}
          </Text>
          {rightIcon && <View style={styles.rightIconContainer}>{rightIcon}</View>}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    overflow: 'hidden',
  },
  large: {
    paddingVertical: 15,
    paddingHorizontal: 24,
    minHeight: 52,
  },
  medium: {
    paddingVertical: 11,
    paddingHorizontal: 18,
    minHeight: 44,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  text_large: {
    fontSize: 16,
    letterSpacing: 0.2,
  },
  text_medium: {
    fontSize: 14,
  },
  leftIconContainer: {
    marginRight: 8,
  },
  rightIconContainer: {
    marginLeft: 8,
  },
});
