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
import {
  farmerByNameAPI,
  problemPlotAgainstFarmerAPI,
  showCarbonFlag,
} from '../../config/apiHere';
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
const ImagePlaceHolderCircle = lazy(() =>
  import('../Common/ImagePlaceHolderCircle'),
);
const InputTextForm = lazy(() => import('../Common/InputTextForm'));
const RadioForm = lazy(() => import('../Common/RadioForm'));
const PasswordComp = lazy(() => import('../Common/PasswordComp'));
const ButtonForm = lazy(() => import('../Common/ButtonForm'));
const DropdownForm = lazy(() => import('../Common/DropdownForm'));
const CustomHeader = lazy(() => import('../admin/CustomHeader'));
const LoadingScreen = lazy(() => import('../Common/LoadingScreen'));
const DatePickerComp = lazy(() => import('../Common/DatePickerComp'));
const ButtonFormBottom = lazy(() => import('../Common/ButtonFormBottom'));
const Filter = lazy(() => import('../Common/Filter'));
const DatePicker = lazy(() => import('react-native-date-picker'));
const config = lazy(() => import('../../config'));
const axios = lazy(() => import('axios'));
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
    mocked:'',
  });
  const [locationSettings, setLocationSettings] = useState({
    enableHighAccuracy: true,
    accuracy: { android: 'high', ios: 'best' },
    distanceFilter: 5,
    interval: 3000,
    fastestInterval: 1000,
    timeout: 20000,
    maximumAge: 0,
    forceRequestLocation: true,
    showLocationDialog: true,
  });
  const watchIdRef = useRef(null);
  const requestPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'This app needs to access your location',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
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
  const startWatchingLocation = async () => {
    const hasPermission = await requestPermission();
    if (!hasPermission) {
      Alert.alert('Permission Required', 'Location permission not granted.');
      return;
    }
    const gpsEnabled = await ensureGpsEnabled();
    if (!gpsEnabled) {
      Alert.alert('Enable GPS', 'Please enable GPS to use location services.', [
        {
          text: 'Enable',
          onPress: async () => {
            try {
              await promptForEnableLocationIfNeeded();
            } catch (err) {
              console.warn('GPS enable request failed', err);
            }
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]);
      return;
    }

    // Clear previous watch before starting a new one
    if (watchIdRef.current) {
      Geolocation.clearWatch(watchIdRef.current);
    }
    watchIdRef.current = Geolocation.watchPosition(
      pos => {
        console.log('pos i', pos);
        if (!pos || !pos.coords) {
          Alert.alert('Unable to fetch location. Please try again.');
          return;
        }

        setCoords(prev => {
          if (
            prev.latitude === pos.coords.latitude &&
            prev.longitude === pos.coords.longitude &&
            prev.accuracy === pos.coords.accuracy
          ) {
            return prev; // No change
          }
          return {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            timestamp: pos.timestamp,
            mocked:pos.mocked,
          };
        });
      },
      err => {
        console.error('Location error:', err);
        if (err.code === 1) {
          Alert.alert('Permission Denied', 'Location permission denied.');
        } else if (err.code === 2) {
          Alert.alert('GPS Off', 'GPS is turned off. Please enable it.');
        } else if (err.code === 3) {
          Alert.alert('Timeout', 'Location request timed out.');
        } else {
          Alert.alert('Unable to get location. Please try again.');
        }
      },
      locationSettings
    );

    // Fallback if no location update within 15 sec
    // setTimeout(() => {
    //   if (!coords.latitude || !coords.longitude) {
    //     Alert.alert('No GPS response. Please move to open sky or enable GPS.');
    //   }
    // }, 15000);
  };

  const stopWatchingLocation = () => {
    if (watchIdRef.current) {
      Geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };

  // ---------- INIT: Start Watching Once ----------
  useEffect(() => {
    startWatchingLocation();
    return () => stopWatchingLocation();
  }, []);
  useEffect(() => {
    if (watchIdRef.current) {
      stopWatchingLocation();
      startWatchingLocation();
    }
  }, [locationSettings]);

  // ---------- API: Get Farmers ----------
  const AllFarmerList = async () => {
    try {
      let farmer_response = [];
      let responsePlot = [];
      let resCarbonFlag = [];

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
        [farmer_response, responsePlot, resCarbonFlag] = await Promise.all([
          farmerByNameAPI(
            loginUser_data?.dbname,
            loginUser_data?.lan_id,
            loginUser_data?.token,
            loginUser_data?.user_id,
          ),
          problemPlotAgainstFarmerAPI(
            loginUser_data?.dbname,
            loginUser_data?.lan_id,
            loginUser_data?.token,
            loginUser_data?.user_id,
          ),
          showCarbonFlag(
            loginUser_data?.token,
            loginUser_data?.dbname,
            loginUser_data?.lan_id,
            loginUser_data?.user_id,
          ),
        ]);
        if (farmer_response?.status == 200) {
          await Promise.all([
            setItem('farmerByNameAPI', farmer_response),
            setItem(
              'problemPlotAgainstFarmer' + loginUser_data?.user_id,
              responsePlot,
            ),
            setItem('carbonFlag', resCarbonFlag),
          ]);
        }
      } else {
        [farmer_response, responsePlot, resCarbonFlag] = await Promise.all([
          getItem('farmerByNameAPI'),
          getItem('problemPlotAgainstFarmer' + loginUser_data?.user_id),
          getItem('carbonFlag'),
        ]);
      }

      if (farmer_response?.status == 200) {
        let supervisorId = '';
        if (loginUser_data?.userType == 2) {
          supervisorId = loginUser_data?.owner?.user_id;
        } else if (loginUser_data?.userType == 3) {
          supervisorId = loginUser_data?.user_id;
        }
        const { company, country_id } = companyLanguage_data;
        const { option_value } = resCarbonFlag?.data?.data || {};
        setlogoImage(logoImageData);
        settopBanner(topBannerData);
        setloginUser_data({
          ...loginUser_data,
          carbonFlag: option_value,
        });
        setdbLanTokUsr({
          ...dbLanTokUsr,
          dbName: loginUser_data?.dbname,
          languageId: loginUser_data?.lan_id,
          token: loginUser_data?.token,
          supervisorId,
          farmerId: loginUser_data?.user_id,
          agri_user_addresses: loginUser_data?.agri_user_addresses,
          country: loginUser_data?.agri_user_addresses?.[0]?.country,
          company: loginUser_data?.db_company_id,
          owner: loginUser_data?.owner?.FcmUserToken,
          FcmUserToken: loginUser_data?.FcmUserToken,
          languageConpany: company,
          country_id,
          carbonFlag: option_value,
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

  // ---------- INIT: Load Farmers ----------
  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      AllFarmerList();
    });
    return () => task.cancel();
  }, [netConnection]);

  // ---------- HELPERS ----------
  const effective_dates = item => {
    if (!item) return '';
    const dt = new Date(item);
    return dt.toISOString().split('T')[0];
  };

  // ---------- PROVIDER VALUE ----------
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
      setLocationSettings,
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
      locationSettings,
    ],
  );

  return (
    <userCreateContext.Provider value={contextValue}>
      {props.children}
    </userCreateContext.Provider>
  );
};

export { userListContext, UserCreateContextProvider, userCreateContext };