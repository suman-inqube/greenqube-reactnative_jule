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
  InteractionManager,
} from 'react-native';
import React, {
  useState,
  useEffect,
  useCallback,
  useContext,
  useRef,
} from 'react';
import {
  ProductionSeasonAndApi,
  ProductionProcessAPI,
  ProductionUnitAPI,
  livelihoodCropAndPlotDetailsAPI,
  PlotSiteUserLandDetails,
  UpdateLandCropdetailsAPI,
  AddLandCropDetailsAPI,
  LandUnitArea,
  LandUnitsquare_metre,
  UnitConversonToDefault,
  nearestLatLong,
  uploadCarbonAgrDocs,
  landRouteApi,
  uploadFarmerIdAdd,
} from '../../../config/apiHere';

import {
  addPlotImageAPI,
  getPlotDocAPI,
  deletePlotImageAPI,
} from '../Loan/LoanAPI';
import config from '../../../config';
import axios from 'axios';
import {useRoute, useNavigation} from '@react-navigation/native';
const qs = require('qs');
import HarvestedModel from './HarvestedModel';
import {CrashlyticsRecordError} from '../../Crashlytics/CrashlyticsRecordError';
//GQR-65
import {userCreateContext} from '../../Context/usersCreateContext';
import Map from '../Map';
import * as geolib from 'geolib';
import {
  calculateAreaFun,
  convertedArrayLatLong,
  calculatePolygonArea,
  isWithin20Meters,
} from '../../Common/calculateAreaFun';

import ProofAndIdentityPropfComp from '../../Common/ProofAndIdentityPropfComp';
import CarbonCertificate from '../../Common/CarbonCertificate';
const timeoutConfig = {timeout: 5000};
import {getDistance} from 'geolib';
import {APP_MAP_RANGE_POLYGON} from '@env';
import * as turf from '@turf/turf';

import SignatureCapture from '../../Common/SignaturePad';
import MyErrorBoundary from '../../Common/MyErrorBoundary';
import {groupByRelId} from '../../utils/helpers';
import {Colors, Fonts} from '../../utils/Constants';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {axiosGet, axiosPut, axiosPost} from '../../utils/api';
import {ROUTES} from '../../utils/Routes';
import {getActionsPlot} from '../../utils/options';
import FloatingActionButton from '../../Components/FloatingActionButton';

const LiveHood = ({
  sendDataToParent,
  dataProps,
  activeTab,
  onTabPress,
  setAddPlot,
  addPlot,
}) => {
  //GQR-65
  const {
    loginUser_data,
    t,
    AlertMesg,
    getItem,
    Toast,
    LoadingScreen,
    DatePickerComp,
    ButtonForm,
    InputTextForm,
    DropdownForm,
    effective_dates,
    navigationBarHeight,
    coords,
  } = useContext(userCreateContext);
  const {dbname, lan_id, token, user_id, carbonFlag} = loginUser_data;
  //GQR-65
  const navigation = useNavigation();
  const route = useRoute();
  const {farmeruserID, agri_land_user_rels} = route.params;
  const [plotEdit, setPlotEdit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [farmerData, setFarmerData] = useState({
    createdBy: '',
    plot_no: '',
    cu_rel_id: '',
    land_rel_id: '',
    daag_no: '',
    khatian_no: '',
    plant_number: '',
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
    productionSeasonSdId: '',
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
    unit_valueArr: '',
    unit_value: '',
    google_area: '',
    IOTId: '',
    IOTLatLong: '',
    IOTLatlat: '',
    ConvertedreportedLandsize: 0,
    crop_cycl_start_date: '',
  });
  const [addressProof, setAddressProof] = useState([
    {uri: '', name: '', type: '', fileName: '', id: ''},
    {uri: '', name: '', type: '', fileName: '', id: ''},
    {uri: '', name: '', type: '', fileName: '', id: ''},
    {uri: '', name: '', type: '', fileName: '', id: ''},
    {uri: '', name: '', type: '', fileName: '', id: ''},
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
  const [terrainTypeAll, setterrainTypeAll] = useState([]);
  const [soilTypeAll, setSoilTypeAll] = useState([]);
  const [landTypeAll, setLandTypeAll] = useState([]);
  const [unitAll, setUnitAll] = useState([]);
  const [location, setLocation] = useState([
    {latitude: '', longitude: ''},
    // {latitude: '', longitude: ''},
    // {latitude: '', longitude: ''},
  ]);
  const [mainLocation, setmainLocation] = useState([
    {latitude: '', longitude: ''},
  ]);
  const [locationType, setLocationType] = useState('location_tap');
  const [newDate, setnewDate] = useState(new Date());
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
  const [plotId, setPlotId] = useState('');
  const [defaultLand, setDefaultLand] = useState(false);
  const [convertionLUState, setConvertionLUState] = useState(false);
  const [landAreaUnit, setLandAreaUnit] = useState([]);
  const [landUnitsquareMetre, setLandUnitsquareMetre] = useState([]);
  const [nearPolSet, setnearPolSet] = useState([]);
  const [nearPolData, setnearPolData] = useState([]);
  const [statuslevel, setstatuslevel] = useState({label: '', value: ''});
  const [updateRelId, setupdateRelId] = useState('');
  const [referencelatLong, setreferencelatLong] = useState({
    latitude: 0,
    longitude: 0,
  });
  const [outofRange, setOutofRange] = useState(false);
  const [previousPlotLatlong, setPreviousPlotLatlong] = useState([]);
  const [add_new_crop, setAdd_new_crop] = useState(false);
  const onPageLoad = useCallback(async () => {
    try {
      setIsLoading(true);
      const {latitude, longitude} = coords || {};
      setreferencelatLong({latitude, longitude});
      const axiosConfig = {
        headers: {
          information: `${dbname},${lan_id}`,
          Accept: 'application/json',
        },
      };
      const [
        nearestLatLong_res,
        unitConversion_res,
        plotSiteUserLandDetails_res,
        landUnitArea_res,
        landUnitSquare_res,
        productSeason_res,
        plotDoc_res,
        terrainType_res,
        soilType_res,
        landType_res,
        landUnit_res,
        produceVariety_res,
        productionProcess_res,
      ] = await Promise.all([
        // axiosPost(
        //   ROUTES.POST.NEAREST_LATLONG,
        //   {
        //     latitude: latitude,
        //     longitude: longitude,
        //     distance: 200,
        //     data_limit: 100,
        //   },
        //   token,
        //   false,
        //   {
        //     information: `${dbname},${lan_id}`,
        //   },
        // ),
        nearestLatLong(dbname, lan_id, token, latitude, longitude),

        axiosGet(ROUTES.GET.UNIT_CONVERSION_DEFAULT({}), token, {
          information: `${dbname},${lan_id}`,
        }),
        // UnitConversonToDefault(dbname, lan_id, token),

        axiosGet(
          ROUTES.GET.PLOT_SIDE_USER_LAND_DETAILS({
            farmeruserID: farmeruserID,
          }),
          token,
          {information: `${dbname},${lan_id}`},
        ),
        // PlotSiteUserLandDetails(dbname, lan_id, token, farmeruserID),
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

        axiosGet(
          ROUTES.GET.PRODUCTION_SEASON({
            lanId: lan_id,
            crop_type_id: '',
            crop_name_id: '',
          }),
          '',
          {information: `${dbname},${lan_id}`},
        ),
        // ProductionSeasonAndApi(dbname, lan_id, ''),

        getPlotDocAPI(dbname, lan_id, token, farmeruserID, dataProps?.rel_id),
        terraintype_resAPI(dbname, lan_id, 'terrain_type'),
        soilType_resAPI(dbname, lan_id, 'soil_type'),
        landType_resAPI(dbname, lan_id, 'land_type'),
        landunit_resAPI(axiosConfig),
        produceVarietyAPI(dbname, lan_id),

        productionProcessAPI(dbname, lan_id),
      ]);
      if (nearestLatLong_res?.status === 200) {
        const {data} = nearestLatLong_res.data;
        if (data?.length > 0) {
          setnearPolData(data);
          const grouped = groupByRelId(data);
          setnearPolSet(grouped);
          setPolygons(grouped);
        }
      }
      if (unitConversion_res?.status === 200) {
        const rows = unitConversion_res.data?.data?.rows || [];
        const invalidUnits = rows.filter(
          el => !el.defined_unit_value || el.defined_unit_value === '',
        );
        if (invalidUnits.length > 0) {
          setConvertionLUState(true);
        }
      }
      if (landUnitArea_res?.status === 200) {
        const {count, rows = []} = landUnitArea_res.data?.data || {};
        setLandAreaUnit(count > 0 ? rows : []);
        setDefaultLand(rows.some(el => el.defined_unit_value?.length > 0));
      }
      if (landUnitSquare_res?.status === 200) {
        const {count, rows = []} = landUnitSquare_res.data?.data || {};
        setLandUnitsquareMetre(count > 0 ? rows : []);
      }

      if (plotSiteUserLandDetails_res?.status === 200) {
        setplotSiteUserLandDetails(plotSiteUserLandDetails_res.data.data);
      }
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      Toast.show({
        text: JSON.stringify(error),
        ...AlertMesg[0],
      });
      CrashlyticsRecordError(error, 'LiveHood', 'onpageload');
    }
  }, []);

  const handlePlot = useCallback(
    async findData => {
      setIsLoading(true);
      setPhotoDeletedValue([]);
      setHarvested('');
      let locationLength = 0;
      setPlotEdit(true);
      setupdateRelId(findData.value);
      const [
        productSeasonresRes,
        cropAndPlotDetails,
        getPlotDoc,
        fusedLocation,
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
        // ProductionSeasonAndApi(dbname, lan_id, ''),

        axiosGet(
          ROUTES.GET.PROBLEM_PRODUCE_AGAINST_PLOT({
            relID: findData.value,
          }),
          '', // No authorization token needed
          {
            information: `${dbname},${lan_id},${farmeruserID}`,
          },
        ),

        // livelihoodCropAndPlotDetailsAPI(
        //   dbname,
        //   lan_id,
        //   farmeruserID,
        //   findData.value,
        // ),
        getPlotDocAPI(dbname, lan_id, token, farmeruserID, findData.value),
        getItem('fusedLocation'),

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
      if (getPlotDoc?.status == 200) {
        const {count} = getPlotDoc?.data?.data;
        const {plot_img, landUserImgs} = getPlotDoc?.data?.data?.rows[0] || {};
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
        const filterLandUserImgsAddress = landUserImgs.filter(
          item => item.term_type === 'farmer_address',
        );
        const filterLandUserImgsIdentity = landUserImgs.filter(
          item => item.term_type === 'farmer_identity',
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
        addressProof.map((_data, _index) => {
          if (filteredPlotImages[_index] !== undefined && count > 0) {
            values[_index] = {
              uri: filteredPlotImages[_index]?.file_path,
              name: filteredPlotImages[_index]?.file_name,
              type: filteredPlotImages[_index]?.file_ext,
              fileName: filteredPlotImages[_index]?.file_name,
              id: filteredPlotImages[_index]?.file_id,
            };
          } else {
            values[_index] = {
              uri: '',
              name: '',
              type: '',
              fileName: '',
              id: '',
            };
          }
        });
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
        setAddressProof(values);
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
        const data = cropAndPlotDetails?.data?.data || {};
        plotSiteUserLandDetails.map((dataLandDetails, index) => {
          if (dataLandDetails?.rel_id == findData.value) {
            if (
              dataLandDetails?.status_level == 'APPROVED' ||
              dataLandDetails?.status_level == 'CARBON_DOCUMENTS_SUBMITTED' ||
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

            setstatuslevel(prev => ({
              ...prev,
              label: dataLandDetails?.status_level,
              value: dataLandDetails?.status_level,
            }));
            if (new Date() < new Date(data.harvesting_date) != true) {
              setModalVisible(true);
              setOutofRange(false);
            } else {
              setEdit(true);
            }
            setIsLoading(false);
            // setArea(data.land_info?.google_area);
            if (landUnitsquareMetre?.[0]?.defined_unit_value) {
              setArea(
                Number(landUnitsquareMetre?.[0]?.defined_unit_value) *
                  Number(data.land_info?.google_area),
              );
            } else {
              setArea(data.land_info?.google_area);
            }
            setFarmerData(prev => ({
              ...prev,
              createdBy: user_id,
              plot_no: data?.land_info?.plot_no,
              cu_rel_id: data?.cu_rel_id,
              land_rel_id: findData?.value,
              daag_no: dataLandDetails?.daag_no,
              khatian_no: dataLandDetails?.khatian_no,
              plant_number: dataLandDetails?.plant_number,
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
              productionSeason: data?.crop_season?.name,
              productionSeasonValue: data?.crop_season?.fid,
              livelihoodType: data?.crop_type?.name,
              livelihoodTypeValue: data?.crop_type?.fid,
              produceName: data?.crop_name?.name,
              produceNameValue: data?.crop_name?.fid,
              produceVariety: data?.crop_variety?.name,
              produceVarietyValue: data?.crop_variety?.fid,
              productionProcess: data?.farmer_production_system?.name,
              productionProcessValue: data?.farmer_production_system?.fid,
              unitProduct: data?.agri_unit && data?.agri_unit?.unit_name,
              unitProductValue: data?.agri_unit && data?.agri_unit?.fid,
              unit_value: dataLandDetails?.land_unit?.unit_value,
              google_area: data.land_info?.google_area,
              IOTId: data.land_info?.device_no,
              IOTLatlat: data.land_info?.device_lat,
              IOTLatLong: data.land_info?.device_long,
              crop_cycl_start_date: data.crop_cycl_start_date,
              ConvertedreportedLandsize:
                Number(dataLandDetails?.land_unit?.defined_unit_value) *
                Number(dataLandDetails?.land_size),
            }));
            return;
          }
        });
        const agri_land_user_latlongs = data.land_info.agri_land_user_latlongs;
        // const values = [...location];
        const values = [{latitude: '', longitude: ''}];

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
            const parsedTargetArray = values.map(item => ({
              latitude: parseFloat(item.latitude),
              longitude: parseFloat(item.longitude),
            }));
            const index = nearPolSet.findIndex(
              subArray =>
                JSON.stringify(subArray) === JSON.stringify(parsedTargetArray),
            );

            const foundArray = nearPolSet.filter(
              item => !isEqualCoordinatesArray(item, parsedTargetArray),
            );
            setnearPolSet(foundArray);
            setPolygons(foundArray);
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
            const parsedTargetArray = values.map(item => ({
              latitude: parseFloat(item.latitude),
              longitude: parseFloat(item.longitude),
            }));
            const index = nearPolSet.findIndex(
              subArray =>
                JSON.stringify(subArray) === JSON.stringify(parsedTargetArray),
            );
            const foundArray = nearPolSet.filter(
              item => !isEqualCoordinatesArray(item, parsedTargetArray),
            );
            setnearPolSet(foundArray);
            setPolygons(foundArray);
          } else {
            setPolygons(nearPolSet);
          }
          setLocationType('api_lication');
        }
        //basudev out of range
        // if (agri_land_user_latlongs.length > 1) {
        //   const { latitude, longitude } = fusedLocation;
        //   const is20Meters = isWithin20Meters(
        //     { latitude, longitude },
        //     agri_land_user_latlongs,
        //     40
        //   );
        //   if (is20Meters?.length !== 0) {
        //     setOutofRange(false);
        //   } else {
        //     setOutofRange(true);
        //   }
        // } else {
        //   setOutofRange(false);
        // }
        if (data?.add_new_crop === true) {
          setAdd_new_crop(true);
        } else {
          setAdd_new_crop(false);
        }
      }
      if (productSeasonresRes?.status === 200) {
        const productSeasonresResArr =
          productSeasonresRes?.data?.data?.crop_season.map(data => ({
            value: data?.fid,
            label: data?.name,
          }));
        const livelihoodTypeArr =
          productSeasonresRes?.data?.data?.crop_type.map(data => ({
            value: data?.fid,
            label: data?.name,
          }));
        setProductionSeason(productSeasonresResArr);
        setLivelihoodType(livelihoodTypeArr);
      }
      if (nearestLatLong_res?.status == 200) {
        if (nearestLatLong_res.data.data.length > 0) {
          setnearPolData(nearestLatLong_res.data.data);
          groupedData = groupByRelId(nearestLatLong_res.data.data);
          if (
            statuslevel == 'APPROVED' ||
            statuslevel == 'CARBON_DOCUMENTS_SUBMITTED' ||
            statuslevel == 'CARBON_DOCUMENTS_APPROVED'
          ) {
            setnearPolSet(groupedData);
            setPolygons(groupedData);
          }
        }
      }
    },
    [
      farmerData,
      location,
      landUnitsquareMetre,
      plotSiteUserLandDetails,
      statuslevel,
    ],
  );

  const isEqualCoordinatesArray = (arr1, arr2) => {
    if (arr1.length !== arr2.length) return false;
    return arr1.every(
      (coord, index) =>
        coord.latitude === arr2[index].latitude &&
        coord.longitude === arr2[index].longitude,
    );
  };
  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      onPageLoad();
    });
    return () => task.cancel(); // cleanup
  }, []);
  useEffect(() => {
    if (plotSiteUserLandDetails.length != 0) {
      if (dataProps?.plot_no != undefined) {
        handlePlot({
          label: dataProps?.plot_no,
          value: dataProps?.rel_id,
          latitude: dataProps?.latitude,
          longitude: dataProps?.longitude,
        });
        setupdateRelId(dataProps?.rel_id);
      }
    }
  }, [plotSiteUserLandDetails]);
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
      {uri: '', name: '', type: '', fileName: '', id: ''},
      {uri: '', name: '', type: '', fileName: '', id: ''},
      {uri: '', name: '', type: '', fileName: '', id: ''},
      {uri: '', name: '', type: '', fileName: '', id: ''},
      {uri: '', name: '', type: '', fileName: '', id: ''},
    ]);
  };
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
  const handleHarvested = async data => {
    setHarvested(data);
    setEdit('');
    if (data === 'same produce') {
      setFarmerData(prev => ({
        ...prev,
        cycleStartDate: '',
        cycleEndDate: '',
      }));
    } else {
      setFarmerData(prev => ({
        ...prev,
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
      }));
    }
  };
  const handleDatePicker = async item => {
    const selectedDate = effective_dates(item);

    const seasonData = await axiosGet(
      ROUTES.GET.PRODUCE_SEASON({
        from_date: selectedDate,
      }),
      '',
      {
        information: `${dbname},${lan_id},${user_id}`,
        Authorization: `${token}`,
      },
    );

    console.log('seasonData', seasonData);

    let prodctionSeasionArray = [];
    if (seasonData?.status === 200) {
      prodctionSeasionArray = seasonData?.data?.data?.rows?.map(data => ({
        value: data.season_info.fid,
        label: data.season_info.name,
        sd_id: data.sd_id, // NEW FIELD - stores season detail ID
      }));
    }

    console.log('prodctionSeasionArray', prodctionSeasionArray);
    if (prodctionSeasionArray) {
      setProductionSeason(prodctionSeasionArray);
    }

    setFarmerData(prev => ({
      ...prev,
      cycleStartDate: selectedDate,
    }));
  };
  const handleDatePicker2 = item =>
    setFarmerData(prev => ({
      ...prev,
      cycleEndDate: effective_dates(item),
    }));

  const handleCurrentLatLong = useCallback(async index => {
    const values = [...location];
    const {latitude, longitude} = coords || {};
    if (
      coords != null &&
      // longitude.toString().length == 10 &&
      // latitude.toString().length == 10 &&
      latitude > 0 &&
      longitude > 0
    ) {
      values[index] = {latitude: latitude, longitude: longitude};
      setLocation(values);
      const filteredDatalatLong = values.filter(
        item => item?.latitude !== '' && item?.latitude != 0,
      );
      if (filteredDatalatLong.length >= 3) {
        setNewPolygon(convertedArrayLatLong(filteredDatalatLong));
        // setArea(calculateAreaFun(filteredDatalatLong));
        setFarmerData(prev => ({
          ...prev,
          google_area: geolib.getAreaOfPolygon(filteredDatalatLong),
        }));
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
  }, []);

  const handleAddDataproductionSeason = useCallback(item => {
    setFarmerData(prev => ({
      ...prev,
      productionSeason: item.label,
      productionSeasonValue: item.value,
      productionSeasonSdId: item.sd_id,
      livelihoodType: '',
      livelihoodTypeValue: '',
      produceName: '',
      produceNameValue: '',
      produceVariety: '',
      produceVarietyValue: '',
      productionProcess: '',
      productionProcessValue: '',
    }));
  }, []);
  const handleAddDatalivelihoodType = useCallback(async item => {
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
  }, []);
  const handleAddDataproduceName = useCallback(
    item => {
      setFarmerData(prev => ({
        ...prev,
        produceName: item.label,
        produceNameValue: item.value,
        produceVariety: '',
        produceVarietyValue: '',
      }));
      produceNameAPI(
        dbname,
        lan_id,
        farmerData.livelihoodTypeValue,
        item.value,
      );
    },
    [farmerData.livelihoodTypeValue],
  );
  const handleAddDataproduceVariety = useCallback(item => {
    setFarmerData(prev => ({
      ...prev,
      produceVariety: item.label,
      produceVarietyValue: item.value,
    }));
    produceVarietyAPI(dbname, lan_id);
  }, []);
  const handleAddDataProductionProcess = useCallback(item => {
    setFarmerData(prev => ({
      ...prev,
      productionProcess: item.label,
      productionProcessValue: item.value,
    }));
    productionProcessAPI(dbname, lan_id);
  }, []);
  const terraintype_resAPI = async (dbname, lan_id, type) => {
    try {
      let terraintype_res = await axiosGet(
        ROUTES.GET.LAND_ROUTE({
          type: type,
        }),
        '',
        {information: `${dbname},${lan_id}`},
      );
      // landRouteApi(dbname, lan_id, type);

      if (terraintype_res?.status == 200) {
        const terraintypeArray = terraintype_res.data.data.rows.map(data => ({
          value: data.fid,
          label: data?.name,
        }));
        setterrainTypeAll(terraintypeArray);
      }
    } catch (error) {
      console.log('Error in terraintypeAPI API', error);
    }
  };
  const soilType_resAPI = async (dbname, lan_id, type) => {
    try {
      let soilType_res = await axiosGet(
        ROUTES.GET.LAND_ROUTE({
          type: type,
        }),
        '',
        {information: `${dbname},${lan_id}`},
      );
      // landRouteApi(dbname, lan_id, type);

      if (soilType_res?.status == 200) {
        const soilTypeArray = soilType_res?.data?.data?.rows.map(data => ({
          value: data.fid,
          label: data?.name,
        }));
        setSoilTypeAll(soilTypeArray);
      }
    } catch (error) {
      console.log('Error in soiltypeAPI API', error);
    }
  };
  const landType_resAPI = async (dbname, lan_id, type) => {
    try {
      let landType_res = await axiosGet(
        ROUTES.GET.LAND_ROUTE({
          type: type,
        }),
        '',
        {information: `${dbname},${lan_id}`},
      );
      // landRouteApi(dbname, lan_id, type);

      if (landType_res?.status == 200) {
        const landTypeArray = landType_res?.data?.data?.rows.map(data => ({
          value: data.fid,
          label: data?.name,
        }));
        setLandTypeAll(landTypeArray);
      }
    } catch (error) {
      console.log('Error in landtypeAPI API', error);
    }
  };
  const landunit_resAPI = async axiosConfig => {
    try {
      let landunitAPI = await axios.get(config.landunitAPI, {
        ...axiosConfig,
        ...timeoutConfig,
      });
      if (landunitAPI?.status == 200) {
        setFarmerData(prev => ({
          ...prev,
          unit_valueArr: JSON.stringify(landunitAPI.data.data.rows),
        }));
        const landunitArray = landunitAPI?.data?.data?.rows.map(data => ({
          value: data.fid,
          label: data?.name,
        }));
        setUnitAll(landunitArray);
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
      {information: `${dbname},${languageID}`},
    );

    // ProductionSeasonAndApi(
    //   dbName,
    //   languageID,
    //   crop_type_id,
    //   crop_name_id,
    // );
    if (productSeasonresRes?.status === 200) {
      const productSeasonresResArr =
        productSeasonresRes?.data?.data?.crop_season.map(data => ({
          value: data?.fid,
          label: data?.name,
        }));
      const livelihoodTypeArr = productSeasonresRes?.data?.data?.crop_type.map(
        data => ({value: data?.fid, label: data?.name}),
      );
      const produceNameArr = productSeasonresRes?.data?.data?.crop_name.map(
        data => ({value: data.crop_name?.fid, label: data.crop_name?.name}),
      );
      setProductionSeason(productSeasonresResArr);
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
    const productSeasonresRes = await axiosGet(
      ROUTES.GET.PRODUCTION_SEASON({
        lanId: languageID,
        crop_type_id: crop_type_id,
        crop_name_id: crop_name_id,
      }),
      '',
      {information: `${dbname},${languageID}`},
    );

    // ProductionSeasonAndApi(
    //   dbName,
    //   languageID,
    //   crop_type_id,
    //   crop_name_id,
    // );

    if (productSeasonresRes?.status == 200) {
      const produceVariety = productSeasonresRes?.data?.data?.crop_variety.map(
        data => ({
          value: data.crop_variety?.fid,
          label: data.crop_variety?.name,
        }),
      );
      setProduceVariety(produceVariety);
    }
  };
  const produceVarietyAPI = async (dbName, languageID) => {
    const productionProcessRes = await axiosGet(
      ROUTES.GET.PRODUCTION_PROCESS({}),
      '',
      {information: `${dbName},${languageID}`},
    );
    // ProductionProcessAPI(dbName, languageID);

    if (productionProcessRes?.status == 200) {
      const productionProcessArr = productionProcessRes?.data?.data?.rows.map(
        data => ({value: data?.fid, label: data?.name}),
      );
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
      const productionUnitArr = ProductionUnitRes?.data?.data?.rows.map(
        data => ({value: data?.fid, label: data.unit_name}),
      );
      setProductionUnit(productionUnitArr);
    }
  };
  const handleUserListUpdate = useCallback(async () => {
    Keyboard.dismiss();
    const locationArry = [];
    const latlongArr = [];
    if (location?.[0]?.editing == true && statuslevel.label != '') {
      const {latitude, longitude} = coords;
      const distances = previousPlotLatlong.map(p =>
        getDistance(p, {latitude, longitude}),
      );
      const minDistance = Math.min(...distances);
    }
    // area
    if (area != null && area != undefined && area != '' && area != 0) {
      const deviation =
        (Math.abs(farmerData?.ConvertedreportedLandsize - area) /
          ((farmerData?.ConvertedreportedLandsize + area) / 2)) *
        100;
      if (
        ![
          'APPROVED',
          'CARBON_DOCUMENTS_SUBMITTED',
          'CARBON_DOCUMENTS_APPROVED',
          'CARBON_DOCUMENTS_REJECTED',
        ].includes(statuslevel.label)
      ) {
        if (deviation >= -5 && deviation <= 5) {
        } else {
          Alert.alert(
            'Deviation',
            'The deviation between reported area and google area is not within 5%',
            [{text: 'OK', onPress: () => console.log(area)}],
            {cancelable: false},
          );
          setIsLoading(false);
          return;
        }
      } else {
      }
    }
    location.map((data, index) => {
      if (data?.latitude != '' && data?.latitude != undefined) {
        locationArry.push('latitude');
        latlongArr.push({latitude: data?.latitude, longitude: data?.longitude});
      }
    });
    if (farmerData.plot_Site_Name == '') {
      Toast.show({text: `${t('please_add_plot_name_first')}`, ...AlertMesg[0]});
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
    } else if (defaultLand === false) {
      Toast.show({text: 'Please set default unit', ...AlertMesg[0]});
    } else if (convertionLUState === true) {
      Toast.show({
        text: 'Please add the unit equivalent factor to default unit',
        ...AlertMesg[0],
      });
    } else {
      let land_convert_size_value = '';
      //land_convert_size_value fix
      if (
        farmerData.unit_value == null ||
        farmerData.unit_value == '' ||
        farmerData.unit_value == undefined
      ) {
        land_convert_size_value = farmerData.land_size * 1;
      } else {
        land_convert_size_value = farmerData.land_size * farmerData.unit_value;
      }
      const latlongArrString = JSON.stringify(latlongArr);
      setIsLoading(true);
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
      formdata.append('crop_type_id', farmerData.livelihoodTypeValue);
      formdata.append('crop_name_id', farmerData.produceNameValue);
      formdata.append('crop_variety_id', farmerData.produceVarietyValue);
      formdata.append('latlong_data', latlongArrString);
      formdata.append('createdBy', user_id);
      formdata.append('daag_no', farmerData.daag_no);
      formdata.append('khatian_no', farmerData.khatian_no);
      formdata.append('plant_number', farmerData.plant_number);
      formdata.append('certified_seed', 'No');
      formdata.append('have_land_title', 'No');
      formdata.append('production_system', farmerData.productionProcessValue);
      formdata.append('have_fertilizer', 'Yes');
      formdata.append('buy_pesticide', 'Yes');
      formdata.append('yield_amount', farmerData.expectedProduction);
      formdata.append('yield_unit', farmerData.unitProductValue);
      formdata.append('sowing_date', farmerData.cycleStartDate);
      formdata.append('harvesting_date', farmerData.cycleEndDate);
      if (farmerData?.google_area > 0 && farmerData?.google_area != undefined) {
        formdata.append('google_area', farmerData.google_area);
      } else {
        formdata.append('google_area', 0);
      }

      const photoDeletedvalidValues = photoDeletedValue.filter(
        value => value !== undefined && value !== '',
      );
      let formDataDelete = qs.stringify({
        file_delete_ids: photoDeletedvalidValues?.toString(),
      });
      const filterAddressImage = addressProof.filter(item => item.name !== '');

      if (userData == 'addUserData' || addPlot == true) {
        addressProof.map((data, index) => {
          if (data.name != '') {
            formdata.append('plot_image', data);
          }
        });
        const AddLandCropDetails_res = await axiosPost(
          ROUTES.POST.ADD_LAND_CROP_DETAIL({}),
          formdata,
          token,
          false,
          {information: `${dbname},${lan_id},${farmeruserID}`},
        );
        // AddLandCropDetailsAPI(
        //   dbname,
        //   lan_id,
        //   farmeruserID,
        //   token,
        //   formdata,
        //   '',
        //   '',
        // );
        if (AddLandCropDetails_res?.status === 200) {
          removesetLocation();
          Toast.show({text: t('l_c_add_succ'), ...AlertMesg[0]});
          onTabPress(0);
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
          user_id: farmeruserID,
          plot_no: farmerData.plot_Site_Name,
          createdBy: user_id,
          daag_no: farmerData.daag_no,
          khatian_no: farmerData.khatian_no,
          plant_number: farmerData.plant_number,
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

        updateLandCropdetails_res = await axiosPut(
          ROUTES.PUT.UPDATE_LAND_CROP_DETAILS({
            land_rel_id: farmerData.land_rel_id,
            crop_rel_id: farmerData.cu_rel_id,
          }),
          dataToSend,
          token,
          true,
          {information: `${dbname},${lan_id},${farmeruserID}`},
        );

        // UpdateLandCropdetailsAPI(
        //   dbname,
        //   lan_id,
        //   farmeruserID,
        //   token,
        //   save_data,
        //   farmerData.land_rel_id,
        //   farmerData.cu_rel_id,
        // );
        addressProof.map((data, index) => {
          if (data.name != '' && data.id == '') {
            formDataPlotImg.append('plot_image', data);
          }
        });
        formDataPlotImg.append('rel_id', plotId);
        const [deletePlotImageAPIRes, addPlotImageAPIRes] = await Promise.all([
          deletePlotImageAPI(dbname, lan_id, token, formDataDelete),
          addPlotImageAPI(dbname, lan_id, token, farmeruserID, formDataPlotImg),
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

        if (statuslevel.label == 'REJECTED' || statuslevel.label == 'PENDING') {
          const formdatauploadFarmerIdAdd = new FormData();
          if (identityProofIdentityPropf[0]?.id == '') {
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
          formdatauploadFarmerIdAdd.append('user_id', farmeruserID);

          const resOocUpdate = await uploadFarmerIdAdd(
            dbname,
            lan_id,
            farmeruserID,
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
          (statuslevel.label == 'CARBON_DOCUMENTS_REJECTED' &&
            carbonFlag == true)
        ) {
          const formdataCarbon = new FormData();
          formdataCarbon.append('rel_id', farmerData.land_rel_id);
          if (
            carboncertificate[0]?.id != undefined &&
            carboncertificate[0]?.id == '' &&
            carboncertificate[0].uri != ''
          ) {
            formdataCarbon.append('carbon_agreement', carboncertificate[0]);
          }
          if (
            signature?.id != undefined &&
            signature?.id == '' &&
            signature.uri != ''
          ) {
            formdataCarbon.append('signature', signature);
          }
          const carbonRes = await uploadCarbonAgrDocs(
            dbname,
            lan_id,
            token,
            farmeruserID,
            formdataCarbon,
          );
        }

        if (updateLandCropdetails_res?.status === 200) {
          removesetLocation();
          Toast.show({text: t('l_c_update_succ'), ...AlertMesg[0]});
          onTabPress(0);
        }
        setIsLoading(false);
      }
    }
  }, [
    farmerData,
    location,
    carboncertificate,
    signature,
    addressProof,
    identityProofIdentityPropf,
  ]);
  const handleUserData = async () => {
    setOutofRange(false);
    setAddPlot(true);
    //basude stop
    setstatuslevel({label: '', value: ''});
    setUserData('addUserData');
    setPlotEdit(true);
    setPolygons(nearPolSet);
    setEdit('');
    RemoveFarmerData();
    removesetLocation();
    setPreviousPlotLatlong([]);
    setArea(0);
    removesetLocation();
  };
  const handleAddUserData = useCallback(
    (name, data) => {
      setFarmerData(prev => ({...prev, [`${name}`]: data}));
    },
    [farmerData],
  );
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
  const handleAddDataUnitProduct = useCallback(item => {
    const {label, value} = item;
    setFarmerData(prev => ({
      ...prev,
      unitProduct: label,
      unitProductValue: value,
    }));
  }, []);
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
        'CARBON_DOCUMENTS_SUBMITTED',
        'CARBON_DOCUMENTS_APPROVED',
        'CARBON_DOCUMENTS_REJECTED',
      ].includes(statuslevel.label)
    ) {
      const {latitude, longitude} = event.nativeEvent.coordinate;
      groupedData = groupByRelId(nearPolData);
      setNewPolygon([...newPolygon, {latitude, longitude, editing: true}]);
    }
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
    try {
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
        //basudev
        // if (!overlapFound) {
        setPolygons([...nearPolSet, newPolygon]);
        setNewPolygon([]);
        setLocation(newPolygon);
        setEditing(false);
        setShowModal(false);
        // setArea(calculateAreaFun(newPolygon));
        setFarmerData(prev => ({
          ...prev,
          google_area: geolib.getAreaOfPolygon(newPolygon),
        }));
        if (landUnitsquareMetre?.[0]?.defined_unit_value) {
          setArea(
            Number(landUnitsquareMetre?.[0]?.defined_unit_value) *
              geolib.getAreaOfPolygon(newPolygon),
          );
        } else {
          setArea(geolib.getAreaOfPolygon(newPolygon));
        }
        // } else {
        //   Alert.alert(
        //     'Overlap Detected',
        //     'Coordinates are overlapping',
        //     [{text: 'OK', onPress: () => console.log('OK Pressed')}],
        //     {cancelable: false},
        //   );
        // }
      } else {
        // setArea(0);
        Alert.alert(
          'Error',
          'A polygon requires at least 3 points.',
          [{text: 'OK', onPress: () => console.log('OK Pressed')}],
          {cancelable: false},
        );
      }
      setLocationType('polygon_tap');
    } catch (error) {
      console.log(error);
    }
  };

  const clearNewPolygon = () => {
    setFarmerData(prev => ({...prev, google_area: 0}));
    if (userData == 'addUserData' || addPlot == true) {
      setNewPolygon([]);
      setPolygons(nearPolSet);
      removesetLocation();
      setArea(0);
    } else {
      if (statuslevel.label != 'APPROVED') {
        setNewPolygon([]);
        setPolygons(nearPolSet);
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
  const removesetLocation = () => {
    setLocation([
      {latitude: '', longitude: ''},
      // {latitude: '', longitude: ''},
      // {latitude: '', longitude: ''},
    ]);
  };
  const regionRef = useRef(null);
  const timeoutRef = useRef(null);
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
            const data = nearestLatLong_res?.data?.data;
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
  const handleIOTId = useCallback(async text => {
    try {
      setFarmerData(prev => ({...prev, IOTId: text}));
    } catch (error) {
      console.log('Error in handleIOTId', error);
    }
  }, []);
  const handleCurrentLatLongIOT = useCallback(async () => {
    try {
      const {latitude, longitude} = coords || {};
      setFarmerData(prev => ({
        ...prev,
        IOTLatlat: longitude,
        IOTLatLong: latitude,
      }));
    } catch (error) {
      console.log('Error in handleCurrentLatLongIOT', error);
    }
  }, []);
  const [InputTextFormEdit, setInputTextFormEdit] = useState(true);
  useEffect(() => {
    if (harvested === '' && statuslevel.label === '') {
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
  const handleAddUserDataExpected = useCallback(text => {
    setFarmerData(prev => ({...prev, expectedProduction: text}));
  }, []);
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
        unit: label,
        unitValue: value,
        ['unit_value']: selectUnitValue,
        ConvertedreportedLandsize:
          Number(selectUnitValue) * Number(farmerData.land_size),
      }));
    },
    [farmerData.land_size],
  );
  return (
    <MyErrorBoundary>
      <>
        {/* <ForegroundLocationService /> */}
        <DatePickerComp
          openDate={penCycleStart}
          newDate={newDate}
          setOpenDate={setopenCycleStart}
          handleDatePicker={handleDatePicker}
        />
        <DatePickerComp
          openDate={penCycleEnd}
          newDate={
            farmerData.cycleStartDate == ''
              ? issuenewDate
              : new Date(
                  `${new Date(farmerData.cycleStartDate).getFullYear()}-${
                    new Date(farmerData.cycleStartDate).getMonth() + 1
                  }-${new Date(farmerData.cycleStartDate).getDate() + 1}`,
                )
          }
          minimumDate={
            farmerData.cycleStartDate == ''
              ? ''
              : new Date(
                  `${new Date(farmerData.cycleStartDate).getFullYear()}-${
                    new Date(farmerData.cycleStartDate).getMonth() + 1
                  }-${new Date(farmerData.cycleStartDate).getDate() + 1}`,
                )
          }
          setOpenDate={setopenCycleEnd}
          handleDatePicker={handleDatePicker2}
        />
        {isLoading ? (
          <View style={styles.LoadingScreen}>
            <LoadingScreen />
          </View>
        ) : null}
        {modalVisible && (
          <HarvestedModel
            setModalVisible={setModalVisible}
            modalVisible={modalVisible}
            handleHarvested={handleHarvested}
          />
        )}

        <ScrollView
          style={{
            marginTop: 7,
            padding: 15,
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
                data={agri_land_user_rels}
                onChange={handlePlot}
                val={farmerData.plot_Site_Name}
              />
            )}
            <InputTextForm
              label={t('daag_no')}
              value={farmerData.daag_no}
              onChangeText={handleAddUserDataDaag}
              editable={InputTextFormEdit}
            />
            <InputTextForm
              label={t('khatian_no')}
              value={farmerData.khatian_no}
              onChangeText={handleAddUserDataKKhatian}
              editable={InputTextFormEdit}
            />
            <InputTextForm
              label={t('no_of_plants')}
              value={farmerData.plant_number}
              onChangeText={handleAddUserDataPlanNumber}
              editable={InputTextFormEdit}
            />
            <DropdownForm
              label={t('select_terrain_type')}
              required={true}
              data={terrainTypeAll}
              val={farmerData.terrainType}
              onChange={handleAddDataTerrainType}
              // disable={(statuslevel.label == 'APPROVED' || statuslevel.label == 'CARBON_DOCUMENTS_SUBMITTED' || statuslevel.label == 'CARBON_DOCUMENTS_APPROVED' || statuslevel.label === 'CARBON_DOCUMENTS_REJECTED') && harvested == '' || harvested == 'same produce' ? true : false}
            />
            <DropdownForm
              label={t('select_land_type')}
              required={true}
              data={landTypeAll}
              onChange={handleAddDataLandType}
              val={farmerData.landType}
              // disable={(statuslevel.label == 'APPROVED' || statuslevel.label == 'CARBON_DOCUMENTS_SUBMITTED' || statuslevel.label == 'CARBON_DOCUMENTS_APPROVED' || statuslevel.label === 'CARBON_DOCUMENTS_REJECTED') && harvested == '' || harvested == 'same produce' ? true : false}
            />
            <DropdownForm
              label={t('addland_soil_type_dv')}
              required={true}
              data={soilTypeAll}
              onChange={handleAddDataSoilType}
              val={farmerData.soilType}
              // disable={(statuslevel.label == 'APPROVED' || statuslevel.label == 'CARBON_DOCUMENTS_SUBMITTED' || statuslevel.label == 'CARBON_DOCUMENTS_APPROVED' || statuslevel.label === 'CARBON_DOCUMENTS_REJECTED') && harvested == '' || harvested == 'same produce' ? true : false}
            />
            <View style={styles.plotSiteUnit}>
              <View style={{width: '45%'}}>
                <InputTextForm
                  label={t('pre_land_size')}
                  required={true}
                  value={farmerData.land_size}
                  onChangeText={handleAddUserDataland_size}
                  // editable={InputTextFormEdit}
                  editable={
                    statuslevel.label == 'APPROVED' ||
                    statuslevel.label == 'CARBON_DOCUMENTS_SUBMITTED' ||
                    statuslevel.label == 'CARBON_DOCUMENTS_APPROVED' ||
                    statuslevel.label === 'CARBON_DOCUMENTS_REJECTED'
                      ? false
                      : true
                  }
                />
              </View>
              <View style={{width: '45%'}}>
                {/* /// size */}
                <DropdownForm
                  label={t('select_unit')}
                  required={true}
                  data={unitAll}
                  onChange={handleAddDataUnit}
                  val={farmerData.unit}
                  disable={
                    statuslevel.label == 'APPROVED' ||
                    statuslevel.label == 'CARBON_DOCUMENTS_SUBMITTED' ||
                    statuslevel.label == 'CARBON_DOCUMENTS_APPROVED' ||
                    statuslevel.label === 'CARBON_DOCUMENTS_REJECTED'
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
            <ProofAndIdentityPropfComp
              t={t}
              title={t('address_proof')}
              setStateValue={setAddressProof}
              stateValue={addressProof}
              // !="APPROVED"
              //basudev
              status_level={statuslevel.label}
              photoDeletedValue={photoDeletedValue}
              setPhotoDeletedValue={setPhotoDeletedValue}
              loginUser_data={loginUser_data}
              disable={
                statuslevel.label == 'APPROVED' ||
                statuslevel.label == 'CARBON_DOCUMENTS_SUBMITTED' ||
                statuslevel.label == 'CARBON_DOCUMENTS_APPROVED' ||
                statuslevel.label === 'CARBON_DOCUMENTS_REJECTED'
                  ? false
                  : statuslevel.label == 'PENDING' ||
                    statuslevel.label == 'REJECTED'
                  ? false
                  : true
              }
              InputTextFormEdit={InputTextFormEdit}
              marginBottom={navigationBarHeight}
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
                  statuslevel.label == 'CARBON_DOCUMENTS_SUBMITTED' ||
                  statuslevel.label == 'CARBON_DOCUMENTS_APPROVED' ||
                  statuslevel.label === 'CARBON_DOCUMENTS_REJECTED'
                    ? false
                    : statuslevel.label == 'PENDING' ||
                      statuslevel.label == 'REJECTED'
                    ? false
                    : true
                }
                marginBottom={navigationBarHeight}
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

            {/* {area != 0 && area != null && (
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
                onChangeText={text => handleAddUserData('daag_no', text)}
                editable={false}
              />
            )} */}
            <View style={{marginTop: 10}}>
              <InputTextForm
                label={t('Enter IOT Id')}
                onChangeText={handleIOTId}
                value={farmerData.IOTId}
                // editable={(statuslevel.label != 'APPROVED' || statuslevel.label == 'CARBON_DOCUMENTS_SUBMITTED') && harvested == '' || harvested == 'same produce' ? false : true}
                // editable={InputTextFormEdit}
              />
            </View>
            <View style={styles.locationContainer}>
              <View style={styles.locationHeader}>
                <Text style={styles.locationTitle}>
                  {t('Geo tag IOT Device')}
                </Text>
                <TouchableOpacity
                  onPress={() => handleCurrentLatLongIOT()}
                  style={styles.locationStatusInactive}>
                  <MaterialIcons name="location-on" size={20} color="#F44336" />
                  <Text style={styles.locationStatusText}>
                    {t('tap_to_tag')}
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.coordinatesContainer}>
                <View style={styles.coordinateItem}>
                  <MaterialIcons name="pin-drop" size={16} color="#2196F3" />
                  <Text style={styles.coordinateText}>
                    {t('lat')}: {'  '}
                    {Number(farmerData.IOTLatLong).toFixed(6)}
                  </Text>
                </View>

                <View style={styles.coordinateItem}>
                  <MaterialIcons name="pin-drop" size={16} color="#2196F3" />
                  <Text style={styles.coordinateText}>
                    {t('long')}:{'  '}
                    {Number(farmerData.IOTLatlat).toFixed(6)}
                  </Text>
                </View>
                {/* <View style={styles.latlongContainer}>
                  <Text style={styles.title}>{farmerData.IOTLatlat}</Text>
                  <Text style={styles.title}>{farmerData.IOTLatLong}</Text>
                </View> */}
              </View>

              {/* <View style={styles.latlongContainer}>
                <Text style={styles.title}>
                  {t('Tap to take IOT lat long')}
                </Text>
                <Image
                  source={require('../../Common/images/location.png')}
                  style={{width: 40, height: 40}}
                  resizeMode="contain"
                />
              </View> */}
            </View>
            <View style={styles.labelContainer}>
              <Text style={styles.sectionTitle}>
                {t('plot_location_points')}
              </Text>
            </View>
            {location &&
              location.map((data, index) => (
                <View key={index} style={styles.locationContainer}>
                  <View style={styles.locationHeader}>
                    <Text style={styles.locationTitle}>
                      {t('location_point')} {index + 1}
                    </Text>

                    {data.latitude ? (
                      <TouchableOpacity
                        key={index}
                        onPress={() =>
                          data?.latitude != 10 && data?.latitude.length != ''
                            ? ''
                            : dataProps?.status_level != 'APPROVED'
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
                        key={index}
                        onPress={() =>
                          data?.latitude != 10 && data?.latitude.length != ''
                            ? ''
                            : dataProps?.status_level != 'APPROVED'
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
                        {t('lat')}:{'  '}
                        {data && data?.latitude && data?.latitude == ''
                          ? '0.0'
                          : Number(data?.latitude).toFixed(6)}
                      </Text>
                    </View>
                    <View style={styles.coordinateItem}>
                      <MaterialIcons
                        name="pin-drop"
                        size={16}
                        color="#2196F3"
                      />
                      <Text style={styles.coordinateText}>
                        {t('long')}:{'  '}
                        {data && data?.longitude && data?.longitude == ''
                          ? '0.0'
                          : Number(data?.longitude).toFixed(6)}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}

            {/* <DropdownForm
              label={t('addcrop_select_cultivating_season')}
              required={true}
              data={productionSeason}
              onChange={handleAddDataproductionSeason}
              val={farmerData.productionSeason}
              // disable={edit}
              disable={
                edit == '' ? (harvested == 'same produce' ? true : false) : edit
              }
            /> */}
            <DropdownForm
              label={t('addcrop_croptype')}
              required={true}
              data={livelihoodType}
              onChange={handleAddDatalivelihoodType}
              val={farmerData.livelihoodType}
              disable={
                edit == '' ? (harvested == 'same produce' ? true : false) : edit
              }
            />
            <DropdownForm
              label={t('crop_name')}
              required={true}
              data={produceName}
              onChange={handleAddDataproduceName}
              val={farmerData.produceName}
              disable={
                edit == '' ? (harvested == 'same produce' ? true : false) : edit
              }
            />
            <DropdownForm
              label={t('crop_veriety')}
              required={true}
              data={produceVariety}
              onChange={handleAddDataproduceVariety}
              // onChange={item => {
              //   handleAddData(item, 'produceVariety', 'produceVarietyValue');
              // }}
              val={farmerData.produceVariety}
              disable={
                edit == '' ? (harvested == 'same produce' ? true : false) : edit
              }
            />
            <DropdownForm
              label={t('production_system')}
              required={true}
              data={productionProcess}
              onChange={handleAddDataProductionProcess}
              val={farmerData.productionProcess}
              disable={
                edit == '' ? (harvested == 'same produce' ? true : false) : edit
              }
            />
            <View style={styles.plotSiteUnit}>
              <View style={{width: '45%'}}>
                <InputTextForm
                  label={t('expected_yield')}
                  keyboardType="number-pad"
                  required={true}
                  value={farmerData.expectedProduction}
                  onChangeText={handleAddUserDataExpected}
                  // editable={
                  //   edit == ''
                  //     ? harvested == 'same produce'
                  //       ? false
                  //       : true
                  //     : !edit
                  // }
                />
              </View>
              <View style={{width: '45%'}}>
                <DropdownForm
                  label={`${t('select_unit_input')}`}
                  required={true}
                  data={productionUnit}
                  onChange={handleAddDataUnitProduct}
                  val={farmerData.unitProduct}
                  // disable={edit}
                  // disable={
                  //   edit == ''
                  //     ? harvested == 'same produce'
                  //       ? true
                  //       : false
                  //     : edit
                  // }
                />
              </View>
            </View>
            <View style={{marginBlock: 15}}>
              <TouchableOpacity
                onPress={() =>
                  harvested != '' ||
                  userData == 'addUserData' ||
                  addPlot == true
                    ? setopenCycleStart(true)
                    : null
                }
                activeOpacity={9}>
                <View style={styles.labelContainer2}>
                  <Text
                    style={{
                      color: '#4e4e4e',
                      fontFamily: Fonts.Regular,
                      fontSize: 15,
                    }}>
                    {t('showing_date')}
                    <Text style={styles.requiredStar}> *</Text>
                  </Text>
                </View>
                <View style={styles.calenderContainer}>
                  <Text style={{color: '#000'}}>
                    {farmerData.cycleStartDate}
                  </Text>
                  <Image
                    source={require('../../Common/images/calendar.png')}
                    style={{width: 20, height: 20, tintColor: Colors.useGreen}}
                  />
                </View>
              </TouchableOpacity>
            </View>
            <DropdownForm
              label={t('addcrop_select_cultivating_season')}
              required={true}
              data={productionSeason}
              onChange={handleAddDataproductionSeason}
              val={farmerData.productionSeason}
              // disable={edit}
              disable={
                edit == '' ? (harvested == 'same produce' ? true : false) : edit
              }
            />
            <View style={{marginBottom: 40}}>
              <TouchableOpacity
                onPress={() =>
                  harvested != '' ||
                  userData == 'addUserData' ||
                  addPlot == true
                    ? setopenCycleEnd(true)
                    : null
                }
                activeOpacity={9}>
                <View style={styles.labelContainer2}>
                  <Text
                    style={{
                      color: '#4e4e4e',
                      fontFamily: Fonts.Regular,
                      fontSize: 15,
                    }}>
                    {t('harvesting_date_auto_calculated')}
                  </Text>
                  <Text style={styles.requiredStar}> *</Text>
                </View>
                <View style={styles.calenderContainer}>
                  <Text style={{color: '#000'}}>{farmerData.cycleEndDate}</Text>
                  <Image
                    source={require('../../Common/images/calendar.png')}
                    style={{width: 20, height: 20, tintColor: Colors.useGreen}}
                  />
                </View>
              </TouchableOpacity>
            </View>
            {(statuslevel.label == 'APPROVED' ||
              statuslevel.label == 'CARBON_DOCUMENTS_SUBMITTED' ||
              statuslevel.label == 'CARBON_DOCUMENTS_APPROVED' ||
              statuslevel.label === 'CARBON_DOCUMENTS_REJECTED' ||
              statuslevel.label == 'CARBON_DOCUMENTS_REJECTED') &&
            carbonFlag == true ? (
              <View style={{marginTop: 15}}>
                <CarbonCertificate
                  identityProofIdentityPropf={carboncertificate}
                  t={t}
                  title={t('Carbon certificate')}
                  setStateValue={setCarboncertificate}
                  stateValue={carboncertificate}
                  status_level={
                    carboncertificate[0]?.uri?.startsWith('content://')
                      ? ''
                      : statuslevel.label
                  }
                  disable={
                    statuslevel.label == 'APPROVED'
                      ? true
                      : statuslevel.label == 'CARBON_DOCUMENTS_SUBMITTED' ||
                        statuslevel.label == 'CARBON_DOCUMENTS_APPROVED' ||
                        statuslevel.label === 'CARBON_DOCUMENTS_REJECTED'
                      ? false
                      : true
                  }
                  InputTextFormEdit={
                    statuslevel.label == 'APPROVED' ? true : false
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
        </ScrollView>

        <ButtonForm
          label={t('submit')}
          onPress={() => handleUserListUpdate()}
          loading={isLoading}
        />
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
            }}
            animationType="slide">
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
      </>
    </MyErrorBoundary>
  );
};
export default LiveHood;
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
    alignItems: 'baseline',
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
    backgroundColor: '#FFF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 5,
    // elevation: 1,
    height: 48,
    borderWidth: 0.5,
    borderColor: Colors.useGreen,
  },
  title: {
    color: '#000',
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
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
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
  },
  LoadingScreen: {
    position: 'absolute',
    top: '52%',
    left: '45%',
    zIndex: 9999,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
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
  labelContainer2: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  requiredStar: {
    color: 'red',
    fontFamily: Fonts.Medium,
    fontSize: 16,
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
    marginLeft: 2,
    fontSize: 13,
    color: '#0D47A1',
    fontFamily: 'Poppins-Regular',
  },
  coordinatePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 5,
    backgroundColor: '#F5F5F5',
  },
  placeholderText: {
    fontSize: 13,
    color: '#757575',
    fontFamily: 'Poppins-Regular',
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
    marginTop: 10,
  },
});
