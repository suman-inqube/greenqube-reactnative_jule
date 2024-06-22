import { Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import FarmerListController from './FarmerListController';
import loginUserDataController from './loginUserDataController';
import {
    productionSeasonAndLivelyhoodTypeListAPI,
    productionStageAPI, calculatorRouteViewesultAPI,
    ProblemTypeAPI, ProblemNameAPI, problemSeverityAPI, ProductionProcessAPI, calculatorPestisideResultAPI
} from '../../config/apiHere';
import { getItem } from '../../config/getDataFromStorage';
import config from '../../config';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { Root, Toast } from 'react-native-popup-confirm-toast';
import { AlertMesg } from '../Common/ToastAlert';
import { useTranslation } from 'react-i18next';
const CalculatorController = () => {
    const { t } = useTranslation();
    const navigation = useNavigation();
    const { GetFarmerList, farmerList } = FarmerListController();
    const { GetLoginUserData, loginUserData } = loginUserDataController();
    const { dbname, lan_id, token, user_id } = loginUserData;
    const [isLoading, setIsLoading] = useState(false);
    const [livelihoodType, setLivelihoodType] = useState([]);
    const [produceName, setProduceName] = useState([]);
    const [growthStage, setGrowthStage] = useState([]);
    const [produceVariety, setProduceVariety] = useState([]);
    const [problemType, setProblemType] = useState([]);
    const [problemName, setProblemName] = useState([]);
    const [severity, setSeverity] = useState([]);
    const [productionProcess, setProductionProcessArr] = useState([]);

    const [livelihoodData, setLivelihoodData] = useState({
        name: '',
        value: ''
    });
    const [produceNameData, setProduceNameData] = useState({
        name: '',
        value: ''
    });
    const [growthStageData, setGrowthStageData] = useState({
        name: '',
        value: ''
    });
    const [produceVarietyData, setproduceVarietyData] = useState({
        name: '',
        value: ''
    });
    const [problemTypeData, setProblemTypeData] = useState({
        name: '',
        value: ''
    });
    const [problemNameData, setProblemNameData] = useState({
        name: '',
        value: ''
    });
    const [severityData, setSeverityData] = useState({
        name: '',
        value: ''
    });
    const [productionProcessData, setProductionProcessData] = useState({
        name: '',
        value: ''
    });
    const [fertilizerResult, setFertilizerResult] = useState([]);
    const [pestisideResult, setPestisideResult] = useState([]);
    const numberArr = [
        "one", "two", "three", "four", "five", "six", "seven", "eight"
    ];
    const onPageLoad = async () => {
        let liveHoodTypeArr = [];
        setIsLoading(true);
        const [GetLoginUserDataRes, GetFarmerListRes] = await Promise.all([
            GetLoginUserData(),
            GetFarmerList(),
        ]);
        if (GetLoginUserDataRes) {
            const { dbname, lan_id, token, user_id } = GetLoginUserDataRes;
            const [liveHoodTypeRes] = await Promise.all([
                productionSeasonAndLivelyhoodTypeListAPI(dbname, lan_id),
                // ProblemTypeAPI(dbname),
            ]);
            if (liveHoodTypeRes.status == 200) {
                const { crop_type } = liveHoodTypeRes.data.data;
                crop_type.map((data, index) => {
                    liveHoodTypeArr.push({
                        value: data.fid,
                        label: data.name
                    })
                })
                setLivelihoodType(liveHoodTypeArr);
            }
            // if (problemTypeRes.status == 200) {

            // }
        }

    }
    useEffect(() => {
        onPageLoad();
    }, []);
    const HandlerGoBack = () => {
        navigation.navigate('FarmerDashboard');
    }
    const onChangeLivelihoodType = async (item) => {
        let produceNameArr = [];
        const { label, value } = item;
        setLivelihoodData({ ...livelihoodData, name: label, value: value });
        setGrowthStage([]);
        setProduceVariety([]);
        setProblemType([]);
        setProblemName([]);
        setSeverity([]);
        setProductionProcessArr([]);
        setGrowthStageData({ ...growthStageData, name: '', value: '' });
        setproduceVarietyData({ ...produceVarietyData, name: '', value: '' });
        setProblemTypeData({ ...problemTypeData, name: '', value: '' });
        setProblemNameData({ ...problemNameData, name: '', value: '' });
        setSeverityData({ ...severityData, name: '', value: '' });
        setProductionProcessData({ ...productionProcessData, name: '', value: '' });
        setProduceNameData({ ...produceNameData, name: '', value: '' });
        setFertilizerResult([]);
        setPestisideResult([]);
        const productionStage_res = await productionStageAPI(dbname, lan_id, value, '');
        if (productionStage_res.status == 200) {
            const { crop_name } = productionStage_res.data.data;
            if (crop_name != null) {
                crop_name.map((data, index) => {
                    const { fid, name } = data.crop_name;
                    produceNameArr.push({
                        value: fid,
                        label: name
                    });
                })
            }
            setProduceName(produceNameArr);
        }
    }
    const onChangeProduceName = async (item) => {
        let growthStageArr = [];
        let productVariety = [];
        const { label, value } = item;
        setProblemType([]);
        setProblemName([]);
        setSeverity([]);
        setProductionProcessArr([]);
        setGrowthStageData({ ...growthStageData, name: '', value: '' });
        setproduceVarietyData({ ...produceVarietyData, name: '', value: '' });
        setProblemTypeData({ ...problemTypeData, name: '', value: '' });
        setProblemNameData({ ...problemNameData, name: '', value: '' });
        setSeverityData({ ...severityData, name: '', value: '' });
        setProductionProcessData({ ...productionProcessData, name: '', value: '' });
        setProduceNameData({ ...produceNameData, name: label, value: value });
        setFertilizerResult([]);
        setPestisideResult([]);
        const growthStageArr_res = await productionStageAPI(dbname, lan_id, livelihoodData.value, value);
        if (growthStageArr_res.status == 200) {
            const { growth_stage, crop_variety } = growthStageArr_res.data.data;
            if (growth_stage != null) {
                growth_stage.map((data, index) => {
                    const { fid, name } = data.growth_stage;
                    growthStageArr.push({
                        value: fid,
                        label: name
                    });
                });
            }
            if (crop_variety != null) {
                crop_variety.map((data, index) => {
                    const { fid, name } = data.crop_variety;
                    productVariety.push({
                        value: fid,
                        label: name
                    });
                });
            }
            setProduceVariety(productVariety);
            setGrowthStage(growthStageArr);
        }
    }
    const onChangeGrowthStage = async (item) => {
        const { label, value } = item;
        let problemTypeArr = [];
        setProblemTypeData({ ...problemTypeData, name: '', value: '' });
        setProblemNameData({ ...problemNameData, name: '', value: '' });
        setSeverityData({ ...severityData, name: '', value: '' });
        setProductionProcessData({ ...productionProcessData, name: '', value: '' });
        setGrowthStageData({ ...growthStageData, name: label, value: value });
        setFertilizerResult([]);
        setPestisideResult([]);
        const problemTypeRes = await ProblemTypeAPI(dbname, lan_id);
        if (problemTypeRes.status == 200) {
            const { problem_type } = problemTypeRes.data.data;
            if (problem_type != null) {
                problem_type.map((data, index) => {
                    const { fid, name } = data;
                    problemTypeArr.push({
                        value: fid,
                        label: name
                    });
                });
            }
            setProblemType(problemTypeArr);
        }

    }
    const onChangeProduceVariety = async (item) => {
        const { label, value } = item;
        setProblemTypeData({ ...problemTypeData, name: '', value: '' });
        setProblemNameData({ ...problemNameData, name: '', value: '' });
        setSeverityData({ ...severityData, name: '', value: '' });
        setProductionProcessData({ ...productionProcessData, name: '', value: '' });
        setproduceVarietyData({ ...produceVarietyData, name: label, value: value });
        setFertilizerResult([]);
        setPestisideResult([]);

    }
    const onChangeProblemType = async (item) => {
        const { label, value } = item;
        let problemNameArr = [];
        setSeverity([]);
        setProductionProcessArr([]);
        setProblemNameData({ ...problemNameData, name: '', value: '' });
        setSeverityData({ ...severityData, name: '', value: '' });
        setProductionProcessData({ ...productionProcessData, name: '', value: '' });
        setProblemTypeData({ ...problemTypeData, name: label, value: value });
        setFertilizerResult([]);
        setPestisideResult([]);
        const ProblemNameRes = await ProblemNameAPI(dbname, lan_id, value);
        if (ProblemNameRes.status == 200) {
            const { problem_name } = ProblemNameRes.data.data;
            problem_name.map((data, index) => {
                const { fid, name } = data.problem_name;
                problemNameArr.push({
                    value: fid,
                    label: name
                });
            });
        }
        setProblemName(problemNameArr);
    }
    const onChangeProblemName = async (item) => {
        const { label, value } = item;
        let severityArr = [];
        setProductionProcessArr([]);
        setSeverityData({ ...severityData, name: '', value: '' });
        setProductionProcessData({ ...productionProcessData, name: '', value: '' });
        setProblemNameData({ ...problemName, name: label, value: value });
        setFertilizerResult([]);
        setPestisideResult([]);
        const SeverityRes = await problemSeverityAPI(dbname, lan_id);
        if (SeverityRes.status == 200) {
            const { rows } = SeverityRes.data.data;
            if (rows != null) {
                rows.map((data, index) => {
                    const { fid, name } = data;
                    severityArr.push({
                        value: fid,
                        label: name
                    });
                })
            }
        }
        setSeverity(severityArr);
    }
    const onChangeSeverity = async (item) => {
        const { label, value } = item;
        let productionProcessArr = [];
        setProductionProcessData({ ...productionProcessData, name: '', value: '' });
        setSeverityData({ ...severityData, name: label, value: value });
        setFertilizerResult([]);
        setPestisideResult([]);
        const productionProcessRes = await ProductionProcessAPI(dbname, lan_id);
        if (productionProcessRes.status == 200) {
            const { rows } = productionProcessRes.data.data;
            if (rows != null) {
                rows.map((data, index) => {
                    const { fid, name } = data;
                    productionProcessArr.push({
                        value: fid,
                        label: name
                    });
                })
            }
        }
        setProductionProcessArr(productionProcessArr)
    }
    const onChangeProductionProcess = async (item) => {
        const { label, value } = item;
        setProductionProcessData({ ...productionProcessData, name: label, value: value });
        setFertilizerResult([]);
        setPestisideResult([]);
    }

    const ViewResult = async (item) => {
        if (livelihoodData.value == "") {
            Toast.show({
                time: 3, text: `${t('please_select_crop_type_first')}`, ...AlertMesg[0]
            })
        } else if (produceNameData.value == "") {
            Toast.show({
                time: 3, text: `${t('please_select_crop_name_first')}`, ...AlertMesg[0]
            })
        } else if (growthStageData.value == "") {
            Toast.show({
                time: 3, text: `${t('please_select_growth_stage')}`, ...AlertMesg[0]
            })
        } else if (produceVarietyData.value == "" && item == "Pestiside") {
            Toast.show({
                time: 3, text: `${t('please_select_crop_veriety_first')}`, ...AlertMesg[0]
            })
        } else if (problemTypeData.value == "" && item == "Pestiside") {
            Toast.show({
                time: 3, text: `${t('please_select_problem_type_first')}`, ...AlertMesg[0]
            })
        } else if (problemNameData.value == "" && item == "Pestiside") {
            Toast.show({
                time: 3, text: `${t('please_select_problem')}`, ...AlertMesg[0]
            })
        } else if (severityData.value == "" && item == "Pestiside") {
            Toast.show({
                time: 3, text: `${t('please_select_production_system_first')}`, ...AlertMesg[0]
            })
        } else if (productionProcessData.value == "" && item == "Pestiside") {
            Toast.show({
                time: 3, text: `${t('please_select_production_system')}`, ...AlertMesg[0]
            })
        } else {
            if (item == "FertilizerCalculator") {
                const calculatorResult = await calculatorRouteViewesultAPI(dbname, lan_id, livelihoodData.value, produceNameData.value, growthStageData.value);
                if (calculatorResult.status == 200) {
                    if (calculatorResult.data.data.count > 0) {
                        setFertilizerResult(calculatorResult.data.data.rows);
                    } else {
                        Toast.show({
                            time: 3, text: `${t('no_data_found')}`, ...AlertMesg[0]
                        })
                    }
                } else {
                    setFertilizerResult([])
                }
            } else {
                const calculatorPestisideRes = await calculatorPestisideResultAPI(dbname, lan_id, livelihoodData.value, produceNameData.value, produceVarietyData.value, growthStageData.value, problemTypeData.value, problemNameData.value, productionProcessData.value, severityData.value);
                if (calculatorPestisideRes.status == 200) {
                    if (calculatorPestisideRes.data.data.count > 0) {
                        setPestisideResult(calculatorPestisideRes.data.data.rows)
                    } else {
                        Toast.show({
                            time: 3, text: `${t('no_data_found')}`, ...AlertMesg[0]
                        })
                    }
                } else {
                    setPestisideResult([]);
                }
            }
        }
    }
    return {
        isLoading,
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
        HandlerGoBack,
        ViewResult,
        fertilizerResult,
        numberArr,
        pestisideResult
    }
}

export default CalculatorController;