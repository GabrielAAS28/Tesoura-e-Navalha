import React, {useCallback, useEffect, useState} from 'react';
import {ActivityIndicator, Alert, Modal, TouchableOpacity} from 'react-native';
import {useTheme} from 'styled-components/native';
import Svg, {Path} from 'react-native-svg';
import Icon, {IconName} from '~/components/Icon';
import Button from '~/components/Button';
import TextField from '~/components/TextField';
import {useAuth} from '~/contexts/AuthContext';
import {createService, deleteService, fetchTenantServices} from '~/services/servicoService';
import {formatBRL} from '~/utils/format';
import type {Service} from '~/types';
import {
  Screen,
  HeaderBlock,
  HeaderTitle,
  HeaderSubtitle,
  Scroller,
  ServiceCardBlock,
  ServiceTopRow,
  ServiceNameGroup,
  ServiceIconTile,
  ServiceName,
  SwitchTrack,
  SwitchThumb,
  PillsRow,
  Pill,
  PillLabel,
  AddButton,
  AddButtonLabel,
  LoadingContainer,
  ErrorText,
  ModalBackdrop,
  ModalCard,
  ModalTitle,
  ModalFormGroup,
  ModalErrorText,
  ModalActionsRow,
  ModalActionButton,
} from './styles';

// Ícone de sobrancelha (placeholder "Sobrancelha") copiado literalmente de
// design/BarbeiroServicos.dc.html (linha 116) — não existe variante
// equivalente em ~/components/Icon.tsx hoje.
function EyebrowIcon({color}: {color: string}) {
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
      <Path d="M3 14c2-6 6-8 9-8s7 2 9 8" />
    </Svg>
  );
}

// Ícone de lápis (pílulas de preço/duração, somente decorativo — ver
// "Controller ruling" #2 do dispatch) copiado literalmente de
// design/BarbeiroServicos.dc.html (linha 41).
function PencilIcon({color}: {color: string}) {
  return (
    <Svg
      width={12}
      height={12}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round">
      <Path d="M12 20h9" />
      <Path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
    </Svg>
  );
}

// Não existe coluna de ícone em `services` (Task 13 brief, gap #3) — mapeia
// o nome do serviço para um IconName por heurística de substring, idêntica à
// função homônima de Main/index.tsx e Servicos/index.tsx. Não há export
// compartilhado para essa heurística ainda, então é replicada aqui.
function resolveServiceIcon(name: string): IconName {
  const normalized = name.toLowerCase();
  if (normalized.includes('combo')) return 'combo';
  if (normalized.includes('barba')) return 'beard';
  if (normalized.includes('corte')) return 'scissors';
  return 'scissors';
}

// Os dois itens abaixo (Pigmentação/Sobrancelha) aparecem esmaecidos no
// mockup como sugestões de catálogo sem dado real por trás — ver "Controller
// ruling" #1 do dispatch desta task. São renderizados como placeholders
// inertes (switch sempre desligado, sem onPress), nunca chamam
// `createService`.
const CATALOG_PLACEHOLDERS: {key: string; name: string; icon: 'beard' | 'eyebrow'}[] = [
  {key: 'pigmentacao', name: 'Pigmentação', icon: 'beard'},
  {key: 'sobrancelha', name: 'Sobrancelha', icon: 'eyebrow'},
];

export default function BarbeiroServicos() {
  const theme = useTheme();
  const {profile} = useAuth();

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Id do serviço sendo removido (switch desligado → confirmação →
  // deleteService) — desabilita o switch daquele card enquanto em voo.
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [durationStr, setDurationStr] = useState('');
  const [priceStr, setPriceStr] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const tenantId = profile?.tenant_id;
      if (!tenantId) {
        if (!cancelled) {
          setError('Perfil sem barbearia associada.');
          setLoading(false);
        }
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const data = await fetchTenantServices(tenantId);
        if (!cancelled) setServices(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [profile?.tenant_id]);

  const handleToggleOff = useCallback((service: Service) => {
    Alert.alert(
      'Remover serviço',
      `Deseja remover "${service.name}" da lista de serviços? Essa ação não pode ser desfeita.`,
      [
        {text: 'Cancelar', style: 'cancel'},
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            setDeletingId(service.id);
            try {
              await deleteService(service.id);
              setServices(prev => prev.filter(s => s.id !== service.id));
            } catch (err) {
              Alert.alert('Erro', err instanceof Error ? err.message : String(err));
            } finally {
              setDeletingId(null);
            }
          },
        },
      ],
    );
  }, []);

  const closeModal = useCallback(() => {
    setModalVisible(false);
    setName('');
    setDurationStr('');
    setPriceStr('');
    setFormError(null);
  }, []);

  const handleSalvarNovoServico = useCallback(async () => {
    const tenantId = profile?.tenant_id;
    if (!tenantId) {
      setFormError('Perfil sem barbearia associada.');
      return;
    }
    const trimmedName = name.trim();
    const durationMinutes = parseInt(durationStr, 10);
    const priceReais = parseFloat(priceStr.replace(',', '.'));

    if (!trimmedName || !Number.isFinite(durationMinutes) || durationMinutes <= 0) {
      setFormError('Informe um nome e uma duração válida (em minutos).');
      return;
    }
    if (!Number.isFinite(priceReais) || priceReais <= 0) {
      setFormError('Informe um preço válido (em reais).');
      return;
    }

    setFormError(null);
    setSubmitting(true);
    try {
      const created = await createService({
        tenant_id: tenantId,
        name: trimmedName,
        duration_minutes: durationMinutes,
        price_cents: Math.round(priceReais * 100),
      });
      setServices(prev => [...prev, created]);
      closeModal();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  }, [profile?.tenant_id, name, durationStr, priceStr, closeModal]);

  return (
    <Screen>
      <HeaderBlock>
        <HeaderTitle>Meus Serviços</HeaderTitle>
        <HeaderSubtitle>Ative e personalize preço e duração</HeaderSubtitle>
      </HeaderBlock>

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
          {services.map(service => (
            <ServiceCardBlock key={service.id}>
              <ServiceTopRow>
                <ServiceNameGroup>
                  <ServiceIconTile>
                    <Icon
                      name={resolveServiceIcon(service.name)}
                      size={18}
                      color={theme.colors.accent}
                      strokeWidth={1.8}
                    />
                  </ServiceIconTile>
                  <ServiceName>{service.name}</ServiceName>
                </ServiceNameGroup>
                {/* Serviço real = sempre "ligado" (existência é o estado
                    ligado, ver "Controller ruling" #1). Tocar para desligar
                    dispara confirmação + deleteService. */}
                <TouchableOpacity
                  disabled={deletingId === service.id}
                  activeOpacity={0.7}
                  onPress={() => handleToggleOff(service)}>
                  <SwitchTrack on>
                    <SwitchThumb on />
                  </SwitchTrack>
                </TouchableOpacity>
              </ServiceTopRow>
              <PillsRow>
                <Pill>
                  <PillLabel>{formatBRL(service.price_cents)}</PillLabel>
                  <PencilIcon color={theme.colors.textSecondary} />
                </Pill>
                <Pill>
                  <PillLabel>{service.duration_minutes} min</PillLabel>
                  <PencilIcon color={theme.colors.textSecondary} />
                </Pill>
              </PillsRow>
            </ServiceCardBlock>
          ))}

          {CATALOG_PLACEHOLDERS.map(placeholder => (
            <ServiceCardBlock key={placeholder.key} dimmed>
              <ServiceTopRow>
                <ServiceNameGroup>
                  <ServiceIconTile dimmed>
                    {placeholder.icon === 'beard' ? (
                      <Icon name="beard" size={18} color={theme.colors.textSecondary} strokeWidth={1.8} />
                    ) : (
                      <EyebrowIcon color={theme.colors.textSecondary} />
                    )}
                  </ServiceIconTile>
                  <ServiceName>{placeholder.name}</ServiceName>
                </ServiceNameGroup>
                <SwitchTrack on={false}>
                  <SwitchThumb on={false} />
                </SwitchTrack>
              </ServiceTopRow>
            </ServiceCardBlock>
          ))}

          <AddButton onPress={() => setModalVisible(true)} activeOpacity={0.8}>
            <Icon name="plus" size={16} color={theme.colors.textSecondary} strokeWidth={2} />
            <AddButtonLabel>Adicionar Novo Serviço Personalizado</AddButtonLabel>
          </AddButton>
        </Scroller>
      )}

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={closeModal}>
        <ModalBackdrop>
          <ModalCard>
            <ModalTitle>Novo serviço</ModalTitle>
            <ModalFormGroup>
              <TextField label="Nome" value={name} onChangeText={setName} placeholder="Ex: Corte Degradê" />
              <TextField
                label="Duração (min)"
                value={durationStr}
                onChangeText={setDurationStr}
                placeholder="30"
                keyboardType="number-pad"
              />
              <TextField
                label="Preço (R$)"
                value={priceStr}
                onChangeText={setPriceStr}
                placeholder="45"
                keyboardType="decimal-pad"
              />
              {formError && <ModalErrorText>{formError}</ModalErrorText>}
            </ModalFormGroup>
            <ModalActionsRow>
              <ModalActionButton>
                <Button variant="secondary" title="Cancelar" onPress={closeModal} disabled={submitting} />
              </ModalActionButton>
              <ModalActionButton>
                <Button title="Salvar" onPress={handleSalvarNovoServico} loading={submitting} />
              </ModalActionButton>
            </ModalActionsRow>
          </ModalCard>
        </ModalBackdrop>
      </Modal>
    </Screen>
  );
}
