import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  RefreshControl,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/context/theme-context';
import { useAppointments, useAvailableSlots, useBookAppointment } from '@/hooks/use-appointments';
import { usePets } from '@/hooks/use-pets';
import { AppointmentItem } from '@/components/appointments/appointment-item';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AppointmentType, AppointmentStatus } from '@emr/shared';
import type { AppointmentSummary, PetSummary } from '@emr/shared';
import { formatDate, formatTime } from '@/lib/utils';

// ─── Book Appointment Modal ───────────────────────────────────────────────────

const APPOINTMENT_TYPES: Array<{ type: AppointmentType; label: string; emoji: string }> = [
  { type: AppointmentType.GENERAL_CHECKUP, label: 'Consulta general', emoji: '🩺' },
  { type: AppointmentType.VACCINATION, label: 'Vacunación', emoji: '💉' },
  { type: AppointmentType.FOLLOW_UP, label: 'Seguimiento', emoji: '📋' },
  { type: AppointmentType.GROOMING, label: 'Grooming', emoji: '✂️' },
  { type: AppointmentType.LABORATORY, label: 'Laboratorio', emoji: '🧪' },
  { type: AppointmentType.EMERGENCY, label: 'Urgencia', emoji: '🚨' },
];

function BookModal({
  visible,
  onClose,
  onBooked,
}: {
  visible: boolean;
  onClose: () => void;
  onBooked: () => void;
}) {
  const { colors } = useTheme();
  const { pets, loading: petsLoading } = usePets();
  const { bookAppointment, loading: bookingLoading, error: bookingError } = useBookAppointment();

  const [step, setStep] = useState<'pet' | 'type' | 'date' | 'slot' | 'confirm'>('pet');
  const [selectedPet, setSelectedPet] = useState<PetSummary | null>(null);
  const [selectedType, setSelectedType] = useState<AppointmentType | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ startAt: Date; vetId: string } | null>(null);
  const [reason, setReason] = useState('');

  const { slots, loading: slotsLoading } = useAvailableSlots(selectedDate);

  // Generate next 14 days
  const upcomingDays = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return d;
  });

  const resetAndClose = () => {
    setStep('pet');
    setSelectedPet(null);
    setSelectedType(null);
    setSelectedDate(null);
    setSelectedSlot(null);
    setReason('');
    onClose();
  };

  const handleBook = async () => {
    if (!selectedPet || !selectedType || !selectedSlot) return;

    const appt = await bookAppointment({
      petId: selectedPet.id,
      ownerId: selectedPet.ownerId,
      vetId: selectedSlot.vetId,
      type: selectedType,
      scheduledAt: selectedSlot.startAt,
      reasonForVisit: reason || APPOINTMENT_TYPES.find((t) => t.type === selectedType)?.label ?? 'Consulta',
    });

    if (appt) {
      Alert.alert(
        'Cita solicitada',
        'Tu cita fue enviada. La clínica la confirmará a la brevedad.',
        [{ text: 'OK', onPress: () => { resetAndClose(); onBooked(); } }]
      );
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={resetAndClose}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        {/* Modal header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            paddingVertical: 16,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            backgroundColor: colors.surface,
          }}
        >
          <TouchableOpacity
            onPress={step === 'pet' ? resetAndClose : () => {
              const steps: typeof step[] = ['pet', 'type', 'date', 'slot', 'confirm'];
              const idx = steps.indexOf(step);
              if (idx > 0) setStep(steps[idx - 1]);
            }}
          >
            <Text style={{ fontSize: 16, color: colors.primary }}>
              {step === 'pet' ? 'Cancelar' : '‹ Atrás'}
            </Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 16, fontWeight: '700', color: colors.foreground }}>
            Pedir turno
          </Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
          {/* Step: Pet selection */}
          {step === 'pet' && (
            <>
              <Text style={{ fontSize: 18, fontWeight: '700', color: colors.foreground, marginBottom: 4 }}>
                ¿Para qué mascota?
              </Text>
              {petsLoading ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                pets.map((pet) => (
                  <TouchableOpacity
                    key={pet.id}
                    onPress={() => { setSelectedPet(pet); setStep('type'); }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      padding: 14,
                      backgroundColor: colors.surface,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: colors.border,
                      gap: 12,
                      marginBottom: 8,
                    }}
                  >
                    <Text style={{ fontSize: 28 }}>🐾</Text>
                    <Text style={{ fontSize: 15, fontWeight: '600', color: colors.foreground, flex: 1 }}>
                      {pet.name}
                    </Text>
                    <Text style={{ fontSize: 18, color: colors.mutedForeground }}>›</Text>
                  </TouchableOpacity>
                ))
              )}
            </>
          )}

          {/* Step: Type selection */}
          {step === 'type' && (
            <>
              <Text style={{ fontSize: 18, fontWeight: '700', color: colors.foreground, marginBottom: 4 }}>
                Tipo de consulta
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                {APPOINTMENT_TYPES.map((t) => (
                  <TouchableOpacity
                    key={t.type}
                    onPress={() => { setSelectedType(t.type); setStep('date'); }}
                    style={{
                      width: '47%',
                      padding: 14,
                      backgroundColor:
                        selectedType === t.type ? colors.primary + '20' : colors.surface,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor:
                        selectedType === t.type ? colors.primary : colors.border,
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <Text style={{ fontSize: 28 }}>{t.emoji}</Text>
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: '600',
                        color: selectedType === t.type ? colors.primary : colors.foreground,
                        textAlign: 'center',
                      }}
                    >
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {/* Step: Date selection */}
          {step === 'date' && (
            <>
              <Text style={{ fontSize: 18, fontWeight: '700', color: colors.foreground, marginBottom: 4 }}>
                Elegí una fecha
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: 'row', gap: 8, paddingVertical: 4 }}>
                  {upcomingDays.map((day, i) => {
                    const isSelected =
                      selectedDate?.toDateString() === day.toDateString();
                    return (
                      <TouchableOpacity
                        key={i}
                        onPress={() => { setSelectedDate(day); setStep('slot'); }}
                        style={{
                          width: 60,
                          padding: 10,
                          borderRadius: 12,
                          backgroundColor: isSelected ? colors.primary : colors.surface,
                          borderWidth: 1,
                          borderColor: isSelected ? colors.primary : colors.border,
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 11,
                            fontWeight: '600',
                            color: isSelected ? colors.primaryForeground : colors.mutedForeground,
                          }}
                        >
                          {day.toLocaleDateString('es-AR', { weekday: 'short' }).toUpperCase()}
                        </Text>
                        <Text
                          style={{
                            fontSize: 20,
                            fontWeight: '800',
                            color: isSelected ? colors.primaryForeground : colors.foreground,
                          }}
                        >
                          {day.getDate()}
                        </Text>
                        <Text
                          style={{
                            fontSize: 10,
                            color: isSelected ? colors.primaryForeground : colors.mutedForeground,
                          }}
                        >
                          {day.toLocaleDateString('es-AR', { month: 'short' })}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>
            </>
          )}

          {/* Step: Slot selection */}
          {step === 'slot' && (
            <>
              <Text style={{ fontSize: 18, fontWeight: '700', color: colors.foreground, marginBottom: 4 }}>
                Horarios disponibles
              </Text>
              <Text style={{ fontSize: 14, color: colors.mutedForeground, marginBottom: 12 }}>
                {selectedDate ? formatDate(selectedDate) : ''}
              </Text>

              {slotsLoading ? (
                <ActivityIndicator color={colors.primary} />
              ) : slots.length === 0 ? (
                <Text style={{ fontSize: 14, color: colors.mutedForeground, textAlign: 'center', padding: 24 }}>
                  Sin turnos disponibles para este día
                </Text>
              ) : (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                  {slots.map((slot, i) => {
                    const start = new Date(slot.startAt);
                    const isSelected =
                      selectedSlot?.startAt.toISOString() === start.toISOString();
                    return (
                      <TouchableOpacity
                        key={i}
                        onPress={() => { setSelectedSlot({ startAt: start, vetId: slot.vetId }); setStep('confirm'); }}
                        style={{
                          paddingHorizontal: 16,
                          paddingVertical: 10,
                          borderRadius: 10,
                          backgroundColor: isSelected ? colors.primary : colors.surface,
                          borderWidth: 1,
                          borderColor: isSelected ? colors.primary : colors.border,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: '600',
                            color: isSelected ? colors.primaryForeground : colors.foreground,
                          }}
                        >
                          {formatTime(start)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </>
          )}

          {/* Step: Confirm */}
          {step === 'confirm' && selectedPet && selectedType && selectedSlot && (
            <>
              <Text style={{ fontSize: 18, fontWeight: '700', color: colors.foreground, marginBottom: 16 }}>
                Confirmá tu cita
              </Text>

              <Card>
                {[
                  { label: 'Mascota', value: selectedPet.name },
                  {
                    label: 'Tipo',
                    value: APPOINTMENT_TYPES.find((t) => t.type === selectedType)?.label ?? selectedType,
                  },
                  {
                    label: 'Fecha',
                    value: formatDate(selectedSlot.startAt),
                  },
                  {
                    label: 'Hora',
                    value: formatTime(selectedSlot.startAt),
                  },
                ].map(({ label, value }) => (
                  <View
                    key={label}
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      paddingVertical: 8,
                      borderBottomWidth: 1,
                      borderBottomColor: colors.border,
                    }}
                  >
                    <Text style={{ fontSize: 14, color: colors.mutedForeground }}>{label}</Text>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground }}>
                      {value}
                    </Text>
                  </View>
                ))}
              </Card>

              {bookingError && (
                <View
                  style={{
                    backgroundColor: colors.destructive + '15',
                    borderRadius: 8,
                    padding: 12,
                    borderLeftWidth: 3,
                    borderLeftColor: colors.destructive,
                  }}
                >
                  <Text style={{ fontSize: 13, color: colors.destructive }}>{bookingError}</Text>
                </View>
              )}

              <Button
                onPress={handleBook}
                loading={bookingLoading}
                fullWidth
                size="lg"
              >
                Confirmar cita
              </Button>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function AppointmentsScreen() {
  const { colors } = useTheme();
  const { upcoming, past, loading, error, refetch } = useAppointments();
  const [showModal, setShowModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'upcoming' | 'past'>('upcoming');

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const displayedAppointments = activeFilter === 'upcoming' ? upcoming : past;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 12,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          backgroundColor: colors.surface,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 22, fontWeight: '800', color: colors.foreground }}>
            Citas
          </Text>
          <Button
            size="sm"
            onPress={() => setShowModal(true)}
          >
            + Pedir turno
          </Button>
        </View>

        {/* Filter tabs */}
        <View style={{ flexDirection: 'row', marginTop: 12, gap: 8 }}>
          {(['upcoming', 'past'] as const).map((filter) => (
            <TouchableOpacity
              key={filter}
              onPress={() => setActiveFilter(filter)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 6,
                borderRadius: 20,
                backgroundColor:
                  activeFilter === filter ? colors.primary : colors.surface,
                borderWidth: 1,
                borderColor:
                  activeFilter === filter ? colors.primary : colors.border,
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: '600',
                  color:
                    activeFilter === filter
                      ? colors.primaryForeground
                      : colors.mutedForeground,
                }}
              >
                {filter === 'upcoming' ? `Próximas (${upcoming.length})` : `Historial (${past.length})`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Content */}
      {loading && !refreshing ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={displayedAppointments}
          renderItem={({ item }) => (
            <AppointmentItem
              appointment={item}
              style={{ marginHorizontal: 20, marginBottom: 10 }}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingVertical: 16 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          ListEmptyComponent={
            <View style={{ alignItems: 'center', padding: 48 }}>
              <Text style={{ fontSize: 48, marginBottom: 16 }}>
                {activeFilter === 'upcoming' ? '📅' : '🗂️'}
              </Text>
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.foreground, marginBottom: 8 }}>
                {activeFilter === 'upcoming' ? 'Sin citas próximas' : 'Sin historial'}
              </Text>
              {activeFilter === 'upcoming' && (
                <Button
                  size="sm"
                  variant="outline"
                  onPress={() => setShowModal(true)}
                  style={{ marginTop: 8 }}
                >
                  Pedir turno
                </Button>
              )}
            </View>
          }
        />
      )}

      <BookModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onBooked={refetch}
      />
    </SafeAreaView>
  );
}
