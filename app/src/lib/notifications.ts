import type { Href } from 'expo-router';

/** El backend genera rutas en español (/retos/5/hitos); aquí se traducen a las pantallas de la app. */
export function toRoute(link: string | null): Href | null {
  if (!link) return null;
  let m = link.match(/^\/retos\/(\d+)(?:\/(\w+))?/);
  if (m) {
    const ok = ['postulaciones', 'hitos', 'videollamada', 'chat'];
    const sub = m[2] && ok.includes(m[2]) ? `/${m[2]}` : '';
    return `/reto/${m[1]}${sub}` as Href;
  }
  if ((m = link.match(/^\/equipos\/(\d+)/))) return `/equipo/${m[1]}` as Href;
  if ((m = link.match(/^\/perfil\/(\d+)/))) return `/usuario/${m[1]}` as Href;
  return null;
}

/** Avisos del sistema (fuera de la pestaña). Solo web y solo si la persona dio permiso. */
export const browserNotifications = {
  supported: () => typeof window !== 'undefined' && 'Notification' in window,
  permission: (): 'granted' | 'denied' | 'default' | 'unsupported' =>
    typeof window !== 'undefined' && 'Notification' in window ? (Notification.permission as any) : 'unsupported',
  request: async () => (typeof window !== 'undefined' && 'Notification' in window ? Notification.requestPermission() : 'denied'),
  show(title: string, body?: string | null, onClick?: () => void) {
    if (this.permission() !== 'granted') return;
    try {
      const n = new Notification(title, { body: body ?? undefined, icon: '/favicon.ico', tag: 'vinculatec' });
      n.onclick = () => { window.focus(); onClick?.(); n.close(); };
    } catch { /* algunos navegadores lo bloquean */ }
  },
};
