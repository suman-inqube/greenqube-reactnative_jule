import FusedLocation from 'react-native-fused-location';
import { PermissionsAndroid, Platform } from 'react-native';
import { promptForEnableLocationIfNeeded } from 'react-native-android-location-enabler';

/**
 * Get current GPS location (High Accuracy)
 * Returns: { latitude, longitude, accuracy } or null
 */
export const getHighAccuracyLocation = async () => {
  try {
    // 1. Request runtime permission
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        console.error('Location permission denied');
        return null;
      }

      // 2. Ensure GPS is enabled (Prompts user if GPS is OFF)
      try {
        await promptForEnableLocationIfNeeded({
          interval: 10000,
          fastInterval: 5000,
        });
      } catch (gpsError) {
        console.warn('GPS enable was rejected or failed:', gpsError);
        return null;
      }
    }

    // 3. Set high accuracy
    await FusedLocation.setLocationPriority(
      FusedLocation.Constants.HIGH_ACCURACY,
    );

    // 4. Get location
    const location = await FusedLocation.getFusedLocation();
    console.log({
      latitude: location.latitude,
      longitude: location.longitude,
      accuracy: location.accuracy
    })
    return {
      latitude: location.latitude,
      longitude: location.longitude,
      accuracy: location.accuracy,
    };
  } catch (error) {
    console.error('Location error:', error);
    return null;
  }
};
