import {
  ScrollView,
  Modal,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Linking,
} from 'react-native';
import React, {useCallback, useEffect, useState, useContext} from 'react';
import DocumentPicker, {types} from 'react-native-document-picker';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import {LoanUpdate} from './FarmerLoanAPI';
import {farmerDocAPI} from '../Loan/LoanAPI';
import {userCreateContext} from '../../Context/usersCreateContext';
import { Colors,Fonts } from '../../utils/Constants';
const FarmerLoanEnquiryDetail = () => {
  //GQR-67
  const {
    loginUser_data,
    FormsTitle,
    ButtonForm,
    CustomHeader,
    t,
    AlertMesg,
    LoadingScreen,
    getItem,
    InputTextForm,
    Root,
    Toast,
    onBackPress,
    logoImage,
    topBanner,
  } = useContext(userCreateContext);
  const {dbname, lan_id, token, owner, farmerId} = loginUser_data;
  //GQR-67
  const navigation = useNavigation();
  const route = useRoute();
  const [isLoading, setIsLoading] = useState(false);
  const [currency, setcurrency] = useState('');
  const [photo_to_be_deleted, set_photo_to_be_deleted] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [identityProof, setIdentityProof] = useState([
    {uri: '', id: '', name: '', type: '', fileName: '', value: ''},
    {uri: '', id: '', name: '', type: '', fileName: '', value: ''},
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
  let plotArr = [];
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
  const onPageLoad = async () => {
    setIsLoading(true);
    // const address_proofArr = agri_files.filter(item => item.term_type === "loan_address");
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
    setcurrency(currency_res);
    let loanLandArr = [];
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
    // const addressProof_value = [...addressProof];
    // addressProof.map((data, index) => {
    //     if (address_proofArr[index] != undefined && data.uri == "") {
    //         addressProof_value[index] = { uri: address_proofArr[index].file_path, id: address_proofArr[index].file_id, name: address_proofArr[index].file_name, type: "", fileName: address_proofArr[index].file_name };
    //     }
    // });
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
  // useEffect(() => {
  //     const loan_identityArr = agri_files.filter(item => item.term_type === "loan_identity");
  //     if (loan_identityArr.length > 0) {
  //         if (loan_identityArr[0] != undefined) {
  //             setIdentityProof({
  //                 uri: loan_identityArr[0]?.file_path,
  //                 id: loan_identityArr[0]?.file_id,
  //                 name: loan_identityArr[0]?.file_name, type: "",
  //                 fileName: loan_identityArr[0]?.file_name
  //             });
  //         }
  //         // setIdentityProof(identityProofValue);
  //     }
  // }, [])
  useFocusEffect(
    useCallback(() => {
      onBackPress(() => {
        navigation.navigate('FarmerLoan');
        return true;
      });
    }, []),
  );
  loan_plots.map((data, index) => {
    plotArr.push(data.agri_land_user_rel.plot_no);
  });
  const HandlerGoBack = () => navigation.navigate('FarmerLoan');
  // const loan_identityArr = agri_files.filter(item => item.term_type === "loan_identity");
  // const address_proofArr = agri_files.filter(item => item.term_type === "loan_address");
  // const loan_landArr = agri_files.filter(item => item.term_type === "loan_land");
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
  //     try {
  //         const response = await DocumentPicker.pick({
  //             presentationStyle: 'fullScreen', type: [types.pdf, types.images]
  //         });
  //         if (data == "IdentityProof") {
  //             setIdentityProof(
  //                 {
  //                     uri: response[0].uri,
  //                     id: objData.id,
  //                     name: response[0].name,
  //                     type: response[0].type,
  //                     fileName: response[0].name,
  //                     value: "1"
  //                 }
  //             );
  //             const photo_to_be_deleted_id = photo_to_be_deleted_value.filter(item =>
  //                 item == objData.id
  //             );
  //             if (photo_to_be_deleted_id.length == 0) {
  //                 photo_to_be_deleted_value.push(objData.id);
  //             }
  //         } else if (data == "AddressProof") {
  //             const addressProofVAlue = [...addressProof];
  //             addressProofVAlue[index]["uri"] = response[0].uri;
  //             addressProofVAlue[index]["id"] = objData.id;
  //             addressProofVAlue[index]["name"] = response[0].name;
  //             addressProofVAlue[index]["type"] = response[0].type;
  //             addressProofVAlue[index]["fileName"] = response[0].name;
  //             addressProofVAlue[index]["value"] = "1";
  //             setAddressProof(addressProofVAlue);
  //             const photo_to_be_deleted_id = photo_to_be_deleted_value.filter(item =>
  //                 item == objData.id
  //             );
  //             if (photo_to_be_deleted_id.length == 0) {
  //                 photo_to_be_deleted_value.push(objData.id);
  //             }
  //         } else if (data == "LandProof") {
  //             const landProofValue = [...landProof];
  //             landProofValue[index]["uri"] = response[0].uri;
  //             landProofValue[index]["id"] = objData.id;
  //             landProofValue[index]["name"] = response[0].name;
  //             landProofValue[index]["type"] = response[0].type;
  //             landProofValue[index]["fileName"] = response[0].name;
  //             landProofValue[index]["value"] = "1";
  //             setLandProof(landProofValue);
  //             const photo_to_be_deleted_id = photo_to_be_deleted_value.filter(item =>
  //                 item == objData.id
  //             );
  //             if (photo_to_be_deleted_id.length == 0) {
  //                 photo_to_be_deleted_value.push(objData.id);
  //             }
  //         }
  //         set_photo_to_be_deleted(photo_to_be_deleted_value);
  //         setModalVisible(false);
  //         onPageLoad();
  //     } catch (err) {
  //         setModalVisible(false);
  //         console.error(err);
  //     }
  // }, []);
  const handleSave = async () => {
    setIsLoading(true);
    const deleted_id_arr = photo_to_be_deleted.filter(item => item != '');
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
    const responseUpdate = await LoanUpdate(
      dbname,
      lan_id,
      token,
      saveData.user_id,
      formData,
      id,
    );
    if (responseUpdate?.status == 200) {
      Toast.show({text: 'Successfull Data Submited', ...AlertMesg[0]});
      setTimeout(() => {
        navigation.navigate('FarmerLoan', 2);
      }, 1200);
    }
    setIsLoading(false);
  };
  const openURL = async propsData => {
    if (propsData) {
      await Linking.openURL(propsData);
    }
  };
  return (
    <Root>
      {isLoading ? (
        <View style={styles.loadingScreen}>
          <LoadingScreen />
        </View>
      ) : null}
      <View style={{flex: 1}}>
        <CustomHeader
          path={'FarmerLoan'}
          HandlerGoBack={HandlerGoBack}
          logoImage={logoImage}
          topBanner={topBanner}
        />
        <FormsTitle title={'Loan Enquiry Detail'} />
        <ScrollView>
          <View style={styles.container}>
            {status == 3 && (
              <View style={styles.commentContainer}>
                <Text style={styles.title}>{comment}</Text>
              </View>
            )}
            <InputTextForm
              label={t('farmer_name')}
              value={agri_user.userName}
              editable={false}
            />
            <InputTextForm
              label={t('farmer_number')}
              value={agri_user.contactNumber}
              editable={false}
            />

            <View style={styles.idcontainer}>
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
            </View>
            <InputTextForm
              label={t('loan_required_in_rupees') + ` (${currency})`}
              value={saveData.loan_amount}
              onChangeText={text => handledataAdd('loan_amount', text)}
              editable={false}
            />
            <InputTextForm
              label={t('annual_income') + ` (${currency})`}
              value={saveData.apx_annual_income}
              onChangeText={text => handledataAdd('apx_annual_income', text)}
              editable={false}
            />
            <InputTextForm
              label={t('loan_purpose')}
              value={saveData.loan_purpose}
              editable={false}
            />
            <InputTextForm
              label={t('existing_loan_amount') + ` (${currency})`}
              value={existing_loan_amount}
              editable={false}
            />
            {/* <InputTextForm
                label={t('plot')}
                value={plotArr.join()}
                editable={false}
              /> */}
            <Text style={styles.title}>{t('plot')}</Text>
            <View style={styles.plotContainer}>
              {loan_plots.map((data, index) => {
                return (
                  <View key={index}>
                    <View style={styles.plotContainerItem}>
                      <View>
                        <Text style={styles.plotText}>{t('select_plot')}</Text>
                        <Text style={styles.plotText}>
                          {t('addcrop_cropname')}
                        </Text>
                        <Text style={styles.plotText}>
                          {t('addcrop_cropvariety')}
                        </Text>
                      </View>
                      <View>
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

                    <View style={[styles.idcontainer, {marginHorizontal: 10}]}>
                      {data.agri_land_user_rel?.plot_img[0]?.file_name.length >
                      5 ? (
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
                                <Image
                                  source={require('../../Common/images/document.png')}
                                  style={styles.idImage}
                                />
                                <Text>
                                  {data.file_name ? data.file_name : 'Unnamed'}
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
            {status == 2 && (
              <>
                <InputTextForm
                  label={t('LoanOrderID')}
                  value={loan_ord_id}
                  editable={false}
                />
                <InputTextForm
                  label={t('LoanSanctioned') + `(${currency})`}
                  value={loan_sanctioned}
                  editable={false}
                />
                <InputTextForm
                  label={t('SanctionedDate')}
                  value={sanctioned_date}
                  editable={false}
                />
              </>
            )}

            {/* <View style={styles.idcontainer}>
                <Text style={styles.title}>{t('address_proof')}</Text>
                <View style={styles.idItemContainer}>
                  {addressProof.map((data, index) => {
                    return (
                      <TouchableOpacity
                        style={styles.idItem}
                        onPress={() => urlOpen('AddressProof', index, data)}
                        key={index}>
                        <Image
                          source={require('../../Common/images/document.png')}
                          style={styles.idImage}
                        />
                        <Text style={styles.imageTitle}>{data.name}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View> */}
            <View style={styles.idcontainer}>
              <Text style={styles.title}>{t('land_records')}</Text>
              <View style={styles.idItemContainer}>
                {landProof.map((data, index) => {
                  return (
                    <TouchableOpacity
                      style={styles.idItem}
                      onPress={() => openURL(data.uri)}
                      key={index}>
                      <Image
                        source={require('../../Common/images/document.png')}
                        style={styles.idImage}
                      />
                      <Text style={styles.imageTitle}>{data.name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>
        </ScrollView>
        {/* {status != 2 && <ButtonForm label={t('submit')} onPress={() => handleSave()} />} */}
      </View>
    </Root>
  );
};

export default FarmerLoanEnquiryDetail;

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
});
