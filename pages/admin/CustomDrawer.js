import React, { memo,useContext } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import { StackActions, useNavigation } from '@react-navigation/native';
import { userCreateContext } from '../Context/usersCreateContext';
const CustomDrawer = (props) => {
    const { loginUser_data, t, getItem, removeItem, DeviceInfo } = useContext(userCreateContext);
    const { dbname, lan_id, token, user_id, carbonFlag } = loginUser_data;
    const { netConnection } = DeviceInfo();
    const navigation = useNavigation();
    const handleLogout = async () => {
        Alert.alert(
            `${t('app_name')}`,
            `${t('close_app')}`,
            [
                { text: `${t('cancle')}`, onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                { text: `${t('ok')}`, onPress: () => { removeData() } },
            ],
            { cancelable: false });
    }
    const removeData = async () => {
        if (netConnection) {
            await Promise.all([
                removeItem("logoImageData"),
                removeItem('loginUser_data'),
                removeItem("profileImgData"),
                removeItem("userNameData"),
                removeItem("userType"),
                removeItem("bottomBannerData"),
                removeItem("topBannerData"),
                removeItem('currency'),
                removeItem('fcmToken'),
                removeItem('company_website'),
            ]);
            const popAction = StackActions.pop(1);
            navigation.dispatch(popAction);
            navigation.navigate('Login');
        } else {
            Alert.alert("You are offline hence cannot proceed");
        }
    }
    const navigateToPages = (pageName) => {
        if (netConnection) {
            navigation.navigate(pageName, { onPageName: "CustomDrawer" });
        }
    };
    return (
        <View>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={{ marginBottom: 80 }}>
                    <TouchableOpacity style={[styles.container, props.style]} activeOpacity={1} onPress={() => props.setModalVisible(!props.modalVisible)}>
                        <View style={styles.modalView}>
                            <TouchableOpacity style={styles.memuContainer} onPress={() => navigateToPages('Profile')}>
                                <View style={[styles.menuItem, { marginTop: 8 }]}>
                                    <Image source={require('../Common/images/user_menu.png')}
                                        style={[{ height: 28, width: 28, tintColor: '#FFF' }]} />
                                    <Text style={styles.menuText}>{t('profile')}</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.memuContainer} onPress={() => navigateToPages('Business')}>
                                <View style={styles.menuItem}>
                                    <Image source={require('../Common/images/inncome_expence_menu.png')}
                                        style={[{ height: 30, width: 30, tintColor: '#FFF' }]} />
                                    <Text style={styles.menuText}>{t('traceability')}</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.memuContainer} onPress={() => navigateToPages('DailySalesReport')}>
                                <View style={styles.menuItem}>
                                    <Image source={require('../Common/images/dash_sale_your_product_off.png')}
                                        style={[{ height: 30, width: 30, tintColor: '#FFF' }]} />
                                    <Text style={styles.menuText}>{t('daily_sales_report')}</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.memuContainer} onPress={() => navigateToPages('TraingList')}>
                                <View style={styles.menuItem}>
                                    <Image source={require('../Common/images/soil.png')}
                                        style={[{ height: 30, width: 30, tintColor: '#FFF' }]} />
                                    <Text style={styles.menuText}>{t('training_support')}</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.memuContainer} onPress={() => navigateToPages('FarmIncomeExpenseList')}>
                                <View style={styles.menuItem}>
                                    <Image source={require('../Common/images/insurance_menu.png')}
                                        style={[{ height: 25, width: 25 }]} />
                                    <Text style={styles.menuText}>{t('farm_income_amp_expense')}</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.memuContainer} onPress={() => navigateToPages('Loan')}>
                                <View style={styles.menuItem}>
                                    <Image source={require('../Common/images/dash_apply_for_loan_off.png')}
                                        style={[{ height: 30, width: 30, tintColor: '#FFF' }]} />
                                    <Text style={styles.menuText}>{t('loan_ninquiry_far_dash')}</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.memuContainer} onPress={() => navigateToPages('InsuranceEnquiry')}>
                                <View style={styles.menuItem}>
                                    <Image source={require('../Common/images/dash_apply_for_insurance_off.png')}
                                        style={[{ height: 30, width: 30, tintColor: '#FFF' }]} />
                                    <Text style={styles.menuText}>{t('ins_inq_far_dash')}</Text>
                                </View>
                            </TouchableOpacity>
                             {carbonFlag ?<TouchableOpacity style={styles.memuContainer} onPress={() => navigateToPages('InstrumentWiseActivityView')}>
                                <View style={styles.menuItem}>
                                    <Image source={require('../Common/images/activity_report_only.png')}
                                        style={[{ height: 30, width: 30, tintColor: '#FFF' }]} />
                                    <Text style={styles.menuText}>{t('Instrument Wise Activity View')}</Text>
                                </View>
                            </TouchableOpacity>: ""}
                            <TouchableOpacity style={styles.memuContainer} onPress={() => navigateToPages('ChangePassword')}>
                                <View style={styles.menuItem}>
                                    <Image source={require('../Common/images/change_password_white.png')}
                                        style={[{ height: 30, width: 30 }]} />
                                    <Text style={styles.menuText}>{t('change_password')}</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.memuContainer} onPress={() => handleLogout()}>
                                <View style={styles.menuItem}>
                                    <Image source={require('../Common/images/logout.png')}
                                        style={[{ height: 25, width: 25 }]} />
                                    <Text style={styles.menuText}>{t('sign_out')}</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    )
}
export default memo(CustomDrawer)
const styles = StyleSheet.create({
    container: {
        // position: 'absolute',
        // bottom: '16%',
        // width: '100%',
        // position:'relative'
        marginTop: 30
    },
    modalView: {
        // flex: 1, width: '70%', height: Dimensions.get('window').height,
        // backgroundColor: '#023913',
        // position: 'absolute',
        // top: 5,
        // right: 0,
    },
    memuContainer: {
        paddingVertical: 8,
        paddingHorizontal: 15,
        backgroundColor: '#023913'
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1.5,
        borderBottomColor: '#ebffaa',
        paddingBottom: 5
    },
    menuText: {
        marginLeft: 10,
        fontSize: 15,
        color: '#FFF',
        fontFamily: 'Poppins-Regular'
    }

})