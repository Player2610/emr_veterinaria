import '../global.css';
import React, { useEffect, useRef } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import { ThemeProvider, useTheme } from '@/context/theme-context';
import {
  addNotificationReceivedListener,
  addNotificationResponseListener,
} from '@/lib/notifications';

// ─── Inner layout (has access to ThemeContext) ────────────────────────────────

function RootLayoutNav() {
  const { colors } = useTheme();
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  useEffect(() => {
    notificationListener.current = addNotificationReceivedListener((_notification) => {
      // Notification received while app is foregrounded
      // Could update a badge counter here
    });

    responseListener.current = addNotificationResponseListener((response) => {
      // User tapped a notification
      const data = response.notification.request.content.data as Record<string, unknown>;

      // Route based on notification type
      if (data?.type === 'appointment' && data?.appointmentId) {
        // router.push(`/(tabs)/appointments`);
      } else if (data?.type === 'vaccination' && data?.petId) {
        // router.push(`/(tabs)/pets/${data.petId}`);
      }
    });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  return (
    <>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
      </Stack>
    </>
  );
}

// ─── Root layout ──────────────────────────────────────────────────────────────

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <RootLayoutNav />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
