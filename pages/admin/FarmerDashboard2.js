import React, {useEffect, useState, useContext} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  StatusBar,
  Alert,
  BackHandler,
  ScrollView,
  FlatList,
  Dimensions,
} from 'react-native';
import ImageForm from '../Common/ImageForm';
import {BoxDisplay, BoxDisplayDeactive} from './dashboardComp';
import ImagePlaceHolderCircleWithoutAddButton from '../Common/ImagePlaceHolderCircleWithoutAddButton';
import {Permission, PERMISSIONS_TYPE} from '../AppPermission/AppPermission';
import ForegroundHandler from '../PushNotification/ForegroundHandler';
import {useIsFocused} from '@react-navigation/native';
import ForegroundLocationService from '../BackgroundService/ForegroundLocationService';
import BackGroundLocation from '../BackgroundService/BackGroundLocation';
import {userCreateContext} from '../Context/usersCreateContext';
import {addModuleForView} from '../../config/apiHere';
import FarmerDrawerScreenWrapper1 from './FarmerDrawerScreenWrapper1';
import {ImageBackground} from 'react-native';
import moment from 'moment';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import CustomHeaderCopy from './CustomHeaderCopy';

// import DeviceInfo from 'react-native-device-info';
const FarmerDashboard = ({navigation}) => {
  const screenWidth = Dimensions.get('window').width;

  //GQR-65
  const {
    getItem,
    t,
    CustomHeader,
    DeviceInfo,
    onBackPress,
    logoImage,
    topBanner,
    loginUser_data,
    dbLanTokUsr,
  } = useContext(userCreateContext) || {};
  const {dbname, lan_id, token, user_id} = loginUser_data || {};
  //GQR-65
  const {netConnection} = DeviceInfo();
  const isFocused = useIsFocused();
  const [bottomBanner, setbottomBanner] = useState();
  const [userName, setuserName] = useState();
  const [profileImg, setprofileImg] = useState();
  const [companyName, setCompanyName] = useState('');

  const [upcomingActivities, setUpcomingActivities] = useState([
    {
      id: 1,
      title: 'Coming soon...',
      date: '2025-11-15',

      status: 'Pending',
    },
    {
      id: 2,
      title: 'Coming soon...',
      date: '2025-11-18',

      status: 'Upcoming',
    },
    {
      id: 3,
      title: 'Coming soon...',
      date: '2025-11-22',
      status: 'Upcoming',
    },
  ]);

  const [latLong, setLatLong] = useState({
    latitude: '',
    longitude: '',
  });
  const [company_website, setcompany_website] = useState('');
  const navigateToPages = pageName => {
    console.log(pageName);
    if (netConnection) {
      if (pageName == 'Weather') {
        navigation.navigate(pageName, {latLong});
      } else {
        switch (pageName) {
          case 'FarmerListProblem':
            addModuleForView(
              dbname,
              lan_id,
              user_id,
              token,
              'Problem User',
              'module_view',
              'problem_user',
              1,
            );
            break;
          case 'FarmerActivityList':
            addModuleForView(
              dbname,
              lan_id,
              user_id,
              token,
              'Activity User',
              'module_view',
              'activity_user',
              1,
            );
            break;
          case 'FarmerInputList':
            addModuleForView(
              dbname,
              lan_id,
              user_id,
              token,
              'Input User',
              'module_view',
              'input_user',
              1,
            );
            break;
          case 'FarmerOutPutList':
            addModuleForView(
              dbname,
              lan_id,
              user_id,
              token,
              'Output',
              'module_view',
              'outPut_user',
              1,
            );
            break;
          case 'FarmerUsefulInformationList':
            addModuleForView(
              dbname,
              lan_id,
              user_id,
              token,
              'UsefulInformation User',
              'module_view',
              'usefulInformation_user',
              1,
            );
            break;
          case 'FarmerTrainingList':
            addModuleForView(
              dbname,
              lan_id,
              user_id,
              token,
              'Training User',
              'module_view',
              'training_user',
              1,
            );
            break;
          case 'Weather':
            addModuleForView(
              dbname,
              lan_id,
              user_id,
              token,
              'Weather',
              'module_view',
              'weather_user',
              1,
            );
            break;
          default:
          // code block FarmerTrainingList
        }
        navigation.navigate(pageName);
      }
    } else {
      if (pageName == 'FarmerListProblem' || pageName == 'FarmerActivityList') {
        navigation.navigate(pageName);
      }
    }
  };
  const onPageLoad = async () => {
    const [
      userNameData,
      profileImgData,
      bottomBannerData,
      // loginUser_data,
      company_website,
      company_topBannerData,
    ] = await Promise.all([
      getItem('userNameData'),
      getItem('profileImgData'),
      getItem('bottomBannerData'),
      getItem('topBannerData'),
      // getItem('loginUser_data'),
      getItem('company_website'),
      Permission.requestMultiple([
        PERMISSIONS_TYPE.microphone,
        PERMISSIONS_TYPE.fineLocation,
      ]),
      // GeolocationApi(),
    ]);
    setbottomBanner(bottomBannerData);
    setcompany_website(company_website);
    setuserName(userNameData);
    setprofileImg(profileImgData);
    if (loginUser_data && loginUser_data.dbname) {
      setCompanyName(loginUser_data.dbname);
    }
  };

  useEffect(() => {
    // requestUserPermission();
    // notificationListener();
    onPageLoad();
    console.log(topBanner);
  }, []);

  const HandlerGoBack = () => exit();
  useEffect(() => {
    if (isFocused) {
      const onBackPress = () => {
        exit();
        return true;
      };
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }
  }, [isFocused]);
  const exit = () => {
    Alert.alert(
      `${t('app_name')}`,
      `${t('close_app')}`,
      [
        {
          text: `${t('cancle')}`,
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {text: `${t('ok')}`, onPress: () => BackHandler.exitApp()},
      ],
      {cancelable: false},
    );
  };
  const CompanyWebsiteOpen = () => {
    if (company_website != '') {
      Linking.openURL(company_website);
    } else {
      Alert.alert('Company website not found');
    }
  };
  return (
    <FarmerDrawerScreenWrapper1>
      <>
        <BackGroundLocation />
        <ForegroundLocationService />
        <ForegroundHandler />
        <CustomHeaderCopy
          path="exit"
          HandlerGoBack={HandlerGoBack}
          // logoImage={logoImage}
          // topBanner={topBanner}
          // show={true}
        />
        <View style={styles.mainContainer}>
          {/* <View style={styles.fixedTopContainer}> */}
          <View style={{height: 160}}>
            <ImageBackground
              source={
                topBanner
                  ? {uri: topBanner}
                  : require('../Common/images/farmming3.jpg')
              }
              resizeMode="stretch"
              style={styles.container}
              imageStyle={{opacity: 0.7}}></ImageBackground>
          </View>
          <View style={styles.contentContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <BoxDisplay
                text={t('crop_prob_far_dash')}
                imageurl={require('../Common/images/raise_problem_only.png')}
                onpress={() => navigateToPages('FarmerListProblem')}
              />
              <BoxDisplay
                text={t('acti_report_far_dash')}
                imageurl={require('../Common/images/activity_report_only.png')}
                onpress={() => navigateToPages('FarmerActivityList')}
              />
              <BoxDisplay
                text={t('agri_inputs_ninquiry_far_dash')}
                imageurl={require('../Common/images/input_inqu_only.png')}
                onpress={() => navigateToPages('FarmerInputList')}
              />
              <BoxDisplay
                text={t('agri_output_far_dash')}
                imageurl={require('../Common/images/dash_sale_your_product.png')}
                onpress={() => navigateToPages('FarmerOutPutList')}
              />
              <BoxDisplay
                text={t('weather_nadvisory_far_dash')}
                imageurl={require('../Common/images/dash_weather_advisory.png')}
                onpress={() => navigateToPages('Weather')}
              />
              <BoxDisplay
                text={t('useful_ninformation_far_dash')}
                imageurl={require('../Common/images/dash_useful_information.png')}
                onpress={() => navigateToPages('FarmerUsefulInformationList')}
              />
              <BoxDisplay
                text={t('training_support')}
                imageurl={require('../Common/images/training_support_green.png')}
                onpress={() => navigateToPages('FarmerTrainingList')}
              />
              <BoxDisplayDeactive
                text={t('Market Info')}
                imageurl={require('../Common/images/market_information_white.png')}
              />
            </ScrollView>
          </View>

          {/* </View> */}
          <ScrollView
            style={styles.scrollableContent}
            showsVerticalScrollIndicator={false}>
            <View style={styles.container2}>
              <View style={styles.dashboardImageWrapper}>
                <ImageForm
                  source={require('../Common/images/dashboard.jpeg')}
                  resizeMode="stretch"
                  height={200}
                  width={'100%'}
                  style={{borderRadius: 20}}
                />
                <View style={styles.greenOverlay} />
                <View style={styles.userTitleOverlay}>
                  <View style={styles.profileBackView}>
                    {profileImg ? (
                      <ImagePlaceHolderCircleWithoutAddButton
                        imageurl={{uri: profileImg}}
                        style={{
                          width: '100%',
                          height: 100,
                          borderRadius: 75,
                        }}
                      />
                    ) : (
                      <ImagePlaceHolderCircleWithoutAddButton
                        imageurl={require('../Common/images/avatar.png')}
                        style={{width: '94%', height: 95, borderRadius: 75}}
                      />
                    )}
                  </View>
                  <View style={styles.userTextContainer}>
                    <Text style={styles.userTitle}>{userName}</Text>
                    {companyName && (
                      <View style={{alignItems: 'center'}}>
                        <Text style={styles.companyName}>{t(companyName)}</Text>
                      </View>
                    )}
                  </View>
                </View>
                <View style={styles.upcomingActivitiesContainer}>
                  <Text style={styles.upcomingActivitiesTitle}>
                    Upcoming Activities
                  </Text>
                  <FlatList
                    data={upcomingActivities}
                    keyExtractor={item => item.id.toString()}
                    renderItem={({item}) => (
                      <View style={styles.activityItem}>
                        <View style={styles.activityIndicator} />
                        <View style={styles.activityDetails}>
                          {/* <Marquee speed={0.3} spacing={100} fade={true}> */}
                          <Text style={styles.activityTitle}>{item.title}</Text>
                          {/* </Marquee> */}
                          <View style={styles.activityMeta}>
                            <Text style={styles.activityDate}>
                              {moment(item.date).format('MMM D, YYYY')}
                            </Text>
                          </View>
                        </View>
                      </View>
                    )}
                    contentContainerStyle={styles.activitiesListContainer}
                  />
                </View>
              </View>
            </View>

            <View style={styles.bannerOverlay}>
              <MaterialIcons name="beenhere" size={22} />
              <Text style={styles.bannerOverlayText}>
                {t('Visit_Company_Website')}
              </Text>
            </View>
            {bottomBanner ? (
              <TouchableOpacity
                onPress={() => CompanyWebsiteOpen()}
                style={styles.bottomContainer}>
                <ImageForm
                  source={{uri: bottomBanner}}
                  resizeMode="cover"
                  height={300}
                  width={'100%'}
                />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={() => CompanyWebsiteOpen()}>
                <ImageForm
                  source={require('../Common/images/ad_banner_space.jpg')}
                  resizeMode="cover"
                  height={220}
                  width={'100%'}
                />
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      </>
    </FarmerDrawerScreenWrapper1>
  );
};

export default FarmerDashboard;
const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    // Slightly transparent white
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    // marginTop: 30, // Adjust based on your header height
  },
  mainContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  container: {
    flex: 1,
    width: '100%',

    // flexDirection: 'row',
    // justifyContent: 'space-between',
    backgroundColor: 'rgba(4, 0, 0, 1)',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: 'hidden',
  },
  container2: {
    marginHorizontal: 20,
    // marginVertical: 20,
  },
  bottomContainer: {
    // flex: 1,

    // marginTop: -40, // Reduced from larger value
    marginBottom: 10,
    height: 400,
  },
  dashboardImageWrapper: {
    position: 'relative',
    width: '100%',
    // height: 220,
    borderRadius: 20,
    overflow: 'hidden',
    marginVertical: 10,
    // marginBottom: 50,
  },
  greenOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(3, 62, 35, 0.70)',
    height: '100%',
  },
  userTitle: {
    fontSize: 14,
    color: 'white',
    fontFamily: 'Poppins-SemiBold',
  },
  companyName: {
    fontSize: 14,
    color: 'white',
    fontFamily: 'Poppins-Regular',
    fontStyle: 'italic',
  },
  userTitleOverlay: {
    position: 'absolute',
    top: 10,
    // left: 10,
    zIndex: 1000,
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  userTextContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignSelf: 'center',
    marginHorizontal: 10,
  },
  noDataText: {
    textAlign: 'center',
    color: '#7f8c8d',
  },
  fixedTopContainer: {
    height: 300,
    zIndex: 1,
  },
  scrollableContent: {
    flex: 1,
  },
  profileBackView: {
    width: 100,
    height: 100,
    borderRadius: 90,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignSelf: 'center',
    alignItems: 'center',
    marginBottom: 10,
    zIndex: 1000,
    marginRight: 30,
  },
  upcomingActivitiesContainer: {
    position: 'absolute',
    width: '55%',
    height: '100%',
    zIndex: 1000,
    backgroundColor: 'rgba(0, 0, 0, 0.37)',
    alignSelf: 'flex-end',
    justifyContent: 'center',
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  upcomingActivitiesTitle: {
    fontSize: 14,
    color: 'white',
    marginBottom: 10,
    fontFamily: 'Poppins-SemiBold',
    marginLeft: 18,
    marginTop: 3,
    borderBottomWidth: 1,
    borderBottomColor: 'white',
    alignSelf: 'flex-start',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
    alignSelf: 'center',
    justifyContent: 'center',
    marginBottom: 2,
    borderBottomWidth: 0.5,
    borderBottomColor: 'white',
  },
  activityIndicator: {
    width: 6,
    height: 6,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginLeft: 5,
  },
  activityDetails: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 13,
    color: '#e3fae7',
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 2,
    marginLeft: 20,
  },
  activityMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  activityDate: {
    fontSize: 12,
    color: '#e3f3fa',
    fontFamily: 'Poppins-Regular',
    marginLeft: 20,
  },
  activitiesListContainer: {
    paddingBottom: 5,
  },
  bannerOverlay: {
    flexDirection: 'row',
    backgroundColor: '#103503',
    paddingVertical: 10,
    paddingHorizontal: 20,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerOverlayText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 3,
  },

  ///////////////////////////////////////////////
  // container: {
  //   flexDirection: 'row',
  //   justifyContent: 'space-between',
  //   marginHorizontal: 8,
  // },

  // bottomContainer: {
  //   flex: 1,
  //   marginTop: 100,
  // },

  // containerimg: {
  //   flex: 1,
  //   zIndex: 100,
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   justifyContent: 'flex-end',
  //   paddingVertical: 10,
  // },
  // userTitle: {
  //   fontSize: 17,
  //   textAlign: 'right',
  //   // marginTop: 15,
  //   color: '#000',
  //   zIndex: 1000,
  //   fontFamily: 'Poppins-SemiBold',
  //   marginRight: 20,
  //   marginTop: 10,
  // },
  // loadingScreen: {
  //   position: 'absolute',
  //   top: '50%',
  //   zIndex: 999,
  //   left: '45%',
  // },
});
