import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Modal,
  Linking,
  BackHandler,
} from 'react-native';
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
  memo,
  useContext,
} from 'react';
import DocumentPicker, {types} from 'react-native-document-picker';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import {LoanUpdate, farmerDocAPI} from './LoanAPI';
import {userCreateContext} from '../../Context/usersCreateContext';
import {Colors, Fronts} from '../../utils/Constants';
import FarmerDrawerScreenWrapper1 from '../FarmerDrawerScreenWrapper1';

import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
const LoanEnquiryDetail = () => {
  //GQR-67
  const {
    loginUser_data,
    LoadingScreen,
    t,
    Toast,
    AlertMesg,
    getItem,
    Root,
    CustomHeader,
    FormsTitle,
    InputTextForm,
    ButtonForm,
    logoImage,
    topBanner,
  } = useContext(userCreateContext);
  const {dbname, lan_id, token} = loginUser_data;
  //GQR-67
  const navigation = useNavigation();
  const route = useRoute();
  const [isLoading, setIsLoading] = useState(false);
  const [currency, setCurrencyt] = useState('');
  const [photo_to_be_deleted, set_photo_to_be_deleted] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [identityProof, setIdentityProof] = useState([
    {
      uri: '',
      id: '',
      name: '',
      type: '',
      fileName: '',
      value: '',
    },
    {
      uri: '',
      id: '',
      name: '',
      type: '',
      fileName: '',
      value: '',
    },
  ]);
  const [addressProof, setAddressProof] = useState([
    {uri: '', id: '', name: '', type: '', fileName: '', value: ''},
    {uri: '', id: '', name: '', type: '', fileName: '', value: ''},
    {uri: '', id: '', name: '', type: '', fileName: '', value: ''},
    {uri: '', id: '', name: '', type: '', fileName: '', value: ''},
    {uri: '', id: '', name: '', type: '', fileName: '', value: ''},
  ]);
  const [landProof, setLandProof] = useState([
    {uri: '', name: '', type: '', fileName: '', value: ''},
    {uri: '', name: '', type: '', fileName: '', value: ''},
    {uri: '', name: '', type: '', fileName: '', value: ''},
    {uri: '', name: '', type: '', fileName: '', value: ''},
    {uri: '', name: '', type: '', fileName: '', value: ''},
  ]);
  const [plotArr, setplotArr] = useState([]);
  const {
    user_id,
    id,
    status,
    agri_files,
    agri_user,
    apx_annual_income,
    loan_amount,
    agri_loan_entity,
    existing_loan_amount,
    loan_plots,
    sanctioned_date,
    loan_ord_id,
    loan_sanctioned,
    comment,
  } = route.params;
  const [saveData, setSaveData] = useState({
    user_id: '',
    loan_amount: '',
    loan_purpose: '',
    existing_loan_amount: '',
    apx_annual_income: '',
    farming_type: 'crop',
    plot_id: '',
    farmerProducer: '',
    identityNo: '',
  });
  const [propsData, setPropsData] = useState('');
  const [propsIndex, setPropsIndex] = useState('');
  const [propsObjData, setPropsObjData] = useState({});
  const urlOpen = useCallback((data, index, objData) => {
    const {uri} = objData;
    setPropsData(data);
    setPropsIndex(index);
    setPropsObjData(objData);
    if (uri != '') {
      setModalVisible(!modalVisible);
    } else {
      handleDocumentSelection(data, index, objData);
    }
  }, []);
  const photo_to_be_deleted_value = [];
  // const handleDocumentSelection = useCallback(async (data, index, objData) => {
  //   try {
  //     const response = await DocumentPicker.pick({
  //       presentationStyle: 'fullScreen',
  //       type: [types.pdf, types.images],
  //     });
  //     if (data == 'IdentityProof') {
  //       setIdentityProof({
  //         uri: response[0].uri,
  //         id: objData.id,
  //         name: response[0].name,
  //         type: response[0].type,
  //         fileName: response[0].name,
  //         value: '1',
  //       });
  //       const photo_to_be_deleted_id = photo_to_be_deleted_value.filter(
  //         item => item == objData.id,
  //       );
  //       if (photo_to_be_deleted_id.length == 0) {
  //         photo_to_be_deleted_value.push(objData.id);
  //       }
  //     } else if (data == 'AddressProof') {
  //       const addressProofVAlue = [...addressProof];
  //       addressProofVAlue[index]['uri'] = response[0].uri;
  //       addressProofVAlue[index]['id'] = objData.id;
  //       addressProofVAlue[index]['name'] = response[0].name;
  //       addressProofVAlue[index]['type'] = response[0].type;
  //       addressProofVAlue[index]['fileName'] = response[0].name;
  //       addressProofVAlue[index]['value'] = '1';
  //       setAddressProof(addressProofVAlue);
  //       const photo_to_be_deleted_id = photo_to_be_deleted_value.filter(
  //         item => item == objData.id,
  //       );
  //       if (photo_to_be_deleted_id.length == 0) {
  //         photo_to_be_deleted_value.push(objData.id);
  //       }
  //     } else if (data == 'LandProof') {
  //       const landProofValue = [...landProof];
  //       landProofValue[index]['uri'] = response[0].uri;
  //       landProofValue[index]['id'] = objData.id;
  //       landProofValue[index]['name'] = response[0].name;
  //       landProofValue[index]['type'] = response[0].type;
  //       landProofValue[index]['fileName'] = response[0].name;
  //       landProofValue[index]['value'] = '1';
  //       setLandProof(landProofValue);
  //       const photo_to_be_deleted_id = photo_to_be_deleted_value.filter(
  //         item => item == objData.id,
  //       );
  //       if (photo_to_be_deleted_id.length == 0) {
  //         photo_to_be_deleted_value.push(objData.id);
  //       }
  //     }
  //     set_photo_to_be_deleted(photo_to_be_deleted_value);
  //     setModalVisible(false);
  //     onPageLoad();
  //   } catch (err) {
  //     setModalVisible(false);
  //     console.error(err);
  //   }
  // }, []);
  const handledataAdd = useCallback((name, text) => {
    // setSaveData({ ...saveData, [name]: text });
  }, []);
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        navigation.navigate('Loan');
        return true;
      };
      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () =>
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, []),
  );
  const onPageLoad = async () => {
    setIsLoading(true);
    const loan_landArr = agri_files.filter(
      item => item.term_type === 'loan_support_img',
    );
    const [farmarDoc, currency_res] = await Promise.all([
      farmerDocAPI(dbname, lan_id, token, user_id),
      getItem('currency'),
    ]);

    if (farmarDoc.status === 200) {
      const farmerIdentityDoc = farmarDoc.data.data[0].agri_files.filter(
        item => item.term_type === 'farmer_identity',
      );
      const farmerAddressDoc = farmarDoc.data.data[0].agri_files.filter(
        item => item.term_type === 'farmer_address',
      );

      if (farmerIdentityDoc.length > 0 && farmerAddressDoc.length > 0) {
        const farmerDocValue = [...identityProof];
        farmerDocValue[0] = {
          uri: farmerIdentityDoc[0].file_path,
          id: farmerIdentityDoc[0].file_id,
          name: farmerIdentityDoc[0].file_name,
          type: '',
          fileName: farmerIdentityDoc[0].file_name,
        };
        farmerDocValue[1] = {
          uri: farmerAddressDoc[0].file_path,
          id: farmerAddressDoc[0].file_id,
          name: farmerAddressDoc[0].file_name,
          type: '',
          fileName: farmerAddressDoc[0].file_name,
        };
        setIdentityProof(farmerDocValue);
      } else if (
        farmerIdentityDoc.length > 0 &&
        farmerAddressDoc.length == undefined
      ) {
        const farmerDocValue = [...identityProof];
        farmerDocValue[0] = {
          uri: farmerIdentityDoc[0].file_path,
          id: farmerIdentityDoc[0].file_id,
          name: farmerIdentityDoc[0].file_name,
          type: '',
          fileName: farmerIdentityDoc[0].file_name,
        };
        setIdentityProof(farmerDocValue);
      } else if (
        farmerAddressDoc.length > 0 &&
        farmerIdentityDoc.length == undefined
      ) {
        const farmerDocValue = [...identityProof];
        farmerDocValue[0] = {
          uri: farmerAddressDoc[0].file_path,
          id: farmerAddressDoc[0].file_id,
          name: farmerAddressDoc[0].file_name,
          type: '',
          fileName: farmerAddressDoc[0].file_name,
        };
        setIdentityProof(farmerDocValue);
      }
    }
    // const currency_res = await getItem('currency');
    // const { dbname, lan_id, token, user_id } = loginUser_data;
    setCurrencyt(currency_res);
    setSaveData({
      ...saveData,
      ...{
        user_id: user_id,
        loan_amount: loan_amount,
        loan_purpose: agri_loan_entity?.entity_name,
        existing_loan_amount: existing_loan_amount,
        apx_annual_income: apx_annual_income,
        farming_type: 'crop',
        plot_id: '',
        farmerProducer: '',
        identityNo: '',
      },
    });
    const landProofValue = [...landProof];
    landProof.map((data, index) => {
      if (loan_landArr[index] != undefined && data.uri == '') {
        landProofValue[index] = {
          uri: loan_landArr[index].file_path,
          id: loan_landArr[index].file_id,
          name: loan_landArr[index].file_name,
          type: '',
          fileName: loan_landArr[index].file_name,
        };
      }
    });
    // store.dispatch(updateLoan({ landProofValue: landProofValue, addressProof_value: addressProof_value }));
    setLandProof(landProofValue);
    // setAddressProof(addressProof_value);
    setIsLoading(false);
  };
  useEffect(() => {
    onPageLoad();
  }, []);
  useEffect(() => {
    // console.log(JSON.stringify(loan_plots));
    let plotDataArr = [];
    loan_plots.filter((data, index) => {
      plotDataArr.push(data?.agri_land_user_rel?.plot_no);
    });
    setplotArr(plotDataArr);
  }, []);
  const HandlerGoBack = () => {
    navigation.navigate('Loan');
  };
  const handleSave = async () => {
    setIsLoading(true);
    const deleted_id_arr = photo_to_be_deleted.filter(item => item != '');
    const {dbName, languageID, token, userID} = dbLanTokUsr;
    let updateStatus = null;
    const formData = new FormData();
    // formData.append("lan_id", saveData.user_id);
    // formData.append("loan_amount", saveData.loan_amount);
    // formData.append("existing_loan_amount", saveData.existing_loan_amount);
    // formData.append("farming_type", saveData.farming_type);
    if (deleted_id_arr.length > 0) {
      updateStatus = true;
      formData.append('photo_to_be_deleted', deleted_id_arr.toString());
    }
    if (identityProof.value === '1') {
      updateStatus = true;
      formData.append('loan_identity', identityProof);
    } else {
      formData.append('loan_identity', '');
    }
    addressProof.map((data, index) => {
      if (data.value === '1') {
        updateStatus = true;
        formData.append('loan_address', data);
      }
    });
    landProof.map((data, index) => {
      if (data.value === '1') {
        updateStatus = true;
        formData.append('loan_land', data);
      }
    });
    if (updateStatus == true) {
      formData.append('status', 1);
    }
    if (formData?._parts.length > 1) {
      const responseUpdate = await LoanUpdate(
        dbName,
        languageID,
        token,
        saveData.user_id,
        formData,
        id,
      );
      if (responseUpdate?.status == 200) {
        Toast.show({text: 'Successfull Data Submited', ...AlertMesg[0]});
        setTimeout(() => {
          navigation.navigate('Loan', 2);
        }, 1200);
      }
      // else {
      //     const responseUpdate = await LoanUpdate(dbName, languageID, token, saveData.user_id, formData, id);
      //     if (responseUpdate?.status == 200) {
      //         Toast.show({ text: 'Successfull Data Submited', ...AlertMesg[0] });
      //         setTimeout(() => {
      //             navigation.navigate('Loan', 2)
      //         }, 1200);
      //     }
      // }
    }
    setIsLoading(false);
  };
  const openURL = async propsData => {
    if (propsData) {
      await Linking.openURL(propsData);
    }
  };
  return (
    <FarmerDrawerScreenWrapper1>
      <Root>
        {isLoading ? (
          <View style={styles.loadingScreen}>
            <LoadingScreen />
          </View>
        ) : null}
        <View
          style={{
            flex: 1,
            backgroundColor: Colors.pageBackground,
          }}>
          <CustomHeader
            path={'Loan'}
            HandlerGoBack={HandlerGoBack}
            logoImage={logoImage}
            topBanner={topBanner}
          />
          <FormsTitle title={t('loan_enquiry_detail')} />
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* <View style={styles.container}> */}
            {status == 3 && (
              <View style={styles.commentContainer}>
                <Text style={styles.title}>{comment}</Text>
              </View>
            )}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{t('personal_information')}</Text>

              <View style={styles.infoRow}>
                <MaterialIcons name="person" size={20} color="#4a8c29" />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>{t('farmer_name')}</Text>
                  <Text style={styles.infoValue}> {agri_user.userName}</Text>
                </View>
              </View>

              {/* <InputTextForm
              label={t('farmer_name')}
              value={agri_user.userName}
              editable={false}
            /> */}
              <View style={styles.infoRow}>
                <MaterialIcons name="phone" size={20} color="#4a8c29" />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>{t('farmer_number')}</Text>
                  <Text style={styles.infoValue}>
                    {' '}
                    {agri_user.contactNumber}
                  </Text>
                </View>
              </View>
            </View>
            {/* <InputTextForm
              label={t('farmer_number')}
              value={agri_user.contactNumber}
              editable={false}
            /> */}
            {identityProof[0].name.length > 5 ? (
              <Text style={styles.title}>{t('identity_proof')}</Text>
            ) : (
              ''
            )}
            <View style={styles.idItemContainer}>
              {identityProof &&
                identityProof.map((data, index) => {
                  if (data.name.length > 5) {
                    return (
                      <TouchableOpacity
                        style={styles.idItem}
                        key={index}
                        onPress={() => openURL(data.uri)}>
                        <Image
                          source={require('../../Common/images/document.png')}
                          style={styles.idImage}
                        />
                        <Text>
                          {data.name == '' ? '' : data.name.substring(1, 20)}
                          {/* {data.name.substring(7, 12)} */}
                        </Text>
                      </TouchableOpacity>
                    );
                  }
                })}
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>{t('loan_information')}</Text>

              <View style={styles.infoRow}>
                <MaterialIcons name="payments" size={20} color="#4a8c29" />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>
                    {t('loan_required_in_rupees') + ` (${currency})`}
                  </Text>
                  <Text style={styles.infoValue}>{saveData.loan_amount}</Text>
                  {/* <InputTextForm
              label={t('loan_required_in_rupees') + ` (${currency})`}
              value={saveData.loan_amount}
              onChangeText={text => handledataAdd('loan_amount', text)}
              editable={false}
            /> */}
                </View>
              </View>

              <View style={styles.infoRow}>
                <MaterialIcons
                  name="currency-rupee"
                  size={20}
                  color="#4a8c29"
                />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>
                    {t('annual_income') + ` (${currency})`}
                  </Text>

                  <Text style={styles.infoValue}>
                    {saveData.apx_annual_income}
                  </Text>
                </View>
              </View>
              {/* <InputTextForm
              label={t('annual_income') + ` (${currency})`}
              value={saveData.apx_annual_income}
              onChangeText={text => handledataAdd('apx_annual_income', text)}
              editable={false}
            /> */}

              <View style={styles.infoRow}>
                <MaterialIcons name="quiz" size={20} color="#4a8c29" />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>{t('loan_purpose')}</Text>
                  <Text style={styles.infoValue}>{saveData.loan_purpose}</Text>
                </View>
              </View>
              {/* <InputTextForm
              label={t('loan_purpose')}
              value={saveData.loan_purpose}
              editable={false}
            /> */}

              <View style={styles.infoRow}>
                <MaterialIcons name="money-off" size={20} color="#4a8c29" />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>
                    {t('existing_loan_amount') + ` (${currency})`} ({currency})
                  </Text>
                  <Text style={styles.infoValue}>{existing_loan_amount}</Text>
                </View>
              </View>
              {/* <InputTextForm
              label={t('existing_loan_amount') + ` (${currency})`}
              value={existing_loan_amount}
              editable={false}
            /> */}

              {status == 2 && (
                <>
                  <View style={styles.infoRow}>
                    <MaterialIcons
                      name="confirmation-number"
                      size={20}
                      color="#4a8c29"
                    />
                    <View style={styles.infoTextContainer}>
                      <Text style={styles.infoLabel}>
                        {t('LoanOrderID')} ({currency})
                      </Text>
                      <Text style={styles.infoValue}>{loan_ord_id}</Text>
                    </View>
                  </View>
                  {/* <InputTextForm
                  label={t('LoanOrderID')}
                  value={loan_ord_id}
                  editable={false}
                /> */}
                  <View style={styles.infoRow}>
                    <MaterialIcons name="beenhere" size={20} color="#4a8c29" />
                    <View style={styles.infoTextContainer}>
                      <Text style={styles.infoLabel}>
                        {t('LoanSanctioned') + `(${currency})`}
                      </Text>
                      <Text style={styles.infoValue}>{loan_sanctioned}</Text>
                    </View>
                  </View>

                  {/* <InputTextForm
                  label={t('LoanSanctioned') + `(${currency})`}
                  value={loan_sanctioned}
                  editable={false}
                /> */}
                  <View style={styles.infoRow}>
                    <MaterialIcons
                      name="event-available"
                      size={20}
                      color="#4a8c29"
                    />
                    <View style={styles.infoTextContainer}>
                      <Text style={styles.infoLabel}>
                        {t('SanctionedDate')}
                      </Text>
                      <Text style={styles.infoValue}>{sanctioned_date}</Text>
                    </View>
                  </View>

                  {/* <InputTextForm
                  label={t('SanctionedDate')}
                  value={sanctioned_date}
                  editable={false}
                /> */}
                </>
              )}

              <Text style={styles.title}>{t('plot')}</Text>

              <View style={styles.plotContainer}>
                {loan_plots.map((data, index) => {
                  return (
                    <View key={index}>
                      <View style={styles.plotContainerItem}>
                        <View>
                          <Text style={styles.plotText}>
                            {t('select_plot')}
                          </Text>
                          <Text style={styles.plotText}>
                            {t('addcrop_cropname')}
                          </Text>
                          <Text style={styles.plotText}>
                            {t('addcrop_cropvariety')}
                          </Text>
                        </View>
                        <View>
                          {/* Add Text components here */}
                          <Text style={styles.plotText}>
                            :{data.agri_land_user_rel.plot_no.substring(-1, 15)}
                          </Text>
                          <Text style={styles.plotText}>
                            :
                            {data.agri_land_user_rel.plot_crops[0].crop_name.name.substring(
                              -1,
                              15,
                            )}
                          </Text>
                          <Text style={styles.plotText}>
                            :
                            {data.agri_land_user_rel.plot_crops[0].crop_variety.name.substring(
                              -1,
                              15,
                            )}
                          </Text>
                        </View>
                      </View>

                      <View
                        style={[styles.idcontainer2, {marginHorizontal: 10}]}>
                        {data.agri_land_user_rel?.plot_img[0]?.file_name
                          .length > 5 ? (
                          <Text style={styles.title}>{t('address_proof')}</Text>
                        ) : (
                          ''
                        )}
                        <View style={styles.idItemContainer}>
                          {data.agri_land_user_rel.plot_img
                            ?.filter(item => item?.term_type == 'plot_image')
                            .map((data, index) => {
                              return (
                                <TouchableOpacity
                                  style={styles.idItem}
                                  key={index}
                                  onPress={() => openURL(data.file_path)}>
                                  <MaterialIcons
                                    name="description"
                                    size={40}
                                    color="#0d8320"
                                  />
                                  <Text
                                    style={styles.titleImg}
                                    numberOfLines={1}
                                    ellipsizeMode="tail">
                                    {data.file_name
                                      ? data.file_name
                                      : 'Unnamed'}
                                  </Text>
                                </TouchableOpacity>
                              );
                            })}
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{t('documents')}</Text>
              <View style={styles.documentSection}>
                <Text style={styles.documentTitle}>{t('land_records')}</Text>
                <View style={styles.documentContainer}>
                  {landProof.map((data, index) => {
                    return (
                      <TouchableOpacity
                        style={styles.documentItem}
                        onPress={() => openURL(data.uri)}
                        key={index}>
                        <MaterialIcons
                          name="description"
                          size={28}
                          color="#4a8c29"
                        />
                        {/* Make sure data.name is wrapped in Text */}
                        <Text
                          style={styles.imageTitle}
                          numberOfLines={1}
                          ellipsizeMode="tail">
                          {data.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </View>
            {/* </View> */}
          </ScrollView>
          {/* {status != 2 && (
          <ButtonForm label={t('submit')} onPress={() => handleSave()} />
        )} */}
        </View>
      </Root>
    </FarmerDrawerScreenWrapper1>
  );
};

export default memo(LoanEnquiryDetail);

const styles = StyleSheet.create({
  container: {
    marginHorizontal: '4%',
    marginBottom: 50,
    backgroundColor: Colors.containerGreen,
    marginTop: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.borderGreen,
  },
  idcontainer: {
    marginVertical: 30,
    marginHorizontal: 20,
  },
  idcontainer2: {
    marginVertical: 10,
    marginHorizontal: 30,
    backgroundColor: 'white',
    borderWidth: 0.5,
    borderColor: Colors.borderGreen,

    borderRadius: 20,
    padding: 10,
  },
  idItemContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  idItem: {
    padding: 10,
    width: '50%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  idImage: {
    width: 60,
    height: 60,
  },
  imageTitle: {
    fontSize: 10,
    color: '#000',
    fontFamily: 'Poppins-Regular',
  },
  title: {
    color: Colors.text,
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    marginLeft: 10,
  },
  titleImg: {
    color: Colors.text,
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    marginLeft: 10,
  },
  centeredView: {
    // backgroundColor: '#FFF',
    // width: '90%',
    // left: '5%',
    // // justifyContent: 'center',
    // alignItems: 'center',
    // position: "absolute",
    // top: '50%'
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    width: '90%',
    backgroundColor: '#FFF',
    borderRadius: 4,
    padding: '2.5%',
  },
  loadingScreen: {
    position: 'absolute',
    top: '60%',
    zIndex: 999,
    left: '45%',
  },
  commentContainer: {
    padding: 12,
    // borderWidth: 1,
    elevation: 1,
    marginBottom: 10,
    borderColor: '#CA8586',
    backgroundColor: '#ECC8C5',
    borderRadius: 10,
  },
  plotContainer: {
    backgroundColor: '#F7FCFF',
    borderRadius: 20,
    elevation: 5,
    marginTop: 5,
    borderWidth: 1,
    borderColor: Colors.borderGreen,
  },
  plotContainerItem: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 0.5,
    borderColor: Colors.borderGreen,
    margin: 15,
    borderRadius: 20,
    padding: 10,
  },
  plotText: {
    color: Colors.text,
    marginVertical: 2,
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
  },

  ///////////////////

  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginHorizontal: '5%',
    marginTop: 20,
    // borderWidth: 1,
    // borderColor: Colors.borderGreen,
  },
  cardTitle: {
    fontSize: 16,

    color: Colors.borderGreen,
    marginBottom: 12,
    fontFamily: 'Poppins-SemiBold',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTextContainer: {
    marginLeft: 10,
    flex: 1,
    marginVertical: 10,
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.text,
    fontFamily: 'Poppins-Regular',
  },
  infoValue: {
    fontSize: 14,
    color: Colors.text,
    fontFamily: 'Poppins-SemiBold',
  },
  documentSection: {
    marginBottom: 16,
  },
  documentTitle: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 8,
    fontFamily: 'Poppins-Medium',
  },
  documentContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  documentItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  documentName: {
    fontSize: 12,
    color: '#2c3e50',
    marginLeft: 8,
    fontFamily: 'Poppins-Regular',
    flex: 1,
  },

  ///////////////////////////////////////////
  // container: {
  //   marginHorizontal: '5%',
  //   marginBottom: 50,
  // },
  // idcontainer: {
  //   marginVertical: 10,
  // },
  // idItemContainer: {
  //   flexDirection: 'row',
  //   flexWrap: 'wrap',
  // },
  // idItem: {
  //   padding: 10,
  //   width: '30%',
  //   justifyContent: 'center',
  //   alignItems: 'center',
  // },
  // idImage: {
  //   width: 60,
  //   height: 60,
  // },
  // imageTitle: {
  //   fontSize: 10,
  //   color: '#000',
  //   fontFamily: 'Poppins-Regular',
  // },
  // title: {
  //   color: '#000',
  //   fontFamily: 'Poppins-Regular',
  //   fontSize: 14,
  // },
  // centeredView: {
  //   // backgroundColor: '#FFF',
  //   // width: '90%',
  //   // left: '5%',
  //   // // justifyContent: 'center',
  //   // alignItems: 'center',
  //   // position: "absolute",
  //   // top: '50%'
  //   flex: 1,
  //   alignItems: 'center',
  //   justifyContent: 'center',
  //   backgroundColor: 'rgba(0,0,0,0.5)',
  // },
  // modalView: {
  //   width: '90%',
  //   backgroundColor: '#FFF',
  //   borderRadius: 4,
  //   padding: '2.5%',
  // },
  // loadingScreen: {
  //   position: 'absolute',
  //   top: '60%',
  //   zIndex: 999,
  //   left: '45%',
  // },
  // commentContainer: {
  //   padding: 12,
  //   // borderWidth: 1,
  //   elevation: 1,
  //   marginBottom: 10,
  //   borderColor: '#CA8586',
  //   backgroundColor: '#ECC8C5',
  //   borderRadius: 10,
  // },
  // plotContainer: {
  //   backgroundColor: '#FFF',
  //   borderRadius: 10,
  //   elevation: 5,
  // },
  // plotContainerItem: {
  //   flexDirection: 'row',
  //   justifyContent: 'space-around',
  //   alignItems: 'center',
  //   backgroundColor: '#FFF',
  //   borderWidth: 1,
  //   borderColor: '#000',
  //   margin: 15,
  //   borderRadius: 10,
  //   padding: 10,
  // },
  // plotText: {
  //   color: '#000',
  //   marginVertical: 2,
  //   fontFamily: 'Poppins-Regular',
  //   fontSize: 14,
  // },
});
