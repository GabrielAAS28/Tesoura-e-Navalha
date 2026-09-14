import React from 'react';
import {Gradient, Initials} from './styles';

export type AvatarProps = {
  initials: string;
  size?: number;
  selected?: boolean;
};

const DEFAULT_SIZE = 64;

export default function Avatar({initials, size = DEFAULT_SIZE, selected = false}: AvatarProps) {
  const fontSize = Math.max(11, Math.round(size * 0.28));

  return (
    <Gradient size={size} selected={selected}>
      <Initials fontSize={fontSize}>{initials}</Initials>
    </Gradient>
  );
}
