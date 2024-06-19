/**
 * @format
 */
import crashlytics from "@react-native-firebase/crashlytics";
import { AppRegistry, Alert, BackHandler } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import messaging from '@react-native-firebase/messaging';
// crashlytics().recordError("error")
messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('Message handled in the background!', remoteMessage);
});
// messaging().getInitialNotification(async remoteMessage => {
//     console.log('Message handled in the Kill s/tate!', remoteMessage);
// });
import { Root as PopupRootProvider } from 'react-native-popup-confirm-toast';
import 'react-native-gesture-handler';
// import crashlytics from '@react-native-firebase/crashlytics';
crashlytics().setCrashlyticsCollectionEnabled(true);
import { View, Text, Button } from 'react-native';
import { setJSExceptionHandler, setNativeExceptionHandler } from "react-native-exception-handler";
import MyErrorBoundary from "./pages/Common/MyErrorBoundary";
export default function Main() {
    const jsExceptionHandler = (error, isFatal) => {
        console.log(error)
        if (isFatal) {
            Alert.alert(
                'Unexpected error occurred fff',
                `
              Error: ${(isFatal) ? 'Fatal:' : ''} ${error.name} ${error.message}
              We will need to restart the app.
            `,
                [{
                    text: "Close",
                    // onPress: () => BackHandler.exitApp()
                }]
            );
        } else {
            console.log(error); // So that we can see it in the ADB logs in case of Android if needed
        }
    };

    setJSExceptionHandler(jsExceptionHandler, true);
    setNativeExceptionHandler((errorString) => {
        console.error(errorString)
        //You can do something like call an api to report to dev team here
        //example
        // fetch('http://<YOUR API TO REPORT TO DEV TEAM>?error='+errorString);
        //
    });
    return (
        // <MyErrorBoundary>
        <PopupRootProvider>
            <App />
        </PopupRootProvider>
        // </MyErrorBoundary>
    );
}

AppRegistry.registerComponent(appName, () => Main);

