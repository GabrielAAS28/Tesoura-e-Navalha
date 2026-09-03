import React, {ReactNode} from 'react';
import {ViewProps} from 'react-native';
import {Container} from './styles';

export type CardProps = ViewProps & {
  children?: ReactNode;
};

export default function Card({children, ...rest}: CardProps) {
  return <Container {...rest}>{children}</Container>;
}
