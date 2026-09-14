import React from 'react';
import {getFocusedRouteNameFromRoute} from '@react-navigation/native';
import {createBottomTabNavigator, BottomTabBarProps} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import BottomTabBar from '~/components/BottomTabBar';
import Main from '~/screens/Main';
import Servicos from '~/screens/Servicos';
import Agendamento from '~/screens/Agendamento';
import Checkout from '~/screens/Checkout';
import Agendamentos from '~/screens/Agendamentos';
import Perfil from '~/screens/Perfil';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Telas do HomeStack sem tab bar nos mockups (design/Servicos.dc.html,
// design/Agendamento.dc.html, design/Checkout.dc.html terminam só com CTA,
// sem tab bar — apenas Main/Agendamentos/Perfil mostram a tab bar).
const HOME_STACK_SCREENS_WITHOUT_TAB_BAR = ['Servicos', 'Agendamento', 'Checkout'];

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="Main" component={Main} />
      <Stack.Screen name="Servicos" component={Servicos} />
      <Stack.Screen name="Agendamento" component={Agendamento} />
      <Stack.Screen name="Checkout" component={Checkout} />
    </Stack.Navigator>
  );
}

// BottomTabBar é uma tab bar totalmente customizada (não a nativa do
// bottom-tabs), então `options.tabBarStyle` não é aplicado automaticamente —
// precisamos checá-lo aqui e não renderizar a tab bar quando ele pedir
// display:'none' (telas internas do HomeStack).
const renderTabBar = (props: BottomTabBarProps) => {
  const {state, descriptors} = props;
  const focusedRoute = state.routes[state.index];
  const tabBarStyle = descriptors[focusedRoute.key].options.tabBarStyle as
    | {display?: string}
    | undefined;
  if (tabBarStyle?.display === 'none') return null;
  return <BottomTabBar {...props} />;
};

function getMainTabOptions({route}: {route: {key: string; name: string; params?: object}}) {
  const nestedRouteName = getFocusedRouteNameFromRoute(route) ?? 'Main';
  return {
    tabBarStyle: HOME_STACK_SCREENS_WITHOUT_TAB_BAR.includes(nestedRouteName)
      ? {display: 'none' as const}
      : undefined,
  };
}

export default function ClientRoutes() {
  return (
    <Tab.Navigator screenOptions={{headerShown: false}} tabBar={renderTabBar}>
      <Tab.Screen name="Main" component={HomeStack} options={getMainTabOptions} />
      <Tab.Screen name="Agendamentos" component={Agendamentos} />
      <Tab.Screen name="Perfil" component={Perfil} />
    </Tab.Navigator>
  );
}
