
import { useEffect, useState, useContext } from 'react';
import { Keyboard } from 'react-native';
import {
    SampleRequestList, SampleReport, soilTestLab, cropListApi,
    livelihoodCropAndPlotDetailsAPI, productionStageAPI, soilTestLabPostRequest
} from '../../config/apiHere';
import { useRoute, useNavigation } from '@react-navigation/native';
const qs = require('qs');
import { userCreateContext } from '../Context/usersCreateContext';
const SoilHealthManagementController = (sample) => {
    const routename = useRoute().name;
    //GQR-67
    const { loginUser_data, onBackPress, Toast, AlertMesg } = useContext(userCreateContext);
    const { dbname, lan_id, token, user_id, owner, agri_user_addresses } = loginUser_data;
    //GQR-67
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
    const [plotData, setPlotData] = useState({
        name: "", value: "",
    });
    const [productionStateData, setProductionStateData] = useState({
        name: "", value: "",
    });
    const [soliLabData, setSoliLabData] = useState({
        name: "", value: "",
    });
    const navigation = useNavigation();
    const [isLoading, setIsLoading] = useState(false);
    const onPageLoad = async () => {
        setIsLoading(true);
        if (sample != "") {
            if (activeBtn == 1) {
                const sampleRequestedRes = await SampleRequestList(dbname, lan_id, user_id, '', '');
                if (sampleRequestedRes?.status == 200) {
                    setSampleRequested(sampleRequestedRes.data.data)
                }
            } else {
                const samplereportRes = await SampleReport(dbname, lan_id, user_id, '', '');
                if (samplereportRes?.status == 200) {
                    setSampleReport(samplereportRes.data.data)
                }
            }
        } else {
            const [plotSiteDetailsRes, soilTestLabRes] = await Promise.all([
                cropListApi(dbname, lan_id, user_id),
                soilTestLab(dbname, lan_id)
            ]);
            if (plotSiteDetailsRes?.status == 200) {
                const dataArray = [];
                const { rows } = plotSiteDetailsRes.data.data;
                rows.map((data, index) => {
                    const { rel_id, plot_no } = data.land_info;
                    dataArray.push({
                        value: rel_id,
                        label: plot_no
                    });
                })
                setPlotList(dataArray)
            }
            if (soilTestLabRes?.status == 200) {
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
            }
        }
        setIsLoading(false);
    }
    useEffect(() => {
        onPageLoad();
    }, [activeBtn]);
    function handleBackPress() {
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
            if (sampleRequestedRes?.status == 200) {
                setSampleRequested(sampleRequestedRes.data.data)
            }
        } else {
            const samplereportRes = await SampleReport(dbname, lan_id, user_id, date[0], searchById);
            if (samplereportRes?.status == 200) {
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
            if (sampleRequestedRes?.status == 200) {
                setSampleRequested(sampleRequestedRes.data.data);
            }
        } else {
            const samplereportRes = await SampleReport(dbname, lan_id, user_id, startDate, searchById);
            if (samplereportRes?.status == 200) {
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
        setPlotData({ ...plotData, name: label, value: value });
        setCropDetails({
            ...cropDetails,
            produceName: "",
            produceVariety: "",
            captureLat: "",
            longValue: "",
            date: "",
        });
        const cropDetails = await livelihoodCropAndPlotDetailsAPI(dbname, lan_id, user_id, value);
        if (cropDetails?.status == 200) {
            const { rows, count } = cropDetails.data.data;
            if (count > 0) {
                const { crop_name, crop_variety, land_info, crop_type_id, crop_name_id } = rows[0];
                const productionStage_res = await productionStageAPI(dbname, lan_id, crop_type_id, crop_name_id);
                if (productionStage_res?.status == 200) {
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
                    date: new Date().toISOString().slice(0, 10),
                });

            }
        }
        // console.log(JSON.stringify(cropDetails.data.data));
    }
    const onChangeGrothStage = (item) => {
        const { value, lable } = item;
        setProductionStateData({
            ...productionStateData, name: lable, value: value,
        });
    }
    const onChangeSoilLab = (item) => {
        const { value, lable } = item;
        setSoliLabData({
            ...soliLabData, name: lable, value: value,
        });
    }
    const saveData = async () => {
        Keyboard.dismiss();
        if (plotData.value == "") {
            Toast.show({
                time: 3, text: `${t('please_select_plot_first')}`, ...AlertMesg[0]
            });
        } else if (soliLabData.value == "") {
            Toast.show({
                time: 3, text: `${t('please_select_soil_type_first')}`, ...AlertMesg[0]
            });
        } else {
            const { state, district, subdivision } = agri_user_addresses[0];
            let save_data = qs.stringify({
                stl_id: soliLabData.value,
                land_rel_id: plotData.value,
                state_id: state,
                district_id: district,
                subdivision_id: subdivision,
                growth_stage_id: productionStateData.value,
            });
            const postResponse = await soilTestLabPostRequest(dbname, user_id, save_data);
            if (postResponse?.status == 200) {
                Toast.show({ text: t('Data_submitted_successfully'), ...AlertMesg[0] });
                setTimeout(() => {
                    navigation.navigate('MySoil');
                }, 1500);
            }
        }
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
        HandlerGoBack,
        saveData
    }
}

export default SoilHealthManagementController;
