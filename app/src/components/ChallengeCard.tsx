import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { label, money, shortDate } from '@/lib/format';
import type { Challenge } from '@/lib/types';
import { colors } from './theme';
import { Badge, Body, Card, H2, Muted, Row, StatusBadge } from './ui';

function Fact({ icon, text, color = colors.muted }: { icon: keyof typeof Ionicons.glyphMap; text: string; color?: string }) {
  return (
    <Row gap={5} style={{ flexWrap: 'nowrap' }}>
      <Ionicons name={icon} size={15} color={color} />
      <Text style={{ fontSize: 13.5, color, fontWeight: '500' }}>{text}</Text>
    </Row>
  );
}

export function ChallengeCard({ ch, children, delay = 0 }: { ch: Challenge; children?: React.ReactNode; delay?: number }) {
  const pay = ch.budget_mxn ? money(ch.budget_mxn) : ch.offers_stipend ? 'Con apoyo económico' : null;
  return (
    <Card delay={delay} onPress={() => router.push(`/reto/${ch.id}`)}>
      <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'nowrap' }} gap={10}>
        <View style={{ flex: 1 }}>
          <H2>{ch.title}</H2>
          <Muted style={{ marginTop: 2 }}>{ch.organization_name} · {ch.category}</Muted>
        </View>
        <StatusBadge status={ch.status} />
      </Row>

      <Body style={{ marginTop: 8, color: colors.muted }} numberOfLines={2}>{ch.summary}</Body>

      {/* Lo esencial para decidir, en una sola línea de datos */}
      <Row gap={14} style={{ marginTop: 12 }}>
        {pay && <Fact icon="cash-outline" text={pay} color={colors.success} />}
        {!!ch.deadline && <Fact icon="calendar-outline" text={`Cierra ${shortDate(ch.deadline)}`} />}
        <Fact icon="people-outline" text={`${ch.proposals_count} ${ch.proposals_count === 1 ? 'postulación' : 'postulaciones'}`} />
        {ch.confidentiality === 'confidencial' && <Fact icon="lock-closed" text="Requiere NDA" color={colors.warning} />}
      </Row>

      {!!ch.modalities.length && (
        <Row gap={6} style={{ marginTop: 10 }}>
          {ch.modalities.map((m) => <Badge key={m} text={label(m)} tone="accent" />)}
        </Row>
      )}
      {children}
    </Card>
  );
}
