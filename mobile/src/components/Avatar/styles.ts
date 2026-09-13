import styled from 'styled-components/native';
import LinearGradient from 'react-native-linear-gradient';

export const Gradient = styled(LinearGradient).attrs(({theme}) => ({
  colors: [theme.colors.border, theme.colors.surfaceAlt],
  start: {x: 0, y: 0},
  end: {x: 1, y: 1},
}))<{size: number; selected?: boolean}>`
  width: ${({size}) => size}px;
  height: ${({size}) => size}px;
  border-radius: ${({size}) => size / 2}px;
  align-items: center;
  justify-content: center;
  border-width: ${({selected}) => (selected ? 2 : 0)}px;
  border-color: ${({theme}) => theme.colors.accent};
`;

export const Initials = styled.Text<{fontSize: number}>`
  font-family: ${({theme}) => theme.font.bold};
  font-size: ${({fontSize}) => fontSize}px;
  font-weight: 700;
  color: ${({theme}) => theme.colors.textPrimary};
`;
