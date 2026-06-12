import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Keyboard,
  Modal,
  Alert,
} from 'react-native';
import React, {
  useState,
  useEffect,
  useContext,
  useRef,
  useCallback,
} from 'react';
import {
  nearestLatLong,
  uploadCarbonAgrDocs,
  uploadFarmerIdAdd,
  setCycleDateAPI,
} from '../../../config/apiHere';
import {LandUnitArea, LandUnitsquare_metre} from '../../../config/apiHere';
import config from '../../../config';
import axios from 'axios';
import {useIsFocused, useNavigation} from '@react-navigation/native';
const qs = require('qs');
import HarvestedModel from './HarvestedModel';
import {CrashlyticsRecordError} from '../../Crashlytics/CrashlyticsRecordError';
import {userCreateContext} from '../../Context/usersCreateContext';
import Map from '../Map';
import * as geolib from 'geolib';
import {getDistance} from 'geolib';
import {APP_MAP_RANGE_POLYGON} from '@env';
import * as turf from '@turf/turf';
import {
  calculateAreaFun,
  convertedArrayLatLong,
  calculatePolygonArea,
  isWithin20Meters,
} from '../../Common/calculateAreaFun';
import DocumentPicker, {types} from '@react-native-documents/picker';
import {
  getPlotDocAPI,
  deletePlotImageAPI,
  addPlotImageAPI,
  addCropInputAPI,
} from '../Loan/LoanAPI';
import CarbonCertificate from '../../Common/CarbonCertificate';
import SignatureCapture from '../../Common/SignaturePad';
import ProofAndIdentityPropfComp from '../../Common/ProofAndIdentityPropfComp';
import FarmerDrawerScreenWrapper1 from '../FarmerDrawerScreenWrapper1';
import {Colors, Fonts} from '../../utils/Constants';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {getActionsPlot} from '../../utils/options';
import FloatingActionButton from '../../Components/FloatingActionButton';
import MyErrorBoundary from '../../Common/MyErrorBoundary';
import {axiosGet, axiosPut, axiosPost} from '../../utils/api';
import {ROUTES} from '../../utils/Routes';
import {getHighAccuracyLocation} from '../../utils/getHighAccuracyLocation';
import {ProductionSeasonAndApi} from '../../../config/apiHere';
import {AddLandCropDetailsAPI} from '../../../config/apiHere';
import {formatISODateWithSuffix} from '../../Common/CommonFunction';
import FarmerCropData from './FarmerCropData';
const FarmerLiveHood = ({
  dataProps,
  setActiveTab,
  onTabPress,
  setAddPlot,
  addPlot,
  historyData,
}) => {
  //basudev
  const navigation = useNavigation();
  //GQR-67
  const today = new Date();

  const {
    loginUser_data,
    t,
    FormsTitle,
    getItem,
    logoImage,
    topBanner,
    effective_dates,
    setItem,
    InputTextForm,
    DropdownForm,
    DatePickerComp,
    CustomHeader,
    LoadingScreen,
    Root,
    Toast,
    AlertMesg,
    ButtonFormBottom,
    ButtonForm,
    coords,
  } = useContext(userCreateContext);
  const [maxStartDate, setMaxStartDate] = useState(new Date());
  const [minStartDate, setMinStartDate] = useState(new Date());
  const [maxHarvestDate, setMaxHarvestDate] = useState(new Date());
  const [minHarvestDate, setMinHarvestDate] = useState(new Date());
  const {dbname, lan_id, token, user_id, owner, carbonFlag} = loginUser_data;
  //GQR-67
  const isFocused = useIsFocused();
  const [plotAll, setplotAll] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statuslevel, setstatuslevel] = useState({label: '', value: ''});
  const [plotStatus, setplotStatus] = useState({label: '', value: ''});

  const [seddingData, setseddingData] = useState(false);

  const [farmerData, setFarmerData] = useState({
    createdBy: '',
    plot_no: '',
    cu_rel_id: '',
    land_rel_id: '',
    daag_no: '',
    khatian_no: '',
    plant_number: '',
    jl_no: '',
    mouja: '',
    land_size: '',
    plot_Site: '',
    plot_Site_Name: '',
    expectedProduction: '',
    cycleStartDate: '',
    cycleEndDate: '',
    terrainType: '',
    terrainTypeValue: '',
    landType: '',
    landTypeValue: '',
    soilType: '',
    soilTypeValue: '',
    unit: '',
    unitValue: '',
    productionSeason: '',
    productionSeasonSdId: '', // ADD THIS
    productionSeasonValue: '',
    productionSeasonYear: '',
    livelihoodType: '',
    livelihoodTypeValue: '',
    produceName: '',
    produceNameValue: '',
    produceVariety: '',
    produceVarietyValue: '',
    productionProcess: '',
    productionProcessValue: '',
    unitProduct: '',
    unitProductValue: '',
    unit_valueArr: '',
    unit_value: '',
    google_area: '',
    IOTId: '',
    IOTLatLong: '',
    IOTLatlat: '',
    ConvertedreportedLandsize: 0,
    crop_cycl_start_date: '',
  });
  const [dafaultLatLon, setDefaultLatLon] = useState({
    latitude: 22.15454,
    longitude: 22.515451,
    accuracy: 5,
  });
  const [terrainTypeAll, setterrainTypeAll] = useState([]);
  const [soilTypeAll, setsetsoilTypeAll] = useState([]);
  const [landTypeAll, setlandTypeAll] = useState([]);
  const [unitAll, setUnitAll] = useState([]);
  const [location, setLocation] = useState([
    {latitude: '', longitude: ''},
    // {latitude: '', longitude: ''},
    // {latitude: '', longitude: ''},
  ]);
  const [mainLocation, setmainLocation] = useState([
    {latitude: '', longitude: ''},
  ]);
  const [newDate, setnewDate] = useState(new Date());
  const [locationType, setLocationType] = useState('location_tap');
  const [penCycleStart, setopenCycleStart] = useState(false);
  const [penCycleEnd, setopenCycleEnd] = useState(false);
  const [issuenewDate, setIssueNewDate] = useState(new Date());
  const [productionSeason, setProductionSeason] = useState([]);
  const [livelihoodType, setLivelihoodType] = useState([]);
  const [produceName, setProduceName] = useState([]);
  const [produceVariety, setProduceVariety] = useState([]);
  const [productionProcess, setProductionProcess] = useState([]);
  const [productionUnit, setProductionUnit] = useState([]);
  const [userData, setUserData] = useState('');
  const [harvested, setHarvested] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [plotSiteUserLandDetails, setplotSiteUserLandDetails] = useState([]);
  const [edit, setEdit] = useState('');
  const [plotEdit, setPlotEdit] = useState(false);
  const emptyLandDoc = () => ({
    uri: '',
    name: '',
    type: '',
    fileName: '',
    id: '',
  });
  const [addressProof, setAddressProof] = useState([
    emptyLandDoc(),
    emptyLandDoc(),
    emptyLandDoc(),
    emptyLandDoc(),
    emptyLandDoc(),
  ]);
  const [photoDeletedValue, setPhotoDeletedValue] = useState([]);
  const [identityProofIdentityPropf, setIdentityProofIdentityPropf] = useState([
    {
      uri: '',
      name: '',
      type: '',
      fileName: '',
      imageType: 'address',
      file_path: '',
      file_id: '',
      id: '',
    },
    {
      uri: '',
      name: '',
      type: '',
      fileName: '',
      imageType: 'identity',
      file_path: '',
      file_id: '',
      id: '',
    },
  ]);
  const [identityPhotoDeletedValue, setIdentityPhotoDeletedValue] = useState(
    [],
  );
  const [plotId, setPlotId] = useState('');
  const [defaultLand, setDefaultLand] = useState(false);
  const [convertionLUState, setConvertionLUState] = useState(false);
  const [landAreaUnit, setLandAreaUnit] = useState([]);
  const [landUnitsquareMetre, setLandUnitsquareMetre] = useState([]);
  const [nearPolSet, setnearPolSet] = useState([]);
  const [nearPolData, setnearPolData] = useState([]);
  const [updateRelId, setupdateRelId] = useState('');
  const [particularLocSet, setparticularLocSet] = useState([]);
  const [referencelatLong, setreferencelatLong] = useState({
    latitude: 0,
    longitude: 0,
  });
  const [outofRange, setOutofRange] = useState(false);
  const [previousPlotLatlong, setPreviousPlotLatlong] = useState([]);
  const [carboncertificate, setCarboncertificate] = useState([
    {uri: '', name: '', type: '', fileName: '', id: ''},
  ]);
  const [signature, setSignature] = useState({
    uri: '',
    name: '',
    type: '',
    fileName: '',
    id: '',
  });
  // NEW STATE FOR TAB SYSTEM
  const [selectedTab, setSelectedTab] = useState('PLOT');
  // AMENDMENTS STATE (NEW)
  const [amendmentData, setAmendmentData] = useState({
    organic_amendment_type: [],
    fertilizers: [],
    pesticide: [],
  });

  const [selectedType, setSelectedType] = useState('organic_amendment_type');
  const currentList = amendmentData[selectedType] || [];
  const numericRegex = /^[0-9]*\.?[0-9]*$/;

  const [formData, setFormData] = useState({
    ferti_pesti_fid: '',
    quantity: '',
    unit_fid: '',
    no_of_applications: '',
  });

  const [allItems, setAllItems] = useState([]);
  const amendmentTypes = [
    {label: 'Organic amendment', value: 'organic_amendment_type'},
    {label: 'Fertilizer', value: 'fertilizers'},
    {label: 'Pesticide', value: 'pesticide'},
  ];

  const groupByRelId = data => {
    const grouped = data.reduce((result, item) => {
      const latitude = parseFloat(item.latitude);
      const longitude = parseFloat(item.longitude);
      if (isNaN(latitude) || isNaN(longitude)) {
        return result;
      }
      const newItem = {latitude, longitude};
      if (!result[item.rel_id]) {
        result[item.rel_id] = [];
      }
      result[item.rel_id].push(newItem);
      return result;
    }, {});

    return Object.values(grouped);
  };

  const handleAmendmentChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  const addMoreAmendments = () => {
    if (!formData.quantity) {
      Toast.show({text: 'Enter Quantity', ...AlertMesg[0]});
      return;
    }

    const newItem = {
      ...formData,
      quantity: Number(formData.quantity),
      no_of_applications: Number(formData.no_of_applications),
      type: selectedType,
      uniqueKey: Date.now(),
      isFromAPI: false,
    };

    setAllItems(prev => [...prev, newItem]);

    setFormData({
      ferti_pesti_fid: '',
      quantity: '',
      unit_fid: '',
      no_of_applications: '',
    });
  };

  const deleteAmendment = index => {
    const updated = [...allItems];
    updated.splice(index, 1);
    setAllItems(updated);
  };
  const formatAmendmentPayload = (allItems, cu_rel_id) => {
    const groupedData = {
      cu_rel_fid: cu_rel_id,
      organic_amendment_type: [],
      fertilizers: [],
      pesticide: [],
    };

    allItems.forEach(item => {
      const {type, uniqueKey, isFromAPI, ...rest} = item;

      // Only send newly added items
      if (!isFromAPI && groupedData[type]) {
        groupedData[type].push({
          ...rest,
          quantity: Number(rest.quantity),
          no_of_applications: Number(rest.no_of_applications),
        });
      }
    });

    return groupedData;
  };

  const fetchAndGroupPestDetails = async cuRelId => {
    if (!cuRelId) return;

    try {
      const response = await axiosGet(
        ROUTES.GET.PEST_DETAILS({
          cu_rel_fid: cuRelId,
        }),
        '',
        {
          information: `${dbname},${lan_id}`,
          Authorization: `${token}`,
        },
      );

      const pestRows = response?.data?.data?.rows || [];

      const groupedData = {
        organic_amendment_type: [],
        fertilizers: [],
        pesticide: [],
      };

      pestRows.forEach(item => {
        const formattedItem = {
          ...item,
          isFromAPI: true, // 🔥 important
        };

        if (item.type === 'ORGANIC_AMENDMENT_TYPE') {
          groupedData.organic_amendment_type.push(formattedItem);
        }

        if (item.type === 'FERTILIZER') {
          groupedData.fertilizers.push(formattedItem);
        }

        if (item.type === 'PESTICIDE') {
          groupedData.pesticide.push(formattedItem);
        }
      });

      setAmendmentData(groupedData);
    } catch (error) {
      console.log('Error fetching pest details:', error);
    }
  };
  useEffect(() => {
    console.log('🧪 amendmentData state:', amendmentData);

    const apiItems = [];

    Object.keys(amendmentData).forEach(type => {
      amendmentData[type].forEach(item => {
        apiItems.push({
          ...item,
          type: type.toLowerCase(),
          uniqueKey: `api-${item.ferti_pesti_fid}-${Date.now()}`,
          isFromAPI: true,
        });
      });
    });

    if (apiItems.length > 0) {
      setAllItems(apiItems);
    }
  }, [amendmentData]);
  const onPageLoad = async () => {
    try {
      setIsLoading(true);
      const {latitude, longitude} = coords;
      var latLong;
      if (latitude == '' && longitude == '') {
        latLong = await getHighAccuracyLocation();
      }
      const lat = latitude === '' ? latLong.latitude : latitude;
      const lon = longitude === '' ? latLong.longitude : longitude;
      setDefaultLatLon({latitude: lat, longitude: lon, accuracy: 10});
      let groupedData;
      const axiosConfig = {
        headers: {
          information: `${dbname},${lan_id}`,
          Accept: 'application/json',
        },
      };
      const plotSiteApi = await axiosGet(
        ROUTES.GET.PROBLEM_PLOT_AGAINST_FARMER({
          farmerID: user_id,
        }),
        token,
        {information: `${dbname},${lan_id}`},
      );
      // problemPlotAgainstFarmerAPI(
      //   dbname,
      //   lan_id,
      //   token,
      //   user_id,
      // );
      if (plotSiteApi?.status == 200) {
        // console.log(JSON.stringify(plotSiteApi?.data?.data))
        const dataArray = plotSiteApi?.data?.data.map(data => ({
          value: data.rel_id,
          label: data.plot_no,
        }));
        setplotAll(dataArray);
      }
      const [
        nearestLatLong_res,
        UnitConversonToDefault_res,
        plotSiteUserLandDetails_res,
        LandUnitArea_res,
        LandUnitsquare_metre_res,
      ] = await Promise.all([
        axiosPost(
          ROUTES.POST.NEAREST_LATLONG,
          {
            latitude: lat,
            longitude: lon,
            distance: 200,
            data_limit: 100,
          },
          token,
          false,
          {
            information: `${dbname},${lan_id}`,
          },
        ),
        // nearestLatLong(dbname, lan_id, token, lat, lon),
        axiosGet(ROUTES.GET.UNIT_CONVERSION_DEFAULT({}), token, {
          information: `${dbname},${lan_id}`,
        }),
        // UnitConversonToDefault(dbname, lan_id, token),
        axiosGet(
          ROUTES.GET.PLOT_SIDE_USER_LAND_DETAILS({
            farmeruserID: user_id,
          }),
          token,
          {information: `${dbname},${lan_id}`},
        ),
        // PlotSiteUserLandDetails(dbname, lan_id, token, user_id),
        axiosGet(ROUTES.GET.LAND_UNIT_AREA({}), token, {
          information: `${dbname},${lan_id}`,
          'Content-Type': 'multipart/form-data',
        }),
        // LandUnitArea(dbname, lan_id, token),

        axiosGet(ROUTES.GET.LAND_UNIT_SQUARE({}), token, {
          information: `${dbname},${lan_id}`,
          'Content-Type': 'multipart/form-data',
        }),
        // LandUnitsquare_metre(dbname, lan_id, token),
        terraintype_resAPI(axiosConfig),
        soilType_resAPI(axiosConfig),
        landType_resAPI(axiosConfig),
        landunit_resAPI(axiosConfig),
        produceVarietyAPI(dbname, lan_id),
        productionProcessAPI(dbname, lan_id),
      ]);
      setreferencelatLong({latitude: lat, longitude: lon});
      if (nearestLatLong_res.status == 200) {
        if (nearestLatLong_res.data.data.length > 0) {
          setnearPolData(nearestLatLong_res.data.data);
          groupedData = groupByRelId(nearestLatLong_res.data.data);
          setnearPolSet(groupByRelId(nearestLatLong_res.data.data));
          setPolygons(groupedData);
        }
      }

      let i = 0;
      if (UnitConversonToDefault_res.status == 200) {
        if (UnitConversonToDefault_res.data.data?.count > 0) {
          UnitConversonToDefault_res.data.data.rows.forEach(element => {
            // console.log(element.defined_unit_value);
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

      if (LandUnitArea_res.status == 200) {
        if (LandUnitArea_res.data.data?.count > 0) {
          LandUnitArea_res.data.data.rows.forEach(element => {
            if (element.defined_unit_value.length > 0) {
              setDefaultLand(true);
            } else {
              setDefaultLand(false);
            }
          });
        }
      }
      if (LandUnitArea_res?.status == 200) {
        const {count, rows} = LandUnitArea_res?.data?.data || {};
        if (count > 0) {
          setLandAreaUnit(rows);
        } else {
          setLandAreaUnit([]);
        }
      }
      if (LandUnitsquare_metre_res?.status == 200) {
        const {count, rows} = LandUnitsquare_metre_res?.data?.data || {};
        if (count > 0) {
          setLandUnitsquareMetre(rows);
        } else {
          setLandUnitsquareMetre([]);
        }
      }
      if (plotSiteUserLandDetails_res?.status === 200) {
        setplotSiteUserLandDetails(plotSiteUserLandDetails_res.data.data);
      }
      setIsLoading(false);
    } catch (error) {
      console.log('SUBMIT ERROR =>', error);
      console.log('SUBMIT ERROR RESPONSE =>', error?.response?.data);

      CrashlyticsRecordError(error);

      Toast.show({
        text:
          error?.response?.data?.error?.errorMessage ||
          error?.message ||
          'Something went wrong',
        ...AlertMesg[0],
      });
    }
  };
  const handleBackPress = () => {
    navigation.navigate('FarmerDashboard');
    return true;
  };
  useEffect(() => {
    onPageLoad();
  }, []);
  const RemoveFarmerData = () => {
    setFarmerData({
      ...farmerData,
      createdBy: '',
      plot_no: '',
      cu_rel_id: '',
      land_rel_id: '',
      daag_no: '',
      khatian_no: '',
      plant_number: '',
      jl_no: '',
      mouja: '',
      land_size: '',
      plot_Site: '',
      plot_Site_Name: '',
      expectedProduction: '',
      cycleStartDate: '',
      cycleEndDate: '',
      terrainType: '',
      terrainTypeValue: '',
      landType: '',
      landTypeValue: '',
      soilType: '',
      soilTypeValue: '',
      unit: '',
      unitValue: '',
      productionSeason: '',
      productionSeasonValue: '',
      livelihoodType: '',
      livelihoodTypeValue: '',
      produceName: '',
      produceNameValue: '',
      produceVariety: '',
      produceVarietyValue: '',
      productionProcess: '',
      productionProcessValue: '',
      unitProduct: '',
      unitProductValue: '',
      unit_value: '',
      google_area: '',
      // unit_valueArr: "",
      IOTId: '',
      IOTLatLong: '',
      IOTLatlat: '',
      ConvertedreportedLandsize: 0,
      crop_cycl_start_date: '',
    });
    setAddressProof([
      {uri: '', name: '', type: '', fileName: ''},
      {uri: '', name: '', type: '', fileName: ''},
      {uri: '', name: '', type: '', fileName: ''},
      {uri: '', name: '', type: '', fileName: ''},
      {uri: '', name: '', type: '', fileName: ''},
    ]);
  };
  const handleHarvested = async data => {
    setHarvested(data);
    setEdit('');
    if (data === 'same produce') {
      setFarmerData({
        ...farmerData,
        productionSeason: '',
        productionSeasonValue: '',
        cycleStartDate: '',
        cycleEndDate: '',
        final_yield_qty: '',
        final_yield_unit: '',
        plantation_method: '',
        seeding_date: '',
        water_source: '',
        gap_seeding_firrig: '',
        irri_practice: '',
        drying_period_prac: '',
        gap_draining_harvest: '',
        after_harvest_rice_stubble: '',
        after_harvest_straw: '',
        straw_removed: '',
        straw_incorporate: '',
        end_usg_rm_straw: '',
      });
    } else {
      setFarmerData({
        ...farmerData,
        productionSeason: '',
        productionSeasonValue: '',
        livelihoodType: '',
        livelihoodTypeValue: '',
        produceName: '',
        produceNameValue: '',
        produceVariety: '',
        produceVarietyValue: '',
        productionProcess: '',
        productionProcessValue: '',
        unitProduct: '',
        unitProductValue: '',
        unit_value: '',
        expectedProduction: '',
        cycleStartDate: '',
        cycleEndDate: '',
        IOTId: '',
        IOTLatLong: '',
        IOTLatlat: '',
        crop_cycl_start_date: '',
        final_yield_qty: '',
        final_yield_unit: '',
        plantation_method: '',
        seeding_date: '',
        water_source: '',
        gap_seeding_firrig: '',
        irri_practice: '',
        drying_period_prac: '',
        gap_draining_harvest: '',
        after_harvest_rice_stubble: '',
        after_harvest_straw: '',
        straw_removed: '',
        straw_incorporate: '',
        end_usg_rm_straw: '',
      });
    }
    setSelectedTab('CROP');
  };
  const handleseedDatePicker = async item => {
    const selectedDate = effective_dates(item);
    setFarmerData(prev => ({...prev, ['seeding_date']: selectedDate}));
  };
  const handleDatePicker = async item => {
    const selectedDate = effective_dates(item);
    // const seasonData = await axiosGet(
    //   ROUTES.GET.PRODUCE_SEASON({
    //     from_date: selectedDate,
    //   }),
    //   '',
    //   {
    //     information: `${dbname},${lan_id},${user_id}`,
    //     Authorization: `${token}`,
    //   },
    // );
    // setFarmerData(prev => ({
    //   ...prev,
    //   productionSeason: '',
    //   productionSeasonValue: '',
    //   productionSeasonSdId: '',
    //   productionSeasonYear: '',
    // }));
    // let prodctionSeasionArray = [];
    // if (seasonData?.status === 200) {
    //   prodctionSeasionArray = seasonData?.data?.data?.rows?.map(data => ({
    //     value: data.season_info.fid,
    //     label: `${data.season_info.name} (${data.year})`,
    //     sd_id: data.sd_id,
    //     year: data.year,
    //     originalName: data.season_info.name,
    //   }));
    // }
    // if (prodctionSeasionArray) {
    //   setProductionSeason(prodctionSeasionArray);
    // }

    setFarmerData(prev => ({
      ...prev,
      cycleStartDate: selectedDate,
    }));
  };
  const handleDatePicker2 = item => {
    const effective_date = effective_dates(item);
    setFarmerData({...farmerData, cycleEndDate: effective_date});
  };
  const handleCurrentLatLong = async index => {
    const {latitude, longitude} = coords;
    const values = [...location];
    var latLong;
    if (latitude == '' && longitude == '') {
      latLong = await getHighAccuracyLocation();
    }
    const lat = latitude === '' ? latLong.latitude : latitude;
    const lon = longitude === '' ? latLong.longitude : longitude;
    if (
      coords != null &&
      // longitude.toString().length == 10 &&
      // latitude.toString().length == 10 &&
      lat > 0 &&
      lon > 0
    ) {
      values[index] = {latitude: lat, longitude: lon};
      setLocation(values);
      const filteredDatalatLong = values.filter(
        item => item?.latitude !== '' && item?.latitude != 0,
      );
      if (filteredDatalatLong.length >= 3) {
        setNewPolygon(convertedArrayLatLong(filteredDatalatLong));
        // setArea(calculatePolygonArea(filteredDatalatLong).toFixed(3));
        setFarmerData({
          ...farmerData,
          google_area: geolib.getAreaOfPolygon(filteredDatalatLong),
        });
        if (landUnitsquareMetre?.[0]?.defined_unit_value) {
          setArea(
            Number(landUnitsquareMetre?.[0]?.defined_unit_value) *
              geolib.getAreaOfPolygon(filteredDatalatLong),
          );
        } else {
          setArea(geolib.getAreaOfPolygon(filteredDatalatLong));
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
  const handleAddData = async (item, name, value) => {
    let selectUnitValue = '';
    if (name === 'unit') {
      if (farmerData.unit_valueArr != '') {
        JSON.parse(farmerData.unit_valueArr).map((data, index) => {
          if (item.value === data.fid) {
            selectUnitValue = data.unit_value;
          }
        });
      }
      setFarmerData({
        ...farmerData,
        [name]: item.label,
        [value]: item.value,
        ['unit_value']: selectUnitValue,
        ConvertedreportedLandsize:
          Number(selectUnitValue) * Number(farmerData.land_size),
      });
    } else {
      setFarmerData({...farmerData, [name]: item.label, [value]: item.value});
      if (name === 'terrainType') {
        livelihoodTypeAPI(dbname, lan_id, item.value, '');
      }
      if (name === 'produceVariety') {
        produceVarietyAPI(dbname, lan_id);
      }
      if (name === 'productionProcess') {
        productionProcessAPI(dbname, lan_id);
      }
    }
  };
  const handleAddDataproductionSeason = useCallback(
    async item => {
      setFarmerData(prev => ({
        ...prev,
        productionSeason: item.label,
        productionSeasonValue: item.value,
        productionSeasonSdId: item.sd_id,
        productionSeasonYear: item.year,

        // livelihoodType: '',
        // livelihoodTypeValue: '',
        // produceName: '',
        // produceNameValue: '',
        // produceVariety: '',
        // produceVarietyValue: '',
        // productionProcess: '',
        // productionProcessValue: '',
      }));
      const seasonData = await axiosGet(
        ROUTES.GET.PRODUCE_SEASON({
          // crop_name_fid: item.value,
          crop_name_fid: farmerData.produceNameValue,
          sd_id: item.sd_id,
        }),
        '',
        {
          information: `${dbname},${lan_id},${user_id}`,
          Authorization: `${token}`,
        },
      );
      if (seasonData?.data?.data?.rows?.length > 0) {
        const row = seasonData?.data?.data?.rows[0];

        setMinStartDate(row?.start_date ? new Date(row.start_date) : null);
        setMaxStartDate(row?.end_date ? new Date(row.end_date) : null);
        setMinHarvestDate(
          row?.harvest_sdate ? new Date(row.harvest_sdate) : null,
        );
        setMaxHarvestDate(
          row?.harvest_edate ? new Date(row.harvest_edate) : null,
        );
      }
    },
    [farmerData.produceNameValue],
  );
  const handleAddDatalivelihoodType = async item => {
    setFarmerData(prev => ({
      ...prev,
      livelihoodType: item.label,
      livelihoodTypeValue: item.value,
      produceName: '',
      produceNameValue: '',
      produceVariety: '',
      produceVarietyValue: '',
    }));
    livelihoodTypeAPI(dbname, lan_id, item.value, '');
  };
  const handleAddDataproduceName = async item => {
    setFarmerData(prev => ({
      ...prev,
      produceName: item.label,
      produceNameValue: item.value,
      produceVariety: '',
      produceVarietyValue: '',
    }));
    const seasonData = await axiosGet(
      ROUTES.GET.PRODUCE_SEASON({
        crop_name_fid: item.value,
        sd_id: '',
      }),
      '',
      {
        information: `${dbname},${lan_id},${user_id}`,
        Authorization: `${token}`,
      },
    );
    setFarmerData(prev => ({
      ...prev,
      productionSeason: '',
      productionSeasonValue: '',
      productionSeasonSdId: '',
      productionSeasonYear: '',
    }));
    let prodctionSeasionArray = [];
    if (seasonData?.status === 200) {
      prodctionSeasionArray = seasonData?.data?.data?.rows?.map(data => ({
        value: data.season_info.fid,
        label: `${data.season_info.name} (${data.year})`,
        sd_id: data.sd_id, // NEW FIELD - stores season detail ID
        year: data.year,
        originalName: data.season_info.name,
      }));
    }
    setProductionSeason(prodctionSeasionArray);

    // if (name === 'produceName') {
    produceNameAPI(dbname, lan_id, farmerData.livelihoodTypeValue, item.value);
    // }
  };
  const handleAddDataproduceVariety = item => {
    setFarmerData(prev => ({
      ...prev,
      produceVariety: item.label,
      produceVarietyValue: item.value,
    }));
    produceVarietyAPI(dbname, lan_id);
  };
  const handleAddDataProductionProcess = item => {
    setFarmerData(prev => ({
      ...prev,
      productionProcess: item.label,
      productionProcessValue: item.value,
    }));
    productionProcessAPI(dbname, lan_id);
  };
  const handleAddUserDataExpected = text => {
    setFarmerData(prev => ({...prev, expectedProduction: text}));
  };
  const handleAddDataUnitProduct = item => {
    const {label, value} = item;
    setFarmerData(prev => ({
      ...prev,
      unitProduct: label,
      unitProductValue: value,
    }));
  };
  const terraintype_resAPI = async axiosConfig => {
    try {
      let terraintype_res = await axios.get(config.terraintypeAPI, axiosConfig);
      if (terraintype_res.data.data.count > 0) {
        let terraintypeArray = terraintype_res?.data?.data?.rows.map(data => ({
          value: data.fid,
          label: data.name,
        }));
        setterrainTypeAll(terraintypeArray);
      }
    } catch (error) {
      console.log('Error in terraintypeAPI API', error);
    }
  };
  const soilType_resAPI = async axiosConfig => {
    try {
      let soilType_res = await axios.get(config.soiltypeAPI, axiosConfig);
      if (soilType_res.data.data.count > 0) {
        let soilTypeArray = soilType_res?.data?.data?.rows.map(data => ({
          value: data.fid,
          label: data.name,
        }));
        setsetsoilTypeAll(soilTypeArray);
      }
    } catch (error) {
      console.log('Error in soiltypeAPI API', error);
    }
  };
  const landType_resAPI = async axiosConfig => {
    try {
      let landType_res = await axios.get(config.landtypeAPI, axiosConfig);
      if (landType_res.data.data.count > 0) {
        let landTypeArray = landType_res?.data?.data?.rows.map(data => ({
          value: data.fid,
          label: data.name,
        }));
        setlandTypeAll(landTypeArray);
      }
    } catch (error) {
      console.log('Error in landtypeAPI API', error);
    }
  };
  const landunit_resAPI = async axiosConfig => {
    try {
      let landunitAPI = await axios.get(config.landunitAPI, axiosConfig);
      if (landunitAPI?.status == 200) {
        if (landunitAPI.data.data.count > 0) {
          setFarmerData({
            ...farmerData,
            unit_valueArr: JSON.stringify(landunitAPI.data.data.rows),
          });
          const landunitArray = landunitAPI?.data?.data?.rows.map(data => ({
            value: data.fid,
            label: data?.name,
          }));
          setUnitAll(landunitArray);
        }
      }
    } catch (error) {
      console.log('Error in landtypeAPI API', error);
    }
  };
  const livelihoodTypeAPI = async (
    dbName,
    languageID,
    crop_type_id,
    crop_name_id,
  ) => {
    const productSeasonresRes = await axiosGet(
      ROUTES.GET.PRODUCTION_SEASON({
        lanId: languageID,
        crop_type_id: crop_type_id,
        crop_name_id: crop_name_id,
      }),
      '',
      {information: `${dbName},${languageID}`},
    );

    // ProductionSeasonAndApi(
    //   dbName,
    //   languageID,
    //   crop_type_id,
    //   crop_name_id,
    // );
    if (productSeasonresRes?.status === 200) {
      const productSeasonresResArr = [];
      const livelihoodTypeArr = [];
      const produceNameArr = [];
      // productSeasonresRes.data.data?.crop_season?.map((data, index) => {
      //   productSeasonresResArr.push({
      //     value: data.fid,
      //     label: data.name,
      //   });
      // });
      productSeasonresRes.data.data?.crop_type?.map((data, index) => {
        livelihoodTypeArr.push({
          value: data.fid,
          label: data.name,
        });
      });
      productSeasonresRes.data.data.crop_name.map((data, index) => {
        produceNameArr.push({
          value: data.crop_name.fid,
          label: data.crop_name.name,
        });
      });
      // setProductionSeason(productSeasonresResArr);
      setLivelihoodType(livelihoodTypeArr);
      setProduceName(produceNameArr);
    }
  };
  const produceNameAPI = async (
    dbName,
    languageID,
    crop_type_id,
    crop_name_id,
  ) => {
    const produceVariety = [];
    // const productSeasonresRes = await axiosGet(
    //   ROUTES.GET.PRODUCTION_SEASON({
    //     lanId: languageID,
    //     crop_type_id: crop_type_id,
    //     crop_name_id: crop_name_id,
    //   }),
    //   '',
    //   { information: `${dbName},${languageID}` },
    // );
    const productSeasonresRes = await ProductionSeasonAndApi(
      dbName,
      languageID,
      crop_type_id,
      crop_name_id,
    );
    productSeasonresRes.data.data.crop_variety.map((data, index) => {
      produceVariety.push({
        value: data.crop_variety.fid,
        label: data.crop_variety.name,
      });
    });
    setProduceVariety(produceVariety);
  };
  const produceVarietyAPI = async (dbName, languageID) => {
    const productionProcessArr = [];
    const productionProcessRes = await axiosGet(
      ROUTES.GET.PRODUCTION_PROCESS({}),
      '',
      {information: `${dbName},${languageID}`},
    );
    // ProductionProcessAPI(dbName, languageID);
    if (productionProcessRes?.status == 200) {
      productionProcessRes.data.data.rows.map((data, index) => {
        productionProcessArr.push({value: data.fid, label: data.name});
      });
      setProductionProcess(productionProcessArr);
    }
  };
  const productionProcessAPI = async (dbName, languageID) => {
    const ProductionUnitRes = await axiosGet(
      ROUTES.GET.PRODUCTION_UNIT({}),
      '',
      {information: `${dbName},${languageID}`},
    );
    // ProductionUnitAPI(dbName, languageID);
    if (ProductionUnitRes?.status == 200) {
      const productionUnitArr = ProductionUnitRes.data.data.rows.map(data => ({
        value: data.fid,
        label: data?.unit_name,
      }));
      setProductionUnit(productionUnitArr);
    }
  };
  const handleUserListUpdate = useCallback(async () => {
    try {
      Keyboard.dismiss();
      setIsLoading(true);
      const locationArry = [];
      const latlongArr = [];
      if (location?.[0]?.editing == true && statuslevel.label != '') {
        const {latitude, longitude} = coords || {};
        var latlong;
        if (latitude == '' && longitude == '') {
          latlong = await getHighAccuracyLocation();
        }
        const lat = latitude === '' ? latlong.latitude : latitude;
        const lon = longitude === '' ? latlong.longitude : longitude;
        const distances = previousPlotLatlong.map(p =>
          getDistance(p, {lat, lon}),
        );
      }
      // if (area != null && area != undefined && area != '' && area != 0) {
      //   const deviation =
      //     (Math.abs(farmerData?.ConvertedreportedLandsize - area) /
      //       ((farmerData?.ConvertedreportedLandsize + area) / 2)) *
      //     100;
      //   if (
      //     ![
      //       'APPROVED',
      //       'CARBON_DOCUMENTS_SUBMITTED',
      //       'CARBON_DOCUMENTS_APPROVED',
      //       'CARBON_DOCUMENTS_REJECTED',
      //     ].includes(statuslevel.label)
      //   ) {
      //     if (deviation >= -5 && deviation <= 5) {
      //     } else {
      //       Alert.alert(
      //         'Deviation',
      //         'The deviation between reported area and google area is not within 5%',
      //         [{text: 'OK', onPress: () => console.log(area)}],
      //         {cancelable: false},
      //       );
      //       setIsLoading(false);
      //       return;
      //     }
      //   }
      // }

      // latest code 5% area----
      if (area != null && area != undefined && area != '' && area != 0) {
        const reportedArea = farmerData?.ConvertedreportedLandsize;
        const googleArea = area;

        if (reportedArea < googleArea) {
          const deviation =
            (Math.abs(reportedArea - googleArea) /
              ((reportedArea + googleArea) / 2)) *
            100;
          if (
            ![
              'APPROVED',
              // 'CARBON_DOCUMENTS_SUBMITTED',
              'CARBON_DOCUMENTS_APPROVED',
              'CARBON_DOCUMENTS_REJECTED',
            ].includes(statuslevel.label)
          ) {
            if (deviation > 5) {
              Alert.alert(
                'Deviation',
                'The deviation between reported area and google area is not within 5%',
                [
                  {
                    text: 'OK',
                    onPress: () =>
                      console.log(
                        'Area deviation (%) →',
                        deviation.toFixed(2),
                        '| Reported:',
                        reportedArea,
                        '| Google:',
                        googleArea,
                      ),
                  },
                ],
                {cancelable: false},
              );
              setIsLoading(false);
              return;
            }
          }
        }
      }

      location.map((data, index) => {
        if (data?.latitude != '' && data?.latitude != undefined) {
          locationArry.push('latitude');
          latlongArr.push({
            latitude: data?.latitude,
            longitude: data?.longitude,
          });
        }
      });

      if (carbonFlag && !farmerData.daag_no) {
        Toast.show({
          text: 'Please enter Daag Number',
          ...AlertMesg[0],
        });
        return;
      }
      if (carbonFlag && !farmerData.jl_no) {
        Toast.show({
          text: 'Please enter JL Number',
          ...AlertMesg[0],
        });
        return;
      }
      if (farmerData.plot_Site_Name == '') {
        Toast.show({
          text: `${t('please_add_plot_name_first')}`,
          ...AlertMesg[0],
        });
      } else if (farmerData.terrainTypeValue == '') {
        Toast.show({
          text: `${t('please_select_terrain_type_first')}`,
          ...AlertMesg[0],
        });
      } else if (farmerData.landTypeValue == '') {
        Toast.show({
          text: `${t('please_enter_plot_name_first')}`,
          ...AlertMesg[0],
        });
      } else if (farmerData.soilTypeValue == '') {
        Toast.show({
          text: `${t('please_select_soil_type_first')}`,
          ...AlertMesg[0],
        });
      } else if (farmerData.unitValue == '') {
        Toast.show({text: `${t('please_select_unit_first')}`, ...AlertMesg[0]});
      } else if (farmerData.land_size == '') {
        Toast.show({text: `${t('please_enter_unit')}`, ...AlertMesg[0]});
      } else if (locationArry.length == 0) {
        Toast.show({
          text: `${t('please_submit_location_first')}`,
          ...AlertMesg[0],
        });
      } else if (farmerData.productionSeasonValue == '') {
        Toast.show({
          text: `${t('please_select_cultiveting_season_first')}`,
          ...AlertMesg[0],
        });
      } else if (farmerData.livelihoodTypeValue == '') {
        Toast.show({
          text: `${t('please_select_crop_type_first')}`,
          ...AlertMesg[0],
        });
      } else if (farmerData.produceNameValue == '') {
        Toast.show({
          text: `${t('please_select_crop_name_first')}`,
          ...AlertMesg[0],
        });
      } else if (farmerData.produceVarietyValue == '') {
        Toast.show({
          text: `${t('please_select_crop_veriety_first')}`,
          ...AlertMesg[0],
        });
      } else if (farmerData.productionProcessValue == '') {
        Toast.show({
          text: `${t('please_select_production_system_first')}`,
          ...AlertMesg[0],
        });
      } else if (farmerData.expectedProduction == '') {
        Toast.show({text: `${t('please_give_yeild_size')}`, ...AlertMesg[0]});
      } else if (farmerData.unitProductValue == '') {
        Toast.show({text: `${t('please_select_yeild_unit')}`, ...AlertMesg[0]});
      } else if (farmerData.cycleStartDate == '') {
        Toast.show({text: 'Please Select Planting Date', ...AlertMesg[0]});
      } else if (farmerData.cycleEndDate == '') {
        Toast.show({text: `${t('select_enddate_first')}`, ...AlertMesg[0]});
      } else if (defaultLand == false) {
        Toast.show({text: 'Please set default unit', ...AlertMesg[0]});
      } else if (convertionLUState == true) {
        Toast.show({
          text: 'Please add the unit equivalent factor to default unit',
          ...AlertMesg[0],
        });
      } else {
        let land_convert_size_value = '';
        if (
          farmerData.unit_value == null ||
          farmerData.unit_value == '' ||
          farmerData.unit_value == undefined
        ) {
          land_convert_size_value = farmerData.land_size * 1;
        } else {
          land_convert_size_value =
            farmerData.land_size * farmerData.unit_value;
        }
        const latlongArrString = JSON.stringify(latlongArr);
        const formDataPlotImg = new FormData();
        const formdata = new FormData();
        formdata.append('plot_no', farmerData.plot_Site_Name);
        formdata.append('terrain_type_id', farmerData.terrainTypeValue);
        formdata.append('lan_type_id', farmerData.landTypeValue);
        formdata.append('soil_type_id', farmerData.soilTypeValue);
        formdata.append('land_unit_id', farmerData.unitValue);
        formdata.append('latitude', latlongArr[0]?.latitude);
        formdata.append('longitude', latlongArr[0]?.longitude);
        formdata.append('land_size', farmerData.land_size);
        formdata.append('land_convert_size', land_convert_size_value);
        formdata.append('crop_season_id', farmerData.productionSeasonValue);
        formdata.append('season_date_fid', farmerData.productionSeasonSdId);
        formdata.append('crop_type_id', farmerData.livelihoodTypeValue);
        formdata.append('crop_name_id', farmerData.produceNameValue);
        formdata.append('crop_variety_id', farmerData.produceVarietyValue);
        formdata.append('latlong_data', latlongArrString);
        formdata.append('user_id', user_id);
        formdata.append('daag_no', farmerData.daag_no);
        formdata.append('khatian_no', farmerData.khatian_no);
        formdata.append('plant_number', farmerData.plant_number);
        formdata.append('jl_no', farmerData.jl_no);
        formdata.append('mouja', farmerData.mouja);
        formdata.append('certified_seed', 'No');
        formdata.append('have_land_title', 'No');
        formdata.append('production_system', farmerData.productionProcessValue);
        formdata.append('have_fertilizer', 'Yes');
        formdata.append('buy_pesticide', 'Yes');
        formdata.append('yield_amount', farmerData.expectedProduction);
        formdata.append('yield_unit', farmerData.unitProductValue);
        formdata.append('sowing_date', farmerData.cycleStartDate);
        formdata.append('harvesting_date', farmerData.cycleEndDate);
        // formdata.append('google_area', farmerData.google_area);
        formdata.append('device_no', farmerData.IOTId);
        formdata.append('device_lat', farmerData.IOTLatlat);
        formdata.append('device_long', farmerData.IOTLatLong);
        if (farmerData.google_area > 0) {
          formdata.append('google_area', farmerData.google_area);
        } else {
          formdata.append('google_area', 0);
        }
        const filterAddressImage = addressProof.filter(
          item => item.name !== '',
        );
        const photoDeletedvalidValues = photoDeletedValue.filter(
          value => value !== undefined && value !== '',
        );
        let formDataDelete = qs.stringify({
          file_delete_ids: photoDeletedvalidValues?.toString(),
        });
        if (userData == 'addUserData' || addPlot == true) {
          addressProof.map((data, index) => {
            if (data.name != '' && data.id == '') {
              formdata.append('plot_image', data);
            }
          });
          // const AddLandCropDetails_res = await axiosPost(
          //   ROUTES.POST.ADD_LAND_CROP_DETAIL({}),
          //   formdata,
          //   token,
          //   false,
          //   { information: `${dbname},${lan_id},${user_id}` },
          // );
          const AddLandCropDetails_res = await AddLandCropDetailsAPI(
            dbname,
            lan_id,
            user_id,
            token,
            formdata,
            '',
            '',
          );
          if (AddLandCropDetails_res?.status === 200) {
            Toast.show({text: t('l_c_add_succ'), ...AlertMesg[0]});
            onTabPress(0);
            // setTimeout(() => {
            //   navigation.navigate('FarmerDashboard');
            // }, 2000);
          } else {
            Toast.show({
              text: AddLandCropDetails_res?.data?.error?.errorMessage,
              ...AlertMesg[0],
            });
          }
        } else {
          var cusCropCyclStartDate = '2004-02-29';
          if (harvested != '') {
            cusCropCyclStartDate = '2004-02-29';
          } else {
            // farmerData.cycleStartDate
            cusCropCyclStartDate = farmerData.crop_cycl_start_date;
          }
          let cusGooglearea = 0;
          if (
            farmerData?.google_area > 0 &&
            farmerData?.google_area != undefined &&
            farmerData?.google_area != 'null'
          ) {
            cusGooglearea = farmerData.google_area;
          } else {
            cusGooglearea = 0;
          }
          let dataToSend = {
            land_rel_id: farmerData.land_rel_id,
            user_id: user_id,
            plot_no: farmerData.plot_Site_Name,
            createdBy: user_id,
            daag_no: farmerData.daag_no,
            khatian_no: farmerData.khatian_no,
            plant_number: farmerData.plant_number,
            jl_no: farmerData.jl_no,
            mouja: farmerData.mouja,
            terrain_type_id: farmerData.terrainTypeValue,
            lan_type_id: farmerData.landTypeValue,
            soil_type_id: farmerData.soilTypeValue,
            land_unit_id: farmerData.unitValue,
            land_size: farmerData.land_size,
            land_convert_size: land_convert_size_value,
            latitude: latlongArr[0]?.latitude,
            longitude: latlongArr[0]?.longitude,
            status: 1,
            crop_season_id: farmerData.productionSeasonValue,
            season_date_fid: farmerData.productionSeasonSdId,
            crop_type_id: farmerData.livelihoodTypeValue,
            crop_name_id: farmerData.produceNameValue,
            crop_variety_id: farmerData.produceVarietyValue,
            sowing_date: farmerData.cycleStartDate,
            harvesting_date: farmerData.cycleEndDate,
            is_primary: 0,
            certified_seed: 'No',
            have_land_title: 'No',
            production_system: farmerData.productionProcessValue,
            have_fertilizer: 'Yes',
            buy_pesticide: 'Yes',
            yield_amount: farmerData.expectedProduction,
            yield_unit: farmerData.unitProductValue,
            // crop_cycl_start_date: cusCropCyclStartDate,
            // crop_cycl_start_date: farmerData.cycleStartDate,
            latlong_data: latlongArrString,
            google_area: cusGooglearea,
            plot_image: filterAddressImage,
            device_no: farmerData.IOTId,
            device_lat: farmerData.IOTLatlat,
            device_long: farmerData.IOTLatLong,
          };
          if (cusCropCyclStartDate) {
            dataToSend.crop_cycl_start_date = cusCropCyclStartDate;
          }
          let save_data = qs.stringify(dataToSend);
          let updateLandCropdetails_res = {};

          if (!historyData) {
            updateLandCropdetails_res = await axiosPut(
              ROUTES.PUT.UPDATE_LAND_CROP_DETAILS({
                land_rel_id: farmerData.land_rel_id,
                crop_rel_id: farmerData.cu_rel_id,
              }),
              dataToSend,
              token,
              true,
              {information: `${dbname},${lan_id},${user_id}`},
            );
          } else {
            console.log(
              '---------------- ADD CROP INPUT API RESPONSE ----------------',
            );
            console.log(JSON.stringify(cropInputRes, null, 2));
          }
          let save_extradata = qs.stringify({
            final_yield_qty: farmerData.final_yield_qty,
            final_yield_unit: farmerData.final_yield_unit,
            plantation_method: farmerData.plantation_method,
            seeding_date: farmerData.seeding_date,
            water_source: farmerData.water_source,
            gap_seeding_firrig: Number(farmerData.gap_seeding_firrig),
            irri_practice: farmerData.irri_practice,
            drying_period_prac: farmerData.drying_period_prac,
            gap_draining_harvest: Number(farmerData.gap_draining_harvest),
            after_harvest_rice_stubble: farmerData.after_harvest_rice_stubble,
            after_harvest_straw: farmerData.after_harvest_straw,
            straw_removed: farmerData.straw_removed,
            straw_incorporate: farmerData.straw_incorporate,
            end_usg_rm_straw: farmerData.end_usg_rm_straw,
          });
          var [setCycleDate] = await Promise.all([
            axiosPut(
              ROUTES.PUT.SET_CYCLE_DATE({cuRelID: farmerData.cu_rel_id}),
              save_extradata,
              token,
              false,
              {
                information: `${dbname},${lan_id},${user_id}`,
                'Content-Type': 'application/x-www-form-urlencoded',
              },
            ),
            // setCycleDateAPI(
            //   dbname,
            //   lan_id,
            //   user_id,
            //   token,
            //   farmerData.cu_rel_id,
            //   save_extradata,
            // ),
          ]);

          const finalPayload = formatAmendmentPayload(
            allItems,
            farmerData.cu_rel_id,
          );

          // UpdateLandCropdetailsAPI(
          //   dbname,
          //   lan_id,
          //   user_id,
          //   token,
          //   save_data,
          //   farmerData.land_rel_id,
          //   farmerData.cu_rel_id,
          // );
          // if (filterAddressImage.length != 0) {
          addressProof.map((data, index) => {
            if (data.name != '' && data.value == 1) {
              formDataPlotImg.append('plot_image', data);
            }
          });
          formDataPlotImg.append('rel_id', farmerData.land_rel_id);
          const [deletePlotImageAPIRes, addPlotImageAPIRes, cropInputRes] =
            await Promise.all([
              deletePlotImageAPI(dbname, lan_id, token, formDataDelete),
              addPlotImageAPI(dbname, lan_id, token, user_id, formDataPlotImg),

              axiosPost(
                ROUTES.POST.ADD_CROP_INOUT,
                finalPayload,
                token,
                false,
                {
                  information: `${dbname},${lan_id},${user_id}`,
                },
              ),
              // addCropInputAPI(dbname, lan_id, token, user_id, finalPayload),
            ]);

          if (addPlotImageAPIRes.data?.error?.errorCode == 400) {
            Alert.alert(
              'File',
              addPlotImageAPIRes.data?.error?.errorMessage,
              [{text: 'OK', onPress: () => console.log(area)}],
              {cancelable: false},
            );
            setIsLoading(false);
            return;
          }
          if (
            statuslevel.label == 'REJECTED' ||
            statuslevel.label == 'PENDING'
          ) {
            const formdatauploadFarmerIdAdd = new FormData();
            if (identityProofIdentityPropf[0]?.uri != '') {
              const {uri, type, name} = identityProofIdentityPropf[0];
              formdatauploadFarmerIdAdd.append('farmer_address', {
                uri,
                type,
                name,
              });
            }
            if (identityProofIdentityPropf[1]?.id == '') {
              const {uri, type, name} = identityProofIdentityPropf[1];
              formdatauploadFarmerIdAdd.append('farmer_identity', {
                uri,
                type,
                name,
              });
            }
            formdatauploadFarmerIdAdd.append('rel_id', farmerData.land_rel_id);
            formdatauploadFarmerIdAdd.append('user_id', user_id);
            const resOocUpdate = await uploadFarmerIdAdd(
              dbname,
              lan_id,
              user_id,
              token,
              formdatauploadFarmerIdAdd,
            );
            if (resOocUpdate?.status != 200) {
              Toast.show({
                text: resOocUpdate?.data?.error?.errorMessage,
                ...AlertMesg[0],
              });
            }
          }
          if (
            statuslevel.label == 'APPROVED' ||
            statuslevel.label == 'PENDING' ||
            (statuslevel.label == 'CARBON_DOCUMENTS_REJECTED' &&
              carbonFlag == true)
          ) {
            let hasCarbonAgreement = false;
            let hasSignature = false;
            const formdataCarbon = new FormData();
            formdataCarbon.append('rel_id', farmerData.land_rel_id);
            if (
              carboncertificate[0]?.id != undefined &&
              carboncertificate[0]?.id == '' &&
              carboncertificate[0].uri != ''
            ) {
              formdataCarbon.append('carbon_agreement', carboncertificate[0]);
              hasCarbonAgreement = true;
            }

            if (
              signature?.id != undefined &&
              signature?.id == '' &&
              signature.uri != ''
            ) {
              hasSignature = true;
              formdataCarbon.append('signature', signature);
            }

            if (hasSignature || hasCarbonAgreement) {
              if (!historyData) {
                const carbonRes = await axiosPost(
                  ROUTES.POST.UP_CARBON_AGR_DOC,
                  formdataCarbon,
                  token,
                  false,
                  {
                    information: `${dbname},${lan_id},${user_id}`,
                  },
                );

                // uploadCarbonAgrDocs(
                //   dbname,
                //   lan_id,
                //   token,
                //   user_id,
                //   formdataCarbon,
                // );
              }
            }
          }
          if (!historyData) {
            if (updateLandCropdetails_res?.status === 200) {
              removesetLocation();

              Toast.show({text: t('l_c_update_succ'), ...AlertMesg[0]});
              onTabPress(0);
              // setTimeout(() => {
              //   navigation.navigate('FarmerDashboard');
              // }, 2000);
            } else {
              setIsLoading(false);
              Toast.show({
                text: updateLandCropdetails_res?.data?.error?.errorMessage,
                ...AlertMesg[0],
              });
            }
          } else {
            if (cropInputRes?.status === 200) {
              removesetLocation();
              Toast.show({text: t('l_c_update_succ'), ...AlertMesg[0]});
              onTabPress(0);
            } else {
              setIsLoading(false);
              Toast.show({
                text: cropInputRes?.data?.error?.errorMessage,
                ...AlertMesg[0],
              });
            }
          }
          setIsLoading(false);
        }
      }
    } catch (error) {
      console.log('eeeeeeerrr', error);
      Toast.show({
        text: error,
        ...AlertMesg[0],
      });
    }
  }, [
    farmerData,
    location,
    carboncertificate,
    signature,
    addressProof,
    identityProofIdentityPropf,
    allItems,
  ]);
  useEffect(() => {
    if (plotSiteUserLandDetails.length != 0) {
      if (dataProps?.plot_no != undefined) {
        handlePlot({
          label: dataProps?.plot_no,
          value: dataProps?.rel_id,
          latitude: dataProps?.latitude,
          longitude: dataProps?.longitude,
        });
      }
    }
  }, [plotSiteUserLandDetails]);
  const handlePlot = useCallback(
    async findData => {
      setIsLoading(true);
      setHarvested('');
      setPhotoDeletedValue([]);
      setPlotEdit(true);
      let locationLength = 0;
      const [
        productSeasonresRes,
        cropAndPlotDetails,
        getPlotDoc,
        nearestLatLong_res,
      ] = await Promise.all([
        axiosGet(
          ROUTES.GET.PRODUCTION_SEASON({
            lanId: lan_id,
            crop_type_id: '',
            crop_name_id: '',
          }),
          '',
          {information: `${dbname},${lan_id}`},
        ),
        // // ProductionSeasonAndApi(dbname, lan_id, ''),

        axiosGet(
          ROUTES.GET.PROBLEM_PRODUCE_AGAINST_PLOT({
            relID: findData.value,
          }),
          '', // No authorization token needed
          {
            information: `${dbname},${lan_id},${user_id}`,
          },
        ),
        // livelihoodCropAndPlotDetailsAPI(
        //   dbname,
        //   lan_id,
        //   user_id,
        //   findData.value,
        // ),

        axiosGet(
          ROUTES.GET.GET_PLOT_DOC({
            plotId: findData.value,
          }),
          token,
          {
            information: `${dbname},${lan_id},${user_id}`,
          },
        ),
        // getPlotDocAPI(dbname, lan_id, token, user_id, findData.value),

        axiosPost(
          ROUTES.POST.NEAREST_LATLONG,
          {
            latitude: findData?.latitude,
            longitude: findData?.longitude,
            distance: 200,
            data_limit: 100,
          },
          token,
          false,
          {
            information: `${dbname},${lan_id}`,
          },
        ),
        // nearestLatLong(
        //   dbname,
        //   lan_id,
        //   token,
        //   findData?.latitude,
        //   findData?.longitude,
        // ),
      ]);

      setPlotId(findData.value);
      console.log('');
      if (getPlotDoc?.status == 200) {
        //basudev
        const {count} = getPlotDoc?.data;
        const {plot_img, landUserImgs} = getPlotDoc?.data?.rows[0] || {};
        const values = [...addressProof];
        const carbonCertificateValues = [...carboncertificate];
        const filteredPlotImages = plot_img.filter(
          item => item.term_type === 'plot_image',
        );
        const filteredCarbonAgreement = plot_img.filter(
          item => item.term_type === 'carbon_agreement',
        );
        const filteredSignature = plot_img.filter(
          item => item.term_type === 'signature',
        );

        if (filteredSignature.length > 0) {
          setSignature(prev => ({
            ...prev,
            uri: filteredSignature[filteredSignature.length - 1]?.file_path,
            name: filteredSignature[filteredSignature.length - 1]?.file_name,
            type: filteredSignature[filteredSignature.length - 1]?.file_ext,
            fileName:
              filteredSignature[filteredSignature.length - 1]?.file_name,
            id: filteredSignature[filteredSignature.length - 1]?.file_id,
          }));
        }
        // addressProof.map((_data, _index) => {
        //   if (filteredPlotImages[_index] !== undefined && count > 0) {
        //     values[_index] = {
        //       uri: filteredPlotImages[_index]?.file_path,
        //       name: filteredPlotImages[_index]?.file_name,
        //       type: filteredPlotImages[_index]?.file_ext,
        //       fileName: filteredPlotImages[_index]?.file_name,
        //       id: filteredPlotImages[_index]?.file_id,
        //     };
        //   } else {
        //     values[_index] = {
        //       uri: '',
        //       name: '',
        //       type: '',
        //       fileName: '',
        //       id: '',
        //     };
        //   }
        // });

        const plotImagesFromApi = filteredPlotImages.map(item => ({
          uri: item.file_path,
          name: item.file_name,
          type: item.file_ext,
          fileName: item.file_name,
          id: item.file_id,
        }));

        const MIN_BOX = 5;

        if (plotImagesFromApi.length < MIN_BOX) {
          const emptyCount = MIN_BOX - plotImagesFromApi.length;
          for (let i = 0; i < emptyCount; i++) {
            plotImagesFromApi.push({
              uri: '',
              name: '',
              type: '',
              fileName: '',
              id: '',
            });
          }
        }
        carboncertificate.map((_data, _index) => {
          if (filteredCarbonAgreement[_index] !== undefined && count > 0) {
            carbonCertificateValues[_index] = {
              uri: filteredCarbonAgreement[filteredCarbonAgreement.length - 1]
                ?.file_path,
              name: filteredCarbonAgreement[filteredCarbonAgreement.length - 1]
                ?.file_name,
              type: filteredCarbonAgreement[filteredCarbonAgreement.length - 1]
                ?.file_ext,
              fileName:
                filteredCarbonAgreement[filteredCarbonAgreement.length - 1]
                  ?.file_name,
              id: filteredCarbonAgreement[filteredCarbonAgreement.length - 1]
                ?.file_id,
            };
          } else {
            carbonCertificateValues[_index] = {
              uri: '',
              name: '',
              type: '',
              fileName: '',
              id: '',
            };
          }
        });
        setCarboncertificate(carbonCertificateValues);
        setAddressProof(plotImagesFromApi);
        const filterLandUserImgsAddress = landUserImgs.filter(
          item => item.term_type === 'farmer_address',
        );
        const filterLandUserImgsIdentity = landUserImgs.filter(
          item => item.term_type === 'farmer_identity',
        );
        setIdentityProofIdentityPropf([
          {
            uri: filterLandUserImgsAddress?.[0]?.file_path || '',
            name: filterLandUserImgsAddress?.[0]?.file_name || '',
            type: filterLandUserImgsAddress?.[0]?.file_ext || '',
            fileName: filterLandUserImgsAddress?.[0]?.file_name || '',
            imageType: 'address',
            file_path: filterLandUserImgsAddress?.[0]?.file_path || '',
            file_id: filterLandUserImgsAddress?.[0]?.file_id || '',
            id: filterLandUserImgsAddress?.[0]?.file_id || '',
          },
          {
            uri: filterLandUserImgsIdentity?.[0]?.file_path || '',
            name: filterLandUserImgsIdentity?.[0]?.file_name || '',
            type: filterLandUserImgsIdentity?.[0]?.file_ext || '',
            fileName: filterLandUserImgsIdentity?.[0]?.file_name || '',
            imageType: 'identity',
            file_path: filterLandUserImgsIdentity?.[0]?.file_path || '',
            file_id: filterLandUserImgsIdentity?.[0]?.file_id || '',
            id: filterLandUserImgsIdentity?.[0]?.file_id || '',
          },
        ]);
      }

      if (cropAndPlotDetails?.status === 200) {
        // if (cropAndPlotDetails.data.data.count != 0) {
        const data = cropAndPlotDetails?.data?.data;
        plotSiteUserLandDetails.map(async (dataLandDetails, index) => {
          if (dataLandDetails?.rel_id == findData.value) {
            if (
              dataLandDetails?.status_level == 'APPROVED' ||
              // dataLandDetails?.status_level == 'CARBON_DOCUMENTS_SUBMITTED' ||
              dataLandDetails?.status_level == 'CARBON_DOCUMENTS_APPROVED' ||
              dataLandDetails?.status_level == 'CARBON_DOCUMENTS_REJECTED'
            ) {
              Alert.alert(
                'Note',
                'You will not be able to edit Geo Locations, Plot/Site Size and Land Record Documents.',
                [{text: 'OK', onPress: () => console.log('OK Pressed')}],
                {cancelable: false},
              );
            }
            setplotStatus(prev => ({
              ...prev,
              label: dataLandDetails?.plot_status,
              value: dataLandDetails?.plot_status,
            }));
            setstatuslevel({
              label: dataLandDetails?.status_level,
              value: dataLandDetails?.status_level,
            });
            if (!historyData) {
              if (new Date() < new Date(data.harvesting_date) != true) {
                setModalVisible(true);
                setOutofRange(false);
              } else {
                setEdit(true);
              }
            }
            // if (
            //   new Date(data.sowing_date) < new Date(data.harvesting_date) !=
            //   true
            // ) {
            // if (new Date() < new Date(data.harvesting_date) != true) {
            //   setModalVisible(true);
            //   setOutofRange(false);
            // } else {
            //   setEdit(true);
            // }
            // setArea(data.land_info?.google_area);
            if (landUnitsquareMetre?.[0]?.defined_unit_value) {
              setArea(
                Number(landUnitsquareMetre?.[0]?.defined_unit_value) *
                  Number(data.land_info?.google_area),
              );
            } else {
              setArea(data.land_info?.google_area);
            }
            if (historyData) {
              setFarmerData(prev => ({
                ...prev,
                createdBy: user_id,
                plot_no: data?.land_info?.plot_no,
                cu_rel_id: dataProps?.plot_crops[0]?.cu_rel_id,
                land_rel_id: findData?.value,
                daag_no: dataLandDetails?.daag_no,
                khatian_no: dataLandDetails?.khatian_no,
                plant_number: dataLandDetails?.plant_number,
                jl_no: dataLandDetails?.jl_no,
                mouja: dataLandDetails?.mouja,
                land_size: dataLandDetails?.land_size,
                plot_Site: findData?.value,
                plot_Site_Name: findData?.label,

                expectedProduction: dataProps?.plot_crops[0]?.yield_amount,
                cycleStartDate: dataProps?.plot_crops[0]?.sowing_date,
                cycleEndDate:
                  dataProps?.plot_crops[0]?.harvesting_date.substring(-1, 10),

                terrainType: dataLandDetails?.terrain_type?.name,
                terrainTypeValue: dataLandDetails?.terrain_type?.fid,
                landType: dataLandDetails?.lan_type?.name,
                landTypeValue: dataLandDetails?.lan_type?.fid,
                soilType: dataLandDetails?.soil_type?.name,
                soilTypeValue: dataLandDetails?.soil_type?.fid,
                unit: dataLandDetails?.land_unit?.name,
                unitValue: dataLandDetails?.land_unit?.fid,

                productionSeason: `${
                  dataProps?.plot_crops[0]?.cropSeasonTime?.season_info?.name
                }${
                  dataProps?.plot_crops[0]?.cropSeasonTime?.year
                    ? '(' + dataProps?.plot_crops[0]?.cropSeasonTime?.year + ')'
                    : ''
                }`,

                productionSeasonValue:
                  dataProps?.plot_crops[0]?.cropSeasonTime?.season_fid,
                productionSeasonSdId:
                  dataProps?.plot_crops[0]?.cropSeasonTime?.sd_id,
                livelihoodType: dataProps?.plot_crops[0]?.crop_type?.name,
                livelihoodTypeValue: dataProps?.plot_crops[0]?.crop_type?.fid,
                produceName: dataProps?.plot_crops[0]?.crop_name?.name,
                produceNameValue: dataProps?.plot_crops[0]?.crop_name?.fid,
                produceVariety: dataProps?.plot_crops[0]?.crop_variety?.name,
                produceVarietyValue:
                  dataProps?.plot_crops[0]?.crop_variety?.fid,
                productionProcess:
                  dataProps?.plot_crops[0]?.farmer_production_system?.name,
                productionProcessValue:
                  dataProps?.plot_crops[0]?.farmer_production_system?.fid,
                unitProduct:
                  dataProps?.plot_crops[0]?.agri_unit &&
                  dataProps?.plot_crops[0]?.agri_unit?.unit_name,
                unitProductValue:
                  dataProps?.plot_crops[0]?.agri_unit &&
                  dataProps?.plot_crops[0]?.agri_unit?.fid,
                unit_value: dataLandDetails?.land_unit?.unit_value,

                final_yield_qty: dataProps?.plot_crops[0]?.final_yield_qty,
                final_yield_unit: dataProps?.plot_crops[0]?.final_yield_unit,
                plantation_method: dataProps?.plot_crops[0]?.plantation_method,
                seeding_date: dataProps?.plot_crops[0]?.seeding_date,
                water_source: dataProps?.plot_crops[0]?.water_source,
                gap_seeding_firrig: String(
                  dataProps?.plot_crops[0]?.gap_seeding_firrig ?? '',
                ),
                irri_practice: dataProps?.plot_crops[0]?.irri_practice,
                drying_period_prac:
                  dataProps?.plot_crops[0]?.drying_period_prac,
                gap_draining_harvest: String(
                  dataProps?.plot_crops[0]?.gap_draining_harvest ?? '',
                ),
                after_harvest_rice_stubble:
                  dataProps?.plot_crops[0]?.after_harvest_rice_stubble,
                after_harvest_straw:
                  dataProps?.plot_crops[0]?.after_harvest_straw,
                straw_removed: dataProps?.plot_crops[0]?.straw_removed,
                straw_incorporate: dataProps?.plot_crops[0]?.straw_incorporate,
                end_usg_rm_straw: dataProps?.plot_crops[0]?.end_usg_rm_straw,

                unit_value: dataLandDetails?.land_unit?.unit_value,
                google_area: data.land_info?.google_area,
                IOTId: data.land_info?.device_no,
                IOTLatlat: data.land_info?.device_lat,
                IOTLatLong: data.land_info?.device_long,
                // crop_cycl_start_date: dataProps.crop_cycl_start_date,
                ConvertedreportedLandsize:
                  Number(dataLandDetails?.land_unit?.defined_unit_value) *
                  Number(dataLandDetails?.land_size),
              }));

              fetchAndGroupPestDetails(dataProps?.plot_crops[0]?.cu_rel_id);
            } else {
              setFarmerData(prev => ({
                ...prev,
                createdBy: owner?.user_id,
                plot_no: data?.land_info?.plot_no,
                cu_rel_id: data?.cu_rel_id,
                land_rel_id: findData?.value,
                daag_no: dataLandDetails?.daag_no,
                khatian_no: dataLandDetails?.khatian_no,
                plant_number: dataLandDetails?.plant_number,
                jl_no: dataLandDetails?.jl_no,
                mouja: dataLandDetails?.mouja,
                land_size: dataLandDetails?.land_size,
                plot_Site: findData?.value,
                plot_Site_Name: findData?.label,
                expectedProduction: data?.yield_amount,
                cycleStartDate: data?.sowing_date,
                cycleEndDate: data?.harvesting_date.substring(-1, 10),
                terrainType: dataLandDetails?.terrain_type?.name,
                terrainTypeValue: dataLandDetails?.terrain_type?.fid,
                landType: dataLandDetails?.lan_type?.name,
                landTypeValue: dataLandDetails?.lan_type?.fid,
                soilType: dataLandDetails?.soil_type?.name,
                soilTypeValue: dataLandDetails?.soil_type?.fid,
                unit: dataLandDetails?.land_unit?.name,
                unitValue: dataLandDetails?.land_unit?.fid,
                productionSeason: `${data?.crop_season?.name}  ${
                  data?.cropSeasonTime?.year
                    ? '(' + data?.cropSeasonTime?.year + ')'
                    : ''
                }`,
                productionSeasonValue: data?.crop_season?.fid,
                productionSeasonSdId: data?.season_date_fid,
                livelihoodType: data?.crop_type?.name,
                livelihoodTypeValue: data?.crop_type?.fid,
                produceName: data?.crop_name?.name,
                produceNameValue: data?.crop_name?.fid,
                produceVariety: data?.crop_variety?.name,
                produceVarietyValue: data?.crop_variety?.fid,
                productionProcess: data?.farmer_production_system?.name,
                productionProcessValue: data?.farmer_production_system?.fid,
                unitProduct: data?.agri_unit?.unit_name,
                unitProductValue: data?.agri_unit?.fid,
                unit_value: dataLandDetails?.land_unit?.unit_value,
                google_area: data.land_info?.google_area,
                IOTId: data.land_info?.device_no,
                IOTLatlat: data.land_info?.device_lat,
                IOTLatLong: data.land_info?.device_long,
                crop_cycl_start_date: data.crop_cycl_start_date,
                ConvertedreportedLandsize:
                  Number(dataLandDetails?.land_unit?.defined_unit_value) *
                  Number(dataLandDetails?.land_size),

                final_yield_qty: data?.final_yield_qty,
                final_yield_unit: data?.final_yield_unit,
                plantation_method: data?.plantation_method,
                seeding_date: data?.seeding_date,
                water_source: data?.water_source,
                gap_seeding_firrig: String(data?.gap_seeding_firrig ?? ''),
                irri_practice: data?.irri_practice,
                drying_period_prac: data?.drying_period_prac,
                gap_draining_harvest: String(data?.gap_draining_harvest ?? ''),
                after_harvest_rice_stubble: data?.after_harvest_rice_stubble,
                after_harvest_straw: data?.after_harvest_straw,
                straw_removed: data?.straw_removed,
                straw_incorporate: data?.straw_incorporate,
                end_usg_rm_straw: data?.end_usg_rm_straw,
              }));
              fetchAndGroupPestDetails(data?.cu_rel_id);
            }
            const seasonData = await axiosGet(
              ROUTES.GET.PRODUCE_SEASON({
                crop_name_fid: data?.crop_name?.fid,
                sd_id: '',
              }),
              '',
              {
                information: `${dbname},${lan_id},${user_id}`,
                Authorization: `${token}`,
              },
            );
            let prodctionSeasionArray = [];
            if (seasonData?.status === 200) {
              prodctionSeasionArray = seasonData?.data?.data?.rows?.map(
                data => ({
                  value: data.season_info.fid,
                  label: `${data.season_info.name} (${data.year})`,
                  sd_id: data.sd_id, // NEW FIELD - stores season detail ID
                  year: data.year,
                  originalName: data.season_info.name,
                }),
              );
            }
            setProductionSeason(prodctionSeasionArray);
            return;
          }
        });

        const agri_land_user_latlongs = data.land_info.agri_land_user_latlongs;

        const values = [...location];
        if (values.length < agri_land_user_latlongs.length) {
          values[0] = {
            latitude: plotSiteUserLandDetails[0]?.latitude,
            longitude: plotSiteUserLandDetails[0]?.longitude,
          };
          agri_land_user_latlongs.map((data, index) => {
            locationLength = index;
            if (data?.latitude != '') {
              values[index] = {
                latitude: data?.latitude,
                longitude: data?.longitude,
              };
            }
          });
          setLocation(values);
          setmainLocation(values);
          setPreviousPlotLatlong(values);
          if (locationLength >= 2 == true) {
            // GRQ-1131
            // setPolygons([convertedArrayLatLong(values)]);

            const parsedTargetArray = values.map(item => ({
              latitude: parseFloat(item.latitude),
              longitude: parseFloat(item.longitude),
            }));
            const index = nearPolSet.findIndex(
              subArray =>
                JSON.stringify(subArray) === JSON.stringify(parsedTargetArray),
            );
            if (index !== -1) {
              const [foundArray] = nearPolSet.splice(index, 1);
              nearPolSet.push(foundArray);
            }
            setPolygons(nearPolSet);
          } else {
            // GRQ-1131
            // setPolygons([]);
            setPolygons(nearPolSet);
          }
          setLocationType('api_lication');
        } else {
          const values = [];
          values[0] = {
            latitude: plotSiteUserLandDetails[0]?.latitude,
            longitude: plotSiteUserLandDetails[0]?.longitude,
          };
          location.map((locationData, index) => {
            if (agri_land_user_latlongs[index] != undefined) {
              locationLength = index;
              values[index] = {
                latitude: agri_land_user_latlongs[index]?.latitude,
                longitude: agri_land_user_latlongs[index]?.longitude,
              };
            } else {
              if (agri_land_user_latlongs[0] == undefined) {
                values[index + 1] = {latitude: '', longitude: ''};
              } else {
                values[index] = {latitude: '', longitude: ''};
              }
            }
          });
          setLocation(values);
          setmainLocation(values);
          setPreviousPlotLatlong(values);
          if (locationLength >= 2 == true) {
            // GRQ-1131
            // setPolygons([convertedArrayLatLong(values)]);

            const parsedTargetArray = values.map(item => ({
              latitude: parseFloat(item.latitude),
              longitude: parseFloat(item.longitude),
            }));

            // Find the index of the target array in mainArray
            const index = nearPolSet.findIndex(
              subArray =>
                JSON.stringify(subArray) === JSON.stringify(parsedTargetArray),
            );

            // If found, move it to the last index
            if (index !== -1) {
              const [foundArray] = nearPolSet.splice(index, 1); // Remove it from current position
              nearPolSet.push(foundArray); // Add it at the last index
            }
            setPolygons(nearPolSet);
          } else {
            // GRQ-1131
            // setPolygons([]);
            setPolygons(nearPolSet);
          }
          setLocationType('api_lication');
        }
        //basudev out of range
        if (agri_land_user_latlongs.length > 1) {
          const {latitude, longitude} = coords;
          const is20Meters = isWithin20Meters(
            {latitude, longitude},
            agri_land_user_latlongs,
            40,
          );
          if (is20Meters?.length !== 0) {
            setOutofRange(false);
          } else {
            setOutofRange(true);
          }
        } else {
          setOutofRange(false);
        }
        // }
        setIsLoading(false);
        location.map((data, index) => {
          // console.log("data")
          // console.log(data)
        });
      }
      if (productSeasonresRes?.status === 200) {
        const productSeasonresResArr = [];
        const livelihoodTypeArr = [];
        productSeasonresRes.data.data?.crop_season?.map((data, index) => {
          productSeasonresResArr.push({value: data.fid, label: data.name});
        });
        productSeasonresRes.data.data?.crop_type?.map((data, index) => {
          livelihoodTypeArr.push({value: data.fid, label: data.name});
        });
        // setProductionSeason(productSeasonresResArr);
        setLivelihoodType(livelihoodTypeArr);
      }
    },
    [farmerData, plotSiteUserLandDetails],
  );
  const handleUserData = async () => {
    setOutofRange(false);
    setUserData('addUserData');
    setAddPlot(true);
    setEdit('');
    RemoveFarmerData();
    // setPolygons([]);
    setPolygons(nearPolSet);
    removesetLocation();
    setPreviousPlotLatlong([]);
    setArea(0);
    setPlotEdit(true);
    setstatuslevel({label: '', value: ''});
    setplotStatus({label: '', value: ''});
  };
  const handleAddUserData = (name, data) => {
    setFarmerData(prev => ({...prev, [`${name}`]: data}));
  };
  const handleAddUserDataland_size = useCallback(
    text => {
      setFarmerData(prev => ({
        ...prev,
        land_size: text,
        ConvertedreportedLandsize: Number(prev.unit_value) * Number(text),
      }));
    },
    [farmerData.unit],
  );
  const handleAddDataUnit = useCallback(
    item => {
      const {label, value} = item;
      let selectUnitValue = '';
      if (farmerData.unit_valueArr != '') {
        JSON.parse(farmerData.unit_valueArr).map((data, index) => {
          if (item.value === data?.fid) {
            selectUnitValue = data.unit_value;
          }
        });
      }
      setFarmerData(prev => ({
        ...prev,
        unitValue: value,
        // unitProduct: label,
        unitProductValue: value,
        ['unit_value']: selectUnitValue,
        ConvertedreportedLandsize:
          Number(selectUnitValue) * Number(farmerData.land_size),
      }));
    },
    [farmerData.land_size],
  );
  const handleAddUserDataPlot = useCallback(text => {
    setFarmerData(prev => ({...prev, ['plot_Site_Name']: text}));
  }, []);
  const handleAddUserDataDaag = useCallback(text => {
    setFarmerData(prev => ({...prev, ['daag_no']: text}));
  }, []);
  const handleAddUserDataKKhatian = useCallback(text => {
    setFarmerData(prev => ({...prev, ['khatian_no']: text}));
  }, []);
  const handleAddUserDataPlanNumber = useCallback(text => {
    setFarmerData(prev => ({...prev, ['plant_number']: text}));
  }, []);
  const handleAddUserDataJLNo = useCallback(text => {
    setFarmerData(prev => ({...prev, ['jl_no']: text}));
  }, []);
  const handleAddUserDataMouja = useCallback(text => {
    setFarmerData(prev => ({...prev, ['mouja']: text}));
  }, []);
  const handleAddUserDataYield = useCallback(text => {
    setFarmerData(prev => ({...prev, ['yield']: text}));
  }, []);
  const handleAddUserDataPlantationMethod = useCallback(text => {
    setFarmerData(prev => ({...prev, ['plantation_method']: text}));
  }, []);

  const handleAddUserDataWaterSource = useCallback(text => {
    setFarmerData(prev => ({...prev, ['water_source']: text}));
  }, []);
  const handleAddUserDataGapSeedingFirrig = useCallback(text => {
    if (text === '' || numericRegex.test(text)) {
      setFarmerData(prev => ({...prev, ['gap_seeding_firrig']: text}));
    }
  }, []);
  const handleAddUserDataIrriPractice = useCallback(text => {
    setFarmerData(prev => ({...prev, ['irri_practice']: text}));
  }, []);

  const handleAddUserDataDryingPeriodPrac = useCallback(text => {
    setFarmerData(prev => ({...prev, ['drying_period_prac']: text}));
  }, []);
  const handleAddUserDataGapDrainingHarvest = useCallback(text => {
    if (text === '' || numericRegex.test(text)) {
      setFarmerData(prev => ({...prev, ['gap_draining_harvest']: text}));
    }
  }, []);
  const handleAddUserDataAfterHarvestRiceStubble = useCallback(text => {
    setFarmerData(prev => ({...prev, ['after_harvest_rice_stubble']: text}));
  }, []);
  const handleAddUserDataAfterHarvestStraw = useCallback(text => {
    setFarmerData(prev => ({...prev, ['after_harvest_straw']: text}));
  }, []);

  const handleAddUserDataStrawRemoved = useCallback(text => {
    if (text === '' || numericRegex.test(text)) {
      setFarmerData(prev => ({...prev, ['straw_removed']: text}));
    }
  }, []);
  const handleAddUserDataStrawIncorporate = useCallback(text => {
    if (text === '' || numericRegex.test(text)) {
      setFarmerData(prev => ({...prev, ['straw_incorporate']: text}));
    }
  }, []);
  const handleAddUserDataEndUsgRmStraw = useCallback(text => {
    setFarmerData(prev => ({...prev, ['end_usg_rm_straw']: text}));
  }, []);

  const handleAddDataYieldUnitProduct = useCallback(text => {
    if (text === '' || numericRegex.test(text)) {
      setFarmerData(prev => ({...prev, ['expectedProduction']: text}));
    }
  }, []);
  const handleAddUserDataFinalYield = useCallback(text => {
    // Allow empty string (for backspace)
    if (text === '' || numericRegex.test(text)) {
      setFarmerData(prev => ({
        ...prev,
        final_yield_qty: text,
      }));
    }
  }, []);
  const handleAddUserDataFinalYieldUnit = useCallback(text => {
    setFarmerData(prev => ({...prev, ['final_yield_unit']: text}));
  }, []);
  const handleAddDataTerrainType = useCallback(item => {
    const {label, value} = item;
    setFarmerData(prev => ({
      ...prev,
      terrainType: label,
      terrainTypeValue: value,
    }));
    livelihoodTypeAPI(dbname, lan_id, value, '');
  }, []);
  const handleAddDataLandType = useCallback(item => {
    const {label, value} = item;
    setFarmerData(prev => ({
      ...prev,
      landType: label,
      landTypeValue: value,
    }));
  }, []);
  const handleAddDataSoilType = useCallback(item => {
    const {label, value} = item;
    setFarmerData(prev => ({
      ...prev,
      soilType: label,
      soilTypeValue: value,
    }));
  }, []);
  const HandlerGoBack = () => {
    navigation.navigate('FarmerDashboard');
  };
  // GRQ-1130
  const [polygons, setPolygons] = useState([]);
  const [newPolygon, setNewPolygon] = useState([]);
  const [editing, setEditing] = useState(false);
  const [area, setArea] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const handleMapPress = event => {
    if (!editing) return;
    if (
      ![
        'APPROVED',
        // 'CARBON_DOCUMENTS_SUBMITTED',
        'CARBON_DOCUMENTS_APPROVED',
        'CARBON_DOCUMENTS_REJECTED',
      ].includes(statuslevel.label)
    ) {
      const {latitude, longitude} = event.nativeEvent.coordinate;
      const groupedData = groupByRelId(nearPolData);
      setNewPolygon([...newPolygon, {latitude, longitude, editing: true}]);
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
        closedPolygon.map(p => [p.longitude, p.latitude]),
      ]);
      const newFilterPoligon = polygons.filter(_item => _item.length > 2);
      newFilterPoligon.forEach(poly => {
        const existingGeo = turf.polygon([
          [...poly, poly[0]].map(p => [p.longitude, p.latitude]),
        ]);
        if (
          turf.booleanOverlap(existingGeo, newGeo) ||
          turf.booleanWithin(newGeo, existingGeo)
        ) {
          overlapFound = true;
        }
      });
      // setPolygons([newPolygon]);

      if (!overlapFound) {
        setPolygons([...nearPolSet, newPolygon]);
        setNewPolygon([]);
        setLocation(newPolygon);
        setEditing(false);
        setShowModal(false);
        // setArea(calculatePolygonArea(newPolygon).toFixed(3));
        setFarmerData({
          ...farmerData,
          google_area: geolib.getAreaOfPolygon(newPolygon),
        });
        if (landUnitsquareMetre?.[0]?.defined_unit_value) {
          setArea(
            Number(landUnitsquareMetre?.[0]?.defined_unit_value) *
              geolib.getAreaOfPolygon(newPolygon),
          );
        } else {
          setArea(geolib.getAreaOfPolygon(newPolygon));
        }

        setPolygons([...nearPolSet, newPolygon]);
        setNewPolygon([]);
        setLocation(newPolygon);
        setEditing(false);
        setShowModal(false);
        // setArea(calculatePolygonArea(newPolygon).toFixed(3));
        setFarmerData({
          ...farmerData,
          google_area: geolib.getAreaOfPolygon(newPolygon),
        });
        if (landUnitsquareMetre?.[0]?.defined_unit_value) {
          setArea(
            Number(landUnitsquareMetre?.[0]?.defined_unit_value) *
              geolib.getAreaOfPolygon(newPolygon),
          );
        } else {
          setArea(geolib.getAreaOfPolygon(newPolygon));
        }
      } else {
        Alert.alert(
          'Overlap Detected',
          'Coordinates are overlapping',
          [{text: 'OK', onPress: () => console.log('OK Pressed')}],
          {cancelable: false},
        );
      }
    } else {
      // setArea(0);
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
    setFarmerData({...farmerData, google_area: 0});
    if (userData == 'addUserData' || addPlot == true) {
      setNewPolygon([]);
      // setPolygons([]);
      setPolygons(nearPolSet);
      removesetLocation();
      setArea(0);
    } else {
      if (statuslevel.label != 'APPROVED') {
        // setNewPolygon([]);
        // removesetLocation();
        // setArea(0);
        // const value = [...nearPolSet];
        // value.pop();
        // setPolygons(value);
        // setNewPolygon([]);

        setNewPolygon([]);
        removesetLocation();
        const value = [...nearPolSet];
        const convertedCoordinates = location?.map(coord => ({
          latitude: coord.latitude
            ? parseFloat(String(coord.latitude).trim() || '0')
            : 0,
          longitude: coord.longitude
            ? parseFloat(String(coord.longitude).trim() || '0')
            : 0,
        }));
        const isEqualUnordered = (arr1, arr2) => {
          if (arr1.length !== arr2.length) return false;
          const sortedArr1 = arr1.map(obj => JSON.stringify(obj)).sort();
          const sortedArr2 = arr2.map(obj => JSON.stringify(obj)).sort();
          return sortedArr1.every((item, index) => item === sortedArr2[index]);
        };

        if (isEqualUnordered(convertedCoordinates, value[value.length - 1])) {
          value.pop();
          setArea(0);
        }
        if (location.length > 1) {
          setPolygons(value);
        }
      }
    }
  };
  // GRQ-1130
  // GRQ-1135
  // onPress={() => data?.latitude != 10 && data?.latitude.length != "" ? "" : handleCurrentLatLong(index)}
  // GRQ-1135
  const removesetLocation = () => {
    setLocation([
      {latitude: '', longitude: ''},
      // {latitude: '', longitude: ''},
      // {latitude: '', longitude: ''},
    ]);
    setAddressProof([
      {uri: '', name: '', type: '', fileName: '', id: ''},
      {uri: '', name: '', type: '', fileName: '', id: ''},
      {uri: '', name: '', type: '', fileName: '', id: ''},
      {uri: '', name: '', type: '', fileName: '', id: ''},
      {uri: '', name: '', type: '', fileName: '', id: ''},
    ]);
    setPhotoDeletedValue([]);
  };
  const handleDocumentSelection = async (data, index, itemSingle, objData) => {
    try {
      const response = await DocumentPicker.pick({
        presentationStyle: 'fullScreen',
        type: [types.pdf, types.images],
      });
      const values = [...addressProof];
      const photoId = values[index]?.id;
      if (
        photoId &&
        photoId !== undefined &&
        photoId !== '' &&
        !photoDeletedValue.includes(photoId)
      ) {
        setPhotoDeletedValue(prev => [...prev, photoId]);
      }
      values[index]['uri'] = response[0].uri;
      values[index]['name'] = response[0].name;
      values[index]['type'] = response[0].type;
      values[index]['fileName'] = response[0].name;
      values[index]['value'] = '1';
      values[index]['id'] = '';
      setAddressProof(values);
    } catch (err) {
      console.error(err);
    }
  };

  const handleIOTId = useCallback(async text => {
    try {
      setFarmerData(prev => ({...prev, IOTId: text}));
    } catch (error) {
      console.log('Error in handleIOTId', error);
    }
  }, []);
  const handleCurrentLatLongIOT = useCallback(async () => {
    try {
      // const { latitude, longitude } = coords || {};
      const {latitude, longitude} = await getHighAccuracyLocation();

      setFarmerData(prev => ({
        ...prev,
        IOTLatlat: longitude,
        IOTLatLong: latitude,
      }));
    } catch (error) {
      console.log('Error in handleCurrentLatLongIOT', error);
    }
  }, []);
  const regionRef = useRef(null); // stores the current map region
  const timeoutRef = useRef(null); // timeout controller
  const isEqualCoordinatesArray = (arr1, arr2) => {
    if (arr1.length !== arr2.length) return false;
    return arr1.every(
      (coord, index) =>
        coord.latitude === arr2[index].latitude &&
        coord.longitude === arr2[index].longitude,
    );
  };
  const handleRegionChangeComplete = async newRegion => {
    const {latitude, longitude} = newRegion;
    regionRef.current = newRegion;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(async () => {
      const latestRegion = regionRef.current;
      setIsLoading(true);
      const isSameLat =
        Math.abs(latestRegion.latitude - newRegion.latitude) < 0.0001;
      const isSameLng =
        Math.abs(latestRegion.longitude - newRegion.longitude) < 0.0001;

      if (isSameLat && isSameLng) {
        try {
          const nearestLatLong_res = await axiosPost(
            ROUTES.POST.NEAREST_LATLONG,
            {
              latitude: latitude,
              longitude: longitude,
              distance: 200,
              data_limit: 100,
            },
            token,
            false,
            {
              information: `${dbname},${lan_id}`,
            },
          );

          // nearestLatLong(
          //   dbname,
          //   lan_id,
          //   token,
          //   latitude,
          //   longitude,
          // );
          if (nearestLatLong_res?.status === 200) {
            const data = nearestLatLong_res.data.data;
            setnearPolData(data);
            const groupedData = groupByRelId(data);
            const parsedTargetArray = mainLocation.map(item => ({
              latitude: parseFloat(item.latitude),
              longitude: parseFloat(item.longitude),
            }));
            const index = groupedData.findIndex(
              subArray =>
                JSON.stringify(subArray) === JSON.stringify(parsedTargetArray),
            );
            const foundArray = groupedData.filter(
              item => !isEqualCoordinatesArray(item, parsedTargetArray),
            );
            setnearPolSet(foundArray);
            // setnearPolSet(groupedData);
            setPolygons(foundArray);
          }
        } catch (error) {
          console.error('Error fetching nearest polygon data:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    }, 3000);
  };
  const [InputTextFormEdit, setInputTextFormEdit] = useState(true);
  useEffect(() => {
    if (
      (harvested === '' && statuslevel.label === '') ||
      statuslevel.label === 'CARBON_DOCUMENTS_SUBMITTED'
    ) {
      setInputTextFormEdit(true);
    } else if (
      statuslevel.label == 'APPROVED' ||
      statuslevel.label === 'CARBON_DOCUMENTS_SUBMITTED' ||
      statuslevel.label === 'CARBON_DOCUMENTS_APPROVED' ||
      statuslevel.label === 'CARBON_DOCUMENTS_REJECTED'
    ) {
      setInputTextFormEdit(false);
    } else if (
      harvested === 'same produce' &&
      (statuslevel.label == 'APPROVED' ||
        statuslevel.label === 'CARBON_DOCUMENTS_SUBMITTED' ||
        statuslevel.label === 'CARBON_DOCUMENTS_APPROVED' ||
        statuslevel.label === 'CARBON_DOCUMENTS_REJECTED')
    ) {
      setInputTextFormEdit(true);
    } else if (
      harvested == '' &&
      (statuslevel.label === 'PENDING' || statuslevel.label === 'REJECTED')
    ) {
      setInputTextFormEdit(true);
    } else if (
      harvested == 'same produce' &&
      (statuslevel.label === 'PENDING' || statuslevel.label === 'REJECTED')
    ) {
      setInputTextFormEdit(true);
    } else {
      console.log(
        'No condition matched — status:',
        statuslevel.label,
        ', harvested:',
        harvested,
      );
    }
  }, [statuslevel.label, harvested]);
  return (
    <MyErrorBoundary>
      <DatePickerComp
        openDate={seddingData}
        newDate={minStartDate}
        setOpenDate={setseddingData}
        handleDatePicker={handleseedDatePicker}
      />
      <DatePickerComp
        openDate={penCycleStart}
        newDate={minStartDate}
        setOpenDate={setopenCycleStart}
        handleDatePicker={handleDatePicker}
        minimumDate={minStartDate}
        maximumDate={maxStartDate}
        // title={`${minStartDate}`}
        title={`Select Date Range from (${formatISODateWithSuffix(
          minStartDate,
        )} - ${formatISODateWithSuffix(maxStartDate)})`}
      />
      <DatePickerComp
        openDate={penCycleEnd}
        newDate={minHarvestDate}
        minimumDate={minHarvestDate}
        maximumDate={maxHarvestDate}
        setOpenDate={setopenCycleEnd}
        handleDatePicker={handleDatePicker2}
        title={`Select Date Range from (${formatISODateWithSuffix(
          minHarvestDate,
        )} - ${formatISODateWithSuffix(maxHarvestDate)})`}
      />
      {isLoading ? (
        <View style={styles.LoadingScreen}>
          <LoadingScreen />
        </View>
      ) : null}
      <HarvestedModel
        setModalVisible={setModalVisible}
        modalVisible={modalVisible}
        handleHarvested={handleHarvested}
      />
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, selectedTab === 'PLOT' && styles.activeTab]}
          onPress={() => setSelectedTab('PLOT')}>
          <Text style={styles.tabText}>Plot Data</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, selectedTab === 'CROP' && styles.activeTab]}
          onPress={() => setSelectedTab('CROP')}>
          <Text style={styles.tabText}>Crop Data</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        style={{
          padding: 16,
          backgroundColor: Colors.background,
        }}
        showsVerticalScrollIndicator={false}>
        <View style={{marginBottom: 40}}>
          {statuslevel.label == 'REJECTED' && (
            <View
              style={{
                paddingVertical: 10,
                backgroundColor: '#F8D7DA',
                borderRadius: 5,
                borderColor: '#F8D7DA',
                borderWidth: 0.6,
                marginVertical: 20,
              }}>
              <Text
                style={{
                  marginHorizontal: 5,
                  color: '#721C24',
                  fontFamily: 'Poppins-Regular',
                  fontSize: 14,
                }}>
                {dataProps?.comment}
              </Text>
            </View>
          )}
          {selectedTab === 'PLOT' && (
            <View>
              {userData == 'addUserData' || addPlot == true ? (
                <InputTextForm
                  label={t('addland_select_plot')}
                  required={true}
                  value={farmerData.plot_Site_Name}
                  onChangeText={handleAddUserDataPlot}
                />
              ) : dataProps?.plot_no != undefined ? (
                <InputTextForm
                  label={t('addland_select_plot')}
                  required={true}
                  editable={false}
                  value={farmerData.plot_Site_Name}
                  onChangeText={handleAddUserDataPlot}
                />
              ) : (
                <DropdownForm
                  label={t('addland_select_plot')}
                  required={true}
                  data={plotAll}
                  onChange={handlePlot}
                  val={farmerData.plot_Site_Name}
                />
              )}

              <InputTextForm
                label={t('daag_no')}
                value={farmerData.daag_no}
                required={carbonFlag === true}
                onChangeText={handleAddUserDataDaag}
                editable={
                  statuslevel.label == 'APPROVED' ||
                  statuslevel.label == 'CARBON_DOCUMENTS_SUBMITTED' ||
                  statuslevel.label == 'CARBON_DOCUMENTS_APPROVED' ||
                  statuslevel.label === 'CARBON_DOCUMENTS_REJECTED'
                    ? false
                    : true
                }
              />
              <InputTextForm
                label={t('khatian_no')}
                value={farmerData.khatian_no}
                onChangeText={handleAddUserDataKKhatian}
                editable={
                  statuslevel.label == 'APPROVED' ||
                  statuslevel.label == 'CARBON_DOCUMENTS_SUBMITTED' ||
                  statuslevel.label == 'CARBON_DOCUMENTS_APPROVED' ||
                  statuslevel.label === 'CARBON_DOCUMENTS_REJECTED'
                    ? false
                    : true
                }
              />

              <InputTextForm
                label={t('no_of_plants')}
                value={farmerData.plant_number}
                onChangeText={handleAddUserDataPlanNumber}
                editable={
                  statuslevel.label == 'APPROVED' ||
                  statuslevel.label == 'CARBON_DOCUMENTS_SUBMITTED' ||
                  statuslevel.label == 'CARBON_DOCUMENTS_APPROVED' ||
                  statuslevel.label === 'CARBON_DOCUMENTS_REJECTED'
                    ? false
                    : true
                }
              />
              {carbonFlag == true ? (
                <InputTextForm
                  label={t('JL_No')}
                  value={farmerData.jl_no}
                  required={carbonFlag === true}
                  onChangeText={handleAddUserDataJLNo}
                  editable={
                    statuslevel.label == 'APPROVED' ||
                    statuslevel.label == 'CARBON_DOCUMENTS_SUBMITTED' ||
                    statuslevel.label == 'CARBON_DOCUMENTS_APPROVED' ||
                    statuslevel.label === 'CARBON_DOCUMENTS_REJECTED'
                      ? false
                      : true
                  }
                />
              ) : (
                <></>
              )}
              {carbonFlag == true ? (
                <InputTextForm
                  label={t('Mouja_Name')}
                  value={farmerData.mouja}
                  onChangeText={handleAddUserDataMouja}
                  editable={
                    statuslevel.label == 'APPROVED' ||
                    statuslevel.label == 'CARBON_DOCUMENTS_SUBMITTED' ||
                    statuslevel.label == 'CARBON_DOCUMENTS_APPROVED' ||
                    statuslevel.label === 'CARBON_DOCUMENTS_REJECTED'
                      ? false
                      : true
                  }
                />
              ) : (
                <></>
              )}

              <DropdownForm
                label={t('select_terrain_type')}
                required={true}
                data={terrainTypeAll}
                val={farmerData.terrainType}
                onChange={handleAddDataTerrainType}
              />
              <DropdownForm
                label={t('select_land_type')}
                required={true}
                data={landTypeAll}
                onChange={handleAddDataLandType}
                val={farmerData.landType}
              />
              <DropdownForm
                label={t('addland_soil_type_dv')}
                required={true}
                data={soilTypeAll}
                onChange={handleAddDataSoilType}
                val={farmerData.soilType}
              />
              <View style={styles.plotSiteUnit}>
                <View style={{width: '45%'}}>
                  <InputTextForm
                    label={t('pre_land_size')}
                    required={true}
                    value={farmerData.land_size}
                    onChangeText={handleAddUserDataland_size}
                    editable={
                      statuslevel.label == 'APPROVED' ||
                      //  ||statuslevel.label == 'CARBON_DOCUMENTS_SUBMITTED'
                      statuslevel.label == 'CARBON_DOCUMENTS_APPROVED' ||
                      statuslevel.label === 'CARBON_DOCUMENTS_REJECTED'
                        ? false
                        : true
                    }
                    keyboardType="number-pad"
                  />
                </View>
                <View style={{width: '45%'}}>
                  <DropdownForm
                    label={t('select_unit')}
                    required={true}
                    data={unitAll}
                    onChange={handleAddDataUnit}
                    val={farmerData.unit}
                    disable={
                      plotStatus.label == 'APPROVED' ||
                      statuslevel.label == 'CARBON_DOCUMENTS_SUBMITTED' ||
                      statuslevel.label == 'CARBON_DOCUMENTS_APPROVED'
                        ? true
                        : false
                    }
                  />
                </View>
              </View>
              {farmerData?.ConvertedreportedLandsize != 0 && area != null && (
                <InputTextForm
                  label={
                    t('Converted reported Land size ') +
                    `${
                      landAreaUnit?.[0]?.defined_unit_value
                        ? '(' + landAreaUnit?.[0]?.unit_name + ')'
                        : '(Square meter)'
                    }`
                  }
                  value={farmerData?.ConvertedreportedLandsize.toString()}
                  // onChangeText={text => handleAddUserData('daag_no', text)}
                  editable={false}
                />
              )}
              <View style={{marginTop: 10}}>
                <InputTextForm
                  label={t('enter_iot_device_id')}
                  onChangeText={handleIOTId}
                  value={farmerData.IOTId}
                />
              </View>

              <View style={styles.locationContainer}>
                <View style={styles.locationHeader}>
                  <Text style={styles.locationTitle}>
                    {t('geo_tag_iot_device')}
                  </Text>

                  <TouchableOpacity
                    onPress={() => handleCurrentLatLongIOT()}
                    style={styles.locationStatusInactive}>
                    <MaterialIcons
                      name="location-on"
                      size={20}
                      color="#F44336"
                    />
                    <Text style={styles.locationStatusText}>
                      {t('tap_to_tag')}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.coordinatesContainer}>
                  <View style={styles.coordinateItem}>
                    <MaterialIcons name="pin-drop" size={16} color="#2196F3" />
                    <Text style={styles.coordinateText}>
                      {t('lat')}: {farmerData.IOTLatlat}
                    </Text>
                  </View>
                  <View style={styles.coordinateItem}>
                    <MaterialIcons name="pin-drop" size={16} color="#2196F3" />
                    <Text style={styles.coordinateText}>
                      {t('long')}:{farmerData.IOTLatLong}
                    </Text>
                  </View>
                </View>
              </View>

              {/* <TouchableOpacity onPress={() => handleCurrentLatLongIOT()}>
            <View style={styles.latlongContainer}>
              <Text style={styles.title}>{farmerData.IOTLatlat}</Text>
              <Text style={styles.title}>{farmerData.IOTLatLong}</Text>
            </View>
            <View style={styles.latlongContainer}>
              <Text style={styles.title}>{t('Geo tag IOT Device')}</Text>
              <Image
                source={require('../../Common/images/location.png')}
                style={{ width: 40, height: 40 }}
                resizeMode="contain"
              />
            </View>
          </TouchableOpacity> */}
              <ProofAndIdentityPropfComp
                t={t}
                title={t('address_proof')}
                setStateValue={setAddressProof}
                stateValue={addressProof}
                status_level={statuslevel.label}
                photoDeletedValue={photoDeletedValue}
                setPhotoDeletedValue={setPhotoDeletedValue}
                loginUser_data={loginUser_data}
                disable={
                  statuslevel.label == 'APPROVED' ||
                  // || statuslevel.label == 'CARBON_DOCUMENTS_SUBMITTED'
                  statuslevel.label == 'CARBON_DOCUMENTS_APPROVED' ||
                  statuslevel.label === 'CARBON_DOCUMENTS_REJECTED'
                    ? false
                    : statuslevel.label == 'PENDING' ||
                      statuslevel.label == 'REJECTED'
                    ? false
                    : true
                }
                InputTextFormEdit={InputTextFormEdit}
                allowAddMore={true}
              />

              <View style={{marginTop: 15}}>
                <ProofAndIdentityPropfComp
                  identityProofIdentityPropf={identityProofIdentityPropf}
                  t={t}
                  title={t('address_proofAndIdentityPropf')}
                  setStateValue={setIdentityProofIdentityPropf}
                  stateValue={identityProofIdentityPropf}
                  photoDeletedValue={identityPhotoDeletedValue}
                  setPhotoDeletedValue={setIdentityPhotoDeletedValue}
                  loginUser_data={loginUser_data}
                  status_level={statuslevel.label}
                  InputTextFormEdit={
                    statuslevel.label == 'PENDING' ||
                    statuslevel.label == 'REJECTED'
                      ? true
                      : false
                  }
                  disable={
                    statuslevel.label == 'APPROVED' ||
                    // ||
                    // statuslevel.label == 'CARBON_DOCUMENTS_SUBMITTED'
                    statuslevel.label == 'CARBON_DOCUMENTS_APPROVED' ||
                    statuslevel.label === 'CARBON_DOCUMENTS_REJECTED'
                      ? false
                      : statuslevel.label == 'PENDING' ||
                        statuslevel.label == 'REJECTED'
                      ? false
                      : true
                  }
                  farmerName={loginUser_data?.userName}
                />
              </View>
              {area != 0 && area != null && (
                <InputTextForm
                  label={
                    t('Calculated Map Area ') +
                    `${
                      landAreaUnit?.[0]?.defined_unit_value
                        ? '(' + landAreaUnit?.[0]?.unit_name + ')'
                        : '(Square meter)'
                    }`
                  }
                  value={area.toString()}
                  // onChangeText={text => handleAddUserData('daag_no', text)}
                  editable={false}
                />
              )}
              <View style={styles.labelContainer}>
                <Text style={styles.sectionTitle}>
                  {t('plot_location_points')}
                </Text>
              </View>

              {location &&
                location.map((data, index) => {
                  {
                    /* if (data?.longitude.length> 2) { */
                  }

                  return (
                    <View key={index} style={styles.locationContainer}>
                      <View style={styles.latlongContainer}>
                        <Text style={styles.locationTitle}>
                          {t('location_point')} {index + 1}
                        </Text>

                        {data.latitude ? (
                          <TouchableOpacity
                            onPress={() =>
                              data?.latitude != 10 &&
                              data?.latitude.length != ''
                                ? ''
                                : dataProps.label != 'APPROVED'
                                ? handleCurrentLatLong(index)
                                : ''
                            }
                            style={styles.locationStatusInactive}>
                            <MaterialIcons
                              name="check-circle"
                              size={20}
                              color="#4CAF50"
                            />
                            <Text style={styles.locationStatusText}>
                              {t('captured')}
                            </Text>
                          </TouchableOpacity>
                        ) : (
                          <TouchableOpacity
                            onPress={() =>
                              data?.latitude != 10 &&
                              data?.latitude.length != ''
                                ? ''
                                : dataProps.label != 'APPROVED'
                                ? handleCurrentLatLong(index)
                                : ''
                            }
                            style={styles.locationStatusInactive}>
                            <MaterialIcons
                              name="location-on"
                              size={20}
                              color="#F44336"
                            />
                            <Text style={styles.locationStatusText}>
                              {t('tap_to_tag')}
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                      <View style={styles.latlongContainer}>
                        <View style={styles.coordinateItem}>
                          <MaterialIcons
                            name="pin-drop"
                            size={16}
                            color="#2196F3"
                          />
                          <Text style={styles.coordinateText}>
                            {' '}
                            {t('lat')}:
                            {data?.latitude == '' ? '0.0' : data?.latitude}
                          </Text>
                        </View>
                        <View style={styles.coordinateItem}>
                          <MaterialIcons
                            name="pin-drop"
                            size={16}
                            color="#2196F3"
                          />
                          <Text style={styles.coordinateText}>
                            {' '}
                            {t('long')}:
                            {data?.longitude == '' ? '0.0' : data?.longitude}
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                  {
                    /* } */
                  }
                })}

              {/* <DropdownForm
            label={t('addcrop_select_cultivating_season')}
            required={true}
            data={productionSeason}
            onChange={handleAddDataproductionSeason}
            val={farmerData.productionSeason}
            disable={
              edit == '' ? (harvested == 'same produce' ? true : false) : edit
            }
          /> */}

              {(statuslevel.label == 'APPROVED' ||
                statuslevel.label == 'PENDING' ||
                statuslevel.label == 'CARBON_DOCUMENTS_SUBMITTED' ||
                statuslevel.label == 'CARBON_DOCUMENTS_APPROVED' ||
                statuslevel.label === 'CARBON_DOCUMENTS_REJECTED' ||
                statuslevel.label == 'CARBON_DOCUMENTS_REJECTED') &&
              carbonFlag == true ? (
                <View style={{marginTop: 15}}>
                  <CarbonCertificate
                    identityProofIdentityPropf={carboncertificate}
                    t={t}
                    title={t('carbon_certificate')}
                    setStateValue={setCarboncertificate}
                    stateValue={carboncertificate}
                    status_level={
                      carboncertificate[0]?.uri?.startsWith('content://')
                        ? ''
                        : statuslevel.label
                    }
                    disable={
                      statuslevel.label == 'APPROVED' ||
                      statuslevel.label == 'PENDING'
                        ? true
                        : //  statuslevel.label == 'CARBON_DOCUMENTS_SUBMITTED' ||
                        statuslevel.label == 'CARBON_DOCUMENTS_APPROVED' ||
                          statuslevel.label === 'CARBON_DOCUMENTS_REJECTED'
                        ? false
                        : true
                    }
                    InputTextFormEdit={
                      statuslevel.label == 'APPROVED' ||
                      statuslevel.label == 'PENDING'
                        ? true
                        : false
                    }
                  />
                  <SignatureCapture
                    setSignatureVal={setSignature}
                    signatureVal={signature}
                    statuslevel={statuslevel?.label}
                  />
                </View>
              ) : (
                <></>
              )}
            </View>
          )}
          {/* {addPlot == false ? (
            userData != 'addUserData' ? (
              <TouchableOpacity
                style={styles.clickAddMorePlots}
                onPress={() => handleUserData()}>
                <Text style={styles.clickAddMorePlotsTitle}>
                  {t('click_to_add_more_plot')}
                </Text>
              </TouchableOpacity>
            ) : null
          ) : null} */}
          {selectedTab === 'CROP' && (
            <FarmerCropData
              t={t}
              farmerData={farmerData}
              livelihoodType={livelihoodType}
              handleAddDatalivelihoodType={handleAddDatalivelihoodType}
              produceName={produceName}
              handleAddDataproduceName={handleAddDataproduceName}
              produceVariety={produceVariety}
              handleAddDataproduceVariety={handleAddDataproduceVariety}
              productionProcess={productionProcess}
              handleAddDataProductionProcess={handleAddDataProductionProcess}
              productionUnit={productionUnit}
              handleAddDataUnitProduct={handleAddDataUnitProduct}
              productionSeason={productionSeason}
              handleAddDataproductionSeason={handleAddDataproductionSeason}
              setopenCycleStart={setopenCycleStart}
              setopenCycleEnd={setopenCycleEnd}
              handleUserListUpdate={handleUserListUpdate}
              isLoading={isLoading}
              harvested={harvested}
              userData={userData}
              addPlot={addPlot}
              edit={edit}
              DropdownForm={DropdownForm}
              InputTextForm={InputTextForm}
              ButtonForm={ButtonForm}
              InputTextFormEdit={InputTextFormEdit}
              handleAddUserDataDaag={handleAddUserDataDaag}
              // amendmentList={amendmentList}
              addMoreAmendments={addMoreAmendments}
              handleChange={handleChange}
              formData={formData}
              handleAddUserDataYield={handleAddUserDataYield}
              handleAddUserDataPlantationMethod={
                handleAddUserDataPlantationMethod
              }
              // handleAddUserDataSeedingdate={handleAddUserDataSeedingdate}
              handleAddUserDataWaterSource={handleAddUserDataWaterSource}
              handleAddUserDataGapSeedingFirrig={
                handleAddUserDataGapSeedingFirrig
              }
              handleAddUserDataIrriPractice={handleAddUserDataIrriPractice}
              handleAddUserDataDryingPeriodPrac={
                handleAddUserDataDryingPeriodPrac
              }
              handleAddUserDataGapDrainingHarvest={
                handleAddUserDataGapDrainingHarvest
              }
              handleAddUserDataAfterHarvestRiceStubble={
                handleAddUserDataAfterHarvestRiceStubble
              }
              handleAddUserDataAfterHarvestStraw={
                handleAddUserDataAfterHarvestStraw
              }
              handleAddUserDataStrawRemoved={handleAddUserDataStrawRemoved}
              handleAddUserDataStrawIncorporate={
                handleAddUserDataStrawIncorporate
              }
              handleAddUserDataEndUsgRmStraw={handleAddUserDataEndUsgRmStraw}
              selectedType={selectedType}
              setSelectedType={setSelectedType}
              deleteAmendment={deleteAmendment}
              currentList={currentList}
              amendmentTypes={amendmentTypes}
              allItems={allItems}
              setAmendmentData={setAmendmentData}
              setseddingData={setseddingData}
              handleAddUserDataFinalYieldUnit={handleAddUserDataFinalYieldUnit}
              handleAddUserDataFinalYield={handleAddUserDataFinalYield}
              handleAddDataYieldUnitProduct={handleAddDataYieldUnitProduct}
              historyData={historyData}
            />
          )}
        </View>
      </ScrollView>
      {selectedTab === 'CROP' && (
        <ButtonForm
          label={t('submit')}
          onPress={() => handleUserListUpdate()}
          loading={isLoading}
        />
      )}
      {selectedTab != 'CROP' && (
        <ButtonForm label={t('next')} onPress={() => setSelectedTab('CROP')} />
      )}
      {/* <TouchableOpacity
          style={styles.locationAddMoreContainer}
          onPress={addMoreLocation}>
          <Text style={{color: '#fff', marginRight: 15}}>
            {t('AddLocation')}
          </Text>
        </TouchableOpacity> */}
      {/* {plotEdit || addPlot == true ? ( */}
      <FloatingActionButton
        position="right"
        actions={getActionsPlot(t, styles, Colors, plotEdit, addPlot)}
        color={Colors.useGreen}
        onPressItem={name => {
          if (name == 'MapView') {
            setShowModal(!showModal);
          } else {
            handleUserData();
          }
        }}
        overlayColor="rgba(22, 17, 17, 0.35)"
        distanceToEdge={{vertical: 80, horizontal: 25}}
      />
      {/* ) : 
      <TouchableOpacity
          style={[styles.locationAddMoreContainer, {bottom: 250}]}
          onPress={() => setShowModal(!showModal)}>
          <Text style={[styles.title, {color: '#FFF', marginRight: 20}]}>
            {t('MapView')}
          </Text>
        </TouchableOpacity>
        null} */}

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
            // basudev
            // basudev
            location={location}
            statuslevel={statuslevel.label}
            type="livehoood"
            baselatLong={referencelatLong}
            handleRegionChangeComplete={handleRegionChangeComplete}
            isLoading={isLoading}
            coords={coords}
          />
        </Modal>
      )}
    </MyErrorBoundary>
  );
};

export default FarmerLiveHood;

const styles = StyleSheet.create({
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
    height: 40,
    marginHorizontal: 10,
    borderColor: 'gray',
  },
  plotSiteUnit: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  locationContainer: {},
  latlongContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
    marginHorizontal: 5,
  },
  calenderContainer: {
    flexDirection: 'row',
    height: 48,
    borderWidth: 0.5,
    borderRadius: 6,
    justifyContent: 'space-between',
    // backgroundColor: Colors.background,
    paddingHorizontal: 10,
    color: Colors.text,
    //  borderColor: '#d1d5db',
    borderColor: Colors.borderGreen,
    alignItems: 'center',
  },
  title: {
    color: '#000',
  },
  locationAddMoreContainer: {
    position: 'absolute',
    bottom: 100,
    right: 0,
    backgroundColor: '#025502',
    paddingVertical: 10,
    paddingLeft: 20,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },
  clickAddMorePlots: {
    backgroundColor: '#045004',
    marginHorizontal: 35,
    paddingVertical: 15,
    marginVertical: 20,
    borderRadius: 20,
  },
  clickAddMorePlotsTitle: {
    textAlign: 'center',
    color: '#FFF',
  },
  LoadingScreen: {
    position: 'absolute',
    top: '52%',
    left: '45%',
    zIndex: 9999,
  },
  requiredStar: {
    color: 'red',
    fontFamily: Fonts.Medium,
    fontSize: 16,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  labelContainer2: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  locationContainer: {
    backgroundColor: '#f6f7ffff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,

    marginTop: 10,
    borderWidth: 2,
    borderStyle: 'dotted',
    borderColor: Colors.border,
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    fontFamily: 'Poppins-Medium',
  },
  locationStatusActive: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  locationStatusInactive: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  locationStatusText: {
    marginLeft: 5,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: 'black',
  },
  coordinatesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  coordinateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    padding: 8,
    borderRadius: 5,
    width: '48%',
  },
  coordinateText: {
    marginLeft: 5,
    fontSize: 12,
    color: '#0D47A1',
    fontFamily: 'Poppins-Regular',
    flexWrap: 'wrap', // Add this
    flexShrink: 1,
  },
  coordinatePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 5,
    backgroundColor: '#F5F5F5',
  },
  sectionTitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 15,
    color: '#4e4e4e',
    // marginBottom: 15,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    // marginBottom: -20,
    // marginLeft: 20,
    marginTop: 15,
  },
  tabButton: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: 'green',
    backgroundColor: '#fff',
  },
  tabText: {
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#eee',
  },
});
