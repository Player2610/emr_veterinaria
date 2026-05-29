import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/context/theme-context';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { isValidInviteCode } from '@/lib/utils';
import type { ResolveInviteResponse } from '@/lib/api';

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function InviteScreen() {
  const { colors } = useTheme();
  const { resolveInvite, loading, error } = useAuth();

  // We split the 8-char code into individual boxes for UX
  const [digits, setDigits] = useState<string[]>(Array(8).fill(''));
  const [resolvedClinic, setResolvedClinic] = useState<ResolveInviteResponse | null>(null);
  const inputRefs = useRef<Array<TextInput | null>>(Array(8).fill(null));

  const code = digits.join('').toUpperCase();

  const handleDigitChange = (text: string, index: number) => {
    const cleaned = text.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    const newDigits = [...digits];

    if (cleaned.length === 0) {
      newDigits[index] = '';
      setDigits(newDigits);
      if (index > 0) inputRefs.current[index - 1]?.focus();
      return;
    }

    // Handle paste — distribute across boxes
    if (cleaned.length > 1) {
      const chars = cleaned.slice(0, 8).split('');
      chars.forEach((char, i) => {
        if (index + i < 8) newDigits[index + i] = char;
      });
      setDigits(newDigits);
      const nextIndex = Math.min(index + chars.length, 7);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    newDigits[index] = cleaned;
    setDigits(newDigits);
    if (index < 7) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && digits[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResolve = async () => {
    if (!isValidInviteCode(code)) return;

    try {
      const result = await resolveInvite(code);
      setResolvedClinic(result);
    } catch {
      // error is set by useAuth
    }
  };

  const handleContinue = () => {
    router.push('/(auth)/login');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, padding: 24 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Back button */}
          <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 26, color: colors.foreground }}>‹</Text>
          </TouchableOpacity>

          {/* Header */}
          <View style={{ alignItems: 'center', marginBottom: 40 }}>
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 24,
                backgroundColor: colors.accent + '20',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 20,
              }}
            >
              <Text style={{ fontSize: 40 }}>🔗</Text>
            </View>

            <Text
              style={{
                fontSize: 24,
                fontWeight: '800',
                color: colors.foreground,
                marginBottom: 8,
                textAlign: 'center',
              }}
            >
              Código de invitación
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: colors.mutedForeground,
                textAlign: 'center',
                lineHeight: 20,
                paddingHorizontal: 16,
              }}
            >
              Tu veterinario te dio un código de 8 caracteres. Ingresalo para
              vincular tu cuenta con la clínica.
            </Text>
          </View>

          {/* Code input boxes */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 8,
              marginBottom: 32,
            }}
          >
            {digits.map((digit, index) => (
              <TextInput
                key={index}
                ref={(r) => { inputRefs.current[index] = r; }}
                value={digit}
                onChangeText={(text) => handleDigitChange(text, index)}
                onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                maxLength={8}
                autoCapitalize="characters"
                autoCorrect={false}
                style={{
                  width: 36,
                  height: 46,
                  borderWidth: digit ? 2 : 1,
                  borderColor: digit ? colors.primary : colors.border,
                  borderRadius: 8,
                  textAlign: 'center',
                  fontSize: 18,
                  fontWeight: '700',
                  color: colors.foreground,
                  backgroundColor: colors.surface,
                }}
                // Dash separator between groups of 4
                {...(index === 3 ? {} : {})}
              />
            ))}
          </View>

          {/* Error */}
          {error && (
            <View
              style={{
                backgroundColor: colors.destructive + '15',
                borderRadius: 8,
                padding: 12,
                marginBottom: 16,
                borderLeftWidth: 3,
                borderLeftColor: colors.destructive,
              }}
            >
              <Text style={{ fontSize: 13, color: colors.destructive }}>{error}</Text>
            </View>
          )}

          {/* Resolved clinic card */}
          {resolvedClinic && (
            <View
              style={{
                backgroundColor: '#DCFCE7',
                borderRadius: 12,
                padding: 16,
                marginBottom: 20,
                borderWidth: 1,
                borderColor: '#86EFAC',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <Text style={{ fontSize: 28 }}>✅</Text>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: '700',
                    color: '#166534',
                    marginBottom: 2,
                  }}
                >
                  Clínica encontrada
                </Text>
                <Text style={{ fontSize: 14, color: '#15803D' }}>
                  {resolvedClinic.tenantName}
                </Text>
              </View>
            </View>
          )}

          {/* Actions */}
          {!resolvedClinic ? (
            <Button
              onPress={handleResolve}
              loading={loading}
              disabled={code.length < 8}
              fullWidth
              size="lg"
            >
              Verificar código
            </Button>
          ) : (
            <Button onPress={handleContinue} fullWidth size="lg">
              Continuar con {resolvedClinic.tenantName}
            </Button>
          )}

          <Text
            style={{
              fontSize: 12,
              color: colors.mutedForeground,
              textAlign: 'center',
              marginTop: 16,
              lineHeight: 18,
            }}
          >
            El código de invitación es proporcionado por tu clínica veterinaria.
            No compartas este código con otras personas.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
