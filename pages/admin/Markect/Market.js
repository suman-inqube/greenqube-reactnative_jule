import {
  StyleSheet,
  Text,
  View,
  Animated,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  FlatList,
  ImageForm,
  TextInput,
} from 'react-native';
import React, {useState, useEffect, useContext, useRef, useMemo} from 'react';
import CollapsibleCard from '../../Common/CollapsibleCard';
import {Fenced_Rejected_Plot_List} from '../../../config/apiHere';
import {userCreateContext} from '../../Context/usersCreateContext';
const {width} = Dimensions.get('window');
import LoadingScreen from '../../Common/LoadingScreen';
import {useNavigation} from '@react-navigation/native';
import TabBar from '../../Components/TabBar';
import {Colors, Fonts} from '../../utils/Constants';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import PaginationNav from '../../Components/PaginationNav';
import ListCard from '../../Components/ListCard';
import {axiosGet} from '../../utils/api';
import {ROUTES} from '../../utils/Routes';

import FarmerDrawerScreenWrapper1 from '../FarmerDrawerScreenWrapper1';
const Market = () => {
  const navigation = useNavigation();
  const {
    getItem,
    t,
    CustomHeader,
    onBackPress,
    logoImage,
    topBanner,
    isOnline,
    Root,
    Toast,
    AlertMesg,
    loginUser_data,
    LoadingScreen,
  } = useContext(userCreateContext);
  const {dbname, lan_id, token, user_id} = loginUser_data || {};
  const [plotList, setPlotList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rejection, setRejection] = useState('REJECTED');
  const [nonGeofenced, setNonGeofenced] = useState('');
  const [searchBy, setSearchBy] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      // const response = await Fenced_Rejected_Plot_List(
      //   token,
      //   dbname,
      //   lan_id,
      //   user_id,
      //   rejection,
      //   nonGeofenced,
      //   page,
      //   searchBy,
      // );
      const response = await axiosGet(
        ROUTES.GET.Fenced_Rejected_Plot_List({
          status_level: rejection,
          geo_type: nonGeofenced,
          page: page,
          searchBy: searchBy,
        }),
        token,
        {
          information: `${dbname},${lan_id},${user_id}`,
        },
      );
      if (response?.status === 200) {
        setTotalPages(Math.ceil(response?.data?.data.count / 20));
        // console.log(JSON.stringify(response?.data?.data));
        setPlotList(response?.data?.data?.rows);
      }
      setLoading(false);
    };
    fetchData();
    onBackPress(() => {
      navigation.navigate('Dashboard');
      return true;
    });
  }, [rejection, nonGeofenced, searchBy, page]);
  const [activeTab, setActiveTab] = useState(0);
  const scrollRef = useRef(null);
  const onTabPress = (index, data) => {
    setActiveTab(index);
    if (index == 0) {
      setRejection('REJECTED');
      setNonGeofenced('');
    } else {
      setNonGeofenced('non_geofenced');
      setRejection('');
    }
    setPage(1);
    scrollRef.current?.scrollTo({x: Number(index) * width, animated: true});
  };
  const animatedValue = useRef(new Animated.Value(0)).current;
  const indicatorPosition = animatedValue.interpolate({
    inputRange: [0, width],
    outputRange: [0, width / 2], // Moves indicator with swipe
  });
  const onScroll = Animated.event(
    [{nativeEvent: {contentOffset: {x: animatedValue}}}],
    {useNativeDriver: false},
  );

  const detailItem = item => {
    // console.log('item==', item);
    navigation.navigate('PlotStatusUpdate', item);
  };

  const HandlerGoBack = () => navigation.navigate('Dashboard');
  const renderCustomHeader = useMemo(
    () => <CustomHeader t={t} HandlerGoBack={HandlerGoBack} />,
    [],
  );

  const renderListItem = ({item, index}) => {
    const {
      farmer_data,
      plot_no,
      comment,
      plot_size,
      mouza_name,
      land_size,
      landUsrAdd,
      land_convert_size,
    } = item || {};

    if (activeTab === 0) {
      const cardItems = [
        {
          value: plot_no || 'N/A',
          comment: comment || 'N/A',
        },
      ];
      return (
        <ListCard
          onPress={() => detailItem(item)}
          title={farmer_data?.userName || 'Unknown Farmer'}
          items={cardItems}
          index={index}
          iconName="edit-square"
          iconSize={16}
          iconColor="#206708ff"
          borderColor="#d10000ff"
          showChevron={false}
          showItemLabel={false}
          showRejectedStatus={true}
          cardStyle={styles.listCard}
        />
      );
    } else {
      const cardItems = [
        {
          label: farmer_data?.contactNumber || 'N/A',
          value: plot_no || 'N/A',
        },
        {
          label: `${land_size || 'N/A'} Acre`,
          value: landUsrAdd?.agri_subdivision?.subdiv_name || 'N/A',
        },
      ];
      return (
        <ListCard
          onPress={() => detailItem(item)}
          title={farmer_data?.userName || 'Unknown Farmer'}
          items={cardItems}
          index={index}
          iconName="edit-square"
          iconSize={16}
          iconColor="#206708ff"
          borderColor="#206708ff"
          showChevron={false}
          showItemLabel={true}
          showRejectedStatus={false}
          cardStyle={styles.listCard}
        />
      );
    }
  };
  return (
    <FarmerDrawerScreenWrapper1>
      <View style={styles.container}>
        {renderCustomHeader}
        <View style={styles.searchContainer}>
          <View style={styles.textInputContainer}>
            <TextInput
              placeholder={t('search by number')}
              placeholderTextColor={'#000'}
              style={styles.textInput}
              onChangeText={num => setSearchBy(num)}
              value={searchBy}
            />
          </View>
        </View>
        <TabBar
          tabs={[' Rejected Plots', ' Non-Geo Fenced Plots']}
          activeTab={activeTab}
          onTabPress={ix => onTabPress(ix)}
          indicatorColor={Colors.useGreen}
          height={45}
          backgroundColor={Colors.background}
          colors={Colors.primary}
        />
        {/* <View style={styles.tabBar}>
          <TouchableOpacity style={styles.tab} onPress={() => onTabPress(0)}>
            <Text
              style={[styles.tabText, activeTab === 0 && styles.activeTabText]}>
              Rejected Plots
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tab} onPress={() => onTabPress(1)}>
            <Text
              style={[styles.tabText, activeTab === 1 && styles.activeTabText]}>
              Non-Geo Fenced Plots
            </Text>
          </TouchableOpacity>
          <Animated.View
            style={[
              styles.indicator,
              {transform: [{translateX: indicatorPosition}]},
            ]}
          />
        </View> */}
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          onMomentumScrollEnd={event => {
            const index = Math.round(event.nativeEvent.contentOffset.x / width);
            setActiveTab(index);
          }}
          //basudev
          scrollEnabled={false}
          scrollEventThrottle={16}>
          <View style={styles.page}>
            {loading ? (
              <View style={styles.LoadingScreen}>
                <LoadingScreen />
              </View>
            ) : null}
            <FlatList
              data={plotList}
              keyExtractor={(item, index) =>
                item?.id?.toString() || index.toString()
              }
              showsVerticalScrollIndicator={false} // Hides vertical scrollbar
              showsHorizontalScrollIndicator={false} // Hides horizontal scrollbar
              style={{padding: 10}}
              renderItem={renderListItem}
              ListEmptyComponent={
                !loading && (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>
                      {t('no_rejected_plots')}
                    </Text>
                  </View>
                )
              }
            />
            <PaginationNav
              page={page}
              totalPages={totalPages}
              onPrev={() => setPage(p => Math.max(1, p - 1))}
              onNext={() => setPage(p => Math.min(totalPages, p + 1))}
              t={t}
            />
            {/* <View style={styles.prevNextPage}>
              <TouchableOpacity onPress={() => setPage(page - 1)}>
                <Text style={styles.title}>{t('prev_page')}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setPage(page + 1)}>
                <Text style={styles.title}>{t('next_page')}</Text>
              </TouchableOpacity>
            </View> */}
          </View>

          <View style={styles.page}>
            {loading ? (
              <View style={styles.LoadingScreen}>
                <LoadingScreen />
              </View>
            ) : (
              ''
            )}
            <FlatList
              data={plotList}
              keyExtractor={(item, index) =>
                item?.id?.toString() || index.toString()
              }
              showsVerticalScrollIndicator={false} // Hides vertical scrollbar
              showsHorizontalScrollIndicator={false} // Hides horizontal scrollbar
              style={{padding: 10}}
              renderItem={renderListItem}
              ListEmptyComponent={
                !loading && (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>
                      {t('no_non_geofenced_plots')}
                    </Text>
                  </View>
                )
              }
            />
            <PaginationNav
              page={page}
              totalPages={totalPages}
              onPrev={() => setPage(p => Math.max(1, p - 1))}
              onNext={() => setPage(p => Math.min(totalPages, p + 1))}
              t={t}
            />
            {/* <View style={styles.prevNextPage}>
              <TouchableOpacity onPress={() => setPage(page - 1)}>
                <Text style={styles.title}>{t('prev_page')}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setPage(page + 1)}>
                <Text style={styles.title}>{t('next_page')}</Text>
              </TouchableOpacity>
            </View> */}
          </View>
        </ScrollView>
      </View>
    </FarmerDrawerScreenWrapper1>
  );
};

export default Market;

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: 'white'},
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
    justifyContent: 'center',
  },
  tabText: {fontSize: 16, color: '#666', fontFamily: 'Poppins-SemiBold'},
  text: {
    fontSize: 14,
    color: '#000',
    fontFamily: 'Poppins-Regular',
    marginVertical: 3,
  },
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
    backgroundColor: '#f5f6fb',
    // padding: 10,
  },
  item: {
    padding: 15,
    fontSize: 18,
    // borderBottomWidth: 1,
    margin: 10,
    backgroundColor: '#FFF',
    // borderBottomColor: '#ddd',
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: '#d0d4dc',
  },
  text: {
    fontSize: 14,
    color: '#000',
    fontFamily: 'Poppins-Regular',
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
  prevNextPage: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    position: 'relative',
    bottom: 0,
    backgroundColor: Colors.background_light,
  },
  searchContainer: {
    marginHorizontal: '5%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    alignItems: 'center',
    paddingHorizontal: 10,
    borderRadius: 8,
    marginVertical: 8,
    borderColor: '#8b8b8bff',
    backgroundColor: '#efefefff',
    marginTop: 10,
  },
  textInput: {
    height: 45,
    width: '100%',
    color: '#000',
    fontFamily: 'Poppins-Regular',
    lineHeight: 18,
  },
  searchIcon: {
    width: '10%',
  },
  textInputContainer: {
    width: '90%',
  },
  flatListContainer: {
    marginHorizontal: '2%',
    marginBottom: 5,
  },
  flatListItem: {
    backgroundColor: 'white',

    marginVertical: 8,
    borderRadius: 20,
    borderLeftWidth: 5,
    borderLeftColor: '#d10000ff',
    // flexDirection: 'row',
    // alignItems: 'center',
    // marginBottom: 8,
    paddingHorizontal: 16,

    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    // elevation: 4,
    borderRightWidth: 1,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderRightColor: Colors.border,
    borderTopColor: Colors.border,
    borderBottomColor: Colors.border,
  },
  flatListItemGeo: {
    backgroundColor: 'white',

    marginVertical: 8,
    borderRadius: 20,
    borderLeftWidth: 5,
    borderLeftColor: '#206708ff',
    // flexDirection: 'row',
    // alignItems: 'center',
    // marginBottom: 8,
    paddingHorizontal: 16,

    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    // elevation: 4,
    borderRightWidth: 1,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderRightColor: Colors.border,
    borderTopColor: Colors.border,
    borderBottomColor: Colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 5,
    marginLeft: 5,
  },
  marqueeContainer: {
    flex: 1,
    // marginLeft: 10,
    marginRight: 10,
    overflow: 'hidden',
    marginTop: 10,
  },
  cardTitle: {
    fontSize: 15,
    // fontWeight: '600',
    color: '#363636ff',
    // marginLeft: 5,
    fontFamily: 'Poppins-SemiBold',
  },
  cardTitleRe: {
    fontSize: 14,
    // fontWeight: '600',
    color: '#363636ff',
    // marginLeft: 5,
    fontFamily: 'Poppins-SemiBold',
  },

  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    // borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    // paddingTop: 8,
    marginLeft: 5,
  },
  viewDetailsText: {
    fontSize: 12,
    color: Colors.useGreen,
    // marginRight: 4,
    fontFamily: 'Poppins-Regular',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
    paddingHorizontal: 5,
    // paddingHorizontal: 10,
  },
  label: {
    fontSize: 13,
    color: Colors.text,
    fontFamily: 'Poppins-SemiBold',
    flex: 1,
  },
  value: {
    fontSize: 13,
    color: Colors.text,
    fontFamily: 'Poppins-Regular',
    flex: 1,
    textAlign: 'right',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.text,
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
  },
});
