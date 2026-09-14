import styled from 'styled-components/native';
import {hexToRgba} from '~/utils/color';

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
