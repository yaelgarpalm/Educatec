import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, Text } from 'react-native';

import { ChallengeCard } from '@/components/ChallengeCard';
import { useApi, useCatalogs } from '@/components/hooks';
import { stagger } from '@/components/motion';
import { colors } from '@/components/theme';
import { Button, Card, ChipSelect, Empty, ErrorView, Field, Loading, Muted, Row, Screen, SearchBar } from '@/components/ui';
import { isOrgPublisher, useUser } from '@/lib/auth';
import type { Challenge, Page } from '@/lib/types';

export default function Retos() {
  const user = useUser();
  const { data: cat } = useCatalogs();
  const [q, setQ] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string | null>('abierto');
  const [modality, setModality] = useState<string | null>(null);
  const [state, setState] = useState('');
  const [mine, setMine] = useState(false);
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Búsqueda en vivo: espera a que la persona deje de escribir
  useEffect(() => {
    const t = setTimeout(() => { setSearch(q); setPage(1); }, 350);
    return () => clearTimeout(t);
  }, [q]);

  const query = { q: search, status, modality, state, mine: mine || undefined, page, size: 20 };
  const r = useApi<Page<Challenge>>('/challenges', query);

  const statuses = (cat?.estados_reto ?? []).filter((s) => mine || s !== 'borrador');
  const activeFilters = (status && status !== 'abierto' ? 1 : 0) + (modality ? 1 : 0) + (state ? 1 : 0) + (mine ? 1 : 0);
  const clearAll = () => { setQ(''); setSearch(''); setStatus('abierto'); setModality(null); setState(''); setMine(false); setPage(1); };

  return (
    <Screen onRefresh={r.refetch} refreshing={r.isRefetching}>
      {user.role === 'estudiante' && (
        <Card style={{ backgroundColor: colors.primarySoft, borderColor: colors.primarySoft, boxShadow: 'none' } as any}>
          {user.career ? (
            <Row gap={8} style={{ flexWrap: 'nowrap' }}>
              <Ionicons name="information-circle" size={20} color={colors.primary} />
              <Muted style={{ flex: 1, color: colors.primaryDark }}>
                Ves las problemáticas que piden tu carrera ({user.career}) o que aceptan cualquier carrera.
              </Muted>
            </Row>
          ) : (
            <>
              <Muted style={{ color: colors.primaryDark }}>Registra tu carrera para ver las problemáticas que buscan estudiantes como tú.</Muted>
              <Button small variant="secondary" title="Completar perfil" onPress={() => router.push('/editar-perfil')}
                style={{ alignSelf: 'flex-start', marginTop: 8 }} />
            </>
          )}
        </Card>
      )}

      <SearchBar value={q} onChangeText={setQ} placeholder="Buscar: IoT, comercio electrónico, agua…"
        onSubmit={() => { setSearch(q); setPage(1); }} />

      <Row style={{ justifyContent: 'space-between', marginTop: 12, marginBottom: 6 }}>
        <Pressable onPress={() => setShowFilters(!showFilters)} accessibilityRole="button"
          style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6 }}>
          <Ionicons name="options-outline" size={20} color={colors.primary} />
          <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 15 }}>
            Filtros{activeFilters ? ` (${activeFilters})` : ''}
          </Text>
          <Ionicons name={showFilters ? 'chevron-up' : 'chevron-down'} size={16} color={colors.primary} />
        </Pressable>
        <Row gap={8}>
          {(activeFilters > 0 || !!q) && <Button small variant="ghost" title="Limpiar" icon="close" onPress={clearAll} />}
          {isOrgPublisher(user) && <Button small title="Publicar" icon="add" onPress={() => router.push('/publicar')} />}
        </Row>
      </Row>

      {showFilters && (
        <Card>
          {isOrgPublisher(user) && (
            <Button small variant={mine ? 'primary' : 'secondary'} title="Solo mis problemáticas" icon="person-outline"
              onPress={() => { setMine(!mine); setStatus(null); setPage(1); }} style={{ alignSelf: 'flex-start', marginBottom: 12 }} />
          )}
          <ChipSelect label="Estado" options={statuses} value={status} onChange={(v) => { setStatus(v); setPage(1); }} />
          <ChipSelect label="Válido como" options={cat?.modalidades ?? []} value={modality} onChange={(v) => { setModality(v); setPage(1); }} />
          <Field label="Estado de la República" value={state} onChangeText={(v) => { setState(v); setPage(1); }} placeholder="Ej. Estado de México" />
        </Card>
      )}

      {r.isLoading ? <Loading /> : r.error ? <ErrorView error={r.error} onRetry={r.refetch} /> : (
        <>
          <Muted style={{ marginBottom: 10 }}>
            {r.data?.total ?? 0} {r.data?.total === 1 ? 'problemática' : 'problemáticas'}
            {search ? ` para “${search}”` : ''}
          </Muted>
          {!r.data?.items.length ? (
            <Empty icon="search-outline" text="No encontramos problemáticas con esos filtros. Prueba con otras palabras o quita algún filtro."
              action={<Button small variant="secondary" title="Quitar filtros" onPress={clearAll} />} />
          ) : r.data.items.map((c, i) => <ChallengeCard key={c.id} ch={c} delay={stagger(i)} />)}
          {(r.data?.pages ?? 0) > 1 && (
            <Row style={{ justifyContent: 'center', marginTop: 8 }} gap={12}>
              <Button small variant="secondary" title="Anterior" icon="chevron-back" disabled={page <= 1} onPress={() => setPage(page - 1)} />
              <Muted>Página {page} de {r.data?.pages}</Muted>
              <Button small variant="secondary" title="Siguiente" disabled={page >= (r.data?.pages ?? 1)} onPress={() => setPage(page + 1)} />
            </Row>
          )}
        </>
      )}
    </Screen>
  );
}
