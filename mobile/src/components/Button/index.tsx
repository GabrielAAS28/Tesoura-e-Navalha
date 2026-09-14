import React, {ReactNode} from 'react';
import {ActivityIndicator, GestureResponderEvent} from 'react-native';
import {useTheme} from 'styled-components/native';
import {Container, Label, IconSlot, ButtonVariant} from './styles';

export type ButtonProps = {
  variant?: ButtonVariant;
  title: string;
  onPress?: (event: GestureResponderEvent) => void;
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: ReactNode;
};

export default function Button({
  variant = 'primary',
  title,
  onPress,
  disabled = false,
  loading = false,
  leftIcon,
}: ButtonProps) {
  const theme = useTheme();
  const isDisabled = disabled || loading;
  const indicatorColor =
    variant === 'primary' ? theme.colors.bg : theme.colors.accent;

  return (
    <Container
      variant={variant}
      disabled={isDisabled}
      onPress={isDisabled ? undefined : onPress}
      activeOpacity={0.8}>
      {loading ? (
        <ActivityIndicator color={indicatorColor} />
      ) : (
        <>
          {leftIcon ? <IconSlot>{leftIcon}</IconSlot> : null}
          <Label variant={variant}>{title}</Label>
        </>
      )}
    </Container>
  );
}
