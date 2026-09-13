import styled from 'styled-components/native';

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

export const HeaderTextBlock = styled.View`
  flex-direction: column;
  gap: 2px;
`;

export const Greeting = styled.Text`
  font-family: ${({theme}) => theme.font.semibold};
  font-size: 22px;
  font-weight: 600;
  color: ${({theme}) => theme.colors.textPrimary};
`;

export const GreetingSubtitle = styled.Text`
  font-family: ${({theme}) => theme.font.regular};
  font-size: 14px;
  font-weight: 400;
  color: ${({theme}) => theme.colors.textSecondary};
`;

export const HeaderActions = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 10px;
`;

export const BellButton = styled.TouchableOpacity`
  width: 44px;
  height: 44px;
  border-radius: ${({theme}) => theme.radius.md}px;
  background-color: ${({theme}) => theme.colors.surface};
  border-width: 1px;
  border-color: ${({theme}) => theme.colors.border};
  align-items: center;
  justify-content: center;
`;

export const Scroller = styled.ScrollView.attrs({
  contentContainerStyle: {
    paddingTop: 8,
    paddingHorizontal: 20,
    paddingBottom: 108,
    flexGrow: 1,
  },
  showsVerticalScrollIndicator: false,
})`
  flex: 1;
`;

export const Content = styled.View`
  gap: 28px;
`;

export const SectionBlock = styled.View`
  gap: 14px;
`;

export const SectionHeaderRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

export const SectionTitle = styled.Text`
  font-family: ${({theme}) => theme.font.semibold};
  font-size: 18px;
  font-weight: 600;
  color: ${({theme}) => theme.colors.textPrimary};
`;

export const SeeAllLink = styled.TouchableOpacity``;

export const SeeAllLabel = styled.Text`
  font-family: ${({theme}) => theme.font.semibold};
  font-size: 13px;
  font-weight: 600;
  color: ${({theme}) => theme.colors.accent};
`;

export const ServicesRow = styled.ScrollView.attrs({
  horizontal: true,
  contentContainerStyle: {gap: 12, paddingBottom: 4},
  showsHorizontalScrollIndicator: false,
})``;

export const BarbersRow = styled.ScrollView.attrs({
  horizontal: true,
  contentContainerStyle: {gap: 14, paddingBottom: 4},
  showsHorizontalScrollIndicator: false,
})``;

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
