import { StyleSheet, Text, View, Alert, BackHandler } from 'react-native'
import React from 'react'

const CustomAlert = (title, description, exitApp,OKText,CancelText) => {
    Alert.alert(
        `${title}`,
        `${description}`,
        [ 
            CancelText&&{
                text: 'Cancel',
                onPress: () => {
                    // exitApp && BackHandler.exitApp();
                },
            },
            OKText&&{
                text: 'OK',
                onPress: () => {
                    // exitApp && BackHandler.exitApp();
                },
            },
           
        ],
        { cancelable: false }
    );
}

export default CustomAlert
