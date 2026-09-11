import React, {
  createContext,
  useEffect,
  useState,
  useRef,
  useMemo,
  lazy,
} from 'react';
import {
  Alert,
  InteractionManager,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import {
  isLocationEnabled,
  promptForEnableLocationIfNeeded,
} from 'react-native-android-location-enabler';
import { getItem, setItem, removeItem } from '../../config/getDataFromStorage';
import { useTranslation } from 'react-i18next';
import { AlertMesg } from '../Common/ToastAlert';
import {
  Root,
  Toast,
  Popup,
  SPSheet,
} from '@sekizlipenguen/react-native-popup-confirm-toast';
import { onBackPress } from '../Common/BackPressHandler';
import DeviceInfo from '../DeviceInfo';
import i18next from 'i18next';
import { getNavigationBarHeight } from 'react-native-android-navbar-height';
import EncryptedStorage from 'react-native-encrypted-storage';
import RNRestart from 'react-native-restart';
import { axiosGet } from '../utils/api';
import { ROUTES } from '../utils/Routes';
import ImagePlaceHolderCircle from '../Common/ImagePlaceHolderCircle';
import InputTextForm from '../Common/InputTextForm';
import RadioForm from '../Common/RadioForm';
import PasswordComp from '../Common/PasswordComp';
import ButtonForm from '../Common/ButtonForm';
import DropdownForm from '../Common/DropdownForm';
import CustomHeader from '../admin/CustomHeader';
import LoadingScreen from '../Common/LoadingScreen';
import DatePickerComp from '../Common/DatePickerComp';
import ButtonFormBottom from '../Common/ButtonFormBottom';
import Filter from '../Common/Filter';
import DatePicker from 'react-native-date-picker';
import config from '../../config';
import axios from 'axios';

const userCreateContext = createContext();
const userListContext = createContext('adduser');

const UserCreateContextProvider = props => {
  const { netConnection } = DeviceInfo();
  const { t } = useTranslation();

  const [dbLanTokUsr, setdbLanTokUsr] = useState({});
  const [farmerData, setFarmerData] = useState([]);
  const [loginUser_data, setloginUser_data] = useState({});
  const [logoImage, setlogoImage] = useState('');
  const [topBanner, settopBanner] = useState('');
  const [plotAll, setPlotAll] = useState([]);
  const [navigationBarHeight, setNavigationBarHeight] = useState(0);
  const [coords, setCoords] = useState({
    latitude: '',
    longitude: '',
    accuracy: '',
    timestamp: '',
    mocked: '',
  });

  const watchIdRef = useRef(null);
  const locationIntervalRef = useRef(null);
  const mockAlertShown = useRef(false);

  // -------- Permissions ----------
  const requestPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'This app needs access to your location for security.',
          buttonPositive: 'OK',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  const ensureGpsEnabled = async () => {
    try {
      const enabled = await isLocationEnabled();
      if (!enabled) {
        const result = await promptForEnableLocationIfNeeded({
          interval: 10000,
          fastInterval: 5000,
        });
        return result === 'enabled' || result === 'already-enabled';
      }
      return true;
    } catch (err) {
      console.warn('Error checking GPS:', err);
      return false;
    }
  };

  // -------- Handle Mock Detection ----------
  const handleMockDetected = async () => {
    if (mockAlertShown.current) return; // prevent repeat
    mockAlertShown.current = true;

    Alert.alert(
      'Security Alert',
      'Mock location detected! The app will restart for security reasons.',
      [
        {
          text: 'OK',
          onPress: async () => {
            try {
              await EncryptedStorage.clear();
              console.log('🧹 Cleared secure storage');
            } catch (e) {
              console.log('Error clearing EncryptedStorage:', e);
            }
            setTimeout(() => {
              RNRestart.restart();
            }, 800);
          },
        },
      ],
      { cancelable: false },
    );
  };

  // -------- Start Watching Location ----------
  const startWatchingLocation = async () => {
    const hasPermission = await requestPermission();
    if (!hasPermission) {
      Alert.alert('Permission Required', 'Location permission not granted.');
      return;
    }

    const gpsEnabled = await ensureGpsEnabled();
    if (!gpsEnabled) {
      Alert.alert('Enable GPS', 'Please enable GPS to use location services.');
      return;
    }

    // Warm up GPS (get first fix quickly)
    Geolocation.getCurrentPosition(
      pos => console.log('Initial fix:', pos.coords),
      err => console.log('Warm-up error:', err),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );

    if (watchIdRef.current) {
      Geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (locationIntervalRef.current) {
      clearInterval(locationIntervalRef.current);
      locationIntervalRef.current = null;
    }

    // Main watcher
    watchIdRef.current = Geolocation.watchPosition(
      pos => {
        if (!pos || !pos.coords) return;
        if (__DEV__) {
          console.log(
            `📍 lat:${pos.coords.latitude}, lon:${pos.coords.longitude}, acc:${pos.coords.accuracy}m, mocked:${pos.mocked}`,
          );
        }
        if (pos.mocked === true) {
          handleMockDetected();
          return;
        }
        if (pos.coords.accuracy > 50) {
          console.log('Skipping inaccurate reading (>50m)');
          return;
        }

        setCoords(prev => {
          if (
            prev.latitude === pos.coords.latitude &&
            prev.longitude === pos.coords.longitude &&
            prev.accuracy === pos.coords.accuracy
          ) {
            return prev;
          }
          return {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            timestamp: pos.timestamp,
            mocked: pos.mocked,
          };
        });
      },
      err => {
        console.error('Location error:', err);
        if (err.code === 1)
          Alert.alert('Permission Denied', 'Location permission denied.');
        else if (err.code === 2)
          Alert.alert('GPS Off', 'GPS is turned off. Please enable it.');
        else if (err.code === 3)
          Alert.alert('Timeout', 'Location request timed out.');
        else Alert.alert('Unable to get location.');
      },
      {
        enableHighAccuracy: true, // Use GPS hardware
        accuracy: { android: 'high', ios: 'bestForNavigation' },
        distanceFilter: 3, // every small move
        interval: 3000,
        fastestInterval: 1000,
        timeout: 20000,
        maximumAge: 0,
        forceRequestLocation: true,
        showLocationDialog: true,
      },
    );
    locationIntervalRef.current = setInterval(() => {
      Geolocation.getCurrentPosition(
        p => {
          if (p?.mocked === true) handleMockDetected();
        },
        () => { },
        { enableHighAccuracy: true, timeout: 10000 },
      );
    }, 10000);
  };

  const stopWatchingLocation = () => {
    if (watchIdRef.current) {
      Geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (locationIntervalRef.current) {
      clearInterval(locationIntervalRef.current);
      locationIntervalRef.current = null;
    }
  };

  useEffect(() => {
    startWatchingLocation();
    return () => {
      stopWatchingLocation();
    };
  }, []);
  const AllFarmerList = async () => {
    try {
      let farmer_response = [];
      let responsePlot = [];
      let resCarbonFlag = [];
      let DetailsCompany_res = [];
      let co_farmer = 0;
      let offline_mode = 0;
      const [
        loginUser_data,
        logoImageData,
        topBannerData,
        companyLanguage_data,
        getNavigationBar,
      ] = await Promise.all([
        getItem('loginUser_data'),
        getItem('logoImageData'),
        getItem('topBannerData'),
        getItem('companyLanguage_data'),
        getNavigationBarHeight(),
      ]);
      setNavigationBarHeight(getNavigationBar);
      i18next.changeLanguage(loginUser_data?.lan_id?.toString());
      if (netConnection && loginUser_data?.token) {
        const { dbname, lan_id, token, user_id, db_company_id } =
          loginUser_data || {};
        [farmer_response, responsePlot, resCarbonFlag, DetailsCompany_res] =
          await Promise.all([
            axiosGet(ROUTES.GET.LIST_USER({ user_id: user_id }), token, {
              information: `${dbname},${lan_id}`,
            }),
            axiosGet(
              ROUTES.GET.PLOT_AGAINST_FARMER({ user_id: user_id }),
              token,
              { information: `${dbname},${lan_id}` },
            ),
            axiosGet(ROUTES.GET.SHOW_CARBON_FLAG, token, {
              information: `${dbname},${lan_id}`,
            }),
            axiosGet(ROUTES.GET.DETAILS_COMPANY(db_company_id), token, {
              information: `${dbname},1`,
            }),
          ]);
        if (DetailsCompany_res?.status == 200) {
          co_farmer = DetailsCompany_res.data.data?.[0]?.co_farmer;
          offline_mode = DetailsCompany_res.data.data?.[0]?.offline_mode;
        }
        if (farmer_response?.status == 200) {
          await Promise.all([
            setItem('farmerByNameAPI', farmer_response),
            setItem(
              'problemPlotAgainstFarmer' + loginUser_data?.user_id,
              responsePlot,
            ),
            setItem('carbonFlag', resCarbonFlag),
            setItem('detailsCompany', DetailsCompany_res),
          ]);
        }
      } else {
        [farmer_response, responsePlot, resCarbonFlag, DetailsCompany_res] = await Promise.all([
          getItem('farmerByNameAPI'),
          getItem('problemPlotAgainstFarmer' + loginUser_data?.user_id),
          getItem('carbonFlag'),
          getItem('detailsCompany'),
        ]);
      }
      if (farmer_response?.status == 200) {
        let supervisorId = '';
        if (loginUser_data?.userType == 2) {
          supervisorId = loginUser_data?.owner?.user_id;
        } else if (loginUser_data?.userType == 3) {
          supervisorId = loginUser_data?.user_id;
        }
        const {
          ai_camera_pipe_image = "0",
          ai_camera_id_proof = "0",
          // co_farmer = "0",
          pipe_qr_code = "0",
        } = DetailsCompany_res?.data?.data?.[0] || {};

        const { company, country_id } = companyLanguage_data;
        const { option_value, option_name } = resCarbonFlag?.data?.data || {};
        console.log("Carbon mangrove", resCarbonFlag?.data?.data)
        setlogoImage(logoImageData);
        settopBanner(topBannerData);
        setloginUser_data({
          ...loginUser_data,
          carbonFlag: option_value,
          carbonType: option_name == "Carbon mangrove" ? 'mangrove' : option_name,
        });
        setdbLanTokUsr({
          dbName: loginUser_data?.dbname,
          languageId: loginUser_data?.lan_id,
          token: loginUser_data?.token,
          farmerId: loginUser_data?.user_id,
          supervisorId,
          country: loginUser_data?.agri_user_addresses?.[0]?.country,
          company: loginUser_data?.db_company_id,
          FcmUserToken: loginUser_data?.FcmUserToken,
          languageConpany: company,
          country_id,
          carbonFlag: option_value,
          carbonType: option_name == "Carbon mangrove" ? 'mangrove' : option_name,
          co_farmer,
          offline_mode,
          ai_camera_pipe_image,
          ai_camera_id_proof,
        });
        const dataArrayName = farmer_response?.data?.data?.rows.map(data => ({
          value: data.user_id,
          label: data.userName,
          phone: data.contactNumber,
          aadharNumber: data?.aadhar_number,
          kccNumber: data?.kcc_number,
          FcmUserToken: data?.FcmUserToken,
          agri_user_addresses: data.agri_user_addresses,
          agri_crop_user_rels: data.agri_crop_user_rels,
        }));
        const dataArrayPhone = farmer_response?.data?.data?.rows.map(data => ({
          value: data.user_id,
          label: data.contactNumber,
          phone: data.contactNumber,
          aadharNumber: data?.aadhar_number,
          kccNumber: data?.kcc_number,
          FcmUserToken: data?.FcmUserToken,
          agri_user_addresses: data.agri_user_addresses,
          agri_crop_user_rels: data.agri_crop_user_rels,
        }));
        setFarmerData([dataArrayName, dataArrayPhone]);
        const PlotArray = responsePlot?.data?.data.map(data => ({
          value: data.rel_id,
          label: data.plot_no,
        }));
        setPlotAll(PlotArray);
      }
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      AllFarmerList();
    });
    return () => task.cancel();
  }, [netConnection]);
  const effective_dates = item => {
    if (!item) return '';
    const dt = new Date(item);
    return dt.toISOString().split('T')[0];
  };
  const contextValue = useMemo(
    () => ({
      dbLanTokUsr,
      setdbLanTokUsr,
      AllFarmerList,
      farmerData,
      loginUser_data,
      isOnline: netConnection,
      coords,
      setCoords,
      startWatchingLocation,
      stopWatchingLocation,
      t,
      AlertMesg,
      onBackPress,
      getItem,
      setItem,
      removeItem,
      InputTextForm,
      RadioForm,
      PasswordComp,
      ButtonForm,
      axios,
      config,
      DeviceInfo,
      DropdownForm,
      Root,
      Toast,
      Popup,
      SPSheet,
      CustomHeader,
      ImagePlaceHolderCircle,
      logoImage,
      topBanner,
      setlogoImage,
      settopBanner,
      DatePicker,
      LoadingScreen,
      DatePickerComp,
      ButtonFormBottom,
      effective_dates,
      Filter,
      plotAll,
      setPlotAll,
      navigationBarHeight,
    }),
    [
      dbLanTokUsr,
      farmerData,
      loginUser_data,
      netConnection,
      coords,
      logoImage,
      topBanner,
      plotAll,
      navigationBarHeight,
    ],
  );

  return (
    <userCreateContext.Provider value={contextValue}>
      {props.children}
    </userCreateContext.Provider>
  );
};

export { userListContext, UserCreateContextProvider, userCreateContext };
