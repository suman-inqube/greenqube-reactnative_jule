import {
    StyleSheet, Text, View,
    TouchableOpacity, Image, Dimensions
} from 'react-native'
import React, { useState } from 'react'
import CustomHeader from '../CustomHeader';
import FormsTitle from '../../Common/FormsTitle';
import RequestForInsurance from './RequestForInsurance';
import ViewPastRequested from './ViewPastRequested';
import { useTranslation } from 'react-i18next';
import { Root, Popup, Toast } from 'react-native-popup-confirm-toast';
import { useRoute, useFocusEffect, useNavigation, useIsFocused, useNavigationState } from '@react-navigation/native';
const InsuranceEnquiry = () => {
    const { t } = useTranslation();
    const navigation = useNavigation();
    const [activeBtn, setActiveBtn] = useState(2);
    const HandlerGoBack = () => {
        navigation.navigate("Dashboard");

    }
    return (
        <View style={{ flex: 1, height: Dimensions.get('window').height / 2 }}>
            <CustomHeader path={'Dashboard'} HandlerGoBack={HandlerGoBack} />
            <FormsTitle title={t('insurance_inquiry')} />
            <View style={styles.container}>
                <View style={styles.btnContainer}>
                    <TouchableOpacity style={activeBtn === 1 ? styles.btnActive : styles.btn} onPress={() => setActiveBtn(1)}>
                        <Text style={activeBtn === 1 ? styles.btnActiveTitle : styles.btnTitle}>{t('request_for_ninsurance')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={activeBtn === 2 ? styles.btnActive : styles.btn} onPress={() => setActiveBtn(2)}>
                        <Text style={activeBtn === 2 ? styles.btnActiveTitle : styles.btnTitle}>{t('view_insurance_nrequested')}</Text>
                    </TouchableOpacity>
                </View>
            </View>
            {
                activeBtn === 1 ? <>
                    <RequestForInsurance setActiveBtn={setActiveBtn} />
                </> :
                    <ViewPastRequested setActiveBtn={setActiveBtn} />

            }
        </View>
    )
}

export default InsuranceEnquiry

const styles = StyleSheet.create({
    container: {
        marginHorizontal: '2.5%',
    },
    btnContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    btn: {
        elevation: 10,
        backgroundColor: '#FFF',
        paddingHorizontal: 10,
        justifyContent: 'center',
        borderRadius: 10,
        height: 55,
        width: '47%'
    },
    btnActive: {
        backgroundColor: '#a1dc17',
        elevation: 10,
        paddingHorizontal: 10,
        justifyContent: 'center',
        borderRadius: 10,
        height: 55,
        width: '47%'
    },
    btnActiveTitle: {
        textAlign: 'center',
        color: '#FFF',
        fontFamily: 'Poppins-SemiBold',
        fontSize: 15
    },
    btnTitle: {
        textAlign: 'center',
        color: '#000',
        fontFamily: 'Poppins-SemiBold',
        fontSize: 15
    }
})