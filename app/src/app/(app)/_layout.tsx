import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { Pressable, Text } from 'react-native';

import { colors, pageBg } from '@/components/theme';
import { Notifier } from '@/components/Notifier';
import { GlassBar } from '@/components/ui';
import { goHome } from '@/lib/format';

function HomeButton() {
  return (
    <Pressable onPress={goHome} accessibilityLabel="Ir al inicio" hitSlop={6}
      style={({ pressed }) => ({
        flexDirection: 'row', alignItems: 'center', gap: 6, marginRight: 12, paddingVertical: 6, paddingHorizontal: 12,
        borderRadius: 999, backgroundColor: pressed ? 'rgba(91,91,214,0.22)' : 'rgba(91,91,214,0.12)',
      })}>
      <Ionicons name="home-outline" size={17} color={colors.primary} />
      <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 14 }}>Inicio</Text>
    </Pressable>
  );
}

/** Todas las pantallas que requieren sesión. */
export default function AppLayout() {
  return (
    <>
      <Notifier />
      <Stack
      screenOptions={{
        headerStyle: { backgroundColor: 'transparent' },
        headerBackground: () => <GlassBar />,
        headerShadowVisible: false,
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: pageBg,
        headerBackTitle: 'Atrás',
        headerRight: () => <HomeButton />,
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}
