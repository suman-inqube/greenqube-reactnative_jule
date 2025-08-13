import {StyleSheet, Text, View, ScrollView} from 'react-native';
import React, {useState, useEffect, useContext} from 'react';
import {useTranslation} from 'react-i18next';
import DropdownForm from '../../Common/DropdownForm';
import ButtonForm from '../../Common/ButtonForm';
import CalculatorController from '../../ViewController/CalculatorController';
import FarmerDrawerScreenWrapper1 from '../FarmerDrawerScreenWrapper1';
import {Colors, Fronts} from '../../utils/Constants';
import CustomHeader from '../CustomHeader';
import {userCreateContext} from '../../Context/usersCreateContext';
const PestisideCalculator = () => {
  const {logoImage, topBanner, CustomHeader} = useContext(userCreateContext);
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
    <FarmerDrawerScreenWrapper1>
      <>
        <CustomHeader
          path="FarmerDashboard"
          // HandlerGoBack={HandlerGoBack}
          logoImage={logoImage}
          topBanner={topBanner}
        />
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
          </View>
        </ScrollView>
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
      </>
    </FarmerDrawerScreenWrapper1>
  );
};

export default PestisideCalculator;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background_light,
  },

  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 10,
    marginVertical: '5%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginHorizontal: '4%',
  },
});
