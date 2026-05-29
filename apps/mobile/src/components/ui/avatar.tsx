import React from 'react';
import { View, Text, type StyleProp, type ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { useTheme } from '@/context/theme-context';
import { getInitials } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  name: string;
  uri?: string | null;
  size?: AvatarSize;
  style?: StyleProp<ViewStyle>;
}

// ─── Size map ─────────────────────────────────────────────────────────────────

const SIZE_MAP: Record<AvatarSize, { container: number; font: number }> = {
  xs: { container: 28, font: 10 },
  sm: { container: 36, font: 13 },
  md: { container: 48, font: 18 },
  lg: { container: 64, font: 22 },
  xl: { container: 96, font: 32 },
};

// ─── Component ────────────────────────────────────────────────────────────────

export function Avatar({ name, uri, size = 'md', style }: AvatarProps) {
  const { colors } = useTheme();
  const { container: containerSize, font: fontSize } = SIZE_MAP[size];
  const initials = getInitials(name);

  const containerStyle: ViewStyle = {
    width: containerSize,
    height: containerSize,
    borderRadius: containerSize / 2,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  };

  if (uri) {
    return (
      <View style={[containerStyle, style]}>
        <Image
          source={{ uri }}
          style={{ width: containerSize, height: containerSize }}
          contentFit="cover"
          transition={200}
        />
      </View>
    );
  }

  return (
    <View style={[containerStyle, style]}>
      <Text
        style={{
          color: colors.primaryForeground,
          fontSize,
          fontWeight: '700',
        }}
      >
        {initials}
      </Text>
    </View>
  );
}
