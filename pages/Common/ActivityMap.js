import React, { useState, useRef, useCallback, memo, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Modal,
  Dimensions,
  TouchableOpacity,
  Text,
  Platform,
} from 'react-native';
import MapView, { Polygon, Marker, Callout, Circle } from 'react-native-maps';
import { isPointInPolygon, getDistance } from 'geolib';
import { Fonts } from '../utils/Constants';

const { width, height } = Dimensions.get('window');

const DISTANCE_RINGS = [
  {
    distance: 20,
    borderColor: '#FF8C00',
    color: 'rgba(0,255,127,0.7)',
  },
];

const LOCATION_UPDATE_INTERVAL = 1500; // Throttle to 1.5 seconds
const MIN_DISTANCE_THRESHOLD = 1; // Re-render only if moved >= 1 meter

/**
 * Calculates a point at a given distance and bearing from the source point.
 */
const calculatePointAtDistance = (lat, lng, distanceMeters, bearingDegrees = 0) => {
  const R = 6378137;
  const bearing = (bearingDegrees * Math.PI) / 180;
  const lat1 = (lat * Math.PI) / 180;
  const lon1 = (lng * Math.PI) / 180;
  const angularDistance = distanceMeters / R;

  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(angularDistance) +
    Math.cos(lat1) * Math.sin(angularDistance) * Math.cos(bearing),
  );

  let lon2 =
    lon1 +
    Math.atan2(
      Math.sin(bearing) * Math.sin(angularDistance) * Math.cos(lat1),
      Math.cos(angularDistance) - Math.sin(lat1) * Math.sin(lat2),
    );

  lon2 = ((lon2 + 3 * Math.PI) % (2 * Math.PI)) - Math.PI;

  return {
    latitude: (lat2 * 180) / Math.PI,
    longitude: (lon2 * 180) / Math.PI,
  };
};

/**
 * Groups pipe coordinates and slightly offsets duplicates to prevent stacking.
 */
const groupPointsByCoordinates = (points = []) => {
  const groups = {};
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    if (!p || p.latitude == null || p.longitude == null) continue;
    const key = `${p.latitude},${p.longitude}`;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(p);
  }
  return Object.values(groups);
};

// Memoized Distance Rings & North Label
const DistanceRings = memo(({ userLocation }) => {
  if (!userLocation?.latitude || !userLocation?.longitude) return null;

  return (
    <>
      {DISTANCE_RINGS.map((ring, index) => {
        const northPoint = calculatePointAtDistance(
          userLocation.latitude,
          userLocation.longitude,
          ring.distance,
          0,
        );

        return (
          <React.Fragment key={`ring-${index}-${ring.distance}`}>
            <Circle
              center={userLocation}
              radius={ring.distance}
              strokeWidth={1.5}
              strokeColor={ring.color}
              fillColor="transparent"
              zIndex={1}
            />
            {/* North Label Marker with tracksViewChanges false for smooth 60fps performance */}
            <Marker
              coordinate={northPoint}
              anchor={{ x: 0.5, y: 0.5 }}
              tracksViewChanges={false}
              zIndex={2}>
              <View
                style={[
                  styles.distanceBadgeSmall,
                  { borderColor: ring.borderColor },
                ]}>
                <Text style={styles.distanceTextSmall}>{ring.distance}m</Text>
              </View>
            </Marker>
          </React.Fragment>
        );
      })}
    </>
  );
});

// Memoized Pipe Markers List
const PipeMarkersList = memo(({ groupedMarkers, onSelectMarker }) => {
  return (
    <>
      {groupedMarkers.map((group, index) =>
        group.map((polygon, i) => {
          const total = group.length;
          const angle = total > 1 ? (2 * Math.PI * i) / total : 0;
          const offset = total > 1 ? 0.000005 : 0; // ~50cm offset for multi-pipe clusters
          const latOffset = Math.cos(angle) * offset;
          const lngOffset = Math.sin(angle) * offset;

          const lat = Number(polygon.latitude) + latOffset;
          const lng = Number(polygon.longitude) + lngOffset;

          return (
            <Marker
              key={`pipe-${index}-${i}-${lat}-${lng}`}
              tracksViewChanges={false}
              coordinate={{
                latitude: lat,
                longitude: lng,
              }}
              pinColor={
                polygon?.color && polygon.color.trim() !== ''
                  ? polygon.color
                  : 'red'
              }
              onPress={() => onSelectMarker(polygon)}>
              <Callout>
                <View style={styles.callout}>
                  <Text style={styles.calloutText}>
                    {polygon?.name || 'Marker'}
                  </Text>
                </View>
              </Callout>
            </Marker>
          );
        }),
      )}
    </>
  );
});

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
  setMapLatLon,
}) => {
  const mapRef = useRef(null);
  const lastLocationUpdate = useRef(0);
  const lastCoord = useRef(null);

  const [selectedMarker, setSelectedMarker] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  // Memoize grouped pipe coordinates
  const groupedMarkers = useMemo(() => {
    return groupPointsByCoordinates(pipeLatLong?.flat() || []);
  }, [pipeLatLong]);

  // Safe initial camera center coordinates
  const initialCenter = useMemo(() => {
    const lat = Number(location?.latitude);
    const lng = Number(location?.longitude);
    if (!isNaN(lat) && !isNaN(lng) && (lat !== 0 || lng !== 0)) {
      return { latitude: lat, longitude: lng };
    }
    return { latitude: 20.5937, longitude: 78.9629 };
  }, [location]);

  // Smooth throttled location handler
  const handleUserLocationChange = useCallback(
    event => {
      const coordinate = event?.nativeEvent?.coordinate;
      if (!coordinate || coordinate.latitude == null || coordinate.longitude == null) return;

      const now = Date.now();
      if (now - lastLocationUpdate.current < LOCATION_UPDATE_INTERVAL) {
        return;
      }

      const newLocation = {
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
        accuracy: coordinate.accuracy || 0,
      };

      // Filter micro GPS jitter (< 1 meter)
      if (lastCoord.current) {
        try {
          const dist = getDistance(lastCoord.current, newLocation);
          if (dist < MIN_DISTANCE_THRESHOLD) {
            return;
          }
        } catch (_) { }
      }

      lastLocationUpdate.current = now;
      lastCoord.current = newLocation;

      setUserLocation(newLocation);

      // Check boundary polygon
      if (Array.isArray(plotPolygon) && plotPolygon.length > 2) {
        try {
          const inside = isPointInPolygon(newLocation, plotPolygon);
          setOutOfRange?.(inside);
        } catch (_) { }
      }

      setMapLatLon?.(newLocation);
    },
    [plotPolygon, setOutOfRange, setMapLatLon],
  );

  const handleSelectMarker = useCallback(polygon => {
    setSelectedMarker(polygon);
  }, []);

  const handleCapturePress = useCallback(() => {
    TakePhoto?.(replaceImgKey, userLocation || location);
  }, [TakePhoto, replaceImgKey, userLocation, location]);

  const handleCloseModal = useCallback(() => {
    setModalVisibleMap?.(false);
  }, [setModalVisibleMap]);

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={modalVisibleMap}
      onRequestClose={handleCloseModal}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <MapView
            ref={mapRef}
            style={styles.map}
            mapType="hybrid"
            showsUserLocation={true}
            followsUserLocation={true}
            showsMyLocationButton={true}
            toolbarEnabled={false}
            showsCompass={false}
            rotateEnabled={false}
            pitchEnabled={false}
            moveOnMarkerPress={false}
            userLocationPriority="high"
            minZoomLevel={14}
            maxZoomLevel={20}
            userLocationUpdateInterval={3000}
            userLocationFastestInterval={2000}
            initialCamera={{
              center: initialCenter,
              zoom: 18,
              heading: 0,
              pitch: 0,
            }}
            onUserLocationChange={handleUserLocationChange}>
            {/* User distance rings */}
            <DistanceRings userLocation={userLocation} />

            {/* Farm plot polygon */}
            {Array.isArray(plotPolygon) && plotPolygon.length > 0 && (
              <Polygon
                coordinates={plotPolygon}
                fillColor="rgba(139, 236, 11, 0.55)"
                strokeColor="rgb(1, 255, 1)"
                strokeWidth={2}
              />
            )}

            {/* Clustered pipe markers */}
            <PipeMarkersList
              groupedMarkers={groupedMarkers}
              onSelectMarker={handleSelectMarker}
            />
          </MapView>
        </View>

        {/* Close Button Top Right */}
        <TouchableOpacity
          style={styles.closeButton}
          onPress={handleCloseModal}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>

        {/* Capture Button (Conditional based on outofRange) */}
        {outofRange ? (
          <TouchableOpacity
            style={styles.captureButton}
            activeOpacity={0.75}
            onPress={handleCapturePress}>
            <Text style={styles.captureIcon}>📷</Text>
          </TouchableOpacity>
        ) : null}

        {/* Selected Marker Detail Card */}
        {selectedMarker && (
          <View style={styles.markerInfo}>
            <TouchableOpacity
              style={styles.closeMarkerCard}
              onPress={() => setSelectedMarker(null)}>
              <Text style={styles.closeMarkerCardText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.markerName}>
              {selectedMarker?.name || 'Unnamed Marker'}
            </Text>
            {selectedMarker?.description ? (
              <Text style={styles.markerDesc}>
                {selectedMarker.description}
              </Text>
            ) : null}
          </View>
        )}
      </View>
    </Modal >
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: '#000',
  },
  modalContent: {
    flex: 1,
    width: '100%',
  },
  map: {
    width: width,
    height: height,
    ...StyleSheet.absoluteFillObject,
  },
  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 20 : 45,
    left: 20,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFF',
    zIndex: 10,
  },
  closeIcon: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  captureButton: {
    backgroundColor: '#FFF',
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 25,
    alignSelf: 'center',
    borderWidth: 3.5,
    borderColor: '#2E7D32',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
  },
  captureIcon: {
    color: '#000',
    fontSize: 32,
    marginBottom: 2,
  },
  markerInfo: {
    position: 'absolute',
    bottom: 110,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    padding: 14,
    borderRadius: 12,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  closeMarkerCard: {
    position: 'absolute',
    top: 8,
    right: 10,
    padding: 4,
  },
  closeMarkerCardText: {
    color: '#888',
    fontSize: 16,
    fontWeight: 'bold',
  },
  markerName: {
    textAlign: 'center',
    color: '#111',
    fontWeight: 'bold',
    fontSize: 15,
  },
  markerDesc: {
    textAlign: 'center',
    color: '#555',
    marginTop: 4,
    fontSize: 13,
  },
  distanceBadgeSmall: {
    backgroundColor: 'rgba(0,0,0,0.85)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  distanceTextSmall: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: 'bold',
    fontFamily: Fonts?.Regular || undefined,
  },
  callout: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 90,
    alignItems: 'center',
  },
  calloutText: {
    color: '#222',
    fontWeight: '600',
    fontSize: 13,
  },
});

export default memo(ActivityMap);

