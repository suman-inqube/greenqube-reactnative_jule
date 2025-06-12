import {
  StyleSheet,
  StatusBar,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  Alert,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import Logo from './Common/Logo';
import ButtonForm from './Common/ButtonForm';
import { useNavigation, useRoute } from '@react-navigation/native';
import InputTextForm from './Common/InputTextForm';
import DropdownForm from './Common/DropdownForm';
import config from '../config';
import axios from 'axios';
import ImageForm from './Common/ImageForm';
import DatePicker from 'react-native-date-picker';
import { getItem, setItem, removeItem } from '../config/getDataFromStorage';
import { isNotEmpty } from './Common/ValidationFunctions';
import MessageDialog from './Common/MessageDialog';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { CrashlyticsRecordError } from './Crashlytics/CrashlyticsRecordError';
import DeviceInfo from './DeviceInfo';
import { Root, Toast } from 'react-native-popup-confirm-toast';
import { AlertMesg } from './Common/ToastAlert';
import Map from './admin/Map';
import * as geolib from 'geolib';
import {
  convertedArrayLatLong,
  calculateAreaFun,
  calculatePolygonArea,
} from './Common/calculateAreaFun';
import DocumentPicker, { types } from 'react-native-document-picker';
import ProofAndIdentityPropfComp from './Common/ProofAndIdentityPropfComp';
import {
  LandUnitArea,
  LandUnitsquare_metre,
  nearestLatLong,
} from '../config/apiHere';
const ProduceInfoUpdate = () => {
  const { netConnection } = DeviceInfo();
  const ForegroundLocationData = useSelector(state => state.locationData);
  const { t } = useTranslation();
  const route = useRoute();
  const { pagename, arrayIndex } = route.params;
  const navigation = useNavigation();
  const [dbName, setdbName] = useState();
  const [lanID, setlanID] = useState();
  const [referencelatLong, setreferencelatLong] = useState({ latitude: 0, longitude: 0 });

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
    google_area: '',
    IOTId: "",
    IOTLatLong: "",
    IOTLatlat: ""
  });
  const [landProof, setLandProof] = useState([
    { uri: '', name: '', type: '', fileName: '' },
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
  const [location, setLocation] = useState([]);
  const [locationType, setLocationType] = useState('location_tap');
  const [landAreaUnit, setLandAreaUnit] = useState([]);
  const [landUnitsquareMetre, setLandUnitsquareMetre] = useState([]);
  const [nearPolSet, setnearPolSet] = useState([]);

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
    const prodctionSeasionAPI =
      config.prodctionSeasionAPI1 + language_id + config.prodctionSeasionAPI2;
    var soilTypeArray = [];
    var terraintypeArray = [];
    var landTypeArray = [];
    var livelihoodTypeArray = [];
    var prodctionSeasionArray = [];
    var landUnitArray = [];
    var productionProcessArray = [];
    var produceProductionUnitArray = [];
    try {
      if (netConnection) {
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
          axios.get(config.produceProductionUnitAPI, axiosConfig),
        ]);
        if (soilType_res.data.data.count > 0) {
          soilType_res.data.data.rows.forEach(element => {
            soilTypeArray.push({
              value: element.id,
              label: element.name,
            });
          });
        }
        if (terraintype_res.data.data.count > 0) {
          terraintype_res.data.data.rows.forEach(element => {
            terraintypeArray.push({
              value: element.id,
              label: element.name,
            });
          });
        }
        if (landType_res.data.data.count > 0) {
          landType_res.data.data.rows.forEach(element => {
            landTypeArray.push({
              value: element.id,
              label: element.name,
            });
          });
        }
        if (livelihoodType_res.data.data) {
          livelihoodType_res.data.data.crop_type.forEach(element => {
            livelihoodTypeArray.push({
              value: element.fid,
              label: element.name,
            });
          });
        }
        if (prodctionSeasion_res.data.data) {
          prodctionSeasion_res.data.data.crop_season.forEach(element => {
            prodctionSeasionArray.push({
              value: element.fid,
              label: element.name,
            });
          });
        }
        if (landUnit_res.data.data.count > 0) {
          landUnit_res.data.data.rows.forEach(element => {
            landUnitArray.push({
              value: element.id,
              label: element.name,
              sizevalue: element.unit_value,
            });
          });
        }
        if (productionProcess_res.data.data.count > 0) {
          productionProcess_res.data.data.rows.forEach(element => {
            productionProcessArray.push({
              value: element.fid,
              label: element.name,
            });
          });
        }
        if (produceProductionUnit_res.data.data) {
          produceProductionUnit_res.data.data.rows.forEach(element => {
            produceProductionUnitArray.push({
              value: element.fid,
              label: element.unit_name,
            });
          });
        }
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
      setlandUnitData(landUnitArray);
      setsoilTypeData(soilTypeArray);
      setterrainTypeData(terraintypeArray);
      setlandTypeData(landTypeArray);
      setlivelihoodTypeData(livelihoodTypeArray);
      setprodctionSeasionData(prodctionSeasionArray);
      setproductionProcessData(productionProcessArray);
      setproduceProductionUnitData(produceProductionUnitArray);
    } catch (error) {
      CrashlyticsRecordError(error.response);
    }
  };

  const HandlelivehoodType = async livelihoodType => {
    setstoreProduceInfo({ ...storeProduceInfo, livelihoodType: livelihoodType });
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
      const produceNameAPI =
        config.produceNameAPI1 +
        language_id +
        config.produceNameAPI2 +
        livelihoodType.value +
        config.produceNameAPI3;
      if (netConnection) {
        let produceName_res = await axios.get(produceNameAPI, axiosConfig1);
        if (produceName_res.data.data) {
          produceName_res.data.data.crop_name.forEach(element => {
            produceNameArray.push({
              value: element.crop_name.fid,
              label: element.crop_name.name,
            });
          });
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
      CrashlyticsRecordError(error.response);
      console.log('Error in produceName API', error);
    }
  };

  const HandleproduceName = async produceName => {
    setstoreProduceInfo({ ...storeProduceInfo, produceName: produceName });
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
      CrashlyticsRecordError(error.response);
      console.log('Error in produceVariety API', error);
    }
  };

  const handlecycleStart = item => {
    const dt = new Date(item);
    const x = dt.toISOString().split('T');
    const x1 = x[0].split('-');
    const cycleStarts = x1[0] + '-' + x1[1] + '-' + x1[2];
    setstoreProduceInfo({ ...storeProduceInfo, cycleStarts: cycleStarts });
  };

  const handlecycleEnd = async item => {
    const dt = new Date(item);
    const x = dt.toISOString().split('T');
    const x1 = x[0].split('-');
    const cycleEnds = x1[0] + '-' + x1[1] + '-' + x1[2];
    setstoreProduceInfo({ ...storeProduceInfo, cycleEnds: cycleEnds });
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
    // console.log(location)
    const locationEmpty = location.filter(item => item.latitude !== '');
    if (storeProduceInfo.plotSize == '') {
      Toast.show({ time: 3, text: `${t('please_enter_unit')}`, ...AlertMesg[0] });
    } else if (!storeProduceInfo.productionProcess.value) {
      Toast.show({
        time: 3,
        text: `${t('please_give_yeild_size')}`,
        ...AlertMesg[0],
      });
    } else if (storeProduceInfo.livelihoodType == '') {
      Toast.show({
        time: 3,
        text: `${t('please_select_crop_type_first')}`,
        ...AlertMesg[0],
      });
    } else if (storeProduceInfo.produceName == '') {
      Toast.show({
        time: 3,
        text: `${t('please_select_crop_name_first')}`,
        ...AlertMesg[0],
      });
    } else if (storeProduceInfo.produceVariety == '') {
      Toast.show({
        time: 3,
        text: `${t('please_select_crop_veriety_first')}`,
        ...AlertMesg[0],
      });
    } else if (locationEmpty == 0) {
      Toast.show({
        time: 3,
        text: `${t('please_submit_location_first')}`,
        ...AlertMesg[0],
      });
    } else {
      await removeItem('storeProduceInfo_data');
      storeProduceInfoInArray[arrayIndex].storeProduceInfo = storeProduceInfo;
      storeProduceInfoInArray[arrayIndex].location = location;
      await setItem('storeProduceInfo_data', storeProduceInfoInArray);
      navigation.navigate(pagename, { pagename: '' });
    }
  };

  const onPageLoad = async () => {
    const fusedLocation = await getItem('fusedLocation');
    const { latitude, longitude } = fusedLocation;
    let groupedData;
    const [
      storeSignup_data,
      storePersnolInfo_data,
      storeProduceInfo_data,
      produceVariety,
    ] = await Promise.all([
      getItem('storeSignup_data'),
      getItem('storePersnolInfo_data'),
      getItem('storeProduceInfo_data'),
      getItem('produceVariety'),
    ]);
    const dbName = storeSignup_data.company.dbname;
    const languageID = storePersnolInfo_data.language.value;
    const [nearestLatLong_res, LandUnitArea_res, LandUnitsquare_metre_res] =
      await Promise.all([
        nearestLatLong(dbName, languageID, '', latitude, longitude),
        LandUnitArea(dbName, languageID),
        LandUnitsquare_metre(dbName, languageID),
      ]);
      setreferencelatLong({latitude, longitude});
    if (nearestLatLong_res.status == 200) {
      groupedData = groupByRelId(nearestLatLong_res.data.data);
      //  console.log('groupedData', groupedData);
      setnearPolSet(groupByRelId(nearestLatLong_res.data.data));

      if (storeProduceInfo_data) {
        groupedData.push(storeProduceInfo_data[arrayIndex].location);
        setPolygons(groupedData);
      } else {
        setPolygons(groupedData);
      }
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
    setLandProof(storeProduceInfo_data?.[arrayIndex]?.landProof);
    let produceVarietyArray = [];
    if (produceVariety) {
      produceVariety.crop_variety.forEach(element => {
        produceVarietyArray.push({
          value: element.crop_variety.fid,
          label: element.crop_variety.name,
        });
      });
      setproduceVarietyData(produceVarietyArray);
    }
    if (storeProduceInfo_data) {
      setstoreProduceInfoInArray(storeProduceInfo_data);
      setLocation(storeProduceInfo_data[arrayIndex].location);

      // setArea(calculateAreaFun(storeProduceInfo_data[arrayIndex].location));
      // setNewPolygon(convertedArrayLatLong(storeProduceInfo_data[arrayIndex].location));
      if (storeProduceInfo_data[arrayIndex].location?.length >= 3) {
        // setArea(
        //   calculateAreaFun(storeProduceInfo_data[arrayIndex].location).toFixed(
        //     3,
        //   ),
        // );
        // if (landUnitsquareMetre?.[0]?.defined_unit_value) {
        setArea(
          storeProduceInfo_data[arrayIndex].storeProduceInfo
            .google_area_default,
        );
        // } else {
        //   setArea(calculateAreaFun(storeProduceInfo_data[arrayIndex].location));
        // }
      } else {
        setArea(0);
      }
      // setPolygons([
      //   storeProduceInfo_data[arrayIndex]?.location.filter(
      //     item => item.latitude !== '',
      //   ),
      // ]);
      setLocationType('api_lication');
      setstoreProduceInfo(storeProduceInfo_data[arrayIndex].storeProduceInfo);
      if (storeProduceInfo_data[arrayIndex].storeProduceInfo.livelihoodType) {
        produceNameDataList(
          storeProduceInfo_data[arrayIndex].storeProduceInfo.livelihoodType,
          languageID,
          dbName,
        );
        produceVarientyDataList(
          storeProduceInfo_data[arrayIndex].storeProduceInfo.produceName,
          languageID,
          dbName,
        );
      }
      if (
        storeProduceInfo_data[arrayIndex].storeProduceInfo.produceName &&
        storeProduceInfo_data[arrayIndex].storeProduceInfo.livelihoodType
      ) {
        produceVarientyDataList(
          storeProduceInfo_data[arrayIndex].storeProduceInfo.produceName,
          languageID,
          dbName,
        );
      }
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      onPageLoad();
    }, [netConnection]),
  );
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
      setNewPolygon(convertedArrayLatLong(filteredDatalatLong));
      if (filteredDatalatLong.length >= 3) {

        // setArea(calculatePolygonArea(filteredDatalatLong).toFixed(3));
        if (landUnitsquareMetre?.[0]?.defined_unit_value) {
          setArea(
            Number(landUnitsquareMetre?.[0]?.defined_unit_value) *
            geolib.getAreaOfPolygon(filteredDatalatLong).toFixed(3),
          );
          setstoreProduceInfo({
            ...storeProduceInfo,
            google_area:
              geolib.getAreaOfPolygon(filteredDatalatLong).toFixed(3),
            google_area_default:
              Number(landUnitsquareMetre?.[0]?.defined_unit_value) *
              geolib.getAreaOfPolygon(newPolygon),
          });

        } else {
          setArea(geolib.getAreaOfPolygon(filteredDatalatLong).toFixed(3));
          setstoreProduceInfo({
            ...storeProduceInfo,
            google_area:
              geolib.getAreaOfPolygon(filteredDatalatLong).toFixed(3),
            google_area_default:
              geolib.getAreaOfPolygon(filteredDatalatLong).toFixed(3),
          });

        }
      } else {
        setArea(0);
      }
    } else {
      Toast.show({
        text: t('Please_try_again_to_reach_the_accurancy'),
        ...AlertMesg[0],
      });
    }
  };

  const addMoreLocation = async () => {
    if (locationType != 'location_tap') {
      const locationLatLong = Array.apply(null, Array(location.length + 1)).map(
        (val, idx) => ({ latitude: '', longitude: '' }),
      );
      setLocation(locationLatLong);
      setLocationType('location_tap');
      setArea(0);
      setNewPolygon([]);
    } else {
      setNewPolygon([]);
      setLocation([...location, { latitude: '', longitude: '' }]);
    }
  };
  // GRQ-1130
  const [polygons, setPolygons] = useState([]);
  const [newPolygon, setNewPolygon] = useState([]);
  const [editing, setEditing] = useState(false);
  const [area, setArea] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const handleMapPress = event => {
    if (!editing) return;
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setNewPolygon([...newPolygon, { latitude, longitude }]);
  };
  // GRQ-1132
  const finalizePolygon = () => {
    if (newPolygon.length > 2) {
      // setPolygons([...polygons, newPolygon]);
      // basudev
      setPolygons([...nearPolSet, newPolygon]);
      // setPolygons([newPolygon]);
      setNewPolygon([]);
      setLocation(newPolygon);
      setEditing(false);
      setShowModal(false);
      // setArea(calculateAreaFun(newPolygon));
      if (landUnitsquareMetre?.[0]?.defined_unit_value) {
        setArea(
          Number(landUnitsquareMetre?.[0]?.defined_unit_value) *
          geolib.getAreaOfPolygon(newPolygon),
        );
        setstoreProduceInfo({
          ...storeProduceInfo,
          google_area: geolib.getAreaOfPolygon(newPolygon),
          google_area_default:
            Number(landUnitsquareMetre?.[0]?.defined_unit_value) *
            geolib.getAreaOfPolygon(newPolygon),
        });
      } else {
        setArea(geolib.getAreaOfPolygon(newPolygon));
        setstoreProduceInfo({
          ...storeProduceInfo,
          google_area: geolib.getAreaOfPolygon(newPolygon),
          google_area_default: geolib.getAreaOfPolygon(newPolygon),
        });
      }

    } else {
      //  setArea(0);
      Alert.alert('Error', 'A polygon requires at least 3 points.');
    }
    setLocationType('polygon_tap');
  };
  const clearNewPolygon = () => {
    setstoreProduceInfo({ ...storeProduceInfo, google_area: 0 });
    setNewPolygon([]);
    setPolygons(nearPolSet);
    setArea(0);
    removesetLocation();
  };

  const undoMark = () => {
    try {
      const value = [...newPolygon];
      console.log("value");
      console.log(value);
      value.pop();
      setNewPolygon(value);
    } catch (error) {
      console.log(error);
    }
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
    try {
      const values = [...landProof];
      values[index]['uri'] = '';
      values[index]['name'] = '';
      values[index]['type'] = '';
      values[index]['fileName'] = '';
      setLandProof(values);
    } catch (error) {
      console.log(error);
    }
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
    <Root>
      {/* <ForegroundLocationService /> */}
      <StatusBar barStyle="light-content" backgroundColor="#023316" />
      <ScrollView style={{backgroundColor: '#D5FFD0'}}>
        <View style={{paddingHorizontal: 20, marginBottom: 120}}>
          <Logo iheight={100} iwidth={100} />
          <InputTextForm
            label={t('pre_plot_name')}
            color="black"
            onChangeText={item =>
              setstoreProduceInfo({...storeProduceInfo, plotSiteName: item})
            }
            value={storeProduceInfo.plotSiteName}
          />
          <InputTextForm
            label={t('daag_no')}
            onChangeText={item =>
              setstoreProduceInfo({...storeProduceInfo, daagNo: item})
            }
            value={storeProduceInfo.daagNo}
          />
          <InputTextForm
            label={t('khatian_no')}
            onChangeText={item =>
              setstoreProduceInfo({...storeProduceInfo, khatianNo: item})
            }
            value={storeProduceInfo.khatianNo}
          />
          <InputTextForm
            label={t('no_of_plants')}
            onChangeText={item =>
              setstoreProduceInfo({...storeProduceInfo, noOfPlants: item})
            }
            value={storeProduceInfo.noOfPlants}
          />
          <DropdownForm
            label={t('addland_terrain_type')}
            color="black"
            data={terrainTypeData}
            onChange={item =>
              setstoreProduceInfo({...storeProduceInfo, terrainType: item})
            }
            val={storeProduceInfo.terrainType.label}
          />
          <DropdownForm
            label={t('addland_soil_type')}
            color="black"
            data={landTypeData}
            onChange={item => {
              setstoreProduceInfo({...storeProduceInfo, landType: item});
            }}
            val={storeProduceInfo.landType.label}
          />
          <DropdownForm
            label={t('select_soil_type')}
            color="black"
            data={soilTypeData}
            onChange={item => {
              setstoreProduceInfo({...storeProduceInfo, soilType: item});
            }}
            val={storeProduceInfo.soilType.label}
          />
          <InputTextForm
            label={t('addland_landsize')}
            onChangeText={item =>
              setstoreProduceInfo({...storeProduceInfo, plotSize: item})
            }
            value={storeProduceInfo.plotSize}
          />
          <DropdownForm
            label={t('addland_unit')}
            color="black"
            data={landUnitData}
            onChange={item => handleLandUnit(item)}
            val={storeProduceInfo.landUnitName}
          />

          {/* <View style={styles.idcontainer}>
            <Text style={styles.title}>{t('land_records')}</Text>
            <View style={styles.idItemContainer}>
              {landProof &&
                landProof.map((data, index) => {
                  return (
                    <TouchableOpacity
                      style={styles.idItem}
                      onPress={() =>
                        handleDocumentSelection('LandProof', index)
                      }
                      key={index}>
                      <Image
                        source={require('./Common/images/document.png')}
                        style={styles.idImage}
                      />
                      <Text>{data.name == '' ? '' : data.name}</Text>
                    </TouchableOpacity>
                  );
                })}
            </View>
          </View> */}
          {/* <ProofAndIdentityPropfComp
            identityProofIdentityPropf={landProof}
            t={t}
            title={t('address_proof')}
            handleDocumentSelection={handleDocumentSelection}
            handleDocumentSelectionRemove={handleDocumentSelectionRemove}
          /> */}

          <View style={{marginTop: 10}}>
            <InputTextForm
              label={t('Enter IOT Device Id')}
              onChangeText={item =>
                setstoreProduceInfo({...storeProduceInfo, IOTId: item})
              }
              value={storeProduceInfo.IOTId}
            />
          </View>
          <TouchableOpacity onPress={() => handleCurrentLatLongIOT()}>
            <View style={styles.latlongContainer}>
              <Text style={styles.title}>{storeProduceInfo.IOTLatlat}</Text>
              <Text style={styles.title}>{storeProduceInfo.IOTLatLong}</Text>
            </View>
            <View style={styles.latlongContainer}>
              <Text style={styles.title}>{t('Geo tag IOT Device')}</Text>
              <Image
                source={require('./Common/images/map.png')}
                style={{width: 50, height: 50}}
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
          {/* basudev  */}
          {area != 0 && (
            <InputTextForm
              label={
                t('Calculated Map Area ') +
                '(' +
                `${
                  landAreaUnit?.[0]?.defined_unit_value
                    ? landAreaUnit?.[0]?.unit_name
                    : 'Square meter'
                }` +
                ')'
              }
              value={area.toString()}
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
                      style={{width: 50, height: 50}}
                    />
                  </View>
                </TouchableOpacity>
              );
            })}
          <DropdownForm
            label={t('addcrop_cultivating_season')}
            color="black"
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
            color="black"
            data={livelihoodTypeData}
            onChange={item => HandlelivehoodType(item)}
            val={storeProduceInfo.livelihoodType.label}
          />
          <DropdownForm
            label={t('select_crop_name')}
            color="black"
            data={produceNameData}
            onChange={item => HandleproduceName(item)}
            val={storeProduceInfo.produceName.label}
          />
          <DropdownForm
            label={t('select_crop_variety')}
            color="black"
            data={produceVarietyData}
            onChange={item => {
              setstoreProduceInfo({...storeProduceInfo, produceVariety: item});
            }}
            val={storeProduceInfo.produceVariety.label}
          />
          <DropdownForm
            label={t('production_system')}
            color="black"
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
            color="black"
            onChangeText={item =>
              setstoreProduceInfo({
                ...storeProduceInfo,
                expectedProduction: item,
              })
            }
            value={storeProduceInfo.expectedProduction}
          />
          <DropdownForm
            label={t('select_unit')}
            color="black"
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
            <Text style={{marginBottom: 5, marginLeft: 5, color: 'red'}}>
              Cycle Starts
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
            <Text style={{marginBottom: 5, marginLeft: 5, color: 'red'}}>
              Cycle Ends
            </Text>
            <View style={styles.passwordMainContainer}>
              <View style={styles.passwordContainer}>
                <Text
                  style={styles.inputTextStyle}
                  onPress={() => setOpencycleEnds(true)}>
                  {storeProduceInfo.cycleEnds}
                </Text>
                <TouchableOpacity onPress={() => setOpencycleEnds(true)}>
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
                  open={opencycleEnds}
                  date={
                    storeProduceInfo.cycleEnds == ''
                      ? newdate
                      : new Date(
                          `${new Date(
                            storeProduceInfo.cycleEnds,
                          ).getFullYear()}-${
                            new Date(storeProduceInfo.cycleEnds).getMonth() + 1
                          }-${
                            new Date(storeProduceInfo.cycleEnds).getDate() + 1
                          }`,
                        )
                  }
                  minimumDate={
                    storeProduceInfo.cycleEnds == ''
                      ? ''
                      : new Date(
                          `${new Date(
                            storeProduceInfo.cycleEnds,
                          ).getFullYear()}-${
                            new Date(storeProduceInfo.cycleEnds).getMonth() + 1
                          }-${
                            new Date(storeProduceInfo.cycleEnds).getDate() + 1
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
        style={[styles.locationAddMoreContainer, {bottom: 250}]}
        onPress={() => setShowModal(!showModal)}>
        <Text style={[styles.title, {color: '#FFF', marginRight: 20}]}>
          {t('MapView')}
        </Text>
      </TouchableOpacity>
      <View style={{marginTop: 10}}>
        <ButtonForm
          label={t('save')}
          onPress={() => handleSave('SignUpViwer')}
        />
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
            statuslevel={''}
            type="livehoood"
            baselatLong={referencelatLong}
          />
        </Modal>
      )}
    </Root>
  );
};

export default ProduceInfoUpdate;

const styles = StyleSheet.create({
  container: {
    margin: 10,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
    backgroundColor: 'blue', // Change to the desired color when checked
  },
  passwordMainContainer: {
    flex: 1,
    alignItems: 'center',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 8,
    width: '100%',
    paddingEnd: 8,
    backgroundColor: 'white',
    height: 40,
    marginBottom: 15,
  },
  inputTextStyle: {
    flex: 1,
    paddingHorizontal: 5,
    paddingVertical: 10,
    marginHorizontal: 10,
    borderColor: 'gray',
    color: '#000',
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
