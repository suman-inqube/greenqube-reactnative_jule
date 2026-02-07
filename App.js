import React, {useRef, useContext, useState, useEffect, lazy} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import 'react-native-gesture-handler';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {
  AppState,
  Alert,
  BackHandler,
  View,
  ImageBackground,
  StyleSheet,
} from 'react-native';
// import analytics from '@react-native-firebase/analytics';

import SplashScreen from './SplashScreen';
import AdminNavigation from './pages/admin/AdminNavigation';
import FarmerNavigation from './pages/admin/FarmerNavigation';
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const SignUpViwer = lazy(() => import('./pages/SignUpViwer'));
const Persnol = lazy(() => import('./pages/Persnol'));
const PersnolUpdate = lazy(() => import('./pages/PersnolUpdate'));
const Financial = lazy(() => import('./pages/Financial'));
const FinancialUpdate = lazy(() => import('./pages/FinancialUpdate'));
const ProduceInfo = lazy(() => import('./pages/ProduceInfo'));
const ProduceInfoUpdate = lazy(() => import('./pages/ProduceInfoUpdate'));
import withSecurityCheck from './pages/SecurityCheck/withSecurityCheck';
import {userCreateContext} from './pages/Context/usersCreateContext';
import {addModuleForView} from './config/apiHere';
import './ignoreWarnings';
import {navigationRef} from './pages/utils/NavigationUtils';
const Stack = createNativeStackNavigator();
// import { Provider as PaperProvider } from 'react-native-paper';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {useBackgroundSync} from './pages/utils/useBackgroundSync';
const App = withSecurityCheck(() => {
  const routeNameRef = useRef();
  const {loginUser_data} = useContext(userCreateContext) || {};
  const {dbname, lan_id, token, user_id} = loginUser_data || {};
  useBackgroundSync();

  // useEffect(() => {
  //   const unsubscribe = navigationRef.addListener('state', () => {
  //     if (navigationRef.isReady()) {
  //       const state = navigationRef.getRootState();
  //       console.log('🔍 Full Navigation Tree:', JSON.stringify(state, null, 2));

  //       const currentRoute = navigationRef.getCurrentRoute();
  //       const currentRouteName = currentRoute?.name;
  //       const previousRouteName = routeNameRef.current;

  //       if (previousRouteName !== currentRouteName) {
  //         console.log('📍 Route changed:', previousRouteName, '➡️', currentRouteName);
  //       }

  //       routeNameRef.current = currentRouteName;
  //     }
  //   });

  //   return unsubscribe;
  // }, [navigationRef]);
  return (
    // <PaperProvider>
    <SafeAreaProvider>
      <GestureHandlerRootView style={{flex: 1}}>
        <NavigationContainer
          ref={navigationRef}
          onReady={() => {
            routeNameRef.current = navigationRef.getCurrentRoute().name;
          }}
          onStateChange={async () => {
            const previousRouteName = routeNameRef.current;
            const currentRouteName = navigationRef.getCurrentRoute().name;
            console.log('currentRouteName', currentRouteName);
            if (previousRouteName !== currentRouteName) {
              switch (currentRouteName) {
                case 'FarmerFarmIncomeExpenseList':
                  addModuleForView(
                    dbname,
                    lan_id,
                    user_id,
                    token,
                    'IncomeExpense User',
                    'module_view',
                    'incomeExpense_user',
                    1,
                  );
                  break;
                case 'FarmerLoan':
                  addModuleForView(
                    dbname,
                    lan_id,
                    user_id,
                    token,
                    'Loan User',
                    'module_view',
                    'loan_user',
                    1,
                  );
                  break;
                case 'FarmerInsuranceEnquiry':
                  addModuleForView(
                    dbname,
                    lan_id,
                    user_id,
                    token,
                    'Insurance User',
                    'module_view',
                    'insurance_user',
                    1,
                  );
                  break;
                case 'PackageOfPractices':
                  addModuleForView(
                    dbname,
                    lan_id,
                    user_id,
                    token,
                    'PoP User',
                    'module_view',
                    'pop_user',
                    1,
                  );
                  break;
                default:
                  break;
              }

              // await Promise.all([
              //   analytics().logScreenView({
              //     screen_name: currentRouteName,
              //     screen_class: currentRouteName,
              //   }),
              //   analytics().logEvent(currentRouteName, {
              //     screen_name: currentRouteName,
              //     activity_name: currentRouteName,
              //     user_id: user_id,
              //     timestamp: new Date().toISOString(),
              //   }),
              // ]);
            }

            routeNameRef.current = currentRouteName;
          }}>
          <Stack.Navigator
            initialRouteName="SplashScreen"
            screenOptions={{headerShown: false, lazy: true}}>
            <Stack.Screen
              name="SplashScreen"
              component={SplashScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="Login"
              component={Login}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="Signup"
              component={Signup}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="SignUpViwer"
              component={SignUpViwer}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="Persnol"
              component={Persnol}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="PersnolUpdate"
              component={PersnolUpdate}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="Financial"
              component={Financial}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="FinancialUpdate"
              component={FinancialUpdate}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="ProduceInfo"
              component={ProduceInfo}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="ProduceInfoUpdate"
              component={ProduceInfoUpdate}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="AdminNavigation"
              component={AdminNavigation}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="FarmerNavigation"
              component={FarmerNavigation}
              options={{headerShown: false}}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </GestureHandlerRootView>
    </SafeAreaProvider>
    // </PaperProvider>
  );
});

export default App;

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
