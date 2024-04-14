/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Persnol from './pages/Persnol';
import Financial from './pages/Financial';
import FinancialUpdate from './pages/FinancialUpdate';
import PersnolUpdate from './pages/PersnolUpdate';
import ProduceInfo from './pages/ProduceInfo';
import Dashboard from './pages/admin/Dashboard';
import SignUpViwer from './pages/SignUpViwer';
import SplashScreen from './SplashScreen';
import MyScreen from './pages/_checking/MyScreen';
import AddArray from './pages/_checking/AddArray';
import ProduceInfoUpdate from './pages/ProduceInfoUpdate';
import AdminNavigation from './pages/admin/AdminNavigation';
import FarmerNavigation from './pages/admin/FarmerNavigation';
import { createNavigationContainerRef } from '@react-navigation/native';
// import Products from './pages/admin/Inputs/Products';
import PostEnquiries from './pages/admin/Inputs/PastEnquiries';
import PostEnquiriesModel from './pages/admin/Inputs/PastEnquiriesModel';
import OutPut from './pages/admin/Output/OutPut';
import ActivityList from './pages/admin/Activity/ActivityList';
// import ProblemReporting from './pages/admin/Problem/ProblemReporting';
import './ignoreWarnings';
import { Provider } from 'react-redux';
import { PermissionsAndroid, Platform } from 'react-native';
import store from './pages/redux/store';
// import messaging from '@react-native-firebase/messaging';
const Stack = createNativeStackNavigator();
const navigationRef = createNavigationContainerRef();
import { Alert } from 'react-native';
function App() {
  const [loginData, setLoginData] = useState([]);
  // const onPageLoad = async () => {
  //   const loginUser_data = await getItem('loginUser_data');
  //   if (loginUser_data) {
  //     setLoginData(loginUser_data);
  //   }
  // }
  return (
    <Provider store={store}>
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator initialRouteName="SplashScreen">
          {/* <Stack.Navigator > */}
          {/* <Stack.Screen name="Dashboard" component={Dashboard} options={{ headerShown: false }}/> */}
          {/* <Stack.Screen name="Products" component={Products} options={{ headerShown: false }} />
        <Stack.Screen name="PostEnquiries" component={PostEnquiries} options={{ headerShown: false }} />
        <Stack.Screen name="PostEnquiriesModel" component={PostEnquiriesModel} options={{ headerShown: false }} /> */}
          <Stack.Screen
            name="FarmerNavigation"
            component={FarmerNavigation}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="AdminNavigation"
            component={AdminNavigation}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="SplashScreen"
            component={SplashScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Login"
            component={Login}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ProduceInfo"
            component={ProduceInfo}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Signup"
            component={Signup}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Persnol"
            component={Persnol}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="SignUpViwer"
            component={SignUpViwer}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Financial"
            component={Financial}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ProduceInfoUpdate"
            component={ProduceInfoUpdate}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="PersnolUpdate"
            component={PersnolUpdate}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="FinancialUpdate"
            component={FinancialUpdate}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
}

export default App;
