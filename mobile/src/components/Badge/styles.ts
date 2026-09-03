import styled from 'styled-components/native';

function hexToRgba(hex: string, alpha: number): string {
  const parsed = hex.replace('#', '');
  const r = parseInt(parsed.substring(0, 2), 16);
  const g = parseInt(parsed.substring(2, 4), 16);
  const b = parseInt(parsed.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export const Pill = styled.View<{color: string}>`
  height: 26px;
  padding-horizontal: 12px;
  border-radius: ${({theme}) => theme.radius.full}px;
  background-color: ${({color}) => hexToRgba(color, 0.15)};
  align-items: center;
  justify-content: center;
`;

export const Label = styled.Text<{color: string}>`
  font-family: ${({theme}) => theme.font.semibold};
  font-size: 11px;
  font-weight: 600;
  color: ${({color}) => color};
`;
