import React from 'react';
import { View, Text, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '@/context/theme-context';

// ─── Types ────────────────────────────────────────────────────────────────────

type BadgeVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  style?: StyleProp<ViewStyle>;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Badge({ children, variant = 'default', style }: BadgeProps) {
  const { colors } = useTheme();

  type BadgeStyle = { bg: string; text: string; border?: string };

  const variantStyles: Record<BadgeVariant, BadgeStyle> = {
    default: { bg: '#F1F5F9', text: colors.mutedForeground },
    primary: { bg: colors.primary + '20', text: colors.primary },
    secondary: { bg: colors.secondary + '20', text: colors.secondary },
    success: { bg: '#DCFCE7', text: '#166534' },
    warning: { bg: '#FEF9C3', text: '#854D0E' },
    destructive: { bg: colors.destructive + '20', text: colors.destructive },
    outline: { bg: 'transparent', text: colors.foreground, border: colors.border },
  };

  const vs = variantStyles[variant];

  return (
    <View
      style={[
        {
          backgroundColor: vs.bg,
          borderRadius: 100,
          paddingHorizontal: 8,
          paddingVertical: 2,
          alignSelf: 'flex-start',
          borderWidth: vs.border ? 1 : 0,
          borderColor: vs.border,
        },
        style,
      ]}
    >
      {typeof children === 'string' ? (
        <Text
          style={{
            fontSize: 11,
            fontWeight: '600',
            color: vs.text,
            letterSpacing: 0.3,
          }}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </View>
  );
}
