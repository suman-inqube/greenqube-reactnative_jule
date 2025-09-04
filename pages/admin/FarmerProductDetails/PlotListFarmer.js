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
  InteractionManager,
  BackHandler,
} from 'react-native';
import React, {useEffect, useState, useRef, useContext, useMemo} from 'react';
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
import TabBar from '../../Components/TabBar';
import FloatingActionButton from '../../Components/FloatingActionButton';
import {getActionsPlot} from '../../utils/options';
import PlotCard from '../../Components/PlotCard';
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
  const {loginUser_data, t, Root, CustomHeader, effective_dates} =
    useContext(userCreateContext);
  const {dbname, lan_id, token, user_id} = loginUser_data;
  //GQR-65
  const HandlerGoBack = () => navigation.navigate('FarmerDashboard');

  useEffect(() => {
    if (activeTab === 0) {
      const task = InteractionManager.runAfterInteractions(() => {
        onPageLoad();
      });
      return () => task.cancel();
    }
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (activeTab === 1) {
          onTabPress(0);
          return true;
        }
        return false;
      },
    );
    return () => backHandler.remove();
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
  const renderCustomHeader = useMemo(() => <CustomHeader t={t} />, []);
  return (
    <FarmerDrawerScreenWrapper1>
      <>
        <Root>
          <View style={styles.container}>
            {renderCustomHeader}
            <TabBar
              tabs={['Plot Status', 'Plot Add and Edit']}
              activeTab={activeTab}
              onTabPress={ix => onTabPress(ix)}
              indicatorColor={Colors.useGreen}
              height={65}
              backgroundColor={'#e2e2e2ff'}
              colors={Colors.primary}
            />
            {/* Swipeable Content */}
            <ScrollView
              ref={scrollRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={Animated.event(
                [{nativeEvent: {contentOffset: {x: animatedValue}}}],
                {useNativeDriver: false},
              )}
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
                      <PlotCard
                        item={item}
                        onPress={() => onTabPress(1, item)}
                        landUnitsquareMetre={landUnitsquareMetre}
                        landAreaUnit={landAreaUnit}
                      />
                    )
                  }
                />
              </View>
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
              <>
                <FloatingActionButton
                  position="right"
                  actions={getActionsPlot(t, styles, Colors)}
                  color={Colors.useGreen}
                  onPressItem={() => onTabPress(1, {}) || setAddPlot(true)}
                  overlayColor="rgba(22, 17, 17, 0.35)"
                  distanceToEdge={{vertical: 80, horizontal: 25}}
                />
              </>
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
