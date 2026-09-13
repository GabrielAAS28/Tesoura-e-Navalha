import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Login from '~/screens/Login';
import BarbeiroCadastro from '~/screens/BarbeiroCadastro';
import BarbeiroCadastroEtapa2 from '~/screens/BarbeiroCadastroEtapa2';

const Stack = createNativeStackNavigator();

export default function AuthRoutes() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="BarbeiroCadastro" component={BarbeiroCadastro} />
      <Stack.Screen name="BarbeiroCadastroEtapa2" component={BarbeiroCadastroEtapa2} />
    </Stack.Navigator>
  );
}
