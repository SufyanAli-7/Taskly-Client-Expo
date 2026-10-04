import React, { useState, forwardRef } from 'react';
import { StyleSheet, View, Text, TextInput, Pressable, Platform } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '@/theme/colors';

const Input = forwardRef(function Input(
  {
    label,
    value,
    onChangeText,
    placeholder,
    leftIcon,
    isPassword = false,
    error,
    helperText,
    keyboardType = 'default',
    autoCapitalize = 'none',
    autoCorrect = false,
    editable = true,
    containerStyle,
    inputStyle,
    autoComplete,
    textContentType,
    returnKeyType,
    onSubmitEditing,
    blurOnSubmit,
    multiline = false,
    numberOfLines,
    onClear,
    rightIcon,
    ...rest
  },
  ref
) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View
        style={[
          styles.inputContainer,
          multiline && styles.inputContainerMultiline,
          isFocused && styles.inputContainerFocused,
          error && styles.inputContainerError,
          !editable && styles.inputContainerDisabled,
        ]}
      >
        {leftIcon && (
          <View style={styles.leftIconContainer}>
            {typeof leftIcon === 'string' ? (
              <Ionicons
                name={leftIcon}
                size={20}
                color={error ? colors.error : isFocused ? colors.primary : colors.textTertiary}
              />
            ) : (
              leftIcon
            )}
          </View>
        )}

        <TextInput
          ref={ref}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textTertiary}
          secureTextEntry={isPassword && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          editable={editable}
          autoComplete={autoComplete}
          textContentType={textContentType}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          blurOnSubmit={blurOnSubmit}
          underlineColorAndroid="transparent"
          multiline={multiline}
          numberOfLines={numberOfLines}
          onFocus={(e) => {
            setIsFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            rest.onBlur?.(e);
          }}
          style={[styles.input, multiline && styles.inputMultiline, inputStyle]}
          {...rest}
        />

        {onClear && Boolean(value) && (
          <Pressable onPress={onClear} hitSlop={10} style={styles.clearButton}>
            <Ionicons name="close-circle" size={19} color={colors.textTertiary} />
          </Pressable>
        )}

        {rightIcon && !onClear && (
          <View style={styles.rightIconContainer}>{rightIcon}</View>
        )}

        {isPassword && (
          <Pressable
            onPress={() => setShowPassword(!showPassword)}
            hitSlop={12}
            style={styles.eyeButton}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={colors.textSecondary}
            />
          </Pressable>
        )}
      </View>

      {error ? (
        <View style={styles.errorRow}>
          <Ionicons name="alert-circle-outline" size={14} color={colors.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
    </View>
  );
});

export default Input;

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
  },
  inputContainerMultiline: {
    height: undefined,
    minHeight: 96,
    alignItems: 'flex-start',
    paddingVertical: 10,
  },
  inputContainerFocused: {
    borderColor: colors.primary,
  },
  inputContainerError: {
    borderColor: colors.error,
  },
  inputContainerDisabled: {
    backgroundColor: colors.borderLight,
    borderColor: colors.border,
  },
  leftIconContainer: {
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    paddingVertical: Platform.OS === 'android' ? 6 : 0,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  inputMultiline: {
    textAlignVertical: 'top',
    minHeight: 76,
    paddingVertical: 0,
    includeFontPadding: false,
  },
  eyeButton: {
    padding: 6,
    marginLeft: 6,
  },
  clearButton: {
    padding: 6,
    marginLeft: 4,
  },
  rightIconContainer: {
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    gap: 4,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    fontWeight: '500',
  },
  helperText: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
});
