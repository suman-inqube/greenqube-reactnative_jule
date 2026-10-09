import React, { useEffect, useState } from 'react';
import { TouchableOpacity, Image, Text, View, StyleSheet, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getItem } from '../../config/getDataFromStorage';
import ImageForm from '../Common/ImageForm';

const CustomHeader = () => {
    const navigation = useNavigation();
    const [logoImage, setlogoImage] = useState();
    const [topBanner, settopBanner] = useState();
    const openDrawer = () => {
        navigation.openDrawer();
    }
    const onPageLoad = async () => {
        const logoImageData = await getItem('logoImageData');
        // console.log(logoImageData);
        logoImageData ?
            setlogoImage(logoImageData)
            : ''
        const topBannerData = await getItem('topBannerData');
        settopBanner(topBannerData);


    };
    useEffect(() => {
        onPageLoad();
    }, []);
    return (
        <View style={styles.mainContainer}>

            <View style={Platform.OS === 'android' ? styles.androidContainer : styles.iosContainer}>
                <View>
                    <Text style={{ fontSize: 20, }}>
                        Dashboard</Text>
                </View>
                <TouchableOpacity onPress={openDrawer}>
                    <View style={{ flexDirection: 'row' }}>
                        {logoImage ?
                            <ImageForm
                                source={{ uri: logoImage }}
                                resizeMode="cover"
                                height={30}
                                width={100}
                            />
                            : ''}
                        <Image source={require('../Common/images/3dot.png')} />
                    </View>
                </TouchableOpacity>
            </View>

            <View>
                {topBanner ?
                    <ImageForm
                        source={{ uri: topBanner }}
                        resizeMode="cover"
                        height={200}
                        width={'100%'}
                    /> : ''}

            </View>
        </View>
    );
};

export default CustomHeader;
const styles = StyleSheet.create({
    mainContainer: {
        borderBottomWidth: 2,
    },
    androidContainer: {
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'row',
    },
    iosContainer: {
        marginTop: 30,
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'row',
    },

})
