/**
 * @format
 */

import { AppRegistry, Alert, Linking } from 'react-native';
// import * as Sentry from "@sentry/react-native";
import App from './App';
import { name as appName } from './app.json';
import messaging from '@react-native-firebase/messaging';
import { useEffect } from 'react';
messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('Message handled in the background!', remoteMessage);
});
// messaging().getInitialNotification(async remoteMessage => {
//     console.log('Message handled in the Kill s/tate!', remoteMessage);
// });
import { Root as PopupRootProvider } from 'react-native-popup-confirm-toast';
import 'react-native-gesture-handler';
// import crashlytics from '@react-native-firebase/crashlytics';
// crashlytics().setCrashlyticsCollectionEnabled(true);
import { UserCreateContextProvider } from './pages/Context/usersCreateContext';
import {
    setJSExceptionHandler,
    setNativeExceptionHandler,
} from 'react-native-exception-handler';
import VersionCheck from 'react-native-version-check';
export default function Main() {
    setJSExceptionHandler((error, isFatal) => {
        // This is your custom global error handler
        // You do stuff like show an error dialog
        // or hit google analytics to track crashes
        // or hit a custom api to inform the dev team.
    });
    useEffect(() => {
        const checkAppVersion = async () => {
            try {
                const latestVersion = await VersionCheck.getLatestVersion({ provider: 'playStore', packageName: 'com.inqube.greenqube', ignoreErrors: true });
                const currentVersion = VersionCheck.getCurrentVersion();
                if (latestVersion > currentVersion) {
                    Alert.alert(
                        'Update Required', 'A new version of the app is available. Please update to continue using the app.',
                        [{ text: 'Update Now', onPress: () => { Linking.openURL('https://play.google.com/store/apps/details?id=com.inqube.greenqube') } }],
                        { cancelable: false },
                    );
                }
            } catch (error) {
                console.error('Error checking app version:', error);
            }
        };

        checkAppVersion();
    }, []);
    return (
        <UserCreateContextProvider>
            <PopupRootProvider>
                <App />
            </PopupRootProvider>
        </UserCreateContextProvider>
    );
}

AppRegistry.registerComponent(appName, () => Main);

