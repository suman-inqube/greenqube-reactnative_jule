import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import CustomHeader from '../CustomHeader';
import FormsTitle from '../../Common/FormsTitle';
import { useTranslation } from 'react-i18next';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import PestisideCalculator from './PestisideCalculator';
import FertilizerCalculator from './FertilizerCalculator';
import CalculatorController from '../../ViewController/CalculatorController';
import { Root } from 'react-native-popup-confirm-toast';
const Calculator = () => {
    const { t } = useTranslation();
    const [activeBtn, setActiveBtn] = useState(2);
    const { HandlerGoBack } = CalculatorController();
    return (
        <Root>
            <View style={{ flex: 1 }}>
                <CustomHeader HandlerGoBack={HandlerGoBack} />
                <FormsTitle title={t('agri_calculator')} />
                <View style={styles.container}>
                    <View style={styles.btnContainer} >
                        <TouchableOpacity style={activeBtn === 1 ? styles.btnActive : styles.btn} onPress={() => setActiveBtn(1)}>
                            <Text style={activeBtn === 1 ? styles.btnActiveTitle : styles.btnTitle}>{t('pestiside_calculator')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={activeBtn === 2 ? styles.btnActive : styles.btn} onPress={() => setActiveBtn(2)}>
                            <Text style={activeBtn === 2 ? styles.btnActiveTitle : styles.btnTitle}>{t('fertilizer_calculator')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                {
                    activeBtn === 1 ?
                        <PestisideCalculator setActiveBtn={setActiveBtn} />
                        :
                        <FertilizerCalculator setActiveBtn={setActiveBtn} />
                }
            </View>
        </Root>
    )
}

export default Calculator

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