import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { pop, rise, smooth } from './motion';
import { colors, glassBar, gradients } from './theme';
import { useAuth } from '@/lib/auth';
import { label } from '@/lib/format';

const ITEM_H = 50;
const GAP = 6;

/**
 * Menú lateral animado (pantallas anchas): entra en cascada, un "resaltador" se desliza
 * hasta la opción elegida y los iconos reaccionan al pasar el cursor.
 */
export function SideNav({ state, descriptors, navigation }: any) {
  const { user } = useAuth();
  const [hover, setHover] = useState<string | null>(null);

  // Solo las pestañas visibles (las ocultas traen display: none)
  const routes = state.routes.filter((r: any) => descriptors[r.key].options.tabBarItemStyle?.display !== 'none');
  const activeKey = state.routes[state.index]?.key;
  const activeIndex = Math.max(0, routes.findIndex((r: any) => r.key === activeKey));

  return (
    <View style={[s.wrap, glassBar]}>
      {/* Marca */}
      <View style={[s.brand, rise(0, -14, 500, 'x')]}>
        <View style={[s.logo, pop(150)]}>
          <Ionicons name="git-network-outline" size={20} color="#fff" />
        </View>
        <Text style={s.brandText}>VinculaTec</Text>
      </View>

      {/* Opciones */}
      <View style={{ position: 'relative', gap: GAP }}>
        {/* Resaltador que se desliza entre opciones */}
        <View style={[s.pill, smooth, { top: activeIndex * (ITEM_H + GAP) }] as any} />

        {routes.map((route: any, i: number) => {
          const { options } = descriptors[route.key];
          const focused = route.key === activeKey;
          const hovered = hover === route.key;
          const title = (typeof options.tabBarLabel === 'string' ? options.tabBarLabel : options.title) ?? route.name;
          const color = focused ? '#fff' : hovered ? colors.primary : colors.muted;

          const go = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) navigation.navigate(route.name, route.params);
          };

          return (
            <View key={route.key} style={rise(220 + i * 90, -26, 560, 'x')}>
              <Pressable
                onPress={go}
                onHoverIn={() => setHover(route.key)}
                onHoverOut={() => setHover((h) => (h === route.key ? null : h))}
                accessibilityRole="tab"
                accessibilityState={{ selected: focused }}
                accessibilityLabel={title}
                style={({ pressed }) => [
                  s.item, smooth,
                  hovered && !focused && ({ backgroundColor: 'rgba(91,91,214,0.10)', transform: [{ translateX: 5 }] } as any),
                  pressed && { transform: [{ scale: 0.97 }] },
                ]}
              >
                <View style={[smooth, hovered || focused ? { transform: [{ scale: 1.18 }, { rotate: focused ? '0deg' : '-8deg' }] } : null]}>
                  {options.tabBarIcon?.({ focused, color, size: 22 })}
                </View>
                <Text style={[s.itemText, { color, fontWeight: focused ? '800' : '600' }]}>{title}</Text>
              </Pressable>
            </View>
          );
        })}
      </View>

      {/* Usuario */}
      <View style={{ flex: 1 }} />
      {!!user && (
        <View style={[s.user, rise(800, 14, 560)]}>
          <View style={s.avatar}>
            <Text style={{ color: '#fff', fontWeight: '800' }}>{user.full_name.trim().charAt(0).toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text numberOfLines={1} style={{ fontWeight: '700', color: colors.text, fontSize: 14 }}>{user.full_name}</Text>
            <Text numberOfLines={1} style={{ color: colors.muted, fontSize: 12.5 }}>{label(user.role)}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { width: 240, paddingTop: 18, paddingHorizontal: 12, paddingBottom: 16, borderRightWidth: 1 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 8, marginBottom: 22 },
  logo: {
    width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.primary, backgroundImage: gradients.brand, boxShadow: '0 6px 16px rgba(91,91,214,0.4)',
  } as any,
  brandText: { fontSize: 18, fontWeight: '800', color: colors.text, letterSpacing: -0.3 },
  pill: {
    position: 'absolute', left: 0, right: 0, height: ITEM_H, borderRadius: 14, backgroundColor: colors.primary,
    backgroundImage: gradients.brand, boxShadow: '0 8px 22px rgba(91,91,214,0.38)',
  } as any,
  item: { height: ITEM_H, flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16, borderRadius: 14 },
  itemText: { fontSize: 15.5 },
  user: {
    flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.55)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)',
  },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
});
