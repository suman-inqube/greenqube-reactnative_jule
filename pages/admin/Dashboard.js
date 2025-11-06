import React, {
  useRef,
  useEffect,
  useState,
  useContext,
  useCallback,
  useMemo,
  memo,
} from 'react';
import {
  Animated,
  StyleSheet,
  View,
  StatusBar,
  SafeAreaView,
  Platform,
  ImageBackground,
  TouchableOpacity,
  FlatList,
  Alert,
  BackHandler,
  RefreshControl,
  Linking,
  InteractionManager,
} from 'react-native';
import ImageForm from '../Common/ImageForm';
import { userCreateContext } from '../Context/usersCreateContext';
import { LandUnitArea, UnitConversonToDefault } from '../../config/apiHere';
import CarouselSlider from '../Components/CarouselSlider';
import TrackingInfromation from '../Components/TrackingInfromation';
import UpcomingActivities from '../Components/UpcomingActivities';
import SkeletonScreenDashoard from '../Components/Skeleton/SkeletonScreenDashoard';
import { Colors } from '../utils/Constants';
import { axiosGet } from '../utils/api';
import { ROUTES } from '../utils/Routes';
import useDoubleBackToExit from '../utils/useDoubleBackToExit';
import { Permission, PERMISSIONS_TYPE } from '../AppPermission/AppPermission';
import FarmerDrawerScreenWrapper1 from './FarmerDrawerScreenWrapper1';
import useCollapsibleHeader from '../utils/useCollapsibleHeader';
import { getDashboardItems } from '../utils/dashboardItems';
import { Fenced_Rejected_Plot_List } from '../../config/apiHere';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import ForegroundLocationService from '../BackgroundService/ForegroundLocationService';
import { Logout } from '../Logout';
// const HEADER_HEIGHT = 60;
const Dashboard = ({ navigation }) => {
  const isFocused = useIsFocused();
  useDoubleBackToExit();
  const {
    getItem,
    t,
    CustomHeader,
    logoImage,
    topBanner,
    isOnline,
    Toast,
    AlertMesg,
    coords,
    AllFarmerList,
    loginUser_data,
    startWatchingLocation,
    stopWatchingLocation,
    setLocationSettings,
  } = useContext(userCreateContext);
  const [refreshing, setRefreshing] = useState(false);

  const {
    headerTranslateY,
    filterTranslateY,
    imageHeight,
    imageOpacity,
    handleScroll,
    INITIAL_IMAGE_HEIGHT,
    HEADER_HEIGHT,
  } = useCollapsibleHeader(refreshing);
  // Batch UI-related small states into one object to reduce setState calls
  const [uiState, setUiState] = useState({
    bottomBanner: null,
    userName: null,
    profileImg: null,
    company_website: '',
    logoImg: logoImage || null,
    topBannerImg: topBanner || null,
    defaultLand: false,
    convertionLUState: false,
  });

  // Batch data coming from server into one object
  const [dataState, setDataState] = useState({
    plotStatus: [],
    usefulInfoList: [],
    activitySchedule: [],
  });

  const [isLoading, setIsLoading] = useState(true);
  const navigateToPages = useCallback(
    pageName => {
      if (isOnline) {
        if (pageName === 'PersonalInformation') {
          if (uiState.convertionLUState === false) {
            navigation.navigate(pageName);
          } else {
            Toast?.show({
              text: 'Please add the unit equivalent factor to default unit',
              ...AlertMesg?.[0],
            });
          }
        } else {
          navigation.navigate(pageName);
        }
      } else {
        if (
          pageName === 'ProblemList' ||
          pageName === 'activityList' ||
          pageName === 'PersonalInformation'
        ) {
          navigation.navigate(pageName);
        }
      }
    },
    [isOnline, navigation, uiState.convertionLUState, Toast, AlertMesg],
  );
  const onPageLoad = useCallback(async type => {
    if (type != 'refreshing') {
      setIsLoading(true);
    }
    try {
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
        AllFarmerList(),
      ]);

      // keep all computations in local vars first
      const logoImgToSet = logoImage || logoImageData || null;
      const topBannerToSet = topBanner || topBannerData || null;

      let plotStatus = [];
      var usefulInfoList = [];
      let activitySchedule = [];
      let convertionLUState = false;
      let defaultLand = false;

      const login = loginUser_data || {};
      const { dbname, lan_id, token, agri_user_addresses, user_id } = login;

      if (dbname && lan_id && token && agri_user_addresses?.length > 0) {
        const [
          UnitConversonToDefault_res,
          LandUnitArea_res,
          FARMER_USEFULL_INFO_LIST,
          PLOT_STATUS,
          ALL_ACTIVITY_SCHEDULE_RES,
        ] = await Promise.all([
          axiosGet(ROUTES.GET.UNIT_CONVERSION_DEFAULT(), token, {
            information: `${dbname},${lan_id}`,
          }),
          axiosGet(ROUTES.GET.LAND_UNIT_AREA(), token, {
            information: `${dbname},${lan_id}`,
          }),
          axiosGet(
            ROUTES.GET.USEFULL_INFO_LIST({
              userId: user_id,
              userType: 'supervisor',
              post: 'general_info',
              titleSearch: '',
              state_id: agri_user_addresses[0]?.agri_state.fid,
              district_id: agri_user_addresses[0]?.agri_district.fid,
              subdiv_id: agri_user_addresses[0]?.agri_subdivision.fid,
            }),
            '',
            { information: `${dbname},${lan_id}` },
          ),

          axiosGet(
            ROUTES.GET.Fenced_Rejected_Plot_List({
              page: 1,
              status_level: 'REJECTED',
              geo_type: '',
              searchBy: '',
              supervisor_id: user_id
            }),
            token,
            { information: `${dbname},${lan_id},${user_id}` },
          ),

          axiosGet(
            ROUTES.GET.ALL_ACTIVITY_SCHEDULE({
              supervisor_id: user_id,
              type: 'carbon_activity',
            }),
            token,
            { information: `${dbname},${lan_id},${user_id}` },
          ),

          // axiosGet(
          //   ROUTES.GET.LIST_USER_ACTIVITY({
          //     pageNO: 1,
          //     carbonType: '',
          //     userID: '',
          //     searchItem: '',
          //     from_date: '',
          //     to_date: '',
          //   }),
          //   token,
          //   {information: `${dbname},${lan_id},${user_id}`},
          // ),
        ]);
        let missingCount = 0;
        if (UnitConversonToDefault_res?.status === 200) {
          const rows = UnitConversonToDefault_res.data?.data?.rows || [];
          for (let r of rows) {
            if (r.defined_unit_value == null || r.defined_unit_value === '')
              missingCount++;
          }
          if (missingCount > 0) convertionLUState = true;
        }
        if (LandUnitArea_res?.status === 200) {
          const rows = LandUnitArea_res.data?.data?.rows || [];
          for (let r of rows) {
            if (r.defined_unit_value?.length > 0) {
              defaultLand = true;

              break;
            }
          }
        }
        if (FARMER_USEFULL_INFO_LIST?.status === 200) {
          usefulInfoList = FARMER_USEFULL_INFO_LIST.data?.rows || [];
        }
        if (PLOT_STATUS?.status === 200) {
          plotStatus = PLOT_STATUS.data?.data?.rows || [];
        }
        if (ALL_ACTIVITY_SCHEDULE_RES?.status === 200) {
          activitySchedule = ALL_ACTIVITY_SCHEDULE_RES.data?.data?.data || [];
        }
      }

      // single batched state updates
      setUiState(prev => ({
        ...prev,
        bottomBanner: bottomBannerData,
        userName: userNameData,
        profileImg: profileImgData,
        company_website: company_website || prev.company_website,
        logoImg: logoImgToSet,
        topBannerImg: topBannerToSet,
        defaultLand,
        convertionLUState,
      }));

      setDataState({
        plotStatus,
        usefulInfoList,
        activitySchedule,
      });

      setIsLoading(false);
    } catch (error) {
      Toast?.show({
        text: error,
        ...AlertMesg?.[0],
      });
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      onPageLoad();
    });
    return () => {
      task.cancel();
      // stopWatchingLocation();
    };
  }, []);

  useEffect(() => {
    const { mocked } = coords
    // if (mocked == true) {
    //   Logout();
    //   navigation.navigate("Login");
    // }
    const { agri_user_addresses, dbname, lan_id, token, user_id } =
      loginUser_data || {};
    let plotStatus = [];
    var usefulInfoList = [];
    let activitySchedule = [];
    const USEFULL_Call = async () => {
      setLocationSettings(prev => ({
        ...prev,
        enableHighAccuracy: true,
        distanceFilter: 5,
        interval: 10000,
        fastestInterval: 5000,
      }));
      startWatchingLocation();
      const [FARMER_USEFULL_INFO_LIST, PLOT_STATUS, ALL_ACTIVITY_SCHEDULE_RES] =
        await Promise.all([
          axiosGet(
            ROUTES.GET.USEFULL_INFO_LIST({
              userId: user_id,
              userType: 'supervisor',
              post: 'general_info',
              titleSearch: '',
              state_id: agri_user_addresses[0]?.agri_state.fid,
              district_id: agri_user_addresses[0]?.agri_district.fid,
              subdiv_id: agri_user_addresses[0]?.agri_subdivision.fid,
            }),
            '',
            { information: `${dbname},${lan_id}` },
          ),
          axiosGet(
            ROUTES.GET.Fenced_Rejected_Plot_List({
              page: 1,
              status_level: 'REJECTED',
              geo_type: '',
              searchBy: '',
            }),
            token,
            { information: `${dbname},${lan_id},${user_id}` },
          ),
          axiosGet(
            ROUTES.GET.ALL_ACTIVITY_SCHEDULE({
              supervisor_id: user_id,
            }),
            token,
            { information: `${dbname},${lan_id},${user_id}` },
          ),
        ]);
      if (FARMER_USEFULL_INFO_LIST?.status === 200) {
        usefulInfoList = FARMER_USEFULL_INFO_LIST.data?.rows || [];
      }
      if (PLOT_STATUS?.status === 200) {
        plotStatus = PLOT_STATUS.data?.data?.rows || [];
      }
      if (ALL_ACTIVITY_SCHEDULE_RES?.status === 200) {
        activitySchedule = ALL_ACTIVITY_SCHEDULE_RES.data?.data?.rows || [];
      }
      setDataState({
        plotStatus,
        usefulInfoList,
        activitySchedule,
      });
    };
    USEFULL_Call();
  }, [isFocused]);

  const exit = useCallback(() => {
    Alert.alert(
      `${t('app_name')}`,
      `${t('close_app')}`,
      [
        { text: `${t('cancle')}`, onPress: () => { }, style: 'cancel' },
        { text: `${t('ok')}`, onPress: () => BackHandler.exitApp() },
      ],
      { cancelable: false },
    );
    return true;
  }, [t]);

  const CompanyWebsiteOpen = useCallback(() => {
    if (uiState.company_website && uiState.company_website !== '') {
      Linking.openURL(uiState.company_website).catch(() => {
        Alert.alert('Cannot open website');
      });
    } else {
      Alert.alert('Company website not found');
    }
  }, [uiState.company_website]);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    requestAnimationFrame(async () => {
      // await onPageLoad("refreshing");
      const task = InteractionManager.runAfterInteractions(() => {
        onPageLoad();
      });
      setRefreshing(false);
      return () => task.cancel();
    });
  }, []);

  // memoized header content so FlatList doesn't recreate on each render
  const headerContent = useMemo(
    () => (
      <>
        <ForegroundLocationService />
        <UpcomingActivities
          t={t}
          uiState={uiState}
          loginUserData={loginUser_data}
          dashboardType="Supervisor"
          activitySchedule={dataState.activitySchedule}
        />
        <TrackingInfromation
          plotStatus={dataState.plotStatus}
          t={t}
          usefulInfoList={dataState.usefulInfoList}
          navigation={navigation}
          trackingNavigationPath="Market"
          informationNavigationPath="UsefulInformationList"
          leftButtonText="Plot Status"
          dashboardType="admin"
        />
        <View
          style={{
            flex: 1,
            backgroundColor: Colors.useGreen,
            margin: '4%',
            borderRadius: 12,
            overflow: 'hidden',
          }}>
          {uiState.bottomBanner ? (
            <TouchableOpacity
              onPress={CompanyWebsiteOpen}
              style={styles.bottomContainer}>
              <ImageForm
                source={{ uri: uiState.bottomBanner }}
                resizeMode="cover"
                height={220}
                width={'100%'}
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={CompanyWebsiteOpen}>
              <ImageForm
                source={require('../Common/images/ad_banner_space.jpg')}
                resizeMode="cover"
                height={220}
                width={'100%'}
                style={styles.bottomContainer}
              />
            </TouchableOpacity>
          )}
        </View>
      </>
    ),
    [
      uiState.bottomBanner,
      uiState.profileImg,
      dataState.plotStatus,
      dataState.usefulInfoList,
      t,
      CompanyWebsiteOpen,
    ],
  );
  const dashBoardItemList = useMemo(
    () => getDashboardItems(t, navigateToPages),
    [t, navigateToPages],
  );
  const LOOP_ITEMS = useMemo(
    () => [...dashBoardItemList, ...dashBoardItemList, ...dashBoardItemList],
    [dashBoardItemList],
  );
  const renderCustomHeader = useMemo(
    () => (
      <CustomHeader
        path="exit"
        HandlerGoBack={exit}
        logoImage={uiState.logoImg}
        t={t}
      />
    ),
    [],
  );
  return (
    <FarmerDrawerScreenWrapper1>
      <SafeAreaView style={styles.container}>
        {isLoading ? (
          <SkeletonScreenDashoard />
        ) : (
          <>
            <Animated.View
              style={[
                styles.header,
                { transform: [{ translateY: headerTranslateY }] },
              ]}>
              {renderCustomHeader}
            </Animated.View>

            <Animated.View
              style={[
                styles.filterBar,
                { transform: [{ translateY: filterTranslateY }] },
              ]}>
              <Animated.View
                style={[styles.animatedHeaderImage, { height: imageHeight }]}>
                <ImageBackground
                  source={{
                    uri: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&h=400&fit=crop',
                  }}
                  // source={{ uri: uiState.topBannerImg || 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&h=400&fit=crop' }}
                  resizeMode="cover"
                  style={styles.imageBackground}
                  imageStyle={{ opacity: 0.6 }}>
                  <View style={styles.overlay} />
                  <View style={styles.bottomContent}>
                    <CarouselSlider
                      items={dashBoardItemList}
                      itemWidth={105}
                      itemFullWidth={10}
                      visibleItems={3}
                      spacing={14}
                      onPress={_data => _data.onpress()}
                      scrollSpeed={2500}
                    />
                  </View>
                  <View
                    style={{
                      backgroundColor: Colors.background_light,
                      height: 20,
                      position: 'relative',
                      bottom: -0,
                      borderTopRightRadius: 28,
                      borderTopLeftRadius: 28,
                      zIndex: 9999,
                    }}
                  />
                </ImageBackground>
              </Animated.View>
            </Animated.View>

            <View style={{ flex: 1, overflow: 'hidden' }}>
              <FlatList
                nestedScrollEnabled={true}
                contentContainerStyle={{
                  paddingTop: HEADER_HEIGHT + INITIAL_IMAGE_HEIGHT,
                  flexGrow: 1, // ensure pull works even when content small
                  overflow: 'hidden',
                }}
                scrollEventThrottle={1}
                showsVerticalScrollIndicator={false}
                onScroll={handleScroll}
                data={[]} // everything in header
                keyExtractor={(item, index) => index.toString()}
                alwaysBounceVertical={true}
                // refreshControl={
                //   <RefreshControl
                //     refreshing={refreshing}
                //     onRefresh={onRefresh}
                //     colors={['#003c04']}
                //     tintColor={'#003c04'}
                //     // progressViewOffset={50} // push down if header exists
                //     progressViewOffset={
                //       Platform.OS === 'android' ? HEADER_HEIGHT + 200 : 100
                //     }
                //   />
                // }
                removeClippedSubviews={true}
                initialNumToRender={1}
                maxToRenderPerBatch={2}
                windowSize={5}
                ListHeaderComponent={headerContent}
              />
            </View>
          </>
        )}
      </SafeAreaView>
    </FarmerDrawerScreenWrapper1>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background_light },
  header: {
    // height: 60 - 10,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 99999,
  },
  filterBar: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    zIndex: 9,

    zIndex: 9999,
  },
  animatedHeaderImage: {
    width: '100%',
    overflow: 'hidden',
    backgroundColor: '#003c04',
    zIndex: 9999,
  },
  imageBackground: { flex: 1, width: '100%', justifyContent: 'flex-end' },
  overlay: { ...StyleSheet.absoluteFillObject },
  bottomContent: {
    paddingBottom: 10,
    paddingTop: 15,
    alignItems: 'center',
    zIndex: 999,
  },
  bottomContainer: {},
});
export default React.memo(Dashboard);
