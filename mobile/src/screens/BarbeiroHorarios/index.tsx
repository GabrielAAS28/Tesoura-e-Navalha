import React, {useCallback, useEffect, useState} from 'react';
import {ActivityIndicator, Alert, Modal} from 'react-native';
import {useTheme} from 'styled-components/native';
import Svg, {Path} from 'react-native-svg';
import Button from '~/components/Button';
import TextField from '~/components/TextField';
import {useAuth} from '~/contexts/AuthContext';
import {fetchBarberByProfileId} from '~/services/barberService';
import {createWorkingHours, deleteWorkingHours, fetchBarberWorkingHours} from '~/services/horarioService';
import type {Barber, WorkingHours} from '~/types';
import {
  Screen,
  HeaderRow,
  BackButton,
  HeaderTitle,
  Scroller,
  SectionBlock,
  SectionTitle,
  WeekdaysRow,
  WeekdayCircle,
  WeekdayLabel,
  DayRangeList,
  DayRangeRow,
  DayRangeName,
  DayRangeValueGroup,
  DayRangeValue,
  DayRangeClosedLabel,
  InlineHeaderRow,
  StaticSwitchTrack,
  StaticSwitchThumb,
  TimesRow,
  TimeFieldBlock,
  TimeFieldLabel,
  TimeFieldBox,
  TimeFieldValue,
  BufferRow,
  BufferOption,
  BufferOptionLabel,
  HelperText,
  Footer,
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

// Ícone de chevron-left copiado de design/BarbeiroHorarios.dc.html (linha
// 21) — Icon.tsx só tem "chevronRight" (mesma solução já usada em
// Servicos/index.tsx e Checkout/index.tsx).
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

function PencilIcon({color}: {color: string}) {
  return (
    <Svg
      width={13}
      height={13}
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

// Convenção de weekday confirmada em mobile/__tests__/slots.test.ts (comentário
// "2026-09-07 é uma segunda-feira (weekday 1)") e em ~/services/slots.ts
// (`date.getDay()`): 0 = Domingo ... 6 = Sábado, igual ao `Date.getDay()` do
// JS — a mesma convenção usada por `working_hours.weekday` neste projeto.
//
// A ordem de exibição abaixo (Segunda→Domingo) segue design/BarbeiroHorarios
// .dc.html (círculos "S T Q Q S S D" = Seg/Ter/Qua/Qui/Sex/Sáb/Dom), mas os
// valores de weekday persistidos continuam 0-6 no padrão getDay().
const WEEKDAY_ORDER: {value: number; short: string; full: string}[] = [
  {value: 1, short: 'S', full: 'Segunda-feira'},
  {value: 2, short: 'T', full: 'Terça-feira'},
  {value: 3, short: 'Q', full: 'Quarta-feira'},
  {value: 4, short: 'Q', full: 'Quinta-feira'},
  {value: 5, short: 'S', full: 'Sexta-feira'},
  {value: 6, short: 'S', full: 'Sábado'},
  {value: 0, short: 'D', full: 'Domingo'},
];

const DEFAULT_START = '09:00';
const DEFAULT_END = '19:00';
const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

type DayState = {
  enabled: boolean;
  start: string;
  end: string;
  existingId: string | null;
};

type DaysMap = Record<number, DayState>;

function buildDaysFromRows(rows: WorkingHours[]): DaysMap {
  const map = {} as DaysMap;
  for (const {value} of WEEKDAY_ORDER) {
    // Modelo desta tela assume no máximo 1 intervalo por dia da semana (ver
    // "Controller ruling" #4 do dispatch — exibição por dia individual, não
    // agrupada). Se existir mais de uma linha para o mesmo weekday (caso raro,
    // fora do fluxo normal desta UI), só a primeira é representada/editável
    // aqui; linhas extras não são tocadas pelo Salvar.
    const row = rows.find(r => r.weekday === value);
    map[value] = row
      ? {enabled: true, start: row.start_time.slice(0, 5), end: row.end_time.slice(0, 5), existingId: row.id}
      : {enabled: false, start: DEFAULT_START, end: DEFAULT_END, existingId: null};
  }
  return map;
}

export default function BarbeiroHorarios() {
  const theme = useTheme();
  const {profile} = useAuth();

  const [barber, setBarber] = useState<Barber | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // `days`/`initialDays`: estado local editável vs. snapshot do que está
  // realmente salvo no servidor. Toques nos círculos e edições de horário só
  // alteram `days` — "Salvar Configurações" é quem calcula o diff contra
  // `initialDays` e chama createWorkingHours/deleteWorkingHours (ver escolha
  // "batelada" documentada no relatório desta task).
  const [days, setDays] = useState<DaysMap>({});
  const [initialDays, setInitialDays] = useState<DaysMap>({});
  const [saving, setSaving] = useState(false);

  const [editingWeekday, setEditingWeekday] = useState<number | null>(null);
  const [editStart, setEditStart] = useState('');
  const [editEnd, setEditEnd] = useState('');
  const [editError, setEditError] = useState<string | null>(null);

  const loadHorarios = useCallback(async () => {
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
      setBarber(resolvedBarber);
      const rows = await fetchBarberWorkingHours(resolvedBarber.id);
      const built = buildDaysFromRows(rows);
      setDays(built);
      setInitialDays(built);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [profile?.id]);

  useEffect(() => {
    loadHorarios();
  }, [loadHorarios]);

  const toggleWeekday = useCallback((weekday: number) => {
    setDays(prev => ({
      ...prev,
      [weekday]: {...prev[weekday], enabled: !prev[weekday].enabled},
    }));
  }, []);

  const openEditModal = useCallback(
    (weekday: number) => {
      const day = days[weekday];
      if (!day?.enabled) return;
      setEditingWeekday(weekday);
      setEditStart(day.start);
      setEditEnd(day.end);
      setEditError(null);
    },
    [days],
  );

  const closeEditModal = useCallback(() => {
    setEditingWeekday(null);
    setEditError(null);
  }, []);

  const handleSalvarHorarioDoDia = useCallback(() => {
    if (editingWeekday === null) return;
    if (!TIME_PATTERN.test(editStart) || !TIME_PATTERN.test(editEnd)) {
      setEditError('Use o formato HH:mm (ex: 09:00).');
      return;
    }
    if (editEnd <= editStart) {
      setEditError('O horário de fim deve ser depois do início.');
      return;
    }
    setDays(prev => ({
      ...prev,
      [editingWeekday]: {...prev[editingWeekday], start: editStart, end: editEnd},
    }));
    closeEditModal();
  }, [editingWeekday, editStart, editEnd, closeEditModal]);

  // Persiste todas as mudanças pendentes de uma vez (ver "Controller ruling"
  // Step 3 do dispatch: escolha de aplicar em lote atrás do botão "Salvar
  // Configurações", em vez de imediatamente a cada toque). Não existe
  // `updateWorkingHours` (Interfaces desta task só listam create/delete) —
  // uma mudança de horário num dia já habilitado é implementada como create
  // da linha nova + delete da antiga.
  //
  // Ordem CREATE-antes-de-DELETE é proposital (fix de code review): se o
  // `createWorkingHours` da nova faixa falhar (rede, validação etc.), a
  // linha antiga em `deleteWorkingHours` nunca é chamada — o dia mantém seu
  // expediente anterior em vez de ficar sem nenhuma linha (o que deixaria o
  // barbeiro silenciosamente sem agenda disponível naquele dia até o próximo
  // "Salvar" bem-sucedido). Pior caso de uma falha no meio do laço agora é
  // uma linha antiga "sobrando" (duplicata inofensiva, seria substituída no
  // próximo save), nunca um dia com zero linhas.
  const handleSalvarConfiguracoes = useCallback(async () => {
    if (!barber) return;
    setSaving(true);
    try {
      for (const {value: weekday} of WEEKDAY_ORDER) {
        const before = initialDays[weekday];
        const after = days[weekday];
        if (!before || !after) continue;

        const timesChanged =
          before.enabled && after.enabled && (before.start !== after.start || before.end !== after.end);

        const shouldCreate = after.enabled && (!before.enabled || timesChanged);
        const shouldDelete = before.enabled && before.existingId && (!after.enabled || timesChanged);

        if (shouldCreate) {
          await createWorkingHours({
            barber_id: barber.id,
            weekday,
            start_time: `${after.start}:00`,
            end_time: `${after.end}:00`,
          });
        }
        if (shouldDelete && before.existingId) {
          await deleteWorkingHours(before.existingId);
        }
      }

      const rows = await fetchBarberWorkingHours(barber.id);
      const rebuilt = buildDaysFromRows(rows);
      setDays(rebuilt);
      setInitialDays(rebuilt);
      Alert.alert('Sucesso', 'Configurações de horário salvas.');
    } catch (err) {
      Alert.alert('Erro', err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }, [barber, days, initialDays]);

  return (
    <Screen>
      <HeaderRow>
        <BackButton disabled activeOpacity={1}>
          <ChevronLeftIcon color={theme.colors.textPrimary} />
        </BackButton>
        <HeaderTitle>Horários & Expediente</HeaderTitle>
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
        <>
          <Scroller>
            <SectionBlock>
              <SectionTitle>Dias de trabalho</SectionTitle>
              <WeekdaysRow>
                {WEEKDAY_ORDER.map(({value, short}) => {
                  const active = days[value]?.enabled ?? false;
                  return (
                    <WeekdayCircle
                      key={value}
                      active={active}
                      onPress={() => toggleWeekday(value)}
                      activeOpacity={0.8}>
                      <WeekdayLabel active={active}>{short}</WeekdayLabel>
                    </WeekdayCircle>
                  );
                })}
              </WeekdaysRow>
            </SectionBlock>

            <SectionBlock>
              <SectionTitle>Expediente por dia</SectionTitle>
              <DayRangeList>
                {WEEKDAY_ORDER.map(({value, full}) => {
                  const day = days[value];
                  if (!day?.enabled) {
                    return (
                      <DayRangeRow key={value} dimmed disabled activeOpacity={1}>
                        <DayRangeName>{full}</DayRangeName>
                        <DayRangeClosedLabel>Fechado</DayRangeClosedLabel>
                      </DayRangeRow>
                    );
                  }
                  return (
                    <DayRangeRow key={value} onPress={() => openEditModal(value)} activeOpacity={0.8}>
                      <DayRangeName>{full}</DayRangeName>
                      <DayRangeValueGroup>
                        <DayRangeValue>
                          {day.start} – {day.end}
                        </DayRangeValue>
                        <PencilIcon color={theme.colors.textSecondary} />
                      </DayRangeValueGroup>
                    </DayRangeRow>
                  );
                })}
              </DayRangeList>
            </SectionBlock>

            <SectionBlock>
              <InlineHeaderRow>
                <SectionTitle>Intervalo de almoço</SectionTitle>
                <StaticSwitchTrack on>
                  <StaticSwitchThumb on />
                </StaticSwitchTrack>
              </InlineHeaderRow>
              <TimesRow>
                <TimeFieldBlock>
                  <TimeFieldLabel>Início</TimeFieldLabel>
                  <TimeFieldBox>
                    <TimeFieldValue>12:00</TimeFieldValue>
                  </TimeFieldBox>
                </TimeFieldBlock>
                <TimeFieldBlock>
                  <TimeFieldLabel>Fim</TimeFieldLabel>
                  <TimeFieldBox>
                    <TimeFieldValue>13:30</TimeFieldValue>
                  </TimeFieldBox>
                </TimeFieldBlock>
              </TimesRow>
            </SectionBlock>

            <SectionBlock>
              <SectionTitle>Intervalo entre clientes</SectionTitle>
              <BufferRow>
                <BufferOption>
                  <BufferOptionLabel>0 min</BufferOptionLabel>
                </BufferOption>
                <BufferOption selected>
                  <BufferOptionLabel selected>10 min</BufferOptionLabel>
                </BufferOption>
                <BufferOption>
                  <BufferOptionLabel>15 min</BufferOptionLabel>
                </BufferOption>
              </BufferRow>
              <HelperText>Tempo de folga automático entre cada atendimento</HelperText>
            </SectionBlock>
          </Scroller>

          <Footer>
            <Button title="Salvar Configurações" onPress={handleSalvarConfiguracoes} loading={saving} />
          </Footer>
        </>
      )}

      <Modal visible={editingWeekday !== null} transparent animationType="fade" onRequestClose={closeEditModal}>
        <ModalBackdrop>
          <ModalCard>
            <ModalTitle>
              {editingWeekday !== null
                ? WEEKDAY_ORDER.find(w => w.value === editingWeekday)?.full
                : ''}
            </ModalTitle>
            <ModalFormGroup>
              <TimesRow>
                <TimeFieldBlock>
                  <TextField label="Início" value={editStart} onChangeText={setEditStart} placeholder="09:00" />
                </TimeFieldBlock>
                <TimeFieldBlock>
                  <TextField label="Fim" value={editEnd} onChangeText={setEditEnd} placeholder="19:00" />
                </TimeFieldBlock>
              </TimesRow>
              {editError && <ModalErrorText>{editError}</ModalErrorText>}
            </ModalFormGroup>
            <ModalActionsRow>
              <ModalActionButton>
                <Button variant="secondary" title="Cancelar" onPress={closeEditModal} />
              </ModalActionButton>
              <ModalActionButton>
                <Button title="Salvar" onPress={handleSalvarHorarioDoDia} />
              </ModalActionButton>
            </ModalActionsRow>
          </ModalCard>
        </ModalBackdrop>
      </Modal>
    </Screen>
  );
}
