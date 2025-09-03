import React, {
  useEffect,
  useState,
  useContext,
  useRef,
  useMemo,
  useCallback,
} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
  BackHandler,
  FlatList,
  InteractionManager,
  SafeAreaView,
  Animated,
  RefreshControl,
} from 'react-native';
import ImageForm from '../Common/ImageForm';
import ImagePlaceHolderCircleWithoutAddButton from '../Common/ImagePlaceHolderCircleWithoutAddButton';
import {Permission, PERMISSIONS_TYPE} from '../AppPermission/AppPermission';
import {userCreateContext} from '../Context/usersCreateContext';
import {addModuleForView} from '../../config/apiHere';
import FarmerDrawerScreenWrapper1 from './FarmerDrawerScreenWrapper1';
import {ImageBackground} from 'react-native';
import {Colors, Fonts} from '../utils/Constants';
import {axiosGet} from '../utils/api';
import {ROUTES} from '../utils/Routes';
import CarouselSlider from '../Components/CarouselSlider';
import {getDashboardFarmerItems} from '../utils/dashboardItems';
import useCollapsibleHeader from '../utils/useCollapsibleHeader';
import SkeletonScreenDashoard from '../Components/Skeleton/SkeletonScreenDashoard';
import UpcomingActivities from '../Components/UpcomingActivities';
import TrackingInfromation from '../Components/TrackingInfromation';
// import DeviceInfo from 'react-native-device-info';
const HEADER_HEIGHT = 60;
const FarmerDashboard = ({navigation}) => {
  //GQR-65
  const {
    getItem,
    t,
    CustomHeader,
    DeviceInfo,
    logoImage,
    topBanner,
    loginUser_data,
    setItem,
  } = useContext(userCreateContext) || {};
  const {dbname, lan_id, token, user_id, agri_user_addresses} =
    loginUser_data || {};

  const [refreshing, setRefreshing] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const {
    headerTranslateY,
    filterTranslateY,
    imageHeight,
    imageOpacity,
    handleScroll,
    INITIAL_IMAGE_HEIGHT,
    HEADER_HEIGHT,
  } = useCollapsibleHeader(refreshing);
  //GQR-65
  const {netConnection} = DeviceInfo();
  const [latLong, setLatLong] = useState({
    latitude: '',
    longitude: '',
  });
  const [company_website, setcompany_website] = useState('');
  const navigateToPages = pageName => {
    // console.log(pageName);
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
          case 'FarmerViewPast':
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
    setIsLoading(true);
    try {
      const [
        userNameData,
        profileImgData,
        bottomBannerData,
        loginUser_data,
        company_website,
        logoImageData,
        topBannerData,
      ] = await Promise.all([
        getItem('userNameData'),
        getItem('profileImgData'),
        getItem('bottomBannerData'),
        // getItem('topBannerData'),
        getItem('loginUser_data'),
        getItem('company_website'),

        getItem('logoImageData'),
        getItem('topBannerData'),
        Permission.requestMultiple([
          PERMISSIONS_TYPE.microphone,
          PERMISSIONS_TYPE.fineLocation,
        ]),
      ]);

      const {dbname, lan_id, token, agri_user_addresses, user_id} =
        loginUser_data || {};
      const [USER_ACTIVITY, FARMER_USEFULL_INFO_LIST] = await Promise.all([
        axiosGet(
          ROUTES.GET.USER_ACTIVITY({
            pageNO: 1,
            carbonType: '',
            userID: user_id,
            searchItem: '',
            from_date: '',
            to_date: '',
          }),
          token,
          {information: `${dbname},${lan_id},${user_id}`},
        ),
        axiosGet(
          ROUTES.GET.FARMER_USEFULL_INFO_LIST({
            userId: user_id,
            userType: 'farmer',
            post: 'general_info',
            state_id: agri_user_addresses[0].agri_state.fid,
            district_id: agri_user_addresses[0].agri_district.fid,
            subdiv_id: agri_user_addresses[0].agri_subdivision.fid,
            newCropId: '',
          }),
          '',
          {information: `${dbname},${lan_id}`},
        ),
      ]);
      const logoImgToSet = logoImage || logoImageData || null;
      const topBannerToSet = topBanner || topBannerData || null;
      setUiState(prev => ({
        ...prev,
        bottomBanner: bottomBannerData,
        userName: userNameData,
        profileImg: profileImgData,
        company_website: company_website || prev.company_website,
        logoImg: logoImgToSet,
        topBannerImg: topBannerToSet,
      }));
      let latestActivities = [];
      let usefulInfoList = [];
      if (FARMER_USEFULL_INFO_LIST?.status === 200) {
        usefulInfoList = FARMER_USEFULL_INFO_LIST.data?.data?.rows || [];
      }
      if (USER_ACTIVITY?.status === 200) {
        latestActivities = USER_ACTIVITY.data?.data?.rows || [];
      }
      setDataState({
        latestActivities,
        usefulInfoList,
      });
    } catch (error) {
      console.error('aaaa', error);
    }
    setIsLoading(false);
  };
  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      onPageLoad();
    });
    return () => task.cancel(); // cleanup
  }, []);

  const HandlerGoBack = () => exit();
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

  const handleInfoPress = itemId => {
    navigation.navigate('FarmerActivityDetail', itemId);
  };

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
  const [dataState, setDataState] = useState({
    latestActivities: [],
    usefulInfoList: [],
  });
  const dashBoardItemList = useMemo(
    () => getDashboardFarmerItems(t, navigateToPages),
    [t, navigateToPages],
  );
  const LOOP_ITEMS = useMemo(
    () => [...dashBoardItemList, ...dashBoardItemList, ...dashBoardItemList],
    [dashBoardItemList],
  );

  const headerContent = useMemo(
    () => (
      <>
        <UpcomingActivities t={t} uiState={uiState} />
        <TrackingInfromation
          latestActivities={dataState.latestActivities}
          t={t}
          usefulInfoList={dataState.usefulInfoList}
          navigation={navigation}
          activity_path={'FarmerActivityDetail'}
          information_path={'FarmerUsefulInformation'}
          trackingNavigationPath="FarmerActivityList"
          informationNavigationPath="FarmerUsefulInformationList"
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
    // [
    //   uiState.bottomBanner,
    //   uiState.profileImg,
    //   dataState.latestActivities,
    //   dataState.usefulInfoList,
    //   t,
    //   CompanyWebsiteOpen,
    // ],
  );
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    requestAnimationFrame(async () => {
      // await onPageLoad("refreshing");
      await onPageLoad();
      setRefreshing(false);
    });
  }, []);
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
                {transform: [{translateY: headerTranslateY}]},
              ]}>
              <CustomHeader
                path="exit"
                HandlerGoBack={exit}
                logoImage={uiState.logoImg}
                t={t}
              />
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
                  imageStyle={{opacity: 0.8}}>
                  <View style={styles.overlay} />
                  <View style={styles.bottomContent}>
                    <CarouselSlider
                      items={LOOP_ITEMS}
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
                    }}
                  />
                </ImageBackground>
              </Animated.View>
            </Animated.View>

            <View style={{flex: 1}}>
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
  container: {flex: 1, backgroundColor: Colors.background_light},
  header: {
    height: HEADER_HEIGHT - 10,
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
  },
  filterBar: {
    position: 'absolute',
    top: HEADER_HEIGHT,
    left: 0,
    right: 0,
    zIndex: 9,
    elevation: 5,
  },
  animatedHeaderImage: {
    width: '100%',
    overflow: 'hidden',
    backgroundColor: '#003c04',
  },
  imageBackground: {flex: 1, width: '100%', justifyContent: 'flex-end'},
  overlay: {...StyleSheet.absoluteFillObject},
  bottomContent: {paddingBottom: 15, paddingTop: 15, alignItems: 'center'},
  bottomContainer: {},
});
export default FarmerDashboard;
