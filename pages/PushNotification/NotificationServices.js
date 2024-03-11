import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { Alert } from 'react-native';
import { getItem, setItem } from '../../config/getDataFromStorage';
import { Platform } from 'react-native';
import ForegroundHandler from './ForegroundHandler';
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
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('A new FCM message arrived!', remoteMessage);
      <ForegroundHandler />
    });
    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log(
        'Notification caused app to open from background state:',
        remoteMessage.notification,
      );
      const { type, response } = remoteMessage.data;
      const responseCommentJson = JSON.parse(response);
      if (type == 'comment') {
        if (userType == 3) {
          navigation.navigate("ProblemView", { comment_qid: responseCommentJson.comment_qid, type: type });
        } else if (userType == 2) {
          navigation.navigate("FarmerViewProblem", { comment_qid: responseCommentJson.comment_qid, type: type });
        }
      } else if (type == 'answer') {
        if (userType == 3) {
          navigation.navigate("ProblemView", { comment_qid: responseCommentJson.question_id, type: type });
        } else if (userType == 2) {
          navigation.navigate("FarmerViewProblem", { comment_qid: responseCommentJson.question_id, type: type });
        }
      } else if (type == 'problem') {
        if (userType == 3) {
          navigation.navigate("ProblemList");
        } else if (userType == 2) {
          navigation.navigate("FarmerListProblem");
        }
      } else if (type == 'procure_fulfillment output-list') {
        if (userType == 3) {
          navigation.navigate("OutPutList", { io_oid: responseCommentJson.io_oid });
        } else if (userType == 2) {
          navigation.navigate("FarmerOutPutList", { io_oid: responseCommentJson.io_oid });
        }
      } else if (type == 'supply_fulfillment') {
        if (userType == 3) {
          navigation.navigate("PastEnquiry", { io_oid: responseCommentJson.io_oid });
        } else if (userType == 2) {
          navigation.navigate("FarmerPastEnquiry", { io_oid: responseCommentJson.io_oid });
        }
      } else if (type == "general_info") {
        if (responseCommentJson.post_type == 3) {
          navigation.navigate("UsefulInformationList");
        } else {
          navigation.navigate("FarmerUsefulInformationList", { io_oid: responseCommentJson.io_oid });
        }
      } else if (type == "traing") {
        if (responseCommentJson.post_type == 3) {
          navigation.navigate("TraingList");
        } else {
          navigation.navigate("FarmerTrainingList", { io_oid: responseCommentJson.io_oid });
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
              setTimeout(() => {
                navigation.navigate("ProblemView", { comment_qid: responseCommentJson.question_id, type: type });
              }, 1200);
            } else if (userType == 2) {
              setTimeout(() => {
                navigation.navigate("FarmerViewProblem", { comment_qid: responseCommentJson.question_id, type: type });
              }, 1200);
            }
          } else if (type == 'answer') {

          } else if (type == 'problem') {
            if (userType == 3) {
              setTimeout(() => {
                navigation.navigate("ProblemList");
              }, 1200);
            } else if (userType == 2) {
              setTimeout(() => {
                navigation.navigate("FarmerListProblem");
              }, 1200);
            }
          } else if (type == 'procure_fulfillment output-list') {
            if (userType == 3) {
              setTimeout(() => {
                navigation.navigate("OutPutList", { io_oid: responseCommentJson.io_oid });
              }, 1200);
            } else if (userType == 2) {
              setTimeout(() => {
                navigation.navigate("FarmerOutPutList", { io_oid: responseCommentJson.io_oid });
              }, 1200);
            }
          } else if (type == 'supply_fulfillment') {
            if (userType == 3) {
              setTimeout(() => {
                navigation.navigate("PastEnquiry", { io_oid: responseCommentJson.io_oid });
              }, 1200);
            } else if (userType == 2) {
              setTimeout(() => {
                navigation.navigate("FarmerPastEnquiry", { io_oid: responseCommentJson.io_oid });
              }, 1200);
            }
          } else if (responseCommentJson.post_type == "general_info") {
            if (userType == 3) {
              setTimeout(() => {
                navigation.navigate("UsefulInformationList");
              }, 1200);
            } else if (userType == 2) {
              setTimeout(() => {
                navigation.navigate("FarmerUsefulInformationList");
              }, 1200);
            }
          } else if (responseCommentJson.post_type == "training") {
            if (userType == 3) {
              setTimeout(() => {
                navigation.navigate("TraingList");
              }, 1200);
            } else if (userType == 2) {
              setTimeout(() => {
                navigation.navigate("FarmerTrainingList");
              }, 1200);
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
