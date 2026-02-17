import React, {useEffect, useState} from 'react';
import {Alert, BackHandler, AppState, View, Text, Linking} from 'react-native';
import JailMonkey from 'jail-monkey';
import VersionCheck from 'react-native-version-check';
const withSecurityCheck = WrappedComponent => {
  return props => {
    const [isSecure, setIsSecure] = useState(true);
    const [checked, setChecked] = useState(false);
    useEffect(() => {
      if (__DEV__) {
        setChecked(true);
        return;
      }
      const handleAppStateChange = async nextAppState => {
        try {
          const [isRooted, isDevMode] = await Promise.all([
            JailMonkey.isJailBroken(),
            JailMonkey.isDevelopmentSettingsMode(),
          ]);

          if (isRooted || isDevMode) {
            setIsSecure(false);
            Alert.alert(
              'Security Alert',
              isRooted
                ? 'This device is rooted. The app will now exit.'
                : 'We have Detected that you have Enabled Developer Options. Please Disable Developer Options to continue.',
              [
                {
                  text: 'OK',
                  onPress: () => {
                    setTimeout(() => {
                      BackHandler.exitApp();
                    }, 800);
                  },
                },
              ],
              {cancelable: false},
            );
            return;
          } else {
            const latestVersion = await VersionCheck.getLatestVersion({
              provider: 'playStore',
              packageName: 'com.inqube.greenqube',
              ignoreErrors: true,
            });
            const currentVersion = VersionCheck.getCurrentVersion();
            if (latestVersion != currentVersion) {
              Alert.alert(
                'Update Required',
                'A new version of the app is available. Please update to continue using the app.',
                [
                  {
                    text: 'Update Now',
                    onPress: () => {
                      Linking.openURL(
                        'https://play.google.com/store/apps/details?id=com.inqube.greenqube',
                      );
                    },
                  },
                ],
                // { cancelable: false },
              );
              return;
            }
          }
          setIsSecure(true);
        } catch (error) {
          console.error('Security check failed:', error);
          setIsSecure(false);
        }
        setChecked(true);
      };
      const subscription = AppState.addEventListener(
        'change',
        handleAppStateChange,
      );
      handleAppStateChange('active');
      return () => subscription.remove();
    }, []);
    if (!checked) {
      return (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Text>Checking security...</Text>
        </View>
      );
    }
    if (!isSecure) {
      return null;
    }
    return <WrappedComponent {...props} />;
  };
};
export default withSecurityCheck;
