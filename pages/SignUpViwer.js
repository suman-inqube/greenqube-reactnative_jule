import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
} from 'react-native';
import React, {useEffect, useState, useContext} from 'react';
import ButtonForm from './Common/ButtonForm';
import {getItem, setItem, removeItem} from '../config/getDataFromStorage';
import {useNavigation} from '@react-navigation/native';
import MessageDialog from './Common/MessageDialog';
import {useFocusEffect} from '@react-navigation/native';
import {signupSaveAPI} from '../config/apiHere';
import {useTranslation} from 'react-i18next';
import {onBackPress} from './Common/BackPressHandler';
import DeviceInfo from './DeviceInfo';
import FormsTitle from './Common/FormsTitle';
import {userCreateContext} from './Context/usersCreateContext';
import LoadingScreen from './Common/LoadingScreen';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {Colors, Fonts} from './utils/Constants';
import {SafeAreaView, SafeAreaProvider} from 'react-native-safe-area-context';
const SignUpViwer = () => {
  //GQR-65
  const {AllFarmerList, Toast, Root, AlertMesg, t} =
    useContext(userCreateContext);

  // const { t } = useTranslation();
  const {netConnection} = DeviceInfo();
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();
  const [isstorePersnolInfo, setisstorePersnolInfo] = useState(false);
  const [isstoreFinancial, setisstoreFinancial] = useState(false);
  const [isstoreProduceInfo, setisstoreProduceInfo] = useState(false);
  const [storeSignup, setstoreSignup] = useState({});
  const [storePersnolInfo, setstorePersnolInfo] = useState({});
  const [storeFinancial, setstoreFinancial] = useState({});
  const [storeProduceInfo, setstoreProduceInfo] = useState([]);
  const [saveData, setsaveData] = useState([]);
  const togglestorePersnolInfo = () => {
    setisstorePersnolInfo(!isstorePersnolInfo);
  };
  const togglestoreFinancial = () => {
    setisstoreFinancial(!isstoreFinancial);
  };
  const togglestoreProduceInfo = () => {
    setisstoreProduceInfo(!isstoreProduceInfo);
  };
  const InputDataHere = async (
    storeSignup_data,
    storePersnolInfo_data,
    storeFinancial_data,
    storeProduceInfo_data,
  ) => {
    try {
      // const gender = storePersnolInfo_data.gender === 'male' ? "1" : "2";
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const yearsToSubtract = storePersnolInfo_data.age;
      const day = currentDate.getDate();
      const month = currentDate.getMonth() + 1;
      const newYear = currentYear - yearsToSubtract;
      const dob = `${newYear}-${month}-${day}`;
      // const userType = storePersnolInfo_data.userType === 'large Grower' ? "1" : storePersnolInfo_data.userType === 'mall holder' ? "2" : "3"
      const lan_id = storePersnolInfo_data.language.value.toString();
      const phone = storeSignup_data.phone.toString();
      const farmer_details = {
        userName: storePersnolInfo_data.name,
        contactNumber: phone,
        lan_id: lan_id,
        gender: storePersnolInfo_data?.gender,
        farmer_type: storePersnolInfo_data?.userType,
        date_of_birth: dob,
        finance_agriculture_campagin: 'No Loan',
        IMEINumber: '123456',
        FcmUserToken: '654321',
        password: storeSignup_data.password,
        createdBy: storeSignup_data.supervisor.value,
      };
      const agri_user_addresses = {
        country: storeSignup_data?.country?.value,
        company: storeSignup_data?.company?.value,
        state: storePersnolInfo_data.stateInfo.value,
        district: storePersnolInfo_data.district.value,
        subdivision: storePersnolInfo_data.block.value,
        address: storePersnolInfo_data.address,
        pincode: storePersnolInfo_data.zip,
      };
      const identity_details = {};
      if (storeFinancial.kcc_number) {
        identity_details['kcc_number'] = storeFinancial.farmarLoanNo;
      }
      if (storeFinancial_data.adharCard) {
        identity_details['aadhar_number'] = storeFinancial_data.adharCard;
      }
      if (storeFinancial_data.panNo) {
        identity_details['pan_number'] = storeFinancial_data.panNo;
      }

      if (storeFinancial_data.adharCard) {
        identity_details['voter_card_number'] = storeFinancial_data.adharCard;
      }
      const bank_details = {};
      const pension_details = {};
      const lic_details = {};
      if (storeFinancial_data.accountHolderName) {
        bank_details['user_bank_account_holder'] =
          storeFinancial_data.accountHolderName;
      }
      if (storeFinancial_data.bankAccountNo) {
        bank_details['user_bank_account_number'] =
          storeFinancial_data.bankAccountNo;
      }
      if (storeFinancial_data.bankName) {
        bank_details['user_bank_account_name'] = storeFinancial_data.bankName;
      }
      if (storeFinancial_data.branchName) {
        bank_details['user_bank_branch_name'] = storeFinancial_data.branchName;
      }
      if (storeFinancial_data.ifscCode) {
        bank_details['user_bank_ifsc_code'] = storeFinancial_data.ifscCode;
      }
      if (storeFinancial_data.pensionProvidingAuthority) {
        pension_details['pension_authority'] =
          storeFinancial_data.pensionProvidingAuthority;
      }
      if (storeFinancial_data.pensionAccountNo) {
        pension_details['pension_account_no'] =
          storeFinancial_data.pensionAccountNo;
      }
      if (storeFinancial_data.pensionEffectiveFrom) {
        pension_details['effective_from'] =
          storeFinancial_data.pensionEffectiveFrom;
      }
      if (storeFinancial_data.pensionAmount) {
        pension_details['pension_amount'] = storeFinancial_data.pensionAmount;
      }
      if (
        storeFinancial_data.pensionPerMonth &&
        storeFinancial_data.pensionPerMonth.value
      ) {
        pension_details['frequency'] =
          storeFinancial_data.pensionPerMonth.value;
      }
      if (storeFinancial_data.nameOfCompany) {
        lic_details['company_name'] = storeFinancial_data.nameOfCompany;
      }
      if (storeFinancial_data.policyNumber) {
        lic_details['policy_no'] = storeFinancial_data.policyNumber;
      }
      if (storeFinancial_data.sumInsured) {
        lic_details['sum_insured'] = storeFinancial_data.sumInsured;
      }
      const agri_land_user_rels = storeProduceInfo_data.map((item, index) => ({
        plot_no: item.storeProduceInfo.plotSiteName,
        terrain_type_id:
          item.storeProduceInfo.terrainType &&
          item.storeProduceInfo.terrainType.value,
        lan_type_id:
          item.storeProduceInfo.landType &&
          item.storeProduceInfo.landType.value,
        soil_type_id:
          item.storeProduceInfo.soilType &&
          item.storeProduceInfo.soilType.value,
        land_unit_id: item.storeProduceInfo.landUnit,
        land_size: item.storeProduceInfo.plotSize,
        google_area: item.storeProduceInfo.google_area,
        device_no: item.storeProduceInfo.IOTId,
        device_lat: item.storeProduceInfo.IOTLatlat,
        device_long: item.storeProduceInfo.IOTLatLong,
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
      const crop_details = storeProduceInfo_data.map((item, index) => ({
        crop_season_id:
          item.storeProduceInfo.prodctionSeasion &&
          item.storeProduceInfo.prodctionSeasion.value,
        crop_type_id:
          item.storeProduceInfo.livelihoodType &&
          item.storeProduceInfo.livelihoodType.value,
        crop_name_id:
          item.storeProduceInfo.produceName &&
          item.storeProduceInfo.produceName.value,
        crop_variety_id:
          item.storeProduceInfo.produceVariety &&
          item.storeProduceInfo.produceVariety.value,
        is_primary: 1,
        production_system:
          item.storeProduceInfo.productionProcess &&
          item.storeProduceInfo.productionProcess.value,
        total_production: '7',
        have_fertilizer: 'Yes',
        buy_pesticide: 'No',
        sowing_date: item.storeProduceInfo.cycleStarts,
        harvesting_date: item.storeProduceInfo.cycleEnds,
        yield_amount: item.storeProduceInfo.expectedProduction,
        yield_unit:
          item.storeProduceInfo.produceProductionUnit &&
          item.storeProduceInfo.produceProductionUnit.value,
      }));
      const agri_ponds = [];
      const data_farmer_details = {};
      const data = [];
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
      data.push(data_farmer_details);
      setsaveData(data);
    } catch (error) {
      Toast.show({
        time: 3,
        text: error,
        ...AlertMesg[0],
      });
    }
  };
  const handleSave = async () => {
    try {
      setIsLoading(true);
      let dbname = '';
      let language = '';
      if (storeSignup?.company?.dbname) {
        dbname = storeSignup?.company?.dbname;
      }
      if (storePersnolInfo?.language?.value) {
        language = storePersnolInfo?.language?.value;
      }
      const formData = new FormData();
      formData.append('data', JSON.stringify(saveData));
      if (storePersnolInfo.img != '') {
        formData.append('photo', {
          uri: storePersnolInfo.img,
          type: storePersnolInfo.imgType,
          name: storePersnolInfo.imgName,
        });
      }
      if (
        storePersnolInfo.identityProofIdentityPropf[0]?.fileName != '' &&
        storePersnolInfo.identityProofIdentityPropf[0]?.fileName != ''
      ) {
        const {uri, type, name} =
          storePersnolInfo.identityProofIdentityPropf[0];
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
        const {uri, type, name} =
          storePersnolInfo.identityProofIdentityPropf[1];
        formData.append('farmer_identity', {
          uri: uri,
          type: type,
          name: name,
        });
      }
      const filteredFiles = storeProduceInfo[0].landProof.map((data, index) => {
        if (data.name != '') {
          return {uri: data?.uri, type: data?.type, name: data?.name};
        }
      });

      const landProofData = storeProduceInfo.map(item => ({
        landProof: item.landProof,
      }));

      //   console.log(JSON.stringify(landProofData));

      //   const filteredData = landProofData.map(item => ({landProof: item.landProof.filter(land => land.name !== "")}));

      // console.log(filteredData);
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
      console.log(formData);
      if (netConnection) {
        const database_res = await signupSaveAPI(
          formData,
          dbname,
          language,
          landProofData.length,
        );
        console.log('database_res', database_res);
        if (database_res?.status == 200) {
          Toast.show({
            time: 3,
            text: 'Farmer Registered Successfully',
            ...AlertMesg[0],
          });
          setTimeout(() => {
            navigation.navigate('Login');
          }, 1200);
          // AllFarmerList();
        }
      } else {
        let offlineDataArr = await getItem('offlineUserRegistrationData');
        if (offlineDataArr) {
          offlineDataArr.push(formData);
          await setItem('offlineUserRegistrationData', offlineDataArr);
        } else {
          await setItem('offlineUserRegistrationData', [formData]);
        }
        Toast.show({
          time: 3,
          text: 'Farmer Registered Successfully',
          ...AlertMesg[0],
        });
        setTimeout(() => {
          navigation.navigate('Login');
        }, 1200);
        navigation.navigate('Login');
      }
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      Toast.show({
        time: 3,
        text: error,
        ...AlertMesg[0],
      });
      console.log(error);
    }
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
    setstoreSignup(storeSignup_data);
    setstorePersnolInfo(storePersnolInfo_data);
    setstoreFinancial(storeFinancial_data);
    setstoreProduceInfo(storeProduceInfo_data);
    InputDataHere(
      storeSignup_data,
      storePersnolInfo_data,
      storeFinancial_data,
      storeProduceInfo_data,
    );
  };
  function handleBackPress() {
    return true;
  }
  useEffect(() => {
    onPageLoad();
  }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView
        style={{flex: 1, backgroundColor: '#1d3122'}}
        edges={['top', 'right', 'bottom', 'left']}>
        <Root>
          <View style={{flex: 1, backgroundColor: Colors.background_light}}>
            <View
              style={{
                // height: 100,
                backgroundColor: Colors.green,
                borderBottomLeftRadius: 25,
                borderBottomRightRadius: 25,
                justifyContent: 'flex-end',
              }}>
              <View style={styles.headersContainer}>
                <Text style={styles.headersTitle}>
                  {t('preview_information')}
                </Text>
              </View>
            </View>

            <ScrollView>
              <View style={{paddingHorizontal: 20, marginTop: 50}}>
                <View
                  style={{
                    marginTop: 10,
                    padding: 17,
                    borderWidth: 0,
                    borderColor: '#ddd',
                    backgroundColor: '#d3ced7',
                    borderRadius: 20,
                    marginVertical: 20,
                    elevation: 3,
                    // height: 55,
                    borderWidth: 0.5,
                    borderColor: 'black',
                    // alignItems: 'center',
                  }}>
                  <TouchableOpacity onPress={togglestorePersnolInfo}>
                    <View style={styles.headerStyle}>
                      <View style={{paddingLeft: 5, paddingTop: 2}}>
                        <MaterialIcons
                          name="account-circle"
                          size={28}
                          color="#113fac"
                          style={styles.icon}
                        />
                      </View>
                      <Text style={styles.toggleText}>
                        {isstorePersnolInfo
                          ? `${t('personal_information')}`
                          : `${t('personal_information')}`}
                      </Text>
                      <Text style={styles.toggleText}>
                        {isstorePersnolInfo ? (
                          <MaterialIcons
                            name="do-not-disturb-on"
                            size={25}
                            color="red"
                            style={styles.icon}
                          />
                        ) : (
                          <MaterialIcons
                            name="add-circle"
                            size={25}
                            color="green"
                            style={styles.icon}
                          />
                        )}
                      </Text>
                    </View>
                  </TouchableOpacity>
                  {isLoading && (
                    <View style={styles.loadingScreen}>
                      <LoadingScreen />
                    </View>
                  )}
                  {isstorePersnolInfo && (
                    <>
                      {storePersnolInfo ? (
                        storePersnolInfo.block ? (
                          <View style={{margin: 10}}>
                            <View style={styles.bodyContainer}>
                              <View style={{alignItems: 'flex-end'}}>
                                <TouchableOpacity
                                  onPress={() =>
                                    navigation.navigate('PersnolUpdate', {
                                      pagename: 'SignUpViwer',
                                    })
                                  }>
                                  <Image
                                    source={require('./Common/images/edit.png')}
                                    style={{width: 25, height: 25}}
                                  />
                                </TouchableOpacity>
                              </View>
                              <View style={styles.mainContainer}>
                                <Text style={styles.label}>{t('name')} </Text>

                                <Text style={styles.value}>
                                  {storePersnolInfo.name}
                                </Text>
                              </View>
                              <View style={styles.mainContainer}>
                                <Text style={styles.label}>
                                  {t('new_reg_phone_number')}
                                </Text>

                                <Text style={styles.value}>
                                  {storeSignup.phone}
                                </Text>
                              </View>
                              <View style={styles.mainContainer}>
                                <Text style={styles.label}>{t('age')}</Text>
                                <Text style={styles.value}>
                                  {storePersnolInfo.age} {t('fin_year')}
                                </Text>
                              </View>
                              <View style={styles.mainContainer}>
                                <Text style={styles.label}>
                                  {t('language')}{' '}
                                </Text>

                                <Text style={styles.value}>
                                  {storePersnolInfo.language.label}
                                </Text>
                              </View>
                              <View style={styles.mainContainer}>
                                <Text style={styles.label}>
                                  {t('farmer_reg_state')}
                                </Text>

                                <Text style={styles.value}>
                                  {storePersnolInfo.stateInfo.label}
                                </Text>
                              </View>

                              <View style={styles.mainContainer}>
                                <Text style={styles.label}>
                                  {t('select_district_county')}
                                </Text>

                                <Text style={styles.value}>
                                  {storePersnolInfo.district.label}
                                </Text>
                              </View>
                              <View style={styles.mainContainer}>
                                <Text style={styles.label}>
                                  {t(
                                    'select_block_sub_county_upzila',
                                  ).substring(0, 17)}
                                </Text>

                                <Text style={styles.value}>
                                  {storePersnolInfo
                                    ? storePersnolInfo.block.label
                                    : ''}
                                </Text>
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
                    marginTop: 10,
                    padding: 17,
                    borderWidth: 0,
                    borderColor: '#ddd',
                    backgroundColor: '#d3ced7',
                    borderRadius: 20,
                    marginVertical: 20,
                    elevation: 3,
                    // height: 55,
                    borderWidth: 0.5,
                    borderColor: 'black',
                  }}>
                  <TouchableOpacity onPress={togglestoreFinancial}>
                    <View style={styles.headerStyle}>
                      <View style={{paddingLeft: 5, paddingTop: 2}}>
                        <MaterialIcons
                          name="badge"
                          size={28}
                          color="#113fac"
                          style={styles.icon}
                        />
                      </View>
                      <Text
                        style={[
                          styles.toggleText,
                          {fontFamily: 'Poppins-SemiBold'},
                        ]}>
                        {isstoreFinancial
                          ? `${t('financial_information')}`
                          : `${t('financial_information')}`}
                      </Text>
                      <Text style={styles.toggleText}>
                        {isstoreFinancial ? (
                          <MaterialIcons
                            name="do-not-disturb-on"
                            size={25}
                            color="red"
                            style={styles.icon}
                          />
                        ) : (
                          <MaterialIcons
                            name="add-circle"
                            size={25}
                            color="green"
                            style={styles.icon}
                          />
                        )}
                      </Text>
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
                                  navigation.navigate('FinancialUpdate', {
                                    pagename: 'SignUpViwer',
                                  })
                                }>
                                <Image
                                  source={require('./Common/images/edit.png')}
                                  style={{width: 25, height: 25}}
                                />
                              </TouchableOpacity>
                            </View>
                            <View style={styles.mainContainer}>
                              <Text style={styles.label}>
                                {t('account_holder_name')}{' '}
                              </Text>

                              <Text style={styles.value}>
                                {storeFinancial.accountHolderName}
                              </Text>
                            </View>
                            <View style={styles.mainContainer}>
                              <Text style={styles.label}>
                                {' '}
                                {t('adhar_no')}{' '}
                              </Text>

                              <Text style={styles.value}>
                                {storeFinancial.adharCard}
                              </Text>
                            </View>
                            <View style={styles.mainContainer}>
                              <Text style={styles.label}>
                                {t('lic_name_of_company')}
                              </Text>

                              <Text style={styles.value}>
                                {storeFinancial.ifscCode}
                              </Text>
                            </View>
                            <View style={styles.mainContainer}>
                              <Text style={styles.label}>
                                {t('pension_providing_authority')}
                              </Text>

                              <Text style={styles.value}>
                                {storeFinancial.pensionProvidingAuthority}
                              </Text>
                            </View>
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
                    marginTop: 10,
                    padding: 17,
                    borderWidth: 0,
                    borderColor: '#ddd',
                    backgroundColor: '#d3ced7',
                    borderRadius: 20,
                    marginVertical: 20,
                    elevation: 3,
                    // height: 55,
                    borderWidth: 0.5,
                    borderColor: 'black',
                  }}>
                  <TouchableOpacity onPress={togglestoreProduceInfo}>
                    <View style={styles.headerStyle}>
                      <View style={{paddingLeft: 5, paddingTop: 2}}>
                        <MaterialIcons
                          name="article"
                          size={28}
                          color="#113fac"
                          style={styles.icon}
                        />
                      </View>
                      <Text style={styles.toggleText}>
                        {isstoreProduceInfo
                          ? `${t('crop_information')}`
                          : `${t('crop_information')}`}
                      </Text>
                      <Text style={styles.toggleText}>
                        {isstoreProduceInfo ? (
                          <MaterialIcons
                            name="do-not-disturb-on"
                            size={25}
                            color="red"
                            style={styles.icon}
                          />
                        ) : (
                          <MaterialIcons
                            name="add-circle"
                            size={25}
                            color="green"
                            style={styles.icon}
                          />
                        )}
                      </Text>
                    </View>
                  </TouchableOpacity>
                  {isstoreProduceInfo && (
                    <>
                      {storeProduceInfo ? (
                        <View style={{marginTop: 10}}>
                          {storeProduceInfo.map((item, index) => {
                            return item.storeProduceInfo ? (
                              <View style={styles.bodyContainer} key={index}>
                                <View style={{alignItems: 'flex-end'}}>
                                  <TouchableOpacity
                                    onPress={() =>
                                      navigation.navigate('ProduceInfoUpdate', {
                                        pagename: 'SignUpViwer',
                                        arrayIndex: index,
                                      })
                                    }>
                                    <Image
                                      source={require('./Common/images/edit.png')}
                                      style={{width: 25, height: 25}}
                                    />
                                  </TouchableOpacity>
                                </View>
                                <View>
                                  <View style={styles.mainContainer}>
                                    <Text style={styles.label}>
                                      {t('pre_plot_name')}
                                    </Text>

                                    <Text style={styles.value}>
                                      {item.storeProduceInfo &&
                                        item.storeProduceInfo.plotSiteName}
                                    </Text>
                                  </View>
                                  <View style={styles.mainContainer}>
                                    <Text style={styles.label}>
                                      {t('pre_land_size')}
                                    </Text>

                                    <Text style={styles.value}>
                                      {item.storeProduceInfo &&
                                        item.storeProduceInfo.plotSize}
                                    </Text>
                                  </View>
                                  <View style={styles.mainContainer}>
                                    <Text style={styles.label}>
                                      {t('addland_unit')}:
                                    </Text>

                                    <Text style={styles.value}>
                                      {item.storeProduceInfo &&
                                        item.storeProduceInfo.landUnitName}
                                    </Text>
                                  </View>
                                  <View style={styles.mainContainer}>
                                    <Text style={styles.label}>
                                      {t('select_crop_name')}
                                    </Text>

                                    <Text style={styles.value}>
                                      {item.storeProduceInfo &&
                                        item.storeProduceInfo.produceName &&
                                        item.storeProduceInfo &&
                                        item.storeProduceInfo.produceName.label}
                                    </Text>
                                  </View>
                                  <View style={styles.mainContainer}>
                                    <Text style={styles.label}>
                                      {t('select_crop_variety')}
                                    </Text>

                                    <Text style={styles.value}>
                                      {item.storeProduceInfo &&
                                        item.storeProduceInfo.produceVariety &&
                                        item.storeProduceInfo &&
                                        item.storeProduceInfo.produceVariety
                                          .label}
                                    </Text>
                                  </View>
                                  <View style={styles.mainContainer}>
                                    <Text style={styles.label}>
                                      {t('showing_date')}
                                    </Text>

                                    <Text style={styles.value}>
                                      {item.storeProduceInfo &&
                                        item.storeProduceInfo.cycleStarts}
                                    </Text>
                                  </View>
                                  <View style={styles.mainContainer}>
                                    <Text style={styles.label}>
                                      {t('harvesting_date_auto_calculated')}{' '}
                                    </Text>

                                    <Text style={styles.value}>
                                      {item.storeProduceInfo &&
                                        item.storeProduceInfo.cycleEnds}
                                    </Text>
                                  </View>
                                </View>
                              </View>
                            ) : (
                              ''
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
            <View style={{marginTop: 10, backgroundColor: '#D5FFD0'}}>
              <ButtonForm label={t('save')} onPress={handleSave} />
            </View>
          </View>
        </Root>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default SignUpViwer;

const styles = StyleSheet.create({
  headerStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#ffffffff',
    height: 35,
    width: '100%',
    marginLeft: -5,
    borderRadius: 8,
    marginTop: -3,
    borderRadius: 5,
  },
  headersContainer: {
    marginHorizontal: '5%',

    justifyContent: 'center',
    alignItems: 'center',
  },
  headersTitle: {
    paddingVertical: 5,
    // fontWeight: 'bold',
    fontSize: 18,
    color: 'white',
    fontFamily: 'Poppins-SemiBold',
  },
  bodyContainer: {
    // backgroundColor: '#DAC0A3',
    backgroundColor: '#FFF',
    padding: 5,
    // paddingHorizontal: 12,
    borderRadius: 8,
    // borderWidth:1,
    borderColor: '#00000065',
    justifyContent: 'center',
    // elevation:5
  },
  bodyContainerMarginBottom: {
    // backgroundColor: '#DAC0A3',
    backgroundColor: '#FFF',
    padding: 5,
    // paddingHorizontal: 12,
    borderRadius: 8,
    // borderWidth: 3,
    // borderColor: '#00000065',
    // elevation:5,
  },
  viewText: {
    marginTop: 15,
  },
  mainContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
    paddingHorizontal: 5,
    paddingHorizontal: 5,
    marginTop: 8, // Display children in a row horizontally
  },
  label: {
    fontSize: 13.5,
    color: Colors.text,
    fontFamily: 'Poppins-SemiBold',
    flex: 1,
  },
  value: {
    fontSize: 13.5,
    color: Colors.text,
    fontFamily: 'Poppins-Regular',
    flex: 1,
    textAlign: 'right',
  },
  leftSection: {
    flex: 1, // Take 50% of the available horizontal space
  },
  rightSection: {
    flex: 1, // Take 50% of the available horizontal space
  },
  toggleText: {
    fontSize: 16,
    color: 'black',
    fontFamily: 'Poppins-SemiBold',
    marginLeft: 15,
    marginTop: 2,
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
