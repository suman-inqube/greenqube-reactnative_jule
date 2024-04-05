
import { Keyboard } from 'react-native';
import React, { useEffect, useState, useRef } from 'react'
import { getItem } from '../../config/getDataFromStorage';
import loginUserDataController from './loginUserDataController';
import FarmerListController from './FarmerListController';
import {
    PlotSiteUserLandDetails, productionSeasonAndLivelyhoodTypeListAPI, ProductionProcessAPI,
    ProductionUnitAPI, productionStageAPI, problemProductionStageAPI, greenZownRouteaddMultiCrops,
    produceAgainstPlotAPI, checkUniqueIdTree, greenZownTreeImg, greenZownlistMultiLatLong, greenZownuserCropEditApi
} from '../../config/apiHere';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { Root, SPSheet, Toast } from 'react-native-popup-confirm-toast';
import { AlertMesg } from '../Common/ToastAlert';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
const qs = require('qs');
const TreeController = (type) => {
    const { t } = useTranslation();
    const treeIdRef = useRef(null);
    const navigation = useNavigation();
    const [isLoading, setIsLoading] = useState(false);
    const { GetLoginUserData, loginUserData } = loginUserDataController();
    const { dbname, lan_id, token, user_id } = loginUserData;
    const { GetFarmerList, farmerList } = FarmerListController();
    const [farmerDataList, setFarmerDataList] = useState([]);
    const [farmerPhoneNumber, setFarmerPhoneNumber] = useState("");
    const [farmerName, setFarmerName] = useState("");
    const [farmerID, setFarmerID] = useState("");
    const [plotAll, setplotAll] = useState([]);
    const [productionUnit, setProductionUnit] = useState([]);
    const [productionProcess, setProductionProcess] = useState([]);
    const [productionSeason, setProductionSeason] = useState([]);
    const [treeType, setTreeType] = useState([]);
    const [treeName, setTreeName] = useState([]);
    const [species, setspecies] = useState([]);
    const [plotData, setPlotData] = useState({
        plotName: '',
        plotValue: '',
    })
    const [plantingSeason, setPlantingSeason] = useState({
        plantingSeasonName: "",
        plantingSeasonValue: ""
    });
    const [treeData, setTreeData] = useState({
        treeName: "",
        treeValue: ""
    });
    const [treeNameData, setTreeNameData] = useState({
        treeName: "",
        treeValue: ""
    });
    const [speciesData, setSpeciesData] = useState({
        speciesName: "",
        speciesValue: ""
    })
    const [uploadTreeImage, setUploadTreeImage] = useState({
        uri: "",
        type: "",
        name: ""
    });
    const [oldTreeImage, setOldTreeImage] = useState({
        uri: "",
        type: "",
        name: ""
    });
    const [uploadTreeImageArr, setUploadTreeImageArr] = useState([]);
    const [productionProcessData, setProductionProcessData] = useState({
        productionProcessName: '',
        productionProcessValue: ''
    })
    const [productionUnitData, setProductionUnitData] = useState({
        productionUnitName: '',
        productionUnitValue: ''
    })
    const [yield_amount, setyield_amount] = useState("");
    const [treeId, setTreeID] = useState({
        treeId: "",
        treeName: "",
    });
    const [openFromDate, setOpenFromDate] = useState(false);
    const [newFromDate, setnewFromDate] = useState(new Date());
    const [fromDate, setfromDate] = useState("");
    const [location, setLocation] = useState({
        latitude: "",
        longitude: ""
    });
    const [addTreeArray, setAddTreeArray] = useState([]);
    const [plotDetails, setPlotDetails] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const onPageLoad = async () => {
        const productionProcessArr = [];
        const productionUnitArr = [];
        const productionSeasonArr = [];
        setIsLoading(true);
        const [loginUser_data, GetLoginUserDataRes, GetFarmerListRes] = await Promise.all([
            getItem('loginUser_data'),
            GetLoginUserData(),
            GetFarmerList(),
        ]);
        if (GetLoginUserDataRes) {
            const { dbname, lan_id, token, user_id } = GetLoginUserDataRes;
            const [productionSeasonRes, ProductionProcessRes, ProductionUnitRes] = await Promise.all([
                productionSeasonAndLivelyhoodTypeListAPI(dbname),
                ProductionProcessAPI(dbname, lan_id),
                ProductionUnitAPI(dbname, lan_id),
            ]);
            if (productionSeasonRes.status == 200) {
                productionSeasonRes.data.data.crop_season.map((data, index) => {
                    productionSeasonArr.push({
                        value: data.fid,
                        label: data.name
                    })
                })
                setProductionSeason(productionSeasonArr);
            }
            if (ProductionProcessRes.status == 200) {
                ProductionProcessRes.data.data.rows.map((data, index) => {
                    productionProcessArr.push({
                        value: data.fid,
                        label: data.name,
                    });
                })
                setProductionProcess(productionProcessArr)
            }
            if (ProductionUnitRes.status == 200) {
                ProductionUnitRes.data.data.rows.map((data, index) => {
                    productionUnitArr.push({
                        value: data.fid,
                        label: data.unit_name,
                    });
                })
                setProductionUnit(productionUnitArr)
            }
        }
        if (GetFarmerListRes) {
            const dataArray = [];
            GetFarmerListRes.forEach(element => {
                dataArray.push({
                    value: element.user_id,
                    label: element.userName,
                    phone: element.contactNumber,
                    FcmUserToken: element.FcmUserToken
                });
            });
            setFarmerDataList(dataArray);
        }
        setIsLoading(false);
    }
    useEffect(() => {
        onPageLoad();
    }, [])
    const openlaunchCamera = (item) => {
        const options = {
            mediaType: 'photo',
            includeBase64: true,
            maxHeight: 200,
            maxWidth: 200,
        };
        launchCamera(options, async response => {
            if (response.didCancel) {
                console.log('User cancelled camera');
            } else if (response.error) {
                console.log('Camera Error: ', response.error);
            } else {
                let imageUri = response.uri || response.assets?.[0]?.uri;
                setUploadTreeImage({ ...uploadTreeImage, uri: response.assets[0].uri, type: response.assets[0].type, name: response.assets[0].fileName });
                SPSheet.hide();
            }
        });
    };
    const openlaunchImageLibrary = () => {
        const options = {
            mediaType: 'photo',
            includeBase64: true,
            maxHeight: 200,
            maxWidth: 200,
        };
        launchImageLibrary(options, response => {
            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.error) {
                console.log('Image picker error: ', response.error);
            } else {
                let imageUri = response.uri || response.assets[0].base64;
                setUploadTreeImage({ ...uploadTreeImage, uri: response.assets[0].uri, type: response.assets[0].type, name: response.assets[0].fileName });
                SPSheet.hide();
            }
        });
    };
    const onChangeGrowerName = async (item) => {
        setIsLoading(true);
        const dataArray = [];
        const { phone, label, value } = item;
        // setProductionUnit([]);
        // setProductionProcess([]);
        // setProductionSeason([]);
        setTreeType([]);
        setTreeName([]);
        setspecies([]);
        setFarmerPhoneNumber(phone);
        setFarmerName(label)
        setFarmerID(value);
        setPlotData({ ...plotData, plotName: "", plotValue: "", })
        const PlotSiteUserLandDetailsRes = await PlotSiteUserLandDetails(dbname, lan_id, token, value);
        if (PlotSiteUserLandDetailsRes.status == 200) {
            PlotSiteUserLandDetailsRes.data.data.forEach(element => {
                dataArray.push({
                    value: element.rel_id,
                    label: element.plot_no
                });
            });
        }
        setplotAll(dataArray);
        setIsLoading(false);
    }
    const onChangePlot = async (item) => {
        setIsLoading(true);
        const plotDetailsResArr = [];
        const { label, value } = item;
        setPlotData({ ...plotData, plotName: label, plotValue: value })
        setPlantingSeason({ ...plantingSeason, plantingSeasonName: "", plantingSeasonValue: "" });
        setProductionProcessData({ ...productionProcessData, productionProcessName: '', productionProcessValue: '' })
        setProductionUnitData({ ...productionUnitData, productionUnitName: '', productionUnitValue: '' })
        setLocation({ ...location, latitude: "", longitude: "" });
        setTreeNameData({ ...treeNameData, treeName: "", treeValue: "" });
        setSpeciesData({ ...speciesData, speciesName: "", speciesValue: "" });
        setTreeData({ ...treeData, treeName: "", treeValue: "" });
        setUploadTreeImage({ ...uploadTreeImage, uri: "", type: "", name: "" });
        setOldTreeImage({ ...oldTreeImage, uri: "", type: "", name: "" });
        setyield_amount("");
        setfromDate("");
        setTreeType([]);
        setTreeName([]);
        setspecies([]);
        const plotDetailsRes = await produceAgainstPlotAPI(dbname, lan_id, farmerID, value);
        if (plotDetailsRes.status == 200) {
            if (type == "editTree") {
                plotDetailsRes.data.data.rows.map((data, index) => {
                    if (data.unique_id != null && data.add_new_crop == "no") {
                        plotDetailsResArr.push({
                            type: "editTree",
                            unique_id: data.unique_id,
                            unique_fid: data.cu_rel_id
                        });
                    }
                });
            } else {
                plotDetailsRes.data.data.rows.map((data, index) => {
                    if (data.unique_id != null && data.add_new_crop == "no") {
                        plotDetailsResArr.push({
                            unique_id: data.unique_id,
                            crop_name: data.crop_name.name,
                            crop_variety: data.crop_variety.name,
                            sowing_date: data.sowing_date
                        });
                    }
                });
            }
            setPlotDetails(plotDetailsResArr);
            setModalVisible(true);
        }
        setIsLoading(false);
        // console.log(JSON.stringify(plotDetailsRes.data.data.rows))
    }
    const onChangeProductionSeason = async (item) => {
        const treeTypeArr = [];
        const { value, label } = item;
        // setProductionUnit([]);
        // setProductionProcess([]);
        // setProductionSeason([]);
        setTreeName([]);
        setspecies([]);
        setPlantingSeason({
            ...plantingSeason,
            plantingSeasonName: label,
            plantingSeasonValue: value
        });
        setLocation({ ...location, latitude: "", longitude: "" });
        setTreeData({ ...treeData, treeName: "", treeValue: "" });
        setTreeNameData({ ...treeNameData, treeName: "", treeValue: "" });
        setSpeciesData({ ...speciesData, speciesName: "", speciesValue: "" })
        const productionStageRes = await productionStageAPI(dbname, lan_id, value, "");
        if (productionStageRes.status == 200) {
            productionStageRes.data.data.crop_type.map((data, index) => {
                treeTypeArr.push({
                    value: data.fid,
                    label: data.name
                })
            })
            setTreeType(treeTypeArr);
        }
    }
    const onChangeTreeType = async (item) => {
        const treenameArr = [];
        const { value, label } = item;
        console.log(value)
        // setProductionUnit([]);
        // setProductionProcess([]);
        // setProductionSeason([]);
        setspecies([]);
        setLocation({ ...location, latitude: "", longitude: "" });
        setTreeNameData({ ...treeNameData, treeName: "", treeValue: "" });
        setSpeciesData({ ...speciesData, speciesName: "", speciesValue: "" })
        setTreeData({ ...treeData, treeName: label, treeValue: value });
        const treeTypeRes = await productionStageAPI(dbname, lan_id, value, plantingSeason.plantingSeasonValue);
        if (treeTypeRes.status == 200) {
            treeTypeRes.data.data.crop_name.map((data, index) => {
                treenameArr.push({
                    value: data.crop_name.fid,
                    label: data.crop_name.name
                })
            })
            setTreeName(treenameArr)
        }
    }
    const onChangeTreeName = async (item) => {
        const treeSpeciesArr = [];
        const { value, label } = item;
        // setProductionUnit([]);
        // setProductionProcess([]);
        // setProductionSeason([]);
        setTreeNameData({ ...treeNameData, treeName: label, treeValue: value });
        setLocation({ ...location, latitude: "", longitude: "" });
        setSpeciesData({ ...speciesData, speciesName: "", speciesValue: "" })
        const treeSpeciesRes = await productionStageAPI(dbname, lan_id, plantingSeason.plantingSeasonValue, value,);
        if (treeSpeciesRes.status == 200) {
            treeSpeciesRes.data.data.crop_variety.map((data, index) => {
                treeSpeciesArr.push({
                    value: data.crop_variety.fid,
                    label: data.crop_variety.name
                })
            })
            setspecies(treeSpeciesArr);
        }
    }
    const onChangeSpecies = async (item) => {
        const { label, value } = item;
        setSpeciesData({ ...speciesData, speciesName: label, speciesValue: value });
        setLocation({ ...location, latitude: "", longitude: "" });
    }
    const onChangeProductionProcess = async (item) => {
        const { label, value } = item;
        setProductionProcessData({ ...productionProcessData, productionProcessName: label, productionProcessValue: value })
    }
    const onChangeProductionUnit = async (item) => {
        const { label, value } = item;
        setProductionUnitData({
            ...productionUnitData,
            productionUnitName: label,
            productionUnitValue: value
        })
    }
    const handleDatePicker = (item) => {
        const dt = new Date(item);
        const x = dt.toISOString().split('T');
        const x1 = x[0].split('-');
        const effective_date = x1[0] + '-' + x1[1] + '-' + x1[2];
        setfromDate(effective_date)
    }
    const onChangeyieldamount = async (item) => {
        setyield_amount(item)
    }
    const onChangeTreeId = async (item, unique_fid) => {
        setIsLoading(true);
        setProductionUnitData({ ...productionUnitData, productionUnitName: '', productionUnitValue: '' })
        setLocation({ ...location, latitude: "", longitude: "" });
        setTreeNameData({ ...treeNameData, treeName: "", treeValue: "" });
        setSpeciesData({ ...speciesData, speciesName: "", speciesValue: "" });
        setTreeData({ ...treeData, treeName: "", treeValue: "" });
        setUploadTreeImage({ ...uploadTreeImage, uri: "", type: "", name: "" });
        setOldTreeImage({ ...oldTreeImage, uri: "", type: "", name: "" });
        const treeTypeArr = [];
        const treenameArr = [];
        const treeSpeciesArr = [];
        const productionProcessArr = [];
        if (unique_fid) {
            setTreeID({ ...treeId, treeId: unique_fid, treeName: item });
            const plotDetailsRes = await produceAgainstPlotAPI(dbname, lan_id, farmerID, plotData.plotValue);
            if (plotDetailsRes.status == 200) {
                const result = plotDetailsRes.data.data.rows.filter(item => item.cu_rel_id === unique_fid);
                const { agri_unit, crop_name, crop_season, crop_type, crop_variety,
                    farmer_production_system, yield_amount, yield_unit, created_at, cu_rel_id } = result[0];
                const [productionStageRes, ProductionProcessRes, treeImage, multiLatLongRes] = await Promise.all([
                    productionStageAPI(dbname, lan_id, crop_season.fid, ""),
                    ProductionProcessAPI(dbname, lan_id),
                    greenZownTreeImg(dbname, lan_id, unique_fid),
                    greenZownlistMultiLatLong(dbname, lan_id, cu_rel_id)
                ])
                if (productionStageRes.status == 200) {
                    productionStageRes.data.data.crop_type.map((data, index) => {
                        treeTypeArr.push({
                            value: data.fid,
                            label: data.name
                        })
                    })
                    setTreeType(treeTypeArr);
                    productionStageRes.data.data.crop_name.map((data, index) => {
                        treenameArr.push({
                            value: data.crop_name.fid,
                            label: data.crop_name.name
                        })
                    })
                    setTreeName(treenameArr)
                    productionStageRes.data.data.crop_variety.map((data, index) => {
                        treeSpeciesArr.push({
                            value: data.crop_variety.fid,
                            label: data.crop_variety.name
                        })
                    })
                    setspecies(treeSpeciesArr);
                }
                if (ProductionProcessRes.status == 200) {
                    ProductionProcessRes.data.data.rows.map((data, index) => {
                        productionProcessArr.push({
                            value: data.fid,
                            label: data.name,
                        });
                    })
                    setProductionProcess(productionProcessArr)
                }
                if (treeImage.status == 200) {
                    if (treeImage.data.data[0] != undefined) {
                        const { file_path, term_type, file_name, file_id } = treeImage.data.data[0];
                        setUploadTreeImage({ ...uploadTreeImage, uri: file_path, type: term_type, name: file_name });
                        setOldTreeImage({ ...oldTreeImage, uri: file_path, type: term_type, name: file_name, id: file_id });
                    } else {
                        setUploadTreeImage({ ...uploadTreeImage, uri: "", type: "", name: "" });
                        setOldTreeImage({ ...oldTreeImage, uri: "", type: "", name: "", id: "" });
                    }
                }
                setPlantingSeason({ ...plantingSeason, plantingSeasonName: crop_season.name, plantingSeasonValue: crop_season.fid });
                setTreeData({ ...treeData, treeName: crop_type.name, treeValue: crop_type.fid });
                setTreeNameData({ ...treeNameData, treeName: crop_name.name, treeValue: crop_name.fid });
                setSpeciesData({ ...speciesData, speciesName: crop_variety.name, speciesValue: crop_variety.fid });
                setProductionProcessData({ ...productionProcessData, productionProcessName: farmer_production_system.name, productionProcessValue: farmer_production_system.fid });
                setyield_amount(yield_amount);
                setProductionUnitData({ ...productionUnitData, productionUnitName: agri_unit.unit_name, productionUnitValue: agri_unit.fid });
                setfromDate(created_at.substring(0, 10));
                if (multiLatLongRes.status == 200) {
                    const { latitude, longitude } = multiLatLongRes.data.data[0];
                    setLocation({ ...location, type: "crop", latitude: latitude, longitude: longitude });
                }
            }
            setIsLoading(false);
        } else {
            setTreeID({ ...treeId, treeId: "", treeName: item });
            setIsLoading(false);
        }
    }
    const validationData = () => {
        Keyboard.dismiss();
        if (plotData.plotValue == "") {
            Toast.show({ text: t('please_select_plot_first'), ...AlertMesg[0] });
            return false;
        } else if (treeId == "") {
            Toast.show({ text: "Pleas Enter Tree Id", ...AlertMesg[0] });
            return false;
        } else if (plantingSeason.plantingSeasonValue == "") {
            Toast.show({ text: t('please_select_cultiveting_season_first'), ...AlertMesg[0] });
            return false;
        } else if (treeData.treeValue == "") {
            Toast.show({ text: t('please_select_crop_type_first'), ...AlertMesg[0] });
            return false;
        } else if (treeNameData.treeValue == "") {
            Toast.show({ text: t('please_select_crop_name_first'), ...AlertMesg[0] });
            return false;
        } else if (speciesData.speciesValue == "") {
            Toast.show({ text: t('please_select_crop_veriety_first'), ...AlertMesg[0] });
            return false;
        } else if (productionProcessData.productionProcessValue == "") {
            Toast.show({ text: t('please_select_production_system_first'), ...AlertMesg[0] });
            return false;
        } else if (yield_amount == "") {
            Toast.show({ text: "Please Select Give Production Size", ...AlertMesg[0] });
            return false;
        } else if (productionUnitData.productionUnitValue == "") {
            Toast.show({ text: t('please_select_yeild_unit'), ...AlertMesg[0] });
            return false;
        } else if (fromDate == "") {
            Toast.show({ text: "Please Select Planting Date First", ...AlertMesg[0] });
            return false;
        } else if (location.latitude == "") {
            Toast.show({ text: t('please_submit_location_first'), ...AlertMesg[0] });
            return false;
        }
        return true;
    }
    const onChangeSaved = async (item) => {
        if (addTreeArray.length > 0) {
            const formData = new FormData();
            formData.append('data', JSON.stringify(addTreeArray));
            uploadTreeImageArr.map((data, index) => {
                if (data.name != "") {
                    formData.append(`crop_image_${index + 1}`, data);
                }
            })
            const submitResponsive = await greenZownRouteaddMultiCrops(dbname, lan_id, token, user_id, formData, addTreeArray.length)
            if (submitResponsive.status == 200) {
                Toast.show({ text: t('your_request_submitted'), ...AlertMesg[0] });
                setTimeout(() => {
                    navigation.navigate("Dashboard");
                }, 1200);
            }
        } else if (validationData()) {

        }
    }
    const onChangeCurrentLatLong = async (index) => {
        const fusedLocation = await getItem('fusedLocation');
        const { latitude, longitude } = fusedLocation;
        // if (fusedLocation != null && longitude.toString().length == 10 && latitude.toString().length == 10) {
        setLocation({ ...location, type: "crop", latitude: latitude, longitude: longitude });
        // } else {
        //     Toast.show({ text: 'Please try again to reach the accurancy', ...AlertMesg[0] });
        // }
        // onChangeSaved();
    }
    useEffect(() => {
        if (type != "editTree") {
            if (location.latitude != "") {
                if (validationData()) {
                    const checkTreeID = async () => {
                        let data = qs.stringify({
                            'unique_id': treeId
                        });
                        const checkUniqueIdTreeRes = await checkUniqueIdTree(dbname, lan_id, data);
                        if (checkUniqueIdTreeRes.status == 409) {
                            treeIdRef.current.focus();
                            Toast.show({ text: "This Tree Id already registered", ...AlertMesg[0] });
                            setLocation({ ...location, latitude: "", longitude: "" });
                        } else {
                            saveInObject();
                            setyield_amount("");
                            setTreeID({ ...treeId, treeId: "", treeName: "" });
                            setfromDate("");
                            setPlantingSeason({ ...plantingSeason, plantingSeasonName: "", plantingSeasonValue: "" });
                            setProductionProcessData({ ...productionProcessData, productionProcessName: '', productionProcessValue: '' })
                            setProductionUnitData({ ...productionUnitData, productionUnitName: '', productionUnitValue: '' })
                            setLocation({ ...location, latitude: "", longitude: "" });
                            setTreeNameData({ ...treeNameData, treeName: "", treeValue: "" });
                            setSpeciesData({ ...speciesData, speciesName: "", speciesValue: "" })
                            setTreeData({ ...treeData, treeName: "", treeValue: "" })
                        }
                    }
                    checkTreeID();
                } else {
                    setLocation({ ...location, type: "crop", latitude: "", longitude: "" });
                }
            }
        }
    }, [location])
    const saveInObject = () => {
        if (validationData()) {
            setUploadTreeImageArr([...uploadTreeImageArr, uploadTreeImage])
            const newData = [...addTreeArray, {
                user_id: farmerID,
                type: "greenzown",
                land_rel_id: plotData.plotValue,
                plotName: plotData.plotName,
                unique_id: treeId.treeName,
                crop_season_id: plantingSeason.plantingSeasonValue,
                crop_type_id: treeData.treeValue,
                crop_name_id: treeNameData.treeValue,
                treeNameDataName: treeNameData.treeName,
                crop_variety_id: speciesData.speciesValue,
                speciesDataName: speciesData.speciesName,
                production_system: productionProcessData.productionProcessValue,
                sowing_date: fromDate,
                harvesting_date: "2050-12-30",
                yield_amount: yield_amount,
                yield_unit: productionUnitData.productionUnitValue,
                agri_land_user_latlongs: [location]
            }];
            setAddTreeArray(newData);
            setUploadTreeImage({ ...uploadTreeImage, uri: "", type: "", name: "" });
        }
    }
    const produceRemoveDetails = (index) => {
        const values = [...addTreeArray];
        values.splice(index, 1);
        setAddTreeArray(values);
    }
    const greenZownuserCropEdit = async () => {
        if (validationData()) {
            const formData = new FormData();
            formData.append('land_rel_id', plotData.plotValue);
            formData.append('crop_season_id', plantingSeason.plantingSeasonValue);
            formData.append('crop_type_id', treeData.treeValue);
            formData.append('crop_name_id', treeNameData.treeValue);
            formData.append('crop_variety_id', speciesData.speciesValue);
            formData.append('production_system', productionProcessData.productionProcessValue);
            formData.append('yield_amount', yield_amount);
            formData.append('yield_unit', productionUnitData.productionUnitValue);
            formData.append('latlong_data', JSON.stringify([location]));
            if (oldTreeImage.name != uploadTreeImage.name && oldTreeImage.name != "") {
                formData.append('crop_img_deleted_id', oldTreeImage.id);
                formData.append('crop_image', uploadTreeImage);
            }
            if (uploadTreeImage.name != "" && oldTreeImage.name == "") {
                formData.append('crop_image', uploadTreeImage);
            }
            const response = await greenZownuserCropEditApi(dbname, lan_id, farmerID, token, treeId.treeId, formData);
            if (response.status == 200) {
                Toast.show({ text: t('your_request_submitted'), ...AlertMesg[0] });
                setTimeout(() => {
                    navigation.navigate("Dashboard");
                }, 1200);
            }
        }
    }
    const onTouchStart = () => {
        setModalVisible(true)
    }
    return {
        farmerDataList,
        onChangeGrowerName,
        onChangePlot,
        farmerPhoneNumber,
        farmerName,
        plotAll,
        productionSeason,
        onChangeProductionSeason,
        plantingSeason,
        productionProcess,
        treeType,
        onChangeTreeType,
        treeName,
        onChangeTreeName,
        treeNameData,
        productionUnit,
        species,
        onChangeSpecies,
        onChangeProductionProcess,
        onChangeProductionUnit,
        openlaunchCamera,
        openlaunchImageLibrary,
        uploadTreeImage,
        openFromDate,
        newFromDate,
        fromDate,
        setOpenFromDate,
        handleDatePicker,
        location,
        onChangeCurrentLatLong,
        onChangeyieldamount,
        onChangeTreeId,
        onChangeSaved,
        plotData,
        treeData,
        speciesData,
        productionProcessData,
        yield_amount,
        productionUnitData,
        addTreeArray,
        produceRemoveDetails,
        treeId,
        plotDetails,
        modalVisible,
        setModalVisible,
        treeIdRef,
        greenZownuserCropEdit,
        onTouchStart,
        isLoading
    }
}

export default TreeController