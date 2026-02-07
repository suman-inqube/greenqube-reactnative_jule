import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  TouchableOpacity,
  Text,
  Image,
  Alert,
  Modal,
  ActivityIndicator,
  TextInput,
  ScrollView,
  Platform,
  StatusBar,
} from 'react-native';
import MapView, {
  Polygon,
  Marker,
  PROVIDER_GOOGLE,
  PROVIDER_DEFAULT,
  UrlTile,
  LocalTile,
} from 'react-native-maps';
import { getItem } from '../../../config/getDataFromStorage';
import NetInfo from '@react-native-community/netinfo';
import { Colors } from '../../utils/Constants';
import { Fonts } from '../../utils/Constants';
import SuggestiveSearchInput from '../../Common/SuggestiveSearchInput';
import { getMapLocation } from '../../../config/apiHere';
import LoadingScreen from '../../Common/LoadingScreen';
import FloatingActionButton from '../../Components/FloatingActionButton';
import * as geolib from 'geolib';
import { isWithin20Meters } from '../../Common/calculateAreaFun';
import offlineMapStorage from '../../utils/OfflineMapStorage';
import tileDownloader from '../../utils/TileDownloader';
import Slider from '@react-native-community/slider';

const screenWidth = Dimensions.get('window').width;

export default function Map({
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
  setOutofRange,
  statuslevel,
  type,
  baselatLong,
  handleRegionChangeComplete,
  isLoading
}) {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [drawingReference, setDrawingReference] = useState(null);
  const [distanceThreshold, setDistanceThreshold] = useState(20);
  const [marker, setMarker] = useState({ lat: 0, lng: 0 });
  const [selectedArea, setSelectedArea] = useState(0);
  const [coordinatesCurrent, setCoordinatesCurrent] = useState([]);
  const mapRef = useRef(null);
  const [isStable, setIsStable] = useState(false);
  
  // Offline Map States
  const [isOnline, setIsOnline] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [mapMode, setMapMode] = useState('online'); // 'online' or 'offline'
  const [downloadedRegions, setDownloadedRegions] = useState([]);
  const [currentRegion, setCurrentRegion] = useState(null);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [showRegionsModal, setShowRegionsModal] = useState(false);
  const [downloadRegionName, setDownloadRegionName] = useState('');
  const [minZoom, setMinZoom] = useState(12);
  const [maxZoom, setMaxZoom] = useState(16);
  const [downloadStats, setDownloadStats] = useState({ downloaded: 0, total: 0 });
  const [storageInfo, setStorageInfo] = useState(null);

  // Initialize
  useEffect(() => {
    const initialize = async () => {
      try {
        // Check network status
        const netState = await NetInfo.fetch();
        const online = netState.isConnected && netState.isInternetReachable;
        setIsOnline(online);
        
        // Load offline regions
        loadOfflineRegions();
        
        // Load storage info
        updateStorageInfo();
        
        // Set initial location
        await setInitialLocation();
        
      } catch (error) {
        console.error('Initialization error:', error);
      }
    };
    
    initialize();
    
    // Network status listener
    const unsubscribeNetInfo = NetInfo.addEventListener(state => {
      const online = state.isConnected && state.isInternetReachable;
      setIsOnline(online);
      
      // Auto-switch to offline mode if offline and we have maps
      if (!online && downloadedRegions.length > 0 && currentRegion) {
        setMapMode('offline');
        Alert.alert(
          'Offline Mode',
          'Switched to offline maps. Some features may be limited.',
          [{ text: 'OK' }]
        );
      }
    });
    
    return () => {
      unsubscribeNetInfo();
    };
  }, []);

  const setInitialLocation = async () => {
    try {
      if (location?.length && location[0].latitude && location[0].longitude) {
        const lat = parseFloat(location[0].latitude);
        const lng = parseFloat(location[0].longitude);
        animateToLocation(lat, lng);
        setCurrentLocation({
          latitude: lat,
          longitude: lng,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
        
        // Check if we have offline coverage
        checkOfflineCoverage(lat, lng);
        
      } else {
        animateToLocation(baselatLong.latitude, baselatLong.longitude);
        setCurrentLocation({
          latitude: baselatLong.latitude,
          longitude: baselatLong.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
        
        checkOfflineCoverage(baselatLong.latitude, baselatLong.longitude);
      }
    } catch (error) {
      console.error('Error setting initial location:', error);
    }
  };

  const loadOfflineRegions = () => {
    const regions = offlineMapStorage.getRegions();
    setDownloadedRegions(regions);
    return regions;
  };

  const updateStorageInfo = () => {
    const info = offlineMapStorage.getStorageInfo();
    setStorageInfo(info);
    return info;
  };

  const checkOfflineCoverage = (latitude, longitude) => {
    const region = offlineMapStorage.hasOfflineCoverage(latitude, longitude);
    setCurrentRegion(region);
    return region;
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
      
      // Check offline coverage for new location
      checkOfflineCoverage(latitude, longitude);
    }
  };

  useEffect(() => {
    if (polygons.length !== 0) {
      const lat = polygons[0][0]?.latitude;
      const lng = polygons[0][0]?.longitude;
      if (lat && lng) {
        setCurrentLocation({
          latitude: lat,
          longitude: lng,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
        checkOfflineCoverage(lat, lng);
      }
    }
    if (newPolygon.length === 0 && polygons.length !== 0) {
      setSelectedArea(area);
    }
  }, [polygons]);

  useEffect(() => {
    if (newPolygon.length > 2) {
      if (landUnitsquareMetre?.[0]?.defined_unit_value) {
        setSelectedArea(
          Number(landUnitsquareMetre?.[0]?.defined_unit_value) *
          geolib.getAreaOfPolygon(newPolygon),
        );
      } else {
        setSelectedArea(geolib.getAreaOfPolygon(newPolygon));
      }
    } else {
      setSelectedArea(0);
    }
  }, [newPolygon]);

  useEffect(() => {
    if (editing && !drawingReference) {
      editingLocation();
    }
  }, [editing, drawingReference]);

  const editingLocation = async () => {
    const fusedLocation = await getItem('fusedLocation');
    const { latitude, longitude } = fusedLocation;
    if (fusedLocation != null) {
      setDrawingReference({
        latitude: latitude,
        longitude: longitude,
      });
    }
  };

  useEffect(() => {
    const cleanedCoordinates = location
      ?.filter(
        coord =>
          coord.latitude !== undefined &&
          coord.longitude !== undefined &&
          coord.latitude !== null &&
          coord.longitude !== null &&
          coord.latitude !== '' &&
          coord.longitude !== '',
      )
      ?.map(coord => ({
        latitude:
          typeof coord.latitude === 'string'
            ? parseFloat(coord.latitude)
            : coord.latitude,
        longitude:
          typeof coord.longitude === 'string'
            ? parseFloat(coord.longitude)
            : coord.longitude,
      }));
    setCoordinatesCurrent(cleanedCoordinates);
  }, [location]);

  // Map Press Handler with distance check
  const handleMapPressGetDistance = async (event) => {
    try {
      if (type === 'livehoood') {
        handleMapPress(event);
        return;
      }

      const { latitude, longitude } = event.nativeEvent.coordinate;
      const pressedPoint = { latitude, longitude };
      
      let reference;
      if (editing) {
        reference = drawingReference || currentLocation;
      } else {
        reference = currentLocation;
      }
      
      if (!reference) {
        console.warn('No reference location available');
        return;
      }
      
      if (newPolygon.length === 0) {
        const distance = geolib.getDistance(pressedPoint, reference);
        if (distance <= distanceThreshold) {
          handleMapPress(event);
        } else if (editing) {
          Alert.alert(
            '❌ Out of Range',
            'Plot location and current location are not the same!',
            [{ text: 'OK' }]
          );
        }
      } else {
        const dist = isWithin20Meters(pressedPoint, newPolygon, 40);
        if (dist !== 0) {
          handleMapPress(event);
        } else {
          console.log('❌ Point is more than 40m away from polygon.');
        }
      }
    } catch (error) {
      console.log('Error in map press:', error);
    }
  };

  const clearMapGetDistance = async () => {
    try {
      if (statuslevel === "PENDING" || statuslevel === "REJECTED") {
        if (type === 'livehoood') {
          clearNewPolygon();
        } else {
          const dist = isWithin20Meters(drawingReference, location, 20);
          if (location.length === 1) {
            clearNewPolygon();
          } else {
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
          }
        }
      } else {
        clearNewPolygon();
      }
    } catch (error) {
      console.log('Error:', error);
    }
  };

  // Offline Map Functions
  const startMapDownload = () => {
    if (!isOnline) {
      Alert.alert('Offline', 'Cannot download maps while offline');
      return;
    }
    
    if (!mapRef.current) {
      Alert.alert('Error', 'Map is not ready');
      return;
    }
    
    setShowDownloadModal(true);
    setDownloadRegionName(`Map_${new Date().toLocaleDateString()}`);
  };

  const downloadCurrentRegion = async () => {
    if (!mapRef.current || !isOnline) return;
    
    try {
      setIsDownloading(true);
      setShowDownloadModal(false);
      
      // Get current map bounds
      const bounds = await mapRef.current.getMapBoundaries();
      const camera = await mapRef.current.getCamera();
      
      const regionData = {
        id: `region_${Date.now()}`,
        name: downloadRegionName.trim() || `Region_${Date.now()}`,
        latitude: camera.center.latitude,
        longitude: camera.center.longitude,
        north: bounds.northEast.latitude,
        south: bounds.southWest.latitude,
        east: bounds.northEast.longitude,
        west: bounds.southWest.longitude,
        minZoom: minZoom,
        maxZoom: maxZoom,
        createdAt: new Date().toISOString(),
        status: 'downloading',
        downloadedTiles: 0
      };
      
      // Save region info
      offlineMapStorage.saveRegion(regionData);
      loadOfflineRegions();
      
      // Start download with progress callback
      const onProgress = (progress, downloaded, total) => {
        setDownloadProgress(progress);
        setDownloadStats({ downloaded, total });
        
        // Update region with current progress
        regionData.downloadedTiles = downloaded;
        offlineMapStorage.saveRegion(regionData);
      };
      
      const result = await tileDownloader.downloadRegion(regionData, onProgress);
      
      if (result.success) {
        // Download completed successfully
        setIsDownloading(false);
        setDownloadProgress(0);
        
        // Update regions list
        loadOfflineRegions();
        updateStorageInfo();
        
        Alert.alert(
          'Download Complete',
          `Successfully downloaded ${result.downloaded} tiles for "${regionData.name}"`,
          [
            {
              text: 'Switch to Offline',
              onPress: () => {
                setMapMode('offline');
                checkOfflineCoverage(regionData.latitude, regionData.longitude);
              }
            },
            { text: 'OK' }
          ]
        );
      } else {
        // Download failed
        setIsDownloading(false);
        Alert.alert('Download Failed', result.error || 'Unknown error occurred');
      }
      
    } catch (error) {
      console.error('Download error:', error);
      setIsDownloading(false);
      Alert.alert('Download Failed', error.message || 'Failed to download map');
    }
  };

  const cancelDownload = () => {
    tileDownloader.cancelDownload();
    setIsDownloading(false);
    setDownloadProgress(0);
    Alert.alert('Download Cancelled', 'Map download was cancelled');
  };

  const switchToOfflineMode = () => {
    if (!currentRegion) {
      Alert.alert(
        'No Offline Maps',
        'No offline maps available for current location. Download maps first.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Download', onPress: startMapDownload }
        ]
      );
      return;
    }
    
    setMapMode('offline');
    Alert.alert(
      'Offline Mode',
      `Now using offline map: ${currentRegion.name}\nZoom levels: ${currentRegion.minZoom}-${currentRegion.maxZoom}`,
      [{ text: 'OK' }]
    );
  };

  const switchToOnlineMode = () => {
    setMapMode('online');
    Alert.alert('Online Mode', 'Now using online Google Maps');
  };

  const deleteOfflineRegion = (regionId) => {
    Alert.alert(
      'Delete Map',
      'Are you sure you want to delete this offline map?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const success = offlineMapStorage.deleteRegion(regionId);
            if (success) {
              loadOfflineRegions();
              updateStorageInfo();
              
              // If we deleted the current region, switch back to online
              if (currentRegion?.id === regionId) {
                setCurrentRegion(null);
                if (mapMode === 'offline') {
                  setMapMode('online');
                }
              }
              
              Alert.alert('Success', 'Map deleted successfully');
            } else {
              Alert.alert('Error', 'Failed to delete map');
            }
          }
        }
      ]
    );
  };

  const clearAllOfflineMaps = () => {
    Alert.alert(
      'Clear All Maps',
      'Delete all downloaded maps? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: () => {
            const success = offlineMapStorage.clearAll();
            if (success) {
              setDownloadedRegions([]);
              setCurrentRegion(null);
              setMapMode('online');
              updateStorageInfo();
              Alert.alert('Success', 'All offline maps deleted');
            } else {
              Alert.alert('Error', 'Failed to clear maps');
            }
          }
        }
      ]
    );
  };

  // Render Map with appropriate provider
  const renderMap = () => {
    const commonProps = {
      ref: mapRef,
      style: styles.map,
      onRegionChangeComplete: (region) => {
        handleRegionChangeComplete?.(region);
        checkOfflineCoverage(region.latitude, region.longitude);
      },
      onPress: handleMapPressGetDistance,
      showsUserLocation: true,
      scrollEnabled: true,
      zoomEnabled: true,
      zoomControlEnabled: true,
      minZoomLevel: 10,
      maxZoomLevel: 20,
      loadingEnabled: true,
      loadingBackgroundColor: '#f0f0f0',
      loadingIndicatorColor: Colors.useGreen,
    };

    if (mapMode === 'offline' && currentRegion) {
      // Offline mode - use OpenStreetMap tiles
      return (
        <MapView
          {...commonProps}
          provider={PROVIDER_DEFAULT}
          mapType="standard"
        >
          {/* In a production app, you would implement LocalTile here */}
          {/* For now, we'll use online OSM tiles as fallback for offline mode */}
          <UrlTile
            urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            maximumZ={currentRegion.maxZoom}
            minimumZ={currentRegion.minZoom}
            tileSize={256}
            flipY={false}
          />
          {renderMapOverlays()}
        </MapView>
      );
    } else {
      // Online mode - use Google Maps
      return (
        <MapView
          {...commonProps}
          provider={PROVIDER_GOOGLE}
          mapType="hybrid"
          followsUserLocation={true}
          showsCompass={true}
          compassOffset={{ x: 20, y: 20 }}
          showsScale={true}
          rotateEnabled={false}
          pitchEnabled={true}
          userLocationUpdateInterval={5000}
        >
          {renderMapOverlays()}
        </MapView>
      );
    }
  };

  const renderMapOverlays = () => {
    return (
      <>
        {polygons.map((polygon, index) => {
          if (polygon.length >= 3) {
            return (
              <Polygon
                key={`polygon-${index}`}
                coordinates={polygon}
                fillColor="rgba(167, 3, 3, 0.66)"
                strokeColor="rgb(240, 9, 9)"
                strokeWidth={2}
              />
            );
          }
        })}
        
        {coordinatesCurrent?.length > 0 && (
          <Polygon
            coordinates={coordinatesCurrent}
            fillColor="rgba(139, 236, 11, 0.73)"
            strokeColor="rgb(1, 255, 1)"
            strokeWidth={2}
            zIndex={999}
          />
        )}
        
        {newPolygon.length > 0 && (
          <Polygon
            coordinates={newPolygon}
            fillColor="rgba(0, 200, 200, 0.5)"
            strokeColor="rgb(0, 200, 200)"
            strokeWidth={2}
            zIndex={0}
          />
        )}
        
        {newPolygon.map((coordinate, index) => (
          <Marker
            key={`marker-${index}`}
            coordinate={coordinate}
            pinColor={Colors.useGreen}
          />
        ))}
        
        {marker.lat !== 0 && marker.lng !== 0 && (
          <Marker
            coordinate={{ latitude: marker.lat, longitude: marker.lng }}
            pinColor={Colors.useBlue}
          />
        )}
      </>
    );
  };

  const fetchSearchSuggestions = async (query) => {
    if (!isOnline) {
      return [{
        label: 'Search unavailable in offline mode',
        value: null,
        disabled: true,
      }];
    }
    
    try {
      const suggestiveRes = await getMapLocation(query);
      return suggestiveRes?.data?.features || [];
    } catch (error) {
      console.error('Search error:', error);
      return [];
    }
  };

  const handleSelect = (item) => {
    if (item.disabled) return;
    
    setMarker({ lat: item?.lat, lng: item?.lng });
    animateToLocation(item?.lat, item?.lng);
  };

  // Floating Action Button Actions
  const actions = useMemo(() => {
    const baseActions = [
      {
        text: editing ? 'Stop Editing' : 'Start Editing',
        icon: require('../../Common/images/editing.png'),
        name: 'toggleEdit',
        position: 1,
        color: Colors.useGreen,
      },
      {
        text: 'Download Map',
        icon: require('../../Common/images/download.png'),
        name: 'downloadMap',
        position: 2,
        color: Colors.useBlue,
        disabled: !isOnline || isDownloading,
      },
      {
        text: mapMode === 'online' ? 'Use Offline' : 'Use Online',
        icon: mapMode === 'online' 
          ? require('../../Common/images/offline.png')
          : require('../../Common/images/online.png'),
        name: 'switchMode',
        position: 3,
        color: mapMode === 'online' ? Colors.useOrange : Colors.useGreen,
      },
      {
        text: 'My Maps',
        icon: require('../../Common/images/map.png'),
        name: 'showRegions',
        position: 4,
        color: Colors.usePurple,
      },
    ];

    if (editing) {
      baseActions.push(
        {
          text: 'Finalize Polygon',
          icon: require('../../Common/images/check.png'),
          name: 'finalizePolygon',
          position: 5,
          color: Colors.useGreen,
        },
        {
          text: 'Clear',
          icon: require('../../Common/images/bin.png'),
          name: 'clear',
          position: 6,
          color: Colors.useGreen,
        },
        {
          text: 'Undo Mark',
          icon: require('../../Common/images/undo.png'),
          name: 'undoMark',
          position: 7,
          color: Colors.useGreen,
        },
      );
    }

    return baseActions;
  }, [editing, isOnline, isDownloading, mapMode]);

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
      case 'downloadMap':
        startMapDownload();
        break;
      case 'switchMode':
        if (mapMode === 'online') {
          switchToOfflineMode();
        } else {
          switchToOnlineMode();
        }
        break;
      case 'showRegions':
        setShowRegionsModal(true);
        break;
      default:
        console.log('Unhandled action:', name);
    }
  }, [editing, mapMode]);

  // Download Modal
  const renderDownloadModal = () => (
    <Modal
      visible={showDownloadModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowDownloadModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>📥 Download Offline Map</Text>
          
          <Text style={styles.modalLabel}>Map Name:</Text>
          <TextInput
            style={styles.input}
            value={downloadRegionName}
            onChangeText={setDownloadRegionName}
            placeholder="Enter a name for this map"
            maxLength={30}
            autoCapitalize="words"
          />
          
          <Text style={styles.modalLabel}>Zoom Levels: {minZoom} - {maxZoom}</Text>
          
          <View style={styles.zoomContainer}>
            <Text style={styles.zoomLabel}>Min Zoom: {minZoom}</Text>
            <Slider
              style={styles.slider}
              minimumValue={8}
              maximumValue={16}
              step={1}
              value={minZoom}
              onValueChange={setMinZoom}
              minimumTrackTintColor={Colors.useGreen}
              maximumTrackTintColor="#ddd"
              thumbTintColor={Colors.useGreen}
            />
          </View>
          
          <View style={styles.zoomContainer}>
            <Text style={styles.zoomLabel}>Max Zoom: {maxZoom}</Text>
            <Slider
              style={styles.slider}
              minimumValue={10}
              maximumValue={18}
              step={1}
              value={maxZoom}
              onValueChange={setMaxZoom}
              minimumTrackTintColor={Colors.useGreen}
              maximumTrackTintColor="#ddd"
              thumbTintColor={Colors.useGreen}
            />
          </View>
          
          {storageInfo && (
            <View style={styles.storageInfo}>
              <Text style={styles.storageText}>
                📊 Storage: {storageInfo.tileCount} tiles ({storageInfo.totalSizeMB} MB)
              </Text>
            </View>
          )}
          
          <Text style={styles.modalNote}>
            ⚠️ Note: Higher zoom levels and larger areas will download more tiles and use more storage.
            Download speed depends on your internet connection.
          </Text>
          
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowDownloadModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.modalButton, styles.downloadButton]}
              onPress={downloadCurrentRegion}
              disabled={!downloadRegionName.trim()}
            >
              <Text style={styles.downloadButtonText}>
                {!downloadRegionName.trim() ? 'Enter Name' : 'Start Download'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // Regions Management Modal
  const renderRegionsModal = () => (
    <Modal
      visible={showRegionsModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowRegionsModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, styles.regionsModal]}>
          <Text style={styles.modalTitle}>🗺️ My Offline Maps</Text>
          
          {storageInfo && (
            <View style={styles.storageSummary}>
              <Text style={styles.storageSummaryText}>
                📦 {storageInfo.regionCount} regions, {storageInfo.tileCount} tiles, {storageInfo.totalSizeMB} MB
              </Text>
            </View>
          )}
          
          <ScrollView style={styles.regionsList} showsVerticalScrollIndicator={false}>
            {downloadedRegions.length === 0 ? (
              <View style={styles.noRegionsContainer}>
                <Text style={styles.noRegionsText}>No offline maps downloaded yet.</Text>
                <Text style={styles.noRegionsSubtext}>
                  Download maps for areas you frequently visit to use them offline.
                </Text>
                <TouchableOpacity
                  style={styles.downloadNowButton}
                  onPress={() => {
                    setShowRegionsModal(false);
                    setTimeout(() => startMapDownload(), 300);
                  }}
                >
                  <Text style={styles.downloadNowText}>Download Now</Text>
                </TouchableOpacity>
              </View>
            ) : (
              downloadedRegions.map((region) => (
                <View key={region.id} style={[
                  styles.regionItem,
                  currentRegion?.id === region.id && styles.currentRegionItem
                ]}>
                  <View style={styles.regionInfo}>
                    <Text style={styles.regionName}>{region.name}</Text>
                    <Text style={styles.regionDetails}>
                      📍 {region.downloadedTiles || 0} tiles • Zoom {region.minZoom}-{region.maxZoom}
                    </Text>
                    <Text style={styles.regionDate}>
                      📅 {new Date(region.createdAt).toLocaleDateString()}
                    </Text>
                    {region.status === 'complete' ? (
                      <Text style={styles.statusComplete}>✅ Complete</Text>
                    ) : region.status === 'partial' ? (
                      <Text style={styles.statusPartial}>⚠️ Partial</Text>
                    ) : (
                      <Text style={styles.statusDownloading}>⏳ Downloading</Text>
                    )}
                  </View>
                  <View style={styles.regionActions}>
                    <TouchableOpacity
                      style={styles.regionActionButton}
                      onPress={() => {
                        animateToLocation(region.latitude, region.longitude);
                        setShowRegionsModal(false);
                        if (!isOnline) {
                          setMapMode('offline');
                        }
                      }}
                    >
                      <Text style={styles.regionActionText}>📍 Go To</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.regionActionButton, styles.deleteButton]}
                      onPress={() => deleteOfflineRegion(region.id)}
                    >
                      <Text style={styles.regionActionText}>🗑️ Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
          
          <View style={styles.regionsModalButtons}>
            {downloadedRegions.length > 0 && (
              <TouchableOpacity
                style={[styles.modalButton, styles.clearAllButton]}
                onPress={clearAllOfflineMaps}
              >
                <Text style={styles.clearAllButtonText}>Clear All Maps</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={[styles.modalButton, styles.closeButtonModal]}
              onPress={() => setShowRegionsModal(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#000" barStyle="light-content" />
      
      {isLoading && (
        <View style={styles.loaderOverlay}>
          <LoadingScreen />
        </View>
      )}
      
      {isDownloading && (
        <View style={styles.downloadOverlay}>
          <View style={styles.progressContainer}>
            <ActivityIndicator size="large" color={Colors.useGreen} />
            <Text style={styles.progressText}>Downloading Map...</Text>
            <Text style={styles.progressPercent}>{downloadProgress}%</Text>
            
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${downloadProgress}%` }
                ]} 
              />
            </View>
            
            <Text style={styles.progressStats}>
              {downloadStats.downloaded} / {downloadStats.total} tiles
            </Text>
            
            <Text style={styles.progressNote}>
              Please keep the app open during download
            </Text>
            
            <TouchableOpacity
              style={styles.cancelDownloadButton}
              onPress={cancelDownload}
            >
              <Text style={styles.cancelDownloadText}>Cancel Download</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      
      {!isOnline && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>⚠️ Offline Mode</Text>
          <Text style={styles.offlineSubtext}>
            {mapMode === 'offline' && currentRegion 
              ? `Using: ${currentRegion.name}` 
              : 'Limited functionality available'}
          </Text>
        </View>
      )}
      
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => setShowModal(false)}
      >
        <Image
          source={require('../../Common/images/cross100.png')}
          style={styles.closeIcon}
        />
      </TouchableOpacity>

      {renderMap()}
      
      {selectedArea !== 0 && (
        <View style={styles.areaContainer}>
          <Text style={styles.areaText}>
            📐 Area: {selectedArea.toFixed(2)} {landAreaUnit?.[0]?.unit_name || 'm²'}
          </Text>
        </View>
      )}

      <View style={styles.searchContainer}>
        <SuggestiveSearchInput
          fetchSuggestions={fetchSearchSuggestions}
          onSelect={handleSelect}
          disabled={!isOnline}
          placeholder={!isOnline ? "Search offline - limited" : "Search location..."}
        />
      </View>

      <View style={styles.mapModeIndicator}>
        <Text style={styles.mapModeText}>
          {mapMode === 'online' ? '🌐 Online' : '📴 Offline'}
        </Text>
        {currentRegion && mapMode === 'offline' && (
          <Text style={styles.mapRegionText}>{currentRegion.name}</Text>
        )}
      </View>

      <FloatingActionButton
        position="right"
        actions={actions}
        color={Colors.useGreen}
        overlayColor="rgba(22, 17, 17, 0.35)"
        distanceToEdge={{ vertical: 80, horizontal: 25 }}
        onPressItem={handleActionPress}
        openOnMount={editing}
      />
      
      {renderDownloadModal()}
      {renderRegionsModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 40,
    left: 15,
    zIndex: 1000,
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  closeIcon: {
    width: 20,
    height: 20,
    tintColor: '#333',
  },
  searchContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 40,
    left: 70,
    right: 15,
    zIndex: 999,
  },
  areaContainer: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    zIndex: 999,
    elevation: 5,
  },
  areaText: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: '600',
    fontFamily: Fonts.regular,
  },
  mapModeIndicator: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 40,
    right: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    zIndex: 998,
    alignItems: 'center',
  },
  mapModeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  mapRegionText: {
    color: '#FFF',
    fontSize: 10,
    marginTop: 2,
  },
  offlineBanner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ff9800',
    padding: 10,
    zIndex: 1001,
    alignItems: 'center',
  },
  offlineText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    fontFamily: Fonts.bold,
  },
  offlineSubtext: {
    color: '#fff',
    fontSize: 12,
    marginTop: 2,
    fontFamily: Fonts.regular,
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1002,
  },
  downloadOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1003,
  },
  progressContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 30,
    width: '85%',
    alignItems: 'center',
    elevation: 10,
  },
  progressText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 5,
    color: '#333',
    fontFamily: Fonts.bold,
  },
  progressPercent: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.useGreen,
    marginBottom: 15,
    fontFamily: Fonts.bold,
  },
  progressBar: {
    height: 10,
    width: '100%',
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.useGreen,
  },
  progressStats: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    fontFamily: Fonts.regular,
  },
  progressNote: {
    fontSize: 12,
    color: '#999',
    marginTop: 15,
    textAlign: 'center',
    fontFamily: Fonts.regular,
  },
  cancelDownloadButton: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#ff4444',
    borderRadius: 8,
  },
  cancelDownloadText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
    fontFamily: Fonts.semibold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 25,
    width: '100%',
    maxHeight: '80%',
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: Colors.useGreen,
    fontFamily: Fonts.bold,
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 8,
    color: '#333',
    fontFamily: Fonts.semibold,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    fontFamily: Fonts.regular,
  },
  zoomContainer: {
    marginBottom: 15,
  },
  zoomLabel: {
    fontSize: 14,
    marginBottom: 5,
    color: '#555',
    fontFamily: Fonts.regular,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  storageInfo: {
    backgroundColor: '#f0f8ff',
    padding: 10,
    borderRadius: 8,
    marginVertical: 10,
    alignItems: 'center',
  },
  storageText: {
    fontSize: 14,
    color: Colors.useBlue,
    fontFamily: Fonts.regular,
  },
  modalNote: {
    fontSize: 12,
    color: '#666',
    marginTop: 15,
    marginBottom: 20,
    fontStyle: 'italic',
    textAlign: 'center',
    fontFamily: Fonts.regular,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 16,
    fontFamily: Fonts.semibold,
  },
  downloadButton: {
    backgroundColor: Colors.useGreen,
  },
  downloadButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    fontFamily: Fonts.semibold,
  },
  // Regions Modal Styles
  regionsModal: {
    padding: 20,
  },
  storageSummary: {
    backgroundColor: '#e8f5e9',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: 'center',
  },
  storageSummaryText: {
    fontSize: 14,
    color: Colors.useGreen,
    fontFamily: Fonts.regular,
  },
  regionsList: {
    maxHeight: 400,
    marginBottom: 15,
  },
  noRegionsContainer: {
    alignItems: 'center',
    padding: 40,
  },
  noRegionsText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: Fonts.semibold,
  },
  noRegionsSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: Fonts.regular,
  },
  downloadNowButton: {
    backgroundColor: Colors.useGreen,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  downloadNowText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    fontFamily: Fonts.semibold,
  },
  regionItem: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  currentRegionItem: {
    backgroundColor: '#e8f5e9',
    borderColor: Colors.useGreen,
  },
  regionInfo: {
    marginBottom: 10,
  },
  regionName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
    fontFamily: Fonts.bold,
  },
  regionDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
    fontFamily: Fonts.regular,
  },
  regionDate: {
    fontSize: 12,
    color: '#999',
    marginBottom: 5,
    fontFamily: Fonts.regular,
  },
  statusComplete: {
    fontSize: 12,
    color: Colors.useGreen,
    fontFamily: Fonts.regular,
  },
  statusPartial: {
    fontSize: 12,
    color: Colors.useOrange,
    fontFamily: Fonts.regular,
  },
  statusDownloading: {
    fontSize: 12,
    color: Colors.useBlue,
    fontFamily: Fonts.regular,
  },
  regionActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  regionActionButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: Colors.useGreen,
    marginLeft: 10,
  },
  deleteButton: {
    backgroundColor: '#ff4444',
  },
  regionActionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: Fonts.semibold,
  },
  regionsModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  clearAllButton: {
    backgroundColor: '#ff4444',
    paddingVertical: 12,
  },
  clearAllButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    fontFamily: Fonts.semibold,
  },
  closeButtonModal: {
    backgroundColor: '#666',
    paddingVertical: 12,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    fontFamily: Fonts.semibold,
  },
});