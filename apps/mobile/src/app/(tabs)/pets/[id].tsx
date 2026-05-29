import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  RefreshControl,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/context/theme-context';
import { usePet, usePetMedicalHistory, usePetVaccinations } from '@/hooks/use-pets';
import { useAppointments } from '@/hooks/use-appointments';
import { PetHealthSummary } from '@/components/pets/pet-health-summary';
import { AppointmentItem } from '@/components/appointments/appointment-item';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  getSpeciesEmoji,
  getSpeciesLabel,
  getAgeDescription,
  formatDate,
  formatWeight,
} from '@/lib/utils';
import type { MedicalRecordSummary, VaccinationRecord } from '@emr/shared';
import { PetIdentificationType } from '@emr/shared';

// ─── Tab definitions ──────────────────────────────────────────────────────────

type TabKey = 'info' | 'historial' | 'vacunas' | 'citas';

const TABS: Array<{ key: TabKey; label: string; emoji: string }> = [
  { key: 'info', label: 'Información', emoji: '📋' },
  { key: 'historial', label: 'Historial', emoji: '🩺' },
  { key: 'vacunas', label: 'Vacunas', emoji: '💉' },
  { key: 'citas', label: 'Citas', emoji: '📅' },
];

// ─── Tab: Información ─────────────────────────────────────────────────────────

function InfoTab({ petId }: { petId: string }) {
  const { colors } = useTheme();
  const { pet, loading } = usePet(petId);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 48 }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!pet) return null;

  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
      <PetHealthSummary pet={pet} />

      {/* Identification */}
      <Card>
        <Text
          style={{
            fontSize: 13,
            fontWeight: '700',
            color: colors.mutedForeground,
            textTransform: 'uppercase',
            letterSpacing: 0.8,
            marginBottom: 12,
          }}
        >
          Identificación
        </Text>

        {pet.identification.type === PetIdentificationType.MICROCHIP ? (
          <View>
            <Text style={{ fontSize: 14, color: colors.mutedForeground }}>Microchip</Text>
            <Text style={{ fontSize: 16, fontWeight: '600', color: colors.foreground, marginTop: 2 }}>
              {pet.identification.value ?? 'No registrado'}
            </Text>
          </View>
        ) : pet.identification.type === PetIdentificationType.NONE ? (
          <Text style={{ fontSize: 14, color: colors.mutedForeground }}>
            Sin identificación registrada
          </Text>
        ) : (
          <View>
            <Text style={{ fontSize: 14, color: colors.mutedForeground }}>
              {pet.identification.type}
            </Text>
            <Text style={{ fontSize: 16, fontWeight: '600', color: colors.foreground, marginTop: 2 }}>
              {pet.identification.value ?? 'No registrado'}
            </Text>
          </View>
        )}
      </Card>
    </ScrollView>
  );
}

// ─── Tab: Historial médico ────────────────────────────────────────────────────

function HistorialTab({ petId }: { petId: string }) {
  const { colors } = useTheme();
  const { records, loading, error, refetch } = usePetMedicalHistory(petId);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (loading && !refreshing) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 48 }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const renderRecord = ({ item }: { item: MedicalRecordSummary }) => (
    <TouchableOpacity
      style={{
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: colors.border,
        marginHorizontal: 20,
        marginBottom: 10,
      }}
      activeOpacity={0.8}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
        <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground }}>
          {formatDate(item.createdAt)}
        </Text>
        <Badge variant={item.status === 'FINALIZED' ? 'success' : 'warning'}>
          {item.status === 'FINALIZED' ? 'Finalizado' : 'Borrador'}
        </Badge>
      </View>

      {item.primaryDiagnosisName && (
        <Text style={{ fontSize: 15, color: colors.foreground, marginBottom: 4 }}>
          🩺 {item.primaryDiagnosisName}
        </Text>
      )}

      <View style={{ flexDirection: 'row', gap: 16 }}>
        {item.diagnosisCount > 0 && (
          <Text style={{ fontSize: 12, color: colors.mutedForeground }}>
            {item.diagnosisCount} diagnóstico{item.diagnosisCount !== 1 ? 's' : ''}
          </Text>
        )}
        {item.prescriptionCount > 0 && (
          <Text style={{ fontSize: 12, color: colors.mutedForeground }}>
            {item.prescriptionCount} prescripción{item.prescriptionCount !== 1 ? 'es' : ''}
          </Text>
        )}
        {item.vetFullName && (
          <Text style={{ fontSize: 12, color: colors.mutedForeground }}>
            Dr/a. {item.vetFullName}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={records}
      renderItem={renderRecord}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ paddingVertical: 16 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
      }
      ListEmptyComponent={
        <View style={{ alignItems: 'center', padding: 48 }}>
          <Text style={{ fontSize: 36, marginBottom: 12 }}>📋</Text>
          <Text style={{ fontSize: 15, color: colors.mutedForeground, textAlign: 'center' }}>
            {error ?? 'Sin historial médico registrado'}
          </Text>
        </View>
      }
    />
  );
}

// ─── Tab: Vacunas ─────────────────────────────────────────────────────────────

function VacunasTab({ petId }: { petId: string }) {
  const { colors } = useTheme();
  const { vaccinations, loading, error, refetch } = usePetVaccinations(petId);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (loading && !refreshing) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 48 }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const renderVaccine = ({ item }: { item: VaccinationRecord }) => {
    const isDue =
      item.nextDueDate
        ? new Date(item.nextDueDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        : false;
    const isOverdue = item.nextDueDate ? new Date(item.nextDueDate) < new Date() : false;

    return (
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: 12,
          padding: 14,
          borderWidth: 1,
          borderColor: isOverdue
            ? colors.destructive + '40'
            : isDue
            ? '#FDE68A'
            : colors.border,
          marginHorizontal: 20,
          marginBottom: 10,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
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
            💉 {item.vaccineName}
          </Text>
          {isOverdue ? (
            <Badge variant="destructive">Vencida</Badge>
          ) : isDue ? (
            <Badge variant="warning">Próxima</Badge>
          ) : (
            <Badge variant="success">Al día</Badge>
          )}
        </View>

        {/* Table-style rows */}
        <View style={{ gap: 4 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 12, color: colors.mutedForeground }}>Aplicada</Text>
            <Text style={{ fontSize: 12, color: colors.foreground, fontWeight: '500' }}>
              {formatDate(item.administeredAt)}
            </Text>
          </View>

          {item.nextDueDate && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 12, color: colors.mutedForeground }}>Próxima dosis</Text>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '500',
                  color: isOverdue
                    ? colors.destructive
                    : isDue
                    ? '#92400E'
                    : colors.foreground,
                }}
              >
                {formatDate(item.nextDueDate)}
              </Text>
            </View>
          )}

          {item.manufacturer && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 12, color: colors.mutedForeground }}>Laboratorio</Text>
              <Text style={{ fontSize: 12, color: colors.foreground }}>{item.manufacturer}</Text>
            </View>
          )}

          {item.lotNumber && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 12, color: colors.mutedForeground }}>Lote</Text>
              <Text style={{ fontSize: 12, color: colors.foreground }}>{item.lotNumber}</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <FlatList
      data={vaccinations}
      renderItem={renderVaccine}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ paddingVertical: 16 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
      }
      ListEmptyComponent={
        <View style={{ alignItems: 'center', padding: 48 }}>
          <Text style={{ fontSize: 36, marginBottom: 12 }}>💉</Text>
          <Text style={{ fontSize: 15, color: colors.mutedForeground, textAlign: 'center' }}>
            {error ?? 'Sin vacunas registradas'}
          </Text>
        </View>
      }
    />
  );
}

// ─── Tab: Citas ───────────────────────────────────────────────────────────────

function CitasTab({ petId }: { petId: string }) {
  const { colors } = useTheme();
  const { appointments, loading, error, refetch } = useAppointments(petId);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (loading && !refreshing) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 48 }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <FlatList
      data={appointments}
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
          <Text style={{ fontSize: 36, marginBottom: 12 }}>📅</Text>
          <Text style={{ fontSize: 15, color: colors.mutedForeground, textAlign: 'center' }}>
            {error ?? 'Sin citas registradas'}
          </Text>
        </View>
      }
    />
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function PetDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const { pet, loading } = usePet(id);
  const [activeTab, setActiveTab] = useState<TabKey>('info');

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View
        style={{
          backgroundColor: colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        {/* Back + title row */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: 16,
            gap: 12,
          }}
        >
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ fontSize: 26, color: colors.foreground }}>‹</Text>
          </TouchableOpacity>

          {/* Pet avatar */}
          <View
            style={{
              width: 52,
              height: 52,
              borderRadius: 26,
              backgroundColor: colors.primary + '15',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            {pet?.photoUrl ? (
              <Image
                source={{ uri: pet.photoUrl }}
                style={{ width: 52, height: 52 }}
                contentFit="cover"
              />
            ) : (
              <Text style={{ fontSize: 26 }}>
                {pet ? getSpeciesEmoji(pet.species) : '🐾'}
              </Text>
            )}
          </View>

          <View style={{ flex: 1 }}>
            <Text
              style={{ fontSize: 20, fontWeight: '800', color: colors.foreground }}
            >
              {pet?.name ?? 'Mascota'}
            </Text>
            {pet && (
              <Text style={{ fontSize: 13, color: colors.mutedForeground }}>
                {getSpeciesLabel(pet.species)}
                {pet.weightKg ? ` · ${formatWeight(pet.weightKg)}` : ''}
                {pet.dateOfBirth
                  ? ` · ${getAgeDescription(pet.dateOfBirth)}`
                  : ''}
              </Text>
            )}
          </View>
        </View>

        {/* Tab bar */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            gap: 4,
          }}
          style={{ marginBottom: 0 }}
        >
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor:
                  activeTab === tab.key ? colors.primary : 'transparent',
                marginBottom: 10,
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: '600',
                  color:
                    activeTab === tab.key
                      ? colors.primaryForeground
                      : colors.mutedForeground,
                }}
              >
                {tab.emoji} {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Tab content */}
      <View style={{ flex: 1 }}>
        {activeTab === 'info' && <InfoTab petId={id} />}
        {activeTab === 'historial' && <HistorialTab petId={id} />}
        {activeTab === 'vacunas' && <VacunasTab petId={id} />}
        {activeTab === 'citas' && <CitasTab petId={id} />}
      </View>
    </SafeAreaView>
  );
}
