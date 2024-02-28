import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { removeItem } from '../config/getDataFromStorage'
export const Logout = async () => {
    await Promise.all([
        removeItem("logoImageData"),
        removeItem('loginUser_data'),
        removeItem("profileImgData"),
        removeItem("userNameData"),
        removeItem("userType"),
        removeItem("bottomBannerData"),
        removeItem("topBannerData"),
        removeItem('currency'),
    ]);
    const popAction = StackActions.pop(1);
    navigation.dispatch(popAction);
    navigation.navigate('Login');
}

