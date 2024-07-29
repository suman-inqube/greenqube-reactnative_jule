import PushNotificationIOS from '@react-native-community/push-notification-ios';
import React, { useEffect } from 'react';
import messaging from '@react-native-firebase/messaging';
import { Platform, Alert } from 'react-native';
import PushNotification from "react-native-push-notification";
import { useNavigation } from '@react-navigation/native';
import { getItem } from '../../config/getDataFromStorage';
const ForegroundHandler = () => {
    const navigation = useNavigation();
    const setupPushNotification = (handleNotification) => {
        PushNotification.configure({
            onNotification: function (notification) {
                handleNotification(notification)
            },
            popInitialNotification: true,
            requestPermissions: true,
        })
        return PushNotification
    }
    useEffect(() => {
        const unsubscribe = messaging().onMessage(async (remoteMessage) => {
            console.log("handle in foreground", remoteMessage)
            const userType = await getItem('userType');
            const { notification, messageId } = remoteMessage
            if (Platform.OS == 'ios') {
                PushNotificationIOS.addNotificationRequest({
                    id: messageId,
                    body: notification.body,
                    title: notification.title,
                    sound: 'default'
                });
            } else {
                // PushNotification.localNotification({
                //     channelId: "your-channel-id",
                //     id: messageId,
                //     body: 'android body',
                //     title: 'android notif title',
                //     soundName: 'default',
                //     vibrate: true,
                //     playSound: true
                // })
                PushNotification.configure({
                    onNotification: function (notification) {
                        if (notification.userInteraction) {
                            const { type, response } = notification.data;
                            const responseCommentJson = JSON.parse(response);
                            if (type == 'comment') {
                                if (userType == 3) {
                                    navigation.navigate("ProblemView", { comment_qid: responseCommentJson.comment_qid, type: type });
                                } else {
                                    navigation.navigate("FarmerViewProblem", { comment_qid: responseCommentJson.comment_qid, type: type });
                                }
                            } else if (type == 'answer') {
                                if (userType == 3) {
                                    navigation.navigate("ProblemView", { comment_qid: responseCommentJson.question_id, type: type });
                                } else {
                                    navigation.navigate("FarmerViewProblem", { comment_qid: responseCommentJson.question_id, type: type });
                                }
                            } else if (type == 'problem') {
                                if (userType == 3) {
                                    navigation.navigate("ProblemList");
                                } else {
                                    navigation.navigate("FarmerListProblem");
                                }
                            } else if (type == 'procure_fulfillment') {
                                if (userType == 3) {
                                    navigation.navigate("OutPutList", { io_oid: responseCommentJson.io_oid });
                                } else {
                                    setTimeout(() => {
                                        navigation.navigate("FarmerOutPutList", { io_oid: responseCommentJson.io_oid });
                                    }, 1500);
                                }
                            } else if (type == 'supply_fulfillment') {
                                if (userType == 3) {
                                    navigation.navigate("PastEnquiry", { io_oid: responseCommentJson.io_oid });
                                } else {
                                    navigation.navigate("FarmerPastEnquiry", { io_oid: responseCommentJson.io_oid });
                                }
                            } else if (responseCommentJson.post_type == "general_info") {
                                if (userType == 3) {
                                    navigation.navigate("UsefulInformationList");
                                } else {
                                    navigation.navigate("FarmerUsefulInformationList", { io_oid: responseCommentJson.io_oid });
                                }
                            } else if (responseCommentJson.post_type == "training") {
                                if (userType == 3) {
                                    navigation.navigate("TraingList");
                                } else {
                                    navigation.navigate("FarmerTrainingList", { io_oid: responseCommentJson.io_oid });
                                }
                            }

                        }
                    },
                });
                // PushNotification.onNotification((notification) => {
                //     if (notification.userInteraction && notification.background) {
                //         // User tapped on the notification while the app was in the background
                //         // You can handle navigation or any action here
                //         // For example, navigate to a specific screen
                //         // navigation.navigate('TargetScreen');
                //         console.log('Notification tapped in the background:', notification);
                //     }
                // });
            }
        })
        return unsubscribe
    }, [])
    return null
}

export default ForegroundHandler