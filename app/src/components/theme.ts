import { Platform } from 'react-native';

/** Paleta "aurora": índigo con acentos coral y turquesa, sobre un fondo degradado claro. */
export const colors = {
  primary: '#5B5BD6',
  primaryDark: '#3E3FA8',
  primarySoft: '#ECECFF',
  accent: '#F0673F',
  accentSoft: '#FFEDE6',
  success: '#0E8F7E',
  successSoft: '#DDF6F1',
  danger: '#D93B45',
  dangerSoft: '#FDEBEC',
  warning: '#9A6500',
  warningSoft: '#FFF3D6',
  text: '#15142E',
  muted: '#5E5B79',
  border: '#E1E0F2',
    bg: '#EEF0FF',
  card: '#FFFFFF',
};

export const fonts = {
  web: "'Plus Jakarta Sans', system-ui, -apple-system, 'Segoe UI', sans-serif",
};

export const radius = { sm: 10, md: 14, lg: 20 };
export const space = (n: number) => n * 4;
export const MAX_WIDTH = 980;

/** Sombras suaves (web + nativo). */
export const shadow = {
  card: { boxShadow: '0 4px 24px rgba(70,70,160,0.08)' },
  lift: { boxShadow: '0 10px 32px rgba(91,91,214,0.22)' },
  focus: { boxShadow: '0 0 0 4px rgba(91,91,214,0.20)' },
} as const;

/**
 * "Liquid glass": superficies translúcidas con desenfoque y un borde de luz.
 * El desenfoque solo existe en web; en el celular queda la transparencia.
 */
const blur = (px: number) => ({ backdropFilter: `blur(${px}px) saturate(170%)`, WebkitBackdropFilter: `blur(${px}px) saturate(170%)` });

export const glass = {
  backgroundColor: 'rgba(255,255,255,0.58)',
  borderColor: 'rgba(255,255,255,0.85)',
  boxShadow: '0 8px 32px rgba(70,70,160,0.10), inset 0 1px 0 rgba(255,255,255,0.9)',
  ...blur(22),
} as any;

export const glassStrong = {
  backgroundColor: 'rgba(255,255,255,0.78)',
  borderColor: 'rgba(255,255,255,0.9)',
  boxShadow: '0 12px 40px rgba(70,70,160,0.16), inset 0 1px 0 rgba(255,255,255,0.95)',
  ...blur(28),
} as any;

/** Barra (cabecera, menú lateral, pestañas): vidrio sin sombra pronunciada. */
export const glassBar = {
  backgroundColor: 'rgba(255,255,255,0.62)',
  borderColor: 'rgba(255,255,255,0.8)',
  ...blur(24),
} as any;

export const gradients = {
  brand: 'linear-gradient(135deg, #5B5BD6 0%, #7C5CE0 55%, #B05CE0 100%)',
  login: 'linear-gradient(160deg, #2E2F8F 0%, #5B5BD6 50%, #8B5CF6 100%)',
} as const;

/** Fondo de cada pantalla: opaco (tapa a las demás) pero con el mismo degradado que el fondo global. */
const PAGE_GRADIENT = [
  'radial-gradient(60vmax 60vmax at 8% 6%, rgba(139,92,246,0.30), transparent 60%)',
  'radial-gradient(55vmax 55vmax at 95% 12%, rgba(56,189,248,0.30), transparent 60%)',
  'radial-gradient(50vmax 50vmax at 80% 95%, rgba(244,114,182,0.26), transparent 60%)',
  'radial-gradient(45vmax 45vmax at 5% 90%, rgba(45,212,191,0.22), transparent 60%)',
].join(', ');
export const pageBg = (Platform.OS === 'web'
  ? { backgroundColor: '#EEF0FF', backgroundImage: PAGE_GRADIENT, backgroundAttachment: 'fixed' }
  : { backgroundColor: '#EEF0FF' }) as any;

export const web = (style: Record<string, any>) => (Platform.OS === 'web' ? (style as any) : {});
