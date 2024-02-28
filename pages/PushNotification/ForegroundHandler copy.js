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
                PushNotification.configure({
                    onNotification: function (notification) {
                        navigation.navigate("ProblemList");
                        if (notification.userInteraction) {
                            const { type, response } = notification.data;
                            const responseCommentJson = JSON.parse(response)
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
                            }
                        }
                    },
                });
                PushNotification.onNotification((notification) => {
                    if (notification.userInteraction && notification.background) {
                        // User tapped on the notification while the app was in the background
                        // You can handle navigation or any action here
                        // For example, navigate to a specific screen
                        // navigation.navigate('TargetScreen');
                        console.log('Notification tapped in the background:', notification);
                    }
                });
            }
        })
        return unsubscribe
    }, [])
    return null
}

export default ForegroundHandler