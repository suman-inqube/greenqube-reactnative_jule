import React, { useEffect, useState, useContext } from 'react';
import { Linking, TouchableOpacity, View, Text, StyleSheet, ScrollView, BackHandler, Alert } from 'react-native';
import ImageForm from '../Common/ImageForm';
import { BoxDisplay } from './dashboardComp';
import ImagePlaceHolderCircleWithoutAddButton from '../Common/ImagePlaceHolderCircleWithoutAddButton';
import { useIsFocused } from '@react-navigation/native';
import { Permission, PERMISSIONS_TYPE } from '../AppPermission/AppPermission';
import BackGroundLocation from '../BackgroundService/BackGroundLocation';
import ForegroundLocationService from '../BackgroundService/ForegroundLocationService';
import FusedLocation from 'react-native-fused-location';
// import NotificationServices from '../PushNotification/NotificationServices';
// import messaging from '@react-native-firebase/messaging';
import ForegroundHandler from '../PushNotification/ForegroundHandler';
import { userCreateContext } from '../Context/usersCreateContext';
const Dashboard = ({ navigation }) => {
  //GQR-65
  const { getItem, t, CustomHeader, onBackPress, logoImage, topBanner, isOnline } = useContext(userCreateContext);
  const isFocused = useIsFocused();
  const [bottomBanner, setbottomBanner] = useState();
  const [userName, setuserName] = useState();
  const [profileImg, setprofileImg] = useState();
  const [company_website, setcompany_website] = useState("");
  const [logoImg, setlogoImage] = useState(logoImage);
  const [topBannerImg, settopBanner] = useState(topBanner);
  const navigateToPages = (pageName) => {
    if (isOnline) {
      navigation.navigate(pageName, { data: 'remove' });
    } else {
      if (pageName == "ProblemList" || pageName == "activityList" || pageName == "PersonalInformation") {
        navigation.navigate(pageName, { data: 'remove' });
      }
    }
  };
  const onPageLoad = async () => {
    const [bottomBannerData,
      userNameData,
      profileImgData, loginUser_data, company_website, logoImageData, topBannerData] = await Promise.all([
        getItem('bottomBannerData'),
        getItem('userNameData'),
        getItem('profileImgData'),
        // getItem('loginUser_data'),
        getItem('company_website'),
        getItem('logoImageData'),
        getItem('topBannerData'),
        // getCurrentLatLong(),
        Permission.requestMultiple([PERMISSIONS_TYPE.microphone, PERMISSIONS_TYPE.fineLocation, PERMISSIONS_TYPE.notifications])
      ]);
    if (logoImage != null) {
      setlogoImage(logoImage)
    } else {
      setlogoImage(logoImageData)
    }
    if (topBanner != null) {
      settopBanner(topBanner)
    } else {
      settopBanner(topBannerData)
    }
    setcompany_website(company_website);
    setbottomBanner(bottomBannerData);
    setuserName(userNameData);
    setprofileImg(profileImgData);
  };
  const HandlerGoBack = () => exit()
  useEffect(() => {
    if (isFocused) {
      onPageLoad();
      onBackPress(exit);
    }
  }, [isFocused, topBanner]);
  const exit = () => {
    Alert.alert(`${t('app_name')}`, `${t('close_app')}`,
      [{ text: `${t('cancle')}`, onPress: () => console.log('Cancel Pressed'), style: 'cancel' }, { text: `${t('ok')}`, onPress: () => BackHandler.exitApp() }],
      { cancelable: false });
    return true;
  }
  const CompanyWebsiteOpen = () => {
    if (company_website != "") { Linking.openURL(company_website) } else { Alert.alert("Company website not found") }
  }
  return (
    <>
      <BackGroundLocation />
      <ForegroundLocationService />
      <ForegroundHandler />
      <View style={{ flex: 1, backgroundColor: '#f9f9f9' }}>
        <CustomHeader path="exit" HandlerGoBack={HandlerGoBack} logoImage={logoImage} topBanner={topBanner} show={true} />
        <View name="name">
          <View style={styles.containerimg}>
            {profileImg ?
              <ImagePlaceHolderCircleWithoutAddButton imageurl={{ uri: profileImg }} /> : <ImagePlaceHolderCircleWithoutAddButton imageurl={require('../Common/images/avatar.png')} />
            }
          </View>
          <Text style={styles.userTitle}>{t('farmerdashboard_welcome_text')} {userName}</Text>
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View >
            <View style={styles.container}>
              <BoxDisplay text={t('register_nfarmer')} imageurl={require('../Common/images/register_farmer.png')} onpress={() => navigateToPages('PersonalInformation')} />
              <BoxDisplay text={t('farmer_list')} imageurl={require('../Common/images/farmer_list.png')} onpress={() => navigateToPages('userList')} />
            </View>
            <View style={styles.container}>
              <BoxDisplay text={t('crop_prob_far_dash')} imageurl={require('../Common/images/raise_problem_only.png')} onpress={() => navigateToPages('ProblemList')} />
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
                <TouchableOpacity onPress={() => CompanyWebsiteOpen()}>
                  <ImageForm source={{ uri: bottomBanner }} resizeMode="cover" height={200} width={'100%'} />
                </TouchableOpacity>
                : <TouchableOpacity onPress={() => CompanyWebsiteOpen()}>
                  <ImageForm source={require('../Common/images/ad_banner_space.jpg')} resizeMode="cover" height={200} width={'100%'} />
                </TouchableOpacity>}
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
  },
  loadingScreen: {
    position: 'absolute',
    top: '50%',
    zIndex: 999,
    left: '45%'
  },
})
