import { Ionicons } from '@expo/vector-icons';
import { Tabs, router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, Text, View, useWindowDimensions, type ColorValue } from 'react-native';

import { pop, ring, swingLoop, swingOnce } from '@/components/motion';
import { useUnread } from '@/components/Notifier';
import { colors } from '@/components/theme';
import { SideNav } from '@/components/SideNav';
import { GlassBar, type IconName } from '@/components/ui';
import { glassBar, pageBg } from '@/components/theme';
import { isAcademic, useUser } from '@/lib/auth';

function icon(name: IconName) {
  const TabIcon = ({ color, size }: { color: ColorValue; size: number }) => (
    <Ionicons name={name} color={color as string} size={size} />
  );
  return TabIcon;
}

function BellButton() {
  const { data } = useUnread();
  const unread = data?.total ?? 0;
  // Cada vez que sube el número de pendientes, la campana da un balanceo fuerte
  const prev = useRef(unread);
  const [burst, setBurst] = useState(0);
  useEffect(() => {
    if (unread > prev.current) setBurst((b) => b + 1);
    prev.current = unread;
  }, [unread]);

  return (
    <Pressable onPress={() => router.push('/notificaciones')} style={{ marginRight: 16, padding: 4 }} accessibilityLabel={`Notificaciones${unread ? `, ${unread} sin leer` : ''}`}>
      {unread > 0 && <View style={[{ position: 'absolute', top: 2, left: 2, width: 32, height: 32, borderRadius: 16, backgroundColor: colors.accent }, ring(0)]} />}
      {/* Exterior: balanceo suave y periódico mientras haya pendientes. Interior: balanceo fuerte al llegar algo nuevo */}
      <View style={unread > 0 ? swingLoop() : undefined}>
        <View key={burst} style={burst > 0 ? swingOnce() : undefined}>
          <Ionicons name={unread > 0 ? 'notifications' : 'notifications-outline'} size={26} color={unread > 0 ? colors.primary : colors.text} />
        </View>
      </View>
      {unread > 0 && (
        <View
          key={unread}
          style={[{
            position: 'absolute', top: -2, right: -6, backgroundColor: colors.accent, borderRadius: 10,
            minWidth: 20, height: 20, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5,
            borderWidth: 2, borderColor: '#fff',
          }, pop(0, 450)]}
        >
          <Text style={{ color: '#fff', fontSize: 11, fontWeight: '800' }}>{unread > 99 ? '99+' : unread}</Text>
        </View>
      )}
    </Pressable>
  );
}

export default function TabsLayout() {
  const user = useUser();
  const academic = isAcademic(user);
  // En pantallas anchas (computadora) el menú va a la izquierda; en celular, abajo
  const wide = useWindowDimensions().width >= 900;

  return (
    <Tabs
      tabBar={wide ? (props: any) => <SideNav {...props} /> : undefined}
      screenOptions={{
        tabBarPosition: wide ? 'left' : 'bottom',
        headerShadowVisible: false,
        headerStyle: { backgroundColor: 'transparent' },
        headerBackground: () => <GlassBar />,
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '700' },
        headerRight: () => <BellButton />,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontSize: wide ? 15 : 11, fontWeight: '600' },
        tabBarStyle: wide
          ? { width: 230, paddingTop: 14, paddingHorizontal: 10, borderRightWidth: 1, ...glassBar }
          : { height: 74, paddingTop: 8, paddingBottom: 12, borderTopWidth: 1, position: 'absolute' as const, ...glassBar },
        tabBarVariant: wide ? 'material' : 'uikit',
        tabBarLabelPosition: wide ? 'beside-icon' : 'below-icon',
        tabBarActiveBackgroundColor: wide ? colors.primarySoft : undefined,
        sceneStyle: pageBg,
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Inicio', tabBarIcon: icon('home-outline') }} />
      <Tabs.Screen name="retos" options={{ title: 'Problemáticas', tabBarLabel: wide ? 'Problemáticas' : 'Problemas', tabBarIcon: icon('bulb-outline') }} />
      <Tabs.Screen
        name="equipos"
        options={{ title: 'Equipos', tabBarIcon: icon('people-outline'), href: academic ? undefined : null }}
      />
      <Tabs.Screen name="capacidades" options={{ title: 'Capacidades', tabBarIcon: icon('flask-outline') }} />
      <Tabs.Screen name="perfil" options={{ title: 'Perfil', tabBarIcon: icon('person-circle-outline') }} />
    </Tabs>
  );
}
