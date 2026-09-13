import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {ActivityIndicator} from 'react-native';
import {useTheme} from 'styled-components/native';
import {useNavigation, useRoute} from '@react-navigation/native';
import Svg, {Path} from 'react-native-svg';
import {addDays, endOfDay, format, isSameDay, startOfDay} from 'date-fns';
import {ptBR} from 'date-fns/locale';
import Icon from '~/components/Icon';
import {fetchTenantServices} from '~/services/servicoService';
import {fetchBarberWorkingHours} from '~/services/horarioService';
import {fetchBarberAppointments} from '~/services/agendamentoService';
import {computeFreeSlots} from '~/services/slots';
import type {AppointmentWithDetails, Service, WorkingHours} from '~/types';
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

// Parâmetros recebidos de Servicos: {serviceId, barberId, tenantId} — o
// barbeiro já vem escolhido de Servicos (design/Servicos.dc.html tem a
// seleção de barbeiro nela, não aqui — ver design/Agendamento.dc.html, que
// só mostra data/horário). tenantId é necessário porque não existe
// `fetchServiceById` (resolvemos o serviço via fetchTenantServices).
export type AgendamentoParams = {serviceId: string; barberId: string; tenantId: string};

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
  const {serviceId, barberId, tenantId} = params;

  const [services, setServices] = useState<Service[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [initialError, setInitialError] = useState<string | null>(null);

  const dates = useMemo(() => {
    const today = startOfDay(new Date());
    return Array.from({length: DAYS_AHEAD}, (_, i) => addDays(today, i));
  }, []);
  const [selectedDate, setSelectedDate] = useState<Date>(dates[0]);

  const [workingHours, setWorkingHours] = useState<WorkingHours[]>([]);
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);

  // Busca os serviços do tenant — necessário aqui (não só em Checkout)
  // porque `computeFreeSlots` precisa de `duration_minutes +
  // buffer_minutes`, e não existe `fetchServiceById`.
  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!tenantId || !serviceId || !barberId) {
        if (!cancelled) {
          setInitialError('Parâmetros de navegação inválidos.');
          setLoadingInitial(false);
        }
        return;
      }
      setLoadingInitial(true);
      setInitialError(null);
      try {
        const servicesData = await fetchTenantServices(tenantId);
        if (!cancelled) {
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
  }, [tenantId, serviceId, barberId]);

  const service = useMemo(
    () => services.find(s => s.id === serviceId) ?? null,
    [services, serviceId],
  );

  // O barbeiro já chega escolhido (de Servicos) — busca horários de
  // trabalho e agendamentos existentes desse barbeiro sempre que a data
  // selecionada muda. Entradas de `computeFreeSlots` (preview de conflito; a
  // fonte real de verdade contra double-booking é a Edge Function chamada em
  // Checkout).
  useEffect(() => {
    if (!barberId) {
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
          fetchBarberWorkingHours(barberId as string),
          fetchBarberAppointments(barberId as string, dayStartISO, dayEndISO),
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
  }, [barberId, selectedDate]);

  const freeSlots = useMemo(() => {
    if (!service || !barberId) return [];
    return computeFreeSlots({
      date: selectedDate,
      durationMinutes: service.duration_minutes + service.buffer_minutes,
      workingHours,
      appointments,
    });
  }, [service, barberId, selectedDate, workingHours, appointments]);

  const morningSlots = useMemo(() => freeSlots.filter(slot => slot.getHours() < 12), [freeSlots]);
  const afternoonSlots = useMemo(
    () => freeSlots.filter(slot => slot.getHours() >= 12),
    [freeSlots],
  );

  const goBack = useCallback(() => navigation.goBack(), [navigation]);

  const goToCheckout = useCallback(
    (slot: Date) => {
      if (!barberId || !serviceId || !tenantId) return;
      const checkoutParams: CheckoutParams = {
        serviceId,
        barberId,
        startsAtISO: slot.toISOString(),
        tenantId,
      };
      navigation.navigate('Checkout' as never, checkoutParams as never);
    },
    [navigation, barberId, serviceId, tenantId],
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

          {loadingSlots ? (
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
