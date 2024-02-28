import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { Alert } from 'react-native';
import { getItem, setItem } from '../../config/getDataFromStorage';
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
          // console.log(checkToken);
        }
      } catch (error) {
        console.log("error in fcmToken", error)
        // alert(error?.message)
      }
    }
  }
  const notificationListener = async () => {
    const userType = await getItem('userType');
    // const unsubscribe = messaging().onMessage(async remoteMessage => {
    //   console.log('A new FCM message arrived!', remoteMessage);
    // });
    messaging().onNotificationOpenedApp(remoteMessage => {
      // console.log(
      //   'Notification caused app to open from background state:',
      //   remoteMessage.notification,
      // );
      const { type, response } = remoteMessage.data;
      const responseCommentJson = JSON.parse(response);
      if (type == 'comment') {
        if (userType == 3) {
          navigation.navigate("ProblemView", { comment_qid: responseCommentJson.comment_qid });
        } else {
          navigation.navigate("FarmerViewProblem", { comment_qid: responseCommentJson.comment_qid });
        }
      } else if (type == 'problem') {
        if (userType == 3) {
          navigation.navigate("ProblemList");
        } else {
          navigation.navigate("FarmerListProblem");
        }
      } else if (type == 'procure_fulfillment output-list') {
        if (userType == 3) {
          navigation.navigate("OutPutList", { io_oid: responseCommentJson.io_oid });
        } else {
          navigation.navigate("FarmerOutPutList", { io_oid: responseCommentJson.io_oid });
        }
      } else if (type == 'supply_fulfillment') {
        if (userType == 3) {
          navigation.navigate("PastEnquiry", { io_oid: responseCommentJson.io_oid });
        } else {
          navigation.navigate("FarmerPastEnquiry", { io_oid: responseCommentJson.io_oid });
        }
      }
      // console.log("backgrund state", remoteMessage)
    });
    // Check whether an initial notification is available
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          const { type, response } = remoteMessage.data;
          const responseCommentJson = JSON.parse(response);
          if (type == 'comment') {
            if (userType == 3) {
              navigation.navigate("ProblemView", { comment_qid: responseCommentJson.comment_qid });
            } else {
              navigation.navigate("FarmerViewProblem", { comment_qid: responseCommentJson.comment_qid });
            }
          } else if (type == 'problem') {
            if (userType == 3) {
              navigation.navigate("ProblemList");
            } else {
              navigation.navigate("FarmerListProblem");
            }
          } else if (type == 'procure_fulfillment output-list') {
            if (userType == 3) {
              navigation.navigate("OutPutList", { io_oid: responseCommentJson.io_oid });
            } else {
              navigation.navigate("FarmerOutPutList", { io_oid: responseCommentJson.io_oid });
            }
          } else if (type == 'supply_fulfillment') {
            if (userType == 3) {
              navigation.navigate("PastEnquiry", { io_oid: responseCommentJson.io_oid });
            } else {
              navigation.navigate("FarmerPastEnquiry", { io_oid: responseCommentJson.io_oid });
            }
          }
          // console.log(remoteMessage.data.type)
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
