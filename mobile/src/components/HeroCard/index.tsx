import React from 'react';
import {GestureResponderEvent} from 'react-native';
import {useTheme} from 'styled-components/native';
import Icon from '~/components/Icon';
import {Gradient, TextBlock, Title, Subtitle, CtaButton, CtaLabel} from './styles';

export type HeroCardProps = {
  title: string;
  subtitle: string;
  ctaLabel: string;
  onPress: (event: GestureResponderEvent) => void;
};

export default function HeroCard({title, subtitle, ctaLabel, onPress}: HeroCardProps) {
  const theme = useTheme();

  return (
    <Gradient>
      <TextBlock>
        <Title>{title}</Title>
        <Subtitle>{subtitle}</Subtitle>
      </TextBlock>
      <CtaButton onPress={onPress} activeOpacity={0.8}>
        <CtaLabel>{ctaLabel}</CtaLabel>
        <Icon name="chevronRight" size={14} color={theme.colors.textPrimary} strokeWidth={2.2} />
      </CtaButton>
    </Gradient>
  );
}
