import React, { useRef, useContext, useState, useEffect } from 'react';
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
import analytics from '@react-native-firebase/analytics';
import { userCreateContext } from './pages/Context/usersCreateContext';
import { addModuleForView } from './config/apiHere';
import { StyleSheet, Alert, View, Image, BackHandler, AppState, ImageBackground } from 'react-native';
import JailMonkey from 'jail-monkey';
const Stack = createNativeStackNavigator();
const navigationRef = createNavigationContainerRef();
function App() {
  //GQR-65
  const { loginUser_data } = useContext(userCreateContext);
  const { dbname, lan_id, token, user_id } = loginUser_data || {};
  //GQR-65
  const routeNameRef = useRef();
  const navigationRef = useRef();
  const [isSecure, setIsSecure] = useState(null); // null = loading
  const [appState, setAppState] = useState(AppState.currentState);
  // useEffect(() => {
  //   const handleAppStateChange = async nextAppState => {
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
  //       return;
  //     }

  //     setIsSecure(true);
  //     setAppState(nextAppState);
  //   };
  //   const subscription = AppState.addEventListener(
  //     'change',
  //     handleAppStateChange,
  //   );
  //   return () => {
  //     subscription.remove();
  //   };
  // }, []);
  // if (isSecure) {
  //   return <View style={styles.content}>
  //     <ImageBackground
  //       source={require('./pages/Common/images/crystal_splash_screen.jpg')} // Replace with the path to your image
  //       style={styles.backgroundImage}
  //     >
  //     </ImageBackground>
  //   </View>
  // }
  return (
    <Provider store={store}>
      <NavigationContainer ref={navigationRef} onReady={() => {
        routeNameRef.current = navigationRef.current.getCurrentRoute().name;
      }}
        onStateChange={async () => {
          const previousRouteName = routeNameRef.current;
          const currentRouteName = navigationRef.current.getCurrentRoute().name;
          if (previousRouteName !== currentRouteName) {
            switch (currentRouteName) {
              case "FarmerFarmIncomeExpenseList":
                addModuleForView(dbname, lan_id, user_id, token, "IncomeExpense User", "module_view", "incomeExpense_user", 1);
                break;
              case "FarmerLoan":
                addModuleForView(dbname, lan_id, user_id, token, "Loan User", "module_view", "loan_user", 1);
                break;
              case "FarmerInsuranceEnquiry":
                addModuleForView(dbname, lan_id, user_id, token, "Insurance User", "module_view", "insurance_user", 1);
                break;
              case "PackageOfPractices":
                addModuleForView(dbname, lan_id, user_id, token, "PoP User", "module_view", "POP_user", 1);
                break;
              default:
            }
            await Promise.all([
              analytics().logScreenView({
                screen_name: currentRouteName,
                screen_class: currentRouteName,
              }),
              analytics().logEvent(currentRouteName, {
                screen_name: currentRouteName,
                activity_name: currentRouteName,
                user_id: currentRouteName,
                timestamp: new Date().toISOString()
              })
            ])
          }
          routeNameRef.current = currentRouteName;
        }
        }
      >
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
const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  content: {
    flex: 1,
    marginTop: 130,
    alignItems: 'center',
  },
  logo: {
    width: 250,
    height: 150,
    resizeMode: 'contain',
  },
})
