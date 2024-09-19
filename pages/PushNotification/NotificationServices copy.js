import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { Alert } from 'react-native';
import { getItem, setItem } from '../../config/getDataFromStorage';
import notifee, { AndroidImportance } from '@notifee/react-native';
import { Platform } from 'react-native';
const notificationServices = () => {
  const navigation = useNavigation();
  const requestUserPermission = async () => {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    if (enabled) {
      console.log('Authorization status:', authStatus);
      getFcmToken()
    }
  }
  const getFcmToken = async () => {
    let checkToken = await getItem('fcmToken')
    console.log("the old token", checkToken)
    if (!checkToken) {
      try {
        const fcmToken = await messaging().getToken()
        if (!!fcmToken) {
          console.log("fcme token generated", fcmToken)
          await setItem('fcmToken', fcmToken)
          console.log(checkToken);
        }
      } catch (error) {
        console.log("error in fcmToken", error)
        // alert(error?.message)
      }
    }
  }
  const onDisplayNotification = async (data) => {
    console.log(data);
    console.log("data");
    // Request permissions (required for iOS)

    if (Platform.OS == 'ios') {
      await notifee.requestPermission()
    }

    // Create a channel (required for Android)
    const channelId = await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
      importance: AndroidImportance.HIGH,
    });

    // Display a notification
    await notifee.displayNotification({
      title:
        '<p style="color: #4caf50;"><b>Styled HTMLTitle</span></p></b></p> &#128576;',
      subtitle: '&#129395;',
      body: 'The <p style="text-decoration: line-through">body can</p> also be <p style="color: #ffffff; background-color: #9c27b0"><i>styled too</i></p> &#127881;!',
      android: {
        channelId,
        color: '#4caf50',
        actions: [
          {
            title: '<b>Dance</b> &#128111;',
            pressAction: { id: 'dance' },
          },
          {
            title: '<p style="color: #f44336;"><b>Cry</b> &#128557;</p>',
            pressAction: { id: 'cry' },
          },
        ],
      },
    });

  }
  const notificationListener = async () => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('A new FCM message arrived!', remoteMessage);
      onDisplayNotification(remoteMessage)
    });
    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log(
        'Notification caused app to open from background state:',
        remoteMessage.notification,
      );
      onDisplayNotification(remoteMessage)
      // navigation.navigate("FarmerTrainingList");
      // alert("aaa")
      console.log("backgrund state", remoteMessage)
    });
    // Check whether an initial notification is available
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log(
            'Notification caused app to open from quit state:',
            remoteMessage.notification,
          );
          // onDisplayNotification(remoteMessage)
          console.log("remote message", remoteMessage.notification)
        }
      })
    // return unsubscribe;
  }
  return {
    requestUserPermission,
    notificationListener,
    getFcmToken
  };
}

export default notificationServices
