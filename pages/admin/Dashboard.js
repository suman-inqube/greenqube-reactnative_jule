import React, { useEffect, useState } from 'react';
import { PermissionsAndroid, AppState, View, Text, StyleSheet, StatusBar, ScrollView, BackHandler, Alert } from 'react-native';
import ImageForm from '../Common/ImageForm';
import { getItem, removeItem } from '../../config/getDataFromStorage';
import { BoxDisplay } from './dashboardComp';
import ImagePlaceHolderCircleWithoutAddButton from '../Common/ImagePlaceHolderCircleWithoutAddButton';
import CustomHeader from './CustomHeader';
import { useRoute, useFocusEffect, useNavigation, useIsFocused } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import i18next from '../services/i18next';
import { Root, Popup, Toast } from 'react-native-popup-confirm-toast';
import { Permission, PERMISSIONS_TYPE } from '../AppPermission/AppPermission';
import BackGroundLocation from '../BackgroundService/BackGroundLocation';
import ForegroundLocationService from '../BackgroundService/ForegroundLocationService';
import FusedLocation from 'react-native-fused-location';
import NotificationServices from '../PushNotification/NotificationServices';
import messaging from '@react-native-firebase/messaging';
import ForegroundHandler from '../PushNotification/ForegroundHandler';
import { useSelector } from 'react-redux';
import DeviceInfo from '../DeviceInfo'
import { useNetInfo, NetInfoState } from "@react-native-community/netinfo";
const Dashboard = ({ navigation }) => {
  const { netConnection } = DeviceInfo();
  const locationData = useSelector(state => state.locationData);
  // const { fusedLocationData } = ForegroundLocationService();
  const { requestUserPermission, notificationListener } = NotificationServices();
  const { t } = useTranslation();
  const isFocused = useIsFocused();
  const [bottomBanner, setbottomBanner] = useState();
  const [userName, setuserName] = useState();
  const [profileImg, setprofileImg] = useState();
  const navigateToPages = (pageName) => {
    navigation.navigate(pageName, { data: 'remove' });
  };
  const onPageLoad = async () => {
    const [bottomBannerData,
      userNameData,
      profileImgData, loginUser_data] = await Promise.all([
        getItem('bottomBannerData'),
        getItem('userNameData'),
        getItem('profileImgData'),
        getItem('loginUser_data'),
        // getCurrentLatLong(),
        Permission.requestMultiple([PERMISSIONS_TYPE.microphone, PERMISSIONS_TYPE.fineLocation, PERMISSIONS_TYPE.notifications])
      ]);
    i18next.changeLanguage(`${loginUser_data.lan_id}`);
    setbottomBanner(bottomBannerData);
    setuserName(userNameData);
    setprofileImg(profileImgData);
  };
  const HandlerGoBack = () => {
    exit();
  }
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (appState) => {
      if (appState !== 'active') {
        console.log("deactive")
      } else {
        console.log("active")
      }

      // Run custom logic

      subscription.remove();
    });
  }, [])
  useEffect(() => {
    // PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
    requestUserPermission();
    notificationListener();
    if (isFocused) {
      // const microphonePermission = async () => { await Permission.checkPermission(PERMISSIONS_TYPE.fineLocation) }
      // console.log(microphonePermission);
      onPageLoad();
      const onBackPress = () => {
        exit();
        return true;
      };
      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }
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
  return (
    <>
      <BackGroundLocation />
      <ForegroundLocationService />
      <ForegroundHandler />
      <View style={{ flex: 1, backgroundColor: '#f9f9f9' }}>
        <CustomHeader path="exit" HandlerGoBack={HandlerGoBack} />
        <View name="name">
          <View style={styles.containerimg}>
            {profileImg ?
              <ImagePlaceHolderCircleWithoutAddButton imageurl={{ uri: profileImg }} />
              : <ImagePlaceHolderCircleWithoutAddButton imageurl={require('../Common/images/avatar.png')} />
            }
          </View>
          <Text style={styles.userTitle}>{t('farmerdashboard_welcome_text')} {userName}</Text>
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View >
            <View style={styles.container}>
              <BoxDisplay text={t('register_nfarmer')} imageurl={require('../Common/images/register_farmer.png')} onpress={() => navigation.navigate('PersonalInformation', { data: "remove" })} />
              <BoxDisplay text={t('farmer_list')} imageurl={require('../Common/images/farmer_list.png')} onpress={() => navigation.navigate('userList')} />
            </View>
            <View style={styles.container}>
              <BoxDisplay text={t('crop_prob_far_dash')} imageurl={require('../Common/images/raise_problem_only.png')} onpress={() => navigation.navigate('ProblemList')} />
              <BoxDisplay text={t('acti_report_far_dash')} imageurl={require('../Common/images/activity_report_only.png')} onpress={() => navigateToPages('activityList')} />
            </View>
            <View style={styles.container}>
              <BoxDisplay text={t('agri_inputs_ninquiry_far_dash')} imageurl={require('../Common/images/input_inqu_only.png')} onpress={() => navigateToPages('InputList')} />
              <BoxDisplay text={t('agri_output_far_dash')} imageurl={require('../Common/images/dash_sale_your_product.png')} onpress={() => navigateToPages('OutPutList')} />
            </View>
            <View style={styles.container}>
              <BoxDisplay text={t('market_information')} imageurl={require('../Common/images/market_information_only.png')} />
              <BoxDisplay text={t('useful_ninformation_dash')} imageurl={require('../Common/images/dash_useful_information.png')} onpress={() => navigateToPages('UsefulInformationList')} />
            </View>
            <View style={{ marginTop: 16, elevation: 5 }}>
              {bottomBanner ?
                <ImageForm
                  source={{ uri: bottomBanner }}
                  resizeMode="cover"
                  height={200}
                  width={'100%'}
                />
                : <ImageForm
                  source={require('../Common/images/ad_banner_space.jpg')}
                  resizeMode="cover"
                  height={200}
                  width={'100%'}
                />}
            </View>
          </View>
        </ScrollView>
      </View>
      {/* <Root></Root> */}
    </>
  )
}

export default Dashboard

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 5,
  },
  bottomContainer: {
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
    fontSize: 16,
    textAlign: 'right',
    // marginTop: 15,
    color: "#000",
    zIndex: 1000,
    fontFamily: 'Poppins-SemiBold',
    marginRight: 20,
    marginTop: 8,
  }
})
