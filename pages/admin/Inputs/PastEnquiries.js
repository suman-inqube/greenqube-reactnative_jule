import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Dimensions,
  TouchableOpacity,
  PermissionsAndroid,
  SafeAreaView,
  RefreshControl,
  Alert,
} from 'react-native';
import React, {
  useState,
  useEffect,
  useCallback,
  useContext,
  lazy,
  useMemo,
} from 'react';
import DatePickerComp from '../../Common/DatePickerComp';
import {
  inputEnquiryViewAPI,
  inputPastEnquiryListAPI,
} from '../../../config/apiHere';
const PastEnquiriesModel = lazy(() => import('./PastEnquiriesModel'));
import {useRoute, useIsFocused} from '@react-navigation/native';
import {userCreateContext} from '../../Context/usersCreateContext';
import FarmerDrawerScreenWrapper1 from '../FarmerDrawerScreenWrapper1';
import {Colors, Fonts} from '../../utils/Constants';
import {axiosGet} from '../../utils/api';
import {ROUTES} from '../../utils/Routes';
import AnimatedCard from '../../Components/AnimatedCard';
import SkeletonProblemCard from '../../Components/Skeleton/SkeletonProblemCard';

const PastEnquiries = ({navigation}) => {
  //GQR-67
  const {
    loginUser_data,
    CustomHeader,
    t,
    AlertMesg,
    getItem,
    setItem,
    logoImage,
    topBanner,
    Root,
    Toast,
    farmerData,
    effective_dates,
    navigationBarHeight,
  } = useContext(userCreateContext);
  const {dbname, lan_id, token, user_id} = loginUser_data;
  //GQR-67
  const route = useRoute();
  const [isLoading, setIsLoading] = useState(false);
  const [inputPastEnquiryAll, setInputPastEnquiryAll] = useState([]);
  const [pastEnquiries, setPastEnquiries] = useState(false);
  const [pastEnquirySingle, setPastEnquirySingle] = useState(false);
  const [pastEnquiryView, setPastEnquiryView] = useState([]);
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
  const [refreshing, setRefreshing] = useState(false);

  const [result, setresult] = useState({
    qty: '',
    total: '',
    grandTotal: '',
    disTotal: '',
  });
  const [currency, setcurrency] = useState('');
  const navigateToPages = useCallback(
    async (fid, dbname, lan_id, token, user_id) => {
      const [input_past_enquiry_Data, response] = await Promise.all([
        await getItem('input_past_enquiry_Data'),

        axiosGet(
          ROUTES.GET.INPUT_ENQUIRY_VIEW({farmer_id: fid}),

          token,
          {information: `${dbname},${lan_id},${user_id}`},
        ),

        // inputEnquiryViewAPI(dbname, lan_id, token, user_id, fid),
      ]);

      const EnquiryFound = input_past_enquiry_Data.find(
        user => user.fid === fid,
      );

      setPastEnquirySingle(EnquiryFound);
      setIsLoading(false);
      if (response?.status == 200) {
        setPastEnquiries(true);
        setPastEnquiryView(response?.data?.data);
        var qty = 0;
        var grandTotal = 0;
        var disTotal = 0;
        var total = 0;
        response?.data?.data.map((data, index) => {
          qty = qty + parseFloat(data.sqty);
          grandTotal = grandTotal + parseFloat(data.sgrand_total);
          disTotal = disTotal + parseFloat(data.sdiscount);
          total = total + parseFloat(data.total_samount);
        });

        const quantityDisplay = EnquiryFound
          ? `${qty}/${EnquiryFound.pp_qty} ${EnquiryFound.unit_id}`
          : `${qty}`;

        setresult({
          ...result,
          qty: quantityDisplay,
          total: total,
          grandTotal: grandTotal,
          disTotal: disTotal,
        });
      }
    },
    [],
  );
  const onPageLoad = async (
    farmer_id = '',
    farmer_mobile = '',
    from_date = '',
    to_date = '',
  ) => {
    setIsLoading(true);
    const [response, curr] = await Promise.all([
      axiosGet(
        ROUTES.GET.INPUT_PAST_ENQUIRY_LIST({
          farmer_id: farmer_id,
          from_date: from_date,
          to_date: to_date,
          farmer_mobile: farmer_mobile,
        }),
        token,
        {information: `${dbname},${lan_id}`},
      ),

      // inputPastEnquiryListAPI(
      //   dbname,
      //   lan_id,
      //   token,
      //   user_id,
      //   farmer_id,
      //   farmer_mobile,
      //   from_date,
      //   to_date,
      // ),
      getItem('currency'),
    ]);
    console.log('response123', response);
    if (response?.status === 200) {
      setIsLoading(false);
      setcurrency(curr);
      setInputPastEnquiryAll(response?.data?.data?.rows);
      setItem('input_past_enquiry_Data', response?.data?.data?.rows);
      // console.log('input_past_enquiry_Data', response?.data?.data?.rows);
      if (route?.params != undefined) {
        navigateToPages(route?.params?.io_oid, dbname, lan_id, token, user_id);
      }
    }
  };
  useEffect(() => {
    onPageLoad();
  }, []);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    requestAnimationFrame(async () => {
      await onPageLoad();
      setRefreshing(false);
    });
  }, []);
  const filterOptionShow = useCallback(async () => {
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
      navigationBarHeight: navigationBarHeight,
      height: 180,
    });
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
        // fetchActivityListAPI(
        //   1,
        //   fromDate,
        //   toDate,
        //   search_key_val,
        //   sheetCarbonType?.value,
        //   filter,
        // );

        onPageLoad(farmerName?.value, farmerPhone?.label, fromDate, toDate);
      } catch (error) {
        console.error(error)
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
      onPageLoad();
    } catch (error) {
      console.error(error);
    }
  };
  const renderCustomHeader = useMemo(
    () => (
      <CustomHeader
        logoImage={logoImage}
        topBanner={topBanner}
        filterOptionShow={filterOptionShow}
        t={t}
      />
    ),
    [filterOptionShow],
  );
  const filteredEnquiries = useMemo(() => {
    return inputPastEnquiryAll.filter(item => item.type !== 'vendor_order');
  }, [inputPastEnquiryAll]);
  return (
    <FarmerDrawerScreenWrapper1>
      <>
        <Root>
          <View style={{flex: 1, backgroundColor: Colors.background_light}}>
            {renderCustomHeader}
            {pastEnquiries && (
              <PastEnquiriesModel
                setModalVisible={setPastEnquiries}
                modalVisible={pastEnquiries}
                pastEnquirySingle={pastEnquirySingle}
                pastEnquiryView={pastEnquiryView}
                qty={result}
                style={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(0,0,0,0.5)',
                }}
                currency={currency}
                t={t}
              />
            )}

            <FlatList
              data={isLoading ? Array.from({length: 5}) : filteredEnquiries}
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
                        }>
                        <View style={styles.cardHeader}>
                          <Text style={styles.problemTitle} numberOfLines={2}>
                            {t('product_name')} :
                            {item.ioProduPrice &&
                              item.ioProduPrice.mk_product.product_name}
                          </Text>
                        </View>
                        <View style={styles.cardContent}>
                          <View style={styles.infoRow}>
                            {/* <Text style={styles.infoLabel}>{t('name')}:</Text> */}
                            <Text style={styles.infoValue} numberOfLines={1}>
                              {item.users && item.users.userName}
                            </Text>
                          </View>
                          <View style={styles.infoRow}>
                            {/* <Text style={styles.infoLabel}>
                              {t('far_list_number')} :
                            </Text> */}
                            <Text style={styles.infoValue}>
                              {item.users && item.users.contactNumber}
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
              keyExtractor={(item, index) => index}
              onEndReachedThreshold={0.5}
              contentContainerStyle={styles.listContainer}
              removeClippedSubviews={true}
              maxToRenderPerBatch={5}
              updateCellsBatchingPeriod={20}
              windowSize={5}
            />
          </View>
        </Root>
      </>
    </FarmerDrawerScreenWrapper1>
  );
};

export default PastEnquiries;
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
    marginHorizontal: 5,
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
    // flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
