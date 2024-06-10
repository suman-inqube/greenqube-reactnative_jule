import React, { useEffect } from 'react';
import { TouchableOpacity, Image, Text, View, StyleSheet, StatusBar, BackHandler, Alert } from 'react-native';
import ImageForm from '../Common/ImageForm';
import { useRoute, useFocusEffect, useNavigation, useIsFocused, useNavigationState } from '@react-navigation/native';
const CustomHeader = ({ path, HandlerGoBack, banner, logoImage, topBanner }) => {
    const navigation = useNavigation();
    const openDrawer = () => {
        navigation.openDrawer();
    }
    useEffect(() => {
        navigation.closeDrawer();
    }, []);
    return (
        <View style={styles.mainContainer}>
            <StatusBar barStyle="light-content" backgroundColor={"#003c04"} />
            <View style={Platform.OS === 'android' ? styles.androidContainer : styles.iosContainer}>
                <View style={styles.rightContainer}>
                    <TouchableOpacity onPress={() => HandlerGoBack()}>
                        <Image source={require('../Common/images/back.png')}
                            resizeMode='contain'
                            style={{ width: 30, height: 30 }} />
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
                                resizeMode="contain"
                                height={60}
                                width={70}
                            />
                            : ''}
                        <Image source={require('../Common/images/3dot.png')} />
                    </View>
                </TouchableOpacity>
            </View>
            <View>
                {banner !== true && topBanner &&
                    <ImageForm
                        source={{ uri: topBanner }}
                        resizeMode="cover"
                        height={200}
                        width={'100%'}
                    />
                }
            </View>
        </View>
    );
};

export default CustomHeader;
const styles = StyleSheet.create({
    mainContainer: {
        // borderBottomWidth: 2,
        // marginTop:StatusBar.currentHeight,
        backgroundColor: '#FFF'
    },
    androidContainer: {
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'row',
        paddingVertical: 3
    },
    iosContainer: {
        marginTop: 30,
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'row',
        paddingVertical: 3
    },
    rightContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 15,
        justifyContent: 'center'
    },
    image: {
        width: 200,
        height: 200
    }

})
