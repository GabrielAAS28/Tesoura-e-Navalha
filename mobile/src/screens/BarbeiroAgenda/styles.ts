import styled from 'styled-components/native';

function hexToRgba(hex: string, alpha: number): string {
  const parsed = hex.replace('#', '');
  const r = parseInt(parsed.substring(0, 2), 16);
  const g = parseInt(parsed.substring(2, 4), 16);
  const b = parseInt(parsed.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export const Screen = styled.View`
  flex: 1;
  background-color: ${({theme}) => theme.colors.bg};
`;

export const HeaderRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 28px 20px 16px;
`;

export const HeaderLeft = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${({theme}) => theme.spacing.md}px;
`;

export const HeaderTextBlock = styled.View`
  gap: 1px;
`;

export const HeaderName = styled.Text`
  font-family: ${({theme}) => theme.font.semibold};
  font-size: 16px;
  font-weight: 600;
  color: ${({theme}) => theme.colors.textPrimary};
`;

export const HeaderDate = styled.Text`
  font-family: ${({theme}) => theme.font.regular};
  font-size: 12px;
  font-weight: 400;
  color: ${({theme}) => theme.colors.textSecondary};
`;

// "Disponível" é puramente decorativo — não existe coluna de disponibilidade
// em tempo real do barbeiro no schema (mesma categoria de gap já registrada
// em outras telas, ex. Cartão Fidelidade do Perfil). Sempre renderizado como
// "Disponível" fixo, sem estado real por trás.
export const StatusPill = styled.View`
  height: 44px;
  padding-horizontal: 14px;
  border-radius: ${({theme}) => theme.radius.full}px;
  background-color: ${({theme}) => hexToRgba(theme.colors.success, 0.15)};
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

export const StatusDot = styled.View`
  width: 8px;
  height: 8px;
  border-radius: ${({theme}) => theme.radius.full}px;
  background-color: ${({theme}) => theme.colors.success};
`;

export const StatusLabel = styled.Text`
  font-family: ${({theme}) => theme.font.semibold};
  font-size: 12px;
  font-weight: 600;
  color: ${({theme}) => theme.colors.success};
`;

export const Scroller = styled.ScrollView.attrs({
  contentContainerStyle: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
    gap: 24,
    flexGrow: 1,
  },
  showsVerticalScrollIndicator: false,
})`
  flex: 1;
`;

export const StatsRow = styled.View`
  flex-direction: row;
  gap: ${({theme}) => theme.spacing.md}px;
`;

export const StatTile = styled.View`
  flex: 1;
  background-color: ${({theme}) => theme.colors.surface};
  border-width: 1px;
  border-color: ${({theme}) => theme.colors.border};
  border-radius: ${({theme}) => theme.radius.lg}px;
  padding: ${({theme}) => theme.spacing.md}px;
  gap: ${({theme}) => theme.spacing.sm}px;
`;

export const StatIconTile = styled.View`
  width: 34px;
  height: 34px;
  border-radius: ${({theme}) => theme.radius.md}px;
  background-color: ${({theme}) => hexToRgba(theme.colors.accent, 0.15)};
  align-items: center;
  justify-content: center;
`;

export const StatValue = styled.Text`
  font-family: ${({theme}) => theme.font.bold};
  font-size: 18px;
  font-weight: 700;
  color: ${({theme}) => theme.colors.textPrimary};
`;

export const StatLabelText = styled.Text`
  font-family: ${({theme}) => theme.font.medium};
  font-size: 11px;
  font-weight: 500;
  color: ${({theme}) => theme.colors.textSecondary};
`;

export const AgendaSection = styled.View`
  gap: ${({theme}) => theme.spacing.md}px;
`;

export const SectionTitle = styled.Text`
  font-family: ${({theme}) => theme.font.semibold};
  font-size: 15px;
  font-weight: 600;
  color: ${({theme}) => theme.colors.textPrimary};
`;

export const AppointmentsList = styled.View`
  gap: ${({theme}) => theme.spacing.md}px;
`;

export const AppointmentRow = styled.View<{dimmed?: boolean}>`
  flex-direction: row;
  gap: 14px;
  opacity: ${({dimmed}) => (dimmed ? 0.55 : 1)};
`;

export const TimeColumn = styled.View`
  width: 44px;
  flex-shrink: 0;
  align-items: center;
`;

export const TimeLabel = styled.Text<{highlighted?: boolean}>`
  font-family: ${({highlighted, theme}) => (highlighted ? theme.font.bold : theme.font.semibold)};
  font-size: 12px;
  font-weight: ${({highlighted}) => (highlighted ? 700 : 600)};
  color: ${({highlighted, theme}) => (highlighted ? theme.colors.accent : theme.colors.textSecondary)};
  padding-top: 14px;
`;

export const TimeLine = styled.View`
  flex: 1;
  width: 1.5px;
  background-color: ${({theme}) => theme.colors.border};
  margin-top: 8px;
`;

export const Card = styled.View<{highlighted?: boolean}>`
  flex: 1;
  background-color: ${({highlighted, theme}) =>
    highlighted ? hexToRgba(theme.colors.accent, 0.08) : theme.colors.surface};
  border-width: ${({highlighted}) => (highlighted ? 1.5 : 1)}px;
  border-color: ${({highlighted, theme}) => (highlighted ? theme.colors.accent : theme.colors.border)};
  border-radius: ${({theme}) => theme.radius.lg}px;
  padding: 14px;
  gap: 12px;
`;

export const CardTopRow = styled.View`
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${({theme}) => theme.spacing.sm}px;
`;

export const ClientTextBlock = styled.View`
  gap: 2px;
`;

export const ClientName = styled.Text`
  font-family: ${({theme}) => theme.font.semibold};
  font-size: 13px;
  font-weight: 600;
  color: ${({theme}) => theme.colors.textPrimary};
`;

export const ServiceLine = styled.Text`
  font-family: ${({theme}) => theme.font.regular};
  font-size: 12px;
  font-weight: 400;
  color: ${({theme}) => theme.colors.textSecondary};
`;

export const ActionsRow = styled.View`
  flex-direction: row;
  gap: 8px;
`;

export const CompleteButton = styled.TouchableOpacity`
  flex: 1;
  height: 44px;
  border-radius: ${({theme}) => theme.radius.md}px;
  background-color: ${({theme}) => theme.colors.accent};
  align-items: center;
  justify-content: center;
`;

export const CompleteLabel = styled.Text`
  font-family: ${({theme}) => theme.font.semibold};
  font-size: 12px;
  font-weight: 600;
  color: ${({theme}) => theme.colors.bg};
`;

export const CancelActionButton = styled.TouchableOpacity`
  flex: 1;
  height: 44px;
  border-radius: ${({theme}) => theme.radius.md}px;
  border-width: 1px;
  border-color: ${({theme}) => theme.colors.border};
  background-color: transparent;
  align-items: center;
  justify-content: center;
`;

export const CancelActionLabel = styled.Text`
  font-family: ${({theme}) => theme.font.semibold};
  font-size: 12px;
  font-weight: 600;
  color: ${({theme}) => theme.colors.textSecondary};
`;

// Botão flutuante do mockup (círculo + linha diagonal) — sem conceito de
// backend correspondente (nenhuma coluna de disponibilidade em tempo real do
// barbeiro). Ver "Controller ruling" #5 do dispatch desta task: renderizado
// só visualmente, sem onPress funcional — por isso é uma View simples, não
// TouchableOpacity.
export const FloatingButton = styled.View`
  position: absolute;
  bottom: 28px;
  right: 24px;
  width: 56px;
  height: 56px;
  border-radius: ${({theme}) => theme.radius.full}px;
  background-color: ${({theme}) => theme.colors.accent};
  align-items: center;
  justify-content: center;
  shadow-color: #000;
  shadow-opacity: 0.3;
  shadow-radius: 10px;
  shadow-offset: 0px 4px;
  elevation: 6;
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

export const EmptyText = styled.Text`
  font-family: ${({theme}) => theme.font.medium};
  font-size: 13px;
  font-weight: 500;
  color: ${({theme}) => theme.colors.textSecondary};
  text-align: center;
  padding: ${({theme}) => theme.spacing.lg}px 0px;
`;
