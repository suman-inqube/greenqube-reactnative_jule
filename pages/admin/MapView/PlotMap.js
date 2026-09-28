import React, { useRef, useEffect, useState, useContext, useMemo, useCallback, memo } from 'react';
import MapView, { Polygon, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import FloatingActionButton from '../../Components/FloatingActionButton';
import { userCreateContext } from '../../Context/usersCreateContext';

// Top-level static constants to prevent bridge string allocations
const SELECTED_FILL_COLOR = 'rgba(144,238,144,0.7)';
const UNSELECTED_FILL_COLOR = 'rgba(31, 164, 42, 0.8)';
const POLYGON_STROKE_COLOR = '#004d00';
const RADIUS_STROKE_COLOR = 'rgb(1, 200, 255)';
const RADIUS_FILL_COLOR = 'rgba(241, 248, 255, 0.11)';
const DEFAULT_CENTER = { latitude: 22.5726, longitude: 88.3639 };
const SEARCH_ICON = require('../../Common/images/find.png');

// Memoized Individual Plot Polygon Item
const PlotPolygonItem = memo(({ plot, onPolygonPress }) => {
  const handlePress = useCallback(() => {
    onPolygonPress?.(plot);
  }, [onPolygonPress, plot]);

  if (!plot?.coordinates || !Array.isArray(plot.coordinates) || plot.coordinates.length < 3) {
    return null;
  }

  return (
    <Polygon
      coordinates={plot.coordinates}
      fillColor={plot.isSelected ? SELECTED_FILL_COLOR : UNSELECTED_FILL_COLOR}
      strokeColor={POLYGON_STROKE_COLOR}
      strokeWidth={2}
      tappable={true}
      tracksViewChanges={false}
      onPress={handlePress}
    />
  );
});

const PlotMap = ({
  polygons = [],
  center,
  onPolygonPress,
  onOpenFilter,
  showRadius,
  isFocused = true,
}) => {
  const { t } = useContext(userCreateContext);
  const mapRef = useRef(null);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    if (
      center &&
      typeof center.latitude === 'number' &&
      typeof center.longitude === 'number' &&
      mapRef.current
    ) {
      mapRef.current.animateToRegion({
        latitude: center.latitude,
        longitude: center.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  }, [center]);

  const initialRegion = useMemo(() => ({
    latitude: center?.latitude || DEFAULT_CENTER.latitude,
    longitude: center?.longitude || DEFAULT_CENTER.longitude,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  }), []);

  const fabActions = useMemo(() => [
    {
      text: t?.('search_location') || 'Search Location',
      icon: SEARCH_ICON,
      name: 'search_location',
      position: 1,
    },
  ], [t]);

  const handleFabPress = useCallback((name) => {
    if (name === 'search_location') {
      onOpenFilter?.();
    }
  }, [onOpenFilter]);

  const handleMenuPress = useCallback(() => {
    setShowMenu(false);
    onOpenFilter?.();
  }, [onOpenFilter]);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        mapType="hybrid"
        showsUserLocation={isFocused}
        showsMyLocationButton={isFocused}
        followsUserLocation={false}
        showsPointsOfInterest={false}
        showsBuildings={false}
        showsIndoors={false}
        showsTraffic={false}
        loadingEnabled={true}
        loadingIndicatorColor="#2E7D32"
        loadingBackgroundColor="#0A0A0A"
        moveOnMarkerPress={false}
        toolbarEnabled={false}
        initialRegion={initialRegion}>
        {center && showRadius && typeof center.latitude === 'number' && typeof center.longitude === 'number' && (
          <Circle
            center={{
              latitude: center.latitude,
              longitude: center.longitude,
            }}
            radius={500}
            strokeColor={RADIUS_STROKE_COLOR}
            fillColor={RADIUS_FILL_COLOR}
            zIndex={1}
          />
        )}

        {/* ✅ OPTIMIZED MEMOIZED POLYGONS */}
        {polygons.map((plot, index) => (
          <PlotPolygonItem
            key={plot.id || `plot-${index}`}
            plot={plot}
            onPolygonPress={onPolygonPress}
          />
        ))}
      </MapView>

      {showMenu && (
        <View style={styles.menuContainer}>
          <TouchableOpacity onPress={handleMenuPress} style={styles.menuItem}>
            <Text style={styles.menuText}>{t?.('search_location') || 'Search Location'}</Text>
          </TouchableOpacity>
        </View>
      )}

      <FloatingActionButton
        actions={fabActions}
        onPressItem={handleFabPress}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  menuContainer: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  menuItem: {
    padding: 10,
  },
  menuText: {
    color: '#000',
    fontSize: 14,
  },
});

export default React.memo(PlotMap);
