import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Easing,
  Dimensions,
  Keyboard,
  BackHandler,
  RefreshControl,
} from 'react-native';
import React, {
  useState,
  useEffect,
  useContext,
  useCallback,
  useRef,
  memo,
} from 'react';
import {problemListAPI} from '../../../config/apiHere';
import {useFocusEffect} from '@react-navigation/native';
import {useIsFocused} from '@react-navigation/native';
import {userCreateContext} from '../../Context/usersCreateContext';
import {Colors, Fonts} from '../../utils/Constants';
import {ROUTES} from '../../utils/Routes';
import {axiosGet} from '../../utils/api';
import PaginationNav from '../../Components/PaginationNav';
import SkeletonProblemCard from '../../Components/Skeleton/SkeletonProblemCard';
import FarmerDrawerScreenWrapper1 from '../FarmerDrawerScreenWrapper1';
const ListProblem = ({navigation}) => {
  //GQR-67
  const {
    dbLanTokUsr,
    setdbLanTokUsr,
    loginUser_data,
    LoadingScreen,
    CustomHeader,
    t,
    onBackPress,
    getItem,
    setItem,
    logoImage,
    topBanner,
    Root,
    DeviceInfo,
    effective_dates,
    navigationBarHeight,
    DatePickerComp,
    Filter,
    handleFilter,
    handleResultSelect,
    handlePageList,
    farmerData,
    isOnline,
  } = useContext(userCreateContext);
  const {dbname, lan_id, token, user_id} = loginUser_data;
  const {pageNo} = dbLanTokUsr;
  //GQR-67
  const {netConnection} = DeviceInfo();
  const isFocused = useIsFocused();
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [problemAll, setProblemAll] = useState([]);
  const [problemAllRaw, setProblemAllRaw] = useState([]);
  const [filterItem, setFilterItem] = useState('');
  const [filterOption, setFilterOption] = useState(false);
  const [newFromDate, setnewFromDate] = useState(new Date());
  const [newToDate, setnewToDate] = useState(new Date());
  const [openFromDate, setOpenFromDate] = useState(false);
  const [openToDate, setOpenToDate] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [fromDateFilter, setFromDateFilter] = useState('');
  const [searchResultsList, setSearchResultsList] = useState(false);
  const [searchFarmerName, setSearchFarmerName] = useState('');
  const [searchFarmerPhone, setSearchFarmerPhone] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [filterName, setFilterName] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const navigateToPages = (pageName, fid) => {
    setItem('problem_id_data', fid);
    navigation.navigate(pageName);
  };
  const handleProblem = async (
    pageNo,
    search_uid,
    from_date,
    to_date,
    farmer_mobile,
  ) => {
    try {
      setIsLoading(true);
      let response;
      if (isOnline) {
        response = await axiosGet(
          ROUTES.GET.QUESTION_ROUTE({
            pageNo,
            user_id: search_uid,
            from_date,
            to_date,
            agent_id: user_id,
            farmer_mobile,
          }),
          token,
          {information: `${dbname},${lan_id}`},
        );
        if (response?.status === 200) {
          await setItem('problemTypeName', response);
        }
      } else {
        response = await getItem('problemTypeName');
      }
      if (!response?.status === 200) return;
      const {rows, count} = response?.data || {};
      const totalPage = Math.ceil(count / 20);
      setTotalPages(totalPage);
      setProblemAll(rows);
      await setItem('problem_Data', response?.data);
      setIsLoading(false);
    } catch (error) {
      console.error('handleProblem error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onPageLoad = async () => {
    handleProblem(1);
    setIsLoading(true);
    // var response = [];
    // if (isOnline) {
    //     response = await problemListAPI(dbname, lan_id, token, user_id, 1);
    //     if (response?.status == 200) { await setItem('problemTypeName', response) }
    // } else {
    //     response = await getItem('problemTypeName');
    // }
    // if (response?.status == 200) {
    //     setIsLoading(false);
    //     const totalPage = Math.ceil(response?.data?.data.count / 20)
    //     setdbLanTokUsr({ ...dbLanTokUsr, totalPage: totalPage, pageNo: 1 });
    //     setProblemAll(response?.data?.data?.rows)
    //     setProblemAllRaw(response?.data?.data?.rows)
    //     setItem("problem_Data", response?.data?.data)
    //     setIsLoading(false)
    // }
  };
  const filterDataRemove = () => {
    setSearchFarmerPhone('');
    setSearchFarmerName('');
    setFilterItem('');
    setFilterOption(false);
    setProblemAll(problemAllRaw);
    setSearchResultsList(false);
  };
  const HandlerGoBack = () => {
    setToDate('');
    setfromDate('');
    setFilterItem('');
    setSearchFarmerPhone('');
    setSearchFarmerName('');
    setFilterOption(false);
    setSearchResultsList(false);
    navigation.navigate('Dashboard');
  };
  const handleBackPress = () => {
    setToDate('');
    setfromDate('');
    setFilterItem('');
    setSearchFarmerPhone('');
    setSearchFarmerName('');
    setFilterOption(false);
    setSearchResultsList(false);
    navigation.navigate('Dashboard');
    return true;
  };
  useEffect(() => {
    handleProblem(page);
  }, [page]);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    requestAnimationFrame(async () => {
      // await onPageLoad("refreshing");
      await handleProblem(page);
      setRefreshing(false);
    });
  }, []);
  const CardItem = useCallback(({item, index, navigation}) => {
    const truncatedTitle =
      item.question_title?.length > 30
        ? `${item.question_title.substring(0, 30)}...`
        : item.question_title;
    const cardAnimation = useRef(new Animated.Value(0)).current;
    useEffect(() => {
      Animated.timing(cardAnimation, {
        toValue: 1,
        duration: 500,
        delay: index * 150,
        useNativeDriver: true,
      }).start();
    }, []);
    return (
      <Animated.View
        style={[
          styles.activityCard,
          {
            opacity: cardAnimation,
            transform: [
              {
                translateY: cardAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
                }),
              },
            ],
          },
        ]}>
        <TouchableOpacity
          style={styles.problemCard}
          onPress={() => navigateToPages('ProblemView', item.fid)}
          activeOpacity={0.7}>
          <View style={styles.cardHeader}>
            <Text style={styles.problemTitle} numberOfLines={2}>
              {t('problem_title')}: {truncatedTitle}
            </Text>
          </View>

          <View style={styles.cardContent}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('name')}:</Text>
              <Text style={styles.infoValue} numberOfLines={1}>
                {item.agri_user?.userName || 'N/A'}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('far_list_number')}:</Text>
              <Text style={styles.infoValue}>
                {item.agri_user?.contactNumber || 'N/A'}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }, []);
  const filterOptionShow = async () => {
    try {
      const {openFilterSheet} = await import('../../Components/FilterSheet');
      openFilterSheet({
        options: ['farmer', 'phone', 'date', ''],
        // onchangeFilterItem: onchangeFilterItem,
        t: t,
        dropdownData: farmerData,
        filterItem: filterItem,
        setSearchFarmerName: setSearchFarmerName,
        setSearchFarmerPhone: setSearchFarmerPhone,
        searchFarmerName: searchFarmerName,
        searchFarmerPhone: searchFarmerPhone,
        title: 'Choose Status',
        handleFilterResult: handleFilterResult,
        handleFilterRemove: handleFilterRemove,
        setFromDate: setFromDate,
        setToDate: setToDate,
        fromDate: fromDate,
        toDate: toDate,
        effective_dates: effective_dates,
        carbonFlag: false,
        CARBON_TYPE: [],
        navigationBarHeight: navigationBarHeight,
      });
    } catch (error) {}
  };
  const handleFilterResult = useCallback(
    ({filter, fromDate, toDate, farmerName, farmerPhone, sheetCarbonType}) => {
      try {
        setFilterItem(filter);
        setFromDate(fromDate);
        setToDate(toDate);
        setSearchFarmerName({
          label: farmerName?.label,
          value: farmerName?.value,
        });
        setSearchFarmerPhone({
          label: farmerPhone?.label,
          value: farmerPhone?.value,
        });
        setPage(1);
        handleProblem(
          page,
          farmerName?.value,
          fromDate,
          toDate,
          farmerPhone?.label,
        );
      } catch (error) {
        console.log(error, 'error');
      }
    },
    [],
  );
  const handleFilterRemove = () => {};
  return (
    <FarmerDrawerScreenWrapper1>
      <Root>
        <SafeAreaView
          style={{flex: 1, backgroundColor: Colors.background_light}}>
          <View style={{flex: 1}}>
            <CustomHeader t={t} filterOptionShow={filterOptionShow} />
            {/* {openFromDate && <DatePickerComp openDate={openFromDate} newDate={newFromDate} setOpenDate={setOpenFromDate} handleDatePicker={handleDatePicker} />}
                    {openToDate && <DatePickerComp openDate={openToDate} newDate={newToDate} setOpenDate={setOpenToDate} handleDatePicker={handleDatePicker2} minimumDate={fromDate == "" ? "" : new Date(`${new Date(fromDate).getFullYear()}-${new Date(fromDate).getMonth() + 1}-${new Date(fromDate).getDate() + 1}`)} />}
                    <Filter
                        filterItem={filterItem}
                        filterOption={filterOption}
                        setOpenToDate={setOpenToDate}
                        fromDate={fromDate}
                        newToDate={toDate}
                        setOpenFromDate={setOpenFromDate}
                        filterOptionShow={filterOptionShow}
                        onchangeFilterItem={onchangeFilterItem}
                        onChangeText={(item) => handleFilterList(item)}
                        FarmerProductNameValue={searchFarmerName}
                        FarmerProductPhoneValue={searchFarmerPhone}
                        title={t('problem_reporting')}
                        filterDataRemove={filterDataRemove}
                    />
                    <>
                        {
                            searchResultsList && searchResultsList ?
                                <View View style={isKeyboardVisible ? styles.flatContainerLengthUp : styles.flatContainer}>
                                    <FlatList
                                        style={searchResults.length > 8 ? styles.flatlistHeight : ""}
                                        data={searchResults}
                                        renderItem={({ item }) => (

                                            <TouchableOpacity onPress={() => handleResultSelectList(item)} style={styles.flatlistitem}>
                                                <Text style={[styles.flatlisttitle, { color: 'black' }]}>{filterName == "PhoneNumber" ? item.phone : item.label}</Text>
                                            </TouchableOpacity>
                                        )}
                                        keyExtractor={(item, index) => index}
                                    />
                                </View> : ""
                        }
                    </> */}
            {/* {isLoading ? <View style={styles.loadingScreen}><LoadingScreen /></View> : null} */}
            {/* <View style={styles.content}> */}
            <FlatList
              nestedScrollEnabled={true}
              data={isLoading ? Array.from({length: 5}) : problemAll}
              renderItem={({item, index}) =>
                isLoading ? (
                  <SkeletonProblemCard Colors={Colors} Fonts={Fonts} />
                ) : (
                  <CardItem item={item} index={index} navigation={navigation} />
                )
              }
              keyExtractor={(item, index) => `problem_${item?.fid || index}`}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={[Colors.green]}
                  tintColor={Colors.green}
                />
              }
              // ListEmptyComponent={isLoading ? renderEmptyState : null}
              // ListFooterComponent={
              //     problemAll.length > 0 ? renderFooter : null
              // }
              onEndReachedThreshold={0.5}
              contentContainerStyle={styles.listContainer}
              removeClippedSubviews={true}
              maxToRenderPerBatch={5}
              updateCellsBatchingPeriod={20}
              windowSize={5}
            />
            <PaginationNav
              page={page}
              totalPages={totalPages}
              onPrev={() => setPage(p => Math.max(1, p - 1))}
              onNext={() => setPage(p => Math.min(totalPages, p + 1))}
              t={t}
            />
            {/* </View> */}
          </View>
        </SafeAreaView>
      </Root>
    </FarmerDrawerScreenWrapper1>
  );
};
export default ListProblem;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background_light,
  },
  content: {
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    // paddingBottom: 100, // Space for FAB
  },
  problemCard: {
    backgroundColor: '#ffffff',
    marginVertical: 8,
    borderRadius: 12,
    // elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  cardHeader: {
    // backgroundColor: '#fa9e003b',
    backgroundColor: Colors.useGreen,
    // backgroundColor:Colors.lightGreen,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderStyle: 'dashed',
    borderColor: Colors.border,
  },
  problemTitle: {
    // color: '#f59f0bff',
    color: Colors.background,
    fontSize: 16,
    fontFamily: Fonts.Medium,
  },
  cardContent: {
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    color: Colors.text,
    fontSize: 14,
    fontFamily: Fonts.Medium,
    flex: 1,
  },
  infoValue: {
    color: Colors.text,
    fontSize: 14,
    fontFamily: Fonts.Medium,
    flex: 2,
    textAlign: 'right',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
    marginTop: 16,
  },
  paginationButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  prevButton: {
    backgroundColor: Colors.secondary || '#e0e0e0',
  },
  nextButton: {
    backgroundColor: Colors.primary || '#4BAE4F',
  },
  paginationText: {
    color: '#333',
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
  },
  pageInfo: {
    alignItems: 'center',
  },
  pageInfoText: {
    color: '#666',
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary || '#4BAE4F',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabIcon: {
    width: 24,
    height: 24,
    tintColor: '#ffffff',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    color: '#666',
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    marginBottom: 20,
    textAlign: 'center',
  },
  refreshButton: {
    backgroundColor: Colors.primary || '#4BAE4F',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
  },
});
