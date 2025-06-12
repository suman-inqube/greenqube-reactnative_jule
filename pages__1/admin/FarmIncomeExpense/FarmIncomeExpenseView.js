import { StyleSheet, Text, View, ScrollView } from 'react-native'
import React, { useState, useContext } from 'react'
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { formatDateToDateName } from '../../Common/DateChanger';
import { userCreateContext } from '../../Context/usersCreateContext';
const FarmIncomeExpenseView = ({ route }) => {
    //GQR-67
    const { loginUser_data, CustomHeader, t, onBackPress, logoImage, LoadingScreen, getItem, topBanner, FormsTitle } = useContext(userCreateContext);
    const { dbname, lan_id, token, user_id, owner } = loginUser_data;
    //GQR-67
    const navigation = useNavigation();
    const [farmAccountSingle, setFarmAccountSingle] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [currency, setcurrency] = useState("");
    const onPageLoad = async () => {
        const [farmInExId, curr] = await Promise.all([
            getItem('farm_in_ex_id'),
            getItem('currency')
        ])
        setcurrency(curr)
        if (farmInExId) {
            setFarmAccountSingle(farmInExId);
            setIsLoading(false);
        }
    }
    const ShowIncome = (props) => {
        const incomeItem = props.income && props.income.filter(item1 => item1.inexType?.taxonomy === 'income');
        if (incomeItem) {
            let incomeAmount = 0;
            incomeItem.forEach(element => {
                incomeAmount += parseInt(element.amount)
            });
            return incomeAmount + ".0"
        }
    }
    const ShowExpense = (props) => {
        const expenseItem = props.expense && props.expense.filter(item1 => item1.inexType?.taxonomy === 'expense');
        if (expenseItem) {
            let expenseAmount = 0;
            expenseItem.forEach(element => {
                expenseAmount += parseInt(element.amount)
            });
            return expenseAmount + ".0"
        }
    }
    const ShowTotalMargin = (props) => {
        let expenseAmount = 0;
        let incomeAmount = 0;
        const expenseItem = props.expense && props.expense.filter(item1 => item1.inexType?.taxonomy === 'expense');
        if (expenseItem) {
            expenseItem.forEach(element => {
                expenseAmount += parseInt(element.amount)
            });
        }
        const incomeItem = props.income && props.income.filter(item1 => item1.inexType?.taxonomy === 'income');
        if (incomeItem) {
            incomeItem.forEach(element => {
                incomeAmount += parseInt(element.amount)
            });
        }
        return incomeAmount - expenseAmount + ".0"
    }
    useFocusEffect(
        React.useCallback(() => {
            onPageLoad();
            onBackPress(() => { navigation.navigate('FarmIncomeExpenseList'); return true; })
        }, [])
    );
    const HandlerGoBack = () => navigation.navigate('FarmIncomeExpenseList');

    return (
        <View style={{ flex: 1 }}>
            <CustomHeader path={'FarmIncomeExpenseList'} HandlerGoBack={HandlerGoBack} logoImage={logoImage} topBanner={topBanner} />
            <FormsTitle title={t('income_expense_list')} />
            <ScrollView showsVerticalScrollIndicator={false}>
                {
                    isLoading ?
                        <LoadingScreen />
                        :
                        farmAccountSingle ?
                            <View style={styles.container}>
                                <View style={styles.farmContainer}>
                                    <View style={styles.farmContainerItemLeft}>
                                        <Text style={styles.farmTitle}>{t('enter_farmer_s_name')} : </Text>
                                        <Text style={styles.farmTitle}>{t('farmer_number')} :</Text>
                                        <Text style={styles.farmTitle}>{t('addcrop_plot')} : </Text>
                                        <Text style={styles.farmTitle}>{t('crop_name')} : </Text>
                                        <Text style={styles.farmTitle}>{t('pre_land_size')} : </Text>
                                        <Text style={styles.farmTitle}>{t('showing_date')}: </Text>
                                        <Text style={styles.farmTitle}>{t('harvesting_date_auto_calculated')} : </Text>
                                    </View>
                                    <View style={styles.farmContainerItemRight}>
                                        <Text style={styles.farmTitle}>{farmAccountSingle.agri_user && farmAccountSingle.agri_user.userName}</Text>
                                        <Text style={styles.farmTitle}>{farmAccountSingle.agri_user && farmAccountSingle.agri_user.contactNumber}</Text>
                                        <Text style={styles.farmTitle}>{farmAccountSingle.land_info && farmAccountSingle.land_info.plot_no}</Text>
                                        <Text style={styles.farmTitle}>{farmAccountSingle.crop_name && farmAccountSingle.crop_name.name}</Text>
                                        <Text style={styles.farmTitle}>{farmAccountSingle.plot_size && farmAccountSingle.plot_size}</Text>
                                        <Text style={styles.farmTitle}>{formatDateToDateName(farmAccountSingle.sowing_date)}</Text>
                                        <Text style={styles.farmTitle}>{formatDateToDateName(farmAccountSingle.harvesting_date)}</Text>
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
                                    <Text style={styles.ExpenseTitle}>{t('amount') + "(" + currency + ")"}</Text>
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

export default FarmIncomeExpenseView

const styles = StyleSheet.create({
    container: {
        marginHorizontal: '2.5%',
    },
    farmContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    farmContainerItemLeft: {
        width: '40%'
    },
    farmContainerItemRight: {
        width: '60%'
    },
    farmTitle: {
        color: '#000',
        marginVertical: 1,
        fontFamily: 'Poppins-Regular',
        fontSize: 14
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
        fontFamily: 'Poppins-Regular',
        fontSize: 14
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
        fontFamily: 'Poppins-Regular',
        fontSize: 14
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
        color: '#000'
    }
})