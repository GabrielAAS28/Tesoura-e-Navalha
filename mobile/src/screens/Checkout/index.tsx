import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {ActivityIndicator, Alert} from 'react-native';
import {useTheme} from 'styled-components/native';
import {StackActions, useNavigation, useRoute} from '@react-navigation/native';
import Svg, {Circle, Path, Rect} from 'react-native-svg';
import {format} from 'date-fns';
import {ptBR} from 'date-fns/locale';
import Avatar from '~/components/Avatar';
import Button from '~/components/Button';
import {fetchTenantBarbers} from '~/services/tenantService';
import {fetchTenantServices} from '~/services/servicoService';
import {createAppointment} from '~/services/agendamentoService';
import {formatBRL} from '~/utils/format';
import type {BarberWithProfile, Service} from '~/types';
import {
  Screen,
  HeaderRow,
  BackButton,
  HeaderTitle,
  Scroller,
  Content,
  SummaryCard,
  BarberRow,
  BarberName,
  Divider,
  SummaryRow,
  SummaryLabel,
  SummaryValue,
  SectionBlock,
  SectionTitle,
  PaymentOption,
  PaymentIconTile,
  PaymentLabel,
  RadioOuter,
  TotalsBlock,
  TotalRow,
  TotalLabel,
  TotalValue,
  Footer,
  FooterNote,
  LoadingContainer,
  ErrorText,
} from './styles';

// Parâmetros recebidos de Agendamento: {serviceId, barberId, startsAtISO,
// tenantId} — tenantId foi adicionado ao contrato do brief original (ver
// "Controller ruling" do dispatch desta task) porque esta tela precisa dele
// para re-resolver serviço/barbeiro (não existem fetchServiceById nem
// fetchBarberById).
export type CheckoutParams = {
  serviceId: string;
  barberId: string;
  startsAtISO: string;
  tenantId: string;
};

type PaymentMethod = 'pix' | 'card' | 'local';

// Ícones específicos desta tela (PIX/cartão/local) copiados literalmente de
// design/Checkout.dc.html — não existem variantes equivalentes em
// ~/components/Icon.tsx hoje (mesma solução de ícones locais já usada em
// BarbeiroCadastro/index.tsx).
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

function PixIcon({color}: {color: string}) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill={color} stroke="none">
      <Path d="M13 2L3 14h7l-1 8 11-14h-7z" />
    </Svg>
  );
}

function CardIcon({color}: {color: string}) {
  return (
    <Svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round">
      <Rect x="2" y="5" width="20" height="14" rx="2" />
      <Path d="M2 10h20" />
    </Svg>
  );
}

function LocationIcon({color}: {color: string}) {
  return (
    <Svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round">
      <Path d="M12 21s7-7.5 7-12a7 7 0 1 0-14 0c0 4.5 7 12 7 12z" />
      <Circle cx="12" cy="9" r="2.5" />
    </Svg>
  );
}

function CheckIcon({color}: {color: string}) {
  return (
    <Svg
      width={12}
      height={12}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2.8}
      strokeLinecap="round"
      strokeLinejoin="round">
      <Path d="M20 6L9 17l-5-5" />
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

function capitalize(text: string): string {
  return text.length === 0 ? text : text.charAt(0).toUpperCase() + text.slice(1);
}

const PAYMENT_OPTIONS: {key: PaymentMethod; label: string}[] = [
  {key: 'pix', label: 'PIX'},
  {key: 'card', label: 'Cartão de crédito'},
  {key: 'local', label: 'Pagar no local'},
];

export default function Checkout() {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  // Leitura defensiva dos params — mesmo padrão de
  // BarbeiroCadastroEtapa2/index.tsx.
  const params = (route.params ?? {}) as Partial<CheckoutParams>;
  const {serviceId, barberId, startsAtISO, tenantId} = params;

  const [barbers, setBarbers] = useState<BarberWithProfile[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  // Seleção de forma de pagamento é apenas visual (fiel a
  // design/Checkout.dc.html): `createAppointment`/a Edge Function
  // `create_appointment` não recebem nenhum parâmetro de pagamento — não há
  // coluna/fluxo de cobrança no schema atual.
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!tenantId || !serviceId || !barberId || !startsAtISO) {
        if (!cancelled) {
          setLoadError('Parâmetros de navegação inválidos.');
          setLoading(false);
        }
        return;
      }
      setLoading(true);
      setLoadError(null);
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
          setLoadError(err instanceof Error ? err.message : String(err));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [tenantId, serviceId, barberId, startsAtISO]);

  const service = useMemo(() => services.find(s => s.id === serviceId) ?? null, [services, serviceId]);
  const barber = useMemo(() => barbers.find(b => b.id === barberId) ?? null, [barbers, barberId]);
  const startsAt = useMemo(() => (startsAtISO ? new Date(startsAtISO) : null), [startsAtISO]);

  const goBack = useCallback(() => navigation.goBack(), [navigation]);

  const handleConfirmar = useCallback(async () => {
    if (!barberId || !serviceId || !startsAtISO) return;
    setSubmitting(true);
    try {
      // ÚNICO caminho que grava um agendamento: a Edge Function
      // `create_appointment` (via agendamentoService.createAppointment) —
      // ela é o gate real anti-double-booking (constraint EXCLUDE no banco).
      // NUNCA um insert direto em `appointments`.
      await createAppointment({
        barber_id: barberId,
        service_id: serviceId,
        starts_at: startsAtISO,
      });
      // Sucesso não é uma mudança de estado de autenticação, então
      // AuthContext não navega sozinho aqui — é preciso um navigate manual.
      // 'Agendamentos' não é uma tela deste HomeStack local: navegamos pelo
      // navigator pai (o Tab.Navigator) explicitamente via getParent() em vez
      // de deixar o React Navigation subir sozinho, porque também precisamos
      // resetar o HomeStack local (abaixo) — se resolvêssemos via
      // navigation.navigate direto, o HomeStack ficaria com
      // Servicos/Agendamento/Checkout empilhados por baixo. Troca de aba
      // primeiro, popToTop depois: assim o reset do HomeStack acontece com a
      // aba "Início" já fora de foco, sem um frame visível voltando para
      // Main antes de trocar de aba.
      navigation.getParent()?.navigate('Agendamentos' as never);
      navigation.dispatch(StackActions.popToTop());
    } catch (err) {
      // Erro de conflito (double-booking) retornado pela Edge Function, ou
      // qualquer outro erro — mostra Alert e permanece na tela, sem retry
      // automático.
      Alert.alert('Erro', err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  }, [barberId, serviceId, startsAtISO, navigation]);

  if (loading) {
    return (
      <Screen>
        <LoadingContainer>
          <ActivityIndicator color={theme.colors.accent} />
        </LoadingContainer>
      </Screen>
    );
  }

  if (loadError || !service || !barber || !startsAt) {
    return (
      <Screen>
        <HeaderRow>
          <BackButton onPress={goBack} activeOpacity={0.8}>
            <ChevronLeftIcon color={theme.colors.textPrimary} />
          </BackButton>
          <HeaderTitle>Confirmar Agendamento</HeaderTitle>
        </HeaderRow>
        <LoadingContainer>
          <ErrorText>{loadError ?? 'Não foi possível carregar os dados do agendamento.'}</ErrorText>
        </LoadingContainer>
      </Screen>
    );
  }

  const dateLabel = capitalize(format(startsAt, "EEEEEE, dd 'de' MMMM", {locale: ptBR}));
  const timeLabel = format(startsAt, 'HH:mm');

  return (
    <Screen>
      <HeaderRow>
        <BackButton onPress={goBack} activeOpacity={0.8}>
          <ChevronLeftIcon color={theme.colors.textPrimary} />
        </BackButton>
        <HeaderTitle>Confirmar Agendamento</HeaderTitle>
      </HeaderRow>

      <Scroller>
        <Content>
          <SummaryCard>
            <BarberRow>
              <Avatar initials={getInitials(barber.profile?.full_name)} size={48} />
              <BarberName>{barber.profile?.full_name ?? 'Barbeiro'}</BarberName>
            </BarberRow>
            <Divider />
            <SummaryRow>
              <SummaryLabel>Serviço</SummaryLabel>
              <SummaryValue>{service.name}</SummaryValue>
            </SummaryRow>
            <SummaryRow>
              <SummaryLabel>Data</SummaryLabel>
              <SummaryValue>{dateLabel}</SummaryValue>
            </SummaryRow>
            <SummaryRow>
              <SummaryLabel>Horário</SummaryLabel>
              <SummaryValue>{timeLabel}</SummaryValue>
            </SummaryRow>
            <SummaryRow>
              <SummaryLabel>Duração</SummaryLabel>
              <SummaryValue>{service.duration_minutes} min</SummaryValue>
            </SummaryRow>
          </SummaryCard>

          <SectionBlock>
            <SectionTitle>Forma de pagamento</SectionTitle>
            {PAYMENT_OPTIONS.map(option => {
              const selected = paymentMethod === option.key;
              return (
                <PaymentOption
                  key={option.key}
                  selected={selected}
                  onPress={() => setPaymentMethod(option.key)}
                  activeOpacity={0.8}>
                  <PaymentIconTile>
                    {option.key === 'pix' && <PixIcon color={theme.colors.accent} />}
                    {option.key === 'card' && <CardIcon color={theme.colors.accent} />}
                    {option.key === 'local' && <LocationIcon color={theme.colors.accent} />}
                  </PaymentIconTile>
                  <PaymentLabel>{option.label}</PaymentLabel>
                  <RadioOuter selected={selected}>
                    {selected && <CheckIcon color={theme.colors.bg} />}
                  </RadioOuter>
                </PaymentOption>
              );
            })}
          </SectionBlock>

          <TotalsBlock>
            <TotalRow>
              <SummaryLabel>Subtotal</SummaryLabel>
              <SummaryValue>{formatBRL(service.price_cents)}</SummaryValue>
            </TotalRow>
            <TotalRow>
              <SummaryLabel>Taxa de serviço</SummaryLabel>
              <SummaryValue>{formatBRL(0)}</SummaryValue>
            </TotalRow>
            <Divider />
            <TotalRow>
              <TotalLabel>Total</TotalLabel>
              <TotalValue>{formatBRL(service.price_cents)}</TotalValue>
            </TotalRow>
          </TotalsBlock>
        </Content>
      </Scroller>

      <Footer>
        <Button title="Confirmar Pagamento" onPress={handleConfirmar} loading={submitting} />
        <FooterNote>Cancelamento gratuito até 2h antes do horário</FooterNote>
      </Footer>
    </Screen>
  );
}
