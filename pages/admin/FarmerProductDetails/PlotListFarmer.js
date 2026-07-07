import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ScrollView,
  Animated,
  Dimensions,
  InteractionManager,
  BackHandler,
} from 'react-native';
import React, {
  useEffect,
  useState,
  useRef,
  useContext,
  useCallback,
  memo,
  useMemo,
} from 'react';

import { useNavigation, useRoute } from '@react-navigation/native';

import { LandUnitArea, LandUnitsquare_metre } from '../../../config/apiHere';

import { userCreateContext } from '../../Context/usersCreateContext';

import PlotStatusSkeletonScreen from '../../Components/Skeleton/PlotStatusSkeleton';
import FloatingActionButton from '../../Components/FloatingActionButton';
import TabBar from '../../Components/TabBar';
import PlotCard from '../../Components/PlotCard';
import FarmerDrawerScreenWrapper1 from '../FarmerDrawerScreenWrapper1';

import { Colors } from '../../utils/Constants';
import { getActionsPlot } from '../../utils/options';

import { ROUTES } from '../../utils/Routes';
import { axiosGet } from '../../utils/api';

import FarmerLiveHood from './FarmerLiveHood';
import LoadingScreen from '../../Common/LoadingScreen';

const { width } = Dimensions.get('window');

const PlotListFarmer = () => {
  const navigation = useNavigation();
  const route = useRoute();
  // const {user_id} = route.params;

  const [activeTab, setActiveTab] = useState(0);
  const [dataProps, setDataProps] = useState({});
  const [plotList, setPlotList] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [addPlot, setAddPlot] = useState(false);
  const [historyData, setHistoryData] = useState(false);

  const [landUnitsquareMetre, setLandUnitsquareMetre] = useState([]);
  const [landAreaUnit, setLandAreaUnit] = useState([]);
  const [isLoadinglandActiveCrop, setIsLoadinglandActiveCrop] = useState(false);

  const scrollRef = useRef(null);
  const animatedValue = useRef(new Animated.Value(0)).current;

  const { loginUser_data, t, Root, CustomHeader,dbLanTokUsr } = useContext(userCreateContext);

  const { dbname, lan_id, token, user_id } = loginUser_data;

  // -----------------------------
  // HANDLE PLOT CLICK
  // -----------------------------

  const handlePlotPress = useCallback(
    payload => {
      if (payload?.source === 'HISTORY') {
        setHistoryData(true);
        // console.log('History item selected');
        // console.log(JSON.stringify(payload.data));
        onTabPress(1, payload.data);
      }

      if (payload?.source === 'CURRENT') {
        setHistoryData(false);
        // console.log('Current plot selected');
        // console.log(JSON.stringify(payload.data));
        onTabPress(1, payload.data);
      }
    },
    [onTabPress, user_id, navigation],
  );

  // -----------------------------
  // TAB CHANGE
  // -----------------------------

  const onTabPress = useCallback((index, data = {}) => {
    setActiveTab(index);
    setDataProps(data);

    scrollRef.current?.scrollTo({ x: index * width, animated: true });
  }, []);

  // -----------------------------
  // PAGE LOAD
  // -----------------------------

  const onPageLoad = useCallback(async () => {
    try {
      setIsLoading(true);

      const [plotsRes, unitAreaRes, unitSqRes] = await Promise.all([
        axiosGet(ROUTES.GET.USERLANDLIST_E({ farmer_id: user_id }), token, {
          Information: `${dbname},${lan_id}`,
        }),

        LandUnitArea(dbname, lan_id, token),

        LandUnitsquare_metre(dbname, lan_id, token),
      ]);

      if (plotsRes?.status === 200) {
        setPlotList(plotsRes?.data || []);
      }

      if (unitAreaRes?.status === 200)
        setLandAreaUnit(unitAreaRes?.data?.data?.rows || []);

      if (unitSqRes?.status === 200)
        setLandUnitsquareMetre(unitSqRes?.data?.data?.rows || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
      setAddPlot(false);
      setDataProps({});
    }
  }, [dbname, lan_id, token]);

  // -----------------------------
  // USE EFFECT
  // -----------------------------

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
        if (activeTab > 0) {
          onTabPress(0);
          return true;
        }

        return false;
      },
    );

    return () => backHandler.remove();
  }, [activeTab, onPageLoad, onTabPress]);

  // -----------------------------
  // HEADER
  // -----------------------------

  const renderCustomHeader = useMemo(
    () => (
      <CustomHeader
        t={t}
        HandlerGoBack={() => {
          if (activeTab === 1) {
            // 👉 If inside Livelihood → go back to PlotList tab
            onTabPress(0);
          } else {
            // 👉 Default → go to UserList
            navigation.goBack();
          }
        }}
      />
    ),
    [t, activeTab, onTabPress, navigation],
  );

  // -----------------------------
  // RENDER
  // -----------------------------
  const landActiveCrop = async (item, index) => {
    setIsLoadinglandActiveCrop(true);
    try {
      const res = await axiosGet(
        ROUTES.GET.LANDACTIVECROP_E({ rel_id: item.rel_id }),
        token,
        {
          Information: `${dbname},${lan_id}`,
        },
      );
      console.log('Test', res);
      if (res.status == 200) {
        console.log('crop==', JSON.stringify(res.data?.[0]));
        setIsLoadinglandActiveCrop(false);
        const {
          harvesting_date,
          crop_name: { name: cropName } = {},
          crop_variety: { name: varietyName } = {},
          sowing_date,
        } = res.data?.[0] || {};
        setPlotList(prev => {
          const copy = [...prev];
          copy[index] = {
            ...copy[index],
            plot_crops: [
              {
                crop_name: { name: cropName },
                crop_variety: { name: varietyName },
                sowing_date: sowing_date,
                harvesting_date: harvesting_date,
                // season:,
              },
            ],
          };

          return copy;
        });
      }
    } catch (error) {
      setIsLoadinglandActiveCrop(false);
      console.error('error1', error);
    } finally {
      setIsLoadinglandActiveCrop(false);
    }
  };

  const getPlotActivities = async plotId => {
    try {
      const res = await axiosGet(
        ROUTES.GET.PLOTWISE_ACTIVITY({
          plot_id: plotId,
          cropStatus: '',
        }),
        token,
        {
          Information: `${dbname},${lan_id},${loginUser_data.id}`,
        },
      );

      if (res?.status === 200) {
        navigation.navigate('FarmerActivityPlotWise', {
          activities: res?.data || [],
          // plot: item,
        });
      }
    } catch (error) {
      console.log('Activity API error:', error);
    }
  };
  return (
    <Root>
      <FarmerDrawerScreenWrapper1>
        <View style={styles.container}>
          {renderCustomHeader}

          {/* TAB BAR */}
          {activeTab === 0 && (
            <>
              <TabBar
                tabs={[t('plot_list')]}
                activeTab={activeTab}
                onTabPress={ix => onTabPress(ix)}
                indicatorColor={Colors.useGreen}
                height={65}
                backgroundColor={Colors.background}
                colors={Colors.primary}
                divideBy={1}
              />
              {isLoadinglandActiveCrop ? (
                <View style={styles.LoadingScreen}>
                  <LoadingScreen />
                </View>
              ) : null}
              {/* SCROLL VIEW */}

              <ScrollView
                ref={scrollRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                scrollEnabled={false}
                onScroll={Animated.event(
                  [{ nativeEvent: { contentOffset: { x: animatedValue } } }],
                  { useNativeDriver: false },
                )}
                scrollEventThrottle={16}
                onMomentumScrollEnd={e =>
                  setActiveTab(
                    Math.round(e.nativeEvent.contentOffset.x / width),
                  )
                }>
                {/* TAB 1 */}

                <View style={styles.page}>
                  <FlatList
                    data={isLoading ? Array.from({ length: 5 }) : plotList}
                    keyExtractor={(item, index) =>
                      item?.id?.toString() || index
                    }
                    refreshing={refreshing}
                    onRefresh={() => setRefreshing(false)}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ padding: 15 }}
                    renderItem={({ item, index }) =>
                      isLoading ? (
                        <PlotStatusSkeletonScreen />
                      ) : (
                        <PlotCard
                          item={item}
                          index={index}
                          onPress={handlePlotPress}
                          landUnitsquareMetre={landUnitsquareMetre}
                          landAreaUnit={landAreaUnit}
                          apiCall={landActiveCrop}
                          // role="farmer"
                          activityApi={getPlotActivities}
                          carbonType={dbLanTokUsr?.carbonType}
                        />
                      )
                    }
                  />
                </View>

                {/* TAB 2 */}

                <View style={styles.page}>
                  {activeTab === 1 && (
                    <FarmerLiveHood
                      dataProps={dataProps}
                      activeTab={activeTab}
                      setActiveTab={setActiveTab}
                      onTabPress={onTabPress}
                      setAddPlot={setAddPlot}
                      addPlot={addPlot}
                      historyData={historyData}
                    />
                  )}
                </View>
              </ScrollView>
            </>
          )}
          {/* FLOATING BUTTON */}
          {activeTab === 1 && (
            <>
              <ScrollView
                ref={scrollRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                scrollEnabled={false}
                onScroll={Animated.event(
                  [{ nativeEvent: { contentOffset: { x: animatedValue } } }],
                  { useNativeDriver: false },
                )}
                scrollEventThrottle={16}
                onMomentumScrollEnd={e =>
                  setActiveTab(
                    Math.round(e.nativeEvent.contentOffset.x / width),
                  )
                }>
                <View style={styles.page}>
                  <FarmerLiveHood
                    dataProps={dataProps}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    onTabPress={onTabPress}
                    setAddPlot={setAddPlot}
                    addPlot={addPlot}
                    historyData={historyData}
                  />
                </View>
              </ScrollView>
            </>
          )}

          {activeTab === 0 &&  dbLanTokUsr?.carbonType == "mangrove"  && (
            <FloatingActionButton
              position="right"
              actions={getActionsPlot(t, styles, Colors)}
              color={Colors.useGreen}
              onPressItem={() => {
                onTabPress(1, {});
                setAddPlot(true);
              }}
              overlayColor="rgba(22, 17, 17, 0.35)"
              distanceToEdge={{ vertical: 80, horizontal: 25 }}
            />
          )}
        </View>
      </FarmerDrawerScreenWrapper1>
    </Root>
  );
};

export default memo(PlotListFarmer);

const styles = StyleSheet.create({
  container: { flex: 1 },
  page: {
    width,
    flex: 1,
    backgroundColor: Colors.background_light,
  },
});
