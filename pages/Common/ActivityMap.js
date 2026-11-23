import React, { useState, useRef, useCallback, memo, useMemo, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Modal,
  Dimensions,
  TouchableOpacity,
  Text,
  Platform,
} from 'react-native';
import MapView, { Polygon, Marker, Callout, Circle, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
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

// Clean map style: shows only roads and land, hiding POIs, transit, and administrative clutter
const ROAD_AND_LAND_MAP_STYLE = [
  {
    featureType: 'administrative',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'administrative.country',
    elementType: 'geometry.stroke',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'administrative.province',
    elementType: 'geometry.stroke',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'administrative.locality',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'administrative.neighborhood',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'administrative.land_parcel',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'poi',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'transit',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'landscape',
    elementType: 'geometry',
    stylers: [{ visibility: 'on' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ visibility: 'on' }],
  },
  {
    featureType: 'road',
    elementType: 'labels',
    stylers: [{ visibility: 'on' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.icon',
    stylers: [{ visibility: 'off' }],
  },
];

// Static map styling constants to prevent native bridge re-allocation
const POLYGON_FILL_COLOR = 'rgba(139, 236, 11, 0.55)';
const POLYGON_STROKE_COLOR = 'rgb(1, 255, 1)';
const CIRCLE_FILL_COLOR = 'transparent';
const DEFAULT_MAP_CENTER = { latitude: 20.5937, longitude: 78.9629 };

const LOCATION_UPDATE_INTERVAL = 1500; // Throttle to 1.5 seconds
const MIN_DISTANCE_THRESHOLD = 1; // Re-render only if moved >= 1 meter
const HIGH_ACCURACY_THRESHOLD = 15; // GPS Accuracy threshold in meters (<= 20m is High Accuracy)
const STABLE_DISTANCE_DELTA_THRESHOLD = 2.5; // Max movement in meters between updates to be considered stationary
const REQUIRED_STABLE_TICKS = 2; // Consecutive stationary updates required
const MAX_STATIONARY_SPEED = 0.8; // m/s speed threshold (walking is ~1.4 m/s)

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
 * Formats distance in meters or kilometers.
 */
const formatDistance = meters => {
  if (meters == null || isNaN(meters)) return null;
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
};
/**
 * Groups pipe coordinates and slightly offsets duplicates to prevent stacking.
 */
const groupPointsByCoordinates = (points = []) => {
  if (!Array.isArray(points) || points.length === 0) return [];
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

// Memoized Single Pipe Marker Item for minimal re-renders & GC relief
const PipeMarkerItem = memo(({ polygon, lat, lng, onSelectMarker }) => {
  const handlePress = useCallback(() => {
    onSelectMarker(polygon);
  }, [onSelectMarker, polygon]);

  return (
    <Marker
      tracksViewChanges={false}
      coordinate={{
        latitude: lat,
        longitude: lng,
      }}
      pinColor={
        polygon?.color && typeof polygon.color === 'string' && polygon.color.trim() !== ''
          ? polygon.color
          : 'red'
      }
      onPress={handlePress}>
      <Callout>
        <View style={styles.callout}>
          <Text style={styles.calloutText}>
            {polygon?.name || 'Marker'}
          </Text>
        </View>
      </Callout>
    </Marker>
  );
});

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
              fillColor={CIRCLE_FILL_COLOR}
              zIndex={1}
            />
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
  if (!groupedMarkers || groupedMarkers.length === 0) return null;
  if (__DEV__) {
    console.log("groupedMarkers", JSON.stringify(groupedMarkers))
  }
  return (
    <>
      {groupedMarkers.map((group, groupIdx) =>
        group.map((polygon, i) => {
          const total = group.length;
          const angle = total > 1 ? (2 * Math.PI * i) / total : 0;
          const offset = total > 1 ? 0.000005 : 0; // ~50cm offset for multi-pipe clusters
          const latOffset = Math.cos(angle) * offset;
          const lngOffset = Math.sin(angle) * offset;

          const lat = Number(polygon.latitude) + latOffset;
          const lng = Number(polygon.longitude) + lngOffset;

          return (
            <PipeMarkerItem
              key={`pipe-${groupIdx}-${i}-${polygon?.id || `${lat}_${lng}`}`}
              polygon={polygon}
              lat={lat}
              lng={lng}
              onSelectMarker={onSelectMarker}
            />
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
  selectPipeList
}) => {
  // console.error("selectPipeList", JSON.stringify(selectPipeList))
  // console.log("pipeLatLong", JSON.stringify(pipeLatLong))
  const mapRef = useRef(null);
  const lastLocationUpdate = useRef(0);
  const lastCoord = useRef(null);
  const isMountedRef = useRef(true);
  const hasCenteredRef = useRef(false);

  const [selectedMarker, setSelectedMarker] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [gpsAccuracy, setGpsAccuracy] = useState(null);
  const [isLocationStable, setIsLocationStable] = useState(false);

  const stableCountRef = useRef(0);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  // console.log(JSON.stringify(pipeLatLong))
  // Safe camera centering utility
  const centerOnLocation = useCallback((coord, animated = true) => {
    if (!coord || !mapRef.current) return;
    const lat = Number(coord.latitude);
    const lng = Number(coord.longitude);
    if (isNaN(lat) || isNaN(lng) || (lat === 0 && lng === 0)) return;

    try {
      mapRef.current.animateCamera(
        {
          center: { latitude: lat, longitude: lng },
          // center: { latitude: 25.554263516390048, longitude: 88.09223257005215 },
          // center: { latitude: 25.5522304, longitude: 88.0943861 },
          zoom: 18,
          pitch: 0,
          heading: 0,
        },
        { duration: animated ? 600 : 0 },
      );
    } catch (_) {
      try {
        mapRef.current.animateToRegion({
          latitude: lat,
          longitude: lng,
          latitudeDelta: 0.003,
          longitudeDelta: 0.003,
        });
      } catch (__) { }
    }
  }, []);

  // Center on current location whenever the modal becomes visible
  useEffect(() => {
    if (modalVisibleMap) {
      hasCenteredRef.current = false;
      stableCountRef.current = 0;
      setIsLocationStable(false);
      setGpsAccuracy(null);
      setUserLocation(null);
      setOutOfRange?.(false); // Reset boundary status until live GPS fixes

      const targetLoc = location;
      if (targetLoc && targetLoc.latitude && targetLoc.longitude) {
        const timer = setTimeout(() => {
          centerOnLocation(targetLoc, false);
          hasCenteredRef.current = true;
        }, 150);
        return () => clearTimeout(timer);
      }
    } else {
      setSelectedMarker(null);
      setUserLocation(null);
      setGpsAccuracy(null);
      setIsLocationStable(false);
      stableCountRef.current = 0;
      lastCoord.current = null;
      lastLocationUpdate.current = 0;
      hasCenteredRef.current = false;
    }
  }, [modalVisibleMap, location, centerOnLocation, setOutOfRange]);

  // Triggered when map finishes native initialization
  const handleMapReady = useCallback(() => {
    const targetLoc = userLocation || location;
    if (targetLoc && targetLoc.latitude && targetLoc.longitude) {
      centerOnLocation(targetLoc, false);
      hasCenteredRef.current = true;
    }
  }, [userLocation, location, centerOnLocation]);

  // Memoize grouped pipe coordinates efficiently
  const groupedMarkers = useMemo(() => {
    if (!pipeLatLong) return [];
    const flattened = Array.isArray(pipeLatLong)
      ? pipeLatLong.reduce((acc, item) => {
        if (Array.isArray(item)) {
          acc.push(...item);
        } else if (item) {
          acc.push(item);
        }
        return acc;
      }, [])
      : [];
    return groupPointsByCoordinates(flattened);
  }, [pipeLatLong]);

  // Extract selected pipe target coordinates cleanly
  const selectedPipeCoord = useMemo(() => {
    if (!selectPipeList) return null;
    let lat = null;
    let lng = null;
    const raw = selectPipeList.latlongs;

    if (raw && typeof raw === 'object') {
      if (Array.isArray(raw) && raw.length > 0) {
        lat = Number(raw[0].latitude);
        lng = Number(raw[0].longitude);
      } else if (raw.latitude != null && raw.longitude != null) {
        lat = Number(raw.latitude);
        lng = Number(raw.longitude);
      }
    } else if (selectPipeList.latitude != null && selectPipeList.longitude != null) {
      lat = Number(selectPipeList.latitude);
      lng = Number(selectPipeList.longitude);
    }

    if (lat == null || lng == null || isNaN(lat) || isNaN(lng) || (lat === 0 && lng === 0)) {
      return null;
    }

    return {
      latitude: lat,
      longitude: lng,
      name: selectPipeList.label || 'Selected Pipe',
      id: selectPipeList.value || selectPipeList?.latlongs?.pipe_pid || 'selected-pipe',
    };
  }, [selectPipeList]);

  // Coordinates for the direct line from current blue dot to selected pipe
  const pipeLineCoords = useMemo(() => {
    const currentLoc = userLocation || location;
    if (
      !currentLoc?.latitude ||
      !currentLoc?.longitude ||
      !selectedPipeCoord?.latitude ||
      !selectedPipeCoord?.longitude
    ) {
      return null;
    }
    return [
      { latitude: Number(currentLoc.latitude), longitude: Number(currentLoc.longitude) },
      { latitude: Number(selectedPipeCoord.latitude), longitude: Number(selectedPipeCoord.longitude) },
    ];
  }, [userLocation, location, selectedPipeCoord]);

  // Live distance in meters between blue dot and selected pipe
  const selectedPipeDistance = useMemo(() => {
    const currentLoc = userLocation || location;
    if (
      !currentLoc?.latitude ||
      !currentLoc?.longitude ||
      !selectedPipeCoord?.latitude ||
      !selectedPipeCoord?.longitude
    ) {
      return null;
    }
    try {
      const d = getDistance(
        { latitude: Number(currentLoc.latitude), longitude: Number(currentLoc.longitude) },
        { latitude: Number(selectedPipeCoord.latitude), longitude: Number(selectedPipeCoord.longitude) },
      );
      return Math.round(d);
    } catch (_) {
      return null;
    }
  }, [userLocation, location, selectedPipeCoord]);

  const selectedPipeDistanceText = useMemo(() => {
    if (selectedPipeDistance == null) return null;
    if (selectedPipeDistance < 1000) {
      return `${selectedPipeDistance}m`;
    }
    return `${(selectedPipeDistance / 1000).toFixed(1)}km`;
  }, [selectedPipeDistance]);

  // Midpoint coordinate of the line for placing distance badge
  const lineMidPoint = useMemo(() => {
    if (!pipeLineCoords || pipeLineCoords.length < 2) return null;
    return {
      latitude: (pipeLineCoords[0].latitude + pipeLineCoords[1].latitude) / 2,
      longitude: (pipeLineCoords[0].longitude + pipeLineCoords[1].longitude) / 2,
    };
  }, [pipeLineCoords]);

  // Safe initial camera center coordinates
  const initialCenter = useMemo(() => {
    const lat = Number(location?.latitude || userLocation?.latitude || selectedPipeCoord?.latitude);
    const lng = Number(location?.longitude || userLocation?.longitude || selectedPipeCoord?.longitude);
    if (!isNaN(lat) && !isNaN(lng) && (lat !== 0 || lng !== 0)) {
      return { latitude: lat, longitude: lng };
    }
    return DEFAULT_MAP_CENTER;
  }, [location, userLocation, selectedPipeCoord]);

  // Validated polygon coordinates for MapView Polygon
  const validPolygonCoords = useMemo(() => {
    if (__DEV__) {
      console.log("plotPolygon", JSON.stringify(plotPolygon))
    }
    if (!Array.isArray(plotPolygon) || plotPolygon.length < 3) return null;
    return plotPolygon.filter(
      p => p && typeof p.latitude === 'number' && typeof p.longitude === 'number',
    );
  }, [plotPolygon]);

  // Smooth throttled location handler with auto-centering on first fix
  const handleUserLocationChange = useCallback(
    event => {
      const coordinate = event?.nativeEvent?.coordinate;
      if (!coordinate || coordinate.latitude == null || coordinate.longitude == null) return;

      const accuracy = coordinate.accuracy || 0;
      const speed = coordinate.speed != null && coordinate.speed >= 0 ? coordinate.speed : null;
      const isHighAccuracy = accuracy > 0 && accuracy <= HIGH_ACCURACY_THRESHOLD;

      if (isMountedRef.current) {
        setGpsAccuracy(accuracy);
      }

      // Calculate distance moved from last point
      let movedDist = 0;
      if (lastCoord.current) {
        try {
          movedDist = getDistance(lastCoord.current, coordinate);
        } catch (_) { }
      }

      // Check if user is currently moving or GPS location is fluctuating/jittering
      const isMovingOrJumping =
        (speed !== null && speed > MAX_STATIONARY_SPEED) ||
        (lastCoord.current && movedDist > STABLE_DISTANCE_DELTA_THRESHOLD);

      if (isHighAccuracy && !isMovingOrJumping) {
        stableCountRef.current += 1;
        if (stableCountRef.current >= REQUIRED_STABLE_TICKS) {
          if (isMountedRef.current) {
            setIsLocationStable(true);
          }
        }
      } else {
        stableCountRef.current = 0;
        if (isMountedRef.current) {
          setIsLocationStable(false);
        }
      }

      const now = Date.now();
      if (now - lastLocationUpdate.current < LOCATION_UPDATE_INTERVAL) {
        return;
      }

      const newLocation = {
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
        accuracy: accuracy,
      };

      // Filter micro GPS jitter (< 1 meter)
      if (lastCoord.current && movedDist < MIN_DISTANCE_THRESHOLD) {
        return;
      }

      lastLocationUpdate.current = now;
      lastCoord.current = newLocation;

      if (!isMountedRef.current) return;
      setUserLocation(newLocation);

      // Auto center on user's current location on first GPS fix when map opened
      if (!hasCenteredRef.current) {
        hasCenteredRef.current = true;
        centerOnLocation(newLocation, true);
      }

      // Check boundary polygon and set coordinates ONLY IF High Accuracy is achieved
      if (isHighAccuracy) {
        if (Array.isArray(plotPolygon) && plotPolygon.length > 2) {
          try {
            const inside = isPointInPolygon(newLocation, plotPolygon);
            setOutOfRange?.(inside);
          } catch (_) { }
        }

        setMapLatLon?.(newLocation);
      }
    },
    [plotPolygon, setOutOfRange, setMapLatLon, centerOnLocation],
  );

  const handleSelectMarker = useCallback(polygon => {
    // console.log('Selected Marker:', polygon);
    if (isMountedRef.current) {
      setSelectedMarker(polygon);
    }
  }, []);

  const handleCloseMarkerCard = useCallback(() => {
    if (isMountedRef.current) {
      setSelectedMarker(null);
    }
  }, []);

  const handleCapturePress = useCallback(() => {
    const accuracy = userLocation?.accuracy || gpsAccuracy || 0;
    if (accuracy <= 0 || accuracy > HIGH_ACCURACY_THRESHOLD || !isLocationStable) {
      return;
    }
    const currentLoc = userLocation || location;
    if (Array.isArray(plotPolygon) && plotPolygon.length > 2) {
      try {
        const inside = isPointInPolygon(currentLoc, plotPolygon);
        if (inside) {
          if (
            TakePhotoReplaceImage &&
            replaceImgKey?.arrayPosition != null &&
            replaceImgKey.arrayPosition !== ''
          ) {
            TakePhotoReplaceImage(replaceImgKey, currentLoc);
          } else {
            TakePhoto?.(replaceImgKey, currentLoc);
          }
        } else {
          // Alert.alert(
          //   'Out of Range',
          //   'You are currently outside the farm plot boundary. Please move inside the plot to capture images.',
          //   [{ text: 'OK' }],
          // );
          Alert.alert(
            "Location Outside Farm Boundary",
            "Your device's current GPS location is outside the farm plot boundary. Please move inside the designated plot area and ensure your GPS signal is accurate before capturing images.",
            [{ text: "OK" }]
          );
        }
      } catch (error) {
        Alert.alert(
          'Error',
          error,
          [{ text: 'OK' }],
        );
      }
    }
  }, [
    TakePhoto,
    TakePhotoReplaceImage,
    replaceImgKey,
    userLocation,
    location,
    gpsAccuracy,
    isLocationStable,
    plotPolygon,
  ]);

  const handleCloseModal = useCallback(() => {
    setSelectedMarker(null);
    setUserLocation(null);
    setGpsAccuracy(null);
    setIsLocationStable(false);
    stableCountRef.current = 0;
    lastCoord.current = null;
    hasCenteredRef.current = false;
    setModalVisibleMap?.(false);
  }, [setModalVisibleMap]);

  if (!modalVisibleMap) {
    return null;
  }

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
            provider={PROVIDER_GOOGLE}
            customMapStyle={ROAD_AND_LAND_MAP_STYLE}
            showsUserLocation={true}
            followsUserLocation={false}
            showsMyLocationButton={true}
            toolbarEnabled={false}
            showsCompass={false}
            rotateEnabled={false}
            pitchEnabled={false}
            showsBuildings={false}
            showsIndoors={false}
            showsTraffic={false}
            showsPointsOfInterest={false}
            loadingEnabled={false}
            loadingIndicatorColor="#2E7D32"
            loadingBackgroundColor="#0A0A0A"
            moveOnMarkerPress={false}
            userLocationPriority="high"
            minZoomLevel={14}
            maxZoomLevel={19}
            userLocationUpdateInterval={2000}
            userLocationFastestInterval={1500}
            initialCamera={{
              center: initialCenter,
              zoom: 18,
              heading: 0,
              pitch: 0,
            }}
            initialRegion={{
              latitude: 22.290371,
              longitude: 87.849141,
              // latitude: initialCenter.latitude,
              // longitude: initialCenter.longitude,
              latitudeDelta: 0.003,
              longitudeDelta: 0.003,
            }}
            onMapReady={handleMapReady}
            onUserLocationChange={handleUserLocationChange}>
            {/* User distance rings */}
            <DistanceRings userLocation={userLocation} />

            {/* Farm plot polygon */}
            {validPolygonCoords && validPolygonCoords.length >= 3 && (
              <Polygon
                coordinates={validPolygonCoords}
                fillColor={POLYGON_FILL_COLOR}
                strokeColor={POLYGON_STROKE_COLOR}
                strokeWidth={2}
              />
            )}

            {/* Clustered pipe markers */}
            <PipeMarkersList
              groupedMarkers={groupedMarkers}
              onSelectMarker={handleSelectMarker}
            />

            {/* Direct Line from Blue Dot to Selected Pipe */}
            {pipeLineCoords && (
              <Polyline
                coordinates={pipeLineCoords}
                strokeColor="#00E5FF"
                strokeWidth={3}
                lineDashPattern={[8, 5]}
                zIndex={15}
              />
            )}

            {/* Distance Badge on Line Midpoint */}
            {lineMidPoint && selectedPipeDistanceText && (
              <Marker
                coordinate={lineMidPoint}
                anchor={{ x: 0.5, y: 0.5 }}
                tracksViewChanges={false}
                zIndex={16}>
                <View style={styles.lineDistanceBadge}>
                  <Text style={styles.lineDistanceText}>{selectedPipeDistanceText}</Text>
                </View>
              </Marker>
            )}

            {/* Highlighted Target Marker for Selected Pipe */}
            {selectedPipeCoord && (
              <Marker
                coordinate={{
                  latitude: selectedPipeCoord.latitude,
                  longitude: selectedPipeCoord.longitude,
                }}
                anchor={{ x: 0.5, y: 1 }}
                tracksViewChanges={false}
                zIndex={20}>
                <View style={styles.targetPipeMarkerWrapper}>
                  <View
                    style={[
                      styles.targetPipeBadge,
                      selectedPipeDistance != null && selectedPipeDistance <= 10
                        ? styles.targetPipeBadgeInRange
                        : styles.targetPipeBadgeOutRange,
                    ]}>
                    <Text style={styles.targetPipeBadgeName} numberOfLines={1}>
                      {selectPipeList?.label ? `🎯 ${selectPipeList.label}` : '🎯 Selected Pipe'}
                    </Text>
                    {selectedPipeDistanceText && (
                      <Text style={styles.targetPipeBadgeDist}>
                        {selectedPipeDistanceText}
                      </Text>
                    )}
                  </View>
                  <View style={styles.targetPinCircle}>
                    <View style={styles.targetPinInner} />
                  </View>
                  <View style={styles.targetPinPointer} />
                </View>
              </Marker>
            )}
          </MapView>
        </View>

        {/* Close Button Top Left */}
        <TouchableOpacity
          style={styles.closeButton}
          onPress={handleCloseModal}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>

        {/* Selected Pipe Real-time Distance HUD */}
        {selectedPipeCoord && selectedPipeDistanceText && (
          <View
            style={[
              styles.selectedPipeHUD,
              selectedPipeDistance <= 10
                ? styles.hudInRange
                : styles.hudOutOfRange,
            ]}>
            <Text style={styles.hudIcon}>
              {selectedPipeDistance <= 10 ? '✅' : '🎯'}
            </Text>
            <View style={styles.hudTextWrapper}>
              <Text style={styles.hudPipeName} numberOfLines={1}>
                {selectPipeList?.label || 'Selected Pipe'}
              </Text>
              <Text style={styles.hudDistanceText}>
                {selectedPipeDistanceText} away{' '}
                {selectedPipeDistance <= 10 ? '(≤10m In Range)' : '(Move Closer)'}
              </Text>
            </View>
          </View>
        )}

        {/* Top GPS Accuracy / Stability Pill */}
        {!gpsAccuracy || gpsAccuracy > HIGH_ACCURACY_THRESHOLD ? (
          <View style={[styles.accuracyBadge, styles.accuracyLow]}>
            <View style={[styles.accuracyDot, styles.dotLow]} />
            <Text style={[styles.accuracyText, styles.accuracyTextLow]}>
              {gpsAccuracy == null
                ? '📡 Searching GPS...'
                : `Low Accuracy (±${Math.round(gpsAccuracy)}m) - Calibrating...`}
            </Text>
          </View>
        ) : !isLocationStable ? (
          <View style={[styles.accuracyBadge, styles.accuracyCalibrating]}>
            <View style={[styles.accuracyDot, styles.dotCalibrating]} />
            <Text style={[styles.accuracyText, styles.accuracyTextCalibrating]}>
              ⏳ Stabilizing Position - Please Stand Still...
            </Text>
          </View>
        ) : null}

        {/* Capture Button (Shown ONLY when inside plot AND GPS is High Accuracy & Stable) */}
        {outofRange &&
          gpsAccuracy &&
          gpsAccuracy <= HIGH_ACCURACY_THRESHOLD &&
          isLocationStable ? (
          <TouchableOpacity
            style={[styles.captureButton, styles.captureButtonReady]}
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
              onPress={handleCloseMarkerCard}>
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
    </Modal>
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
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
  },
  captureButtonReady: {
    borderColor: '#2E7D32',
    opacity: 1,
  },
  captureButtonDisabled: {
    borderColor: '#757575',
    opacity: 0.45,
  },
  accuracyBadge: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 25 : 45,
    left: 60,
    right: 20,
    height: 38,
    borderRadius: 19,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderWidth: 0,
    zIndex: 10,
    // shadowColor: '#000',
    // shadowOpacity: 0.25,
    // shadowOffset: { width: 0, height: 2 },
    // shadowRadius: 4,
    // elevation: 5,
  },
  accuracyLow: {
    // backgroundColor: 'rgba(20, 20, 20, 0.9)',
    borderColor: '#FF9800',
  },
  accuracyCalibrating: {
    // backgroundColor: 'rgba(20, 20, 20, 0.9)',
    borderColor: '#29B6F6',
  },
  accuracyHigh: {
    // backgroundColor: 'rgba(20, 20, 20, 0.9)',
    borderColor: '#00E676',
  },
  accuracyDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    marginRight: 8,
  },
  dotLow: {
    backgroundColor: '#FF9800',
  },
  dotCalibrating: {
    backgroundColor: '#29B6F6',
  },
  dotHigh: {
    backgroundColor: '#00E676',
  },
  accuracyText: {
    fontSize: 10,
    fontWeight: '600',
    flexShrink: 1,
  },
  accuracyTextLow: {
    color: '#FFB74D',
    backgroundColor: 'red'
  },
  accuracyTextCalibrating: {
    color: '#81D4FA',
    backgroundColor: 'red'
  },
  accuracyTextHigh: {
    color: '#B9F6CA',
    backgroundColor: 'red'
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
  lineDistanceBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#00E5FF',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  lineDistanceText: {
    color: '#00E5FF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  targetPipeMarkerWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetPipeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1.5,
    marginBottom: 3,
    elevation: 5,
    alignItems: 'center',
  },
  targetPipeBadgeInRange: {
    backgroundColor: '#1B5E20',
    borderColor: '#69F0AE',
  },
  targetPipeBadgeOutRange: {
    backgroundColor: '#0D47A1',
    borderColor: '#40C4FF',
  },
  targetPipeBadgeName: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
    maxWidth: 120,
  },
  targetPipeBadgeDist: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: 'bold',
    marginTop: 1,
  },
  targetPinCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#00E5FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: '#FFF',
    elevation: 6,
  },
  targetPinInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0D47A1',
  },
  targetPinPointer: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 7,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#00E5FF',
    alignSelf: 'center',
    marginTop: -1,
  },
  selectedPipeHUD: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 70 : 95,
    left: 20,
    right: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    zIndex: 10,
  },
  hudInRange: {
    backgroundColor: 'rgba(27, 94, 32, 0.92)',
    borderColor: '#69F0AE',
  },
  hudOutOfRange: {
    backgroundColor: 'rgba(13, 71, 161, 0.92)',
    borderColor: '#40C4FF',
  },
  hudIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  hudTextWrapper: {
    flex: 1,
  },
  hudPipeName: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  hudDistanceText: {
    color: '#E0F7FA',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
});

export default memo(ActivityMap);
