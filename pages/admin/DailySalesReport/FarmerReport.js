import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  FlatList,
  Dimensions,
  BackHandler,
} from 'react-native';
import React, {useState, useEffect, useCallback, useContext} from 'react';
import TakePhoto from '../Activity/TakePhoto';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {
  loanRouteFarmerListAPI,
  produceAgainstPlotAPI,
  FarmerDailysalesreportAdd,
} from '../../../config/apiHere';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {userCreateContext} from '../../Context/usersCreateContext';
import FarmerDrawerScreenWrapper1 from '../FarmerDrawerScreenWrapper1';
import {Colors, Fonts} from '../../utils/Constants';

const FarmerReport = () => {
  //GQR-67
  const {
    loginUser_data,
    CustomHeader,
    t,
    AlertMesg,
    onBackPress,
    logoImage,
    topBanner,
    Root,
    Toast,
    effective_dates,
    ButtonForm,
    DropdownForm,
    FormsTitle,
    InputTextForm,
    DatePickerComp,
  } = useContext(userCreateContext);
  const {dbname, lan_id, token, user_id} = loginUser_data;
  //GQR-67
  const navigation = useNavigation();
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [newDate, setnewDate] = useState(new Date());
  const [openNewDate, setopenNewDate] = useState(false);
  const [date, setDate] = useState('');
  const [selectedImage, setSelectedImage] = useState({
    firstItem: '',
    secondItem: '',
    thirdItem: '',
  });
  const [loanFarmerList, setloanFarmerList] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchResultsList, setSearchResultsList] = useState(false);
  const [searchFarmerName, setSearchFarmerName] = useState('');
  const [plotAll, setplotAll] = useState([]);
  const [myphoto, setmyPhoto] = useState([]);
  const [saveData, setSaveData] = useState({
    plot_id: '',
    type: 'farmer_sales_report',
    status: 1,
    comment: '',
  });
  const [nameVarityStartEnd, setNameVarityStartEnd] = useState({
    name: '',
    varity: '',
    cycleStarts: '',
    cycleEnd: '',
  });
  const [farmerID, setfarmerID] = useState('');
  const handleDatePicker = item => {
    const effective_date = effective_dates(item);
    setDate(effective_date);
  };
  const openImagePicker = item => {
    const options = {
      mediaType: 'photo',
      includeBase64: true,
      maxHeight: 200,
      maxWidth: 200,
    };
    launchCamera(options, response => {
      if (response.didCancel) {
        console.log('User cancelled camera');
      } else if (response.error) {
        console.log('Camera Error: ', response.error);
      } else {
        let imageUri = response.uri || response.assets?.[0]?.uri;
        setmyPhoto([
          ...myphoto,
          {
            uri: response.assets[0].uri,
            type: response.assets[0].type,
            name: response.assets[0].fileName,
          },
        ]);
        setSelectedImage({...selectedImage, [item]: imageUri});
      }
    });
  };
  const onPageLoad = async () => {
    setIsLoading(true);
    const response = await loanRouteFarmerListAPI(
      dbname,
      lan_id,
      token,
      user_id,
    );
    if (response?.status === 200) {
      setIsLoading(false);
      setloanFarmerList(response.data.data.rows);
    }
  };
  useEffect(() => {
    onPageLoad();
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      },
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      },
    );
    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);
  const handleSearch = text => {
    setSearchFarmerName(text);
    if (loanFarmerList.length !== 0) {
      const result = loanFarmerList.filter(item =>
        item.userName.toLowerCase().includes(text.toLowerCase()),
      );
      if (result) {
        setSearchResults(result);
      }
    }
    if (text == '') {
      setSearchResultsList(false);
    } else {
      setSearchResultsList(true);
    }
  };
  const handleResultSelect = async item => {
    const dataArray = [];
    item.agri_land_user_rels.forEach(element => {
      dataArray.push({
        value: element.rel_id,
        label: element.plot_no,
      });
    });
    setplotAll(dataArray);
    setSearchFarmerName(item.userName);
    setSearchResults([]);
    setfarmerID(item.user_id);
    setSearchResultsList(false);
    setNameVarityStartEnd({
      ...nameVarityStartEnd,
      name: '',
      name_fid: '',
      varity: '',
      varity_fid: '',
    });
    setSaveData({
      ...saveData,
      plot_id: '',
      type: 'farmer_sales_report',
      status: 1,
      comment: '',
    });
    setDate('');
  };
  const handlePlot = async relId => {
    setSaveData({...saveData, ['plot_id']: relId.value});
    const response = await produceAgainstPlotAPI(
      dbname,
      lan_id,
      farmerID,
      relId.value,
    );
    if (response?.status == 200) {
      setNameVarityStartEnd({
        ...nameVarityStartEnd,
        name: response?.data?.data?.crop_name.name,
        name_fid: response?.data?.data?.crop_name.fid,
        varity: response?.data?.data?.crop_variety.name,
        varity_fid: response?.data?.data?.crop_variety.fid,
      });
    }
  };
  const validateForm = (item, msg) => {
    if (item == '') {
      Toast.show({text: msg, ...AlertMesg[0]});
      return false;
    } else {
      return true;
    }
  };
  const handleSave = async () => {
    if (farmerID == '') {
      validateForm(farmerID, 'Select Farmer First');
    } else if (date == '') {
      validateForm(date, `${t('please_date_first')}`);
    } else if (saveData.plot_id == '') {
      validateForm(saveData.plot_id, `${t('please_select_plot_first')}`);
    } else {
      const formData = new FormData();
      formData.append('user_fid', farmerID);
      formData.append('type', saveData.type);
      formData.append('status', saveData.status);
      formData.append('sr_date', date);
      formData.append('comment', saveData.comment);
      formData.append(
        'products',
        JSON.stringify([
          {
            prod_fid: nameVarityStartEnd.name_fid,
            prod_vfid: nameVarityStartEnd.varity_fid,
          },
        ]),
      );
      myphoto.forEach(photo => {
        formData.append('photo', photo);
      });
      const response = await FarmerDailysalesreportAdd(
        dbname,
        lan_id,
        token,
        user_id,
        formData,
      );
      if (response?.status === 200) {
        validateForm('', `${t('your_request_submitted')}`);
        setTimeout(() => {
          navigation.navigate('DailySalesReport', {action: 'addData'});
        }, 1000);
      }
    }
  };
  const handleBackPress = () => {
    navigation.navigate('DailySalesReport');
    return true;
  };

  const HandlerGoBack = () => navigation.navigate('DailySalesReport');
  return (
    <FarmerDrawerScreenWrapper1>
      <View style={{flex: 1, backgroundColor: 'white'}}>
        <Root>
          {openNewDate && (
            <DatePickerComp
              openDate={openNewDate}
              newDate={newDate}
              setOpenDate={setopenNewDate}
              handleDatePicker={handleDatePicker}
            />
          )}
          <CustomHeader
            path="DailySalesReport"
            // HandlerGoBack={HandlerGoBack}
            logoImage={logoImage}
            topBanner={topBanner}
          />
          {/* <FormsTitle title={t('farmer_report')} /> */}
          {searchResultsList && searchResultsList ? (
            <View
              style={
                isKeyboardVisible
                  ? styles.flatContainerLengthUp
                  : styles.flatContainer
              }>
              <FlatList
                style={
                  searchResults.length > 8
                    ? styles.flatlistHeight
                    : searchResults.length > 5
                    ? {height: Dimensions.get('window').height / 5}
                    : ''
                }
                data={searchResults}
                renderItem={({item}) => (
                  <TouchableOpacity
                    onPress={() => handleResultSelect(item)}
                    style={styles.flatlistitem}>
                    <Text style={styles.flatlisttitle}>{item.userName}</Text>
                  </TouchableOpacity>
                )}
                keyExtractor={(item, index) => index}
              />
            </View>
          ) : (
            ''
          )}
          <ScrollView>
            <View style={styles.formComtainer}>
              <InputTextForm
                label={t('choose_farmer')}
                value={searchFarmerName}
                onChangeText={farmerName => handleSearch(farmerName)}
              />
              <TouchableOpacity
                style={{marginVertical: 15}}
                onPress={() => setopenNewDate(true)}
                activeOpacity={9}>
                <Text
                  style={{
                    color: '#4e4e4e',
                    fontFamily: Fonts.Regular,
                    fontSize: 15,
                  }}>
                  {t('date')}
                </Text>
                <View style={styles.calenderContainer}>
                  <Text style={{color: '#000'}}>{date}</Text>
                  <Image
                    source={require('../../Common/images/calendar.png')}
                    style={{width: 20, height: 20}}
                  />
                </View>
              </TouchableOpacity>
              <DropdownForm
                label={t('please_select_plot')}
                data={plotAll}
                onChange={relId => handlePlot(relId)}
                val={saveData.plot_id}
              />
              <InputTextForm
                label={t('produce_name')}
                value={nameVarityStartEnd.name}
              />
              <InputTextForm
                label={t('prodece_vareity')}
                value={nameVarityStartEnd.varity}
              />
              <InputTextForm
                label={t('comments')}
                onChangeText={text =>
                  setSaveData({...saveData, ['comment']: text})
                }
              />
              <TakePhoto
                title={t('take_a_photo_optional')}
                openImagePicker={openImagePicker}
                selectedImage={selectedImage}
              />
            </View>
          </ScrollView>
          <ButtonForm label={t('submit')} onPress={() => handleSave()} />
        </Root>
      </View>
    </FarmerDrawerScreenWrapper1>
  );
};

export default FarmerReport;
const styles = StyleSheet.create({
  formComtainer: {
    padding: 20,
  },
  calenderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 48,
    borderWidth: 0.5,
    borderRadius: 6,
    // backgroundColor: Colors.background,
    paddingHorizontal: 10,
    color: Colors.text,
    //  borderColor: '#d1d5db',
    borderColor: Colors.borderGreen,
    alignItems: 'center',
  },
  title: {
    color: '#000',
    marginVertical: 10,
    fontFamily: 'Poppins-Regular',
  },
  flatContainer: {
    backgroundColor: '#ffffff',
    position: 'absolute',
    zIndex: 999,
    left: 0,
    top: '15.5%',
    marginTop: 60,
    // bottom: '60%',
    marginHorizontal: '5%',
    width: '90%',
    elevation: 10,
    borderRadius: 10,
    padding: 10,
  },
  flatContainerLengthUp: {
    backgroundColor: '#ffffff',
    position: 'absolute',
    zIndex: 999,
    left: 0,
    top: '35%',
    // bottom: '40%',
    marginHorizontal: '5%',
    width: '90%',
    elevation: 10,
    borderRadius: 10,
    padding: 10,
  },
  flatlisttitle: {
    color: '#000',
    marginVertical: 8,
    fontFamily: 'Poppins-Regular',
  },
  flatlistHeight: {
    height: Dimensions.get('window').height / 3,
  },
});
