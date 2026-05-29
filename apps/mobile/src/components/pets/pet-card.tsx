import React from 'react';
import { View, Text, TouchableOpacity, type StyleProp, type ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import type { PetSummary } from '@emr/shared';
import { HealthStatus } from '@emr/shared';
import { useTheme } from '@/context/theme-context';
import { Badge } from '@/components/ui/badge';
import { getSpeciesEmoji, getSpeciesLabel, getAgeDescription } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PetCardProps {
  pet: PetSummary;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

// ─── Health status badge ──────────────────────────────────────────────────────

type BadgeVariant = 'success' | 'warning' | 'destructive' | 'outline' | 'default';

function getHealthBadgeVariant(status: HealthStatus): BadgeVariant {
  const map: Partial<Record<HealthStatus, BadgeVariant>> = {
    [HealthStatus.HEALTHY]: 'success',
    [HealthStatus.UNDER_TREATMENT]: 'warning',
    [HealthStatus.CHRONIC_CONDITION]: 'warning',
    [HealthStatus.CRITICAL]: 'destructive',
    [HealthStatus.DECEASED]: 'outline',
  };
  return map[status] ?? 'default';
}

function getHealthStatusLabel(status: HealthStatus): string {
  const map: Record<HealthStatus, string> = {
    [HealthStatus.HEALTHY]: 'Saludable',
    [HealthStatus.UNDER_TREATMENT]: 'En tratamiento',
    [HealthStatus.CHRONIC_CONDITION]: 'Condición crónica',
    [HealthStatus.CRITICAL]: 'Crítico',
    [HealthStatus.DECEASED]: 'Fallecido',
  };
  return map[status] ?? status;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PetCard({ pet, onPress, style }: PetCardProps) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        {
          flexDirection: 'row',
          backgroundColor: colors.surface,
          borderRadius: 16,
          padding: 16,
          borderWidth: 1,
          borderColor: colors.border,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 6,
          elevation: 2,
        },
        style,
      ]}
    >
      {/* Avatar / Photo */}
      <View
        style={{
          width: 72,
          height: 72,
          borderRadius: 36,
          backgroundColor: colors.primary + '15',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          marginRight: 14,
        }}
      >
        {pet.photoUrl ? (
          <Image
            source={{ uri: pet.photoUrl }}
            style={{ width: 72, height: 72 }}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <Text style={{ fontSize: 36 }}>
            {getSpeciesEmoji(pet.species)}
          </Text>
        )}
      </View>

      {/* Info */}
      <View style={{ flex: 1 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 4,
          }}
        >
          <Text
            style={{
              fontSize: 17,
              fontWeight: '700',
              color: colors.foreground,
              flex: 1,
              marginRight: 8,
            }}
            numberOfLines={1}
          >
            {pet.name}
          </Text>
          <Badge variant={getHealthBadgeVariant(pet.healthStatus)}>
            {getHealthStatusLabel(pet.healthStatus)}
          </Badge>
        </View>

        <Text
          style={{
            fontSize: 13,
            color: colors.mutedForeground,
            marginBottom: 8,
          }}
        >
          {getSpeciesLabel(pet.species)}
          {pet.breedName ? ` · ${pet.breedName}` : ''}
        </Text>

        {pet.ageDescription && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Text style={{ fontSize: 12, color: colors.mutedForeground }}>
              🎂 {pet.ageDescription}
            </Text>
          </View>
        )}
      </View>

      {/* Chevron */}
      <View style={{ justifyContent: 'center', marginLeft: 8 }}>
        <Text style={{ fontSize: 18, color: colors.mutedForeground }}>›</Text>
      </View>
    </TouchableOpacity>
  );
}
