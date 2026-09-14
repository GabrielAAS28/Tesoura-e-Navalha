import React from 'react';
import {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import styled, {useTheme} from 'styled-components/native';
import Icon, {IconName} from '~/components/Icon';

// `insetBottom` soma o inset seguro real do device (home indicator no iOS,
// gesture nav no Android) ao padding/altura fixos do mockup — necessário
// porque o Android SDK 36 (ver Task 0) torna edge-to-edge obrigatório, então
// sem isso a tab bar fica parcialmente sob a barra de navegação do sistema
// em qualquer device com inset > 0. Em um device sem inset (insetBottom=0)
// o resultado é idêntico ao valor fixo anterior.
const Container = styled.View<{insetBottom: number}>`
  flex-direction: row;
  align-items: center;
  justify-content: space-around;
  height: ${({insetBottom}) => 84 + insetBottom}px;
  padding-bottom: ${({insetBottom}) => 16 + insetBottom}px;
  background-color: ${({theme}) => theme.colors.surface};
  border-top-width: 1px;
  border-top-color: ${({theme}) => theme.colors.border};
`;

const Tab = styled.TouchableOpacity`
  flex-direction: column;
  align-items: center;
  gap: 4px;
`;

const Label = styled.Text<{focused: boolean}>`
  font-family: ${({theme, focused}) => (focused ? theme.font.semibold : theme.font.medium)};
  font-size: 11px;
  font-weight: ${({focused}) => (focused ? 600 : 500)};
  color: ${({theme, focused}) => (focused ? theme.colors.accent : theme.colors.textSecondary)};
`;

// Mapeamento por nome de rota (Task 10: client tabs Main/Agendamentos/Perfil,
// barber tabs BarbeiroAgenda/BarbeiroServicos/BarbeiroHorarios/Perfil).
// Ícone e rótulo de "Main"/"Agendamentos"/"Perfil" confirmados em
// design/Main.dc.html, design/Agendamentos.dc.html e design/Perfil.dc.html
// ("Início"/"Agenda"/"Perfil"). As rotas do barbeiro não têm tab bar nos
// mockups — ícone/rótulo abaixo são extrapolação razoável a partir do nome
// da rota.
const ROUTE_META: Record<string, {icon: IconName; label: string}> = {
  Main: {icon: 'home', label: 'Início'},
  Agendamentos: {icon: 'calendar', label: 'Agenda'},
  Perfil: {icon: 'user', label: 'Perfil'},
  BarbeiroAgenda: {icon: 'calendar', label: 'Agenda'},
  BarbeiroServicos: {icon: 'scissors', label: 'Serviços'},
  BarbeiroHorarios: {icon: 'clock', label: 'Horários'},
};

export default function BottomTabBar({state, descriptors, navigation}: BottomTabBarProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Container insetBottom={insets.bottom}>
      {state.routes.map((route, index) => {
        const {options} = descriptors[route.key];
        const meta = ROUTE_META[route.name];
        const focused = state.index === index;
        const color = focused ? theme.colors.accent : theme.colors.textSecondary;

        const label =
          typeof options.tabBarLabel === 'string'
            ? options.tabBarLabel
            : options.title ?? meta?.label ?? route.name;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({type: 'tabLongPress', target: route.key});
        };

        return (
          <Tab
            key={route.key}
            accessibilityRole="button"
            accessibilityState={focused ? {selected: true} : {}}
            onPress={onPress}
            onLongPress={onLongPress}
            activeOpacity={0.8}>
            {options.tabBarIcon ? (
              options.tabBarIcon({focused, color, size: 22})
            ) : (
              <Icon name={meta?.icon ?? 'home'} size={22} color={color} />
            )}
            <Label focused={focused}>{label}</Label>
          </Tab>
        );
      })}
    </Container>
  );
}
