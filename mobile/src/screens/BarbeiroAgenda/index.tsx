import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {ActivityIndicator, Alert} from 'react-native';
import {useTheme} from 'styled-components/native';
import Svg, {Path} from 'react-native-svg';
import {format} from 'date-fns';
import {ptBR} from 'date-fns/locale';
import Icon from '~/components/Icon';
import Avatar from '~/components/Avatar';
import Badge from '~/components/Badge';
import {useAuth} from '~/contexts/AuthContext';
import {fetchBarberByProfileId} from '~/services/barberService';
import {fetchBarberAppointments, updateAppointmentStatus} from '~/services/agendamentoService';
import {fetchTenantServices} from '~/services/servicoService';
import {formatBRL} from '~/utils/format';
import type {AppointmentStatus, AppointmentWithDetails} from '~/types';
import {
  Screen,
  HeaderRow,
  HeaderLeft,
  HeaderTextBlock,
  HeaderName,
  HeaderDate,
  StatusPill,
  StatusDot,
  StatusLabel,
  Scroller,
  StatsRow,
  StatTile,
  StatIconTile,
  StatValue,
  StatLabelText,
  AgendaSection,
  SectionTitle,
  AppointmentsList,
  AppointmentRow,
  TimeColumn,
  TimeLabel,
  TimeLine,
  Card,
  CardTopRow,
  ClientTextBlock,
  ClientName,
  ServiceLine,
  ActionsRow,
  CompleteButton,
  CompleteLabel,
  CancelActionButton,
  CancelActionLabel,
  FloatingButton,
  LoadingContainer,
  ErrorText,
  EmptyText,
} from './styles';

// Ícone de raio (tile "Total do dia") copiado literalmente de
// design/BarbeiroAgenda.dc.html (linha 38) — não existe variante equivalente
// em ~/components/Icon.tsx hoje (mesma solução de ícone local já usada em
// outras telas, ex. PixIcon de Checkout/index.tsx, que usa o mesmo path).
function BoltIcon({color}: {color: string}) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill={color} stroke="none">
      <Path d="M13 2L3 14h7l-1 8 11-14h-7z" />
    </Svg>
  );
}

// Ícone do botão flutuante (círculo + linha diagonal) copiado literalmente de
// design/BarbeiroAgenda.dc.html (linha 126) — glyph de uso único, não vale
// estender Icon.tsx. Ver "Controller ruling" #5 do dispatch: este botão é
// puramente decorativo, sem onPress.
function SlashCircleIcon({color}: {color: string}) {
  return (
    <Svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round">
      <Path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
      <Path d="M4.9 4.9l14.2 14.2" />
    </Svg>
  );
}

// Duplicado de Main/index.tsx e Servicos/index.tsx (Task 13/16) — não há
// helper equivalente em ~/utils hoje. Deriva iniciais (até 2 letras) do nome
// completo.
function getInitials(fullName: string | null | undefined): string {
  const trimmed = (fullName ?? '').trim();
  if (!trimmed) return '?';
  const parts = trimmed.split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? '' : '';
  return (first + last).toUpperCase();
}

// Formata "Primeiro Ú." (design/BarbeiroAgenda.dc.html mostra "Rafael C.") —
// mesmo padrão de formatBarberShortName em Agendamentos/index.tsx, duplicado
// aqui pois não há helper compartilhado em ~/utils.
function formatShortName(fullName: string | null | undefined): string {
  const trimmed = (fullName ?? '').trim();
  if (!trimmed) return 'Barbeiro';
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) return parts[0];
  const lastInitial = parts[parts.length - 1][0]?.toUpperCase() ?? '';
  return `${parts[0]} ${lastInitial}.`;
}

function capitalize(text: string): string {
  return text.length === 0 ? text : text.charAt(0).toUpperCase() + text.slice(1);
}

const ACTIONABLE_STATUSES: AppointmentStatus[] = ['pending', 'confirmed'];

export default function BarbeiroAgenda() {
  const theme = useTheme();
  const {profile} = useAuth();

  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([]);
  // fetchBarberAppointments (agendamentoService, não modificado) só traz
  // service:{name, price_cents} — sem duration_minutes. Para exibir a
  // duração (mostrada no mockup, ex. "Corte Clássico · 40min") sem alterar
  // nenhum arquivo em ~/services, buscamos o catálogo completo do tenant
  // (fetchTenantServices, já usado por outras telas) e casamos por nome.
  const [durationByName, setDurationByName] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Id do agendamento com uma ação (concluir/cancelar) em voo — desabilita os
  // botões daquele card enquanto a chamada está pendente.
  const [actingId, setActingId] = useState<string | null>(null);

  const loadAgenda = useCallback(async () => {
    if (!profile?.id) {
      setError('Sessão inválida.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const resolvedBarber = await fetchBarberByProfileId(profile.id);
      if (!resolvedBarber) {
        setError('Barbeiro não encontrado para este perfil.');
        return;
      }
      const now = new Date();
      const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const [appointmentsData, servicesData] = await Promise.all([
        fetchBarberAppointments(resolvedBarber.id, dayStart.toISOString(), dayEnd.toISOString()),
        profile.tenant_id ? fetchTenantServices(profile.tenant_id) : Promise.resolve([]),
      ]);

      setAppointments(appointmentsData);
      setDurationByName(
        Object.fromEntries(servicesData.map(service => [service.name, service.duration_minutes])),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [profile?.id, profile?.tenant_id]);

  useEffect(() => {
    loadAgenda();
  }, [loadAgenda]);

  // Estatísticas derivadas localmente da mesma lista já buscada — ver
  // "Controller ruling" #6 do dispatch desta task: soma/contagem excluem
  // agendamentos cancelados, sem chamada de serviço adicional.
  const {totalCents, countCortes} = useMemo(() => {
    const active = appointments.filter(a => a.status !== 'cancelled');
    return {
      totalCents: active.reduce((sum, a) => sum + (a.service?.price_cents ?? 0), 0),
      countCortes: active.length,
    };
  }, [appointments]);

  // Primeiro agendamento ainda acionável (pending/confirmed) da lista já
  // ordenada por starts_at — recebe o destaque visual (borda âmbar) que o
  // mockup dá ao item das 09:30, análogo a "próximo atendimento".
  const nextActionableId = useMemo(
    () => appointments.find(a => ACTIONABLE_STATUSES.includes(a.status))?.id ?? null,
    [appointments],
  );

  const handleConcluir = useCallback(
    async (id: string) => {
      setActingId(id);
      try {
        await updateAppointmentStatus(id, 'completed');
        setAppointments(prev => prev.map(a => (a.id === id ? {...a, status: 'completed'} : a)));
      } catch (err) {
        Alert.alert('Erro', err instanceof Error ? err.message : String(err));
      } finally {
        setActingId(null);
      }
    },
    [],
  );

  const handleCancelar = useCallback((id: string) => {
    Alert.alert(
      'Cancelar agendamento',
      'Tem certeza que deseja cancelar este agendamento? Essa ação não pode ser desfeita.',
      [
        {text: 'Voltar', style: 'cancel'},
        {
          text: 'Confirmar',
          style: 'destructive',
          onPress: async () => {
            setActingId(id);
            try {
              await updateAppointmentStatus(id, 'cancelled');
              setAppointments(prev => prev.map(a => (a.id === id ? {...a, status: 'cancelled'} : a)));
            } catch (err) {
              Alert.alert('Erro', err instanceof Error ? err.message : String(err));
            } finally {
              setActingId(null);
            }
          },
        },
      ],
    );
  }, []);

  const initials = getInitials(profile?.full_name);
  const shortName = formatShortName(profile?.full_name);
  const dateLabel = capitalize(format(new Date(), "EEEE, dd 'de' MMMM", {locale: ptBR}));

  return (
    <Screen>
      <HeaderRow>
        <HeaderLeft>
          <Avatar initials={initials} size={44} />
          <HeaderTextBlock>
            <HeaderName>{shortName}</HeaderName>
            <HeaderDate>{dateLabel}</HeaderDate>
          </HeaderTextBlock>
        </HeaderLeft>
        <StatusPill>
          <StatusDot />
          <StatusLabel>Disponível</StatusLabel>
        </StatusPill>
      </HeaderRow>

      {loading ? (
        <LoadingContainer>
          <ActivityIndicator color={theme.colors.accent} />
        </LoadingContainer>
      ) : error ? (
        <LoadingContainer>
          <ErrorText>{error}</ErrorText>
        </LoadingContainer>
      ) : (
        <Scroller>
          <StatsRow>
            <StatTile>
              <StatIconTile>
                <BoltIcon color={theme.colors.accent} />
              </StatIconTile>
              <StatValue>{formatBRL(totalCents)}</StatValue>
              <StatLabelText>Total do dia</StatLabelText>
            </StatTile>
            <StatTile>
              <StatIconTile>
                <Icon name="scissors" size={16} color={theme.colors.accent} strokeWidth={1.8} />
              </StatIconTile>
              <StatValue>{countCortes}</StatValue>
              <StatLabelText>Cortes agendados</StatLabelText>
            </StatTile>
          </StatsRow>

          <AgendaSection>
            <SectionTitle>Agenda de hoje</SectionTitle>

            {appointments.length === 0 ? (
              <EmptyText>Nenhum agendamento para hoje.</EmptyText>
            ) : (
              <AppointmentsList>
                {appointments.map((appointment, index) => {
                  const isDimmed = appointment.status === 'completed' || appointment.status === 'cancelled';
                  const isHighlighted = appointment.id === nextActionableId;
                  const isActionable = ACTIONABLE_STATUSES.includes(appointment.status);
                  const timeLabel = format(new Date(appointment.starts_at), 'HH:mm');
                  const durationMinutes = appointment.service
                    ? durationByName[appointment.service.name]
                    : undefined;

                  return (
                    <AppointmentRow key={appointment.id} dimmed={isDimmed}>
                      <TimeColumn>
                        <TimeLabel highlighted={isHighlighted}>{timeLabel}</TimeLabel>
                        {index < appointments.length - 1 && <TimeLine />}
                      </TimeColumn>
                      <Card highlighted={isHighlighted}>
                        <CardTopRow>
                          <ClientTextBlock>
                            <ClientName>{appointment.client?.full_name ?? 'Cliente'}</ClientName>
                            <ServiceLine>
                              {appointment.service?.name ?? 'Serviço'}
                              {durationMinutes ? ` · ${durationMinutes}min` : ''}
                            </ServiceLine>
                          </ClientTextBlock>
                          <Badge status={appointment.status} />
                        </CardTopRow>

                        {isActionable && (
                          <ActionsRow>
                            <CompleteButton
                              onPress={() => handleConcluir(appointment.id)}
                              disabled={actingId === appointment.id}
                              activeOpacity={0.8}>
                              <CompleteLabel>Concluir</CompleteLabel>
                            </CompleteButton>
                            <CancelActionButton
                              onPress={() => handleCancelar(appointment.id)}
                              disabled={actingId === appointment.id}
                              activeOpacity={0.8}>
                              <CancelActionLabel>Cancelar</CancelActionLabel>
                            </CancelActionButton>
                          </ActionsRow>
                        )}
                      </Card>
                    </AppointmentRow>
                  );
                })}
              </AppointmentsList>
            )}
          </AgendaSection>
        </Scroller>
      )}

      <FloatingButton>
        <SlashCircleIcon color={theme.colors.bg} />
      </FloatingButton>
    </Screen>
  );
}
