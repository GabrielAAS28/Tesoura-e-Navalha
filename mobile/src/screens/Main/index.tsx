import React, {useCallback, useEffect, useState} from 'react';
import {ActivityIndicator} from 'react-native';
import {useTheme} from 'styled-components/native';
import {useNavigation} from '@react-navigation/native';
import Icon, {IconName} from '~/components/Icon';
import Avatar from '~/components/Avatar';
import HeroCard from '~/components/HeroCard';
import ServiceCard from '~/components/ServiceCard';
import BarberCard from '~/components/BarberCard';
import {useAuth} from '~/contexts/AuthContext';
import {fetchTenants, fetchTenantBarbers} from '~/services/tenantService';
import {fetchTenantServices} from '~/services/servicoService';
import type {BarberWithProfile, Service} from '~/types';
import {
  Screen,
  HeaderRow,
  HeaderTextBlock,
  Greeting,
  GreetingSubtitle,
  HeaderActions,
  BellButton,
  Scroller,
  Content,
  SectionBlock,
  SectionHeaderRow,
  SectionTitle,
  SeeAllLink,
  SeeAllLabel,
  ServicesRow,
  BarbersRow,
  LoadingContainer,
  ErrorText,
} from './styles';

// Não existe coluna de ícone em `services` (Task 13 brief, gap #3) — mapeia
// o nome do serviço para um IconName por heurística de substring
// (case-insensitive). "combo" é checado antes de "corte" pois nomes reais de
// combo (ex.: "Combo Corte + Barba", design/Servicos.dc.html) também contêm
// a palavra "corte".
function resolveServiceIcon(name: string): IconName {
  const normalized = name.toLowerCase();
  if (normalized.includes('combo')) return 'combo';
  if (normalized.includes('barba')) return 'beard';
  if (normalized.includes('corte')) return 'scissors';
  return 'scissors';
}

// Deriva iniciais (até 2 letras, maiúsculas) do nome completo: primeira
// letra do primeiro e do último "token" do nome. Não há helper equivalente
// em ~/utils hoje — o brief da Task 13 autoriza um helper local aqui.
function getInitials(fullName: string | null | undefined): string {
  const trimmed = (fullName ?? '').trim();
  if (!trimmed) return '?';
  const parts = trimmed.split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? '' : '';
  return (first + last).toUpperCase();
}

export default function Main() {
  const theme = useTheme();
  const navigation = useNavigation();
  const {profile} = useAuth();

  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<BarberWithProfile[]>([]);
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
        // tenants[0] caso a tabela esteja vazia (ambiente novo/seed
        // faltando), mostrando um estado de erro em vez disso.
        if (tenants.length === 0) {
          if (!cancelled) setError('Nenhuma barbearia encontrada.');
          return;
        }
        const tenantId = tenants[0].id;
        const [servicesData, barbersData] = await Promise.all([
          fetchTenantServices(tenantId),
          fetchTenantBarbers(tenantId),
        ]);
        if (!cancelled) {
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

  // profile.full_name pode ser null (perfil ainda sem nome preenchido) —
  // cai para "Cliente" na saudação e "?" nas iniciais do avatar.
  const firstName = profile?.full_name?.trim().split(/\s+/)[0] || 'Cliente';
  const initials = getInitials(profile?.full_name);

  const goToServicos = useCallback(() => {
    navigation.navigate('Servicos' as never);
  }, [navigation]);

  return (
    <Screen>
      <HeaderRow>
        <HeaderTextBlock>
          <Greeting>Olá, {firstName}</Greeting>
          <GreetingSubtitle>Pronto para o próximo corte?</GreetingSubtitle>
        </HeaderTextBlock>
        <HeaderActions>
          <BellButton activeOpacity={0.8}>
            <Icon name="bell" size={19} color={theme.colors.textPrimary} strokeWidth={1.8} />
          </BellButton>
          <Avatar initials={initials} size={44} />
        </HeaderActions>
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
            <HeroCard
              title="Agendamento Rápido"
              subtitle="Marque seu horário em poucos segundos"
              ctaLabel="Agendar Agora"
              onPress={goToServicos}
            />

            <SectionBlock>
              <SectionHeaderRow>
                <SectionTitle>Serviços em destaque</SectionTitle>
                <SeeAllLink onPress={goToServicos} activeOpacity={0.7}>
                  <SeeAllLabel>Ver todos</SeeAllLabel>
                </SeeAllLink>
              </SectionHeaderRow>
              <ServicesRow>
                {services.map(service => (
                  <ServiceCard
                    key={service.id}
                    icon={resolveServiceIcon(service.name)}
                    name={service.name}
                    durationMinutes={service.duration_minutes}
                    priceCents={service.price_cents}
                  />
                ))}
              </ServicesRow>
            </SectionBlock>

            <SectionBlock>
              <SectionTitle>Barbeiros favoritos</SectionTitle>
              <BarbersRow>
                {barbers.map(barber => (
                  <BarberCard
                    key={barber.id}
                    initials={getInitials(barber.profile?.full_name)}
                    name={barber.profile?.full_name ?? 'Barbeiro'}
                    selected={false}
                  />
                ))}
              </BarbersRow>
            </SectionBlock>
          </Content>
        </Scroller>
      )}
    </Screen>
  );
}
