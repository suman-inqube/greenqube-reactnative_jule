import {
  StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, Image, StatusBar, Pressable, Keyboard
} from 'react-native';
import React, { useEffect, useState, useRef } from 'react';
import Logo from './Common/Logo';
import ButtonForm from './Common/ButtonForm';
import { useNavigation, useRoute } from '@react-navigation/native';
import InputTextForm from './Common/InputTextForm';
import DropdownForm from './Common/DropdownForm';
import config from '../config';
import axios from 'axios';
import ImageForm from './Common/ImageForm';
import DatePicker from 'react-native-date-picker';
import Geolocation from '@react-native-community/geolocation';
// import GetLocation from 'react-native-get-location'
import { getItem, setItem, removeItem } from '../config/getDataFromStorage';
import { isNotEmpty } from './Common/ValidationFunctions';
import MessageDialog from './Common/MessageDialog';
import { request, PERMISSIONS } from 'react-native-permissions';
import { Root, Toast, SPSheet } from 'react-native-popup-confirm-toast';
import { AlertMesg } from './Common/ToastAlert';
import { useTranslation } from 'react-i18next';
import LoadingScreen from './Common/LoadingScreen';
import { useSelector } from 'react-redux';
import ForegroundLocationService from './BackgroundService/ForegroundLocationService';
import DeviceInfo from './DeviceInfo';
import BottomSheetTakePhoto from './Common/BottomSheetTakePhoto';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import {
  useCameraPermission,
  useMicrophonePermission,
  useCameraDevice,
  Camera,
  PhotoFile,
  TakePhotoOptions,
  VideoFile,
  useCodeScanner,
} from 'react-native-vision-camera';
import CameraScreen from './Common/VideoCamera';
import { checkUniqueIdTree } from '../config/apiHere';
const ProduceInfo = () => {
  const ForegroundLocationData = useSelector(state => state.locationData);
  const { netConnection } = DeviceInfo();
  const { t } = useTranslation();
  const route = useRoute();
  const { pagename, arrayIndex, locationData } = route.params;
  const navigation = useNavigation();
  const [dbName, setdbName] = useState();
  const [lanID, setlanID] = useState();
  const [storeProduceInfoInArray, setstoreProduceInfoInArray] = useState([]);
  const [storeProduceInfo, setstoreProduceInfo] = useState({
    plotSiteName: '',
    khatianNo: '',
    noOfPlants: '',
    terrainType: '',
    landType: '',
    soilType: '',
    plotSize: '',
    landUnit: '',
    landUnitName: '',
    landUnitSize: '',
    prodctionSeasion: '',
    livelihoodType: '',
    produceName: '',
    produceVariety: '',
    productionProcess: '',
    expectedProduction: '',
    produceProductionUnit: '',
    cycleEnds: '',
    lat: '',
    long: '',
    treeLat: '',
    treeLong: ''
  });
  const [newdate, setnewDate] = useState(new Date());
  const [opencycleStarts, setOpencycleStarts] = useState(false);
  const [opencycleEnds, setOpencycleEnds] = useState(false);
  const [terrainTypeData, setterrainTypeData] = useState([]);
  const [landTypeData, setlandTypeData] = useState([]);
  const [soilTypeData, setsoilTypeData] = useState([]);
  const [landUnitData, setlandUnitData] = useState([]);
  const [prodctionSeasionData, setprodctionSeasionData] = useState([]);
  const [livelihoodTypeData, setlivelihoodTypeData] = useState([]);
  const [produceNameData, setproduceNameData] = useState([]);
  const [produceVarietyData, setproduceVarietyData] = useState([]);
  const [productionProcessData, setproductionProcessData] = useState([]);
  const [produceProductionUnitData, setproduceProductionUnitData] = useState(
    [],
  );
  const [isChecked, setIsChecked] = useState(false);
  const [startDate, setStartDate] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [produceAddDetails, setProduceAddDetails] = useState([])
  const [photographs, setPhotographs] = useState([
    { uri: "", type: "", name: "", id: "", oldimgName: "" },
    { uri: "", type: "", name: "", id: "", oldimgName: "" },
    { uri: "", type: "", name: "", id: "", oldimgName: "" },
    { uri: "", type: "", name: "", id: "", oldimgName: "" },
  ]);
  const [plotRecord, setPlotRecord] = useState({
    uri: "", type: "", name: ""
  });
  const [plotVideo, setPlotVideo] = useState({
    uri: "", type: "", name: "", id: ""
  });
  const [individualTreeImg, setIndividualTreeImg] = useState({
    uri: "", type: "", name: ""
  });

  const camera = useRef(null);
  const treeIdRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingStart, setRecordingStart] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const allAPIHere = async (dbname, language_id) => {
    const axiosConfig = {
      headers: {
        information: `${dbname},${language_id}`,
        Accept: 'application/json',
      },
    };
    const axiosConfig1 = {
      headers: {
        information: `${dbname}`,
        Accept: 'application/json',
      },
    };
    var soilTypeArray = [];
    var terraintypeArray = [];
    var landTypeArray = [];
    var livelihoodTypeArray = [];
    var prodctionSeasionArray = [];
    var landUnitArray = [];
    var productionProcessArray = [];
    var produceProductionUnitArray = [];
    if (netConnection) {
      const prodctionSeasionAPI =
        config.prodctionSeasionAPI1 + language_id + config.prodctionSeasionAPI2;
      const [
        soilType_res,
        terraintype_res,
        landType_res,
        livelihoodType_res,
        prodctionSeasion_res,
        landUnit_res,
        productionProcess_res,
        produceProductionUnit_res,
      ] = await Promise.all([
        axios.get(config.soiltypeAPI, axiosConfig),
        axios.get(config.terraintypeAPI, axiosConfig),
        axios.get(config.landtypeAPI, axiosConfig),
        axios.get(prodctionSeasionAPI, axiosConfig1),
        axios.get(prodctionSeasionAPI, axiosConfig1),
        axios.get(config.landunitAPI, axiosConfig),
        axios.get(config.productionProcessAPI, axiosConfig),
        axios.get(config.produceProductionUnitAPI, axiosConfig)
      ]);
      if (soilType_res.status == 200) {
        if (soilType_res.data.data.count > 0) {
          soilType_res.data.data.rows.forEach(element => {
            soilTypeArray.push({
              value: element.id,
              label: element.name,
            });
          });
        }
      }
      if (terraintype_res.status == 200) {
        if (terraintype_res.data.data.count > 0) {
          terraintype_res.data.data.rows.forEach(element => {
            terraintypeArray.push({
              value: element.id,
              label: element.name,
            });
          });
        }
      }
      if (landType_res.status == 200) {
        if (landType_res.data.data.count > 0) {
          landType_res.data.data.rows.forEach(element => {
            landTypeArray.push({
              value: element.id,
              label: element.name,
            });
          });
        }
      }
      if (livelihoodType_res.status == 200) {
        if (livelihoodType_res.data.data) {
          livelihoodType_res.data.data.crop_type.forEach(element => {
            livelihoodTypeArray.push({
              value: element.fid,
              label: element.name,
            });
          });
        }
      }
      if (prodctionSeasion_res.status == 200) {
        if (prodctionSeasion_res.data.data) {
          prodctionSeasion_res.data.data.crop_season.forEach(element => {
            prodctionSeasionArray.push({
              value: element.fid,
              label: element.name,
            });
          });
        }
      }
      if (landUnit_res.status == 200) {
        if (landUnit_res.data.data.count > 0) {
          landUnit_res.data.data.rows.forEach(element => {
            landUnitArray.push({
              value: element.id,
              label: element.name,
              sizevalue: element.unit_value,
            });
          });
        }
      }
      if (productionProcess_res.status == 200) {
        if (productionProcess_res.data.data.count > 0) {
          productionProcess_res.data.data.rows.forEach(element => {
            productionProcessArray.push({
              value: element.fid,
              label: element.name,
            });
          });
        }
      }
      if (produceProductionUnit_res.status == 200) {
        if (produceProductionUnit_res.data.data) {
          produceProductionUnit_res.data.data.rows.forEach(element => {
            produceProductionUnitArray.push({
              value: element.fid,
              label: element.unit_name,
            });
          });
        }
      }
      await Promise.all([
        setItem('soilType_res', soilTypeArray),
        setItem('terraintype_res', terraintypeArray),
        setItem('landType_res', landTypeArray),
        setItem('livelihoodType_res', livelihoodTypeArray),
        setItem('prodctionSeasion_res', prodctionSeasionArray),
        setItem('landUnit_res', landUnitArray),
        setItem('productionProcess_res', productionProcessArray),
        setItem('produceProductionUnit_res', produceProductionUnitArray),
      ]);
    } else {
      [
        soilTypeArray,
        terraintypeArray,
        landTypeArray,
        livelihoodTypeArray,
        prodctionSeasionArray,
        landUnitArray,
        productionProcessArray,
        produceProductionUnitArray,
      ] = await Promise.all([
        getItem('soilType_res'),
        getItem('terraintype_res'),
        getItem('landType_res'),
        getItem('livelihoodType_res'),
        getItem('prodctionSeasion_res'),
        getItem('landUnit_res'),
        getItem('productionProcess_res'),
        getItem('produceProductionUnit_res'),
      ]);
    }
    if (soilTypeArray) {
      setsoilTypeData(soilTypeArray);
    }
    if (terraintypeArray) {
      setterrainTypeData(terraintypeArray);
    }
    if (landTypeArray) {
      setlandTypeData(landTypeArray);
    }
    if (livelihoodTypeArray) {
      setlivelihoodTypeData(livelihoodTypeArray);
    }
    if (prodctionSeasionArray) {
      setprodctionSeasionData(prodctionSeasionArray);
    }
    if (landUnitArray) {
      setlandUnitData(landUnitArray);
    }
    if (productionProcessArray) {
      setproductionProcessData(productionProcessArray);
    }
    if (produceProductionUnitArray) {
      setproduceProductionUnitData(produceProductionUnitArray);
    }
  };
  const HandlelivehoodType = async livelihoodType => {
    setstoreProduceInfo({
      ...storeProduceInfo, livelihoodType: livelihoodType,
      produceName: "",
      produceVariety: ""
    });
    produceNameDataList(livelihoodType, lanID, dbName);
  };
  const produceNameDataList = async (livelihoodType, language_id, dbName) => {
    const axiosConfig1 = {
      headers: {
        information: `${dbName}`,
        Accept: 'application/json',
      },
    };
    try {
      let produceNameArray = [];
      let produceName_offline_list_arr = [];
      let produceName_offline_list = await getItem('produceName_res');
      if (netConnection) {
        const produceNameAPI =
          config.produceNameAPI1 +
          language_id +
          config.produceNameAPI2 +
          livelihoodType.value +
          config.produceNameAPI3;
        let produceName_res = await axios.get(produceNameAPI, axiosConfig1);
        if (produceName_res.status == 200) {
          if (produceName_res.data.data) {
            produceName_res.data.data.crop_name.forEach(element => {
              produceNameArray.push({
                value: element.crop_name.fid,
                label: element.crop_name.name,
              });
            });
          }
          if (produceName_offline_list != null && produceName_offline_list.length > 0) {
            if (produceName_offline_list[0][livelihoodType.value] != undefined) {
              JSON.parse(
                produceName_offline_list[0][livelihoodType.value],
              ).push({
                [livelihoodType.value]: JSON.stringify(produceNameArray),
              });
            } else {
              produceName_offline_list.push({
                [livelihoodType.value]: JSON.stringify(produceNameArray),
              });
            }
          } else {
            produceName_offline_list_arr.push({
              [livelihoodType.value]: JSON.stringify(produceNameArray),
            });
            produceName_offline_list = produceName_offline_list_arr;
          }
          await setItem('produceName_res', produceName_offline_list);
        }
      } else {
        if (produceName_offline_list) {
          produceName_offline_list_arr = produceName_offline_list.filter(
            function (v, i) {
              return (
                produceName_offline_list[i][livelihoodType.value] != undefined
              );
            },
          );
          if (produceName_offline_list_arr.length != 0) {
            produceNameArray = JSON.parse(
              produceName_offline_list_arr[0][livelihoodType.value],
            );
          } else {
            produceNameArray = [];
          }
        }
      }
      setproduceNameData(produceNameArray);
    } catch (error) {
      console.log('Error in produceName API', error);
    }
  };
  const HandleproduceName = async produceName => {
    setstoreProduceInfo({ ...storeProduceInfo, produceName: produceName, produceVariety: "" });
    produceVarientyDataList(produceName, lanID, dbName);
  };
  const produceVarientyDataList = async (produceName, language_id, dbName) => {
    const axiosConfig1 = {
      headers: {
        information: `${dbName}`,
        Accept: 'application/json',
      },
    };
    try {
      const produceVarietyAPI =
        config.produceVarietyAPI1 +
        language_id +
        config.produceVarietyAPI2 +
        storeProduceInfo.livelihoodType +
        config.produceVarietyAPI3 +
        produceName.value;
      let produceVarietyArray = [];
      let produceVariety_offline_list_arr = [];
      let produceVariety_offline_list = await getItem('produceVariety_res');
      if (netConnection) {
        let produceVariety_res = await axios.get(
          produceVarietyAPI,
          axiosConfig1,
        );
        if (produceVariety_res.data.data) {
          // await setItem("produceVariety", produceVariety_res.data.data)
          produceVariety_res.data.data.crop_variety.forEach(element => {
            produceVarietyArray.push({
              value: element.crop_variety.fid,
              label: element.crop_variety.name,
            });
          });
          if (produceVariety_offline_list != null && produceVariety_offline_list.length > 0) {
            if (produceVariety_offline_list[0][produceName.value] != undefined) {
              JSON.parse(
                produceVariety_offline_list[0][produceName.value],
              ).push({ [produceName.value]: JSON.stringify(produceVarietyArray), });
            } else {
              produceVariety_offline_list.push({
                [produceName.value]: JSON.stringify(produceVarietyArray),
              });
            }
          } else {
            produceVariety_offline_list_arr.push({
              [produceName.value]: JSON.stringify(produceVarietyArray),
            });
            produceVariety_offline_list = produceVariety_offline_list_arr;
          }
          await setItem('produceVariety_res', produceVariety_offline_list);
        }
      } else {
        if (produceVariety_offline_list) {
          produceVariety_offline_list_arr = produceVariety_offline_list.filter(
            function (v, i) {
              return (
                produceVariety_offline_list[i][produceName.value] != undefined
              );
            },
          );
          if (produceVariety_offline_list_arr.length != 0) {
            produceVarietyArray = JSON.parse(
              produceVariety_offline_list_arr[0][produceName.value],
            );
          } else {
            produceVarietyArray = [];
          }
        }
      }
      setproduceVarietyData(produceVarietyArray);
    } catch (error) {
      console.log('Error in produceVariety API', error);
    }
  };
  const handlecycleEnd = async item => {
    const dt = new Date(item);
    const x = dt.toISOString().split('T');
    const x1 = x[0].split('-');
    const cycleEnds = x1[0] + '-' + x1[1] + '-' + x1[2];
    setstoreProduceInfo({ ...storeProduceInfo, cycleEnds: cycleEnds });
  };
  const setLocation = async (item) => {
    const fusedLocation = await getItem('fusedLocation');
    const { latitude, longitude } = fusedLocation;
    // if (
    //   fusedLocation != null && longitude.toString().length == 10 && latitude.toString().length == 10
    // ) {
    if (item == "tree") {
      if (validationData()) {
        setstoreProduceInfo({ ...storeProduceInfo, treeLat: latitude, treeLong: longitude });
        handleAddProduce();
      } else {
        setstoreProduceInfo({ ...storeProduceInfo, treeLat: "", treeLong: "" });
      }
    } else {
      setstoreProduceInfo({ ...storeProduceInfo, lat: latitude, long: longitude });
    }
    // } else {
    //   Toast.show({
    //     text: 'Please try again to reach the accurancy',
    //     ...AlertMesg[0],
    //   });
    // }
  };
  const validationData = () => {
    if (!storeProduceInfo.plotSiteName) {
      Toast.show({
        time: 3,
        text: `${t('pl_en_plot_name_first')}`,
        ...AlertMesg[0],
      });
      return false;
    }
    if (!storeProduceInfo.terrainType.value) {
      Toast.show({
        time: 3,
        text: `${t('please_select_terrain_type_first')}`,
        ...AlertMesg[0],
      });
      return false;
    }
    if (!storeProduceInfo.landType.value) {
      Toast.show({
        time: 3,
        text: `${t('please_select_land_type_first')}`,
        ...AlertMesg[0],
      });
      return false;
    }
    if (!storeProduceInfo.soilType.value) {
      Toast.show({
        time: 3,
        text: `${t('please_select_soil_type_first')}`,
        ...AlertMesg[0],
      });
      return false;
    }
    if (!storeProduceInfo.plotSize) {
      Toast.show({
        time: 3,
        text: `${t('please_enter_unit')}`,
        ...AlertMesg[0],
      });
      return false;
    }
    if (!storeProduceInfo.landUnit) {
      Toast.show({
        time: 3,
        text: `${t('please_select_unit_first')}`,
        ...AlertMesg[0],
      });
      return false;
    }
    if (!storeProduceInfo.prodctionSeasion.value) {
      Toast.show({
        time: 3,
        text: `${t('please_select_cultiveting_season_first')}`,
        ...AlertMesg[0],
      });
      return false;
    }
    if (!storeProduceInfo.livelihoodType.value) {
      Toast.show({
        time: 3,
        text: `${t('please_select_crop_type_first')}`,
        ...AlertMesg[0],
      });
      return false;
    }
    if (!storeProduceInfo.produceName.value) {
      Toast.show({
        time: 3,
        text: `${t('please_select_crop_name_first')}`,
        ...AlertMesg[0],
      });
      return false;
    }
    if (!storeProduceInfo.produceVariety.value) {
      Toast.show({
        time: 3,
        text: `${t('please_select_crop_veriety_first')}`,
        ...AlertMesg[0],
      });
      return false;
    }
    if (!storeProduceInfo.productionProcess.value) {
      Toast.show({
        time: 3,
        text: `${t('please_select_production_system')}`,
        ...AlertMesg[0],
      });
      return false;
    }
    if (!storeProduceInfo.produceProductionUnit.value) {
      Toast.show({
        time: 3,
        text: `${t('please_give_yeild_size')}`,
        ...AlertMesg[0],
      });
      return false;
    }
    if (!storeProduceInfo.lat) {
      Toast.show({
        time: 3,
        text: `${t('please_submit_location_first')}`,
        ...AlertMesg[0],
      });
      return false;
    }
    if (!storeProduceInfo.cycleEnds) {
      Toast.show({
        time: 3, text: `${t('select_enddate_first')}`, ...AlertMesg[0]
      })
      return false;
    }
    // if (storeProduceInfo.treeLong == "") {
    //   Toast.show({
    //     time: 3, text: `${t('tap_to_get_latitude_and_longitude')}`, ...AlertMesg[0],
    //   });
    //   return false;
    // }
    if (storeProduceInfo.noOfPlants == "") {
      Toast.show({
        time: 3,
        text: `${t('plot_first')}`,
        ...AlertMesg[0],
      });
      return false;
    }
    return true;
  };
  const emptyFieldsValue = () => {
    setstoreProduceInfo({
      plotSiteName: '',
      khatianNo: '',
      noOfPlants: '',
      terrainType: '',
      landType: '',
      soilType: '',
      plotSize: '',
      landUnit: '',
      landUnitName: '',
      landUnitSize: '',
      prodctionSeasion: '',
      livelihoodType: '',
      produceName: '',
      produceVariety: '',
      productionProcess: '',
      expectedProduction: '',
      produceProductionUnit: '',
      cycleEnds: '',
      lat: '',
      long: '',
    });
    setPhotographs([
      { uri: "", type: "", name: "", id: "", oldimgName: "" },
      { uri: "", type: "", name: "", id: "", oldimgName: "" },
      { uri: "", type: "", name: "", id: "", oldimgName: "" },
      { uri: "", type: "", name: "", id: "", oldimgName: "" },
    ]);
    setPlotRecord({
      uri: "", type: "", name: ""
    });
    setPlotVideo({
      uri: "", type: "", name: "", id: ""
    });
  };
  const saveInObject = async () => {
    if (validationData()) {
      const newData = [...storeProduceInfoInArray, storeProduceInfo];
      console.log(newData)
      // setstoreProduceInfoInArray(newData);
      // emptyFieldsValue();
    }
  };
  const handleLandUnit = async item => {
    let landUnitSize;
    if (item.sizevalue > 0) {
      landUnitSize = storeProduceInfo.plotSize * item.sizevalue;
    } else {
      landUnitSize = storeProduceInfo.plotSize * 1;
    }
    setstoreProduceInfo({
      ...storeProduceInfo,
      sizevalue: item.sizevalue,
      landUnit: item.value,
      landUnitSize: landUnitSize,
      landUnitName: item.label,
    });
  };
  const handleSave = async () => {
    Keyboard.dismiss();
    if (storeProduceInfoInArray.length > 0) {
      console.log(storeProduceInfo.sizevalue)
      await setItem('storeProduceInfo_data', storeProduceInfoInArray);
      navigation.navigate('SignUpViwer');
      console.log(JSON.stringify(storeProduceInfoInArray))
    } else {
      const res = validationData();
      if (storeProduceInfoInArray.length > 0) {
        setstoreProduceInfoInArray([
          ...storeProduceInfoInArray,
          storeProduceInfo,
        ]);
        emptyFieldsValue();
      }
    }
  };
  const onPageLoad = async () => {
    const [storeSignup_data, storePersnolInfo_data] = await Promise.all([
      getItem('storeSignup_data'),
      getItem('storePersnolInfo_data'),
    ]);
    const dbName = storeSignup_data.company.dbname;
    const languageID = storePersnolInfo_data.language.value;
    setdbName(dbName);
    setlanID(languageID);
    allAPIHere(dbName, languageID);
  };
  useEffect(() => {
    onPageLoad();
  }, [netConnection]);
  useEffect(() => {
    if (storeProduceInfo.treeLat != '') {
      handleAddProduce();
    }
  }, [storeProduceInfo.treeLat]);
  const handleOpencycleEnds = () => {
    setOpencycleEnds(true);
  };
  const handleAddProduce = () => {
    if (storeProduceInfo.startDate !== '') {
      if (validationData()) {
        if (storeProduceInfoInArray.length < 3) {
          emptyFieldsValue();
          console.log(photographs) //****** */
          setstoreProduceInfoInArray([
            ...storeProduceInfoInArray,
            {
              storeProduceInfo,
              photographs: photographs,
              plotRecord: plotRecord,
              plotVideo: plotVideo,
              individualTreeImg: individualTreeImg
            },
          ]);
        }
      }
    } else {
      Toast.show({
        time: 3,
        text: t('select_enddate_first'),
        ...AlertMesg[0],
      });
    }
  };
  const produceRemoveDetails = (index) => {
    const values = [...storeProduceInfoInArray];
    values.splice(index, 1);
    setstoreProduceInfoInArray(values);
  };
  const openlaunchCamera = (id, index) => {
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
        const photographsValue = [...photographs];
        photographsValue[index] = { uri: response.assets[0].uri, type: response.assets[0].type, id: id, name: response.assets[0].fileName }
        setPhotographs(photographsValue);
        SPSheet.hide();
      }
    });
  };
  const openlaunchImageLibrary = (id, index, type) => {
    const photographsValue = [...photographs];
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
        if (type == "plotRecord") {
          setPlotRecord({ ...plotRecord, uri: response.assets[0].uri, type: response.assets[0].type, name: response.assets[0].fileName, id: id })
        } else if (type == "individualTree") {
          setIndividualTreeImg({ ...individualTreeImg, uri: response.assets[0].uri, type: response.assets[0].type, name: response.assets[0].fileName, id: id })
        } else {
          photographsValue[index] = { uri: response.assets[0].uri, type: response.assets[0].type, id: id, name: response.assets[0].fileName }
          setPhotographs(photographsValue);
        }
        SPSheet.hide();
      }
    });
  };
  const onStartRecording = async (id) => {
    if (!camera.current) {
      return;
    }
    setIsRecording(true);
    if (isRecording == false) {
      camera.current.startRecording({
        onRecordingFinished: (video) => {
          setPlotVideo({
            ...plotVideo, uri: `file:///${video.path}`, type: "", name: "", id: id
          })
          setIsRecording(false);
          setRecordingStart(false);
          console.log(video)
        },
        onRecordingError: (error) => {
          setRecordingDuration(0);
          console.error(error);
          setIsRecording(false);
          setRecordingStart(false);
        },
      });
    } else {
      camera.current?.stopRecording();
      setRecordingDuration(0);
    }
  };
  const checkTreeID = async (item) => {
    const checkUniqueIdTreeRes = await checkUniqueIdTree(dbName, lanID, storeProduceInfo.noOfPlants);
    if (checkUniqueIdTreeRes.data == 409) {
      setstoreProduceInfo({ ...storeProduceInfo, noOfPlants: "" })
      treeIdRef.current.focus();
    }
  }
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={'#003c04'} />
      {isLoading ? (
        <View style={styles.loadingScreen}>
          <LoadingScreen />
        </View>
      ) : null}
      {recordingStart ?
        <CameraScreen recordingDuration={recordingDuration} plotVideo={plotVideo} camera={camera} isRecording={isRecording} onStartRecording={onStartRecording} setRecordingDuration={setRecordingDuration} />
        : <>
          <View style={styles.container}>
            <View style={{ height: 60, backgroundColor: '#003c04' }}></View>
            <Text style={styles.headersTitle}>
              {t('reg_land_crop_information')}
            </Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.formContainer}>
                <View style={{ paddingHorizontal: 20 }}>
                  <View>
                    <Image
                      source={require('../pages/Common/images/logo.png')}
                      style={styles.logo}
                    />
                  </View>
                  <InputTextForm
                    label={t('pre_plot_name')}
                    color="red"
                    onChangeText={item =>
                      setstoreProduceInfo({ ...storeProduceInfo, plotSiteName: item })
                    }
                    value={storeProduceInfo.plotSiteName}
                  />
                  <InputTextForm
                    label={t('khatian_no')}
                    onChangeText={item =>
                      setstoreProduceInfo({ ...storeProduceInfo, khatianNo: item })
                    }
                    value={storeProduceInfo.khatianNo}
                  />
                  <DropdownForm
                    label={t('addland_terrain_type')}
                    color="red"
                    data={terrainTypeData}
                    onChange={item =>
                      setstoreProduceInfo({ ...storeProduceInfo, terrainType: item })
                    }
                    val={storeProduceInfo.terrainType.label}
                  />
                  <DropdownForm
                    label={t('select_land_type')}
                    color="red"
                    data={landTypeData}
                    onChange={item => {
                      setstoreProduceInfo({ ...storeProduceInfo, landType: item });
                    }}
                    val={storeProduceInfo.landType.label}
                  />
                  <DropdownForm
                    label={t('select_terrain_type')}
                    color="red"
                    data={soilTypeData}
                    onChange={item => {
                      setstoreProduceInfo({ ...storeProduceInfo, soilType: item });
                    }}
                    val={storeProduceInfo.soilType.label}
                  />
                  <View
                    style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <View style={{ width: '45%' }}>
                      <InputTextForm
                        label={t('addland_landsize')}
                        color="red"
                        onChangeText={item =>
                          setstoreProduceInfo({ ...storeProduceInfo, plotSize: item })
                        }
                        value={storeProduceInfo.plotSize}
                        keyboardType="numeric"
                      />
                    </View>
                    <View style={{ width: '45%' }}>
                      {/* <DropdownForm label="Unit" color="red" data={landUnitData} onChange={item => { setstoreProduceInfo({ ...storeProduceInfo, landUnit: item }) }} val={storeProduceInfo.landUnit} /> */}
                      <DropdownForm
                        label={t('addland_unit')}
                        color="red"
                        data={landUnitData}
                        onChange={item => handleLandUnit(item)}
                        val={storeProduceInfo.landUnitName}
                      />
                    </View>
                  </View>
                  <TouchableOpacity style={{ marginBottom: 4 }}>
                    <TouchableOpacity onPress={() => setLocation("")}>
                      {storeProduceInfo.lat ? (
                        <View
                          style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', }}>
                          <Text style={{ color: '#000' }}>
                            {storeProduceInfo.lat}
                          </Text>
                          <Text style={{ color: '#000' }}>
                            {storeProduceInfo.long}
                          </Text>
                        </View>
                      ) : (
                        ''
                      )}
                      <View
                        style={{
                          flex: 1,
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}>
                        <Text style={{ color: 'red' }}>
                          {t('tap_to_get_latitude_and_longitude')}
                        </Text>
                        <Image
                          source={require('./Common/images/map.png')}
                          style={{ width: 50, height: 50 }}
                        />
                      </View>
                    </TouchableOpacity>
                  </TouchableOpacity>
                  <Text style={[styles.title, { marginVertical: 20 }]}>Photographs of Plot</Text>
                  <View style={styles.photographsContainer}>
                    {photographs.map((data, index) => {
                      if (index < 4) {
                        return (
                          <BottomSheetTakePhoto key={index}
                            openlaunchCamera={() => openlaunchCamera(data.id, index)}
                            openlaunchImageLibrary={() => openlaunchImageLibrary(data.id, index, "")}
                            uploadTreeImage={data}
                            TakePhoto={"Take Photo"}
                            ChooseFromGallery={"Choose From Gallery"}
                            Cancel={"Cancel"}
                            height={250}
                          />
                        )
                      }
                    })}
                  </View>
                  <Text style={[styles.title, { marginVertical: 20 }]}>Upload Land Record as proof of ownership</Text>
                  <TouchableOpacity onPress={() => openlaunchImageLibrary(plotRecord.id, 5, 'plotRecord')}>
                    {plotRecord.name == "" ? <Image source={require('./Common/images/adobereader.png')} style={{ width: 80, height: 80 }} />
                      : <Image
                        source={{ uri: plotRecord.uri }}
                        style={{ width: 60, height: 60, marginBottom: 10 }}
                        resizeMode="contain"
                      />}
                  </TouchableOpacity>
                  <View style={{ marginVertical: 20 }}>
                    <BottomSheetTakePhoto
                      title={"Short Video Clip of Plantation"}
                      openlaunchCamera={() => { setRecordingStart(true), SPSheet.hide() }}
                      openlaunchImageLibrary={() => { setRecordingStart(true), SPSheet.hide() }}
                      // uploadTreeImage={photographsFour}
                      TakePhoto={"Take Video"}
                      // ChooseFromGallery={"Choose From Gallery"}
                      Cancel={"Cancel"}
                      height={200}
                      VideoProps={plotVideo.uri}
                    />
                  </View>
                  <Text style={[styles.title, { marginVertical: 20 }]}>Photograph of Individual Tree</Text>
                  <TouchableOpacity onPress={() => openlaunchImageLibrary(plotRecord.id, 5, 'individualTree')} style={{ opacity: 0.7 }}>
                    {individualTreeImg.name == "" ? <Image source={require('./Common/images/camera.jpeg')} style={{ width: 60, height: 60 }} />
                      : <Image
                        source={{ uri: individualTreeImg.uri }}
                        style={{ width: 60, height: 60, marginBottom: 10 }}
                        resizeMode="contain"
                      />}
                  </TouchableOpacity>
                  <InputTextForm
                    color={'red'}
                    label={t('no_of_plants')}
                    onChangeText={item =>
                      setstoreProduceInfo({ ...storeProduceInfo, noOfPlants: item })
                    }
                    onBlur={(text) => checkTreeID(text)}
                    refname={treeIdRef}
                    value={storeProduceInfo.noOfPlants}
                  />
                  <DropdownForm
                    label={t('addcrop_cultivating_season')}
                    color="red"
                    data={prodctionSeasionData}
                    onChange={item => {
                      setstoreProduceInfo({
                        ...storeProduceInfo,
                        prodctionSeasion: item,
                        livelihoodType: "",
                        produceName: "",
                        produceVariety: ""
                      });
                    }}
                    val={storeProduceInfo.prodctionSeasion.label}
                  />
                  <DropdownForm
                    label={t('addcrop_croptype')}
                    color="red"
                    data={livelihoodTypeData}
                    onChange={item => HandlelivehoodType(item)}
                    val={storeProduceInfo.livelihoodType.label}
                  />
                  <DropdownForm
                    label={t('select_crop_name')}
                    color="red"
                    data={produceNameData}
                    onChange={item => HandleproduceName(item)}
                    val={storeProduceInfo.produceName.label}
                  />
                  <DropdownForm
                    label={t('select_crop_variety')}
                    color="red"
                    data={produceVarietyData}
                    onChange={item => {
                      setstoreProduceInfo({
                        ...storeProduceInfo,
                        produceVariety: item,
                      });
                    }}
                    val={storeProduceInfo.produceVariety.label}
                  />
                  <DropdownForm
                    label={t('production_system')}
                    color="red"
                    data={productionProcessData}
                    onChange={item => {
                      setstoreProduceInfo({
                        ...storeProduceInfo,
                        productionProcess: item,
                      });
                    }}
                    val={storeProduceInfo.productionProcess.label}
                  />
                  <InputTextForm
                    label={t('expected_yield')}
                    color="red"
                    onChangeText={item =>
                      setstoreProduceInfo({
                        ...storeProduceInfo,
                        expectedProduction: item,
                      })
                    }
                    value={storeProduceInfo.expectedProduction}
                    keyboardType="numeric"
                  />
                  <DropdownForm
                    label={t('select_unit')} color="red" data={produceProductionUnitData}
                    onChange={item => {
                      setstoreProduceInfo({ ...storeProduceInfo, produceProductionUnit: item });
                    }}
                    val={storeProduceInfo.produceProductionUnit.label}
                  />
                  <View>
                    <Text style={{ marginBottom: 5, marginLeft: 5, color: 'red' }}>
                      {t('showing_date')}
                    </Text>
                    <View style={styles.passwordMainContainer}>
                      <View style={styles.passwordContainer}>
                        <Text
                          style={styles.inputTextStyle}
                          onTouchStart={() => handleOpencycleEnds()}>{storeProduceInfo.cycleEnds}</Text>
                        <TouchableOpacity onPress={() => handleOpencycleEnds()}>
                          <ImageForm source={require('./Common/images/date.png')} resizeMode="cover" height={30} width={30} />
                        </TouchableOpacity>
                        <DatePicker
                          modal mode="date" format="YYYY-MM-DD" open={opencycleEnds} date={newdate}
                          onConfirm={item => { handlecycleEnd(item); setOpencycleEnds(false) }}
                          onCancel={() => { setOpencycleEnds(false) }}
                        />
                      </View>
                    </View>
                  </View>
                  <TouchableOpacity style={{ marginBottom: 4 }}>
                    <TouchableOpacity onPress={() => setLocation("tree")}>
                      {storeProduceInfo.treeLat ? (
                        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', }}>
                          <Text style={{ color: '#000' }}>{storeProduceInfo.treeLat}</Text>
                          <Text style={{ color: '#000' }}>{storeProduceInfo.treeLong}</Text>
                        </View>
                      ) : (
                        ''
                      )}
                      <View
                        style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={{ color: 'red' }}>{t('tap_to_get_latitude_and_longitude')}</Text>
                        <Image source={require('./Common/images/map.png')} style={{ width: 50, height: 50 }} />
                      </View>
                    </TouchableOpacity>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={saveInObject}
                    style={{ alignItems: 'center' }}
                    activeOpacity={0.7}>
                    <Text style={styles.addBtn}>{t('click_to_add_more_plot')}</Text>
                  </TouchableOpacity>
                  <View style={{ marginBottom: 10 }}>
                    {storeProduceInfoInArray.map((data, index) => {
                      return (
                        <View style={styles.moreContainer} key={index}>
                          <View style={styles.moreTextContainer}>
                            <Text style={styles.moreText}>
                              {data.storeProduceInfo.plotSiteName}
                            </Text>
                            <Text style={styles.moreText}>
                              {data.storeProduceInfo.produceName.label}
                            </Text>
                            <Text style={styles.moreText}>
                              {data.storeProduceInfo.produceVariety.label}
                            </Text>
                          </View>
                          <TouchableOpacity
                            onPress={() => produceRemoveDetails(index)}>
                            <Image
                              source={require('./Common/images/x-mark.png')}
                              style={styles.xMarkImage}
                            />
                          </TouchableOpacity>
                        </View>
                      );
                    })}
                  </View>
                </View>
              </View>
            </ScrollView>
          </View>
          <ButtonForm label={t('next')} onPress={() => handleSave('SignUpViwer')} />
        </>}
      <Root></Root>
    </>
  );
};
export default ProduceInfo;
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    flex: 1,
  },
  formContainer: {
    backgroundColor: '#ffffff',
    marginBottom: 60,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headersTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    textAlign: 'right',
    marginRight: '2.5%',
    color: '#000',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: 'black',
    borderRadius: 3,
    marginRight: 8,
  },
  checked: {
    backgroundColor: 'blue',
  },
  passwordMainContainer: {
    flex: 1,
    alignItems: 'center',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#f3ecec',
    borderWidth: 1.5,
    borderRadius: 8,
    width: '100%',
    paddingEnd: 8,
    backgroundColor: 'white',
    height: 50,
    marginBottom: 15,
  },
  inputTextStyle: {
    flex: 1,
    height: 50,
    marginTop: 23,
    marginHorizontal: 10,
    borderColor: 'gray',
    color: '#000',
  },
  moreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: '10%',
    marginVertical: '3%',
  },
  xMarkImage: {
    width: 20,
    height: 20,
  },
  moreTextContainer: {
    borderLeftWidth: 5,
    borderLeftColor: 'green',
    paddingLeft: 10,
  },
  moreText: {
    color: '#000',
    fontFamily: 'Poppins-Regular',
    fontSize: 14
  },
  addBtn: {
    backgroundColor: 'green',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    color: '#FFFFFF',
    elevation: 5,
  },
  logo: {
    width: 250,
    height: 100,
    resizeMode: 'contain',
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
    marginLeft: 60,
  },
  loadingScreen: {
    position: 'absolute',
    top: 250,
    zIndex: 999,
    left: '45%',
  },
  photographsContainer: {
    flexDirection: "row",
    justifyContent: "space-around"
  },
  title: {
    color: '#000',
    fontFamily: 'Poppins-Regular',
    fontSize: 14
  }
});
