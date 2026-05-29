import React from 'react';
import { View, Text, TouchableOpacity, type StyleProp, type ViewStyle } from 'react-native';
import type { AppointmentSummary } from '@emr/shared';
import { AppointmentStatus, AppointmentType } from '@emr/shared';
import { useTheme } from '@/context/theme-context';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatTime, isToday } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AppointmentItemProps {
  appointment: AppointmentSummary;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

type BadgeVariant = 'success' | 'warning' | 'destructive' | 'outline' | 'default' | 'primary';

function getStatusVariant(status: AppointmentStatus): BadgeVariant {
  const map: Partial<Record<AppointmentStatus, BadgeVariant>> = {
    [AppointmentStatus.CONFIRMED]: 'success',
    [AppointmentStatus.PENDING_CONFIRMATION]: 'warning',
    [AppointmentStatus.IN_PROGRESS]: 'primary',
    [AppointmentStatus.COMPLETED]: 'outline',
    [AppointmentStatus.CANCELLED]: 'destructive',
    [AppointmentStatus.NO_SHOW]: 'destructive',
    [AppointmentStatus.RESCHEDULED]: 'outline',
  };
  return map[status] ?? 'default';
}

function getStatusLabel(status: AppointmentStatus): string {
  const map: Record<AppointmentStatus, string> = {
    [AppointmentStatus.CONFIRMED]: 'Confirmada',
    [AppointmentStatus.PENDING_CONFIRMATION]: 'Pendiente',
    [AppointmentStatus.IN_PROGRESS]: 'En curso',
    [AppointmentStatus.COMPLETED]: 'Completada',
    [AppointmentStatus.CANCELLED]: 'Cancelada',
    [AppointmentStatus.NO_SHOW]: 'No asistió',
    [AppointmentStatus.RESCHEDULED]: 'Reprogramada',
  };
  return map[status];
}

function getTypeLabel(type: AppointmentType): string {
  const map: Partial<Record<AppointmentType, string>> = {
    [AppointmentType.GENERAL_CHECKUP]: 'Consulta general',
    [AppointmentType.VACCINATION]: 'Vacunación',
    [AppointmentType.SURGERY]: 'Cirugía',
    [AppointmentType.EMERGENCY]: 'Urgencia',
    [AppointmentType.FOLLOW_UP]: 'Seguimiento',
    [AppointmentType.GROOMING]: 'Grooming',
    [AppointmentType.LABORATORY]: 'Laboratorio',
    [AppointmentType.IMAGING]: 'Imagen diagnóstica',
  };
  return map[type] ?? 'Cita';
}

function getTypeEmoji(type: AppointmentType): string {
  const map: Partial<Record<AppointmentType, string>> = {
    [AppointmentType.GENERAL_CHECKUP]: '🩺',
    [AppointmentType.VACCINATION]: '💉',
    [AppointmentType.SURGERY]: '🔬',
    [AppointmentType.EMERGENCY]: '🚨',
    [AppointmentType.FOLLOW_UP]: '📋',
    [AppointmentType.GROOMING]: '✂️',
    [AppointmentType.LABORATORY]: '🧪',
    [AppointmentType.IMAGING]: '📡',
  };
  return map[type] ?? '📅';
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AppointmentItem({ appointment, onPress, style }: AppointmentItemProps) {
  const { colors } = useTheme();
  const scheduledDate = new Date(appointment.scheduledAt);
  const today = isToday(scheduledDate);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: 14,
          padding: 14,
          borderWidth: 1,
          borderColor: today ? colors.primary + '40' : colors.border,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 1,
        },
        style,
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
        {/* Icon */}
        <View
          style={{
            width: 46,
            height: 46,
            borderRadius: 12,
            backgroundColor: colors.primary + '15',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 22 }}>{getTypeEmoji(appointment.type)}</Text>
        </View>

        {/* Content */}
        <View style={{ flex: 1 }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: 4,
            }}
          >
            <Text
              style={{
                fontSize: 15,
                fontWeight: '600',
                color: colors.foreground,
                flex: 1,
                marginRight: 8,
              }}
              numberOfLines={1}
            >
              {getTypeLabel(appointment.type)}
            </Text>
            <Badge variant={getStatusVariant(appointment.status)}>
              {getStatusLabel(appointment.status)}
            </Badge>
          </View>

          {/* Pet name */}
          {appointment.petName && (
            <Text style={{ fontSize: 13, color: colors.mutedForeground, marginBottom: 6 }}>
              🐾 {appointment.petName}
            </Text>
          )}

          {/* Date + time */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text
              style={{
                fontSize: 13,
                fontWeight: today ? '700' : '400',
                color: today ? colors.primary : colors.mutedForeground,
              }}
            >
              {today ? 'Hoy' : formatDate(scheduledDate)}
            </Text>
            <Text style={{ fontSize: 13, color: colors.mutedForeground }}>
              {formatTime(scheduledDate)}
            </Text>
            {appointment.durationMinutes && (
              <Text style={{ fontSize: 12, color: colors.mutedForeground }}>
                · {appointment.durationMinutes} min
              </Text>
            )}
          </View>

          {/* Vet name */}
          {appointment.vetFullName && (
            <Text
              style={{
                fontSize: 12,
                color: colors.mutedForeground,
                marginTop: 4,
              }}
            >
              Dr/a. {appointment.vetFullName}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}
