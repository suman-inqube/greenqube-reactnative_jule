import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  BackHandler,
  Keyboard,
} from 'react-native';
import React, {useEffect, useState, useCallback, useContext} from 'react';
import ImageForm from '../../Common/ImageForm';
import DatePicker from 'react-native-date-picker';
import {
  useNavigation,
  useRoute,
  useIsFocused,
  useFocusEffect,
} from '@react-navigation/native';
import {userCreateContext} from '../../Context/usersCreateContext';
import config from '../../../config';
import FarmerDrawerScreenWrapper1 from '../FarmerDrawerScreenWrapper1';
import {Colors, Fronts} from '../../utils/Constants';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const FinancialInformation = () => {
  const {
    InputTextForm,
    getItem,
    setItem,
    t,
    ButtonForm,
    onBackPress,
    DropdownForm,
    CustomHeader,
    FormsTitle,
    logoImage,
    topBanner,
    effective_dates,
    Root,
  } = useContext(userCreateContext);
  const navigation = useNavigation();
  const route = useRoute();
  const isFocused = useIsFocused();
  const [remove, setRemove] = useState('');
  const [storeFinancial, setstoreFinancial] = useState({
    adharCard: '',
    panNo: '',
    voterCard: '',
    farmarLoanNo: '',
    accountHolderName: '',
    bankName: '',
    ifscCode: '',
    bankAccountNo: '',
    branchName: '',
    pensionAccountNo: '',
    pensionProvidingAuthority: '',
    pensionAmount: '',
    pensionEffectiveFrom: '',
    pensionPerMonth: '',
    nameOfCompany: '',
    policyNumber: '',
    sumInsured: '',
  });
  const [newdate, setnewDate] = useState(new Date());
  const [open, setOpen] = useState(false);
  const [isIdentity, setIdentity] = useState(false);
  const [path, setPath] = useState('');
  const toggleIdentity = () => {
    setIdentity(!isIdentity);
  };
  const [isBank, setBank] = useState(false);
  const [currency, setCurrencyt] = useState('');
  const handleDatePicker = item => {
    const effective_date = effective_dates(item);
    setstoreFinancial({
      ...storeFinancial,
      pensionEffectiveFrom: effective_date,
    });
  };
  const toggleBank = () => {
    setBank(!isBank);
  };
  const [isPension, setPension] = useState(false);
  const togglePension = () => {
    setPension(!isPension);
  };
  const [isLifeInsurance, setLifeInsurance] = useState(false);
  const toggleLifeInsurance = () => {
    setLifeInsurance(!isLifeInsurance);
  };
  const onPageLoad = async () => {
    const [currency_res] = await Promise.all([getItem('currency')]);
    setCurrencyt(currency_res);
  };
  useEffect(() => {
    if (isFocused) {
      onPageLoad();
      if (typeof route.params != 'undefined') {
        if (route.params.data === 'remove') {
          if (remove == 'remove') {
            setRemove('');
          } else {
            setRemove('remove');
          }
          emptyData();
        }
        if (typeof route.params.pagename != 'undefined') {
          setPath(route.params.pagename);
        } else {
          setPath('');
        }
      } else {
        setPath('');
        setRemove('');
      }
    }
    onBackPress(() => {
      navigation.navigate(path != '' ? path : 'PersonalInformation');
      return true;
    });
  }, [isFocused]);
  const emptyData = () => {
    setstoreFinancial({
      adharCard: '',
      panNo: '',
      voterCard: '',
      farmarLoanNo: '',
      accountHolderName: '',
      bankName: '',
      ifscCode: '',
      bankAccountNo: '',
      branchName: '',
      pensionAccountNo: '',
      pensionProvidingAuthority: '',
      pensionAmount: '',
      pensionEffectiveFrom: '',
      pensionPerMonth: '',
      nameOfCompany: '',
      policyNumber: '',
      sumInsured: '',
    });
  };
  const handleNavigate = async () => {
    Keyboard.dismiss();
    if (path != '') {
      await setItem('storeFinancial_data', storeFinancial);
      navigation.navigate(route.params.pagename, {data: remove});
    } else {
      await setItem('storeFinancial_data', storeFinancial);
      navigation.navigate('PlotSiteProduceInformation', {data: remove});
    }
  };
  const HandlerGoBack = () => {
    if (path != '') {
      navigation.navigate(path);
    } else {
      navigation.navigate('PersonalInformation');
    }
  };
  return (
    <FarmerDrawerScreenWrapper1>
      <>
        <Root>
          <View style={styles.mainConatiner}>
            <CustomHeader
              path={path != '' ? path : 'PersonalInformation'}
              HandlerGoBack={HandlerGoBack}
              logoImage={logoImage}
              topBanner={topBanner}
            />
            {/* <FormsTitle title={t('financial_information')} /> */}
            <ScrollView>
              <View
                style={{
                  backgroundColor: 'green',
                  alignSelf: 'flex-end',
                  marginTop: 20,
                  borderRadius: 10,
                  width: '10%',
                  height: '5%',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 20,
                  marginBottom: 15,
                }}>
                <Text
                  style={{
                    color: 'white',
                  }}>
                  2/3
                </Text>
              </View>
              <View style={{paddingHorizontal: 20}}>
                <View style={styles.container}>
                  <TouchableOpacity onPress={toggleIdentity}>
                    <View style={styles.headerStyle}>
                      <View style={{}}>
                        <MaterialIcons
                          name="badge"
                          size={28}
                          color="#113fac"
                          style={styles.icon}
                        />
                      </View>
                      <Text style={styles.toggleText}>
                        {isIdentity
                          ? `${t('different_identity_number')}`
                          : `${t('different_identity_number')}`}
                      </Text>
                      <Text style={styles.toggleText}>
                        {isIdentity ? (
                          <MaterialIcons
                            name="do-not-disturb-on"
                            size={25}
                            color="red"
                            style={styles.icon}
                          />
                        ) : (
                          <MaterialIcons
                            name="add-circle"
                            size={25}
                            color="green"
                            style={styles.icon}
                          />
                        )}
                      </Text>
                    </View>
                  </TouchableOpacity>
                  {isIdentity && (
                    <>
                      <View style={{marginTop: 10}}>
                        <InputTextForm
                          label={t('adhar_no')}
                          onChangeText={adharCard =>
                            setstoreFinancial({
                              ...storeFinancial,
                              adharCard: adharCard,
                            })
                          }
                          keyboardType="numeric"
                          value={storeFinancial.adharCard}
                        />
                      </View>
                      <InputTextForm
                        label={t('pan_no')}
                        value={storeFinancial.panNo}
                        onChangeText={panNo =>
                          setstoreFinancial({...storeFinancial, panNo: panNo})
                        }
                      />
                      <InputTextForm
                        label={t('voter_card_no')}
                        value={storeFinancial.voterCard}
                        onChangeText={voterCard =>
                          setstoreFinancial({
                            ...storeFinancial,
                            voterCard: voterCard,
                          })
                        }
                      />
                      <InputTextForm
                        label={t('kcc_no')}
                        onChangeText={farmarLoanNo =>
                          setstoreFinancial({
                            ...storeFinancial,
                            farmarLoanNo: farmarLoanNo,
                          })
                        }
                        value={storeFinancial.farmarLoanNo}
                      />
                    </>
                  )}
                </View>
              </View>
              <View style={{paddingHorizontal: 20}}>
                <View style={styles.container}>
                  <TouchableOpacity onPress={toggleBank}>
                    <View style={styles.headerStyle}>
                      <View style={{}}>
                        <MaterialIcons
                          name="account-balance"
                          size={25}
                          color="#ac1198"
                          style={styles.icon}
                        />
                      </View>
                      <Text style={styles.toggleText}>
                        {isBank
                          ? `${t('bank_account_details')}`
                          : `${t('bank_account_details')}`}
                      </Text>
                      <Text style={styles.toggleText}>
                        {isBank ? (
                          <MaterialIcons
                            name="do-not-disturb-on"
                            size={25}
                            color="red"
                            style={styles.icon}
                          />
                        ) : (
                          <MaterialIcons
                            name="add-circle"
                            size={25}
                            color="green"
                            style={styles.icon}
                          />
                        )}
                      </Text>
                    </View>
                  </TouchableOpacity>
                  {isBank && (
                    <>
                      <View style={{marginTop: 10}}>
                        <InputTextForm
                          label={t('account_holder_name')}
                          onChangeText={accountHolderName =>
                            setstoreFinancial({
                              ...storeFinancial,
                              accountHolderName: accountHolderName,
                            })
                          }
                          value={storeFinancial.accountHolderName}
                        />
                      </View>
                      <InputTextForm
                        label={t('farmer_reg_bankifsc')}
                        onChangeText={bankName =>
                          setstoreFinancial({
                            ...storeFinancial,
                            bankName: bankName,
                          })
                        }
                        value={storeFinancial.bankName}
                      />
                      <InputTextForm
                        label={t('branch_name')}
                        onChangeText={branchName =>
                          setstoreFinancial({
                            ...storeFinancial,
                            branchName: branchName,
                          })
                        }
                        value={storeFinancial.branchName}
                      />
                      <InputTextForm
                        label={t('bank_account')}
                        onChangeText={bankAccountNo =>
                          setstoreFinancial({
                            ...storeFinancial,
                            bankAccountNo: bankAccountNo,
                          })
                        }
                        value={storeFinancial.bankAccountNo}
                        keyboardType="numeric"
                      />
                      <InputTextForm
                        label={t('ifsc_no')}
                        onChangeText={ifscCode =>
                          setstoreFinancial({
                            ...storeFinancial,
                            ifscCode: ifscCode,
                          })
                        }
                        value={storeFinancial.ifscCode}
                      />
                    </>
                  )}
                </View>
              </View>
              <View style={{paddingHorizontal: 20}}>
                <View style={styles.container}>
                  <TouchableOpacity onPress={() => togglePension()}>
                    <View style={styles.headerStyle}>
                      <View style={{}}>
                        <MaterialIcons
                          name="elderly"
                          size={28}
                          color="#720b4c"
                          style={styles.icon}
                        />
                      </View>
                      <Text style={styles.toggleText}>
                        {isPension
                          ? `${t('pension_details')}`
                          : `${t('pension_details')}`}
                      </Text>
                      <Text style={styles.toggleText}>
                        {isPension ? (
                          <MaterialIcons
                            name="do-not-disturb-on"
                            size={25}
                            color="red"
                            style={styles.icon}
                          />
                        ) : (
                          <MaterialIcons
                            name="add-circle"
                            size={25}
                            color="green"
                            style={styles.icon}
                          />
                        )}
                      </Text>
                    </View>
                  </TouchableOpacity>
                  {isPension && (
                    <>
                      <View style={{marginTop: 20}}>
                        <InputTextForm
                          label={t('pension_providing_authority')}
                          onChangeText={pensionProvidingAuthority =>
                            setstoreFinancial({
                              ...storeFinancial,
                              pensionProvidingAuthority:
                                pensionProvidingAuthority,
                            })
                          }
                          value={storeFinancial.pensionProvidingAuthority}
                        />
                      </View>
                      <InputTextForm
                        label={t('pension_account_number')}
                        onChangeText={pensionAccountNo =>
                          setstoreFinancial({
                            ...storeFinancial,
                            pensionAccountNo: pensionAccountNo,
                          })
                        }
                        value={storeFinancial.pensionAccountNo}
                        keyboardType="numeric"
                      />
                      <View>
                        <Text
                          style={{
                            marginBottom: 5,
                            marginLeft: 5,
                            color: '#000',
                          }}>
                          {t('effective_from')}
                        </Text>
                        <View style={styles.passwordMainContainer}>
                          <View style={styles.passwordContainer}>
                            <TouchableOpacity
                              style={styles.inputTextStyle}
                              onPress={() => setOpen(true)}>
                              <Text style={styles.title}>
                                {storeFinancial.pensionEffectiveFrom}
                              </Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setOpen(true)}>
                              <ImageForm
                                source={require('../../Common/images/date.png')}
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
                                handleDatePicker(item);
                                setOpen(false);
                              }}
                              onCancel={() => {
                                setOpen(false);
                              }}
                            />
                          </View>
                        </View>
                      </View>
                      <InputTextForm
                        label={t('pension_amount_currency') + ` (${currency})`}
                        onChangeText={pensionAmount =>
                          setstoreFinancial({
                            ...storeFinancial,
                            pensionAmount: pensionAmount,
                          })
                        }
                        value={storeFinancial.pensionAmount}
                        keyboardType="numeric"
                      />
                      <DropdownForm
                        label={t('per_month_quarter_year')}
                        data={config?.pensionParMonthData}
                        onChange={pensionPerMonth =>
                          setstoreFinancial({
                            ...storeFinancial,
                            pensionPerMonth: pensionPerMonth,
                          })
                        }
                        val={storeFinancial.pensionPerMonth}
                      />
                    </>
                  )}
                </View>
              </View>
              <View style={{paddingHorizontal: 20}}>
                <View style={styles.container}>
                  <TouchableOpacity onPress={toggleLifeInsurance}>
                    <View style={styles.headerStyle}>
                      <View style={{}}>
                        <MaterialIcons
                          name="family-restroom"
                          size={28}
                          color="#24961a"
                          style={styles.icon}
                        />
                      </View>
                      <Text style={styles.toggleText}>
                        {isLifeInsurance
                          ? `${t('life_insurance_details')}`
                          : `${t('life_insurance_details')}`}
                      </Text>
                      <Text style={styles.toggleText}>
                        {isLifeInsurance ? (
                          <MaterialIcons
                            name="do-not-disturb-on"
                            size={25}
                            color="red"
                            style={styles.icon}
                          />
                        ) : (
                          <MaterialIcons
                            name="add-circle"
                            size={25}
                            color="green"
                            style={styles.icon}
                          />
                        )}
                      </Text>
                    </View>
                  </TouchableOpacity>
                  {isLifeInsurance && (
                    <>
                      <View style={{marginTop: 20}}>
                        <InputTextForm
                          label={t('lic_name_of_company')}
                          onChangeText={nameOfCompany =>
                            setstoreFinancial({
                              ...storeFinancial,
                              nameOfCompany: nameOfCompany,
                            })
                          }
                          value={storeFinancial.nameOfCompany}
                        />
                      </View>
                      <InputTextForm
                        label={t('policy_number')}
                        onChangeText={policyNumber =>
                          setstoreFinancial({
                            ...storeFinancial,
                            policyNumber: policyNumber,
                          })
                        }
                        value={storeFinancial.policyNumber}
                        keyboardType="numeric"
                      />
                      <InputTextForm
                        label={t('sum_insured_currency')}
                        onChangeText={sumInsured =>
                          setstoreFinancial({
                            ...storeFinancial,
                            sumInsured: sumInsured,
                          })
                        }
                        value={storeFinancial.sumInsured}
                        keyboardType="numeric"
                      />
                    </>
                  )}
                </View>
              </View>
            </ScrollView>
            <View style={{backgroundColor: '#D5FFD0'}}>
              <ButtonForm label={t('skip_next')} onPress={handleNavigate} />
            </View>
          </View>
        </Root>
      </>
    </FarmerDrawerScreenWrapper1>
  );
};

export default FinancialInformation;

const styles = StyleSheet.create({
  mainConatiner: {flex: 1, backgroundColor: Colors.background_light},
  headerStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#ffffffff',
    height: 35,
    width: '100%',
    marginLeft: -5,
    borderRadius: 8,
    marginTop: -3,
    borderRadius: 5,
  },
  container: {
    marginTop: 10,
    padding: 17,
    borderWidth: 0,
    borderColor: '#ddd',
    backgroundColor: '#d3ced7',
    borderRadius: 8,
    marginVertical: 20,
    elevation: 3,
    // height: 55,
    borderWidth: 0.5,
    borderColor: 'black',
  },
  toggleText: {
    fontSize: 16,
    color: 'black',
    fontFamily: 'Poppins-SemiBold',
    marginLeft: 15,
    marginTop: 2,
  },
  content: {
    marginTop: 10,
  },
  passwordMainContainer: {
    flex: 1,
    alignItems: 'center',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
    flex: 1,
    marginVertical: 10,
    marginHorizontal: 10,
    borderColor: 'gray',
    color: '#000',
  },
  icon: {
    marginLeft: 3,
    marginTop: 3,
  },
  icon1: {
    marginLeft: 3,
    // marginTop: 3,
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    alignItems: 'center',
  },
});
