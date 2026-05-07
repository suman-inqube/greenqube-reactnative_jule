import {StyleSheet, Text, View, ScrollView, Keyboard} from 'react-native';
import React, {
  useState,
  useEffect,
  useCallback,
  useContext,
  useMemo,
} from 'react';
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
import DocumentPicker, {types} from '@react-native-documents/picker';
import ProofAndIdentityPropfComp from '../../Common/ProofAndIdentityPropfComp';
import LoadingScreen from '../../Common/LoadingScreen';
import {addIdAddressImgs, onlyUpdateIdAddrFile} from '../../../config/apiHere';
import {deletePlotImageAPI} from '../Loan/LoanAPI';
import {Colors} from '../../utils/Constants';
import MyErrorBoundary from '../../Common/MyErrorBoundary';
import {SafeAreaView} from 'react-native-safe-area-context';

const qs = require('qs');
import DatePickerField from '../../Common/DatePickerField';
import DatePickerComp from '../../Common/DatePickerComp';
import FarmerDrawerScreenWrapper1 from '../FarmerDrawerScreenWrapper1';
import {axiosGet, axiosPut, axiosPost} from '../../utils/api';
import {ROUTES} from '../../utils/Routes';
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
    dbLanTokUsr,
  } = useContext(userCreateContext);
  const {dbname, lan_id, token, user_id, FcmUserToken, owner} = loginUser_data;
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
  const [isLoading, setIsLoading] = useState(true);
  const [stateAll, setstateAll] = useState([]);
  const [districtAll, setdistrictAll] = useState([]);
  const [blockAll, setblockAll] = useState([]);
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
      id: '',
    },
    {
      uri: '',
      name: '',
      type: '',
      fileName: '',
      imageType: 'identity',
      file_path: '',
      file_id: '',
      id: '',
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

  const getState = async (dbname, lan_id) => {
    const response = await axiosGet(ROUTES.GET.STATE_API(), '', {
      information: `${dbname},${lan_id}`,
    });
    // fetchStateAPI(dbname, lan_id);
    if (response?.status == 200) {
      const dataArray = response?.data?.data?.rows.map(data => ({
        value: data.fid,
        label: data.state_name,
      }));
      setstateAll(dataArray);
    }
  };
  const getDistrict = async (dbname, lan_id, stateID) => {
    const response = await axiosGet(
      ROUTES.GET.DISTRICT_API({
        stateID: stateID,
      }),
      '',
      {information: `${dbname},${lan_id}`},
    );
    // fetchDistrictAPI(dbname, lan_id, stateID);
    console.log('DISTRICT_API1111111', response);

    if (response?.status === 200) {
      const dataArray = response?.data?.data?.rows.map(data => ({
        value: data.fid,
        label: data.district_name,
      }));
      setdistrictAll(dataArray);
    }
  };
  const getBlock = async (dbname, lan_id, districtID) => {
    const response = await axiosGet(
      ROUTES.GET.BLOCK_API({
        districtID: districtID,
      }),
      '',
      {information: `${dbname},${lan_id}`},
    );
    // fetchBlockAPI(dbname, lan_id, districtID);
    if (response?.status == 200) {
      const dataArray = response?.data?.data?.rows.map(data => ({
        value: data.fid,
        label: data.subdiv_name,
      }));
      setblockAll(dataArray);
    }
  };

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
  const handleEffectFromField = useCallback(async item => {
    setOpen(true);
  }, []);
  const handleEffectFrom = useCallback(async item => {
    setFarmerData(prev => ({...prev, effective_from: effective_dates(item)}));
  }, []);
  // const onPageLoad = async () => {
  //   setIsLoading(true);
  //   const [userListData, state, district, block, curr] = await Promise.all([
  //     getItem('userListData'),
  //     getItem('state'),
  //     getItem('district'),
  //     getItem('block'),
  //     getItem('currency'),
  //   ]);
  //   if (loginUser_data) {
  //     setcurrency(curr);
  //     console.log("admin1")
  //     const {dbname, lan_id, token, user_id} = loginUser_data;
  //     setregionaldatas(prev => ({
  //       ...prev,
  //       state: state,
  //       district: district,
  //       block: block,
  //     }));
  //     if (userListData) {
  //       console.log('admin2');
  //       const farmerFound = userListData?.find(
  //         user => user.user_id === farmeruserID,
  //       );
  //       if (farmerFound) {
  //         console.log('admin3');
  //         const dob = new Date(farmerFound.date_of_birth);
  //         const currentDate = new Date();
  //         const yearsDiff = currentDate.getFullYear() - dob.getFullYear();
  //         console.log(
  //           'admin4',
  //           JSON.stringify(farmerFound)
  //         );
  //         if (farmerFound?.agri_user_addresses[0]?.agri_district) {
  //           await Promise.all([
  //             getDistrict(
  //               dbname,
  //               lan_id,
  //               farmerFound.agri_user_addresses[0]?.agri_state?.fid,
  //             ),
  //             getBlock(
  //               dbname,
  //               lan_id,
  //               farmerFound.agri_user_addresses[0]?.agri_district?.fid,
  //             ),
  //           ]);
  //         }

  //         if (farmerFound.agri_files[0] != undefined) {
  //           const filteredFilesProfile = farmerFound.agri_files.filter(
  //             file => file.term_type === '1',
  //           );
  //           setSelectedImage(filteredFilesProfile[0]?.file_path);
  //           const identityProofIdentityPropfValue = [
  //             ...identityProofIdentityPropf,
  //           ];
  //           const values_adress = [...identityProofIdentityPropf];

  //           // Update address proof in the same object
  //           farmerFound.agri_files
  //             .filter(file => file.term_type === 'farmer_address')
  //             .map(_file => {
  //               values_adress[0] = {
  //                 ...values_adress[0], // Keep other properties intact
  //                 uri: _file.file_path,
  //                 name: _file.file_name,
  //                 type: _file.file_ext,
  //                 imageType: 'address', // Update the specific property
  //                 fileName: _file.file_name,
  //                 file_id: _file.file_id,
  //                 id: _file.file_id,
  //               };
  //             });

  //           // Update identity proof in the same object
  //           farmerFound.agri_files
  //             .filter(file => file.term_type === 'farmer_identity')
  //             .map(_file => {
  //               values_adress[1] = {
  //                 ...values_adress[1], // Keep other properties intact
  //                 uri: _file.file_path,
  //                 name: _file.file_name,
  //                 type: _file.file_ext,
  //                 imageType: 'identity', // Update the specific property
  //                 fileName: _file.file_name,
  //                 file_id: _file.file_id,
  //                 id: _file.file_id,
  //               };
  //             });

  //           // Update the state with modified objects
  //           setIdentityProofIdentityPropf(values_adress);
  //         }
  //         console.log('admin4');
  //         setFarmerData(prev => ({
  //           ...prev,
  //           userName: farmerFound?.userName,
  //           contactNumber: farmerFound?.contactNumber,
  //           gender: farmerFound?.gender,
  //           farmer_type: farmerFound?.farmer_type,
  //           date_of_birth: farmerFound?.date_of_birth,
  //           age: yearsDiff.toString(),
  //           country: farmerFound?.agri_user_addresses[0]?.country,
  //           state: farmerFound?.agri_user_addresses[0]?.agri_state?.fid,
  //           stateName:
  //             farmerFound?.agri_user_addresses[0]?.agri_state?.state_name,
  //           district: farmerFound?.agri_user_addresses[0]?.agri_district?.fid,
  //           districtName:
  //             farmerFound?.agri_user_addresses[0]?.agri_district?.district_name,
  //           block: farmerFound?.agri_user_addresses[0]?.agri_subdivision?.fid,
  //           blockName:
  //             farmerFound?.agri_user_addresses[0]?.agri_subdivision
  //               ?.subdiv_name,
  //           aadhar_number: farmerFound?.aadhar_number,
  //           pan_number: farmerFound?.pan_number,
  //           voter_card_number: farmerFound?.voter_card_number,
  //           kcc_number: farmerFound?.kcc_number,
  //           user_bank_account_holder: farmerFound?.user_bank_account_holder,
  //           user_bank_account_name: farmerFound?.user_bank_account_name,
  //           user_bank_branch_name: farmerFound?.user_bank_branch_name,
  //           user_bank_account_number: farmerFound?.user_bank_account_number,
  //           user_bank_ifsc_code: farmerFound?.user_bank_ifsc_code,
  //           pension_authority: farmerFound?.pension_details?.pension_authority,
  //           pension_account_no:
  //             farmerFound?.pension_details?.pension_account_no,
  //           effective_from: farmerFound?.pension_details?.effective_from,
  //           pension_amount: farmerFound?.pension_details?.pension_amount,
  //           frequency: farmerFound?.pension_details?.frequency,
  //           company_name: farmerFound?.lic_details?.company_name,
  //           policy_no: farmerFound?.lic_details?.policy_no,
  //           sum_insured: farmerFound?.lic_details?.sum_insured,
  //         }));
  //       }
  //       console.log('admin5');
  //       getState(dbname, lan_id);
  //     }
  //   }
  //   setIsLoading(false);
  // };

  const onPageLoad = async () => {
    setIsLoading(true);

    try {
      const {dbname, lan_id, token} = loginUser_data;

      const curr = await getItem('currency');
      const state = await getItem('state');
      const district = await getItem('district');
      const block = await getItem('block');

      setcurrency(curr);

      setregionaldatas({
        state,
        district,
        block,
      });

      const response = await axiosGet(
        ROUTES.GET.DETAILS_V2({user_id: farmeruserID}),
        token,
        {
          information: `${dbname},${lan_id}`,
        },
      );
      console.log('response', response);
      const farmerFound = response?.data?.data?.[0];
      console.log('farmer==', farmerFound);

      if (!farmerFound) return;

      const yearsDiff =
        new Date().getFullYear() -
        new Date(farmerFound.date_of_birth).getFullYear();

      await getState(dbname, lan_id);

      await getDistrict(
        dbname,
        lan_id,
        farmerFound?.agri_user_addresses?.[0]?.agri_state?.fid,
      );

      await getBlock(
        dbname,
        lan_id,
        farmerFound?.agri_user_addresses?.[0]?.agri_district?.fid,
      );

      const filteredFilesProfile = farmerFound.agri_files.filter(
        file => file.term_type === '1',
      );
      setSelectedImage(filteredFilesProfile[0]?.file_path);

      const values = [...identityProofIdentityPropf];

      farmerFound?.agri_files?.forEach(file => {
        if (file.term_type === 'farmer_address') {
          values[0] = {
            ...values[0],
            uri: file.file_path,
            name: file.file_name,
            type: file.file_ext,
            fileName: file.file_name,
            file_id: file.file_id,
          };
        }

        if (file.term_type === 'farmer_identity') {
          values[1] = {
            ...values[1],
            uri: file.file_path,
            name: file.file_name,
            type: file.file_ext,
            fileName: file.file_name,
            file_id: file.file_id,
          };
        }
      });

      setIdentityProofIdentityPropf(values);

      setFarmerData(prev => ({
        ...prev,
        userName: farmerFound.userName,
        contactNumber: farmerFound.contactNumber,
        gender: farmerFound.gender,
        farmer_type: farmerFound.farmer_type,
        date_of_birth: farmerFound.date_of_birth,
        age: yearsDiff.toString(),

        country: farmerFound?.agri_user_addresses?.[0]?.country,

        state: farmerFound?.agri_user_addresses?.[0]?.agri_state?.fid,
        stateName:
          farmerFound?.agri_user_addresses?.[0]?.agri_state?.state_name,

        district: farmerFound?.agri_user_addresses?.[0]?.agri_district?.fid,
        districtName:
          farmerFound?.agri_user_addresses?.[0]?.agri_district?.district_name,

        block: farmerFound?.agri_user_addresses?.[0]?.agri_subdivision?.fid,
        blockName:
          farmerFound?.agri_user_addresses?.[0]?.agri_subdivision?.subdiv_name,

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
        pension_account_no: farmerFound?.pension_details?.pension_account_no,
        effective_from: farmerFound?.pension_details?.effective_from,
        pension_amount: farmerFound?.pension_details?.pension_amount,
        frequency: farmerFound?.pension_details?.frequency,

        company_name: farmerFound?.lic_details?.company_name,
        policy_no: farmerFound?.lic_details?.policy_no,
        sum_insured: farmerFound?.lic_details?.sum_insured,
      }));

      setIsLoading(false);
    } catch (error) {
      console.log('DETAILS API ERROR', error);

      Toast?.show({
        text:
          error?.response?.data?.error?.errorMessage ||
          'Failed to load user details',
        ...AlertMesg?.[0],
      });

      setIsLoading(false);
    }
  };

  useEffect(() => {
    onPageLoad();
  }, []);
  const handleUserListUpdate = async () => {
    if (farmerData?.stateName == '' || farmerData?.stateName == undefined) {
      Toast.show({text: t('select_state_first'), ...AlertMesg[0]});
    } else if (
      farmerData?.districtName == '' ||
      farmerData?.districtName == undefined
    ) {
      Toast.show({text: t('select_district_first'), ...AlertMesg[0]});
    } else if (
      farmerData?.blockName == '' ||
      farmerData?.blockName == undefined
    ) {
      Toast.show({text: t('select_block_first'), ...AlertMesg[0]});
    } else {
      try {
        setIsLoading(true);
        Keyboard.dismiss();

        const formData = new FormData();
        formData.append('meta', []);
        formData.append('lan_id', lan_id);
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
            uri,
            type,
            name,
          });
        }

        if (
          identityProofIdentityPropf[1]?.fileName != '' &&
          identityProofIdentityPropf[1]?.fileName != ''
        ) {
          const {uri, type, name} = identityProofIdentityPropf[1];
          formDataPlotImg.append('farmer_identity', {
            uri,
            type,
            name,
          });
        }

        formDataPlotImg.append('user_id', farmeruserID);

        let formDataDelete = qs.stringify({
          file_delete_ids: photoDeletedValue.toString(),
        });

        // ✅ 🔥 FIX START (ONLY CHANGE AREA)
        console.log('body', JSON.stringify(formData, token));
        console.log('headers', JSON.stringify(farmeruserID));
        console.log('info', JSON.stringify(dbname));
        console.log('info2', JSON.stringify(lan_id));

        console.log('info3', JSON.stringify(user_id));

        // STEP 1: USER UPDATE FIRST
        const userDataUpdate = await axiosPut(
          ROUTES.PUT.USER_PROFILE_UPDATE({
            user_id: farmeruserID,
          }),
          formData,
          token,
          false,
          {information: `${dbname},${lan_id},${user_id}`},
        );
        console.log(
          'aaaaa',
          dbname,
          lan_id,
          farmeruserID,
          token,
          formDataPlotImg,
        );
        // STEP 2: FILE UPLOAD (DEPENDENT)
        const addIdAddressImgsRes = await onlyUpdateIdAddrFile(
          dbname,
          lan_id,
          farmeruserID,
          token,
          formDataPlotImg,
        );

        // STEP 3: DELETE OLD FILE
        await deletePlotImageAPI(dbname, lan_id, token, formDataDelete);

        // ✅ 🔥 FIX END
        console.log('userDataUpdate', JSON.stringify(userDataUpdate));
        if (userDataUpdate.status === 200) {
          Toast.show({
            text: 'User information update successfully',
            ...AlertMesg[0],
          });

          setTimeout(() => {
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
        setIsLoading(false);
        console.log(error);
      }
    }
  };
  // const handleUserListUpdate = async () => {
  //   if (farmerData?.stateName == '' || farmerData?.stateName == undefined) {
  //     Toast.show({text: t('select_state_first'), ...AlertMesg[0]});
  //   } else if (
  //     farmerData?.districtName == '' ||
  //     farmerData?.districtName == undefined
  //   ) {
  //     Toast.show({text: t('select_district_first'), ...AlertMesg[0]});
  //   } else if (
  //     farmerData?.blockName == '' ||
  //     farmerData?.blockName == undefined
  //   ) {
  //     Toast.show({text: t('select_block_first'), ...AlertMesg[0]});
  //   } else {
  //     try {
  //       setIsLoading(true);
  //       Keyboard.dismiss();
  //       const formData = new FormData();
  //       formData.append('meta', []);
  //       formData.append('lan_id', lan_id);
  //       formData.append('father_name', '');
  //       formData.append('gender', farmerData.gender);
  //       formData.append('cast', '');
  //       formData.append('bankInfo', []);
  //       formData.append(
  //         'addressInfo',
  //         JSON.stringify([
  //           {
  //             country: farmerData.country,
  //             state: farmerData.state,
  //             district: farmerData.district,
  //             subdivision: farmerData.block,
  //           },
  //         ]),
  //       );
  //       formData.append('status', 1);
  //       formData.append('userName', farmerData.userName);
  //       formData.append('date_of_birth', farmerData.date_of_birth);
  //       formData.append('unique_id', '');
  //       formData.append('has_farmer_smart_phone', '');
  //       formData.append('finance_agriculture_campagin', '');
  //       formData.append('financial_or_bank_name', '');
  //       formData.append('bank_account_number', '');
  //       formData.append('financial_entity_name', '');
  //       formData.append('farmer_belongs_name', '');
  //       formData.append('emailId', '');
  //       formData.append('type_percel_ownership_document', '');
  //       formData.append('farmer_belongs_option', '');
  //       formData.append('finance_agriculture_campagin_option', '');
  //       formData.append('faco_value', '');
  //       formData.append('agent_ally', '');
  //       formData.append('aadhar_number', farmerData.aadhar_number);
  //       formData.append('kcc_number', farmerData.kcc_number);
  //       formData.append(
  //         'user_bank_account_holder',
  //         farmerData.user_bank_account_holder,
  //       );
  //       formData.append(
  //         'user_bank_account_name',
  //         farmerData.user_bank_account_name,
  //       );
  //       formData.append(
  //         'user_bank_account_number',
  //         farmerData.user_bank_account_number,
  //       );
  //       formData.append(
  //         'user_bank_branch_name',
  //         farmerData.user_bank_branch_name,
  //       );
  //       formData.append('user_bank_ifsc_code', farmerData.user_bank_ifsc_code);
  //       formData.append(
  //         'pension_details',
  //         JSON.stringify({
  //           pension_authority: farmerData.pension_authority,
  //           pension_account_no: farmerData.pension_account_no,
  //           effective_from: farmerData.effective_from,
  //           pension_amount: farmerData.pension_amount,
  //           frequency: farmerData.frequency,
  //         }),
  //       );
  //       formData.append(
  //         'lic_details',
  //         JSON.stringify({
  //           company_name: farmerData.company_name,
  //           policy_no: farmerData.policy_no,
  //           sum_insured: farmerData.sum_insured,
  //         }),
  //       );
  //       formData.append('pan_number', farmerData.pan_number);
  //       formData.append('voter_card_number', farmerData.voter_card_number);
  //       formData.append('farmer_type', farmerData.farmer_type);
  //       if (myphoto.name != '') {
  //         formData.append('photo', myphoto);
  //       }
  //       const formDataPlotImg = new FormData();

  //       if (
  //         identityProofIdentityPropf[0]?.fileName != '' &&
  //         identityProofIdentityPropf[0]?.fileName != ''
  //       ) {
  //         const {uri, type, name} = identityProofIdentityPropf[0];
  //         formDataPlotImg.append('farmer_address', {
  //           uri: uri,
  //           type: type,
  //           name: name,
  //         });
  //       }
  //       if (
  //         identityProofIdentityPropf[1]?.fileName != '' &&
  //         identityProofIdentityPropf[1]?.fileName != ''
  //       ) {
  //         const {uri, type, name} = identityProofIdentityPropf[1];
  //         formDataPlotImg.append('farmer_identity', {
  //           uri: uri,
  //           type: type,
  //           name: name,
  //         });
  //       }
  //       formDataPlotImg.append('user_id', farmeruserID);
  //       // console.error(farmeruserID)
  //       let formDataDelete = qs.stringify({
  //         file_delete_ids: photoDeletedValue.toString(),
  //       });

  //       const [userDataUpdate, addIdAddressImgsRes] = await Promise.all([
  //         axiosPut(
  //           ROUTES.PUT.USER_PROFILE_UPDATE({
  //             user_id: farmeruserID,
  //           }),
  //           formData,
  //           token,
  //           false,
  //           {information: `${dbname},${lan_id},${user_id}`},
  //         ),
  //         // UserInformationUpdate(
  //         //   dbname,
  //         //   lan_id,
  //         //   user_id,
  //         //   token,
  //         //   farmeruserID,
  //         //   formData,
  //         // ),
  //         onlyUpdateIdAddrFile(
  //           dbname,
  //           lan_id,
  //           farmeruserID,
  //           token,
  //           formDataPlotImg,
  //         ),

  //         deletePlotImageAPI(dbname, lan_id, token, formDataDelete),
  //       ]);

  //       if (userDataUpdate.status === 200) {
  //         Toast.show({
  //           text: 'User information update successfully',
  //           ...AlertMesg[0],
  //         });
  //         setTimeout(() => {
  //           // navigation.navigate('Dashboard');
  //           navigation.dispatch(
  //             CommonActions.reset({
  //               index: 1,
  //               routes: [
  //                 {name: 'Dashboard'},
  //                 {
  //                   name: 'Dashboard',
  //                   params: {pagename: 'Dashboard'},
  //                 },
  //               ],
  //             }),
  //           );
  //         }, 2000);
  //       }
  //       setIsLoading(false);
  //     } catch (error) {
  //       setIsLoading(false);
  //       console.log(error);
  //     }
  //   }
  // };
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
          deletePlotImageAPI(dbname, lan_id, token, formDataDelete),
        ]);
      }
    } catch (error) {
      console.log(error);
    }
  };
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
  const renderCustomHeader = useMemo(
    () => (
      <CustomHeader
        path="userList"
        logoImage={logoImage}
        topBanner={topBanner}
      />
    ),
    [],
  );
  return (
    <SafeAreaView style={{flex: 1}} edges={['top', 'bottom']}>
      <Root>
        <MyErrorBoundary>
          {renderCustomHeader}
          <DatePickerComp
            openDate={open}
            newDate={newdate}
            setOpenDate={setOpen}
            handleDatePicker={handleEffectFrom}
            title={t('effective_from')}
          />
          {isLoading ? (
            <View style={styles.LoadingScreen}>
              <LoadingScreen />
            </View>
          ) : null}
          <ScrollView showsVerticalScrollIndicator={false}>
            <View
              style={{
                backgroundColor: Colors.background,
                flex: 1,
                padding: 16,
              }}>
              <View style={{alignItems: 'center'}}>
                <ImagePlaceHolderCircle
                  openImagePicker={openImagePicker}
                  selectedImage={selectedImage}
                />
              </View>
              <InputTextForm
                label={t('name')}
                required={true}
                value={
                  farmerData.userName == '' ? userName : farmerData.userName
                }
                onChangeText={handleUserNameChange}
                editable={false}
              />
              <InputTextForm
                label={t('new_reg_phone_number')}
                required={true}
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
                  onSelect={() => setFarmerData({...farmerData, gender: '1'})}
                />
                <RadioForm
                  label={t('farmer_reg_female')}
                  selected={
                    farmerData.gender == ''
                      ? gender === '2'
                      : farmerData.gender == '2'
                  }
                  onSelect={() => setFarmerData({...farmerData, gender: '2'})}
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
                    setFarmerData({...farmerData, farmer_type: '1'})
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
                    setFarmerData({...farmerData, farmer_type: '2'})
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
                    setFarmerData({...farmerData, farmer_type: '3'})
                  }
                />
              </View>
              <InputTextForm
                label={t('age')}
                value={farmerData.age ?? farmerData.age}
                keyboardType="numeric"
                editable={false}
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
                  regionaldatas.state == ''
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
                  setFarmerData(prev => ({
                    ...prev,
                    block: item.value,
                    blockName: item.label,
                  }));
                }}
                val={farmerData.blockName}
              />

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
                farmerName={farmerData.userName}
                ai_camera_id_proof={dbLanTokUsr?.ai_camera_id_proof}
              />

              <View
                style={{
                  borderWidth: 1,
                  borderColor: Colors.border,
                  borderRadius: 8,
                  marginTop: 10,
                }}>
                <View style={{marginTop: 20, marginHorizontal: 15}}>
                  <>
                    <Text style={styles.title}>
                      {t('different_identity_number')}
                    </Text>
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

              <View
                style={{
                  borderWidth: 1,
                  borderColor: Colors.border,
                  borderRadius: 8,
                  marginTop: 10,
                }}>
                <View style={{marginTop: 20, marginHorizontal: 15}}>
                  <>
                    <Text style={styles.title}>
                      {t('bank_account_details')}
                    </Text>
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
              <View
                style={{
                  borderWidth: 1,
                  borderColor: Colors.border,
                  borderRadius: 8,
                  marginTop: 10,
                }}>
                <View style={{marginTop: 20, marginHorizontal: 15}}>
                  <>
                    <Text style={styles.title}>{t('pension_details')}</Text>
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
                    <DatePickerField
                      labelColor={Colors.black}
                      label={t('effective_from')}
                      value={farmerData.effective_from}
                      onPress={handleEffectFromField}
                    />

                    <InputTextForm
                      label={
                        t('pension_amount_currency') + '(' + currency + ')'
                      }
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
              <View
                style={{
                  borderWidth: 1,
                  borderColor: Colors.border,
                  borderRadius: 8,
                  marginTop: 10,
                }}>
                <View style={{marginTop: 20, marginHorizontal: 15}}>
                  <>
                    <Text style={styles.title}>
                      {t('life_insurance_details')}
                    </Text>
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
                      label={t('sum_insured_currency') + '(' + currency + ')'}
                      onChangeText={handleSumInsuredChange}
                      value={farmerData.sum_insured}
                      keyboardType="numeric"
                    />
                  </>
                </View>
              </View>
            </View>
          </ScrollView>
          <ButtonForm
            label={t('submit')}
            onPress={() => handleUserListUpdate()}
            loading={isLoading}
          />
        </MyErrorBoundary>
      </Root>
    </SafeAreaView>
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
