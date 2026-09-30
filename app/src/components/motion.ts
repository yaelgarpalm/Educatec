import { Platform, StyleSheet } from 'react-native';

/**
 * Animaciones (solo web, con CSS): aparecer subiendo, "pop", flotar, pulso, sacudida y barras que se llenan.
 * Respetan la preferencia del sistema "reducir movimiento". En el celular nativo no hacen nada.
 */
const canAnimate =
  Platform.OS === 'web' &&
  !(typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);

const ease = 'cubic-bezier(0.2, 0.8, 0.2, 1)';
const none = {} as any;

/** Los keyframes solo funcionan con estilos registrados (StyleSheet.create), no con estilos en línea. */
const cache = new Map<string, any>();
const reg = (style: Record<string, any>) => {
  const key = JSON.stringify(style);
  let hit = cache.get(key);
  if (!hit) {
    hit = StyleSheet.create({ s: style as any }).s;
    cache.set(key, hit);
  }
  return hit as any;
};

/** Aparece desde abajo (o desde un lado) con desvanecido. */
export const rise = (delay = 0, distance = 16, duration = 520, axis: 'y' | 'x' = 'y') => {
  if (!canAnimate) return none;
  const from = axis === 'y' ? { translateY: distance } : { translateX: distance };
  const to = axis === 'y' ? { translateY: 0 } : { translateX: 0 };
  return reg({
    animationKeyframes: { '0%': { opacity: 0, transform: [from] }, '100%': { opacity: 1, transform: [to] } },
    animationDuration: `${duration}ms`, animationDelay: `${delay}ms`, animationFillMode: 'backwards', animationTimingFunction: ease,
  });
};

/** Aparece creciendo con un pequeño rebote. */
export const pop = (delay = 0, duration = 600) => {
  if (!canAnimate) return none;
  return reg({
    animationKeyframes: {
      '0%': { opacity: 0, transform: [{ scale: 0.6 }] },
      '70%': { opacity: 1, transform: [{ scale: 1.08 }] },
      '100%': { opacity: 1, transform: [{ scale: 1 }] },
    },
    animationDuration: `${duration}ms`, animationDelay: `${delay}ms`, animationFillMode: 'backwards', animationTimingFunction: ease,
  });
};

/** Flota suavemente de un lado a otro, sin parar. */
export const float = (dx = 20, dy = 24, seconds = 9, delay = 0) => {
  if (!canAnimate) return none;
  return reg({
    animationKeyframes: {
      '0%': { transform: [{ translateX: 0 }, { translateY: 0 }, { scale: 1 }] },
      '100%': { transform: [{ translateX: dx }, { translateY: dy }, { scale: 1.08 }] },
    },
    animationDuration: `${seconds}s`, animationDelay: `${delay}s`, animationIterationCount: 'infinite',
    animationDirection: 'alternate', animationTimingFunction: 'ease-in-out',
  });
};

/** Círculo que se expande y se desvanece (halo). */
export const ring = (delay = 0) => {
  if (!canAnimate) return none;
  return reg({
    animationKeyframes: {
      '0%': { opacity: 0.55, transform: [{ scale: 1 }] },
      '100%': { opacity: 0, transform: [{ scale: 1.9 }] },
    },
    animationDuration: '2.6s', animationDelay: `${delay}s`, animationIterationCount: 'infinite', animationTimingFunction: 'ease-out',
  });
};

/** Sacudida horizontal (para errores). */
export const shake = () => {
  if (!canAnimate) return none;
  return reg({
    animationKeyframes: {
      '0%': { transform: [{ translateX: 0 }] },
      '20%': { transform: [{ translateX: -10 }] },
      '40%': { transform: [{ translateX: 9 }] },
      '60%': { transform: [{ translateX: -6 }] },
      '80%': { transform: [{ translateX: 4 }] },
      '100%': { transform: [{ translateX: 0 }] },
    },
    animationDuration: '460ms', animationFillMode: 'both', animationTimingFunction: 'ease-in-out',
  });
};

/** Barra que se llena desde 0 hasta su valor. */
export const fill = (percent: number, delay = 200) => {
  if (!canAnimate) return none;
  return reg({
    animationKeyframes: { '0%': { width: '0%' }, '100%': { width: `${percent}%` } },
    animationDuration: '900ms', animationDelay: `${delay}ms`, animationFillMode: 'both', animationTimingFunction: ease,
  });
};

/** Transición suave para hover / presionar. */
export const smooth = canAnimate
  ? ({
      transitionProperty: 'transform, box-shadow, background-color, border-color, opacity',
      transitionDuration: '220ms', transitionTimingFunction: ease,
    } as any)
  : none;

/** Retraso escalonado para listas: 0, 70, 140… ms (con tope). */
export const stagger = (i: number, step = 70, max = 6) => Math.min(i, max) * step;

/** Campana que se balancea un momento y descansa (se repite mientras haya pendientes). */
export const swingLoop = () => {
  if (!canAnimate) return none;
  const r = (deg: number) => ({ transform: [{ rotate: `${deg}deg` }] });
  return reg({
    transformOrigin: 'top center',
    animationKeyframes: {
      '0%': r(0), '4%': r(16), '8%': r(-14), '12%': r(11), '16%': r(-8), '20%': r(5), '24%': r(0), '100%': r(0),
    },
    animationDuration: '4.5s', animationIterationCount: 'infinite', animationTimingFunction: 'ease-in-out',
  });
};

/** Balanceo fuerte y corto: cuando llega algo nuevo. */
export const swingOnce = () => {
  if (!canAnimate) return none;
  const r = (deg: number) => ({ transform: [{ rotate: `${deg}deg` }, { scale: 1.15 }] });
  return reg({
    transformOrigin: 'top center',
    animationKeyframes: {
      '0%': { transform: [{ rotate: '0deg' }, { scale: 1 }] }, '12%': r(24), '28%': r(-22), '44%': r(16), '60%': r(-10), '76%': r(5),
      '100%': { transform: [{ rotate: '0deg' }, { scale: 1 }] },
    },
    animationDuration: '1.1s', animationTimingFunction: 'ease-in-out',
  });
};

/** Entra desde la derecha (avisos emergentes). */
export const slideIn = () => rise(0, 60, 480, 'x');

/** Barra que se vacía (cuenta atrás de un aviso). */
export const drain = (seconds: number) => {
  if (!canAnimate) return none;
  return reg({
    animationKeyframes: { '0%': { width: '100%' }, '100%': { width: '0%' } },
    animationDuration: `${seconds}s`, animationFillMode: 'forwards', animationTimingFunction: 'linear',
  });
};
