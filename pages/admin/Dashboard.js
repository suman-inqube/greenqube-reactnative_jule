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
import MessageDialog from '../Common/MessageDialog';
import {
  getDycryptedImage,
  LandUnitArea,
  UnitConversonToDefault,
} from '../../config/apiHere';
import MyErrorBoundary from '../Common/MyErrorBoundary';
const Dashboard = ({ navigation }) => {
  //GQR-65
  const {
    getItem,
    t,
    CustomHeader,
    onBackPress,
    logoImage,
    topBanner,
    isOnline,
    Root,
    Toast,
    AlertMesg,
  } = useContext(userCreateContext);
  // const {dbname, lan_id, token, user_id} = loginUser_data || {};
  const isFocused = useIsFocused();
  const [bottomBanner, setbottomBanner] = useState();
  const [userName, setuserName] = useState();
  const [profileImg, setprofileImg] = useState();
  const [company_website, setcompany_website] = useState("");
  const [logoImg, setlogoImage] = useState(logoImage);
  const [topBannerImg, settopBanner] = useState(topBanner);
  const [defaultLand, setDefaultLand] = useState(false);
  const [convertionLUState, setConvertionLUState] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [loTime, setloTime] = useState("");
  const navigateToPages = (pageName) => {
    if (isOnline) {
      if (pageName == "PersonalInformation") {
        //  if (defaultLand == true) {
        if (convertionLUState == false) {
          navigation.navigate(pageName, { data: 'remove' });
        } else {
          Toast.show({
            text: 'Please add the unit equivalent factor to default unit',
            ...AlertMesg[0],
          });
        }

        // } else {
        //   Toast.show({
        //     text: 'Please set default land area unit',
        //     ...AlertMesg[0],
        //   });
        // }
      } else {
        navigation.navigate(pageName, { data: 'remove' });
      }

    } else {
      if (pageName == "ProblemList" || pageName == "activityList" || pageName == "PersonalInformation") {
        navigation.navigate(pageName, { data: 'remove' });
      }
    }
  };
  // const onPageLoad = async (signal) => {
  //   const [
  //     bottomBannerData,
  //     userNameData,
  //     profileImgData,
  //     loginUser_data,
  //     company_website,
  //     logoImageData,
  //     topBannerData,
  //   ] = await Promise.all([
  //     getItem('bottomBannerData'),
  //     getItem('userNameData'),
  //     getItem('profileImgData'),
  //     getItem('loginUser_data'),
  //     getItem('company_website'),
  //     getItem('logoImageData'),
  //     getItem('topBannerData'),
  //     Permission.requestMultiple([
  //       PERMISSIONS_TYPE.microphone,
  //       PERMISSIONS_TYPE.fineLocation,
  //       PERMISSIONS_TYPE.notifications,
  //     ]),
  //   ]);
  //   if (bottomBanner?.content && bottomBanner?.iv) {
  //     const uri = getDycryptedImage(bottomBanner?.content, bottomBanner?.iv);
  //     setbottomBanner(uri);
  //   }
  //   if (logoImage != null) {
  //     setlogoImage(logoImage);
  //   } else {
  //     setlogoImage(logoImageData);
  //   }
  //   if (topBanner != null) {
  //     settopBanner(topBanner);
  //   } else {
  //     settopBanner(topBannerData);
  //   }
  //   setcompany_website(company_website);
  //   setuserName(userNameData);
  //   if (profileImgData && profileImgData?.content && profileImgData?.iv) {
  //     const uri = getDycryptedImage(
  //       profileImgData?.content,
  //       profileImgData?.iv,
  //     );
  //     setprofileImg(uri);
  //   }
  //   const [UnitConversonToDefault_res, LandUnitArea_res] = await Promise.all([
  //     UnitConversonToDefault(
  //       loginUser_data.dbname,
  //       loginUser_data.lan_id,
  //       loginUser_data.token,
  //       signal
  //     ),
  //     LandUnitArea(
  //       loginUser_data.dbname,
  //       loginUser_data.lan_id,
  //       loginUser_data.token,
  //       signal
  //     ),
  //   ]);
  //   let i = 0;
  //   if (UnitConversonToDefault_res.status == 200) {
  //     if (UnitConversonToDefault_res.data.data?.count > 0) {
  //       UnitConversonToDefault_res.data.data.rows.forEach(element => {
  //         if (
  //           element.defined_unit_value == null ||
  //           element.defined_unit_value == ''
  //         ) {
  //           i = i + 1;
  //         }
  //       });
  //     }
  //   }
  //   if (i > 0) {
  //     setConvertionLUState(true);
  //   }
  //   if (LandUnitArea_res.status == 200) {
  //     if (LandUnitArea_res.data.data?.count > 0) {
  //       LandUnitArea_res.data.data.rows.forEach(element => {
  //         if (element.defined_unit_value.length > 0) {
  //           setDefaultLand(true);
  //         }
  //       });
  //     }
  //   }
  // };
  const HandlerGoBack = () => exit()
  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    if (isFocused) {
      const onPageLoad = async () => {
        const [
          bottomBannerData,
          userNameData,
          profileImgData,
          loginUser_data,
          company_website,
          logoImageData,
          topBannerData,
        ] = await Promise.all([
          getItem('bottomBannerData'),
          getItem('userNameData'),
          getItem('profileImgData'),
          getItem('loginUser_data'),
          getItem('company_website'),
          getItem('logoImageData'),
          getItem('topBannerData'),
          Permission.requestMultiple([
            PERMISSIONS_TYPE.microphone,
            PERMISSIONS_TYPE.fineLocation,
            PERMISSIONS_TYPE.notifications,
          ]),
        ]);
        if (bottomBanner?.content && bottomBanner?.iv) {
          const uri = getDycryptedImage(bottomBanner?.content, bottomBanner?.iv);
          setbottomBanner(uri);
        }
        if (logoImage != null) {
          setlogoImage(logoImage);
        } else {
          setlogoImage(logoImageData);
        }
        if (topBanner != null) {
          settopBanner(topBanner);
        } else {
          settopBanner(topBannerData);
        }
        setcompany_website(company_website);
        setuserName(userNameData);
        if (profileImgData && profileImgData?.content && profileImgData?.iv) {
          const uri = getDycryptedImage(
            profileImgData?.content,
            profileImgData?.iv,
          );
          setprofileImg(uri);
        }
        const [UnitConversonToDefault_res, LandUnitArea_res] = await Promise.all([
          UnitConversonToDefault(
            loginUser_data.dbname,
            loginUser_data.lan_id,
            loginUser_data.token
          ),
          LandUnitArea(
            loginUser_data.dbname,
            loginUser_data.lan_id,
            loginUser_data.token
          ),
        ]);
        let i = 0;
        if (UnitConversonToDefault_res.status == 200) {
          if (UnitConversonToDefault_res.data.data?.count > 0) {
            UnitConversonToDefault_res.data.data.rows.forEach(element => {
              if (
                element.defined_unit_value == null ||
                element.defined_unit_value == ''
              ) {
                i = i + 1;
              }
            });
          }
        }
        if (i > 0) {
          setConvertionLUState(true);
        }
        if (LandUnitArea_res.status == 200) {
          if (LandUnitArea_res.data.data?.count > 0) {
            LandUnitArea_res.data.data.rows.forEach(element => {
              if (element.defined_unit_value.length > 0) {
                setDefaultLand(true);
              }
            });
          }
        }
      };

      onBackPress(exit);
      onPageLoad();
    }
    return () => {
      controller.abort();
    };
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
    <MyErrorBoundary>
      {/* <BackGroundLocation /> */}
      <ForegroundLocationService />
      <ForegroundHandler />
      <View style={{ flex: 1, backgroundColor: '#f9f9f9' }}>
        <CustomHeader
          path="exit"
          HandlerGoBack={HandlerGoBack}
          logoImage={logoImage}
          topBanner={topBanner}
          show={true}
        />
        <View name="name">
          <View style={styles.containerimg}>
            {profileImg ? (
              <ImagePlaceHolderCircleWithoutAddButton
                imageurl={{ uri: profileImg }}
              />
            ) : (
              <ImagePlaceHolderCircleWithoutAddButton
                imageurl={require('../Common/images/avatar.png')}
              />
            )}
          </View>
          <Text style={styles.userTitle}>
            {t('farmerdashboard_welcome_text')} {userName}
          </Text>


        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View>
            <View style={styles.container}>
              <BoxDisplay
                text={t('register_nfarmer')}
                imageurl={require('../Common/images/register_farmer.png')}
                onpress={() => navigateToPages('PersonalInformation')}
              />
              <BoxDisplay
                text={t('farmer_list')}
                imageurl={require('../Common/images/farmer_list.png')}
                onpress={() => navigateToPages('userList')}
              />
            </View>
            <View style={styles.container}>
              <BoxDisplay
                text={t('crop_prob_far_dash')}
                imageurl={require('../Common/images/raise_problem_only.png')}
                onpress={() => navigateToPages('ProblemList')}
              />
              <BoxDisplay
                text={t('acti_report_far_dash')}
                imageurl={require('../Common/images/activity_report_only.png')}
                onpress={() => navigateToPages('activityList')}
              />
            </View>
            <View style={styles.container}>
              <BoxDisplay
                text={t('agri_inputs_ninquiry_far_dash')}
                imageurl={require('../Common/images/input_inqu_only.png')}
                onpress={() => navigateToPages('InputList')}
              />
              <BoxDisplay
                text={t('agri_output_far_dash')}
                imageurl={require('../Common/images/dash_sale_your_product.png')}
                onpress={() => navigateToPages('OutPutList')}
              />
            </View>
            <View style={styles.container}>
              <BoxDisplay
                text={t('market_information')}
                imageurl={require('../Common/images/market_information_only.png')}
              />
              <BoxDisplay
                text={t('useful_ninformation_dash')}
                imageurl={require('../Common/images/dash_useful_information.png')}
                onpress={() => navigateToPages('UsefulInformationList')}
              />
            </View>
            <View style={{ marginTop: 16, elevation: 5 }}>
              {bottomBanner ? (
                <TouchableOpacity onPress={() => CompanyWebsiteOpen()}>
                  <ImageForm
                    source={{
                      uri: bottomBanner,
                    }}
                    resizeMode="cover"
                    height={200}
                    width={'100%'}
                  />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={() => CompanyWebsiteOpen()}>
                  <ImageForm
                    source={require('../Common/images/ad_banner_space.jpg')}
                    resizeMode="cover"
                    height={200}
                    width={'100%'}
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>
      </View>
      <Root></Root>
    </MyErrorBoundary>
  );
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
