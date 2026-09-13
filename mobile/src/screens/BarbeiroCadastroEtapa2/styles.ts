import styled from 'styled-components/native';

function hexToRgba(hex: string, alpha: number): string {
  const parsed = hex.replace('#', '');
  const r = parseInt(parsed.substring(0, 2), 16);
  const g = parseInt(parsed.substring(2, 4), 16);
  const b = parseInt(parsed.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export const Screen = styled.View`
  flex: 1;
  background-color: ${({theme}) => theme.colors.bg};
`;

export const Scroller = styled.ScrollView.attrs({
  contentContainerStyle: {
    paddingTop: 28,
    paddingHorizontal: 20,
    paddingBottom: 40,
    flexGrow: 1,
  },
  showsVerticalScrollIndicator: false,
  keyboardShouldPersistTaps: 'handled' as const,
})`
  flex: 1;
`;

export const HeaderRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({theme}) => theme.spacing.lg}px;
`;

export const HeaderLeft = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${({theme}) => theme.spacing.md}px;
`;

export const BackButton = styled.TouchableOpacity`
  width: 44px;
  height: 44px;
  border-radius: ${({theme}) => theme.radius.md}px;
  background-color: ${({theme}) => theme.colors.surface};
  border-width: 1px;
  border-color: ${({theme}) => theme.colors.border};
  align-items: center;
  justify-content: center;
`;

export const HeaderTitle = styled.Text`
  font-family: ${({theme}) => theme.font.semibold};
  font-size: 20px;
  font-weight: 600;
  color: ${({theme}) => theme.colors.textPrimary};
`;

export const StepBadge = styled.View`
  height: 26px;
  padding-horizontal: 12px;
  border-radius: ${({theme}) => theme.radius.full}px;
  background-color: ${({theme}) => hexToRgba(theme.colors.accent, 0.15)};
  align-items: center;
  justify-content: center;
`;

export const StepBadgeLabel = styled.Text`
  font-family: ${({theme}) => theme.font.semibold};
  font-size: 11px;
  font-weight: 600;
  color: ${({theme}) => theme.colors.accent};
`;

export const Content = styled.View`
  gap: ${({theme}) => theme.spacing.xl}px;
`;

export const SectionBlock = styled.View`
  gap: ${({theme}) => theme.spacing.md}px;
`;

export const SectionTitle = styled.Text`
  font-family: ${({theme}) => theme.font.semibold};
  font-size: 15px;
  font-weight: 600;
  color: ${({theme}) => theme.colors.textPrimary};
`;

export const Row = styled.View`
  flex-direction: row;
  gap: 10px;
`;

export const FlexItem = styled.View<{grow: number}>`
  flex: ${({grow}) => grow};
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

export const PixFieldContainer = styled.View`
  height: 52px;
  border-radius: ${({theme}) => theme.radius.md}px;
  background-color: ${({theme}) => theme.colors.surface};
  border-width: 1px;
  border-color: ${({theme}) => theme.colors.border};
  flex-direction: row;
  align-items: center;
  padding-horizontal: 14px;
  gap: 10px;
`;

export const PixInput = styled.TextInput`
  flex: 1;
  font-family: ${({theme}) => theme.font.medium};
  font-size: 14px;
  font-weight: 500;
  color: ${({theme}) => theme.colors.textPrimary};
`;

export const UploadBox = styled.TouchableOpacity`
  height: 104px;
  border-radius: ${({theme}) => theme.radius.lg}px;
  background-color: ${({theme}) => theme.colors.surface};
  border-width: 1.5px;
  border-style: dashed;
  border-color: ${({theme}) => theme.colors.border};
  align-items: center;
  justify-content: center;
  gap: ${({theme}) => theme.spacing.sm}px;
`;

export const UploadBoxLabel = styled.Text`
  font-family: ${({theme}) => theme.font.semibold};
  font-size: 12px;
  font-weight: 600;
  color: ${({theme}) => theme.colors.textSecondary};
`;

export const TermosRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${({theme}) => theme.spacing.md}px;
  min-height: 44px;
`;

export const Checkbox = styled.TouchableOpacity<{checked: boolean}>`
  width: 22px;
  height: 22px;
  border-radius: ${({theme}) => theme.radius.sm}px;
  align-items: center;
  justify-content: center;
  background-color: ${({checked, theme}) => (checked ? theme.colors.accent : 'transparent')};
  border-width: ${({checked}) => (checked ? 0 : 1.5)}px;
  border-color: ${({theme}) => theme.colors.border};
`;

export const TermosText = styled.Text`
  flex: 1;
  font-family: ${({theme}) => theme.font.regular};
  font-size: 12px;
  font-weight: 500;
  color: ${({theme}) => theme.colors.textSecondary};
  line-height: 18px;
`;

export const TermosLink = styled.Text`
  font-family: ${({theme}) => theme.font.semibold};
  font-size: 12px;
  font-weight: 600;
  color: ${({theme}) => theme.colors.accent};
`;
