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
import {farmerActivityListAPI} from '../../config/apiHere';

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
  const [latestActivities, setLatestActivities] = useState([]);

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

  const fetchLatestActivities = async () => {
    try {
      const response = await farmerActivityListAPI(
        dbname,
        lan_id,
        token,
        user_id,
        1, // pageNo
        '', // searchItem
        '', // from_date
        '', // to_date
        '', // carbonType
        3, // limit to 3 activities
      );

      if (response?.data?.data?.rows) {
        setLatestActivities(response.data.data.rows);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
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
    await fetchLatestActivities();
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
      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () =>
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
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
        <View style={{flex: 1, backgroundColor: '#f4f9f3'}}>
          <View
            style={{
              height: '20%',
              borderBottomLeftRadius: 60,
              backgroundColor: '#f0f4f1',
            }}>
            <ImageBackground
              source={
                topBanner
                  ? {uri: topBanner}
                  : require('../Common/images/farmming3.jpg')
              }
              resizeMode="stretch"
              style={styles.container}
              imageStyle={{
                opacity: 0.7,
                // borderBottomLeftRadius: 20,
                // borderBottomRightRadius: 20,
                // backgroundColor: '#f0f4f1',
              }}></ImageBackground>
          </View>

          <ScrollView>
            <View
              style={{
                flex: 1,
                // backgroundColor: 'red',
              }}>
              <View style={styles.staticTextContainer}>
                <Text style={styles.staticText}>Component</Text>
              </View>
              <View
                style={{
                  // backgroundColor: 'blue',
                  alignSelf: 'center',
                  // marginTop: 10,
                  justifyContent: 'center',
                  alignItems: 'center',
                  justifyContent: 'center',
                  // width: '100%', // Align children to the left
                  // paddingHorizontal: 1,
                }}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  // contentContainerStyle={{paddingHorizontal: 10}}
                  style={{
                    // backgroundColor: '#dae0dd',
                    borderBottomLeftRadius: 25,
                    borderBottomRightRadius: 25,
                    // height: 100,
                  }}>
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
                    onpress={() =>
                      navigateToPages('FarmerUsefulInformationList')
                    }
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
            </View>
            <View
              style={{
                // flex: 1,
                // marginVertical: 10,
                marginHorizontal: 10,
                borderRadius: 10,
                overflow: 'hidden',
                marginBottom: 30,
                // flexDirection: 'row',
                // backgroundColor: 'red',
              }}>
              <ImageForm
                source={require('../Common/images/dashboard.jpeg')}
                resizeMode="stretch"
                height={200}
                width={'100%'}
                style={{borderRadius: 10}}
              />
              <View style={styles.greenOverlay} />
              <View style={styles.userTitleOverlay}>
                <View
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
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
                  <View
                    style={{
                      marginTop: 8,
                      alignItems: 'center',
                      justifyContent: 'center',
                      alignSelf: 'center',
                    }}>
                    <Text style={styles.userTitle}>{userName}</Text>
                    {companyName && (
                      <Text style={styles.companyName}>{t(companyName)}</Text>
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
                    // contentContainerStyle={styles.activitiesListContainer}
                  />
                </View>
              </View>
            </View>
            <View style={{flex: 1}}>
              {latestActivities.length > 0 && (
                <View style={styles.latestActivitiesContainer}>
                  <Text style={styles.sectionTitle}>Recent Activities</Text>
                  <FlatList
                    data={latestActivities}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({item}) => (
                      <TouchableOpacity
                        style={styles.activityCard}
                        onPress={() =>
                          navigation.navigate('FarmerActivityDetail', item)
                        }>
                        <View style={styles.activityContent}>
                          <Text style={styles.activityUserName}>
                            {item.agri_user?.userName || 'Unknown User'}
                          </Text>
                          <Text style={styles.activityDate}>
                            {item.act_perform_date?.substring(0, 10) ||
                              'No date'}
                          </Text>
                        </View>
                        <Text style={styles.activityType}>
                          {item.typeActivity?.categoryName ||
                            'Unknown Activity'}
                        </Text>
                      </TouchableOpacity>
                    )}
                  />
                </View>
              )}

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
            </View>
          </ScrollView>
        </View>
      </>
    </FarmerDrawerScreenWrapper1>
  );
};

export default FarmerDashboard;
const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: 'rgba(4, 0, 0, 1)',
    overflow: 'hidden',
  },
  greenOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(3, 47, 27, 0.5)',
    height: '100%',
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
  userTitleOverlay: {
    position: 'absolute',
    // top: 20,
    // left: 10,
    height: 200,
    width: '100%',
    flexDirection: 'row',
  },
  upcomingActivitiesContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.37)',
    padding: 10,
    justifyContent: 'center',
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  upcomingActivitiesTitle: {
    fontSize: 14,
    color: 'white',
    marginBottom: 10,
    fontFamily: 'Poppins-SemiBold',
    // marginLeft: 18,
    // marginTop: 3,
    borderBottomWidth: 1,
    borderBottomColor: 'white',
    alignSelf: 'center',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    // marginBottom: 62,
    alignSelf: 'center',
    justifyContent: 'center',
    // marginBottom: 5,
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
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityTitle: {
    fontSize: 13,
    color: '#e3fae7',
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 2,
    // marginLeft: 20,
  },
  activityMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  activityDate: {
    fontSize: 12,
    color: '#e3f3fa',
    fontFamily: 'Poppins-Regular',
    // marginLeft: 20,
  },
  userTitle: {
    fontSize: 14,
    color: 'white',
    fontFamily: 'Poppins-SemiBold',
  },
  companyName: {
    fontSize: 13,
    color: 'white',
    fontFamily: 'Poppins-Regular',
    fontStyle: 'italic',
  },

  bannerOverlay: {
    flexDirection: 'row',
    backgroundColor: '#478541',
    paddingVertical: 10,
    paddingHorizontal: 20,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerOverlayText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: 'white',
    // textShadowColor: 'rgba(0, 0, 0, 0.5)',
    // textShadowOffset: {width: 1, height: 1},
    // textShadowRadius: 3,
  },
  bottomContainer: {
    // flex: 1,

    // marginTop: -40, // Reduced from larger value
    // marginBottom: 10,
    height: 400,
  },
  staticTextContainer: {
    position: 'absolute',
    top: 5, // Adjust as needed
    left: 10, // Adjust as needed
    zIndex: 1000, // Ensure it's above the ScrollView

    // padding: 5,
    borderRadius: 4,
    marginTop: 10,
    marginBottom: 15,
  },
  staticText: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#000',
  },
  /////////////////////////////////////////////////////////

  // contentContainer: {
  //   flex: 1,
  //   // Slightly transparent white
  //   borderTopLeftRadius: 20,
  //   borderTopRightRadius: 20,
  //   // marginTop: 30, // Adjust based on your header height
  // },
  // mainContainer: {
  //   flex: 1,
  //   backgroundColor: 'white',
  // },
  // container: {
  //   flex: 1,
  //   width: '100%',

  //   // flexDirection: 'row',
  //   // justifyContent: 'space-between',
  //   backgroundColor: 'rgba(4, 0, 0, 1)',
  //   // borderBottomLeftRadius: 20,
  //   // borderBottomRightRadius: 20,
  //   overflow: 'hidden',
  // },
  // container2: {
  //   marginHorizontal: 20,
  //   // marginVertical: 20,
  // },
  // bottomContainer: {
  //   // flex: 1,

  //   // marginTop: -40, // Reduced from larger value
  //   // marginBottom: 10,
  //   height: 400,
  // },
  // dashboardImageWrapper: {
  //   position: 'relative',
  //   width: '100%',
  //   // height: 220,
  //   borderRadius: 20,
  //   overflow: 'hidden',
  //   marginVertical: 10,
  //   // marginBottom: 50,
  // },
  // greenOverlay: {
  //   ...StyleSheet.absoluteFillObject,
  //   backgroundColor: 'rgba(3, 62, 35, 0.70)',
  //   height: '100%',
  // },
  // userTitle: {
  //   fontSize: 14,
  //   color: 'white',
  //   fontFamily: 'Poppins-SemiBold',
  // },
  // companyName: {
  //   fontSize: 14,
  //   color: 'white',
  //   fontFamily: 'Poppins-Regular',
  //   fontStyle: 'italic',
  // },
  // userTitleOverlay: {
  //   position: 'absolute',
  //   top: 10,
  //   // left: 10,
  //   zIndex: 1000,
  //   flexDirection: 'column',
  //   alignItems: 'flex-start',
  // },
  // userTextContainer: {
  //   flexDirection: 'column',
  //   justifyContent: 'center',
  //   alignSelf: 'center',
  //   marginHorizontal: 10,
  // },
  // noDataText: {
  //   textAlign: 'center',
  //   color: '#7f8c8d',
  // },
  // fixedTopContainer: {
  //   height: 300,
  //   zIndex: 1,
  // },
  // scrollableContent: {
  //   flex: 1,
  // },
  // profileBackView: {
  //   width: 100,
  //   height: 100,
  //   borderRadius: 90,
  //   backgroundColor: 'white',
  //   justifyContent: 'center',
  //   alignSelf: 'center',
  //   alignItems: 'center',
  //   marginBottom: 10,
  //   zIndex: 1000,
  //   marginRight: 30,
  // },
  // upcomingActivitiesContainer: {
  //   position: 'absolute',
  //   width: '55%',
  //   height: '100%',
  //   zIndex: 1000,
  //   backgroundColor: 'rgba(0, 0, 0, 0.37)',
  //   alignSelf: 'flex-end',
  //   justifyContent: 'center',
  //   borderTopLeftRadius: 10,
  //   borderBottomLeftRadius: 10,
  // },
  // upcomingActivitiesTitle: {
  //   fontSize: 14,
  //   color: 'white',
  //   marginBottom: 10,
  //   fontFamily: 'Poppins-SemiBold',
  //   marginLeft: 18,
  //   marginTop: 3,
  //   borderBottomWidth: 1,
  //   borderBottomColor: 'white',
  //   alignSelf: 'flex-start',
  // },
  // activityItem: {
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   marginBottom: 2,
  //   alignSelf: 'center',
  //   justifyContent: 'center',
  //   marginBottom: 2,
  //   borderBottomWidth: 0.5,
  //   borderBottomColor: 'white',
  // },
  // activityIndicator: {
  //   width: 6,
  //   height: 6,
  //   borderRadius: 4,
  //   backgroundColor: '#4CAF50',
  //   marginLeft: 5,
  // },
  // activityDetails: {
  //   flex: 1,
  // },
  // activityTitle: {
  //   fontSize: 13,
  //   color: '#e3fae7',
  //   fontFamily: 'Poppins-SemiBold',
  //   marginBottom: 2,
  //   marginLeft: 20,
  // },
  // activityMeta: {
  //   flexDirection: 'row',
  //   justifyContent: 'space-between',
  // },
  // activityDate: {
  //   fontSize: 12,
  //   color: '#e3f3fa',
  //   fontFamily: 'Poppins-Regular',
  //   marginLeft: 20,
  // },
  // activitiesListContainer: {
  //   paddingBottom: 5,
  // },
  // bannerOverlay: {
  //   flexDirection: 'row',
  //   backgroundColor: '#103503',
  //   paddingVertical: 10,
  //   paddingHorizontal: 20,
  //   width: '100%',
  //   justifyContent: 'center',
  //   alignItems: 'center',
  // },
  // bannerOverlayText: {
  //   fontSize: 18,
  //   fontWeight: 'bold',
  //   color: 'white',
  //   textShadowColor: 'rgba(0, 0, 0, 0.5)',
  //   textShadowOffset: {width: 1, height: 1},
  //   textShadowRadius: 3,
  // },

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
  latestActivitiesContainer: {
    backgroundColor: '#FFF',
    marginHorizontal: 10,
    marginBottom: 15,
    borderRadius: 10,
    padding: 15,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#478541',
    marginBottom: 10,
  },
  activityCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activityContent: {
    flex: 1,
  },
  activityUserName: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
  },
  // activityDate: {
  //   fontSize: 12,
  //   fontFamily: 'Poppins-Regular',
  //   color: '#666',
  //   marginTop: 4,
  // },
  activityType: {
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    color: '#478541',
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
});
