import styled from 'styled-components/native';
import LinearGradient from 'react-native-linear-gradient';

export const Gradient = styled(LinearGradient).attrs(({theme}) => ({
  colors: [theme.colors.accent, theme.colors.accentHover],
  start: {x: 0, y: 0},
  end: {x: 1, y: 1},
}))`
  border-radius: ${({theme}) => theme.radius.lg}px;
  padding: 22px;
  flex-direction: column;
  gap: 14px;
`;

export const TextBlock = styled.View`
  flex-direction: column;
  gap: 4px;
`;

export const Title = styled.Text`
  font-family: ${({theme}) => theme.font.bold};
  font-size: 18px;
  font-weight: 700;
  color: ${({theme}) => theme.colors.bg};
`;

export const Subtitle = styled.Text`
  font-family: ${({theme}) => theme.font.medium};
  font-size: 13px;
  font-weight: 500;
  color: ${({theme}) => theme.colors.bg};
  opacity: 0.75;
`;

export const CtaButton = styled.TouchableOpacity`
  align-self: flex-start;
  height: 44px;
  padding: 0 18px;
  border-radius: ${({theme}) => theme.radius.md}px;
  background-color: ${({theme}) => theme.colors.bg};
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

export const CtaLabel = styled.Text`
  font-family: ${({theme}) => theme.font.semibold};
  font-size: 13px;
  font-weight: 600;
  color: ${({theme}) => theme.colors.textPrimary};
`;
