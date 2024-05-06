import { StyleSheet, Text, View, ScrollView } from 'react-native';
import React from 'react';
import DropdownForm from '../../Common/DropdownForm';
import { useTranslation } from 'react-i18next';
import ButtonForm from '../../Common/ButtonForm';
import CalculatorController from '../../ViewController/CalculatorController';
const FertilizerCalculator = () => {
    const { t } = useTranslation();
    const { livelihoodType,
        onChangeLivelihoodType,
        produceName,
        onChangeProduceName,
        livelihoodData,
        growthStage,
        onChangeGrowthStage,
        growthStageData,
        ViewResult,
        fertilizerResult,
        numberArr } = CalculatorController();
    return (
        <>
            <View style={styles.comtainer}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <DropdownForm label={t('select_crop_type')} color={'red'} data={livelihoodType} onChange={onChangeLivelihoodType} val={livelihoodData.name} />
                    <DropdownForm label={t('select_crop_name')} color={'red'} data={produceName} onChange={onChangeProduceName} />
                    <DropdownForm label={t('select_growth_stage')} color={'red'} data={growthStage} onChange={onChangeGrowthStage} val={growthStageData.name} />
                    {
                        fertilizerResult.length > 0 &&
                        fertilizerResult.map((data, index) => (
                            <View key={index} style={styles.resultViewContainer}>
                                <View>
                                    <Text style={[styles.title, { margin: 5, marginLeft: 20, fontFamily: 'Poppins-SemiBold' }]}>{t('nitrogen')}</Text>
                                    <Text style={[styles.title, { margin: 5, marginLeft: 20, fontFamily: 'Poppins-SemiBold' }]}>{t('phosphorus')}</Text>
                                    <Text style={[styles.title, { margin: 5, marginLeft: 20, fontFamily: 'Poppins-SemiBold' }]}>{t('potassium')}</Text>
                                </View>
                                <View>
                                    <Text style={[styles.title, { margin: 5, marginLeft: 20 }]}>: {data.nitrogen} {t('kg_per_ha')}</Text>
                                    <Text style={[styles.title, { margin: 5, marginLeft: 20 }]}>: {data.phosphorous} {t('kg_per_ha')}</Text>
                                    <Text style={[styles.title, { margin: 5, marginLeft: 20 }]}>: {data.potassium} {t('kg_per_ha')}</Text>
                                </View>
                            </View>
                        )
                        )
                    }
                    <View style={styles.btnWrapper}>
                        <View style={styles.btnContainer}>
                            <ButtonForm label={t('view_result')} onPress={() => ViewResult("FertilizerCalculator")} />
                        </View>
                        <View style={styles.btnBorder}></View>
                    </View>
                    {
                        fertilizerResult.length > 0 &&
                        fertilizerResult.map((data, index) => (
                            data.result.map((resultData, e) => (
                                <View key={e} style={styles.combinationContaion}>
                                    <View>
                                        <Text style={[styles.combinationContaionHeader, styles.title]}>Combination {numberArr[e].charAt(0).toUpperCase() + numberArr[e].slice(1)}</Text>
                                    </View>
                                    <View >
                                        {
                                            Object.keys(resultData[`combination_${numberArr[e]}`]).map((combinationData, i) => (
                                                <Text key={i} style={styles.title}>{combinationData} : {resultData[`combination_${numberArr[e]}`][combinationData]}</Text>
                                            ))
                                        }
                                    </View>
                                </View>
                            )
                            )
                        )
                        )
                    }
                </ScrollView>
            </View>
        </>
    )
}

export default FertilizerCalculator;
const styles = StyleSheet.create({
    comtainer: {
        flex: 1,
        marginHorizontal: '2.5%',
        marginTop: 30,
    },
    btnWrapper: {
        marginTop: 100
    },
    btnContainer: {
        paddingHorizontal: '30%',
        zIndex: 999
    },
    btnBorder: {
        width: '100%',
        borderWidth: 0.8,
        borderColor: '#003c04',
        backgroundColor: '#003c04',
        position: 'absolute',
        top: -30,
        zIndex: 111
    },
    title: {
        color: '#000',
        fontFamily: 'Poppins-Regular',
        textAlign: 'center'
    },
    resultViewContainer: {
        flexDirection: 'row',
    },
    combinationContaion: {
        borderWidth: 1,
        marginVertical: 10
    },
    combinationContaionHeader: {
        paddingVertical: 10,
        backgroundColor: '#C8C8C8'

    }
})