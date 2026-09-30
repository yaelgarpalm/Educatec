import { Ionicons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { useAction, useApi } from '@/components/hooks';
import { api } from '@/lib/api';
import { browserNotifications, toRoute } from '@/lib/notifications';
import type { Notification, Page } from '@/lib/types';
import { drain, slideIn, smooth } from './motion';
import { colors, glassStrong } from './theme';

/** Notificaciones sin leer (se comparte entre la campanita y los avisos: una sola consulta cada 5 s). */
export function useUnread() {
  return useApi<Page<Notification>>('/users/me/notifications', { unread_only: true, size: 20 }, { refetchInterval: 5_000 });
}

type Toast = { id: number; title: string; body: string | null; link: string | null };
const SECONDS = 7;

/**
 * Detecta notificaciones nuevas (mensajes, postulaciones, hitos…) y las muestra como avisos
 * emergentes; además pone el número en el título de la pestaña y, si diste permiso, avisa
 * desde el navegador cuando la pestaña está en segundo plano.
 */
export function Notifier() {
  const { data } = useUnread();
  const pathname = usePathname();
  const [toasts, setToasts] = useState<Toast[]>([]);
  const baseline = useRef<number | null>(null); // id más alto que ya existía al abrir la app
  const seen = useRef(new Set<number>());
  const readOne = useAction((nid: number) => api.post(`/users/me/notifications/${nid}/read`));

  const dismiss = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  useEffect(() => {
    if (!data) return;
    const items = data.items;
    const maxId = items.reduce((m, n) => Math.max(m, n.id), 0);
    if (baseline.current === null) { baseline.current = maxId; return; } // primera carga: sin avisos

    const fresh = items.filter((n) => n.id > (baseline.current ?? 0) && !seen.current.has(n.id)).sort((a, b) => a.id - b.id);
    fresh.forEach((n) => seen.current.add(n.id));
    if (!fresh.length) return;

    // Si ya estás viendo ese chat, no hace falta avisar (y se marca como leído)
    const shown = fresh.filter((n) => {
      const r = toRoute(n.link);
      if (typeof r === 'string' && r === pathname) { readOne.mutate(n.id); return false; }
      return true;
    });
    if (!shown.length) return;

    setToasts((t) => [...t, ...shown.slice(-3).map((n) => ({ id: n.id, title: n.title, body: n.body, link: n.link }))].slice(-3));
    shown.slice(-3).forEach((n) => setTimeout(() => dismiss(n.id), SECONDS * 1000));

    if (Platform.OS === 'web' && typeof document !== 'undefined' && document.hidden) {
      const last = shown[shown.length - 1];
      browserNotifications.show(last.title, last.body, () => { const r = toRoute(last.link); if (r) router.push(r); });
    }
  }, [data, pathname, dismiss, readOne]);

  // Número de pendientes en el título de la pestaña: "(3) VinculaTec"
  const unread = data?.total ?? 0;
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    document.title = unread > 0 ? `(${unread > 99 ? '99+' : unread}) VinculaTec` : 'VinculaTec';
  }, [unread]);

  const open = (t: Toast) => {
    dismiss(t.id);
    readOne.mutate(t.id);
    const r = toRoute(t.link);
    if (r) router.push(r);
  };

  if (!toasts.length) return null;
  return (
    <View pointerEvents="box-none" style={s.host}>
      {toasts.map((t) => (
        <View key={t.id} style={[s.toast, slideIn(), smooth]}>
          <Pressable onPress={() => open(t)} style={s.row} accessibilityRole="button" accessibilityLabel={t.title}>
            <View style={s.icon}>
              <Ionicons name={t.title.toLowerCase().includes('mensaje') ? 'chatbubble-ellipses' : 'notifications'} size={20} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text numberOfLines={1} style={s.title}>{t.title}</Text>
              {!!t.body && <Text numberOfLines={2} style={s.body}>{t.body}</Text>}
              <Text style={s.cta}>Toca para abrir</Text>
            </View>
            <Pressable onPress={() => dismiss(t.id)} hitSlop={10} accessibilityLabel="Cerrar aviso">
              <Ionicons name="close" size={18} color={colors.muted} />
            </Pressable>
          </Pressable>
          <View style={s.track}><View style={[s.bar, drain(SECONDS)]} /></View>
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  host: { position: 'absolute', top: 70, right: 16, width: 360, maxWidth: '92%', gap: 10, zIndex: 50 } as any,
  toast: { borderRadius: 18, borderWidth: 1, overflow: 'hidden', ...glassStrong } as any,
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 14 },
  icon: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  title: { fontWeight: '800', color: colors.text, fontSize: 14.5 },
  body: { color: colors.muted, fontSize: 13, marginTop: 2, lineHeight: 18 },
  cta: { color: colors.primary, fontSize: 12, fontWeight: '700', marginTop: 4 },
  track: { height: 3, backgroundColor: 'rgba(91,91,214,0.12)' },
  bar: { height: 3, width: '100%', backgroundColor: colors.primary },
});
