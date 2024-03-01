/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import messaging from '@react-native-firebase/messaging';
messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('Message handled in the background!', remoteMessage);
});
messaging().getInitialNotification(async remoteMessage => {
    console.log('Message handled in the Kill state!', remoteMessage);
});
import { Root as PopupRootProvider } from 'react-native-popup-confirm-toast';
import BackgroundERNlocation from './pages/BackgroundService/BackgroundERNlocation';
import 'react-native-gesture-handler';
// import crashlytics from '@react-native-firebase/crashlytics';
// crashlytics().setCrashlyticsCollectionEnabled(true);
export default function Main() {
    return (
        <PopupRootProvider>
            <App />
        </PopupRootProvider>
    );
}

AppRegistry.registerComponent(appName, () => Main);

