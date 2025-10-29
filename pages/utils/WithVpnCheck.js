import React, { useEffect } from 'react';
import { Alert } from 'react-native';
import VpnDetect from 'react-native-vpn-detect';
import { useNavigationContainerRef } from '@react-navigation/native';

const WithVpnCheck = ({ children }) => {
  const navigationRef = useNavigationContainerRef();

  const checkVpnStatus = async () => {
    try {
      const isVpn = await VpnDetect.isVpnActive();
      console.log('VPN active:', isVpn);
      if (isVpn) {
        Alert.alert(
          'VPN Detected',
          'Please disable VPN to continue using the app.',
          [{ text: 'OK' }],
          { cancelable: false }
        );
      }
    } catch (error) {
      console.warn('VPN check failed:', error);
    }
  };

  useEffect(() => {
    // ✅ Run VPN check when app starts
    checkVpnStatus();

    // ✅ Optional: Re-check every 10 seconds or on interval
    const interval = setInterval(() => {
      checkVpnStatus();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // ✅ Attach listener to NavigationContainer if available
  useEffect(() => {
    const unsubscribe = navigationRef.addListener?.('state', checkVpnStatus);
    return unsubscribe;
  }, [navigationRef]);

  // Return children directly (this wrapper doesn’t render UI)
  return children;
};

export default WithVpnCheck;
