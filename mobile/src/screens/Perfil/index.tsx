import React, {useCallback} from 'react';
import {Alert} from 'react-native';
import Svg, {Path, Rect, Circle} from 'react-native-svg';
import {useTheme} from 'styled-components/native';
import Avatar from '~/components/Avatar';
import Icon from '~/components/Icon';
import {useAuth} from '~/contexts/AuthContext';
import {
  Screen,
  Scroller,
  ProfileHeaderRow,
  NameBlock,
  Name,
  Subtitle,
  EditButton,
  LoyaltyCard,
  LoyaltyHeaderRow,
  LoyaltyTitle,
  LoyaltyGrid,
  LoyaltyRow,
  LoyaltySlot,
  LoyaltyCaption,
  LoyaltyHighlight,
  MenuList,
  MenuRow,
  MenuIconTile,
  MenuLabel,
} from './styles';

// Ícones específicos desta tela, copiados literalmente de
// design/Perfil.dc.html — não existem variantes equivalentes em
// ~/components/Icon.tsx hoje (mesma solução de ícones locais já usada em
// Checkout/index.tsx e Servicos/index.tsx para glifos de uso único).
function PencilIcon({color}: {color: string}) {
  return (
    <Svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round">
      <Path d="M12 20h9" />
      <Path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
    </Svg>
  );
}

function PaymentCardIcon({color}: {color: string}) {
  return (
    <Svg
      width={17}
      height={17}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round">
      <Rect x="2" y="5" width="20" height="14" rx="2" />
      <Path d="M2 10h20" />
    </Svg>
  );
}

function HelpIcon({color}: {color: string}) {
  return (
    <Svg
      width={17}
      height={17}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round">
      <Circle cx="12" cy="12" r="9" />
      <Path d="M12 17v.01M12 14a2 2 0 1 0-2-2" />
    </Svg>
  );
}

function LogoutIcon({color}: {color: string}) {
  return (
    <Svg
      width={17}
      height={17}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round">
      <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <Path d="M16 17l5-5-5-5" />
      <Path d="M21 12H9" />
    </Svg>
  );
}

function CheckIcon({color}: {color: string}) {
  return (
    <Svg
      width={14}
      height={14}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2.6}
      strokeLinecap="round"
      strokeLinejoin="round">
      <Path d="M20 6L9 17l-5-5" />
    </Svg>
  );
}

// Duplicado de Main/index.tsx, Checkout/index.tsx e Agendamentos/index.tsx —
// não há helper equivalente em ~/utils hoje. Deriva iniciais (até 2 letras)
// do nome completo.
function getInitials(fullName: string | null | undefined): string {
  const trimmed = (fullName ?? '').trim();
  if (!trimmed) return '?';
  const parts = trimmed.split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? '' : '';
  return (first + last).toUpperCase();
}

// Cartão Fidelidade é 100% decorativo/estático — não existe tabela de
// pontos/fidelidade no schema (ver "Controller ruling" #2 do dispatch desta
// task). Os valores abaixo (6 preenchidos, 3 vazios, 1 com ícone de navalha,
// "faltam 4 cortes") são copiados literalmente de design/Perfil.dc.html
// (10 slots no grid = 6+3+1; "faltam 4" bate com 10-6). Não representam
// nenhuma contagem real de agendamentos do usuário.
const LOYALTY_FILLED_COUNT = 6;
const LOYALTY_TOTAL_SLOTS = 10;

// Itens de menu sem tela correspondente em nenhum lugar do app (ver
// "Controller ruling" #3 do dispatch desta task) — renderizados fiéis ao
// mockup (ícone + label + chevron) mas sem `onPress` funcional.
const PLACEHOLDER_MENU_ITEMS = [
  {key: 'dados', label: 'Meus Dados', icon: 'user' as const},
  {key: 'pagamento', label: 'Formas de Pagamento', icon: 'card' as const},
  {key: 'notificacoes', label: 'Notificações', icon: 'bell' as const},
  {key: 'ajuda', label: 'Ajuda', icon: 'help' as const},
];

export default function Perfil() {
  const theme = useTheme();
  const {session, profile, signOut} = useAuth();

  const initials = getInitials(profile?.full_name);
  const name = profile?.full_name?.trim() || 'Cliente';
  // Ver "Controller ruling" #1 do dispatch desta task: `Profile` não tem
  // campo de e-mail — usa o e-mail da sessão Supabase quando presente
  // (usuários que entraram com Google) e cai para `profile.phone` quando o
  // e-mail é null/undefined (usuários que entraram por telefone).
  const contactLabel = session?.user.email ?? profile?.phone ?? '';

  const handleSair = useCallback(() => {
    Alert.alert('Sair', 'Tem certeza que deseja sair da sua conta?', [
      {text: 'Cancelar', style: 'cancel'},
      {
        text: 'Sair',
        style: 'destructive',
        onPress: () => {
          signOut();
        },
      },
    ]);
  }, [signOut]);

  return (
    <Screen>
      <Scroller>
        <ProfileHeaderRow>
          <Avatar initials={initials} size={64} />
          <NameBlock>
            <Name>{name}</Name>
            {!!contactLabel && <Subtitle>{contactLabel}</Subtitle>}
          </NameBlock>
          <EditButton disabled activeOpacity={1}>
            <PencilIcon color={theme.colors.textSecondary} />
          </EditButton>
        </ProfileHeaderRow>

        <LoyaltyCard>
          <LoyaltyHeaderRow>
            <LoyaltyTitle>Cartão Fidelidade</LoyaltyTitle>
            <Icon name="scissors" size={18} color={theme.colors.accent} strokeWidth={1.8} />
          </LoyaltyHeaderRow>
          <LoyaltyGrid>
            {[0, 1].map(rowIndex => (
              <LoyaltyRow key={rowIndex}>
                {Array.from({length: 5}).map((_, colIndex) => {
                  const slotIndex = rowIndex * 5 + colIndex;
                  const filled = slotIndex < LOYALTY_FILLED_COUNT;
                  const isLastSlot = slotIndex === LOYALTY_TOTAL_SLOTS - 1;
                  return (
                    <LoyaltySlot key={slotIndex} filled={filled}>
                      {filled && <CheckIcon color={theme.colors.bg} />}
                      {!filled && isLastSlot && (
                        <Icon name="beard" size={14} color={theme.colors.textSecondary} strokeWidth={1.8} />
                      )}
                    </LoyaltySlot>
                  );
                })}
              </LoyaltyRow>
            ))}
          </LoyaltyGrid>
          <LoyaltyCaption>
            Faltam <LoyaltyHighlight>{LOYALTY_TOTAL_SLOTS - LOYALTY_FILLED_COUNT} cortes</LoyaltyHighlight> para o
            próximo corte grátis
          </LoyaltyCaption>
        </LoyaltyCard>

        <MenuList>
          {PLACEHOLDER_MENU_ITEMS.map(item => (
            <MenuRow key={item.key} disabled activeOpacity={1}>
              <MenuIconTile>
                {item.icon === 'card' && <PaymentCardIcon color={theme.colors.accent} />}
                {item.icon === 'help' && <HelpIcon color={theme.colors.accent} />}
                {(item.icon === 'user' || item.icon === 'bell') && (
                  <Icon name={item.icon} size={17} color={theme.colors.accent} strokeWidth={1.8} />
                )}
              </MenuIconTile>
              <MenuLabel>{item.label}</MenuLabel>
              <Icon name="chevronRight" size={16} color={theme.colors.textSecondary} strokeWidth={2} />
            </MenuRow>
          ))}
          <MenuRow last onPress={handleSair} activeOpacity={0.7}>
            <MenuIconTile destructive>
              <LogoutIcon color={theme.colors.error} />
            </MenuIconTile>
            <MenuLabel destructive>Sair</MenuLabel>
          </MenuRow>
        </MenuList>
      </Scroller>
    </Screen>
  );
}
