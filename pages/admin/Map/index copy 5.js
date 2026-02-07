import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Alert,
  Platform,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
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
import Slider from '@react-native-community/slider';
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
const INDIA_BOUNDS = {
  north: 37.084,
  south: 6.755,
  west: 68.162,
  east: 97.395
};

const INDIA_REGIONS = [
  { name: 'North India', bounds: { north: 37.084, south: 28.704, west: 68.162, east: 81.088 } },
  { name: 'South India', bounds: { north: 20.593, south: 6.755, west: 74.324, east: 85.324 } },
  { name: 'East India', bounds: { north: 28.218, south: 21.049, west: 85.605, east: 97.395 } },
  { name: 'West India', bounds: { north: 28.656, south: 15.299, west: 68.162, east: 75.088 } },
  { name: 'Central India', bounds: { north: 28.704, south: 21.049, west: 74.324, east: 85.605 } },
  { name: 'North East India', bounds: { north: 28.218, south: 21.049, west: 89.744, east: 97.395 } }
];

const lon2tile = (lon, zoom) => Math.floor(((lon + 180) / 360) * Math.pow(2, zoom));
const lat2tile = (lat, zoom) => Math.floor(
  ((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2) *
  Math.pow(2, zoom)
);

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
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [selectedRegions, setSelectedRegions] = useState([]);
  const [zoomLevel, setZoomLevel] = useState(10);
  const [downloadQuality, setDownloadQuality] = useState('medium');
  const [estimatedSize, setEstimatedSize] = useState('0 MB');
  const [activeDownload, setActiveDownload] = useState(null);
  const [downloadHistory, setDownloadHistory] = useState([]);

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
        loadDownloadHistory();
      } catch (e) {
        console.error("Directory initialization failed", e);
      }
    };

    initDir();
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    calculateEstimatedSize();
  }, [selectedRegions, zoomLevel, downloadQuality]);

  const calculateEstimatedSize = () => {
    if (selectedRegions.length === 0) {
      setEstimatedSize('0 MB');
      return;
    }

    let totalTiles = 0;
    const zoomLevels = getZoomLevels();

    selectedRegions.forEach(regionName => {
      const region = INDIA_REGIONS.find(r => r.name === regionName);
      if (region) {
        zoomLevels.forEach(z => {
          const xStart = lon2tile(region.bounds.west, z);
          const xEnd = lon2tile(region.bounds.east, z);
          const yStart = lat2tile(region.bounds.north, z);
          const yEnd = lat2tile(region.bounds.south, z);
          totalTiles += (xEnd - xStart + 1) * (yEnd - yStart + 1);
        });
      }
    });

    const sizePerTile = {
      low: 10,
      medium: 15,
      high: 25
    }[downloadQuality];

    const totalSizeMB = (totalTiles * sizePerTile) / 1024;
    setEstimatedSize(`${totalSizeMB.toFixed(1)} MB`);
  };

  const getZoomLevels = () => {
    const baseZoom = zoomLevel;
    const qualityRange = {
      low: [baseZoom - 1, baseZoom],
      medium: [baseZoom - 1, baseZoom, baseZoom + 1],
      high: [baseZoom - 2, baseZoom - 1, baseZoom, baseZoom + 1, baseZoom + 2]
    };
    return qualityRange[downloadQuality];
  };

  const loadDownloadHistory = async () => {
    try {
      const historyPath = `${TILE_DIR}/download_history.json`;
      if (await RNFS.exists(historyPath)) {
        const historyContent = await RNFS.readFile(historyPath);
        setDownloadHistory(JSON.parse(historyContent));
      }
    } catch (error) {
      console.error('Error loading download history:', error);
    }
  };

  const saveDownloadHistory = async (downloadInfo) => {
    try {
      const historyPath = `${TILE_DIR}/download_history.json`;
      const newHistory = [...downloadHistory, downloadInfo];
      setDownloadHistory(newHistory);
      await RNFS.writeFile(historyPath, JSON.stringify(newHistory));
    } catch (error) {
      console.error('Error saving download history:', error);
    }
  };

  const downloadIndiaMap = async () => {
    if (selectedRegions.length === 0) {
      Alert.alert('Select Regions', 'Please select at least one region to download.');
      return;
    }

    if (!isConnected) {
      Alert.alert('Internet Required', 'Connect to internet to download maps.');
      return;
    }

    setDownloading(true);
    setShowDownloadModal(false);
    setDownloadProgress(0);
    setDownloadedTiles(0);

    const zoomLevels = getZoomLevels();
    let totalTilesCount = 0;
    let downloadedCount = 0;

    selectedRegions.forEach(regionName => {
      const region = INDIA_REGIONS.find(r => r.name === regionName);
      if (region) {
        zoomLevels.forEach(z => {
          const xStart = lon2tile(region.bounds.west, z);
          const xEnd = lon2tile(region.bounds.east, z);
          const yStart = lat2tile(region.bounds.north, z);
          const yEnd = lat2tile(region.bounds.south, z);
          totalTilesCount += (xEnd - xStart + 1) * (yEnd - yStart + 1);
        });
      }
    });

    setTotalTiles(totalTilesCount);

    const downloadStartTime = Date.now();
    const downloadId = `download_${downloadStartTime}`;
    setActiveDownload({
      id: downloadId,
      regions: selectedRegions,
      startTime: downloadStartTime,
      totalTiles: totalTilesCount
    });

    try {
      for (const regionName of selectedRegions) {
        const region = INDIA_REGIONS.find(r => r.name === regionName);
        if (!region) continue;

        for (let z of zoomLevels) {
          const xStart = lon2tile(region.bounds.west, z);
          const xEnd = lon2tile(region.bounds.east, z);
          const yStart = lat2tile(region.bounds.north, z);
          const yEnd = lat2tile(region.bounds.south, z);

          for (let x = xStart; x <= xEnd; x++) {
            const dir = `${TILE_DIR}/${z}/${x}`;
            await RNFS.mkdir(dir);
            
            for (let y = yStart; y <= yEnd; y++) {
              const path = `${dir}/${y}.png`;
              
              if (await RNFS.exists(path)) {
                downloadedCount++;
                setDownloadedTiles(downloadedCount);
                setDownloadProgress((downloadedCount / totalTilesCount) * 100);
                continue;
              }

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
                    headers: { 'User-Agent': 'IndiaMapDownloader/1.0' },
                    background: true,
                    discretionary: true,
                    cacheable: true,
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
              setDownloadProgress((downloadedCount / totalTilesCount) * 100);
              
              await new Promise(r => setTimeout(r, 30));
            }
          }
        }
      }

      const downloadEndTime = Date.now();
      const downloadDuration = Math.round((downloadEndTime - downloadStartTime) / 1000);
      
      const downloadInfo = {
        id: downloadId,
        regions: selectedRegions,
        zoomLevel: zoomLevel,
        quality: downloadQuality,
        tilesDownloaded: downloadedCount,
        size: estimatedSize,
        duration: downloadDuration,
        date: new Date().toISOString()
      };

      await saveDownloadHistory(downloadInfo);
      
      Alert.alert(
        "Download Complete",
        `Successfully downloaded ${downloadedCount} tiles for ${selectedRegions.join(', ')}.\n\nEstimated size: ${estimatedSize}\nTime taken: ${downloadDuration} seconds`,
        [{ text: 'OK' }]
      );
      
      setSelectedRegions([]);
    } catch (error) {
      console.error("Download error:", error);
      Alert.alert("Error", "Download failed. Please try again later.");
    } finally {
      setDownloading(false);
      setDownloadProgress(0);
      setTotalTiles(0);
      setDownloadedTiles(0);
      setActiveDownload(null);
    }
  };

  const toggleRegion = (regionName) => {
    setSelectedRegions(prev => 
      prev.includes(regionName)
        ? prev.filter(r => r !== regionName)
        : [...prev, regionName]
    );
  };

  const selectAllRegions = () => {
    setSelectedRegions(INDIA_REGIONS.map(r => r.name));
  };

  const clearAllRegions = () => {
    setSelectedRegions([]);
  };

  const getStorageInfo = async () => {
    try {
      const files = await RNFS.readDir(TILE_DIR);
      let tileCount = 0;
      let totalSize = 0;

      const countTiles = async (dir) => {
        const items = await RNFS.readDir(dir);
        for (const item of items) {
          if (item.isDirectory()) {
            await countTiles(item.path);
          } else if (item.name.endsWith('.png')) {
            tileCount++;
            totalSize += item.size || 0;
          }
        }
      };

      await countTiles(TILE_DIR);
      
      const sizeMB = (totalSize / (1024 * 1024)).toFixed(2);
      return { tileCount, size: `${sizeMB} MB` };
    } catch (error) {
      return { tileCount: 0, size: '0 MB' };
    }
  };

  const clearOfflineData = async () => {
    Alert.alert(
      'Clear All Offline Data',
      'This will remove all downloaded map tiles. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All', 
          style: 'destructive',
          onPress: async () => {
            try {
              await RNFS.unlink(TILE_DIR);
              await RNFS.mkdir(TILE_DIR);
              setDownloadHistory([]);
              Alert.alert('Success', 'All offline data cleared.');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data.');
            }
          }
        }
      ]
    );
  };

  useEffect(() => {
    const onPageLoad = async () => {
      try {
        if (location?.length && location[0].latitude && location[0].longitude) {
          animateToLocation(
            parseFloat(location[0].latitude),
            parseFloat(location[0].longitude),
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
  }, [baselatLong, location]);

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
  }, [newPolygon, landUnitsquareMetre]);

  useEffect(() => {
    if (editing && !drawingReference) {
      editingLocation();
    }
  }, [editing, drawingReference]);

  const editingLocation = async () => {
    const fusedLocation = await getItem('fusedLocation');
    if (fusedLocation) {
      setDrawingReference({
        latitude: fusedLocation.latitude,
        longitude: fusedLocation.longitude,
      });
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
        
        if (newPolygon.length === 0) {
          const distance = getDistance({ latitude, longitude }, reference);
          if (distance <= distanceThreshold) {
            handleMapPress(event);
          } else if (editing) {
            Alert.alert('❌ Out of Range', `Plot location and current location not same!`);
          }
        } else {
          const dist = isWithin20Meters(pressedPoint, newPolygon, 40);
          if (dist !== 0) {
            handleMapPress(event);
          }
        }
      }
    } catch (error) {
      console.log('Error:', error);
    }
  };

  const fetchSearchSuggestions = async (query) => {
    if (!isConnected) {
      Alert.alert('Offline', 'Search requires internet connection.');
      return [];
    }
    const suggestiveRes = await getMapLocation(query);
    return suggestiveRes?.data?.features || [];
  };

  const handleSelect = (item) => {
    if (!isConnected) {
      Alert.alert('Offline', 'Location search requires internet.');
      return;
    }
    setMarker({ lat: item?.lat, lng: item?.lng });
    animateToLocation(item?.lat, item?.lng);
  };

  const clearMapGetDistance = async () => {
    try {
      if (statuslevel === 'PENDING' || statuslevel === 'REJECTED') {
        if (type === 'livehoood') {
          clearNewPolygon();
        } else {
          if (location.length === 1) {
            clearNewPolygon();
          } else {
            const dist = isWithin20Meters(drawingReference, location, 20);
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
      case 'downloadIndia':
        setShowDownloadModal(true);
        break;
      case 'toggleOffline':
        if (!isConnected) {
          setUseOfflineMode(true);
        } else {
          setUseOfflineMode(!useOfflineMode);
        }
        break;
      case 'storageInfo':
        getStorageInfo().then(info => {
          Alert.alert(
            'Storage Information',
            `Downloaded tiles: ${info.tileCount}\nTotal size: ${info.size}\n\nDownload history: ${downloadHistory.length} downloads`
          );
        });
        break;
      case 'clearStorage':
        clearOfflineData();
        break;
    }
  }, [editing, isConnected, useOfflineMode]);

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
        text: 'Download India Map',
        name: 'downloadIndia',
        position: 5,
        color: '#3498DB',
        icon: <Icon name="map" size={24} color="white" />,
      },
      {
        text: 'Storage Info',
        name: 'storageInfo',
        position: 6,
        color: '#9B59B6',
        icon: <Icon name="storage" size={24} color="white" />,
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
          position: 7,
          color: Colors.useGreen,
          icon: <Icon name="undo" size={24} color="white" />,
        }
      );
    }

    return base;
  }, [editing, useOfflineMode]);

  const offlineTilePathTemplate = useMemo(() => {
    if (!isDirReady || !useOfflineMode) return null;
    
    const template = Platform.OS === 'android' 
      ? `file://${TILE_DIR}/{z}/{x}/{y}.png` 
      : `${TILE_DIR}/{z}/{x}/{y}.png`;
    
    return template;
  }, [isDirReady, useOfflineMode]);

  return (
    <View style={styles.container}>
      <Modal
        visible={showDownloadModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDownloadModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Download India Map</Text>
              <TouchableOpacity onPress={() => setShowDownloadModal(false)}>
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.sectionTitle}>Select Regions</Text>
              <View style={styles.regionGrid}>
                {INDIA_REGIONS.map(region => (
                  <TouchableOpacity
                    key={region.name}
                    style={[
                      styles.regionButton,
                      selectedRegions.includes(region.name) && styles.regionButtonSelected
                    ]}
                    onPress={() => toggleRegion(region.name)}
                  >
                    <Text style={[
                      styles.regionButtonText,
                      selectedRegions.includes(region.name) && styles.regionButtonTextSelected
                    ]}>
                      {region.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.regionActions}>
                <TouchableOpacity style={styles.actionButton} onPress={selectAllRegions}>
                  <Text style={styles.actionButtonText}>Select All</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={clearAllRegions}>
                  <Text style={styles.actionButtonText}>Clear All</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.sectionTitle}>Zoom Level: {zoomLevel}</Text>
              <Slider
                style={styles.slider}
                minimumValue={5}
                maximumValue={15}
                step={1}
                value={zoomLevel}
                onValueChange={setZoomLevel}
                minimumTrackTintColor={Colors.useGreen}
                maximumTrackTintColor="#ddd"
                thumbTintColor={Colors.useGreen}
              />
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabelMin}>Low Detail (5)</Text>
                <Text style={styles.sliderLabelMax}>High Detail (15)</Text>
              </View>

              <Text style={styles.sectionTitle}>Download Quality</Text>
              <View style={styles.qualitySelector}>
                {['low', 'medium', 'high'].map(quality => (
                  <TouchableOpacity
                    key={quality}
                    style={[
                      styles.qualityButton,
                      downloadQuality === quality && styles.qualityButtonSelected
                    ]}
                    onPress={() => setDownloadQuality(quality)}
                  >
                    <Text style={[
                      styles.qualityButtonText,
                      downloadQuality === quality && styles.qualityButtonTextSelected
                    ]}>
                      {quality.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.infoContainer}>
                <View style={styles.infoRow}>
                  <Icon name="info" size={20} color="#3498DB" />
                  <Text style={styles.infoText}>
                    Selected Regions: {selectedRegions.length}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Icon name="sd-storage" size={20} color="#3498DB" />
                  <Text style={styles.infoText}>
                    Estimated Size: {estimatedSize}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Icon name="layers" size={20} color="#3498DB" />
                  <Text style={styles.infoText}>
                    Zoom Levels: {getZoomLevels().join(', ')}
                  </Text>
                </View>
              </View>

              <Text style={styles.note}>
                Note: Downloading requires stable internet connection and sufficient storage space.
                The download will continue in background.
              </Text>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowDownloadModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.downloadButton,
                  selectedRegions.length === 0 && styles.downloadButtonDisabled
                ]}
                onPress={downloadIndiaMap}
                disabled={selectedRegions.length === 0}
              >
                <Icon name="download" size={20} color="white" />
                <Text style={styles.downloadButtonText}>Download</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {downloading && (
        <View style={styles.downloadOverlay}>
          <LoadingScreen />
          <View style={styles.progressContainer}>
            <Text style={styles.progressTitle}>Downloading India Map</Text>
            <Text style={styles.progressText}>
              Progress: {Math.round(downloadProgress)}% ({downloadedTiles}/{totalTiles} tiles)
            </Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${downloadProgress}%` }]} />
            </View>
            <Text style={styles.downloadDetails}>
              Regions: {selectedRegions.join(', ')}
            </Text>
            <Text style={styles.noteText}>
              Downloading... Do not close the app
            </Text>
            
            {activeDownload && (
              <TouchableOpacity
                style={styles.pauseButton}
                onPress={() => {
                  Alert.alert('Pause Download', 'This feature requires background download implementation.');
                }}
              >
                <Icon name="pause" size={20} color="white" />
                <Text style={styles.pauseButtonText}>Pause</Text>
              </TouchableOpacity>
            )}
          </View>
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
        initialRegion={{
          latitude: 20.5937,
          longitude: 78.9629,
          latitudeDelta: 25,
          longitudeDelta: 25,
        }}
        loadingEnabled={true}
        loadingBackgroundColor="#f0f0f0"
        loadingIndicatorColor={Colors.useGreen}
        zoomEnabled={true}
        scrollEnabled={true}
        pitchEnabled={false}
        rotateEnabled={false}
      >
        {useOfflineMode && offlineTilePathTemplate && isDirReady && (
          <LocalTile
            pathTemplate={offlineTilePathTemplate}
            tileSize={256}
            zIndex={-1}
            flipY={false}
          />
        )}

        {polygons.map((polygon, index) => {
          if (polygon && polygon.length >= 3) {
            return (
              <Polygon
                key={`poly-${index}`}
                coordinates={polygon}
                fillColor="rgba(167, 3, 3, 0.66)"
                strokeColor="rgb(240, 9, 9)"
                strokeWidth={2}
              />
            );
          }
          return null;
        })}

        {newPolygon && newPolygon.length > 0 && (
          <Polygon
            coordinates={newPolygon}
            fillColor="rgba(0, 200, 200, 0.5)"
            strokeColor="rgb(0, 200, 200)"
            strokeWidth={2}
          />
        )}

        {newPolygon && newPolygon.map((coord, index) => (
          <Marker key={`marker-${index}`} coordinate={coord} />
        ))}

        {marker.lat !== 0 && marker.lng !== 0 && (
          <Marker 
            coordinate={{ latitude: marker.lat, longitude: marker.lng }}
          />
        )}
      </MapView>

      {useOfflineMode && (
        <View style={styles.offlineBanner}>
          <Icon name="wifi-off" size={16} color="white" style={styles.offlineIcon} />
          <Text style={styles.offlineText}>OFFLINE MODE</Text>
          <TouchableOpacity onPress={() => getStorageInfo().then(info => {
            Alert.alert('Offline Storage', `Available tiles: ${info.tileCount}\nSize: ${info.size}`);
          })}>
            <Icon name="info" size={16} color="white" />
          </TouchableOpacity>
        </View>
      )}

      {!isConnected && !useOfflineMode && (
        <View style={styles.disconnectedBanner}>
          <Icon name="wifi-off" size={16} color="white" style={styles.offlineIcon} />
          <Text style={styles.disconnectedText}>No Internet Connection</Text>
          <TouchableOpacity onPress={() => setUseOfflineMode(true)}>
            <Text style={styles.switchButton}>Switch to Offline</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.searchContainer}>
        <SuggestiveSearchInput
          fetchSuggestions={fetchSearchSuggestions}
          onSelect={handleSelect}
          disabled={!isConnected || useOfflineMode}
          placeholder={!isConnected ? "Search unavailable offline" : "Search location in India"}
        />
      </View>

      {selectedArea !== 0 && (
        <View style={styles.areaContainer}>
          <Icon name="square-foot" size={16} color="#FFF" style={styles.areaIcon} />
          <Text style={styles.areaText}>
            Area: {selectedArea.toFixed(2)} {landAreaUnit?.[0]?.unit_name || 'm²'}
          </Text>
        </View>
      )}

      {downloadHistory.length > 0 && (
        <TouchableOpacity
          style={styles.historyButton}
          onPress={() => {
            Alert.alert(
              'Download History',
              downloadHistory.map(d => 
                `${new Date(d.date).toLocaleDateString()}: ${d.regions.join(', ')} (${d.tilesDownloaded} tiles)`
              ).join('\n\n')
            );
          }}
        >
          <Icon name="history" size={20} color="white" />
          <Text style={styles.historyText}>{downloadHistory.length}</Text>
        </TouchableOpacity>
      )}

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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalBody: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 15,
    marginBottom: 10,
  },
  regionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  regionButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    margin: 5,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  regionButtonSelected: {
    backgroundColor: Colors.useGreen,
    borderColor: Colors.useGreen,
  },
  regionButtonText: {
    fontSize: 14,
    color: '#666',
  },
  regionButtonTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
  regionActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 15,
  },
  actionButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  actionButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  sliderLabelMin: {
    fontSize: 12,
    color: '#666',
  },
  sliderLabelMax: {
    fontSize: 12,
    color: '#666',
  },
  qualitySelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 15,
  },
  qualityButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  qualityButtonSelected: {
    backgroundColor: Colors.useGreen,
    borderColor: Colors.useGreen,
  },
  qualityButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  qualityButtonTextSelected: {
    color: 'white',
  },
  infoContainer: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    marginVertical: 15,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
  },
  note: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 15,
    lineHeight: 16,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  cancelButton: {
    flex: 1,
    padding: 15,
    marginRight: 10,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  downloadButton: {
    flex: 2,
    flexDirection: 'row',
    padding: 15,
    borderRadius: 8,
    backgroundColor: Colors.useGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadButtonDisabled: {
    backgroundColor: '#ccc',
  },
  downloadButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
    marginLeft: 10,
  },
  downloadOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1001,
  },
  progressContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    width: '100%',
  },
  progressTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 20,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 10,
  },
  progressBar: {
    width: '80%',
    height: 10,
    backgroundColor: '#ECF0F1',
    borderRadius: 5,
    overflow: 'hidden',
    marginVertical: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.useGreen,
  },
  downloadDetails: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 10,
    textAlign: 'center',
  },
  noteText: {
    marginTop: 15,
    fontSize: 12,
    color: '#7F8C8D',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  pauseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E67E22',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 20,
  },
  pauseButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
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
  offlineBanner: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    backgroundColor: '#E67E22',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 999,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  offlineIcon: {
    marginRight: 8,
  },
  offlineText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
    marginRight: 10,
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
    marginRight: 10,
  },
  switchButton: {
    color: 'white',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  searchContainer: {
    width: '70%',
    position: 'absolute',
    top: 10,
    alignSelf: 'center',
    zIndex: 999,
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
  historyButton: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    backgroundColor: 'rgba(155, 89, 182, 0.8)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
    zIndex: 999,
  },
  historyText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
});