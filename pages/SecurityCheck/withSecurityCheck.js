import React, {useEffect, useState, useRef} from 'react';
import {Alert, BackHandler, AppState, View, Text, Linking} from 'react-native';
import JailMonkey from 'jail-monkey';
import NetInfo from '@react-native-community/netinfo';
import VersionCheck from 'react-native-version-check';

const PLAY_STORE_URL =
  'https://play.google.com/store/apps/details?id=com.inqube.greenqube';

const withSecurityCheck = WrappedComponent => {
  return function SecurityWrapper(props) {
    const [isChecking, setIsChecking] = useState(true);
    const [isSecure, setIsSecure] = useState(true);

    const appStateRef = useRef(AppState.currentState);
    const alertShownRef = useRef(false);

    // 🔴 Exit app safely
    const exitApp = () => {
      setTimeout(() => BackHandler.exitApp(), 500);
    };

    // 🔐 CRITICAL SECURITY CHECK (BLOCKING)
    const runSecurityCheck = async () => {
      try {
        const [isRooted, isDevMode] = await Promise.all([
          JailMonkey.isJailBroken(),
          JailMonkey.isDevelopmentSettingsMode(),
        ]);

        if (isRooted || (isDevMode && !__DEV__)) {
          setIsSecure(false);

          if (!alertShownRef.current) {
            alertShownRef.current = true;

            Alert.alert(
              'Security Alert',
              isRooted
                ? 'This device is rooted. The app will now exit.'
                : 'Developer Options detected. Please disable it to continue.',
              [{text: 'OK', onPress: exitApp}],
              {cancelable: false},
            );
          }
        } else {
          setIsSecure(true);
        }
      } catch (error) {
        console.warn('Security check failed:', error);
        setIsSecure(true); // ✅ Fail-safe for consumer apps
      } finally {
        setIsChecking(false); // 🔑 Always release loader
      }
    };

    // 🔄 BACKGROUND VERSION CHECK (NON-BLOCKING)
    const runVersionCheck = async () => {
      try {
        const net = await NetInfo.fetch();
        // if (!net.isConnected || __DEV__) return;

        const latestVersion = await VersionCheck.getLatestVersion({
          provider: 'playStore',
          packageName: 'com.inqube.greenqube',
          ignoreErrors: true,
        });

        const currentVersion = VersionCheck.getCurrentVersion();

        // if (latestVersion && latestVersion !== currentVersion) {
        //   Alert.alert(
        //     'Update Available',
        //     'A new version is available. Please update to continue.',
        //     [
        //       {
        //         text: 'Update Now',
        //         onPress: () => Linking.openURL(PLAY_STORE_URL),
        //       },
        //       // {text: 'Later', style: 'cancel'},
        //     ],
        //   );
        // }
      } catch (err) {
        console.warn('Version check skipped:', err);
      }
    };

    // 🚀 Run once on app start
    useEffect(() => {
      runSecurityCheck();
    }, []);

    // 🔁 Run again when app comes to foreground
    useEffect(() => {
      const subscription = AppState.addEventListener('change', nextState => {
        if (
          appStateRef.current.match(/inactive|background/) &&
          nextState === 'active'
        ) {
          alertShownRef.current = false;
          runSecurityCheck();
          runVersionCheck();
        }
        appStateRef.current = nextState;
      });

      return () => subscription.remove();
    }, []);

    // ⏳ Version check after app loads
    useEffect(() => {
      let timer;

      if (!isChecking && isSecure) {
        timer = setTimeout(() => {
          runVersionCheck();
        }, 1200);
      }

      // ✅ Cleanup
      return () => {
        if (timer) {
          clearTimeout(timer);
        }
      };
    }, [isChecking, isSecure]);

    // 🌀 Loading UI (VERY SHORT)
    if (isChecking) {
      return (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Text>Checking security...</Text>
        </View>
      );
    }

    // 🚫 Block unsafe devices
    if (!isSecure) {
      return null;
    }

    // ✅ Render app
    return <WrappedComponent {...props} />;
  };
};

export default withSecurityCheck;
