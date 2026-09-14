import React, {ReactNode} from 'react';
import {KeyboardTypeOptions, TextInputProps} from 'react-native';
import {useTheme} from 'styled-components/native';
import {Wrapper, Label, Container, Input, IconSlot} from './styles';

export type TextFieldProps = {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  rightIcon?: ReactNode;
  autoCapitalize?: TextInputProps['autoCapitalize'];
};

export default function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  rightIcon,
  autoCapitalize,
}: TextFieldProps) {
  const theme = useTheme();

  return (
    <Wrapper>
      {label ? <Label>{label}</Label> : null}
      <Container>
        <Input
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textSecondary}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
        />
        {rightIcon ? <IconSlot>{rightIcon}</IconSlot> : null}
      </Container>
    </Wrapper>
  );
}
