import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Keyboard,
  BackHandler,
} from 'react-native';
import React, {useState, useEffect, useCallback, useContext} from 'react';
import TakePhoto from '../Activity/TakePhoto';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {
  ChooseDealerAPI,
  AllProductCategoryListAPI,
  AllProductSubCategoryListAPI,
  AllProductNameList,
  DealerDailysalesreportAdd,
} from '../../../config/apiHere';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {userCreateContext} from '../../Context/usersCreateContext';
import FarmerDrawerScreenWrapper1 from '../FarmerDrawerScreenWrapper1';
import {Colors, Fonts} from '../../utils/Constants';
const DealerReport = () => {
  //GQR-67
  const {
    dbLanTokUsr,
    setdbLanTokUsr,
    loginUser_data,
    LoadingScreen,
    CustomHeader,
    t,
    AlertMesg,
    onBackPress,
    getItem,
    setItem,
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
    RadioForm,
  } = useContext(userCreateContext);
  const {dbname, lan_id, token, user_id} = loginUser_data;
  //GQR-67
  const navigation = useNavigation();
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [newDate, setnewDate] = useState(new Date());
  const [openNewDate, setopenNewDate] = useState(false);
  const [issuenewDate, setIssueNewDate] = useState(new Date());
  const [issueOpenNewDate, setIssueOpenNewDate] = useState(false);
  const [date, setDate] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [searchResultsList, setSearchResultsList] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedImage, setSelectedImage] = useState({
    firstItem: '',
    secondItem: '',
    thirdItem: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [dealer, setDealer] = useState([]);
  const [addMoreOrder, setAddmoreOrder] = useState([]);
  const [productCategory, setProductCategory] = useState([]);
  const [productSubCategory, setProductSubCategory] = useState([]);
  const [productName, setProductName] = useState([]);
  const [unit, setUnit] = useState([]);
  const [dealerData, setDealerData] = useState({
    ChooseDealer: '',
    chooseDealer_fid: '',
    date: date,
    orderReceived: 'No',
    productCategory: '',
    productCategory_fid: '',
    productSubCategory: '',
    productSubCategory_fid: '',
    productName: '',
    productName_fid: '',
    qty: '',
    unit: '',
    paymentReceived: 'Cash',
    paymentReceivedRs: '',
    comments: '',
    chequeNumber: '',
    issuseDate: issueDate,
  });
  const [myphoto, setmyPhoto] = useState([]);
  const [currency, setcurrency] = useState('');
  const handleDatePicker = item => {
    const effective_date = effective_dates(item);
    setDate(effective_date);
  };
  const handleDatePicker2 = item => {
    const effective_date = effective_dates(item);
    setIssueDate(effective_date);
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
  const validateForm = (item, msg) => {
    if (item == '') {
      Toast.show({text: msg, ...AlertMesg[0]});
      return false;
    } else {
      return true;
    }
  };
  const addMoreExpense = () => {
    if (dealerData.productCategory == '') {
      validateForm(
        dealerData.productCategory,
        `${t('select_product_category')}`,
      );
    } else if (dealerData.productSubCategory == '') {
      validateForm(
        dealerData.productSubCategory,
        `${t('product_sub_category')}`,
      );
    } else if (dealerData.productName == '') {
      validateForm(dealerData.productName, `${t('product_name')}`);
    } else if (dealerData.qty == '') {
      validateForm(dealerData.qty, 'Product qty');
    } else if (dealerData.unit == '') {
      validateForm(dealerData.qty, 'Product qty');
    } else {
      setAddmoreOrder([
        ...addMoreOrder,
        {
          productCategory: dealerData.productCategory,
          productCategory_fid: dealerData.productCategory_fid,
          productSubCategory: dealerData.productSubCategory,
          productSubCategory_fid: dealerData.productSubCategory_fid,
          productName: dealerData.productName,
          productName_fid: dealerData.productName_fid,
          qty: dealerData.qty,
          unit: dealerData.unit,
        },
      ]);
      setDealerData({
        ...dealerData,
        ['productCategory']: '',
        ['productSubCategory']: '',
        ['productName']: '',
        ['qty']: '',
        ['unit']: '',
      });
    }
  };
  const handleRemovedFields = index => {
    const values = [...addMoreOrder];
    values.splice(index, 1);
    setAddmoreOrder(values);
  };
  const onPageLoad = async () => {
    setIsLoading(true);
    const [curr] = await Promise.all([getItem('currency')]);
    setcurrency(curr);
    const response = await ChooseDealerAPI(dbname, lan_id, token, user_id);
    if (response?.status === 200) {
      setIsLoading(false);
      setDealer(response.data.data.rows);
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
  // useEffect(() => {
  // });
  const handleSearch = text => {
    setDealerData({...dealerData, ChooseDealer: text});
    if (dealer.length !== 0) {
      const result = dealer.filter(item =>
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
    setDealerData({
      ...dealerData,
      ChooseDealer: item.userName,
      chooseDealer_fid: item.user_id,
    });
    setSearchResults([]);
    setSearchResultsList(false);
  };
  const handleOrderReceived = async item => {
    setDealerData({...dealerData, orderReceived: item});
    const response = await AllProductCategoryListAPI(
      dbname,
      lan_id,
      token,
      user_id,
    );
    if (response?.status === 200) {
      const categoryArray = [];
      response.data.data.rows.forEach(element => {
        categoryArray.push({value: element.fid, label: element.name});
      });
      setProductCategory(categoryArray);
    } else {
      setIsLoading(false);
    }
  };
  const handleProductCategory = async item => {
    setDealerData({
      ...dealerData,
      productCategory: item.label,
      productCategory_fid: item.value,
    });
    const response = await AllProductSubCategoryListAPI(
      dbname,
      lan_id,
      token,
      user_id,
      item.value,
    );
    if (response?.status === 200) {
      const subCategoryArray = [];
      response.data.data.rows.map((data, index) => {
        if (item.label === data.name) {
          subCategoryArray.push({
            value:
              data.agri_input_output_entity_type_names[index].entity_name.fid,
            label:
              data.agri_input_output_entity_type_names[index].entity_name.name,
          });
        }
      });
      setProductSubCategory(subCategoryArray);
    }
  };
  const handleProductSubCategory = async item => {
    setDealerData({
      ...dealerData,
      productSubCategory: item.label,
      productSubCategory_fid: item.value,
    });
    const AllProduct = await AllProductNameList(
      dbname,
      lan_id,
      token,
      user_id,
      item.value,
    );
    if (AllProduct?.status === 200) {
      const productArray = [];
      const unitArray = [];
      AllProduct.data.data.rows.map((data, index) => {
        productArray.push({value: data.fid, label: data.product_name});
        data.agri_product_prices.map((unitData, unitIndex) => {
          unitArray.push({
            value: unitData.agri_unit.fid,
            label: unitData.agri_unit.unit_name,
          });
        });
      });
      setUnit(unitArray);
      setProductName(productArray);
    }
  };
  const handleAddData = (item, name) => {
    if (
      name === 'qty' ||
      name === 'paymentReceivedRs' ||
      name === 'comments' ||
      name === 'chequeNumber' ||
      name === 'paymentReceivedRs'
    ) {
      setDealerData({...dealerData, [`${name}`]: item});
    } else {
      setDealerData({
        ...dealerData,
        [`${name}`]: item.label,
        [`${name}_fid`]: item.value,
      });
    }
  };
  const handleSave = async () => {
    if (dealerData.ChooseDealer == '') {
      validateForm(dealerData.ChooseDealer, `${t('choose_dealer')}`);
    } else if (date == '') {
      validateForm(date, `${t('please_date_first')}`);
    } else if (
      dealerData.chequeNumber == '' &&
      dealerData.paymentReceived == 'Cheque'
    ) {
      validateForm(dealerData.chequeNumber, t('cheque_number'));
    } else if (issueDate == '' && dealerData.paymentReceived == 'Cheque') {
      validateForm(issueDate, 'Enter Cheque Date');
    } else if (
      dealerData.paymentReceivedRs == '' &&
      (dealerData.paymentReceived == 'Cash' ||
        dealerData.paymentReceived == 'Online' ||
        dealerData.paymentReceived == 'Cheque')
    ) {
      let payment = '';
      if (dealerData.paymentReceived == 'Cash') {
        payment = t('cash_received');
      } else if (dealerData.paymentReceived == 'Online') {
        payment = t('online_received');
      }
      validateForm(
        dealerData.paymentReceivedRs,
        `${t(payment)} ${t('amount')}`,
      );
    } else {
      let productArr = [];
      const formData = new FormData();
      formData.append('user_fid', dealerData.chooseDealer_fid);
      formData.append('type', 'dealer_sales_report');
      formData.append('ord_rcv', dealerData.orderReceived);
      formData.append('pay_rcv', dealerData.paymentReceived);
      formData.append('sr_date', date);
      formData.append('comment', dealerData.comments);
      formData.append('status', '1');
      if (dealerData.paymentReceived === 'Cheque') {
        formData.append('cheque_rcv', 'yes');
        formData.append('cheque_num', dealerData.chequeNumber);
        formData.append('cheque_date', issueDate);
        formData.append('cheque_amount', dealerData.paymentReceivedRs);
        formData.append('cash_amount', 0);
      } else if (dealerData.paymentReceived === 'Online') {
        formData.append('online_amoun', dealerData.paymentReceivedRs);
        formData.append('cash_amount', 0);
      } else if (dealerData.paymentReceived === 'Cash') {
        formData.append('cash_amount', dealerData.paymentReceivedRs);
      }
      myphoto.map((photo, index) => {
        formData.append('photo', photo);
      });
      addMoreOrder.map((data, index) => {
        productArr.push({
          prod_cid: data.productCategory_fid,
          prod_vfid: data.productSubCategory_fid,
          prod_fid: data.productName_fid,
          qty: data.qty,
          unit: data.unit,
        });
      });
      formData.append('products', JSON.stringify(productArr));
      const response = await DealerDailysalesreportAdd(
        dbname,
        lan_id,
        token,
        user_id,
        formData,
      );
      if (response?.status === 200) {
        setDate('');
        setIssueDate('');
        setmyPhoto([]);
        setAddmoreOrder([]);
        setSelectedImage({firstItem: '', secondItem: '', thirdItem: ''});
        setDealerData({
          ChooseDealer: '',
          chooseDealer_fid: '',
          date: '',
          orderReceived: 'No',
          productCategory: '',
          productCategory_fid: '',
          productSubCategory: '',
          productSubCategory_fid: '',
          productName: '',
          productName_fid: '',
          qty: '',
          unit: '',
          paymentReceived: 'Cash',
          paymentReceivedRs: '',
          comments: '',
          chequeNumber: '',
          issuseDate: '',
        });
        validateForm('', `${t('your_request_submitted')}`);
        setTimeout(() => {
          navigation.navigate('DailySalesReport');
        }, 1000);
      } else {
        validateForm('', 'something went wrong');
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
          <DatePickerComp
            openDate={openNewDate}
            newDate={newDate}
            setOpenDate={setopenNewDate}
            handleDatePicker={handleDatePicker}
          />
          <DatePickerComp
            openDate={issueOpenNewDate}
            newDate={issuenewDate}
            setOpenDate={setIssueOpenNewDate}
            handleDatePicker={handleDatePicker2}
          />
          <CustomHeader
            path="DailySalesReport"
            HandlerGoBack={HandlerGoBack}
            logoImage={logoImage}
            topBanner={topBanner}
          />
          {/* <FormsTitle title={t('dealer_report')} /> */}
          {searchResultsList && searchResultsList ? (
            <View
              style={
                isKeyboardVisible
                  ? styles.flatContainerLengthUp
                  : styles.flatContainer
              }>
              <FlatList
                style={searchResults.length > 6 ? styles.flatlistHeight : ''}
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
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.formComtainer}>
              <InputTextForm
                label={t('choose_dealer')}
                value={dealerData.ChooseDealer}
                onChangeText={farmerName => handleSearch(farmerName)}
              />
              <TouchableOpacity
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
              <Text style={styles.title}>{t('order_received')}</Text>
              <RadioForm
                label={t('yes')}
                selected={dealerData.orderReceived === 'Yes'}
                onSelect={() => handleOrderReceived('Yes')}
              />
              <RadioForm
                label={t('no')}
                selected={dealerData.orderReceived === 'No'}
                onSelect={() => handleOrderReceived('No')}
              />
              {dealerData.orderReceived === 'Yes' ? (
                <View style={styles.productPropDownContainer}>
                  <DropdownForm
                    label={t('select_product_category')}
                    data={productCategory}
                    onChange={text => handleProductCategory(text)}
                    val={dealerData.productCategory}
                  />
                  <DropdownForm
                    label={t('product_sub_category')}
                    data={productSubCategory}
                    onChange={text => handleProductSubCategory(text)}
                    val={dealerData.productSubCategory}
                  />
                  <DropdownForm
                    label={t('product_name')}
                    data={productName}
                    onChange={text => handleAddData(text, 'productName')}
                    val={dealerData.productName}
                  />
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <View style={{width: '45%'}}>
                      <InputTextForm
                        label={t('qty')}
                        keyboardType="numeric"
                        onChangeText={text => handleAddData(text, 'qty')}
                        value={dealerData.qty}
                      />
                    </View>
                    <View style={{width: '45%'}}>
                      <DropdownForm
                        label={t('select_unit')}
                        data={unit}
                        onChange={text => handleAddData(text, 'unit')}
                        val={dealerData.unit}
                      />
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.addMore}
                    onPress={addMoreExpense}>
                    <Image
                      source={require('../../Common/images/icons8-plus.png')}
                      style={{width: 35, height: 35}}
                    />
                  </TouchableOpacity>
                  {addMoreOrder &&
                    addMoreOrder.map((data, index) => {
                      return (
                        <View key={index} style={styles.addMoreContainer}>
                          <View style={{marginLeft: 10}}>
                            <Text
                              style={{
                                color: '#000',
                                fontFamily: 'Poppins-Regular',
                                fontSize: 14,
                              }}>
                              {data.productName}
                            </Text>
                            <Text
                              style={{
                                color: '#000',
                                fontFamily: 'Poppins-Regular',
                                fontSize: 14,
                              }}>
                              {data.qty} {data.unit}
                            </Text>
                          </View>
                          <TouchableOpacity
                            onPress={() => handleRemovedFields(index)}>
                            <Image
                              source={require('../../Common/images/cross.png')}
                              style={{width: 20, height: 20}}
                            />
                          </TouchableOpacity>
                        </View>
                      );
                    })}
                </View>
              ) : null}
              <View style={{marginBottom: 15}}>
                <Text style={styles.title}>{t('payment_received')}</Text>
                <RadioForm
                  label={t('cash_received')}
                  selected={dealerData.paymentReceived === 'Cash'}
                  onSelect={() =>
                    setDealerData({...dealerData, paymentReceived: 'Cash'})
                  }
                />
                <RadioForm
                  label={t('online_received')}
                  selected={dealerData.paymentReceived === 'Online'}
                  onSelect={() =>
                    setDealerData({...dealerData, paymentReceived: 'Online'})
                  }
                />
                <RadioForm
                  label={t('cheque')}
                  selected={dealerData.paymentReceived === 'Cheque'}
                  onSelect={() =>
                    setDealerData({...dealerData, paymentReceived: 'Cheque'})
                  }
                />
                <RadioForm
                  label={t('no')}
                  selected={dealerData.paymentReceived === 'No'}
                  onSelect={() =>
                    setDealerData({...dealerData, paymentReceived: 'No'})
                  }
                />
              </View>
              {dealerData.paymentReceived === 'Cheque' ? (
                <>
                  <InputTextForm
                    label={t('cheque_number')}
                    onChangeText={text => handleAddData(text, 'chequeNumber')}
                    value={dealerData.chequeNumber}
                  />
                  <TouchableOpacity
                    style={{marginVertical: 15}}
                    activeOpacity={9}
                    onPress={() => setIssueOpenNewDate(!issueOpenNewDate)}>
                    <Text
                      style={{
                        color: '#4e4e4e',
                        fontFamily: Fonts.Regular,
                        fontSize: 15,
                      }}>
                      {t('issue_date')}
                    </Text>
                    <View style={styles.calenderContainer}>
                      <Text style={styles.title}>{issueDate}</Text>
                      <Image
                        source={require('../../Common/images/calendar.png')}
                        style={{width: 20, height: 20}}
                      />
                    </View>
                  </TouchableOpacity>
                </>
              ) : (
                ''
              )}
              {dealerData.paymentReceived === 'Cash' ||
              dealerData.paymentReceived === 'Online' ||
              dealerData.paymentReceived === 'Cheque' ? (
                <InputTextForm
                  label={t('payment_received') + '(' + currency + ')'}
                  onChangeText={text =>
                    handleAddData(text, 'paymentReceivedRs')
                  }
                  value={dealerData.paymentReceivedRs}
                />
              ) : (
                ''
              )}
              <InputTextForm
                label={t('comments')}
                onChangeText={text => handleAddData(text, 'comments')}
                value={dealerData.comments}
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

export default DealerReport;

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
    color: '#4e4e4e',
    fontFamily: Fonts.Regular,
    fontSize: 15,
    marginVertical: 15,
  },
  productPropDownContainer: {
    backgroundColor: '#ebf3ffff',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  addMore: {
    alignItems: 'flex-end',
    marginVertical: 8,
  },
  addMoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '80%',
    marginHorizontal: '10%',
    height: 50,
    borderLeftWidth: 8,
    color: 'green',
    marginBottom: 10,
  },
  issueDate: {
    height: 48,
    borderWidth: 0.5,
    borderRadius: 6,
    // backgroundColor: Colors.background,
    paddingHorizontal: 10,
    color: Colors.text,
    //  borderColor: '#d1d5db',
    borderColor: Colors.borderGreen,
    marginBottom: 15,
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
    fontSize: 16,
  },
  flatlistHeight: {
    height: Dimensions.get('window').height / 3.2,
  },
});
