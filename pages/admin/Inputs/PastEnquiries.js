import {
  BackHandler,
  StyleSheet,
  Text,
  View,
  FlatList,
  Dimensions,
  TouchableOpacity,
  PermissionsAndroid,
  SafeAreaView,
} from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';
import DatePickerComp from '../../Common/DatePickerComp';
import { getItem, setItem } from '../../../config/getDataFromStorage';
import {
  inputEnquiryViewAPI,
  inputPastEnquiryListAPI,
  problemListAPI,
  farmerByNameAPI,
} from '../../../config/apiHere';
import Geolocation from '@react-native-community/geolocation';
import CustomHeader from '../CustomHeader';
import PastEnquiriesModel from './PastEnquiriesModel';
import Filter from '../../Common/Filter';
import LoadingScreen from '../../Common/LoadingScreen';
import {
  useRoute,
  useFocusEffect,
  useNavigation,
  useIsFocused,
} from '@react-navigation/native';
import { Root, Popup, Toast } from 'react-native-popup-confirm-toast';
import { AlertMesg } from '../../Common/ToastAlert';
import { useTranslation } from 'react-i18next';
const PastEnquiries = ({ navigation }) => {
  const isFocused = useIsFocused();
  const { t } = useTranslation();
  const route = useRoute();
  const [farmerData, setFarmerData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dbLanTokUsr, setdbLanTokUsr] = useState({});
  const [inputPastEnquiryAll, setInputPastEnquiryAll] = useState([]);
  const [inputPastEnquiryRaw, setInputPastEnquiryRaw] = useState([]);
  const [filterItem, setFilterItem] = useState('');
  const [filterOption, setFilterOption] = useState(false);
  const [newFromDate, setnewFromDate] = useState(new Date());
  const [newToDate, setnewToDate] = useState(new Date());
  const [openFromDate, setOpenFromDate] = useState(false);
  const [openToDate, setOpenToDate] = useState(false);
  const [problemFromDate, setProblemFromDate] = useState('');
  const [problemToDate, setProblemToDate] = useState('');
  const [pastEnquiries, setPastEnquiries] = useState(false);
  const [pastEnquirySingle, setPastEnquirySingle] = useState(false);
  const [pastEnquiryView, setPastEnquiryView] = useState([]);
  const [searchResultsList, setSearchResultsList] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [filterName, setFilterName] = useState('');
  const [searchFarmerName, setSearchFarmerName] = useState('');
  const [searchFarmerPhone, setSearchFarmerPhone] = useState('');
  const filterOptionShow = () => {
    setSearchResultsList(false);
    if (!filterOption) {
      setFilterOption(true);
    } else {
      setFilterOption(false);
    }
  };
  const onchangeFilterItem = value => {
    setInputPastEnquiryAll(inputPastEnquiryRaw);
    setSearchFarmerPhone('');
    setSearchFarmerName('');
    setProblemFromDate('');
    setProblemToDate('');
    setSearchResultsList(false);
    setFilterName(value);
    setFilterItem(value);
    setFilterOption(false);
  };
  const navigateToPages = async (fid, dbname, lan_id, token, user_id) => {
    const input_past_enquiry_Data = await getItem('input_past_enquiry_Data');
    const EnquiryFound = input_past_enquiry_Data.find(user => user.fid === fid);
    setPastEnquirySingle(EnquiryFound);
    const response = await inputEnquiryViewAPI(
      dbname,
      lan_id,
      token,
      user_id,
      fid,
    );
    setIsLoading(false);
    if (response) {
      setPastEnquiryView(response.data.data);
    }
    setPastEnquiries(true);
  };
  const onPageLoad = async () => {
    setIsLoading(true);
    const loginUser_data = await getItem('loginUser_data');
    if (loginUser_data) {
      const { dbname, lan_id, token, user_id } = loginUser_data;
      const [response, farmerByName] = await Promise.all([
        inputPastEnquiryListAPI(dbname, lan_id, token, user_id),
        farmerByNameAPI(dbname, lan_id, token, user_id),
      ]);
      if (farmerByName.status === 200) {
        const dataArray = [];
        farmerByName.data.data.rows.forEach(element => {
          dataArray.push({
            value: element.user_id,
            label: element.userName,
            phone: element.contactNumber,
          });
        });
        setFarmerData(dataArray);
      }
      if (response.status === 200) {
        setIsLoading(false);
        setdbLanTokUsr({
          ...dbLanTokUsr,
          dbName: dbname,
          languageId: lan_id,
          token: token,
          supervisorId: user_id,
        });
        setInputPastEnquiryAll(response.data.data.rows);
        setInputPastEnquiryRaw(response.data.data.rows);
        setItem('input_past_enquiry_Data', response.data.data.rows);
        if (route.params != undefined) {
          navigateToPages(route.params.io_oid, dbname, lan_id, token, user_id);
        }
      }
    }
  };
  const handleDatePicker = item => {
    const dt = new Date(item);
    const x = dt.toISOString().split('T');
    const x1 = x[0].split('-');
    const effective_date = x1[0] + '-' + x1[1] + '-' + x1[2];
    setProblemFromDate(effective_date);
  };
  const handleDatePicker2 = item => {
    const dt = new Date(item);
    const x = dt.toISOString().split('T');
    const x1 = x[0].split('-');
    const effective_date = x1[0] + '-' + x1[1] + '-' + x1[2];
    setProblemToDate(effective_date);
  };
  const requestCameraPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      } else {
        console.log('Location permission denied');
      }
    } catch (err) {
      console.warn(err);
    }
  };
  // useEffect(() => {
  //     onPageLoad();
  //     requestCameraPermission();
  // }, []);
  // useFocusEffect(
  //     useCallback(() => {
  //         onPageLoad();
  //         requestCameraPermission();
  //         const onBackPress = () => { navigation.navigate('InputList'); return true; };
  //         BackHandler.addEventListener('hardwareBackPress', onBackPress);
  //         return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
  //     }, [])
  // );
  const handleFilter = async search => {
    setFilterOption(false);
    if (filterName === 'Farmer/Product Name') {
      setSearchFarmerPhone('');
      setSearchFarmerName(search);
      const result = farmerData.filter(item =>
        item.label.toLowerCase().includes(search.toLowerCase()),
      );
      if (search == '') {
        setSearchResultsList(false);
        setInputPastEnquiryAll(inputPastEnquiryRaw);
      } else {
        setInputPastEnquiryAll(inputPastEnquiryRaw);
        // let tempData = inputPastEnquiryAll.filter(item => {
        //     return item.users.userName.toLowerCase().indexOf(search.toLowerCase()) > -1;;
        // });
        // setInputPastEnquiryAll(tempData)
        setSearchResultsList(true);
      }
      if (result) {
        setSearchResults(result);
      }
    } else if (filterName === 'PhoneNumber') {
      setSearchFarmerName('');
      setSearchFarmerPhone(search);
      const result = farmerData.filter(item =>
        item.phone.toLowerCase().includes(search.toLowerCase()),
      );
      if (search == '') {
        setSearchResultsList(false);
        setInputPastEnquiryAll(inputPastEnquiryRaw);
      } else {
        setInputPastEnquiryAll(inputPastEnquiryRaw);
        // let tempData = outputListAll.filter(item => {
        //     return item.users.contactNumber.toLowerCase().indexOf(search.toLowerCase()) > -1;;
        // });
        // setInputPastEnquiryAll(tempData)
        setSearchResultsList(true);
      }
      if (result) {
        setSearchResults(result);
      }
    }
  };
  const handleResultSelect = async (name, phone) => {
    setSearchResultsList(false);
    setSearchFarmerPhone(phone);
    setSearchFarmerName(name);
    setSearchResults([]);
    if (name !== '') {
      let tempData = inputPastEnquiryAll.filter(item => {
        return (
          item.users.userName.toLowerCase().indexOf(name.toLowerCase()) > -1
        );
      });
      setInputPastEnquiryAll(tempData);
      if (tempData.length === 0) {
        Toast.show({ text: 'No Data Found. ', ...AlertMesg[0] });
      }
    } else {
      let tempData = inputPastEnquiryAll.filter(item => {
        return (
          item.users.contactNumber.toLowerCase().indexOf(phone.toLowerCase()) >
          -1
        );
      });
      setInputPastEnquiryAll(tempData);
      if (tempData.length === 0) {
        Toast.show({ text: 'No Data Found. ', ...AlertMesg[0] });
      }
    }
  };
  const filterfromAndToDate = () => {
    if (problemFromDate != '' && problemToDate != '') {
      let tempData = inputPastEnquiryRaw.filter(item => {
        return (
          item.created_at.slice(0, 10) >= problemFromDate &&
          item.created_at.slice(0, 10) <= problemToDate
        );
      });
      if (tempData.length === 0) {
        Toast.show({ text: 'No Data Found. ', ...AlertMesg[0] });
      }
      setInputPastEnquiryAll(tempData);
    }
  };
  const filterDataRemove = () => {
    setSearchFarmerPhone('');
    setSearchFarmerName('');
    setFilterItem('');
    setFilterOption(false);
    setSearchResultsList(false);
    setInputPastEnquiryAll(inputPastEnquiryRaw);
  };
  useEffect(() => {
    filterfromAndToDate();
  }, [problemFromDate, problemToDate]);
  useEffect(() => {
    if (isFocused) {
      setFilterName('');
      setFilterItem('');
      setFilterOption(false);
      onPageLoad();
      requestCameraPermission();
      const onBackPress = () => {
        navigation.navigate('InputList');
        return true;
      };
      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () =>
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }
  }, [isFocused]);
  const HandlerGoBack = () => {
    navigation.navigate('InputList');
  };
  return (
    <>
      <Root>
        <View style={{ flex: 1 }}>
          <CustomHeader path="InputList" HandlerGoBack={HandlerGoBack} />
          {openFromDate && <DatePickerComp
            openDate={openFromDate}
            newDate={newFromDate}
            setOpenDate={setOpenFromDate}
            handleDatePicker={handleDatePicker}
          />}
          {openToDate && <DatePickerComp
            openDate={openToDate}
            newDate={newToDate}
            setOpenDate={setOpenToDate}
            handleDatePicker={handleDatePicker2}
            minimumDate={problemFromDate == '' ? '' : new Date(`${new Date(problemFromDate).getFullYear()}-${new Date(problemFromDate).getMonth() + 1}-${new Date(problemFromDate).getDate() + 1}`)
            }
          />}
          <Filter
            title={t('past_enq')}
            filterItem={filterItem}
            filterOption={filterOption}
            setOpenToDate={setOpenToDate}
            filterOptionShow={filterOptionShow}
            onchangeFilterItem={onchangeFilterItem}
            setOpenFromDate={setOpenFromDate}
            fromDate={problemFromDate}
            newToDate={problemToDate}
            onChangeText={item => handleFilter(item)}
            FarmerProductNameValue={searchFarmerName}
            FarmerProductPhoneValue={searchFarmerPhone}
            setFilterOption={setFilterOption}
            filterDataRemove={filterDataRemove}
          // category={true}
          />
          <SafeAreaView>
            {searchResultsList && searchResultsList ? (
              <View style={styles.flatContainer}>
                <FlatList
                  style={searchResults.length > 8 ? styles.flatlistHeight : ''}
                  data={searchResults}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() => handleResultSelect(item.label, item.phone)}
                      style={styles.flatlistitemSearch}>
                      <Text style={styles.flatlisttitle}>
                        {filterName == 'PhoneNumber' ? item.phone : item.label}
                      </Text>
                    </TouchableOpacity>
                  )}
                  keyExtractor={(item, index) => index}
                />
              </View>
            ) : (
              ''
            )}
          </SafeAreaView>
          <PastEnquiriesModel
            setModalVisible={setPastEnquiries}
            modalVisible={pastEnquiries}
            pastEnquirySingle={pastEnquirySingle}
            pastEnquiryView={pastEnquiryView}
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(0,0,0,0.5)',
            }}
          />
          {isLoading ? (
            <View style={styles.loadingScreen}>
              <LoadingScreen />
            </View>
          ) : (
            <FlatList
              data={inputPastEnquiryAll}
              renderItem={({ item }) => {
                return (
                  <TouchableOpacity
                    style={styles.wrapper}
                    onPress={() =>
                      navigateToPages(
                        item.fid,
                        dbLanTokUsr.dbName,
                        dbLanTokUsr.languageId,
                        dbLanTokUsr.token,
                        dbLanTokUsr.supervisorId,
                      )
                    }>
                    <Text style={styles.title}>
                      {t('product_name')} :{' '}
                      {item.ioProduPrice &&
                        item.ioProduPrice.mk_product.product_name}
                    </Text>
                    <View style={styles.flatListItem}>
                      <Text style={styles.title}>
                        {t('name')} : {item.users && item.users.userName}
                      </Text>
                      <Text style={styles.title}>
                        {t('far_list_number')} :{' '}
                        {item.users && item.users.contactNumber}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              }}
              keyExtractor={(item, index) => index}
            />
          )}
        </View>
      </Root>
    </>
  );
};

export default PastEnquiries;
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  item: {
    backgroundColor: '#f9c2ff',
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  title: {
    color: '#000',
    fontFamily: 'Poppins-Regular',
  },
  prevNextPage: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    position: 'relative',
    bottom: 0,
  },
  wrapper: {
    marginHorizontal: '2.5%',
    backgroundColor: '#FFF',
    marginVertical: 10,
    padding: 10,
    borderRadius: 8,
  },
  flatListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  plusIconContainer: {
    position: 'absolute',
    right: 20,
    bottom: 100,
    elevation: 5,
    zIndex: 99,
    width: 60,
    height: 60,
    backgroundColor: '#4BAE4F',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
    elevation: 3,
  },
  loadingScreen: {
    position: 'relative',
    top: 100,
    zIndex: 9999,
  },
  flatContainer: {
    backgroundColor: '#ffffff',
    position: 'absolute',
    zIndex: 999,
    bottom: 60,
    left: 0,
    marginHorizontal: '5%',
    width: '90%',
    elevation: 10,
    borderRadius: 10,
    padding: 10,
  },
  flatlistHeight: {
    height: Dimensions.get('window').height / 3.5,
  },

  flatlisttitle: {
    color: '#000',
    marginVertical: 6,
  },
});
