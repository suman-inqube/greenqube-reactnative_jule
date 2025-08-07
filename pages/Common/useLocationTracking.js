import { useEffect, useRef, useState } from 'react';
import Geolocation from '@react-native-community/geolocation';
import { Alert } from 'react-native';

export default function useLocationTracking() {
  const [location, setLocation] = useState(null);
  const watchId = useRef(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    watchId.current = Geolocation.watchPosition(
      position => {
        const { latitude, longitude } = position.coords;

        setLocation(prev => {
          // Only update if the location has changed
          if (
            !prev ||
            prev.latitude !== latitude ||
            prev.longitude !== longitude
          ) {
            return { latitude, longitude };
          }
          return prev;
        });
      },
      error => {
        if (isMounted.current) {
          Alert.alert('Location Error', error.message);
        }
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 5, // ✅ filter out small movements
        interval: 5000, // ✅ optional: set interval for updates (Android)
        fastestInterval: 2000,
        forceRequestLocation: true,
        showLocationDialog: true,
      }
    );

    return () => {
      isMounted.current = false;
      if (watchId.current !== null) {
        Geolocation.clearWatch(watchId.current);
        watchId.current = null;
      }
    };
  }, []);

  return location;
}
