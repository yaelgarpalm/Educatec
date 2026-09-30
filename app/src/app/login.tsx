import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { float, pop, ring, rise, shake } from '@/components/motion';
import { colors, glassStrong, gradients } from '@/components/theme';
import { Button, Card, ErrorView, Field, Muted } from '@/components/ui';
import { useAuth } from '@/lib/auth';

const DEMO: [string, string, keyof typeof Ionicons.glyphMap][] = [
  ['Estudiante', 'ana@tessfp.edu.mx', 'school-outline'],
  ['Empresa', 'laura@laespiga.mx', 'business-outline'],
  ['Universidad', 'vinculacion@tessfp.edu.mx', 'library-outline'],
  ['Académico', 'dra.martinez@tessfp.edu.mx', 'book-outline'],
  ['Admin', 'admin@vinculatec.mx', 'shield-checkmark-outline'],
];

const STEPS: [keyof typeof Ionicons.glyphMap, string][] = [
  ['bulb-outline', 'Las empresas publican un problema real'],
  ['people-outline', 'Equipos de varias carreras se postulan'],
  ['ribbon-outline', 'Se resuelve y cuenta como residencia o servicio social'],
];

/** Esferas de luz que flotan detrás de todo. */
function Orbs() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={[s.orb, { width: 380, height: 380, left: -120, top: -100, backgroundColor: '#A78BFA' }, float(60, 50, 11)]} />
      <View style={[s.orb, { width: 320, height: 320, right: -100, top: '18%', backgroundColor: '#38BDF8' }, float(-50, 60, 13, 1)]} />
      <View style={[s.orb, { width: 300, height: 300, left: '20%', bottom: -120, backgroundColor: '#F472B6' }, float(40, -50, 12, 2)]} />
      <View style={[s.orb, { width: 200, height: 200, right: '12%', bottom: '8%', backgroundColor: '#2DD4BF', opacity: 0.35 }, float(-30, -30, 9, 0.5)]} />
    </View>
  );
}

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<unknown>(null);
  const [errorKey, setErrorKey] = useState(0); // cambia en cada error para repetir la sacudida
  const [loading, setLoading] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const passRef = useRef<TextInput>(null);

  const fail = (e: unknown) => { setError(e); setErrorKey((k) => k + 1); };

  const enter = async (mail: string, pass: string) => {
    setError(null);
    setLoading(true);
    try {
      await login(mail.trim(), pass);
    } catch (e) {
      fail(e);
    } finally {
      setLoading(false);
    }
  };
  const submit = () => {
    if (!email.trim() || !password) return fail(new Error('Escribe tu correo y tu contraseña.'));
    enter(email, password);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={s.bg}>
      <Orbs />
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} keyboardShouldPersistTaps="handled">
        <View style={s.wrap}>
          <View style={s.brand}>
            {/* Logo: aparece con rebote, tiene un halo que pulsa y flota suavemente */}
            <View style={float(0, -8, 3.2)}>
              <View style={[s.logoWrap, pop(100)]}>
                <View style={[s.halo, ring(0)]} />
                <View style={[s.halo, ring(1.3)]} />
                <View style={s.logoCircle}>
                  <Ionicons name="git-network-outline" size={34} color={colors.primary} />
                </View>
              </View>
            </View>
            <Text style={[s.logo, rise(250, 18)]}>VinculaTec</Text>
            <Text style={[s.tagline, rise(380, 18)]}>Problemáticas reales de empresas, resueltas por equipos universitarios</Text>
          </View>

          <View style={rise(500, 34, 700)}>
            <Card style={{ padding: 22, ...glassStrong }}>
              <Text style={s.welcome}>Iniciar sesión</Text>
              <Field label="Correo electrónico" value={email} onChangeText={setEmail} autoCapitalize="none" autoCorrect={false}
                keyboardType="email-address" autoComplete="email" placeholder="tu@correo.mx" returnKeyType="next"
                onSubmitEditing={() => passRef.current?.focus()} />
              <Field label="Contraseña" value={password} onChangeText={setPassword} secureTextEntry autoComplete="current-password"
                onSubmitEditing={submit} placeholder="Tu contraseña" returnKeyType="go"
                // @ts-expect-error la referencia llega al TextInput interno
                ref={passRef} />
              {!!error && <View key={errorKey} style={[{ marginBottom: 12 }, shake()]}><ErrorView error={error} /></View>}
              <Button title="Entrar" onPress={submit} loading={loading} icon="log-in-outline" />
              <Link href="/registro" asChild>
                <Pressable style={{ marginTop: 16, alignItems: 'center', padding: 6 }}>
                  <Text style={{ color: colors.muted }}>
                    ¿Aún no tienes cuenta? <Text style={{ color: colors.primary, fontWeight: '700' }}>Crear cuenta</Text>
                  </Text>
                </Pressable>
              </Link>
            </Card>
          </View>

          <Pressable onPress={() => setShowDemo(!showDemo)} style={[s.demoToggle, rise(800, 10)]} accessibilityRole="button">
            <Ionicons name="flask-outline" size={16} color="#EDEBFF" />
            <Text style={{ color: '#EDEBFF', fontWeight: '600' }}>Probar sin registrarme</Text>
            <Ionicons name={showDemo ? 'chevron-up' : 'chevron-down'} size={16} color="#EDEBFF" />
          </Pressable>
          {showDemo && (
            <View style={rise(0, 14, 380)}>
              <Card style={{ padding: 14 }}>
                <Muted style={{ marginBottom: 10 }}>Elige un rol y entra con datos de ejemplo:</Muted>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {DEMO.map(([role, mail, icon], i) => (
                    <View key={mail} style={rise(i * 60, 10, 380)}>
                      <Button small variant="secondary" title={role} icon={icon} disabled={loading} onPress={() => enter(mail, 'Demo12345')} />
                    </View>
                  ))}
                </View>
              </Card>
            </View>
          )}

          <View style={{ marginTop: 22, gap: 10 }}>
            {STEPS.map(([icon, text], i) => (
              <View key={text} style={[{ flexDirection: 'row', alignItems: 'center', gap: 12 }, rise(950 + i * 130, -24, 600, 'x')]}>
                <View style={s.step}><Ionicons name={icon} size={18} color="#fff" /></View>
                <Text style={{ color: '#EDEBFF', flex: 1, fontSize: 14 }}>{i + 1}. {text}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  bg: { flex: 1, backgroundColor: colors.primaryDark, backgroundImage: gradients.login, overflow: 'hidden' } as any,
  orb: { position: 'absolute', borderRadius: 999, opacity: 0.5, filter: 'blur(60px)' } as any,
  wrap: { width: '100%', maxWidth: 440, alignSelf: 'center', padding: 20, paddingVertical: 32 },
  brand: { alignItems: 'center', marginBottom: 22, gap: 6 },
  logoWrap: { width: 72, height: 72, alignItems: 'center', justifyContent: 'center' },
  halo: { position: 'absolute', width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(255,255,255,0.5)' },
  logoCircle: {
    width: 68, height: 68, borderRadius: 34, backgroundColor: 'rgba(255,255,255,0.95)', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 10px 30px rgba(20,20,80,0.35)',
  } as any,
  logo: { color: '#fff', fontSize: 32, fontWeight: '900', letterSpacing: -0.5 },
  tagline: { color: 'rgba(255,255,255,0.85)', textAlign: 'center', fontSize: 15, lineHeight: 21 },
  welcome: { fontSize: 20, fontWeight: '800', color: colors.text, marginBottom: 16 },
  demoToggle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14 },
  step: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
});
