import { Ionicons } from '@expo/vector-icons';
import { useState, type ComponentProps, type ReactNode } from 'react';
import {
  ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text,
  TextInput, View, type StyleProp, type TextInputProps, type ViewStyle,
} from 'react-native';

import { label } from '@/lib/format';
import { fill, float, rise, smooth } from './motion';
import { colors, glass, glassBar, glassStrong, gradients, MAX_WIDTH, pageBg, radius, shadow } from './theme';

export type IconName = ComponentProps<typeof Ionicons>['name'];

// ---------------------------------------------------------------- Diálogos (ventanas propias de la app)
export { confirm, notify } from './dialogs';

// ---------------------------------------------------------------- Layout
export function Screen({
  children, onRefresh, refreshing = false, scroll = true, style,
}: {
  children: ReactNode;
  onRefresh?: () => void;
  refreshing?: boolean;
  scroll?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const inner = <View style={[s.inner, rise(0, 12, 420), style]}>{children}</View>;
  if (!scroll) return <View style={s.screen}>{inner}</View>;
  return (
    <ScrollView
      style={s.screen}
      contentContainerStyle={{ paddingBottom: 110 }}
      keyboardShouldPersistTaps="handled"
      refreshControl={onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} /> : undefined}
    >
      {inner}
    </ScrollView>
  );
}

export const Row = ({ children, style, gap = 8 }: { children: ReactNode; style?: StyleProp<ViewStyle>; gap?: number }) => (
  <View style={[{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap }, style]}>{children}</View>
);

export function Card({ children, onPress, style, delay = 0 }: { children: ReactNode; onPress?: () => void; style?: StyleProp<ViewStyle>; delay?: number }) {
  if (!onPress) return <View style={[s.card, smooth, rise(delay), style]}>{children}</View>;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed, hovered }: any) => [s.card, smooth, rise(delay), hovered && s.cardHover, pressed && { transform: [{ scale: 0.985 }] }, style]}
    >
      {children}
    </Pressable>
  );
}

// ---------------------------------------------------------------- Texto
export const Title = ({ children, style }: { children: ReactNode; style?: any }) => <Text style={[s.title, style]}>{children}</Text>;
export const H2 = ({ children, style }: { children: ReactNode; style?: any }) => <Text style={[s.h2, style]}>{children}</Text>;
export const Body = ({ children, style, numberOfLines }: { children: ReactNode; style?: any; numberOfLines?: number }) => (
  <Text style={[s.body, style]} numberOfLines={numberOfLines}>{children}</Text>
);
export const Muted = ({ children, style }: { children: ReactNode; style?: any }) => <Text style={[s.muted, style]}>{children}</Text>;

export function Section({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <View style={{ marginTop: 24 }}>
      <Row style={{ justifyContent: 'space-between', marginBottom: 10 }}>
        <H2>{title}</H2>
        {action}
      </Row>
      {children}
    </View>
  );
}

// ---------------------------------------------------------------- Controles
type Variant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';

export function Button({
  title, onPress, variant = 'primary', loading, disabled, icon, small, style,
}: {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  icon?: IconName;
  small?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const v = VARIANTS[variant];
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed, hovered }: any) => [
        s.btn, smooth, small && s.btnSmall, { backgroundColor: v.bg, borderColor: v.border },
        hovered && !disabled && { backgroundColor: v.hover, transform: [{ translateY: -1 }] },
        variant === 'primary' && !disabled && ({ boxShadow: '0 8px 20px rgba(91,91,214,0.35)' } as any),
        pressed && { transform: [{ scale: 0.98 }] },
        disabled && { opacity: 0.45 }, style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.fg} size="small" />
      ) : (
        <Row gap={6} style={{ flexWrap: 'nowrap' }}>
          {icon && <Ionicons name={icon} size={small ? 15 : 18} color={v.fg} />}
          <Text style={[s.btnText, small && { fontSize: 13 }, { color: v.fg }]}>{title}</Text>
        </Row>
      )}
    </Pressable>
  );
}

const VARIANTS: Record<Variant, { bg: string; fg: string; border: string; hover: string }> = {
  primary: { bg: colors.primary, fg: '#fff', border: colors.primary, hover: colors.primaryDark },
  secondary: { bg: 'rgba(255,255,255,0.7)', fg: colors.primary, border: 'rgba(255,255,255,0.95)', hover: 'rgba(255,255,255,0.95)' },
  danger: { bg: colors.danger, fg: '#fff', border: colors.danger, hover: '#B02D36' },
  success: { bg: colors.success, fg: '#fff', border: colors.success, hover: '#0B7264' },
  ghost: { bg: 'transparent', fg: colors.primary, border: 'transparent', hover: colors.primarySoft },
};

export function Field({
  label: lbl, hint, style, grow, required, ...props
}: TextInputProps & { label: string; hint?: string; grow?: boolean; required?: boolean }) {
  // grow: para poner varios campos en una fila que se acomoda en pantallas angostas
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(true);
  const isPassword = !!props.secureTextEntry;
  return (
    <View style={[{ marginBottom: 14 }, grow && { flexGrow: 1, flexBasis: 160 }]}>
      <Text style={s.label}>
        {lbl}
        {required ? <Text style={{ color: colors.danger }}> *</Text> : null}
      </Text>
      <View>
        <TextInput
          placeholderTextColor="#98A2AD"
          {...props}
          secureTextEntry={isPassword ? hidden : false}
          onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
          style={[
            s.input, props.multiline && { minHeight: 100, textAlignVertical: 'top' },
            focused && s.inputFocus, isPassword && { paddingRight: 44 }, style,
          ]}
        />
        {isPassword && (
          <Pressable onPress={() => setHidden(!hidden)} hitSlop={8} accessibilityLabel={hidden ? 'Mostrar contraseña' : 'Ocultar contraseña'}
            style={{ position: 'absolute', right: 12, top: 0, bottom: 0, justifyContent: 'center' }}>
            <Ionicons name={hidden ? 'eye-outline' : 'eye-off-outline'} size={20} color={colors.muted} />
          </Pressable>
        )}
      </View>
      {hint ? <Muted style={{ marginTop: 4, fontSize: 12 }}>{hint}</Muted> : null}
    </View>
  );
}

/** Buscador con icono y botón para limpiar; se usa con búsqueda en vivo. */
export function SearchBar({ value, onChangeText, placeholder, onSubmit }: {
  value: string; onChangeText: (v: string) => void; placeholder?: string; onSubmit?: () => void;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={[s.search, focused && s.inputFocus]}>
      <Ionicons name="search" size={20} color={colors.muted} />
      <TextInput
        value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor="#98A2AD"
        returnKeyType="search" onSubmitEditing={onSubmit} accessibilityLabel="Buscar"
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={[{ flex: 1, fontSize: 16, color: colors.text, paddingVertical: 12 }, { outlineStyle: 'none' } as any]}
      />
      {!!value && (
        <Pressable onPress={() => onChangeText('')} hitSlop={8} accessibilityLabel="Borrar búsqueda">
          <Ionicons name="close-circle" size={20} color="#98A2AD" />
        </Pressable>
      )}
    </View>
  );
}

export function ChipSelect<T extends string>({
  label: lbl, options, value, onChange, multi,
}: {
  label?: string;
  options: readonly T[];
  value: T | T[] | null;
  onChange: (v: any) => void;
  multi?: boolean;
}) {
  const selected = (o: T) => (multi ? (value as T[]).includes(o) : value === o);
  const toggle = (o: T) => {
    if (!multi) return onChange(value === o ? null : o);
    const arr = value as T[];
    onChange(arr.includes(o) ? arr.filter((x) => x !== o) : [...arr, o]);
  };
  return (
    <View style={{ marginBottom: 12 }}>
      {lbl && <Text style={s.label}>{lbl}</Text>}
      <Row gap={6}>
        {options.map((o) => (
          <Pressable key={o} onPress={() => toggle(o)} accessibilityRole="button" accessibilityState={{ selected: selected(o) }}
            style={({ hovered }: any) => [s.chip, smooth, hovered && !selected(o) && { backgroundColor: colors.primarySoft }, selected(o) && s.chipOn]}>
            <Row gap={4} style={{ flexWrap: 'nowrap' }}>
              {selected(o) && <Ionicons name="checkmark" size={14} color="#fff" />}
              <Text style={[s.chipText, selected(o) && { color: '#fff' }]}>{label(o)}</Text>
            </Row>
          </Pressable>
        ))}
      </Row>
    </View>
  );
}

export function Switch({ label: lbl, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <Pressable onPress={() => onChange(!value)} accessibilityRole="checkbox" accessibilityState={{ checked: value }}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12, minHeight: 36 }}>
      <Ionicons name={value ? 'checkbox' : 'square-outline'} size={24} color={colors.primary} />
      <Text style={s.body}>{lbl}</Text>
    </Pressable>
  );
}

// ---------------------------------------------------------------- Indicadores
type Tone = 'neutral' | 'primary' | 'success' | 'danger' | 'warning' | 'accent';
const TONES: Record<Tone, [string, string]> = {
  neutral: ['#EEF1F4', colors.muted],
  primary: [colors.primarySoft, colors.primary],
  success: [colors.successSoft, colors.success],
  danger: [colors.dangerSoft, colors.danger],
  warning: [colors.warningSoft, colors.warning],
  accent: [colors.accentSoft, colors.accent],
};

export function Badge({ text, tone = 'neutral', icon }: { text: string; tone?: Tone; icon?: IconName }) {
  const [bg, fg] = TONES[tone];
  return (
    <View style={[s.badge, { backgroundColor: bg }]}>
      {icon && <Ionicons name={icon} size={12} color={fg} />}
      <Text style={[s.badgeText, { color: fg }]}>{text}</Text>
    </View>
  );
}

const STATUS_TONE: Record<string, Tone> = {
  borrador: 'neutral', abierto: 'success', en_progreso: 'primary', finalizado: 'neutral', cancelado: 'danger',
  enviada: 'warning', aceptada: 'success', rechazada: 'danger', retirada: 'neutral',
  pendiente: 'neutral', entregado: 'warning', aprobado: 'success', cambios_solicitados: 'danger',
};
export const StatusBadge = ({ status }: { status: string }) => <Badge text={label(status)} tone={STATUS_TONE[status] ?? 'neutral'} />;

export function Tags({ items, tone = 'primary' }: { items: string[]; tone?: Tone }) {
  if (!items?.length) return null;
  return (
    <Row gap={6} style={{ marginTop: 6 }}>
      {items.map((t) => <Badge key={t} text={t} tone={tone} />)}
    </Row>
  );
}

export function Stars({ value, onChange, size = 18 }: { value: number; onChange?: (n: number) => void; size?: number }) {
  return (
    <Row gap={2}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Pressable key={n} disabled={!onChange} onPress={() => onChange?.(n)}>
          <Ionicons name={value >= n - 0.25 ? 'star' : value >= n - 0.75 ? 'star-half' : 'star-outline'} size={size} color="#E0A100" />
        </Pressable>
      ))}
    </Row>
  );
}

export function ScoreBar({ score }: { score: number }) {
  return (
    <Row gap={8} style={{ flexWrap: 'nowrap' }}>
      <View style={s.barTrack}>
        <View style={[s.barFill, { width: `${Math.round(score * 100)}%` }, fill(Math.round(score * 100))]} />
      </View>
      <Text style={[s.muted, { fontWeight: '700', color: colors.primary }]}>{Math.round(score * 100)}%</Text>
    </Row>
  );
}

export function Stat({ value, text, icon, delay = 0 }: { value: number | string; text: string; icon: IconName; delay?: number }) {
  return (
    <View style={[s.stat, rise(delay, 16, 520)]}>
      <Ionicons name={icon} size={20} color={colors.primary} />
      <Text style={s.statValue}>{value}</Text>
      <Text style={s.muted}>{text}</Text>
    </View>
  );
}

// ---------------------------------------------------------------- Estados
export const Loading = () => (
  <View style={{ padding: 40, alignItems: 'center' }}>
    <ActivityIndicator color={colors.primary} size="large" />
  </View>
);

export function ErrorView({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  return (
    <View style={[s.card, { borderColor: colors.danger, backgroundColor: colors.dangerSoft }]}>
      <Text style={{ color: colors.danger, fontWeight: '600' }}>{(error as Error)?.message ?? 'Ocurrió un error'}</Text>
      {onRetry && <Button title="Reintentar" variant="secondary" small onPress={onRetry} style={{ marginTop: 10, alignSelf: 'flex-start' }} />}
    </View>
  );
}

export function Empty({ text, icon = 'file-tray-outline', action }: { text: string; icon?: IconName; action?: ReactNode }) {
  return (
    <View style={{ alignItems: 'center', padding: 28, gap: 10 }}>
      <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name={icon} size={30} color={colors.primary} />
      </View>
      <Muted style={{ textAlign: 'center', maxWidth: 320 }}>{text}</Muted>
      {action}
    </View>
  );
}

export const Divider = () => <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 12 }} />;

// ---------------------------------------------------------------- Estilos
const s = StyleSheet.create({
  screen: { flex: 1, ...pageBg },
  inner: { width: '100%', maxWidth: MAX_WIDTH, alignSelf: 'center', padding: 16 },
  card: {
    borderRadius: radius.lg, padding: 16, marginBottom: 12, borderWidth: 1, ...glass,
  },
  cardHover: { ...glassStrong, borderColor: 'rgba(91,91,214,0.55)', boxShadow: '0 14px 38px rgba(91,91,214,0.26)', transform: [{ translateY: -3 }] } as any,
  title: { fontSize: 26, fontWeight: '800', color: colors.text, marginBottom: 4, letterSpacing: -0.3 },
  h2: { fontSize: 17, fontWeight: '700', color: colors.text, lineHeight: 23 },
  body: { fontSize: 15, color: colors.text, lineHeight: 22 },
  muted: { fontSize: 13.5, color: colors.muted, lineHeight: 19 },
  label: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 6 },
  input: {
    backgroundColor: 'rgba(255,255,255,0.72)', borderWidth: 1, borderColor: '#DAD9F0', borderRadius: radius.md,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, color: colors.text, minHeight: 48,
  },
  inputFocus: { borderColor: colors.primary, ...shadow.focus },
  search: {
    flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderRadius: 999,
    paddingHorizontal: 16, minHeight: 50, ...glass,
  },
  btn: {
    borderRadius: radius.md, paddingVertical: 12, paddingHorizontal: 18, alignItems: 'center',
    justifyContent: 'center', borderWidth: 1, minHeight: 48,
  },
  btnSmall: { paddingVertical: 7, paddingHorizontal: 12, minHeight: 38 },
  btnText: { fontSize: 15, fontWeight: '700' },
  chip: {
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)', backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: 999,
    paddingVertical: 8, paddingHorizontal: 14,
  },
  chipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 14, color: colors.text, fontWeight: '600' },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 999, paddingVertical: 4, paddingHorizontal: 10 },
  badgeText: { fontSize: 12.5, fontWeight: '700' },
  barTrack: { flex: 1, height: 8, backgroundColor: colors.primarySoft, borderRadius: 999, overflow: 'hidden' },
  barFill: { height: 8, backgroundColor: colors.primary, borderRadius: 999 },
  stat: {
    flexGrow: 1, flexBasis: 140, borderRadius: radius.lg, padding: 16, borderWidth: 1, gap: 2, ...glass,
  },
  hero: {
    backgroundColor: colors.primary, backgroundImage: gradients.brand, borderRadius: 26, padding: 24, marginBottom: 6,
    overflow: 'hidden', boxShadow: '0 16px 40px rgba(91,91,214,0.35), inset 0 1px 0 rgba(255,255,255,0.35)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)',
  } as any,
  heroBubble: { position: 'absolute', borderRadius: 999, backgroundColor: '#fff' },
  heroTitle: { color: '#fff', fontSize: 26, fontWeight: '800', letterSpacing: -0.4 },
  heroText: { color: 'rgba(255,255,255,0.85)', fontSize: 15, lineHeight: 22, marginTop: 6, maxWidth: 560 },
  heroBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 999,
    paddingVertical: 11, paddingHorizontal: 18, minHeight: 44,
  },
  heroBtnGhost: { backgroundColor: 'rgba(255,255,255,0.18)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)' },
  stepCard: {
    flexGrow: 1, flexBasis: 200, borderRadius: radius.lg, padding: 16, borderWidth: 1, ...glass,
  },
  stepIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: 28, fontWeight: '800', color: colors.text },
});

/** Fondo de vidrio para cabeceras. */
export const GlassBar = () => <View style={[StyleSheet.absoluteFill, { borderBottomWidth: 1 }, glassBar]} />;

// ---------------------------------------------------------------- Bienvenida (hero) y pasos
export function Hero({ title, text, children }: { title: string; text?: string; children?: ReactNode }) {
  return (
    <View style={[s.hero, rise(0, 20, 650)]}>
      <View style={[s.heroBubble, { width: 220, height: 220, right: -60, top: -80, opacity: 0.10 }, float(-18, 20, 8)]} />
      <View style={[s.heroBubble, { width: 120, height: 120, right: 70, bottom: -60, opacity: 0.07 }, float(22, -14, 6, 1)]} />
      <Text style={s.heroTitle}>{title}</Text>
      {!!text && <Text style={s.heroText}>{text}</Text>}
      {children ? <View style={{ marginTop: 16 }}>{children}</View> : null}
    </View>
  );
}

/** Botón claro para usar sobre el hero (fondo azul). */
export function HeroButton({ title, icon, onPress, ghost }: { title: string; icon?: IconName; onPress: () => void; ghost?: boolean }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress}
      style={({ hovered, pressed }: any) => [s.heroBtn, smooth, ghost && s.heroBtnGhost, hovered && { transform: [{ translateY: -2 }], boxShadow: '0 8px 20px rgba(0,0,0,0.18)' } as any, pressed && { transform: [{ scale: 0.97 }] }]}>
      {icon && <Ionicons name={icon} size={18} color={ghost ? '#fff' : colors.primary} />}
      <Text style={{ fontWeight: '700', fontSize: 15, color: ghost ? '#fff' : colors.primary }}>{title}</Text>
    </Pressable>
  );
}

/** Lista de pasos numerados (cómo funciona / qué sigue). */
export function Steps({ items }: { items: { icon: IconName; title: string; text: string; onPress?: () => void }[] }) {
  return (
    <Row gap={10} style={{ alignItems: 'stretch' }}>
      {items.map((it, i) => (
        <Pressable key={it.title} disabled={!it.onPress} onPress={it.onPress}
          style={({ hovered }: any) => [s.stepCard, smooth, rise(i * 110, 18, 560), hovered && !!it.onPress && s.cardHover]}>
          <View style={s.stepIcon}><Ionicons name={it.icon} size={22} color={colors.primary} /></View>
          <Text style={{ fontSize: 12, fontWeight: '800', color: colors.accent, marginTop: 10 }}>PASO {i + 1}</Text>
          <Text style={[s.h2, { marginTop: 2 }]}>{it.title}</Text>
          <Text style={[s.muted, { marginTop: 2 }]}>{it.text}</Text>
        </Pressable>
      ))}
    </Row>
  );
}

