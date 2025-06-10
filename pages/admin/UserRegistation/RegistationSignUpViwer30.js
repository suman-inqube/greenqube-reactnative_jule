import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  BackHandler,
} from 'react-native';
import React, {useEffect, useState, useContext} from 'react';
import {UserRegisterAPI} from './UserRegistationAPI';
import {
  useFocusEffect,
  useNavigation,
  useIsFocused,
  CommonActions,
} from '@react-navigation/native';
import {userCreateContext} from '../../Context/usersCreateContext';
import LoadingScreen from '../../Common/LoadingScreen';
const RegistationSignUpViwer = () => {
  //GQR-65
  const {
    dbLanTokUsr,
    getItem,
    setItem,
    CustomHeader,
    ButtonForm,
    t,
    DeviceInfo,
    onBackPress,
    Root,
    Toast,
    logoImage,
    topBanner,
    AlertMesg,
  } = useContext(userCreateContext);
  //GQR-65
  const {netConnection} = DeviceInfo();
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [isLoading, setIsLoading] = useState(false);
  const [isstorePersnolInfo, setisstorePersnolInfo] = useState(true);
  const [isstoreFinancial, setisstoreFinancial] = useState(true);
  const [isstoreProduceInfo, setisstoreProduceInfo] = useState(true);
  const [storeSignup, setstoreSignup] = useState({});
  const [storePersnolInfo, setstorePersnolInfo] = useState({});
  const [storeFinancial, setstoreFinancial] = useState({});
  const [storeProduceInfo, setstoreProduceInfo] = useState([]);
  const togglestorePersnolInfo = () =>
    setisstorePersnolInfo(!isstorePersnolInfo);
  const togglestoreFinancial = () => setisstoreFinancial(!isstoreFinancial);
  const togglestoreProduceInfo = () =>
    setisstoreProduceInfo(!isstoreProduceInfo);
  const handleSave = async () => {
        
    setIsLoading(true);
    const formData = new FormData();
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const yearsToSubtract = storePersnolInfo.age;
    const day = currentDate.getDate();
    const month = currentDate.getMonth() + 1;
    const newYear = currentYear - yearsToSubtract;
    const dob = `${newYear}-${month}-${day}`;
    const farmer_details = {
      userName: storePersnolInfo.name,
      contactNumber: storePersnolInfo.phone.toString(),
      lan_id: dbLanTokUsr.languageId.toString(),
      gender: storePersnolInfo.gender.toString(),
      farmer_type: storePersnolInfo?.userType,
      date_of_birth: dob,
      finance_agriculture_campagin: 'No Loan',
      IMEINumber: '123456',
      FcmUserToken: '654321',
      password: storePersnolInfo.password,
      createdBy: dbLanTokUsr.supervisorId,
    };
    const agri_user_addresses = {
      country: dbLanTokUsr.country.toString(),
      company: dbLanTokUsr.company.toString(),
      state: storePersnolInfo.stateValue,
      district: storePersnolInfo.districtValue,
      subdivision: storePersnolInfo.bloctValue,
      address: storePersnolInfo.address,
      pincode: storePersnolInfo.pin,
    };
    const identity_details = {};
    if(storeFinancial.kcc_number){
      identity_details['kcc_number'] = storeFinancial.farmarLoanNo;
    }
    if (storeFinancial.adharCard) {
      identity_details['aadhar_number'] = storeFinancial.adharCard;
    }
    if (storeFinancial.panNo) {
      identity_details['pan_number'] = storeFinancial.panNo;
    }
    if (storeFinancial.adharCard) {
      identity_details['voter_card_number'] = storeFinancial.voterCard;
    }
    const bank_details = {};
    const pension_details = {};
    const lic_details = {};
    // Check and conditionally add key-value pairs to bank_details
    if (storeFinancial.accountHolderName) {
      bank_details['user_bank_account_holder'] =
        storeFinancial.accountHolderName;
    }
    if (storeFinancial.bankAccountNo) {
      bank_details['user_bank_account_number'] = storeFinancial.bankAccountNo;
    }
    if (storeFinancial.bankName) {
      bank_details['user_bank_account_name'] = storeFinancial.bankName;
    }
    if (storeFinancial.branchName) {
      bank_details['user_bank_branch_name'] = storeFinancial.branchName;
    }
    if (storeFinancial.ifscCode) {
      bank_details['user_bank_ifsc_code'] = storeFinancial.ifscCode;
    }
    // Check and conditionally add key-value pairs to pension_details
    if (storeFinancial.pensionProvidingAuthority) {
      pension_details['pension_authority'] =
        storeFinancial.pensionProvidingAuthority;
    }
    if (storeFinancial.pensionAccountNo) {
      pension_details['pension_account_no'] = storeFinancial.pensionAccountNo;
    }
    if (storeFinancial.pensionEffectiveFrom) {
      pension_details['effective_from'] = storeFinancial.pensionEffectiveFrom;
    }
    if (storeFinancial.pensionAmount) {
      pension_details['pension_amount'] = storeFinancial.pensionAmount;
    }
    if (
      storeFinancial.pensionPerMonth &&
      storeFinancial.pensionPerMonth.value
    ) {
      pension_details['frequency'] = storeFinancial.pensionPerMonth.value;
    }
    // Check and conditionally add key-value pairs to lic_details
    if (storeFinancial.nameOfCompany) {
      lic_details['company_name'] = storeFinancial.nameOfCompany;
    }
    if (storeFinancial.policyNumber) {
      lic_details['policy_no'] = storeFinancial.policyNumber;
    }
    if (storeFinancial.sumInsured) {
      lic_details['sum_insured'] = storeFinancial.sumInsured;
    }
    const agri_land_user_rels = storeProduceInfo.map((item, index) => ({
      plot_no: item.storeProduceInfo.plotSiteName,
      terrain_type_id: item.storeProduceInfo.terrainTypeValue,
      lan_type_id: item.storeProduceInfo.landTypeValue,
      soil_type_id: item.storeProduceInfo.soilTypeValue,
      land_unit_id: item.storeProduceInfo.landUnit,
      land_size: item.storeProduceInfo.plotSize,
      google_area: item.storeProduceInfo.google_area,
      land_convert_size:
        item.storeProduceInfo.sizevalue == '' ||
        item.storeProduceInfo.sizevalue == undefined ||
        item.storeProduceInfo.sizevalue == null
          ? item.storeProduceInfo.plotSize * 1
          : item.storeProduceInfo.plotSize * item.storeProduceInfo.sizevalue,
      latitude: item.location[0].latitude.toString(),
      longitude: item.location[0].longitude.toString(),
      daag_no: item.storeProduceInfo.daagNo,
      khatian_no: item.storeProduceInfo.khatianNo,
      plant_number: item.storeProduceInfo.noOfPlants,
      agri_land_user_latlongs: item.location.filter(
        item => item.latitude !== '',
      ),
    }));
    const crop_details = storeProduceInfo.map((item, index) => ({
      crop_season_id: item.storeProduceInfo.prodctionSeasionValue,
      crop_type_id: item.storeProduceInfo.livelihoodTypeValue,
      crop_name_id: item.storeProduceInfo.produceNameValue,
      crop_variety_id: item.storeProduceInfo.produceVarietyValue,
      is_primary: 0,
      production_system: item.storeProduceInfo.productionProcessValue,
      total_production: '',
      have_fertilizer: 'Yes',
      buy_pesticide: 'No',
      sowing_date: item.storeProduceInfo.cycleStarts,
      harvesting_date: item.storeProduceInfo.cycleEnds,
      yield_amount: item.storeProduceInfo.expectedProduction,
      yield_unit: item.storeProduceInfo.produceProductionUnitValue,
    }));
    const agri_ponds = [];
    const data_farmer_details = {};
    farmer_details['agri_user_addresses'] = agri_user_addresses;
    farmer_details['identity_details'] = identity_details;
    farmer_details['bank_details'] = bank_details;
    farmer_details['pension_details'] = pension_details;
    farmer_details['lic_details'] = lic_details;
    farmer_details['agri_land_user_rels'] = agri_land_user_rels;
    farmer_details['crop_details'] = crop_details;
    farmer_details['agri_ponds'] = agri_ponds;
    farmer_details['agri_ponds'] = agri_ponds;
    data_farmer_details['farmer_details'] = farmer_details;
    formData.append('data', JSON.stringify([data_farmer_details]));
    if (storePersnolInfo.userImg.name != undefined) {
      formData.append('photo', storePersnolInfo.userImg);
    }
    const locationArr = storeProduceInfo.map(data => data.location);
    // farmer_details['latlong_data'] = JSON.stringify(latlongArr);
    const filteredFiles = storeProduceInfo[0].landProof.map((data, index) => {
      if (data.name != '') {
        return {uri: data?.uri, type: data?.type, name: data?.name};
      }
    });
    const landProofData = storeProduceInfo.map(item => ({
      landProof: item.landProof,
    }));
    if (landProofData.length != 0) {
      landProofData.map((_data, _index) => {
        _data?.landProof?.map(landData => {
          if (landData?.name != '') {
            formData.append(`plot_image_${_index + 1}`, {
              uri: landData?.uri,
              type: landData?.type,
              name: landData?.name,
            });
          }
        });
      });
    }
    if (
      storePersnolInfo.identityProofIdentityPropf[0]?.fileName != '' &&
      storePersnolInfo.identityProofIdentityPropf[0]?.fileName != ''
    ) {
      const {uri, type, name} = storePersnolInfo.identityProofIdentityPropf[0];
      formData.append('farmer_address', {
        uri: uri,
        type: type,
        name: name,
      });
    }
    if (
      storePersnolInfo.identityProofIdentityPropf[1]?.fileName != '' &&
      storePersnolInfo.identityProofIdentityPropf[1]?.fileName != ''
    ) {
      const {uri, type, name} = storePersnolInfo.identityProofIdentityPropf[1];
      formData.append('farmer_identity', {
        uri: uri,
        type: type,
        name: name,
      });
    }
    console.log(formData);
    if (netConnection) {
      const database_res = await UserRegisterAPI(
        dbLanTokUsr.dbName,
        dbLanTokUsr.languageId,
        dbLanTokUsr.token,
        dbLanTokUsr.supervisorId,
        formData,
        landProofData.length,
      );
      if (database_res.status === 200) {
        Toast.show({text: t('farmer_reg_successfully'), ...AlertMesg[0]});
        setTimeout(() => {
          navigation.dispatch({
            ...CommonActions.reset({
              index: 0,
              routes: [{name: 'AdminNavigation'}],
            }),
          });
        }, 2000);
      }
    } else {
      let offlineDataArr = await getItem('offlineUserRegistrationData');
      if (offlineDataArr) {
        offlineDataArr.push(formData);
        await setItem('offlineUserRegistrationData', offlineDataArr);
      } else {
        await setItem('offlineUserRegistrationData', [formData]);
      }
      Toast.show({text: t('farmer_reg_successfully'), ...AlertMesg[0]});
      setTimeout(() => {
        navigation.dispatch({
          ...CommonActions.reset({
            index: 0,
            routes: [{name: 'AdminNavigation'}],
          }),
        });
      }, 2000);
    }
    setIsLoading(false);
  };
  const onPageLoad = async () => {
    const [
      storeSignup_data,
      storePersnolInfo_data,
      storeFinancial_data,
      storeProduceInfo_data,
    ] = await Promise.all([
      getItem('storeSignup_data'),
      getItem('storePersnolInfo_data'),
      getItem('storeFinancial_data'),
      getItem('storeProduceInfo_data'),
    ]);
    await Promise.all([
      setstoreSignup(storeSignup_data),
      setstorePersnolInfo(storePersnolInfo_data),
      setstoreFinancial(storeFinancial_data),
      setstoreProduceInfo(storeProduceInfo_data),
    ]);
  };
  const handleBackPress = () => {
    navigation.navigate('RegistationSignUpViwer');
    return true;
  };
  useEffect(() => {
    if (isFocused) {
      onPageLoad();
    }
    onBackPress(handleBackPress);
  }, [isFocused]);
  const HandlerGoBack = () => {};
  return (
    <View style={{flex: 1, backgroundColor: '#FFFFFF'}}>
      <Root>
        <CustomHeader
          path="RegistationSignUpViwer"
          HandlerGoBack={HandlerGoBack}
          logoImage={logoImage}
          topBanner={topBanner}
        />
        {isLoading && (
          <View style={styles.loadingScreen}>
            <LoadingScreen />
          </View>
        )}
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={{marginBottom: 100}}>
            <View
              style={{
                margin: 10,
                elevation: 3,
                borderRadius: 30,
                paddingHorizontal: 10,
                paddingVertical: 10,
                backgroundColor: '#D5FFD0',
                marginTop: 15,
              }}>
              <TouchableOpacity onPress={togglestorePersnolInfo}>
                <View style={styles.headerStyle}>
                  <Text
                    style={[styles.title, {fontFamily: 'Poppins-SemiBold'}]}>
                    {isstorePersnolInfo
                      ? `${t('personal_information')}`
                      : `${t('personal_information')}`}
                  </Text>
                  {isstorePersnolInfo ? (
                    <Image
                      source={require('../../Common/images/sub.png')}
                      style={{width: 20, height: 20}}
                    />
                  ) : (
                    <Image
                      source={require('../../Common/images/add.png')}
                      style={{width: 20, height: 20}}
                    />
                  )}
                </View>
              </TouchableOpacity>
              {isstorePersnolInfo && (
                <>
                  {storePersnolInfo ? (
                    storePersnolInfo ? (
                      // storePersnolInfo.block ?
                      <View style={{margin: 10}}>
                        <View style={styles.bodyContainer}>
                          <View style={{alignItems: 'flex-end'}}>
                            <TouchableOpacity
                              onPress={() =>
                                navigation.navigate('PersonalInformation', {
                                  pagename: 'RegistationSignUpViwer',
                                })
                              }>
                              <Image
                                source={require('../../Common/images/edit.png')}
                                style={{width: 25, height: 25}}
                              />
                            </TouchableOpacity>
                          </View>

                          <View style={styles.mainContainer}>
                            <View style={styles.leftSection}>
                              <Text style={styles.title}>{t('name')} </Text>
                            </View>
                            <View style={styles.rightSection}>
                              <Text style={styles.title}>
                                : {storePersnolInfo.name}
                              </Text>
                            </View>
                          </View>

                          <View style={styles.mainContainer}>
                            <View style={styles.leftSection}>
                              <Text style={styles.title}>
                                {t('mobile_number')}{' '}
                              </Text>
                            </View>
                            <View style={styles.rightSection}>
                              <Text style={styles.title}>
                                : {storePersnolInfo.phone}
                              </Text>
                            </View>
                          </View>
                          <View style={styles.mainContainer}>
                            <View style={styles.leftSection}>
                              <Text style={styles.title}>{t('age')} </Text>
                            </View>
                            <View style={styles.rightSection}>
                              <Text style={styles.title}>
                                : {storePersnolInfo.age} {t('fin_year')}
                              </Text>
                            </View>
                          </View>
                          <View style={styles.mainContainer}>
                            <View style={styles.leftSection}>
                              <Text style={styles.title}>
                                {t('pre_state_division_zone')}{' '}
                              </Text>
                            </View>
                            <View style={styles.rightSection}>
                              <Text style={styles.title}>
                                : {storePersnolInfo.state}
                              </Text>
                            </View>
                          </View>
                          <View style={styles.mainContainer}>
                            <View style={styles.leftSection}>
                              <Text style={styles.title}>
                                {t('pre_district_county')}{' '}
                              </Text>
                            </View>
                            <View style={styles.rightSection}>
                              <Text style={styles.title}>
                                : {storePersnolInfo.district}
                              </Text>
                            </View>
                          </View>
                          <View style={styles.mainContainer}>
                            <View style={styles.leftSection}>
                              <Text style={styles.title}>
                                {t('select_block_sub_county_upzila').substring(
                                  0,
                                  17,
                                )}{' '}
                              </Text>
                            </View>
                            <View style={styles.rightSection}>
                              <Text style={styles.title}>
                                :{' '}
                                {storePersnolInfo ? storePersnolInfo.block : ''}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </View>
                    ) : (
                      ''
                    )
                  ) : (
                    ''
                  )}
                </>
              )}
            </View>
            <View
              style={{
                margin: 10,
                elevation: 3,
                borderRadius: 30,
                paddingHorizontal: 10,
                paddingVertical: 10,
                backgroundColor: '#D5FFD0',
              }}>
              <TouchableOpacity onPress={togglestoreFinancial}>
                <View style={styles.headerStyle}>
                  <Text
                    style={[styles.title, {fontFamily: 'Poppins-SemiBold'}]}>
                    {isstoreFinancial
                      ? `${t('financial_information')}`
                      : `${t('financial_information')}`}
                  </Text>
                  {isstoreFinancial ? (
                    <Image
                      source={require('../../Common/images/sub.png')}
                      style={{width: 20, height: 20}}
                    />
                  ) : (
                    <Image
                      source={require('../../Common/images/add.png')}
                      style={{width: 20, height: 20}}
                    />
                  )}
                </View>
              </TouchableOpacity>
              {isstoreFinancial && (
                <>
                  {storeFinancial ? (
                    <View style={{margin: 10}}>
                      <View style={styles.bodyContainer}>
                        <View style={{alignItems: 'flex-end'}}>
                          <TouchableOpacity
                            onPress={() =>
                              navigation.navigate('FinancialInformation', {
                                pagename: 'RegistationSignUpViwer',
                                editItem: storeFinancial,
                              })
                            }>
                            <Image
                              source={require('../../Common/images/edit.png')}
                              style={{width: 25, height: 25}}
                            />
                          </TouchableOpacity>
                        </View>

                        <View style={styles.mainContainer}>
                          <View style={styles.leftSection}>
                            <Text style={styles.title}>
                              {t('account_holder_name')}{' '}
                            </Text>
                          </View>
                          <View style={styles.rightSection}>
                            <Text style={styles.title}>
                              : {storeFinancial.accountHolderName}
                            </Text>
                          </View>
                        </View>

                        <View style={styles.mainContainer}>
                          <View style={styles.leftSection}>
                            <Text style={styles.title}>
                              {t('adhar_no').substring(0, 20)}{' '}
                            </Text>
                          </View>
                          <View style={styles.rightSection}>
                            <Text style={styles.title}>
                              : {storeFinancial.adharCard}
                            </Text>
                          </View>
                        </View>
                        {/* <View style={styles.mainContainer}>
                                                        <View style={styles.leftSection}>
                                                            <Text style={styles.title}> Bank Account No </Text>
                                                        </View>
                                                        <View style={styles.rightSection}>
                                                            <Text style={styles.title}>{storeFinancial.bankAccountNo}</Text>
                                                        </View>
                                                    </View> */}
                        {/* <View style={styles.mainContainer}>
                                                        <View style={styles.leftSection}>
                                                            <Text style={styles.title}> Bank Name </Text>
                                                        </View>
                                                        <View style={styles.rightSection}>
                                                            <Text style={styles.title}>{storeFinancial.bankName}</Text>
                                                        </View>
                                                    </View> */}
                        {/* <View style={styles.mainContainer}>
                                                        <View style={styles.leftSection}>
                                                            <Text style={styles.title}> Farmar Loan No </Text>
                                                        </View>
                                                        <View style={styles.rightSection}>
                                                            <Text style={styles.title}>{storeFinancial.farmarLoanNo}</Text>
                                                        </View>
                                                    </View> */}
                        {/* <View style={styles.mainContainer}>
                                                        <View style={styles.leftSection}>
                                                            <Text style={styles.title}> Branch Name </Text>
                                                        </View>
                                                        <View style={styles.rightSection}>
                                                            <Text style={styles.title}>{storeFinancial.branchName}</Text>
                                                        </View>
                                                    </View> */}
                        {/* <View style={styles.mainContainer}>
                                                        <View style={styles.leftSection}>
                                                            <Text style={styles.title}> Ifsc Code </Text>
                                                        </View>
                                                        <View style={styles.rightSection}>
                                                            <Text style={styles.title}>{storeFinancial.ifscCode}</Text>
                                                        </View>
                                                    </View> */}
                        <View style={styles.mainContainer}>
                          <View style={styles.leftSection}>
                            <Text style={styles.title}>
                              {t('lic_name_of_company')}{' '}
                            </Text>
                          </View>
                          <View style={styles.rightSection}>
                            <Text style={styles.title}>
                              : {storeFinancial.ifscCode}
                            </Text>
                          </View>
                        </View>
                        {/* <View style={styles.mainContainer}>
                                                        <View style={styles.leftSection}>
                                                            <Text style={styles.title}> Pan No </Text>
                                                        </View>
                                                        <View style={styles.rightSection}>
                                                            <Text style={styles.title}>{storeFinancial.panNo}</Text>
                                                        </View>
                                                    </View> */}
                        {/* <View style={styles.mainContainer}>
                                                        <View style={styles.leftSection}>
                                                            <Text style={styles.title}> Pension Account No </Text>
                                                        </View>
                                                        <View style={styles.rightSection}>
                                                            <Text style={styles.title}>{storeFinancial.pensionAccountNo}</Text>
                                                        </View>
                                                    </View> */}
                        {/* <View style={styles.mainContainer}>
                                                        <View style={styles.leftSection}>
                                                            <Text style={styles.title}> Pension Amount </Text>
                                                        </View>
                                                        <View style={styles.rightSection}>
                                                            <Text style={styles.title}>{storeFinancial.pensionAmount}</Text>
                                                        </View>
                                                    </View> */}
                        {/* <View style={styles.mainContainer}>
                                                        <View style={styles.leftSection}>
                                                            <Text style={styles.title}> Pension Effective From </Text>
                                                        </View>
                                                        <View style={styles.rightSection}>
                                                            <Text style={styles.title}>{storeFinancial.pensionEffectiveFrom}</Text>
                                                        </View>
                                                    </View> */}
                        {/* <View style={styles.mainContainer}>
                                                        <View style={styles.leftSection}>
                                                            <Text style={styles.title}> Pension Per Month </Text>
                                                        </View>
                                                        <View style={styles.rightSection}>
                                                            <Text style={styles.title}>{storeFinancial.pensionPerMonth.label}</Text>
                                                        </View>
                                                    </View> */}
                        <View style={styles.mainContainer}>
                          <View style={styles.leftSection}>
                            <Text style={styles.title}>
                              {t('pension_providing_authority').substring(
                                0,
                                15,
                              )}{' '}
                            </Text>
                          </View>
                          <View style={styles.rightSection}>
                            <Text style={styles.title}>
                              : {storeFinancial.pensionProvidingAuthority}
                            </Text>
                          </View>
                        </View>
                        {/* <View style={styles.mainContainer}>
                                                        <View style={styles.leftSection}>
                                                            <Text style={styles.title}> Policy Number </Text>
                                                        </View>
                                                        <View style={styles.rightSection}>
                                                            <Text style={styles.title}>{storeFinancial.policyNumber}</Text>
                                                        </View>
                                                    </View> */}
                        {/* <View style={styles.mainContainer}>
                                                        <View style={styles.leftSection}>
                                                            <Text style={styles.title}> Sum Insured </Text>
                                                        </View>
                                                        <View style={styles.rightSection}>
                                                            <Text style={styles.title}>{storeFinancial.sumInsured}</Text>
                                                        </View>
                                                    </View> */}
                        {/* <View style={styles.mainContainer}>
                                                        <View style={styles.leftSection}>
                                                            <Text style={styles.title}> Voter Card </Text>
                                                        </View>
                                                        <View style={styles.rightSection}>
                                                            <Text style={styles.title}>{storeFinancial.voterCard}</Text>
                                                        </View>
                                                    </View> */}
                      </View>
                    </View>
                  ) : (
                    ''
                  )}
                </>
              )}
            </View>
            <View
              style={{
                margin: 10,
                elevation: 3,
                borderRadius: 30,
                paddingHorizontal: 10,
                paddingVertical: 10,
                backgroundColor: '#D5FFD0',
              }}>
              <TouchableOpacity onPress={togglestoreProduceInfo}>
                <View style={styles.headerStyle}>
                  <Text
                    style={[styles.title, {fontFamily: 'Poppins-SemiBold'}]}>
                    {isstoreProduceInfo
                      ? `${t('crop_information')}`
                      : `${t('crop_information')}`}
                  </Text>
                  {isstoreProduceInfo ? (
                    <Image
                      source={require('../../Common/images/sub.png')}
                      style={{width: 20, height: 20}}
                    />
                  ) : (
                    <Image
                      source={require('../../Common/images/add.png')}
                      style={{width: 20, height: 20, resizeMode: 'cover'}}
                    />
                  )}
                </View>
              </TouchableOpacity>
              {isstoreProduceInfo && (
                <>
                  {storeProduceInfo ? (
                    <View
                      style={[
                        styles.bodyContainerMarginBottom,
                        {marginTop: 10},
                      ]}>
                      {storeProduceInfo?.map((item, index) => {
                        const {
                          plotSiteName,
                          plotSize,
                          landUnitName,
                          produceName,
                          produceVariety,
                          cycleStarts,
                          cycleEnds,
                        } = item?.storeProduceInfo;
                        return (
                          <View
                            style={{
                              borderBottomWidth: 2,
                              borderColor: '#050505',
                            }}
                            key={index}>
                            <View style={{alignItems: 'flex-end'}}>
                              <TouchableOpacity
                                onPress={() =>
                                  navigation.navigate(
                                    'PlotSiteProduceInformation',
                                    {
                                      pagename: 'RegistationSignUpViwer',
                                      editItem: item,
                                      arrayIndex: index,
                                    },
                                  )
                                }>
                                <Image
                                  source={require('../../Common/images/edit.png')}
                                  style={{width: 25, height: 25}}
                                />
                              </TouchableOpacity>
                            </View>
                            <View>
                              <View style={styles.mainContainer}>
                                <View style={styles.leftSection}>
                                  <Text style={styles.title}>
                                    {' '}
                                    {t('pre_plot_name')}{' '}
                                  </Text>
                                </View>
                                <View style={styles.rightSection}>
                                  <Text style={styles.title}>
                                    {plotSiteName}
                                  </Text>
                                </View>
                              </View>
                              {/* <View style={styles.mainContainer}>
                                                                    <View style={styles.leftSection}>
                                                                        <Text style={styles.title}> Land Type </Text>
                                                                    </View>
                                                                    <View style={styles.rightSection}>
                                                                        <Text style={styles.title}>{item.landType}</Text>
                                                                    </View>
                                                                </View> */}
                              <View style={styles.mainContainer}>
                                <View style={styles.leftSection}>
                                  <Text style={styles.title}>
                                    {' '}
                                    {t('pre_land_size')}{' '}
                                  </Text>
                                </View>
                                <View style={styles.rightSection}>
                                  <Text style={styles.title}>{plotSize}</Text>
                                </View>
                              </View>
                              <View style={styles.mainContainer}>
                                <View style={styles.leftSection}>
                                  <Text style={styles.title}>
                                    {' '}
                                    {t('addland_unit')}
                                  </Text>
                                </View>
                                <View style={styles.rightSection}>
                                  <Text style={styles.title}>
                                    {landUnitName}
                                  </Text>
                                </View>
                              </View>
                              <View style={styles.mainContainer}>
                                <View style={styles.leftSection}>
                                  <Text style={styles.title}>
                                    {' '}
                                    {t('crop_name')}{' '}
                                  </Text>
                                </View>
                                <View style={styles.rightSection}>
                                  <Text style={styles.title}>
                                    {produceName}
                                  </Text>
                                </View>
                              </View>
                              <View style={styles.mainContainer}>
                                <View style={styles.leftSection}>
                                  <Text style={styles.title}>
                                    {' '}
                                    {t('crop_veriety')}{' '}
                                  </Text>
                                </View>
                                <View style={styles.rightSection}>
                                  <Text style={styles.title}>
                                    {produceVariety}
                                  </Text>
                                </View>
                              </View>
                              <View style={styles.mainContainer}>
                                <View style={styles.leftSection}>
                                  <Text style={styles.title}>
                                    {' '}
                                    {t('showing_date')}{' '}
                                  </Text>
                                </View>
                                <View style={styles.rightSection}>
                                  <Text style={styles.title}>
                                    {cycleStarts}
                                  </Text>
                                </View>
                              </View>
                              <View style={styles.mainContainer}>
                                <View style={styles.leftSection}>
                                  <Text style={styles.title}>
                                    {' '}
                                    {t('harvesting_date_auto_calculated')}{' '}
                                  </Text>
                                </View>
                                <View style={styles.rightSection}>
                                  <Text style={styles.title}>{cycleEnds}</Text>
                                </View>
                              </View>
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  ) : (
                    ''
                  )}
                </>
              )}
            </View>
          </View>
        </ScrollView>
        <ButtonForm label={t('save')} onPress={handleSave} />
      </Root>
    </View>
  );
};

export default RegistationSignUpViwer;
const styles = StyleSheet.create({
  headerStyle: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // borderColor: '#0a0a0a',
    // borderWidth: 1,
    padding: 5,
    // backgroundColor: '#D5FFD0',
    borderRadius: 5,
    height: 30,
    paddingHorizontal: 15,
    // borderRadius:20,
  },
  bodyContainer: {
    // backgroundColor: '#DAC0A3',
    backgroundColor: '#FFF',
    padding: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
    // borderWidth:1,
    borderColor: '#00000065',
    justifyContent: 'center',
    // elevation:5
  },
  bodyContainerMarginBottom: {
    // backgroundColor: '#DAC0A3',
    backgroundColor: '#FFF',
    padding: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
    // borderWidth: 3,
    // borderColor: '#00000065',
    // elevation:5,
    margin: 10,
  },
  viewText: {
    marginTop: 15,
  },
  mainContainer: {
    flex: 1,
    flexDirection: 'row',
    marginBottom: 15, // Display children in a row horizontally
  },
  leftSection: {
    flex: 1, // Take 50% of the available horizontal space
  },
  rightSection: {
    flex: 1, // Take 50% of the available horizontal space
  },
  title: {
    color: '#000',
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
  },
  loadingScreen: {
    position: 'absolute',
    top: 250,
    zIndex: 1,
    left: '45%',
  },
});
