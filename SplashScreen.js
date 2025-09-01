import React, {useEffect, useState, useCallback, useMemo} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  ActivityIndicator,
  ImageBackground,
  Dimensions,
  StatusBar,
  Animated,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {databaseListAPI, firstLanguageListAPI} from './config/apiHere';
import {getItem, removeItem, setItem} from './config/getDataFromStorage';
import SplashScreenModal from './SplashScreenModal';
import SplashScreenModalLanguage from './SplashScreenModalLanguage';
import i18next from 'i18next';
import {Root, Toast} from 'react-native-popup-confirm-toast';
import {AlertMesg} from './pages/Common/ToastAlert';
import CustomAlert from './pages/Common/CustomAlert';
import NotificationServices from './pages/PushNotification/NotificationServices';
import JailMonkey from 'jail-monkey';
import MyErrorBoundary from './pages/Common/MyErrorBoundary';
import {CrashlyticsRecordError} from './pages/Crashlytics/CrashlyticsRecordError';
import {NativeModules} from 'react-native';
const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');
const SplashScreen = ({navigation}) => {
  const {ConfigModule} = NativeModules;
  const insets = useSafeAreaInsets();
  const fadeAnim = useMemo(() => new Animated.Value(0), []);
  const scaleAnim = useMemo(() => new Animated.Value(0.8), []);
  const slideAnim = useMemo(() => new Animated.Value(50), []);
  const [state, setState] = useState({
    companyData: [],
    companyDataRaw: [],
    isLoading: false,
    modalVisible: false,
    modalVisibleLan: false,
    languageData: [],
    companyLanguage: {
      company: '',
      company_id: '',
      language: '',
      country_id: '',
      company_name: '',
    },
  });

  const fetchDatabaseList = useCallback(async () => {
    try {
      setState(prev => ({...prev, isLoading: true}));
      const company_res = await databaseListAPI();
      if (company_res?.status === 200 && company_res?.data?.data) {
        setState(prev => ({
          ...prev,
          companyDataRaw: company_res.data.data,
          modalVisible: true,
          isLoading: false,
        }));
      }
    } catch (error) {
      setState(prev => ({...prev, isLoading: false}));
      CrashlyticsRecordError(error, 'SplashScreen', 'databaseListAPI');
      console.error('Company API error:', error);
    }
  }, []);
  const handleCompanySelection = useCallback(
    async (dbName, company_id, company_name, country_id) => {
      const newCompanyLanguage = {
        company: dbName,
        company_id,
        company_name,
        country_id,
      };
      setState(prev => ({
        ...prev,
        companyLanguage: {...prev.companyLanguage, ...newCompanyLanguage},
        modalVisible: false,
        isLoading: true,
      }));
      await fetchLanguageData(dbName);
    },
    [],
  );
  const handleLanguageSelection = useCallback(
    async item => {
      try {
        const companyLanguageData = {
          language: item,
          company: state.companyLanguage.company,
          company_id: state.companyLanguage.company_id,
          company_name: state.companyLanguage.company_name,
          country_id: state.companyLanguage.country_id,
        };
        await Promise.all([
          setItem('companyLanguage_data', companyLanguageData),
          setItem('companyFirstEntry', 1),
        ]);

        navigation.replace('Login');
      } catch (error) {
        CrashlyticsRecordError(
          error,
          'SplashScreen',
          'handleLanguageSelection',
        );
      }
    },
    [state.companyLanguage, navigation],
  );
  const fetchLanguageData = useCallback(async dbName => {
    try {
      const language_res = await firstLanguageListAPI(dbName);

      if (language_res?.data?.data) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          modalVisibleLan: true,
          languageData: language_res.data.data,
        }));
      }
    } catch (error) {
      setState(prev => ({...prev, isLoading: false}));
      console.error('Language API error:', error.response);
    }
  }, []);
  const handlePageLoad = useCallback(async () => {
    try {
      const [companyLanguage_data, loginUser_data] = await Promise.all([
        getItem('companyLanguage_data'),
        getItem('loginUser_data'),
      ]);
      if (loginUser_data) {
        i18next.changeLanguage(`${loginUser_data.lan_id}`);
        const userType = await getItem('userType');
        const navigationTarget =
          userType === 3
            ? 'AdminNavigation'
            : userType === 2
            ? 'FarmerNavigation'
            : null;
        if (navigationTarget) {
          navigation.navigate(navigationTarget);
        }
      } else if (companyLanguage_data) {
        navigation.replace('Login');
      } else {
        await fetchDatabaseList();
      }
    } catch (error) {
      CrashlyticsRecordError(error, 'SplashScreen', 'onPageLoad');
    }
  }, []);

  // Search functionality
  const searchCompanyByName = useCallback(
    text => {
      if (!text || text.length === 0) {
        setState(prev => ({...prev, companyData: []}));
        return;
      }

      const filteredResults = state.companyDataRaw.filter(item =>
        item?.agri_company?.company_display_name
          ?.toLowerCase()
          .includes(text.toLowerCase()),
      );

      setState(prev => ({...prev, companyData: filteredResults}));
    },
    [state.companyDataRaw],
  );

  // Animation sequence
  const startAnimation = useCallback(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim, slideAnim]);

  // Effects
  useEffect(() => {
    handlePageLoad();
    startAnimation();
  }, [handlePageLoad, startAnimation]);

  return (
    <MyErrorBoundary>
      <Root>
        {/* <StatusBar
          barStyle="light-content"
          backgroundColor="transparent"
          translucent
        /> */}
        <ImageBackground
          source={require('./pages/Common/images/crystal_splash_screen.jpg')}
          style={styles.backgroundImage}
          imageStyle={styles.backgroundImageStyle}>
          <LinearGradient
            colors={[
              'rgba(0,50,100,0.7)',
              'rgba(0,30,60,0.8)',
              'rgba(0,10,30,0.9)',
            ]}
            style={styles.gradientOverlay}>
            <View style={[styles.container, {paddingTop: insets.top}]}>
              {/* Modals */}
              <SplashScreenModal
                height={SCREEN_HEIGHT}
                setModalVisible={visible =>
                  setState(prev => ({...prev, modalVisible: visible}))
                }
                modalVisible={state.modalVisible}
                companyData={state.companyData}
                sendDataToParent={handleCompanySelection}
                searchTextData={searchCompanyByName}
                style={styles.modalStyle}
              />

              <SplashScreenModalLanguage
                setModalVisibleLan={visible =>
                  setState(prev => ({...prev, modalVisibleLan: visible}))
                }
                modalVisibleLan={state.modalVisibleLan}
                companyData={state.languageData}
                sendDataToParentLan={handleLanguageSelection}
                style={styles.modalStyle}
              />

              {/* Main Content */}
              <Animated.View
                style={[
                  styles.content,
                  {
                    opacity: fadeAnim,
                    transform: [{scale: scaleAnim}, {translateY: slideAnim}],
                  },
                ]}>
                <View style={styles.logoContainer}>
                  <Image
                    source={require('./pages/Common/images/greenqube_logo.png')}
                    style={styles.logo}
                    resizeMode="contain"
                  />
                </View>

                {/* App Title */}
                <Animated.View
                  style={[styles.titleContainer, {opacity: fadeAnim}]}>
                  <Text style={styles.appTitle}>GreenQube</Text>
                  <Text style={styles.appSubtitle}>Agricultural Solutions</Text>
                </Animated.View>
              </Animated.View>

              {/* Loading Indicator */}
              {state.isLoading && (
                <Animated.View
                  style={[styles.loadingContainer, {opacity: fadeAnim}]}>
                  <ActivityIndicator
                    size="large"
                    color="#4CAF50"
                    style={styles.loadingIndicator}
                  />
                  <Text style={styles.loadingText}>Loading...</Text>
                </Animated.View>
              )}

              {/* Version Info */}
              <Animated.View
                style={[styles.versionContainer, {opacity: fadeAnim}]}>
                <Text style={styles.versionText}>Version 1.0.0</Text>
              </Animated.View>
            </View>
          </LinearGradient>
        </ImageBackground>
      </Root>
    </MyErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundImage: {
    flex: 1,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  backgroundImageStyle: {
    resizeMode: 'cover',
  },
  gradientOverlay: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  logo: {
    width: 280,
    height: 160,
    borderRadius: 15,
  },
  titleContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: 0, height: 2},
    textShadowRadius: 4,
  },
  appSubtitle: {
    fontSize: 16,
    color: '#E8F5E8',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '300',
    letterSpacing: 1,
    opacity: 0.9,
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 120,
    alignItems: 'center',
  },
  loadingIndicator: {
    marginBottom: 15,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 3,
  },
  versionContainer: {
    position: 'absolute',
    bottom: 50,
    alignItems: 'center',
  },
  versionText: {
    color: '#B8E6B8',
    fontSize: 12,
    fontWeight: '400',
    opacity: 0.8,
  },
  modalStyle: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
});

export default React.memo(SplashScreen);
