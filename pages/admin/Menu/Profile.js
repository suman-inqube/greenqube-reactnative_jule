import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Image,
  BackHandler,
} from 'react-native';
import React, { useState, useEffect, useCallback, useContext } from 'react';
import { userDetailAPI } from '../../../config/apiHere';
import MessageDialog from '../../Common/MessageDialog';
import { Colors } from '../../utils/Constants';
import {
  updateUserInfoAPI,
  districtDataListAPI1,
  blockDataListAPI1,
  firstLanguageListAPI,
  stateListAPI,
  locDiffLang,
} from '../../../config/apiHere';
import {
  useNavigation,
  useIsFocused,
  CommonActions,
} from '@react-navigation/native';
import { userCreateContext } from '../../Context/usersCreateContext';
import LoadingScreen from '../../Common/LoadingScreen';
import FarmerDrawerScreenWrapper1 from '../FarmerDrawerScreenWrapper1';
import DatePickerField from '../../Common/DatePickerField';
const Profile = () => {
  //GQR-67
  const {
    loginUser_data,
    CustomHeader,
    t,
    AlertMesg,
    getItem,
    removeItem,
    logoImage,
    topBanner,
    Root,
    Toast,
    InputTextForm,
    DropdownForm,
    ButtonForm,
  } = useContext(userCreateContext);
  const { dbname, lan_id, token, user_id } = loginUser_data;
  //GQR-67
  const isFocused = useIsFocused();
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation();
  const [languageData, setlanguageData] = useState([]);
  const [stateInfoData, setstateInfoData] = useState([]);
  const [districtData, setDistrictData] = useState([]);
  const [blockData, setBlockData] = useState([]);
  const [storePersnolInfo, setstorePersnolInfo] = useState({
    block: '',
    blockName: '',
    contactNumber: '',
    date_of_birth: '',
    district: '',
    districtName: '',
    langId: '',
    langIdName: '',
    locale: '',
    state: '',
    stateName: '',
    userId: '',
    userName: '',
  });
  const [regionaldatas, setregionaldatas] = useState({
    state: '',
    district: '',
    block: '',
  });
  const handleSave = async () => {
    addressInfo = [
      {
        country: '1',
        state: storePersnolInfo.state,
        district: storePersnolInfo.district,
        subdivision: storePersnolInfo.block,
      },
    ];
    if (storePersnolInfo.stateName == '') {
      Toast.show({ text: `${t('please_select_state_first')}`, ...AlertMesg[0] });
    } else if (storePersnolInfo.districtName == '') {
      Toast.show({ text: `${t('please_select_zila_first')}`, ...AlertMesg[0] });
    } else if (storePersnolInfo.blockName == '') {
      Toast.show({ text: `${t('select_block_first')}`, ...AlertMesg[0] });
    } else {
      const formData = new FormData();
      formData.append('lan_id', storePersnolInfo.langId);
      formData.append('addressInfo', JSON.stringify(addressInfo));
      formData.append('status', '1');
      formData.append('userName', storePersnolInfo.userName);
      formData.append('date_of_birth', storePersnolInfo.date_of_birth);
      let submitRes = await updateUserInfoAPI(
        dbname,
        storePersnolInfo.language,
        storePersnolInfo.userId,
        token,
        formData,
      );

      if (submitRes?.status === 200) {
        Toast.show({
          text: `${t('Data_submitted_successfully')}`,
          ...AlertMesg[0],
        });
        handleLogout();
        setTimeout(() => {
          navigation.navigate('Login', {
            pagename: 'Login',
            locale: storePersnolInfo.langIdName,
          });
        }, 1500);
      } else {
        // MessageDialog({ title: 'Error', message: error.response.data.error.errorMessage })
        Toast.show({
          text: error.response.data.error.errorMessage,
          ...AlertMesg[0],
        });
        handleLogout();
        navigation.navigate('Login', { pagename: 'Login' });
      }
    }
  };
  let languageDataList = async dbname => {
    try {
      let language_res = await firstLanguageListAPI(dbname);
      if (language_res?.status == 200) {
        let languageArray = language_res?.data?.data?.map(data => ({
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
  const handleLanguage = async language => {
    const { block, district, state } = storePersnolInfo;
    const locDiffLangRes = await locDiffLang(
      dbname,
      language.value,
      token,
      state,
      district,
      block,
    );
    if (locDiffLangRes?.status == 200) {
      const { distData, stateData, subdivData } =
        locDiffLangRes?.data?.data || {};
      await Promise.all([
        stateInfoDataList(dbname, language.value, token),
        districtDataList(dbname, language.value, stateData.fid),
        blockDataList(dbname, language.value, distData.fid),
      ]);
      setstorePersnolInfo({
        ...storePersnolInfo,
        langId: language.value,
        locale: language.sName,
        block: subdivData?.fid,
        blockName: subdivData?.subdiv_name,
        district: distData?.fid,
        districtName: distData?.district_name,
        state: stateData?.fid,
        stateName: stateData?.state_name,
      });
    }
  };
  let stateInfoDataList = async (dbname, language, token) => {
    try {
      let state_res = await stateListAPI(dbname, language, token);
      if (state_res?.status == 200) {
        let stateArray = state_res?.data?.data?.rows?.map(data => ({
          value: data?.fid,
          label: data?.state_name,
        }));
        setstateInfoData(stateArray);
      }
    } catch (error) {
      console.log('Error in state API', error.response);
    }
  };
  const handleStateInfo = state => {
    setstorePersnolInfo({
      ...storePersnolInfo,
      state: state.value,
      stateName: state.label,
      block: '',
      blockName: '',
      district: '',
      districtName: '',
    });
    districtDataList(dbname, storePersnolInfo.langId, state.value);
  };
  let districtDataList = async (dbname, language, state) => {
    try {
      setIsLoading(true);
      let district_res = await districtDataListAPI1(dbname, language, state);
      if (district_res?.status == 200) {
        let districtArray = district_res?.data?.data?.rows?.map(data => ({
          value: data?.fid,
          label: data?.district_name,
        }));
        setDistrictData(districtArray);
      }
      setIsLoading(false);
    } catch (error) {
      console.log('Error in district API', error.response.data);
    }
  };
  const handleDistrict = district => {
    setstorePersnolInfo({
      ...storePersnolInfo,
      district: district.value,
      districtName: district.label,
      block: '',
      blockName: '',
    });
    blockDataList(dbname, storePersnolInfo.langId, district.value);
  };
  let blockDataList = async (dbname, language, district) => {
    try {
      setIsLoading(true);
      let block_res = await blockDataListAPI1(dbname, language, district);
      if (block_res?.status == 200) {
        let blocktArray = block_res?.data?.data?.rows?.map(data => ({
          value: data?.fid,
          label: data?.subdiv_name,
        }));
        setBlockData(blocktArray);
      }
      setIsLoading(false);
    } catch (error) {
      console.log('Error in Block API', error).response;
    }
  };
  const userDetails = async (dbname, languageId, token, user_id) => {
    try {
      setIsLoading(true);
      let response = await userDetailAPI(dbname, languageId, token, user_id);
      console.log('response', response.status);
      if (response?.status == 200) {
        setstorePersnolInfo({
          ...storePersnolInfo,
          userId: user_id,
          userName: response?.data?.data[0]?.userName,
          contactNumber: response?.data?.data[0]?.contactNumber,
          date_of_birth: response?.data?.data[0]?.date_of_birth,
          langId: response?.data?.data[0]?.agri_language.id,
          langIdName: response?.data?.data[0]?.agri_language.name,
          locale: response?.data?.data[0]?.agri_language.sname,
          state:
            response?.data?.data[0]?.agri_user_addresses[0]?.agri_state?.fid,
          stateName:
            response?.data?.data[0]?.agri_user_addresses[0]?.agri_state
              ?.state_name,
          district:
            response?.data?.data[0]?.agri_user_addresses[0]?.agri_district?.fid,
          districtName:
            response?.data?.data[0]?.agri_user_addresses[0]?.agri_district
              ?.district_name,
          block:
            response?.data?.data[0]?.agri_user_addresses[0]?.agri_subdivision
              ?.fid,
          blockName:
            response?.data?.data[0]?.agri_user_addresses[0]?.agri_subdivision
              ?.subdiv_name,
        });
        languageDataList(dbname);
        if (response?.data?.data[0]?.agri_language.id) {
          stateInfoDataList(
            dbname,
            response?.data?.data[0]?.agri_language.id,
            token,
          );
        }
        if (response?.data?.data[0]?.agri_user_addresses[0]?.agri_state?.fid) {
          districtDataList(
            dbname,
            response?.data?.data[0]?.agri_language.id,
            response?.data?.data[0]?.agri_user_addresses[0]?.agri_state?.fid,
          );
        }
        if (
          response?.data?.data[0]?.agri_user_addresses[0]?.agri_district?.fid
        ) {
          blockDataList(
            dbname,
            response?.data?.data[0]?.agri_language.id,
            response?.data?.data[0]?.agri_user_addresses[0]?.agri_district?.fid,
          );
        }
      }
      setIsLoading(false);
    } catch (error) {
      console.log(error);
    }
  };
  const onPageLoad = async () => {
    try {
      setIsLoading(true);
      const [loginUser_data, state, district, block] = await Promise.all([
        getItem('loginUser_data'),
        getItem('state'),
        getItem('district'),
        getItem('block'),
      ]);
      if (loginUser_data) {
        setregionaldatas({
          ...regionaldatas,
          state: state,
          district: district,
          block: block,
        });
        const { dbname, lan_id, token, user_id } = loginUser_data;
        userDetails(dbname, lan_id, token, user_id);
      }
      setIsLoading(false);
    } catch (error) {
      console.log(error);
    }
  };
  const handleLogout = async () => {
    await Promise.all([
      removeItem('logoImageData'),
      removeItem('loginUser_data'),
      removeItem('profileImgData'),
      removeItem('userNameData'),
      removeItem('userType'),
      removeItem('bottomBannerData'),
      removeItem('topBannerData'),
    ]);
    // const popAction = StackActions.pop(1);
    // navigation.dispatch(popAction);
    // navigation.navigate('Login', { pagename: 'Login', locale: storePersnolInfo.langIdName });
    navigation.dispatch(
      CommonActions.reset({
        index: 4,
        routes: [
          { name: 'Login' },
          {
            name: 'Login',
            params: { pagename: 'Login', locale: storePersnolInfo.langId },
          },
        ],
      }),
    );
  };
  useEffect(() => {
    if (isFocused) {
      onPageLoad();
    }
    const onBackPress = () => {
      navigation.navigate('Dashboard');
      return true;
    };
    BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () =>
      BackHandler.removeEventListener('hardwareBackPress', onBackPress);
  }, [isFocused]);
  const HandlerGoBack = () => navigation.navigate('Dashboard');
  return (
    <>
      <Root>
        <View style={styles.container}>
          {isLoading ? (
            <View style={styles.LoadingScreen}>
              <LoadingScreen />
            </View>
          ) : null}
          <CustomHeader
            path="Dashboard"
            HandlerGoBack={HandlerGoBack}
            logoImage={logoImage}
            topBanner={topBanner}
            t={t}
          />
          <View style={styles.fromContainer}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={{ padding: 10 }}>
                <InputTextForm
                  label={t('name')}
                  color="black"
                  value={storePersnolInfo.userName}
                  editable={false}
                />
                <InputTextForm
                  label={t('new_reg_phone_number')}
                  color="black"
                  value={storePersnolInfo.contactNumber}
                  editable={false}
                />
                <DatePickerField
                  label={t('date_of_birth')}
                  value={storePersnolInfo.date_of_birth}
                  labelColor={Colors.black}
                />

                <DropdownForm
                  label={t('select_language')}
                  color="black"
                  data={languageData}
                  onChange={item => {
                    handleLanguage(item);
                  }}
                  val={storePersnolInfo.langIdName}
                />
                <DropdownForm
                  label={
                    regionaldatas.state == ''
                      ? t('state_col')
                      : t(`${regionaldatas.state}`)
                  }
                  color="black"
                  data={stateInfoData}
                  onChange={item => {
                    handleStateInfo(item);
                  }}
                  val={storePersnolInfo.stateName}
                />
                <DropdownForm
                  label={
                    regionaldatas.district == ''
                      ? t('select_zila')
                      : t(`${regionaldatas.district}`)
                  }
                  color="black"
                  data={districtData}
                  onChange={item => {
                    handleDistrict(item);
                  }}
                  val={storePersnolInfo.districtName}
                />
                <DropdownForm
                  label={
                    regionaldatas.block == ''
                      ? t('select_block_sub_county_upzila')
                      : t(`${regionaldatas.block}`)
                  }
                  color="black"
                  data={blockData}
                  onChange={item => {
                    setstorePersnolInfo({
                      ...storePersnolInfo,
                      block: item.value,
                      blockName: item.label,
                    });
                  }}
                  val={storePersnolInfo.blockName}
                />
              </View>
            </ScrollView>
          </View>
        </View>
        <ButtonForm label={t('submit')} onPress={() => handleSave()} loading={isLoading}/>
      </Root>
    </>
  );
};
export default Profile;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background_light,
  },
  fromContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 16,
  },
  DateofBirth: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 8,
    height: 48,
    borderColor: Colors.border,
    borderWidth: 1,
    backgroundColor: 'white',
    width: '100%',
    paddingHorizontal: 10,
    color: 'white',
    marginBottom: 15,
  },
  LoadingScreen: {
    position: 'absolute',
    top: '52%',
    left: '45%',
    zIndex: 9999,
  },
});
