import { StyleSheet, Text, View,BackHandler } from 'react-native';
import React, { useEffect } from 'react';
import { WebView } from 'react-native-webview';
import { useNavigation} from '@react-navigation/native';
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
            <WebView source={{ uri: 'http://142.93.208.31/micro_admin_mobile/#/login' }} />
        </>
    )
}
export default Business;
const styles = StyleSheet.create({})