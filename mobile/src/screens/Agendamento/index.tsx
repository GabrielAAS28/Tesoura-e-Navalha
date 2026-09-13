import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {ActivityIndicator} from 'react-native';
import {useTheme} from 'styled-components/native';
import {useNavigation, useRoute} from '@react-navigation/native';
import Svg, {Path} from 'react-native-svg';
import {addDays, endOfDay, format, isSameDay, startOfDay} from 'date-fns';
import {ptBR} from 'date-fns/locale';
import Icon from '~/components/Icon';
import BarberCard from '~/components/BarberCard';
import {fetchTenantBarbers} from '~/services/tenantService';
import {fetchTenantServices} from '~/services/servicoService';
import {fetchBarberWorkingHours} from '~/services/horarioService';
import {fetchBarberAppointments} from '~/services/agendamentoService';
import {computeFreeSlots} from '~/services/slots';
import type {AppointmentWithDetails, BarberWithProfile, Service, WorkingHours} from '~/types';
import type {CheckoutParams} from '~/screens/Checkout';
import {
  Screen,
  HeaderRow,
  BackButton,
  HeaderTitle,
  Scroller,
  Content,
  SectionBlock,
  SectionTitle,
  MonthLabel,
  PeriodHeaderRow,
  BarbersRow,
  DatesRow,
  DateChip,
  DateWeekday,
  DateDay,
  SlotsGrid,
  TimeChip,
  TimeChipLabel,
  EmptyStateText,
  LoadingContainer,
  ScreenLoadingContainer,
  ErrorText,
} from './styles';

// Parâmetros recebidos de Servicos: {serviceId, tenantId} — tenantId foi
// adicionado ao contrato do brief original (ver "Controller ruling" do
// dispatch desta task) porque esta tela precisa dele para buscar barbeiros
// e resolver os detalhes do serviço (não existe fetchServiceById).
export type AgendamentoParams = {serviceId: string; tenantId: string};

// Path do chevron-left copiado de design/Agendamento.dc.html (linha 21) —
// mesma solução já usada em BarbeiroCadastro/index.tsx e Servicos/index.tsx.
function ChevronLeftIcon({color}: {color: string}) {
  return (
    <Svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round">
      <Path d="M15 6l-6 6 6 6" />
    </Svg>
  );
}

// Duplicado de Main/index.tsx (Task 13) — não há helper equivalente em
// ~/utils hoje. Deriva iniciais (até 2 letras) do nome completo.
function getInitials(fullName: string | null | undefined): string {
  const trimmed = (fullName ?? '').trim();
  if (!trimmed) return '?';
  const parts = trimmed.split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? '' : '';
  return (first + last).toUpperCase();
}

const WEEKDAY_LABELS = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
const DAYS_AHEAD = 14;

function capitalize(text: string): string {
  return text.length === 0 ? text : text.charAt(0).toUpperCase() + text.slice(1);
}

export default function Agendamento() {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  // Leitura defensiva dos params — mesmo padrão de
  // BarbeiroCadastroEtapa2/index.tsx — para não crashar se a tela for aberta
  // sem os parâmetros esperados.
  const params = (route.params ?? {}) as Partial<AgendamentoParams>;
  const {serviceId, tenantId} = params;

  const [barbers, setBarbers] = useState<BarberWithProfile[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [initialError, setInitialError] = useState<string | null>(null);

  const [selectedBarberId, setSelectedBarberId] = useState<string | null>(null);
  const dates = useMemo(() => {
    const today = startOfDay(new Date());
    return Array.from({length: DAYS_AHEAD}, (_, i) => addDays(today, i));
  }, []);
  const [selectedDate, setSelectedDate] = useState<Date>(dates[0]);

  const [workingHours, setWorkingHours] = useState<WorkingHours[]>([]);
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);

  // Busca barbeiros e serviços do tenant em paralelo — o serviço é
  // necessário aqui (não só em Checkout) porque `computeFreeSlots` precisa
  // de `duration_minutes + buffer_minutes`, e não existe `fetchServiceById`.
  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!tenantId || !serviceId) {
        if (!cancelled) {
          setInitialError('Parâmetros de navegação inválidos.');
          setLoadingInitial(false);
        }
        return;
      }
      setLoadingInitial(true);
      setInitialError(null);
      try {
        const [barbersData, servicesData] = await Promise.all([
          fetchTenantBarbers(tenantId),
          fetchTenantServices(tenantId),
        ]);
        if (!cancelled) {
          setBarbers(barbersData);
          setServices(servicesData);
        }
      } catch (err) {
        if (!cancelled) {
          setInitialError(err instanceof Error ? err.message : String(err));
        }
      } finally {
        if (!cancelled) setLoadingInitial(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [tenantId, serviceId]);

  const service = useMemo(
    () => services.find(s => s.id === serviceId) ?? null,
    [services, serviceId],
  );

  // Ao trocar de barbeiro ou de data, busca horários de trabalho e
  // agendamentos existentes do barbeiro para o dia selecionado — entradas de
  // `computeFreeSlots` (preview de conflito; a fonte real de verdade contra
  // double-booking é a Edge Function chamada em Checkout).
  useEffect(() => {
    if (!selectedBarberId) {
      setWorkingHours([]);
      setAppointments([]);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoadingSlots(true);
      setSlotsError(null);
      try {
        const dayStartISO = startOfDay(selectedDate).toISOString();
        const dayEndISO = endOfDay(selectedDate).toISOString();
        const [hoursData, appointmentsData] = await Promise.all([
          fetchBarberWorkingHours(selectedBarberId as string),
          fetchBarberAppointments(selectedBarberId as string, dayStartISO, dayEndISO),
        ]);
        if (!cancelled) {
          setWorkingHours(hoursData);
          setAppointments(appointmentsData);
        }
      } catch (err) {
        if (!cancelled) {
          setSlotsError(err instanceof Error ? err.message : String(err));
        }
      } finally {
        if (!cancelled) setLoadingSlots(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [selectedBarberId, selectedDate]);

  const freeSlots = useMemo(() => {
    if (!service || !selectedBarberId) return [];
    return computeFreeSlots({
      date: selectedDate,
      durationMinutes: service.duration_minutes + service.buffer_minutes,
      workingHours,
      appointments,
    });
  }, [service, selectedBarberId, selectedDate, workingHours, appointments]);

  const morningSlots = useMemo(() => freeSlots.filter(slot => slot.getHours() < 12), [freeSlots]);
  const afternoonSlots = useMemo(
    () => freeSlots.filter(slot => slot.getHours() >= 12),
    [freeSlots],
  );

  const goBack = useCallback(() => navigation.goBack(), [navigation]);

  const goToCheckout = useCallback(
    (slot: Date) => {
      if (!selectedBarberId || !serviceId || !tenantId) return;
      const checkoutParams: CheckoutParams = {
        serviceId,
        barberId: selectedBarberId,
        startsAtISO: slot.toISOString(),
        tenantId,
      };
      navigation.navigate('Checkout' as never, checkoutParams as never);
    },
    [navigation, selectedBarberId, serviceId, tenantId],
  );

  const monthLabel = capitalize(format(selectedDate, 'MMMM yyyy', {locale: ptBR}));

  if (loadingInitial) {
    return (
      <Screen>
        <ScreenLoadingContainer>
          <ActivityIndicator color={theme.colors.accent} />
        </ScreenLoadingContainer>
      </Screen>
    );
  }

  if (initialError || !service) {
    return (
      <Screen>
        <HeaderRow>
          <BackButton onPress={goBack} activeOpacity={0.8}>
            <ChevronLeftIcon color={theme.colors.textPrimary} />
          </BackButton>
          <HeaderTitle>Data e Horário</HeaderTitle>
        </HeaderRow>
        <ScreenLoadingContainer>
          <ErrorText>{initialError ?? 'Serviço não encontrado.'}</ErrorText>
        </ScreenLoadingContainer>
      </Screen>
    );
  }

  return (
    <Screen>
      <HeaderRow>
        <BackButton onPress={goBack} activeOpacity={0.8}>
          <ChevronLeftIcon color={theme.colors.textPrimary} />
        </BackButton>
        <HeaderTitle>Data e Horário</HeaderTitle>
      </HeaderRow>

      <Scroller>
        <Content>
          <SectionBlock>
            {/* Seletor de barbeiro — na versão original do design
                (design/Servicos.dc.html) essa seção vivia na tela de
                Serviços; o controller ruling desta task moveu a escolha do
                barbeiro para cá, já que Agendamento é quem precisa do
                barberId para buscar horários. */}
            <SectionTitle>Escolha o barbeiro</SectionTitle>
            <BarbersRow>
              {barbers.map(barber => (
                <BarberCard
                  key={barber.id}
                  initials={getInitials(barber.profile?.full_name)}
                  name={barber.profile?.full_name ?? 'Barbeiro'}
                  selected={selectedBarberId === barber.id}
                  onPress={() => setSelectedBarberId(barber.id)}
                />
              ))}
            </BarbersRow>
          </SectionBlock>

          <SectionBlock>
            <MonthLabel>{monthLabel}</MonthLabel>
            <DatesRow>
              {dates.map(date => {
                const selected = isSameDay(date, selectedDate);
                return (
                  <DateChip
                    key={date.toISOString()}
                    selected={selected}
                    onPress={() => setSelectedDate(date)}
                    activeOpacity={0.8}>
                    <DateWeekday selected={selected}>{WEEKDAY_LABELS[date.getDay()]}</DateWeekday>
                    <DateDay selected={selected}>{format(date, 'dd')}</DateDay>
                  </DateChip>
                );
              })}
            </DatesRow>
          </SectionBlock>

          {!selectedBarberId ? (
            <EmptyStateText>Selecione um barbeiro para ver os horários disponíveis.</EmptyStateText>
          ) : loadingSlots ? (
            <LoadingContainer>
              <ActivityIndicator color={theme.colors.accent} />
            </LoadingContainer>
          ) : slotsError ? (
            <ErrorText>{slotsError}</ErrorText>
          ) : freeSlots.length === 0 ? (
            <EmptyStateText>Nenhum horário disponível nesta data.</EmptyStateText>
          ) : (
            <>
              {morningSlots.length > 0 && (
                <SectionBlock>
                  <PeriodHeaderRow>
                    <Icon name="clock" size={16} color={theme.colors.textSecondary} strokeWidth={1.8} />
                    <SectionTitle>Manhã</SectionTitle>
                  </PeriodHeaderRow>
                  <SlotsGrid>
                    {morningSlots.map(slot => (
                      <TimeChip key={slot.toISOString()} onPress={() => goToCheckout(slot)} activeOpacity={0.8}>
                        <TimeChipLabel>{format(slot, 'HH:mm')}</TimeChipLabel>
                      </TimeChip>
                    ))}
                  </SlotsGrid>
                </SectionBlock>
              )}

              {afternoonSlots.length > 0 && (
                <SectionBlock>
                  <PeriodHeaderRow>
                    <Icon name="clock" size={16} color={theme.colors.textSecondary} strokeWidth={1.8} />
                    <SectionTitle>Tarde</SectionTitle>
                  </PeriodHeaderRow>
                  <SlotsGrid>
                    {afternoonSlots.map(slot => (
                      <TimeChip key={slot.toISOString()} onPress={() => goToCheckout(slot)} activeOpacity={0.8}>
                        <TimeChipLabel>{format(slot, 'HH:mm')}</TimeChipLabel>
                      </TimeChip>
                    ))}
                  </SlotsGrid>
                </SectionBlock>
              )}
            </>
          )}
        </Content>
      </Scroller>
    </Screen>
  );
}
