import React, { useState, useRef, useEffect, useCallback, memo, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Modal,
  Dimensions,
  Animated,
  TouchableOpacity,
  Text,
} from 'react-native';
import MapView, { Polygon, Marker, Callout, Circle } from 'react-native-maps';
import { isPointInPolygon } from 'geolib';
import { Fonts } from '../utils/Constants';

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
  TakePhotoReplaceImage,
  setMapLatLon
}) => {
  const mapRef = useRef(null);
  const animatedHeading = useRef(new Animated.Value(0)).current;
  const lastUpdate = useRef(Date.now());

  const [currentHeading, setCurrentHeading] = useState(0);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const distanceRings = useMemo(
    () => [
      // {
      //   distance: 5,
      //   borderColor: '#00BFFF',
      //   color: 'rgba(0,191,255,0.7)',
      // },
      // {
      //   distance: 10,
      //   borderColor: '#00FF7F',
      //   color: 'rgba(0,255,127,0.7)',
      // },
      // {
      //   distance: 15,
      //   borderColor: '#FFD700',
      //   color: 'rgba(255,215,0,0.7)',
      // },
      {
        distance: 20,
        borderColor: '#FF8C00',
        // color: 'rgba(255,140,0,0.7)',
        color: 'rgba(0,255,127,0.7)',
      },
      // {
      //   distance: 25,
      //   borderColor: '#FF0000',
      //   color: 'rgba(255,0,0,0.7)',
      // },
    ],
    [],
  );

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
          { duration: 300 },
        );
      }
    });
    return () => animatedHeading.removeListener(listener);
  }, [animatedHeading, location]);

  const groupByCoordinates = useCallback((points) => {
    const groups = {};
    points.forEach(p => {
      if (!p) return;
      const key = `${p.latitude},${p.longitude}`;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(p);
    });
    return Object.values(groups);
  }, []);
  const groupedMarkers = useMemo(() => {
    return groupByCoordinates(
      pipeLatLong?.flat() || [],
    );
  }, [pipeLatLong, groupByCoordinates]);

  // Check if location is in polygon
  // useEffect(() => {
  //   if (location && plotPolygon?.length) {
  //     const inside = isPointInPolygon(location, plotPolygon);
  //     setOutOfRange(inside);
  //   }
  // }, [location, plotPolygon]);
  const LOCATION_INTERVAL = 2000;
  const lastLocationUpdate = useRef(0);
  const handleUserLocationChange = useCallback(
    event => {
      const now = Date.now();

      // STOP CONTINUOUS RERENDER
      if (
        now - lastLocationUpdate.current <
        LOCATION_INTERVAL
      ) {
        return;
      }

      lastLocationUpdate.current = now;

      const coordinate =
        event?.nativeEvent?.coordinate;

      if (!coordinate) return;

      const newLocation = {
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
        accuracy: coordinate.accuracy || 0,
      };

      // AVOID SAME LOCATION UPDATE
      setUserLocation(prev => {
        if (
          prev &&
          Math.abs(
            prev.latitude - newLocation.latitude,
          ) < 0.000001 &&
          Math.abs(
            prev.longitude - newLocation.longitude,
          ) < 0.000001
        ) {
          return prev;
        }

        return newLocation;
      });

      // CHECK INSIDE POLYGON
      if (plotPolygon?.length > 0) {
        const inside = isPointInPolygon(
          newLocation,
          plotPolygon,
        );

        setOutOfRange(inside);
      }

      setMapLatLon?.(newLocation);
    },
    [plotPolygon, setOutOfRange, setMapLatLon],
  );
  const calculatePointAtDistance = useCallback(
    (lat, lng, distanceMeters, bearingDegrees) => {
      const R = 6378137;

      const bearing = (bearingDegrees * Math.PI) / 180;

      const lat1 = (lat * Math.PI) / 180;

      const lon1 = (lng * Math.PI) / 180;

      const angularDistance = distanceMeters / R;

      const lat2 = Math.asin(
        Math.sin(lat1) * Math.cos(angularDistance) +
        Math.cos(lat1) *
        Math.sin(angularDistance) *
        Math.cos(bearing),
      );

      let lon2 =
        lon1 +
        Math.atan2(
          Math.sin(bearing) *
          Math.sin(angularDistance) *
          Math.cos(lat1),
          Math.cos(angularDistance) -
          Math.sin(lat1) * Math.sin(lat2),
        );

      lon2 = ((lon2 + 3 * Math.PI) % (2 * Math.PI)) - Math.PI;

      return {
        latitude: (lat2 * 180) / Math.PI,
        longitude: (lon2 * 180) / Math.PI,
      };
    },
    [],
  );
  return (
    <Modal
      animationType="slide"
      transparent
      visible={modalVisibleMap}
      onRequestClose={() => {
        setModalVisibleMap(false);
      }}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <MapView
            ref={mapRef}
            style={[styles.map, { width, height }]}
            mapType="hybrid"
            // showsUserLocation
            // followsUserLocation
            // showsCompass
            showsUserLocation={true}
            followsUserLocation={true}
            showsMyLocationButton={true}
            onUserLocationChange={handleUserLocationChange}
            userLocationPriority="high"
            minZoomLevel={15}
            initialCamera={{
              center: {
                latitude: location?.latitude,
                longitude: location?.longitude,
              },
              zoom: 18,
              heading: 0,
              pitch: 0,
            }}
            maxZoomLevel={20}
            toolbarEnabled={false}
            showsCompass={false}
            rotateEnabled={false}
            pitchEnabled={false}
            moveOnMarkerPress={false}
            userLocationUpdateInterval={3000}
            userLocationFastestInterval={2000}
          >
            {userLocation &&
              distanceRings.map((ring, index) => {
                const northPoint = calculatePointAtDistance(
                  userLocation.latitude,
                  userLocation.longitude,
                  ring.distance,
                  0,
                );
                return (
                  <React.Fragment key={index}>
                    <Circle
                      center={userLocation}
                      radius={ring.distance}
                      strokeWidth={1.5}
                      strokeColor={ring.color}
                      fillColor="transparent"
                      zIndex={1}
                    />

                    {/* North Label */}
                    <Marker coordinate={northPoint} anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges={true}>
                      <View
                        style={[
                          styles.distanceBadgeSmall,
                          { borderColor: ring.borderColor },
                        ]}>
                        <Text style={styles.distanceTextSmall}>
                          {ring.distance}m
                        </Text>
                      </View>
                    </Marker>
                  </React.Fragment>
                );
              })}
            {plotPolygon?.length > 0 && (
              <Polygon
                coordinates={plotPolygon}
                fillColor="rgba(139, 236, 11, 0.73)"
                strokeColor="rgb(1, 255, 1)"
                strokeWidth={2}
              />
            )}

            {/* {groupByCoordinates(pipeLatLong?.flat() || []).map((group, index) =>
              group.map((polygon, i) => {
                const angle = (2 * Math.PI * i) / group.length;
                const offset = 0.000005; // ~50cm offset to avoid overlapping
                const latOffset = Math.cos(angle) * offset;
                const lngOffset = Math.sin(angle) * offset;

                return (
                  <Marker
                    tracksViewChanges={false}
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
                    onPress={() => setSelectedMarker(polygon)}>
                    <Callout>
                      <Text style={{ color: '#715757' }}>{polygon?.name}</Text>
                    </Callout>
                  </Marker>
                );
              }),
            )} */}
            {groupedMarkers.map(
              (group, index) =>
                group.map((polygon, i) => {
                  const angle =
                    (2 * Math.PI * i) /
                    group.length;

                  const offset = 0.000005;

                  const latOffset =
                    Math.cos(angle) * offset;

                  const lngOffset =
                    Math.sin(angle) * offset;

                  return (
                    <Marker
                      key={`${index}-${i}`}
                      tracksViewChanges={false}
                      coordinate={{
                        latitude:
                          polygon.latitude +
                          latOffset,

                        longitude:
                          polygon.longitude +
                          lngOffset,
                      }}
                      pinColor={
                        polygon?.color?.trim()
                          ? polygon.color
                          : 'red'
                      }
                      onPress={() => {
                        setSelectedMarker(
                          polygon,
                        );
                      }}>
                      <Callout>
                        <View
                          style={
                            styles.callout
                          }>
                          <Text
                            style={
                              styles.calloutText
                            }>
                            {polygon?.name ||
                              'Marker'}
                          </Text>
                        </View>
                      </Callout>
                    </Marker>
                  );
                }),
            )}
          </MapView>
        </View>

        {
          outofRange && (
            <TouchableOpacity
              style={styles.captureButton}
              onPress={() => TakePhoto(replaceImgKey, userLocation)}>
              <Text style={styles.captureIcon}>📷</Text>
            </TouchableOpacity>

          )
        }
        {selectedMarker && (
          <View style={styles.markerInfo}>
            <Text
              style={{
                textAlign: 'center',
                color: '#000',
                fontWeight: 'bold',
              }}>
              {selectedMarker?.name || 'Unnamed Marker'}
            </Text>
            {selectedMarker?.description && (
              <Text
                style={{
                  textAlign: 'center',
                  color: '#444',
                  marginTop: 4,
                }}>
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

  distanceBadge: {
    backgroundColor: 'rgba(0,0,0,0.85)',
    paddingHorizontal: 2,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    // flexDirection: 'row',
  },
  distanceText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  distanceUnit: {
    color: '#FFA726',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 2,
  },

  distanceBadgeSmall: {
    backgroundColor: 'rgba(0,0,0,0.85)',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  distanceTextSmall: { color: '#fff', fontSize: 9, fontWeight: 'bold', fontFamily: Fonts.Regular },

  infoCard: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.88)',
    padding: 16,
    borderRadius: 12,
    elevation: 6,
  },
  infoTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  infoText: { color: '#4CAF50', fontSize: 14, marginTop: 3 },
  accuracyInfo: { color: '#FFA726', fontSize: 13, marginTop: 6 },
  ringInfoContainer: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#555',
  },
  ringInfoTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  ringInfoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  ringInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    marginBottom: 8,
  },
  ringInfoColor: { width: 16, height: 16, borderRadius: 3, marginRight: 8 },
  ringInfoText: { color: '#ddd', fontSize: 12 },

  tapInstruction: {
    color: '#FF9800',
    fontSize: 12,
    marginTop: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  distanceResult: {
    color: '#4CAF50',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '500',
  },

  calloutView: { padding: 10, minWidth: 160 },
  calloutTitle: { fontWeight: 'bold', fontSize: 15, marginBottom: 6 },
});

export default memo(ActivityMap);
