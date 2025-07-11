import React, { useEffect } from 'react';
import { Platform, Alert } from 'react-native';
import FusedLocation from 'react-native-fused-location';
import store from '../redux/store';
import { updateLocation } from '../redux/actions/locationActions';
import { setItem } from '../../config/getDataFromStorage';
import { promptForEnableLocationIfNeeded } from 'react-native-android-location-enabler';
import { check, PERMISSIONS, RESULTS } from 'react-native-permissions';

const ForegroundLocationService = () => {
  useEffect(() => {
    let isMounted = true;
    let fusedLocationSubscription = null;

    const checkGPSStatus = async () => {
      try {
        if (Platform.OS === 'android') {
          const result = await promptForEnableLocationIfNeeded({
            interval: 10000,
            fastInterval: 5000,
          });

          if ((result === 'enabled' || result === 'already-enabled') && isMounted) {
            startLocationUpdates();
          }
        } else {
          const result = await check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
          if (result === RESULTS.GRANTED && isMounted) {
            startLocationUpdates();
          }
        }
      } catch (error) {
        console.log('GPS not enabled:', error.message);
        if (isMounted) {
          Alert.alert(
            'Enable GPS',
            'Location features will not work unless GPS is enabled.'
          );
        }
      }
    };

    const startLocationUpdates = async () => {
      try {
        await FusedLocation.setLocationPriority(FusedLocation.Constants.HIGH_ACCURACY);
        await FusedLocation.setLocationInterval(1000);
        await FusedLocation.setFastestLocationInterval(1000);
        await FusedLocation.startLocationUpdates();

        // Use addListener (returns a subscription)
        fusedLocationSubscription = FusedLocation.on('fusedLocation', async (location) => {
          if (!isMounted) return;
          await setItem('fusedLocation', location);
          store.dispatch(updateLocation(location));
        });
      } catch (error) {
        console.log('Error starting location updates:', error);
      }
    };

    const stopLocationUpdates = () => {
      if (fusedLocationSubscription?.remove) {
        fusedLocationSubscription.remove(); // ✅ safe unsubscribe
        fusedLocationSubscription = null;
      }
      FusedLocation.stopLocationUpdates();
    };

    checkGPSStatus();

    return () => {
      isMounted = false;
      stopLocationUpdates();
    };
  }, []);

  return null;
};

export default ForegroundLocationService;
