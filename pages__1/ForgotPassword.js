import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native'
import React from 'react';
import InputTextForm from './Common/InputTextForm';
import ButtonForm from './Common/ButtonForm';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
const ForgotPassword = () => {
    const { t } = useTranslation();
    const navigation = useNavigation();
    const Cancel = () => {
        navigation.navigate('Login');
    }
    return (
        <View style={styles.container}>
            <Text style={styles.headerTitle}>{t('forgot_password')}</Text>
            <TextInput placeholder={t('please_enter_valid_mobile_no')} style={styles.textInput} />
            <View style={styles.btnContainer}>
                <TouchableOpacity style={styles.btn}>
                    <Text style={styles.btnText}>{t('forgotpsw_Ok')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btn} onPress={Cancel}>
                    <Text style={styles.btnText}>{t('cancle')}</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default ForgotPassword

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        marginHorizontal: 15
    },
    headerTitle: {
        textAlign: 'center',
        marginBottom: 15,
        fontFamily: 'Poppins-SemiBold',
        fontSize: 18,
        color: '#3CB043'
    },
    textInput: {
        borderWidth: 1,
        borderRadius: 10,
        height: 46,
        borderColor: '#FFF',
        paddingHorizontal: 20,
        backgroundColor: '#FFF',
        fontFamily: 'Poppins-SemiBold',
    },
    btnContainer: {
        marginTop: 20,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    btn: {
        backgroundColor: '#003c04',
        width: '45%',
        paddingVertical: 10,
        borderRadius: 10
    },
    btnText: {
        color: '#FFF',
        fontFamily: 'Poppins-Regular',
        fontSize: 14,
        textAlign: 'center'
    }
})