/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Persnol from './pages/Persnol';
import Financial from './pages/Financial';
import FinancialUpdate from './pages/FinancialUpdate';
import PersnolUpdate from './pages/PersnolUpdate';
import ProduceInfo from './pages/ProduceInfo';
import SignUpViwer from './pages/SignUpViwer';
import SplashScreen from './SplashScreen';
import ProduceInfoUpdate from './pages/ProduceInfoUpdate';
import AdminNavigation from './pages/admin/AdminNavigation';
import FarmerNavigation from './pages/admin/FarmerNavigation';
import { createNavigationContainerRef } from '@react-navigation/native';
import './ignoreWarnings';
import { Provider } from 'react-redux';
import store from './pages/redux/store';
const Stack = createNativeStackNavigator();
const navigationRef = createNavigationContainerRef();
function App() {
  return (
    <Provider store={store}>
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator initialRouteName="SplashScreen">
          <Stack.Screen name="FarmerNavigation" component={FarmerNavigation} options={{ headerShown: false }} />
          <Stack.Screen name="AdminNavigation" component={AdminNavigation} options={{ headerShown: false }} />
          <Stack.Screen name="SplashScreen" component={SplashScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
          <Stack.Screen name="ProduceInfo" component={ProduceInfo} options={{ headerShown: false }} />
          <Stack.Screen name="Signup" component={Signup} options={{ headerShown: false }} />
          <Stack.Screen name="Persnol" component={Persnol} options={{ headerShown: false }} />
          <Stack.Screen name="SignUpViwer" component={SignUpViwer} options={{ headerShown: false }} />
          <Stack.Screen name="Financial" component={Financial} options={{ headerShown: false }} />
          <Stack.Screen name="ProduceInfoUpdate" component={ProduceInfoUpdate} options={{ headerShown: false }} />
          <Stack.Screen name="PersnolUpdate" component={PersnolUpdate} options={{ headerShown: false }} />
          <Stack.Screen name="FinancialUpdate" component={FinancialUpdate} options={{ headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
}

export default App;
