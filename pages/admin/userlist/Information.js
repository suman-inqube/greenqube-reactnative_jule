import React, {
  useReducer,
  useState,
  useEffect,
  useMemo,
  useCallback,
  useContext,
} from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Keyboard,
} from 'react-native';
import { useRoute, useNavigation, CommonActions } from '@react-navigation/native';
import DatePicker from 'react-native-date-picker';
import { launchImageLibrary } from 'react-native-image-picker';
import DocumentPicker, { types } from 'react-native-document-picker';

import ImageForm from '../../Common/ImageForm';
import ProofAndIdentityPropfComp from '../../Common/ProofAndIdentityPropfComp';
import LoadingScreen from '../../Common/LoadingScreen';
import {
  fetchBlockAPI,
  fetchDistrictAPI,
  fetchStateAPI,
  UserInformationUpdate,
} from './UsersAPI';
import { deletePlotImageAPI } from '../Loan/LoanAPI';
import { onlyUpdateIdAddrFile } from '../../../config/apiHere';

import config from '../../../config';
import { userCreateContext } from '../../Context/usersCreateContext';
import { Colors } from '../../utils/Constants';
import RadioForm from '../../Common/RadioForm';
const qs = require('qs');

/* ----------------------------- UI SUB-COMPONENTS ---------------------------- */

const SectionCard = React.memo(({ title, children, style }) => (
  <View style={[styles.card, style]}>
    {title ? <Text style={styles.cardTitle}>{title}</Text> : null}
    <View style={styles.cardBody}>{children}</View>
  </View>
));

const RadioGroup = React.memo(({ label, options, value, onChange }) => (
  <View style={{ marginTop: 6 }}>
    {label ? <Text style={styles.sectionLabel}>{label}</Text> : null}
    {options.map(opt => (<RadioForm
     key={opt.value}
      label={opt.label}
      selected={value === opt.value }
      onSelect={() => onChange(opt.value)}
    />))}
  </View>
));

/* ----------------------------- REDUCER & STATE ------------------------------ */

const initialFilesState = [
  // 0: address proof
  { uri: '', name: '', type: '', fileName: '', imageType: 'address', file_path: '', file_id: '', id: '' },
  // 1: identity proof
  { uri: '', name: '', type: '', fileName: '', imageType: 'identity', file_path: '', file_id: '', id: '' },
];

const initialFormState = {
  userName: '',
  contactNumber: '',
  gender: '',
  farmer_type: '',
  age: '',
  country: '',
  state: '',
  stateName: '',
  district: '',
  districtName: '',
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
};

function formReducer(state, action) {
  switch (action.type) {
    case 'SET_BULK':
      return { ...state, ...action.payload };
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };
    case 'RESET_LOCATION':
      return {
        ...state,
        state: action.stateId ?? '',
        stateName: action.stateName ?? '',
        district: '',
        districtName: '',
        block: '',
        blockName: '',
      };
    case 'RESET_DISTRICT':
      return {
        ...state,
        district: action.districtId ?? '',
        districtName: action.districtName ?? '',
        block: '',
        blockName: '',
      };
    default:
      return state;
  }
}

/* --------------------------------- SCREEN ---------------------------------- */

const Information = () => {
  const {
    t,
    AlertMesg,
    onBackPress,
    getItem,
    logoImage,
    topBanner,
    Root,
    Toast,
    CustomHeader,
    ButtonForm,
    InputTextForm,
    DropdownForm,
    ImagePlaceHolderCircle,
    effective_dates,
    loginUser_data,
  } = useContext(userCreateContext);

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

  const [form, dispatch] = useReducer(formReducer, initialFormState);
  const [identityProofs, setIdentityProofs] = useState(initialFilesState);

  const [newDate, setNewDate] = useState(new Date());
  const [dateOpen, setDateOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [dbName, setDbName] = useState();
  const [languageID, setLanguageID] = useState();
  const [loginUserId, setLoginUserId] = useState('');
  const [loginUserToken, setLoginUserToken] = useState('');

  const [stateAll, setStateAll] = useState([]);
  const [districtAll, setDistrictAll] = useState([]);
  const [blockAll, setBlockAll] = useState([]);

  const [selectedImage, setSelectedImage] = useState(null);
  const [myPhoto, setMyPhoto] = useState({ uri: '', type: '', name: '' });

  const [regional, setRegional] = useState({ state: '', district: '', block: '' });
  const [currency, setCurrency] = useState('');
  const [photoDeletedValue, setPhotoDeletedValue] = useState([]);

  /* ----------------------------- MEMOIZED LABELS ---------------------------- */

  const genderOptions = useMemo(
    () => [
      { label: t('farmer_reg_male'), value: '1' },
      { label: t('farmer_reg_female'), value: '2' },
    ],
    [t]
  );

  const farmerTypeOptions = useMemo(
    () => [
      { label: t('grower'), value: '1' },
      { label: t('small_holder'), value: '2' },
      { label: t('farm_worker'), value: '3' },
    ],
    [t]
  );

  /* --------------------------------- HELPERS -------------------------------- */

  const openImagePicker = useCallback(() => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        includeBase64: true,
        maxHeight: 512,
        maxWidth: 512,
        quality: 0.85,
      },
      res => {
        if (res?.assets?.[0]) {
          const a = res.assets[0];
          setMyPhoto({ uri: a.uri, type: a.type, name: a.fileName || 'profile.jpg' });
          setSelectedImage(a.uri || a.base64);
        }
      }
    );
  }, []);

  const getStates = useCallback(async (_db, _lan) => {
    const response = await fetchStateAPI(_db, _lan);
    if (response?.status === 200) {
      const rows = response?.data?.data?.rows || [];
      setStateAll(rows.map(r => ({ value: r?.fid, label: r?.state_name })));
    }
  }, []);

  const getDistricts = useCallback(async (_db, _lan, stateID) => {
    const response = await fetchDistrictAPI(_db, _lan, stateID);
    if (response?.status === 200) {
      const rows = response?.data?.data?.rows || [];
      setDistrictAll(rows.map(r => ({ value: r?.fid, label: r?.district_name })));
    } else {
      setDistrictAll([]);
    }
  }, []);

  const getBlocks = useCallback(async (_db, _lan, districtID) => {
    const response = await fetchBlockAPI(_db, _lan, districtID);
    if (response?.status === 200) {
      const rows = response?.data?.data?.rows || [];
      setBlockAll(rows.map(r => ({ value: r?.fid, label: r?.subdiv_name })));
    } else {
      setBlockAll([]);
    }
  }, []);

  const handleStateDistrictBlock = useCallback(
    async (kind, data) => {
      if (kind === 'state') {
        dispatch({ type: 'RESET_LOCATION', stateId: data.value, stateName: data.label });
        await getDistricts(dbName, languageID, data.value);
        setBlockAll([]); // clear blocks until district selected
      } else if (kind === 'district') {
        dispatch({ type: 'RESET_DISTRICT', districtId: data.value, districtName: data.label });
        await getBlocks(dbName, languageID, data.value);
      }
    },
    [dbName, languageID, getDistricts, getBlocks]
  );

  const handleEffectFrom = useCallback(
    (date) => dispatch({ type: 'SET_FIELD', field: 'effective_from', value: effective_dates(date) }),
    [effective_dates]
  );

  const computeAge = useCallback((dobStr) => {
    if (!dobStr) return '';
    const dob = new Date(dobStr);
    const now = new Date();
    let age = now.getFullYear() - dob.getFullYear();
    const m = now.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--;
    return String(age);
  }, []);

  /* -------------------------------- PAGE INIT ------------------------------- */

  const onPageLoad = useCallback(async () => {
    setIsLoading(true);
    try {
      const [userListData, state, district, block, curr] = await Promise.all([
        getItem('userListData'),
        getItem('state'),
        getItem('district'),
        getItem('block'),
        getItem('currency'),
      ]);

      if (!loginUser_data) return;

      setCurrency(curr);
      const { dbname, lan_id, token, user_id } = loginUser_data;

      setRegional({ state, district, block });
      setDbName(dbname);
      setLanguageID(lan_id);
      setLoginUserId(user_id);
      setLoginUserToken(token);

      await getStates(dbname, lan_id);

      // Pre-fill from cached list
      if (userListData) {
        const farmerFound = userListData?.find(u => u.user_id === farmeruserID);
        if (farmerFound) {
          // prefetch district & block options if we have location data
          const addr = farmerFound?.agri_user_addresses?.[0];
          const stateFid = addr?.agri_state?.fid;
          const districtFid = addr?.agri_district?.fid;

          if (stateFid) await getDistricts(dbname, lan_id, stateFid);
          if (districtFid) await getBlocks(dbname, lan_id, districtFid);

          // profile image
          const profile = (farmerFound?.agri_files || []).filter(f => f.term_type === '1');
          if (profile?.[0]?.file_path) setSelectedImage(profile[0].file_path);

          // identity/address proofs
          const nextProofs = [...initialFilesState];
          (farmerFound?.agri_files || [])
            .filter(f => f.term_type === 'farmer_address')
            .forEach(f => {
              nextProofs[0] = {
                ...nextProofs[0],
                uri: f.file_path,
                name: f.file_name,
                type: f.file_ext,
                imageType: 'address',
                fileName: f.file_name,
                file_id: f.file_id,
                id: f.file_id,
              };
            });

          (farmerFound?.agri_files || [])
            .filter(f => f.term_type === 'farmer_identity')
            .forEach(f => {
              nextProofs[1] = {
                ...nextProofs[1],
                uri: f.file_path,
                name: f.file_name,
                type: f.file_ext,
                imageType: 'identity',
                fileName: f.file_name,
                file_id: f.file_id,
                id: f.file_id,
              };
            });

          setIdentityProofs(nextProofs);

          // form data
          const age = computeAge(farmerFound?.date_of_birth);
          dispatch({
            type: 'SET_BULK',
            payload: {
              userName: farmerFound?.userName,
              contactNumber: farmerFound?.contactNumber,
              gender: farmerFound?.gender,
              farmer_type: farmerFound?.farmer_type,
              date_of_birth: farmerFound?.date_of_birth,
              age,

              country: addr?.country,
              state: addr?.agri_state?.fid,
              stateName: addr?.agri_state?.state_name,
              district: addr?.agri_district?.fid,
              districtName: addr?.agri_district?.district_name,
              block: addr?.agri_subdivision?.fid,
              blockName: addr?.agri_subdivision?.subdiv_name,

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
            },
          });
        } else {
          // fallback for name/phone passed from params
          dispatch({
            type: 'SET_BULK',
            payload: {
              userName: userName || '',
              contactNumber: contactNumber || '',
              gender: gender || '',
              farmer_type: farmer_type || '',
            },
          });
        }
      }
    } catch (err) {
      Toast.show({ text: t('something_wrong_try_again'), ...AlertMesg[1] });
      console.log('onPageLoad error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [
    loginUser_data,
    getItem,
    getStates,
    getDistricts,
    getBlocks,
    farmeruserID,
    t,
    AlertMesg,
    Toast,
    userName,
    contactNumber,
    gender,
    farmer_type,
    computeAge,
  ]);

  useEffect(() => {
    setSelectedImage(null);
    onPageLoad();
    const unsub = onBackPress(() => {
      navigation.navigate('userList');
      return true;
    });
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, [onPageLoad, onBackPress, navigation]);

  /* ----------------------------- FILE HANDLERS ------------------------------ */

  const handleDocumentSelection = useCallback(async (imageType, index) => {
    try {
      const response = await DocumentPicker.pick({
        presentationStyle: 'fullScreen',
        type: [types.pdf, types.images],
      });

      if (!response?.[0]) return;

      const next = [...identityProofs];
      const prevId = next[index]?.file_id;

      // If replacing an existing uploaded file, mark it for deletion
      if (prevId && !photoDeletedValue.includes(prevId)) {
        setPhotoDeletedValue(prev => [...prev, prevId]);
      }

      next[index] = {
        ...next[index],
        uri: response[0].uri,
        name: response[0].name,
        type: response[0].type,
        fileName: response[0].name,
        imageType,
        file_path: '',
        file_id: '',
      };
      setIdentityProofs(next);
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        Toast.show({ text: t('file_pick_error'), ...AlertMesg[1] });
        console.log(err);
      }
    }
  }, [identityProofs, photoDeletedValue, t, Toast, AlertMesg]);

  const handleDocumentSelectionRemove = useCallback(async (index) => {
    try {
      const next = [...identityProofs];
      const fileId = next[index]?.file_id;

      // reset local item
      next[index] = {
        ...next[index],
        uri: '',
        name: '',
        type: '',
        fileName: '',
        imageType: index === 0 ? 'address' : 'identity',
        file_path: '',
        file_id: '',
      };
      setIdentityProofs(next);

      // if server file existed, delete immediately
      if (fileId) {
        const formDataDelete = qs.stringify({ file_delete_ids: fileId.toString() });
        await deletePlotImageAPI(dbName, languageID, loginUserToken, formDataDelete);
      }
    } catch (error) {
      Toast.show({ text: t('file_delete_error'), ...AlertMesg[1] });
      console.log(error);
    }
  }, [identityProofs, dbName, languageID, loginUserToken, t, Toast, AlertMesg]);

  /* ------------------------------- SUBMIT ----------------------------------- */

  const handleSubmit = useCallback(async () => {
    // basic guards (use server-side validation as source of truth)
    if (!form.stateName) {
      return Toast.show({ text: t('select_state_first'), ...AlertMesg[0] });
    }
    if (!form.districtName) {
      return Toast.show({ text: t('select_district_first'), ...AlertMesg[0] });
    }
    if (!form.blockName) {
      return Toast.show({ text: t('select_block_first'), ...AlertMesg[0] });
    }

    try {
      setIsLoading(true);
      Keyboard.dismiss();

      const formData = new FormData();
      formData.append('meta', []);
      formData.append('lan_id', languageID);
      formData.append('father_name', '');
      formData.append('gender', form.gender);
      formData.append('cast', '');
      formData.append('bankInfo', []);
      formData.append(
        'addressInfo',
        JSON.stringify([{ country: form.country, state: form.state, district: form.district, subdivision: form.block }])
      );
      formData.append('status', 1);
      formData.append('userName', form.userName);
      formData.append('date_of_birth', form.date_of_birth);
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

      formData.append('aadhar_number', form.aadhar_number);
      formData.append('kcc_number', form.kcc_number);

      formData.append('user_bank_account_holder', form.user_bank_account_holder);
      formData.append('user_bank_account_name', form.user_bank_account_name);
      formData.append('user_bank_account_number', form.user_bank_account_number);
      formData.append('user_bank_branch_name', form.user_bank_branch_name);
      formData.append('user_bank_ifsc_code', form.user_bank_ifsc_code);

      formData.append('pension_details', JSON.stringify({
        pension_authority: form.pension_authority,
        pension_account_no: form.pension_account_no,
        effective_from: form.effective_from,
        pension_amount: form.pension_amount,
        frequency: form.frequency,
      }));

      formData.append('lic_details', JSON.stringify({
        company_name: form.company_name,
        policy_no: form.policy_no,
        sum_insured: form.sum_insured,
      }));

      formData.append('pan_number', form.pan_number);
      formData.append('voter_card_number', form.voter_card_number);
      formData.append('farmer_type', form.farmer_type);

      if (myPhoto?.name) formData.append('photo', myPhoto);

      // Files formData
      const filesFd = new FormData();
      if (identityProofs[0]?.fileName) {
        const { uri, type, name } = identityProofs[0];
        filesFd.append('farmer_address', { uri, type, name });
      }
      if (identityProofs[1]?.fileName) {
        const { uri, type, name } = identityProofs[1];
        filesFd.append('farmer_identity', { uri, type, name });
      }
      filesFd.append('user_id', farmeruserID);
      const formDataDelete = qs.stringify({
        file_delete_ids: (photoDeletedValue || []).toString(),
      });
      const [updateRes] = await Promise.all([
        UserInformationUpdate(dbName, languageID, loginUserId, loginUserToken, farmeruserID, formData),
        onlyUpdateIdAddrFile(dbName, languageID, farmeruserID, loginUserToken, filesFd),
        deletePlotImageAPI(dbName, languageID, loginUserToken, formDataDelete),
      ]);
      if (updateRes?.status === 200) {
        Toast.show({ text: t('user_information_update_success') || 'User information updated successfully', ...AlertMesg[0] });
        navigation.dispatch(
          CommonActions.reset({
            index: 1,
            routes: [
              { name: 'Dashboard' },
              { name: 'Dashboard', params: { pagename: 'Dashboard' } },
            ],
          })
        );
      } else {
        Toast.show({ text: t('update_failed_try_again'), ...AlertMesg[1] });
      }
    } catch (error) {
      console.log('Update error:', error);
      Toast.show({ text: t('update_failed_try_again'), ...AlertMesg[1] });
    } finally {
      setIsLoading(false);
    }
  }, [
    form,
    languageID,
    myPhoto,
    identityProofs,
    photoDeletedValue,
    farmeruserID,
    dbName,
    loginUserId,
    loginUserToken,
    Toast,
    t,
    AlertMesg,
    navigation,
  ]);

  /* ---------------------------------- UI ------------------------------------ */

  return (
    <Root>
      <CustomHeader
        path="userList"
        HandlerGoBack={() => navigation.navigate('userList')}
        logoImage={logoImage}
        topBanner={topBanner}
      />

      {isLoading ? (
        <View style={styles.loadingOverlay}>
          <LoadingScreen />
        </View>
      ) : null}
      <View style={{ flex: 1, backgroundColor: Colors.background_light }}>
        <View style={styles.container}>
          <ScrollView
            // contentContainerStyle={styles.container}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <SectionCard >
              <View style={{ alignItems: 'center', marginBottom: 8 }}>
                <ImagePlaceHolderCircle openImagePicker={openImagePicker} selectedImage={selectedImage || profileImage} />
              </View>

              <InputTextForm
                label={t('name')}
                value={form.userName || userName}
                editable={false}
              />
              <InputTextForm
                label={t('new_reg_phone_number')}
                value={form.contactNumber || contactNumber}
                editable={false}
              />

              <RadioGroup
                label={t('farmer_reg_gnd')}
                options={genderOptions}
                value={form.gender || gender}
                onChange={val => dispatch({ type: 'SET_FIELD', field: 'gender', value: val })}
              />

              <RadioGroup
                label={t('far_reg_far_type')}
                options={farmerTypeOptions}
                value={form.farmer_type || farmer_type}
                onChange={val => dispatch({ type: 'SET_FIELD', field: 'farmer_type', value: val })}
              />

              <InputTextForm
                label={t('age')}
                value={form.age}
                keyboardType="numeric"
                editable={false}
              />

              {/* Location */}
              <DropdownForm
                label={regional.state ? t(`${regional.state}`) : t('pre_state_division_zone')}
                data={stateAll}
                onChange={d => handleStateDistrictBlock('state', d)}
                val={form.stateName}
              />
              <DropdownForm
                label={regional.district ? t(`${regional.district}`) : t('pre_district_county')}
                data={districtAll}
                onChange={d => handleStateDistrictBlock('district', d)}
                val={form.districtName}
              />
              <DropdownForm
                label={regional.block ? t(`${regional.block}`) : t('select_block_sub_county_upzila')}
                data={blockAll}
                onChange={item => dispatch({ type: 'SET_BULK', payload: { block: item.value, blockName: item.label } })}
                val={form.blockName}
              />

              <ProofAndIdentityPropfComp
                identityProofIdentityPropf={identityProofs}
                t={t}
                title={t('address_proofAndIdentityPropf')}
                setStateValue={setIdentityProofs}
                stateValue={identityProofs}
                photoDeletedValue={photoDeletedValue}
                setPhotoDeletedValue={setPhotoDeletedValue}
                loginUser_data={loginUser_data}
                disable={true}
                InputTextFormEdit={true}
                handleDocumentSelection={handleDocumentSelection}
                handleDocumentSelectionRemove={handleDocumentSelectionRemove}
              />
            </SectionCard>

            <SectionCard title={t('different_identity_number')}>
              <InputTextForm
                label={t('adhar_no')}
                value={form.aadhar_number}
                keyboardType="numeric"
                onChangeText={v => dispatch({ type: 'SET_FIELD', field: 'aadhar_number', value: v })}
              />
              <InputTextForm
                label={t('pan_no')}
                value={form.pan_number}
                onChangeText={v => dispatch({ type: 'SET_FIELD', field: 'pan_number', value: v })}
              />
              <InputTextForm
                label={t('voter_card_no')}
                value={form.voter_card_number}
                onChangeText={v => dispatch({ type: 'SET_FIELD', field: 'voter_card_number', value: v })}
              />
              <InputTextForm
                label={t('kcc_no')}
                value={form.kcc_number}
                onChangeText={v => dispatch({ type: 'SET_FIELD', field: 'kcc_number', value: v })}
              />
            </SectionCard>

            <SectionCard title={t('bank_account_details')}>
              <InputTextForm
                label={t('account_holder_name')}
                value={form.user_bank_account_holder}
                onChangeText={v => dispatch({ type: 'SET_FIELD', field: 'user_bank_account_holder', value: v })}
              />
              <InputTextForm
                label={t('farmer_reg_bankifsc')}
                value={form.user_bank_account_name}
                onChangeText={v => dispatch({ type: 'SET_FIELD', field: 'user_bank_account_name', value: v })}
              />
              <InputTextForm
                label={t('branch_name')}
                value={form.user_bank_branch_name}
                onChangeText={v => dispatch({ type: 'SET_FIELD', field: 'user_bank_branch_name', value: v })}
              />
              <InputTextForm
                label={t('bank_account')}
                value={form.user_bank_account_number}
                keyboardType="numeric"
                onChangeText={v => dispatch({ type: 'SET_FIELD', field: 'user_bank_account_number', value: v })}
              />
              <InputTextForm
                label={t('ifsc_no')}
                value={form.user_bank_ifsc_code}
                onChangeText={v => dispatch({ type: 'SET_FIELD', field: 'user_bank_ifsc_code', value: v })}
              />
            </SectionCard>

            <SectionCard title={t('pension_details')}>
              <InputTextForm
                label={t('pension_providing_authority')}
                value={form.pension_authority}
                onChangeText={v => dispatch({ type: 'SET_FIELD', field: 'pension_authority', value: v })}
              />

              <InputTextForm
                label={t('pension_account_number')}
                value={form.pension_account_no}
                keyboardType="numeric"
                onChangeText={v => dispatch({ type: 'SET_FIELD', field: 'pension_account_no', value: v })}
              />

              <Text style={styles.smallLabel}>{t('effective_from')}</Text>
              <View style={styles.dateRow}>
                <TouchableOpacity style={styles.dateInput} onPress={() => setDateOpen(true)} activeOpacity={0.8}>
                  <Text style={styles.dateText}>{form.effective_from || t('select')}</Text>
                  <TouchableOpacity onPress={() => setDateOpen(true)}>
                    <ImageForm
                      source={require('../../Common/images/calendar.png')}
                      resizeMode="cover"
                      height={28}
                      width={28}
                    />
                  </TouchableOpacity>
                </TouchableOpacity>

                <DatePicker
                  modal
                  mode="date"
                  open={dateOpen}
                  date={newDate}
                  onConfirm={(d) => {
                    setNewDate(d);
                    handleEffectFrom(d);
                    setDateOpen(false);
                  }}
                  onCancel={() => setDateOpen(false)}
                />
              </View>

              <InputTextForm
                label={`${t('pension_amount_currency')} (${currency || ''})`}
                value={form.pension_amount}
                keyboardType="numeric"
                onChangeText={v => dispatch({ type: 'SET_FIELD', field: 'pension_amount', value: v })}
              />

              <DropdownForm
                label={t('per_month_quarter_year')}
                data={config.pensionParMonthData}
                onChange={v => dispatch({ type: 'SET_FIELD', field: 'frequency', value: v.value })}
                val={form.frequency}
              />
            </SectionCard>

            <SectionCard title={t('life_insurance_details')}>
              <InputTextForm
                label={t('lic_name_of_company')}
                value={form.company_name}
                onChangeText={v => dispatch({ type: 'SET_FIELD', field: 'company_name', value: v })}
              />
              <InputTextForm
                label={t('policy_number')}
                value={form.policy_no}
                keyboardType="numeric"
                onChangeText={v => dispatch({ type: 'SET_FIELD', field: 'policy_no', value: v })}
              />
              <InputTextForm
                label={`${t('sum_insured_currency')} (${currency || ''})`}
                value={form.sum_insured}
                keyboardType="numeric"
                onChangeText={v => dispatch({ type: 'SET_FIELD', field: 'sum_insured', value: v })}
              />
            </SectionCard>
          </ScrollView>
        </View>
      </View>
      <ButtonForm label={t('submit')} onPress={handleSubmit} loading={isLoading} />
    </Root>
  );
};

export default Information;

/* -------------------------------- STYLES ----------------------------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    // paddingBottom: 24,
    backgroundColor: Colors.background,
    // padding: 10,
    borderRadius: 8,

    margin: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  card: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    paddingTop: 16,
    paddingBottom: 6,
    // paddingHorizontal: 16,
    // elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    marginTop: 16,

  },
  cardTitle: {
    color: '#2F3E2F',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
  },
  cardBody: {
    marginTop: 8,
  },
  sectionLabel: {
    fontSize: 16,
    color: '#1E1E1E',
    marginBottom: 6,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  radioOuter: {
    height: 18,
    width: 18,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#8ABF3A',
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterActive: {
    borderColor: '#4E9F3D',
  },
  radioInner: {
    height: 8,
    width: 8,
    borderRadius: 6,
    backgroundColor: '#4E9F3D',
  },
  radioLabel: {
    color: '#333',
    fontSize: 15,
  },
  smallLabel: {
    marginBottom: 6,
    marginLeft: 6,
    color: '#000',
  },
  dateRow: {
    alignItems: 'center',
    marginBottom: 12,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderColor: '#D0D5DD',
    borderWidth: 1,
    borderRadius: 10,
    width: '100%',
    paddingHorizontal: 10,
    backgroundColor: '#FFFFFF',
    height: 44,
    marginBottom: 10,
  },
  dateText: {
    color: '#000',
  },
  loadingOverlay: {
    position: 'absolute',
    top: '50%',
    alignSelf: 'center',
    zIndex: 20,
  },
});
