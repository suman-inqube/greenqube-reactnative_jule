import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  Platform,
  PermissionsAndroid,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import MapView, { Marker, Polygon } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import { isPointInPolygon } from 'geolib';
import { launchCamera } from 'react-native-image-picker';

const App = () => {
  const [location, setLocation] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [polygonCoords, setPolygonCoords] = useState([]);
  const [insidePolygon, setInsidePolygon] = useState(false);
  const [photoMarkers, setPhotoMarkers] = useState([]);
  const [insidePhotos, setInsidePhotos] = useState([]);
  const locationRef = useRef(location);  // Use a ref to track location directly
  useEffect(() => {
    let watchId;
    const requestLocationPermission = async () => {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
          PermissionsAndroid.PERMISSIONS.CAMERA,
        ]);

        if (
          granted['android.permission.ACCESS_FINE_LOCATION'] !== PermissionsAndroid.RESULTS.GRANTED
        ) {
          console.warn('Location permission denied');
          return;
        }
      }

      watchId = Geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude, accuracy } = pos.coords;
          if (accuracy < 20) {
            const userLocation = { latitude, longitude };
            locationRef.current = userLocation;  // Update the ref directly
            setLocation(userLocation);  // Update state for re-rendering
            setAccuracy(accuracy);
            setLoading(false);

            if (polygonCoords.length > 2) {
              const isInside = isPointInPolygon(userLocation, polygonCoords);
              setInsidePolygon(isInside);
              const inside = photoMarkers.filter((marker) =>
                isPointInPolygon(marker, polygonCoords)
              );
              setInsidePhotos(inside);
              if (isInside) {
                // Alert.alert("You are inside the polygon!");
              }
            }
          }
        },
        (error) => {
          console.warn(error.message);
          setLoading(false);
        },
        {
          enableHighAccuracy: true,
          distanceFilter: 0,
          interval: 1000,
          fastestInterval: 1000,
        }
      );
    };

    requestLocationPermission();

    return () => {
      if (watchId) Geolocation.clearWatch(watchId);
    };
  }, [polygonCoords]);

  const handleMapPress = (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    const newPoint = { latitude, longitude };
    const updatedCoords = [...polygonCoords, newPoint];
    setPolygonCoords(updatedCoords);

    // Use the ref for location check
    if (locationRef.current && updatedCoords.length > 2) {
      const isInside = isPointInPolygon(locationRef.current, updatedCoords);
      setInsidePolygon(isInside);

      const inside = photoMarkers.filter((marker) =>
        isPointInPolygon(marker, updatedCoords)
      );
      setInsidePhotos(inside);
    }
  };

  const takePhoto = () => {
    launchCamera(
      {
        mediaType: 'photo',
        saveToPhotos: true,
      },
      (response) => {
        if (response.didCancel || response.errorCode) {
          console.warn('User cancelled or error:', response.errorMessage);
          return;
        }

        if (response.assets && response.assets.length > 0 && locationRef.current) {
          const newPhoto = {
            id: Date.now(),
            latitude: locationRef.current.latitude,
            longitude: locationRef.current.longitude,
            uri: response.assets[0].uri,
          };
          const updatedPhotos = [...photoMarkers, newPhoto];
          setPhotoMarkers(updatedPhotos);

          if (polygonCoords.length > 2) {
            const inside = updatedPhotos.filter((marker) =>
              isPointInPolygon(marker, polygonCoords)
            );
            setInsidePhotos(inside);
          }
        }
      }
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {loading || !location ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#333" />
          <Text style={{ marginTop: 10 }}>Getting accurate location...</Text>
        </View>
      ) : (
        <>
          <MapView
            style={{ flex: 1 }}
            mapType="hybrid"
            onPress={handleMapPress}
            region={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.001,
              longitudeDelta: 0.001,
            }}
          >
            {/* Custom User Marker */}
            <Marker coordinate={location} title="You">
              {/* <Image
                source={require('./pages/Common/images/location.png')}
                style={{ width: 40, height: 40,tintColor:'red' }}
                resizeMode="contain"
              /> */}
            </Marker>

            {/* Polygon */}
            {polygonCoords.length >= 3 && (
              <Polygon
                coordinates={polygonCoords}
                fillColor="rgba(0,200,0,0.3)"
                strokeColor="green"
                strokeWidth={2}
              />
            )}

            {/* Photo Markers */}
            {photoMarkers.map((photo) => (
              <Marker
                key={photo.id}
                coordinate={{ latitude: photo.latitude, longitude: photo.longitude }}
                title={`Photo ${photo.id}`}
              >
                {photo.uri && (
                  <Image
                    source={{ uri: photo.uri }}
                    style={{ width: 40, height: 40, borderRadius: 5 }}
                  />
                )}
              </Marker>
            ))}
          </MapView>

          {/* Footer Info */}
          <View style={styles.footer}>
            <Text style={styles.infoText}>
              Lat: {location.latitude.toFixed(6)} | Lng: {location.longitude.toFixed(6)}
            </Text>
            <Text style={styles.infoText}>Accuracy: {accuracy?.toFixed(2)} meters</Text>
            {polygonCoords.length >= 3 && (
              <Text style={[styles.infoText, { color: insidePolygon ? 'green' : 'red' }]}>{insidePolygon ? 'Inside Polygon' : 'Outside Polygon'}</Text>
            )}
            {insidePhotos.length > 0 && (
              <Text style={styles.infoText}>Photos in polygon: {insidePhotos.map((p) => p.id).join(', ')}</Text>
            )}
            <ScrollView style={{ maxHeight: 80, marginTop: 5 }}>
              {polygonCoords.map((point, idx) => (
                <Text key={idx} style={styles.infoText}>
                  Point {idx + 1}: {point.latitude.toFixed(5)}, {point.longitude.toFixed(5)}
                </Text>
              ))}
            </ScrollView>

            {/* Capture Button */}
            <TouchableOpacity onPress={takePhoto} style={styles.button}>
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>📷 Capture Photo</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 10,
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: 10,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 13,
  },
  button: {
    marginTop: 10,
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 8,
  },
});

export default App;
