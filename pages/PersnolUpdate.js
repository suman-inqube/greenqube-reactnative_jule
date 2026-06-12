import {
  Image,
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import DropdownForm from './Common/DropdownForm';
import Logo from './Common/Logo';
import ImagePlaceHolderCircle from './Common/ImagePlaceHolderCircle';
import InputTextForm from './Common/InputTextForm';
import RadioForm from './Common/RadioForm';
import ButtonForm from './Common/ButtonForm';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MyErrorBoundary from './Common/MyErrorBoundary';

import {
  blockDataListAPI,
  districtDataListAPI,
  languageDataListAPI,
  stateInfoDataListAPI,
} from '../config/apiHere';
import { getItem, setItem } from '../config/getDataFromStorage';
import { isNotEmpty } from './Common/ValidationFunctions';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import {
  Root,
  Popup,
  Toast,
} from '@sekizlipenguen/react-native-popup-confirm-toast';
import { AlertMesg } from './Common/ToastAlert';
import { useTranslation } from 'react-i18next';
import DocumentPicker, { types } from '@react-native-documents/picker';
import ProofAndIdentityPropfComp from './Common/ProofAndIdentityPropfComp';
import { Colors, Fonts } from './utils/Constants';

const PersnolUpdate = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const { pagename } = route.params;
  const [dbName, setdbName] = useState();
  const [languageData, setlanguageData] = useState([]);
  const [stateInfoData, setstateInfoData] = useState([]);
  const [districtData, setDistrictData] = useState([]);
  const [blockData, setBlockData] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [storePersnolInfo, setstorePersnolInfo] = useState({
    language: '',
    stateInfo: '',
    district: '',
    block: '',
    name: '',
    gender: '1',
    userType: '1',
    age: '',
    address: '',
    zip: '',
    img: '',
  });
  const [identityProofIdentityPropf, setIdentityProofIdentityPropf] = useState([
    { uri: '', name: '', type: '', fileName: '', imageType: 'address' },
    { uri: '', name: '', type: '', fileName: '', imageType: 'identity' },
  ]);
  let languageDataList = async dbname => {
    // console.log(dbname);
    try {
      let languageArray = [];
      let language_res = await languageDataListAPI(dbname);
      if (language_res.data.data) {
        language_res.data.data.forEach(element => {
          languageArray.push({
            value: element.id,
            label: element.name,
          });
        });
        setlanguageData(languageArray);
      }
    } catch (error) {
      console.log('Error in language API', error.response);
    }
  };

  const handleLanguage = language => {
    setstorePersnolInfo({ ...storePersnolInfo, language: language });
    stateInfoDataList(dbName, language);
  };

  let stateInfoDataList = async (dbName, language) => {
    try {
      let stateArray = [];
      let state_res = await stateInfoDataListAPI(dbName, language);
      if (state_res.data.data.count > 0) {
        state_res.data.data.rows.forEach(element => {
          stateArray.push({
            value: element.fid,
            label: element.state_name,
          });
        });
        setstateInfoData(stateArray);
      }
    } catch (error) {
      console.log('Error in state API', error.response);
    }
  };
  const handleStateInfo = stateInfo => {
    setstorePersnolInfo({ ...storePersnolInfo, stateInfo: stateInfo });
    districtDataList(dbName, storePersnolInfo.language, stateInfo);
  };

  let districtDataList = async (dbName, language, stateInfo) => {
    try {
      let districtArray = [];
      let district_res = await districtDataListAPI(dbName, language, stateInfo);
      if (district_res.data.data) {
        district_res.data.data.rows.forEach(element => {
          districtArray.push({
            value: element.fid,
            label: element.district_name,
          });
        });
        setDistrictData(districtArray);
      }
    } catch (error) {
      console.log('Error in district API', error.response);
    }
  };

  const handleDistrict = district => {
    setstorePersnolInfo({ ...storePersnolInfo, district: district });
    blockDataList(dbName, storePersnolInfo.language, district);
  };
  let blockDataList = async (dbName, language, district) => {
    try {
      let blocktArray = [];
      let block_res = await blockDataListAPI(dbName, language, district);
      if (block_res.data.data) {
        block_res.data.data.rows.forEach(element => {
          blocktArray.push({
            value: element.fid,
            label: element.subdiv_name,
          });
        });
        setBlockData(blocktArray);
      }
    } catch (error) {
      console.log('Error in Block API', error).response;
    }
  };

  const validateForm = () => {
    if (!storePersnolInfo.name) {
      Toast.show({
        time: 3,
        text: `${t('please_enter_first_name')}`,
        ...AlertMesg[0],
      });
      return false;
    }

    if (!storePersnolInfo.age) {
      Toast.show({
        time: 3,
        text: `${t('please_enter_birth_date')}`,
        ...AlertMesg[0],
      });
      return false;
    }
    if (storePersnolInfo.age <= 17) {
      Toast.show({
        time: 3,
        text: `${t('please_eligible_birth_date')}`,
        ...AlertMesg[0],
      });
      return false;
    }
    if (!storePersnolInfo.language.value) {
      Toast.show({
        time: 3,
        text: `${t('please_select_language_first')}`,
        ...AlertMesg[0],
      });
      return false;
    }
    if (!storePersnolInfo.stateInfo.value) {
      Toast.show({
        time: 3,
        text: `${t('please_select_state_first')}`,
        ...AlertMesg[0],
      });
      return false;
    }
    if (!storePersnolInfo.block.value) {
      Toast.show({
        time: 3,
        text: `${t('please_select_zila_first')}`,
        ...AlertMesg[0],
      });
      return false;
    }
    if (!storePersnolInfo.district.value) {
      Toast.show({
        time: 3,
        text: `${t('please_select_upazila_first')}`,
        ...AlertMesg[0],
      });
      return false;
    }

    return true;
  };
  const handleSave = async () => {
    const newstorePersnolInfo = {
      ...storePersnolInfo,
      identityProofIdentityPropf,
    };
    if (validateForm()) {
      await setItem('storePersnolInfo_data', newstorePersnolInfo);
      navigation.navigate(pagename, { pagename: 'ProduceInfo' });
    }
  };
  const onPageLoad = async () => {
    const storeSignup_data = await getItem('storeSignup_data');
    setdbName(storeSignup_data.company.dbname);
    languageDataList(storeSignup_data.company.dbname);
    const storePersnolInfo_data = await getItem('storePersnolInfo_data');
    console.log(storePersnolInfo_data?.identityProofIdentityPropf);
    if (storePersnolInfo_data) {
      setSelectedImage(storePersnolInfo_data.img);
      setstorePersnolInfo(storePersnolInfo_data);
      if (storePersnolInfo_data.language) {
        stateInfoDataList(
          storeSignup_data.company.dbname,
          storePersnolInfo_data.language,
        );
      }
      if (storePersnolInfo_data.stateInfo || storePersnolInfo_data.language) {
        districtDataList(
          storeSignup_data.company.dbname,
          storePersnolInfo_data.language,
          storePersnolInfo_data.stateInfo,
        );
      }
      if (storePersnolInfo_data.district || storePersnolInfo_data.language) {
        blockDataList(
          storeSignup_data.company.dbname,
          storePersnolInfo_data.language,
          storePersnolInfo_data.district,
        );
      }
      if (storePersnolInfo_data?.identityProofIdentityPropf) {
        setIdentityProofIdentityPropf(
          storePersnolInfo_data?.identityProofIdentityPropf,
        );
      }
    }
  };
  const openImagePicker = () => {
    const options = {
      mediaType: 'photo',
      includeBase64: true,
      maxHeight: 200,
      maxWidth: 200,
    };
    launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('Image picker error: ', response.error);
      } else {
        // let imageUri = response.uri || response.assets?.[0]?.uri;
        let imageUri = response.uri || response.assets[0].base64;
        setSelectedImage(imageUri);
        setstorePersnolInfo({
          ...storePersnolInfo,
          img: response.assets[0].uri,
          imgType: response.assets[0].type,
          imgName: response.assets[0].fileName,
        });
      }
    });
  };
  useEffect(() => {
    onPageLoad();
  }, []);
  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
      <Root>
        <MyErrorBoundary>
          <StatusBar barStyle="light-content" backgroundColor={Colors.green} />
          <View style={styles.container}>
            <View style={{ flex: 1, justifyContent: 'center' }}>
              <View
                style={{
                  height: 60,
                  backgroundColor: Colors.green,
                  borderBottomLeftRadius: 25,
                  borderBottomRightRadius: 25,
                  justifyContent: 'flex-end',
                }}>
                <View style={styles.headersContainer}>
                  <Text style={styles.headersTitle}>
                    {t('personal_information')}
                  </Text>
                </View>
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>

                <View style={{ flex: 1 }}>
                  <View style={styles.firatFormContainer}>


                    <View style={{ flex: 1, justifyContent: 'center' }}>
                      <ScrollView
                        showsVerticalScrollIndicator={false}>
                        <View style={{ alignItems: 'center' }}>
                          <Image
                            source={require('../pages/Common/images/logo.png')}
                            style={styles.logo}
                          />
                        </View>
                        <View style={{ flex: 1 }}>
                          <View style={styles.firatFormContainer}>
                            <View style={styles.profileImg}>
                              <ImagePlaceHolderCircle
                                openImagePicker={openImagePicker}
                                selectedImage={selectedImage}
                              />
                            </View>
                            <View style={styles.inputContainer}>
                              <InputTextForm
                                label={t('name')}
                                required={true}
                                value={storePersnolInfo.name ?? name}
                                onChangeText={name => {
                                  setstorePersnolInfo({
                                    ...storePersnolInfo,
                                    name: name,
                                  });
                                }}
                              />
                              <View>
                                <Text
                                  style={{
                                    fontSize: 16,
                                    color: '#000',
                                  }}>
                                  Gender
                                </Text>
                                <RadioForm
                                  label={t('farmer_reg_male')}
                                  selected={
                                    storePersnolInfo.gender === '1'
                                  }
                                  onSelect={() =>
                                    setstorePersnolInfo({
                                      ...storePersnolInfo,
                                      gender: '1',
                                    })
                                  }
                                />
                                <RadioForm
                                  label={t('farmer_reg_female')}
                                  selected={
                                    storePersnolInfo.gender === '2'
                                  }
                                  onSelect={() =>
                                    setstorePersnolInfo({
                                      ...storePersnolInfo,
                                      gender: '2',
                                    })
                                  }
                                />
                              </View>

                              <View style={{ marginBottom: 15 }}>
                                <Text
                                  style={{
                                    fontSize: 16,
                                    marginTop: 15,
                                    color: '#000',
                                  }}>
                                  User Type
                                </Text>
                                <RadioForm
                                  label={t('grower')}
                                  selected={
                                    storePersnolInfo.userType === '1'
                                  }
                                  onSelect={() =>
                                    setstorePersnolInfo({
                                      ...storePersnolInfo,
                                      userType: '1',
                                    })
                                  }
                                />
                                <RadioForm
                                  label={t('small_holder')}
                                  selected={
                                    storePersnolInfo.userType === '2'
                                  }
                                  onSelect={() =>
                                    setstorePersnolInfo({
                                      ...storePersnolInfo,
                                      userType: '2',
                                    })
                                  }
                                />
                                <RadioForm
                                  label={t('farm_worker')}
                                  selected={
                                    storePersnolInfo.userType === '3'
                                  }
                                  onSelect={() =>
                                    setstorePersnolInfo({
                                      ...storePersnolInfo,
                                      userType: '3',
                                    })
                                  }
                                />
                              </View>

                              <InputTextForm
                                label={t('age')}
                                required={true}
                                value={storePersnolInfo.age ?? age}
                                onChangeText={age => {
                                  setstorePersnolInfo({
                                    ...storePersnolInfo,
                                    age: age,
                                  });
                                }}
                                keyboardType="numeric"
                              />

                              <DropdownForm
                                label={t('select_language')}
                                required={true}
                                data={languageData}
                                onChange={item => {
                                  handleLanguage(item);
                                }}
                                val={storePersnolInfo.language.label}
                              />
                              <DropdownForm
                                label={t('select_language')}
                                required={true}
                                data={languageData}
                                onChange={item => {
                                  handleLanguage(item);
                                }}
                                val={storePersnolInfo.language.label}
                              />

                              <DropdownForm
                                label={t('select_state')}
                                required={true}
                                data={stateInfoData}
                                onChange={item => {
                                  handleStateInfo(item);
                                }}
                                val={storePersnolInfo.stateInfo.label}
                              />
                              <DropdownForm
                                label={t('select_state')}
                                required={true}
                                data={stateInfoData}
                                onChange={item => {
                                  handleStateInfo(item);
                                }}
                                val={storePersnolInfo.stateInfo.label}
                              />

                              <DropdownForm
                                label={t('select_district_county')}
                                required={true}
                                data={districtData}
                                onChange={item => {
                                  handleDistrict(item);
                                }}
                                val={storePersnolInfo.district.label}
                              />
                              <DropdownForm
                                label={t('select_district_county')}
                                required={true}
                                data={districtData}
                                onChange={item => {
                                  handleDistrict(item);
                                }}
                                val={storePersnolInfo.district.label}
                              />

                              <DropdownForm
                                label={t(
                                  'select_block_sub_county_upzila',
                                )}
                                required={true}
                                data={blockData}
                                onChange={item => {
                                  setstorePersnolInfo({
                                    ...storePersnolInfo,
                                    block: item,
                                  });
                                }}
                                val={storePersnolInfo.block.label}
                              />
                              <DropdownForm
                                label={t(
                                  'select_block_sub_county_upzila',
                                )}
                                required={true}
                                data={blockData}
                                onChange={item => {
                                  setstorePersnolInfo({
                                    ...storePersnolInfo,
                                    block: item,
                                  });
                                }}
                                val={storePersnolInfo.block.label}
                              />

                              <InputTextForm
                                label={t('enter_address')}
                                value={
                                  storePersnolInfo.address ?? address
                                }
                                onChangeText={address => {
                                  setstorePersnolInfo({
                                    ...storePersnolInfo,
                                    address: address,
                                  });
                                }}
                              />
                              <InputTextForm
                                label={t('enter_address')}
                                value={
                                  storePersnolInfo.address ?? address
                                }
                                onChangeText={address => {
                                  setstorePersnolInfo({
                                    ...storePersnolInfo,
                                    address: address,
                                  });
                                }}
                              />

                              <InputTextForm
                                label={t('valid_pin_code')}
                                value={storePersnolInfo.zip ?? zip}
                                onChangeText={zip => {
                                  setstorePersnolInfo({
                                    ...storePersnolInfo,
                                    zip: zip,
                                  });
                                }}
                                maxLength={6}
                              />

                              {/* <ProofAndIdentityPropfComp
                      {/* <ProofAndIdentityPropfComp
                identityProofIdentityPropf={identityProofIdentityPropf}
                t={t}
                title={t('address_proofAndIdentityPropf')}
                handleDocumentSelection={handleDocumentSelection}
                handleDocumentSelectionRemove={handleDocumentSelectionRemove}
              /> */}
                              <ProofAndIdentityPropfComp
                                identityProofIdentityPropf={
                                  identityProofIdentityPropf
                                }
                                t={t}
                                title={t(
                                  'address_proofAndIdentityPropf',
                                )}
                                setStateValue={
                                  setIdentityProofIdentityPropf
                                }
                                stateValue={
                                  identityProofIdentityPropf
                                }
                                disable={true}
                                InputTextFormEdit={true}
                              // photoDeletedValue={photoDeletedValue}
                              // setPhotoDeletedValue={setPhotoDeletedValue}
                              // loginUser_data={loginUser_data}
                              />
                            </View>
                          </View>
                        </View>
                      </ScrollView>
                    </View>
                  </View>
                </View>
              </ScrollView>
            </View>
          </View>
          <ButtonForm
            label={t('next')}
            onPress={() => handleSave('Financial')}
          />
        </MyErrorBoundary>
      </Root>
    </SafeAreaView>
  );
};

export default PersnolUpdate;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
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
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    alignItems: 'center',
  },
  firatFormContainer: {
    // marginTop: 50,

    // marginHorizontal: '4%',
    // borderWidth: 1,
    // paddingTop: 10,
    // marginBottom: 30,

    backgroundColor: 'white',
    paddingHorizontal: 25,
    // borderRadius: 8,
    // borderWidth: 1,
    // borderColor: Colors.border,
    // // elevation:1,
    // marginVertical: 10,
    // marginHorizontal: '4%',
  },
  profileImg: {
    // position: 'absolute',
    // top: -50, // Half outside (adjust based on your image size)
    // alignSelf: 'center', // Center horizontally
    zIndex: 2,
    elevation: 5, // For Android shadow
    shadowColor: '#000', // For iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  idItemContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  idItem: {
    padding: 10,
    width: '30%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  idImage: {
    width: 60,
    height: 60,
  },
  text: {
    fontSize: 16,
    marginTop: 15,
    color: '#000',
    fontFamily: 'Poppins-Regular',
  },
});
