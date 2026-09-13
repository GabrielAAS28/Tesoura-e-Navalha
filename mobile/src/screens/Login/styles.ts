import styled from 'styled-components/native';

export const Screen = styled.View`
  flex: 1;
  background-color: ${({theme}) => theme.colors.bg};
`;

export const Scroller = styled.ScrollView.attrs({
  contentContainerStyle: {
    paddingTop: 56,
    paddingHorizontal: 24,
    paddingBottom: 40,
    flexGrow: 1,
  },
  showsVerticalScrollIndicator: false,
  keyboardShouldPersistTaps: 'handled' as const,
})`
  flex: 1;
`;

export const Content = styled.View`
  gap: 28px;
`;

export const HeaderBlock = styled.View`
  align-items: center;
  gap: ${({theme}) => theme.spacing.md}px;
`;

export const LogoTile = styled.View`
  width: 64px;
  height: 64px;
  border-radius: ${({theme}) => theme.radius.lg}px;
  background-color: ${({theme}) => theme.colors.surface};
  border-width: 1.5px;
  border-color: ${({theme}) => theme.colors.border};
  align-items: center;
  justify-content: center;
`;

export const HeaderTextBlock = styled.View`
  align-items: center;
  gap: 6px;
`;

export const Title = styled.Text`
  font-family: ${({theme}) => theme.font.semibold};
  font-size: 22px;
  font-weight: 600;
  color: ${({theme}) => theme.colors.textPrimary};
`;

export const Subtitle = styled.Text`
  font-family: ${({theme}) => theme.font.regular};
  font-size: 14px;
  font-weight: 400;
  color: ${({theme}) => theme.colors.textSecondary};
  text-align: center;
`;

export const GoogleButton = styled.TouchableOpacity`
  width: 100%;
  height: 52px;
  border-radius: ${({theme}) => theme.radius.md}px;
  background-color: ${({theme}) => theme.colors.textPrimary};
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 10px;
`;

export const GoogleButtonLabel = styled.Text`
  font-family: ${({theme}) => theme.font.semibold};
  font-size: 14px;
  font-weight: 600;
  color: ${({theme}) => theme.colors.bg};
`;

export const DividerRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${({theme}) => theme.spacing.sm}px;
`;

export const DividerLine = styled.View`
  flex: 1;
  height: 1px;
  background-color: ${({theme}) => theme.colors.border};
`;

export const DividerLabel = styled.Text`
  font-family: ${({theme}) => theme.font.medium};
  font-size: 12px;
  font-weight: 500;
  color: ${({theme}) => theme.colors.textSecondary};
`;

export const FormBlock = styled.View`
  gap: ${({theme}) => theme.spacing.md}px;
`;

export const FieldGroup = styled.View`
  gap: ${({theme}) => theme.spacing.sm}px;
`;

export const FieldLabel = styled.Text`
  font-family: ${({theme}) => theme.font.semibold};
  font-size: 12px;
  font-weight: 600;
  color: ${({theme}) => theme.colors.textSecondary};
`;

export const PhoneFieldContainer = styled.View`
  height: 52px;
  border-radius: ${({theme}) => theme.radius.md}px;
  background-color: ${({theme}) => theme.colors.surface};
  border-width: 1px;
  border-color: ${({theme}) => theme.colors.border};
  flex-direction: row;
  align-items: center;
  padding: 0px 6px 0px 14px;
  gap: 10px;
`;

export const PhonePrefix = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 6px;
  padding-right: 10px;
  border-right-width: 1px;
  border-right-color: ${({theme}) => theme.colors.border};
`;

export const PhoneFlag = styled.Text`
  font-size: 15px;
`;

export const PhoneCode = styled.Text`
  font-family: ${({theme}) => theme.font.semibold};
  font-size: 14px;
  font-weight: 600;
  color: ${({theme}) => theme.colors.textPrimary};
`;

export const PhoneInput = styled.TextInput`
  flex: 1;
  font-family: ${({theme}) => theme.font.medium};
  font-size: 14px;
  font-weight: 500;
  color: ${({theme}) => theme.colors.textPrimary};
`;

export const ForgotPasswordLink = styled.TouchableOpacity`
  align-self: flex-end;
`;

export const ForgotPasswordLabel = styled.Text`
  font-family: ${({theme}) => theme.font.semibold};
  font-size: 12px;
  font-weight: 600;
  color: ${({theme}) => theme.colors.accent};
`;

export const BarberLink = styled.TouchableOpacity`
  align-self: center;
  flex-direction: row;
  align-items: center;
  gap: 6px;
  padding: 8px;
`;

export const BarberLinkLabel = styled.Text`
  font-family: ${({theme}) => theme.font.semibold};
  font-size: 13px;
  font-weight: 600;
  color: ${({theme}) => theme.colors.textSecondary};
`;

export const EyeToggle = styled.TouchableOpacity`
  align-items: center;
  justify-content: center;
`;
