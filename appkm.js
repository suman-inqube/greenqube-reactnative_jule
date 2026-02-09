import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  Dimensions,
  ScrollView,
} from 'react-native';

import MapView, {
  PROVIDER_GOOGLE,
  LocalTile,
  Marker,
  Polygon,
  Circle,
} from 'react-native-maps';

import NetInfo from '@react-native-community/netinfo';
import Geolocation from '@react-native-community/geolocation';
import RNFS from 'react-native-fs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Slider from '@react-native-community/slider';

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
  }
};

const USER_AGENT = 'MyOfflineMapApp/1.0';

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

// Calculate distance between two coordinates (in meters)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371000; // Earth's radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Calculate bounding box from center and radius
const getBoundingBox = (center, radiusKm) => {
  const earthRadius = 6371; // km
  const latRadian = center.latitude * Math.PI / 180;
  
  const maxLat = center.latitude + (radiusKm / earthRadius) * (180 / Math.PI);
  const minLat = center.latitude - (radiusKm / earthRadius) * (180 / Math.PI);
  const maxLon = center.longitude + (radiusKm / earthRadius) * (180 / Math.PI) / Math.cos(latRadian);
  const minLon = center.longitude - (radiusKm / earthRadius) * (180 / Math.PI) / Math.cos(latRadian);
  
  return { maxLat, minLat, maxLon, minLon };
};

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
  
  // Area selection states
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedArea, setSelectedArea] = useState(null);
  const [selectionPoints, setSelectionPoints] = useState([]);
  const [selectionRadius, setSelectionRadius] = useState(1); // km
  const [isSelectingRadius, setIsSelectingRadius] = useState(false);
  
  // Download states
  const [downloadMapType, setDownloadMapType] = useState('satellite');
  const [downloadZoomLevels, setDownloadZoomLevels] = useState({ min: 12, max: 14 });
  
  // Nearest locations states
  const [nearestLocations, setNearestLocations] = useState([]);
  const [showLocationsList, setShowLocationsList] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  
  const [region, setRegion] = useState({
    latitude: 22.5726,
    longitude: 88.3639,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  // Sample locations data (you can replace with your own data or API)
  const [locations] = useState([
    { id: 1, name: "City Center", latitude: 22.5726, longitude: 88.3639, type: "landmark" },
    { id: 2, name: "Airport", latitude: 22.6545, longitude: 88.4467, type: "transport" },
    { id: 3, name: "Shopping Mall", latitude: 22.5892, longitude: 88.4179, type: "commercial" },
    { id: 4, name: "Hospital", latitude: 22.5786, longitude: 88.3963, type: "medical" },
    { id: 5, name: "University", latitude: 22.4970, longitude: 88.3715, type: "education" },
    { id: 6, name: "Park", latitude: 22.5608, longitude: 88.3538, type: "recreation" },
    { id: 7, name: "Train Station", latitude: 22.5853, longitude: 88.3478, type: "transport" },
    { id: 8, name: "Hotel", latitude: 22.5662, longitude: 88.3487, type: "accommodation" },
    { id: 9, name: "Restaurant", latitude: 22.5761, longitude: 88.3754, type: "food" },
    { id: 10, name: "Police Station", latitude: 22.5718, longitude: 88.3896, type: "government" },
  ]);

  useEffect(() => {
    const init = async () => {
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

  // Calculate tiles for an area
  const calculateTilesForArea = (area, minZoom, maxZoom) => {
    let total = 0;
    for (let z = minZoom; z <= maxZoom; z++) {
      const topLeft = getTileXYZ(area.maxLat, area.minLon, z);
      const bottomRight = getTileXYZ(area.minLat, area.maxLon, z);
      
      const xTiles = Math.abs(bottomRight.x - topLeft.x) + 1;
      const yTiles = Math.abs(bottomRight.y - topLeft.y) + 1;
      
      total += xTiles * yTiles;
    }
    return total;
  };

  // Handle map tap for area selection
  const handleMapPress = (event) => {
    const { coordinate } = event.nativeEvent;
    
    if (selectionMode) {
      if (selectionPoints.length === 0) {
        // First tap - set center point
        setSelectedArea({
          center: coordinate,
          radius: selectionRadius,
          ...getBoundingBox(coordinate, selectionRadius)
        });
        setIsSelectingRadius(true);
        Alert.alert(
          "Area Selected",
          `Center: ${coordinate.latitude.toFixed(6)}, ${coordinate.longitude.toFixed(6)}\n` +
          `Radius: ${selectionRadius} km\n\n` +
          "Adjust radius using slider, then tap Download",
          [
            { text: 'Cancel', onPress: cancelSelection },
            { text: 'Find Nearest Locations', onPress: () => findNearestLocations(coordinate) },
            { text: 'Download Area', onPress: () => showDownloadOptions() }
          ]
        );
      }
    } else {
      // Normal tap - show location info
      console.log('Tapped:', coordinate);
    }
  };

  // Find nearest locations to a point
  const findNearestLocations = (centerPoint) => {
    const locationsWithDistance = locations.map(location => ({
      ...location,
      distance: calculateDistance(
        centerPoint.latitude,
        centerPoint.longitude,
        location.latitude,
        location.longitude
      )
    }));
    
    // Sort by distance and take top 5
    const nearest = locationsWithDistance
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5);
    
    setNearestLocations(nearest);
    setShowLocationsList(true);
  };

  // Start area selection mode
  const startAreaSelection = () => {
    setSelectionMode(true);
    setSelectedArea(null);
    setSelectionPoints([]);
    setIsSelectingRadius(false);
    Alert.alert(
      "Area Selection Mode",
      "Tap on the map to select an area center point. Then choose a radius to download."
    );
  };

  // Cancel selection
  const cancelSelection = () => {
    setSelectionMode(false);
    setSelectedArea(null);
    setSelectionPoints([]);
    setIsSelectingRadius(false);
  };

  // Show download options for selected area
  const showDownloadOptions = () => {
    if (!selectedArea) return;
    
    const totalTiles = calculateTilesForArea(selectedArea, downloadZoomLevels.min, downloadZoomLevels.max);
    const estimatedSizeMB = (totalTiles * (downloadMapType === 'satellite' ? 100 : 50)) / 1024;
    
    Alert.alert(
      "Download Selected Area",
      `Center: ${selectedArea.center.latitude.toFixed(6)}, ${selectedArea.center.longitude.toFixed(6)}\n` +
      `Radius: ${selectedArea.radius} km\n` +
      `Area: ${(selectedArea.maxLat - selectedArea.minLat).toFixed(4)}×${(selectedArea.maxLon - selectedArea.minLon).toFixed(4)} deg\n` +
      `Zoom: ${downloadZoomLevels.min}-${downloadZoomLevels.max}\n` +
      `Estimated Tiles: ${totalTiles}\n` +
      `Estimated Size: ${estimatedSizeMB.toFixed(1)} MB`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Change Radius', 
          onPress: () => setIsSelectingRadius(true)
        },
        // { 
        //   text: 'Settings', 
        //   onPress: () => Alert.alert("Settings", "Use the control panel to change settings")
        // },
        { 
          text: 'Download Now', 
          style: 'destructive',
          onPress: () => downloadSelectedArea()
        }
      ]
    );
  };

  // Download selected area
  const downloadSelectedArea = async () => {
    if (!selectedArea || offline) {
      Alert.alert("Error", "No area selected or no internet connection");
      return;
    }
    
    setIsDownloading(true);
    setProgress(0);
    
    const { min, max } = downloadZoomLevels;
    const total = calculateTilesForArea(selectedArea, min, max);
    setTotalTiles(total);
    
    let downloadCount = 0;
    let errorCount = 0;
    const maxErrors = 10;
    
    try {
      for (let z = min; z <= max; z++) {
        const topLeft = getTileXYZ(selectedArea.maxLat, selectedArea.minLon, z);
        const bottomRight = getTileXYZ(selectedArea.minLat, selectedArea.maxLon, z);
        
        const minX = Math.min(topLeft.x, bottomRight.x);
        const maxX = Math.max(topLeft.x, bottomRight.x);
        const minY = Math.min(topLeft.y, bottomRight.y);
        const maxY = Math.max(topLeft.y, bottomRight.y);
        
        for (let x = minX; x <= maxX; x++) {
          for (let y = minY; y <= maxY; y++) {
            const dir = downloadMapType === 'satellite' ? SATELLITE_DIR : TILE_DIR;
            const folder = `${dir}/${z}/${x}`;
            const file = `${folder}/${y}.${downloadMapType === 'satellite' ? 'jpg' : 'png'}`;
            const provider = TILE_PROVIDERS[downloadMapType];
            
            let url = provider.url;
            if (downloadMapType === 'satellite') {
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
                }).promise;
                
                if (result.statusCode !== 200) {
                  errorCount++;
                  if (errorCount >= maxErrors) {
                    throw new Error("Too many download errors");
                  }
                }
              } catch (error) {
                errorCount++;
                console.error(`Error downloading tile ${z}/${x}/${y}:`, error.message);
              }
              
              await sleep(downloadMapType === 'satellite' ? 300 : 200);
            }
            
            downloadCount++;
            setProgress(downloadCount);
            
            if (downloadCount % 50 === 0) {
              console.log(`Progress: ${downloadCount}/${total} tiles`);
            }
          }
        }
      }
      
      // Update tile availability
      if (downloadMapType === 'satellite') {
        setSatelliteTilesAvailable(true);
      } else {
        setTilesAvailable(true);
      }
      
      Alert.alert(
        "Download Complete",
        `Successfully downloaded ${downloadCount} tiles.\n\n` +
        `Area: ${selectedArea.radius} km radius\n` +
        `Center: ${selectedArea.center.latitude.toFixed(6)}, ${selectedArea.center.longitude.toFixed(6)}\n` +
        `Type: ${downloadMapType}\n` +
        `Zoom: ${min}-${max}\n` +
        `Errors: ${errorCount}`,
        [{ text: 'OK', onPress: cancelSelection }]
      );
      
    } catch (error) {
      Alert.alert(
        "Download Error",
        error.message + "\n\nTry with:\n" +
        "1. Smaller radius\n" +
        "2. Lower zoom levels\n" +
        "3. Different map type",
        [{ text: 'OK' }]
      );
    } finally {
      setIsDownloading(false);
    }
  };

  // Download specific location
  const downloadLocation = (location) => {
    setSelectedLocation(location);
    setSelectedArea({
      center: { latitude: location.latitude, longitude: location.longitude },
      radius: 0.5, // 500 meters default
      ...getBoundingBox({ latitude: location.latitude, longitude: location.longitude }, 0.5)
    });
    
    Alert.alert(
      `Download ${location.name}`,
      `Do you want to download map for ${location.name}?\n\n` +
      `Location: ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}\n` +
      `Type: ${location.type}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Custom Area', onPress: () => {
          setSelectedArea({
            center: { latitude: location.latitude, longitude: location.longitude },
            radius: selectionRadius,
            ...getBoundingBox({ latitude: location.latitude, longitude: location.longitude }, selectionRadius)
          });
          setIsSelectingRadius(true);
        }},
        { text: 'Download Now', style: 'destructive', onPress: () => downloadSelectedArea() }
      ]
    );
  };

  // Handle location selection from list
  const handleLocationSelect = (location) => {
    setShowLocationsList(false);
    
    // Zoom to location
    mapRef.current?.animateToRegion({
      latitude: location.latitude,
      longitude: location.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    }, 1000);
    
    // Show options after a delay
    setTimeout(() => {
      downloadLocation(location);
    }, 1200);
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        provider={offline ? undefined : PROVIDER_GOOGLE}
        region={region}
        mapType={downloadMapType === 'satellite' ? 'hybrid' : 'standard'}
        onRegionChangeComplete={setRegion}
        onPress={handleMapPress}
      >
        {/* Offline Tiles */}
        {offline && (
          <>
            {satelliteTilesAvailable && downloadMapType === 'satellite' && (
              <LocalTile
                pathTemplate={`${SATELLITE_DIR}/{z}/{x}/{y}.jpg`}
                tileSize={256}
                zIndex={10}
              />
            )}
            {tilesAvailable && downloadMapType === 'standard' && (
              <LocalTile
                pathTemplate={`${TILE_DIR}/{z}/{x}/{y}.png`}
                tileSize={256}
                zIndex={10}
              />
            )}
          </>
        )}
        
        {/* User Location */}
        {userLocation && (
          <Marker 
            coordinate={userLocation} 
            title="Your Location"
            pinColor="blue"
          />
        )}
        
        {/* Selected Area Circle */}
        {selectedArea && (
          <Circle
            center={selectedArea.center}
            radius={selectedArea.radius * 1000} // Convert km to meters
            strokeColor="#FF0000"
            fillColor="rgba(255,0,0,0.1)"
            strokeWidth={2}
          />
        )}
        
        {/* Nearest Locations */}
        {nearestLocations.map(location => (
          <Marker
            key={location.id}
            coordinate={{ latitude: location.latitude, longitude: location.longitude }}
            title={location.name}
            description={`${(location.distance / 1000).toFixed(2)} km away`}
            pinColor={location.type === 'transport' ? 'green' : 
                     location.type === 'medical' ? 'red' : 
                     location.type === 'commercial' ? 'purple' : 'orange'}
            onPress={() => handleLocationSelect(location)}
          />
        ))}
        
        {/* Selected Location */}
        {selectedLocation && (
          <Marker
            coordinate={selectedLocation}
            title={selectedLocation.name}
            pinColor="red"
          />
        )}
        
        {/* All Locations */}
        {!selectionMode && (
          locations.map(location => (
            <Marker
              key={location.id}
              coordinate={{ latitude: location.latitude, longitude: location.longitude }}
              title={location.name}
              pinColor="#888"
              opacity={0.7}
            />
          ))
        )}
      </MapView>

      {/* Control Panel */}
      <View style={styles.controlPanel}>
        {/* Status */}
        <View style={[styles.status, { backgroundColor: offline ? '#d35400' : '#27ae60' }]}>
          <Text style={styles.statusText}>{offline ? "OFFLINE" : "ONLINE"}</Text>
        </View>

        {/* Area Selection Button */}
        <TouchableOpacity 
          style={[
            styles.controlButton, 
            { backgroundColor: selectionMode ? '#FF5722' : '#4CAF50' }
          ]} 
          onPress={selectionMode ? cancelSelection : startAreaSelection}
        >
          <Icon name={selectionMode ? "cancel" : "my-location"} size={24} color="#fff" />
        </TouchableOpacity>

        {/* Map Type Toggle */}
        <TouchableOpacity 
          style={styles.controlButton} 
          onPress={() => setDownloadMapType(
            downloadMapType === 'satellite' ? 'standard' : 'satellite'
          )}
        >
          <Icon name={downloadMapType === 'satellite' ? "satellite" : "map"} size={24} color="#fff" />
        </TouchableOpacity>

        {/* Zoom Controls */}
        <TouchableOpacity 
          style={styles.controlButton}
          onPress={() => Alert.alert(
            "Zoom Levels",
            `Current: ${downloadZoomLevels.min}-${downloadZoomLevels.max}\n\n` +
            "Lower zoom = larger area, less detail\n" +
            "Higher zoom = smaller area, more detail",
            [
              { text: 'Low Detail (10-12)', onPress: () => setDownloadZoomLevels({ min: 10, max: 12 }) },
              { text: 'Medium Detail (12-14)', onPress: () => setDownloadZoomLevels({ min: 12, max: 14 }) },
              { text: 'High Detail (14-16)', onPress: () => setDownloadZoomLevels({ min: 14, max: 16 }) },
              { text: 'Cancel', style: 'cancel' }
            ]
          )}
        >
          <Icon name="zoom-in" size={24} color="#fff" />
        </TouchableOpacity>

        {/* Info Button */}
        <TouchableOpacity 
          style={styles.controlButton}
          onPress={() => Alert.alert(
            "Map Info",
            `Mode: ${selectionMode ? 'Selection' : 'Normal'}\n` +
            `Map Type: ${downloadMapType}\n` +
            `Zoom: ${downloadZoomLevels.min}-${downloadZoomLevels.max}\n` +
            `Selected Area: ${selectedArea ? `${selectedArea.radius}km radius` : 'None'}\n` +
            `Offline Tiles: ${tilesAvailable ? 'Available' : 'Not Available'}\n` +
            `Satellite Tiles: ${satelliteTilesAvailable ? 'Available' : 'Not Available'}`
          )}
        >
          <Icon name="info" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Radius Selection Slider */}
      {isSelectingRadius && selectedArea && (
        <View style={styles.radiusPanel}>
          <Text style={styles.radiusTitle}>Adjust Radius: {selectedArea.radius} km</Text>
          <Slider
            style={styles.radiusSlider}
            minimumValue={0.1}
            maximumValue={10}
            step={0.1}
            value={selectedArea.radius}
            onValueChange={(value) => {
              const newArea = {
                ...selectedArea,
                radius: value,
                ...getBoundingBox(selectedArea.center, value)
              };
              setSelectedArea(newArea);
            }}
            minimumTrackTintColor="#4CAF50"
            maximumTrackTintColor="#000000"
          />
          <View style={styles.radiusButtons}>
            <TouchableOpacity 
              style={[styles.radiusButton, { backgroundColor: '#757575' }]}
              onPress={() => setIsSelectingRadius(false)}
            >
              <Text style={styles.radiusButtonText}>Done</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.radiusButton, { backgroundColor: '#4CAF50' }]}
              onPress={() => {
                setIsSelectingRadius(false);
                showDownloadOptions();
              }}
            >
              <Text style={styles.radiusButtonText}>Download</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Nearest Locations Modal */}
      <Modal
        visible={showLocationsList}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nearest Locations</Text>
            
            <ScrollView style={styles.locationsList}>
              {nearestLocations.map(location => (
                <TouchableOpacity
                  key={location.id}
                  style={styles.locationItem}
                  onPress={() => handleLocationSelect(location)}
                >
                  <View style={styles.locationIcon}>
                    <Icon 
                      name={
                        location.type === 'transport' ? 'directions-transit' :
                        location.type === 'medical' ? 'local-hospital' :
                        location.type === 'commercial' ? 'shopping-cart' :
                        location.type === 'education' ? 'school' :
                        location.type === 'recreation' ? 'park' :
                        'location-on'
                      } 
                      size={24} 
                      color="#4CAF50" 
                    />
                  </View>
                  <View style={styles.locationInfo}>
                    <Text style={styles.locationName}>{location.name}</Text>
                    <Text style={styles.locationDetails}>
                      {location.type} • {(location.distance / 1000).toFixed(2)} km away
                    </Text>
                    <Text style={styles.locationCoords}>
                      {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                    </Text>
                  </View>
                  <Icon name="chevron-right" size={20} color="#666" />
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowLocationsList(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Download Progress */}
      {isDownloading && (
        <View style={styles.downloadOverlay}>
          <View style={styles.downloadContent}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.downloadTitle}>Downloading Map Tiles</Text>
            
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[
                  styles.progressFill,
                  { width: `${(progress / totalTiles) * 100}%` }
                ]} />
              </View>
              <Text style={styles.progressText}>
                {progress} / {totalTiles} tiles
              </Text>
              <Text style={styles.progressPercent}>
                {totalTiles > 0 ? Math.round((progress / totalTiles) * 100) : 0}%
              </Text>
            </View>
            
            <Text style={styles.downloadDetails}>
              Area: {selectedArea?.radius} km radius{'\n'}
              Type: {downloadMapType}{'\n'}
              Zoom: {downloadZoomLevels.min}-{downloadZoomLevels.max}
            </Text>
            
            <Text style={styles.noteText}>
              Please keep the app open. This may take several minutes.
            </Text>
          </View>
        </View>
      )}

      {/* Instructions Panel */}
      {selectionMode && !isSelectingRadius && (
        <View style={styles.instructionPanel}>
          <Text style={styles.instructionText}>
            🔘 Tap on map to select area center
          </Text>
        </View>
      )}
    </View>
  );
}

const { width, height } = Dimensions.get('window');

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
  radiusPanel: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 15,
    padding: 20,
    elevation: 10,
  },
  radiusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#333',
  },
  radiusSlider: {
    width: '100%',
    height: 40,
  },
  radiusButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  radiusButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  radiusButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  instructionPanel: {
    position: 'absolute',
    top: 120,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  instructionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
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
    padding: 20,
    width: '90%',
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  locationsList: {
    maxHeight: height * 0.5,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  locationIcon: {
    marginRight: 15,
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  locationDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  locationCoords: {
    fontSize: 12,
    color: '#999',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  closeButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  downloadOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  downloadContent: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 30,
    width: '90%',
    alignItems: 'center',
  },
  downloadTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 20,
    color: '#333',
  },
  progressContainer: {
    width: '100%',
    marginBottom: 20,
  },
  progressBar: {
    height: 10,
    backgroundColor: '#eee',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  progressPercent: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    textAlign: 'center',
    marginTop: 5,
  },
  downloadDetails: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 20,
  },
  noteText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
  },
});