import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  ScrollView,
  BackHandler,
  Dimensions,
} from 'react-native';
import React, {useState, useEffect, useContext} from 'react';
import {
  farmerAgainstSupervisorAPI,
  livelihoodNameVarietyLandrelAPI,
  outputSaveAPI,
  problemPlotAgainstFarmerAPI,
  unitByListAPI,
  addModuleForView,
} from '../../../config/apiHere';
import MessageDialog from '../../Common/MessageDialog';
import {useNavigation} from '@react-navigation/native';
import {userCreateContext} from '../../Context/usersCreateContext';
import {plotHook} from '../../hooks/plotHook';
import {Colors, Fronts} from '../../utils/Constants';
import FarmerDrawerScreenWrapper1 from '../FarmerDrawerScreenWrapper1';
const FarmerPostNew = props => {
  //GQR-67
  const {
    loginUser_data,
    DatePickerComp,
    t,
    getItem,
    effective_dates,
    Root,
    Toast,
    AlertMesg,
    DropdownForm,
    InputTextForm,
    ButtonForm,
    isOnline,
    CustomHeader,
    logoImage,
    topBanner,
  } = useContext(userCreateContext);
  const {dbname, lan_id, token, user_id} = loginUser_data;
  //GQR-67
  const {problemPlotAgainstFarmer, plotAll, setplotAll} = plotHook(
    dbname,
    lan_id,
    token,
    user_id,
    isOnline,
  );
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
  const navigation = useNavigation();
  const [saveData, setSaveData] = useState({});
  const [liveliHoodType, setLiveliHoodType] = useState([]);
  const [produceName, setProduceName] = useState([]);
  const [produceVariety, setProduceVariety] = useState([]);
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
  const [isLoading, setIsLoading] = useState(true);

  const [regionaldatas, setregionaldatas] = useState({
    state: '',
    district: '',
    block: '',
  });
  const handlePlot = async relId => {
    if (relId.label == 'other') {
      setIsOther(true);
      const farmer_all = await farmerAgainstSupervisorAPI(
        dbname,
        lan_id,
        user_id,
      );
      const problemNameFound = farmer_all?.data?.data?.rows.find(
        user => user.user_id === relId.user_id,
      );
      if (problemNameFound) {
        setSaveData({
          ...saveData,
          type: '',
          farmer_id: relId.user_id,
          transaction_type: 2,
          fulfill_status: 0,
          state_name:
            problemNameFound?.agri_user_addresses[0].agri_state.state_name,
          district_name:
            problemNameFound?.agri_user_addresses[0].agri_district
              .district_name,
          subdiv_name:
            problemNameFound?.agri_user_addresses[0].agri_subdivision
              .subdiv_name,
          state_id: problemNameFound?.agri_user_addresses[0].state,
          district_id: problemNameFound?.agri_user_addresses[0].district,
          block_id: problemNameFound?.agri_user_addresses[0].subdivision,
        });
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
        farmerAgainstSupervisorAPI(dbname, lan_id, user_id),
      ]);
      if (livelyhoodNameVerity?.status == 200) {
        const problemNameFound = farmer_all?.data?.data?.rows.find(
          user => user.user_id === relId.user_id,
        );
        if (problemNameFound) {
          if (
            new Date(livelyhoodNameVerity?.data?.data?.harvesting_date) >
            new Date()
          ) {
            await Promise.all([
              setProduceName([
                {
                  value: livelyhoodNameVerity?.data?.data?.crop_name.fid,
                  label: livelyhoodNameVerity?.data?.data?.crop_name.name,
                },
              ]),
              setProduceVariety([
                {
                  value: livelyhoodNameVerity?.data?.data?.crop_variety.fid,
                  label: livelyhoodNameVerity?.data?.data?.crop_variety.name,
                },
              ]),
              setLiveliHoodType([
                {
                  value: livelyhoodNameVerity?.data?.data?.crop_type.fid,
                  label: livelyhoodNameVerity?.data?.data?.crop_type.name,
                },
              ]),
              setNameVarityLivelihood({
                ...nameVarityLivelihood,
                name: livelyhoodNameVerity?.data?.data?.crop_name.fid,
                varity: livelyhoodNameVerity?.data?.data?.crop_variety.fid,
                livelihood: livelyhoodNameVerity?.data?.data?.crop_type.fid,
              }),
              setSaveData({
                ...saveData,
                type: '',
                farmer_id: relId.user_id,
                land_rel_id: relId.value,
                transaction_type: 2,
                fulfill_status: 0,
                state_name:
                  problemNameFound?.agri_user_addresses[0].agri_state
                    ?.state_name,
                district_name:
                  problemNameFound?.agri_user_addresses[0].agri_district
                    ?.district_name,
                subdiv_name:
                  problemNameFound?.agri_user_addresses[0].agri_subdivision
                    ?.subdiv_name,
                state_id: problemNameFound?.agri_user_addresses[0].state,
                district_id: problemNameFound?.agri_user_addresses[0].district,
                block_id: problemNameFound?.agri_user_addresses[0].subdivision,
                entity_type_id: livelyhoodNameVerity?.data?.data?.crop_type.fid,
                entity_name_id: livelyhoodNameVerity?.data?.data?.crop_name.fid,
                entity_variety_id:
                  livelyhoodNameVerity?.data?.data?.crop_variety.fid,
                others: '',
              }),
            ]);
          } else {
            // MessageDialog({ message: `${t('your_previous_crop_hervested')} ${t('add_a_new_crop')}` })
            Toast.show({
              time: 3,
              text: `${t('your_previous_crop_hervested')} ${t(
                'add_a_new_crop',
              )}`,
              ...AlertMesg[0],
            });
            setTimeout(() => {
              navigation.navigate('FarmerDashboard');
            }, 1300);
          }
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
      setApproximateDate('');
      setSaveData({...saveData, land_rel_id: '', quantity: '', unit_id: ''});
      setNameVarityLivelihood({
        ...nameVarityLivelihood,
        name: '',
        varity: '',
        livelihood: '',
      });
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
    const response = await problemPlotAgainstFarmerAPI(
      dbname,
      lan_id,
      token,
      user_id,
    );
    problemPlotAgainstFarmer();
    const unitByList = await unitByListAPI(dbname, lan_id);
    if (unitByList?.status == 200) {
      setUnitData(unitByList?.data?.data?.rows);
      const dataArray = unitByList?.data?.data?.rows.map(data => ({
        value: data.fid,
        label: data.unit_name,
        unit_sname: data.unit_sname,
        sub_type: data.sub_type,
        defined_unit_value: data.defined_unit_value,
      }));
      setUnitData(dataArray);
    }
    const min = 1000000000000;
    const max = 9999999999999;
    const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
    setSaveData({
      ...saveData,
      user_name: loginUser_data.userName,
      user_contact_number: loginUser_data.contactNumber,
      ref_code: randomNumber,
    });
    setIsLoading(false);
  };
  const validationData = () => {
    if (!saveData.quantity) {
      Toast.show({
        time: 2,
        text: `${t('select_quantity_input')}`,
        ...AlertMesg[0],
      });
      return false;
    }
    if (!saveData.unit_id) {
      Toast.show({time: 2, text: `${t('select_unit_input')}`, ...AlertMesg[0]});
      return false;
    } else if (approximateDate == '' && nextpage == 2) {
      Toast.show({text: `${t('approximate_date')}`, ...AlertMesg[0]});
      return false;
    }
    return true;
  };

  const saveHandle = async () => {
    const res = validationData();
    if (res == true) {
      if (nextpage === 1) {
        setNextPage(2);
      } else {
        const formDataObject = new FormData();
        formDataObject.append('date', approximateDate);
        formDataObject.append('farmer_id', saveData.farmer_id);
        formDataObject.append('state_id', saveData.state_id);
        formDataObject.append('district_id', saveData.district_id);
        formDataObject.append('block_id', saveData.block_id);
        formDataObject.append('entity_name_id', saveData.entity_name_id);
        formDataObject.append('entity_type_id', saveData.entity_type_id);
        formDataObject.append('entity_variety_id', saveData.entity_variety_id);
        formDataObject.append('fulfill_status', saveData.fulfill_status);
        formDataObject.append('land_rel_id', saveData.land_rel_id);
        formDataObject.append('quantity', saveData.quantity);
        formDataObject.append('ref_code', saveData.ref_code);
        formDataObject.append('transaction_type', saveData.transaction_type);
        formDataObject.append('type', saveData.type);
        formDataObject.append(
          'user_contact_number',
          saveData.user_contact_number,
        );
        formDataObject.append('user_name', saveData.user_name);
        // formDataObject.append('unit_id', saveData.unit_id);
        formDataObject.append('photo', '');
        formDataObject.append('others', saveData.others);
        formDataObject.append(
          'convert_qty',
          saveData.defined_unit_value != '' &&
            saveData.defined_unit_value != null
            ? saveData.defined_unit_value * saveData.quantity
            : saveData.quantity * 1,
        );
        //return console.log(formDataObject);
        //change this key saveData.unit_sname
        formDataObject.append('unit_id', saveData.unit_sname);
        //new key add
        formDataObject.append('sub_ftype', saveData.unit_sub_type);
        formDataObject.append('unit_fid', saveData.unit_fid);
        formDataObject.append('default_unit_fid', saveData.filter_unit_fid);
        //
        const database_res = await outputSaveAPI(
          dbname,
          lan_id,
          token,
          user_id,
          formDataObject,
        );

        // console.log(database_res);
        if (database_res) {
          addModuleForView(
            dbname,
            lan_id,
            saveData.farmer_id,
            token,
            'Output',
            'module_hit',
            'outPut_user',
            1,
          );
          Toast.show({text: t('Data_submitted_successfully'), ...AlertMesg[0]});
          console.log('Toast ');
          navigation.navigate('FarmerViewPast');
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
        <View style={{flex: 1, backgroundColor: 'white'}}>
          <CustomHeader t={t} />
          <DatePickerComp
            openDate={openDatePicker}
            newDate={newDate}
            setOpenDate={setOpenDatePicker}
            handleDatePicker={handleDatePicker}
          />

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.fromContainer}>
              <View style={{padding: 5}}>
                {nextpage == 1 ? (
                  <>
                    <DropdownForm
                      label={t('addland_select_plot')}
                      data={plotAll}
                      required={true}
                      onChange={relId => handlePlot(relId)}
                    />
                    {isOther ? (
                      <InputTextForm
                        label={t('other')}
                        value={saveData.others}
                        onChangeText={others =>
                          setSaveData({...saveData, others: others})
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
                          onChangeText={item =>
                            setSaveData({...saveData, quantity: item})
                          }
                        />
                      </View>
                      <View style={{width: '45%'}}>
                        <DropdownForm
                          label={t('select_unit_input')}
                          data={unitData}
                          onChange={item => handleUnit(item)}
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
                        <Image
                          source={require('../../Common/images/calendar.png')}
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
export default FarmerPostNew;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '90%',
    marginHorizontal: '5%',
    marginVertical: 10,
    marginBottom: 60,
    backgroundColor: 'white',
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
    padding: 16,

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
