import { StyleSheet, Text, View, BackHandler } from 'react-native';
import React, { useEffect } from 'react';
import { WebView } from 'react-native-webview';
import { useNavigation } from '@react-navigation/native';
const Business = () => {
    const navigation = useNavigation();
    useEffect(() => {
        const onBackPress = () => {
            navigation.navigate('Dashboard');
            return true // disable normal behaviour
        };
        BackHandler.addEventListener('hardwareBackPress', onBackPress); // detect back button press
        return () =>
            BackHandler.removeEventListener('hardwareBackPress');

    }, []);
    return (
        <>
            <WebView source={{ uri: 'https://mygreenqube.com/micro_admin/' }} />
        </>
    )
}
export default Business;
const styles = StyleSheet.create({})