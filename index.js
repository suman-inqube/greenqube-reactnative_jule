/**
 * @format
 */

import { AppRegistry, Alert, Linking } from 'react-native';
// import * as Sentry from "@sentry/react-native";
import App from './App';
import { name as appName } from './app.json';
import messaging from '@react-native-firebase/messaging';
import { useEffect, useContext } from 'react';
import 'react-native-get-random-values';
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
import { setJSExceptionHandler, setNativeExceptionHandler } from "react-native-exception-handler";
import { checkAppVersion } from './pages/checkAppVersion';
import { firebase } from '@react-native-firebase/analytics';
import firebaseApp from "@react-native-firebase/app";
import { mode } from '@env';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { use } from 'i18next';
import MyErrorBoundary from './pages/Common/MyErrorBoundary';
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
    const setAnalyticsEnabled = async () => {
        await firebase.analytics().setAnalyticsCollectionEnabled(true);
    }
    useEffect(() => {
        checkAppVersion();
        setAnalyticsEnabled()
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
    const jsExceptionHandler = (error, isFatal) => {
        if (isFatal) {
            Alert.alert(
                'Unexpected error occurred fff',
                `
              Error: ${(isFatal) ? 'Fatal:' : ''} ${error.name} ${error.message}
              We will need to restart the app.
            `,
                [{
                    text: "Close",
                    onPress: () => CrashlyticsRecordError(error.message)
                }]
            );
        } else {
            console.log(error);
        }
    };
    // setJSExceptionHandler(exceptionHandler, true);
    setJSExceptionHandler(jsExceptionHandler, true);
    setNativeExceptionHandler((errorString) => {
        console.error('[Native Exception]', errorString);
        // Optionally show alert here – be careful, may crash the app UI
    });
    return (
        <MyErrorBoundary>
            <UserCreateContextProvider>
                <PopupRootProvider>
                    <App />
                </PopupRootProvider>
            </UserCreateContextProvider>
        </MyErrorBoundary>
    );
}

AppRegistry.registerComponent(appName, () => Main);

