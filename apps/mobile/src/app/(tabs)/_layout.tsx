import React from 'react';
import { Tabs } from 'expo-router';
import { Text, View } from 'react-native';
import { useTheme } from '@/context/theme-context';

// ─── Tab icon ─────────────────────────────────────────────────────────────────

function TabIcon({
  emoji,
  focused,
  color,
}: {
  emoji: string;
  focused: boolean;
  color: string;
}) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: focused ? 24 : 22, opacity: focused ? 1 : 0.6 }}>
        {emoji}
      </Text>
    </View>
  );
}

// ─── Layout ───────────────────────────────────────────────────────────────────

export default function TabsLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingBottom: 4,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon emoji="🏠" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="pets"
        options={{
          title: 'Mascotas',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon emoji="🐾" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="appointments"
        options={{
          title: 'Citas',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon emoji="📅" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon emoji="👤" focused={focused} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
