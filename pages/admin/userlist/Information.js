import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  BackHandler,
  Keyboard,
} from 'react-native';
import React, {useState, useEffect, useCallback, useContext} from 'react';
import ImageForm from '../../Common/ImageForm';
import {
  fetchBlockAPI,
  fetchDistrictAPI,
  fetchStateAPI,
  UserInformationUpdate,
} from './UsersAPI';
import {launchImageLibrary} from 'react-native-image-picker';
import DatePicker from 'react-native-date-picker';
import config from '../../../config';
import {
  useRoute,
  useFocusEffect,
  useNavigation,
  useIsFocused,
  CommonActions,
} from '@react-navigation/native';
import {userCreateContext} from '../../Context/usersCreateContext';
import DocumentPicker, {types} from 'react-native-document-picker';
import ProofAndIdentityPropfComp from '../../Common/ProofAndIdentityPropfComp';
import LoadingScreen from '../../Common/LoadingScreen';
import {addIdAddressImgs} from '../../../config/apiHere';
import {deletePlotImageAPI} from '../Loan/LoanAPI';
const qs = require('qs');
const Information = ({sendDataToParent, farmerID}) => {
  //GQR-66
  const {
    t,
    AlertMesg,
    onBackPress,
    getItem,
    logoImage,
    topBanner,
    Root,
    Toast,
    FormsTitle,
    CustomHeader,
    ButtonForm,
    InputTextForm,
    DropdownForm,
    ImagePlaceHolderCircle,
    RadioForm,
    effective_dates,
    loginUser_data,
  } = useContext(userCreateContext);
  //GQR-66
  const navigation = useNavigation();
  const route = useRoute();
  const {
    farmeruserID,
    userName,
    contactNumber,
    profileImage,
    gender,
    farmer_type,
  } = route.params;
  const [newdate, setnewDate] = useState(new Date());
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dbName, setdbName] = useState();
  const [languageID, setlanguageID] = useState();
  const [loginUserId, setLoginUserId] = useState('');
  const [loginUserToken, setLoginUserToken] = useState('');
  const [stateAll, setstateAll] = useState([]);
  const [districtAll, setdistrictAll] = useState([]);
  const [blockAll, setblockAll] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [myphoto, setmyPhoto] = useState({uri: '', type: '', name: ''});
  const [farmerData, setfarmerData] = useState({
    userName: '',
    contactNumber: '',
    gender: '',
    farmer_type: '',
    age: '',
    state: '',
    district: '',
    block: '',
    aadhar_number: '',
    pan_number: '',
    voter_card_number: '',
    kcc_number: '',
    user_bank_account_holder: '',
    user_bank_account_name: '',
    user_bank_branch_name: '',
    user_bank_account_number: '',
    user_bank_ifsc_code: '',
    pension_authority: '',
    pension_account_no: '',
    effective_from: '',
    pension_amount: '',
    frequency: '',
    company_name: '',
    policy_no: '',
    sum_insured: '',
  });
  const [regionaldatas, setregionaldatas] = useState({
    state: '',
    district: '',
    block: '',
  });
  const [currency, setcurrency] = useState('');
  const [identityProofIdentityPropf, setIdentityProofIdentityPropf] = useState([
    {
      uri: '',
      name: '',
      type: '',
      fileName: '',
      imageType: 'address',
      file_path: '',
      file_id: '',
      id:'',
    },
    {
      uri: '',
      name: '',
      type: '',
      fileName: '',
      ImageType: 'identity',
      file_path: '',
      file_id: '',
      id:'',
    },
  ]);
  const [photoDeletedValue, setPhotoDeletedValue] = useState([]);
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
        setmyPhoto({
          uri: response.assets[0].uri,
          type: response.assets[0].type,
          name: response.assets[0].fileName,
        });
        setSelectedImage(imageUri);
      }
    });
  };

  const getState = async (dbName, languageID) => {
    const response = await fetchStateAPI(dbName, languageID);
    if (response?.status == 200) {
      const dataArray = response?.data?.data?.rows.map(data => ({
        value: data.fid,
        label: data.state_name,
      }));
      setstateAll(dataArray);
    }
  };
  const getDistrict = async (dbName, languageID, stateID) => {
    const response = await fetchDistrictAPI(dbName, languageID, stateID);
    if (response?.status === 200) {
      const dataArray = response?.data?.data?.rows.map(data => ({
        value: data.fid,
        label: data.district_name,
      }));
      setdistrictAll(dataArray);
    }
  };
  const getBlock = async (dbName, languageID, districtID) => {
    const response = await fetchBlockAPI(dbName, languageID, districtID);
    if (response?.status == 200) {
      const dataArray = response?.data?.data?.rows.map(data => ({
        value: data.fid,
        label: data.subdiv_name,
      }));
      setblockAll(dataArray);
    }
  };
  const handleStateDistrictBlock = (moduleName, data) => {
    setfarmerData({
      ...farmerData,
      [moduleName]: data.value,
      [`${moduleName}Name`]: data.label,
    });
    if (moduleName === 'state') {
      const stateID = data.value;
      getDistrict(dbName, languageID, stateID);
    } else if (moduleName === 'district') {
      const districtID = data.value;
      getBlock(dbName, languageID, districtID);
    }
  };
  const handleEffectFrom = async item =>
    setfarmerData({...farmerData, effective_from: effective_dates(item)});
  const onPageLoad = async () => {
    setIsLoading(true);
    const [userListData, state, district, block, curr] = await Promise.all([
      getItem('userListData'),
      getItem('state'),
      getItem('district'),
      getItem('block'),
      getItem('currency'),
    ]);
    if (loginUser_data) {
      setcurrency(curr);
      const {dbname, lan_id, token, user_id} = loginUser_data;
      setregionaldatas({
        ...regionaldatas,
        state: state,
        district: district,
        block: block,
      });
      if (userListData) {
        const farmerFound = userListData.rows.find(
          user => user.user_id === farmeruserID,
        );
        if (farmerFound) {
          const dob = new Date(farmerFound.date_of_birth);
          const currentDate = new Date();
          const yearsDiff = currentDate.getFullYear() - dob.getFullYear();
          if (farmerFound.agri_user_addresses[0].agri_district) {
            await Promise.all([
              getDistrict(
                dbname,
                lan_id,
                farmerFound.agri_user_addresses[0].agri_state.fid,
              ),
              getBlock(
                dbname,
                lan_id,
                farmerFound.agri_user_addresses[0].agri_district.fid,
              ),
            ]);
          }

          if (farmerFound.agri_files[0] != undefined) {
            const filteredFilesProfile = farmerFound.agri_files.filter(
              file => file.term_type === '1',
            );
            setSelectedImage(filteredFilesProfile[0]?.file_path);
            const identityProofIdentityPropfValue = [
              ...identityProofIdentityPropf,
            ];
            const values_adress = [...identityProofIdentityPropf];

            // Update address proof in the same object
            farmerFound.agri_files
              .filter((file) => file.term_type === 'farmer_address')
              .map((_file) => {
                values_adress[0] = {
                  ...values_adress[0], // Keep other properties intact
                  uri: _file.file_path,
                  name: _file.file_name,
                  type: _file.file_ext,
                  imageType: 'address', // Update the specific property
                  fileName: _file.file_name,
                  file_id: _file.file_id,
                   id: _file.file_id,
                };
              });
            
            // Update identity proof in the same object
            farmerFound.agri_files
              .filter((file) => file.term_type === 'farmer_identity')
              .map((_file) => {
                values_adress[1] = {
                  ...values_adress[1], // Keep other properties intact
                  uri: _file.file_path,
                  name: _file.file_name,
                  type: _file.file_ext,
                  imageType: 'identity', // Update the specific property
                  fileName: _file.file_name,
                  file_id: _file.file_id,
                  id: _file.file_id,
                };
              });
            
            // Update the state with modified objects
            setIdentityProofIdentityPropf(values_adress);
            
          }
          setfarmerData({
            ...farmerData,
            userName: farmerFound?.userName,
            contactNumber: farmerFound?.contactNumber,
            gender: farmerFound?.gender,
            farmer_type: farmerFound?.farmer_type,
            date_of_birth: farmerFound?.date_of_birth,
            age: yearsDiff.toString(),
            country: farmerFound?.agri_user_addresses[0]?.country,
            state: farmerFound?.agri_user_addresses[0]?.agri_state.fid,
            stateName:
              farmerFound?.agri_user_addresses[0]?.agri_state.state_name,
            district: farmerFound?.agri_user_addresses[0]?.agri_district.fid,
            districtName:
              farmerFound?.agri_user_addresses[0]?.agri_district.district_name,
            block: farmerFound?.agri_user_addresses[0]?.agri_subdivision.fid,
            blockName:
              farmerFound?.agri_user_addresses[0]?.agri_subdivision.subdiv_name,
            aadhar_number: farmerFound?.aadhar_number,
            pan_number: farmerFound?.pan_number,
            voter_card_number: farmerFound?.voter_card_number,
            kcc_number: farmerFound?.kcc_number,
            user_bank_account_holder: farmerFound?.user_bank_account_holder,
            user_bank_account_name: farmerFound?.user_bank_account_name,
            user_bank_branch_name: farmerFound?.user_bank_branch_name,
            user_bank_account_number: farmerFound?.user_bank_account_number,
            user_bank_ifsc_code: farmerFound?.user_bank_ifsc_code,
            pension_authority: farmerFound?.pension_details?.pension_authority,
            pension_account_no:
              farmerFound?.pension_details?.pension_account_no,
            effective_from: farmerFound?.pension_details?.effective_from,
            pension_amount: farmerFound?.pension_details?.pension_amount,
            frequency: farmerFound?.pension_details?.frequency,
            company_name: farmerFound?.lic_details?.company_name,
            policy_no: farmerFound?.lic_details?.policy_no,
            sum_insured: farmerFound?.lic_details?.sum_insured,
          });
        }
        setdbName(dbname);
        setlanguageID(lan_id);
        setLoginUserId(user_id);
        setLoginUserToken(token);
        getState(dbname, lan_id);
      }
    }
    setIsLoading(false);
  };
  const handleBackPress = () => {
    navigation.navigate('userList');
    return true;
  };
  useEffect(() => {
    setSelectedImage(null);
    onPageLoad();
    onBackPress(handleBackPress);
  }, []);
  const handleUserListUpdate = async () => {
    try {
      setIsLoading(true);
      Keyboard.dismiss();
      const formData = new FormData();
      formData.append('meta', []);
      formData.append('lan_id', languageID);
      formData.append('father_name', '');
      formData.append('gender', farmerData.gender);
      formData.append('cast', '');
      formData.append('bankInfo', []);
      formData.append(
        'addressInfo',
        JSON.stringify([
          {
            country: farmerData.country,
            state: farmerData.state,
            district: farmerData.district,
            subdivision: farmerData.block,
          },
        ]),
      );
      formData.append('status', 1);
      formData.append('userName', farmerData.userName);
      formData.append('date_of_birth', farmerData.date_of_birth);
      formData.append('unique_id', '');
      formData.append('has_farmer_smart_phone', '');
      formData.append('finance_agriculture_campagin', '');
      formData.append('financial_or_bank_name', '');
      formData.append('bank_account_number', '');
      formData.append('financial_entity_name', '');
      formData.append('farmer_belongs_name', '');
      formData.append('emailId', '');
      formData.append('type_percel_ownership_document', '');
      formData.append('farmer_belongs_option', '');
      formData.append('finance_agriculture_campagin_option', '');
      formData.append('faco_value', '');
      formData.append('agent_ally', '');
      formData.append('aadhar_number', farmerData.aadhar_number);
      formData.append('kcc_number', farmerData.kcc_number);
      formData.append(
        'user_bank_account_holder',
        farmerData.user_bank_account_holder,
      );
      formData.append(
        'user_bank_account_name',
        farmerData.user_bank_account_name,
      );
      formData.append(
        'user_bank_account_number',
        farmerData.user_bank_account_number,
      );
      formData.append(
        'user_bank_branch_name',
        farmerData.user_bank_branch_name,
      );
      formData.append('user_bank_ifsc_code', farmerData.user_bank_ifsc_code);
      formData.append(
        'pension_details',
        JSON.stringify({
          pension_authority: farmerData.pension_authority,
          pension_account_no: farmerData.pension_account_no,
          effective_from: farmerData.effective_from,
          pension_amount: farmerData.pension_amount,
          frequency: farmerData.frequency,
        }),
      );
      formData.append(
        'lic_details',
        JSON.stringify({
          company_name: farmerData.company_name,
          policy_no: farmerData.policy_no,
          sum_insured: farmerData.sum_insured,
        }),
      );
      formData.append('pan_number', farmerData.pan_number);
      formData.append('voter_card_number', farmerData.voter_card_number);
      formData.append('farmer_type', farmerData.farmer_type);
      if (myphoto.name != '') {
        formData.append('photo', myphoto);
      }
      const formDataPlotImg = new FormData();
      if (
        identityProofIdentityPropf[0]?.fileName != '' &&
        identityProofIdentityPropf[0]?.fileName != ''
      ) {
        const {uri, type, name} = identityProofIdentityPropf[0];
        formDataPlotImg.append('farmer_address', {
          uri: uri,
          type: type,
          name: name,
        });
      }
      if (
        identityProofIdentityPropf[1]?.fileName != '' &&
        identityProofIdentityPropf[1]?.fileName != ''
      ) {
        const {uri, type, name} = identityProofIdentityPropf[1];
        formDataPlotImg.append('farmer_identity', {
          uri: uri,
          type: type,
          name: name,
        });
      }
      formDataPlotImg.append('user_id', farmeruserID);
      // console.error(farmeruserID)
      let formDataDelete = qs.stringify({
        file_delete_ids: photoDeletedValue.toString(),
      });
      const [userDataUpdate,addIdAddressImgsRes] = await Promise.all([
        UserInformationUpdate(
          dbName,
          languageID,
          loginUserId,
          loginUserToken,
          farmeruserID,
          formData,
        ),
        addIdAddressImgs(
          dbName,
          languageID,
          loginUserId,
          loginUserToken,
          formDataPlotImg,
        ),
        deletePlotImageAPI(dbName, languageID, loginUserToken, formDataDelete),
      ]);
      if (userDataUpdate.status === 200) {
        Toast.show({
          text: 'User information update successfully',
          ...AlertMesg[0],
        });
        setTimeout(() => {
          // navigation.navigate('Dashboard');
          navigation.dispatch(
            CommonActions.reset({
              index: 1,
              routes: [
                {name: 'Dashboard'},
                {
                  name: 'Dashboard',
                  params: {pagename: 'Dashboard'},
                },
              ],
            }),
          );
        }, 2000);
      }
      setIsLoading(false);
    } catch (error) {
      console.log(error);
    }
  };
  const HandlerGoBack = () => navigation.navigate('userList');
  const handleDocumentSelection = async (data, index, objData) => {
    try {
      const response = await DocumentPicker.pick({
        presentationStyle: 'fullScreen',
        type: [types.pdf, types.images],
      });
      const values = [...identityProofIdentityPropf];
      const photoId = values[index]?.file_id;
      if (
        photoId &&
        photoId !== undefined &&
        photoId !== '' &&
        !photoDeletedValue.includes(photoId)
      ) {
        setPhotoDeletedValue(prev => [...prev, photoId]);
      }
      values[index]['uri'] = response[0].uri;
      values[index]['name'] = response[0].name;
      values[index]['type'] = response[0].type;
      values[index]['fileName'] = response[0].name;
      values[index]['imageType'] = data;
      values[index]['file_path'] = '';
      values[index]['file_id'] = '';
      setIdentityProofIdentityPropf(values);
    } catch (err) {
      console.error(err);
    }
  };
  const handleDocumentSelectionRemove = async index => {
    try {
      const values = [...identityProofIdentityPropf];
      const photoId = values[index]?.file_id;
      values[index]['uri'] = '';
      values[index]['name'] = '';
      values[index]['type'] = '';
      values[index]['fileName'] = '';
      values[index]['imageType'] = '';
      values[index]['file_path'] = '';
      values[index]['file_id'] = '';
      values[index]['file_name'] = '';
      setIdentityProofIdentityPropf(values);
      // setPhotoDeletedValue(prev => [...prev, photoId]);
      if (photoId && photoId !== undefined && photoId !== '') {
        // setPhotoDeletedValue(prev => [...prev, photoId]);
        let formDataDelete = qs.stringify({
          file_delete_ids: photoId?.toString(),
        });
        const [deletePlotImageAPIRes] = await Promise.all([
          deletePlotImageAPI(
            dbName,
            languageID,
            loginUserToken,
            formDataDelete,
          ),
        ]);
      }
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <>
      <Root>
        <CustomHeader
          path="userList"
          HandlerGoBack={HandlerGoBack}
          logoImage={logoImage}
          topBanner={topBanner}
        />
        <FormsTitle title={'User Profile'} />
        {isLoading ? (
          <View style={styles.LoadingScreen}>
            <LoadingScreen />
          </View>
        ) : null}
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={{marginHorizontal: 20, backgroundColor: '#FFFFF'}}>
            <View
              style={{
                backgroundColor: '#E9FCC5',
                marginTop: 30,
                borderRadius: 20,
                elevation: 3,
              }}>
              <View style={{marginTop: 20, marginHorizontal: 15}}>
                <View style={{alignItems: 'center'}}>
                  <ImagePlaceHolderCircle
                    openImagePicker={openImagePicker}
                    selectedImage={selectedImage}
                  />
                </View>
                <InputTextForm
                  label={t('name')}
                  color="red"
                  value={
                    farmerData.userName == '' ? userName : farmerData.userName
                  }
                  onChangeText={userName => {
                    setfarmerData({...farmerData, userName: userName});
                  }}
                  editable={false}
                />
                <InputTextForm
                  label={t('new_reg_phone_number')}
                  color="red"
                  value={
                    farmerData.contactNumber == ''
                      ? contactNumber
                      : farmerData.contactNumber
                  }
                  editable={false}
                />
                <View>
                  <Text style={{fontSize: 16, color: '#000'}}>
                    {t('farmer_reg_gnd')}
                  </Text>
                  <RadioForm
                    label={t('farmer_reg_male')}
                    selected={
                      farmerData.gender == ''
                        ? gender === '1'
                        : farmerData.gender == '1'
                    }
                    onSelect={() => setfarmerData({...farmerData, gender: '1'})}
                  />
                  <RadioForm
                    label={t('farmer_reg_female')}
                    selected={
                      farmerData.gender == ''
                        ? gender === '2'
                        : farmerData.gender == '2'
                    }
                    onSelect={() => setfarmerData({...farmerData, gender: '2'})}
                  />
                </View>
                <View style={{marginBottom: 15}}>
                  <Text style={{fontSize: 16, marginTop: 15, color: '#000'}}>
                    {t('far_reg_far_type')}
                  </Text>
                  <RadioForm
                    label={t('grower')}
                    selected={
                      farmerData.farmer_type == ''
                        ? farmer_type == '1'
                        : farmerData.farmer_type === '1'
                    }
                    onSelect={() =>
                      setfarmerData({...farmerData, farmer_type: '1'})
                    }
                  />
                  <RadioForm
                    label={t('small_holder')}
                    selected={
                      farmerData.farmer_type == ''
                        ? farmer_type == '2'
                        : farmerData.farmer_type === '2'
                    }
                    onSelect={() =>
                      setfarmerData({...farmerData, farmer_type: '2'})
                    }
                  />
                  <RadioForm
                    label={t('farm_worker')}
                    selected={
                      farmerData.farmer_type == ''
                        ? farmer_type == '3'
                        : farmerData.farmer_type === '3'
                    }
                    onSelect={() =>
                      setfarmerData({...farmerData, farmer_type: '3'})
                    }
                  />
                </View>
                <InputTextForm
                  label={t('age')}
                  value={farmerData.age ?? farmerData.age}
                  keyboardType="numeric"
                />
                <DropdownForm
                  label={
                    regionaldatas.state == ''
                      ? t('pre_state_division_zone')
                      : t(`${regionaldatas.state}`)
                  }
                  data={stateAll}
                  onChange={data => {
                    handleStateDistrictBlock('state', data);
                  }}
                  val={farmerData.stateName}
                />
                <DropdownForm
                  label={
                    regionaldatas.state == ''
                      ? t('pre_district_county')
                      : t(`${regionaldatas.district}`)
                  }
                  data={districtAll}
                  onChange={data => {
                    handleStateDistrictBlock('district', data);
                  }}
                  val={farmerData.districtName}
                />
                <DropdownForm
                  label={
                    regionaldatas.block == ''
                      ? t('select_block_sub_county_upzila')
                      : t(`${regionaldatas.block}`)
                  }
                  data={blockAll}
                  onChange={item => {
                    setfarmerData({...farmerData, block: item.value});
                  }}
                  val={farmerData.blockName}
                />
                {/* <View style={styles.idcontainer}>
                  <Text style={[styles.title,{fontSize:14,color:'#000'}]}>
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
                              source={require('../../Common/images/document.png')}
                              style={styles.idImage}
                            />
                            <Text>
                              {data?.name == ''||data?.name ==undefined ? data.file_name: data.name}
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
                  photoDeletedValue={photoDeletedValue}
                  setPhotoDeletedValue={setPhotoDeletedValue}
                  loginUser_data={loginUser_data}
                  disable={true}
                  InputTextFormEdit={true}
                />
              </View>
            </View>
            <View
              style={{
                backgroundColor: '#E9FCC5',
                marginTop: 20,
                borderRadius: 20,
                elevation: 3,
              }}>
              <View style={{marginTop: 20, marginHorizontal: 15}}>
                <>
                  <Text style={styles.title}>
                    {t('different_identity_number')}
                  </Text>
                  <View style={{marginTop: 10}}>
                    <InputTextForm
                      label={t('adhar_no')}
                      onChangeText={aadhar_number => {
                        setfarmerData({
                          ...farmerData,
                          aadhar_number: aadhar_number,
                        });
                      }}
                      keyboardType="numeric"
                      value={farmerData.aadhar_number}
                    />
                  </View>
                  <InputTextForm
                    label={t('pan_no')}
                    value={farmerData.pan_number}
                    onChangeText={pan_number => {
                      setfarmerData({...farmerData, pan_number: pan_number});
                    }}
                  />
                  <InputTextForm
                    label={t('voter_card_no')}
                    value={farmerData.voter_card_number}
                    onChangeText={voter_card_number => {
                      setfarmerData({
                        ...farmerData,
                        voter_card_number: voter_card_number,
                      });
                    }}
                  />
                  <InputTextForm
                    label={t('kcc_no')}
                    onChangeText={kcc_number => {
                      setfarmerData({...farmerData, kcc_number: kcc_number});
                    }}
                    value={farmerData.kcc_number}
                  />
                </>
              </View>
            </View>

            <View
              style={{
                backgroundColor: '#E9FCC5',
                marginTop: 20,
                borderRadius: 20,
                elevation: 3,
              }}>
              <View style={{marginTop: 20, marginHorizontal: 15}}>
                <>
                  <Text style={styles.title}>{t('bank_account_details')}</Text>
                  <View style={{marginTop: 10}}>
                    <InputTextForm
                      label={t('account_holder_name')}
                      onChangeText={user_bank_account_holder =>
                        setfarmerData({
                          ...farmerData,
                          user_bank_account_holder: user_bank_account_holder,
                        })
                      }
                      value={farmerData.user_bank_account_holder}
                    />
                  </View>
                  <InputTextForm
                    label={t('farmer_reg_bankifsc')}
                    onChangeText={user_bank_account_name =>
                      setfarmerData({
                        ...farmerData,
                        user_bank_account_name: user_bank_account_name,
                      })
                    }
                    value={farmerData.user_bank_account_name}
                  />

                  <InputTextForm
                    label={t('branch_name')}
                    onChangeText={user_bank_branch_name =>
                      setfarmerData({
                        ...farmerData,
                        user_bank_branch_name: user_bank_branch_name,
                      })
                    }
                    value={farmerData.user_bank_branch_name}
                  />

                  <InputTextForm
                    label={t('bank_account')}
                    onChangeText={user_bank_account_number =>
                      setfarmerData({
                        ...farmerData,
                        user_bank_account_number: user_bank_account_number,
                      })
                    }
                    value={farmerData.user_bank_account_number}
                    keyboardType="numeric"
                  />

                  <InputTextForm
                    label={t('ifsc_no')}
                    onChangeText={user_bank_ifsc_code =>
                      setfarmerData({
                        ...farmerData,
                        user_bank_ifsc_code: user_bank_ifsc_code,
                      })
                    }
                    value={farmerData.user_bank_ifsc_code}
                  />
                </>
              </View>
            </View>
            <View
              style={{
                backgroundColor: '#E9FCC5',
                marginTop: 20,
                borderRadius: 20,
                elevation: 3,
              }}>
              <View style={{marginTop: 20, marginHorizontal: 15}}>
                <>
                  <Text style={styles.title}>{t('pension_details')}</Text>
                  <View style={{marginTop: 10}}>
                    <InputTextForm
                      label={t('pension_providing_authority')}
                      onChangeText={pension_authority =>
                        setfarmerData({
                          ...farmerData,
                          pension_authority: pension_authority,
                        })
                      }
                      value={farmerData.pension_authority}
                    />
                  </View>

                  <InputTextForm
                    label={t('pension_account_number')}
                    onChangeText={pension_account_no =>
                      setfarmerData({
                        ...farmerData,
                        pension_account_no: pension_account_no,
                      })
                    }
                    value={farmerData.pension_account_no}
                    keyboardType="numeric"
                  />

                  <View>
                    <Text
                      style={{marginBottom: 5, marginLeft: 5, color: '#000'}}>
                      {t('effective_from')}
                    </Text>
                    <View style={styles.passwordMainContainer}>
                      <TouchableOpacity
                        style={styles.passwordContainer}
                        onPress={() => setOpen(true)}
                        activeOpacity={0.7}>
                        <Text style={styles.inputTextStyle}>
                          {farmerData.effective_from}
                        </Text>
                        <TouchableOpacity onPress={() => setOpen(true)}>
                          <ImageForm
                            source={require('../../Common/images/calendar.png')}
                            resizeMode="cover"
                            height={30}
                            width={30}
                          />
                        </TouchableOpacity>
                        <DatePicker
                          modal
                          mode="date"
                          open={open}
                          date={newdate}
                          onConfirm={item => {
                            handleEffectFrom(item);
                            setOpen(false);
                          }}
                          onCancel={() => {
                            setOpen(false);
                          }}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <InputTextForm
                    label={t('pension_amount_currency') + '(' + currency + ')'}
                    onChangeText={pension_amount =>
                      setfarmerData({
                        ...farmerData,
                        pension_amount: pension_amount,
                      })
                    }
                    value={farmerData.pension_amount}
                    keyboardType="numeric"
                  />
                  <DropdownForm
                    label={t('per_month_quarter_year')}
                    data={config.pensionParMonthData}
                    onChange={frequency =>
                      setfarmerData({...farmerData, frequency: frequency.value})
                    }
                    val={farmerData.frequency}
                  />
                </>
              </View>
            </View>
            <View
              style={{
                backgroundColor: '#E9FCC5',
                marginTop: 20,
                marginBottom: 80,
                borderRadius: 20,
                elevation: 3,
              }}>
              <View style={{marginTop: 20, marginHorizontal: 15}}>
                <>
                  <Text style={styles.title}>
                    {t('life_insurance_details')}
                  </Text>
                  <View style={{marginTop: 10}}>
                    <InputTextForm
                      label={t('lic_name_of_company')}
                      onChangeText={company_name =>
                        setfarmerData({
                          ...farmerData,
                          company_name: company_name,
                        })
                      }
                      value={farmerData.company_name}
                    />
                  </View>
                  <InputTextForm
                    label={t('policy_number')}
                    onChangeText={policy_no =>
                      setfarmerData({...farmerData, policy_no: policy_no})
                    }
                    value={farmerData.policy_no}
                    keyboardType="numeric"
                  />
                  <InputTextForm
                    label={t('sum_insured_currency') + '(' + currency + ')'}
                    onChangeText={sum_insured =>
                      setfarmerData({...farmerData, sum_insured: sum_insured})
                    }
                    value={farmerData.sum_insured}
                    keyboardType="numeric"
                  />
                </>
              </View>
            </View>
            <View style={{backgroundColor: '#E9FCC5'}}></View>
          </View>
        </ScrollView>
        <ButtonForm
          label={t('submit')}
          onPress={() => handleUserListUpdate()}
        />
      </Root>
    </>
  );
};

export default Information;

const styles = StyleSheet.create({
  passwordMainContainer: {
    flex: 1,
    alignItems: 'center',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 8,
    width: '100%',
    paddingEnd: 8,
    backgroundColor: 'white',
    height: 40,
    marginBottom: 15,
  },
  inputTextStyle: {
    marginHorizontal: 10,
    borderColor: 'gray',
    color: '#000',
  },
  title: {
    color: '#454545',
    fontSize: 18,
  },
  LoadingScreen: {
    position: 'absolute',
    top: '52%',
    left: '45%',
    zIndex: 9999,
  },
});
