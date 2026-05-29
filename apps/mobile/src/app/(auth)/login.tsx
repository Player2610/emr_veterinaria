import React from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { Link } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/context/theme-context';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// ─── Schema ───────────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

type LoginForm = z.infer<typeof loginSchema>;

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function LoginScreen() {
  const { colors, clinicName, logoUrl } = useTheme();
  const { login, loading, error } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginForm) => {
    await login(data);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            padding: 24,
          }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={{ alignItems: 'center', marginBottom: 40 }}>
            <View
              style={{
                width: 72,
                height: 72,
                borderRadius: 20,
                backgroundColor: colors.primary + '20',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
              }}
            >
              <Text style={{ fontSize: 36 }}>🐾</Text>
            </View>
            <Text
              style={{
                fontSize: 26,
                fontWeight: '800',
                color: colors.foreground,
                marginBottom: 6,
              }}
            >
              Bienvenido
            </Text>
            <Text style={{ fontSize: 15, color: colors.mutedForeground, textAlign: 'center' }}>
              Ingresá a {clinicName} para ver tus mascotas
            </Text>
          </View>

          {/* Form */}
          <View style={{ gap: 4 }}>
            {error && (
              <View
                style={{
                  backgroundColor: colors.destructive + '15',
                  borderRadius: 8,
                  padding: 12,
                  marginBottom: 8,
                  borderLeftWidth: 3,
                  borderLeftColor: colors.destructive,
                }}
              >
                <Text style={{ fontSize: 13, color: colors.destructive }}>
                  {error}
                </Text>
              </View>
            )}

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Email"
                  placeholder="tu@email.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.email?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Contraseña"
                  placeholder="••••••••"
                  secureTextEntry
                  autoComplete="password"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.password?.message}
                />
              )}
            />

            <Button
              onPress={handleSubmit(onSubmit)}
              loading={loading}
              fullWidth
              size="lg"
              style={{ marginTop: 8 }}
            >
              Iniciar sesión
            </Button>
          </View>

          {/* Footer links */}
          <View style={{ alignItems: 'center', marginTop: 24, gap: 12 }}>
            <Link href="/(auth)/register" asChild>
              <TouchableOpacity>
                <Text style={{ fontSize: 14, color: colors.mutedForeground }}>
                  ¿No tenés cuenta?{' '}
                  <Text style={{ color: colors.primary, fontWeight: '600' }}>
                    Registrate
                  </Text>
                </Text>
              </TouchableOpacity>
            </Link>

            <Link href="/(auth)/invite" asChild>
              <TouchableOpacity>
                <Text style={{ fontSize: 14, color: colors.primary, fontWeight: '600' }}>
                  Tengo un código de invitación
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
