import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import CustomHeader from '../CustomHeader';
import FormsTitle from '../../Common/FormsTitle';
import { useTranslation } from 'react-i18next';
import { TouchableOpacity } from 'react-native-gesture-handler';
import SoilHealthManagementController from '../../ViewController/SoilHealthManagementController';
import SampleRequested from './SampleRequested';
import SampleReport from './SampleReport';
const MySoil = () => {
    const { t } = useTranslation();
    const {
        activeBtn,
        setActiveBtn
    } = SoilHealthManagementController();
    return (
        <View style={{ flex: 1 }}>
            <CustomHeader />
            <FormsTitle title={t('my_soil')} />
            <View style={styles.btnContainer}>
                <View style={activeBtn === 1 ? styles.btnActive : styles.btn}>
                    <TouchableOpacity onPress={() => setActiveBtn(1)}>
                        <Text style={activeBtn === 1 ? styles.btnActiveTitle : styles.btnTitle}>{t('sample_request')}</Text>
                    </TouchableOpacity>
                </View>
                <View style={activeBtn === 2 ? styles.btnActive : styles.btn}>
                    <TouchableOpacity onPress={() => setActiveBtn(2)}>
                        <Text style={activeBtn === 2 ? styles.btnActiveTitle : styles.btnTitle}>{t('sample_report')}</Text>
                    </TouchableOpacity>
                </View>
            </View>
            {
                activeBtn === 1 ?
                    <SampleRequested />
                    :
                    <SampleReport />
            }
        </View>
    )
}

export default MySoil

const styles = StyleSheet.create({
    btnContainer: {
        marginHorizontal: '2.5%',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    btn: {
        width: '50%',
        elevation: 10,
        backgroundColor: '#C8C8C8',
        paddingHorizontal: 10,
        justifyContent: 'center',
        // padding: 7,
    },
    btnActive: {
        backgroundColor: '#2B7D05',
        elevation: 10,
        paddingHorizontal: 10,
        justifyContent: 'center',
        // padding: 7,
        width: '50%'
    },
    btnActiveTitle: {
        textAlign: 'center',
        color: '#FFF',
        fontFamily: 'Poppins-SemiBold',
        fontSize: 15,
        padding: 10,
    },
    btnTitle: {
        textAlign: 'center',
        color: '#000',
        fontFamily: 'Poppins-SemiBold',
        fontSize: 15,
        padding: 10,
    }
})