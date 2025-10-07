import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import InputTextForm from './Common/InputTextForm';
import DropdownForm from './Common/DropdownForm';
import ButtonForm from './Common/ButtonForm';
import Logo from './Common/Logo';
import {useNavigation, useRoute} from '@react-navigation/native';
import config from '../config';
import ImageForm from './Common/ImageForm';
import DatePicker from 'react-native-date-picker';
import {getItem, setItem} from '../config/getDataFromStorage';
import {useTranslation} from 'react-i18next';
import {Colors, Fronts} from './utils/Constants';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
const FinancialUpdate = () => {
  const {t} = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const {pagename, arrayIndex} = route.params;
  const [dbName, setdbName] = useState();
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
  const handleDatePicker = item => {
    const dt = new Date(item);
    const x = dt.toISOString().split('T');
    const x1 = x[0].split('-');
    // console.log(x1[2] + '/' + x1[1] + '/' + x1[0]);
    const effective_date = x1[0] + '-' + x1[1] + '-' + x1[2];
    setstoreFinancial({
      ...storeFinancial,
      pensionEffectiveFrom: effective_date,
    });
    // console.log(item);
  };
  const [isIdentity, setIdentity] = useState(false);
  const toggleIdentity = () => {
    setIdentity(!isIdentity);
  };
  const [isBank, setBank] = useState(false);
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

  const handleSave = async () => {
    await setItem('storeFinancial_data', storeFinancial);
    navigation.navigate(pagename, {pagename: 'SignUpViwer', arrayIndex: 0});
  };

  const onPageLoad = async () => {
    //       let mydata= await getItem('storeFinancial_data')
    const storeSignup_data = await getItem('storeSignup_data');
    // return console.log(mydata);
    setdbName(storeSignup_data.company.dbname);
    const storeFinancial_data = await getItem('storeFinancial_data');
    if (storeFinancial_data) {
      setstoreFinancial(storeFinancial_data);
      if (storeFinancial_data.language) {
        stateInfoDataList(
          storeSignup_data.company.dbname,
          storeFinancial_data.language,
        );
      }
    }
  };

  useEffect(() => {
    onPageLoad();
  }, []);
  return (
    <>
      <View style={styles.mainConatiner}>
        <View
          style={{
            // height: 100,
            backgroundColor: Colors.green,
            borderBottomLeftRadius: 25,
            borderBottomRightRadius: 25,
            justifyContent: 'flex-end',
          }}>
          <View style={styles.headersContainer}>
            <Text style={styles.headersTitle}>
              {t('financial_information')}
            </Text>
          </View>
        </View>
        <ScrollView>
          <View style={{paddingHorizontal: 20, marginTop: 30}}>
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
                    <View style={styles.bodyContainer}>
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
                    </View>
                  </View>
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
                    <View style={styles.bodyContainer}>
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

                      <InputTextForm
                        label={t('bank_name')}
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
                    </View>
                  </View>
                </>
              )}
            </View>
          </View>
          <View style={{paddingHorizontal: 20}}>
            <View style={styles.container}>
              <TouchableOpacity onPress={togglePension}>
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
                  <View style={{marginTop: 10}}>
                    <View style={styles.bodyContainer}>
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
                          {t('effective_from')} From
                        </Text>
                        <View style={styles.passwordMainContainer}>
                          <View style={styles.passwordContainer}>
                            <TextInput
                              style={styles.inputTextStyle}
                              value={storeFinancial.pensionEffectiveFrom}
                            />
                            <TouchableOpacity onPress={() => setOpen(true)}>
                              <ImageForm
                                source={require('./Common/images/date.png')}
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
                        label={t('pension_amount_currency')}
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
                        data={config.pensionParMonthData}
                        onChange={pensionPerMonth =>
                          setstoreFinancial({
                            ...storeFinancial,
                            pensionPerMonth: pensionPerMonth,
                          })
                        }
                        val={storeFinancial.pensionPerMonth.label}
                      />
                    </View>
                  </View>
                </>
              )}
            </View>
          </View>
          <View style={{paddingHorizontal: 20, marginBottom: 100}}>
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
                  <View style={{marginTop: 10}}>
                    <View style={styles.bodyContainer}>
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
                    </View>
                  </View>
                </>
              )}
            </View>
          </View>
        </ScrollView>
        <View style={{marginTop: 10, backgroundColor: '#D5FFD0'}}>
          <ButtonForm
            label={t('skip_next')}
            onPress={() => handleSave('ProduceInfo')}
          />
        </View>
      </View>
    </>
  );
};

export default FinancialUpdate;

const styles = StyleSheet.create({
  headersContainer: {
    marginHorizontal: '5%',

    justifyContent: 'center',
    alignItems: 'center',
  },
  headersTitle: {
    paddingVertical: 5,
    // fontWeight: 'bold',
    fontSize: 18,
    color: 'white',
    fontFamily: 'Poppins-SemiBold',
  },
  mainConatiner: {flex: 1, backgroundColor: Colors.background_light},
  headerStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#ffffffff',
    height: 35,
    width: '100%',
    // marginLeft: -5,
    borderRadius: 8,
    // marginTop: -3,
    borderRadius: 5,
  },
  bodyContainer: {
    // backgroundColor: '#DAC0A3',
    backgroundColor: '#FFF',
    padding: 16,
    // paddingHorizontal: 12,
    borderRadius: 8,
    // borderWidth:1,
    borderColor: '#00000065',
    justifyContent: 'center',
    // elevation:5
  },
  container: {
    marginTop: 10,
    padding: 17,
    borderWidth: 0,
    borderColor: '#ddd',
    backgroundColor: '#e2dce7ff',
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
