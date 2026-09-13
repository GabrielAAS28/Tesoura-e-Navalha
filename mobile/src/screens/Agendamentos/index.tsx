import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {ActivityIndicator, Alert} from 'react-native';
import {useTheme} from 'styled-components/native';
import {format} from 'date-fns';
import {ptBR} from 'date-fns/locale';
import Avatar from '~/components/Avatar';
import Badge from '~/components/Badge';
import {useAuth} from '~/contexts/AuthContext';
import {fetchClientAppointments, updateAppointmentStatus} from '~/services/agendamentoService';
import {formatBRL} from '~/utils/format';
import type {AppointmentWithDetails} from '~/types';
import {
  Screen,
  HeaderBlock,
  HeaderTitle,
  TabsRow,
  TabButton,
  TabLabel,
  Scroller,
  Card,
  CardTopRow,
  CardTitleBlock,
  ServiceName,
  DateTimeText,
  Divider,
  CardFooterRow,
  BarberRow,
  BarberInfoText,
  CancelButton,
  CancelLabel,
  LoadingContainer,
  ErrorText,
  EmptyText,
} from './styles';

type TabKey = 'proximos' | 'historico';

// Duplicado de Main/index.tsx e Checkout/index.tsx (Tasks 13/14) — não há
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

// Formata o nome do barbeiro como "Primeiro Ú." (design/Agendamentos.dc.html
// mostra "Rafael C." / "Thiago L." / "Diego A.") — nome completo + inicial do
// último sobrenome. Não existe helper equivalente em ~/utils.
function formatBarberShortName(fullName: string | null | undefined): string {
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

export default function Agendamentos() {
  const theme = useTheme();
  const {session} = useAuth();

  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('proximos');
  // Id do agendamento sendo cancelado (mostra "Cancelando…" e desabilita o
  // botão daquele card enquanto a chamada está em voo).
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const clientId = session?.user.id;
      if (!clientId) {
        if (!cancelled) {
          setError('Sessão inválida.');
          setLoading(false);
        }
        return;
      }
      setLoading(true);
      setError(null);
      try {
        // Única chamada em fetchClientAppointments por montagem — a divisão
        // Próximos/Histórico é derivada localmente (useMemo abaixo) a partir
        // desta mesma lista, sem novo fetch ao trocar de aba (ver "Controller
        // ruling" #4 do dispatch desta task).
        const data = await fetchClientAppointments(clientId);
        if (!cancelled) setAppointments(data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [session]);

  // Próximos = starts_at no futuro E status !== 'cancelled'; Histórico =
  // tudo o mais (passado OU qualquer cancelado, independente da data) — ver
  // "Controller ruling" #4 do dispatch desta task. `now` é calculado uma vez
  // por recomputação da lista (mudança de `appointments`), não é um relógio
  // vivo re-renderizando a cada segundo — suficiente para uma tela que só
  // recarrega dados ao montar/cancelar.
  const {proximos, historico} = useMemo(() => {
    const now = Date.now();
    const isProximo = (a: AppointmentWithDetails) =>
      new Date(a.starts_at).getTime() > now && a.status !== 'cancelled';
    return {
      proximos: appointments.filter(isProximo),
      historico: appointments.filter(a => !isProximo(a)),
    };
  }, [appointments]);

  const visibleAppointments = activeTab === 'proximos' ? proximos : historico;

  const handleCancelar = useCallback((appointmentId: string) => {
    Alert.alert(
      'Cancelar agendamento',
      'Tem certeza que deseja cancelar este agendamento? Essa ação não pode ser desfeita.',
      [
        {text: 'Voltar', style: 'cancel'},
        {
          text: 'Confirmar',
          style: 'destructive',
          onPress: async () => {
            setCancellingId(appointmentId);
            try {
              await updateAppointmentStatus(appointmentId, 'cancelled');
              // Atualiza o item na lista local em vez de refazer o fetch
              // completo — evita uma nova ida ao servidor por uma única
              // mudança de status já confirmada. Só altera o estado local
              // DEPOIS do sucesso da chamada (não é um update otimista
              // antes da confirmação), para não mostrar "Cancelado" e
              // precisar reverter caso a chamada falhe.
              setAppointments(prev =>
                prev.map(a => (a.id === appointmentId ? {...a, status: 'cancelled'} : a)),
              );
            } catch (err) {
              Alert.alert('Erro', err instanceof Error ? err.message : String(err));
            } finally {
              setCancellingId(null);
            }
          },
        },
      ],
    );
  }, []);

  return (
    <Screen>
      <HeaderBlock>
        <HeaderTitle>Meus Agendamentos</HeaderTitle>
      </HeaderBlock>

      <TabsRow>
        <TabButton active={activeTab === 'proximos'} onPress={() => setActiveTab('proximos')} activeOpacity={0.8}>
          <TabLabel active={activeTab === 'proximos'}>Próximos</TabLabel>
        </TabButton>
        <TabButton active={activeTab === 'historico'} onPress={() => setActiveTab('historico')} activeOpacity={0.8}>
          <TabLabel active={activeTab === 'historico'}>Histórico</TabLabel>
        </TabButton>
      </TabsRow>

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
          {visibleAppointments.length === 0 ? (
            <EmptyText>
              {activeTab === 'proximos'
                ? 'Nenhum agendamento próximo.'
                : 'Nenhum agendamento no histórico.'}
            </EmptyText>
          ) : (
            visibleAppointments.map(appointment => {
              const startsAt = new Date(appointment.starts_at);
              const dateLabel = capitalize(format(startsAt, "EEEEEE, dd 'de' MMMM", {locale: ptBR}));
              const timeLabel = format(startsAt, 'HH:mm');
              // Ação "Cancelar" só aparece na aba Próximos (que já exclui
              // cancelados) e apenas para status ainda acionáveis — ver
              // "Controller ruling" #4/Step 1 do dispatch desta task.
              const canCancel =
                activeTab === 'proximos' &&
                (appointment.status === 'pending' || appointment.status === 'confirmed');

              return (
                <Card key={appointment.id} dimmed={appointment.status === 'cancelled'}>
                  <CardTopRow>
                    <CardTitleBlock>
                      <ServiceName>{appointment.service?.name ?? 'Serviço'}</ServiceName>
                      <DateTimeText>
                        {dateLabel} · {timeLabel}
                      </DateTimeText>
                    </CardTitleBlock>
                    <Badge status={appointment.status} />
                  </CardTopRow>
                  <Divider />
                  <CardFooterRow>
                    <BarberRow>
                      <Avatar initials={getInitials(appointment.barber?.profile?.full_name)} size={32} />
                      <BarberInfoText>
                        {formatBarberShortName(appointment.barber?.profile?.full_name)} ·{' '}
                        {formatBRL(appointment.service?.price_cents ?? 0)}
                      </BarberInfoText>
                    </BarberRow>
                    {canCancel && (
                      <CancelButton
                        onPress={() => handleCancelar(appointment.id)}
                        disabled={cancellingId === appointment.id}
                        activeOpacity={0.7}>
                        <CancelLabel>
                          {cancellingId === appointment.id ? 'Cancelando…' : 'Cancelar'}
                        </CancelLabel>
                      </CancelButton>
                    )}
                  </CardFooterRow>
                </Card>
              );
            })
          )}
        </Scroller>
      )}
    </Screen>
  );
}
