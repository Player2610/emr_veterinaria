import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { isAuthenticated } from '@/lib/auth';
import { useTheme } from '@/context/theme-context';

/**
 * Entry point — redirects to (auth)/login or (tabs)/ depending on session state.
 * Shows a brief loading spinner while checking SecureStore.
 */
export default function Index() {
  const { colors } = useTheme();
  const [destination, setDestination] = React.useState<'auth' | 'tabs' | null>(null);

  useEffect(() => {
    isAuthenticated()
      .then((authenticated) => {
        setDestination(authenticated ? 'tabs' : 'auth');
      })
      .catch(() => {
        setDestination('auth');
      });
  }, []);

  if (destination === null) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (destination === 'tabs') {
    return <Redirect href="/(tabs)/" />;
  }

  return <Redirect href="/(auth)/login" />;
}
