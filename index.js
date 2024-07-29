/**
 * @format
 */

import { AppRegistry, Alert, Linking } from 'react-native';
// import * as Sentry from "@sentry/react-native";
import App from './App';
import { name as appName } from './app.json';
import messaging from '@react-native-firebase/messaging';
import { useEffect, useContext } from 'react';
messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('Message handled in the background!', remoteMessage);
});
// messaging().getInitialNotification(async remoteMessage => {
//     console.log('Message handled in the Kill s/tate!', remoteMessage);
// });
import { Root as PopupRootProvider } from 'react-native-popup-confirm-toast';
import 'react-native-gesture-handler';
import crashlytics from '@react-native-firebase/crashlytics';
crashlytics().setCrashlyticsCollectionEnabled(true);
import { UserCreateContextProvider, userCreateContext } from './pages/Context/usersCreateContext';
import VersionCheck from 'react-native-version-check';
import { setJSExceptionHandler, setNativeExceptionHandler } from "react-native-exception-handler";
export default function Main() {
    const onSignIn = async (error) => {
        const { dbLanTokUsr } = useContext(userCreateContext);
        crashlytics().log('User signed in.');
        await Promise.all([
            crashlytics().setUserId('Aa0Bb1Cc2Dd3Ee4Ff5Gg6Hh7Iizdfdsfdsf8Jj9'),
            crashlytics().setAttribute('credits', String(dbLanTokUsr)),
            crashlytics().setAttribute('error', String(error)),

        ]);
        crashlytics().recordError(error, 'js_exception');
        crashlytics().crash();
    }
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
    const exceptionHandler = (error, isFatal) => {
        crashlytics().recordError(error, 'js_exception');
        if (isFatal) {
            Alert.alert(
                'something went wrong please try again',
                ``,
                [{ text: 'OK', onPress: () => { onSignIn() }, },]
            );
        } else {
            // Handle non-fatal errors
            console.log(error); // Or log the error to your logging service
        }
    };
    setJSExceptionHandler(exceptionHandler, true);
    return (
        <UserCreateContextProvider>
            <PopupRootProvider>
                <App />
            </PopupRootProvider>
        </UserCreateContextProvider>
    );
}

AppRegistry.registerComponent(appName, () => Main);

