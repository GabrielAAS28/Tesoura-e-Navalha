import React from 'react';
import {GestureResponderEvent} from 'react-native';
import {useTheme} from 'styled-components/native';
import Icon from '~/components/Icon';
import Avatar from '~/components/Avatar';
import {Container, Name, RatingRow, RatingLabel} from './styles';

export type BarberCardProps = {
  initials: string;
  name: string;
  rating?: number;
  selected?: boolean;
  onPress?: (event: GestureResponderEvent) => void;
};

export default function BarberCard({
  initials,
  name,
  rating,
  selected = false,
  onPress,
}: BarberCardProps) {
  const theme = useTheme();

  return (
    <Container onPress={onPress} activeOpacity={0.8} disabled={!onPress}>
      <Avatar initials={initials} selected={selected} />
      <Name>{name}</Name>
      {rating !== undefined ? (
        <RatingRow>
          <Icon name="star" size={12} color={theme.colors.accent} />
          <RatingLabel>{rating}</RatingLabel>
        </RatingRow>
      ) : null}
    </Container>
  );
}
