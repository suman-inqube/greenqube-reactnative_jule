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
export default function Main() {

    // Your Firebase config object
    // const firebaseConfig = {
    //     apiKey: "YOUR_API_KEY",
    //     authDomain: "YOUR_AUTH_DOMAIN",
    //     projectId: "YOUR_PROJECT_ID",
    //     appId: "YOUR_APP_ID",
    // };

    // Initialize Firebase
    // if (!firebase.apps.length) {
    //     firebase.initializeApp(firebaseConfig);
    // }

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
        checkAppVersion()
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

