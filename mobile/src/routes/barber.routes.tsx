import React from 'react';
import {createBottomTabNavigator, BottomTabBarProps} from '@react-navigation/bottom-tabs';
import BottomTabBar from '~/components/BottomTabBar';
import BarbeiroAgenda from '~/screens/BarbeiroAgenda';
import BarbeiroServicos from '~/screens/BarbeiroServicos';
import BarbeiroHorarios from '~/screens/BarbeiroHorarios';
import Perfil from '~/screens/Perfil';

const Tab = createBottomTabNavigator();

const renderTabBar = (props: BottomTabBarProps) => <BottomTabBar {...props} />;

export default function BarberRoutes() {
  return (
    <Tab.Navigator screenOptions={{headerShown: false}} tabBar={renderTabBar}>
      <Tab.Screen name="BarbeiroAgenda" component={BarbeiroAgenda} />
      <Tab.Screen name="BarbeiroServicos" component={BarbeiroServicos} />
      <Tab.Screen name="BarbeiroHorarios" component={BarbeiroHorarios} />
      <Tab.Screen name="Perfil" component={Perfil} />
    </Tab.Navigator>
  );
}
