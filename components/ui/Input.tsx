// Reusable Input Component
import React, { useState } from 'react';
import {
  View, Text, TextInput, Pressable,
  StyleSheet, ViewStyle, TextStyle
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius } from '../../constants/theme';

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  error?: string;
  disabled?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  isRTL?: boolean;
  leftIcon?: keyof typeof MaterialIcons.glyphMap;
  rightIcon?: keyof typeof MaterialIcons.glyphMap;
  onRightIconPress?: () => void;
}

export const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  error,
  disabled = false,
  multiline = false,
  numberOfLines = 1,
  style,
  inputStyle,
  isRTL = false,
  leftIcon,
  rightIcon,
  onRightIconPress,
}) => {
  const [focused, setFocused] = useState(false);
  const [secure, setSecure] = useState(secureTextEntry);

  const isPassword = secureTextEntry;

  return (
    <View style={[styles.container, style]}>
      {label ? (
        <Text style={[styles.label, isRTL && styles.textRTL]}>{label}</Text>
      ) : null}
      <View style={[
        styles.inputWrapper,
        focused && styles.inputWrapperFocused,
        error ? styles.inputWrapperError : null,
        disabled && styles.inputWrapperDisabled,
      ]}>
        {leftIcon ? (
          <MaterialIcons
            name={leftIcon}
            size={18}
            color={focused ? Colors.primary : Colors.textMuted}
            style={styles.leftIcon}
          />
        ) : null}
        <TextInput
          style={[
            styles.input,
            leftIcon ? styles.inputWithLeft : null,
            (rightIcon || isPassword) ? styles.inputWithRight : null,
            isRTL && styles.inputRTL,
            inputStyle,
          ]}
          placeholder={placeholder}
          placeholderTextColor={Colors.textMuted}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secure}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          editable={!disabled}
          multiline={multiline}
          numberOfLines={numberOfLines}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          textAlign={isRTL ? 'right' : 'left'}
          accessibilityLabel={label}
        />
        {isPassword ? (
          <Pressable
            onPress={() => setSecure(p => !p)}
            style={styles.rightIcon}
            hitSlop={8}
          >
            <MaterialIcons
              name={secure ? 'visibility-off' : 'visibility'}
              size={18}
              color={Colors.textMuted}
            />
          </Pressable>
        ) : rightIcon ? (
          <Pressable
            onPress={onRightIconPress}
            style={styles.rightIcon}
            hitSlop={8}
          >
            <MaterialIcons name={rightIcon} size={18} color={Colors.textMuted} />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <View style={styles.errorRow}>
          <MaterialIcons name="error-outline" size={13} color={Colors.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: Spacing.base },
  label: {
    fontSize: Typography.fontSizeSM,
    fontWeight: Typography.fontWeightMedium,
    color: Colors.textSecondary,
    marginBottom: 6,
    includeFontPadding: false,
  },
  textRTL: { textAlign: 'right' },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    minHeight: 48,
  },
  inputWrapperFocused: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  inputWrapperError: { borderColor: Colors.error },
  inputWrapperDisabled: { backgroundColor: Colors.borderLight, opacity: 0.7 },
  leftIcon: { marginLeft: Spacing.md },
  rightIcon: { padding: Spacing.md },
  input: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: Typography.fontSizeBase,
    color: Colors.text,
    includeFontPadding: false,
  },
  inputRTL: { textAlign: 'right' },
  inputWithLeft: { paddingLeft: Spacing.sm },
  inputWithRight: { paddingRight: Spacing.sm },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  errorText: {
    fontSize: Typography.fontSizeXS,
    color: Colors.error,
    includeFontPadding: false,
  },
});
