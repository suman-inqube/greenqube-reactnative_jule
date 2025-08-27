import {
  StyleSheet, Text, View, FlatList, TouchableOpacity,
  ScrollView, Image, Animated, Dimensions, BackHandler, InteractionManager
} from 'react-native';
import React, { useEffect, useState, useRef, useContext, useCallback, memo } from 'react';
import { useRoute, useNavigation } from '@react-navigation/native';
import { plotListApproval, LandUnitArea, LandUnitsquare_metre } from '../../../config/apiHere';
import CollapsibleCard from '../../Common/CollapsibleCard';
import LiveHood from './LiveHood';
import { userCreateContext } from '../../Context/usersCreateContext';
import { FloatingAction } from 'react-native-floating-action';
import { getActionsPlot } from '../../utils/options';
import { Colors, Fonts } from '../../utils/Constants';
const { width } = Dimensions.get('window');
import PlotStatusSkeletonScreen from '../../Components/Skeleton/PlotStatusSkeleton';
const StatusBadge = ({ status }) => {
  const badgeStyles = {
    APPROVED: { bg: '#D4EDDA', color: '#155724', text: 'APPROVED' },
    PENDING: { bg: '#FFF3CD', color: '#856404', text: 'PENDING' },
    REJECTED: { bg: '#F8D7DA', color: '#721C24', text: 'REJECTED' },
    CARBON_DOCUMENTS_SUBMITTED: { bg: '#D4EDDA', color: '#155724', text: 'SUBMITTED' },
    CARBON_DOCUMENTS_REJECTED: { bg: '#F8D7DA', color: '#721C24', text: 'CARBON REJECTED' },
    CARBON_DOCUMENTS_APPROVED: { bg: '#D4EDDA', color: '#155724', text: 'VERIFIED' },
  };
  if (!badgeStyles[status]) return null;
  return (
    <View style={[styles.statusBox, { backgroundColor: badgeStyles[status].bg }]}>
      <Text style={[styles.statusText, { color: badgeStyles[status].color }]}>
        {badgeStyles[status].text}
      </Text>
    </View>
  );
};
const PlotCard = memo(({ item, onPress, landUnitsquareMetre, landAreaUnit }) => {
  const convertedArea = (
    Number(landUnitsquareMetre?.[0]?.defined_unit_value || 0) * Number(item?.google_area || 0)
  ).toFixed(2);

  return (
    <TouchableOpacity onPress={onPress}>
      <CollapsibleCard
        width="100%"
        header={<Text style={[styles.text, { fontSize: 18,color:Colors.background }]}>{item?.plot_no}</Text>}
        content={
          <>
            <View style={styles.plotInfoContainer}>
              <View>
                {['Plot Name', 'Reported Land Area', 'Converted Land Area', 'Crop Name',
                  'Crop Variety', 'Cycle Start Date', 'Cycle End Date'].map((label, idx) => (
                    <Text key={idx} style={styles.text}>{label}</Text>
                  ))}
              </View>
              <View style={{ marginLeft: 10 }}>
                <Text style={styles.label}>: {item?.plot_no}</Text>
                <Text style={styles.label}>: {item?.land_size} {item?.land_unit?.name}</Text>
                <Text style={styles.label}>: {parseFloat(item?.land_convert_size).toFixed(2)} {landAreaUnit?.[0]?.name}</Text>
                <Text style={styles.label}>: {item?.plot_crops[0]?.crop_name?.name}</Text>
                <Text style={styles.label}>: {item?.plot_crops[0]?.crop_variety?.name}</Text>
                <Text style={styles.label}>: {item?.plot_crops[0]?.sowing_date}</Text>
                <Text style={styles.label}>: {item?.plot_crops[0]?.harvesting_date?.substring(0, 10)}</Text>
              </View>
            </View>

            {item?.status_level === 'REJECTED' && (
              <View style={styles.rejectBox}>
                <Text style={styles.rejectText}>{item?.comment}</Text>
              </View>
            )}
          </>
        }
        footer={
          <View style={styles.footerRow}>
            <View style={styles.areaRow}>
              <Image
                source={require('../../Common/images/area-with-pins.png')}
                style={styles.areaIcon}
              />
              <Text style={styles.text}>
                {convertedArea} {landAreaUnit?.[0]?.name || ''}
              </Text>
            </View>
            <StatusBadge status={item?.status_level} />
          </View>
        }
      />
    </TouchableOpacity>
  );
});
const PlotList = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { farmeruserID } = route.params;
  const [activeTab, setActiveTab] = useState(0);
  const [dataProps, setDataProps] = useState({});
  const [addPlot, setAddPlot] = useState(false);
  const [plotList, setPlotList] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [landUnitsquareMetre, setLandUnitsquareMetre] = useState([]);
  const [landAreaUnit, setLandAreaUnit] = useState([]);
  const scrollRef = useRef(null);
  const animatedValue = useRef(new Animated.Value(0)).current;
  const { loginUser_data, t, onBackPress, Root, CustomHeader, LoadingScreen } =
    useContext(userCreateContext);

  const { dbname, lan_id, token } = loginUser_data;

  const onTabPress = useCallback((index, data = {}) => {
    setActiveTab(index);
    setDataProps(data);
    scrollRef.current?.scrollTo({ x: index * width, animated: true });
  }, []);

  const indicatorPosition = animatedValue.interpolate({
    inputRange: [0, width],
    outputRange: [0, width / 2],
  });

  const onPageLoad = async () => {
    try {
      setIsLoading(true);
      const [plotsRes, unitAreaRes, unitSqRes] = await Promise.all([
        plotListApproval(dbname, lan_id, token, farmeruserID),
        LandUnitArea(dbname, lan_id, token),
        LandUnitsquare_metre(dbname, lan_id, token),
      ]);

      if (plotsRes?.status === 200) setPlotList(plotsRes?.data || []);
      if (unitAreaRes?.status === 200) setLandAreaUnit(unitAreaRes?.data?.data?.rows || []);
      if (unitSqRes?.status === 200) setLandUnitsquareMetre(unitSqRes?.data?.data?.rows || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
      setAddPlot(false);
      setDataProps({});
    }
  };

  useEffect(() => {
    if (activeTab === 0) {
      const task = InteractionManager.runAfterInteractions(() => {
        onPageLoad();
      });
      return () => task.cancel();
    }
    const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
      if (activeTab === 1) {
        onTabPress(0);
        return true;
      }
      return false;
    });
    return () => backHandler.remove();
  }, [activeTab]);

  return (
    <Root>
      <View style={styles.container}>
        <CustomHeader path="userList" HandlerGoBack={() => navigation.navigate('userList')} />
        <View style={styles.tabBar}>
          {['Plot Status', 'Plot Add and Edit'].map((label, idx) => (
            <TouchableOpacity key={idx} style={styles.tab} onPress={() => onTabPress(idx)}>
              <Text style={[styles.tabText, activeTab === idx && styles.activeTabText]}>{label}</Text>
            </TouchableOpacity>
          ))}
          <Animated.View style={[styles.indicator, { transform: [{ translateX: indicatorPosition }] }]} />
        </View>
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEnabled={false}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: animatedValue } } }], { useNativeDriver: false })}
          scrollEventThrottle={16}
          onMomentumScrollEnd={e => setActiveTab(Math.round(e.nativeEvent.contentOffset.x / width))}
        >
          <View style={styles.page}>
            <FlatList
              data={isLoading ? Array.from({ length: 5 }) : plotList}
              keyExtractor={(item, index) => item?.id?.toString() || index}
              refreshing={refreshing}
              onRefresh={() => setRefreshing(false)}
              renderItem={({ item, index }) =>
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
              contentContainerStyle={{ padding: 15 }}
              showsVerticalScrollIndicator={false}
              initialNumToRender={5}
              windowSize={5}
              removeClippedSubviews={true}
            />
          </View>
          <View style={styles.page}>
            {activeTab === 1 && (
              <LiveHood
                dataProps={dataProps}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onTabPress={onTabPress}
                setAddPlot={setAddPlot}
                addPlot={addPlot}
              />
            )}
          </View>
        </ScrollView>
        {activeTab === 0 && (
          <>
            <FloatingAction
              position="right"
              actions={getActionsPlot(t, styles, Colors)}
              color={Colors.useGreen}
              onPressItem={() => onTabPress(1, {}) || setAddPlot(true)}
              overlayColor="rgba(22, 17, 17, 0.35)"
              distanceToEdge={{ vertical: 80, horizontal: 25 }}
            />
          </>
        )}
      </View>
    </Root>
  );
};
const styles = StyleSheet.create({
  container: { flex: 1 },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    elevation: 1,
    position: 'relative',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    paddingVertical: 3,
  },
  tab: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
  },
  tabText: { fontSize: 16, color: Colors.text, fontFamily: Fonts.Medium, },
  activeTabText: { fontSize: 16, color: 'green', fontFamily: Fonts.Medium, },
  indicator: {
    position: 'absolute',
    bottom: 0,
    width: width / 2,
    height: 3,
    backgroundColor: 'green',
  },
  page: {
    width,
    flex: 1,
    backgroundColor: Colors.background_light
  },
  item: {
    padding: 15,
    fontSize: 18,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  text: {
    fontSize: 14,
    color: Colors.text,
    fontFamily: Fonts.Medium,
    marginVertical: 3,
    lineHeight: 20,
  },

  skeletonCardWrapper: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 0.6,
    borderColor: '#d0d4dc'
  },
  skeletonCard: {
    flex: 1,
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
    borderRadius: 10
  },
  latlongContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 5,
    padding: 3
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
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  areaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  areaIcon: {
    width: 25,
    height: 25,
    tintColor: '#0d8320',
  },
  statusBox: {
    padding: 8,
    borderRadius: 5,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    width: 100,
    height: 38,
  },
  plotInfoContainer: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    marginVertical: 10,
    shadowColor: '#000',
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    color: Colors.text,
    fontFamily: Fonts.Regular,
    fontSize: 14,
    marginVertical: 3,
    lineHeight: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  rejectBox: {
    paddingVertical: 10,
    backgroundColor: '#F8D7DA',
    borderRadius: 5,
    borderColor: '#F8D7DA',
    borderWidth: 0.6,
    marginVertical: 20,
  },
  rejectText: {
    marginHorizontal: 5,
    color: '#721C24',
    fontFamily: Fonts.Regular,
    fontSize: 14,
  }
});
export default memo(PlotList);

