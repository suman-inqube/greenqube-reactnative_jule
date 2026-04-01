import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import React, {
  useState,
  useEffect,
  useContext,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import {useIsFocused, useRoute} from '@react-navigation/native';
import {userCreateContext} from '../../Context/usersCreateContext';
import {Colors, Fonts} from '../../utils/Constants';
import {ROUTES} from '../../utils/Routes';
import {axiosGet} from '../../utils/api';
import PaginationNav from '../../Components/PaginationNav';
import SkeletonProblemCard from '../../Components/Skeleton/SkeletonProblemCard';
import {getActionsProblemSupervisor} from '../../utils/options';
import AnimatedCard from '../../Components/AnimatedCard';
import FarmerDrawerScreenWrapper1 from '../FarmerDrawerScreenWrapper1';
import FloatingActionButton from '../../Components/FloatingActionButton';
import {AlertMesg} from '../../Common/ToastAlert';
const ListProblem = ({navigation}) => {
  //GQR-67
  const {
    dbLanTokUsr,
    loginUser_data,
    CustomHeader,
    t,
    getItem,
    setItem,
    Root,
    DeviceInfo,
    effective_dates,
    navigationBarHeight,
    farmerData,
    isOnline,
    Toast,
  } = useContext(userCreateContext);
  const route = useRoute();
  const flatListRef = useRef(null);
  const {dbname, lan_id, token, user_id} = loginUser_data;
  //GQR-67
  const isFocused = useIsFocused();
  const [isLoading, setIsLoading] = useState(true);
  const [problemAll, setProblemAll] = useState([]);
  const [filterItem, setFilterItem] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [searchFarmerName, setSearchFarmerName] = useState({
    label: '',
    value: '',
  });
  const [searchFarmerPhone, setSearchFarmerPhone] = useState({
    label: '',
    value: '',
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const handleProblem = async (
    pageNo,
    search_uid = '',
    from_date = '',
    to_date = '',
    farmer_mobile = '',
    search_key_type = '',
  ) => {
    try {
      setIsLoading(true);
      let response;
      if (isOnline) {
        response = await axiosGet(
          ROUTES.GET.QUESTION_ROUTE({
            pageNo,
            user_id:
              search_key_type != undefined
                ? search_uid
                : searchFarmerName.value,
            from_date: from_date == undefined ? fromDate : from_date,
            to_date: to_date == undefined ? toDate : to_date,
            agent_id: user_id,
            farmer_mobile:
              search_key_type != undefined
                ? farmer_mobile
                : searchFarmerPhone.label,
          }),
          token,
          {information: `${dbname},${lan_id}`},
        );
        console.log('response11111', response);
        console.log('response32222', JSON.stringify(response));

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
      if (flatListRef.current) {
        flatListRef.current.scrollToOffset({offset: 0, animated: true});
      }
    } catch (error) {
      console.error('handleProblem error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (route?.params?.action === 'addData') {
      Toast.show({text: t('Data_submitted_successfully'), ...AlertMesg[0]});
      setTotalPages(1);
      handleProblem(1);
    }
  }, [route?.params]);
  useEffect(() => {
    handleProblem(page);
  }, [page]);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    requestAnimationFrame(async () => {
      await handleProblem(page);
      setRefreshing(false);
    });
  }, []);
  const filterOptionShow = useCallback(async () => {
    try {
      const {openFilterSheet} = await import('../../Components/FilterSheet');
      openFilterSheet({
        options: ['farmer', 'phone', 'date', ''],
        t: t,
        dropdownData: farmerData,
        filterItem: filterItem,
        setFilterItem: setFilterItem,
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
        height: 180,
      });
    } catch (error) {}
  }, [filterItem, searchFarmerName, searchFarmerPhone, fromDate, toDate]);
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
          1,
          farmerName?.value,
          fromDate,
          toDate,
          farmerPhone?.label,
          filter,
        );
      } catch (error) {
        console.log(error, 'error');
      }
    },
    [filterItem, fromDate, toDate, searchFarmerName, searchFarmerPhone],
  );
  const handleFilterRemove = () => {
    try {
      setFromDate('');
      setToDate('');
      setSearchFarmerName({label: '', value: ''});
      setSearchFarmerPhone({label: '', value: ''});
      setFilterItem('');
      handleProblem(1, '', '', '', '', '');
      setPage(1);
    } catch (error) {
      console.log(error);
    }
  };
  const navigateToPages = useCallback((pageName, fid) => {
    setItem('problem_id_data', fid);
    navigation.navigate(pageName);
  }, []);
  const renderCustomHeader = useMemo(
    () => <CustomHeader t={t} filterOptionShow={filterOptionShow} />,
    [filterOptionShow],
  );
  return (
    <FarmerDrawerScreenWrapper1>
      <Root>
        <SafeAreaView
          style={{flex: 1, backgroundColor: Colors.background_light}}>
          <View style={{flex: 1}}>
            {renderCustomHeader}

            <FlatList
              ref={flatListRef}
              nestedScrollEnabled={true}
              data={isLoading ? Array.from({length: 5}) : problemAll}
              renderItem={({item, index}) =>
                isLoading ? (
                  <SkeletonProblemCard Colors={Colors} Fonts={Fonts} />
                ) : (
                  <AnimatedCard
                    item={item}
                    child={
                      <TouchableOpacity
                        style={styles.problemCard}
                        onPress={() => navigateToPages('ProblemView', item.fid)}
                        activeOpacity={0.7}>
                        <View style={styles.cardHeader}>
                          <Text style={styles.problemTitle} numberOfLines={2}>
                            {t('problem_title')}:{' '}
                            {item.question_title?.length > 30
                              ? `${item.question_title.substring(0, 30)}...`
                              : item.question_title}
                          </Text>
                        </View>
                        <View style={styles.cardContent}>
                          <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>
                              {' '}
                              {item.agri_user?.userName || 'N/A'}
                            </Text>
                            {/* <Text style={styles.infoValue} numberOfLines={1}>
                              {item.agri_user?.userName || 'N/A'}
                            </Text> */}
                          </View>
                          <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>
                              {item.agri_user?.contactNumber || 'N/A'}
                            </Text>
                            {/* <Text style={styles.infoValue}>
                              {item.agri_user?.contactNumber || 'N/A'}
                            </Text> */}
                          </View>
                        </View>
                      </TouchableOpacity>
                    }
                    index={index}
                  />
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
            <FloatingActionButton
              position="right"
              actions={getActionsProblemSupervisor(t, styles, Colors)}
              color={Colors.useGreen}
              onPressItem={name => {
                navigateToPages('ProblemCreate', 123);
              }}
              showBackground={true}
              overlayColor="rgba(22, 17, 17, 0.35)"
              distanceToEdge={{vertical: 80, horizontal: 25}}
            />
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
});
