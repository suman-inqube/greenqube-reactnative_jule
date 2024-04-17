import { StyleSheet, Text, View, ScrollView, Image } from 'react-native'
import React from 'react';
import CustomHeader from '../CustomHeader';
import FormsTitle from '../../Common/FormsTitle';
import { useTranslation } from 'react-i18next';
import ButtonForm from '../../Common/ButtonForm';
import DropdownForm from '../../Common/DropdownForm';
import SoilHealthManagementController from '../../ViewController/SoilHealthManagementController';
import InputTextForm from '../../Common/InputTextForm';
const PostRequest = () => {
    const { t } = useTranslation();
    const { plotList, onChangePlot, cropDetails,
        soilTestLabList, productionStage, onChangeGrothStage,
        onChangeSoilLab, HandlerGoBack } = SoilHealthManagementController('');
    return (
        <>
            <View style={styles.container}>
                <CustomHeader HandlerGoBack={() => HandlerGoBack('SoilHealthManagement')} />
                <FormsTitle title={t('request_soil_testing')} />
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={styles.scrollContainer}>
                        <DropdownForm label={t('agent_crop_problem_plot')}
                            data={plotList} onChange={onChangePlot}
                        />
                        {cropDetails.produceName != "" &&
                            <>
                                <InputTextForm label={t('produce_name')} value={cropDetails.produceName} />
                                <InputTextForm label={t('crop_veriety')} value={cropDetails.produceVariety} />
                                <InputTextForm label={t('addland_capturelat')} value={cropDetails.captureLat} />
                                <InputTextForm label={t('addland_capturelong')} value={cropDetails.longValue} />
                                <View>
                                    <Text style={styles.title}>{t('date')}</Text>
                                    <View style={styles.dateContainer}>
                                        <Text style={styles.title}>2024/12/05</Text>
                                        <Image source={require('../../Common/images/calendar.png')} style={styles.calendarIcon} />
                                    </View>
                                </View>
                                <DropdownForm label={t('growth_stage')} data={productionStage} onChange={onChangeGrothStage} />
                            </>
                        }
                        <DropdownForm label={t('select_soil_lab')} data={soilTestLabList} onChange={onChangeSoilLab} />
                    </View>
                </ScrollView>
            </View>
            <ButtonForm label={t('submit')} />
        </>
    )
}

export default PostRequest

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginBottom: 50
    },
    scrollContainer: {
        marginHorizontal: '2.5%'
    },
    dateContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: 8,
        height: 45,
        borderColor: '#fcf7f7',
        borderWidth: 1.3,
        borderRadius: 8,
        backgroundColor: '#FFFF',
        width: '100%',
        elevation: 1,
        paddingHorizontal: 10,
        color: '#000',
        marginBottom: 20
    },
    calendarIcon: {
        width: 30,
        height: 30
    },
    title: {
        color: '#000',
        fontFamily: 'Poppins-Regular'
    }

})