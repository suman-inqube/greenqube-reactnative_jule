import {StyleSheet, Text, View, ScrollView} from 'react-native';
import React from 'react';
import {useTranslation} from 'react-i18next';
import DropdownForm from '../../Common/DropdownForm';
import ButtonForm from '../../Common/ButtonForm';
import CalculatorController from '../../ViewController/CalculatorController';
import {Colors, Fonts} from '../../utils/Constants';
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
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <View style={styles.card}>
            <DropdownForm
              label={t('select_crop_type')}
              required={true}
              data={livelihoodType}
              onChange={onChangeLivelihoodType}
              val={livelihoodData.name}
            />
            <DropdownForm
              label={t('select_crop_name')}
              required={true}
              data={produceName}
              onChange={onChangeProduceName}
              val={produceNameData.name}
            />
            <DropdownForm
              label={t('crop_veriety')}
              required={true}
              data={produceVariety}
              onChange={onChangeProduceVariety}
              val={produceVarietyData.name}
            />
            <DropdownForm
              label={t('select_growth_stage')}
              required={true}
              data={growthStage}
              onChange={onChangeGrowthStage}
              val={growthStageData.name}
            />
            <DropdownForm
              label={t('problem_type')}
              required={true}
              data={problemType}
              onChange={onChangeProblemType}
              val={problemTypeData.name}
            />
            <DropdownForm
              label={t('select_problem')}
              required={true}
              data={problemName}
              onChange={onChangeProblemName}
              val={problemNameData.name}
            />
            <DropdownForm
              label={t('select_severity')}
              required={true}
              data={severity}
              onChange={onChangeSeverity}
              val={severityData.name}
            />
            <DropdownForm
              label={t('production_system')}
              required={true}
              data={productionProcess}
              onChange={onChangeProductionProcess}
              val={productionProcessData.name}
            />
          </View>

          <ButtonForm
            label={t('view_result')}
            onPress={() => ViewResult('Pestiside')}
            iconName="calculate"
            iconColor="#fff"
            iconSize={30}
          />

          {pestisideResult.map((data, index) => {
            const {agri_predefined_sol} = data;
            return (
              <Text key={index} style={styles.ViewResultText}>
                {agri_predefined_sol.description}
              </Text>
            );
          })}
        </View>
      </ScrollView>
    </>
  );
};

export default PestisideCalculator;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.containerGreen,
    marginHorizontal: '3%',
    borderWidth: 0.5,
    borderColor: Colors.borderGreen,
    marginBottom: 20,
  },

  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 10,
    marginVertical: '5%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginHorizontal: '2.5%',
  },
});
