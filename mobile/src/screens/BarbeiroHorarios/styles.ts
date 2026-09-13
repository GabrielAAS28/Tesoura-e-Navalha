import styled from 'styled-components/native';

export const Screen = styled.View`
  flex: 1;
  background-color: ${({theme}) => theme.colors.bg};
`;

export const HeaderRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${({theme}) => theme.spacing.md}px;
  padding: 28px 20px 12px;
`;

// Ícone de "voltar" fiel ao mockup, mas esta tela é a raiz de uma aba do
// Tab.Navigator (barber.routes.tsx) — não há destino de "voltar" real na
// pilha de navegação atual. Renderizado inerte (disabled), mesmo padrão do
// EditButton em Perfil/index.tsx (Task 15).
export const BackButton = styled.TouchableOpacity`
  width: 44px;
  height: 44px;
  border-radius: ${({theme}) => theme.radius.md}px;
  background-color: ${({theme}) => theme.colors.surface};
  border-width: 1px;
  border-color: ${({theme}) => theme.colors.border};
  align-items: center;
  justify-content: center;
`;

export const HeaderTitle = styled.Text`
  font-family: ${({theme}) => theme.font.semibold};
  font-size: 20px;
  font-weight: 600;
  color: ${({theme}) => theme.colors.textPrimary};
`;

export const Scroller = styled.ScrollView.attrs({
  contentContainerStyle: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 120,
    gap: 28,
    flexGrow: 1,
  },
  showsVerticalScrollIndicator: false,
})`
  flex: 1;
`;

export const SectionBlock = styled.View`
  gap: 14px;
`;

export const SectionTitle = styled.Text`
  font-family: ${({theme}) => theme.font.semibold};
  font-size: 15px;
  font-weight: 600;
  color: ${({theme}) => theme.colors.textPrimary};
`;

export const WeekdaysRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  gap: 6px;
`;

export const WeekdayCircle = styled.TouchableOpacity<{active: boolean}>`
  width: 44px;
  height: 44px;
  border-radius: ${({theme}) => theme.radius.full}px;
  align-items: center;
  justify-content: center;
  background-color: ${({active, theme}) => (active ? theme.colors.accent : theme.colors.surface)};
  border-width: ${({active}) => (active ? 0 : 1)}px;
  border-color: ${({theme}) => theme.colors.border};
`;

export const WeekdayLabel = styled.Text<{active: boolean}>`
  font-family: ${({theme}) => theme.font.bold};
  font-size: 12px;
  font-weight: 700;
  color: ${({active, theme}) => (active ? theme.colors.bg : theme.colors.textSecondary)};
`;

export const DayRangeList = styled.View`
  gap: 10px;
`;

export const DayRangeRow = styled.TouchableOpacity<{dimmed?: boolean}>`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  background-color: ${({theme}) => theme.colors.surface};
  border-width: 1px;
  border-color: ${({theme}) => theme.colors.border};
  border-radius: ${({theme}) => theme.radius.md}px;
  padding: 12px 14px;
  opacity: ${({dimmed}) => (dimmed ? 0.5 : 1)};
`;

export const DayRangeName = styled.Text`
  font-family: ${({theme}) => theme.font.semibold};
  font-size: 13px;
  font-weight: 600;
  color: ${({theme}) => theme.colors.textPrimary};
`;

export const DayRangeValueGroup = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 6px;
`;

export const DayRangeValue = styled.Text`
  font-family: ${({theme}) => theme.font.semibold};
  font-size: 13px;
  font-weight: 600;
  color: ${({theme}) => theme.colors.textPrimary};
`;

export const DayRangeClosedLabel = styled.Text`
  font-family: ${({theme}) => theme.font.medium};
  font-size: 13px;
  font-weight: 500;
  color: ${({theme}) => theme.colors.textSecondary};
`;

export const InlineHeaderRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

// Trilho/thumb do switch decorativo "Intervalo de almoço" — ver "Controller
// ruling" #3 do dispatch desta task: `working_hours` não tem colunas de
// intervalo de almoço, então esta seção é fixa/inerte (sempre "ligada",
// 12:00–13:30), sem TouchableOpacity envolvendo o switch.
export const StaticSwitchTrack = styled.View<{on: boolean}>`
  width: 44px;
  height: 24px;
  border-radius: ${({theme}) => theme.radius.full}px;
  padding: 2px;
  flex-direction: row;
  justify-content: ${({on}) => (on ? 'flex-end' : 'flex-start')};
  background-color: ${({on, theme}) => (on ? theme.colors.accent : theme.colors.border)};
`;

export const StaticSwitchThumb = styled.View<{on: boolean}>`
  width: 20px;
  height: 20px;
  border-radius: ${({theme}) => theme.radius.full}px;
  background-color: ${({on, theme}) => (on ? theme.colors.bg : theme.colors.textSecondary)};
`;

export const TimesRow = styled.View`
  flex-direction: row;
  gap: 10px;
`;

export const TimeFieldBlock = styled.View`
  flex: 1;
  gap: 6px;
`;

export const TimeFieldLabel = styled.Text`
  font-family: ${({theme}) => theme.font.semibold};
  font-size: 11px;
  font-weight: 600;
  color: ${({theme}) => theme.colors.textSecondary};
`;

export const TimeFieldBox = styled.View`
  height: 46px;
  border-radius: ${({theme}) => theme.radius.md}px;
  background-color: ${({theme}) => theme.colors.surface};
  border-width: 1px;
  border-color: ${({theme}) => theme.colors.border};
  align-items: center;
  justify-content: center;
`;

export const TimeFieldValue = styled.Text`
  font-family: ${({theme}) => theme.font.semibold};
  font-size: 14px;
  font-weight: 600;
  color: ${({theme}) => theme.colors.textPrimary};
`;

export const BufferRow = styled.View`
  flex-direction: row;
  gap: 10px;
`;

export const BufferOption = styled.View<{selected?: boolean}>`
  flex: 1;
  height: 44px;
  border-radius: ${({theme}) => theme.radius.md}px;
  align-items: center;
  justify-content: center;
  background-color: ${({selected, theme}) => (selected ? theme.colors.accent : 'transparent')};
  border-width: ${({selected}) => (selected ? 0 : 1)}px;
  border-color: ${({theme}) => theme.colors.border};
`;

export const BufferOptionLabel = styled.Text<{selected?: boolean}>`
  font-family: ${({selected, theme}) => (selected ? theme.font.bold : theme.font.semibold)};
  font-size: 13px;
  font-weight: ${({selected}) => (selected ? 700 : 600)};
  color: ${({selected, theme}) => (selected ? theme.colors.bg : theme.colors.textPrimary)};
`;

export const HelperText = styled.Text`
  font-family: ${({theme}) => theme.font.regular};
  font-size: 12px;
  font-weight: 400;
  color: ${({theme}) => theme.colors.textSecondary};
`;

export const Footer = styled.View`
  position: absolute;
  left: 0px;
  right: 0px;
  bottom: 0px;
  padding: 16px 20px 28px;
  background-color: ${({theme}) => theme.colors.bg};
`;

export const LoadingContainer = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: ${({theme}) => theme.spacing.lg}px;
`;

export const ErrorText = styled.Text`
  font-family: ${({theme}) => theme.font.medium};
  font-size: 14px;
  font-weight: 500;
  color: ${({theme}) => theme.colors.error};
  text-align: center;
`;

export const ModalBackdrop = styled.View`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.6);
  align-items: center;
  justify-content: center;
  padding: ${({theme}) => theme.spacing.lg}px;
`;

export const ModalCard = styled.View`
  width: 100%;
  background-color: ${({theme}) => theme.colors.surface};
  border-width: 1px;
  border-color: ${({theme}) => theme.colors.border};
  border-radius: ${({theme}) => theme.radius.lg}px;
  padding: ${({theme}) => theme.spacing.lg}px;
  gap: ${({theme}) => theme.spacing.md}px;
`;

export const ModalTitle = styled.Text`
  font-family: ${({theme}) => theme.font.semibold};
  font-size: 17px;
  font-weight: 600;
  color: ${({theme}) => theme.colors.textPrimary};
`;

export const ModalFormGroup = styled.View`
  gap: ${({theme}) => theme.spacing.md}px;
`;

export const ModalErrorText = styled.Text`
  font-family: ${({theme}) => theme.font.medium};
  font-size: 12px;
  font-weight: 500;
  color: ${({theme}) => theme.colors.error};
`;

export const ModalActionsRow = styled.View`
  flex-direction: row;
  gap: ${({theme}) => theme.spacing.sm}px;
`;

export const ModalActionButton = styled.View`
  flex: 1;
`;
