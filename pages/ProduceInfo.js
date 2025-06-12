import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  Modal,
  Alert,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import ButtonForm from './Common/ButtonForm';
import { useNavigation, useRoute } from '@react-navigation/native';
import InputTextForm from './Common/InputTextForm';
import DropdownForm from './Common/DropdownForm';
import config from '../config';
import axios from 'axios';
import ImageForm from './Common/ImageForm';
import DatePicker from 'react-native-date-picker';
import { getItem, setItem, removeItem } from '../config/getDataFromStorage';
import { Root, Toast } from 'react-native-popup-confirm-toast';
import { AlertMesg } from './Common/ToastAlert';
import { useTranslation } from 'react-i18next';
import LoadingScreen from './Common/LoadingScreen';
import DeviceInfo from './DeviceInfo';
import Map from './admin/Map';
import * as geolib from 'geolib';
import {
  calculateAreaFun,
  convertedArrayLatLong,
  calculatePolygonArea,
} from './Common/calculateAreaFun';
import DocumentPicker, { types } from 'react-native-document-picker';
import ProofAndIdentityPropfComp from './Common/ProofAndIdentityPropfComp';
import { LandUnitArea, LandUnitsquare_metre, nearestLatLong, } from '../config/apiHere';
import * as turf from '@turf/turf';
const ProduceInfo = () => {
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
    daagNo: '',
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
    cycleStarts: '',
    cycleEnds: '',
    lat: '',
    long: '',
    IOTId: "",
    IOTLatLong: "",
    IOTLatlat: "",
    ConvertedreportedLandsize: 0,
  });
  const [landProof, setLandProof] = useState([
    { uri: '', name: '', type: '', fileName: '' },
    { uri: '', name: '', type: '', fileName: '' },
    { uri: '', name: '', type: '', fileName: '' },
    { uri: '', name: '', type: '', fileName: '' },
    { uri: '', name: '', type: '', fileName: '' },
  ]);
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
  const [locationType, setLocationType] = useState('location_tap');
  const [landAreaUnit, setLandAreaUnit] = useState([]);
  const [landUnitsquareMetre, setLandUnitsquareMetre] = useState([]);
  const [defaultLand, setDefaultLand] = useState(false);
  const [convertionLUState, setConvertionLUState] = useState(false);
  const [nearPolSet, setnearPolSet] = useState([]);
  const [referencelatLong, setreferencelatLong] = useState({ latitude: 0, longitude: 0 });
  const groupByRelId = data => {
    const grouped = data.reduce((result, item) => {
      const newItem = {
        latitude: parseFloat(item.latitude),
        longitude: parseFloat(item.longitude),
      };

      if (!result[item.rel_id]) {
        result[item.rel_id] = [];
      }
      result[item.rel_id].push(newItem);
      return result;
    }, {});
    return Object.values(grouped);
    // return Object.values(grouped).flat();
  };
  const allAPIHere = async (dbname, language_id) => {
    const axiosConfig = {
      headers: {
        information: `${dbname},${language_id}`,
        Accept: 'application/json',
      },
    };
    const axiosConfig1 = {
      headers: {
        information: `${dbname},${language_id}`,
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
        defaultLandUnitAreaRes,
        UnitConversonToDefault_res,
      ] = await Promise.all([
        axios.get(config.soiltypeAPI, axiosConfig),
        axios.get(config.terraintypeAPI, axiosConfig),
        axios.get(config.landtypeAPI, axiosConfig),
        axios.get(prodctionSeasionAPI, axiosConfig1),
        axios.get(prodctionSeasionAPI, axiosConfig1),
        axios.get(config.landunitAPI, axiosConfig),
        axios.get(config.productionProcessAPI, axiosConfig),
        axios.get(config.produceProductionUnitAPI, axiosConfig),
        axios.get(config.defaultLandUnitArea, axiosConfig),
        axios.get(config.UnitConversonToDefault, axiosConfig),
      ]);

      let i = 0;
      if (UnitConversonToDefault_res.status == 200) {
        if (UnitConversonToDefault_res.data.data?.count > 0) {
          UnitConversonToDefault_res.data.data.rows.forEach(element => {
            if (
              element.defined_unit_value == null ||
              element.defined_unit_value == ''
            ) {
              i = i + 1;
            }
          });
        }
      }
      if (i > 0) {
        setConvertionLUState(true);
      }

      if (defaultLandUnitAreaRes.status == 200) {
        if (defaultLandUnitAreaRes.data.data?.count > 0) {
          defaultLandUnitAreaRes.data.data.rows.forEach(element => {
            if (element.defined_unit_value.length > 0) {
              setDefaultLand(true);
            }
          });
        }
      }
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
      ...storeProduceInfo,
      livelihoodType: livelihoodType,
      produceName: '',
      produceVariety: '',
    });
    produceNameDataList(livelihoodType, lanID, dbName);
  };
  const produceNameDataList = async (livelihoodType, language_id, dbName) => {
    const axiosConfig1 = {
      headers: {
        information: `${dbName},${language_id}`,
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
          if (
            produceName_offline_list != null &&
            produceName_offline_list.length > 0
          ) {
            if (
              produceName_offline_list[0][livelihoodType.value] != undefined
            ) {
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
    setstoreProduceInfo({
      ...storeProduceInfo,
      produceName: produceName,
      produceVariety: '',
    });
    produceVarientyDataList(produceName, lanID, dbName);
  };
  const produceVarientyDataList = async (produceName, language_id, dbName) => {
    const axiosConfig1 = {
      headers: {
        information: `${dbName},${language_id}`,
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
          produceVariety_res.data.data.crop_variety.forEach(element => {
            produceVarietyArray.push({
              value: element.crop_variety.fid,
              label: element.crop_variety.name,
            });
          });
          if (
            produceVariety_offline_list != null &&
            produceVariety_offline_list.length > 0
          ) {
            if (
              produceVariety_offline_list[0][produceName.value] != undefined
            ) {
              JSON.parse(
                produceVariety_offline_list[0][produceName.value],
              ).push({
                [produceName.value]: JSON.stringify(produceVarietyArray),
              });
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
  const handlecycleStart = item => {
    const dt = new Date(item);
    const x = dt.toISOString().split('T');
    const x1 = x[0].split('-');
    const cycleStarts = x1[0] + '-' + x1[1] + '-' + x1[2];
    setStartDate(cycleStarts);
    setstoreProduceInfo({ ...storeProduceInfo, cycleStarts: cycleStarts });
  };
  const handlecycleEnd = async item => {
    const dt = new Date(item);
    const x = dt.toISOString().split('T');
    const x1 = x[0].split('-');
    const cycleEnds = x1[0] + '-' + x1[1] + '-' + x1[2];
    setstoreProduceInfo({ ...storeProduceInfo, cycleEnds: cycleEnds });
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
    if (!storeProduceInfo?.terrainType?.value) {
      Toast.show({
        time: 3,
        text: `${t('please_select_terrain_type_first')}`,
        ...AlertMesg[0],
      });
      return false;
    }
    if (!storeProduceInfo?.landType?.value) {
      Toast.show({
        time: 3,
        text: `${t('please_select_land_type_first')}`,
        ...AlertMesg[0],
      });
      return false;
    }
    if (!storeProduceInfo?.soilType?.value) {
      Toast.show({
        time: 3,
        text: `${t('please_select_soil_type_first')}`,
        ...AlertMesg[0],
      });
      return false;
    }
    if (!storeProduceInfo.plotSize) {
      Toast.show({ time: 3, text: `${t('please_enter_unit')}`, ...AlertMesg[0] });
      return false;
    }
    if (!storeProduceInfo?.landUnit) {
      Toast.show({
        time: 3,
        text: `${t('please_select_unit_first')}`,
        ...AlertMesg[0],
      });
      return false;
    }
    if (!storeProduceInfo?.prodctionSeasion?.value) {
      Toast.show({
        time: 3,
        text: `${t('please_select_cultiveting_season_first')}`,
        ...AlertMesg[0],
      });
      return false;
    }
    if (!storeProduceInfo?.livelihoodType?.value) {
      Toast.show({
        time: 3,
        text: `${t('please_select_crop_type_first')}`,
        ...AlertMesg[0],
      });
      return false;
    }
    if (!storeProduceInfo.produceName?.value) {
      Toast.show({
        time: 3,
        text: `${t('please_select_crop_name_first')}`,
        ...AlertMesg[0],
      });
      return false;
    }
    if (!storeProduceInfo?.produceVariety?.value) {
      Toast.show({
        time: 3,
        text: `${t('please_select_crop_veriety_first')}`,
        ...AlertMesg[0],
      });
      return false;
    }
    if (!storeProduceInfo?.productionProcess?.value) {
      Toast.show({
        time: 3,
        text: `${t('please_select_production_system')}`,
        ...AlertMesg[0],
      });
      return false;
    }
    if (!storeProduceInfo?.produceProductionUnit?.value) {
      Toast.show({
        time: 3,
        text: `${t('please_give_yeild_size')}`,
        ...AlertMesg[0],
      });
      return false;
    }
    if (location[0].latitude == '') {
      Toast.show({
        time: 3,
        text: `${t('please_submit_location_first')}`,
        ...AlertMesg[0],
      });
      return false;
    }
    if (!storeProduceInfo.cycleEnds) {
      Toast.show({
        time: 3,
        text: `${t('select_enddate_first')}`,
        ...AlertMesg[0],
      });
      return false;
    }
    // if (storeProduceInfo.expectedProduction == "") {
    //   Toast.show({
    //     time: 3,
    //     text: `${t('select_enddate_first')}`,
    //     ...AlertMesg[0],    //   });
    //   return false;
    // }
    if (storeProduceInfo.cycleStarts == '') {
      Toast.show({
        time: 3,
        text: `${t('select_enddate_first')}`,
        ...AlertMesg[0],
      });
      return false;
    }
    return true;
  };
  const emptyFieldsValue = () => {
    setstoreProduceInfo({
      plotSiteName: '',
      daagNo: '',
      khatianNo: '',
      noOfPlants: '',
      terrainType: '',
      landType: '',
      soilType: '',
      plotSize: '',
      landUnit: '',
      prodctionSeasion: '',
      livelihoodType: '',
      produceName: '',
      produceVariety: '',
      productionProcess: '',
      expectedProduction: '',
      produceProductionUnit: '',
      cycleStarts: '',
      cycleEnds: '',
      lat: '',
      long: '',
      google_area: '',
      IOTId: "",
      IOTLatLong: "",
      IOTLatlat: "",
      ConvertedreportedLandsize: 0,
    });
  };
  const saveInObject = async () => {
    if (area != null && area != undefined && area != '' && area != 0) {
      const deviation = Math.abs(storeProduceInfo?.ConvertedreportedLandsize - area) / ((storeProduceInfo?.ConvertedreportedLandsize + area) / 2) * 100;
      if (deviation >= -5 && deviation <= 5) {

      } else {
        Alert.alert(
          'Deviation',
          'The deviation between reported area and google area is not within 5%',
          [
            { text: 'OK', onPress: () => console.log(area) },
          ],
          { cancelable: false }
        )
        setIsLoading(false);
        return;
      }
    }
    if (validationData()) {
      const newData = [...storeProduceInfoInArray, storeProduceInfo];
      setstoreProduceInfoInArray(newData);
      emptyFieldsValue();
      removesetLocation();
    }
  };
  const handleLandUnit = async item => {
    ///*************///
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
      sizevalue: item.sizevalue,
      ConvertedreportedLandsize: Number(item?.sizevalue) * Number(storeProduceInfo?.plotSize),
      cycleEnds: ""
    });
  };
  const handleSave = async () => {
    if (area != null && area != undefined && area != '' && area != 0) {
      const deviation = Math.abs(storeProduceInfo?.ConvertedreportedLandsize - area) / ((storeProduceInfo?.ConvertedreportedLandsize + area) / 2) * 100;
      if (deviation >= -5 && deviation <= 5) {

      } else {
        setstoreProduceInfo({ ...storeProduceInfo, cycleEnds: "" });
        Alert.alert(
          'Deviation',
          'The deviation between reported area and google area is not within 5%',
          [
            { text: 'OK', onPress: () => console.log(area) },
          ],
          { cancelable: false }



        )
        setIsLoading(false);
        return;
      }
    }
    if (defaultLand == true) {
      if (convertionLUState == false) {
        if (storeProduceInfoInArray.length > 0) {
          await setItem('storeProduceInfo_data', storeProduceInfoInArray);
          navigation.navigate('SignUpViwer');
        } else {
          const res = validationData();
          if (storeProduceInfoInArray.length > 0) {
            setstoreProduceInfoInArray([
              ...storeProduceInfoInArray,
              storeProduceInfo,
              landProof,
            ]);
            emptyFieldsValue();
          }
        }
      } else {
        Toast.show({
          text: 'Please add the unit equivalent factor to default unit',
          ...AlertMesg[0],
        });
      }
    } else {
      Toast.show({
        text: 'Please set default unit',
        ...AlertMesg[0],
      });
    }
  };
  const onPageLoad = async () => {
    const fusedLocation = await getItem('fusedLocation');
    const { latitude, longitude } = fusedLocation;
    let groupedData;
    const [storeSignup_data, storePersnolInfo_data] = await Promise.all([
      getItem('storeSignup_data'),
      getItem('storePersnolInfo_data'),
    ]);
    const dbName = storeSignup_data.company.dbname;
    const languageID = storePersnolInfo_data.language.value;


    const [nearestLatLong_res, LandUnitArea_res, LandUnitsquare_metre_res] =
      await Promise.all([
        nearestLatLong(dbName, languageID, "", latitude, longitude),
        LandUnitArea(dbName, languageID),
        LandUnitsquare_metre(dbName, languageID),
      ]);
    setreferencelatLong({ latitude, longitude });
    if (nearestLatLong_res.status == 200) {
      groupedData = groupByRelId(nearestLatLong_res.data.data);
      setnearPolSet(groupedData);
      setPolygons(groupedData);
    }
    if (LandUnitArea_res?.status == 200) {
      const { count, rows } = LandUnitArea_res?.data?.data || {};
      if (count > 0) {
        setLandAreaUnit(rows);
      } else {
        setLandAreaUnit([]);
      }
    }
    if (LandUnitsquare_metre_res?.status == 200) {
      const { count, rows } = LandUnitsquare_metre_res?.data?.data || {};
      if (count > 0) {
        setLandUnitsquareMetre(rows);
      } else {
        setLandUnitsquareMetre([]);
      }
    }
    setdbName(dbName);
    setlanID(languageID);
    allAPIHere(dbName, languageID);
  };
  useEffect(() => {
    onPageLoad();
  }, [netConnection]);
  useEffect(() => {
    if (storeProduceInfo.cycleEnds != '') {
      handleAddProduce();
    }
  }, [storeProduceInfo]);
  const handleOpencycleEnds = () => {
    setOpencycleEnds(true);
  };
  const handleAddProduce = () => {
        if (area != null && area != undefined && area != '' && area != 0) {
      const deviation = Math.abs(storeProduceInfo?.ConvertedreportedLandsize - area) / ((storeProduceInfo?.ConvertedreportedLandsize + area) / 2) * 100;
      if (deviation >= -5 && deviation <= 5) {

      } else {
        Alert.alert(
          'Deviation',
          'The deviation between reported area and google area is not within 5%',
          [
            { text: 'OK', onPress: () => console.log(area) },
          ],
          { cancelable: false }
        )
        setIsLoading(false);
        return;
      }
    }
    if (storeProduceInfo.cycleStarts !== '') {
      if (validationData()) {
        if (storeProduceInfoInArray.length < 3) {
          emptyFieldsValue();
          removesetLocation();
          // setPolygons([]);
          setPolygons(nearPolSet)
          setArea(0);
          setAreaSQMeter(0);
          setstoreProduceInfoInArray([
            ...storeProduceInfoInArray,
            { storeProduceInfo: storeProduceInfo, location: location, landProof },
          ]);
          setLandProof([
            { uri: '', name: '', type: '', fileName: '' },
            { uri: '', name: '', type: '', fileName: '' },
            { uri: '', name: '', type: '', fileName: '' },
            { uri: '', name: '', type: '', fileName: '' },
            { uri: '', name: '', type: '', fileName: '' },
          ]);
        }
      }
    } else {
      Toast.show({
        time: 3,
        text: t('please_select_sowing_date_first'),
        ...AlertMesg[0],
      });
    }
  };
  const produceRemoveDetails = index => {
    const values = [...storeProduceInfoInArray];
    values.splice(index, 1);
    setstoreProduceInfoInArray(values);
  };
  const [location, setLocation] = useState([
    { latitude: '', longitude: '' },
    // {latitude: '', longitude: ''},
    // {latitude: '', longitude: ''},
    // {latitude: '', longitude: ''},
  ]);
  const addMoreLocation = async () => {
    if (locationType != 'location_tap') {
      const locationLatLong = Array.apply(null, Array(location.length + 1)).map(
        (val, idx) => ({ latitude: '', longitude: '' }),
      );
      setLocation(locationLatLong);
      setLocationType('location_tap');
      setArea(0);
      setAreaSQMeter(0);
      setPolygons([]);
    } else {
      setPolygons([]);
      setLocation([...location, { latitude: '', longitude: '' }]);
    }
  };
  const handleCurrentLatLong = async index => {
    const fusedLocation = await getItem('fusedLocation');
    const values = [...location];
    const { latitude, longitude } = fusedLocation;

    if (
      fusedLocation != null &&
      longitude.toString().length == 10 &&
      latitude.toString().length == 10 &&
      latitude > 0 &&
      longitude > 0
    ) {
      values[index] = { latitude: latitude, longitude: longitude };
      setLocation(values);
      const filteredDatalatLong = values.filter(item => item.latitude !== '');
      if (filteredDatalatLong.length >= 3) {
        setNewPolygon(convertedArrayLatLong(filteredDatalatLong));
        setAreaSQMeter(geolib.getAreaOfPolygon(filteredDatalatLong));

        // setArea(calculateAreaFun(filteredDatalatLong));
        if (landUnitsquareMetre?.[0]?.defined_unit_value) {
          setArea(Number(landUnitsquareMetre?.[0]?.defined_unit_value) * geolib.getAreaOfPolygon(filteredDatalatLong));
          setstoreProduceInfo({
            ...storeProduceInfo,
            google_area: geolib.getAreaOfPolygon(filteredDatalatLong),
            google_area_default:
              Number(landUnitsquareMetre?.[0]?.defined_unit_value) *
              geolib.getAreaOfPolygon(filteredDatalatLong),
          });

        } else {
          setArea(geolib.getAreaOfPolygon(filteredDatalatLong));
          setstoreProduceInfo({
            ...storeProduceInfo,
            google_area: geolib.getAreaOfPolygon(filteredDatalatLong),
            google_area_default: geolib.getAreaOfPolygon(filteredDatalatLong),
          });

        }
      } else {
        setArea(0);
        setAreaSQMeter(0);
      }
    } else {
      Toast.show({
        text: t('Please_try_again_to_reach_the_accurancy'),
        ...AlertMesg[0],
      });
    }

  };
  // GRQ-1130
  const [polygons, setPolygons] = useState([]);
  const [newPolygon, setNewPolygon] = useState([]);
  const [editing, setEditing] = useState(false);
  const [area, setArea] = useState(0);
  const [areaSQMeter, setAreaSQMeter] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const handleMapPress = event => {
    if (!editing) return;
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setNewPolygon([...newPolygon, { latitude, longitude }]);
  };
  const undoMark = () => {
    try {
      const value = [...newPolygon];
      value.pop();
      setNewPolygon(value);
    } catch (error) {
      console.log(error);
    }
  };
  // GRQ-1132
  const finalizePolygon = () => {
    let overlapFound = false;
    if (newPolygon.length > 2) {
      const closedPolygon = [...newPolygon];
      const first = newPolygon[0];
      const last = newPolygon[newPolygon.length - 1];
      if (
        first.latitude !== last.latitude ||
        first.longitude !== last.longitude
      ) {
        closedPolygon.push(first);
      }
      const newGeo = turf.polygon([
        closedPolygon.map((p) => [p.longitude, p.latitude]),
      ]);
      const newFilterPoligon = polygons.filter(_item => _item.length > 2);
      newFilterPoligon.forEach((poly) => {
        const existingGeo = turf.polygon([
          [...poly, poly[0]].map((p) => [p.longitude, p.latitude]),
        ]);
        if (turf.booleanOverlap(existingGeo, newGeo)) {
          overlapFound = true;
        }
      });
      if (!overlapFound) {
      } else {
        Alert.alert(
          'Overlap Detected',
          'Coordinates are overlapping',
          [
            { text: 'OK', onPress: () => console.log('OK Pressed') },
          ],
          { cancelable: false }
        )
        return;
      }
      //basudev
      setPolygons([...nearPolSet, newPolygon]);
      setNewPolygon([]);
      setLocation(newPolygon);
      setEditing(false);
      setShowModal(false);
      setArea(
        Number(landUnitsquareMetre?.[0]?.defined_unit_value) *
        geolib.getAreaOfPolygon(newPolygon),
      );
      setAreaSQMeter(geolib.getAreaOfPolygon(newPolygon));
      setstoreProduceInfo({
        ...storeProduceInfo,
        google_area: geolib.getAreaOfPolygon(newPolygon),
        google_area_default:
          Number(landUnitsquareMetre?.[0]?.defined_unit_value) *
          geolib.getAreaOfPolygon(newPolygon),
      });
    } else {
      // removesetLocation();
      //  setArea(0);
      Alert.alert('Error', 'A polygon requires at least 3 points.');
    }
    setLocationType('polygon_tap');
  };

  const clearNewPolygon = () => {
    setstoreProduceInfo({ ...storeProduceInfo, google_area: 0 });
    setNewPolygon([]);
    // setPolygons([]);
    setPolygons(nearPolSet);
    removesetLocation();
    setArea(0);
  };
  // GRQ-1130
  // GRQ-1135
  // onPress={() => data.latitude != 10 && data.latitude.length != "" ? "" : handleCurrentLatLong(index)}
  // GRQ-1135
  const removesetLocation = () => {
    setLocation([
      { latitude: '', longitude: '' },
      // {latitude: '', longitude: ''},
      // {latitude: '', longitude: ''},
    ]);
  };

  const handleDocumentSelection = async (data, index) => {
    try {
      const response = await DocumentPicker.pick({
        presentationStyle: 'fullScreen',
        type: [types.pdf, types.images],
      });
      const values = [...landProof];
      values[index]['uri'] = response[0].uri;
      values[index]['name'] = response[0].name;
      values[index]['type'] = response[0].type;
      values[index]['fileName'] = response[0].name;
      setLandProof(values);
    } catch (err) {
      console.error(err);
    }
  };
  const handleDocumentSelectionRemove = index => {
    const values = [...landProof];
    values[index]['uri'] = '';
    values[index]['name'] = '';
    values[index]['type'] = '';
    values[index]['fileName'] = '';
    setLandProof(values);
  };
  const handleCurrentLatLongIOT = async () => {
    const fusedLocation = await getItem('fusedLocation');
    const { latitude, longitude } = fusedLocation;
    setstoreProduceInfo({
      ...storeProduceInfo,
      IOTLatlat: latitude,
      IOTLatLong: longitude,
    });
  }
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={'#003c04'} />
      {isLoading ? (
        <View style={styles.loadingScreen}>
          <LoadingScreen />
        </View>
      ) : null}
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
                label={t('daag_no')}
                onChangeText={item =>
                  setstoreProduceInfo({ ...storeProduceInfo, daagNo: item })
                }
                value={storeProduceInfo.daagNo}
              />
              <InputTextForm
                label={t('khatian_no')}
                onChangeText={item =>
                  setstoreProduceInfo({ ...storeProduceInfo, khatianNo: item })
                }
                value={storeProduceInfo.khatianNo}
              />
              <InputTextForm
                label={t('no_of_plants')}
                onChangeText={item =>
                  setstoreProduceInfo({ ...storeProduceInfo, noOfPlants: item })
                }
                value={storeProduceInfo.noOfPlants}
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
                label={t('select_soil_type')}
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
                      setstoreProduceInfo({ ...storeProduceInfo, plotSize: item, ConvertedreportedLandsize: Number(storeProduceInfo?.sizevalue) * Number(item), cycleEnds: "" })
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
                    val={storeProduceInfo?.landUnitName}
                  />
                </View>
              </View>
              {!isNaN(Number(storeProduceInfo?.ConvertedreportedLandsize)) &&
                storeProduceInfo?.ConvertedreportedLandsize !== 0 &&
                area != null && (
                  <InputTextForm
                    label={
                      t('Converted reported Land size ') +
                      `${landAreaUnit?.[0]?.defined_unit_value
                        ? `(${landAreaUnit?.[0]?.unit_name})`
                        : '(Square meter)'
                      }`
                    }
                    value={storeProduceInfo?.ConvertedreportedLandsize?.toString()}
                    editable={false}
                  />
                )}
              <View style={{ marginTop: 10 }}>
                <InputTextForm
                  label={t('Enter IOT Device Id')}
                  onChangeText={item =>
                    setstoreProduceInfo({ ...storeProduceInfo, IOTId: item })
                  }
                  value={storeProduceInfo.IOTId}
                />
              </View>
              <TouchableOpacity onPress={() => handleCurrentLatLongIOT()}>
                <View style={styles.latlongContainer}>
                  <Text style={styles.title}>{storeProduceInfo.IOTLatlat}</Text>
                  <Text style={styles.title}>
                    {storeProduceInfo.IOTLatLong}
                  </Text>
                </View>
                <View style={styles.latlongContainer}>
                  <Text style={styles.title}>{t('Geo tag IOT Device')}</Text>
                  <Image
                    source={require('./Common/images/map.png')}
                    style={{ width: 50, height: 50 }}
                  />
                </View>
              </TouchableOpacity>

              <ProofAndIdentityPropfComp
                identityProofIdentityPropf={landProof}
                t={t}
                title={t('address_proof')}
                setStateValue={setLandProof}
                stateValue={landProof}
                disable={true}
                InputTextFormEdit={true}
              // photoDeletedValue={photoDeletedValue}
              // setPhotoDeletedValue={setPhotoDeletedValue}
              // loginUser_data={loginUser_data}
              />
              {area != 0 && area != null && (
                <InputTextForm
                  label={
                    t('Calculated Map Area ') +
                    `${landAreaUnit?.[0]?.defined_unit_value
                      ? '(' + landAreaUnit?.[0]?.unit_name + ')'
                      : '(Square meter)'
                    }`
                  }
                  value={area.toString()}
                  onChangeText={text => handleAddUserData('daag_no', text)}
                  editable={false}
                />
              )}

              {location &&
                location.map((data, index) => {
                  return (
                    // GRQ-1134
                    <TouchableOpacity
                      key={index}
                      onPress={() =>
                        data.latitude != 10 && data.latitude.length != ''
                          ? ''
                          : handleCurrentLatLong(index)
                      }>
                      <View style={styles.latlongContainer}>
                        <Text style={styles.title}>
                          {data && data.latitude && data.latitude == ''
                            ? '0.0'
                            : data.latitude}
                        </Text>
                        <Text style={styles.title}>
                          {data && data.longitude && data.longitude == ''
                            ? '0.0'
                            : data.longitude}
                        </Text>
                      </View>
                      <View style={styles.latlongContainer}>
                        <Text style={styles.title}>
                          {t('tap_to_get_latitude_and_longitude')}
                        </Text>
                        <Image
                          source={require('./Common/images/map.png')}
                          style={{ width: 50, height: 50 }}
                        />
                      </View>
                    </TouchableOpacity>
                  );
                })}

              <DropdownForm
                label={t('addcrop_cultivating_season')}
                color="red"
                data={prodctionSeasionData}
                onChange={item => {
                  setstoreProduceInfo({
                    ...storeProduceInfo,
                    prodctionSeasion: item,
                    livelihoodType: '',
                    produceName: '',
                    produceVariety: '',
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
                label={t('select_unit')}
                color="red"
                data={produceProductionUnitData}
                onChange={item => {
                  setstoreProduceInfo({
                    ...storeProduceInfo,
                    produceProductionUnit: item,
                  });
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
                      onPress={() => setOpencycleStarts(true)}>
                      {storeProduceInfo.cycleStarts}
                    </Text>
                    <TouchableOpacity onPress={() => setOpencycleStarts(true)}>
                      <ImageForm
                        source={require('./Common/images/date.png')}
                        resizeMode="cover"
                        height={30}
                        width={30}
                      />
                    </TouchableOpacity>
                    <DatePicker
                      modal
                      mode="date"
                      open={opencycleStarts}
                      date={newdate}
                      onConfirm={item => {
                        handlecycleStart(item);
                        setOpencycleStarts(false);
                      }}
                      onCancel={() => {
                        setOpencycleStarts(false);
                      }}
                    />
                  </View>
                </View>
              </View>
              <View>
                <Text style={{ marginBottom: 5, marginLeft: 5, color: 'red' }}>
                  {t('harvesting_date')}
                </Text>
                <View style={styles.passwordMainContainer}>
                  <View style={styles.passwordContainer}>
                    <Text
                      style={styles.inputTextStyle}
                      onTouchStart={() => handleOpencycleEnds()}></Text>
                    <TouchableOpacity onPress={() => handleOpencycleEnds()}>
                      <ImageForm
                        source={require('./Common/images/date.png')}
                        resizeMode="cover"
                        height={30}
                        width={30}
                      />
                    </TouchableOpacity>
                    <DatePicker
                      modal
                      mode="date"
                      format="YYYY-MM-DD"
                      open={opencycleEnds}
                      date={
                        storeProduceInfo.cycleStarts == ''
                          ? newdate
                          : new Date(
                            `${new Date(
                              storeProduceInfo.cycleStarts,
                            ).getFullYear()}-${new Date(
                              storeProduceInfo.cycleStarts,
                            ).getMonth() + 1
                            }-${new Date(
                              storeProduceInfo.cycleStarts,
                            ).getDate() + 1
                            }`,
                          )
                      }
                      minimumDate={
                        storeProduceInfo.cycleStarts == ''
                          ? ''
                          : new Date(
                            `${new Date(
                              storeProduceInfo.cycleStarts,
                            ).getFullYear()}-${new Date(
                              storeProduceInfo.cycleStarts,
                            ).getMonth() + 1
                            }-${new Date(
                              storeProduceInfo.cycleStarts,
                            ).getDate() + 1
                            }`,
                          )
                      }
                      onConfirm={item => {
                        handlecycleEnd(item);
                        setOpencycleEnds(false);
                      }}
                      onCancel={() => {
                        setOpencycleEnds(false);
                      }}
                    />
                  </View>
                </View>
              </View>
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
        {/* <TouchableOpacity
          style={styles.locationAddMoreContainer}
          onPress={() => addMoreLocation()}>
          <Text style={[styles.title, {color: '#FFF', marginRight: 20}]}>
            {t('AddLocation')}
          </Text>
        </TouchableOpacity> */}
        <TouchableOpacity
          style={[styles.locationAddMoreContainer, { bottom: 250 }]}
          onPress={() => setShowModal(!showModal)}>
          <Text style={[styles.title, { color: '#FFF', marginRight: 20 }]}>
            {t('MapView')}
          </Text>
        </TouchableOpacity>
      </View>
      {showModal && (
        <Modal
          animationIn="slideInLeft"
          animationOut="slideOutRight"
          animationInTiming={500}
          animationOutTiming={750}
          isVisible={showModal}
          useNativeDriver={true}
          onBackButtonPress={() => {
            setShowModal(!showModal);
          }}>
          <Map
            polygons={polygons}
            newPolygon={newPolygon}
            setEditing={setEditing}
            editing={editing}
            handleMapPress={handleMapPress}
            finalizePolygon={finalizePolygon}
            clearNewPolygon={clearNewPolygon}
            setShowModal={setShowModal}
            undoMark={undoMark}
            landAreaUnit={landAreaUnit}
            landUnitsquareMetre={landUnitsquareMetre}
            area={area}
            //basudev
            location={location}
            baselatLong={referencelatLong}
            statuslevel={""}
            type="livehoood"
          />
        </Modal>
      )}
      <ButtonForm label={t('next')} onPress={() => handleSave('SignUpViwer')} />
      <Root></Root>
    </>
  );
};
export default ProduceInfo;
export const styles = StyleSheet.create({
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
    fontSize: 10,
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
  locationAddMoreContainer: {
    position: 'absolute',
    bottom: 125,
    right: 0,
    backgroundColor: '#025502',
    paddingVertical: 10,
    paddingLeft: 20,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },
  latlongContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
    marginHorizontal: 5,
  },
  title: {
    color: '#000',
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
  },
  idcontainer: {
    marginVertical: 10,
  },
  idItemContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  idItem: {
    padding: 10,
    width: '30%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  idImage: {
    width: 60,
    height: 60,
  },
});
