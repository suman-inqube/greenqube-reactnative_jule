import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  Dimensions,
} from 'react-native';
import ViewModalPast from './ViewModalPast';
import React, {
  useState,
  useEffect,
  useContext,
  useCallback,
  useMemo,
} from 'react';
import {
  outputListAPI,
  SupervisoroutputEnquiryViewAPI,
} from '../../../config/apiHere';
import {formatDateToMMDDYYYY} from '../../Common/DateChanger';
import MessageDialog from '../../Common/MessageDialog';
import {useRoute, useIsFocused} from '@react-navigation/native';
import {userCreateContext} from '../../Context/usersCreateContext';
import {Colors, Fonts} from '../../utils/Constants';
import AnimatedCard from '../../Components/AnimatedCard';
import SkeletonProblemCard from '../../Components/Skeleton/SkeletonProblemCard';
import {getActionsPostNew} from '../../utils/options';
import {axiosGet} from '../../utils/api';
import {ROUTES} from '../../utils/Routes';
import FarmerDrawerScreenWrapper1 from '../FarmerDrawerScreenWrapper1';
import FloatingActionButton from '../../Components/FloatingActionButton';
const OutPut = ({navigation}) => {
  //GQR-67
  const {
    loginUser_data,
    t,
    AlertMesg,
    Root,
    navigationBarHeight,
    setItem,
    effective_dates,
    Toast,
    getItem,
    farmerData,
    CustomHeader,
  } = useContext(userCreateContext);
  const {dbname, lan_id, token, user_id} = loginUser_data;
  //GQR-67
  const route = useRoute();
  const isFocused = useIsFocused();
  const [searchResults, setSearchResults] = useState([]);
  const [filterOption, setFilterOption] = useState(false);
  const [filterItem, setFilterItem] = useState('');
  const [filterName, setFilterName] = useState('');
  const [newFromDate, setnewFromDate] = useState(new Date());
  const [newToDate, setnewToDate] = useState(new Date());
  const [openFromDate, setOpenFromDate] = useState(false);
  const [openToDate, setOpenToDate] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [fromDateFilter, setFromDateFilter] = useState('');
  const [searchResultsList, setSearchResultsList] = useState(false);
  const [searchFarmerName, setSearchFarmerName] = useState('');
  const [searchFarmerPhone, setSearchFarmerPhone] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [outputListAll, setOutputListAll] = useState([]);
  const [outputListAllRaw, setOutputListRaw] = useState([]);
  const [outputSingle, setOutputSingle] = useState();
  const [pastEnquiryView, setPastEnquiryView] = useState([]);
  const [result, setresult] = useState({qty: '', total: ''});
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const onchangeFilterItem = value => {
    setOutputListAll(outputListAllRaw);
    setSearchFarmerPhone('');
    setSearchFarmerName('');
    setfromDate('');
    setToDate('');
    setFilterName(value);
    setFilterItem(value);
    setFilterOption(false);
  };
  const handleDatePicker = item => {
    const effective_date = effective_dates(item);
    setfromDate(effective_date);
    setFromDateFilter(effective_date);
  };
  const handleDatePicker2 = async item => {
    const effective_date = effective_dates(item);
    setToDate(effective_date);
    if (fromDateFilter) {
      let farmer_id = '';
      let fromDate = fromDateFilter;
      let toDate = effective_date;
      let mobileNo = '';
      const outputList = await outputListAPI(
        dbname,
        lan_id,
        token,
        user_id,
        farmer_id,
        fromDate,
        toDate,
        mobileNo,
      );
      if (outputList.status === 200) {
        if (outputList.data.data.rows.length === 0) {
          Toast.show({text: t('no_data_found'), ...AlertMesg[0]});
        }
        setOutputListAll(outputList.data.data.rows);
        setItem('output_data', outputList.data.data.rows);
      }
    } else {
      // MessageDialog({ title: 'Require', message: 'Please Select First data.' })
      Toast.show({text: 'Please Select First data.', ...AlertMesg[0]});
    }
  };
  const navigateToPages = async (fid, dbname, lan_id, token, user_id) => {
    const output_data = await getItem('output_data');
    const outputFound = output_data.find(user => user.fid === fid);
    setIsLoading(false);
    setOutputSingle(outputFound);
    const response = await SupervisoroutputEnquiryViewAPI(
      dbname,
      lan_id,
      token,
      user_id,
      fid,
    );
    if (response?.status == 200) {
      setPastEnquiryView(response?.data?.data);
      var qty = 0;
      var total = 0;
      response?.data?.data.map((data, index) => {
        qty = qty + parseFloat(data.pro_qty);
        total = total + parseFloat(data.grand_total);
      });
      setresult({...result, qty: qty, total: total});
    }
    setModalVisible(true);
  };
  const handleFilter = async search => {
    if (filterName === 'Farmer/Product Name') {
      setSearchFarmerPhone('');
      setSearchFarmerName(search);
      const result = farmerData.filter(item =>
        item.label.toLowerCase().includes(search.toLowerCase()),
      );
      if (search == '') {
        setSearchResultsList(false);
        setOutputListAll(outputListAllRaw);
      } else {
        // let tempData = outputListAll.filter(item => {
        //     return item.users.userName.toLowerCase().indexOf(search.toLowerCase()) > -1;;
        // });
        // if(tempData.length===0){
        //     Toast.show({ text: t('no_data_found'), ...AlertMesg[0] })
        // }
        // setOutputListAll(tempData)
        setSearchResultsList(true);
      }
      if (result) {
        setSearchResults(result);
      }
    } else if (filterName === 'PhoneNumber') {
      // console.log(search);
      setSearchFarmerName('');
      setSearchFarmerPhone(search);
      const result = farmerData.filter(item =>
        item.phone.toLowerCase().includes(search.toLowerCase()),
      );
      if (search == '') {
        setSearchResultsList(false);
        setOutputListAll(outputListAllRaw);
      } else {
        // let tempData = outputListAll.filter(item => {
        //     return item.users.contactNumber.toLowerCase().indexOf(search.toLowerCase()) > -1;;
        // });
        // if(tempData.length===0){
        //     Toast.show({ text: t('no_data_found'), ...AlertMesg[0] })
        // }
        // setOutputListAll(tempData)
        // setData(tempData);
        setSearchResultsList(true);
      }
      if (result) {
        setSearchResults(result);
      }
    }
  };
  const onPageLoad = async (
    farmer_id,
    farmer_mobile = '',
    from_date = '',
    to_date = '',
  ) => {
    setIsLoading(true);
    const outputList = await axiosGet(
      ROUTES.GET.INPUT_OUTPUT_ROUTE({
        farmer_id: farmer_id,
        from_date,
        to_date,
        agent_id: '',
        farmer_mobile: farmer_mobile,
      }),
      token,
      {information: `${dbname},${lan_id},${user_id}`},
    );
    if (outputList?.status == 200) {
      setOutputListAll(outputList.data.data.rows);
      setOutputListRaw(outputList.data.data.rows);
      await setItem('output_data', outputList.data.data.rows);
    }
    setIsLoading(false);
  };
  useEffect(() => {
    setFilterName('');
    setFilterItem('');
    setFilterOption(false);
    onPageLoad();
  }, []);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    requestAnimationFrame(async () => {
      await onPageLoad();
      setRefreshing(false);
    });
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
    } catch (error) {
      console.log(error);
    }
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
        onPageLoad(
          farmerName?.value,
          farmerPhone?.label,
          fromDate,
          toDate,
          // filter,
        );
      } catch (error) {
        console.log(error, 'error');
      }
    },
    [],
  );
  const handleFilterRemove = () => {
    try {
      setFromDate('');
      setToDate('');
      setSearchFarmerName({label: '', value: ''});
      setSearchFarmerPhone({label: '', value: ''});
      setCarbonType({label: '', value: ''});
      setFilterItem('');
      onPageLoad();
      setPage(1);
    } catch (error) {
      console.log(error);
    }
  };
  const handleSPSheetShow = useCallback(() => {
    navigation.navigate('PostNew');
  }, []);
  const renderCustomHeader = useMemo(
    () => <CustomHeader t={t} filterOptionShow={filterOptionShow} />,
    [],
  );
  return (
    <FarmerDrawerScreenWrapper1>
      <Root>
        <View style={{flex: 1, backgroundColor: Colors.background_light}}>
          {renderCustomHeader}

          <ViewModalPast
            setModalVisible={setModalVisible}
            modalVisible={modalVisible}
            outputSingle={outputSingle}
            pastEnquiryView={pastEnquiryView}
            qty={result}
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(0,0,0,0.5)',
            }}
          />

          <FlatList
            data={isLoading ? Array.from({length: 5}) : outputListAll}
            renderItem={({item, index}) =>
              isLoading ? (
                <SkeletonProblemCard Colors={Colors} Fonts={Fonts} />
              ) : (
                <AnimatedCard
                  item={item}
                  child={
                    <TouchableOpacity
                      style={styles.problemCard}
                      onPress={() =>
                        navigateToPages(
                          item.fid,
                          dbname,
                          lan_id,
                          token,
                          user_id,
                        )
                      }
                      key={index}>
                      <View style={styles.cardHeader}>
                        <Text style={styles.problemTitle} numberOfLines={2}>
                          {t('crop_name')}:
                          {item.io_crop_name &&
                            item.io_crop_name.name.substring(0, 5)}
                          {item.io_crop_name &&
                          item.io_crop_name.name.length > 6
                            ? '...'
                            : null}
                        </Text>
                      </View>
                      <View style={styles.cardContent}>
                        <View style={styles.infoRow}>
                          <Text style={styles.infoLabel}>{t('name')}:</Text>
                          <Text style={styles.infoValue} numberOfLines={1}>
                            {item?.users?.userName.substring(0, 10)}
                            {item?.users?.userName.length > 10 ? '...' : null}
                          </Text>
                        </View>
                        <View style={styles.infoRow}>
                          <Text style={styles.infoLabel}>
                            {t('ist_variety')}:
                          </Text>
                          <Text style={styles.infoValue}>
                            {item.io_crop_variety &&
                              item.io_crop_variety.name.substring(0, 10)}
                            {item.io_crop_variety &&
                            item.io_crop_variety.name.length > 14
                              ? '...'
                              : null}
                          </Text>
                        </View>
                        <View style={styles.infoRow}>
                          <Text style={styles.infoLabel}>{t('date')}:</Text>
                          <Text style={styles.infoValue}>
                            {formatDateToMMDDYYYY(item.date)}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  }
                  index={index}
                />
              )
            }
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[Colors.green]}
                tintColor={Colors.green}
              />
            }
            keyExtractor={(item, index) => `problem_${item?.fid || index}`}
            onEndReachedThreshold={0.5}
            contentContainerStyle={styles.listContainer}
            removeClippedSubviews={true}
            maxToRenderPerBatch={5}
            updateCellsBatchingPeriod={20}
            windowSize={5}
          />
          <FloatingActionButton
            position="right"
            actions={getActionsPostNew(t, styles, Colors)}
            color={Colors.useGreen}
            onPressItem={name => {
              handleSPSheetShow();
            }}
            showBackground={true}
            overlayColor="rgba(22, 17, 17, 0.35)"
            distanceToEdge={{vertical: 80, horizontal: 25}}
          />
        </View>
      </Root>
    </FarmerDrawerScreenWrapper1>
  );
};
export default OutPut;

const styles = StyleSheet.create({
  flatListContainer: {
    marginHorizontal: '2.5%',
    flexDirection: 'row',
    backgroundColor: '#FFF',
    padding: 10,
    marginBottom: 10,
    borderRadius: 10,
    elevation: 5,
  },
  flatListItem: {
    width: '50%',
  },
  flatlistitemSearch: {
    marginBottom: 10,
  },
  plusIcon: {
    width: 50,
    height: 50,
    position: 'absolute',
    top: '50%',
    right: 20,
    zIndex: 999,
    elevation: 5,
  },
  flatContainer: {
    backgroundColor: '#ffffff',
    position: 'absolute',
    zIndex: 999,
    top: '10%',
    left: 0,
    marginHorizontal: '5%',
    width: '90%',
    elevation: 10,
    borderRadius: 10,
    padding: 10,
  },
  flatlistHeight: {
    height: Dimensions.get('window').height / 2.5,
  },

  flatlisttitle: {
    color: '#000',
    marginVertical: 6,
  },
  flatlistitem: {},
  title: {
    color: '#000000',
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
  },
  loadingScreen: {
    position: 'relative',
    top: 100,
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
