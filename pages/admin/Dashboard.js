import React, {
  useRef,
  useEffect,
  useState,
  useContext,
  useCallback,
  useMemo,
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
import { getItem } from '../../config/getDataFromStorage';

// Constants to prevent recreation
const EMPTY_ARRAY = [];
const REFRESH_COLORS = ['#003c04'];
const AD_BANNER_SOURCE = require('../Common/images/ad_banner_space.jpg');
const BACKGROUND_IMAGE_URL = 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&h=400&fit=crop';

// Static styles to prevent recreation
const FLATLIST_PERFORMANCE_PROPS = {
  removeClippedSubviews: true,
  initialNumToRender: 1,
  maxToRenderPerBatch: 2,
  windowSize: 3, // Reduced from 5
  updateCellsBatchingPeriod: 100, // Increased from 50
  getItemLayout: null,
  keyExtractor: (item, index) => index.toString(),
};

const Dashboard = ({ navigation }) => {
  useDoubleBackToExit();
  
  const {
    t,
    CustomHeader,
    logoImage,
    topBanner,
    isOnline,
    Toast,
    AlertMesg,
    coords,
  } = useContext(userCreateContext);
  
  const [refreshing, setRefreshing] = useState(false);
  const isLoadingRef = useRef(false); // Prevent multiple simultaneous loads

  const {
    headerTranslateY,
    filterTranslateY,
    imageHeight,
    imageOpacity,
    handleScroll,
    INITIAL_IMAGE_HEIGHT,
    HEADER_HEIGHT,
  } = useCollapsibleHeader(refreshing);

  // Consolidated state to reduce setState calls
  const [state, setState] = useState({
    // UI state
    bottomBanner: null,
    userName: null,
    profileImg: null,
    company_website: '',
    logoImg: logoImage || null,
    topBannerImg: topBanner || null,
    defaultLand: false,
    convertionLUState: false,
    // Data state
    latestActivities: EMPTY_ARRAY,
    usefulInfoList: EMPTY_ARRAY,
    // Loading state
    isLoading: true,
  });

  // Memoized navigation handler
  const navigateToPages = useCallback(
    (pageName) => {
      if (isOnline) {
        if (pageName === 'PersonalInformation') {
          if (state.convertionLUState === false) {
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
        // Offline allowed screens
        const offlineScreens = ['ProblemList', 'activityList', 'PersonalInformation'];
        if (offlineScreens.includes(pageName)) {
          navigation.navigate(pageName);
        }
      }
    },
    [isOnline, navigation, state.convertionLUState, Toast, AlertMesg],
  );

  // Optimized data loading with batched updates
  const onPageLoad = useCallback(async (type) => {
    if (isLoadingRef.current) return; // Prevent concurrent loads
    isLoadingRef.current = true;

    if (type !== 'refreshing') {
      setState(prev => ({ ...prev, isLoading: true }));
    }

    try {
      // Batch all storage reads
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
      ]);

      // Request permissions in parallel (don't await)
      Permission.requestMultiple([
        PERMISSIONS_TYPE.microphone,
        PERMISSIONS_TYPE.fineLocation,
        PERMISSIONS_TYPE.notifications,
      ]).catch(console.warn);

      const logoImgToSet = logoImage || logoImageData || null;
      const topBannerToSet = topBanner || topBannerData || null;

      let newState = {
        bottomBanner: bottomBannerData,
        userName: userNameData,
        profileImg: profileImgData,
        company_website: company_website || state.company_website,
        logoImg: logoImgToSet,
        topBannerImg: topBannerToSet,
        defaultLand: false,
        convertionLUState: false,
        latestActivities: EMPTY_ARRAY,
        usefulInfoList: EMPTY_ARRAY,
        isLoading: false,
      };

      const login = loginUser_data || {};
      const { dbname, lan_id, token, agri_user_addresses, user_id } = login;

      if (dbname && lan_id && token && agri_user_addresses?.length > 0) {
        // Parallel API calls
        const [
          UnitConversonToDefault_res,
          LandUnitArea_res,
          FARMER_USEFULL_INFO_LIST,
          LIST_USER_ACTIVITY,
        ] = await Promise.all([
          UnitConversonToDefault(dbname, lan_id, token),
          LandUnitArea(dbname, lan_id, token),
          axiosGet(
            ROUTES.GET.USEFULL_INFO_LIST({
              userId: user_id,
              userType: 'supervisor',
              post: 'general_info',
              titleSearch: '',
              state_id: agri_user_addresses[0].agri_state.fid,
              district_id: agri_user_addresses[0].agri_district.fid,
              subdiv_id: agri_user_addresses[0].agri_subdivision.fid,
              newCropId: '',
            }),
            '',
            { information: `${dbname},${lan_id}` },
          ),
          axiosGet(
            ROUTES.GET.LIST_USER_ACTIVITY({
              pageNO: 1,
              carbonType: '',
              userID: '',
              searchItem: '',
              from_date: '',
              to_date: '',
            }),
            token,
            { information: `${dbname},${lan_id},${user_id}` },
          ),
        ]);

        // Process unit conversion
        let missingCount = 0;
        if (UnitConversonToDefault_res?.status === 200) {
          const rows = UnitConversonToDefault_res.data?.data?.rows || EMPTY_ARRAY;
          missingCount = rows.filter(r => 
            r.defined_unit_value == null || r.defined_unit_value === ''
          ).length;
          newState.convertionLUState = missingCount > 0;
        }

        // Process land units
        if (LandUnitArea_res?.status === 200) {
          const rows = LandUnitArea_res.data?.data?.rows || EMPTY_ARRAY;
          newState.defaultLand = rows.some(r => r.defined_unit_value?.length > 0);
        }

        // Process data responses
        if (FARMER_USEFULL_INFO_LIST?.status === 200) {
          newState.usefulInfoList = FARMER_USEFULL_INFO_LIST.data?.rows || EMPTY_ARRAY;
        }
        
        if (LIST_USER_ACTIVITY?.status === 200) {
          newState.latestActivities = LIST_USER_ACTIVITY.data?.data?.rows || EMPTY_ARRAY;
        }
      }

      // Single batched state update
      setState(newState);

    } catch (error) {
      console.warn('Dashboard onPageLoad error:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    } finally {
      isLoadingRef.current = false;
    }
  }, [logoImage, topBanner, state.company_website]);

  // Initialize on mount
  useEffect(() => {
    let isMounted = true;
    const task = InteractionManager.runAfterInteractions(async () => {
      if (isMounted) {
        await onPageLoad();
      }
    });
    return () => {
      isMounted = false;
      task.cancel();
    };
  }, []);

  // Memoized handlers
  const exit = useCallback(() => {
    Alert.alert(
      t('app_name'),
      t('close_app'),
      [
        { text: t('cancle'), onPress: () => {}, style: 'cancel' },
        { text: t('ok'), onPress: () => BackHandler.exitApp() },
      ],
      { cancelable: false },
    );
    return true;
  }, [t]);

  const CompanyWebsiteOpen = useCallback(() => {
    const { company_website } = state;
    if (company_website && company_website !== '') {
      Linking.openURL(company_website).catch(() => {
        Alert.alert('Cannot open website');
      });
    } else {
      Alert.alert('Company website not found');
    }
  }, [state.company_website]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    
    // Use requestAnimationFrame for smooth refresh
    requestAnimationFrame(async () => {
      await onPageLoad('refreshing');
      setRefreshing(false);
    });
  }, [onPageLoad]);

  // Memoized dashboard items
  const dashBoardItemList = useMemo(
    () => getDashboardItems(t, navigateToPages),
    [t, navigateToPages],
  );

  // Memoized header content
  const headerContent = useMemo(() => (
    <>
      <UpcomingActivities t={t} uiState={state} />
      <TrackingInfromation
        latestActivities={state.latestActivities}
        t={t}
        usefulInfoList={state.usefulInfoList}
        navigation={navigation}
        trackingNavigationPath="activityList"
        informationNavigationPath="UsefulInformationList"
      />
      <View style={styles.bannerContainer}>
        <TouchableOpacity
          onPress={CompanyWebsiteOpen}
          style={styles.bottomContainer}>
          <ImageForm
            source={state.bottomBanner ? { uri: state.bottomBanner } : AD_BANNER_SOURCE}
            resizeMode="cover"
            height={220}
            width="100%"
          />
        </TouchableOpacity>
      </View>
    </>
  ), [
    t,
    state.bottomBanner,
    state.latestActivities,
    state.usefulInfoList,
    navigation,
    CompanyWebsiteOpen,
  ]);

  // Memoized custom header
  const renderCustomHeader = useMemo(
    () => (
      <CustomHeader
        path="exit"
        HandlerGoBack={exit}
        logoImage={state.logoImg}
        t={t}
      />
    ),
    [CustomHeader, exit, state.logoImg, t],
  );

  // Memoized FlatList content container style
  const contentContainerStyle = useMemo(
    () => ({
      paddingTop: HEADER_HEIGHT + INITIAL_IMAGE_HEIGHT,
      flexGrow: 1,
      overflow: 'hidden',
    }),
    [HEADER_HEIGHT, INITIAL_IMAGE_HEIGHT],
  );

  // Memoized refresh control
  const refreshControl = useMemo(
    () => (
      <RefreshControl
        refreshing={refreshing}
        onRefresh={onRefresh}
        colors={REFRESH_COLORS}
        tintColor={REFRESH_COLORS[0]}
        progressViewOffset={
          Platform.OS === 'android' ? HEADER_HEIGHT + 200 : 100
        }
      />
    ),
    [refreshing, onRefresh, HEADER_HEIGHT],
  );

  return (
    <FarmerDrawerScreenWrapper1>
      <SafeAreaView style={styles.container}>
        {state.isLoading ? (
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
                  source={{ uri: BACKGROUND_IMAGE_URL }}
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
                      onPress={(_data) => _data.onpress()}
                      scrollSpeed={2500}
                    />
                  </View>
                  <View style={styles.roundedTop} />
                </ImageBackground>
              </Animated.View>
            </Animated.View>

            <View style={styles.contentContainer}>
              <FlatList
                nestedScrollEnabled={true}
                contentContainerStyle={contentContainerStyle}
                scrollEventThrottle={16} // Reduced from 1 for better performance
                showsVerticalScrollIndicator={false}
                onScroll={handleScroll}
                data={EMPTY_ARRAY}
                alwaysBounceVertical={true}
                refreshControl={refreshControl}
                ListHeaderComponent={headerContent}
                {...FLATLIST_PERFORMANCE_PROPS}
              />
            </View>
          </>
        )}
      </SafeAreaView>
    </FarmerDrawerScreenWrapper1>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: Colors.background_light 
  },
  header: {
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
  },
  filterBar: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    zIndex: 9,
  },
  animatedHeaderImage: {
    width: '100%',
    overflow: 'hidden',
    backgroundColor: '#003c04',
  },
  imageBackground: { 
    flex: 1, 
    width: '100%', 
    justifyContent: 'flex-end' 
  },
  overlay: { 
    ...StyleSheet.absoluteFillObject 
  },
  bottomContent: {
    paddingBottom: 10,
    paddingTop: 15,
    alignItems: 'center',
  },
  bannerContainer: {
    flex: 1,
    backgroundColor: Colors.useGreen,
    margin: '4%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  bottomContainer: {},
  contentContainer: { 
    flex: 1, 
    overflow: 'hidden' 
  },
  roundedTop: {
    backgroundColor: Colors.background_light,
    height: 20,
    position: 'relative',
    bottom: 0,
    borderTopRightRadius: 28,
    borderTopLeftRadius: 28,
    zIndex: 9999,
  },
});

export default React.memo(Dashboard);