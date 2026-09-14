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
    paddingBottom: 40,
    flexGrow: 1,
  },
  showsVerticalScrollIndicator: false,
})`
  flex: 1;
`;

export const Content = styled.View`
  gap: ${({theme}) => theme.spacing.xl}px;
`;

export const SectionBlock = styled.View`
  gap: ${({theme}) => theme.spacing.md}px;
`;

export const SectionTitle = styled.Text`
  font-family: ${({theme}) => theme.font.semibold};
  font-size: 16px;
  font-weight: 600;
  color: ${({theme}) => theme.colors.textPrimary};
`;

export const MonthLabel = styled.Text`
  font-family: ${({theme}) => theme.font.semibold};
  font-size: 15px;
  font-weight: 600;
  color: ${({theme}) => theme.colors.textPrimary};
`;

export const PeriodHeaderRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

export const DatesRow = styled.ScrollView.attrs({
  horizontal: true,
  contentContainerStyle: {gap: 10, paddingBottom: 4},
  showsHorizontalScrollIndicator: false,
})``;

export const DateChip = styled.TouchableOpacity<{selected: boolean}>`
  width: 58px;
  height: 74px;
  border-radius: ${({theme}) => theme.radius.lg}px;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background-color: ${({selected, theme}) => (selected ? theme.colors.accent : theme.colors.surface)};
  border-width: ${({selected}) => (selected ? 0 : 1)}px;
  border-color: ${({theme}) => theme.colors.border};
`;

export const DateWeekday = styled.Text<{selected: boolean}>`
  font-family: ${({selected, theme}) => (selected ? theme.font.semibold : theme.font.medium)};
  font-size: 11px;
  font-weight: ${({selected}) => (selected ? 600 : 500)};
  color: ${({selected, theme}) => (selected ? theme.colors.bg : theme.colors.textSecondary)};
`;

export const DateDay = styled.Text<{selected: boolean}>`
  font-family: ${({theme}) => theme.font.bold};
  font-size: 16px;
  font-weight: 700;
  color: ${({selected, theme}) => (selected ? theme.colors.bg : theme.colors.textPrimary)};
`;

export const SlotsGrid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 10px;
`;

export const TimeChip = styled.TouchableOpacity`
  width: 23%;
  height: 44px;
  border-radius: ${({theme}) => theme.radius.md}px;
  border-width: 1px;
  border-color: ${({theme}) => theme.colors.border};
  align-items: center;
  justify-content: center;
`;

export const TimeChipLabel = styled.Text`
  font-family: ${({theme}) => theme.font.medium};
  font-size: 13px;
  font-weight: 500;
  color: ${({theme}) => theme.colors.textPrimary};
`;

export const EmptyStateText = styled.Text`
  font-family: ${({theme}) => theme.font.regular};
  font-size: 13px;
  font-weight: 400;
  color: ${({theme}) => theme.colors.textSecondary};
`;

export const LoadingContainer = styled.View`
  align-items: center;
  justify-content: center;
  padding: ${({theme}) => theme.spacing.lg}px;
`;

export const ScreenLoadingContainer = styled.View`
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
