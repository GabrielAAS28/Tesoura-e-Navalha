import styled from 'styled-components/native';
import {hexToRgba} from '~/utils/color';

export const Screen = styled.View`
  flex: 1;
  background-color: ${({theme}) => theme.colors.bg};
`;

export const HeaderBlock = styled.View`
  padding: 28px 20px 4px;
`;

export const HeaderTitle = styled.Text`
  font-family: ${({theme}) => theme.font.semibold};
  font-size: 22px;
  font-weight: 600;
  color: ${({theme}) => theme.colors.textPrimary};
`;

export const HeaderSubtitle = styled.Text`
  font-family: ${({theme}) => theme.font.regular};
  font-size: 13px;
  font-weight: 400;
  color: ${({theme}) => theme.colors.textSecondary};
  padding-top: 4px;
`;

export const Scroller = styled.ScrollView.attrs({
  contentContainerStyle: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 12,
    flexGrow: 1,
  },
  showsVerticalScrollIndicator: false,
})`
  flex: 1;
`;

export const ServiceCardBlock = styled.View<{dimmed?: boolean}>`
  background-color: ${({theme}) => theme.colors.surface};
  border-width: 1px;
  border-color: ${({theme}) => theme.colors.border};
  border-radius: ${({theme}) => theme.radius.lg}px;
  padding: ${({theme}) => theme.spacing.md}px;
  gap: 14px;
  opacity: ${({dimmed}) => (dimmed ? 0.55 : 1)};
`;

export const ServiceTopRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

export const ServiceNameGroup = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 12px;
  flex: 1;
`;

export const ServiceIconTile = styled.View<{dimmed?: boolean}>`
  width: 38px;
  height: 38px;
  border-radius: ${({theme}) => theme.radius.md}px;
  align-items: center;
  justify-content: center;
  background-color: ${({dimmed, theme}) =>
    dimmed ? hexToRgba(theme.colors.textSecondary, 0.1) : hexToRgba(theme.colors.accent, 0.15)};
`;

export const ServiceName = styled.Text`
  font-family: ${({theme}) => theme.font.semibold};
  font-size: 14px;
  font-weight: 600;
  color: ${({theme}) => theme.colors.textPrimary};
`;

// Switch visual (não usa React Native <Switch> para bater pixel-a-pixel com
// design/BarbeiroServicos.dc.html: trilho 44x24 + thumb 20x20). Serviços reais
// estão sempre "ligados" (existência = estado ligado, ver "Controller ruling"
// #1 do dispatch) — o TouchableOpacity que envolve este componente é quem
// trata o toque como "desligar = excluir" com confirmação; os dois
// placeholders de catálogo (Pigmentação/Sobrancelha) usam `on=false` fixo e
// ficam dentro de uma View simples, sem onPress.
export const SwitchTrack = styled.View<{on: boolean}>`
  width: 44px;
  height: 24px;
  border-radius: ${({theme}) => theme.radius.full}px;
  padding: 2px;
  flex-direction: row;
  justify-content: ${({on}) => (on ? 'flex-end' : 'flex-start')};
  background-color: ${({on, theme}) => (on ? theme.colors.accent : theme.colors.border)};
`;

export const SwitchThumb = styled.View<{on: boolean}>`
  width: 20px;
  height: 20px;
  border-radius: ${({theme}) => theme.radius.full}px;
  background-color: ${({on, theme}) => (on ? theme.colors.bg : theme.colors.textSecondary)};
`;

export const PillsRow = styled.View`
  flex-direction: row;
  gap: 8px;
`;

// Pílulas de preço/duração são somente leitura — não existe `updateService`
// no backend deste task (ver "Controller ruling" #2 do dispatch). O lápis é
// renderizado mas sem onPress: cada pílula é uma View, não um
// TouchableOpacity.
export const Pill = styled.View`
  flex: 1;
  height: 44px;
  border-radius: ${({theme}) => theme.radius.md}px;
  background-color: ${({theme}) => theme.colors.bg};
  border-width: 1px;
  border-color: ${({theme}) => theme.colors.border};
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 6px;
`;

export const PillLabel = styled.Text`
  font-family: ${({theme}) => theme.font.semibold};
  font-size: 13px;
  font-weight: 600;
  color: ${({theme}) => theme.colors.textPrimary};
`;

export const AddButton = styled.TouchableOpacity`
  width: 100%;
  height: 52px;
  border-width: 1.5px;
  border-style: dashed;
  border-color: ${({theme}) => theme.colors.border};
  border-radius: ${({theme}) => theme.radius.md}px;
  align-items: center;
  justify-content: center;
  flex-direction: row;
  gap: 8px;
  margin-top: 4px;
`;

export const AddButtonLabel = styled.Text`
  font-family: ${({theme}) => theme.font.semibold};
  font-size: 14px;
  font-weight: 600;
  color: ${({theme}) => theme.colors.textSecondary};
`;

export const LoadingContainer = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: ${({theme}) => theme.spacing.lg}px;
`;

export const ErrorText = styled.Text`
  font-family: ${({theme}) => theme.font.medium};
  font-size: 14px;
  font-weight: 500;
  color: ${({theme}) => theme.colors.error};
  text-align: center;
`;

export const ModalBackdrop = styled.View`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.6);
  align-items: center;
  justify-content: center;
  padding: ${({theme}) => theme.spacing.lg}px;
`;

export const ModalCard = styled.View`
  width: 100%;
  background-color: ${({theme}) => theme.colors.surface};
  border-width: 1px;
  border-color: ${({theme}) => theme.colors.border};
  border-radius: ${({theme}) => theme.radius.lg}px;
  padding: ${({theme}) => theme.spacing.lg}px;
  gap: ${({theme}) => theme.spacing.md}px;
`;

export const ModalTitle = styled.Text`
  font-family: ${({theme}) => theme.font.semibold};
  font-size: 17px;
  font-weight: 600;
  color: ${({theme}) => theme.colors.textPrimary};
`;

export const ModalFormGroup = styled.View`
  gap: ${({theme}) => theme.spacing.md}px;
`;

export const ModalErrorText = styled.Text`
  font-family: ${({theme}) => theme.font.medium};
  font-size: 12px;
  font-weight: 500;
  color: ${({theme}) => theme.colors.error};
`;

export const ModalActionsRow = styled.View`
  flex-direction: row;
  gap: ${({theme}) => theme.spacing.sm}px;
`;

export const ModalActionButton = styled.View`
  flex: 1;
`;
