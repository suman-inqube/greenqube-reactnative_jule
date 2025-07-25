import {StyleSheet, Text, View, ScrollView} from 'react-native';
import React from 'react';
import {useTranslation} from 'react-i18next';
import DropdownForm from '../../Common/DropdownForm';
import ButtonForm from '../../Common/ButtonForm';
import CalculatorController from '../../ViewController/CalculatorController';
const PestisideCalculator = () => {
  const {t} = useTranslation();
  const {
    livelihoodType,
    onChangeLivelihoodType,
    produceName,
    onChangeProduceName,
    livelihoodData,
    growthStage,
    onChangeGrowthStage,
    growthStageData,
    produceVariety,
    onChangeProduceVariety,
    onChangeProblemType,
    problemType,
    problemName,
    onChangeProblemName,
    severity,
    onChangeSeverity,
    productionProcess,
    onChangeProductionProcess,
    produceNameData,
    produceVarietyData,
    problemTypeData,
    problemNameData,
    severityData,
    productionProcessData,
    ViewResult,
    pestisideResult,
  } = CalculatorController();
  return (
    <>
      <View style={styles.comtainer}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <DropdownForm
            label={t('select_crop_type')}
            color={'red'}
            data={livelihoodType}
            onChange={onChangeLivelihoodType}
            val={livelihoodData.name}
          />
          <DropdownForm
            label={t('select_crop_name')}
            color={'red'}
            data={produceName}
            onChange={onChangeProduceName}
            val={produceNameData.name}
          />
          <DropdownForm
            label={t('crop_veriety')}
            color={'red'}
            data={produceVariety}
            onChange={onChangeProduceVariety}
            val={produceVarietyData.name}
          />
          <DropdownForm
            label={t('select_growth_stage')}
            color={'red'}
            data={growthStage}
            onChange={onChangeGrowthStage}
            val={growthStageData.name}
          />
          <DropdownForm
            label={t('problem_type')}
            color={'red'}
            data={problemType}
            onChange={onChangeProblemType}
            val={problemTypeData.name}
          />
          <DropdownForm
            label={t('select_problem')}
            color={'red'}
            data={problemName}
            onChange={onChangeProblemName}
            val={problemNameData.name}
          />
          <DropdownForm
            label={t('select_severity')}
            color={'red'}
            data={severity}
            onChange={onChangeSeverity}
            val={severityData.name}
          />
          <DropdownForm
            label={t('production_system')}
            color={'red'}
            data={productionProcess}
            onChange={onChangeProductionProcess}
            val={productionProcessData.name}
          />
          <View style={styles.btnWrapper}>
            <View style={styles.btnContainer}>
              <ButtonForm
                label={t('view_result')}
                onPress={() => ViewResult('Pestiside')}
              />
            </View>
            <View style={styles.btnBorder}></View>
          </View>
          {pestisideResult.map((data, index) => {
            const {agri_predefined_sol} = data;
            return (
              <Text key={index} style={styles.ViewResultText}>
                {agri_predefined_sol.description}
              </Text>
            );
          })}
        </ScrollView>
      </View>
    </>
  );
};

export default PestisideCalculator;

const styles = StyleSheet.create({
  comtainer: {
    flex: 1,
    marginHorizontal: '2.5%',
    marginTop: '10%',
  },
  btnWrapper: {
    marginTop: 100,
  },
  btnContainer: {
    paddingHorizontal: '30%',
    zIndex: 999,
  },
  btnBorder: {
    width: '100%',
    borderWidth: 0.8,
    borderColor: '#003c04',
    backgroundColor: '#003c04',
    position: 'absolute',
    top: -30,
    zIndex: 111,
  },
  title: {
    color: '#000',
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
  },
  ViewResultText: {
    backgroundColor: '#003c04',
    padding: 10,
    margin: 10,
    textAlign: 'center',
    color: '#FFF',
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    // borderRadius: 4
  },
});
