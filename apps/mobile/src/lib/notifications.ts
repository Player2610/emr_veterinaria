import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { savePushToken } from './auth';
import { registerPushToken } from './api';

// ─── Notification handler (foreground behavior) ───────────────────────────────

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// ─── Permission + registration ────────────────────────────────────────────────

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#2563EB',
    });

    await Notifications.setNotificationChannelAsync('appointments', {
      name: 'Citas',
      description: 'Recordatorios y confirmaciones de citas',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    });

    await Notifications.setNotificationChannelAsync('vaccinations', {
      name: 'Vacunaciones',
      description: 'Recordatorios de próximas vacunas',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === 'granted';
}

export async function getExpoPushToken(): Promise<string | null> {
  try {
    const token = await Notifications.getExpoPushTokenAsync({
      projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID,
    });
    return token.data;
  } catch {
    return null;
  }
}

/**
 * Full setup: request permissions, get token, persist locally, register with backend.
 * Call this once after successful login.
 */
export async function setupPushNotifications(): Promise<void> {
  const granted = await requestNotificationPermissions();
  if (!granted) return;

  const token = await getExpoPushToken();
  if (!token) return;

  await savePushToken(token);

  try {
    await registerPushToken(token);
  } catch {
    // Non-fatal — token registration will retry on next login
  }
}

// ─── Listeners ────────────────────────────────────────────────────────────────

export type NotificationListener = (
  notification: Notifications.Notification
) => void;

export type NotificationResponseListener = (
  response: Notifications.NotificationResponse
) => void;

export function addNotificationReceivedListener(
  handler: NotificationListener
): Notifications.Subscription {
  return Notifications.addNotificationReceivedListener(handler);
}

export function addNotificationResponseListener(
  handler: NotificationResponseListener
): Notifications.Subscription {
  return Notifications.addNotificationResponseReceivedListener(handler);
}

// ─── Badge ────────────────────────────────────────────────────────────────────

export async function setBadgeCount(count: number): Promise<void> {
  await Notifications.setBadgeCountAsync(count);
}

export async function clearBadge(): Promise<void> {
  await Notifications.setBadgeCountAsync(0);
}
