import { Platform } from 'react-native';

import { fonts } from '@/components/theme';

/**
 * Estilos globales solo para la web: tipografía, fondo degradado con "luces" de color
 * (lo que da profundidad al efecto de vidrio) y barras de desplazamiento discretas.
 */
if (Platform.OS === 'web' && typeof document !== 'undefined' && !document.getElementById('vt-global')) {
  const font = document.createElement('link');
  font.rel = 'stylesheet';
  font.href = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap';
  document.head.appendChild(font);

  const css = document.createElement('style');
  css.id = 'vt-global';
  css.textContent = `
    html, body { min-height: 100%; }
    body {
      background-color: #EEF0FF;
      background-image:
        radial-gradient(60vmax 60vmax at 8% 6%, rgba(139,92,246,0.30), transparent 60%),
        radial-gradient(55vmax 55vmax at 95% 12%, rgba(56,189,248,0.30), transparent 60%),
        radial-gradient(50vmax 50vmax at 80% 95%, rgba(244,114,182,0.26), transparent 60%),
        radial-gradient(45vmax 45vmax at 5% 90%, rgba(45,212,191,0.22), transparent 60%);
      background-attachment: fixed;
    }
    body, input, textarea, button, div[dir], span[dir] { font-family: ${fonts.web}; }
    * { scrollbar-width: thin; scrollbar-color: rgba(91,91,214,0.35) transparent; }
    ::selection { background: rgba(91,91,214,0.25); }
  `;
  document.head.appendChild(css);
}
