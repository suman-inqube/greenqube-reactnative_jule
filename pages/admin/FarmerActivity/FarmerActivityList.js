import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  StatusBar,
  BackHandler,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import ImageForm from '../../Common/ImageForm';
import RadioForm from '../../Common/RadioForm';
import DatePickerComp from '../../Common/DatePickerComp';
import WidgetsSide from '../../Common/WidgetsSide';
import Filter from '../../Common/Filter';
import {farmerActivityListAPI} from '../../../config/apiHere';
import {getItem, setItem} from '../../../config/getDataFromStorage';
import FarmerActivityDetail from './FarmerActivityDetail';
import FarmerActivityReport from './FarmerActivityReport';
import LoadingScreen from '../../Common/LoadingScreen';
import {useFocusEffect} from '@react-navigation/native';
import CustomHeader from '../CustomHeader';
import MessageDialog from '../../Common/MessageDialog';
import {useTranslation} from 'react-i18next';
import FarmerFilter from '../../Common/FarmerFilter';
import DeviceInfo from '../../DeviceInfo';
const FarmerActivityList = ({navigation}) => {
  const {t} = useTranslation();
  const {netConnection} = DeviceInfo();
  const [isLoading, setIsLoading] = useState(true);
  const [reloadList, setReloadList] = useState(false);
  const [activityAll, setactivityAll] = useState([]);
  const [filterOption, setFilterOption] = useState(false);
  const [filterItem, setFilterItem] = useState('');
  const [filterName, setFilterName] = useState('');
  const [newFromDate, setnewFromDate] = useState(new Date());
  const [newToDate, setnewToDate] = useState(new Date());
  const [openFromDate, setOpenFromDate] = useState(false);
  const [openToDate, setOpenToDate] = useState(false);
  const [dbName, setDbName] = useState('');
  const [languageID, setLanguageID] = useState('');
  const [userID, setUserID] = useState('');
  const [token, setToken] = useState('');
  const [totalPage, settotalPage] = useState(1);
  const [currentPage, setcurrentPage] = useState(1);
  const [showMenu, setshowMenu] = useState('');
  const [farmerID, setfarmerID] = useState();
  const [fromDate, setfromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [dbLanTokUsr, setdbLanTokUsr] = useState({
    pageNo: 1,
  });
  const [fromDateFilter, setFromDateFilter] = useState('');

  const filterOptionShow = () => {
    if (!filterOption) {
      setFilterOption(true);
    } else {
      setFilterOption(false);
    }
  };
  const onchangeFilterItem = value => {
    // console.warn(value);
    // return;
    setFilterName(value);
    setFilterItem(value);
    setFilterOption(false);
  };

  const handlePage = async value => {
    // console.warn(dbLanTokUsr);
    const currentPageNo = dbLanTokUsr.pageNo;
    const totalPage = dbLanTokUsr.totalPage;

    if (value === 'next') {
      if (totalPage === currentPageNo) {
        const response = await farmerActivityListAPI(
          dbLanTokUsr.dbName,
          dbLanTokUsr.languageId,
          dbLanTokUsr.token,
          dbLanTokUsr.supervisorId,
          currentPage,
        );
        if (response) {
          setactivityAll(response.data.data.rows);
          setItem('activity_Data', response.data.data.rows);
        }
      } else {
        const nextPage = currentPageNo + 1;
        setdbLanTokUsr({...dbLanTokUsr, pageNo: nextPage});
        const response = await farmerActivityListAPI(
          dbLanTokUsr.dbName,
          dbLanTokUsr.languageId,
          dbLanTokUsr.token,
          dbLanTokUsr.supervisorId,
          nextPage,
        );
        if (response) {
          setactivityAll(response.data.data.rows);
          setItem('activity_Data', response.data.data.rows);
        }
      }
    }

    if (value === 'previous') {
      if (currentPageNo === 1) {
        const response = await farmerActivityListAPI(
          dbLanTokUsr.dbName,
          dbLanTokUsr.languageId,
          dbLanTokUsr.token,
          dbLanTokUsr.supervisorId,
          currentPage,
        );
        if (response) {
          setactivityAll(response.data.data.rows);
          setItem('activity_Data', response.data.data.rows);
        }
      } else {
        const prePage = currentPageNo - 1;
        setdbLanTokUsr({...dbLanTokUsr, pageNo: prePage});
        const response = await farmerActivityListAPI(
          dbLanTokUsr.dbName,
          dbLanTokUsr.languageId,
          dbLanTokUsr.token,
          dbLanTokUsr.supervisorId,
          prePage,
        );
        if (response) {
          setactivityAll(response.data.data.rows);
          setItem('activity_Data', response.data.data.rows);
        }
      }
    }
  };

  const handleFilter = async item => {
    // return console.warn(item);
    if (filterName === 'date') {
      return;
    } else {
      const from_date = '';
      const to_date = '';
      const response = await farmerActivityListAPI(
        dbLanTokUsr.dbName,
        dbLanTokUsr.languageId,
        dbLanTokUsr.token,
        dbLanTokUsr.supervisorId,
        dbLanTokUsr.pageNo,
        item,
        from_date,
        to_date,
      );
      if (response) {
        setactivityAll(response.data.data.rows);
        setItem('activity_Data', response.data.data.rows);
      }
    }
  };

  const handleDatePicker = item => {
    const dt = new Date(item);
    const x = dt.toISOString().split('T');
    const x1 = x[0].split('-');
    const effective_date = x1[0] + '-' + x1[1] + '-' + x1[2];
    setfromDate(effective_date);
    setFromDateFilter(effective_date);
    // console.log(fromAndToDate);
  };
  const handleDatePicker2 = async item => {
    const dt = new Date(item);
    const x = dt.toISOString().split('T');
    const x1 = x[0].split('-');
    const effective_date = x1[0] + '-' + x1[1] + '-' + x1[2];
    setToDate(effective_date);
    if (fromDateFilter) {
      const item = '';
      const response = await farmerActivityListAPI(
        dbLanTokUsr.dbName,
        dbLanTokUsr.languageId,
        dbLanTokUsr.token,
        dbLanTokUsr.supervisorId,
        dbLanTokUsr.pageNo,
        item,
        fromDateFilter,
        effective_date,
      );
      if (response) {
        setactivityAll(response.data.data.rows);
        setItem('activity_Data', response.data.data.rows);
      }
    } else {
      MessageDialog({title: 'Require', message: 'Please Select First data.'});
    }
  };

  const navigateToPages = async (pageName, uact_id) => {
    setItem('uact_id_data', uact_id);
    navigation.navigate(pageName);
    setIsLoading(true);
  };

  const fatchActivityListAPI = async (
    dbName,
    languageId,
    token,
    supervisorId,
    pageNo,
  ) => {
    if (netConnection) {
      var response = await farmerActivityListAPI(
        dbName,
        languageId,
        token,
        supervisorId,
        pageNo,
      );
      await setItem('farmerActivityList' + supervisorId, response);
    } else {
      var response = await getItem('farmerActivityList' + supervisorId);
    }
    if (response.data) {
      const totalPage = Math.ceil(response.data.data.count / 20);
      setdbLanTokUsr({
        ...dbLanTokUsr,
        dbName: dbName,
        languageId: languageId,
        token: token,
        supervisorId: supervisorId,
        totalPage: totalPage,
      });
      setactivityAll(response.data.data.rows);
      setItem('activity_Data', response.data.data.rows);
      setIsLoading(false);
    }
  };

  const onPageLoad = async () => {
    setfromDate('');
    setToDate('');
    setFilterItem(''), setFilterOption(false);
    const loginUser_data = await getItem('loginUser_data');
    if (loginUser_data) {
      const dbName = loginUser_data.dbname;
      const languageId = loginUser_data.lan_id;
      const token = loginUser_data.token;
      const supervisorId = loginUser_data.user_id;
      fatchActivityListAPI(dbName, languageId, token, supervisorId, 1);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      onPageLoad();
      const onBackPress = () => {
        navigation.navigate('FarmerDashboard');
        return true;
      };
      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () =>
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [netConnection]),
  );
  const HandlerGoBack = () => {
    navigation.navigate('FarmerDashboard');
  };
  const filterDataRemove = async () => {
    setFilterItem('');
    setFilterOption(false);
    setToDate('');
    setfromDate('');
    const response = await farmerActivityListAPI(
      dbLanTokUsr.dbName,
      dbLanTokUsr.languageId,
      dbLanTokUsr.token,
      dbLanTokUsr.supervisorId,
      '1',
    );
    if (response.data) {
      setactivityAll(response.data.data.rows);
      setItem('activity_Data', response.data.data.rows);
      setIsLoading(false);
      setdbLanTokUsr({...dbLanTokUsr, pageNo: 1});
    }
  };
  return (
    <>
      <CustomHeader path="FarmerDashboard" HandlerGoBack={HandlerGoBack} />
      <View style={{flex: 1}}>
        <DatePickerComp
          openDate={openFromDate}
          newDate={newFromDate}
          setOpenDate={setOpenFromDate}
          handleDatePicker={handleDatePicker}
        />
        <DatePickerComp
          openDate={openToDate}
          newDate={newToDate}
          setOpenDate={setOpenToDate}
          handleDatePicker={handleDatePicker2}
          minimumDate={
            fromDate == ''
              ? ''
              : new Date(
                  `${new Date(fromDate).getFullYear()}-${
                    new Date(fromDate).getMonth() + 1
                  }-${new Date(fromDate).getDate() + 1}`,
                )
          }
        />

        <WidgetsSide
          location={'FarmerActivityReport'}
          title={t('add_recent_incident')}
          onPress={() => navigateToPages('FarmerActivityReport', 123)}
        />

        <FarmerFilter
          filterItem={filterItem}
          filterOption={filterOption}
          setOpenToDate={setOpenToDate}
          fromDate={fromDate}
          newToDate={toDate}
          setOpenFromDate={setOpenFromDate}
          filterOptionShow={filterOptionShow}
          onchangeFilterItem={onchangeFilterItem}
          onChangeText={item => handleFilter(item)}
          title={t('my_activities')}
          // filterItem={'Date'}
          onlyDate={true}
          filterDataRemove={filterDataRemove}
        />

        {isLoading ? (
          <LoadingScreen />
        ) : activityAll ? (
          <>
            <FlatList
              data={activityAll}
              renderItem={({item, index}) => (
                <TouchableOpacity
                  style={styles.wrapper}
                  onPress={() =>
                    navigateToPages('FarmerActivityDetail', item.uact_id)
                  }>
                  <View style={styles.activityListContainer}>
                    <View style={styles.activityListItem}>
                      <Text style={styles.title}>
                        {t('pro_reg_name')} : {item.agri_user.userName}
                      </Text>
                      <Text style={styles.title}>
                        {t('reg_plot_name')} : {item.land_info.plot_no}
                      </Text>
                      <Text style={styles.title}>
                        {t('perf_date')} : {item.act_perform_date}
                      </Text>
                    </View>
                    <View style={styles.activityListItem}>
                      <Text style={styles.title}>
                        {t('farmer_reg_mb')} :{' '}
                        {item.agri_user.contactNumber.substring(0, 7) + '..'}
                      </Text>
                      <Text style={styles.title}>
                        {t('far_list_crop')} :{' '}
                        {item.cropName.name.substring(0, 7) + '..'}
                      </Text>
                      <Text style={styles.title}>
                        {t('deviation')} : {item.deviation} Day
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.title}>
                    {t('pick_crop_cycle_start_date')} : {item.cycle_start_date}
                  </Text>
                  <Text style={styles.title}>
                    {t('act_name')} :
                    {item.typeActivity ? item.typeActivity.categoryName : ''}
                  </Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item, index) => index}
              showsVerticalScrollIndicator={false}
            />

            <View style={styles.prevNextPage}>
              <TouchableOpacity onPress={() => handlePage('previous')}>
                <Text style={styles.title}>{t('prev_page')}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handlePage('next')}>
                <Text style={styles.title}>{t('next_page')}</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          ''
        )}
      </View>
    </>
  );
};

export default FarmerActivityList;

const styles = StyleSheet.create({
  wrapper: {
    borderColor: '#efe9e9',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.5,
    shadowRadius: 2,
    borderRadius: 7,
    elevation: 3,
    backgroundColor: '#FFFFFF',
    // marginHorizontal: 15,
    paddingHorizontal: 7,
    marginVertical: 7,
    paddingVertical: 15,
    marginHorizontal: '2.5%',
    // height: 100,
  },
  activityListContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activityListItem: {
    paddingBottom: 1,
  },
  title: {
    color: '#000',
    lineHeight: 25,
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
  },
  prevNextPage: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    position: 'relative',
    bottom: 0,
  },
  OptionWrapper: {
    borderColor: '#efe9e9',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.5,
    shadowRadius: 2,
    borderRadius: 7,
    elevation: 3,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 15,
    marginVertical: 7,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
});
