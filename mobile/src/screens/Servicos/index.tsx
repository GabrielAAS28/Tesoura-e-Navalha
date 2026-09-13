import React, {useCallback, useEffect, useState} from 'react';
import {ActivityIndicator} from 'react-native';
import {useTheme} from 'styled-components/native';
import {useNavigation} from '@react-navigation/native';
import Svg, {Path} from 'react-native-svg';
import ServiceCard from '~/components/ServiceCard';
import {IconName} from '~/components/Icon';
import {fetchTenants} from '~/services/tenantService';
import {fetchTenantServices} from '~/services/servicoService';
import type {Service} from '~/types';
import type {AgendamentoParams} from '~/screens/Agendamento';
import {
  Screen,
  HeaderRow,
  BackButton,
  HeaderTitle,
  Scroller,
  List,
  LoadingContainer,
  ErrorText,
} from './styles';

// Path do chevron-left copiado de design/Servicos.dc.html (linha 21) —
// Icon.tsx só tem "chevronRight", não uma variante para a esquerda (mesma
// solução já usada em BarbeiroCadastro/index.tsx).
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

// Não existe coluna de ícone em `services` — mapeia o nome do serviço para
// um IconName por heurística de substring (case-insensitive), idêntica à
// função homônima de Main/index.tsx (Task 13). Não há export compartilhado
// para essa heurística ainda, então é replicada aqui literalmente, conforme
// autorizado pelo dispatch desta task ("reuse the same logic/heuristic").
function resolveServiceIcon(name: string): IconName {
  const normalized = name.toLowerCase();
  if (normalized.includes('combo')) return 'combo';
  if (normalized.includes('barba')) return 'beard';
  if (normalized.includes('corte')) return 'scissors';
  return 'scissors';
}

export default function Servicos() {
  const theme = useTheme();
  const navigation = useNavigation();

  const [services, setServices] = useState<Service[]>([]);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const tenants = await fetchTenants();
        // Piloto tem exatamente um tenant — defesa para não crashar em
        // tenants[0] caso a tabela esteja vazia (mesma defesa de Main).
        if (tenants.length === 0) {
          if (!cancelled) setError('Nenhuma barbearia encontrada.');
          return;
        }
        const currentTenantId = tenants[0].id;
        const servicesData = await fetchTenantServices(currentTenantId);
        if (!cancelled) {
          setTenantId(currentTenantId);
          setServices(servicesData);
        }
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
  }, []);

  const goBack = useCallback(() => navigation.goBack(), [navigation]);

  const goToAgendamento = useCallback(
    (serviceId: string) => {
      if (!tenantId) return;
      const params: AgendamentoParams = {serviceId, tenantId};
      navigation.navigate('Agendamento' as never, params as never);
    },
    [navigation, tenantId],
  );

  return (
    <Screen>
      <HeaderRow>
        <BackButton onPress={goBack} activeOpacity={0.8}>
          <ChevronLeftIcon color={theme.colors.textPrimary} />
        </BackButton>
        <HeaderTitle>Escolher Serviço</HeaderTitle>
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
          <List>
            {services.map(service => (
              <ServiceCard
                key={service.id}
                icon={resolveServiceIcon(service.name)}
                name={service.name}
                durationMinutes={service.duration_minutes}
                priceCents={service.price_cents}
                onPress={() => goToAgendamento(service.id)}
              />
            ))}
          </List>
        </Scroller>
      )}
    </Screen>
  );
}
