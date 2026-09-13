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

export const HeaderRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${({theme}) => theme.spacing.md}px;
  padding: 28px 20px 12px;
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

export const Scroller = styled.ScrollView.attrs({
  contentContainerStyle: {
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 120,
    flexGrow: 1,
  },
  showsVerticalScrollIndicator: false,
})`
  flex: 1;
`;

export const Content = styled.View`
  gap: ${({theme}) => theme.spacing.xl}px;
`;

export const List = styled.View`
  gap: ${({theme}) => theme.spacing.md}px;
`;

// Linha de serviço full-width — tela-local, NÃO reaproveita
// ~/components/ServiceCard (que tem largura fixa de 152px, pensada para o
// scroller horizontal de Main). Layout/valores copiados de
// design/Servicos.dc.html (linhas 30-72).
export const Row = styled.TouchableOpacity<{selected: boolean}>`
  flex-direction: row;
  align-items: center;
  gap: 14px;
  border-radius: ${({theme}) => theme.radius.lg}px;
  padding: ${({theme}) => theme.spacing.md}px;
  background-color: ${({selected, theme}) =>
    selected ? hexToRgba(theme.colors.accent, 0.1) : theme.colors.surface};
  border-width: ${({selected}) => (selected ? 1.5 : 1)}px;
  border-color: ${({selected, theme}) => (selected ? theme.colors.accent : theme.colors.border)};
`;

export const RowIconTile = styled.View<{selected: boolean}>`
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  border-radius: ${({theme}) => theme.radius.md}px;
  align-items: center;
  justify-content: center;
  background-color: ${({selected, theme}) =>
    hexToRgba(theme.colors.accent, selected ? 0.18 : 0.1)};
`;

export const RowTextBlock = styled.View`
  flex: 1;
  gap: 3px;
`;

export const RowName = styled.Text`
  font-family: ${({theme}) => theme.font.semibold};
  font-size: 15px;
  font-weight: 600;
  color: ${({theme}) => theme.colors.textPrimary};
`;

export const RowSubtitle = styled.Text`
  font-family: ${({theme}) => theme.font.regular};
  font-size: 13px;
  font-weight: 400;
  color: ${({theme}) => theme.colors.textSecondary};
`;

export const RowPriceBlock = styled.View`
  align-items: flex-end;
  gap: 6px;
`;

export const RowPrice = styled.Text<{selected: boolean}>`
  font-family: ${({theme}) => theme.font.bold};
  font-size: 15px;
  font-weight: 700;
  color: ${({selected, theme}) => (selected ? theme.colors.accent : theme.colors.textPrimary)};
`;

export const SelectionCircle = styled.View<{selected: boolean}>`
  width: 22px;
  height: 22px;
  border-radius: ${({theme}) => theme.radius.full}px;
  align-items: center;
  justify-content: center;
  background-color: ${({selected, theme}) => (selected ? theme.colors.accent : 'transparent')};
  border-width: ${({selected}) => (selected ? 0 : 1.5)}px;
  border-color: ${({theme}) => theme.colors.border};
`;

export const SectionBlock = styled.View`
  gap: ${({theme}) => theme.spacing.md}px;
`;

export const SectionTitle = styled.Text`
  font-family: ${({theme}) => theme.font.semibold};
  font-size: 16px;
  font-weight: 600;
  color: ${({theme}) => theme.colors.textPrimary};
`;

export const BarbersRow = styled.ScrollView.attrs({
  horizontal: true,
  contentContainerStyle: {gap: 12, paddingBottom: 4},
  showsHorizontalScrollIndicator: false,
})``;

// Wrapper tela-local para dar ao ~/components/BarberCard (compartilhado, NÃO
// modificado — também usado por Main/index.tsx, Task 13, cujo mockup
// (Main.dc.html) intencionalmente não tem borda/card) o tratamento visual de
// cartão com borda que design/Servicos.dc.html (linhas 78-107) realmente
// mostra: fundo #1E1E24, borda 1px #3F3F46 (não selecionado) ou 1.5px accent
// + fundo levemente tintado (selecionado). Mesmo padrão selected/unselected
// já usado em `Row` acima, para consistência dentro desta tela.
export const BarberCardWrapper = styled.View<{selected: boolean}>`
  width: 132px;
  align-items: center;
  gap: 10px;
  border-radius: ${({theme}) => theme.radius.lg}px;
  padding: 14px;
  background-color: ${({selected, theme}) =>
    selected ? hexToRgba(theme.colors.accent, 0.06) : theme.colors.surface};
  border-width: ${({selected}) => (selected ? 1.5 : 1)}px;
  border-color: ${({selected, theme}) => (selected ? theme.colors.accent : theme.colors.border)};
`;

// Subtitle de papel/especialidade (mockup: "Barbeiro sênior" / "Especialista
// barba") — não existe coluna equivalente em `barbers`, só `bio` (texto
// livre, opcional). Usa `barber.bio` quando presente/não-vazio; cai para o
// rótulo genérico "Barbeiro" caso contrário (ver comentário de uso em
// index.tsx). Renderizada FORA do BarberCard (que não tem prop de
// subtítulo) mas dentro do wrapper, na mesma posição relativa do mockup
// (logo abaixo do nome, já que omitimos a avaliação/rating por falta de
// dado).
export const BarberSubtitle = styled.Text`
  font-family: ${({theme}) => theme.font.medium};
  font-size: 11px;
  font-weight: 500;
  color: ${({theme}) => theme.colors.textSecondary};
  text-align: center;
`;

export const Footer = styled.View`
  position: absolute;
  left: 0px;
  right: 0px;
  bottom: 0px;
  padding: 16px 20px 28px;
  background-color: ${({theme}) => theme.colors.bg};
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
