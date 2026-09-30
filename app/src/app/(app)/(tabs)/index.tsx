import { router } from 'expo-router';

import { ChallengeCard } from '@/components/ChallengeCard';
import { UniversityDashboard } from '@/components/UniversityDashboard';
import { useApi } from '@/components/hooks';
import { stagger } from '@/components/motion';
import {
  Body, Button, Card, Empty, ErrorView, H2, Hero, HeroButton, Loading, Muted, Row, ScoreBar, Screen, Section, Stat,
  StatusBadge, Steps,
} from '@/components/ui';
import { isAcademic, useUser } from '@/lib/auth';
import { label } from '@/lib/format';
import type { Challenge, ChallengeMatch, Page, Proposal, User } from '@/lib/types';

export default function Inicio() {
  const user = useUser();
  return (
    <>
      {isAcademic(user) ? <AcademicHome user={user} />
        : user.role === 'universidad' ? <UniversityDashboard user={user} />
        : user.role === 'admin' ? <AdminHome user={user} />
        : <PublisherHome user={user} />}
    </>
  );
}

const firstName = (u: User) => u.full_name.split(' ')[0];

// ---------------------------------------------------------------- Estudiante / académico
function AcademicHome({ user }: { user: User }) {
  const recs = useApi<ChallengeMatch[]>('/recommendations/challenges');
  const mine = useApi<Proposal[]>('/proposals/mine');
  const refresh = () => { recs.refetch(); mine.refetch(); };
  const active = (mine.data ?? []).filter((p) => p.status === 'enviada' || p.status === 'aceptada');
  const noProfile = !user.skills.length || !user.career;

  return (
    <Screen onRefresh={refresh} refreshing={recs.isRefetching}>
      <Hero title={`¡Hola, ${firstName(user)}!`}
        text={`${label(user.role)}${user.career ? ` · ${user.career}` : ''}. Encuentra una problemática real y resuélvela con tu equipo.`}>
        <Row gap={10}>
          <HeroButton title="Ver problemáticas" icon="bulb-outline" onPress={() => router.push('/retos')} />
          <HeroButton ghost title="Mis equipos" icon="people-outline" onPress={() => router.push('/equipos')} />
        </Row>
      </Hero>

      {noProfile && (
        <Card style={{ marginTop: 12 }}>
          <Row gap={12} style={{ flexWrap: 'nowrap' }}>
            <Body style={{ flex: 1 }}>
              <Body style={{ fontWeight: '700' }}>Completa tu perfil. </Body>
              Con tu carrera y habilidades te recomendamos las problemáticas que mejor van contigo.
            </Body>
            <Button small title="Completar" variant="secondary" onPress={() => router.push('/editar-perfil')} />
          </Row>
        </Card>
      )}

      {!mine.isLoading && !mine.data?.length && (
        <Section title="Cómo participar">
          <Steps items={[
            { icon: 'search-outline', title: 'Elige una problemática', text: 'Explora las que piden tu carrera.', onPress: () => router.push('/retos') },
            { icon: 'people-outline', title: 'Forma tu equipo', text: 'Junta a compañeros de otras carreras.', onPress: () => router.push('/equipos') },
            { icon: 'paper-plane-outline', title: 'Postúlate', text: 'La empresa revisa y elige a un equipo.' },
          ]} />
        </Section>
      )}

      {!!mine.data?.length && (
        <Section title={`Mis postulaciones (${active.length} activas)`}>
          {mine.data.map((p) => (
            <Card key={p.id} onPress={() => router.push(`/reto/${p.challenge_id}`)}>
              <Row style={{ justifyContent: 'space-between', flexWrap: 'nowrap' }} gap={10}>
                <H2 style={{ flex: 1 }}>{p.challenge_title ?? `Problemática #${p.challenge_id}`}</H2>
                <StatusBadge status={p.status} />
              </Row>
              <Muted>Equipo {p.team?.name}</Muted>
              {!!p.feedback && <Muted style={{ marginTop: 4 }}>“{p.feedback}”</Muted>}
            </Card>
          ))}
        </Section>
      )}

      <Section title="Recomendadas para ti" action={<Button small variant="ghost" title="Ver todas" onPress={() => router.push('/retos')} />}>
        {recs.isLoading ? <Loading /> : recs.error ? <ErrorView error={recs.error} onRetry={recs.refetch} /> :
          !recs.data?.length ? (
            <Empty text="Todavía no hay problemáticas que coincidan con tu perfil. Revisa el tablero completo."
              icon="bulb-outline" action={<Button small title="Ver el tablero" onPress={() => router.push('/retos')} />} />
          ) : recs.data.map((m, i) => (
            <ChallengeCard key={m.challenge.id} ch={m.challenge} delay={stagger(i)}>
              <Card style={{ marginTop: 12, marginBottom: 0, backgroundColor: '#F8FAFC', boxShadow: 'none' } as any}>
                <Muted style={{ fontWeight: '700', marginBottom: 4 }}>Afinidad contigo</Muted>
                <ScoreBar score={m.score} />
                {m.reasons.map((r) => <Muted key={r}>• {r}</Muted>)}
              </Card>
            </ChallengeCard>
          ))}
      </Section>
    </Screen>
  );
}

// ---------------------------------------------------------------- Empresa
function PublisherHome({ user }: { user: User }) {
  const q = useApi<Page<Challenge>>('/challenges', { mine: true, size: 50 });
  const items = q.data?.items ?? [];
  const count = (s: string) => items.filter((c) => c.status === s).length;

  return (
    <Screen onRefresh={q.refetch} refreshing={q.isRefetching}>
      <Hero title={`¡Hola, ${firstName(user)}!`}
        text="Cuéntanos un problema de tu organización y equipos universitarios te enviarán propuestas para resolverlo.">
        <HeroButton title="Publicar una problemática" icon="add-circle-outline" onPress={() => router.push('/publicar')} />
      </Hero>

      <Row style={{ marginTop: 14 }} gap={10}>
        <Stat value={count('abierto')} text="Abiertas" icon="megaphone-outline" />
        <Stat value={count('en_progreso')} text="En progreso" icon="construct-outline" />
        <Stat value={count('finalizado')} text="Finalizadas" icon="checkmark-done-outline" />
        <Stat value={items.reduce((a, c) => a + c.proposals_count, 0)} text="Postulaciones" icon="people-outline" />
      </Row>

      <Section title="Mis problemáticas">
        {q.isLoading ? <Loading /> : q.error ? <ErrorView error={q.error} onRetry={q.refetch} /> :
          !items.length ? (
            <>
              <Empty text="Todavía no publicas ninguna problemática. Es rápido: describe el problema y elige qué carreras necesitas."
                icon="megaphone-outline" action={<Button title="Publicar mi primera problemática" icon="add" onPress={() => router.push('/publicar')} />} />
              <Steps items={[
                { icon: 'create-outline', title: 'Describe el problema', text: 'En lenguaje sencillo, sin tecnicismos.' },
                { icon: 'people-outline', title: 'Recibe propuestas', text: 'Equipos multidisciplinarios se postulan.' },
                { icon: 'checkmark-done-outline', title: 'Elige y da seguimiento', text: 'Con hitos, mensajes y entregas.' },
              ]} />
            </>
          ) : items.map((c, i) => <ChallengeCard key={c.id} ch={c} delay={stagger(i)} />)}
      </Section>
    </Screen>
  );
}

// ---------------------------------------------------------------- Admin
function AdminHome({ user }: { user: User }) {
  return (
    <Screen>
      <Hero title={`Hola, ${firstName(user)}`} text="Administración de la plataforma.">
        <Row gap={10}>
          <HeroButton title="Verificar organizaciones" icon="shield-checkmark-outline" onPress={() => router.push('/organizaciones')} />
          <HeroButton ghost title="Indicadores" icon="stats-chart-outline" onPress={() => router.push('/indicadores')} />
        </Row>
      </Hero>
    </Screen>
  );
}
