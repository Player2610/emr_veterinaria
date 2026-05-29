import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  type TouchableOpacityProps,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { useTheme } from '@/context/theme-context';

// ─── Types ────────────────────────────────────────────────────────────────────

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends TouchableOpacityProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled,
  style,
  textStyle,
  ...props
}: ButtonProps) {
  const { colors } = useTheme();
  const isDisabled = disabled || loading;

  // ── Container styles ──
  const containerBase: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    opacity: isDisabled ? 0.5 : 1,
  };

  const sizeStyles: Record<ButtonSize, ViewStyle> = {
    sm: { paddingHorizontal: 12, paddingVertical: 6, minHeight: 32 },
    md: { paddingHorizontal: 16, paddingVertical: 10, minHeight: 44 },
    lg: { paddingHorizontal: 24, paddingVertical: 14, minHeight: 52 },
  };

  const variantStyles: Record<ButtonVariant, ViewStyle> = {
    primary: { backgroundColor: colors.primary },
    secondary: { backgroundColor: colors.secondary },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.border,
    },
    ghost: { backgroundColor: 'transparent' },
    destructive: { backgroundColor: colors.destructive },
  };

  // ── Text styles ──
  const textBase: TextStyle = {
    fontWeight: '600',
  };

  const sizeTextStyles: Record<ButtonSize, TextStyle> = {
    sm: { fontSize: 13 },
    md: { fontSize: 15 },
    lg: { fontSize: 17 },
  };

  const variantTextStyles: Record<ButtonVariant, TextStyle> = {
    primary: { color: colors.primaryForeground },
    secondary: { color: colors.secondaryForeground },
    outline: { color: colors.foreground },
    ghost: { color: colors.foreground },
    destructive: { color: colors.destructiveForeground },
  };

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      disabled={isDisabled}
      style={[
        containerBase,
        sizeStyles[size],
        variantStyles[variant],
        fullWidth && { width: '100%' },
        style,
      ]}
      {...props}
    >
      {loading && (
        <ActivityIndicator
          size="small"
          color={
            variant === 'outline' || variant === 'ghost'
              ? colors.foreground
              : '#FFFFFF'
          }
          style={{ marginRight: 8 }}
        />
      )}
      {typeof children === 'string' ? (
        <Text
          style={[
            textBase,
            sizeTextStyles[size],
            variantTextStyles[variant],
            textStyle,
          ]}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
}
