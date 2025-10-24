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
import {getItem, setItem, removeItem} from '../../config/getDataFromStorage';
import {
  farmerByNameAPI,
  problemPlotAgainstFarmerAPI,
  showCarbonFlag,
} from '../../config/apiHere';
import {useTranslation} from 'react-i18next';
import {AlertMesg} from '../Common/ToastAlert';
import {
  Root,
  Toast,
  Popup,
  SPSheet,
} from '@sekizlipenguen/react-native-popup-confirm-toast';
import {onBackPress} from '../Common/BackPressHandler';
import DeviceInfo from '../DeviceInfo';
import i18next from 'i18next';
import {getNavigationBarHeight} from 'react-native-android-navbar-height';

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
  const {netConnection} = DeviceInfo();
  const {t} = useTranslation();
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
  });
  
  const watchIdRef = useRef(null);
  const fallbackTimeoutRef = useRef(null);
  const locationRetryCountRef = useRef(0);
  const hasValidLocationRef = useRef(false);
  const MAX_RETRIES = 3;

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

  // 🔥 ENHANCED: Comprehensive coordinate validation
  const isValidCoordinate = (lat, lng, accuracy) => {
    // Check for null/undefined
    if (lat == null || lng == null || accuracy == null) {
      return false;
    }
    
    // Check type and NaN
    if (typeof lat !== 'number' || typeof lng !== 'number' || typeof accuracy !== 'number') {
      return false;
    }
    
    if (isNaN(lat) || isNaN(lng) || isNaN(accuracy)) {
      return false;
    }
    
    // Check valid ranges
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return false;
    }
    
    // Check for zero coordinates (common error case)
    if (lat === 0 && lng === 0) {
      return false;
    }
    
    return true;
  };

  // 🔥 ENHANCED: Process location with null safety
  const processLocationUpdate = (pos) => {
    console.log('📍 Raw position data:', pos);
    
    // Comprehensive null and undefined checks
    if (!pos) {
      console.warn('🚫 Position object is null or undefined');
      return { isValid: false, error: 'No position data', data: null };
    }
    
    if (!pos.coords) {
      console.warn('🚫 Position coordinates are null or undefined');
      return { isValid: false, error: 'No coordinates data', data: null };
    }
    
    // Safely destructure with fallbacks
    const { 
      latitude = null, 
      longitude = null, 
      accuracy = null,
      altitude = null,
      heading = null,
      speed = null
    } = pos.coords || {};
    
    // Enhanced validation
    if (!isValidCoordinate(latitude, longitude, accuracy)) {
      console.warn('🚫 Invalid coordinates:', { latitude, longitude, accuracy });
      return { isValid: false, error: 'Invalid coordinates', data: null };
    }
    
    // Success case
    return {
      isValid: true,
      error: null,
      data: {
        latitude,
        longitude,
        accuracy: accuracy || 0,
        altitude: altitude || 0,
        heading: heading || 0,
        speed: speed || 0,
        timestamp: pos.timestamp || Date.now(),
      }
    };
  };

  const getOptimizedLocationConfig = () => {
    const baseConfig = {
      enableHighAccuracy: true,
      distanceFilter: 5,
      maximumAge: 0,
    };

    if (Platform.OS === 'android') {
      return {
        ...baseConfig,
        interval: 5000,
        fastestInterval: 2000,
        timeout: 15000,
      };
    }

    return {
      ...baseConfig,
      interval: 5000,
      timeout: 15000,
    };
  };

  // 🔥 ENHANCED: Watch Position with robust null handling
  const startWatchingLocation = async (isRetry = false) => {
    try {
      console.log(`🚀 Starting location watch... Retry: ${isRetry}, Count: ${locationRetryCountRef.current}`);
      
      if (isRetry) {
        locationRetryCountRef.current += 1;
        if (locationRetryCountRef.current >= MAX_RETRIES) {
          Alert.alert(
            'Location Service', 
            'Unable to get stable location. Please:\n• Check GPS signal\n• Move to open area\n• Restart location service',
            [
              {
                text: 'Try Again',
                onPress: () => {
                  locationRetryCountRef.current = 0;
                  startWatchingLocation();
                }
              },
              { text: 'Cancel' }
            ]
          );
          return;
        }
        
        // Add progressive delay between retries
        await new Promise(resolve => setTimeout(resolve, locationRetryCountRef.current * 2000));
      } else {
        locationRetryCountRef.current = 0;
        hasValidLocationRef.current = false;
      }

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
                setTimeout(() => startWatchingLocation(true), 1000);
              } catch (err) {
                console.warn('GPS enable request failed', err);
              }
            },
          },
          {text: 'Cancel', style: 'cancel'},
        ]);
        return;
      }

      // Clear previous watch
      if (watchIdRef.current) {
        Geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }

      // Clear existing timeouts
      if (fallbackTimeoutRef.current) {
        clearTimeout(fallbackTimeoutRef.current);
        fallbackTimeoutRef.current = null;
      }

      console.log('🎯 Setting up enhanced location watcher...');
      
      // 🔥 ENHANCED: WatchPosition with comprehensive error handling
      watchIdRef.current = Geolocation.watchPosition(
        // Success callback with null-safe processing
        (pos) => {
          console.log('📍 Location update received');
          
          const result = processLocationUpdate(pos);
          
          if (!result.isValid) {
            console.log(`❌ Invalid location: ${result.error}`);
            
            // Only retry if we haven't gotten any valid location yet
            if (!hasValidLocationRef.current && !isRetry && locationRetryCountRef.current < MAX_RETRIES) {
              console.log('🔄 Auto-retrying due to invalid location...');
              startWatchingLocation(true);
            }
            return;
          }

          // ✅ Valid location received
          console.log('✅ Valid location coordinates:', {
            lat: result.data.latitude,
            lng: result.data.longitude,
            accuracy: result.data.accuracy
          });
          
          hasValidLocationRef.current = true;
          locationRetryCountRef.current = 0;

          // Clear fallback timeout
          if (fallbackTimeoutRef.current) {
            clearTimeout(fallbackTimeoutRef.current);
            fallbackTimeoutRef.current = null;
          }

          // Update state only if coordinates changed
          setCoords(prev => {
            if (
              prev.latitude === result.data.latitude &&
              prev.longitude === result.data.longitude &&
              prev.accuracy === result.data.accuracy
            ) {
              return prev;
            }
            
            return result.data;
          });
        },
        
        // Error callback
        (err) => {
          console.error('🚨 Location error:', err);
          
          // Handle different error types
          switch (err.code) {
            case 1: // PERMISSION_DENIED
              console.error('Location permission denied');
              Alert.alert(
                'Location Permission',
                'Please enable location permissions in app settings.',
                [
                  { text: 'OK' },
                  { text: 'Cancel', style: 'cancel' }
                ]
              );
              break;
              
            case 2: // POSITION_UNAVAILABLE
              console.error('Position unavailable');
              if (locationRetryCountRef.current < MAX_RETRIES) {
                console.log('🔄 Retrying for position unavailable...');
                startWatchingLocation(true);
              }
              break;
              
            case 3: // TIMEOUT
              console.error('Location timeout');
              if (locationRetryCountRef.current < MAX_RETRIES) {
                console.log('🔄 Retrying after timeout...');
                startWatchingLocation(true);
              }
              break;
              
            default:
              console.error('Unknown location error:', err);
              if (locationRetryCountRef.current < MAX_RETRIES) {
                startWatchingLocation(true);
              }
          }
        },
        
        getOptimizedLocationConfig()
      );

      // Enhanced fallback for initial location acquisition
      if (!hasValidLocationRef.current) {
        fallbackTimeoutRef.current = setTimeout(() => {
          if (!hasValidLocationRef.current) {
            console.warn('⏰ No valid location received within timeout period');
            Alert.alert(
              'GPS Signal Required',
              'No GPS signal detected. Please ensure:\n• Location is enabled\n• You are in open area\n• High accuracy mode is on',
              [
                {
                  text: 'Retry',
                  onPress: () => {
                    stopWatchingLocation();
                    startWatchingLocation(true);
                  }
                },
                { 
                  text: 'Continue Anyway',
                  onPress: () => {
                    // Optionally set default coordinates or keep trying in background
                    console.log('User chose to continue without location');
                  }
                }
              ]
            );
          }
        }, 20000);
      }

    } catch (error) {
      console.error('❌ Critical error in startWatchingLocation:', error);
    }
  };

  const stopWatchingLocation = () => {
    console.log('🛑 Stopping location watch...');
    
    if (watchIdRef.current) {
      Geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    
    if (fallbackTimeoutRef.current) {
      clearTimeout(fallbackTimeoutRef.current);
      fallbackTimeoutRef.current = null;
    }
    
    locationRetryCountRef.current = 0;
  };

  // Manual location refresh
  const refreshLocation = () => {
    console.log('🔃 Manual location refresh requested');
    stopWatchingLocation();
    startWatchingLocation();
  };

  // Get location status
  const getLocationStatus = () => {
    if (!coords.latitude || !coords.longitude) {
      return {
        status: 'no_location',
        message: 'No location data available',
        hasValidLocation: false
      };
    }
    
    if (coords.accuracy > 50) {
      return {
        status: 'poor_accuracy',
        message: `Location accuracy: ${coords.accuracy?.toFixed(1)}m`,
        hasValidLocation: true
      };
    }
    
    return {
      status: 'good',
      message: `Location accuracy: ${coords.accuracy?.toFixed(1)}m`,
      hasValidLocation: true
    };
  };

  // Initialize location
  const initializeLocation = async () => {
    try {
      await startWatchingLocation();
    } catch (error) {
      console.error('Location initialization failed:', error);
    }
  };

  // ---------- INIT: Start Watching Once ----------
  useEffect(() => {
    initializeLocation();
    
    return () => {
      stopWatchingLocation();
    };
  }, []);

  // ... REST OF YOUR EXISTING CODE (AllFarmerList, etc. remains the same)

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
        const {company, country_id} = companyLanguage_data;
        const {option_value} = resCarbonFlag?.data?.data || {};
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
      console.error('Error in AllFarmerList:', error);
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
      startWatchingLocation: initializeLocation,
      stopWatchingLocation,
      refreshLocation,
      getLocationStatus,
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

export {userListContext, UserCreateContextProvider, userCreateContext};