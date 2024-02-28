import { ScrollView, StyleSheet, Text, View, TouchableOpacity, Image, Linking, BackHandler } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'

import CustomHeader from '../CustomHeader';
import FormsTitle from '../../Common/FormsTitle';
import InputTextForm from '../../Common/InputTextForm';
import { getItem } from '../../../config/getDataFromStorage';
import DocumentPicker, { types } from 'react-native-document-picker';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
const FarmerLoanEnquiryDetail = () => {
    const { t } = useTranslation();
    const navigation = useNavigation();
    const route = useRoute();
    const [currency, setcurrency] = useState("");
    let plotArr = [];
    const { agri_files, agri_user, apx_annual_income,
        loan_amount, agri_loan_entity, existing_loan_amount, loan_plots } = route.params;
    const urlOpen = (path) => {
        Linking.openURL(path)
    }
    const onPageLoad = async () => {
        const curr = await getItem('currency');
        setcurrency(curr)

    };
    useEffect(() => {
        onPageLoad();
    }, [])
    useFocusEffect(

        useCallback(() => {
            const onBackPress = () => {
                navigation.navigate('FarmerLoan');
                return true;
            };
            BackHandler.addEventListener(
                'hardwareBackPress', onBackPress
            );
            return () =>
                BackHandler.removeEventListener(
                    'hardwareBackPress', onBackPress
                );
        }, [])
    );
    loan_plots.map((data, index) => {
        plotArr.push(data.agri_land_user_rel.plot_no)
    })
    const HandlerGoBack = () => {
        navigation.navigate('FarmerLoan');
    }
    return (
        <View style={{ flex: 1 }}>
            <CustomHeader path={'FarmerLoan'} HandlerGoBack={HandlerGoBack} />
            <FormsTitle title={t('loan_enquiry_detail')} />
            <ScrollView>
                <View style={styles.container}>
                    <InputTextForm label={t('farmer_name') + "(" + currency + ")"} value={agri_user.userName} />
                    <InputTextForm label={t('farmer_number')} value={agri_user.contactNumber} />
                    <InputTextForm label={t('loan_required_in_rupees') + "(" + currency + ")"} value={loan_amount} />
                    <InputTextForm label={t('annual_income') + "(" + currency + ")"} value={apx_annual_income} />
                    <InputTextForm label={t('loan_purpose')} value={agri_loan_entity.entity_name} />
                    <InputTextForm label={t('existing_loan_amount') + "(" + currency + ")"} value={existing_loan_amount} />
                    <InputTextForm label={t('plot')} value={plotArr.join()} />
                    <View style={styles.idcontainer}>
                        <Text style={styles.title}>{t('identity_proof')} </Text>
                        <View style={styles.idItemContainer}>
                            {
                                agri_files.map((data, index) => {
                                    if (data.term_type === "loan_identity") {
                                        return (
                                            <TouchableOpacity style={styles.idItem} onPress={() => urlOpen(data.file_path)} key={index}>
                                                <Image source={require('../../Common/images/document.png')} style={styles.idImage} />
                                                <Text style={styles.imageTitle}>{data.file_name}</Text>
                                            </TouchableOpacity>
                                        )
                                    }
                                })
                            }
                        </View>
                    </View>
                    <View style={styles.idcontainer}>
                        <Text style={styles.title}>{t('address_proof')} </Text>
                        <View style={styles.idItemContainer}>
                            {
                                agri_files.map((data, index) => {
                                    if (data.term_type === "loan_address") {
                                        return (
                                            <TouchableOpacity style={styles.idItem} onPress={() => urlOpen(data.file_path)} key={index}>
                                                <Image source={require('../../Common/images/document.png')} style={styles.idImage} />
                                                <Text style={styles.imageTitle}>{data.file_name}</Text>
                                            </TouchableOpacity>
                                        )
                                    }
                                })
                            }
                        </View>
                    </View>
                    <View style={styles.idcontainer}>
                        <Text style={styles.title}>{t('land_records')} </Text>
                        <View style={styles.idItemContainer}>
                            {
                                agri_files.map((data, index) => {
                                    if (data.term_type === "loan_land") {
                                        return (
                                            <TouchableOpacity style={styles.idItem} onPress={() => urlOpen(data.file_path)} key={index}>
                                                <Image source={require('../../Common/images/document.png')} style={styles.idImage} />
                                                <Text style={styles.imageTitle}>{data.file_name}</Text>
                                            </TouchableOpacity>
                                        )
                                    }
                                })
                            }
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    )
}

export default FarmerLoanEnquiryDetail

const styles = StyleSheet.create({
    container: {
        marginHorizontal: '5%'
    },
    idcontainer: {
        marginVertical: 10
    },
    idItemContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',

    },
    idItem: {
        padding: 10,
        width: '30%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    idImage: {
        width: 60,
        height: 60
    },
    imageTitle: {
        fontSize: 8,
        color: '#000',
        fontFamily: 'Poppins-Regular'
    },
    title: {
        color: '#000',
        fontFamily: 'Poppins-Regular'
    }

})