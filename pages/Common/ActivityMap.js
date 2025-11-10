import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import {
  StyleSheet,
  View,
  Modal,
  Dimensions,
  Animated,
  TouchableOpacity,
  Text,
} from 'react-native';
import MapView, { Polygon, Marker, Callout } from 'react-native-maps';
import { isPointInPolygon } from 'geolib';

const { width, height } = Dimensions.get('window');

const ActivityMap = ({
  modalVisibleMap,
  setModalVisibleMap,
  plotPolygon,
  TakePhoto,
  location,
  outofRange,
  setOutOfRange,
  pipeLatLong,
  replaceImgKey,
  TakePhotoReplaceImage
}) => {
  const mapRef = useRef(null);
  const animatedHeading = useRef(new Animated.Value(0)).current;
  const lastUpdate = useRef(Date.now());

  const [currentHeading, setCurrentHeading] = useState(0);
  const [selectedMarker, setSelectedMarker] = useState(null);

  // Compass logic (disabled since CompassHeading import is commented)
  // const startCompass = useCallback(() => {
  //   CompassHeading.start(3, ({ heading }) => {
  //     const now = Date.now();
  //     if (now - lastUpdate.current < 16) return;

  //     const smoothed = currentHeading + 0.15 * (heading - currentHeading);
  //     Animated.spring(animatedHeading, {
  //       toValue: smoothed,
  //       speed: 20,
  //       useNativeDriver: false,
  //     }).start();

  //     setCurrentHeading(smoothed);
  //     lastUpdate.current = now;
  //   });
  // }, [animatedHeading, currentHeading]);

  // const stopCompass = useCallback(() => {
  //   CompassHeading.stop();
  // }, []);

  // Update camera heading (optional animation)
  useEffect(() => {
    const listener = animatedHeading.addListener(({ value }) => {
      if (mapRef.current && location) {
        mapRef.current.setCamera(
          {
            heading: value,
            center: location,
            zoom: 18,
            pitch: 45,
          },
          { duration: 300 }
        );
      }
    });
    return () => animatedHeading.removeListener(listener);
  }, [animatedHeading, location]);

  const groupByCoordinates = (points) => {
    const groups = {};
    points.forEach((p) => {
      if (!p) return;
      const key = `${p.latitude},${p.longitude}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(p);
    });
    return Object.values(groups);
  };

  // Check if location is in polygon
  useEffect(() => {
    if (location && plotPolygon?.length) {
      const inside = isPointInPolygon(location, plotPolygon);
      setOutOfRange(inside);
    }
  }, [location, plotPolygon]);

  return (
    <Modal
      animationType="slide"
      transparent
      visible={modalVisibleMap}
      onRequestClose={() => {
        setModalVisibleMap(false);
      }}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <MapView
            ref={mapRef}
            style={[styles.map, { width, height }]}
            mapType="hybrid"
            showsUserLocation
            followsUserLocation
            showsCompass
            minZoomLevel={15}
            initialCamera={{
              center: location,
              zoom: 18,
              pitch: 45,
              heading: currentHeading,
            }}
          >
            {plotPolygon?.length > 0 && (
              <Polygon
                coordinates={plotPolygon}
                fillColor="rgba(139, 236, 11, 0.73)"
                strokeColor="rgb(1, 255, 1)"
                strokeWidth={2}
              />
            )}

            {groupByCoordinates(pipeLatLong?.flat() || []).map((group, index) =>
              group.map((polygon, i) => {
                const angle = (2 * Math.PI * i) / group.length;
                const offset = 0.000005; // ~50cm offset to avoid overlapping
                const latOffset = Math.cos(angle) * offset;
                const lngOffset = Math.sin(angle) * offset;

                return (
                  <Marker
                    key={`${index}-${i}`}
                    coordinate={{
                      latitude: polygon.latitude + latOffset,
                      longitude: polygon.longitude + lngOffset,
                    }}
                    pinColor={
                      polygon.color && polygon.color.trim() !== ''
                        ? polygon.color
                        : 'blue'
                    }
                    onPress={() => setSelectedMarker(polygon)} 
                  >
                    <Callout>
                      <Text style={{ color: '#000' }}>{polygon?.name}</Text>
                    </Callout>
                  </Marker>
                );
              })
            )}
          </MapView>
        </View>
        {outofRange && (
          <TouchableOpacity
            style={styles.captureButton}
            onPress={() => TakePhoto(replaceImgKey)}
          >
            <Text style={styles.captureIcon}>📷</Text>
          </TouchableOpacity>
        )}
        {selectedMarker && (
          <View style={styles.markerInfo}>
            <Text
              style={{
                textAlign: 'center',
                color: '#000',
                fontWeight: 'bold',
              }}
            >
              {selectedMarker?.name || 'Unnamed Marker'}
            </Text>
            {selectedMarker?.description && (
              <Text
                style={{
                  textAlign: 'center',
                  color: '#444',
                  marginTop: 4,
                }}
              >
                {selectedMarker.description}
              </Text>
            )}
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  modalContent: {
    flex: 1,
    width: '100%',
  },
  captureButton: {
    backgroundColor: '#FFF',
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 20,
    left: '40%',
    borderWidth: 3,
    borderColor: 'green',
  },
  captureIcon: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 32,
    marginBottom: 5,
  },
  markerInfo: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 10,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
});

export default memo(ActivityMap);
