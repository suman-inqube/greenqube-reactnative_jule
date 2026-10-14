
import { Platform, PermissionsAndroid } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import FusedLocation from 'react-native-fused-location';
import { promptForEnableLocationIfNeeded } from 'react-native-android-location-enabler';

const getAndroidLocation = async () => {
  const permission = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  );

  if (permission !== PermissionsAndroid.RESULTS.GRANTED) {
    throw new Error('Location permission denied');
  }

  await promptForEnableLocationIfNeeded({
    interval: 10000,
    fastInterval: 5000,
  });

  await FusedLocation.setLocationPriority(
    FusedLocation.Constants.HIGH_ACCURACY,
  );

  const location = await FusedLocation.getFusedLocation();

  if (!location) {
    throw new Error('Unable to get Android location');
  }

  return {
    latitude: location.latitude,
    longitude: location.longitude,
    accuracy: location.accuracy ?? null,
  };
};

const getIOSLocation = async () => {
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude, accuracy } = position.coords;

        resolve({
          latitude,
          longitude,
          accuracy: accuracy ?? null,
        });
      },
      error => reject(error),
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0,
      },
    );
  });
};

export const getHighAccuracyLocation = async () => {
  try {
    const location =
      Platform.OS === 'android'
        ? await getAndroidLocation()
        : Platform.OS === 'ios'
          ? await getIOSLocation()
          : null;

    console.log('Current location:', location);
    return location;
  } catch (error) {
    console.error('Location error:', error.message || error);
    return null;
  }
};
