import messaging from '@react-native-firebase/messaging';
import { Linking, Text } from 'react-native';
const NAVIGATION_IDS = ['login', 'signup', 'messages'];

function buildDeepLinkFromNotificationData(data) {
    console.log("on click data", data)
    // const navigationId = data?.navigationId;
    const navigationId = "signup";
    if (!NAVIGATION_IDS.includes(navigationId)) {
        console.warn('Unverified navigationId', navigationId)
        return null;
    }
    if (navigationId === 'signup') {
        return 'greenzown://signup';
    }

    // if (navigationId === 'messages') {

    //     return `myapp://messages/${data.data}`;
    // }

    // const chatId = data?.chatId;
    // if (navigationId === 'login') {
    //     return `myapp://login/${chatId}`
    // }
    // console.warn('Missing postId')
    // return null
}
const config = {
    screens: {
        Home: {
            path: "home/:id",
            parse: {
                id: (id) => `${id}`,
            },
        },
        Profile: {
            path: "profile/:id",
            parse: {
                id: (id) => `${id}`,
            },
        },
        Notifications: "notifications",
        Settings: "settings",
    },
};

const linking = {
    prefixes: ["greenzown://"],
    config,
    screens: {
        login: 'login/:id',
        signup: 'signup',
        messages: 'messages/:data'
    },
    async getInitialURL() {
        const url = await Linking.getInitialURL();
        console.log("urllllll")
        console.log(url)
        if (typeof url === 'string') {
            return url;
        }
        //getInitialNotification: When the application is opened from a quit state.
        const message = await messaging().getInitialNotification();
        const deeplinkURL = buildDeepLinkFromNotificationData(message?.data);
        if (typeof deeplinkURL === 'string') {
            return deeplinkURL;
        }
    },
    subscribe(listener) {
        const onReceiveURL = ({ url }) => listener(url);

        // Listen to incoming links from deep linking
        const linkingSubscription = Linking.addEventListener('url', onReceiveURL);
        //onNotificationOpenedApp: When the application is running, but in the background.
        const unsubscribe = messaging().onNotificationOpenedApp(remoteMessage => {
            alert("aaaa")
            console.log("unsubscribe")
            const url = buildDeepLinkFromNotificationData(remoteMessage.data)
            if (typeof url === 'string') {
                listener(url)
            }
        });

        return () => {
            linkingSubscription.remove();
            unsubscribe();
        };
    },
};

export default linking;
