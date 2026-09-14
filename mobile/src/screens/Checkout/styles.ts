import styled from 'styled-components/native';
import {hexToRgba} from '~/utils/color';

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
    paddingTop: 4,
    paddingHorizontal: 20,
    paddingBottom: 140,
    flexGrow: 1,
  },
  showsVerticalScrollIndicator: false,
})`
  flex: 1;
`;

export const Content = styled.View`
  gap: ${({theme}) => theme.spacing.lg}px;
`;

export const SummaryCard = styled.View`
  background-color: ${({theme}) => theme.colors.surface};
  border-width: 1px;
  border-color: ${({theme}) => theme.colors.border};
  border-radius: ${({theme}) => theme.radius.lg}px;
  padding: ${({theme}) => theme.spacing.md}px;
  gap: ${({theme}) => theme.spacing.md}px;
`;

export const BarberRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${({theme}) => theme.spacing.md}px;
`;

export const BarberName = styled.Text`
  font-family: ${({theme}) => theme.font.semibold};
  font-size: 14px;
  font-weight: 600;
  color: ${({theme}) => theme.colors.textPrimary};
`;

export const Divider = styled.View`
  height: 1px;
  background-color: ${({theme}) => theme.colors.border};
`;

export const SummaryRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

export const SummaryLabel = styled.Text`
  font-family: ${({theme}) => theme.font.regular};
  font-size: 13px;
  font-weight: 400;
  color: ${({theme}) => theme.colors.textSecondary};
`;

export const SummaryValue = styled.Text`
  font-family: ${({theme}) => theme.font.semibold};
  font-size: 13px;
  font-weight: 600;
  color: ${({theme}) => theme.colors.textPrimary};
`;

export const SectionBlock = styled.View`
  gap: ${({theme}) => theme.spacing.sm}px;
`;

export const SectionTitle = styled.Text`
  font-family: ${({theme}) => theme.font.semibold};
  font-size: 15px;
  font-weight: 600;
  color: ${({theme}) => theme.colors.textPrimary};
`;

export const PaymentOption = styled.TouchableOpacity<{selected: boolean}>`
  flex-direction: row;
  align-items: center;
  gap: ${({theme}) => theme.spacing.md}px;
  background-color: ${({selected, theme}) =>
    selected ? hexToRgba(theme.colors.accent, 0.1) : theme.colors.surface};
  border-width: ${({selected}) => (selected ? 1.5 : 1)}px;
  border-color: ${({selected, theme}) => (selected ? theme.colors.accent : theme.colors.border)};
  border-radius: ${({theme}) => theme.radius.lg}px;
  padding: 14px 16px;
`;

export const PaymentIconTile = styled.View`
  width: 40px;
  height: 40px;
  border-radius: ${({theme}) => theme.radius.md}px;
  background-color: ${({theme}) => hexToRgba(theme.colors.accent, 0.15)};
  align-items: center;
  justify-content: center;
`;

export const PaymentLabel = styled.Text`
  flex: 1;
  font-family: ${({theme}) => theme.font.semibold};
  font-size: 14px;
  font-weight: 600;
  color: ${({theme}) => theme.colors.textPrimary};
`;

export const RadioOuter = styled.View<{selected: boolean}>`
  width: 20px;
  height: 20px;
  border-radius: ${({theme}) => theme.radius.full}px;
  align-items: center;
  justify-content: center;
  background-color: ${({selected, theme}) => (selected ? theme.colors.accent : 'transparent')};
  border-width: ${({selected}) => (selected ? 0 : 1.5)}px;
  border-color: ${({theme}) => theme.colors.border};
`;

export const TotalsBlock = styled.View`
  gap: ${({theme}) => theme.spacing.sm}px;
  padding-top: 4px;
`;

export const TotalRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

export const TotalLabel = styled.Text`
  font-family: ${({theme}) => theme.font.semibold};
  font-size: 15px;
  font-weight: 600;
  color: ${({theme}) => theme.colors.textPrimary};
`;

export const TotalValue = styled.Text`
  font-family: ${({theme}) => theme.font.bold};
  font-size: 18px;
  font-weight: 700;
  color: ${({theme}) => theme.colors.accent};
`;

export const Footer = styled.View`
  position: absolute;
  left: 0px;
  right: 0px;
  bottom: 0px;
  padding: 14px 20px 24px;
  gap: 10px;
  align-items: center;
`;

export const FooterNote = styled.Text`
  font-family: ${({theme}) => theme.font.regular};
  font-size: 11px;
  font-weight: 400;
  color: ${({theme}) => theme.colors.textSecondary};
  text-align: center;
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
