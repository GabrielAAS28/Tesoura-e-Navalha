import 'react-native-gesture-handler';
import React from 'react';
import {StatusBar} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {NavigationContainer} from '@react-navigation/native';
import {ThemeProvider} from 'styled-components/native';
import theme from '~/styles/theme';
import Routes from '~/routes';

const App = () => (
  <SafeAreaProvider>
    <ThemeProvider theme={theme}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.bg} />
      <NavigationContainer>
        <Routes />
      </NavigationContainer>
    </ThemeProvider>
  </SafeAreaProvider>
);

export default App;
