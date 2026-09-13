import React from 'react';
import {ActivityIndicator} from 'react-native';
import {useTheme} from 'styled-components/native';
import Icon from '~/components/Icon';
import {
  Container,
  LogoTile,
  TextBlock,
  Title,
  Tagline,
  IndicatorWrapper,
} from './styles';

export default function Splash() {
  const theme = useTheme();

  return (
    <Container>
      <LogoTile>
        <Icon name="scissors" size={40} color={theme.colors.accent} strokeWidth={1.6} />
      </LogoTile>
      <TextBlock>
        <Title>Barbearia do Bairro</Title>
        <Tagline>Seu estilo, seu tempo.</Tagline>
      </TextBlock>
      <IndicatorWrapper>
        <ActivityIndicator color={theme.colors.accent} />
      </IndicatorWrapper>
    </Container>
  );
}
