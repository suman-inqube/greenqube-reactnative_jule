import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  TouchableOpacity,
  Text,
  Image,
  Alert,
} from 'react-native';
import MapView, {
  Polygon,
  Marker,
  PROVIDER_GOOGLE,
} from 'react-native-maps';
import { getItem } from '../../../config/getDataFromStorage';
import { getDistance } from 'geolib';
import * as geolib from 'geolib';
import { isWithin20Meters } from '../../Common/calculateAreaFun';
import SuggestiveSearchInput from '../../Common/SuggestiveSearchInput';
import MultiActionButton from '../../Common/MultiActionButton';
import LoadingScreen from '../../Common/LoadingScreen';
import { getMapLocation } from '../../../config/apiHere';

// Constants
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DEFAULT_COORDINATES = { latitude: 22.2906, longitude: 87.8491 };
const MAP_DELTAS = {
  CLOSE: { latitudeDelta: 0.001, longitudeDelta: 0.001 },
  MEDIUM: { latitudeDelta: 0.05, longitudeDelta: 0.05 },
};
const DISTANCE_THRESHOLDS = {
  REFERENCE: 20,
  POLYGON_POINT: 40,
};
const ANIMATION_DURATION = 1000;
const ANIMATION_DELAY = 100;

// Polygon colors configuration
const POLYGON_STYLES = {
  existing: {
    fillColor: 'rgba(167, 3, 3, 0.66)',
    strokeColor: 'rgb(240, 9, 9)',
  },
  current: {
    fillColor: 'rgba(139, 236, 11, 0.73)',
    strokeColor: 'rgb(1, 255, 1)',
  },
  drawing: {
    fillColor: 'rgba(0, 200, 200, 0.5)',
    strokeColor: 'rgb(0, 200, 200)',
  },
};

const OptimizedMap = ({
  polygons = [],
  newPolygon = [],
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
  setOutofRange,
  statuslevel,
  type,
  baselatLong,
  handleRegionChangeComplete,
  isLoading,
}) => {
  // State management
  const [currentLocation, setCurrentLocation] = useState(null);
  const [drawingReference, setDrawingReference] = useState(null);
  const [marker, setMarker] = useState({ lat: 0, lng: 0 });
  const [selectedArea, setSelectedArea] = useState(0);
  const [coordinatesCurrent, setCoordinatesCurrent] = useState([]);
  
  // Refs
  const mapRef = useRef(null);

  // Memoized values
  const distanceThreshold = useMemo(() => DISTANCE_THRESHOLDS.REFERENCE, []);

  // Memoized polygon coordinates with validation
  const validatedPolygons = useMemo(() => {
    return polygons.filter(polygon => 
      Array.isArray(polygon) && 
      polygon.length >= 3 &&
      polygon.every(coord => 
        coord && 
        typeof coord.latitude === 'number' && 
        typeof coord.longitude === 'number' &&
        !isNaN(coord.latitude) && 
        !isNaN(coord.longitude)
      )
    );
  }, [polygons]);

  // Memoized new polygon markers
  const newPolygonMarkers = useMemo(() => {
    return newPolygon.map((coordinate, index) => ({
      id: `new-marker-${index}`,
      coordinate,
    }));
  }, [newPolygon]);

  // Memoized actions for MultiActionButton
  const actions = useMemo(() => {
    const baseActions = [
      {
        label: editing ? 'Stop Editing' : 'Start Editing',
        onPress: () => setEditing(!editing),
        style: { backgroundColor: '#000' },
      },
    ];

    if (editing) {
      baseActions.push(
        {
          label: 'Finalize Polygon',
          onPress: finalizePolygon,
          style: { backgroundColor: '#000' },
        },
        {
          label: 'Clear',
          onPress: clearMapGetDistance,
          style: { backgroundColor: '#000' },
        },
        {
          label: 'Undo Mark',
          onPress: undoMark,
          style: { backgroundColor: '#000' },
        }
      );
    }

    return baseActions;
  }, [editing, setEditing, finalizePolygon, undoMark]);

  // Utility functions
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

  const animateToLocation = useCallback((latitude, longitude, customDeltas = MAP_DELTAS.CLOSE) => {
    if (!mapRef.current || !isValidCoordinate(latitude, longitude)) {
      console.warn('Invalid coordinates for animateToLocation:', { latitude, longitude });
      return;
    }

    setTimeout(() => {
      mapRef.current.animateToRegion(
        {
          latitude,
          longitude,
          ...customDeltas,
        },
        ANIMATION_DURATION
      );
    }, ANIMATION_DELAY);
  }, [isValidCoordinate]);

  const calculatePolygonArea = useCallback((polygon) => {
    if (!polygon || polygon.length < 3) return 0;
    
    try {
      const area = geolib.getAreaOfPolygon(polygon);
      const unitMultiplier = landUnitsquareMetre?.[0]?.defined_unit_value;
      return unitMultiplier ? Number(unitMultiplier) * area : area;
    } catch (error) {
      console.warn('Error calculating polygon area:', error);
      return 0;
    }
  }, [landUnitsquareMetre]);

  const editingLocation = useCallback(async () => {
    try {
      const fusedLocation = await getItem('fusedLocation');
      if (fusedLocation?.latitude && fusedLocation?.longitude) {
        const { latitude, longitude } = fusedLocation;
        if (isValidCoordinate(latitude, longitude)) {
          setDrawingReference({ latitude, longitude });
        }
      }
    } catch (error) {
      console.warn('Error getting editing location:', error);
    }
  }, [isValidCoordinate]);

  const processLocationCoordinates = useCallback((locationData) => {
    if (!Array.isArray(locationData)) return [];

    return locationData
      .filter(coord => 
        coord &&
        coord.latitude !== undefined &&
        coord.longitude !== undefined &&
        coord.latitude !== null &&
        coord.longitude !== null &&
        coord.latitude !== '' &&
        coord.longitude !== ''
      )
      .map(coord => ({
        latitude: typeof coord.latitude === 'string' 
          ? parseFloat(coord.latitude) 
          : coord.latitude,
        longitude: typeof coord.longitude === 'string' 
          ? parseFloat(coord.longitude) 
          : coord.longitude,
      }))
      .filter(coord => isValidCoordinate(coord.latitude, coord.longitude));
  }, [isValidCoordinate]);

  const clearMapGetDistance = useCallback(async () => {
    try {
      if (type === 'livehoood') {
        clearNewPolygon();
        return;
      }

      if (location.length === 1) {
        clearNewPolygon();
        return;
      }

      const dist = isWithin20Meters(drawingReference, location, DISTANCE_THRESHOLDS.REFERENCE);
      if (dist.length !== 0) {
        clearNewPolygon();
      } else {
        Alert.alert(
          '❌ Out of Range',
          'Plot location and current location are not the same!',
          [{ text: 'OK', onPress: () => console.log('OK Pressed') }],
          { cancelable: false }
        );
      }
    } catch (error) {
      console.warn('Error in clearMapGetDistance:', error);
    }
  }, [type, location, drawingReference, clearNewPolygon]);

  const handleMapPressGetDistance = useCallback(async (event) => {
    try {
      if (type === 'livehoood') {
        handleMapPress(event);
        return;
      }

      const { coordinate } = event.nativeEvent;
      const { latitude, longitude } = coordinate;
      
      if (!isValidCoordinate(latitude, longitude)) {
        console.warn('Invalid coordinates from map press');
        return;
      }

      const pressedPoint = { latitude, longitude };
      const reference = editing ? (drawingReference || currentLocation) : currentLocation;

      if (!reference) return;

      if (newPolygon.length === 0) {
        const distance = getDistance(pressedPoint, reference);
        if (distance <= distanceThreshold) {
          handleMapPress(event);
        } else if (editing) {
          Alert.alert(
            '❌ Out of Range',
            'Plot location and current location are not the same!'
          );
        }
      } else {
        const dist = isWithin20Meters(pressedPoint, newPolygon, DISTANCE_THRESHOLDS.POLYGON_POINT);
        if (dist !== 0) {
          handleMapPress(event);
        } else {
          console.log('❌ Point is more than allowed distance away.');
        }
      }
    } catch (error) {
      console.warn('Error in handleMapPressGetDistance:', error);
    }
  }, [
    type,
    editing,
    drawingReference,
    currentLocation,
    newPolygon,
    distanceThreshold,
    handleMapPress,
    isValidCoordinate,
  ]);

  const fetchSearchSuggestions = useCallback(async (query) => {
    try {
      const suggestiveRes = await getMapLocation(query);
      return suggestiveRes?.data?.features || [];
    } catch (error) {
      console.warn('Error fetching search suggestions:', error);
      return [];
    }
  }, []);

  const handleSelect = useCallback((item) => {
    const coordinates = item?.properties?.coordinates;
    if (coordinates?.latitude && coordinates?.longitude) {
      setMarker({ 
        lat: coordinates.latitude, 
        lng: coordinates.longitude 
      });
      animateToLocation(coordinates.latitude, coordinates.longitude);
    }
  }, [animateToLocation]);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
  }, [setShowModal]);

  // Effects
  useEffect(() => {
    const initializeLocation = async () => {
      try {
        const hasValidLocation = location?.length && 
          location[0]?.latitude && 
          location[0]?.longitude;

        if (hasValidLocation) {
          const lat = parseFloat(location[0].latitude);
          const lng = parseFloat(location[0].longitude);
          if (isValidCoordinate(lat, lng)) {
            animateToLocation(lat, lng);
          }
        } else if (baselatLong && isValidCoordinate(baselatLong.latitude, baselatLong.longitude)) {
          animateToLocation(baselatLong.latitude, baselatLong.longitude);
          
          if (polygons.length === 0) {
            setCurrentLocation({
              ...baselatLong,
              ...MAP_DELTAS.MEDIUM,
            });
          }
        }
      } catch (error) {
        console.warn('Error initializing location:', error);
      }
    };

    initializeLocation();
  }, [baselatLong, location, polygons.length, animateToLocation, isValidCoordinate]);

  useEffect(() => {
    if (validatedPolygons.length > 0) {
      const firstPolygon = validatedPolygons[0];
      if (firstPolygon[0]) {
        setCurrentLocation({
          latitude: firstPolygon[0].latitude,
          longitude: firstPolygon[0].longitude,
          ...MAP_DELTAS.MEDIUM,
        });
      }
    }

    if (newPolygon.length === 0 && validatedPolygons.length > 0) {
      setSelectedArea(area || 0);
    }
  }, [validatedPolygons, newPolygon.length, area]);

  useEffect(() => {
    const calculatedArea = calculatePolygonArea(newPolygon);
    setSelectedArea(calculatedArea);
  }, [newPolygon, calculatePolygonArea]);

  useEffect(() => {
    if (editing && !drawingReference) {
      editingLocation();
    }
  }, [editing, drawingReference, editingLocation]);

  useEffect(() => {
    const processedCoordinates = processLocationCoordinates(location);
    setCoordinatesCurrent(processedCoordinates);
  }, [location, processLocationCoordinates]);

  // Memoized area unit display
  const areaUnitText = useMemo(() => {
    const unitName = landAreaUnit?.[0]?.defined_unit_value 
      ? landAreaUnit[0].unit_name 
      : 'Square meter';
    return unitName;
  }, [landAreaUnit]);

  return (
    <View style={styles.container}>
      {isLoading && (
        <View style={styles.loaderOverlay}>
          <LoadingScreen />
        </View>
      )}

      <TouchableOpacity style={styles.closeButton} onPress={handleCloseModal}>
        <Image
          source={require('../../Common/images/cross100.png')}
          style={styles.closeIcon}
        />
      </TouchableOpacity>

      <MapView
        ref={mapRef}
        style={styles.map}
        mapType="hybrid"
        provider={PROVIDER_GOOGLE}
        onRegionChangeComplete={handleRegionChangeComplete}
        onPress={handleMapPressGetDistance}
        showsUserLocation
        followsUserLocation
        showsCompass
        compassOffset={{ x: 20, y: 20 }}
        minZoomLevel={15}
        scrollEnabled
        showsScale
        zoomTapEnabled
        rotateEnabled={false}
        userLocationUpdateInterval={5000}
        loadingEnabled
        showsMyLocationButton
        zoomEnabled
        zoomControlEnabled
        pitchEnabled
      >
        {/* Existing polygons */}
        {validatedPolygons.map((polygon, index) => (
          <Polygon
            key={`existing-${index}`}
            coordinates={polygon}
            fillColor={POLYGON_STYLES.existing.fillColor}
            strokeColor={POLYGON_STYLES.existing.strokeColor}
            strokeWidth={2}
            tappable={false}
          />
        ))}

        {/* Current coordinates polygon */}
        {coordinatesCurrent.length > 0 && (
          <Polygon
            coordinates={coordinatesCurrent}
            fillColor={POLYGON_STYLES.current.fillColor}
            strokeColor={POLYGON_STYLES.current.strokeColor}
            strokeWidth={2}
            zIndex={999}
            tappable={false}
          />
        )}

        {/* Drawing polygon */}
        {newPolygon.length > 0 && (
          <Polygon
            coordinates={newPolygon}
            fillColor={POLYGON_STYLES.drawing.fillColor}
            strokeColor={POLYGON_STYLES.drawing.strokeColor}
            strokeWidth={2}
            zIndex={0}
            tappable={false}
          />
        )}

        {/* New polygon markers */}
        {newPolygonMarkers.map((markerData) => (
          <Marker 
            key={markerData.id} 
            coordinate={markerData.coordinate} 
          />
        ))}

        {/* Search result marker */}
        {marker.lat !== 0 && marker.lng !== 0 && (
          <Marker 
            coordinate={{ latitude: marker.lat, longitude: marker.lng }} 
          />
        )}
      </MapView>

      {/* Selected Area Display */}
      {selectedArea !== 0 && (
        <View style={styles.areaContainer}>
          <Text style={styles.areaText}>
            Selected Area: {selectedArea.toFixed(2)} {areaUnitText}
          </Text>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionButtonContainer}>
        <MultiActionButton actions={actions} statuslevel={statuslevel} />
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <SuggestiveSearchInput
          fetchSuggestions={fetchSearchSuggestions}
          onSelect={handleSelect}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    left: 10,
    zIndex: 999,
    width: 38,
    height: 38,
    backgroundColor: 'rgba(230, 223, 223, 0.9)',
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    width: 35,
    height: 35,
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  areaContainer: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  areaText: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  actionButtonContainer: {
    position: 'absolute',
    bottom: 15,
    left: 100,
  },
  searchContainer: {
    position: 'absolute',
    top: 10,
    left: 60,
    right: 10,
    zIndex: 998,
  },
});

export default React.memo(OptimizedMap);