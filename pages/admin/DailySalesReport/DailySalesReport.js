import { StyleSheet, Text, View, TouchableOpacity, FlatList, ScrollView, BackHandler } from 'react-native'
import React, { useState, useEffect, useCallback } from 'react';
import CustomHeader from '../CustomHeader';
import FormsTitle from '../../Common/FormsTitle';
import { getItem, setItem } from '../../../config/getDataFromStorage';
import { DailySalesReportGetAPI } from '../../../config/apiHere';
import LoadingScreen from '../../Common/LoadingScreen';
import { useTranslation } from 'react-i18next';
import { useIsFocused } from '@react-navigation/native';
const DailySalesReport = ({ navigation }) => {
    const isFocused = useIsFocused();
    const { t } = useTranslation();
    const [dbLanTokUsr, setdbLanTokUsr] = useState({
        dbName: '',
        languageID: '',
        token: '',
        userID: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [dailySalesReportData, setDailySalesReportData] = useState([]);
    const onPageLoad = async () => {
        setIsLoading(true);
        const loginUser_data = await getItem('loginUser_data');
        if (loginUser_data) {
            const dbName = loginUser_data.dbname;
            const languageID = loginUser_data.lan_id;
            const token = loginUser_data.token;
            const userID = loginUser_data.user_id;
            setdbLanTokUsr({
                ...dbLanTokUsr,
                dbName: dbName,
                languageID: languageID,
                token: token,
                userID: userID
            })
            const response = await DailySalesReportGetAPI(dbName, languageID, token, userID);
            if (response) {
                setIsLoading(false);
                setDailySalesReportData(response.data.data.rows);
            }
        }
    };
    useEffect(() => {
        if (isFocused) {
            onPageLoad();
            const onBackPress = () => {
                // setuserList([]);
                navigation.navigate('Dashboard'); return true;
            };
            BackHandler.addEventListener('hardwareBackPress', onBackPress);
            return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
        }
    }, [isFocused])
    const HandlerGoBack = () => {
        navigation.navigate('Dashboard');
    }
    return (
        <View style={{ flex: 1 }}>
            <CustomHeader path='Dashboard' HandlerGoBack={HandlerGoBack} />
            <FormsTitle title={"Daily Sales Report"} />
            <View style={styles.btnContainer}>
                <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('DealerReport')}>
                    <Text style={styles.btnText}>{t('dealer_report')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('FarmerReport')}>
                    <Text style={styles.btnText}>{t('farmer_report')}</Text>
                </TouchableOpacity>
            </View>
            {isLoading && <View style={styles.loadingScreen}><LoadingScreen /></View>}
            <FlatList
                showsVerticalScrollIndicator={false}
                data={dailySalesReportData}
                renderItem={({ item }) => {
                    return (
                        <TouchableOpacity style={styles.flatListContainer} onPress={() => navigation.navigate('SalesDetail', item)}>
                            <View style={styles.flatListItemLeft}>
                                <Text style={styles.flatTitle}>{t('name')}: {item.salesUser.userName.substring(-1, 12)}{item.salesUser.userName.length > 11 ? "..." : ""}</Text>
                                <Text style={styles.flatTitle}>{t('number_caps')} : {item.salesUser.contactNumber.substring(-1, 10)}</Text>
                            </View>
                            <View style={styles.flatListItemRight}>
                                <Text style={styles.flatTitle}>{item.srProducts.length != 0 && item.srProducts[0].salesProduct != null ? `${t('product_name')}: ${item.srProducts[0].salesProduct.product_name}` : item.srProducts.length != 0 && item.srProducts[0].salesProduceName != null ? `${t('product_name')}: ${item.srProducts[0].salesProduceName.name}` : ""}</Text>
                                {/* <Text style={styles.flatTitle}>{item.srProducts.length != 0 ? item.srProducts[0].qty != null || item.srProducts[0].unit != null ? `${t('select_quantity_input')}: ${item.srProducts[0].qty != null ? item.srProducts[0].qty : ''}  ${item.srProducts[0].unit != null ? item.srProducts[0].unit.substring(-1, 2) + "..." : ''}` : null : null}
                                </Text> */}
                            </View>
                        </TouchableOpacity>
                    )
                }}
                keyExtractor={(item, index) => index}
            />
        </View>
    )
}
export default DailySalesReport

const styles = StyleSheet.create({
    btnContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: '3%',
        marginBottom: 10
    },
    btn: {
        backgroundColor: '#49BB41',
        width: '45%',
        alignItems: 'center',
        paddingVertical: 10,
        borderRadius: 10,
        color: '#FFF'
    },
    btnText: {
        color: '#FFF',
        fontFamily: 'Poppins-SemiBold',
    },
    flatListContainer: {
        marginHorizontal: '3%',
        backgroundColor: '#FFF',
        marginVertical: 8,
        borderRadius: 10,
        elevation: 5,
        padding: 10,
        flexDirection: 'column',
        alignItems: 'center'
    },
    flatListItemLeft: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    flatListItemRight: {
        marginLeft: 3,
        width: '100%',
        // backgroundColor: 'red'
    },
    scrollContainer: {
        marginBottom: 380
    },
    flatTitle: {
        marginVertical: 1,
        color: '#000',
        fontFamily: 'Poppins-Regular',
        fontSize: 14,
    },
    loadingScreen: {
        position: 'relative',
        top: 100,
        zIndex: 999
    },
})