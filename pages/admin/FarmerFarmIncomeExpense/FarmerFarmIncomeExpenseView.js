import { BackHandler, StyleSheet, Text, View, ScrollView, FlatList } from 'react-native'
import React, { useState } from 'react'
import CustomHeader from '../CustomHeader';
import FormsTitle from '../../Common/FormsTitle';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { getItem } from '../../../config/getDataFromStorage';
import LoadingScreen from '../../Common/LoadingScreen';
import { formatDateToDateName } from '../../Common/DateChanger';
import { useTranslation } from 'react-i18next';
const FarmerFarmIncomeExpenseView = ({ route }) => {
    const { t } = useTranslation();
    const [currency, setcurrency] = useState("");
    const navigation = useNavigation();
    const [dbLanTokUsr, setdbLanTokUsr] = useState({});
    const [farmAccountSingle, setFarmAccountSingle] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const onPageLoad = async () => {
        const [curr, farmInExId] = await Promise.all([
            getItem('currency'),
            getItem('farm_in_ex_id')
        ])
        setcurrency(curr)
        if (farmInExId) {
            setFarmAccountSingle(farmInExId)
            setIsLoading(false)
        }

    }
    const ShowIncome = (props) => {
        const incomeItem = props.income && props.income.filter(item1 => item1.inexType?.taxonomy === 'income');
        if (incomeItem) {
            let incomeAmount = 0;
            incomeItem.forEach(element => {
                // console.log(element.amount);
                incomeAmount += parseInt(element.amount)
            });
            return incomeAmount + ".0"
        }
    }

    const ShowExpense = (props) => {
        //   return   console.log(props);
        const expenseItem = props.expense && props.expense.filter(item1 => item1.inexType?.taxonomy === 'expense');
        if (expenseItem) {
            let expenseAmount = 0;
            expenseItem.forEach(element => {
                // console.log(element.amount);
                expenseAmount += parseInt(element.amount)
            });
            return expenseAmount + ".0"
        }

    }
    const ShowTotalMargin = (props) => {
        //   return   console.log(props);
        let expenseAmount = 0;
        let incomeAmount = 0;
        const expenseItem = props.expense && props.expense.filter(item1 => item1.inexType?.taxonomy === 'expense');
        if (expenseItem) {
            expenseItem.forEach(element => {
                // console.log(element.amount);
                expenseAmount += parseInt(element.amount)
            });
        }

        const incomeItem = props.income && props.income.filter(item1 => item1.inexType?.taxonomy === 'income');
        if (incomeItem) {
            incomeItem.forEach(element => {
                // console.log(element.amount);
                incomeAmount += parseInt(element.amount)
            });
        }
        return incomeAmount - expenseAmount + ".0"
    }

    useFocusEffect(
        React.useCallback(() => {
            onPageLoad();
            const onBackPress = () => { navigation.navigate('FarmerFarmIncomeExpenseList'); return true; };
            BackHandler.addEventListener('hardwareBackPress', onBackPress);
            return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
        }, [])
    );
    const HandlerGoBack = () => {
        navigation.navigate('FarmerFarmIncomeExpenseList');
    }
    return (
        <View style={{ flex: 1 }}>
            <CustomHeader path={'FarmerFarmIncomeExpenseList'} HandlerGoBack={HandlerGoBack} />
            <FormsTitle title={t('income_expense_list')} />
            <ScrollView showsVerticalScrollIndicator={false}>
                {
                    isLoading ?
                        <LoadingScreen />
                        :
                        farmAccountSingle ?
                            <View style={styles.container}>
                                <View style={styles.farmContainer}>
                                    <View style={styles.farmContainerItem}>
                                        <Text style={styles.farmTitle}>{t('enter_farmer_s_name')} : {farmAccountSingle.agri_user && farmAccountSingle.agri_user.userName.substring(0, 6) + '..'}</Text>
                                        <Text style={styles.farmTitle}>{t('addcrop_plot')} : {farmAccountSingle.land_info && farmAccountSingle.land_info.plot_no.substring(0, 4) + '..'}</Text>
                                        <Text style={styles.farmTitle}>{t('showing_date')}: {formatDateToDateName(farmAccountSingle.sowing_date).substring(0, 7) + '..'}</Text>
                                        <Text style={styles.farmTitle}>{t('pre_land_size')} : {farmAccountSingle.plot_size && farmAccountSingle.plot_size.substring(0, 4) + '..'}</Text>
                                    </View>
                                    <View style={styles.farmContainerItem}>
                                        <Text style={styles.farmTitle}>{t('farmer_number')} :{farmAccountSingle.agri_user && farmAccountSingle.agri_user.contactNumber.substring(0, 5) + '..'}</Text>
                                        <Text style={styles.farmTitle}>{t('crop_name')} : {farmAccountSingle.crop_name && farmAccountSingle.crop_name.name.substring(0, 4) + '..'}</Text>
                                        <Text style={styles.farmTitle}>{t('harvesting_date_auto_calculated')} : {formatDateToDateName(farmAccountSingle.harvesting_date).substring(0, 6) + '..'}</Text>
                                    </View>
                                </View>
                                <View style={styles.ExpenseContainer}>
                                    <Text style={styles.ExpenseTitle}>{t('expense_head')}</Text>
                                    <Text style={styles.ExpenseTitle}>{t('date')}</Text>
                                    <Text style={styles.ExpenseTitle}>{t('amount') + "(" + currency + ")"}</Text>
                                </View>
                                {
                                    farmAccountSingle.income_expense && farmAccountSingle.income_expense.map((data, index) => {
                                        return (
                                            <View key={index}>
                                                {
                                                    data.inexType && data.inexType.taxonomy === 'expense'
                                                        ?
                                                        <View style={styles.flatListItem} key={index}>
                                                            <Text style={styles.text}>{data.inexType && data.inexType.inexName && data.inexType.inexName.categoryName}</Text>
                                                            <Text style={styles.text}>{formatDateToDateName(data.date)}</Text>
                                                            <Text style={styles.text}>{data.amount}</Text>
                                                        </View>
                                                        : ''
                                                }
                                            </View>

                                        )
                                    })
                                }
                                <View style={styles.ExpenseCon}>
                                    <View></View>
                                    <View style={styles.ExpenseConItem}>
                                        <Text style={styles.ExpenseTitle}>{t('total_exp_sum') + "(" + currency + ")"} : {<ShowExpense expense={farmAccountSingle && farmAccountSingle.income_expense} />}</Text>
                                    </View>
                                </View>
                                <View style={styles.IncomeContainer}>
                                    <Text style={styles.IncomeTitle}>{t('income_head')}</Text>
                                    <Text style={styles.IncomeTitle}>{t('date')}</Text>
                                    <Text style={styles.IncomeTitle}>{t('amount') + "(" + currency + ")"}</Text>
                                </View>
                                {
                                    farmAccountSingle.income_expense && farmAccountSingle.income_expense.map((data, index) => {
                                        return (

                                            <View key={index}>
                                                {
                                                    data.inexType && data.inexType.taxonomy === 'income'
                                                        ?
                                                        <View style={styles.flatListItem} key={index}>
                                                            <Text style={styles.text}>{data.inexType && data.inexType.inexName && data.inexType.inexName.categoryName}</Text>
                                                            <Text style={styles.text}>{formatDateToDateName(data.date)}</Text>
                                                            <Text style={styles.text}>{data.amount}</Text>
                                                        </View>
                                                        : ''
                                                }
                                            </View>

                                        )
                                    })
                                }
                                <View style={styles.ExpenseCon}>
                                    <View></View>
                                    <View style={styles.ExpenseConItem}>
                                        <Text style={styles.ExpenseTitle}>{t('total_income_sum') + "(" + currency + ")"} : {<ShowIncome income={farmAccountSingle && farmAccountSingle.income_expense} />}</Text>
                                    </View>
                                </View>
                            </View>
                            : ''
                }

                <View style={styles.ExpenseContainer}>
                    <Text style={styles.ExpenseTitle}>{t('total_margin') + "(" + currency + ")"}: </Text>
                    <Text style={styles.ExpenseTitle}>{<ShowTotalMargin expense={farmAccountSingle && farmAccountSingle.income_expense} income={farmAccountSingle && farmAccountSingle.income_expense} />}</Text>
                    <Text style={styles.ExpenseTitle}></Text>

                </View>

            </ScrollView>
        </View>
    )
}

export default FarmerFarmIncomeExpenseView

const styles = StyleSheet.create({
    container: {
        marginHorizontal: '5%',
    },
    farmContainer: {
        flexDirection: 'row'
    },
    farmContainerItem: {
        width: '50%'
    },
    farmTitle: {
        color: '#000',
        marginVertical: 3,
    },
    ExpenseContainer: {
        marginTop: 10,
        backgroundColor: 'green',
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 8,
        borderRadius: 7,
        alignItems: 'center'
    },
    ExpenseTitle: {
        color: '#FFF',
        fontFamily: 'Poppins-Regular'
    },
    ExpenseCon: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    ExpenseConItem: {
        width: '60%',
        backgroundColor: 'green',
        marginTop: 20,
        paddingVertical: 8,
        borderRadius: 7,
        paddingLeft: 10
    },
    IncomeContainer: {
        marginTop: 20,
        backgroundColor: 'green',
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 8,
        borderRadius: 7,
        alignItems: 'center'
    },
    IncomeTitle: {
        color: '#FFF',
        fontWeight: '600'
    },
    flatListItem: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginVertical: 10,
        backgroundColor: '#FFF',
        paddingVertical: 10,
        borderRadius: 10,
        elevation: 5
    },
    text: {
        color: '#000',
        fontFamily: 'Poppins-Regular'
    }
})