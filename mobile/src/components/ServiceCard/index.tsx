import React from 'react';
import {GestureResponderEvent} from 'react-native';
import {useTheme} from 'styled-components/native';
import Icon, {IconName} from '~/components/Icon';
import {formatBRL} from '~/utils/format';
import {Container, IconTile, TextBlock, Name, Subtitle} from './styles';

export type ServiceCardProps = {
  icon: IconName;
  name: string;
  durationMinutes: number;
  priceCents: number;
  onPress?: (event: GestureResponderEvent) => void;
};

export default function ServiceCard({
  icon,
  name,
  durationMinutes,
  priceCents,
  onPress,
}: ServiceCardProps) {
  const theme = useTheme();

  return (
    <Container onPress={onPress} activeOpacity={0.8}>
      <IconTile>
        <Icon name={icon} size={20} color={theme.colors.accent} />
      </IconTile>
      <TextBlock>
        <Name>{name}</Name>
        <Subtitle>
          {durationMinutes}min · {formatBRL(priceCents)}
        </Subtitle>
      </TextBlock>
    </Container>
  );
}
