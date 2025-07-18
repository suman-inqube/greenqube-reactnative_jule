import React, {useEffect} from 'react';
import {Platform, Alert} from 'react-native';
import FusedLocation from 'react-native-fused-location';
import store from '../redux/store';
import {updateLocation} from '../redux/actions/locationActions';
import {setItem} from '../../config/getDataFromStorage';
import {promptForEnableLocationIfNeeded} from 'react-native-android-location-enabler';
import {check, PERMISSIONS, RESULTS} from 'react-native-permissions';

const ForegroundLocationService = () => {
  useEffect(() => {
    let gpsCheckInterval;

    const startLocationUpdates = async () => {
      try {
        await FusedLocation.setLocationPriority(
          FusedLocation.Constants.HIGH_ACCURACY,
        );
        await FusedLocation.setLocationInterval(3000);
        await FusedLocation.setFastestLocationInterval(3000);
        await FusedLocation.startLocationUpdates();
      } catch (error) {
        console.log('Error starting location updates:', error);
      }
    };

    const stopLocationUpdates = () => {
      FusedLocation.stopLocationUpdates();
      FusedLocation.off();
    };

    const checkGPSStatus = async () => {
      if (Platform.OS === 'android') {
        try {
          const result = await promptForEnableLocationIfNeeded({
            interval: 100000,
            fastInterval: 50000,
          });

          if (result === 'enabled' || result === 'already-enabled') {
            startLocationUpdates();
          }
        } catch (error) {
          console.log('GPS not enabled:', error.message);
          Alert.alert(
            'Enable GPS',
            'Location features will not work unless GPS is enabled.',
          );
        }
      } else {
        // iOS - Permissions handling
        const result = await check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
        if (result === RESULTS.GRANTED) {
          startLocationUpdates();
        }
      }
    };

    // ✅ Register the event listener ONCE here
    FusedLocation.on('fusedLocation', async location => {
      await setItem('fusedLocation', location);
      store.dispatch(updateLocation(location));
    });

    checkGPSStatus(); // Check initially

    gpsCheckInterval = setInterval(checkGPSStatus, 10000); // Check every 10 seconds

    return () => {
      clearInterval(gpsCheckInterval);
      stopLocationUpdates();
    };
  }, []);

  return null;
};

export default ForegroundLocationService;
