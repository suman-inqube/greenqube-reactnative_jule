/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */
import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Persnol from './pages/Persnol';
import Financial from './pages/Financial';
import ProduceInfo from './pages/ProduceInfo';
import Dashboard from './pages/admin/Dashboard';
import SignUpViwer from './pages/SignUpViwer';
import SplashScreen from './SplashScreen';
import MyScreen from './pages/_checking/MyScreen';
import AddArray from './pages/_checking/AddArray';
import ProduceInfoUpdate from './pages/ProduceInfoUpdate';
import AdminNavigation from './pages/admin/AdminNavigation';





const Stack = createNativeStackNavigator();
function App(): JSX.Element {

  return (
    <NavigationContainer>
      {/* <Stack.Navigator initialRouteName="SplashScreen">
        <Stack.Screen name="SplashScreen" component={SplashScreen} options={{ headerShown: false }} /> */}
      <Stack.Navigator >
        <Stack.Screen name="AdminNavigation" component={AdminNavigation} options={{ headerShown: false }} />

        <Stack.Screen name="Login"  component={Login} />

        <Stack.Screen name="ProduceInfo" component={ProduceInfo} options={{ title: 'Produce Information' }} />
        <Stack.Screen name="Signup" component={Signup} options={{ title: 'Signup' }} />
        <Stack.Screen name="Persnol" component={Persnol} options={{ title: 'Personal Details' }} />
        <Stack.Screen name="SignUpViwer" component={SignUpViwer} options={{ title: 'Final View' }} />
        <Stack.Screen name="Financial" component={Financial} options={{ title: 'User Financial Details' }} />
        <Stack.Screen name="ProduceInfoUpdate" component={ProduceInfoUpdate} options={{ title: 'Produce Information' }} />
      </Stack.Navigator>
    </NavigationContainer >
  );
}


export default App;
