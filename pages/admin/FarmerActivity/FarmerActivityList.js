import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';
import React, { useState, useContext } from 'react';
import WidgetsSide from '../../Common/WidgetsSide';
import { farmerActivityListAPI } from '../../../config/apiHere';
import { useFocusEffect } from '@react-navigation/native';
import MessageDialog from '../../Common/MessageDialog';
import FarmerFilter from '../../Common/FarmerFilter';
import { userCreateContext } from '../../Context/usersCreateContext';
import { SPSheet } from 'react-native-popup-confirm-toast';
import CarbonActivityBottomSheet from '../../Common/CarbonActivityBottomSheet';

const OPTIONS = [
  { id: 'AWD', title: 'Carbon', navigation: 'FarmerActivityReportAWD' },
  { id: 'Conventional', title: 'Non-Carbon', navigation: 'FarmerActivityReport' },
];
const FarmerActivityList = ({ navigation }) => {
  //GQR-67
  const { handlePageList, dbLanTokUsr, setdbLanTokUsr, loginUser_data, effective_dates, LoadingScreen, CustomHeader, t, DatePickerComp, onBackPress, getItem, setItem, logoImage, topBanner, DeviceInfo, Root, Toast, AlertMesg } = useContext(userCreateContext);
  const { dbname, lan_id, token, user_id, carbonFlag } = loginUser_data;
  const { farmerId, pageNo } = dbLanTokUsr;
  //GQR-67
  const { netConnection } = DeviceInfo();
  const [isLoading, setIsLoading] = useState(true);
  const [activityAll, setactivityAll] = useState([]);
  const [filterOption, setFilterOption] = useState(false);
  const [filterItem, setFilterItem] = useState('');
  const [filterName, setFilterName] = useState('');
  const [newFromDate, setnewFromDate] = useState(new Date());
  const [newToDate, setnewToDate] = useState(new Date());
  const [openFromDate, setOpenFromDate] = useState(false);
  const [openToDate, setOpenToDate] = useState(false);
  const [fromDate, setfromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [fromDateFilter, setFromDateFilter] = useState('');
  const [carbonType, setCarbonType] = useState('');
  const filterOptionShow = () => {
    if (!filterOption) {
      setFilterOption(true);
    } else {
      setFilterOption(false);
    }
  };
  const onchangeFilterItem = value => {
    setFilterName(value);
    setFilterItem(value);
    setFilterOption(false);
    setCarbonType("");
  };
  const handlePage = async (value) => {
    handlePageList(value, setIsLoading, token, pageNo, farmerActivityListAPI, setactivityAll, dbname, lan_id, user_id, '', fromDate, toDate, carbonType);
  }
  const handleFilter = async item => {
    if (filterName === 'date') {
      return;
    } else {
      const from_date = '';
      const to_date = '';
      const response = await farmerActivityListAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageId, dbLanTokUsr.token, dbLanTokUsr.supervisorId, dbLanTokUsr.pageNo, item, from_date, to_date, carbonType);
      if (response) {
        setactivityAll(response.data.data.rows);
        setItem('activity_Data', response.data.data.rows);
      }
    }
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
      const item = '';
      const response = await farmerActivityListAPI(dbname, lan_id, token, user_id, pageNo, item, fromDateFilter, effective_date,);
      if (response) {
        setactivityAll(response.data.data.rows);
        setItem('activity_Data', response.data.data.rows);
      }
    } else {
      // MessageDialog({ title: 'Require', message: 'Please Select First data.' });
      Toast.show({
        time: 3, text: 'Please Select First data.', ...AlertMesg[0]
      })
    }
  };
  const navigateToPages = async (pageName, uact_id, item) => {
    setItem('uact_id_data', uact_id);
    navigation.navigate(pageName, item);
    setIsLoading(true);
  };

  const fatchActivityListAPI = async (dbName, languageId, token, supervisorId, pageNo, searchItem = '', from_date = '', to_date = '', carbonType = '') => {
    if (netConnection) {
      var response = await farmerActivityListAPI(dbName, languageId, token, supervisorId, pageNo, searchItem, from_date, to_date, carbonType);
      await setItem('farmerActivityList' + supervisorId, response);
    } else {
      var response = await getItem('farmerActivityList' + supervisorId);
    }
    if (response?.data) {
      const totalPage = Math.ceil(response.data.data.count / 20);
      setdbLanTokUsr({ ...dbLanTokUsr, totalPage: totalPage });
      setactivityAll(response.data.data.rows);
      setItem('activity_Data', response.data.data.rows);
      setIsLoading(false);
    }
  };

  const onPageLoad = async () => {
    setfromDate('');
    setToDate('');
    setFilterItem(''); setFilterOption(false);
    fatchActivityListAPI(dbname, lan_id, token, user_id, 1);
  };

  useFocusEffect(
    React.useCallback(() => {
      onPageLoad();
      onBackPress(() => { navigation.navigate('FarmerDashboard'); return true; })
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
    const response = await farmerActivityListAPI(dbname, lan_id, token, user_id, 1);
    if (response?.data) {
      setactivityAll(response.data.data.rows);
      setItem('activity_Data', response.data.data.rows);
      setIsLoading(false);
      setdbLanTokUsr({ ...dbLanTokUsr, pageNo: 1 });
    }
  };

  const handleSPSheetShow = () => {
    if (carbonFlag == true) {
      SPSheet.show({
        component: () => (
          <CarbonActivityBottomSheet index={0} spSheet={SPSheet} navigation={navigation} options={OPTIONS} />
        ),
        height: 210,
        zIndex: 1000,
      });
    } else {
      navigation.navigate('FarmerActivityReport');
    }
  }
  const onChangeCarbonType = (_item) => {
    const { label, value } = _item
    setCarbonType(value)
    fatchActivityListAPI(dbname, lan_id, token, user_id, 1, '', '', '', value);
  }
  return (
    <Root>
      <CustomHeader path="FarmerDashboard" HandlerGoBack={HandlerGoBack} logoImage={logoImage} topBanner={topBanner} />
      <View style={{ flex: 1 }}>
        <DatePickerComp openDate={openFromDate} newDate={newFromDate} setOpenDate={setOpenFromDate} handleDatePicker={handleDatePicker} />
        <DatePickerComp openDate={openToDate} newDate={newToDate} setOpenDate={setOpenToDate} handleDatePicker={handleDatePicker2} minimumDate={fromDate == '' ? '' : new Date(`${new Date(fromDate).getFullYear()}-${new Date(fromDate).getMonth() + 1}-${new Date(fromDate).getDate() + 1}`,)} />
        <WidgetsSide location={'FarmerActivityReport'} title={t('add_recent_incident')} onPress={() => handleSPSheetShow()} />

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
          carbonFlag={carbonFlag}
          onChangeCarbonType={onChangeCarbonType}
          carbonTypeVal={carbonType}
          dataActivity={[{ label: "Carbon ", value: "carbon_activity" }, { label: "Non-Carbon ", value: "user_activity" }]}
        />

        {isLoading ? (
          <LoadingScreen />
        ) : activityAll ? (
          <>
            <FlatList
              data={activityAll}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  style={styles.wrapper}
                  onPress={() =>
                    navigateToPages('FarmerActivityDetail', item.uact_id, item)
                  }>
                  <View style={styles.activityListContainer}>
                    <View style={styles.activityListItem}>
                      <Text style={styles.title}>
                        {t('pro_reg_name')} : {item.agri_user.userName}
                      </Text>
                      <Text style={styles.title}>
                        {t('reg_plot_name')} : {item.land_info.plot_no.substring(0, 5) + '...'}
                      </Text>
                      <Text style={styles.title}>
                        {t('perf_date')} : {item.act_perform_date?.substring(0, 4) + '...'}
                      </Text>
                      <Text style={styles.title}>{t('Sowing')} :  {item?.actCurel?.sowing_date?.substring(0, 10)}</Text>
                    </View>
                    <View style={styles.activityListItem}>
                      <Text style={styles.title}>
                        {t('farmer_reg_mb')} :{' '}
                        {item?.agri_user?.contactNumber?.substring(0, 7) + '..'}
                      </Text>
                      <Text style={styles.title}>
                        {t('far_list_crop')} :{' '}
                        {item?.cropName?.name?.substring(0, 7) + '..'}
                      </Text>
                      <Text style={styles.title}>
                        {t('deviation')} : {item?.deviation} Day
                      </Text>
                      <Text style={styles.title}>{t('Harvesting')} : {item?.actCurel?.harvesting_date?.substring(0, 10)}</Text>
                    </View>
                  </View>
                  <Text style={styles.title}>
                    {t('pick_crop_cycle_start_date')} : {item?.cycle_start_date}
                  </Text>
                  <Text style={styles.title}>
                    {t('act_name')} :
                    {item?.typeActivity ? item?.typeActivity?.categoryName : ''}
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
    </Root>
  );
};

export default FarmerActivityList;

const styles = StyleSheet.create({
  wrapper: {
    borderColor: '#efe9e9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    borderRadius: 7,
    elevation: 3,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 7,
    marginVertical: 7,
    paddingVertical: 15,
    marginHorizontal: '2.5%',
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
    shadowOffset: { width: 0, height: 2 },
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
