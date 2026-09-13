import styled from 'styled-components/native';
import LinearGradient from 'react-native-linear-gradient';

export const Screen = styled.View`
  flex: 1;
  background-color: ${({theme}) => theme.colors.bg};
`;

export const Scroller = styled.ScrollView.attrs({
  contentContainerStyle: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 108,
    gap: 28,
    flexGrow: 1,
  },
  showsVerticalScrollIndicator: false,
})`
  flex: 1;
`;

export const ProfileHeaderRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${({theme}) => theme.spacing.md}px;
`;

export const NameBlock = styled.View`
  flex: 1;
  gap: 3px;
`;

export const Name = styled.Text`
  font-family: ${({theme}) => theme.font.semibold};
  font-size: 19px;
  font-weight: 600;
  color: ${({theme}) => theme.colors.textPrimary};
`;

export const Subtitle = styled.Text`
  font-family: ${({theme}) => theme.font.regular};
  font-size: 13px;
  font-weight: 400;
  color: ${({theme}) => theme.colors.textSecondary};
`;

// Botão de editar perfil — sem tela de destino (placeholder inerte, ver
// "Controller ruling" do dispatch: Perfil não tem tela "Editar Perfil" em
// nenhum lugar do app). Fica com `disabled` para deixar claro que é inerte
// mantendo a aparência do mockup.
export const EditButton = styled.TouchableOpacity`
  width: 38px;
  height: 38px;
  border-radius: ${({theme}) => theme.radius.md}px;
  background-color: ${({theme}) => theme.colors.surface};
  border-width: 1px;
  border-color: ${({theme}) => theme.colors.border};
  align-items: center;
  justify-content: center;
`;

export const LoyaltyCard = styled(LinearGradient).attrs(({theme}) => ({
  colors: [theme.colors.surface, theme.colors.surfaceAlt],
  start: {x: 0, y: 0},
  end: {x: 1, y: 1},
}))`
  border-radius: 18px;
  border-width: 1px;
  border-color: ${({theme}) => theme.colors.border};
  padding: ${({theme}) => theme.spacing.lg}px;
  gap: ${({theme}) => theme.spacing.md}px;
`;

export const LoyaltyHeaderRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

export const LoyaltyTitle = styled.Text`
  font-family: ${({theme}) => theme.font.semibold};
  font-size: 15px;
  font-weight: 600;
  color: ${({theme}) => theme.colors.textPrimary};
`;

export const LoyaltyGrid = styled.View`
  gap: 10px;
`;

export const LoyaltyRow = styled.View`
  flex-direction: row;
  gap: 10px;
`;

// `filled` = círculo cheio (corte já contabilizado); caso contrário, círculo
// tracejado vazio (ou com o ícone de navalha no último slot, ver index.tsx).
export const LoyaltySlot = styled.View<{filled?: boolean}>`
  flex: 1;
  aspect-ratio: 1;
  border-radius: ${({theme}) => theme.radius.full}px;
  align-items: center;
  justify-content: center;
  background-color: ${({filled, theme}) => (filled ? theme.colors.accent : 'transparent')};
  border-width: ${({filled}) => (filled ? 0 : 1.5)}px;
  border-style: dashed;
  border-color: ${({theme}) => theme.colors.border};
`;

export const LoyaltyCaption = styled.Text`
  font-family: ${({theme}) => theme.font.medium};
  font-size: 12px;
  font-weight: 500;
  color: ${({theme}) => theme.colors.textSecondary};
`;

export const LoyaltyHighlight = styled.Text`
  font-family: ${({theme}) => theme.font.bold};
  font-weight: 700;
  color: ${({theme}) => theme.colors.accent};
`;

export const MenuList = styled.View`
  gap: 2px;
`;

// `border-bottom-color` usa `theme.colors.surface` (não `theme.colors.border`)
// de propósito — é o valor literal do mockup (#1E1E24), um divisor mais
// sutil que a borda padrão de card, só entre os itens do menu.
export const MenuRow = styled.TouchableOpacity<{last?: boolean}>`
  flex-direction: row;
  align-items: center;
  gap: 14px;
  padding: 16px 4px;
  border-bottom-width: ${({last}) => (last ? 0 : 1)}px;
  border-bottom-color: ${({theme}) => theme.colors.surface};
`;

export const MenuIconTile = styled.View<{destructive?: boolean}>`
  width: 36px;
  height: 36px;
  border-radius: ${({theme}) => theme.radius.md}px;
  align-items: center;
  justify-content: center;
  background-color: ${({destructive, theme}) =>
    destructive ? 'rgba(239, 68, 68, 0.10)' : theme.colors.surface};
`;

export const MenuLabel = styled.Text<{destructive?: boolean}>`
  flex: 1;
  font-family: ${({theme}) => theme.font.medium};
  font-size: 14px;
  font-weight: 500;
  color: ${({destructive, theme}) => (destructive ? theme.colors.error : theme.colors.textPrimary)};
`;
