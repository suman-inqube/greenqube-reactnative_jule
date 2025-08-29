import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Image,
  Animated,
  Dimensions,
  Modal,
} from 'react-native';
import React, {useEffect, useState, useRef, useContext} from 'react';
const {width} = Dimensions.get('window');
import CollapsibleCard from '../../Common/CollapsibleCard';
import {useRoute, useNavigation} from '@react-navigation/native';
import {
  plotListApproval,
  LandUnitArea,
  LandUnitsquare_metre,
} from '../../../config/apiHere';
const qs = require('qs');
import FarmerLiveHood from './FarmerLiveHood';
//GQR-65
import {userCreateContext} from '../../Context/usersCreateContext';
import {AlertMesg} from '../../Common/ToastAlert';
import FarmerDrawerScreenWrapper1 from '../FarmerDrawerScreenWrapper1';
import PlotStatusSkeletonScreen from '../../Components/Skeleton/PlotStatusSkeleton';
import {Colors} from '../../utils/Constants';

const PlotListFarmer = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [activeTab, setActiveTab] = useState(0);
  const [dataProps, setDataProps] = useState({});
  const [plotList, setplotList] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const scrollRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [landAreaUnit, setLandAreaUnit] = useState([]);
  const [landUnitsquareMetre, setLandUnitsquareMetre] = useState([]);
  const [addPlot, setAddPlot] = useState(false);
  const animatedValue = useRef(new Animated.Value(0)).current;
  const onTabPress = (index, data) => {
    setActiveTab(index);
    if (data) {
      setDataProps(data);
    } else {
      setDataProps({});
    }
    scrollRef.current?.scrollTo({x: Number(index) * width, animated: true});
  };

  const onScroll = Animated.event(
    [{nativeEvent: {contentOffset: {x: animatedValue}}}],
    {useNativeDriver: false},
  );

  const indicatorPosition = animatedValue.interpolate({
    inputRange: [0, width],
    outputRange: [0, width / 2], // Moves indicator with swipe
  });
  const {
    loginUser_data,
    t,
    AlertMesg,
    onBackPress,
    getItem,
    logoImage,
    topBanner,
    Root,
    Toast,
    LoadingScreen,
    DatePickerComp,
    FormsTitle,
    CustomHeader,
    ButtonFormBottom,
    InputTextForm,
    DropdownForm,
    effective_dates,
  } = useContext(userCreateContext);
  const {dbname, lan_id, token, user_id} = loginUser_data;
  //GQR-65
  const HandlerGoBack = () => navigation.navigate('FarmerDashboard');
  const handleBackPress = () => {
    if (activeTab == 1) {
      setActiveTab(0);
      onTabPress(0);
      return true;
    }
    navigation.navigate('FarmerDashboard');
    return true;
  };
  useEffect(() => {
    if (activeTab == 0) {
      onPageLoad();
    }
    onBackPress(handleBackPress);
  }, [activeTab]);
  const onPageLoad = async () => {
    try {
      setIsLoading(true);
      const [plotListApprovalRes, LandUnitArea_res, LandUnitsquare_metre_res] =
        await Promise.all([
          plotListApproval(dbname, lan_id, token, user_id),
          LandUnitArea(dbname, lan_id, token),
          LandUnitsquare_metre(dbname, lan_id, token),
        ]);
      if (plotListApprovalRes?.status == 200) {
        // const { data } = plotListApprovalRes?.data;
        setplotList(plotListApprovalRes?.data);
      }
      if (LandUnitArea_res?.status == 200) {
        const {count, rows} = LandUnitArea_res?.data?.data || {};
        if (count > 0) {
          setLandAreaUnit(rows);
        } else {
          setLandAreaUnit([]);
        }
      }
      if (LandUnitsquare_metre_res?.status == 200) {
        const {count, rows} = LandUnitsquare_metre_res?.data?.data || {};
        if (count > 0) {
          setLandUnitsquareMetre(rows);
        } else {
          setLandUnitsquareMetre([]);
        }
      }
      setAddPlot(false);
      setIsLoading(false);
      setDataProps({});
    } catch (error) {
      console.error(error);
    }
  };
  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      // Simulate fetching new data
      setRefreshing(false);
    }, 2000);
  };
  return (
    <FarmerDrawerScreenWrapper1>
      <>
        <Root>
          <View style={styles.container}>
            <View style={{width: '100%'}}>
              <CustomHeader path="userList" HandlerGoBack={HandlerGoBack} />
            </View>
            {/* Tab Bar */}
            <View style={styles.tabBar}>
              <TouchableOpacity
                style={styles.tab}
                onPress={() => onTabPress(0)}>
                <Text
                  style={[
                    styles.tabText,
                    activeTab === 0 && styles.activeTabText,
                  ]}>
                  Plot Status
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.tab}
                onPress={() => onTabPress(1)}>
                <Text
                  style={[
                    styles.tabText,
                    activeTab === 1 && styles.activeTabText,
                  ]}>
                  Plot Add and Edit
                </Text>
              </TouchableOpacity>

              {/* Animated Tab Indicator */}
              <Animated.View
                style={[
                  styles.indicator,
                  {transform: [{translateX: indicatorPosition}]},
                ]}
              />
            </View>

            {/* Swipeable Content */}
            <ScrollView
              ref={scrollRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={onScroll}
              onMomentumScrollEnd={event => {
                const index = Math.round(
                  event.nativeEvent.contentOffset.x / width,
                );
                setActiveTab(index);
              }}
              //basudev
              scrollEnabled={false}
              scrollEventThrottle={16}>
              {/* Tab 1 */}
              <View style={styles.page}>
                <FlatList
                  data={isLoading ? Array.from({length: 5}) : plotList}
                  keyExtractor={(item, index) =>
                    item?.id?.toString() || index.toString()
                  }
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  showsVerticalScrollIndicator={false}
                  showsHorizontalScrollIndicator={false}
                  style={{padding: 10}}
                  renderItem={({item, index}) =>
                    isLoading ? (
                      <PlotStatusSkeletonScreen />
                    ) : (
                      <TouchableOpacity
                        style={{marginBottom: 10}}
                        onPress={() => onTabPress(1, item)}>
                        <CollapsibleCard
                          width="100%"
                          header={
                            <View style={{height: 30}}>
                              <Text style={[styles.textHeader, {fontSize: 15}]}>
                                {item?.plot_no}
                              </Text>
                            </View>
                          }
                          content={
                            <>
                              <View
                                style={{
                                  backgroundColor: 'white',
                                  borderRadius: 8,
                                  marginVertical: 0,
                                  shadowColor: '#000',
                                  flexDirection: 'row',
                                }}>
                                <View>
                                  <Text style={styles.text}>Plot Name</Text>
                                  <Text style={styles.text}>
                                    Reported Land Area
                                  </Text>
                                  <Text style={styles.text}>
                                    Converted Land Area
                                  </Text>
                                  <Text style={styles.text}>Crop Name</Text>
                                  <Text style={styles.text}>Crop Variety</Text>
                                  <Text style={styles.text}>
                                    Cycle Start Date
                                  </Text>
                                  <Text style={styles.text}>
                                    Cycle End Date
                                  </Text>
                                </View>
                                <View style={{marginLeft: 10}}>
                                  <Text style={styles.text}>
                                    : {item?.plot_no}
                                  </Text>
                                  <Text style={styles.text}>
                                    : {item?.land_size} {item?.land_unit?.name}
                                  </Text>
                                  <Text style={styles.text}>
                                    :{' '}
                                    {parseFloat(
                                      item?.land_convert_size,
                                    ).toFixed(2)}{' '}
                                    {landAreaUnit?.[0]?.name}
                                  </Text>
                                  <Text style={styles.text}>
                                    : {item?.plot_crops[0]?.crop_name?.name}
                                  </Text>
                                  <Text style={styles.text}>
                                    : {item?.plot_crops[0]?.crop_variety?.name}
                                  </Text>
                                  <Text style={styles.text}>
                                    : {item?.plot_crops[0]?.sowing_date}
                                  </Text>
                                  <Text style={styles.text}>
                                    :{' '}
                                    {item?.plot_crops[0]?.harvesting_date.substring(
                                      0,
                                      10,
                                    )}
                                  </Text>
                                </View>
                              </View>
                              {item?.status_level == 'REJECTED' && (
                                <View
                                  style={{
                                    backgroundColor: '#F8D7DA',
                                    borderRadius: 5,
                                    borderColor: '#F8D7DA',
                                    elevation: 1,
                                    marginVertical: 10,
                                  }}>
                                  <Text
                                    style={{
                                      paddingHorizontal: 10,
                                      color: '#721C24',
                                      fontFamily: 'Poppins-Regular',
                                      fontSize: 14,
                                    }}>
                                    {item?.comment}
                                  </Text>
                                </View>
                              )}
                            </>
                          }
                          footer={
                            <View
                              style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                              }}>
                              <View
                                style={{
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                }}>
                                <Image
                                  source={require('../../Common/images/area-with-pins.png')}
                                  style={{
                                    width: 25,
                                    height: 25,
                                    tintColor: '#0d8320',
                                  }}
                                />
                                <Text style={styles.text}>
                                  {parseFloat(
                                    Number(
                                      landUnitsquareMetre?.[0]
                                        ?.defined_unit_value,
                                    ) * Number(item?.google_area),
                                  ).toFixed(2)}{' '}
                                  {landAreaUnit?.[0]?.name}
                                </Text>
                              </View>
                              {item.status_level == 'APPROVED' && (
                                <View
                                  style={{
                                    backgroundColor: '#D4EDDA',
                                    padding: 8,
                                    borderRadius: 5,
                                    flexDirection: 'row',
                                    justifyContent: 'space-evenly',
                                    alignItems: 'center',
                                    width: 100,
                                    height: 38,
                                  }}>
                                  <Text
                                    style={{color: '#155724', fontSize: 14}}>
                                    {item.status_level}
                                  </Text>
                                </View>
                              )}
                              {item.status_level ==
                                'CARBON_DOCUMENTS_SUBMITTED' && (
                                <View
                                  style={{
                                    backgroundColor: '#D4EDDA',
                                    padding: 8,
                                    borderRadius: 5,
                                    flexDirection: 'row',
                                    justifyContent: 'space-evenly',
                                    alignItems: 'center',
                                    width: 120,
                                    height: 38,
                                  }}>
                                  <Text
                                    style={{color: '#155724', fontSize: 14}}>
                                    SUBMITTED
                                  </Text>
                                </View>
                              )}
                              {item.status_level ==
                                'CARBON_DOCUMENTS_REJECTED' && (
                                <View
                                  style={{
                                    backgroundColor: '#F8D7DA',
                                    padding: 8,
                                    borderRadius: 5,
                                    flexDirection: 'row',
                                    justifyContent: 'space-evenly',
                                    alignItems: 'center',
                                    width: 180,
                                    borderWidth: 1,
                                    borderColor: '#F8D7DA',
                                    height: 38,
                                  }}>
                                  <Text
                                    style={{color: '#721C24', fontSize: 14}}>
                                    CARBON REJECTED
                                  </Text>
                                </View>
                              )}
                              {item.status_level ==
                                'CARBON_DOCUMENTS_APPROVED' && (
                                <View
                                  style={{
                                    backgroundColor: '#D4EDDA',
                                    padding: 8,
                                    borderRadius: 5,
                                    flexDirection: 'row',
                                    justifyContent: 'space-evenly',
                                    alignItems: 'center',
                                    width: 100,
                                    height: 38,
                                  }}>
                                  <Text
                                    style={{color: '#155724', fontSize: 14}}>
                                    VERIFIED
                                  </Text>
                                </View>
                              )}
                              {item.status_level == 'PENDING' && (
                                <View
                                  style={{
                                    backgroundColor: '#FFF3CD',
                                    padding: 8,
                                    borderRadius: 5,
                                    flexDirection: 'row',
                                    justifyContent: 'space-evenly',
                                    alignItems: 'center',
                                    width: 100,
                                    height: 38,
                                  }}>
                                  <Text
                                    style={{color: '#856404', fontSize: 14}}>
                                    {item.status_level}
                                  </Text>
                                </View>
                              )}
                              {item.status_level == 'REJECTED' && (
                                <View
                                  style={{
                                    backgroundColor: '#F8D7DA',
                                    padding: 8,
                                    borderRadius: 5,
                                    flexDirection: 'row',
                                    justifyContent: 'space-evenly',
                                    alignItems: 'center',
                                    width: 100,
                                    borderWidth: 1,
                                    borderColor: '#F8D7DA',
                                    height: 38,
                                  }}>
                                  <Text
                                    style={{color: '#721C24', fontSize: 14}}>
                                    {item.status_level}
                                  </Text>
                                </View>
                              )}
                            </View>
                          }
                        />
                      </TouchableOpacity>
                    )
                  }
                />
              </View>

              {/* Tab 2 */}
              <View style={styles.page}>
                {activeTab == 1 && (
                  <FarmerLiveHood
                    dataProps={dataProps}
                    activeTab={activeTab}
                    onTabPress={onTabPress}
                    setAddPlot={setAddPlot}
                    addPlot={addPlot}
                  />
                )}
              </View>
            </ScrollView>
            {activeTab == 0 ? (
              <TouchableOpacity
                style={[styles.locationAddMoreContainer, {bottom: 250}]}
                onPress={() => {
                  onTabPress(1);
                  setDataProps({});
                  setAddPlot(true);
                }}>
                <Text style={[styles.title, {color: '#FFF', marginRight: 20}]}>
                  {t('Add Plot')}
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </Root>
      </>
    </FarmerDrawerScreenWrapper1>
  );
};

export default PlotListFarmer;

const styles = StyleSheet.create({
  container: {flex: 1},
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    // elevation: 1,
    position: 'relative',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // elevation: 3,
    // borderWidth: 0.6,
    // borderColor: '#d0d4dc'
  },
  tab: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
    backgroundColor: '#e4e4e4ff',
  },
  tabText: {fontSize: 16, color: '#666', fontFamily: 'Poppins-SemiBold'},
  activeTabText: {fontSize: 16, color: 'green', fontFamily: 'Poppins-SemiBold'},
  indicator: {
    position: 'absolute',
    bottom: 0,
    width: width / 2, // Half of screen width (2 tabs)
    height: 3,
    backgroundColor: 'green',
  },
  page: {
    width,
    flex: 1,
    // backgroundColor: '#E9EAEC',
    backgroundColor: Colors.background_light,
    // padding: 10,
  },
  item: {
    padding: 15,
    fontSize: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  text: {
    fontSize: 14,
    color: '#000',
    fontFamily: 'Poppins-Regular',
    marginVertical: 3,
  },
  textHeader: {
    fontSize: 14,
    color: '#256c07ff',
    fontFamily: 'Poppins-SemiBold',
    marginVertical: 3,
  },

  skeletonCardWrapper: {
    // backgroundColor: 'white', // Ensure the wrapper has a background
    // padding: 15,
    // borderRadius: 8,
    // marginBottom: 10,
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.1,
    // shadowRadius: 4,
    // // elevation: 3,
    backgroundColor: '#FFF',
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 0.6,
    borderColor: '#d0d4dc',
  },
  skeletonCard: {
    flex: 1, // Ensure it fills the parent wrapper
  },
  skeletonHeader: {
    width: '60%',
    height: 20,
    borderRadius: 4,
    marginBottom: 10,
  },
  skeletonLine: {
    width: '80%',
    height: 16,
    borderRadius: 4,
    marginBottom: 6,
  },
  skeletonLineShort: {
    width: '50%',
    height: 16,
    borderRadius: 4,
  },
  passwordMainContainer: {
    flex: 1,
    alignItems: 'center',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 8,
    width: '100%',
    paddingEnd: 8,
    backgroundColor: 'white',
    height: 40,
    marginBottom: 15,
  },
  inputTextStyle: {
    flex: 1,
    height: 40,
    marginHorizontal: 10,
    borderColor: 'gray',
  },
  plotSiteUnit: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  locationContainer: {
    // backgroundColor:'#FFF',
    // borderRadius:10,
    // marginVertical:10,
    // elevation:1,
  },
  latlongContainerMain: {
    backgroundColor: '#FFF',
    elevation: 1,
    marginVertical: 7,
    borderRadius: 10,
  },
  latlongContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 5,
    padding: 3,
  },
  calenderContainer: {
    backgroundColor: '#FFF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 10,
    elevation: 1,
    height: 45,
  },
  title: {
    color: '#000',
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
  },
  locationAddMoreContainer: {
    position: 'absolute',
    bottom: 100,
    right: 0,
    backgroundColor: '#025502',
    paddingVertical: 10,
    paddingLeft: 20,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },
  clickAddMorePlots: {
    backgroundColor: '#045004',
    marginHorizontal: 35,
    paddingVertical: 15,
    marginVertical: 20,
    borderRadius: 20,
  },
  clickAddMorePlotsTitle: {
    textAlign: 'center',
    color: '#FFF',
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
  },
  LoadingScreen: {
    position: 'absolute',
    top: '52%',
    left: '45%',
    zIndex: 9999,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  idcontainer: {
    marginVertical: 10,
  },
  idItemContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  idItem: {
    padding: 10,
    width: '30%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  idImage: {
    width: 60,
    height: 60,
  },
  locationAddMoreContainer: {
    position: 'absolute',
    bottom: 100,
    right: 0,
    backgroundColor: '#025502',
    paddingVertical: 10,
    paddingLeft: 20,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },
});
