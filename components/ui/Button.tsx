// Reusable Button Component
import React from 'react';
import { Pressable, Text, ActivityIndicator, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  textStyle,
}) => {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        styles[`size_${size}`],
        fullWidth && styles.fullWidth,
        (pressed && !isDisabled) && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? Colors.primary : Colors.textInverse}
        />
      ) : (
        <Text style={[styles.text, styles[`text_${variant}`], styles[`textSize_${size}`], textStyle]}>
          {title}
        </Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.md,
    ...Shadow.sm,
  },
  fullWidth: { width: '100%' },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  disabled: { opacity: 0.5 },

  // Variants
  primary: { backgroundColor: Colors.primary },
  secondary: { backgroundColor: Colors.accent },
  outline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: Colors.primary },
  ghost: { backgroundColor: 'transparent', shadowOpacity: 0, elevation: 0 },
  danger: { backgroundColor: Colors.danger },

  // Sizes
  size_sm: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, minHeight: 36 },
  size_md: { paddingHorizontal: Spacing.base, paddingVertical: Spacing.md, minHeight: 44 },
  size_lg: { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.base, minHeight: 52 },

  // Text
  text: {
    fontWeight: Typography.fontWeightSemibold,
    includeFontPadding: false,
  },
  text_primary: { color: Colors.textInverse },
  text_secondary: { color: Colors.textInverse },
  text_outline: { color: Colors.primary },
  text_ghost: { color: Colors.primary },
  text_danger: { color: Colors.textInverse },

  textSize_sm: { fontSize: Typography.fontSizeSM },
  textSize_md: { fontSize: Typography.fontSizeBase },
  textSize_lg: { fontSize: Typography.fontSizeMD },
});
