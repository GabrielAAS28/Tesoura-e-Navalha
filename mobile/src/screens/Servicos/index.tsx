import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {ActivityIndicator} from 'react-native';
import {useTheme} from 'styled-components/native';
import {useNavigation} from '@react-navigation/native';
import Svg, {Path} from 'react-native-svg';
import BarberCard from '~/components/BarberCard';
import Button from '~/components/Button';
import Icon, {IconName} from '~/components/Icon';
import {formatBRL} from '~/utils/format';
import {fetchTenantBarbers, fetchTenants} from '~/services/tenantService';
import {fetchTenantServices} from '~/services/servicoService';
import type {BarberWithProfile, Service} from '~/types';
import type {AgendamentoParams} from '~/screens/Agendamento';
import {
  Screen,
  HeaderRow,
  BackButton,
  HeaderTitle,
  Scroller,
  Content,
  List,
  Row,
  RowIconTile,
  RowTextBlock,
  RowName,
  RowSubtitle,
  RowPriceBlock,
  RowPrice,
  SelectionCircle,
  SectionBlock,
  SectionTitle,
  BarbersRow,
  BarberCardWrapper,
  BarberSubtitle,
  Footer,
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

// Checkmark do indicador de seleção (círculo de 22px em
// design/Servicos.dc.html, linha 41) — glyph de uso único para esta tela,
// não vale estender o union compartilhado de Icon.tsx por um checkmark que
// só aparece aqui.
function CheckIcon({color}: {color: string}) {
  return (
    <Svg
      width={13}
      height={13}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2.6}
      strokeLinecap="round"
      strokeLinejoin="round">
      <Path d="M20 6L9 17l-5-5" />
    </Svg>
  );
}

// Não existe coluna de ícone em `services` — mapeia o nome do serviço para
// um IconName por heurística de substring (case-insensitive), idêntica à
// função homônima de Main/index.tsx (Task 13). Não há export compartilhado
// para essa heurística ainda, então é replicada aqui literalmente.
function resolveServiceIcon(name: string): IconName {
  const normalized = name.toLowerCase();
  if (normalized.includes('combo')) return 'combo';
  if (normalized.includes('barba')) return 'beard';
  if (normalized.includes('corte')) return 'scissors';
  return 'scissors';
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

export default function Servicos() {
  const theme = useTheme();
  const navigation = useNavigation();

  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<BarberWithProfile[]>([]);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedBarberId, setSelectedBarberId] = useState<string | null>(null);

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
        const [servicesData, barbersData] = await Promise.all([
          fetchTenantServices(currentTenantId),
          fetchTenantBarbers(currentTenantId),
        ]);
        if (!cancelled) {
          setTenantId(currentTenantId);
          setServices(servicesData);
          setBarbers(barbersData);
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

  const canContinue = useMemo(
    () => Boolean(selectedServiceId && selectedBarberId && tenantId),
    [selectedServiceId, selectedBarberId, tenantId],
  );

  const handleContinuar = useCallback(() => {
    if (!selectedServiceId || !selectedBarberId || !tenantId) return;
    const params: AgendamentoParams = {
      serviceId: selectedServiceId,
      barberId: selectedBarberId,
      tenantId,
    };
    navigation.navigate('Agendamento' as never, params as never);
  }, [navigation, selectedServiceId, selectedBarberId, tenantId]);

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
          <Content>
            <List>
              {services.map(service => {
                const selected = selectedServiceId === service.id;
                return (
                  <Row
                    key={service.id}
                    selected={selected}
                    onPress={() => setSelectedServiceId(service.id)}
                    activeOpacity={0.8}>
                    <RowIconTile selected={selected}>
                      <Icon
                        name={resolveServiceIcon(service.name)}
                        size={22}
                        color={theme.colors.accent}
                        strokeWidth={1.8}
                      />
                    </RowIconTile>
                    <RowTextBlock>
                      <RowName>{service.name}</RowName>
                      {/* Mockup mostra "{duração}min · avaliação X.X", mas não
                          existe coluna de avaliação em `services` — mesmo gap
                          já documentado em Main/ServiceCard (Task 13):
                          omitimos a avaliação fake em vez de inventar um
                          número. */}
                      <RowSubtitle>{service.duration_minutes}min</RowSubtitle>
                    </RowTextBlock>
                    <RowPriceBlock>
                      <RowPrice selected={selected}>{formatBRL(service.price_cents)}</RowPrice>
                      <SelectionCircle selected={selected}>
                        {selected && <CheckIcon color={theme.colors.bg} />}
                      </SelectionCircle>
                    </RowPriceBlock>
                  </Row>
                );
              })}
            </List>

            <SectionBlock>
              <SectionTitle>Escolha o barbeiro</SectionTitle>
              <BarbersRow>
                {barbers.map(barber => {
                  const selected = selectedBarberId === barber.id;
                  // Mockup mostra um subtítulo de papel/especialidade
                  // ("Barbeiro sênior" etc.) que não existe como coluna —
                  // usamos `bio` (texto livre) quando presente/não-vazio,
                  // com fallback para o rótulo genérico "Barbeiro".
                  const subtitle = barber.bio?.trim() || 'Barbeiro';
                  return (
                    <BarberCardWrapper key={barber.id} selected={selected}>
                      <BarberCard
                        initials={getInitials(barber.profile?.full_name)}
                        name={barber.profile?.full_name ?? 'Barbeiro'}
                        selected={selected}
                        onPress={() => setSelectedBarberId(barber.id)}
                      />
                      <BarberSubtitle>{subtitle}</BarberSubtitle>
                    </BarberCardWrapper>
                  );
                })}
              </BarbersRow>
            </SectionBlock>
          </Content>
        </Scroller>
      )}

      {!loading && !error && (
        <Footer>
          <Button title="Continuar" onPress={handleContinuar} disabled={!canContinue} />
        </Footer>
      )}
    </Screen>
  );
}
