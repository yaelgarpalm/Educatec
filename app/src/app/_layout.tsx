import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Platform, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { DialogHost } from '@/components/dialogs';
import '@/lib/webStyle';
import { colors, pageBg } from '@/components/theme';
import { GlassBar, Loading } from '@/components/ui';
import { AuthProvider, useAuth } from '@/lib/auth';

/** En el dominio real siempre se usa https (y sin "www"), para que el API acepte la conexión. */
if (Platform.OS === 'web' && typeof window !== 'undefined') {
  const { protocol, hostname, pathname, search, hash } = window.location;
  if (hostname.endsWith('vinculatec.online') && (protocol === 'http:' || hostname.startsWith('www.'))) {
    window.location.replace(`https://vinculatec.online${pathname}${search}${hash}`);
  }
}

/** Tema de navegación transparente: deja ver el fondo degradado que hay detrás del vidrio. */
const navTheme = { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: 'transparent', card: 'transparent', border: 'transparent', primary: colors.primary, text: colors.text } };

function RootNavigator() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', backgroundColor: colors.bg }}>
        <Loading />
      </View>
    );
  }
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: 'transparent' },
        headerBackground: () => <GlassBar />,
        headerShadowVisible: false,
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: pageBg,
        headerBackTitle: 'Atrás',
      }}
    >
      {/* Rutas públicas: solo sin sesión */}
      <Stack.Protected guard={!user}>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="registro" options={{ title: 'Crear cuenta' }} />
      </Stack.Protected>

      {/* Rutas privadas: solo con sesión */}
      <Stack.Protected guard={!!user}>
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const [client] = useState(
    () => new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 15_000 } } }),
  );
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={client}>
        <AuthProvider>
          <StatusBar style="dark" />
          <ThemeProvider value={navTheme}>
            <RootNavigator />
          </ThemeProvider>
          <DialogHost />
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
