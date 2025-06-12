import { StyleSheet, Text, View, Image } from 'react-native'
import React, { useEffect } from 'react'

const SplashScreen = ({ navigation }) => {
    useEffect(() => {
        const splashTimer = setTimeout(() => {
            navigation.replace('Login'); // Replace 'MainScreen' with your main screen name
        }, 3000); // 3 seconds

        return () => clearTimeout(splashTimer); // Cleanup the timer on unmount
    }, [navigation]);
    return (
        <>
            <View style={styles.container}>
                <Image source={require('./pages/Common/images/logo.png')} style={styles.logo} />
                <Text>Green Qube</Text>
            </View>
        </>
    )
}

export default SplashScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        width: 100,
        height: 100,
        marginBottom: 10,
    },
});

