import styled from 'styled-components/native';

export const Container = styled.View`
  flex: 1;
  background-color: ${({theme}) => theme.colors.bg};
  align-items: center;
  justify-content: center;
`;

export const LogoTile = styled.View`
  width: 88px;
  height: 88px;
  border-radius: 24px;
  background-color: ${({theme}) => theme.colors.surface};
  border-width: 1.5px;
  border-color: ${({theme}) => theme.colors.border};
  align-items: center;
  justify-content: center;
`;

export const TextBlock = styled.View`
  align-items: center;
  margin-top: ${({theme}) => theme.spacing.lg}px;
  gap: ${({theme}) => theme.spacing.sm}px;
`;

export const Title = styled.Text`
  font-family: ${({theme}) => theme.font.bold};
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.3px;
  text-align: center;
  color: ${({theme}) => theme.colors.textPrimary};
`;

export const Tagline = styled.Text`
  font-family: ${({theme}) => theme.font.regular};
  font-size: 15px;
  font-weight: 400;
  color: ${({theme}) => theme.colors.textSecondary};
`;

export const IndicatorWrapper = styled.View`
  margin-top: ${({theme}) => theme.spacing.xl}px;
`;
