import React from 'react';
import {
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '@/context/theme-context';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Remove default padding */
  noPadding?: boolean;
  /** Elevation / shadow level */
  elevation?: 'none' | 'sm' | 'md';
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Card({ children, style, noPadding = false, elevation = 'sm' }: CardProps) {
  const { colors } = useTheme();

  const elevationStyles: Record<string, ViewStyle> = {
    none: {},
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
  };

  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: colors.border,
          padding: noPadding ? 0 : 16,
          overflow: 'hidden',
        },
        elevationStyles[elevation],
        style,
      ]}
    >
      {children}
    </View>
  );
}
