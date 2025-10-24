import FusedLocation from 'react-native-fused-location';
import { PermissionsAndroid, Platform } from 'react-native';

/**
 * Get current GPS location (High Accuracy)
 * Returns: { latitude, longitude, accuracy } or null
 */
export const getHighAccuracyLocation = async () => {
  try {
    // 1. Request permission
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        console.error('Location permission denied');
        return null;
      }
    }

    // 2. Set high accuracy
    await FusedLocation.setLocationPriority(
      FusedLocation.Constants.HIGH_ACCURACY
    );

    // 3. Get location
    const location = await FusedLocation.getFusedLocation();
    
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