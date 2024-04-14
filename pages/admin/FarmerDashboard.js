import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, StatusBar, Alert, BackHandler, ScrollView } from 'react-native';
import ImageForm from '../Common/ImageForm';
import { getItem, removeItem } from '../../config/getDataFromStorage';
import { BoxDisplay, BoxDisplayDeactive } from './dashboardComp';
import ImagePlaceHolderCircleWithoutAddButton from '../Common/ImagePlaceHolderCircleWithoutAddButton';
import CustomHeader from './CustomHeader';
import i18next from '../services/i18next';
import { useTranslation } from 'react-i18next';
import { Marquee } from '@animatereactnative/marquee';
import { Permission, PERMISSIONS_TYPE } from '../AppPermission/AppPermission';
// import ForegroundHandler from '../PushNotification/ForegroundHandler';
// import Geolocation from '@react-native-community/geolocation';
import { useRoute, useFocusEffect, useNavigation, useIsFocused } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import ForegroundLocationService from '../BackgroundService/ForegroundLocationService';
// import NotificationServices from '../PushNotification/NotificationServices';
import DeviceInfo from '../DeviceInfo'
import BackGroundLocation from '../BackgroundService/BackGroundLocation';
import LoadingScreen from '../Common/LoadingScreen';
const FarmerDashboard = ({ navigation }) => {
    const { netConnection } = DeviceInfo();
    // const locationData = useSelector(state => state.locationData);
    // const { requestUserPermission, notificationListener } = NotificationServices();
    const { t } = useTranslation();
    const isFocused = useIsFocused();
    const [isLoading, setIsLoading] = useState(true);
    const [bottomBanner, setbottomBanner] = useState();
    const [userListShow, setuserListShow] = useState(false);
    const [isMenuShow, setisMenuShow] = useState();
    const [userName, setuserName] = useState();
    const [profileImg, setprofileImg] = useState();
    const [latLong, setLatLong] = useState({
        latitude: "", longitude: ""
    });
    const [company_website, setcompany_website] = useState("");
    const navigateToPages = (pageName) => {
        if (netConnection) {
            if (pageName == 'Weather') {
                navigation.navigate(pageName, { latLong });
            } else {
                navigation.navigate(pageName);
            }
        } else {
            if (pageName == "FarmerListProblem" || pageName == "FarmerActivityList") {
                navigation.navigate(pageName);
            }
        }
    };
    const onPageLoad = async () => {
        const [bottomBannerData,
            userNameData,
            profileImgData, loginUser_data, company_website] = await Promise.all([
                getItem('bottomBannerData'),
                getItem('userNameData'),
                getItem('profileImgData'),
                getItem('loginUser_data'),
                getItem('company_website'),
                // GeolocationApi(),
            ]);
        // console.log(loginUser_data.lan_id)

        i18next.changeLanguage(`${loginUser_data.lan_id}`);
        setbottomBanner(bottomBannerData);
        setcompany_website(company_website);
        setuserName(userNameData);
        setprofileImg(profileImgData);

    };

    useEffect(() => {
        // requestUserPermission();
        // notificationListener();
        onPageLoad();
    }, []);
    const HandlerGoBack = () => {
        exit();
    }
    useEffect(() => {
        if (isFocused) {
            Permission.requestMultiple([PERMISSIONS_TYPE.microphone, PERMISSIONS_TYPE.fineLocation]);
            // Permission.checkPermission(PERMISSIONS_TYPE.microphone)
            const onBackPress = () => {
                exit();
                return true;
            };
            BackHandler.addEventListener('hardwareBackPress', onBackPress);
            return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
        }
        // i18next.changeLanguage("bng")
    }, [isFocused]);
    const exit = () => {
        Alert.alert(
            `${t('app_name')}`,
            `${t('close_app')}`,
            [
                { text: `${t('cancle')}`, onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                { text: `${t('ok')}`, onPress: () => BackHandler.exitApp() },
            ],
            { cancelable: false });
    }
    const CompanyWebsiteOpen = () => {
        if (company_website != "") {
            Linking.openURL(company_website)
        } else {
            Alert.alert("Company website not found")
        }
    }
    return (
        <>
            <BackGroundLocation />
            <ForegroundLocationService />
            {/* <ForegroundHandler /> */}
            <CustomHeader path="exit" HandlerGoBack={HandlerGoBack} />
            <View name="name">
                <View style={styles.containerimg}>
                    {profileImg ?
                        <ImagePlaceHolderCircleWithoutAddButton imageurl={{ uri: profileImg }} />
                        : <ImagePlaceHolderCircleWithoutAddButton imageurl={require('../Common/images/avatar.png')} />
                    }
                </View>
                <View style={{ width: '90%', alignItems: 'right', }}>
                    {/* <Marquee spacing={100} speed={1}> */}
                    <Text style={styles.userTitle}>{t('welcome')} {userName}</Text>
                    {/* </Marquee> */}
                </View>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.container}>
                    <BoxDisplay text={t('crop_prob_far_dash')} imageurl={require('../Common/images/raise_problem_only.png')} onpress={() => navigateToPages('FarmerListProblem')} />
                    <BoxDisplay text={t('acti_report_far_dash')} imageurl={require('../Common/images/activity_report_only.png')} onpress={() => navigateToPages('FarmerActivityList')} />
                </View>

                <View style={styles.container}>
                    <BoxDisplay text={t('agri_inputs_ninquiry_far_dash')} imageurl={require('../Common/images/input_inqu_only.png')} onpress={() => navigateToPages('FarmerInputList')} />
                    <BoxDisplay text={t('agri_output_far_dash')} imageurl={require('../Common/images/dash_sale_your_product.png')} onpress={() => navigateToPages('FarmerOutPutList')} />
                </View>

                <View style={styles.container}>
                    <BoxDisplay text={t('weather_nadvisory_far_dash')} imageurl={require('../Common/images/dash_weather_advisory.png')} onpress={() => navigateToPages('Weather')} />
                    <BoxDisplay text={t('useful_ninformation_far_dash')} imageurl={require('../Common/images/dash_useful_information.png')} onpress={() => navigateToPages('FarmerUsefulInformationList')} />
                </View>

                <View style={styles.container}>
                    <BoxDisplayDeactive text={t('market_ninformation_dash')} imageurl={require('../Common/images/market_information_white.png')} />
                    <BoxDisplay text={t('training_support')} imageurl={require('../Common/images/training_support_green.png')} onpress={() => navigateToPages('FarmerTrainingList')} />
                </View>
                {bottomBanner ?
                    <TouchableOpacity onPress={() => CompanyWebsiteOpen()}>
                        <ImageForm
                            source={{ uri: bottomBanner }}
                            resizeMode="cover"
                            height={320}
                            width={'100%'}
                        />
                    </TouchableOpacity>
                    : <TouchableOpacity onPress={() => CompanyWebsiteOpen()}>
                        <ImageForm
                            source={require('../Common/images/ad_banner_space.jpg')}
                            resizeMode="cover"
                            height={200}
                            width={'100%'}
                        />
                    </TouchableOpacity>}
            </ScrollView>
        </>

    )
}

export default FarmerDashboard

const styles = StyleSheet.create({
    container:
    {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: 8
    },

    bottomContainer:
    {
        flex: 1,
        marginTop: 100,
    },

    containerimg: {
        flex: 1,
        zIndex: 100,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingVertical: 10,
    },
    userTitle: {
        fontSize: 17,
        textAlign: 'right',
        // marginTop: 15,
        color: "#000",
        zIndex: 1000,
        fontFamily: 'Poppins-SemiBold',
        marginRight: 20,
        marginTop: 10,
    },
    loadingScreen: {
        position: 'absolute',
        top: '50%',
        zIndex: 999,
        left: '45%'
    },
})