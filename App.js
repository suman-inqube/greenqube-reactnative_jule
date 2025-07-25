import React, {useRef, useContext, useState, useEffect} from 'react';
import {
  NavigationContainer,
  createNavigationContainerRef,
} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Provider} from 'react-redux';
import {
  AppState,
  Alert,
  BackHandler,
  View,
  ImageBackground,
  StyleSheet,
} from 'react-native';
import JailMonkey from 'jail-monkey';
import analytics from '@react-native-firebase/analytics';

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

import {userCreateContext} from './pages/Context/usersCreateContext';
import {addModuleForView} from './config/apiHere';
import store from './pages/redux/store';
import './ignoreWarnings';

const Stack = createNativeStackNavigator();
const navigationRef = createNavigationContainerRef();

function App() {
  const routeNameRef = useRef();
  const {loginUser_data} = useContext(userCreateContext)||{};
  const {dbname, lan_id, token, user_id} = loginUser_data || {};
  const [isSecure, setIsSecure] = useState(null);

  // useEffect(() => {
  //   const handleAppStateChange = async () => {
  //     const isRooted = JailMonkey.isJailBroken();
  //     const isDevMode = await JailMonkey.isDevelopmentSettingsMode();

  //     if (isRooted || isDevMode) {
  //       Alert.alert(
  //         'Security Alert',
  //         isRooted
  //           ? 'This device is rooted. The app will now exit.'
  //           : 'Developer mode is enabled. The app will now exit.',
  //         [
  //           {
  //             text: 'OK',
  //             onPress: () => {
  //               setTimeout(() => {
  //                 BackHandler.exitApp();
  //               }, 800);
  //             },
  //           },
  //         ],
  //         { cancelable: false }
  //       );
  //       setIsSecure(false);
  //       return;
  //     }

  //     // setIsSecure(true);
  //   };

  //   const subscription = AppState.addEventListener('change', handleAppStateChange);
  //   handleAppStateChange();

  //   return () => {
  //     subscription.remove();
  //   };
  // }, []);
  return (
    <Provider store={store}>
      <NavigationContainer
        ref={navigationRef}
        onReady={() => {
          routeNameRef.current = navigationRef.getCurrentRoute().name;
        }}
        onStateChange={async () => {
          const previousRouteName = routeNameRef.current;
          const currentRouteName = navigationRef.getCurrentRoute().name;

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

            await Promise.all([
              analytics().logScreenView({
                screen_name: currentRouteName,
                screen_class: currentRouteName,
              }),
              analytics().logEvent(currentRouteName, {
                screen_name: currentRouteName,
                activity_name: currentRouteName,
                user_id: user_id,
                timestamp: new Date().toISOString(),
              }),
            ]);
          }

          routeNameRef.current = currentRouteName;
        }}>
        <Stack.Navigator initialRouteName="SplashScreen">
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
    </Provider>
  );
}

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
