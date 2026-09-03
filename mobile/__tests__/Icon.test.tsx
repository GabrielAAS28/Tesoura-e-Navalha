import React from 'react';
import {render} from '@testing-library/react-native';
import {ThemeProvider} from 'styled-components/native';
import theme from '~/styles/theme';
import Icon from '~/components/Icon';

it('renderiza um ícone por nome sem quebrar', () => {
  const {toJSON} = render(
    <ThemeProvider theme={theme}>
      <Icon name="scissors" size={24} color="#D97706" />
    </ThemeProvider>,
  );
  expect(toJSON()).toBeTruthy();
});
