import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Alert,
  Platform,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import MapView, {
  Polygon,
  Marker,
  PROVIDER_GOOGLE,
  MAP_TYPES,
  LocalTile,
} from 'react-native-maps';
import NetInfo from '@react-native-community/netinfo';
import RNFS from 'react-native-fs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors } from '../../utils/Constants';
import LoadingScreen from '../../Common/LoadingScreen';
import FloatingActionButton from '../../Components/FloatingActionButton';
import SuggestiveSearchInput from '../../Common/SuggestiveSearchInput';
import { getMapLocation } from '../../../config/apiHere';
import { getDistance } from 'geolib';
import * as geolib from 'geolib';
import { isWithin20Meters } from '../../Common/calculateAreaFun';
import { getItem } from '../../../config/getDataFromStorage';

const TILE_DIR = `${RNFS.DocumentDirectoryPath}/offline_tiles`;
const USER_AGENT = 'LandMappingApp/1.0';

// Helper function to validate and clean coordinates
const validateAndCleanCoordinates = (coordinates) => {
  if (!coordinates || !Array.isArray(coordinates)) {
    return [];
  }
  
  return coordinates
    .filter(coord => {
      // Check if coordinate object exists
      if (!coord || typeof coord !== 'object') return false;
      
      // Check if latitude and longitude exist and are valid numbers
      const hasLat = 'latitude' in coord;
      const hasLng = 'longitude' in coord;
      const lat = coord.latitude;
      const lng = coord.longitude;
      
      // Validate types and ranges
      const isValidLat = typeof lat === 'number' && !isNaN(lat) && lat >= -90 && lat <= 90;
      const isValidLng = typeof lng === 'number' && !isNaN(lng) && lng >= -180 && lng <= 180;
      
      // Check if values are strings that can be parsed
      const isStringLat = typeof lat === 'string' && !isNaN(parseFloat(lat));
      const isStringLng = typeof lng === 'string' && !isNaN(parseFloat(lng));
      
      return (hasLat && hasLng) && (isValidLat || isStringLat) && (isValidLng || isStringLng);
    })
    .map(coord => ({
      latitude: typeof coord.latitude === 'string' ? parseFloat(coord.latitude) : coord.latitude,
      longitude: typeof coord.longitude === 'string' ? parseFloat(coord.longitude) : coord.longitude,
    }));
};

// Helper function to get unique key for polygons
const getPolygonKey = (polygon, index) => {
  if (!polygon || polygon.length === 0) return `polygon-empty-${index}`;
  
  // Create a hash from the coordinates for a stable key
  const coordsString = polygon
    .map(coord => `${coord.latitude.toFixed(6)},${coord.longitude.toFixed(6)}`)
    .join('|');
  
  return `polygon-${index}-${coordsString.length}`;
};

export default function Map({
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
}) {
  const mapRef = useRef(null);
  const [isConnected, setIsConnected] = useState(true);
  const [useOfflineMode, setUseOfflineMode] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [isDirReady, setIsDirReady] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [drawingReference, setDrawingReference] = useState(null);
  const [distanceThreshold] = useState(20);
  const [marker, setMarker] = useState({ lat: 0, lng: 0 });
  const [selectedArea, setSelectedArea] = useState(0);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [totalTiles, setTotalTiles] = useState(0);
  const [downloadedTiles, setDownloadedTiles] = useState(0);

  // Clean and validate polygons
  const cleanedPolygons = useMemo(() => {
    if (!polygons || !Array.isArray(polygons)) return [];
    
    return polygons.map(polygon => validateAndCleanCoordinates(polygon));
  }, [polygons]);

  // Clean and validate newPolygon
  const cleanedNewPolygon = useMemo(() => {
    return validateAndCleanCoordinates(newPolygon);
  }, [newPolygon]);

  // Clean and validate location
  const cleanedLocation = useMemo(() => {
    return validateAndCleanCoordinates(location);
  }, [location]);

  // 1. Initialize tile directory and network listener
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const wasConnected = isConnected;
      const nowConnected = !!state.isConnected;
      setIsConnected(nowConnected);
      
      if (nowConnected && !wasConnected) {
        Alert.alert('Online', 'You are back online.');
      } else if (!nowConnected && wasConnected) {
        Alert.alert('Offline', 'You are offline. Using cached maps if available.');
      }
    });

    const initDir = async () => {
      try {
        const exists = await RNFS.exists(TILE_DIR);
        if (!exists) {
          await RNFS.mkdir(TILE_DIR);
        }
        setIsDirReady(true);
      } catch (e) {
        console.error("Directory initialization failed", e);
      }
    };

    initDir();
    return () => unsubscribe();
  }, []);

  // 2. Initialize location
  useEffect(() => {
    const onPageLoad = async () => {
      try {
        if (cleanedLocation.length > 0 && cleanedLocation[0].latitude && cleanedLocation[0].longitude) {
          animateToLocation(
            cleanedLocation[0].latitude,
            cleanedLocation[0].longitude,
          );
        } else if (baselatLong?.latitude && baselatLong?.longitude) {
          animateToLocation(baselatLong.latitude, baselatLong.longitude);
          setCurrentLocation({
            latitude: baselatLong.latitude,
            longitude: baselatLong.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          });
        }
      } catch (error) {
        console.log('Error fetching location:', error);
      }
    };
    onPageLoad();
  }, [baselatLong, cleanedLocation]);

  // 3. Calculate selected area
  useEffect(() => {
    if (cleanedNewPolygon.length > 2) {
      try {
        const polygonArea = geolib.getAreaOfPolygon(cleanedNewPolygon);
        if (landUnitsquareMetre?.[0]?.defined_unit_value) {
          setSelectedArea(
            Number(landUnitsquareMetre?.[0]?.defined_unit_value) * polygonArea
          );
        } else {
          setSelectedArea(polygonArea);
        }
      } catch (error) {
        console.error('Error calculating polygon area:', error);
        setSelectedArea(0);
      }
    } else {
      setSelectedArea(0);
    }
  }, [cleanedNewPolygon, landUnitsquareMetre]);

  // 4. Handle editing reference location
  useEffect(() => {
    if (editing && !drawingReference) {
      editingLocation();
    }
  }, [editing, drawingReference]);

  // Helper functions for tile calculations
  const lon2tile = (lon, zoom) => Math.floor(((lon + 180) / 360) * Math.pow(2, zoom));
  const lat2tile = (lat, zoom) => Math.floor(
    ((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2) *
    Math.pow(2, zoom)
  );

  // Download tiles for offline use
  const downloadTiles = async () => {
    if (!baselatLong || typeof baselatLong.latitude !== 'number') {
      return Alert.alert("Error", "Location data not loaded yet.");
    }

    if (!isConnected) return Alert.alert("Internet Required", "Connect to internet to download maps.");
    
    setDownloading(true);
    setDownloadProgress(0);
    setDownloadedTiles(0);
    
    const zoomLevels = [14, 15, 16];
    const lat = parseFloat(baselatLong.latitude);
    const lon = parseFloat(baselatLong.longitude);
    
    // Calculate total tiles for progress
    let total = 0;
    for (let z of zoomLevels) {
      const xStart = lon2tile(lon - 0.01, z);
      const xEnd = lon2tile(lon + 0.01, z);
      const yStart = lat2tile(lat + 0.005, z);
      const yEnd = lat2tile(lat - 0.005, z);
      total += (xEnd - xStart + 1) * (yEnd - yStart + 1);
    }
    setTotalTiles(total);

    try {
      let downloadedCount = 0;
      
      for (let z of zoomLevels) {
        const xStart = lon2tile(lon - 0.01, z);
        const xEnd = lon2tile(lon + 0.01, z);
        const yStart = lat2tile(lat + 0.005, z);
        const yEnd = lat2tile(lat - 0.005, z);

        for (let x = xStart; x <= xEnd; x++) {
          const dir = `${TILE_DIR}/${z}/${x}`;
          await RNFS.mkdir(dir);
          
          for (let y = yStart; y <= yEnd; y++) {
            const path = `${dir}/${y}.png`;
            
            // Skip if already downloaded
            if (await RNFS.exists(path)) {
              downloadedCount++;
              setDownloadedTiles(downloadedCount);
              setDownloadProgress((downloadedCount / total) * 100);
              continue;
            }

            // Try multiple tile sources for reliability
            const tileSources = [
              `https://tile.openstreetmap.org/${z}/${x}/${y}.png`,
              `https://a.tile.openstreetmap.org/${z}/${x}/${y}.png`,
              `https://b.tile.openstreetmap.org/${z}/${x}/${y}.png`,
              `https://c.tile.openstreetmap.org/${z}/${x}/${y}.png`,
            ];

            let success = false;
            for (let source of tileSources) {
              try {
                await RNFS.downloadFile({
                  fromUrl: source,
                  toFile: path,
                  headers: { 'User-Agent': USER_AGENT },
                  background: true,
                }).promise;
                success = true;
                break;
              } catch (err) {
                console.log(`Failed from ${source}, trying next...`);
              }
            }

            if (!success) {
              console.warn(`Could not download tile ${z}/${x}/${y}`);
            }

            downloadedCount++;
            setDownloadedTiles(downloadedCount);
            setDownloadProgress((downloadedCount / total) * 100);
            
            // Small delay to avoid rate limiting
            await new Promise(r => setTimeout(r, 50));
          }
        }
      }
      
      Alert.alert("Success", `Downloaded ${downloadedCount} tiles for offline use.`);
    } catch (error) {
      console.error("Download error:", error);
      Alert.alert("Error", "Download failed. Please try again later.");
    } finally {
      setDownloading(false);
      setDownloadProgress(0);
      setTotalTiles(0);
      setDownloadedTiles(0);
    }
  };

  const editingLocation = async () => {
    try {
      const fusedLocation = await getItem('fusedLocation');
      if (fusedLocation) {
        const lat = parseFloat(fusedLocation.latitude);
        const lng = parseFloat(fusedLocation.longitude);
        
        if (!isNaN(lat) && !isNaN(lng)) {
          setDrawingReference({
            latitude: lat,
            longitude: lng,
          });
        }
      }
    } catch (error) {
      console.error('Error getting fused location:', error);
    }
  };

  const animateToLocation = (latitude, longitude) => {
    if (
      mapRef.current &&
      typeof latitude === 'number' &&
      typeof longitude === 'number' &&
      !isNaN(latitude) &&
      !isNaN(longitude)
    ) {
      setTimeout(() => {
        mapRef.current.animateToRegion(
          {
            latitude,
            longitude,
            latitudeDelta: 0.001,
            longitudeDelta: 0.001,
          },
          1000,
        );
      }, 100);
    }
  };

  const handleMapPressGetDistance = async (event) => {
    try {
      if (type === 'livehoood') {
        handleMapPress(event);
      } else {
        const { latitude, longitude } = event.nativeEvent.coordinate;
        const pressedPoint = { latitude, longitude };
        let reference = editing ? drawingReference || currentLocation : currentLocation;
        
        if (!reference) return;
        
        if (cleanedNewPolygon.length === 0) {
          const distance = getDistance({ latitude, longitude }, reference);
          if (distance <= distanceThreshold) {
            handleMapPress(event);
          } else if (editing) {
            Alert.alert('❌ Out of Range', `Plot location and current location not same!`);
          }
        } else {
          const dist = isWithin20Meters(pressedPoint, cleanedNewPolygon, 40);
          if (dist !== 0) {
            handleMapPress(event);
          }
        }
      }
    } catch (error) {
      console.log('Error in map press:', error);
    }
  };

  const fetchSearchSuggestions = async (query) => {
    if (!isConnected) {
      Alert.alert('Offline', 'Search requires internet connection.');
      return [];
    }
    try {
      const suggestiveRes = await getMapLocation(query);
      return suggestiveRes?.data?.features || [];
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      return [];
    }
  };

  const handleSelect = (item) => {
    if (!isConnected) {
      Alert.alert('Offline', 'Location search requires internet.');
      return;
    }
    if (item?.lat && item?.lng) {
      const lat = parseFloat(item.lat);
      const lng = parseFloat(item.lng);
      if (!isNaN(lat) && !isNaN(lng)) {
        setMarker({ lat, lng });
        animateToLocation(lat, lng);
      }
    }
  };

  const clearMapGetDistance = async () => {
    try {
      if (statuslevel === 'PENDING' || statuslevel === 'REJECTED') {
        if (type === 'livehoood') {
          clearNewPolygon();
        } else {
          if (cleanedLocation.length === 1) {
            clearNewPolygon();
          } else {
            const dist = isWithin20Meters(drawingReference, cleanedLocation, 20);
            if (dist.length !== 0) {
              clearNewPolygon();
            } else {
              Alert.alert('❌ Out of Range', 'Plot location and current location not same!');
            }
          }
        }
      }
    } catch (error) {
      console.log('Error:', error);
    }
  };

  const handleActionPress = useCallback((name) => {
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
      case 'downloadArea':
        Alert.alert(
          'Download Area',
          'This will download map tiles for offline use (approx 5-10MB). Continue?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Download', onPress: downloadTiles }
          ]
        );
        break;
      case 'toggleOffline':
        if (!isConnected) {
          setUseOfflineMode(true);
        } else {
          setUseOfflineMode(!useOfflineMode);
        }
        break;
      default:
        console.log('Unhandled action:', name);
    }
  }, [editing, isConnected, useOfflineMode, baselatLong]);

  const actions = useMemo(() => {
    const base = [
      {
        text: editing ? 'Stop Editing' : 'Start Editing',
        name: 'toggleEdit',
        position: 1,
        color: Colors.useGreen,
        icon: <Icon name="edit" size={24} color="white" />,
      },
      {
        text: useOfflineMode ? 'Switch to Online' : 'Switch to Offline',
        name: 'toggleOffline',
        position: 4,
        color: useOfflineMode ? '#2ECC71' : '#E67E22',
        icon: useOfflineMode ? 
          <Icon name="wifi" size={24} color="white" /> : 
          <Icon name="wifi-off" size={24} color="white" />,
      },
      {
        text: 'Download Area',
        name: 'downloadArea',
        position: 5,
        color: '#3498DB',
        icon: <Icon name="download" size={24} color="white" />,
      },
    ];

    if (editing) {
      base.push(
        {
          text: 'Finalize',
          name: 'finalizePolygon',
          position: 2,
          color: Colors.useGreen,
          icon: <Icon name="check-circle" size={24} color="white" />,
        },
        {
          text: 'Clear',
          name: 'clear',
          position: 3,
          color: Colors.useGreen,
          icon: <Icon name="delete" size={24} color="white" />,
        },
        {
          text: 'Undo',
          name: 'undoMark',
          position: 6,
          color: Colors.useGreen,
          icon: <Icon name="undo" size={24} color="white" />,
        }
      );
    }

    return base;
  }, [editing, useOfflineMode]);

  // Format tile path for LocalTile
  const offlineTilePathTemplate = useMemo(() => {
    if (!isDirReady || !useOfflineMode) return null;
    
    const template = Platform.OS === 'android' 
      ? `file://${TILE_DIR}/{z}/{x}/{y}.png` 
      : `${TILE_DIR}/{z}/{x}/{y}.png`;
    
    console.log('Tile path template:', template);
    return template;
  }, [isDirReady, useOfflineMode]);

  // Safe polygon renderer
  const renderPolygons = () => {
    return cleanedPolygons.map((polygon, index) => {
      // Check if polygon has enough valid coordinates
      if (!polygon || polygon.length < 3) {
        console.warn(`Polygon ${index} has insufficient coordinates: ${polygon?.length || 0}`);
        return null;
      }

      // Additional validation for each coordinate
      const isValidPolygon = polygon.every(coord => 
        coord && 
        typeof coord.latitude === 'number' && !isNaN(coord.latitude) &&
        typeof coord.longitude === 'number' && !isNaN(coord.longitude)
      );

      if (!isValidPolygon) {
        console.warn(`Polygon ${index} contains invalid coordinates`);
        return null;
      }

      return (
        <Polygon
          key={getPolygonKey(polygon, index)}
          coordinates={polygon}
          fillColor="rgba(167, 3, 3, 0.66)"
          strokeColor="rgb(240, 9, 9)"
          strokeWidth={2}
          tappable={false}
        />
      );
    }).filter(Boolean); // Remove null entries
  };

  return (
    <View style={styles.container}>
      {isLoading && (
        <View style={styles.loaderOverlay}>
          <LoadingScreen />
        </View>
      )}

      {downloading && (
        <View style={styles.downloadOverlay}>
          <LoadingScreen />
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              Downloading: {Math.round(downloadProgress)}% ({downloadedTiles}/{totalTiles} tiles)
            </Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${downloadProgress}%` }]} />
            </View>
            <Text style={styles.noteText}>Do not close the app</Text>
          </View>
        </View>
      )}

      {useOfflineMode && (
        <View style={styles.offlineBanner}>
          <Icon name="wifi-off" size={16} color="white" style={styles.offlineIcon} />
          <Text style={styles.offlineText}>OFFLINE MODE</Text>
        </View>
      )}

      {!isConnected && !useOfflineMode && (
        <View style={styles.disconnectedBanner}>
          <Icon name="wifi-off" size={16} color="white" style={styles.offlineIcon} />
          <Text style={styles.disconnectedText}>No Internet - Switch to Offline Mode</Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.searchIcon}
        onPress={() => setShowModal && setShowModal(false)}>
        <Icon name="close" size={24} color="#333" />
      </TouchableOpacity>

      <MapView
        ref={mapRef}
        style={styles.map}
        mapType={useOfflineMode ? MAP_TYPES.NONE : 'hybrid'}
        provider={useOfflineMode ? null : PROVIDER_GOOGLE}
        showsUserLocation={true}
        showsMyLocationButton={true}
        onPress={handleMapPressGetDistance}
        onRegionChangeComplete={handleRegionChangeComplete}
        initialRegion={currentLocation}
        loadingEnabled={true}
        loadingBackgroundColor="#f0f0f0"
        loadingIndicatorColor={Colors.useGreen}
        zoomEnabled={true}
        scrollEnabled={true}
        pitchEnabled={false}
        rotateEnabled={false}
      >
        {/* Offline tiles - only render when in offline mode and template is ready */}
        {useOfflineMode && offlineTilePathTemplate && isDirReady && (
          <LocalTile
            pathTemplate={offlineTilePathTemplate}
            tileSize={256}
            zIndex={-1}
            flipY={false}
          />
        )}

        {/* Render cleaned polygons */}
        {renderPolygons()}

        {/* Render location polygon if valid */}
        {cleanedLocation.length > 0 && (
          <Polygon
            coordinates={cleanedLocation}
            fillColor="rgba(139, 236, 11, 0.73)"
            strokeColor="rgb(1, 255, 1)"
            strokeWidth={2}
            tappable={false}
          />
        )}

        {/* Render new polygon if valid */}
        {cleanedNewPolygon.length > 0 && (
          <Polygon
            coordinates={cleanedNewPolygon}
            fillColor="rgba(0, 200, 200, 0.5)"
            strokeColor="rgb(0, 200, 200)"
            strokeWidth={2}
            tappable={false}
          />
        )}

        {/* Render markers for new polygon points */}
        {cleanedNewPolygon.map((coordinate, index) => (
          <Marker 
            key={`marker-new-${index}`} 
            coordinate={coordinate}
            tracksViewChanges={false}
          />
        ))}

        {/* Render search marker if valid */}
        {marker.lat !== 0 && marker.lng !== 0 && (
          <Marker 
            coordinate={{ latitude: marker.lat, longitude: marker.lng }}
            tracksViewChanges={false}
          />
        )}
      </MapView>

      {selectedArea !== 0 && (
        <View style={styles.areaContainer}>
          <Icon name="square-foot" size={16} color="#FFF" style={styles.areaIcon} />
          <Text style={styles.areaText}>
            Selected Area: {selectedArea.toFixed(2)}{' '}
            {landAreaUnit?.[0]?.defined_unit_value
              ? landAreaUnit?.[0]?.unit_name
              : 'm²'}
          </Text>
        </View>
      )}

      <View style={styles.searchContainer}>
        <SuggestiveSearchInput
          fetchSuggestions={fetchSearchSuggestions}
          onSelect={handleSelect}
          disabled={!isConnected || useOfflineMode}
          placeholder={!isConnected ? "Search unavailable offline" : "Search location"}
        />
      </View>

      <FloatingActionButton
        actions={actions}
        onPressItem={handleActionPress}
        color={Colors.useGreen}
        overlayColor="rgba(0,0,0,0.3)"
        distanceToEdge={{ vertical: 80, horizontal: 25 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  downloadOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1001,
  },
  progressContainer: {
    marginTop: 20,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  progressText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 10,
  },
  progressBar: {
    width: '80%',
    height: 10,
    backgroundColor: '#ECF0F1',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.useGreen,
  },
  noteText: {
    marginTop: 10,
    fontSize: 12,
    color: '#7F8C8D',
    fontStyle: 'italic',
  },
  offlineBanner: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    backgroundColor: '#E67E22',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 999,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    flexDirection: 'row',
    alignItems: 'center',
  },
  offlineIcon: {
    marginRight: 8,
  },
  offlineText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  disconnectedBanner: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    backgroundColor: '#E74C3C',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 999,
    flexDirection: 'row',
    alignItems: 'center',
  },
  disconnectedText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  searchIcon: {
    position: 'absolute',
    top: 12,
    left: 10,
    zIndex: 999,
    width: 38,
    height: 38,
    backgroundColor: '#e6dfdf',
    opacity: 0.7,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  areaContainer: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  areaIcon: {
    marginRight: 8,
  },
  areaText: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: '600',
  },
  searchContainer: {
    width: '70%',
    position: 'absolute',
    top: 10,
    alignSelf: 'center',
    zIndex: 999,
  },
});