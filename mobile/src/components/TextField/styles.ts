import styled from 'styled-components/native';

export const Wrapper = styled.View`
  gap: ${({theme}) => theme.spacing.sm}px;
`;

export const Label = styled.Text`
  font-family: ${({theme}) => theme.font.semibold};
  font-size: 12px;
  font-weight: 600;
  color: ${({theme}) => theme.colors.textSecondary};
`;

export const Container = styled.View`
  height: 52px;
  border-radius: ${({theme}) => theme.radius.md}px;
  background-color: ${({theme}) => theme.colors.surface};
  border-width: 1px;
  border-color: ${({theme}) => theme.colors.border};
  flex-direction: row;
  align-items: center;
  padding-horizontal: 14px;
`;

export const Input = styled.TextInput`
  flex: 1;
  font-family: ${({theme}) => theme.font.medium};
  font-size: 14px;
  font-weight: 500;
  color: ${({theme}) => theme.colors.textPrimary};
`;

export const IconSlot = styled.View`
  width: 44px;
  height: 44px;
  align-items: center;
  justify-content: center;
`;
