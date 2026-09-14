import styled from 'styled-components/native';

export const Screen = styled.View`
  flex: 1;
  background-color: ${({theme}) => theme.colors.bg};
`;

export const HeaderBlock = styled.View`
  padding: 28px 20px 4px;
`;

export const HeaderTitle = styled.Text`
  font-family: ${({theme}) => theme.font.semibold};
  font-size: 22px;
  font-weight: 600;
  color: ${({theme}) => theme.colors.textPrimary};
`;

export const TabsRow = styled.View`
  flex-direction: row;
  gap: ${({theme}) => theme.spacing.sm}px;
  padding: 16px 20px;
`;

export const TabButton = styled.TouchableOpacity<{active: boolean}>`
  flex: 1;
  height: 44px;
  border-radius: ${({theme}) => theme.radius.md}px;
  align-items: center;
  justify-content: center;
  background-color: ${({active, theme}) => (active ? theme.colors.accent : theme.colors.surface)};
  border-width: ${({active}) => (active ? 0 : 1)}px;
  border-color: ${({theme}) => theme.colors.border};
`;

export const TabLabel = styled.Text<{active: boolean}>`
  font-family: ${({active, theme}) => (active ? theme.font.semibold : theme.font.medium)};
  font-size: 13px;
  font-weight: ${({active}) => (active ? 600 : 500)};
  color: ${({active, theme}) => (active ? theme.colors.bg : theme.colors.textSecondary)};
`;

export const Scroller = styled.ScrollView.attrs({
  contentContainerStyle: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 108,
    gap: 12,
    flexGrow: 1,
  },
  showsVerticalScrollIndicator: false,
})`
  flex: 1;
`;

export const Card = styled.View<{dimmed?: boolean}>`
  background-color: ${({theme}) => theme.colors.surface};
  border-width: 1px;
  border-color: ${({theme}) => theme.colors.border};
  border-radius: ${({theme}) => theme.radius.lg}px;
  padding: ${({theme}) => theme.spacing.md}px;
  gap: 14px;
  opacity: ${({dimmed}) => (dimmed ? 0.7 : 1)};
`;

export const CardTopRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

export const CardTitleBlock = styled.View`
  gap: 2px;
`;

export const ServiceName = styled.Text`
  font-family: ${({theme}) => theme.font.semibold};
  font-size: 14px;
  font-weight: 600;
  color: ${({theme}) => theme.colors.textPrimary};
`;

export const DateTimeText = styled.Text`
  font-family: ${({theme}) => theme.font.regular};
  font-size: 12px;
  font-weight: 400;
  color: ${({theme}) => theme.colors.textSecondary};
`;

export const Divider = styled.View`
  height: 1px;
  background-color: ${({theme}) => theme.colors.border};
`;

export const CardFooterRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: ${({theme}) => theme.spacing.sm}px;
`;

export const BarberRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 10px;
`;

export const BarberInfoText = styled.Text`
  font-family: ${({theme}) => theme.font.regular};
  font-size: 12px;
  font-weight: 400;
  color: ${({theme}) => theme.colors.textSecondary};
`;

export const CancelButton = styled.TouchableOpacity`
  padding: 4px 2px;
`;

export const CancelLabel = styled.Text`
  font-family: ${({theme}) => theme.font.semibold};
  font-size: 12px;
  font-weight: 600;
  color: ${({theme}) => theme.colors.error};
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
