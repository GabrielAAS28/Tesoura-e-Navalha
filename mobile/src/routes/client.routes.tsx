import React from 'react';
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

const renderTabBar = (props: BottomTabBarProps) => <BottomTabBar {...props} />;

export default function ClientRoutes() {
  return (
    <Tab.Navigator screenOptions={{headerShown: false}} tabBar={renderTabBar}>
      <Tab.Screen name="Main" component={HomeStack} />
      <Tab.Screen name="Agendamentos" component={Agendamentos} />
      <Tab.Screen name="Perfil" component={Perfil} />
    </Tab.Navigator>
  );
}
