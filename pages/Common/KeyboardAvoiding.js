import React from 'react'
import { ImageBackground, StyleSheet, KeyboardAvoidingView, View } from 'react-native'
const KeyboardAvoiding = (props) => {
    return (
        <KeyboardAvoidingView style={styles.container} behavior="padding">
            {props.children}
        </KeyboardAvoidingView>
    )
}

export default KeyboardAvoiding

const styles = StyleSheet.create({
    background: {
        // backgroundColor: theme.colors.surface,
        width: '100%',
        height: '100%',
        flex: 1
    },
    container: {
        flex: 1,
        padding: 20,
        width: '100%',
        // maxWidth: 400,
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
    },
})
