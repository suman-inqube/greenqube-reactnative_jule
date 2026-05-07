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
  SafeAreaView,
  ImageBackground,
  TouchableOpacity,
  FlatList,
  Alert,
  BackHandler,
  Linking,
  InteractionManager,
} from 'react-native';
import ImageForm from '../Common/ImageForm';
import {userCreateContext} from '../Context/usersCreateContext';
import CarouselSlider from '../Components/CarouselSlider';
import TrackingInfromation from '../Components/TrackingInfromation';
import UpcomingActivities from '../Components/UpcomingActivities';
import SkeletonScreenDashoard from '../Components/Skeleton/SkeletonScreenDashoard';
import {Colors} from '../utils/Constants';
import {axiosGet} from '../utils/api';
import {ROUTES} from '../utils/Routes';
import useDoubleBackToExit from '../utils/useDoubleBackToExit';
import FarmerDrawerScreenWrapper1 from './FarmerDrawerScreenWrapper1';
import useCollapsibleHeader from '../utils/useCollapsibleHeader';
import {getDashboardItems} from '../utils/dashboardItems';
import {useRoute} from '@react-navigation/native';
import ForegroundLocationService from '../BackgroundService/ForegroundLocationService';
// const HEADER_HEIGHT = 60;
const Dashboard = ({navigation}) => {
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
    loginUser_data,
    startWatchingLocation,
    stopWatchingLocation,
  } = useContext(userCreateContext);
  const [refreshing, setRefreshing] = useState(false);
  const route = useRoute();
  const {
    headerTranslateY,
    filterTranslateY,
    imageHeight,
    imageOpacity,
    handleScroll,
    INITIAL_IMAGE_HEIGHT,
    HEADER_HEIGHT,
  } = useCollapsibleHeader(refreshing);
  const [uiState, setUiState] = useState({
    bottomBanner: null,
    userName: null,
    profileImg: null,
    company_website: '',
    logoImg: logoImage || null,
    topBannerImg: topBanner || null,
    defaultLand: false,
    convertionLUState: false,
    plotStatus: [],
    usefulInfoList: [],
    activitySchedule: [],
  });

  const [isLoading, setIsLoading] = useState({
    initial: true,
    slowData: false,
  });
  const navigateToPages = useCallback(
    pageName => {
      navigation.navigate(pageName);
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

  const onPageLoad = useCallback(async () => {
    if (!loginUser_data) return;

    try {
      const {dbname, lan_id, token, agri_user_addresses, user_id} =
        loginUser_data || {};
      let plotStatus = [];
      let convertionLUState = false;
      let defaultLand = false;
      setIsLoading(prev => ({...prev, initial: true}));
      const results = await Promise.allSettled([
        getItem('bottomBannerData'),
        getItem('userNameData'),
        getItem('profileImgData'),
        getItem('company_website'),
        getItem('logoImageData'),
        getItem('topBannerData'),

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
            state_id: agri_user_addresses[0]?.agri_state?.fid,
            district_id: agri_user_addresses[0]?.agri_district?.fid,
            subdiv_id: agri_user_addresses[0]?.agri_subdivision?.fid,
          }),
          '',
          {information: `${dbname},${lan_id}`},
        ),

        axiosGet(
          ROUTES.GET.Fenced_Rejected_Plot_List({
            page: 1,
            status_level: 'REJECTED',
            geo_type: '',
            searchBy: '',
            supervisor_id: user_id,
          }),
          token,
          {information: `${dbname},${lan_id},${user_id}`},
        ),
      ]);

      // ---------- PROCESS FAST RESULTS ----------

      const bottomBannerData =
        results[0].status === 'fulfilled' ? results[0].value : null;

      const userNameData =
        results[1].status === 'fulfilled' ? results[1].value : null;

      const profileImgData =
        results[2].status === 'fulfilled' ? results[2].value : null;

      const company_website =
        results[3].status === 'fulfilled' ? results[3].value : '';

      const logoImageData =
        results[4].status === 'fulfilled' ? results[4].value : null;

      const topBannerData =
        results[5].status === 'fulfilled' ? results[5].value : null;

      // UNIT CONVERSION
      const UnitConversonToDefault_res =
        results[6].status === 'fulfilled' ? results[6].value : null;

      if (UnitConversonToDefault_res?.status === 200) {
        const rows = UnitConversonToDefault_res.data?.data?.rows || [];
        convertionLUState = rows.some(r => !r.defined_unit_value);
      }

      // LAND UNIT
      const LandUnitArea_res =
        results[7].status === 'fulfilled' ? results[7].value : null;

      if (LandUnitArea_res?.status === 200) {
        const rows = LandUnitArea_res.data?.data?.rows || [];
        defaultLand = rows.some(r => r.defined_unit_value?.length > 0);
      }

      // USEFUL INFO
      const FARMER_USEFULL_INFO_LIST =
        results[8].status === 'fulfilled' ? results[8].value : null;

      let usefulInfoList = [];

      if (FARMER_USEFULL_INFO_LIST?.status === 200) {
        usefulInfoList = FARMER_USEFULL_INFO_LIST.data?.rows || [];
      }

      // PLOT STATUS
      const PLOT_STATUS =
        results[9].status === 'fulfilled' ? results[9].value : null;

      if (PLOT_STATUS?.status === 200) {
        plotStatus = PLOT_STATUS.data?.data?.rows || [];
      }

      // ✅ UPDATE UI FAST
      setUiState(prev => ({
        ...prev,
        bottomBanner: bottomBannerData,
        userName: userNameData,
        profileImg: profileImgData,
        company_website: company_website || prev.company_website,
        logoImg: logoImage || logoImageData || null,
        topBannerImg: topBanner || topBannerData || null,
        defaultLand,
        convertionLUState,
        plotStatus,
        usefulInfoList,
        activitySchedule: [], // slow data later
      }));
      setIsLoading(prev => ({...prev, initial: false}));
      loadSlowApis({dbname, lan_id, token, user_id});
    } catch (error) {
      setIsLoading(prev => ({...prev, initial: false}));
      Toast?.show({
        text:
          error?.response?.data?.error?.errorMessage || 'Something went wrong',
        ...AlertMesg?.[0],
      });
    }
  }, [loginUser_data]);
  const loadSlowApis = async ({dbname, lan_id, token, user_id}) => {
    try {
      setIsLoading(prev => ({...prev, slowData: true}));

      const [carbonRes, userRes] = await Promise.allSettled([
        axiosGet(
          ROUTES.GET.ALL_ACTIVITY_SCHEDULE({
            supervisor_id: user_id,
            type: 'carbon_activity',
          }),
          token,
          {information: `${dbname},${lan_id},${user_id}`},
        ),
        axiosGet(
          ROUTES.GET.ALL_ACTIVITY_SCHEDULE({
            supervisor_id: user_id,
            type: 'user_activity',
          }),
          token,
          {information: `${dbname},${lan_id},${user_id}`},
        ),
      ]);

      const carbonActivities =
        carbonRes.status === 'fulfilled'
          ? carbonRes.value?.data?.data?.data ||
            carbonRes.value?.data?.data ||
            []
          : [];

      const userActivities =
        userRes.status === 'fulfilled'
          ? userRes.value?.data?.data?.data || userRes.value?.data?.data || []
          : [];

      // ✅ CHECK IF CARBON HAS DATA
      let hasCarbonActivity = carbonActivities.some(
        item =>
          (item?.upcomingActivities?.length || 0) > 0 ||
          (item?.overdueActivities?.length || 0) > 0,
      );

      let finalActivity = [];

      if (hasCarbonActivity) {
        finalActivity = carbonActivities;
      } else if (userActivities.length > 0) {
        finalActivity = userActivities;
      }

      setUiState(prev => ({
        ...prev,
        activitySchedule: finalActivity,
      }));

      setIsLoading(prev => ({...prev, slowData: false}));
    } catch (error) {
      setIsLoading(prev => ({...prev, slowData: false}));
      Toast?.show({
        text:
          error?.response?.data?.error?.errorMessage || 'Something went wrong',
        ...AlertMesg?.[0],
      });
    }
  };
  useEffect(() => {
    if (route?.params?.action === 'plotStatusUpdated') {
      onPageLoad();
    }
  }, [route?.params]);
  useEffect(() => {
    onPageLoad();
    const task = InteractionManager.runAfterInteractions(() => {
      startWatchingLocation();
    });
    return () => {
      task.cancel();
      stopWatchingLocation();
    };
  }, []);
  const exit = useCallback(() => {
    Alert.alert(
      `${t('app_name')}`,
      `${t('close_app')}`,
      [
        {text: `${t('cancle')}`, onPress: () => {}, style: 'cancel'},
        {text: `${t('ok')}`, onPress: () => BackHandler.exitApp()},
      ],
      {cancelable: false},
    );
    return true;
  }, [t]);
  const CompanyWebsiteOpen = useCallback(() => {
    if (
      uiState.company_website &&
      uiState.company_website !== '' &&
      uiState.company_website != 'https://null' &&
      uiState.company_website != 'null'
    ) {
      Linking.openURL(uiState.company_website).catch(() => {
        Alert.alert('Cannot open website');
      });
    } else {
      Alert.alert('Company website not found');
    }
  }, [uiState.company_website]);

  // memoized header content so FlatList doesn't recreate on each render
  const headerContent = useMemo(
    () => (
      <>
        <ForegroundLocationService />
        <UpcomingActivities
          t={t}
          isLoading={isLoading.slowData}
          uiState={uiState}
          loginUserData={loginUser_data}
          dashboardType="Supervisor"
          activitySchedule={uiState.activitySchedule}
        />
        <TrackingInfromation
          plotStatus={uiState.plotStatus}
          t={t}
          isLoading={isLoading.slowData}
          usefulInfoList={uiState.usefulInfoList}
          navigation={navigation}
          trackingNavigationPath="Market"
          informationNavigationPath="UsefulInformationList"
          leftButtonText={t('plot_status')}
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
                source={{uri: uiState.bottomBanner}}
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
      uiState.plotStatus,
      uiState.usefulInfoList,
      uiState.activitySchedule,
      isLoading.slowData,

      t,
      CompanyWebsiteOpen,
    ],
  );
  const dashBoardItemList = useMemo(
    () => getDashboardItems(t, navigateToPages),
    [t, navigateToPages],
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
        {isLoading.initial ? (
          <SkeletonScreenDashoard />
        ) : (
          <>
            <Animated.View
              style={[
                styles.header,
                {transform: [{translateY: headerTranslateY}]},
              ]}>
              {renderCustomHeader}
            </Animated.View>

            <Animated.View
              style={[
                styles.filterBar,
                {transform: [{translateY: filterTranslateY}]},
              ]}>
              <Animated.View
                style={[styles.animatedHeaderImage, {height: imageHeight}]}>
                <ImageBackground
                  source={{
                    uri: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&h=400&fit=crop',
                  }}
                  // source={{ uri: uiState.topBannerImg || 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&h=400&fit=crop' }}
                  resizeMode="cover"
                  style={styles.imageBackground}
                  imageStyle={{opacity: 0.6}}>
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

            <View style={{flex: 1, overflow: 'hidden'}}>
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
  container: {flex: 1, backgroundColor: Colors.background},
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
    shadowOffset: {width: 0, height: 2},
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
  imageBackground: {flex: 1, width: '100%', justifyContent: 'flex-end'},
  overlay: {...StyleSheet.absoluteFillObject},
  bottomContent: {
    paddingBottom: 10,
    paddingTop: 15,
    alignItems: 'center',
    zIndex: 999,
  },
  bottomContainer: {},
});
export default React.memo(Dashboard);
