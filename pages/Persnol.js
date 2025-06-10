import {
  Image,
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  Keyboard,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import DropdownForm from './Common/DropdownForm';
import Logo from './Common/Logo';
import ImagePlaceHolderCircle from './Common/ImagePlaceHolderCircle';
import InputTextForm from './Common/InputTextForm';
import RadioForm from './Common/RadioForm';
import ButtonForm from './Common/ButtonForm';
import {useNavigation, useRoute} from '@react-navigation/native';
import {
  blockDataListAPI,
  districtDataListAPI,
  languageDataListAPI,
  stateInfoDataListAPI,
} from '../config/apiHere';
import {getItem, removeItem, setItem} from '../config/getDataFromStorage';
import {isNotEmpty} from './Common/ValidationFunctions';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {Root, Popup, Toast} from 'react-native-popup-confirm-toast';
import {AlertMesg} from './Common/ToastAlert';
import {useTranslation} from 'react-i18next';
import ForegroundLocationService from './BackgroundService/ForegroundLocationService';
import DeviceInfo from './DeviceInfo';
import DocumentPicker, {types} from 'react-native-document-picker';
import ProofAndIdentityPropfComp from './Common/ProofAndIdentityPropfComp';
const Persnol = () => {
  const {netConnection} = DeviceInfo();
  const {t} = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const {pagename} = route.params;
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
    imgType: '',
    imgName: '',
  });
  const [identityProofIdentityPropf, setIdentityProofIdentityPropf] = useState([
    {uri: '', name: '', type: '', fileName: '', imageType: 'address'},
    {uri: '', name: '', type: '', fileName: '', ImageType: 'identity'},
  ]);
  let languageDataList = async dbname => {
    try {
      let languageArray = [];
      if (netConnection) {
        let language_res = await languageDataListAPI(dbname);
        if (language_res.data.data) {
          language_res.data.data.forEach(element => {
            languageArray.push({
              value: element.id,
              label: element.name,
            });
          });
          await setItem('languageDataListAPI', languageArray);
        }
      } else {
        const languageDataListAPI = await getItem('languageDataListAPI');
        if (languageDataListAPI) {
          languageArray = languageDataListAPI;
        }
      }
      setlanguageData(languageArray);
    } catch (error) {
      console.log('Error in language API', error.response);
    }
  };

  const handleLanguage = language => {
    setstorePersnolInfo({
      ...storePersnolInfo,
      language: language,
      stateInfo: '',
      district: '',
      block: '',
    });
    stateInfoDataList(dbName, language);
  };

  let stateInfoDataList = async (dbName, language) => {
    try {
      let stateArray = [];
      let stateInfo_data_list_offline_arr = [];
      let stateInfo_data_list_offline = await getItem('stateInfoDataListAPI');
      if (netConnection) {
        let state_res = await stateInfoDataListAPI(dbName, language);
        if (state_res.data.data.count > 0) {
          state_res.data.data.rows.forEach(element => {
            stateArray.push({
              value: element.fid,
              label: element.state_name,
            });
          });
          if (
            stateInfo_data_list_offline != null &&
            stateInfo_data_list_offline.length > 0
          ) {
            if (stateInfo_data_list_offline[0][language.value] != undefined) {
              JSON.parse(stateInfo_data_list_offline[0][language.value]).push({
                [language.value]: JSON.stringify(stateArray),
              });
            } else {
              stateInfo_data_list_offline.push({
                [language.value]: JSON.stringify(stateArray),
              });
            }
          } else {
            stateInfo_data_list_offline_arr.push({
              [language.value]: JSON.stringify(stateArray),
            });
            stateInfo_data_list_offline = stateInfo_data_list_offline_arr;
          }
          await setItem('stateInfoDataListAPI', stateInfo_data_list_offline);
        }
      } else {
        if (stateInfo_data_list_offline) {
          supervisory_ofline_list_arr = stateInfo_data_list_offline.filter(
            function (v, i) {
              return (
                stateInfo_data_list_offline[i][language.value] != undefined
              );
            },
          );
          if (supervisory_ofline_list_arr.length != 0) {
            stateArray = JSON.parse(
              supervisory_ofline_list_arr[0][language.value],
            );
          } else {
            stateArray = [];
          }
        }
      }

      setstateInfoData(stateArray);
    } catch (error) {
      console.log(error.response);
    }
  };
  const handleStateInfo = stateInfo => {
    setstorePersnolInfo({
      ...storePersnolInfo,
      stateInfo: stateInfo,
      district: '',
      block: '',
    });
    districtDataList(dbName, storePersnolInfo.language, stateInfo);
  };
  let districtDataList = async (dbName, language, stateInfo) => {
    try {
      let districtArray = [];
      let district_offline_list_arr = [];
      let district_offline_list = await getItem('districtDataListAPI');
      if (netConnection) {
        let district_res = await districtDataListAPI(
          dbName,
          language,
          stateInfo,
        );
        if (district_res.data.data) {
          district_res.data.data.rows.forEach(element => {
            districtArray.push({
              value: element.fid,
              label: element.district_name,
            });
          });
          if (
            district_offline_list != null &&
            district_offline_list.length > 0
          ) {
            if (district_offline_list[0][stateInfo.value] != undefined) {
              JSON.parse(district_offline_list[0][stateInfo.value]).push({
                [stateInfo.value]: JSON.stringify(districtArray),
              });
            } else {
              district_offline_list.push({
                [stateInfo.value]: JSON.stringify(districtArray),
              });
            }
          } else {
            district_offline_list_arr.push({
              [stateInfo.value]: JSON.stringify(districtArray),
            });
            district_offline_list = district_offline_list_arr;
          }
          await setItem('districtDataListAPI', district_offline_list);
        }
      } else {
        if (district_offline_list) {
          district_offline_list_arr = district_offline_list.filter(function (
            v,
            i,
          ) {
            return district_offline_list[i][stateInfo.value] != undefined;
          });
          if (district_offline_list_arr.length != 0) {
            districtArray = JSON.parse(
              district_offline_list_arr[0][stateInfo.value],
            );
          } else {
            districtArray = [];
          }
        }
      }
      setDistrictData(districtArray);
    } catch (error) {
      console.log('Error in district API', error.response);
    }
  };
  const handleDistrict = district => {
    setstorePersnolInfo({...storePersnolInfo, district: district, block: ''});
    blockDataList(dbName, storePersnolInfo.language, district);
  };
  let blockDataList = async (dbName, language, district) => {
    try {
      let blocktArray = [];
      let blockData_offline_list_arr = [];
      let blockData_offline_list = await getItem('blockDataListAPI');
      if (netConnection) {
        let block_res = await blockDataListAPI(dbName, language, district);
        if (block_res.data.data) {
          block_res.data.data.rows.forEach(element => {
            blocktArray.push({
              value: element.fid,
              label: element.subdiv_name,
            });
          });
          if (
            blockData_offline_list != null &&
            blockData_offline_list.length > 0
          ) {
            if (blockData_offline_list[0][district.value] != undefined) {
              JSON.parse(blockData_offline_list[0][district.value]).push({
                [district.value]: JSON.stringify(blocktArray),
              });
            } else {
              blockData_offline_list.push({
                [district.value]: JSON.stringify(blocktArray),
              });
            }
          } else {
            blockData_offline_list_arr.push({
              [district.value]: JSON.stringify(blocktArray),
            });
            blockData_offline_list = blockData_offline_list_arr;
          }
          await setItem('blockDataListAPI', blockData_offline_list);
        }
      } else {
        if (blockData_offline_list) {
          blockData_offline_list_arr = blockData_offline_list.filter(function (
            v,
            i,
          ) {
            return blockData_offline_list[i][district.value] != undefined;
          });
          if (blockData_offline_list_arr.length != 0) {
            blocktArray = JSON.parse(
              blockData_offline_list_arr[0][district.value],
            );
          } else {
            blocktArray = [];
          }
        }
      }
      setBlockData(blocktArray);
    } catch (error) {
      console.log('Error in Block API', error).response;
    }
  };
  const validateForm = () => {
    Keyboard.dismiss();
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
    if (!storePersnolInfo.language?.value) {
      Toast.show({
        time: 3,
        text: `${t('please_select_language_first')}`,
        ...AlertMesg[0],
      });
      return false;
    }
    if (!storePersnolInfo.stateInfo?.value) {
      Toast.show({
        time: 3,
        text: `${t('please_select_state_first')}`,
        ...AlertMesg[0],
      });
      return false;
    }
    if (!storePersnolInfo.district?.value) {
      Toast.show({
        time: 3,
        text: `${t('please_select_zila_first')}`,
        ...AlertMesg[0],
      });
      return false;
    }
    if (!storePersnolInfo.block?.value) {
      Toast.show({
        time: 3,
        text: `${t('please_select_upazila_first')}`,
        ...AlertMesg[0],
      });
      return false;
    }
    if (storePersnolInfo.zip.length != 6 && storePersnolInfo.zip != '') {
      Toast.show({time: 3, text: `${t('valid_pin_code')}`, ...AlertMesg[0]});
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
      navigation.navigate(pagename, {pagename: 'ProduceInfo'});
    }
  };
  const onPageLoad = async () => {
    const storeSignup_data = await getItem('storeSignup_data');
    setdbName(storeSignup_data.company.dbname);
    languageDataList(storeSignup_data.company.dbname);
    const storePersnolInfo_data = await getItem('storePersnolInfo_data');
    if (storePersnolInfo_data) {
      setstorePersnolInfo(storePersnolInfo_data);
      if (storePersnolInfo_data.language) {
        // stateInfoDataList(storeSignup_data.company.dbname, storePersnolInfo_data.language);
      }
      if (storePersnolInfo_data.stateInfo || storePersnolInfo_data.language) {
        // districtDataList(storeSignup_data.company.dbname, storePersnolInfo_data.language, storePersnolInfo_data.stateInfo);
      }
      if (storePersnolInfo_data.district || storePersnolInfo_data.language) {
        // blockDataList(storeSignup_data.company.dbname, storePersnolInfo_data.language, storePersnolInfo_data.district);
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
  }, [netConnection]);
  const handleDocumentSelection = async (data, index) => {
    try {
      const response = await DocumentPicker.pick({
        presentationStyle: 'fullScreen',
        type: [types.pdf, types.images],
      });
      const values = [...identityProofIdentityPropf];
      values[index]['uri'] = response[0].uri;
      values[index]['name'] = response[0].name;
      values[index]['type'] = response[0].type;
      values[index]['fileName'] = response[0].name;
      values[index]['imageType'] = data;
      setIdentityProofIdentityPropf(values);
    } catch (err) {
      console.error(err);
    }
  };
  const handleDocumentSelectionRemove = index => {
    const values = [...identityProofIdentityPropf];
    values[index]['uri'] = '';
    values[index]['name'] = '';
    values[index]['type'] = '';
    values[index]['fileName'] = '';
    setIdentityProofIdentityPropf(values);
  };
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={'#003c04'} />
      <View style={styles.container}>
        <View style={{height: 60, backgroundColor: '#003c04'}}></View>
        <View style={styles.headersContainer}>
          <Text style={styles.headersTitle}>{t('new_registration')}</Text>
          <Text style={styles.headersTitle}>{t('personal_information')}</Text>
        </View>
        <View style={{marginHorizontal: '2.5%'}}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={{alignItems: 'center'}}>
              <Image
                source={require('../pages/Common/images/logo.png')}
                style={styles.logo}
              />
            </View>
            <View
              style={{
                backgroundColor: '#E9FCC5',
                paddingHorizontal: '3%',
                paddingVertical: '3%',
                borderRadius: 20,
                marginBottom: 200,
              }}>
              <ImagePlaceHolderCircle
                openImagePicker={openImagePicker}
                selectedImage={selectedImage}
              />
              <InputTextForm
                label={t('name')}
                color="red"
                value={storePersnolInfo.name ?? name}
                onChangeText={name => {
                  setstorePersnolInfo({...storePersnolInfo, name: name});
                }}
              />
              <View>
                <Text style={{fontSize: 16, color: '#000'}}>
                  {t('farmer_reg_gnd')}
                </Text>
                <RadioForm
                  label={t('farmer_reg_male')}
                  selected={storePersnolInfo.gender === '1'}
                  onSelect={() =>
                    setstorePersnolInfo({...storePersnolInfo, gender: '1'})
                  }
                />
                <RadioForm
                  label={t('farmer_reg_female')}
                  selected={storePersnolInfo.gender === '2'}
                  onSelect={() =>
                    setstorePersnolInfo({...storePersnolInfo, gender: '2'})
                  }
                />
              </View>

              <View style={{marginBottom: 15}}>
                <Text style={{fontSize: 16, marginTop: 15, color: '#000'}}>
                  {t('far_reg_far_type')}
                </Text>
                <RadioForm
                  label={t('grower')}
                  selected={storePersnolInfo?.userType === '1'}
                  onSelect={() =>
                    setstorePersnolInfo({
                      ...storePersnolInfo,
                      userType: '1',
                    })
                  }
                />
                <RadioForm
                  label={t('small_holder')}
                  selected={storePersnolInfo?.userType === '2'}
                  onSelect={() =>
                    setstorePersnolInfo({
                      ...storePersnolInfo,
                      userType: '2',
                    })
                  }
                />
                <RadioForm
                  label={t('farm_worker')}
                  selected={storePersnolInfo?.userType === '3'}
                  onSelect={() =>
                    setstorePersnolInfo({...storePersnolInfo, userType: '3'})
                  }
                />
              </View>

              <InputTextForm
                label={t('age')}
                color="red"
                value={storePersnolInfo.age ?? age}
                onChangeText={age => {
                  setstorePersnolInfo({...storePersnolInfo, age: age});
                }}
                maxLength={2}
                keyboardType="numeric"
              />

              <DropdownForm
                label={t('select_language')}
                color="red"
                data={languageData}
                onChange={item => {
                  handleLanguage(item);
                }}
                val={storePersnolInfo.language.label}
              />
              <DropdownForm
                label={t('select_state')}
                color="red"
                data={stateInfoData}
                onChange={item => {
                  handleStateInfo(item);
                }}
                val={storePersnolInfo.stateInfo.label}
              />
              <DropdownForm
                label={t('select_district_county')}
                color="red"
                data={districtData}
                onChange={item => {
                  handleDistrict(item);
                }}
                val={storePersnolInfo.district.label}
              />
              <DropdownForm
                label={t('select_block_sub_county_upzila')}
                color="red"
                data={blockData}
                onChange={item => {
                  setstorePersnolInfo({...storePersnolInfo, block: item});
                }}
                val={storePersnolInfo.block.label}
              />

              <InputTextForm
                label={t('enter_address')}
                value={storePersnolInfo.address ?? address}
                onChangeText={address => {
                  setstorePersnolInfo({...storePersnolInfo, address: address});
                }}
              />

              <InputTextForm
                label={t('valid_pin_code')}
                value={storePersnolInfo.zip ?? zip}
                onChangeText={zip => {
                  setstorePersnolInfo({...storePersnolInfo, zip: zip});
                }}
                maxLength={6}
                keyboardType="numeric"
              />
              {/* <View style={styles.idcontainer}>
                    <Text style={styles.text}>
                      {t('address_proofAndIdentityPropf')}
                    </Text>
                    <View style={styles.idItemContainer}>
                      {identityProofIdentityPropf &&
                        identityProofIdentityPropf.map((data, index) => {
                          return (
                            <TouchableOpacity
                              style={styles.idItem}
                              onPress={() =>
                                handleDocumentSelection(data.ImageType, index)
                              }
                              key={index}>
                              <Image
                                source={require('./Common/images/document.png')}
                                style={styles.idImage}
                              />
                              <Text>
                                {data.name == '' ? '' : data.name}
                                {data.name}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                    </View>
                  </View> */}
              {/* <ProofAndIdentityPropfComp
                  identityProofIdentityPropf={identityProofIdentityPropf}
                  t={t}
                  title={t('address_proofAndIdentityPropf')}
                  handleDocumentSelection={handleDocumentSelection}
                  handleDocumentSelectionRemove={handleDocumentSelectionRemove}
                /> */}
              <ProofAndIdentityPropfComp
                identityProofIdentityPropf={identityProofIdentityPropf}
                t={t}
                title={t('address_proofAndIdentityPropf')}
                setStateValue={setIdentityProofIdentityPropf}
                stateValue={identityProofIdentityPropf}
                disable={true}
                InputTextFormEdit={true}
                // photoDeletedValue={photoDeletedValue}
                // setPhotoDeletedValue={setPhotoDeletedValue}
                // loginUser_data={loginUser_data}
              />
            </View>
          </ScrollView>
        </View>
      </View>
      <ButtonForm label={t('next')} onPress={() => handleSave('Financial')} />
      <Root></Root>
    </>
  );
};

export default Persnol;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  headersContainer: {
    marginHorizontal: '5%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headersTitle: {
    paddingVertical: 5,
    fontWeight: 'bold',
    fontSize: 18,
    color: '#000',
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
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
