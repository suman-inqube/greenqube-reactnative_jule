import React, { useRef, useEffect, useState, useContext, useCallback, useMemo } from 'react';
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
  Linking,InteractionManager 
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

const HEADER_HEIGHT = 60;
const STICKY_TOP_OFFSET = Platform.OS === 'android' ? StatusBar.currentHeight || 10 : 10;
const INITIAL_IMAGE_HEIGHT = 160;
const COLLAPSED_IMAGE_HEIGHT = 135;
const ITEM_WIDTH = 105;
const SPACING = 5;
const VISIBLE_ITEMS = 3;

const Dashboard = ({ navigation }) => {
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
  } = useContext(userCreateContext);

  // Batch UI-related small states into one object to reduce setState calls
  const [uiState, setUiState] = useState({
    bottomBanner: null,
    userName: null,
    profileImg: null,
    company_website: "",
    logoImg: logoImage || null,
    topBannerImg: topBanner || null,
    defaultLand: false,
    convertionLUState: false,
  });

  // Batch data coming from server into one object
  const [dataState, setDataState] = useState({
    latestActivities: [],
    usefulInfoList: [],
  });

  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Animation refs
  const headerTranslateY = useRef(new Animated.Value(0)).current;
  const filterTranslateY = useRef(new Animated.Value(0)).current;
  const imageHeight = useRef(new Animated.Value(INITIAL_IMAGE_HEIGHT)).current;
  const imageOpacity = useRef(new Animated.Value(1)).current;
  const currentOffset = useRef(0);
  const isHeaderVisible = useRef(true);
  const itemFullWidth = ITEM_WIDTH + SPACING;

  // navigateToPages memoized
  const navigateToPages = useCallback((pageName) => {
    if (isOnline) {
      if (pageName === "PersonalInformation") {
        if (uiState.convertionLUState === false) {
          navigation.navigate(pageName, { data: 'remove' });
        } else {
          Toast?.show({
            text: 'Please add the unit equivalent factor to default unit',
            ...AlertMesg?.[0],
          });
        }
      } else {
        navigation.navigate(pageName, { data: 'remove' });
      }
    } else {
      if (pageName === "ProblemList" || pageName === "activityList" || pageName === "PersonalInformation") {
        navigation.navigate(pageName, { data: 'remove' });
      }
    }
  }, [isOnline, navigation, uiState.convertionLUState, Toast, AlertMesg]);

  // Batched onPageLoad: fetch everything, then set state once
  const onPageLoad = useCallback(async (type) => {
    if (type != "refreshing") {
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
      ]);

      // keep all computations in local vars first
      const logoImgToSet = logoImage || logoImageData || null;
      const topBannerToSet = topBanner || topBannerData || null;

      let latestActivities = [];
      let usefulInfoList = [];
      let convertionLUState = false;
      let defaultLand = false;

      const login = loginUser_data || {};
      const { dbname, lan_id, token, agri_user_addresses, user_id } = login;

      if (dbname && lan_id && token && agri_user_addresses?.length > 0) {
        // parallel server requests
        const [UnitConversonToDefault_res, LandUnitArea_res, FARMER_USEFULL_INFO_LIST, LIST_USER_ACTIVITY] = await Promise.all([
          UnitConversonToDefault(dbname, lan_id, token),
          LandUnitArea(dbname, lan_id, token),
          axiosGet(ROUTES.GET.FARMER_USEFULL_INFO_LIST({
            userId: user_id,
            userType: 'farmer',
            post: 'general_info',
            state_id: agri_user_addresses[0].agri_state.fid,
            district_id: agri_user_addresses[0].agri_district.fid,
            subdiv_id: agri_user_addresses[0].agri_subdivision.fid,
            newCropId: "",
          }), '', { information: `${dbname},${lan_id}` }),
          axiosGet(ROUTES.GET.LIST_USER_ACTIVITY({
            pageNO: 1,
            carbonType: '',
            userID: '',
            searchItem: '',
            from_date: '',
            to_date: '',
          }), token, { information: `${dbname},${lan_id},${user_id}` }),
        ]);

        // compute convertionLUState locally
        let missingCount = 0;
        if (UnitConversonToDefault_res?.status === 200) {
          const rows = UnitConversonToDefault_res.data?.data?.rows || [];
          for (let r of rows) {
            if (r.defined_unit_value == null || r.defined_unit_value === '') missingCount++;
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
          usefulInfoList = FARMER_USEFULL_INFO_LIST.data?.data?.rows || [];
        }
        if (LIST_USER_ACTIVITY?.status === 200) {
          latestActivities = LIST_USER_ACTIVITY.data?.data?.rows || [];
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
        latestActivities,
        usefulInfoList,
      });

      setIsLoading(false);
    } catch (error) {
      // don't spam console in production; keep minimal
      console.warn('onPageLoad error', error);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      onPageLoad();
    });
    return () => task.cancel(); // cleanup
  }, []);
  const exit = useCallback(() => {
    Alert.alert(`${t('app_name')}`, `${t('close_app')}`,
      [
        { text: `${t('cancle')}`, onPress: () => { }, style: 'cancel' },
        { text: `${t('ok')}`, onPress: () => BackHandler.exitApp() }
      ],
      { cancelable: false });
    return true;
  }, [t]);

  const CompanyWebsiteOpen = useCallback(() => {
    if (uiState.company_website && uiState.company_website !== "") {
      Linking.openURL(uiState.company_website).catch(() => {
        Alert.alert("Cannot open website");
      });
    } else {
      Alert.alert("Company website not found");
    }
  }, [uiState.company_website]);

  // handleScroll: skip heavy animation/update while refreshing to avoid stutter
  const handleScroll = useCallback(({ nativeEvent }) => {
    if (refreshing) return; // avoid heavy animation during refresh

    const offsetY = nativeEvent.contentOffset.y;
    const diff = offsetY - currentOffset.current;
    const velocity = Math.abs(diff);
    const animationDuration = Math.max(150, Math.min(400, 300 - velocity * 2));

    if (offsetY <= 0) {
      Animated.parallel([
        Animated.timing(headerTranslateY, { toValue: 0, duration: animationDuration, useNativeDriver: true }),
        Animated.timing(filterTranslateY, { toValue: 0, duration: animationDuration, useNativeDriver: true }),
        Animated.timing(imageHeight, { toValue: INITIAL_IMAGE_HEIGHT, duration: animationDuration, useNativeDriver: false }),
        Animated.timing(imageOpacity, { toValue: 1, duration: animationDuration, useNativeDriver: false }),
      ]).start(() => {
        isHeaderVisible.current = true;
      });
      StatusBar.setBackgroundColor('#003c04', true);
      currentOffset.current = offsetY;
      return;
    }

    const scrollProgress = Math.min(offsetY / 200, 1);
    const newHeight = INITIAL_IMAGE_HEIGHT - (INITIAL_IMAGE_HEIGHT - COLLAPSED_IMAGE_HEIGHT) * scrollProgress;
    const newOpacity = 1 - scrollProgress * 0.3;

    // update image values without starting many animations (value changes)
    imageHeight.setValue(newHeight);
    imageOpacity.setValue(newOpacity);

    const isScrollingDown = diff > 8;
    const isScrollingUp = diff < -8;

    if (isScrollingDown && isHeaderVisible.current && offsetY > 50) {
      Animated.parallel([
        Animated.timing(headerTranslateY, { toValue: -HEADER_HEIGHT, duration: animationDuration, useNativeDriver: true }),
        Animated.timing(filterTranslateY, { toValue: -HEADER_HEIGHT + STICKY_TOP_OFFSET - 40, duration: animationDuration, useNativeDriver: true }),
      ]).start(() => { isHeaderVisible.current = false; });
      StatusBar.setBackgroundColor('#003c04', true);
      StatusBar.setBarStyle('light-content', true);
    } else if (isScrollingUp && !isHeaderVisible.current) {
      Animated.parallel([
        Animated.timing(headerTranslateY, { toValue: 0, duration: animationDuration, useNativeDriver: true }),
        Animated.timing(filterTranslateY, { toValue: 0, duration: animationDuration, useNativeDriver: true }),
      ]).start(() => { isHeaderVisible.current = true; });
      StatusBar.setBackgroundColor('#003c04', true);
    }

    currentOffset.current = offsetY;
  }, [refreshing, headerTranslateY, filterTranslateY, imageHeight, imageOpacity]);

  // onRefresh: keep UI responsive — start refresh indicator immediately
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    requestAnimationFrame(async () => {
      await onPageLoad("refreshing");
      setRefreshing(false)
    });
  }, []);

  // memoized header content so FlatList doesn't recreate on each render
  const headerContent = useMemo(() => (
    <>
      <UpcomingActivities t={t} profileImg={uiState.profileImg} />
      <TrackingInfromation
        latestActivities={dataState.latestActivities}
        t={t}
        usefulInfoList={dataState.usefulInfoList}
      />
      <View style={{
        flex: 1,
        backgroundColor: Colors.useGreen,
        margin: '4%',
        borderRadius: 12,
        overflow: 'hidden'
      }}>
        {uiState.bottomBanner ? (
          <TouchableOpacity onPress={CompanyWebsiteOpen} style={styles.bottomContainer}>
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
  ), [uiState.bottomBanner, uiState.profileImg, dataState.latestActivities, dataState.usefulInfoList, t, CompanyWebsiteOpen]);

  const dashBoardItemList = useMemo(() => ([
    { text: t('register_nfarmer'), imageurl: require('../Common/images/register_farmer.png'), onpress: () => navigateToPages('PersonalInformation') },
    { text: t('farmer_list'), imageurl: require('../Common/images/farmer_list.png'), onpress: () => navigateToPages('userList') },
    { text: t('crop_prob_far_dash'), imageurl: require('../Common/images/raise_problem_only.png'), onpress: () => navigateToPages('ProblemList') },
    { text: t('acti_report_far_dash'), imageurl: require('../Common/images/activity_report_only.png'), onpress: () => navigateToPages('activityList') },
    { text: t('agri_inputs_ninquiry_far_dash'), imageurl: require('../Common/images/input_inqu_only.png'), onpress: () => navigateToPages('InputList') },
    { text: t('agri_output_far_dash'), imageurl: require('../Common/images/dash_sale_your_product.png'), onpress: () => navigateToPages('OutPutList') },
    { text: t('market_information'), imageurl: require('../Common/images/market_information_only.png'), onpress: () => navigateToPages('ListProblem') },
    { text: t('useful_ninformation_dash'), imageurl: require('../Common/images/dash_useful_information.png'), onpress: () => navigateToPages('UsefulInformationList') }
  ]), [t, navigateToPages]);

  const LOOP_ITEMS = useMemo(() => [...dashBoardItemList, ...dashBoardItemList, ...dashBoardItemList], [dashBoardItemList]);

  return (
    <SafeAreaView style={styles.container}>
      {isLoading ? <SkeletonScreenDashoard /> : (
        <>
          <StatusBar barStyle="light-content" backgroundColor={'#003c04'} />
          <Animated.View style={[styles.header, { transform: [{ translateY: headerTranslateY }] }]}>
            <CustomHeader path="exit" HandlerGoBack={exit} logoImage={uiState.logoImg} />
          </Animated.View>

          <Animated.View style={[styles.filterBar, { transform: [{ translateY: filterTranslateY }] }]}>
            <Animated.View style={[styles.animatedHeaderImage, { height: imageHeight }]}>
              <ImageBackground
                source={{ uri: uiState.topBannerImg || 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&h=400&fit=crop' }}
                resizeMode="cover"
                style={styles.imageBackground}
                imageStyle={{ opacity: 0.8 }}
              >
                <View style={styles.overlay} />
                <View style={styles.bottomContent}>
                  <CarouselSlider
                    items={LOOP_ITEMS}
                    itemWidth={ITEM_WIDTH}
                    itemFullWidth={itemFullWidth}
                    visibleItems={VISIBLE_ITEMS}
                    spacing={14}
                    onPress={_data => _data.onpress()}
                    scrollSpeed={2500}
                  />
                </View>
                <View style={{ backgroundColor: Colors.background_light, height: 20, position: 'relative', bottom: -0, borderTopRightRadius: 28, borderTopLeftRadius: 28 }} />
              </ImageBackground>
            </Animated.View>
          </Animated.View>

          <View style={{ flex: 1 }}>
            <FlatList
              nestedScrollEnabled={true}
              contentContainerStyle={{
                paddingTop: HEADER_HEIGHT + INITIAL_IMAGE_HEIGHT,
                flexGrow: 1, // ensure pull works even when content small
              }}
              scrollEventThrottle={16}
              showsVerticalScrollIndicator={false}
              onScroll={handleScroll}
              data={[]} // everything in header
              keyExtractor={(item, index) => index.toString()}
              alwaysBounceVertical={true}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={['#003c04']}
                  tintColor={'#003c04'}
                  // progressViewOffset={50} // push down if header exists
                  progressViewOffset={Platform.OS === 'android' ? HEADER_HEIGHT + 200 : 100}
                />
              }
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
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background_light },
  header: {
    height: HEADER_HEIGHT - 10,
    position: 'absolute',
    top: 0, left: 0, right: 0,
    zIndex: 10,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    elevation: 6,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84,
  },
  filterBar: { position: 'absolute', top: HEADER_HEIGHT, left: 0, right: 0, zIndex: 9, elevation: 5 },
  animatedHeaderImage: { width: '100%', overflow: 'hidden', backgroundColor: '#003c04' },
  imageBackground: { flex: 1, width: '100%', justifyContent: 'flex-end' },
  overlay: { ...StyleSheet.absoluteFillObject },
  bottomContent: { paddingBottom: 15, paddingTop: 15, alignItems: 'center' },
  bottomContainer: {},
});

export default Dashboard;
