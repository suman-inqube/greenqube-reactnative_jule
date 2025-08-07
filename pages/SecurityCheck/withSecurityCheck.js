import React, { useEffect, useState } from 'react';
import { Alert, BackHandler, AppState, View, Text } from 'react-native';
import JailMonkey from 'jail-monkey';
const withSecurityCheck = (WrappedComponent) => {
  return (props) => {
    const [isSecure, setIsSecure] = useState(true);
    const [checked, setChecked] = useState(false);
    // useEffect(() => {
    //   if (__DEV__) {
    //     setChecked(true);
    //     return;
    //   }
    //   const handleAppStateChange = async (nextAppState) => {
    //     if (nextAppState !== 'active') return;
    //     try {
    //       const isRooted = JailMonkey.isJailBroken();
    //       const isDevMode = await JailMonkey.isDevelopmentSettingsMode();
    //       if (isRooted || isDevMode) {
    //         setIsSecure(false);
    //         Alert.alert(
    //           'Security Alert',
    //           isRooted
    //             ? 'This device is rooted. The app will now exit.'
    //             : 'Developer mode is enabled. The app will now exit.',
    //           [
    //             {
    //               text: 'OK',
    //               onPress: () => {
    //                 setTimeout(() => {
    //                   BackHandler.exitApp();
    //                 }, 800);
    //               },
    //             },
    //           ],
    //           { cancelable: false }
    //         );
    //         return;
    //       }
    //       setIsSecure(true);
    //     } catch (error) {
    //       console.error('Security check failed:', error);
    //       setIsSecure(false);
    //     }
    //     setChecked(true);
    //   };
    //   const subscription = AppState.addEventListener('change', handleAppStateChange);
    //   handleAppStateChange('active');
    //   return () => subscription.remove();
    // }, []);
    // if (!checked) {
    //   return (
    //     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    //       <Text>Checking security...</Text>
    //     </View>
    //   );
    // }
    if (!isSecure) {
      return null;
    }
    return <WrappedComponent {...props} />;
  };
};
export default withSecurityCheck;
