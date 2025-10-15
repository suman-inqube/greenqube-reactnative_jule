import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  memo,
} from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  TouchableOpacity,
  Text,
  Image,
  Alert,
} from 'react-native';
import MapView, {Polygon, Marker, PROVIDER_GOOGLE} from 'react-native-maps';
import {getItem} from '../../../config/getDataFromStorage';
import Geolocation from '@react-native-community/geolocation';
import {getDistance} from 'geolib';
import * as geolib from 'geolib';
import {isWithin20Meters} from '../../Common/calculateAreaFun';
import SuggestiveSearchInput from '../../Common/SuggestiveSearchInput';
import {getMapLocation} from '../../../config/apiHere';
import LoadingScreen from '../../Common/LoadingScreen';
import {Colors} from '../../utils/Constants';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FloatingActionButton from '../../Components/FloatingActionButton';

const DEFAULT_REGION = {
  latitude: 0,
  longitude: 0,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

const ANIMATION_CONFIG = {
  latitudeDelta: 0.001,
  longitudeDelta: 0.001,
};

const DISTANCE_THRESHOLD = 20;
const ANIMATION_DELAY = 100;
const ANIMATION_DURATION = 1000;

const Map = ({
  polygons,
  newPolygon,
  handleMapPress,
  setEditing,
  editing,
  finalizePolygon,
  clearNewPolygon,
  setShowModal,
  undoMark,
  landAreaUnit,
  landUnitsquareMetre,
  area,
  location,
  statuslevel,
  type,
  baselatLong,
  handleRegionChangeComplete,
  isLoading,
  coords,
  onClose,
}) => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [drawingReference, setDrawingReference] = useState(null);
  const [selectedArea, setSelectedArea] = useState(0);
  const [coordinatesCurrent, setCoordinatesCurrent] = useState([]);
  const [marker, setMarker] = useState({lat: 0, lng: 0});

  // Refs to track mounted state and prevent memory leaks
  const isMountedRef = useRef(true);
  const mapRef = useRef(null);
  const animationTimeoutRef = useRef(null);

  // Cleanup function to prevent memory leaks
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
        animationTimeoutRef.current = null;
      }
    };
  }, []);

  /** Memoized coordinate validation */
  const isValidCoordinate = useCallback((latitude, longitude) => {
    return (
      typeof latitude === 'number' &&
      typeof longitude === 'number' &&
      !isNaN(latitude) &&
      !isNaN(longitude) &&
      latitude >= -90 &&
      latitude <= 90 &&
      longitude >= -180 &&
      longitude <= 180
    );
  }, []);

  /** Optimized animate to location with cleanup */
  const animateToLocation = useCallback(
    (latitude, longitude) => {
      // if (!isMountedRef.current || !mapRef.current || !isValidCoordinate(latitude, longitude)) {
      //   console.warn("Invalid coordinates for animateToLocation or component unmounted");
      //   return;
      // }

      // Clear existing timeout
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
      animationTimeoutRef.current = setTimeout(() => {
        if (isMountedRef.current && mapRef.current) {
          try {
            mapRef.current.animateToRegion(
              {
                latitude,
                longitude,
                ...ANIMATION_CONFIG,
              },
              ANIMATION_DURATION,
            );
          } catch (error) {
            console.warn('Animation error:', error);
          }
        }
        animationTimeoutRef.current = null;
      }, ANIMATION_DELAY);
    },
    [isValidCoordinate],
  );

  /** Memoized floating actions with stable references */
  const actions = useMemo(() => {
    const baseActions = [
      {
        text: editing ? 'Stop Editing' : 'Start Editing',
        icon: require('../../Common/images/editing.png'),
        name: 'toggleEdit',
        position: 1,
        color: Colors.useGreen,
      },
    ];

    if (editing) {
      baseActions.push(
        {
          text: 'Finalize Polygon',
          icon: require('../../Common/images/check.png'),
          name: 'finalizePolygon',
          position: 2,
          color: Colors.useGreen,
        },
        {
          text: 'Clear',
          icon: require('../../Common/images/bin.png'),
          name: 'clear',
          position: 3,
          color: Colors.useGreen,
        },
        {
          text: 'Undo Mark',
          icon: require('../../Common/images/undo.png'),
          name: 'undoMark',
          position: 4,
          color: Colors.useGreen,
        },
      );
    }

    return baseActions;
  }, [editing]);

  /** Optimized initialization with proper error handling */
  useEffect(() => {
    let isEffectActive = true;
    const init = async () => {
      try {
        if (!isMountedRef.current || !isEffectActive) return;

        const hasLocationData =
          location?.[0]?.latitude && location?.[0]?.longitude;

        if (hasLocationData) {
          const lat = Number(location[0].latitude);
          const lng = Number(location[0].longitude);
          if (isValidCoordinate(lat, lng)) {
            animateToLocation(lat, lng);
          }
        } else if (
          baselatLong &&
          isValidCoordinate(baselatLong.latitude, baselatLong.longitude)
        ) {
          animateToLocation(baselatLong.latitude, baselatLong.longitude);

          if (polygons.length === 0 && isMountedRef.current) {
            setCurrentLocation({
              ...baselatLong,
              ...DEFAULT_REGION,
              latitude: baselatLong.latitude,
              longitude: baselatLong.longitude,
            });
          }
        }
      } catch (err) {
        console.warn('Init error:', err);
      }
    };

    init();

    return () => {
      isEffectActive = false;
    };
  }, [location, baselatLong, animateToLocation, isValidCoordinate]);

  /** Memoized area calculation with error handling */
  const calculatedArea = useMemo(() => {
    if (newPolygon.length <= 2) return 0;

    try {
      const base = landUnitsquareMetre?.[0]?.defined_unit_value || 1;
      const polygonArea = geolib.getAreaOfPolygon(newPolygon);
      return base * polygonArea;
    } catch (error) {
      console.warn('Area calculation error:', error);
      return 0;
    }
  }, [newPolygon, landUnitsquareMetre]);

  /** Update selected area only when calculated area changes */
  useEffect(() => {
    if (isMountedRef.current) {
      setSelectedArea(calculatedArea);
    }
  }, [calculatedArea]);

  /** Memoized coordinate processing with validation */
  const processedCoordinates = useMemo(() => {
    if (!location || !Array.isArray(location)) return [];

    return location
      .filter(
        coord =>
          coord?.latitude != null &&
          coord?.longitude != null &&
          coord.latitude !== '' &&
          coord.longitude !== '',
      )
      .map(coord => {
        const latitude =
          typeof coord.latitude === 'string'
            ? Number(coord.latitude)
            : coord.latitude;
        const longitude =
          typeof coord.longitude === 'string'
            ? Number(coord.longitude)
            : coord.longitude;

        return isValidCoordinate(latitude, longitude)
          ? {latitude, longitude}
          : null;
      })
      .filter(Boolean);
  }, [location, isValidCoordinate]);

  /** Update coordinates only when processed coordinates change */
  useEffect(() => {
    if (isMountedRef.current) {
      setCoordinatesCurrent(processedCoordinates);
    }
  }, [processedCoordinates]);

  /** Optimized drawing reference setup */
  useEffect(() => {
    if (!editing || drawingReference || !coords) return;

    const {latitude, longitude} = coords;
    if (isValidCoordinate(latitude, longitude) && isMountedRef.current) {
      setDrawingReference({latitude, longitude});
    }
  }, [editing, drawingReference, coords, isValidCoordinate]);

  /** Memoized clear function with error handling */
  const clearMapGetDistance = useCallback(() => {
    if (!isMountedRef.current) return;

    try {
      if (type === 'livehoood') {
        clearNewPolygon();
        return;
      }

      if (!location || location.length <= 1) {
        clearNewPolygon();
        return;
      }

      const dist = isWithin20Meters(drawingReference, location, 20);
      if (dist.length !== 0) {
        clearNewPolygon();
      } else {
        Alert.alert(
          '❌ Out of Range',
          'Plot location and current location not same!',
        );
      }
    } catch (err) {
      console.warn('Clear error:', err);
      // Fallback to clear anyway if there's an error
      clearNewPolygon();
    }
  }, [drawingReference, location, type, clearNewPolygon]);

  /** Optimized map press handler with memoized dependencies */
  const handleMapPressGetDistance = useCallback(
    event => {
      if (!isMountedRef.current || !event?.nativeEvent?.coordinate) return;

      try {
        const {latitude, longitude} = event.nativeEvent.coordinate;

        if (!isValidCoordinate(latitude, longitude)) {
          console.warn('Invalid coordinates from map press');
          return;
        }

        const pressedPoint = {latitude, longitude};

        if (type === 'livehoood') {
          handleMapPress(event);
          return;
        }

        const reference = editing
          ? drawingReference || currentLocation
          : currentLocation;
        if (!reference) return;

        if (newPolygon.length === 0) {
          const dist = getDistance(pressedPoint, reference);
          if (dist <= DISTANCE_THRESHOLD) {
            handleMapPress(event);
          } else if (editing) {
            Alert.alert(
              '❌ Out of Range',
              'Plot location and current location not same!',
            );
          }
        } else {
          const dist = isWithin20Meters(pressedPoint, newPolygon, 40);
          if (dist !== 0) {
            handleMapPress(event);
          }
        }
      } catch (err) {
        console.warn('Press error:', err);
      }
    },
    [
      type,
      editing,
      drawingReference,
      currentLocation,
      newPolygon,
      handleMapPress,
      isValidCoordinate,
    ],
  );

  /** Optimized select handler with validation */
  const handleSelect = useCallback(
    item => {
      // if (!isMountedRef.current || !item) return;
      // console.log(item)
      const {lat, lng} = item;
      if (isValidCoordinate(lat, lng)) {
        setMarker({lat, lng});
        animateToLocation(lat, lng);
      } else {
        console.warn('Invalid coordinates from search selection');
      }
    },
    [animateToLocation, isValidCoordinate],
  );

  /** Memoized action handler */
  const handleActionPress = useCallback(
    name => {
      // if (!isMountedRef.current) return;

      switch (name) {
        case 'toggleEdit':
          setEditing(!editing);
          break;
        case 'finalizePolygon':
          finalizePolygon();
          break;
        case 'clear':
          clearMapGetDistance();
          break;
        case 'undoMark':
          undoMark();
          break;
        case 'MapView':
          setShowModal(prev => !prev);
          break;
        default:
          console.log('Unhandled action:', name);
      }
    },
    [
      editing,
      setEditing,
      finalizePolygon,
      clearMapGetDistance,
      undoMark,
      setShowModal,
    ],
  );

  /** GPS button handler with validation */
  const handleGpsButtonPress = useCallback(() => {
    // if (!isMountedRef.current || !coords) return;

    const {latitude, longitude} = coords;
    if (isValidCoordinate(latitude, longitude)) {
      animateToLocation(latitude, longitude);
    } else {
      console.warn('Invalid GPS coordinates');
    }
  }, [coords, animateToLocation, isValidCoordinate]);
  const handleClosePress = useCallback(() => {
    if (onClose) {
      onClose();
    } else {
      console.warn('No onClose handler provided');
    }
  }, [onClose]);
  /** Memoized marker component */
  const searchMarker = useMemo(() => {
    if (
      marker.lat === 0 ||
      marker.lng === 0 ||
      !isValidCoordinate(marker.lat, marker.lng)
    ) {
      return null;
    }
    return (
      <Marker coordinate={{latitude: marker.lat, longitude: marker.lng}} />
    );
  }, [marker.lat, marker.lng, isValidCoordinate]);

  /** Memoized polygon components */
  const polygonComponents = useMemo(() => {
    return polygons.map((polygon, idx) => {
      if (!Array.isArray(polygon) || polygon.length < 3) return null;

      // Validate all coordinates in polygon
      const validPolygon = polygon.every(coord =>
        isValidCoordinate(coord.latitude, coord.longitude),
      );

      if (!validPolygon) return null;

      return (
        <Polygon
          key={`existing-polygon-${idx}`}
          coordinates={polygon}
          fillColor="rgba(167, 3, 3, 0.66)"
          strokeColor="rgb(240, 9, 9)"
          strokeWidth={2}
          zIndex={-1}
        />
      );
    });
  }, [polygons, isValidCoordinate]);

  /** Memoized new polygon markers */
  const newPolygonMarkers = useMemo(() => {
    return newPolygon.map((coord, idx) => {
      if (!isValidCoordinate(coord.latitude, coord.longitude)) return null;
      return <Marker key={`new-polygon-marker-${idx}`} coordinate={coord} />;
    });
  }, [newPolygon, isValidCoordinate]);

  return (
    <View style={styles.container}>
      {isLoading && (
        <View style={styles.loaderOverlay}>
          <LoadingScreen />
        </View>
      )}

      <MapView
        ref={mapRef}
        style={styles.map}
        mapType="hybrid"
        provider={PROVIDER_GOOGLE}
        onRegionChangeComplete={newRegion =>
          handleRegionChangeComplete(newRegion)
        }
        onPress={handleMapPressGetDistance}
        showsUserLocation
        followsUserLocation
        showsCompass
        compassOffset={{x: 20, y: 20}}
        minZoomLevel={15}
        showsScale
        zoomTapEnabled
        rotateEnabled={false}
        userLocationUpdateInterval={5000}
        // loadingEnabled
        showsMyLocationButton
        zoomEnabled
        pitchEnabled>
        {polygonComponents}

        {coordinatesCurrent.length > 0 && (
          <Polygon
            coordinates={coordinatesCurrent}
            fillColor="rgba(139, 236, 11, 0.73)"
            strokeColor="rgb(1, 255, 1)"
            strokeWidth={2}
          />
        )}

        {newPolygon.length > 0 && (
          <Polygon
            coordinates={newPolygon}
            fillColor="rgba(0, 200, 200, 0.5)"
            strokeColor="rgb(0, 200, 200)"
            strokeWidth={2}
          />
        )}

        {newPolygonMarkers}
        {searchMarker}
      </MapView>

      {selectedArea !== 0 && (
        <View style={styles.areaBox}>
          <Text style={styles.areaText}>
            Selected Area: {selectedArea.toFixed(2)}{' '}
            {landAreaUnit?.[0]?.defined_unit_value
              ? landAreaUnit[0].unit_name
              : 'Square meter'}
          </Text>
        </View>
      )}

      <FloatingActionButton
        position="right"
        actions={actions}
        color={Colors.useGreen}
        overlayColor="rgba(22, 17, 17, 0.35)"
        distanceToEdge={{vertical: 80, horizontal: 25}}
        onPressItem={handleActionPress}
        openOnMount={editing}
      />

      <View style={styles.searchBox}>
        <SuggestiveSearchInput
          placeholder="Search places..."
          onSelect={handleSelect}
          maxSuggestions={50}
          minQueryLength={2}
          setShowModal={setShowModal}
        />
      </View>

      <TouchableOpacity style={styles.gpsButton} onPress={handleGpsButtonPress}>
        <MaterialCommunityIcons
          name="crosshairs-gps"
          size={30}
          color="#3C75BE"
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F5FCFF'},
  map: {...StyleSheet.absoluteFillObject},
  searchIcon: {
    top: 12,
    left: 10,
    zIndex: 999,
    width: 38,
    height: 38,
    backgroundColor: '#e6dfdf',
    opacity: 0.7,
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  areaBox: {
    position: 'absolute',
    bottom: 2,
    right: 20,
    backgroundColor: '#000',
    padding: 6,
    borderRadius: 4,
  },
  areaText: {fontSize: 15, color: '#FFF'},
  searchBox: {
    width: '95%',
    position: 'absolute',
    top: 10,
    alignSelf: 'center',
    left: 10,
  },
  gpsButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    padding: 5,
    borderRadius: 100,
    backgroundColor: '#fff',
    shadowOffset: {width: 1, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowColor: '#000',
    elevation: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 100,
    right: 20,
    zIndex: 1000,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: {width: 1, height: 1},
    shadowOpacity: 0.3,
    shadowRadius: 3,
    shadowColor: '#000',
    elevation: 5,
  },
});
export default memo(Map);
