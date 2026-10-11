import React, {
  createContext,
  useEffect,
  useState,
  useRef,
  useMemo,
  lazy,
  useCallback,
  Suspense,
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
import { Root, Toast, Popup, SPSheet } from '@sekizlipenguen/react-native-popup-confirm-toast';
import { onBackPress } from '../Common/BackPressHandler';
import DeviceInfo from '../DeviceInfo';
import i18next from 'i18next';
import { getNavigationBarHeight } from 'react-native-android-navbar-height';

// ========== LAZY LOAD ALL COMPONENTS ==========
const LazyComponents = {
  ImagePlaceHolderCircle: lazy(() => import('../Common/ImagePlaceHolderCircle')),
  InputTextForm: lazy(() => import('../Common/InputTextForm')),
  RadioForm: lazy(() => import('../Common/RadioForm')),
  PasswordComp: lazy(() => import('../Common/PasswordComp')),
  ButtonForm: lazy(() => import('../Common/ButtonForm')),
  DropdownForm: lazy(() => import('../Common/DropdownForm')),
  CustomHeader: lazy(() => import('../admin/CustomHeader')),
  LoadingScreen: lazy(() => import('../Common/LoadingScreen')),
  DatePickerComp: lazy(() => import('../Common/DatePickerComp')),
  ButtonFormBottom: lazy(() => import('../Common/ButtonFormBottom')),
  Filter: lazy(() => import('../Common/Filter')),
  DatePicker: lazy(() => import('react-native-date-picker')),
  config: lazy(() => import('../../config')),
  axios: lazy(() => import('axios')),
};

// ========== CONTEXT CREATION ==========
const userCreateContext = createContext();
const userListContext = createContext('adduser');

// ========== CONSTANTS ==========
const INITIAL_COORDS = { latitude: '', longitude: '', accuracy: '', timestamp: '' };
const GPS_CONFIG = {
  enableHighAccuracy: true,
  distanceFilter: 5,
  interval: 5000,
  fastestInterval: 2000,
  timeout: 20000,
  maximumAge: 0,
};

// ========== HELPER FUNCTIONS ==========
const requestLocationPermission = async () => {
  if (Platform.OS !== 'android') return true;

  try {
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
  } catch (error) {
    console.error('Permission Error:', error);
    return false;
  }
};

const checkGpsEnabled = async () => {
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
    console.warn('GPS Check Error:', err);
    return false;
  }
};

const getErrorMessage = (errCode) => {
  const messages = {
    1: { title: 'Permission Denied', msg: 'Location permission denied.' },
    2: { title: 'GPS Off', msg: 'GPS is turned off. Please enable it.' },
    3: { title: 'Timeout', msg: 'Location request timed out.' },
  };
  return messages[errCode] || { title: 'Error', msg: 'Unable to get location. Please try again.' };
};

const transformFarmerData = (rows) => {
  return rows.map(data => ({
    value: data.user_id,
    label: data.userName,
    phone: data.contactNumber,
    aadharNumber: data?.aadhar_number,
    kccNumber: data?.kcc_number,
    FcmUserToken: data?.FcmUserToken,
    agri_user_addresses: data.agri_user_addresses,
    agri_crop_user_rels: data.agri_crop_user_rels,
  }));
};

// ========== PROVIDER COMPONENT ==========
const UserCreateContextProvider = ({ children }) => {
  const { netConnection } = DeviceInfo();
  const { t } = useTranslation();

  // ========== STATE ==========
  const [userState, setUserState] = useState({
    dbLanTokUsr: {},
    farmerData: [],
    loginUser_data: {},
    logoImage: '',
    topBanner: '',
    plotAll: [],
    navigationBarHeight: 0,
  });

  const [coords, setCoords] = useState(INITIAL_COORDS);
  const watchIdRef = useRef(null);
  const gpsTimeoutRef = useRef(null);
  const initGpsRef = useRef(false);

  // ========== GPS: STOP WATCHING ==========
  const stopWatchingLocation = useCallback(() => {
    if (watchIdRef.current) {
      Geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (gpsTimeoutRef.current) {
      clearTimeout(gpsTimeoutRef.current);
      gpsTimeoutRef.current = null;
    }
    setCoords(INITIAL_COORDS);
    console.log('✓ GPS Watching Stopped');
  }, []);

  // ========== GPS: START WATCHING ==========
  const startWatchingLocation = useCallback(async () => {
    // if(coords.latitude==""){
    //   alert("aaaaaaaaa")
    // }
    return;
    if (initGpsRef.current) return;
    initGpsRef.current = true;
    try {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        Alert.alert('Permission Required', 'Location permission not granted.');
        initGpsRef.current = false;
        return;
      }

      const gpsEnabled = await checkGpsEnabled();
      if (!gpsEnabled) {
        Alert.alert('Enable GPS', 'Please enable GPS to use location services.', [
          {
            text: 'Enable',
            onPress: async () => {
              try {
                await promptForEnableLocationIfNeeded();
                initGpsRef.current = false;
                startWatchingLocation();
              } catch (err) {
                console.warn('GPS enable failed:', err);
                initGpsRef.current = false;
              }
            },
          },
          { text: 'Cancel', style: 'cancel', onPress: () => (initGpsRef.current = false) },
        ]);
        return;
      }

      if (watchIdRef.current) {
        Geolocation.clearWatch(watchIdRef.current);
      }

      watchIdRef.current = Geolocation.watchPosition(
        pos => {
          if (!pos?.coords) {
            Alert.alert('Error', 'Unable to fetch location. Please try again.');
            return;
          }
          console.log("pos.coords", pos.coords)
          const { latitude, longitude, accuracy } = pos.coords;
          setCoords(prev => {
            if (prev.latitude === latitude && prev.longitude === longitude && prev.accuracy === accuracy) {
              return prev;
            }
            return { latitude, longitude, accuracy, timestamp: pos.timestamp };
          });
        },
        err => {
          console.error('Location error:', err);
          const { title, msg } = getErrorMessage(err.code);
          Alert.alert(title, msg);
        },
        GPS_CONFIG,
      );

      gpsTimeoutRef.current = setTimeout(() => {
        if (!coords.latitude || !coords.longitude) {
          console.warn('GPS Timeout - No Response');
        }
      }, 15000);
    } catch (error) {
      console.error('GPS Start Error:', error);
      initGpsRef.current = false;
    }
  }, [coords.latitude, coords.longitude]);

  // ========== API: GET FARMERS ==========
  const AllFarmerList = useCallback(async () => {
    try {
      const [loginUserData, logoImageData, topBannerData, companyLanguageData, navHeight] = await Promise.all([
        getItem('loginUser_data'),
        getItem('logoImageData'),
        getItem('topBannerData'),
        getItem('companyLanguage_data'),
        getNavigationBarHeight(),
      ]);

      if (!loginUserData?.token) {
        console.warn('No auth token');
        return;
      }

      i18next.changeLanguage(loginUserData?.lan_id?.toString());

      const [farmerRes, plotRes, carbonFlagRes] = netConnection
        ? await Promise.all([
          farmerByNameAPI(loginUserData.dbname, loginUserData.lan_id, loginUserData.token, loginUserData.user_id),
          problemPlotAgainstFarmerAPI(loginUserData.dbname, loginUserData.lan_id, loginUserData.token, loginUserData.user_id),
          showCarbonFlag(loginUserData.token, loginUserData.dbname, loginUserData.lan_id, loginUserData.user_id),
        ])
        : await Promise.all([
          getItem('farmerByNameAPI'),
          getItem(`problemPlotAgainstFarmer${loginUserData.user_id}`),
          getItem('carbonFlag'),
        ]);

      if (netConnection && farmerRes?.status === 200) {
        await Promise.all([
          setItem('farmerByNameAPI', farmerRes),
          setItem(`problemPlotAgainstFarmer${loginUserData.user_id}`, plotRes),
          setItem('carbonFlag', carbonFlagRes),
        ]);
      }

      if (farmerRes?.status === 200) {
        const supervisorId = loginUserData.userType === 2
          ? loginUserData.owner?.user_id
          : loginUserData.userType === 3 ? loginUserData.user_id : '';

        const { company, country_id } = companyLanguageData || {};
        const carbonFlag = carbonFlagRes?.data?.data?.option_value;
        const farmerRows = farmerRes.data?.data?.rows || [];
        const plotRows = plotRes?.data?.data || [];

        const farmerDataTransformed = transformFarmerData(farmerRows);

        setUserState(prev => ({
          ...prev,
          navigationBarHeight: navHeight,
          logoImage: logoImageData,
          topBanner: topBannerData,
          loginUser_data: { ...loginUserData, carbonFlag },
          dbLanTokUsr: {
            dbName: loginUserData.dbname,
            languageId: loginUserData.lan_id,
            token: loginUserData.token,
            supervisorId,
            farmerId: loginUserData.user_id,
            agri_user_addresses: loginUserData.agri_user_addresses,
            country: loginUserData.agri_user_addresses?.[0]?.country,
            company: loginUserData.db_company_id,
            owner: loginUserData.owner?.FcmUserToken,
            FcmUserToken: loginUserData.FcmUserToken,
            languageConpany: company,
            country_id,
            carbonFlag,
          },
          farmerData: [farmerDataTransformed, farmerDataTransformed],
          plotAll: plotRows.map(data => ({ value: data.rel_id, label: data.plot_no })),
        }));
      }
    } catch (error) {
      console.error('AllFarmerList Error:', error);
    }
  }, [netConnection]);

  // ========== HELPER: EFFECTIVE DATES ==========
  const effective_dates = useCallback(item => {
    if (!item) return '';
    return new Date(item).toISOString().split('T')[0];
  }, []);

  // ========== INIT: LOAD DATA & START GPS ==========
  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      AllFarmerList();
      startWatchingLocation();
    });

    return () => {
      task.cancel();
      stopWatchingLocation();
    };
  }, [netConnection, AllFarmerList, startWatchingLocation, stopWatchingLocation]);

  // ========== MEMOIZED CONTEXT VALUE ==========
  const contextValue = useMemo(
    () => ({
      ...userState,
      coords,
      setCoords,
      AllFarmerList,
      isOnline: netConnection,
      startWatchingLocation,
      stopWatchingLocation,
      t,
      AlertMesg,
      onBackPress,
      getItem,
      setItem,
      removeItem,
      effective_dates,
      Root,
      Toast,
      Popup,
      SPSheet,
      DeviceInfo,
      ...LazyComponents,
    }),
    [userState, coords, netConnection, AllFarmerList, startWatchingLocation, stopWatchingLocation, t, effective_dates],
  );

  return (
    <userCreateContext.Provider value={contextValue}>
      <Suspense fallback={null}>
        {children}
      </Suspense>
    </userCreateContext.Provider>
  );
};

export { userListContext, UserCreateContextProvider, userCreateContext };