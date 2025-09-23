import {StyleSheet, Text, View, ScrollView} from 'react-native';
import React, {useState, useContext, useEffect} from 'react';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {formatDateToDateName} from '../../Common/DateChanger';
import {userCreateContext} from '../../Context/usersCreateContext';
import FarmerDrawerScreenWrapper1 from '../FarmerDrawerScreenWrapper1';
import {Colors, Fonts} from '../../utils/Constants';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const FarmIncomeExpenseView = ({route}) => {
  //GQR-67
  const {
    loginUser_data,
    CustomHeader,
    t,
    onBackPress,
    logoImage,
    LoadingScreen,
    getItem,
    topBanner,
    FormsTitle,
  } = useContext(userCreateContext);
  const {dbname, lan_id, token, user_id, owner} = loginUser_data;
  //GQR-67
  const navigation = useNavigation();
  const [farmAccountSingle, setFarmAccountSingle] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [currency, setcurrency] = useState('');
  const onPageLoad = async () => {
    const [farmInExId, curr] = await Promise.all([
      getItem('farm_in_ex_id'),
      getItem('currency'),
    ]);
    // console.log('farmInExId data:', farmInExId);
    // console.log('farmInExId type:', typeof farmInExId);
    setcurrency(curr);
    if (farmInExId) {
      setFarmAccountSingle(farmInExId);
      setIsLoading(false);
    }
  };
  const ShowIncome = props => {
    const incomeItem =
      props.income &&
      props.income.filter(item1 => item1.inexType?.taxonomy === 'income');
    if (incomeItem) {
      let incomeAmount = 0;
      incomeItem.forEach(element => {
        incomeAmount += parseFloat(element.amount) || 0;
      });
      return incomeAmount.toFixed(2);
    }
  };
  const ShowExpense = props => {
    const expenseItem =
      props.expense &&
      props.expense.filter(item1 => item1.inexType?.taxonomy === 'expense');
    if (expenseItem) {
      let expenseAmount = 0;
      expenseItem.forEach(element => {
        expenseAmount += parseFloat(element.amount) || 0;
      });
      return expenseAmount.toFixed(2);
    }
  };
  const ShowTotalMargin = props => {
    let expenseAmount = 0;
    let incomeAmount = 0;
    const expenseItem =
      props.expense &&
      props.expense.filter(item1 => item1.inexType?.taxonomy === 'expense');
    if (expenseItem) {
      expenseItem.forEach(element => {
        expenseAmount += parseFloat(element.amount);
      });
    }
    const incomeItem =
      props.income &&
      props.income.filter(item1 => item1.inexType?.taxonomy === 'income');
    if (incomeItem) {
      incomeItem.forEach(element => {
        incomeAmount += parseFloat(element.amount);
      });
    }
    return incomeAmount - expenseAmount.toFixed(2);
  };
  useEffect(() => {
    onPageLoad();
  }, []);
  const HandlerGoBack = () => navigation.navigate('FarmIncomeExpenseList');

  return (
    <FarmerDrawerScreenWrapper1>
      <View style={{flex: 1, backgroundColor: Colors.pageBackground}}>
        <CustomHeader
          path={'FarmIncomeExpenseList'}
          HandlerGoBack={HandlerGoBack}
          logoImage={logoImage}
          topBanner={topBanner}
        />
        {/* <FormsTitle title={t('income_expense_list')} /> */}
        <ScrollView showsVerticalScrollIndicator={false}>
          {isLoading ? (
            <LoadingScreen />
          ) : farmAccountSingle ? (
            <View style={styles.container}>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>
                  {t('personal_information')}
                </Text>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>
                    {t('enter_farmer_s_name')} :{' '}
                  </Text>

                  <Text style={styles.infoValue}>
                    {farmAccountSingle.agri_user &&
                      farmAccountSingle.agri_user.userName}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>{t('farmer_number')} :</Text>

                  <Text style={styles.infoValue}>
                    {farmAccountSingle.agri_user &&
                      farmAccountSingle.agri_user.contactNumber}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>{t('addcrop_plot')} : </Text>
                  <Text style={styles.infoValue}>
                    {farmAccountSingle.land_info &&
                      farmAccountSingle.land_info.plot_no}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>{t('crop_name')} :</Text>
                  <Text style={styles.infoValue}>
                    {farmAccountSingle.crop_name &&
                      farmAccountSingle.crop_name.name}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>{t('pre_land_size')} : </Text>
                  <Text style={styles.infoValue}>
                    {farmAccountSingle.plot_size && farmAccountSingle.plot_size}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>{t('showing_date')}: </Text>
                  <Text style={styles.infoValue}>
                    {formatDateToDateName(farmAccountSingle.sowing_date)}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>
                    {t('harvesting_date_auto_calculated')} :{' '}
                  </Text>
                  <Text style={styles.infoValue}>
                    {formatDateToDateName(farmAccountSingle.harvesting_date)}
                  </Text>
                </View>
              </View>
              <View style={styles.ExpenseConItem}>
                <Text style={styles.ExpenseTitle}>
                  {t('total_exp_sum') + '(' + currency + ')'} :{' '}
                  {
                    <ShowExpense
                      expense={
                        farmAccountSingle && farmAccountSingle.income_expense
                      }
                    />
                  }
                </Text>
              </View>

              <View style={styles.ExpenseContainer}>
                <Text style={styles.subTitle}>{t('expense_head')}</Text>
                <Text style={styles.subTitle}>{t('date')}</Text>
                <Text style={styles.subTitle}>
                  {t('amount') + '(' + currency + ')'}
                </Text>
              </View>
              {farmAccountSingle.income_expense &&
                farmAccountSingle.income_expense.map((data, index) => {
                  return (
                    <View key={index}>
                      {data.inexType && data.inexType.taxonomy === 'expense' ? (
                        <View style={styles.flatListItem} key={index}>
                          <View style={styles.textContainer}>
                            <Text style={styles.text} numberOfLines={2}>
                              {data.inexType &&
                                data.inexType.inexName &&
                                data.inexType.inexName.categoryName}
                            </Text>
                          </View>
                          <View style={styles.textContainer}>
                            <Text style={styles.text} numberOfLines={2}>
                              {formatDateToDateName(data.date)}
                            </Text>
                          </View>
                          <View style={styles.textContainer}>
                            <Text style={styles.text} numberOfLines={2}>
                              {data.amount}
                            </Text>
                          </View>
                        </View>
                      ) : (
                        ''
                      )}
                    </View>
                  );
                })}
              <View style={styles.ExpenseCon}>
                <View></View>
              </View>
              <View style={styles.IncomeConItem}>
                <Text style={styles.IncomeHeadingTitle}>
                  {t('total_income_sum') + '(' + currency + ')'} :{' '}
                  {
                    <ShowIncome
                      income={
                        farmAccountSingle && farmAccountSingle.income_expense
                      }
                    />
                  }
                </Text>
              </View>
              <View style={styles.IncomeContainer}>
                <Text style={styles.subTitle}>{t('income_head')}</Text>
                <Text style={styles.subTitle}>{t('date')}</Text>
                <Text style={styles.subTitle}>
                  {t('amount') + '(' + currency + ')'}
                </Text>
              </View>
              {farmAccountSingle.income_expense &&
                farmAccountSingle.income_expense.map((data, index) => {
                  return (
                    <View key={index}>
                      {data.inexType && data.inexType.taxonomy === 'income' ? (
                        <View style={styles.flatListItem2} key={index}>
                          <View style={styles.textContainer}>
                            <Text style={styles.text} numberOfLines={2}>
                              {data.inexType &&
                                data.inexType.inexName &&
                                data.inexType.inexName.categoryName}
                            </Text>
                          </View>
                          <View style={styles.textContainer}>
                            <Text style={styles.text} numberOfLines={2}>
                              {formatDateToDateName(data.date)}
                            </Text>
                          </View>
                          <View style={styles.textContainer}>
                            <Text style={styles.text} numberOfLines={2}>
                              {data.amount}
                            </Text>
                          </View>
                        </View>
                      ) : (
                        ''
                      )}
                    </View>
                  );
                })}
              <View style={styles.ExpenseCon}>
                <View></View>
              </View>
            </View>
          ) : (
            ''
          )}
          <View style={styles.TotalContainer}>
            <Text style={styles.bottomTitle}>
              {t('total_margin') + '(' + currency + ')'}:{' '}
            </Text>
            <Text style={[styles.bottomTitle, styles.amountText]}>
              {
                <ShowTotalMargin
                  expense={
                    farmAccountSingle && farmAccountSingle.income_expense
                  }
                  income={farmAccountSingle && farmAccountSingle.income_expense}
                />
              }
            </Text>
            <Text style={styles.bottomTitle}></Text>
          </View>
        </ScrollView>
      </View>
    </FarmerDrawerScreenWrapper1>
  );
};

export default FarmIncomeExpenseView;

const styles = StyleSheet.create({
  container: {
    marginHorizontal: '5%',
    marginTop: '5%',
  },
  farmContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 10,
    elevation: 8,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  farmContainerItemLeft: {
    width: '40%',
    paddingLeft: 15,
  },
  farmContainerItemRight: {
    width: '60%',
    paddingLeft: 40,
  },
  farmTitle: {
    color: Colors.text,
    marginVertical: 3,
    fontFamily: 'Poppins-Regular',
  },
  farmTitleRe: {
    color: Colors.text,
    marginVertical: 3,
    fontFamily: 'Poppins-SemiBold',
    textAlign: 'right',
    alignSelf: 'flex-end',
  },
  ExpenseContainer: {
    // marginTop: 10,
    backgroundColor: '#6F7E8C',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
    alignItems: 'center',
    // borderBottomLeftRadius: 12,
    // borderBottomRightRadius: 12,
    borderWidth: 0.5,
    borderColor: 'red',
  },
  TotalContainer: {
    backgroundColor: Colors.useGreen,
    flexDirection: 'row',
    justifyContent: 'center', // Center horizontally
    alignItems: 'center', // Center vertically
    paddingVertical: 15,
    marginHorizontal: 16,
    borderRadius: 25,
    marginTop: 10,
    marginBottom: 5,
  },
  ExpenseTitle: {
    color: 'red',
    fontFamily: 'Poppins-Bold',
    fontSize: 18,
  },
  IncomeHeadingTitle: {
    color: '#005C08',
    fontFamily: 'Poppins-Bold',
    fontSize: 18,
  },
  subTitle: {
    color: 'white',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
  },
  bottomTitle: {
    color: 'white',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    textAlign: 'center',
  },
  ExpenseCon: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ExpenseConItem: {
    width: '100%',
    backgroundColor: '#FFEBEE',
    marginTop: 20,
    // paddingVertical: 8,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    // paddingLeft: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderWidth: 0.5,
    borderColor: 'red',
  },
  IncomeConItem: {
    width: '100%',
    backgroundColor: '#d9fbdbff',
    marginTop: 20,
    // paddingVertical: 8,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    // paddingLeft: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderWidth: 0.5,
    borderColor: 'green',
  },
  IncomeContainer: {
    backgroundColor: '#6F7E8C',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: 'green',
  },
  IncomeTitle: {
    color: '#FFF',
    fontWeight: '600',
  },
  flatListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingVertical: 15,
    elevation: 5,
    borderWidth: 0.5,
    borderColor: 'red',
  },
  flatListItem2: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingVertical: 15,
    elevation: 5,
    borderWidth: 0.5,
    borderColor: 'green',
  },
  textContainer: {
    flex: 1,
    marginHorizontal: 5,
    justifyContent: 'center',
  },
  text: {
    color: '#000',
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    textAlign: 'center',

    includeFontPadding: false,
    flexShrink: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 5,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,

    // borderWidth: 1,
    // borderColor: Colors.borderGreen,
  },
  cardTitle: {
    fontSize: 16,

    color: Colors.borderGreen,
    marginBottom: 12,
    fontFamily: 'Poppins-SemiBold',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
    paddingHorizontal: 5,
    paddingHorizontal: 10,
  },
  infoTextContainer: {
    marginLeft: 10,
    flex: 1,
    marginVertical: 5,
    flexDirection: 'row',
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.text,
    fontFamily: 'Poppins-SemiBold',
  },
  infoValue: {
    fontSize: 14,
    color: Colors.text,
    fontFamily: 'Poppins-Regular',
    textAlign: 'right',
    alignSelf: 'flex-end',
  },
  amountText: {
    marginLeft: 8, // Adds space between label and amount
    fontFamily: 'Poppins-SemiBold', // Optional: make amount stand out
  },
  ///////////////////////////////////////////////////////
  //   container: {
  //     marginHorizontal: '2.5%',
  //   },
  //   farmContainer: {
  //     flexDirection: 'row',
  //     justifyContent: 'space-between',
  //   },
  //   farmContainerItemLeft: {
  //     width: '40%',
  //   },
  //   farmContainerItemRight: {
  //     width: '60%',
  //   },
  //   farmTitle: {
  //     color: '#000',
  //     marginVertical: 1,
  //     fontFamily: 'Poppins-Regular',
  //     fontSize: 14,
  //   },
  //   ExpenseContainer: {
  //     marginTop: 10,
  //     backgroundColor: 'green',
  //     flexDirection: 'row',
  //     justifyContent: 'space-around',
  //     paddingVertical: 8,
  //     borderRadius: 7,
  //     alignItems: 'center',
  //   },
  //   ExpenseTitle: {
  //     color: '#FFF',
  //     fontFamily: 'Poppins-Regular',
  //     fontSize: 14,
  //   },
  //   ExpenseCon: {
  //     flexDirection: 'row',
  //     justifyContent: 'space-between',
  //   },
  //   ExpenseConItem: {
  //     width: '60%',
  //     backgroundColor: 'green',
  //     marginTop: 20,
  //     paddingVertical: 8,
  //     borderRadius: 7,
  //     paddingLeft: 10,
  //   },
  //   IncomeContainer: {
  //     marginTop: 20,
  //     backgroundColor: 'green',
  //     flexDirection: 'row',
  //     justifyContent: 'space-around',
  //     paddingVertical: 8,
  //     borderRadius: 7,
  //     alignItems: 'center',
  //   },
  //   IncomeTitle: {
  //     color: '#FFF',
  //     fontFamily: 'Poppins-Regular',
  //     fontSize: 14,
  //   },
  //   flatListItem: {
  //     flexDirection: 'row',
  //     justifyContent: 'space-around',
  //     marginVertical: 10,
  //     backgroundColor: '#FFF',
  //     paddingVertical: 10,
  //     borderRadius: 10,
  //     elevation: 5,
  //   },
  //   text: {
  //     color: '#000',
  //   },
});
