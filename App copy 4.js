import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  ScrollView,
  Switch,
} from 'react-native';

import MapView, {
  PROVIDER_GOOGLE,
  MAP_TYPES,
  LocalTile,
  Marker,
  Polygon,
} from 'react-native-maps';

import NetInfo from '@react-native-community/netinfo';
import Geolocation from '@react-native-community/geolocation';
import RNFS from 'react-native-fs';
import Icon from 'react-native-vector-icons/MaterialIcons';

/* ================= CONFIG ================= */
const TILE_DIR = `${RNFS.DocumentDirectoryPath}/offline_tiles`;
const SATELLITE_DIR = `${RNFS.DocumentDirectoryPath}/satellite_tiles`;

// Tile Providers
const TILE_PROVIDERS = {
  standard: {
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    type: 'standard',
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    type: 'satellite',
    maxZoom: 17,
    attribution: '© Esri, Maxar, Earthstar Geographics'
  },
  hybrid: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    type: 'hybrid',
    maxZoom: 17,
    attribution: '© Esri, Maxar, Earthstar Geographics'
  }
};

const USER_AGENT = 'MyOfflineApp/1.0 (contact@example.com)';

/* ================= MATH HELPERS ================= */
const getTileXYZ = (lat, lon, zoom) => {
  const x = Math.floor(((lon + 180) / 360) * Math.pow(2, zoom));
  const y = Math.floor(
    ((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2) *
      Math.pow(2, zoom)
  );
  return { x, y, z: zoom };
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/* ================= COMPONENT ================= */
export default function OfflineMapScreen() {
  const mapRef = useRef(null);
  const [offline, setOffline] = useState(false);
  const [tilesAvailable, setTilesAvailable] = useState(false);
  const [satelliteTilesAvailable, setSatelliteTilesAvailable] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [totalTiles, setTotalTiles] = useState(0);
  
  // Map type state
  const [mapType, setMapType] = useState('hybrid'); // 'standard', 'satellite', 'hybrid'
  const [isSatelliteMode, setIsSatelliteMode] = useState(true);
  
  // State for markers
  const [markers, setMarkers] = useState([]);
  const [editingMarker, setEditingMarker] = useState(null);
  
  // State for polygons
  const [polygons, setPolygons] = useState([]);
  const [currentPolygon, setCurrentPolygon] = useState([]);
  const [isDrawingPolygon, setIsDrawingPolygon] = useState(false);
  const [editingPolygon, setEditingPolygon] = useState(null);
  
  // Modal states
  const [showMarkerModal, setShowMarkerModal] = useState(false);
  const [markerTitle, setMarkerTitle] = useState('');
  const [markerDescription, setMarkerDescription] = useState('');
  const [selectedMarker, setSelectedMarker] = useState(null);
  
  // Polygon modal states
  const [showPolygonModal, setShowPolygonModal] = useState(false);
  const [polygonTitle, setPolygonTitle] = useState('');
  const [polygonColor, setPolygonColor] = useState('#FF0000');
  const [polygonFillColor, setPolygonFillColor] = useState('#FF000022');
  
  // Download modal states
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadZoomLevels, setDownloadZoomLevels] = useState({ min: 12, max: 14 });
  const [downloadMapType, setDownloadMapType] = useState('satellite'); // 'standard', 'satellite'
  
  const [region, setRegion] = useState({
    latitude: 22.5726,
    longitude: 88.3639,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  useEffect(() => {
    const init = async () => {
      // Create directories if they don't exist
      if (!(await RNFS.exists(TILE_DIR))) {
        await RNFS.mkdir(TILE_DIR);
      }
      if (!(await RNFS.exists(SATELLITE_DIR))) {
        await RNFS.mkdir(SATELLITE_DIR);
      }
      checkTiles();
    };
    init();

    const unsubscribe = NetInfo.addEventListener(state => {
      setOffline(!state.isConnected);
    });

    Geolocation.getCurrentPosition(
      pos => {
        const { latitude, longitude } = pos.coords;
        setUserLocation({ latitude, longitude });
        setRegion(prev => ({ ...prev, latitude, longitude }));
      },
      err => console.warn(err),
      { enableHighAccuracy: true }
    );

    return () => unsubscribe();
  }, []);

  const checkTiles = async () => {
    try {
      const standardFolders = await RNFS.readDir(TILE_DIR);
      const satelliteFolders = await RNFS.readDir(SATELLITE_DIR);
      setTilesAvailable(standardFolders.length > 0);
      setSatelliteTilesAvailable(satelliteFolders.length > 0);
    } catch {
      setTilesAvailable(false);
      setSatelliteTilesAvailable(false);
    }
  };

  // Calculate total tiles for download
  const calculateTiles = (bbox, minZoom, maxZoom) => {
    let total = 0;
    for (let z = minZoom; z <= maxZoom; z++) {
      const topLeft = getTileXYZ(bbox.maxLat, bbox.minLon, z);
      const bottomRight = getTileXYZ(bbox.minLat, bbox.maxLon, z);
      
      const xTiles = bottomRight.x - topLeft.x + 1;
      const yTiles = bottomRight.y - topLeft.y + 1;
      
      total += xTiles * yTiles;
    }
    return total;
  };

  // Handle map tap for adding markers
  const handleMapPress = (event) => {
    const { coordinate } = event.nativeEvent;
    
    if (isDrawingPolygon) {
      // Add point to current polygon
      setCurrentPolygon(prev => [...prev, coordinate]);
      console.log(`Polygon point ${currentPolygon.length + 1}:`, coordinate);
      return;
    }
    
    console.log('Tapped coordinates:', coordinate);
    
    setSelectedMarker(coordinate);
    setShowMarkerModal(true);
  };

  // Download satellite tiles
  const downloadSatelliteTiles = async () => {
    if (offline) {
      Alert.alert("Error", "Connect to internet to download satellite imagery.");
      return;
    }
    
    setIsDownloading(true);
    setProgress(0);
    
    const bbox = {
      maxLat: region.latitude + region.latitudeDelta / 2,
      minLat: region.latitude - region.latitudeDelta / 2,
      minLon: region.longitude - region.longitudeDelta / 2,
      maxLon: region.longitude + region.longitudeDelta / 2,
    };
    
    const { min, max } = downloadZoomLevels;
    const total = calculateTiles(bbox, min, max);
    setTotalTiles(total);
    
    let downloadCount = 0;
    let errorCount = 0;
    const maxErrors = 10; // Stop after too many errors
    
    try {
      for (let z = min; z <= max; z++) {
        const topLeft = getTileXYZ(bbox.maxLat, bbox.minLon, z);
        const bottomRight = getTileXYZ(bbox.minLat, bbox.maxLon, z);
        
        for (let x = topLeft.x; x <= bottomRight.x; x++) {
          for (let y = topLeft.y; y <= bottomRight.y; y++) {
            const folder = `${SATELLITE_DIR}/${z}/${x}`;
            const file = `${folder}/${y}.jpg`;
            const provider = TILE_PROVIDERS[downloadMapType];
            
            // ESRI tile URL format is /{z}/{y}/{x}
            let url = provider.url;
            if (downloadMapType === 'satellite' || downloadMapType === 'hybrid') {
              url = url.replace('{z}', z).replace('{y}', y).replace('{x}', x);
            } else {
              url = url.replace('{z}', z).replace('{x}', x).replace('{y}', y);
            }
            
            await RNFS.mkdir(folder);
            
            if (!(await RNFS.exists(file))) {
              try {
                const result = await RNFS.downloadFile({
                  fromUrl: url,
                  toFile: file,
                  headers: { 
                    'User-Agent': USER_AGENT,
                    'Referer': 'https://www.arcgis.com'
                  },
                  background: true,
                  discretionary: true,
                  cacheable: true,
                }).promise;
                
                if (result.statusCode === 200) {
                  // Success
                } else if (result.statusCode === 403 || result.statusCode === 429) {
                  console.warn(`Rate limited at tile ${z}/${x}/${y}`);
                  await sleep(1000); // Longer delay if rate limited
                  errorCount++;
                  
                  if (errorCount >= maxErrors) {
                    throw new Error("Too many errors. Server might be blocking requests.");
                  }
                } else {
                  console.warn(`Failed to download tile ${z}/${x}/${y}: ${result.statusCode}`);
                  errorCount++;
                }
              } catch (error) {
                console.error(`Error downloading tile: ${error.message}`);
                errorCount++;
                
                if (errorCount >= maxErrors) {
                  throw new Error("Multiple download failures. Check connection.");
                }
              }
              
              // Respectful delay between requests
              await sleep(300); // 300ms delay for satellite servers
            }
            
            downloadCount++;
            setProgress(downloadCount);
            
            // Update progress every 10 tiles
            if (downloadCount % 10 === 0) {
              console.log(`Progress: ${downloadCount}/${total} tiles`);
            }
          }
        }
      }
      
      setSatelliteTilesAvailable(true);
      Alert.alert(
        "Download Complete",
        `Successfully downloaded ${downloadCount} satellite tiles.\n\n` +
        `Map Type: ${downloadMapType}\n` +
        `Zoom Levels: ${min}-${max}\n` +
        `Errors: ${errorCount}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert(
        "Download Error",
        error.message + "\n\nTry with:\n" +
        "1. Smaller area\n" +
        "2. Lower zoom levels\n" +
        "3. Different time of day",
        [{ text: 'OK' }]
      );
    } finally {
      setIsDownloading(false);
      setShowDownloadModal(false);
    }
  };

  // Start download with confirmation
  const startDownload = async () => {
    if (offline) {
      Alert.alert("Error", "Connect to internet to download.");
      return;
    }
    
    // Calculate estimated size
    const bbox = {
      maxLat: region.latitude + region.latitudeDelta / 2,
      minLat: region.latitude - region.latitudeDelta / 2,
      minLon: region.longitude - region.longitudeDelta / 2,
      maxLon: region.longitude + region.longitudeDelta / 2,
    };
    
    const total = calculateTiles(bbox, downloadZoomLevels.min, downloadZoomLevels.max);
    const estimatedSizeMB = (total * 50) / 1024; // Approx 50KB per tile
    
    Alert.alert(
      "Download Satellite Imagery",
      `Area: ${region.latitudeDelta.toFixed(4)}×${region.longitudeDelta.toFixed(4)} deg\n` +
      `Zoom Levels: ${downloadZoomLevels.min}-${downloadZoomLevels.max}\n` +
      `Estimated Tiles: ${total}\n` +
      `Estimated Size: ${estimatedSizeMB.toFixed(1)} MB\n\n` +
      `This may take several minutes. Continue?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Download', 
          style: 'destructive',
          onPress: downloadSatelliteTiles
        },
        {
          text: 'Settings',
          onPress: () => setShowDownloadModal(true)
        }
      ]
    );
  };

  // Toggle map type
  const toggleMapType = () => {
    if (isSatelliteMode) {
      // Switch to standard
      setIsSatelliteMode(false);
      setMapType('standard');
    } else {
      // Switch to satellite/hybrid
      setIsSatelliteMode(true);
      setMapType('hybrid');
    }
  };

  // Get current tile path based on mode
  const getTilePath = () => {
    if (offline) {
      if (isSatelliteMode && satelliteTilesAvailable) {
        return `${SATELLITE_DIR}/{z}/{x}/{y}.jpg`;
      } else if (tilesAvailable) {
        return `${TILE_DIR}/{z}/{x}/{y}.png`;
      }
    }
    return null;
  };

  // Handle marker functions (same as before)
  const handleMarkerPress = (marker) => {
    Alert.alert(
      marker.title || 'Marker',
      marker.description || `Lat: ${marker.latitude.toFixed(6)}, Lng: ${marker.longitude.toFixed(6)}`,
      [
        { text: 'Close', style: 'cancel' },
        { text: 'Edit', onPress: () => editMarker(marker) },
        { text: 'Delete', style: 'destructive', onPress: () => deleteMarker(marker.id) }
      ]
    );
  };

  const addMarker = () => {
    if (!selectedMarker) return;
    
    const newMarker = {
      id: Date.now().toString(),
      ...selectedMarker,
      title: markerTitle || `Marker ${markers.length + 1}`,
      description: markerDescription,
      color: '#2196F3',
    };
    
    setMarkers(prev => [...prev, newMarker]);
    setShowMarkerModal(false);
    setMarkerTitle('');
    setMarkerDescription('');
    setSelectedMarker(null);
    
    Alert.alert('Success', 'Marker added successfully!');
  };

  const editMarker = (marker) => {
    setEditingMarker(marker);
    setMarkerTitle(marker.title);
    setMarkerDescription(marker.description || '');
    setShowMarkerModal(true);
  };

  const updateMarker = () => {
    setMarkers(prev => prev.map(m => 
      m.id === editingMarker.id 
        ? { ...m, title: markerTitle, description: markerDescription }
        : m
    ));
    
    setShowMarkerModal(false);
    setMarkerTitle('');
    setMarkerDescription('');
    setEditingMarker(null);
    
    Alert.alert('Success', 'Marker updated successfully!');
  };

  const deleteMarker = (id) => {
    setMarkers(prev => prev.filter(marker => marker.id !== id));
    Alert.alert('Success', 'Marker deleted!');
  };

  // Polygon functions (same as before)
  const startDrawingPolygon = () => {
    setIsDrawingPolygon(true);
    setCurrentPolygon([]);
    Alert.alert('Drawing Mode', 'Tap on map to add polygon points. Long press to finish.');
  };

  const finishDrawingPolygon = () => {
    if (currentPolygon.length < 3) {
      Alert.alert('Error', 'Polygon needs at least 3 points');
      return;
    }
    
    setIsDrawingPolygon(false);
    setShowPolygonModal(true);
  };

  const savePolygon = () => {
    const newPolygon = {
      id: Date.now().toString(),
      coordinates: [...currentPolygon, currentPolygon[0]],
      title: polygonTitle || `Polygon ${polygons.length + 1}`,
      strokeColor: polygonColor,
      fillColor: polygonFillColor,
      strokeWidth: 3,
    };
    
    setPolygons(prev => [...prev, newPolygon]);
    setShowPolygonModal(false);
    setCurrentPolygon([]);
    setPolygonTitle('');
    setPolygonColor('#FF0000');
    setPolygonFillColor('#FF000022');
    
    Alert.alert('Success', 'Polygon added successfully!');
  };

  const cancelDrawing = () => {
    setIsDrawingPolygon(false);
    setCurrentPolygon([]);
    setEditingPolygon(null);
    Alert.alert('Drawing cancelled', 'Polygon drawing has been cancelled.');
  };

  const clearAll = () => {
    Alert.alert(
      'Clear All',
      'Are you sure you want to clear all markers and polygons?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => {
            setMarkers([]);
            setPolygons([]);
            setCurrentPolygon([]);
            setIsDrawingPolygon(false);
            Alert.alert('Cleared', 'All markers and polygons have been cleared.');
          }
        }
      ]
    );
  };

  const handleMapLongPress = () => {
    if (isDrawingPolygon && currentPolygon.length >= 3) {
      finishDrawingPolygon();
    }
  };

  // Clean up old tiles
  const cleanUpTiles = async () => {
    try {
      await RNFS.unlink(TILE_DIR);
      await RNFS.unlink(SATELLITE_DIR);
      await RNFS.mkdir(TILE_DIR);
      await RNFS.mkdir(SATELLITE_DIR);
      setTilesAvailable(false);
      setSatelliteTilesAvailable(false);
      Alert.alert('Success', 'All offline tiles have been cleared.');
    } catch (error) {
      Alert.alert('Error', 'Failed to clear tiles: ' + error.message);
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        provider={offline ? undefined : PROVIDER_GOOGLE}
        region={region}
        mapType={mapType}
        onRegionChangeComplete={setRegion}
        onPress={handleMapPress}
        onLongPress={handleMapLongPress}
      >
        {/* Offline Tiles */}
        {offline && getTilePath() && (
          <LocalTile
            pathTemplate={getTilePath()}
            tileSize={256}
            zIndex={10}
          />
        )}
        
        {/* User Location */}
        {userLocation && (
          <Marker 
            coordinate={userLocation} 
            title="Your Location"
            pinColor="blue"
          />
        )}
        
        {/* Markers */}
        {markers.map(marker => (
          <Marker
            key={marker.id}
            coordinate={marker}
            title={marker.title}
            description={marker.description}
            pinColor={marker.color || '#2196F3'}
            onPress={() => handleMarkerPress(marker)}
          />
        ))}
        
        {/* Polygons */}
        {polygons.map(polygon => (
          <Polygon
            key={polygon.id}
            coordinates={polygon.coordinates}
            strokeColor={polygon.strokeColor}
            fillColor={polygon.fillColor}
            strokeWidth={polygon.strokeWidth}
          />
        ))}
        
        {/* Current Drawing Polygon */}
        {currentPolygon.length > 0 && (
          <Polygon
            coordinates={currentPolygon}
            strokeColor={isDrawingPolygon ? '#FF0000' : '#00FF00'}
            fillColor={isDrawingPolygon ? '#FF000022' : '#00FF0022'}
            strokeWidth={2}
          />
        )}
      </MapView>

      {/* Control Panel */}
      <View style={styles.controlPanel}>
        {/* Status */}
        <View style={[styles.status, { backgroundColor: offline ? '#d35400' : '#27ae60' }]}>
          <Text style={styles.statusText}>{offline ? "OFFLINE" : "ONLINE"}</Text>
        </View>

        {/* Map Type Toggle */}
        <TouchableOpacity 
          style={[styles.controlButton, { backgroundColor: isSatelliteMode ? '#4CAF50' : '#2196F3' }]} 
          onPress={toggleMapType}
        >
          <Icon name={isSatelliteMode ? "satellite" : "map"} size={24} color="#fff" />
        </TouchableOpacity>

        {/* Download Button */}
        {!offline && (
          <TouchableOpacity style={styles.controlButton} onPress={() => setShowDownloadModal(true)}>
            <Icon name="file-download" size={24} color="#fff" />
          </TouchableOpacity>
        )}

        {/* Polygon Drawing */}
        <TouchableOpacity 
          style={[styles.controlButton, { backgroundColor: isDrawingPolygon ? '#FF5722' : '#FF9800' }]} 
          onPress={isDrawingPolygon ? cancelDrawing : startDrawingPolygon}
        >
          <Icon name={isDrawingPolygon ? "close" : "gesture"} size={24} color="#fff" />
        </TouchableOpacity>
        
        {isDrawingPolygon && currentPolygon.length >= 3 && (
          <TouchableOpacity 
            style={[styles.controlButton, { backgroundColor: '#2196F3' }]} 
            onPress={finishDrawingPolygon}
          >
            <Icon name="check" size={24} color="#fff" />
          </TouchableOpacity>
        )}

        {/* Clear All */}
        <TouchableOpacity 
          style={[styles.controlButton, { backgroundColor: '#F44336' }]} 
          onPress={clearAll}
        >
          <Icon name="delete-sweep" size={24} color="#fff" />
        </TouchableOpacity>

        {/* Info */}
        <TouchableOpacity 
          style={[styles.controlButton, { backgroundColor: '#607D8B' }]} 
          onPress={() => {
            Alert.alert(
              'Map Info',
              `Status: ${offline ? 'Offline' : 'Online'}\n` +
              `Mode: ${isSatelliteMode ? 'Satellite' : 'Standard'}\n` +
              `Markers: ${markers.length}\n` +
              `Polygons: ${polygons.length}\n` +
              `Offline Tiles: ${tilesAvailable ? 'Available' : 'Not Available'}\n` +
              `Satellite Tiles: ${satelliteTilesAvailable ? 'Available' : 'Not Available'}`
            );
          }}
        >
          <Icon name="info" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Info Panel */}
      <View style={styles.infoPanel}>
        <Text style={styles.infoText}>
          {isDrawingPolygon 
            ? `Drawing Polygon - Points: ${currentPolygon.length}`
            : `Mode: ${isSatelliteMode ? 'Satellite' : 'Map'} | Markers: ${markers.length} | Polygons: ${polygons.length}`}
        </Text>
      </View>

      {/* Download Modal */}
      <Modal
        visible={showDownloadModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Download Offline Map</Text>
            
            <Text style={styles.sectionTitle}>Map Type</Text>
            <View style={styles.mapTypeSelector}>
              <TouchableOpacity
                style={[
                  styles.mapTypeOption,
                  downloadMapType === 'satellite' && styles.mapTypeSelected
                ]}
                onPress={() => setDownloadMapType('satellite')}
              >
                <Icon name="satellite" size={30} color={downloadMapType === 'satellite' ? '#fff' : '#333'} />
                <Text style={[
                  styles.mapTypeText,
                  downloadMapType === 'satellite' && styles.mapTypeTextSelected
                ]}>Satellite</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.mapTypeOption,
                  downloadMapType === 'standard' && styles.mapTypeSelected
                ]}
                onPress={() => setDownloadMapType('standard')}
              >
                <Icon name="map" size={30} color={downloadMapType === 'standard' ? '#fff' : '#333'} />
                <Text style={[
                  styles.mapTypeText,
                  downloadMapType === 'standard' && styles.mapTypeTextSelected
                ]}>Standard</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.sectionTitle}>Zoom Levels</Text>
            <View style={styles.zoomControls}>
              <View style={styles.zoomControl}>
                <Text>Min Zoom: {downloadZoomLevels.min}</Text>
                <View style={styles.sliderContainer}>
                  <Text>10</Text>
                  <Slider
                    style={styles.slider}
                    minimumValue={10}
                    maximumValue={16}
                    step={1}
                    value={downloadZoomLevels.min}
                    onValueChange={(value) => setDownloadZoomLevels(prev => ({ ...prev, min: Math.round(value) }))}
                  />
                  <Text>16</Text>
                </View>
              </View>
              
              <View style={styles.zoomControl}>
                <Text>Max Zoom: {downloadZoomLevels.max}</Text>
                <View style={styles.sliderContainer}>
                  <Text>12</Text>
                  <Slider
                    style={styles.slider}
                    minimumValue={Math.max(12, downloadZoomLevels.min + 1)}
                    maximumValue={downloadMapType === 'satellite' ? 17 : 19}
                    step={1}
                    value={downloadZoomLevels.max}
                    onValueChange={(value) => setDownloadZoomLevels(prev => ({ ...prev, max: Math.round(value) }))}
                  />
                  <Text>{downloadMapType === 'satellite' ? '17' : '19'}</Text>
                </View>
              </View>
            </View>
            
            <Text style={styles.noteText}>
              Note: Higher zoom levels = more tiles = larger download
              {downloadMapType === 'satellite' && '\nSatellite imagery may have usage restrictions.'}
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowDownloadModal(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.downloadButton]}
                onPress={startDownload}
              >
                <Icon name="download" size={20} color="#fff" />
                <Text style={[styles.buttonText, { marginLeft: 5 }]}>Download</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.cleanButton]}
                onPress={cleanUpTiles}
              >
                <Icon name="delete" size={20} color="#fff" />
                <Text style={[styles.buttonText, { marginLeft: 5 }]}>Clean</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Loading Indicator */}
      {isDownloading && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loaderText}>
            Downloading {downloadMapType} tiles...
          </Text>
          <Text style={styles.progressText}>
            {progress} / {totalTiles} tiles
          </Text>
          <Text style={styles.progressPercent}>
            {totalTiles > 0 ? Math.round((progress / totalTiles) * 100) : 0}%
          </Text>
          <Text style={styles.noteText}>
            This may take several minutes. Please keep the app open.
          </Text>
        </View>
      )}
    </View>
  );
}

// Add Slider import at top and component
import Slider from '@react-native-community/slider';

const styles = StyleSheet.create({
  container: { flex: 1 },
  controlPanel: { 
    position: 'absolute', 
    top: 50, 
    right: 20, 
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 10,
    padding: 10,
    elevation: 5,
  },
  status: { 
    padding: 8, 
    borderRadius: 5, 
    marginBottom: 10,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  statusText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  controlButton: { 
    backgroundColor: '#2980b9', 
    width: 50,
    height: 50,
    borderRadius: 25, 
    elevation: 5,
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoPanel: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 10,
    borderRadius: 10,
  },
  infoText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
  loader: { 
    ...StyleSheet.absoluteFillObject, 
    backgroundColor: 'rgba(255,255,255,0.95)', 
    justifyContent: 'center', 
    alignItems: 'center',
    padding: 20,
  },
  loaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  progressText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  progressPercent: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 25,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 10,
    color: '#555',
  },
  mapTypeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  mapTypeOption: {
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ddd',
    width: '45%',
  },
  mapTypeSelected: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  mapTypeText: {
    marginTop: 5,
    fontSize: 14,
    color: '#333',
  },
  mapTypeTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  zoomControls: {
    marginBottom: 20,
  },
  zoomControl: {
    marginBottom: 15,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  slider: {
    flex: 1,
    height: 40,
    marginHorizontal: 10,
  },
  noteText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#757575',
  },
  downloadButton: {
    backgroundColor: '#4CAF50',
  },
  cleanButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});