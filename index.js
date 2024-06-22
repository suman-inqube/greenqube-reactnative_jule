import crashlytics from "@react-native-firebase/crashlytics";
import { AppRegistry, Alert } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import messaging from '@react-native-firebase/messaging';
messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('Message handled in the background!', remoteMessage);
});
// messaging().getInitialNotification(async remoteMessage => {    console.log('Message handled in the Kill s/tate!', remoteMessage); });
import { Root as PopupRootProvider } from 'react-native-popup-confirm-toast';
import 'react-native-gesture-handler';
crashlytics().setCrashlyticsCollectionEnabled(true);
import MyErrorBoundary from "./pages/Common/MyErrorBoundary";
import { useEffect } from "react";
import { CrashlyticsRecordError } from "./pages/Crashlytics/CrashlyticsRecordError";
import { firebase } from "@react-native-firebase/crashlytics";
import { setJSExceptionHandler, setNativeExceptionHandler, getJSExceptionHandler } from 'react-native-exception-handler';
import { checkAppVersion } from "./pages/checkAppVersion";
if (!firebase.apps.length) firebase.initializeApp();
export default function Main() {
    const crash = async (e) => {
        await Promise.all([
            crashlytics().setUserId('Aa0Bb1Cc2Dd3Ee4Ff5Gg6Hh7Iizdfdsfdsf8Jj9'),
            crashlytics().setAttribute('credits', String(65)),
            crashlytics().setAttribute('error', String(e)),
        ]);
        CrashlyticsRecordError(e);
        crashlytics().crash();
    }
    const jsExceptionhandler = (e, isFatal) => {
        CrashlyticsRecordError(e);
        Alert.alert('', `Something went wrong`, [{ text: 'Close', onPress: () => { crash(e) } }]);
    };
    const currentHandler = getJSExceptionHandler();
    setJSExceptionHandler(jsExceptionhandler, true);
    useEffect(() => {
        checkAppVersion();
        crashlytics().log('App mounted.');
    }, []);
    return (
        <MyErrorBoundary>
            <PopupRootProvider>
                <App />
            </PopupRootProvider>
        </MyErrorBoundary>
    );
}
AppRegistry.registerComponent(appName, () => Main);

