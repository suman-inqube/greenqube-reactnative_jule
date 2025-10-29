import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Dimensions,
  Keyboard,
} from 'react-native';
import React, {useEffect, useState, useContext} from 'react';
import {
  problemPlotAgainstFarmerAPI,
  problemProduceAgainstPlotAPI,
  InsuranceAddAPI,
  addModuleForView,
} from '../../../config/apiHere';
import CheckBoxComp from '../../Common/CheckBoxComp';
import {userCreateContext} from '../../Context/usersCreateContext';
import FarmerDrawerScreenWrapper1 from '../FarmerDrawerScreenWrapper1';
import {Colors, Fonts} from '../../utils/Constants';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
const FarmerRequestForInsurance = ({}) => {
  const navigation = useNavigation();

  //GQR-67
  const {
    loginUser_data,
    ButtonForm,
    InputTextForm,
    Root,
    Toast,
    AlertMesg,
    CustomHeader,
    logoImage,
    topBanner,
    t,
  } = useContext(userCreateContext);
  const {
    dbname,
    lan_id,
    token,
    owner,
    user_id,
    userName,
    contactNumber,
    aadhar_number,
    kcc_number,
  } = loginUser_data;
  //GQR-67
  const [farmerID, setfarmerID] = useState('');
  const [plotSite, setPlotSite] = useState([]);
  const [isChecked, setIsChecked] = useState({});
  const [nameVarityStartEnd, setNameVarityStartEnd] = useState([]);
  const [pickPlot, setPickPlot] = useState([]);
  const onPageLoad = async () => {
    setfarmerID(user_id);
    const plotSiteApi = await problemPlotAgainstFarmerAPI(
      dbname,
      lan_id,
      token,
      user_id,
    );
    if (plotSiteApi?.status == 200) {
      setPlotSite(plotSiteApi?.data?.data);
    }
  };
  useEffect(() => {
    onPageLoad();
  }, []);
  const handlePlot = async (value, label, index) => {
    if (isChecked[index] === value) {
      setIsChecked({...isChecked, [index]: ''});
      const values = [...nameVarityStartEnd];
      const plotValues = [...pickPlot];
      for (let i = 0; i < plotValues.length; i++) {
        if (plotValues[i].plot_id === value) {
          plotValues.splice(i, 1);
        }
      }
      setPickPlot(plotValues);
      for (let i = 0; i < values.length; i++) {
        if (values[i].plot_id === value) {
          values.splice(i, 1);
        }
      }
      setNameVarityStartEnd(values);
    } else {
      const plotArray = [];
      plotArray.push({
        value: value,
        label: label,
      });
      setPickPlot(plotArray);
      setIsChecked({...isChecked, [index]: value});
      const response = await problemProduceAgainstPlotAPI(
        dbname,
        lan_id,
        farmerID,
        value,
      );
      if (response?.status == 200) {
        setNameVarityStartEnd([
          ...nameVarityStartEnd,
          {
            plot_no: response?.data?.data?.land_info.plot_no,
            plot_id: response?.data?.data?.land_rel_id,
            name: response?.data?.data?.crop_name.name,
            varity: response?.data?.data?.crop_variety.name,
            cycleStarts: response?.data?.data?.sowing_date,
            cycleEnd: response?.data?.data?.harvesting_date,
            production_process:
              response?.data?.data?.farmer_production_system.name,
          },
        ]);
      }
    }
  };
  const handleSave = async () => {
    Keyboard.dismiss();
    const checkValue = [];
    Object.values(isChecked).map((data, index) => {
      if (data != '') {
        checkValue.push(data);
      }
    });
    if (checkValue.length == 0) {
      Toast.show({text: t('please_select_plot_first'), ...AlertMesg[0]});
    } else {
      const formData = new FormData();
      formData.append('user_id', user_id);
      formData.append('plot_id', checkValue);
      const addInsurance = await InsuranceAddAPI(
        dbname,
        lan_id,
        token,
        user_id,
        formData,
      );

      if (addInsurance?.status === 200) {
        addModuleForView(
          dbname,
          lan_id,
          user_id,
          token,
          'Insurance User',
          'module_hit',
          'insurance_user',
          1,
        );

        // navigation.navigate('FarmerInsuViewPastRequested');
      }
      if (addInsurance.status === 200) {
        Toast.show({text: t('Data_submitted_successfully'), ...AlertMesg[0]});
        setTimeout(() => {
          setActiveBtn(2);
        }, 2000);

        navigation.navigate('FarmerInsuViewPastRequested', {action: 'addData'});
      }
    }
  };
  const HandlerGoBack = () => navigation.navigate('FarmerDashboard');

  return (
    <FarmerDrawerScreenWrapper1>
      <>
        <Root>
          <CustomHeader
            path="Dashboard"
            // HandlerGoBack={HandlerGoBack}
            logoImage={logoImage}
            topBanner={topBanner}
          />
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={{backgroundColor: Colors.background_light}}>
            <View style={styles.container}>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>{t('farmer_information')}</Text>
                <View style={styles.infoRow}>
                  <MaterialIcons name="person" size={20} color="#4a8c29" />
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoLabel}>{t('farmer_name')}</Text>
                    <Text style={styles.infoValue}>{userName}</Text>
                  </View>
                  {/* <InputTextForm
                                label={t('farmer_number')}
                                value={farmerData.contactNumber}
                                keyboardType={'numeric'}
                                editable={false}
                              /> */}
                </View>
                {/* <View style={styles.infoRow}>
                  <View style={styles.infoTextContainer}>
                    <InputTextForm
                      label={t('farmer_name')}
                      value={userName}
                      editable={false}
                    />
                  </View>
                </View> */}

                <View style={styles.infoRow}>
                  <MaterialIcons name="phone" size={20} color="#4a8c29" />
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoLabel}>{t('farmer_number')}</Text>
                    <Text style={styles.infoValue}>{contactNumber}</Text>
                  </View>
                  {/* <InputTextForm
                                label={t('farmer_number')}
                                value={farmerData.contactNumber}
                                keyboardType={'numeric'}
                                editable={false}
                              /> */}
                </View>
                {/* <InputTextForm
                  label={t('farmer_number')}
                  value={contactNumber}
                  editable={false}
                /> */}
                <View style={styles.infoRow}>
                  <MaterialIcons name="credit-card" size={20} color="#4a8c29" />
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoLabel}>{t('adhar_no')}</Text>
                    {aadhar_number ? (
                      <Text style={styles.infoValue}>{aadhar_number}</Text>
                    ) : (
                      <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>N/A</Text>
                      </View>
                    )}
                    <Text style={styles.infoValue}>{aadhar_number}</Text>
                  </View>
                </View>

                {/* <InputTextForm
                  label={t('adhar_no')}
                  value={aadhar_number}
                  editable={false}
                /> */}
                <View style={styles.infoRow}>
                  <MaterialIcons
                    name="card-membership"
                    size={20}
                    color="#4a8c29"
                  />
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoLabel}>{t('kcc_no')}</Text>
                    {kcc_number ? (
                      <Text style={styles.infoValue}>{kcc_number}</Text>
                    ) : (
                      <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>N/A</Text>
                      </View>
                    )}
                    <Text style={styles.infoValue}>{kcc_number}</Text>
                    {/* <InputTextForm
                                label={t('kcc_no')}
                                value={farmerData.kcc_number}
                                editable={false}
                              /> */}
                  </View>
                </View>
                {/* <InputTextForm
                  label={t('kcc_no')}
                  value={kcc_number}
                  editable={false}
                /> */}
              </View>
              <View style={styles.PlotSiteList}>
                <Text style={styles.cardTitlePlot}>
                  {t('select_plot')}
                  <Text style={styles.requiredStar}> *</Text>
                </Text>
                <View style={styles.plotsContainer}>
                  {plotSite &&
                    plotSite.map((data, index) => {
                      return (
                        <View key={index} style={styles.plotItem}>
                          <CheckBoxComp
                            arrayKey={index}
                            isChecked={isChecked[index]}
                            title={data.plot_no}
                            onCheckBox={() =>
                              handlePlot(data.rel_id, data.plot_no, index)
                            }
                          />
                        </View>
                      );
                    })}
                </View>
              </View>
              <View style={styles.plotContainer}>
                {pickPlot.length != 0
                  ? nameVarityStartEnd.map((data, index) => {
                      return (
                        <View key={index} style={styles.plotContainerItem}>
                          <View>
                            <Text style={styles.infoValue}>
                              {t('addcrop_cropname')}
                            </Text>
                            <Text style={styles.infoValue}>
                              {t('addcrop_cropvariety')}
                            </Text>
                            <Text style={styles.infoValue}>
                              {t('showing_date')}
                            </Text>
                            <Text style={styles.infoValue}>
                              {t('harvesting_date_auto_calculated')}
                            </Text>
                          </View>
                          <View>
                            <Text style={styles.infoLabel}>:{data.name}</Text>
                            <Text style={styles.infoLabel}>:{data.varity}</Text>
                            <Text style={styles.infoLabel}>
                              :{data.cycleStarts}
                            </Text>
                            <Text style={styles.infoLabel}>
                              :{data.cycleEnd.slice(0, 10)}
                            </Text>
                          </View>
                        </View>
                      );
                    })
                  : ''}
              </View>
            </View>
          </ScrollView>

          <ButtonForm
            label={t('submit')}
            onPress={handleSave}
            iconName="check-circle"
            iconColor="#fff"
            iconSize={30}
          />
        </Root>
      </>
    </FarmerDrawerScreenWrapper1>
  );
};

export default FarmerRequestForInsurance;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background_light,
  },
  idcontainer: {
    marginVertical: 10,
    backgroundColor: '#FFF',
    elevation: 2,
    borderRadius: 12,
    padding: 10,
    marginHorizontal: '3%',
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
  flatContainer1: {
    backgroundColor: '#FFF',
    width: '80%',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    elevation: 5,
    zIndex: -999,
  },
  flatlisttitle: {
    color: '#000',
    marginVertical: 8,
    fontSize: 16,
  },
  flatlistitem: {padding: 10, borderBottomWidth: 1, borderBottomColor: '#eee'},
  plotContainer: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    elevation: 5,
    marginHorizontal: '3%',
    marginBottom: 20,
  },
  plotContainerItem: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFF',

    borderRadius: 8,
    padding: 5,
  },
  plotText: {
    color: '#000',
    marginVertical: 4,
  },
  cardTitle: {
    fontSize: 18,
    // fontWeight: '600',
    color: Colors.borderGreen,
    // marginLeft: 5,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 10,
  },
  PlotSiteList: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    marginVertical: '5%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginHorizontal: '3%',
  },
  flatContainer: {
    backgroundColor: '#ffffff',
    position: 'absolute',
    zIndex: 999,
    bottom: '100%',
    left: 0,
    marginHorizontal: '5%',
    width: '90%',
    elevation: 10,
    borderRadius: 10,
    padding: 10,
  },
  flatlistHeight: {
    height: Dimensions.get('window').height / 2.5,
  },
  plotTitle: {
    color: '#000',
    marginBottom: 10,
    color: '#FF0000',
  },
  text: {
    color: '#000',
    fontFamily: 'Poppins-Regular',
  },
  loadingScreen: {
    position: 'absolute',
    top: '60%',
    zIndex: 999,
    left: '45%',
  },
  xMarkImage: {
    width: 20,
    height: 20,
    margin: 5,
  },
  clickAddMorePlots: {
    backgroundColor: Colors.subBtn,
    marginHorizontal: 35,
    paddingVertical: 15,
    marginVertical: 20,
    borderRadius: 20,
  },
  clickAddMorePlotsTitle: {
    textAlign: 'center',
    color: '#FFF',
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
  },
  /////////////

  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    marginVertical: '4%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginHorizontal: '3%',
  },
  cardTitlePlot: {
    fontSize: 16,
    // fontWeight: '600',
    color: Colors.borderGreen,
    // marginBottom: 12,
    fontFamily: 'Poppins-SemiBold',
  },
  plotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  plotItem: {
    width: '50%', // Approximately 3 items per row with some spacing
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTextContainer: {
    marginLeft: 10,
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.text,
    fontFamily: 'Poppins-Regular',
  },
  infoValue: {
    fontSize: 14,
    color: Colors.text,
    fontFamily: 'Poppins-SemiBold',
  },
  emptyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    // marginTop: 2,
  },
  emptyText: {
    color: '#ff0000',
    marginLeft: 6,
    fontSize: 13,
    fontFamily: Fonts.SemiBold,
  },
  requiredStar: {
    color: 'red',
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
  },
  searchResultsContainer: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    marginTop: 5,
    maxHeight: 200,
    elevation: 3,
    zIndex: 1000, // Ensure it appears above other elements
  },
});
