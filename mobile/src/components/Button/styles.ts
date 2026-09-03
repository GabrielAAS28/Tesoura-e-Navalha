import styled, {css} from 'styled-components/native';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';

export const Container = styled.TouchableOpacity<{
  variant: ButtonVariant;
  disabled?: boolean;
}>`
  height: 52px;
  border-radius: ${({theme}) => theme.radius.md}px;
  align-items: center;
  justify-content: center;
  flex-direction: row;
  gap: ${({theme}) => theme.spacing.sm}px;
  opacity: ${({disabled}) => (disabled ? 0.4 : 1)};

  ${({variant, theme}) =>
    variant === 'primary' &&
    css`
      background-color: ${theme.colors.accent};
    `}

  ${({variant, theme}) =>
    variant === 'secondary' &&
    css`
      background-color: transparent;
      border-width: 1.5px;
      border-color: ${theme.colors.accent};
    `}

  ${({variant}) =>
    variant === 'ghost' &&
    css`
      background-color: transparent;
    `}
`;

export const Label = styled.Text<{variant: ButtonVariant}>`
  font-family: ${({theme}) => theme.font.semibold};
  font-size: 15px;
  font-weight: 600;
  color: ${({variant, theme}) => {
    if (variant === 'primary') {
      return theme.colors.bg;
    }
    if (variant === 'secondary') {
      return theme.colors.accent;
    }
    return theme.colors.textPrimary;
  }};
`;

export const IconSlot = styled.View`
  align-items: center;
  justify-content: center;
`;
