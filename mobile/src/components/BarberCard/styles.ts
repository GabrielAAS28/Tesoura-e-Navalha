import styled from 'styled-components/native';

export const Container = styled.TouchableOpacity`
  width: 96px;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;

export const Name = styled.Text`
  font-family: ${({theme}) => theme.font.semibold};
  font-size: 13px;
  font-weight: 600;
  color: ${({theme}) => theme.colors.textPrimary};
  text-align: center;
`;

export const RatingRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 3px;
`;

export const RatingLabel = styled.Text`
  font-family: ${({theme}) => theme.font.regular};
  font-size: 12px;
  color: ${({theme}) => theme.colors.textSecondary};
`;
