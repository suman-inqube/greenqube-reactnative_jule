import React, {useRef, useContext, lazy} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import 'react-native-gesture-handler';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {StyleSheet} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';

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
import {BottomSheetProvider} from './pages/Common/BottomSheetProvider';

const Stack = createNativeStackNavigator();

/* ============================= */
/*          MAIN CONTENT         */
/* ============================= */

function AppContent() {
  const routeNameRef = useRef();
  const {loginUser_data} = useContext(userCreateContext) || {};
  const {dbname, lan_id, token, user_id} = loginUser_data || {};

  return (
    <BottomSheetProvider>
      <SafeAreaProvider>
        <GestureHandlerRootView style={{flex: 1}}>
          <NavigationContainer
            ref={navigationRef}
            onReady={() => {
              routeNameRef.current = navigationRef.getCurrentRoute()?.name;
            }}
            onStateChange={() => {
              const previousRouteName = routeNameRef.current;
              const currentRouteName = navigationRef.getCurrentRoute()?.name;

              if (
                previousRouteName !== currentRouteName &&
                dbname &&
                token &&
                user_id
              ) {
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
              }

              routeNameRef.current = currentRouteName;
            }}>
            <Stack.Navigator
              initialRouteName="SplashScreen"
              screenOptions={{headerShown: false}}
              >
              <Stack.Screen name="SplashScreen" component={SplashScreen} />
              <Stack.Screen name="Login" component={Login} />
              <Stack.Screen name="Signup" component={Signup} />
              <Stack.Screen name="SignUpViwer" component={SignUpViwer} />
              <Stack.Screen name="Persnol" component={Persnol} />
              <Stack.Screen name="PersnolUpdate" component={PersnolUpdate} />
              <Stack.Screen name="Financial" component={Financial} />
              <Stack.Screen
                name="FinancialUpdate"
                component={FinancialUpdate}
              />
              <Stack.Screen name="ProduceInfo" component={ProduceInfo} />
              <Stack.Screen
                name="ProduceInfoUpdate"
                component={ProduceInfoUpdate}
              />
              <Stack.Screen
                name="AdminNavigation"
                component={AdminNavigation}
              />
              <Stack.Screen
                name="FarmerNavigation"
                component={FarmerNavigation}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </BottomSheetProvider>
  );
}

/* ============================= */
/*        SECURITY WRAPPER       */
/* ============================= */

const App = withSecurityCheck(AppContent);

export default App;

/* ============================= */
/*            STYLES             */
/* ============================= */


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
