import React from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/context/theme-context';
import { usePets } from '@/hooks/use-pets';
import { PetCard } from '@/components/pets/pet-card';
import type { PetSummary } from '@emr/shared';

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function PetsScreen() {
  const { colors } = useTheme();
  const { pets, loading, error, refetch } = usePets();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const renderItem = ({ item }: { item: PetSummary }) => (
    <PetCard
      pet={item}
      onPress={() => router.push(`/(tabs)/pets/${item.id}`)}
      style={{ marginHorizontal: 20, marginBottom: 12 }}
    />
  );

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
        <Text style={{ fontSize: 22, fontWeight: '800', color: colors.foreground }}>
          Mis mascotas
        </Text>
        {!loading && (
          <Text style={{ fontSize: 13, color: colors.mutedForeground, marginTop: 2 }}>
            {pets.length} {pets.length === 1 ? 'mascota' : 'mascotas'}
          </Text>
        )}
      </View>

      {/* Content */}
      {loading && !refreshing ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error ? (
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            padding: 32,
          }}
        >
          <Text style={{ fontSize: 36, marginBottom: 12 }}>😿</Text>
          <Text
            style={{
              fontSize: 15,
              color: colors.mutedForeground,
              textAlign: 'center',
            }}
          >
            {error}
          </Text>
        </View>
      ) : (
        <FlatList
          data={pets}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 32 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                padding: 48,
              }}
            >
              <Text style={{ fontSize: 48, marginBottom: 16 }}>🐾</Text>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: colors.foreground,
                  marginBottom: 8,
                }}
              >
                Sin mascotas aún
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: colors.mutedForeground,
                  textAlign: 'center',
                }}
              >
                Tu veterinario registrará a tus mascotas en el sistema.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
