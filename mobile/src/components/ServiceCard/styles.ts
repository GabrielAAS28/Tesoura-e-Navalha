import styled from 'styled-components/native';
import {hexToRgba} from '~/utils/color';

export const Container = styled.TouchableOpacity`
  width: 152px;
  background-color: ${({theme}) => theme.colors.surface};
  border-width: 1px;
  border-color: ${({theme}) => theme.colors.border};
  border-radius: ${({theme}) => theme.radius.lg}px;
  padding: ${({theme}) => theme.spacing.md}px;
  flex-direction: column;
  gap: 28px;
`;

export const IconTile = styled.View`
  width: 40px;
  height: 40px;
  border-radius: ${({theme}) => theme.radius.md}px;
  background-color: ${({theme}) => hexToRgba(theme.colors.accent, 0.15)};
  align-items: center;
  justify-content: center;
`;

export const TextBlock = styled.View`
  flex-direction: column;
  gap: 4px;
`;

export const Name = styled.Text`
  font-family: ${({theme}) => theme.font.semibold};
  font-size: 14px;
  font-weight: 600;
  color: ${({theme}) => theme.colors.textPrimary};
`;

export const Subtitle = styled.Text`
  font-family: ${({theme}) => theme.font.regular};
  font-size: 12px;
  font-weight: 400;
  color: ${({theme}) => theme.colors.textSecondary};
`;
