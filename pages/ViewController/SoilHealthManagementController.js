
import React, { useEffect, useState } from 'react';
import {
    SampleRequestList, SampleReport, PlotSiteUserLandDetails, soilTestLab,
    livelihoodCropAndPlotDetailsAPI, productionStageAPI
} from '../../config/apiHere';
import loginUserDataController from './loginUserDataController';
import { onBackPress } from '../Common/BackPressHandler';
import { useRoute, useNavigation } from '@react-navigation/native';
const SoilHealthManagementController = (sample) => {
    const routename = useRoute().name;
    const { GetLoginUserData, loginUserData } = loginUserDataController();
    const { dbname, lan_id, token, user_id } = loginUserData;
    const [activeBtn, setActiveBtn] = useState(1);
    const [sampaleRequested, setSampleRequested] = useState([]);
    const [sampaleReportList, setSampleReport] = useState([]);
    const [plotList, setPlotList] = useState([]);
    const [soilTestLabList, setSoilTestLabList] = useState([]);
    const [productionStage, setProductionStage] = useState([]);
    const [newFromDate, setnewFromDate] = useState(new Date());
    const [openFromDate, setOpenFromDate] = useState(false);
    const [startDate, setStartDate] = useState("");
    const [searchById, setSearchById] = useState("");
    const [cropDetails, setCropDetails] = useState({
        produceName: "",
        produceVariety: "",
        captureLat: "",
        longValue: "",
        date: "",
    });
    const navigation = useNavigation();
    const [isLoading, setIsLoading] = useState(false);
    const onPageLoad = async () => {
        setIsLoading(true);
        const [GetLoginUserDataRes] = await Promise.all([
            GetLoginUserData()
        ]);
        if (GetLoginUserDataRes) {
            const { dbname, lan_id, token, user_id } = GetLoginUserDataRes;
            if (sample != "") {
                if (activeBtn == 1) {
                    const sampleRequestedRes = await SampleRequestList(dbname, lan_id, user_id, '', '');
                    if (sampleRequestedRes.status == 200) {
                        setSampleRequested(sampleRequestedRes.data.data)
                    }
                } else {
                    const samplereportRes = await SampleReport(dbname, lan_id, user_id, '', '');
                    if (samplereportRes.status == 200) {
                        setSampleReport(samplereportRes.data.data)
                    }
                }
            } else {
                const [plotSiteDetailsRes, soilTestLabRes] = await Promise.all([
                    PlotSiteUserLandDetails(dbname, lan_id, token, user_id),
                    soilTestLab(dbname, lan_id)
                ]);
                if (plotSiteDetailsRes.status == 200) {
                    const dataArray = [];
                    const { data } = plotSiteDetailsRes.data;
                    data.map((data, index) => {
                        const { rel_id, plot_no } = data;
                        dataArray.push({
                            value: rel_id,
                            label: plot_no
                        });
                    })
                    setPlotList(dataArray)
                }
                if (soilTestLabRes.status == 200) {
                    const dataArray = [];
                    const { rows } = soilTestLabRes.data.data;
                    rows.map((data, index) => {
                        const { stl_name, fid } = data;
                        dataArray.push({
                            value: fid,
                            label: stl_name
                        });
                    })
                    setSoilTestLabList(dataArray);
                    // setSoilTestLabList
                }
            }
        }
        setIsLoading(false);
    }
    useEffect(() => {
        onPageLoad();
    }, [activeBtn]);
    function handleBackPress() {
        // let paramsArr = [];
        // const routes = navigation.getState()?.routes;
        // routes.filter(item => {
        //     console.log(item.name)
        //     if (item.name == "SoilHealthManagement") {
        //         paramsArr = item.params;
        //     }
        // });
        switch (routename) {
            case "SoilHealthManagement":
                navigation.navigate("FarmerDashboard");
                break;
            case "PostRequest":
                navigation.navigate("SoilHealthManagement");
                break;
            case "MySoil":
                navigation.navigate("SoilHealthManagement");
                break;
        }
        return true;
    }
    useEffect(() => {
        onBackPress(handleBackPress);
    }, [])
    const HandlerGoBack = (path) => {
        navigation.navigate(path);
    }
    const navigateToPages = (item) => {
        navigation.navigate(item);
    }
    const onPressDateContainer = () => {
        setOpenFromDate(true);
    }
    const handlecycleStart = async (item) => {
        let date = item.toISOString().split('T');
        setStartDate(date[0]);
        if (activeBtn == 1) {
            const sampleRequestedRes = await SampleRequestList(dbname, lan_id, user_id, date[0], searchById);
            if (sampleRequestedRes.status == 200) {
                setSampleRequested(sampleRequestedRes.data.data)
            }
        } else {
            const samplereportRes = await SampleReport(dbname, lan_id, user_id, date[0], searchById);
            if (samplereportRes.status == 200) {
                setSampleReport(samplereportRes.data.data)
            }
        }
    }
    const onChangeByID = async (text, name) => {
        setSearchById(text);
    }
    const onPressByID = async (type) => {
        if (type == "sampleRequested") {
            const sampleRequestedRes = await SampleRequestList(dbname, lan_id, user_id, startDate, searchById);
            if (sampleRequestedRes.status == 200) {
                setSampleRequested(sampleRequestedRes.data.data);
            }
        } else {
            const samplereportRes = await SampleReport(dbname, lan_id, user_id, startDate, searchById);
            if (samplereportRes.status == 200) {
                setSampleReport(samplereportRes.data.data);
            }
        }
    }
    const onChangeActiveBtn = (number) => {
        setActiveBtn(number);
        setSearchById("");
        setStartDate("");
    }
    const onChangePlot = async (item) => {
        const { label, value } = item;
        const cropDetails = await livelihoodCropAndPlotDetailsAPI(dbname, lan_id, user_id, value);
        if (cropDetails.status == 200) {
            const { rows, count } = cropDetails.data.data;
            if (count > 0) {
                const { crop_name, crop_variety, land_info, crop_type_id, crop_name_id } = rows[0];
                const productionStage_res = await productionStageAPI(dbname, lan_id, crop_type_id, crop_name_id);
                if (productionStage_res.status == 200) {
                    const dataArray = [];
                    const { growth_stage } = productionStage_res.data.data;
                    growth_stage.map((data, index) => {
                        const { name, fid } = data.growth_stage;
                        dataArray.push({
                            value: fid,
                            label: name
                        });
                    });
                    setProductionStage(dataArray);
                }
                setCropDetails({
                    ...cropDetails,
                    produceName: crop_name.name,
                    produceVariety: crop_variety.name,
                    captureLat: land_info.latitude,
                    longValue: land_info.longitude,
                    date: "",
                });

            }
        }
        // console.log(JSON.stringify(cropDetails.data.data));
    }
    const onChangeGrothStage = (item) => {
        const { value, lable } = item;
    }
    const onChangeSoilLab = (item) => {
        const { value, lable } = item;
    }
    return {
        navigateToPages,
        activeBtn,
        setActiveBtn,
        sampaleRequested,
        newFromDate,
        openFromDate,
        setnewFromDate,
        setOpenFromDate,
        onPressDateContainer,
        handlecycleStart,
        startDate,
        onPressByID,
        onChangeByID,
        sampaleReportList,
        onChangeActiveBtn,
        plotList,
        onChangePlot,
        cropDetails,
        soilTestLabList,
        productionStage,
        onChangeGrothStage,
        onChangeSoilLab,
        isLoading,
        HandlerGoBack
    }
}

export default SoilHealthManagementController;
