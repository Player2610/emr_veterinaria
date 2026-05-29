import React from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/context/theme-context';
import { usePets } from '@/hooks/use-pets';
import { useUpcomingAppointments } from '@/hooks/use-appointments';
import { PetCard } from '@/components/pets/pet-card';
import { AppointmentItem } from '@/components/appointments/appointment-item';
import { Card } from '@/components/ui/card';

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const { colors, clinicName } = useTheme();
  const { pets, loading: petsLoading, refetch: refetchPets } = usePets();
  const {
    appointments,
    loading: apptLoading,
    refetch: refetchAppts,
  } = useUpcomingAppointments();

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchPets(), refetchAppts()]);
    setRefreshing(false);
  };

  const nextAppointment = appointments[0] ?? null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{ padding: 20, gap: 24 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting */}
        <View style={{ marginBottom: 4 }}>
          <Text style={{ fontSize: 22, fontWeight: '800', color: colors.foreground }}>
            ¡Hola! 👋
          </Text>
          <Text style={{ fontSize: 14, color: colors.mutedForeground, marginTop: 2 }}>
            {clinicName}
          </Text>
        </View>

        {/* Next appointment banner */}
        {!apptLoading && nextAppointment && (
          <View>
            <Text
              style={{
                fontSize: 13,
                fontWeight: '700',
                color: colors.mutedForeground,
                textTransform: 'uppercase',
                letterSpacing: 0.8,
                marginBottom: 10,
              }}
            >
              Próxima cita
            </Text>
            <AppointmentItem
              appointment={nextAppointment}
              onPress={() => router.push('/(tabs)/appointments')}
            />
          </View>
        )}

        {/* Pets section */}
        <View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: '700',
                color: colors.mutedForeground,
                textTransform: 'uppercase',
                letterSpacing: 0.8,
              }}
            >
              Mis mascotas
            </Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/pets')}>
              <Text style={{ fontSize: 13, color: colors.primary, fontWeight: '600' }}>
                Ver todas
              </Text>
            </TouchableOpacity>
          </View>

          {petsLoading ? (
            <ActivityIndicator color={colors.primary} />
          ) : pets.length === 0 ? (
            <Card>
              <View style={{ alignItems: 'center', paddingVertical: 16 }}>
                <Text style={{ fontSize: 36, marginBottom: 8 }}>🐾</Text>
                <Text
                  style={{
                    fontSize: 15,
                    color: colors.mutedForeground,
                    textAlign: 'center',
                  }}
                >
                  Aún no hay mascotas registradas.
                  {'\n'}Tu veterinario las agregará al sistema.
                </Text>
              </View>
            </Card>
          ) : (
            <View style={{ gap: 12 }}>
              {pets.slice(0, 3).map((pet) => (
                <PetCard
                  key={pet.id}
                  pet={pet}
                  onPress={() => router.push(`/(tabs)/pets/${pet.id}`)}
                />
              ))}
            </View>
          )}
        </View>

        {/* Quick actions */}
        <View>
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
            Acciones rápidas
          </Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/appointments')}
              style={{
                flex: 1,
                backgroundColor: colors.primary + '15',
                borderRadius: 14,
                padding: 16,
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Text style={{ fontSize: 28 }}>📅</Text>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: '600',
                  color: colors.primary,
                  textAlign: 'center',
                }}
              >
                Pedir turno
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/(tabs)/pets')}
              style={{
                flex: 1,
                backgroundColor: colors.accent + '15',
                borderRadius: 14,
                padding: 16,
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Text style={{ fontSize: 28 }}>🐾</Text>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: '600',
                  color: colors.accent,
                  textAlign: 'center',
                }}
              >
                Ver historial
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
