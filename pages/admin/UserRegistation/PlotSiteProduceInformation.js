import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Keyboard,
  TouchableOpacity,
  Image,
  Modal,
  Alert,
} from 'react-native';
import React, { useEffect, useState, useCallback, useContext, useRef } from 'react';
import {
  useNavigation,
  useRoute,
  useIsFocused,
  useFocusEffect,
} from '@react-navigation/native';
import ImageForm from '../../Common/ImageForm';
import {
  TterrainTypeAPI,
  landTypeAPI,
  soilTypeAPI,
  landUnitAPI,
  ProducceSeasionAPI,
  livelihoodTypeAPI,
  produceNameDataListAPI,
  produceVarietyAPI,
  ProductionProcessDataAPI,
  ProduceProductionUnitDataAPI,
} from './UserRegistationAPI';
import {
  LandUnitsquare_metre,
  LandUnitArea,
  nearestLatLong,
} from '../../../config/apiHere';
import { userCreateContext } from '../../Context/usersCreateContext';
import Map from '../Map';
import * as geolib from 'geolib';
import {
  calculateAreaFun,
  convertedArrayLatLong,
  calculatePolygonArea,
} from '../../Common/calculateAreaFun';
import DocumentPicker, { types } from 'react-native-document-picker';
import ProofAndIdentityPropfComp from '../../Common/ProofAndIdentityPropfComp';
import * as turf from '@turf/turf';
const PlotSiteProduceInformation = () => {
  //GQR-65
  const {
    dbLanTokUsr,
    InputTextForm,
    getItem,
    setItem,
    AlertMesg,
    t,
    ButtonForm,
    onBackPress,
    DeviceInfo,
    DropdownForm,
    Root,
    Toast,
    CustomHeader,
    FormsTitle,
    logoImage,
    topBanner,
    DatePicker,
    LoadingScreen,
    effective_dates,
  } = useContext(userCreateContext);
  //GQR-65
  const { netConnection } = DeviceInfo();
  const route = useRoute();
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
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
    produceProductionUnitValue: '',
    cycleStarts: '',
    cycleEnds: '',
    lat: '',
    long: '',
    google_area: 0,
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
  const [produceAddDetails, setProduceAddDetails] = useState([]);
  const [currentlatlong, setCurrentlatlong] = useState({ lat: '', long: '' });
  const [locationType, setLocationType] = useState('location_tap');
  const [remove, setRemove] = useState('');
  const [path, setPath] = useState('');
  const [landAreaUnit, setLandAreaUnit] = useState([]);
  const [landUnitsquareMetre, setLandUnitsquareMetre] = useState([]);
  const [defaultLand, setDefaultLand] = useState(true);
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
  };
  //GQR-65
  const { dbName, languageId, token, supervisorId, company, country } =
    dbLanTokUsr;
  //GQR-65
  const onPageLoad = async () => {

    const fusedLocation = await getItem('fusedLocation');
    const { latitude, longitude } = fusedLocation;
    let groupedData;
    var terraintypeArray = [];
    var landTypeArray = [];
    var soilTypeArray = [];
    var landUnitArray = [];
    var prodctionSeasionArray = [];
    var livelihoodTypeArray = [];
    var productionProcessArray = [];
    var produceProductionUnitArray = [];
    if (netConnection) {
      var [
        nearestLatLong_res,
        tterrainType_res,
        landType_res,
        soilType_res,
        landUnit_res,
        producceSeasion_res,
        livelihoodType_res,
        productionProcessData_res,
        produceProductionUnitData_res,
        LandUnitArea_res,
        LandUnitsquare_metre_res,
      ] = await Promise.all([
        nearestLatLong(dbName, languageId, token, latitude, longitude),
        TterrainTypeAPI(dbName, languageId),
        landTypeAPI(dbName, languageId),
        soilTypeAPI(dbName, languageId),
        landUnitAPI(dbName, languageId),
        ProducceSeasionAPI(dbName, languageId),
        livelihoodTypeAPI(dbName, languageId),
        ProductionProcessDataAPI(dbName, languageId),
        ProduceProductionUnitDataAPI(dbName, languageId),
        LandUnitArea(dbName, languageId, token),
        LandUnitsquare_metre(dbName, languageId, token),
      ]);
      setreferencelatLong({ latitude, longitude });
      if (nearestLatLong_res.status == 200) {
        groupedData = groupByRelId(nearestLatLong_res.data.data);
        setnearPolSet(groupByRelId(nearestLatLong_res.data.data));
        if (route?.params?.editItem) {
          groupedData.push(route?.params?.editItem?.location);
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
      //GQR-65
      if (tterrainType_res?.status === 200) {
        terraintypeArray = tterrainType_res?.data?.data?.rows?.map(data => ({
          value: data.fid,
          label: data.name,
        }));
      }
      if (landType_res?.status === 200) {
        landTypeArray = landType_res?.data?.data?.rows?.map(data => ({
          value: data.fid,
          label: data.name,
        }));
      }
      if (soilType_res?.status === 200) {
        soilTypeArray = soilType_res?.data?.data?.rows?.map(data => ({
          value: data.fid,
          label: data.name,
        }));
      }
      if (landUnit_res?.status === 200) {
        landUnitArray = landUnit_res?.data?.data?.rows.map(data => ({
          value: data.fid,
          label: data.name,
          sizevalue: data.unit_value,
        }));
      }
      if (producceSeasion_res?.status === 200) {
        prodctionSeasionArray =
          producceSeasion_res?.data?.data?.crop_season?.map(data => ({
            value: data.fid,
            label: data.name,
          }));
      }
      if (livelihoodType_res?.status === 200) {
        livelihoodTypeArray = livelihoodType_res?.data?.data?.crop_type?.map(
          data => ({ value: data.fid, label: data.name }),
        );
      }
      if (productionProcessData_res?.status === 200) {
        productionProcessArray =
          productionProcessData_res?.data?.data?.rows?.map(data => ({
            value: data.fid,
            label: data.name,
          }));
      }
      if (produceProductionUnitData_res?.status === 200) {
        produceProductionUnitArray =
          produceProductionUnitData_res?.data?.data?.rows.map(data => ({
            value: data.fid,
            label: data.unit_name,
          }));
      }
      //GQR-65
      await Promise.all([
        setItem('terraintypeArray', terraintypeArray),
        setItem('landTypeArray', landTypeArray),
        setItem('soilTypeArray', soilTypeArray),
        setItem('landUnitArray', landUnitArray),
        setItem('prodctionSeasionArray', prodctionSeasionArray),
        setItem('livelihoodTypeArray', livelihoodTypeArray),
        setItem('productionProcessArray', productionProcessArray),
        setItem('produceProductionUnitArray', produceProductionUnitArray),
      ]);
    } else {
      var [
        terraintypeArray,
        landTypeArray,
        soilTypeArray,
        landUnitArray,
        prodctionSeasionArray,
        livelihoodTypeArray,
        productionProcessArray,
        produceProductionUnitArray,
      ] = await Promise.all([
        getItem('terraintypeArray'),
        getItem('landTypeArray'),
        getItem('soilTypeArray'),
        getItem('landUnitArray'),
        getItem('prodctionSeasionArray'),
        getItem('livelihoodTypeArray'),
        getItem('productionProcessArray'),
        getItem('produceProductionUnitArray'),
      ]);
    }
    if (terraintypeArray) {
      setterrainTypeData(terraintypeArray);
    }
    if (landTypeArray) {
      setlandTypeData(landTypeArray);
    }
    if (soilTypeArray) {
      setsoilTypeData(soilTypeArray);
    }
    if (landUnitArray) {
      setlandUnitData(landUnitArray);
    }
    if (prodctionSeasionArray) {
      setprodctionSeasionData(prodctionSeasionArray);
    }
    if (livelihoodTypeArray) {
      setlivelihoodTypeData(livelihoodTypeArray);
    }
    if (productionProcessArray) {
      setproductionProcessData(productionProcessArray);
    }
    if (produceProductionUnitArray) {
      setproduceProductionUnitData(produceProductionUnitArray);
    }
  };
  useEffect(() => {
    if (isFocused) {
      onPageLoad();
      if (route?.params?.editItem) {
        setstoreProduceInfo({
          ...storeProduceInfo,
          ...route?.params?.editItem?.storeProduceInfo,
        });
        setLandProof(route?.params?.editItem?.landProof);
        setLocation([...route?.params?.editItem?.location]);
        setPolygons([route?.params?.editItem?.location]);
        if (route?.params?.editItem?.location?.length >= 3) {
          setArea(route?.params?.editItem?.storeProduceInfo.google_area_defaul);
          // setArea(
          //   calculateAreaFun(route?.params?.editItem?.location).toFixed(3),
          // );
          // if (landUnitsquareMetre?.[0]?.defined_unit_value) {
          //           setArea(
          //             Number(landUnitsquareMetre?.[0]?.defined_unit_value) *
          //               calculateAreaFun(
          //                 route?.params?.editItem?.location,
          //               ).toFixed(3),
          //           );
          //         } else {
          //           setArea(
          //             calculateAreaFun(
          //               route?.params?.editItem?.location,
          //             ).toFixed(3),
          //           );
          //         }
        } else {
          setArea(0);
        }
        setLocationType('api_lication');
        if (route.params.data === 'remove') {
          setRemove('remove');
          emptyData();
          setstoreProduceInfoInArray([]);
          setArea(0);
          setPolygons([]);
        } else {
          setRemove('');
        }
        if (typeof route.params.pagename != 'undefined') {
          setPath(route.params.pagename);
        } else {
          setPath('');
        }
        if (route.params.editItem == undefined) {
          setCurrentlatlong({ ...currentlatlong, lat: '', long: '' });
        }
      } else {
        setPath('');
      }
    }
  }, [isFocused, netConnection]);
  const handleBackPress = () => {
    navigation.navigate(path != '' ? path : 'FinancialInformation');
    return true;
  };
  useFocusEffect(
    useCallback(() => {
      onBackPress(handleBackPress);
    }),
  );
  const emptyData = () => {
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
      landUnitName: '',
      landUnitSize: '',
      prodctionSeasion: '',
      livelihoodType: '',
      produceName: '',
      produceVariety: '',
      productionProcess: '',
      expectedProduction: '',
      produceProductionUnit: '',
      produceProductionUnitValue: '',
      cycleStarts: '',
      cycleEnds: '',
      lat: '',
      long: '',
      google_area: 0,
      IOTId: "",
      IOTLatLong: "",
      IOTLatlat: "",
      ConvertedreportedLandsize: 0,
    });
  };
  const HandlelivehoodType = async livelihoodType => {
    setstoreProduceInfo({
      ...storeProduceInfo,
      livelihoodType: livelihoodType.label,
      livelihoodTypeValue: livelihoodType.value,
      produceName: '',
      produceNameValue: '',
      produceVariety: '',
      produceVarietyValue: '',
    });
    produceNameDataList(
      dbLanTokUsr.dbName,
      dbLanTokUsr.languageId,
      livelihoodType,
    );
  };
  const produceNameDataList = async (dbName, language_id, livelihoodType) => {
    let produceNameArray = [];
    if (netConnection) {
      const produceNameAPI = await produceNameDataListAPI(
        dbName,
        language_id,
        livelihoodType.value,
      );
      if (produceNameAPI?.status === 200) {
        produceNameArray = produceNameAPI?.data?.data?.crop_name?.map(data => ({
          value: data.crop_name.fid,
          label: data.crop_name.name,
        }));
      }
      await setItem('produceNameAPI', produceNameArray);
    } else {
      produceNameArray = await getItem('produceNameAPI');
    }
    setproduceNameData(produceNameArray);
  };
  const HandleproduceName = async produceName => {
    setstoreProduceInfo({
      ...storeProduceInfo,
      produceName: produceName.label,
      produceNameValue: produceName.value,
      produceVariety: '',
      produceVarietyValue: '',
    });
    produceVarientyDataList(
      dbLanTokUsr.dbName,
      dbLanTokUsr.languageId,
      storeProduceInfo.livelihoodType,
      produceName.value,
    );
  };
  const produceVarientyDataList = async (
    dbName,
    languageID,
    livelihoodType,
    produceName,
  ) => {
    let produceVarietyArray = [];
    if (netConnection) {
      let produceVariety_res = await produceVarietyAPI(
        dbName,
        languageID,
        livelihoodType,
        produceName,
      );
      if (produceVariety_res?.status == 200) {
        produceVarietyArray = produceVariety_res?.data?.data?.crop_variety?.map(
          data => ({
            value: data.crop_variety.fid,
            label: data.crop_variety.name,
          }),
        );
      }
      await setItem('produceVarietyArray', produceVarietyArray);
    } else {
      produceVarietyArray = await getItem('produceVarietyArray');
    }
    setproduceVarietyData(produceVarietyArray);
  };
  const handlecycleStart = item => {
    const cycleStarts = effective_dates(item);
    setstoreProduceInfo({ ...storeProduceInfo, cycleStarts: cycleStarts });
  };
  const handlecycleEnd = async item => {
    const cycleEnds = effective_dates(item);
    if (storeProduceInfo.cycleStarts != '') {
      setstoreProduceInfo({ ...storeProduceInfo, cycleEnds: cycleEnds });
    }
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
      if (route.params.arrayIndex == undefined) {
        const newData = [
          ...storeProduceInfoInArray,
          { storeProduceInfo: storeProduceInfo, location: location, landProof },
        ];
        setstoreProduceInfoInArray(newData);
        emptyFieldsValue();
        removesetLocation();
        setArea(0);
        // setPolygons([]);
        if (route?.params?.editItem) {
          setPolygons([]);
        } else {
          setPolygons(nearPolSet);
        }
        setLandProof([
          { uri: '', name: '', type: '', fileName: '' },
          { uri: '', name: '', type: '', fileName: '' },
          { uri: '', name: '', type: '', fileName: '' },
          { uri: '', name: '', type: '', fileName: '' },
          { uri: '', name: '', type: '', fileName: '' },
        ]);
      }
    }
  };
  useEffect(() => {
    if (storeProduceInfo.plotSiteName != '') {
      saveInObject();
    }
  }, [storeProduceInfo.cycleEnds]);
  const produceRemoveDetails = index => {
    const values = [...produceAddDetails];
    values.splice(index, 1);
    setstoreProduceInfoInArray(values);
  };
  const validationData = () => {
    if (!storeProduceInfo.plotSiteName) {
      Toast.show({
        time: 3,
        text: `${t('pl_en_plot_name_first')}`,
        ...AlertMesg[0],
      });
      setstoreProduceInfo({ ...storeProduceInfo, cycleEnds: '' });
      return false;
    }
    if (!storeProduceInfo.terrainType) {
      Toast.show({
        time: 3,
        text: `${t('please_select_terrain_type_first')}`,
        ...AlertMesg[0],
      });
      setstoreProduceInfo({ ...storeProduceInfo, cycleEnds: '' });
      return false;
    }
    if (!storeProduceInfo.landType) {
      Toast.show({
        time: 3,
        text: `${t('please_select_land_type_first')}`,
        ...AlertMesg[0],
      });
      setstoreProduceInfo({ ...storeProduceInfo, cycleEnds: '' });
      return false;
    }
    if (!storeProduceInfo.soilType) {
      Toast.show({
        time: 3,
        text: `${t('please_select_soil_type_first')}`,
        ...AlertMesg[0],
      });
      setstoreProduceInfo({ ...storeProduceInfo, cycleEnds: '' });
      return false;
    }
    if (!storeProduceInfo.plotSize) {
      Toast.show({ time: 3, text: `${t('please_enter_unit')}`, ...AlertMesg[0] });
      setstoreProduceInfo({ ...storeProduceInfo, cycleEnds: '' });
      return false;
    }
    if (!storeProduceInfo.landUnit) {
      Toast.show({
        time: 3,
        text: `${t('please_select_unit_first')}`,
        ...AlertMesg[0],
      });
      setstoreProduceInfo({ ...storeProduceInfo, cycleEnds: '' });
      return false;
    }
    if (!storeProduceInfo.prodctionSeasion) {
      Toast.show({
        time: 3,
        text: `${t('please_select_cultiveting_season_first')}`,
        ...AlertMesg[0],
      });
      setstoreProduceInfo({ ...storeProduceInfo, cycleEnds: '' });
      return false;
    }
    if (!storeProduceInfo.livelihoodType) {
      Toast.show({
        time: 3,
        text: `${t('please_select_crop_type_first')}`,
        ...AlertMesg[0],
      });
      setstoreProduceInfo({ ...storeProduceInfo, cycleEnds: '' });
      return false;
    }
    if (!storeProduceInfo.produceName) {
      Toast.show({
        time: 3,
        text: `${t('please_select_crop_name_first')}`,
        ...AlertMesg[0],
      });
      setstoreProduceInfo({ ...storeProduceInfo, cycleEnds: '' });
      return false;
    }
    if (!storeProduceInfo.produceVariety) {
      Toast.show({
        time: 3,
        text: `${t('please_select_crop_veriety_first')}`,
        ...AlertMesg[0],
      });
      setstoreProduceInfo({ ...storeProduceInfo, cycleEnds: '' });
      return false;
    }
    if (!storeProduceInfo.productionProcess) {
      Toast.show({
        time: 3,
        text: `${t('please_select_production_system_first')}`,
        ...AlertMesg[0],
      });
      setstoreProduceInfo({ ...storeProduceInfo, cycleEnds: '' });
      return false;
    }
    if (!storeProduceInfo.produceProductionUnit) {
      Toast.show({
        time: 3,
        text: `${t('please_give_yeild_size')}`,
        ...AlertMesg[0],
      });
      setstoreProduceInfo({ ...storeProduceInfo, cycleEnds: '' });
      return false;
    }
    if (location[0].latitude == '') {
      Toast.show({
        time: 3,
        text: `${t('tap_to_get_latitude_and_longitude')}`,
        ...AlertMesg[0],
      });
      setstoreProduceInfo({ ...storeProduceInfo, cycleEnds: '' });
      return false;
    }
    if (!storeProduceInfo.cycleStarts) {
      Toast.show({
        time: 3,
        text: `${t('select_enddate_first')}`,
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
    return true;
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
      ConvertedreportedLandsize: Number(item?.sizevalue) * Number(storeProduceInfo?.plotSize),
      cycleEnds: ""
    });
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
      IOTId: "",
      IOTLatLong: "",
      IOTLatlat: ""
    });
    setLandProof([
      { uri: '', name: '', type: '', fileName: '' },
      { uri: '', name: '', type: '', fileName: '' },
      { uri: '', name: '', type: '', fileName: '' },
      { uri: '', name: '', type: '', fileName: '' },
      { uri: '', name: '', type: '', fileName: '' },
    ]);
  };
  const handleSave = async () => {
    Keyboard.dismiss();
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
      if (
        typeof route.params != 'undefined' &&
        route.params.arrayIndex != undefined
      ) {
        const storeArr = await getItem('storeProduceInfo_data');
        const values = [...storeArr];
        values[route.params.arrayIndex] = {
          storeProduceInfo: storeProduceInfo,
          location: location,
          landProof,
        };
        await setItem('storeProduceInfo_data', values);
        if (validationData()) {
          navigation.navigate('RegistationSignUpViwer', { data: remove });
        }
      } else if (storeProduceInfoInArray.length !== 0) {
        await setItem('storeProduceInfo_data', storeProduceInfoInArray);
        navigation.navigate('RegistationSignUpViwer', { data: remove });
      } else if (storeProduceInfoInArray.length === 0) {
        if (validationData()) {
          // await setItem('storeProduceInfo_data', storeProduceInfoInArray);
          // navigation.navigate('RegistationSignUpViwer', { data: remove });
        }
      }
    } else {
      Toast.show({
        text: 'Please set default unit',
        ...AlertMesg[0],
      });
    }
  };
  const HandlerGoBack = () => {
    if (path != '') {
      navigation.navigate(path);
    } else {
      navigation.navigate('FinancialInformation');
    }
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
        if (landUnitsquareMetre?.[0]?.defined_unit_value) {
          setArea(Number(landUnitsquareMetre?.[0]?.defined_unit_value) * geolib.getAreaOfPolygon(filteredDatalatLong));
          setstoreProduceInfo({
            ...storeProduceInfo,
            google_area: geolib.getAreaOfPolygon(newPolygon),
            google_area_defaul:
              Number(landUnitsquareMetre?.[0]?.defined_unit_value) *
              geolib.getAreaOfPolygon(filteredDatalatLong),
          });
        } else {
          setArea(geolib.getAreaOfPolygon(filteredDatalatLong));
          setstoreProduceInfo({
            ...storeProduceInfo,
            google_area: geolib.getAreaOfPolygon(filteredDatalatLong),
            google_area_defaul: geolib.getAreaOfPolygon(filteredDatalatLong),
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
  const handleCurrentLatLongIOT = async () => {
    const fusedLocation = await getItem('fusedLocation');
    const { latitude, longitude } = fusedLocation;
    setstoreProduceInfo({
      ...storeProduceInfo,
      IOTLatlat: latitude,
      IOTLatLong: longitude,
    });
  }
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
        if (turf.booleanOverlap(existingGeo, newGeo)||turf.booleanWithin(newGeo, existingGeo)) {
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
      // setPolygons([newPolygon]);
      // setPolygons(nearPolSet);
      if (route?.params?.editItem) {
        //  setPolygons([route?.params?.editItem?.location]);
        //basudev
        setPolygons([...nearPolSet, newPolygon]);
      } else {
        setPolygons(nearPolSet);
      }
      setNewPolygon([]);
      setLocation(newPolygon);
      setEditing(false);
      setShowModal(false);
      // setArea(calculateAreaFun(newPolygon).toFixed(3));


      if (landUnitsquareMetre?.[0]?.defined_unit_value) {
        setArea(
          Number(
            landUnitsquareMetre?.[0]?.defined_unit_value,
          ) * geolib.getAreaOfPolygon(newPolygon),
        );
        setstoreProduceInfo({
          ...storeProduceInfo,
          google_area: geolib.getAreaOfPolygon(newPolygon),
          google_area_defaul:
            Number(
              landUnitsquareMetre?.[0]?.defined_unit_value,
            ) * geolib.getAreaOfPolygon(newPolygon),
        });

      } else {
        setArea(geolib.getAreaOfPolygon(filteredDatalatLong));
        setstoreProduceInfo({
          ...storeProduceInfo,
          google_area: geolib.getAreaOfPolygon(newPolygon),
          google_area_defaul: geolib.getAreaOfPolygon(newPolygon),
        });

      }
    } else {
      //  removesetLocation();
      //   setNewPolygon([]);
      //  setArea(0);
      Alert.alert('Error', 'A polygon requires at least 3 points.');
    }
    setLocationType('polygon_tap');
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
  const clearNewPolygon = () => {
    setstoreProduceInfo({ ...storeProduceInfo, google_area: 0 });
    setNewPolygon([]);
    setPolygons(nearPolSet);
    removesetLocation();
    setArea(0);
  };
  const regionRef = useRef(null);
  const timeoutRef = useRef(null);
  const handleRegionChangeComplete = async (newRegion) => {
    const { latitude, longitude } = newRegion;
    regionRef.current = newRegion;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(async () => {
      const latestRegion = regionRef.current;
      setIsLoading(true);
      const isSameLat = Math.abs(latestRegion.latitude - newRegion.latitude) < 0.0001;
      const isSameLng = Math.abs(latestRegion.longitude - newRegion.longitude) < 0.0001;
      if (isSameLat && isSameLng) {
        try {
          const nearestLatLong_res = await nearestLatLong(dbName, languageId, token, latitude, longitude);
          if (nearestLatLong_res?.status === 200) {
            const data = nearestLatLong_res?.data?.data;
            // setnearPolData(data);
            const groupedData = groupByRelId(data);
            setnearPolSet(groupedData);
            setPolygons(groupedData);
          }
        } catch (error) {
          console.error("Error fetching nearest polygon data:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    }, 3000);
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
  return (
    <>
      <CustomHeader
        path={path != '' ? path : 'FinancialInformation'}
        HandlerGoBack={HandlerGoBack}
        logoImage={logoImage}
        topBanner={topBanner}
      />
      <FormsTitle title={t('reg_land_crop_information')} />
      <View style={styles.container}>
        {isLoading ? (
          <View style={styles.loadingScreen}>
            <LoadingScreen />
          </View>
        ) : (
          ''
        )}
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.formContainer}>
            <View style={{ paddingHorizontal: 20 }}>
              <InputTextForm
                label={t('add_plot')}
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
                label={t('select_terrain_type')}
                color="red"
                data={terrainTypeData}
                onChange={item =>
                  setstoreProduceInfo({
                    ...storeProduceInfo,
                    terrainType: item.label,
                    terrainTypeValue: item.value,
                  })
                }
                val={storeProduceInfo.terrainType}
              />
              <DropdownForm
                label={t('select_land_type')}
                color="red"
                data={landTypeData}
                onChange={item => {
                  setstoreProduceInfo({
                    ...storeProduceInfo,
                    landType: item.label,
                    landTypeValue: item.value,
                  });
                }}
                val={storeProduceInfo.landType}
              />
              <DropdownForm
                label={t('addland_soil_type')}
                color="red"
                data={soilTypeData}
                onChange={item => {
                  setstoreProduceInfo({
                    ...storeProduceInfo,
                    soilType: item.label,
                    soilTypeValue: item.value,
                  });
                }}
                val={storeProduceInfo.soilType}
              />
              <View
                style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ width: '45%' }}>
                  <InputTextForm
                    label={t('plot_size')}
                    color="red"
                    onChangeText={item =>
                      setstoreProduceInfo({ ...storeProduceInfo, plotSize: item, ConvertedreportedLandsize: Number(storeProduceInfo?.sizevalue) * Number(item), cycleEnds: "" })
                    }
                    value={storeProduceInfo.plotSize}
                    keyboardType="numeric"
                  />
                </View>
                <View style={{ width: '45%' }}>
                  <DropdownForm
                    label={t('select_unit')}
                    color="red"
                    data={landUnitData}
                    onChange={item => handleLandUnit(item)}
                    val={storeProduceInfo.landUnit}
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
                    source={require('../../Common/images/map.png')}
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
                          source={require('../../Common/images/map.png')}
                          style={{ width: 50, height: 50 }}
                        />
                      </View>
                    </TouchableOpacity>
                  );
                })}
              <DropdownForm
                label={t('addcrop_select_cultivating_season')}
                color="red"
                data={prodctionSeasionData}
                onChange={item => {
                  setstoreProduceInfo({
                    ...storeProduceInfo,
                    prodctionSeasion: item.label,
                    prodctionSeasionValue: item.value,
                    livelihoodType: '',
                    livelihoodTypeValue: '',
                    produceName: '',
                    produceNameValue: '',
                    produceVariety: '',
                    produceVarietyValue: '',
                  });
                }}
                val={storeProduceInfo.prodctionSeasion}
              />
              <DropdownForm
                label={t('select_crop_type')}
                color="red"
                data={livelihoodTypeData}
                onChange={item => HandlelivehoodType(item)}
                val={storeProduceInfo.livelihoodType}
              />
              <DropdownForm
                label={t('select_crop_name')}
                color="red"
                data={produceNameData}
                onChange={item => HandleproduceName(item)}
                val={storeProduceInfo.produceName}
              />
              <DropdownForm
                label={t('select_crop_variety')}
                color="red"
                data={produceVarietyData}
                onChange={item => {
                  setstoreProduceInfo({
                    ...storeProduceInfo,
                    produceVariety: item.label,
                    produceVarietyValue: item.value,
                  });
                }}
                val={storeProduceInfo.produceVariety}
              />
              <DropdownForm
                label={t('production_system')}
                color="red"
                data={productionProcessData}
                onChange={item => {
                  setstoreProduceInfo({
                    ...storeProduceInfo,
                    productionProcess: item.label,
                    productionProcessValue: item.value,
                  });
                }}
                val={storeProduceInfo.productionProcess}
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
                    produceProductionUnit: item.label,
                    produceProductionUnitValue: item.value,
                  });
                }}
                val={storeProduceInfo.produceProductionUnit}
              />
              <View>
                <Text style={{ marginBottom: 5, marginLeft: 5, color: 'red' }}>
                  {t('showing_date')}
                </Text>
                <View style={styles.passwordMainContainer}>
                  <TouchableOpacity
                    style={styles.passwordContainer}
                    onPress={() => setOpencycleStarts(true)}>
                    <View style={{ width: '90%' }}>
                      <Text style={styles.text}>
                        {storeProduceInfo.cycleStarts}
                      </Text>
                    </View>
                    <ImageForm
                      source={require('../../Common/images/date.png')}
                      resizeMode="cover"
                      height={30}
                      width={30}
                    />
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
                  </TouchableOpacity>
                </View>
              </View>
              <View>
                <Text style={{ marginBottom: 5, marginLeft: 5, color: 'red' }}>
                  {t('harvesting_date_auto_calculated')}
                </Text>
                <View style={styles.passwordMainContainer}>
                  <TouchableOpacity
                    style={styles.passwordContainer}
                    onPress={() => setOpencycleEnds(true)}>
                    <View style={{ width: '90%' }}>
                      <Text style={styles.text}>
                        {storeProduceInfo.cycleEnds}
                      </Text>
                    </View>
                    <ImageForm
                      source={require('../../Common/images/date.png')}
                      resizeMode="cover"
                      height={30}
                      width={30}
                    />
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
                  </TouchableOpacity>
                </View>
              </View>
              {route.params.arrayIndex == undefined ? (
                <TouchableOpacity
                  onPress={saveInObject}
                  style={{ alignItems: 'center' }}
                  activeOpacity={0.7}>
                  <Text style={styles.addBtn}>
                    {t('click_to_add_more_plot')}
                  </Text>
                </TouchableOpacity>
              ) : (
                ''
              )}
              <View style={{ marginBottom: 10 }}>
                {route.params.arrayIndex == undefined
                  ? storeProduceInfoInArray.map((data, index) => {
                    return (
                      <View style={styles.moreContainer} key={index}>
                        <View style={styles.moreTextContainer}>
                          <Text style={styles.moreText}>
                            {data.storeProduceInfo.plotSiteName}
                          </Text>
                          <Text style={styles.moreText}>
                            {data.storeProduceInfo.produceName}
                          </Text>
                          <Text style={styles.moreText}>
                            {data.storeProduceInfo.produceVariety}
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => produceRemoveDetails(index)}>
                          <Image
                            source={require('../../Common/images/x-mark.png')}
                            style={styles.xMarkImage}
                          />
                        </TouchableOpacity>
                      </View>
                    );
                  })
                  : null}
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
        <ButtonForm
          label={
            route.params.arrayIndex == undefined
              ? `${t('next')}`
              : `${t('save')}`
          }
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
          onRequestClose={() => {
            setShowModal(!showModal);
          }}
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
            handleRegionChangeComplete={handleRegionChangeComplete}
            isLoading={isLoading}
          />
        </Modal>
      )}
      <Root></Root>
    </>
  );
};

export default PlotSiteProduceInformation;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    flex: 1,
    paddingTop: 10,
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
    paddingHorizontal: 10,
  },
  inputTextStyle: {
    flex: 1,
    height: 50,
    marginHorizontal: 10,
    borderColor: 'gray',
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
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
    color: '#FFFFFF',
    elevation: 5,
    fontFamily: 'Poppins-SemiBold',
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
  text: {
    color: '#000',
  },
  loadingScreen: {
    position: 'absolute',
    top: 100,
    zIndex: 999,
    left: '40%',
  },
  text: {
    fontFamily: 'Poppins-Regular',
    color: '#000',
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
});
