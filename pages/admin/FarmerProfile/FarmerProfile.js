import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Keyboard,
} from 'react-native';
import React, {
  useState,
  useEffect,
  useContext,
  useCallback,
  useMemo,
} from 'react';
import ImageForm from '../../Common/ImageForm';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {ROUTES} from '../../utils/Routes';
import {axiosDelete, axiosGet, axiosPut, axiosPost} from '../../utils/api';

import {
  fetchBlockAPI,
  fetchDistrictAPI,
  fetchStateAPI,
} from '../userlist/UsersAPI';
import {locDiffLang} from '../../../config/apiHere';
import {launchImageLibrary} from 'react-native-image-picker';
import DatePicker from 'react-native-date-picker';
import config from '../../../config';
import {
  useNavigation,
  useIsFocused,
  CommonActions,
} from '@react-navigation/native';
import {userCreateContext} from '../../Context/usersCreateContext';
import DocumentPicker, {types} from '@react-native-documents/picker';
import ProofAndIdentityPropfComp from '../../Common/ProofAndIdentityPropfComp';
import {
  farmerDocAPI,
  deletePlotImageAPI,
  addPlotImageAPI,
} from '../Loan/LoanAPI';
import {addIdAddressImgs, onlyUpdateIdAddrFile} from '../../../config/apiHere';
import LoadingScreen from '../../Common/LoadingScreen';
import FarmerDrawerScreenWrapper1 from '../FarmerDrawerScreenWrapper1';
import {Colors, Fronts} from '../../utils/Constants';
const qs = require('qs');
import CustomAlert from '../../Common/CustomAlert';
const FarmerProfile = ({sendDataToParent, farmerID}) => {
  //GQR-67
  const {
    loginUser_data,
    ButtonForm,
    InputTextForm,
    DropdownForm,
    RadioForm,
    t,
    ImagePlaceHolderCircle,
    Root,
    Toast,
    AlertMesg,
    getItem,
    logoImage,
    topBanner,
    onBackPress,
    setItem,
    CustomHeader,
    effective_dates,
    Popup,
  } = useContext(userCreateContext);
  const {dbname, lan_id, token, user_id, agri_user_addresses} = loginUser_data;
  //GQR-67
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  // const { farmeruserID, userName, contactNumber, profileImage, gender, farmer_type } = route.params;
  const [isLoading, setIsLoading] = useState(true);
  const [newdate, setnewDate] = useState(new Date());
  const [open, setOpen] = useState(false);
  const [dbName, setdbName] = useState();
  const [languageData, setlanguageData] = useState([]);
  const [languageID, setlanguageID] = useState();
  const [loginUserId, setLoginUserId] = useState('');
  const [loginUserToken, setLoginUserToken] = useState('');
  const [stateAll, setStateAll] = useState([]);
  const [districtAll, setDistrictAll] = useState([]);
  const [blockAll, setBlockAll] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [myphoto, setmyPhoto] = useState({uri: '', type: '', name: ''});
  const [farmerData, setFarmerData] = useState({
    userName: '',
    contactNumber: '',
    gender: '',
    farmer_type: '',
    age: '',
    state: '',
    district: '',
    block: '',
    blockName: '',
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
    districtName: '',
  });
  const [identityProofIdentityPropf, setIdentityProofIdentityPropf] = useState([
    {
      uri: '',
      name: '',
      type: '',
      fileName: '',
      imageType: 'address',
      file_path: '',
      file_id: '',
    },
    {
      uri: '',
      name: '',
      type: '',
      fileName: '',
      imageType: 'identity',
      file_path: '',
      file_id: '',
    },
  ]);
  const [photoDeletedValue, setPhotoDeletedValue] = useState([]);
  const [regionaldatas, setregionaldatas] = useState({
    state: '',
    district: '',
    block: '',
  });
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
  let languageDataList = async dbname => {
    try {
      // let language_res = await firstLanguageListAPI(dbname);
      let language_res = await axiosGet(ROUTES.GET.FIRST_LAN_LIST(), null, {
        information: `${dbname}`,
      });

      if (language_res?.status == 200) {
        let languageArray = language_res?.data?.data.map(data => ({
          value: data.id,
          label: data.name,
          sName: data.sname,
        }));
        setlanguageData(languageArray);
      }
    } catch (error) {
      console.log('Error in language API', error.response);
    }
  };
  const handleLanguage = useCallback(async data => {
    setlanguageID(data.value);
    setIsLoading(true);
    const {block, district, state} = farmerData;
    const locDiffLangRes = await locDiffLang(
      dbname,
      data?.value,
      token,
      state || '',
      district || '',
      block || '',
    );

    if (locDiffLangRes?.status == 200) {
      const {distData, stateData, subdivData} =
        locDiffLangRes?.data?.data || {};
      if (distData == null || stateData == null || subdivData == null) {
        CustomAlert(
          'Address',
          'Location data not found in selected language. Please add them from admin.',
          true,
          'OK',
        );
      }
      await Promise.all([
        getState(dbname, data?.value, token),
        getDistrict(dbname, data?.value, stateData?.fid ?? 0),
        getBlock(dbname, data?.value, distData?.fid ?? 0),
      ]);
      setFarmerData(prev => ({
        ...prev,
        lan_id: data.value,
        lanName: data.label,
        lanSname: data.sName,
        block: subdivData?.fid,
        blockName: subdivData?.subdiv_name,
        district: distData?.fid,
        districtName: distData?.district_name,
        state: stateData?.fid,
        stateName: stateData?.state_name,
      }));
    }
    setIsLoading(false);
  }, []);
  const getState = async (dbName, languageID) => {
    setIsLoading(true);
    const response = await fetchStateAPI(dbName, languageID);
    if (response?.status == 200) {
      const dataArray = response?.data?.data?.rows.map(data => ({
        value: data?.fid,
        label: data.state_name,
      }));
      setStateAll(dataArray);
    }
    setIsLoading(false);
  };
  const getDistrict = async (dbName, languageID, stateID) => {
    setIsLoading(true);
    const response = await fetchDistrictAPI(dbName, languageID, stateID);
    if (response?.status === 200) {
      const dataArray = response?.data?.data?.rows?.map(data => ({
        value: data?.fid,
        label: data.district_name,
      }));
      setDistrictAll(dataArray);
    }
    setIsLoading(false);
  };
  const getBlock = async (dbName, languageID, districtID) => {
    setIsLoading(true);
    const response = await fetchBlockAPI(dbName, languageID, districtID);
    if (response?.status == 200) {
      const dataArray = response?.data?.data?.rows?.map(data => ({
        value: data?.fid,
        label: data.subdiv_name,
      }));
      setBlockAll(dataArray);
    }
    setIsLoading(false);
  };
  const handleStateDistrictBlock = (moduleName, data) => {
    // setfarmerData({
    //   ...farmerData,
    //   [moduleName]: data.value,
    //   [`${moduleName}Name`]: data.label,
    // });
    if (moduleName === 'state') {
      setFarmerData({
        ...farmerData,
        state: data.value,
        stateName: data.label,
        district: '',
        districtName: '',
        block: '',
        blockName: '',
      });
      const stateID = data.value;
      getDistrict(dbName, languageID, stateID);
    } else if (moduleName === 'district') {
      setFarmerData({
        ...farmerData,
        district: data.value,
        districtName: data.label,
        block: '',
        blockName: '',
      });
      const dataArray = [];
      setBlockAll(dataArray);
      const districtID = data.value;
      getBlock(dbName, languageID, districtID);
    }
  };
  const handleEffectFrom = async item => {
    const cycleEnds = effective_dates(item);
    setFarmerData({...farmerData, effective_from: cycleEnds});
  };
  const onPageLoad = async () => {
    setIsLoading(true);
    const [state, district, block] = await Promise.all([
      getItem('state'),
      getItem('district'),
      getItem('block'),
    ]);
    setregionaldatas({
      ...regionaldatas,
      state: state,
      district: district,
      block: block,
    });
    const [res, farmarDoc] = await Promise.all([
      axiosGet(
        ROUTES.GET.FARMER_PROFILE_INFO({
          user_id: user_id,
        }),
        token,
        {information: `${dbname},${lan_id}`},
      ), //dbname, lan_id, token, user_id

      axiosGet(
        ROUTES.GET.FARMER_DOC({
          user_id: user_id,
        }),
        token,
        {information: `${dbname},${lan_id}`},
      ),
    ]);
    //dbname, lan_id, token, user_id  //dbname, lan_id, token, user_id
    if (farmarDoc?.status === 200) {
      if (farmarDoc?.data?.data?.[0]?.agri_files) {
        const agriFiles = farmarDoc.data.data[0].agri_files;
        const farmerIdentityFile = agriFiles.filter(
          file => file.term_type === 'farmer_identity',
        )[0];
        const farmerAddressFile = agriFiles.filter(
          file => file.term_type === 'farmer_address',
        )[0];
        setIdentityProofIdentityPropf(prevState => [
          {
            ...prevState[0],
            uri: farmerAddressFile ? farmerAddressFile.file_path : '',
            name: farmerAddressFile ? farmerAddressFile.file_name : '',
            type: farmerAddressFile ? farmerAddressFile.file_ext : '',
            fileName: farmerAddressFile ? farmerAddressFile.file_name : '',
            file_id: farmerAddressFile ? farmerAddressFile.file_id : '',
            id: farmerAddressFile ? farmerAddressFile.file_id : '',
            imageType: 'address',
          },
          {
            ...prevState[1],
            uri: farmerIdentityFile ? farmerIdentityFile.file_path : '',
            name: farmerIdentityFile ? farmerIdentityFile.file_name : '',
            type: farmerIdentityFile ? farmerIdentityFile.file_ext : '',
            fileName: farmerIdentityFile ? farmerIdentityFile.file_name : '',
            file_id: farmerIdentityFile ? farmerIdentityFile.file_id : '',
            id: farmerIdentityFile ? farmerIdentityFile.file_id : '',
            imageType: 'identity',
          },
        ]);
      }
    }
    console.log('res', res);
    const farmerFound = res?.data?.data[0];
    if (farmerFound != undefined) {
      const dob = new Date(farmerFound?.date_of_birth);
      const currentDate = new Date();
      const yearsDiff = currentDate.getFullYear() - dob.getFullYear();
      // if (farmerFound?.agri_user_addresses[0].agri_district) {
      await Promise.all([
        getDistrict(
          dbname,
          lan_id,
          agri_user_addresses?.[0]?.agri_state?.fid ?? 0,
        ),
        getBlock(
          dbname,
          lan_id,
          agri_user_addresses?.[0]?.agri_district?.fid ?? 0,
        ),
        setLoginUserId(user_id),
        setLoginUserToken(token),
        languageDataList(dbname),
        getState(dbname, lan_id),
        setdbName(dbname),
        setlanguageID(lan_id),
      ]);

      // }
      if (farmerFound.agri_files[0] != undefined) {
        const filteredFilesProfile = farmerFound.agri_files.filter(
          file => file.term_type === '1',
        );
        setSelectedImage(filteredFilesProfile[0]?.file_path);
      }
      setFarmerData({
        ...farmerData,
        userName: farmerFound?.userName,
        contactNumber: farmerFound?.contactNumber,
        gender: farmerFound?.gender,
        farmer_type: farmerFound?.farmer_type,
        date_of_birth: farmerFound?.date_of_birth,
        age: yearsDiff.toString(),
        country: farmerFound?.agri_user_addresses[0].country,
        lan_id: farmerFound?.agri_language.id,
        lanName: farmerFound?.agri_language.name,
        lanSname: farmerFound?.agri_language.sname,
        state: farmerFound?.agri_user_addresses[0].agri_state?.fid,
        stateName: farmerFound?.agri_user_addresses[0].agri_state?.state_name,
        district: farmerFound?.agri_user_addresses[0].agri_district?.fid,
        districtName:
          farmerFound?.agri_user_addresses[0].agri_district?.district_name,
        block: farmerFound?.agri_user_addresses[0].agri_subdivision?.fid,
        blockName:
          farmerFound?.agri_user_addresses[0].agri_subdivision?.subdiv_name,
        aadhar_number: farmerFound?.aadhar_number,
        pan_number: farmerFound?.pan_number,
        voter_card_number: farmerFound?.voter_card_number,
        kcc_number: farmerFound?.kcc_number,
        user_bank_account_holder: farmerFound?.user_bank_account_holder,
        user_bank_account_name: farmerFound?.user_bank_account_name,
        user_bank_branch_name: farmerFound?.user_bank_branch_name,
        user_bank_account_number: farmerFound?.user_bank_account_number,
        user_bank_ifsc_code: farmerFound?.user_bank_ifsc_code,
        pension_authority: farmerFound?.pension_details.pension_authority,
        pension_account_no: farmerFound?.pension_details.pension_account_no,
        effective_from: farmerFound?.pension_details.effective_from,
        pension_amount: farmerFound?.pension_details.pension_amount,
        frequency: farmerFound?.pension_details.frequency,
        company_name: farmerFound?.lic_details.company_name,
        policy_no: farmerFound?.lic_details.policy_no,
        sum_insured: farmerFound?.lic_details.sum_insured,
      });
    }
    setIsLoading(false);
  };

  useEffect(() => {
    setmyPhoto({uri: '', type: '', name: ''});
    setSelectedImage(null);
    onPageLoad();
    // onBackPress(handleBackPress);
  }, []);
  const handleUserListUpdate = async () => {
    setIsLoading(true);
    if (validateForm()) {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const yearsToSubtract = farmerData.age;
      const day = currentDate.getDate();
      const month = currentDate.getMonth() + 1;
      const newYear = currentYear - yearsToSubtract;
      const dob = `${newYear}-${month}-${day}`;
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
      formData.append('date_of_birth', dob);
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
      // const photoDeletedvalidValues = photoDeletedValue.filter(
      //   value => value !== undefined && value !== '',
      // );
      const deleteValue = [];
      photoDeletedValue.map(data => {
        deleteValue.push(data);
      });
      let formDataDelete = qs.stringify({
        file_delete_ids: deleteValue.toString(),
      });
      const formDataDoc = new FormData();
      if (
        identityProofIdentityPropf[0]?.fileName != '' &&
        identityProofIdentityPropf[0]?.fileName != ''
      ) {
        const {uri, type, name} = identityProofIdentityPropf[0];
        formDataDoc.append('farmer_address', {
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
        formDataDoc.append('farmer_identity', {
          uri: uri,
          type: type,
          name: name,
        });
      }
      formDataDoc.append('user_id', loginUserId);
      const [userDataUpdate, deletePlotImageAPIRes, addPlotImageAPIRes] =
        await Promise.all([
          axiosPut(
            ROUTES.PUT.USER_PROFILE_UPDATE({
              user_id: loginUserId,
            }),
            formData,
            token,
            '',
            {information: `${dbname},${lan_id},${user_id}`},
          ),
          onlyUpdateIdAddrFile(dbName, lan_id, loginUserId, token, formDataDoc),
          deletePlotImageAPI(dbName, lan_id, token, formDataDelete),
        ]);
      if (userDataUpdate.status === 200) {
        Toast.show({text: t('info_updated_successfully'), ...AlertMesg[0]});
        setTimeout(() => {
          // RemoveFarmerData();
          navigation.dispatch(
            CommonActions.reset({
              index: 4,
              routes: [
                {name: 'Login'},
                {
                  name: 'Login',
                  params: {pagename: 'Login', locale: languageID},
                },
              ],
            }),
          );
        }, 2000);
      }
    }
    setIsLoading(false);
  };
  const validateForm = () => {
    Keyboard.dismiss();
    if (farmerData.userName.length < 1) {
      Toast.show({text: t('please_enter_valid_name'), ...AlertMesg[0]});
      return false;
    } else if (farmerData.age == '') {
      Toast.show({text: t('please_enter_birth_date'), ...AlertMesg[0]});
      return false;
    } else if (farmerData.age < 18) {
      Toast.show({text: t('please_eligible_birth_date'), ...AlertMesg[0]});
      return false;
    } else if (farmerData.state == '' || farmerData.state == undefined) {
      Toast.show({text: t('select_state_first'), ...AlertMesg[0]});
      console.log(t('select_state_first'));
      return false;
    } else if (farmerData.district == '' || farmerData.district == undefined) {
      Toast.show({text: t('select_district_first'), ...AlertMesg[0]});
      console.log(t('select_district_first'));

      return false;
    } else if (farmerData.block == '' || farmerData.block == undefined) {
      Toast.show({text: t('select_block_first'), ...AlertMesg[0]});
      console.log(t('select_block_first'));

      return false;
    }
    return true;
  };
  const HandlerGoBack = () => navigation.navigate('FarmerDashboard');
  const onChangeGender = useCallback(text => {
    setFarmerData(prev => ({...prev, gender: text}));
  }, []);
  const onChangeGrower = useCallback(text => {
    setFarmerData(prev => ({...prev, farmer_type: text}));
  }, []);
  const onChangeAge = useCallback(text => {
    setFarmerData(prev => ({...prev, age: age}));
  }, []);
  const handleState = useCallback(item => {
    const {value, label} = item || {};
    setIsLoading(true);
    setFarmerData(prev => ({
      ...prev,
      state: value,
      stateName: label,
      district: '',
      districtName: '',
      block: '',
      blockName: '',
    }));
    getDistrict(dbname, lan_id, value);
    setIsLoading(false);
  }, []);
  const handleDistrict = useCallback(item => {
    const {value, label} = item || {};
    setIsLoading(true);
    setFarmerData(prev => ({
      ...prev,
      district: value,
      districtName: label,
      block: '',
      blockName: '',
    }));
    getBlock(dbname, lan_id, value);
    setIsLoading(false);
  }, []);
  const handleUserNameChange = useCallback(userName => {
    setFarmerData(prev => ({...prev, userName}));
  }, []);
  const handleVoterCardChange = useCallback(voterCardNumber => {
    setFarmerData(prev => ({...prev, voter_card_number: voterCardNumber}));
  }, []);
  const handleKccNoChange = useCallback(kccNumber => {
    setFarmerData(prev => ({...prev, kcc_number: kccNumber}));
  }, []);
  const handleUserBankAccountHolderChange = useCallback(
    userBankAccountHolder => {
      setFarmerData(prev => ({
        ...prev,
        user_bank_account_holder: userBankAccountHolder,
      }));
    },
    [],
  );
  const handleUserBankAccountNameChange = useCallback(userBankAccountName => {
    setFarmerData(prev => ({
      ...prev,
      user_bank_account_name: userBankAccountName,
    }));
  }, []);
  const handleUserBankBranchNameChange = useCallback(userBankBranchName => {
    setFarmerData(prev => ({
      ...prev,
      user_bank_branch_name: userBankBranchName,
    }));
  }, []);
  const handleUserBankAccountNumberChange = useCallback(
    userBankAccountNumber => {
      setFarmerData(prev => ({
        ...prev,
        user_bank_account_number: userBankAccountNumber,
      }));
    },
    [],
  );
  const handleUserBankIfscCodeChange = useCallback(userBankIfscCode => {
    setFarmerData(prev => ({...prev, user_bank_ifsc_code: userBankIfscCode}));
  }, []);
  const handlePensionAuthorityChange = useCallback(pensionAuthority => {
    setFarmerData(prev => ({...prev, pension_authority: pensionAuthority}));
  }, []);
  const handlePensionAccountNumberChange = useCallback(pensionAccountNumber => {
    setFarmerData(prev => ({
      ...prev,
      pension_account_no: pensionAccountNumber,
    }));
  }, []);
  const handlePensionAmountChange = useCallback(pensionAmount => {
    setFarmerData(prev => ({...prev, pension_amount: pensionAmount}));
  }, []);
  const handleFrequencyChange = useCallback(frequency => {
    setFarmerData(prev => ({...prev, frequency: frequency.value}));
  }, []);
  const handleCompanyNameChange = useCallback(companyName => {
    setFarmerData(prev => ({...prev, company_name: companyName}));
  }, []);
  const handlePolicyNumberChange = useCallback(policyNumber => {
    setFarmerData(prev => ({...prev, policy_no: policyNumber}));
  }, []);
  const handleSumInsuredChange = useCallback(sumInsured => {
    setFarmerData(prev => ({...prev, sum_insured: sumInsured}));
  }, []);
  const handleAadharNumberChange = useCallback(aadharNumber => {
    setFarmerData(prev => ({...prev, aadhar_number: aadharNumber}));
  }, []);
  const handlePanNumberChange = useCallback(panNumber => {
    setFarmerData(prev => ({...prev, pan_number: panNumber}));
  }, []);
  const renderCustomHeader = useMemo(() => <CustomHeader t={t} />, []);
  return (
    <FarmerDrawerScreenWrapper1>
      <>
        <Root>
          <View style={styles.mainContainer}>
            {renderCustomHeader}
            {isLoading ? (
              <View style={styles.LoadingScreen}>
                <LoadingScreen />
              </View>
            ) : null}
            <ScrollView>
              <View style={{marginBottom: 40, marginTop: 20}}>
                <View style={styles.firatFormContainer}>
                  <View style={styles.profileImg}>
                    <ImagePlaceHolderCircle
                      openImagePicker={openImagePicker}
                      selectedImage={selectedImage}
                    />
                    {/* <Text style={styles.userName}>{farmerData.userName}</Text> */}
                  </View>
                  <View style={styles.inputContainer}>
                    <InputTextForm
                      label={t('name')}
                      required={true}
                      value={farmerData.userName}
                      onChange={handleUserNameChange}
                    />
                    <InputTextForm
                      label={t('new_reg_phone_number')}
                      required={true}
                      value={farmerData.contactNumber}
                      editable={false}
                    />
                    <View>
                      <Text style={styles.radioTitle}>
                        {t('farmer_reg_gnd')}
                      </Text>
                      <RadioForm
                        label={t('farmer_reg_male')}
                        selected={farmerData.gender == '1'}
                        // onSelect={() =>
                        //   setfarmerData({ ...farmerData, gender: '1' })
                        // }
                        onSelect={() => onChangeGender(1)}
                      />
                      <RadioForm
                        label={t('farmer_reg_female')}
                        selected={farmerData.gender == '2'}
                        // onSelect={() =>
                        //   setfarmerData({ ...farmerData, gender: '2' })
                        // }
                        onSelect={() => onChangeGender(2)}
                      />
                    </View>
                    <View style={{marginBottom: 15, marginTop: 15}}>
                      <Text style={styles.radioTitle}>
                        {t('far_reg_far_type')}
                      </Text>
                      <RadioForm
                        label={t('grower')}
                        selected={farmerData.farmer_type == '1'}
                        onSelect={() => onChangeGrower(1)}
                      />
                      <RadioForm
                        label={t('small_holder')}
                        selected={farmerData.farmer_type == '2'}
                        onSelect={() => onChangeGrower(2)}
                      />
                      <RadioForm
                        label={t('farm_worker')}
                        selected={farmerData.farmer_type == '3'}
                        onSelect={() => onChangeGrower(3)}
                      />
                    </View>
                    <InputTextForm
                      label={t('age')}
                      value={farmerData.age ?? farmerData.age}
                      keyboardType="numeric"
                      onChange={onChangeAge}
                    />
                    <DropdownForm
                      label={t('add_class_language')}
                      color="black"
                      data={languageData}
                      onChange={handleLanguage}
                      val={farmerData.lanName}
                    />
                    <DropdownForm
                      label={
                        regionaldatas.state == ''
                          ? t('pre_state_division_zone')
                          : t(`${regionaldatas.state}`)
                      }
                      data={stateAll}
                      onChange={handleState}
                      val={farmerData.stateName}
                    />
                    <DropdownForm
                      label={
                        regionaldatas.district == ''
                          ? t('pre_district_county')
                          : t(`${regionaldatas.district}`)
                      }
                      data={districtAll}
                      onChange={handleDistrict}
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
                        setFarmerData(prev => ({...prev, block: item.value}));
                      }}
                      val={farmerData.blockName}
                    />
                    <ProofAndIdentityPropfComp
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
              </View>
              <View style={styles.formContainer}>
                <View style={styles.formHeader}>
                  <Text style={styles.title}>
                    {t('different_identity_number')}
                  </Text>
                </View>
                <View style={styles.inputContainer2}>
                  <>
                    <View style={{marginTop: 10}}>
                      <InputTextForm
                        label={t('adhar_no')}
                        onChangeText={handleAadharNumberChange}
                        keyboardType="numeric"
                        value={farmerData.aadhar_number}
                      />
                    </View>
                    <InputTextForm
                      label={t('pan_no')}
                      value={farmerData.pan_number}
                      onChangeText={handlePanNumberChange}
                    />
                    <InputTextForm
                      label={t('voter_card_no')}
                      value={farmerData.voter_card_number}
                      onChangeText={handleVoterCardChange}
                    />
                    <InputTextForm
                      label={t('kcc_no')}
                      onChangeText={handleKccNoChange}
                      value={farmerData.kcc_number}
                    />
                  </>
                </View>
              </View>

              <View style={styles.formContainer}>
                <View style={styles.formHeader}>
                  <Text style={styles.title}>{t('bank_account_details')}</Text>
                </View>
                <View style={styles.inputContainer2}>
                  <>
                    <View style={{marginTop: 10}}>
                      <InputTextForm
                        label={t('account_holder_name')}
                        onChangeText={handleUserBankAccountHolderChange}
                        value={farmerData.user_bank_account_holder}
                      />
                    </View>
                    <InputTextForm
                      label={t('farmer_reg_bankifsc')}
                      onChangeText={handleUserBankAccountNameChange}
                      value={farmerData.user_bank_account_name}
                    />

                    <InputTextForm
                      label={t('branch_name')}
                      onChangeText={handleUserBankBranchNameChange}
                      value={farmerData.user_bank_branch_name}
                    />

                    <InputTextForm
                      label={t('bank_account')}
                      onChangeText={handleUserBankAccountNumberChange}
                      value={farmerData.user_bank_account_number}
                      keyboardType="numeric"
                    />

                    <InputTextForm
                      label={t('ifsc_no')}
                      onChangeText={handleUserBankIfscCodeChange}
                      value={farmerData.user_bank_ifsc_code}
                    />
                  </>
                </View>
              </View>
              <View style={styles.formContainer}>
                <View style={styles.formHeader}>
                  <Text style={styles.title}>{t('pension_details')}</Text>
                </View>
                <View style={styles.inputContainer2}>
                  <>
                    <View style={{marginTop: 10}}>
                      <InputTextForm
                        label={t('pension_providing_authority')}
                        onChangeText={handlePensionAuthorityChange}
                        value={farmerData.pension_authority}
                      />
                    </View>

                    <InputTextForm
                      label={t('pension_account_number')}
                      onChangeText={handlePensionAccountNumberChange}
                      value={farmerData.pension_account_no}
                      keyboardType="numeric"
                    />

                    <View>
                      <Text style={styles.dateText}>{t('effective_from')}</Text>
                      <View style={styles.passwordMainContainer}>
                        <TouchableOpacity
                          style={styles.passwordContainer}
                          onPress={() => setOpen(true)}
                          activeOpacity={0.7}>
                          <Text style={styles.inputTextStyle}>
                            {farmerData.effective_from}
                          </Text>
                          <TouchableOpacity onPress={() => setOpen(true)}>
                            <MaterialIcons
                              name="calendar-month"
                              size={25}
                              color="#1d3122"
                            />

                            {/* <ImageForm
                              source={require('../../Common/images/calendar.png')}
                              resizeMode="cover"
                              height={30}
                              width={30}
                            /> */}
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
                      label={t('pension_amount_currency')}
                      onChangeText={handlePensionAmountChange}
                      value={farmerData.pension_amount}
                      keyboardType="numeric"
                    />
                    <DropdownForm
                      label={t('per_month_quarter_year')}
                      data={config.pensionParMonthData}
                      onChange={handleFrequencyChange}
                      val={farmerData.frequency}
                    />
                  </>
                </View>
              </View>
              <View style={styles.formContainer}>
                <View style={styles.formHeader}>
                  <Text style={styles.title}>
                    {t('life_insurance_details')}
                  </Text>
                </View>
                <View style={styles.inputContainer2}>
                  <>
                    <View style={{marginTop: 10}}>
                      <InputTextForm
                        label={t('lic_name_of_company')}
                        onChangeText={handleCompanyNameChange}
                        value={farmerData.company_name}
                      />
                    </View>
                    <InputTextForm
                      label={t('policy_number')}
                      onChangeText={handlePolicyNumberChange}
                      value={farmerData.policy_no}
                      keyboardType="numeric"
                    />
                    <InputTextForm
                      label={t('sum_insured_currency')}
                      onChangeText={handleSumInsuredChange}
                      value={farmerData.sum_insured}
                      keyboardType="numeric"
                    />
                  </>
                </View>
              </View>
              <View style={{backgroundColor: '#E9FCC5'}}></View>
            </ScrollView>
            <ButtonForm
              label={t('submit')}
              onPress={() => handleUserListUpdate()}
              iconName="check-circle"
              iconColor="#fff"
              iconSize={30}
            />
          </View>
        </Root>
      </>
    </FarmerDrawerScreenWrapper1>
  );
};

export default FarmerProfile;

const styles = StyleSheet.create({
  mainContainer: {flex: 1, backgroundColor: Colors.background_light},
  firatFormContainer: {
    marginTop: 50,

    marginHorizontal: '4%',
    borderWidth: 1,
    // paddingTop: 10,
    // marginBottom: 30,

    backgroundColor: 'white',
    // padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    // elevation:1,
    marginVertical: 10,
    marginHorizontal: '4%',
  },
  formContainer: {
    backgroundColor: Colors.background, // marginTop: 30,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: Colors.border,
    marginHorizontal: '4%',

    // paddingTop: 10,
    marginBottom: 30,
  },
  inputContainer: {marginTop: '30%', marginHorizontal: 15},
  inputContainer2: {marginHorizontal: 15},
  profileImg: {
    position: 'absolute',
    top: -40, // Half outside (adjust based on your image size)
    alignSelf: 'center', // Center horizontally
    zIndex: 2,
    elevation: 5, // For Android shadow
    shadowColor: '#000', // For iOS shadow
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  passwordMainContainer: {
    flex: 1,
    alignItems: 'center',
  },
  userName: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: Colors.drawer,
    paddingTop: 5,
  },
  radioTitle: {
    fontSize: 15,
    color: '#4e4e4e',
    fontFamily: 'Poppins-Regular',
    paddingLeft: 10,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
    height: 50,
    borderColor: Colors.secondary, // Make sure this color is visible
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    width: '100%',
    elevation: 1,
    paddingHorizontal: 10,
    color: '#000000',
  },
  inputTextStyle: {
    marginHorizontal: 10,
    borderColor: 'gray',
    color: '#000',
  },
  formHeader: {
    backgroundColor: Colors.useGreen,
    height: 60,
    width: '100%',
    justifyContent: 'center',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignSelf: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    color: 'rgba(255, 255, 255, 1)',
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
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
  LoadingScreen: {
    position: 'absolute',
    top: '52%',
    left: '45%',
    zIndex: 9999,
  },
  dateText: {
    marginBottom: 5,
    marginLeft: 5,
    color: '#4e4e4e',
  },
});
