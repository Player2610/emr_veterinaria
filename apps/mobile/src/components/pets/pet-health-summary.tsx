import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import type { Pet } from '@emr/shared';
import { HealthStatus } from '@emr/shared';
import { useTheme } from '@/context/theme-context';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatWeight } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PetHealthSummaryProps {
  pet: Pet;
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionTitle({ title, colors }: { title: string; colors: ReturnType<typeof useTheme>['colors'] }) {
  return (
    <Text
      style={{
        fontSize: 13,
        fontWeight: '700',
        color: colors.mutedForeground,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: 10,
        marginTop: 4,
      }}
    >
      {title}
    </Text>
  );
}

// ─── Info row ─────────────────────────────────────────────────────────────────

function InfoRow({
  label,
  value,
  colors,
}: {
  label: string;
  value: string;
  colors: ReturnType<typeof useTheme>['colors'];
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}
    >
      <Text style={{ fontSize: 14, color: colors.mutedForeground, flex: 1 }}>
        {label}
      </Text>
      <Text
        style={{
          fontSize: 14,
          color: colors.foreground,
          fontWeight: '500',
          flex: 1,
          textAlign: 'right',
        }}
        numberOfLines={2}
      >
        {value}
      </Text>
    </View>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PetHealthSummary({ pet }: PetHealthSummaryProps) {
  const { colors } = useTheme();

  const hasAlerts = !!pet.alertNotes;
  const hasAllergies = pet.knownAllergies.length > 0;
  const hasChronicConditions = pet.chronicConditions.length > 0;

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ gap: 16 }}
    >
      {/* Alert banner */}
      {hasAlerts && (
        <View
          style={{
            backgroundColor: colors.destructive + '15',
            borderRadius: 10,
            padding: 12,
            borderLeftWidth: 4,
            borderLeftColor: colors.destructive,
          }}
        >
          <Text
            style={{
              fontSize: 13,
              fontWeight: '700',
              color: colors.destructive,
              marginBottom: 2,
            }}
          >
            Alerta
          </Text>
          <Text style={{ fontSize: 13, color: colors.foreground }}>
            {pet.alertNotes}
          </Text>
        </View>
      )}

      {/* Weight */}
      <Card>
        <SectionTitle title="Peso" colors={colors} />
        <Text
          style={{
            fontSize: 32,
            fontWeight: '800',
            color: colors.foreground,
          }}
        >
          {formatWeight(pet.weightKg)}
        </Text>
        <Text style={{ fontSize: 12, color: colors.mutedForeground, marginTop: 2 }}>
          Último registro
        </Text>
      </Card>

      {/* Health status */}
      <Card>
        <SectionTitle title="Estado de salud" colors={colors} />
        <Badge
          variant={
            pet.healthStatus === HealthStatus.HEALTHY
              ? 'success'
              : pet.healthStatus === HealthStatus.CRITICAL
              ? 'destructive'
              : 'warning'
          }
          style={{ alignSelf: 'flex-start' }}
        >
          {pet.healthStatus === HealthStatus.HEALTHY
            ? 'Saludable'
            : pet.healthStatus === HealthStatus.UNDER_TREATMENT
            ? 'En tratamiento'
            : pet.healthStatus === HealthStatus.CHRONIC_CONDITION
            ? 'Condición crónica'
            : pet.healthStatus === HealthStatus.CRITICAL
            ? 'Crítico'
            : pet.healthStatus}
        </Badge>
      </Card>

      {/* Allergies */}
      {hasAllergies && (
        <Card>
          <SectionTitle title="Alergias conocidas" colors={colors} />
          {pet.knownAllergies.map((allergy, idx) => (
            <View
              key={idx}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                marginBottom: 6,
              }}
            >
              <Badge
                variant={
                  allergy.severity === 'life-threatening' || allergy.severity === 'severe'
                    ? 'destructive'
                    : 'warning'
                }
              >
                {allergy.severity === 'life-threatening'
                  ? 'Grave'
                  : allergy.severity === 'severe'
                  ? 'Severo'
                  : allergy.severity === 'moderate'
                  ? 'Moderado'
                  : 'Leve'}
              </Badge>
              <Text style={{ fontSize: 14, color: colors.foreground, flex: 1 }}>
                {allergy.allergen}
              </Text>
            </View>
          ))}
        </Card>
      )}

      {/* Chronic conditions */}
      {hasChronicConditions && (
        <Card>
          <SectionTitle title="Condiciones crónicas" colors={colors} />
          {pet.chronicConditions.map((condition, idx) => (
            <View key={idx} style={{ marginBottom: idx < pet.chronicConditions.length - 1 ? 12 : 0 }}>
              <Text
                style={{ fontSize: 15, fontWeight: '600', color: colors.foreground }}
              >
                {condition.name}
              </Text>
              {condition.managementNotes && (
                <Text
                  style={{ fontSize: 13, color: colors.mutedForeground, marginTop: 2 }}
                >
                  {condition.managementNotes}
                </Text>
              )}
            </View>
          ))}
        </Card>
      )}
    </ScrollView>
  );
}
