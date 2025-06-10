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
      country: storeSignup_data.country.value,
      company: storeSignup_data.company.value,
      state: storePersnolInfo_data.stateInfo.value,
      district: storePersnolInfo_data.district.value,
      subdivision: storePersnolInfo_data.block.value,
      address: storePersnolInfo_data.address,
      pincode: storePersnolInfo_data.zip,
    };
    const identity_details = {};
    if(storeFinancial.kcc_number){
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
      pension_details['frequency'] = storeFinancial_data.pensionPerMonth.value;
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
        item.storeProduceInfo.landType && item.storeProduceInfo.landType.value,
      soil_type_id:
        item.storeProduceInfo.soilType && item.storeProduceInfo.soilType.value,
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
      console.log(formData)
      if (netConnection) {
        const database_res = await signupSaveAPI(formData, dbname, language,landProofData.length);
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
    onBackPress(handleBackPress);
  }, []);
  useFocusEffect(
    React.useCallback(() => {
      onPageLoad();
    }, []),
  );
  return (
    <Root>
      <View style={{flex: 1}}>
        <View style={{height: 60, backgroundColor: '#003c04'}}></View>
        <FormsTitle title={t('preview_information')} />
        <ScrollView>
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
                <Text style={[styles.title, {fontFamily: 'Poppins-SemiBold'}]}>
                  {isstorePersnolInfo
                    ? `${t('personal_information')}`
                    : `${t('personal_information')}`}
                </Text>
                {isstorePersnolInfo ? (
                  <Image
                    source={require('./Common/images/sub.png')}
                    style={{width: 20, height: 20}}
                  />
                ) : (
                  <Image
                    source={require('./Common/images/add.png')}
                    style={{width: 20, height: 20}}
                  />
                )}
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
                              style={{width: 30, height: 30}}
                            />
                          </TouchableOpacity>
                        </View>
                        <View style={styles.mainContainer}>
                          <View style={styles.leftSection}>
                            <Text style={styles.title}> {t('name')} </Text>
                          </View>
                          <View style={styles.rightSection}>
                            <Text style={styles.title}>
                              {storePersnolInfo.name}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.mainContainer}>
                          <View style={styles.leftSection}>
                            <Text style={styles.title}>
                              {' '}
                              {t('new_reg_phone_number')}{' '}
                            </Text>
                          </View>
                          <View style={styles.rightSection}>
                            <Text style={styles.title}>
                              {storeSignup.phone}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.mainContainer}>
                          <View style={styles.leftSection}>
                            <Text style={styles.title}>
                              {' '}
                              {t('age')} {t('fin_year')}
                            </Text>
                          </View>
                          <View style={styles.rightSection}>
                            <Text style={styles.title}>
                              {storePersnolInfo.age}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.mainContainer}>
                          <View style={styles.leftSection}>
                            <Text style={styles.title}> {t('language')} </Text>
                          </View>
                          <View style={styles.rightSection}>
                            <Text style={styles.title}>
                              {storePersnolInfo.language.label}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.mainContainer}>
                          <View style={styles.leftSection}>
                            <Text style={styles.title}>
                              {' '}
                              {t('farmer_reg_state')}{' '}
                            </Text>
                          </View>
                          <View style={styles.rightSection}>
                            <Text style={styles.title}>
                              {storePersnolInfo.stateInfo.label}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.mainContainer}>
                          <View style={styles.leftSection}>
                            <Text style={styles.title}>
                              {' '}
                              {t('select_district_county')}{' '}
                            </Text>
                          </View>
                          <View style={styles.rightSection}>
                            <Text style={styles.title}>
                              {storePersnolInfo.district.label}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.mainContainer}>
                          <View style={styles.leftSection}>
                            <Text style={styles.title}>
                              {' '}
                              {t('select_block_sub_county_upzila').substring(
                                0,
                                17,
                              )}{' '}
                            </Text>
                          </View>
                          <View style={styles.rightSection}>
                            <Text style={styles.title}>
                              {storePersnolInfo
                                ? storePersnolInfo.block.label
                                : ''}
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
                <Text style={[styles.title, {fontFamily: 'Poppins-SemiBold'}]}>
                  {isstoreFinancial
                    ? `${t('financial_information')}`
                    : `${t('financial_information')}`}
                </Text>
                {isstoreFinancial ? (
                  <Image
                    source={require('./Common/images/sub.png')}
                    style={{width: 20, height: 20}}
                  />
                ) : (
                  <Image
                    source={require('./Common/images/add.png')}
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
                            navigation.navigate('FinancialUpdate', {
                              pagename: 'SignUpViwer',
                            })
                          }>
                          <Image
                            source={require('./Common/images/edit.png')}
                            style={{width: 30, height: 30}}
                          />
                        </TouchableOpacity>
                      </View>
                      <View style={styles.mainContainer}>
                        <View style={styles.leftSection}>
                          <Text style={styles.title}>
                            {' '}
                            {t('account_holder_name')}{' '}
                          </Text>
                        </View>
                        <View style={styles.rightSection}>
                          <Text style={styles.title}>
                            {storeFinancial.accountHolderName}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.mainContainer}>
                        <View style={styles.leftSection}>
                          <Text style={styles.title}> {t('adhar_no')} </Text>
                        </View>
                        <View style={styles.rightSection}>
                          <Text style={styles.title}>
                            {storeFinancial.adharCard}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.mainContainer}>
                        <View style={styles.leftSection}>
                          <Text style={styles.title}>
                            {' '}
                            {t('lic_name_of_company')}{' '}
                          </Text>
                        </View>
                        <View style={styles.rightSection}>
                          <Text style={styles.title}>
                            {storeFinancial.ifscCode}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.mainContainer}>
                        <View style={styles.leftSection}>
                          <Text style={styles.title}>
                            {t('pension_providing_authority')}{' '}
                          </Text>
                        </View>
                        <View style={styles.rightSection}>
                          <Text style={styles.title}>
                            {storeFinancial.pensionProvidingAuthority}
                          </Text>
                        </View>
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
              margin: 10,
              elevation: 3,
              borderRadius: 30,
              paddingHorizontal: 10,
              paddingVertical: 10,
              backgroundColor: '#D5FFD0',
              marginBottom: 100,
              zIndex: -1,
            }}>
            <TouchableOpacity onPress={togglestoreProduceInfo}>
              <View style={styles.headerStyle}>
                <Text style={[styles.title, {fontFamily: 'Poppins-SemiBold'}]}>
                  {isstoreProduceInfo
                    ? `${t('crop_information')}`
                    : `${t('crop_information')}`}
                </Text>

                {isstoreProduceInfo ? (
                  <Image
                    source={require('./Common/images/sub.png')}
                    style={{width: 20, height: 20}}
                  />
                ) : (
                  <Image
                    source={require('./Common/images/add.png')}
                    style={{width: 20, height: 20, resizeMode: 'cover'}}
                  />
                )}
              </View>
            </TouchableOpacity>
            {isstoreProduceInfo && (
              <>
                {storeProduceInfo ? (
                  <View style={{marginTop: 10, marginBottom: 30}}>
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
                                style={{width: 30, height: 30}}
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
                                  {item.storeProduceInfo &&
                                    item.storeProduceInfo.plotSiteName}
                                </Text>
                              </View>
                            </View>
                            <View style={styles.mainContainer}>
                              <View style={styles.leftSection}>
                                <Text style={styles.title}>
                                  {' '}
                                  {t('pre_land_size')}{' '}
                                </Text>
                              </View>
                              <View style={styles.rightSection}>
                                <Text style={styles.title}>
                                  {item.storeProduceInfo &&
                                    item.storeProduceInfo.plotSize}
                                </Text>
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
                                  {item.storeProduceInfo &&
                                    item.storeProduceInfo.landUnitName}
                                </Text>
                              </View>
                            </View>
                            <View style={styles.mainContainer}>
                              <View style={styles.leftSection}>
                                <Text style={styles.title}>
                                  {t('select_crop_name')}{' '}
                                </Text>
                              </View>
                              <View style={styles.rightSection}>
                                <Text style={styles.title}>
                                  {item.storeProduceInfo &&
                                    item.storeProduceInfo.produceName &&
                                    item.storeProduceInfo &&
                                    item.storeProduceInfo.produceName.label}
                                </Text>
                              </View>
                            </View>
                            <View style={styles.mainContainer}>
                              <View style={styles.leftSection}>
                                <Text style={styles.title}>
                                  {' '}
                                  {t('select_crop_variety')}{' '}
                                </Text>
                              </View>
                              <View style={styles.rightSection}>
                                <Text style={styles.title}>
                                  {item.storeProduceInfo &&
                                    item.storeProduceInfo.produceVariety &&
                                    item.storeProduceInfo &&
                                    item.storeProduceInfo.produceVariety.label}
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
                                  {item.storeProduceInfo &&
                                    item.storeProduceInfo.cycleStarts}
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
                                <Text style={styles.title}>
                                  {item.storeProduceInfo &&
                                    item.storeProduceInfo.cycleEnds}
                                </Text>
                              </View>
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
        </ScrollView>
        <View style={{marginTop: 10, backgroundColor: '#D5FFD0'}}>
          <ButtonForm label={t('save')} onPress={handleSave} />
        </View>
      </View>
    </Root>
  );
};

export default SignUpViwer;

const styles = StyleSheet.create({
  headerStyle: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // borderColor: 'gray',
    // borderWidth: 0.5,
    padding: 5,
    // backgroundColor: 'white',
  },
  bodyContainer: {
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    zIndex: 1,
    // borderWidth: 2,
    // borderColor: 'black',
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
