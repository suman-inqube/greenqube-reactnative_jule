import {BackHandler, StyleSheet, Text, View, ScrollView} from 'react-native';
import React, {useState, useContext} from 'react';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {formatDateToDateName} from '../../Common/DateChanger';
import {userCreateContext} from '../../Context/usersCreateContext';
import FarmerDrawerScreenWrapper1 from '../FarmerDrawerScreenWrapper1';
import {Colors, Fonts} from '../../utils/Constants';
const FarmerFarmIncomeExpenseView = ({route}) => {
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
  const [currency, setcurrency] = useState('');
  const navigation = useNavigation();
  const [dbLanTokUsr, setdbLanTokUsr] = useState({});
  const [farmAccountSingle, setFarmAccountSingle] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const onPageLoad = async () => {
    const [curr, farmInExId] = await Promise.all([
      getItem('currency'),
      getItem('farm_in_ex_id'),
    ]);
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
        incomeAmount += parseInt(element.amount);
      });
      return incomeAmount + '.0';
    }
  };

  const ShowExpense = props => {
    const expenseItem =
      props.expense &&
      props.expense.filter(item1 => item1.inexType?.taxonomy === 'expense');
    if (expenseItem) {
      let expenseAmount = 0;
      expenseItem.forEach(element => {
        expenseAmount += parseInt(element.amount);
      });
      return expenseAmount + '.0';
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
        expenseAmount += parseInt(element.amount);
      });
    }

    const incomeItem =
      props.income &&
      props.income.filter(item1 => item1.inexType?.taxonomy === 'income');
    if (incomeItem) {
      incomeItem.forEach(element => {
        incomeAmount += parseInt(element.amount);
      });
    }
    return incomeAmount - expenseAmount + '.0';
  };

  useFocusEffect(
    React.useCallback(() => {
      onPageLoad();
      onBackPress(() => {
        navigation.navigate('FarmerFarmIncomeExpenseList');
        return true;
      });
    }, []),
  );
  const HandlerGoBack = () =>
    navigation.navigate('FarmerFarmIncomeExpenseList');
  return (
    <FarmerDrawerScreenWrapper1>
      <View style={{flex: 1, backgroundColor: Colors.pageBackground}}>
        <CustomHeader
          path={'FarmerFarmIncomeExpenseList'}
          HandlerGoBack={HandlerGoBack}
          logoImage={logoImage}
          topBanner={topBanner}
        />
        <FormsTitle title={t('income_expense_list')} />
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          {isLoading ? (
            <LoadingScreen />
          ) : farmAccountSingle ? (
            <View style={styles.container}>
              <View style={styles.farmContainer}>
                <View style={styles.farmContainerItemLeft}>
                  <Text style={styles.farmTitle}>
                    {t('enter_farmer_s_name')} :{' '}
                  </Text>
                  <Text style={styles.farmTitle}>{t('farmer_number')} :</Text>
                  <Text style={styles.farmTitle}>{t('addcrop_plot')} : </Text>
                  <Text style={styles.farmTitle}>{t('crop_name')} : </Text>
                  <Text style={styles.farmTitle}>{t('pre_land_size')} : </Text>
                  <Text style={styles.farmTitle}>{t('showing_date')}: </Text>
                  <Text style={styles.farmTitle}>
                    {t('harvesting_date_auto_calculated')} :{' '}
                  </Text>
                </View>
                <View style={styles.farmContainerItemRight}>
                  <Text style={styles.farmTitleRe}>
                    {farmAccountSingle.agri_user &&
                      farmAccountSingle.agri_user.userName}
                  </Text>
                  <Text style={styles.farmTitleRe}>
                    {farmAccountSingle.agri_user &&
                      farmAccountSingle.agri_user.contactNumber}
                  </Text>
                  <Text style={styles.farmTitleRe}>
                    {farmAccountSingle.land_info &&
                      farmAccountSingle.land_info.plot_no}
                  </Text>
                  <Text style={styles.farmTitleRe}>
                    {farmAccountSingle.crop_name &&
                      farmAccountSingle.crop_name.name}
                  </Text>
                  <Text style={styles.farmTitleRe}>
                    {farmAccountSingle.plot_size && farmAccountSingle.plot_size}
                  </Text>
                  <Text style={styles.farmTitleRe}>
                    {formatDateToDateName(farmAccountSingle.sowing_date)}
                  </Text>
                  <Text style={styles.farmTitleRe}>
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
                          <Text style={styles.text}>
                            {data.inexType &&
                              data.inexType.inexName &&
                              data.inexType.inexName.categoryName}
                          </Text>
                          <Text style={styles.text}>
                            {formatDateToDateName(data.date)}
                          </Text>
                          <Text style={styles.text}>{data.amount}</Text>
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
                          <Text style={styles.text}>
                            {data.inexType &&
                              data.inexType.inexName &&
                              data.inexType.inexName.categoryName}
                          </Text>
                          <Text style={styles.text}>
                            {formatDateToDateName(data.date)}
                          </Text>
                          <Text style={styles.text}>{data.amount}</Text>
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
        </ScrollView>
        <View style={styles.TotalContainer}>
          <Text style={styles.bottomTitle}>
            {t('total_margin') + '(' + currency + ')'}:{' '}
          </Text>
          <Text style={styles.bottomTitle}>
            {
              <ShowTotalMargin
                expense={farmAccountSingle && farmAccountSingle.income_expense}
                income={farmAccountSingle && farmAccountSingle.income_expense}
              />
            }
          </Text>
          <Text style={styles.bottomTitle}></Text>
        </View>
      </View>
    </FarmerDrawerScreenWrapper1>
  );
};

export default FarmerFarmIncomeExpenseView;

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
    borderColor: '#6F7E8C',
  },
  TotalContainer: {
    // marginTop: 10,
    backgroundColor: Colors.useGreen,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    alignItems: 'center',
    marginHorizontal: 10,
    borderRadius: 30,
    marginTop: 10,
    marginBottom: 5,
    // borderBottomLeftRadius: 12,
    // borderBottomRightRadius: 12,
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
    justifyContent: 'space-around',
    // marginVertical: 10,
    backgroundColor: '#FFF',
    paddingVertical: 15,
    // borderRadius: 10,
    elevation: 5,
    // borderBottomWidth: 1,
    borderWidth: 0.5,
    borderColor: 'red',
  },
  flatListItem2: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    // marginVertical: 10,
    backgroundColor: '#FFF',
    paddingVertical: 15,
    // borderRadius: 10,
    elevation: 5,
    // borderBottomWidth: 1,
    borderWidth: 0.5,
    borderColor: 'green',
  },
  text: {
    color: '#000',
    fontFamily: 'Poppins-Regular',
  },
  scrollContent: {
    paddingBottom: 30, // Extra padding at bottom
  },
});
