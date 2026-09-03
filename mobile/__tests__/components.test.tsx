import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import {ThemeProvider} from 'styled-components/native';
import theme from '~/styles/theme';
import Button from '~/components/Button';
import Badge from '~/components/Badge';
import ServiceCard from '~/components/ServiceCard';

const wrap = (ui: React.ReactElement) =>
  render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);

it('Button dispara onPress quando habilitado', () => {
  const onPress = jest.fn();
  const {getByText} = wrap(<Button title="Acessar Conta" onPress={onPress} />);
  fireEvent.press(getByText('Acessar Conta'));
  expect(onPress).toHaveBeenCalled();
});

it('Button não dispara onPress quando disabled', () => {
  const onPress = jest.fn();
  const {getByText} = wrap(<Button title="X" onPress={onPress} disabled />);
  fireEvent.press(getByText('X'));
  expect(onPress).not.toHaveBeenCalled();
});

it('Badge mostra rótulo do status', () => {
  const {getByText} = wrap(<Badge status="confirmed" />);
  expect(getByText('Confirmado')).toBeTruthy();
});

it('ServiceCard mostra nome e preço formatado', () => {
  const {getByText} = wrap(
    <ServiceCard
      icon="scissors"
      name="Corte Clássico"
      durationMinutes={30}
      priceCents={4500}
    />,
  );
  expect(getByText('Corte Clássico')).toBeTruthy();
  expect(getByText('30min · R$ 45')).toBeTruthy();
});
