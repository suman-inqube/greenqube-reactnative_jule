import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { databaseListAPI, firstLanguageListAPI } from './config/apiHere';
import { getItem, removeItem, setItem } from './config/getDataFromStorage';
import SplashScreenModal from './SplashScreenModal';
import SplashScreenModalLanguage from './SplashScreenModalLanguage';
import i18next from 'i18next';
import { Root, Toast } from 'react-native-popup-confirm-toast';
import MyErrorBoundary from './pages/Common/MyErrorBoundary';
import { CrashlyticsRecordError } from './pages/Crashlytics/CrashlyticsRecordError';
import { NativeModules } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const SplashScreen = ({ navigation }) => {
  const { ConfigModule } = NativeModules;
  const insets = useSafeAreaInsets();

  // Refs for cleanup tracking
  const isMountedRef = useRef(true);
  const animationRefs = useRef([]);
  const navigationTimeoutRef = useRef(null);

  // Animated values with proper refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

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
    animationCompleted: false,
  });

  // Cleanup function to stop all animations
  const stopAllAnimations = useCallback(() => {
    try {
      // Stop all running animations
      animationRefs.current.forEach(animation => {
        if (animation && typeof animation.stop === 'function') {
          animation.stop();
        }
      });

      // Clear animation refs
      animationRefs.current = [];

      // Clear navigation timeout
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
        navigationTimeoutRef.current = null;
      }

      // Reset animation values to prevent flickering
      fadeAnim.setValue(1);
      scaleAnim.setValue(1);
      slideAnim.setValue(0);
      pulseAnim.stopAnimation();

    } catch (error) {
      console.warn('Error stopping animations:', error);
    }
  }, [fadeAnim, scaleAnim, slideAnim, pulseAnim]);

  // Component cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      stopAllAnimations();
    };
  }, [stopAllAnimations]);

  // Safe navigation function that stops animations first
  const safeNavigate = useCallback((routeName, params = {}) => {
    if (!isMountedRef.current) return;

    // Stop animations first
    stopAllAnimations();

    // Small delay to ensure animations are stopped
    navigationTimeoutRef.current = setTimeout(() => {
      if (isMountedRef.current && navigation) {
        try {
          navigation.replace(routeName);
        } catch (error) {
          console.warn('Navigation error:', error);
          CrashlyticsRecordError(error, 'SplashScreen', 'safeNavigate');
        }
      }
    }, 100);
  }, [navigation, stopAllAnimations]);

  const fetchDatabaseList = useCallback(async () => {
    if (!isMountedRef.current) return;

    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const company_res = await databaseListAPI();

      if (!isMountedRef.current) return;

      if (company_res?.status === 200 && company_res?.data?.data) {
        setState(prev => ({
          ...prev,
          companyDataRaw: company_res.data.data,
          modalVisible: true,
          isLoading: false,
        }));
      }
    } catch (error) {
      if (isMountedRef.current) {
        setState(prev => ({ ...prev, isLoading: false }));
        CrashlyticsRecordError(error, 'SplashScreen', 'databaseListAPI');
        console.error('Company API error:', error);
      }
    }
  }, []);

  const handleCompanySelection = useCallback(async (
    dbName,
    company_id,
    company_name,
    country_id,
  ) => {
    if (!isMountedRef.current) return;
    const newCompanyLanguage = {
      company: dbName,
      company_id,
      company_name,
      country_id,
    };

    setState(prev => ({
      ...prev,
      companyLanguage: { ...prev.companyLanguage, ...newCompanyLanguage },
      modalVisible: false,
      isLoading: true,
    }));

    await fetchLanguageData(dbName);
  }, []);

  const handleLanguageSelection = useCallback(async (item) => {
    if (!isMountedRef.current) return;

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

      // Use safe navigation
      safeNavigate('Login');
    } catch (error) {
      CrashlyticsRecordError(error, 'SplashScreen', 'handleLanguageSelection');
    }
  }, [state.companyLanguage, safeNavigate]);

  const fetchLanguageData = useCallback(async (dbName) => {
    if (!isMountedRef.current) return;

    try {
      const language_res = await firstLanguageListAPI(dbName);

      if (!isMountedRef.current) return;

      if (language_res?.data?.data) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          modalVisibleLan: true,
          languageData: language_res.data.data,
        }));
      }
    } catch (error) {
      if (isMountedRef.current) {
        setState(prev => ({ ...prev, isLoading: false }));
        console.error('Language API error:', error.response);
      }
    }
  }, []);

  const handlePageLoad = useCallback(async () => {
    if (!isMountedRef.current) return;

    try {
      const [companyLanguage_data, loginUser_data] = await Promise.all([
        getItem('companyLanguage_data'),
        getItem('loginUser_data'),
      ]);

      if (!isMountedRef.current) return;

      if (loginUser_data) {
        i18next.changeLanguage(`${loginUser_data.lan_id}`);
        const userType = await getItem('userType');

        if (!isMountedRef.current) return;

        const navigationTarget = userType === 3
          ? 'AdminNavigation'
          : userType === 2
            ? 'FarmerNavigation'
            : null;

        if (navigationTarget) {
          safeNavigate(navigationTarget);
        }
      } else if (companyLanguage_data) {
        i18next.changeLanguage('1');
        safeNavigate('Login');
      } else {
        await fetchDatabaseList();
      }
    } catch (error) {
      CrashlyticsRecordError(error, 'SplashScreen', 'onPageLoad');
    }
  }, [safeNavigate, fetchDatabaseList]);

  // Search functionality with safety checks
  const searchCompanyByName = useCallback((text) => {
    if (!isMountedRef.current) return;

    if (!text || text.length === 0) {
      setState(prev => ({ ...prev, companyData: [] }));
      return;
    }

    const filteredResults = state.companyDataRaw.filter(item =>
      item?.agri_company?.company_display_name
        ?.toLowerCase()
        .includes(text.toLowerCase())
    );

    if (isMountedRef.current) {
      setState(prev => ({ ...prev, companyData: filteredResults }));
    }
  }, [state.companyDataRaw]);

  // Optimized animation sequence with cleanup tracking
  const startAnimation = useCallback(() => {
    if (!isMountedRef.current) return;

    // Create loading pulse animation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    // Main entry animation
    const mainAnimation = Animated.parallel([
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
    ]);

    // Store animation references for cleanup
    animationRefs.current = [pulseAnimation, mainAnimation];

    // Start animations
    pulseAnimation.start();
    mainAnimation.start(({ finished }) => {
      if (finished && isMountedRef.current) {
        setState(prev => ({ ...prev, animationCompleted: true }));
      }
    });
  }, [fadeAnim, scaleAnim, slideAnim, pulseAnim]);

  // Safe state update function
  const safeSetState = useCallback((updater) => {
    if (isMountedRef.current) {
      setState(updater);
    }
  }, []);

  // Effects with proper cleanup
  useEffect(() => {
    let mounted = true;

    const initializeApp = async () => {
      if (mounted && isMountedRef.current) {
        await handlePageLoad();
        if (mounted && isMountedRef.current) {
          startAnimation();
        }
      }
    };

    initializeApp();

    return () => {
      mounted = false;
    };
  }, [handlePageLoad, startAnimation]);

  // Memoized modal visibility handlers
  const setModalVisible = useCallback((visible) => {
    safeSetState(prev => ({ ...prev, modalVisible: visible }));
  }, [safeSetState]);

  const setModalVisibleLan = useCallback((visible) => {
    safeSetState(prev => ({ ...prev, modalVisibleLan: visible }));
  }, [safeSetState]);

  return (
    <MyErrorBoundary>
      <Root>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <ImageBackground
          source={require('./pages/Common/images/crystal_splash_screen.jpg')}
          style={styles.backgroundImage}
          imageStyle={styles.backgroundImageStyle}
        >
          <LinearGradient
            colors={['rgba(0,50,100,0.7)', 'rgba(0,30,60,0.8)', 'rgba(0,10,30,0.9)']}
            style={styles.gradientOverlay}
          >
            <View style={[styles.container, { paddingTop: insets.top }]}>
              {/* Modals */}
              {state.modalVisible&&<SplashScreenModal
                height={SCREEN_HEIGHT}
                setModalVisible={setModalVisible}
                modalVisible={state.modalVisible}
                companyData={state.companyData}
                sendDataToParent={handleCompanySelection}
                searchTextData={searchCompanyByName}
                style={styles.modalStyle}
              />}

              {state.modalVisibleLan&&<SplashScreenModalLanguage
                setModalVisibleLan={setModalVisibleLan}
                modalVisibleLan={state.modalVisibleLan}
                companyData={state.languageData}
                sendDataToParentLan={handleLanguageSelection}
                style={styles.modalStyle}
              />
              }
              {/* Main Content */}
              <Animated.View
                style={[
                  styles.content,
                  {
                    opacity: fadeAnim,
                    transform: [
                      { scale: scaleAnim },
                      { translateY: slideAnim }
                    ]
                  }
                ]}
              >
                <Animated.View
                  style={[
                    styles.logoContainer,
                    { transform: [{ scale: state.isLoading ? pulseAnim : 1 }] }
                  ]}
                >
                  <Image
                    source={require('./pages/Common/images/greenqube_logo.png')}
                    style={styles.logo}
                    resizeMode="contain"
                  />
                </Animated.View>

                {/* App Title */}
                <Animated.View style={[styles.titleContainer, { opacity: fadeAnim }]}>
                  <Text style={styles.appTitle}>GreenQube</Text>
                  <Text style={styles.appSubtitle}>Agricultural Solutions</Text>
                </Animated.View>
              </Animated.View>

              {/* Loading Indicator */}
              {state.isLoading && (
                <Animated.View style={[styles.loadingContainer, { opacity: fadeAnim }]}>
                  <ActivityIndicator
                    size="large"
                    color="#4CAF50"
                    style={styles.loadingIndicator}
                  />
                  <Text style={styles.loadingText}>Loading...</Text>
                </Animated.View>
              )}

              {/* Version Info */}
              <Animated.View style={[styles.versionContainer, { opacity: fadeAnim }]}>
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
    shadowOffset: { width: 0, height: 4 },
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
    textShadowOffset: { width: 0, height: 2 },
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
    textShadowOffset: { width: 0, height: 1 },
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