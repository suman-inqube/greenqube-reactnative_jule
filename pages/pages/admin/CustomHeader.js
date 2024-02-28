import React, { useEffect, useState } from 'react';
import { TouchableOpacity, Image, Text, View, StyleSheet, StatusBar,BackHandler  } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getItem } from '../../config/getDataFromStorage';
import ImageForm from '../Common/ImageForm';
const CustomHeader = ({ path }) => {
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
    const goBack = () => {
        // navigation.goBack()
        // if (path !== "exit") {
        //     navigation.navigate(path);
        // }else{
        //     BackHandler.exitApp();
        // }
        // console.warn(path)
    }
    useEffect(() => {
        onPageLoad();
    }, []);
    return (
        <View style={styles.mainContainer}>
            <StatusBar
                barStyle="dark-content"
                backgroundColor={"white"}
            />
            <View style={Platform.OS === 'android' ? styles.androidContainer : styles.iosContainer}>
                <View style={styles.rightContainer}>
                    <TouchableOpacity onPress={() => goBack()}>
                        <Image source={require('../Common/images/back.png')}
                            resizeMode='contain'
                            style={{ width: 35, height: 35 }} />
                    </TouchableOpacity>
                    <Image source={require('../Common/images/logo.png')}
                        style={{ width: 100, height: 50 }}
                        resizeMode='contain' />
                </View>
                <TouchableOpacity onPress={openDrawer}>
                    <View style={{ flexDirection: 'row', marginRight: 10, alignItems: 'center' }}>
                        {logoImage ?
                            <ImageForm
                                source={{ uri: logoImage }}
                                resizeMode="cover"
                                height={32}
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
        // marginTop:StatusBar.currentHeight,
        backgroundColor: '#FFF'
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
    rightContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 15,
        justifyContent: 'center'
    }

})
