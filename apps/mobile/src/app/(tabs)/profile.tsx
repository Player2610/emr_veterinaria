import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/context/theme-context';
import { useAuth } from '@/hooks/use-auth';
import { Avatar } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';

// ─── Section row ──────────────────────────────────────────────────────────────

function ProfileRow({
  icon,
  label,
  value,
  onPress,
  destructive = false,
  rightElement,
  colors,
}: {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
  destructive?: boolean;
  rightElement?: React.ReactNode;
  colors: ReturnType<typeof useTheme>['colors'];
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress && !rightElement}
      activeOpacity={onPress ? 0.7 : 1}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        gap: 14,
      }}
    >
      <View
        style={{
          width: 34,
          height: 34,
          borderRadius: 8,
          backgroundColor: destructive ? colors.destructive + '15' : colors.primary + '15',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ fontSize: 16 }}>{icon}</Text>
      </View>

      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 15,
            color: destructive ? colors.destructive : colors.foreground,
            fontWeight: '500',
          }}
        >
          {label}
        </Text>
        {value && (
          <Text style={{ fontSize: 13, color: colors.mutedForeground, marginTop: 1 }}>
            {value}
          </Text>
        )}
      </View>

      {rightElement ?? (onPress ? (
        <Text style={{ fontSize: 18, color: colors.mutedForeground }}>›</Text>
      ) : null)}
    </TouchableOpacity>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const { colors, clinicName, logoUrl } = useTheme();
  const { user, logout } = useAuth();

  const [notifAppointments, setNotifAppointments] = useState(true);
  const [notifVaccines, setNotifVaccines] = useState(true);
  const [notifReminders, setNotifReminders] = useState(true);

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro que querés salir?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };

  const fullName = user
    ? `${user.firstName} ${user.lastName}`
    : 'Usuario';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 20 }}>
        {/* Header */}
        <View
          style={{
            alignItems: 'center',
            paddingVertical: 16,
            gap: 12,
          }}
        >
          <Avatar name={fullName} size="xl" />

          <View style={{ alignItems: 'center' }}>
            <Text
              style={{
                fontSize: 22,
                fontWeight: '800',
                color: colors.foreground,
              }}
            >
              {fullName}
            </Text>
            {user?.email && (
              <Text
                style={{
                  fontSize: 14,
                  color: colors.mutedForeground,
                  marginTop: 2,
                }}
              >
                {user.email}
              </Text>
            )}
          </View>

          {/* Clinic badge */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              backgroundColor: colors.primary + '15',
              borderRadius: 20,
              paddingHorizontal: 14,
              paddingVertical: 6,
            }}
          >
            <Text style={{ fontSize: 14 }}>🏥</Text>
            <Text
              style={{
                fontSize: 13,
                fontWeight: '600',
                color: colors.primary,
              }}
            >
              {clinicName}
            </Text>
          </View>
        </View>

        {/* Account section */}
        <View>
          <Text
            style={{
              fontSize: 12,
              fontWeight: '700',
              color: colors.mutedForeground,
              textTransform: 'uppercase',
              letterSpacing: 0.8,
              marginBottom: 8,
            }}
          >
            Mi cuenta
          </Text>
          <Card noPadding style={{ paddingHorizontal: 16 }}>
            <ProfileRow
              icon="✏️"
              label="Editar perfil"
              onPress={() => {}}
              colors={colors}
            />
            <ProfileRow
              icon="🔒"
              label="Cambiar contraseña"
              onPress={() => {}}
              colors={colors}
            />
            <ProfileRow
              icon="📱"
              label="Teléfono"
              value="No configurado"
              onPress={() => {}}
              colors={colors}
            />
          </Card>
        </View>

        {/* Notifications */}
        <View>
          <Text
            style={{
              fontSize: 12,
              fontWeight: '700',
              color: colors.mutedForeground,
              textTransform: 'uppercase',
              letterSpacing: 0.8,
              marginBottom: 8,
            }}
          >
            Notificaciones
          </Text>
          <Card noPadding style={{ paddingHorizontal: 16 }}>
            <ProfileRow
              icon="📅"
              label="Recordatorios de citas"
              colors={colors}
              rightElement={
                <Switch
                  value={notifAppointments}
                  onValueChange={setNotifAppointments}
                  trackColor={{ true: colors.primary }}
                />
              }
            />
            <ProfileRow
              icon="💉"
              label="Recordatorios de vacunas"
              colors={colors}
              rightElement={
                <Switch
                  value={notifVaccines}
                  onValueChange={setNotifVaccines}
                  trackColor={{ true: colors.primary }}
                />
              }
            />
            <ProfileRow
              icon="🔔"
              label="Avisos generales"
              colors={colors}
              rightElement={
                <Switch
                  value={notifReminders}
                  onValueChange={setNotifReminders}
                  trackColor={{ true: colors.primary }}
                />
              }
            />
          </Card>
        </View>

        {/* Clinic section */}
        <View>
          <Text
            style={{
              fontSize: 12,
              fontWeight: '700',
              color: colors.mutedForeground,
              textTransform: 'uppercase',
              letterSpacing: 0.8,
              marginBottom: 8,
            }}
          >
            Clínica
          </Text>
          <Card noPadding style={{ paddingHorizontal: 16 }}>
            <ProfileRow
              icon="🏥"
              label={clinicName}
              value="Clínica vinculada"
              colors={colors}
            />
            <ProfileRow
              icon="🔗"
              label="Vincular otra clínica"
              onPress={() => {}}
              colors={colors}
            />
          </Card>
        </View>

        {/* Support */}
        <View>
          <Text
            style={{
              fontSize: 12,
              fontWeight: '700',
              color: colors.mutedForeground,
              textTransform: 'uppercase',
              letterSpacing: 0.8,
              marginBottom: 8,
            }}
          >
            Soporte
          </Text>
          <Card noPadding style={{ paddingHorizontal: 16 }}>
            <ProfileRow
              icon="❓"
              label="Ayuda y preguntas frecuentes"
              onPress={() => {}}
              colors={colors}
            />
            <ProfileRow
              icon="📋"
              label="Términos y condiciones"
              onPress={() => {}}
              colors={colors}
            />
            <ProfileRow
              icon="🔐"
              label="Política de privacidad"
              onPress={() => {}}
              colors={colors}
            />
          </Card>
        </View>

        {/* Logout */}
        <Card noPadding style={{ paddingHorizontal: 16 }}>
          <ProfileRow
            icon="👋"
            label="Cerrar sesión"
            onPress={handleLogout}
            destructive
            colors={colors}
          />
        </Card>

        {/* App version */}
        <Text
          style={{
            fontSize: 12,
            color: colors.mutedForeground,
            textAlign: 'center',
            marginTop: 8,
            marginBottom: 16,
          }}
        >
          EMR Vet v1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
