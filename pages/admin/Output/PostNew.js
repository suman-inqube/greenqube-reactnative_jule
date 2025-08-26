import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  ScrollView,
  BackHandler,
  FlatList,
  SafeAreaView,
  Dimensions,
  Keyboard,
  Alert,
} from 'react-native';
import React, {useState, useEffect, useContext} from 'react';
import {launchCamera} from 'react-native-image-picker';
import {
  farmerAgainstSupervisorAPI,
  farmerByNameAPI,
  livelihoodNameVarietyLandrelAPI,
  outputSaveAPI,
  problemPlotAgainstFarmerAPI,
  unitByListAPI,
} from '../../../config/apiHere';
import {userCreateContext} from '../../Context/usersCreateContext';
import FarmerDrawerScreenWrapper1 from '../FarmerDrawerScreenWrapper1';
import {Colors, Fonts} from '../../utils/Constants';
import AnimatedCard from '../../Components/AnimatedCard';
import SkeletonProblemCard from '../../Components/Skeleton/SkeletonProblemCard';
import {FloatingAction} from 'react-native-floating-action';
import {getActionsPostNew} from '../../utils/options';
import {axiosGet} from '../../utils/api';
import {ROUTES} from '../../utils/Routes';
const PostNew = props => {
  //GQR-67
  const {
    loginUser_data,
    t,
    Root,
    AlertMesg,
    DropdownForm,
    InputTextForm,
    ButtonForm,
    DatePickerComp,
    Toast,
    getItem,
    farmerData,
    effective_dates,
    CustomHeader,
  } = useContext(userCreateContext);
  const {dbname, lan_id, token, user_id} = loginUser_data;
  //GQR-67
  const unitFarm = [
    {
      value: 1,
      label: `${t('full')}`,
    },
    {
      value: 2,
      label: `${t('part')}`,
    },
  ];
  const [searchResultsList, setSearchResultsList] = useState(false);
  const [searchFarmerName, setSearchFarmerName] = useState('');
  const [searchFarmerPhone, setSearchFarmerPhone] = useState('');
  const [saveData, setSaveData] = useState({plot_name: '', created_at: ''});
  const [farmerID, setfarmerID] = useState();
  const [searchResults, setSearchResults] = useState([]);
  const [plotAll, setplotAll] = useState([]);
  const [liveliHoodType, setLiveliHoodType] = useState([]);
  const [produceName, setProduceName] = useState([]);
  const [produceVariety, setProduceVariety] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [nameVarityLivelihood, setNameVarityLivelihood] = useState({
    name: '',
    varity: '',
    livelihood: '',
  });
  const [unitData, setUnitData] = useState([]);
  const [nextpage, setNextPage] = useState(1);
  const [newDate, setNewDate] = useState(new Date());
  const [approximateDate, setApproximateDate] = useState('');
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const [isOther, setIsOther] = useState(false);
  const [regionaldatas, setregionaldatas] = useState({
    state: '',
    district: '',
    block: '',
  });
  const handleSearch = text => {
    setSearchFarmerName(text);
    setSearchFarmerPhone('');
    // console.log('farmerData', farmerData);
    // console.log('text', text);
    if (farmerData[0]) {
      const result = farmerData[0].filter(item =>
        item.label.toLowerCase().includes(text.toLowerCase()),
      );
      if (result) {
        setSearchResultsList(true);
        setSearchResults(result);
      }
    }
  };
  const handleResultSelect = async item => {
    const {label: name, value: currentfarmerId, phone, FcmUserToken} = item;
    const min = 1000000000000;
    const max = 9999999999999;
    const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
    setSaveData({
      ...saveData,
      user_name: name,
      user_contact_number: phone,
      ref_code: randomNumber,
      plot_name: '',
    });
    setNameVarityLivelihood({
      ...nameVarityLivelihood,
      name: '',
      varity: '',
      livelihood: '',
    });
    setSearchFarmerPhone(phone);
    setSearchFarmerName(name);
    setSearchResults([]);
    setfarmerID(currentfarmerId);
    const response = await problemPlotAgainstFarmerAPI(
      dbname,
      lan_id,
      token,
      currentfarmerId,
    );
    // console.log('response', response);
    if (response?.status == 200) {
      const dataArray = [
        {
          value: currentfarmerId,
          label: 'other',
          user_id: currentfarmerId,
        },
      ];
      response?.data?.data.forEach(element => {
        dataArray.push({
          value: element.rel_id,
          label: element.plot_no,
          user_id: element.user_id,
          created_at: element.created_at,
        });
      });
      setplotAll(dataArray);
    }
  };
  const handlePlot = async (relId, plot) => {
    if (relId.label == 'other') {
      setIsOther(true);
      const farmer_all = await farmerAgainstSupervisorAPI(
        dbname,
        lan_id,
        farmerID,
      );
      if (farmer_all?.status == 200) {
        const problemNameFound = farmer_all.data.data.rows.find(
          user => user.user_id === relId.user_id,
        );
        if (problemNameFound) {
          setSaveData({
            ...saveData,
            type: '',
            farmer_id: relId.user_id,
            land_rel_id: '',
            transaction_type: 2,
            fulfill_status: 0,
            created_at: '',
            // plot_name: plot != undefined && relId.label,
            plot_name: relId.label,
            state_name:
              problemNameFound?.agri_user_addresses[0]?.agri_state?.state_name,
            district_name:
              problemNameFound?.agri_user_addresses[0]?.agri_district
                ?.district_name,
            subdiv_name:
              problemNameFound?.agri_user_addresses[0]?.agri_subdivision
                ?.subdiv_name,
            state_id: problemNameFound?.agri_user_addresses[0]?.state,
            district_id: problemNameFound?.agri_user_addresses[0]?.district,
            block_id: problemNameFound?.agri_user_addresses[0]?.subdivision,
          });
        }
      }
    } else {
      setIsOther(false);
      const [livelyhoodNameVerity, farmer_all] = await Promise.all([
        livelihoodNameVarietyLandrelAPI(
          dbname,
          lan_id,
          relId.user_id,
          relId.value,
        ),
        farmerAgainstSupervisorAPI(dbname, lan_id, farmerID),
      ]);
      if (livelyhoodNameVerity) {
        const problemNameFound = farmer_all.data.data.rows.find(
          user => user.user_id === relId.user_id,
        );
        if (problemNameFound) {
          if (
            new Date(problemNameFound.agri_crop_user_rels[0].harvesting_date) >
            new Date()
          ) {
            // setModalVisible(true)
          }
          setProduceName([
            {
              value: livelyhoodNameVerity?.data?.data?.crop_name?.fid,
              label: livelyhoodNameVerity?.data?.data?.crop_name?.name,
            },
          ]);
          setProduceVariety([
            {
              value: livelyhoodNameVerity?.data?.data?.crop_variety?.fid,
              label: livelyhoodNameVerity?.data?.data?.crop_variety?.name,
            },
          ]);
          setLiveliHoodType([
            {
              value: livelyhoodNameVerity?.data?.data?.crop_type?.fid,
              label: livelyhoodNameVerity?.data?.data?.crop_type?.name,
            },
          ]);
          setNameVarityLivelihood({
            ...nameVarityLivelihood,
            name: livelyhoodNameVerity?.data?.data?.crop_name?.fid,
            varity: livelyhoodNameVerity?.data?.data?.crop_variety?.fid,
            livelihood: livelyhoodNameVerity?.data?.data?.crop_type?.fid,
          });
          setSaveData({
            ...saveData,
            type: '',
            farmer_id: relId.user_id,
            land_rel_id: relId.value,
            transaction_type: 2,
            fulfill_status: 0,
            plot_name: relId.label,
            created_at: relId.created_at,
            state_name:
              problemNameFound?.agri_user_addresses[0]?.agri_state.state_name,
            district_name:
              problemNameFound?.agri_user_addresses[0]?.agri_district
                .district_name,
            subdiv_name:
              problemNameFound?.agri_user_addresses[0]?.agri_subdivision
                .subdiv_name,
            state_id: problemNameFound?.agri_user_addresses[0]?.state,
            district_id: problemNameFound?.agri_user_addresses[0]?.district,
            block_id: problemNameFound?.agri_user_addresses[0]?.subdivision,
            entity_type_id: livelyhoodNameVerity?.data?.data?.crop_type?.fid,
            entity_name_id: livelyhoodNameVerity?.data?.data?.crop_name?.fid,
            entity_variety_id:
              livelyhoodNameVerity?.data?.data?.crop_variety?.fid,
            others: '',
          });
        }
      }
    }
  };
  const handleDatePicker = item => {
    const effective_date = effective_dates(item);
    setApproximateDate(effective_date);
  };
  const handleBackButtonClick = () => {
    if (nextpage == 2) {
      setNextPage(1);
      return true;
    }
  };
  const handleUnit = async item => {
    const unitRes = await unitByListAPI(dbname, lan_id, 1, item.sub_type);
    if (unitRes?.status == 200) {
      const rows = unitRes?.data?.data?.rows[0];
      setSaveData({
        ...saveData,
        unit_id: item?.label,
        unit_fid: item?.value,
        unit_sname: item?.unit_sname,
        unit_sub_type: item?.sub_type,
        defined_unit_value: item?.defined_unit_value,
        filter_unit_fid: rows?.fid,
      });
    }
  };

  const openImagePicker = item => {
    const options = {
      mediaType: 'photo',
      includeBase64: true,
      maxHeight: 200,
      maxWidth: 200,
    };
    launchCamera(options, response => {
      if (response.didCancel) {
        console.log('User cancelled camera');
      } else if (response.error) {
        console.log('Camera Error: ', response.error);
      } else {
        let imageUri = response.uri || response.assets?.[0]?.uri;
        const newPhoto = {uri: imageUri, type: 'image/jpeg', name: imageUri};
      }
    });
  };
  const onPageLoad = async () => {
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
    const unitByList = await unitByListAPI(dbname, lan_id);
    if (unitByList.status === 200) {
      const dataArray = unitByList?.data?.data?.rows.map(data => ({
        value: data.fid,
        label: data.unit_name,
        unit_sname: data.unit_sname,
        sub_type: data.sub_type,
        defined_unit_value: data.defined_unit_value,
      }));
      setUnitData(dataArray);
    }
    setIsLoading(false);
  };
  const validationData = () => {
    Keyboard.dismiss();
    if (searchFarmerName == '') {
      Toast.show({text: `${t('please_enter_first_name')}`, ...AlertMesg[0]});
      return false;
    } else if (saveData.plot_name == '' && saveData.plot_name != 'other') {
      Toast.show({text: `${t('please_select_plot')}`, ...AlertMesg[0]});
      return false;
    } else if (saveData.quantity == '' && saveData.plot_name != 'other') {
      Toast.show({text: `${t('select_quantity_input')}`, ...AlertMesg[0]});
      return false;
    } else if (saveData.unit_id == '') {
      Toast.show({text: `${t('select_unit_input')}`, ...AlertMesg[0]});
      return false;
    } else if (approximateDate == '' && nextpage == 2) {
      Toast.show({text: `${t('approximate_date')}`, ...AlertMesg[0]});
      return false;
    } else {
      return true;
    }
  };
  const saveHandle = async () => {
    const res = validationData();
    if (res == true) {
      Alert.alert('Hii');
      if (nextpage === 1) {
        setNextPage(2);
      } else {
        const formDataObject = new FormData();
        formDataObject.append('date', approximateDate);
        formDataObject.append('district_id', saveData.district_id);
        formDataObject.append('state_id', saveData.state_id);
        if (saveData.land_rel_id != '') {
          formDataObject.append('entity_name_id', saveData.entity_name_id);
          formDataObject.append('entity_type_id', saveData.entity_type_id);
          formDataObject.append(
            'entity_variety_id',
            saveData.entity_variety_id,
          );
          formDataObject.append('land_rel_id', saveData.land_rel_id);
        }
        formDataObject.append('farmer_id', saveData.farmer_id);
        formDataObject.append('fulfill_status', saveData.fulfill_status);
        formDataObject.append('quantity', saveData.quantity);
        formDataObject.append('ref_code', saveData.ref_code);
        formDataObject.append('block_id', saveData.block_id);
        formDataObject.append('transaction_type', saveData.transaction_type);
        formDataObject.append('type', saveData.type);
        formDataObject.append(
          'user_contact_number',
          saveData.user_contact_number,
        );
        formDataObject.append('user_name', saveData.user_name);
        // formDataObject.append('unit_id', saveData.unit_id);
        //change this key saveData.unit_sname
        formDataObject.append('unit_id', saveData.unit_sname);
        //new key add
        formDataObject.append('sub_ftype', saveData.unit_sub_type);
        formDataObject.append('unit_fid', saveData.unit_fid);
        formDataObject.append('default_unit_fid', saveData.filter_unit_fid);
        //
        formDataObject.append('photo', '');
        formDataObject.append('others', saveData.others);
        formDataObject.append(
          'convert_qty',
          saveData.defined_unit_value != '' &&
            saveData.defined_unit_value != null
            ? saveData.defined_unit_value * saveData.quantity
            : saveData.quantity * 1,
        );
        const database_res = await outputSaveAPI(
          dbname,
          lan_id,
          token,
          user_id,
          formDataObject,
        );
        console.log('database_res', database_res);
        if (database_res?.status === 200) {
          Toast.show({text: t('Data_submitted_successfully'), ...AlertMesg[0]});
          setTimeout(() => {
            props.sendDataToParent(2);
            navigation.navigate('ViewPast');
          }, 1500);
        }
      }
    }
  };
  useEffect(() => {
    onPageLoad();
    BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
    return () => {
      BackHandler.removeEventListener(
        'hardwareBackPress',
        handleBackButtonClick,
      );
    };
  }, [nextpage]);
  return (
    <FarmerDrawerScreenWrapper1>
      <Root>
        <View style={{flex: 1, backgroundColor: Colors.background_light}}>
          <CustomHeader t={t} />
          <DatePickerComp
            openDate={openDatePicker}
            newDate={newDate}
            setOpenDate={setOpenDatePicker}
            handleDatePicker={handleDatePicker}
            minimumDate={
              saveData.created_at == ''
                ? ''
                : new Date(
                    `${new Date(saveData.created_at).getFullYear()}-${
                      new Date(saveData.created_at).getMonth() + 1
                    }-${new Date(saveData.created_at).getDate() + 1}`,
                  )
            }
          />

          <SafeAreaView>
            {searchResultsList && searchResultsList ? (
              <View style={styles.flatContainer}>
                <FlatList
                  style={searchResults.length > 8 ? styles.flatlistHeight : ''}
                  data={searchResults}
                  renderItem={({item}) => (
                    <TouchableOpacity
                      onPress={() =>
                        handleResultSelect(item.label, item.value, item.phone)
                      }
                      style={styles.flatlistitem}>
                      <Text style={styles.flatlisttitle}>{item.label}</Text>
                    </TouchableOpacity>
                  )}
                  keyExtractor={(item, index) => index}
                />
              </View>
            ) : (
              ''
            )}
          </SafeAreaView>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.fromContainer}>
              <View style={{padding: 16}}>
                {nextpage == 1 ? (
                  <>
                    <DropdownForm
                      label={t('farmer_name')}
                      data={farmerData?.[0]}
                      required={true}
                      onChange={item => handleResultSelect(item)}
                    />
                    {/* <DropdownForm
                      label={t('farmer_name')}
                      color="black"
                      val={searchFarmerName}
                      onChange={farmerName => handleSearch(farmerName)}
                      data={farmerData[0]}
                    /> */}
                    <InputTextForm
                      label={t('farmer_number')}
                      value={searchFarmerPhone}
                      editable={false}
                    />
                    <DropdownForm
                      label={t('addland_select_plot')}
                      data={plotAll}
                      required={true}
                      onChange={relId => handlePlot(relId, 'plot')}
                      val={saveData.plot_name}
                    />
                    {isOther ? (
                      <InputTextForm
                        label={t('other')}
                        onChangeText={item =>
                          setSaveData({...saveData, others: item})
                        }
                      />
                    ) : (
                      <>
                        <DropdownForm
                          label={t('addcrop_croptype')}
                          data={liveliHoodType}
                          required={true}
                          onChange={relId => handlePlot(relId)}
                          val={nameVarityLivelihood.livelihood}
                        />
                        <DropdownForm
                          label={t('crop_name')}
                          data={produceName}
                          required={true}
                          onChange={relId => handlePlot(relId)}
                          val={nameVarityLivelihood.name}
                        />
                        <DropdownForm
                          label={t('crop_veriety')}
                          data={produceVariety}
                          required={true}
                          onChange={relId => handlePlot(relId)}
                          val={nameVarityLivelihood.varity}
                        />
                      </>
                    )}
                    <DropdownForm
                      label={t('requirement_status')}
                      data={unitFarm}
                      onChange={item => console.log(item)}
                      val={1}
                    />
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}>
                      <View style={{width: '45%'}}>
                        <InputTextForm
                          label={t('quantity')}
                          keyboardType="number-pad"
                          onChangeText={item =>
                            setSaveData({...saveData, quantity: item})
                          }
                          value={saveData.quantity}
                        />
                      </View>
                      <View style={{width: '45%'}}>
                        <DropdownForm
                          label={t('select_unit_input')}
                          data={unitData}
                          onChange={item => handleUnit(item)}
                          val={saveData.unit_id}
                        />
                      </View>
                    </View>
                  </>
                ) : (
                  <>
                    <InputTextForm
                      label={
                        regionaldatas.state == ''
                          ? t('state_col')
                          : t(`${regionaldatas.state}`)
                      }
                      value={saveData.state_name}
                    />
                    <InputTextForm
                      label={
                        regionaldatas.district == ''
                          ? t('select_district_county')
                          : t(`${regionaldatas.district}`)
                      }
                      value={saveData.district_name}
                    />
                    <InputTextForm
                      label={
                        regionaldatas.block == ''
                          ? t('select_block_sub_county_upzila')
                          : t(`${regionaldatas.block}`)
                      }
                      value={saveData.subdiv_name}
                    />
                    <View>
                      <Text style={{color: '#000'}}>
                        {t('approximate_date')}
                      </Text>
                      <TouchableOpacity
                        style={styles.appromimateContainer}
                        onPress={() => setOpenDatePicker(!openDatePicker)}>
                        <Text style={{color: '#000'}}>{approximateDate}</Text>
                        {/* <Image source={require('../../Common/images/calendar.png')} style={{ width: 30, height: 30 }} /> */}
                      </TouchableOpacity>
                    </View>
                    <View>
                      <Text style={{color: '#000'}}>{t('add_picture')}</Text>
                      <TouchableOpacity
                        style={styles.takePhotoContainer}
                        onPress={() => openImagePicker()}>
                        <Image
                          source={require('../../Common/images/camera.jpeg')}
                          style={{width: 30, height: 30}}
                        />
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </View>
            </View>
          </ScrollView>
        </View>
        <ButtonForm
          label={nextpage == 1 ? `${t('next')}` : `${t('submit')}`}
          onPress={() => saveHandle()}
          loading={isLoading}
        />
      </Root>
    </FarmerDrawerScreenWrapper1>
  );
};
export default PostNew;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '90%',
    marginHorizontal: '5%',
    marginVertical: 10,
    marginBottom: 60,
  },
  appromimateContainer: {
    borderWidth: 0.5,
    padding: 5,
    backgroundColor: '#FFF',
    borderRadius: 5,
    // alignItems:'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  fromContainer: {
    flex: 1,
    backgroundColor: 'white',
    // padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    // marginVertical: 10,

    // zIndex: 999,
    // position: 'absolute',
  },
  takePhotoContainer: {
    borderWidth: 0.5,
    padding: 5,
    backgroundColor: '#FFF',
    borderRadius: 5,
    alignItems: 'flex-end',
    marginVertical: 10,
  },
  flatContainer: {
    backgroundColor: 'white',
    position: 'absolute',
    zIndex: 9999,
    // bottom: '100%',
    top: 90,
    left: 0,
    marginHorizontal: '10%',
    width: '80%',
    elevation: 5,
    borderRadius: 10,
    padding: 10,
  },
  flatlisttitle: {
    padding: 10,
    color: '#000',
    fontFamily: 'Poppins-Regular',
  },
  flatlistHeight: {
    height: Dimensions.get('window').height / 4,
  },
});
