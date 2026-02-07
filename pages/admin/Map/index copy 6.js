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

// West Bengal specific bounds
const WEST_BENGAL_BOUNDS = {
  north: 27.222,
  south: 21.542,
  west: 85.843,
  east: 89.853
};

// India regions with West Bengal as separate option
const REGION_OPTIONS = [
  { 
    name: 'West Bengal', 
    bounds: WEST_BENGAL_BOUNDS,
    description: 'Complete West Bengal state map',
    icon: 'location-city'
  },
  { 
    name: 'North India', 
    bounds: { north: 37.084, south: 28.704, west: 68.162, east: 81.088 },
    description: 'Jammu & Kashmir, Himachal, Uttarakhand, Punjab, Haryana, Delhi, Rajasthan',
    icon: 'terrain'
  },
  { 
    name: 'South India', 
    bounds: { north: 20.593, south: 6.755, west: 74.324, east: 85.324 },
    description: 'Karnataka, Kerala, Tamil Nadu, Andhra Pradesh, Telangana, Goa',
    icon: 'beach-access'
  },
  { 
    name: 'East India', 
    bounds: { north: 28.218, south: 21.049, west: 85.605, east: 97.395 },
    description: 'Bihar, Jharkhand, Odisha, West Bengal',
    icon: 'sunny'
  },
  { 
    name: 'West India', 
    bounds: { north: 28.656, south: 15.299, west: 68.162, east: 75.088 },
    description: 'Gujarat, Maharashtra, Goa, Rajasthan',
    icon: 'landscape'
  },
  { 
    name: 'Central India', 
    bounds: { north: 28.704, south: 21.049, west: 74.324, east: 85.605 },
    description: 'Madhya Pradesh, Chhattisgarh, Uttar Pradesh',
    icon: 'center-focus-strong'
  },
  { 
    name: 'North East India', 
    bounds: { north: 28.218, south: 21.049, west: 89.744, east: 97.395 },
    description: 'Assam, Arunachal, Manipur, Meghalaya, Mizoram, Nagaland, Tripura, Sikkim',
    icon: 'forest'
  },
  { 
    name: 'Full India', 
    bounds: { north: 37.084, south: 6.755, west: 68.162, east: 97.395 },
    description: 'Complete India map (Large download)',
    icon: 'map'
  }
];

// West Bengal districts for detailed selection
const WEST_BENGAL_DISTRICTS = [
  { 
    name: 'Kolkata', 
    bounds: { north: 22.690, south: 22.450, west: 88.220, east: 88.480 },
    population: '4.5 million',
    area: '185 km²',
    type: 'Metropolitan City'
  },
  { 
    name: 'North 24 Parganas', 
    bounds: { north: 23.200, south: 22.110, west: 88.200, east: 89.100 },
    population: '10.1 million',
    area: '4094 km²',
    type: 'District'
  },
  { 
    name: 'South 24 Parganas', 
    bounds: { north: 22.800, south: 21.542, west: 88.000, east: 89.000 },
    population: '8.2 million',
    area: '9960 km²',
    type: 'District'
  },
  { 
    name: 'Howrah', 
    bounds: { north: 22.800, south: 22.450, west: 87.950, east: 88.400 },
    population: '4.8 million',
    area: '1467 km²',
    type: 'District'
  },
  { 
    name: 'Hooghly', 
    bounds: { north: 23.200, south: 22.450, west: 87.800, east: 88.500 },
    population: '5.5 million',
    area: '3149 km²',
    type: 'District'
  },
  { 
    name: 'Purba Bardhaman', 
    bounds: { north: 23.900, south: 22.900, west: 87.500, east: 88.300 },
    population: '4.8 million',
    area: '5434 km²',
    type: 'District',
    note: 'Eastern part of former Bardhaman district'
  },
  { 
    name: 'Paschim Bardhaman', 
    bounds: { north: 23.900, south: 23.200, west: 86.800, east: 87.500 },
    population: '2.9 million',
    area: '1603 km²',
    type: 'District',
    note: 'Western part of former Bardhaman district'
  },
  { 
    name: 'Birbhum', 
    bounds: { north: 24.300, south: 23.450, west: 87.250, east: 88.000 },
    population: '3.5 million',
    area: '4545 km²',
    type: 'District'
  },
  { 
    name: 'Bankura', 
    bounds: { north: 23.500, south: 22.600, west: 86.700, east: 87.500 },
    population: '3.6 million',
    area: '6882 km²',
    type: 'District'
  },
  { 
    name: 'Purulia', 
    bounds: { north: 23.800, south: 22.600, west: 85.843, east: 86.900 },
    population: '2.9 million',
    area: '6259 km²',
    type: 'District'
  },
  { 
    name: 'Jhargram', 
    bounds: { north: 22.750, south: 22.000, west: 86.700, east: 87.300 },
    population: '1.1 million',
    area: '3038 km²',
    type: 'District',
    note: 'Carved out of West Midnapore'
  },
  { 
    name: 'West Midnapore', 
    bounds: { north: 22.900, south: 21.542, west: 86.700, east: 87.500 },
    population: '5.9 million',
    area: '9296 km²',
    type: 'District'
  },
  { 
    name: 'East Midnapore', 
    bounds: { north: 22.400, south: 21.542, west: 87.500, east: 88.200 },
    population: '5.1 million',
    area: '4736 km²',
    type: 'District'
  },
  { 
    name: 'Darjeeling', 
    bounds: { north: 27.222, south: 26.500, west: 87.900, east: 88.900 },
    population: '1.8 million',
    area: '3149 km²',
    type: 'Hill District'
  },
  { 
    name: 'Jalpaiguri', 
    bounds: { north: 26.900, south: 26.000, west: 88.200, east: 89.500 },
    population: '3.9 million',
    area: '6227 km²',
    type: 'District'
  },
  { 
    name: 'Alipurduar', 
    bounds: { north: 26.800, south: 26.000, west: 89.000, east: 89.853 },
    population: '1.7 million',
    area: '3383 km²',
    type: 'District',
    note: 'Carved out of Jalpaiguri'
  },
  { 
    name: 'Cooch Behar', 
    bounds: { north: 26.500, south: 25.700, west: 88.500, east: 89.853 },
    population: '2.8 million',
    area: '3387 km²',
    type: 'District'
  },
  { 
    name: 'Uttar Dinajpur', 
    bounds: { north: 26.000, south: 25.200, west: 88.000, east: 89.000 },
    population: '3.0 million',
    area: '3140 km²',
    type: 'District'
  },
  { 
    name: 'Dakshin Dinajpur', 
    bounds: { north: 25.800, south: 25.000, west: 88.200, east: 89.000 },
    population: '1.7 million',
    area: '2219 km²',
    type: 'District'
  },
  { 
    name: 'Malda', 
    bounds: { north: 25.300, south: 24.600, west: 87.800, east: 88.500 },
    population: '3.9 million',
    area: '3733 km²',
    type: 'District'
  },
  { 
    name: 'Murshidabad', 
    bounds: { north: 24.600, south: 23.800, west: 87.800, east: 88.500 },
    population: '7.1 million',
    area: '5324 km²',
    type: 'District'
  },
  { 
    name: 'Nadia', 
    bounds: { north: 23.800, south: 22.900, west: 88.000, east: 88.900 },
    population: '5.2 million',
    area: '3927 km²',
    type: 'District'
  },
  { 
    name: 'Kalimpong', 
    bounds: { north: 27.100, south: 26.800, west: 88.200, east: 88.900 },
    population: '0.25 million',
    area: '1054 km²',
    type: 'Hill District',
    note: 'Carved out of Darjeeling'
  }
];

// For backward compatibility, keep the old simplified list too
const WEST_BENGAL_DISTRICTS_SIMPLE = [
  'Kolkata',
  'North 24 Parganas',
  'South 24 Parganas',
  'Howrah',
  'Hooghly',
  'Purba Bardhaman',
  'Paschim Bardhaman',
  'Birbhum',
  'Bankura',
  'Purulia',
  'Jhargram',
  'West Midnapore',
  'East Midnapore',
  'Darjeeling',
  'Jalpaiguri',
  'Alipurduar',
  'Cooch Behar',
  'Uttar Dinajpur',
  'Dakshin Dinajpur',
  'Malda',
  'Murshidabad',
  'Nadia',
  'Kalimpong'
];

// District grouping for better organization
const WEST_BENGAL_REGIONS = {
  'Kolkata Metro': ['Kolkata', 'North 24 Parganas', 'South 24 Parganas', 'Howrah'],
  'South Bengal': ['Hooghly', 'Purba Bardhaman', 'Paschim Bardhaman', 'Birbhum', 'Bankura', 'Purulia'],
  'West Bengal Plains': ['Jhargram', 'West Midnapore', 'East Midnapore', 'Nadia', 'Murshidabad'],
  'North Bengal': ['Darjeeling', 'Jalpaiguri', 'Alipurduar', 'Cooch Behar', 'Uttar Dinajpur', 'Dakshin Dinajpur', 'Malda', 'Kalimpong']
};

// Major cities in West Bengal for quick access
const WEST_BENGAL_MAJOR_CITIES = [
  { name: 'Kolkata', coords: { latitude: 22.5726, longitude: 88.3639 } },
  { name: 'Howrah', coords: { latitude: 22.5958, longitude: 88.2636 } },
  { name: 'Durgapur', coords: { latitude: 23.5204, longitude: 87.3119 } },
  { name: 'Asansol', coords: { latitude: 23.6739, longitude: 86.9524 } },
  { name: 'Siliguri', coords: { latitude: 26.7271, longitude: 88.3953 } },
  { name: 'Darjeeling', coords: { latitude: 27.0360, longitude: 88.2627 } },
  { name: 'Malda', coords: { latitude: 25.0112, longitude: 88.1393 } },
  { name: 'Bardhaman', coords: { latitude: 23.2325, longitude: 87.8616 } },
  { name: 'Kharagpur', coords: { latitude: 22.3460, longitude: 87.2320 } },
  { name: 'Haldia', coords: { latitude: 22.0667, longitude: 88.0698 } },
  { name: 'Ranaghat', coords: { latitude: 23.1762, longitude: 88.5668 } },
  { name: 'Krishnanagar', coords: { latitude: 23.4058, longitude: 88.4907 } },
  { name: 'Berhampore', coords: { latitude: 24.1047, longitude: 88.2515 } },
  { name: 'Balurghat', coords: { latitude: 25.2207, longitude: 88.7774 } },
  { name: 'Jalpaiguri', coords: { latitude: 26.5167, longitude: 88.7333 } },
  { name: 'Purulia', coords: { latitude: 23.3333, longitude: 86.3667 } },
  { name: 'Bankura', coords: { latitude: 23.2325, longitude: 87.0746 } },
  { name: 'Suri', coords: { latitude: 23.9167, longitude: 87.5333 } },
  { name: 'Alipurduar', coords: { latitude: 26.4833, longitude: 89.5667 } },
  { name: 'Cooch Behar', coords: { latitude: 26.3167, longitude: 89.4333 } }
];

// Quick focus regions for West Bengal
const WEST_BENGAL_FOCUS_REGIONS = {
  'Greater Kolkata': { 
    center: { latitude: 22.574, longitude: 88.363 },
    latitudeDelta: 0.5,
    longitudeDelta: 0.5
  },
  'Bardhaman Division': {
    center: { latitude: 23.240, longitude: 87.860 },
    latitudeDelta: 1.5,
    longitudeDelta: 1.5
  },
  'North Bengal': {
    center: { latitude: 26.000, longitude: 88.500 },
    latitudeDelta: 3,
    longitudeDelta: 3
  },
  'South Bengal': {
    center: { latitude: 22.500, longitude: 87.500 },
    latitudeDelta: 2,
    longitudeDelta: 2
  },
  'Jungle Mahals': {
    center: { latitude: 22.800, longitude: 86.800 },
    latitudeDelta: 1.5,
    longitudeDelta: 1.5
  },
  'Sunderbans': {
    center: { latitude: 22.000, longitude: 88.800 },
    latitudeDelta: 1,
    longitudeDelta: 1
  }
};

// Helper function to get district by name
const getDistrictByName = (name) => {
  return WEST_BENGAL_DISTRICTS.find(district => district.name === name);
};

// Helper function to get districts by region
const getDistrictsByRegion = (regionName) => {
  return WEST_BENGAL_REGIONS[regionName] || [];
};

// Helper function to calculate district area from bounds (approximate)
const calculateDistrictArea = (bounds) => {
  // Simple approximation using bounds
  const latDiff = bounds.north - bounds.south;
  const lonDiff = bounds.east - bounds.west;
  // Approximate area in square kilometers
  // 1 degree latitude ≈ 111 km, 1 degree longitude varies by latitude
  const avgLat = (bounds.north + bounds.south) / 2;
  const kmPerDegreeLon = 111.32 * Math.cos(avgLat * Math.PI / 180);
  
  const areaKm = latDiff * 111.32 * lonDiff * kmPerDegreeLon;
  return Math.round(areaKm);
};

// Update district areas with calculations
WEST_BENGAL_DISTRICTS.forEach(district => {
  if (!district.area) {
    district.area = `${calculateDistrictArea(district.bounds)} km²`;
  }
});

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
  const [zoomLevel, setZoomLevel] = useState(12);
  const [downloadQuality, setDownloadQuality] = useState('medium');
  const [estimatedSize, setEstimatedSize] = useState('0 MB');
  const [activeDownload, setActiveDownload] = useState(null);
  const [downloadHistory, setDownloadHistory] = useState([]);
  const [showDistrictSelection, setShowDistrictSelection] = useState(false);
  const [selectedDistricts, setSelectedDistricts] = useState([]);
  const [downloadMode, setDownloadMode] = useState('region'); // 'region' or 'district'

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
  }, [selectedRegions, selectedDistricts, zoomLevel, downloadQuality, downloadMode]);

  const calculateEstimatedSize = () => {
    let totalTiles = 0;
    const zoomLevels = getZoomLevels();

    if (downloadMode === 'region') {
      selectedRegions.forEach(regionName => {
        const region = REGION_OPTIONS.find(r => r.name === regionName);
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
    } else {
      selectedDistricts.forEach(districtName => {
        const district = WEST_BENGAL_DISTRICTS.find(d => d.name === districtName);
        if (district) {
          zoomLevels.forEach(z => {
            const xStart = lon2tile(district.bounds.west, z);
            const xEnd = lon2tile(district.bounds.east, z);
            const yStart = lat2tile(district.bounds.north, z);
            const yEnd = lat2tile(district.bounds.south, z);
            totalTiles += (xEnd - xStart + 1) * (yEnd - yStart + 1);
          });
        }
      });
    }

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

  const downloadMap = async () => {
    if (downloadMode === 'region' && selectedRegions.length === 0) {
      Alert.alert('Select Regions', 'Please select at least one region to download.');
      return;
    }

    if (downloadMode === 'district' && selectedDistricts.length === 0) {
      Alert.alert('Select Districts', 'Please select at least one district to download.');
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

    if (downloadMode === 'region') {
      selectedRegions.forEach(regionName => {
        const region = REGION_OPTIONS.find(r => r.name === regionName);
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
    } else {
      selectedDistricts.forEach(districtName => {
        const district = WEST_BENGAL_DISTRICTS.find(d => d.name === districtName);
        if (district) {
          zoomLevels.forEach(z => {
            const xStart = lon2tile(district.bounds.west, z);
            const xEnd = lon2tile(district.bounds.east, z);
            const yStart = lat2tile(district.bounds.north, z);
            const yEnd = lat2tile(district.bounds.south, z);
            totalTilesCount += (xEnd - xStart + 1) * (yEnd - yStart + 1);
          });
        }
      });
    }

    setTotalTiles(totalTilesCount);

    const downloadStartTime = Date.now();
    const downloadId = `download_${downloadStartTime}`;
    setActiveDownload({
      id: downloadId,
      type: downloadMode,
      items: downloadMode === 'region' ? selectedRegions : selectedDistricts,
      startTime: downloadStartTime,
      totalTiles: totalTilesCount
    });

    try {
      if (downloadMode === 'region') {
        for (const regionName of selectedRegions) {
          const region = REGION_OPTIONS.find(r => r.name === regionName);
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
                      headers: { 'User-Agent': 'MapDownloader/1.0' },
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
      } else {
        for (const districtName of selectedDistricts) {
          const district = WEST_BENGAL_DISTRICTS.find(d => d.name === districtName);
          if (!district) continue;

          for (let z of zoomLevels) {
            const xStart = lon2tile(district.bounds.west, z);
            const xEnd = lon2tile(district.bounds.east, z);
            const yStart = lat2tile(district.bounds.north, z);
            const yEnd = lat2tile(district.bounds.south, z);

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
                      headers: { 'User-Agent': 'MapDownloader/1.0' },
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
                
                await new Promise(r => setTimeout(r, 20));
              }
            }
          }
        }
      }

      const downloadEndTime = Date.now();
      const downloadDuration = Math.round((downloadEndTime - downloadStartTime) / 1000);
      
      const downloadInfo = {
        id: downloadId,
        type: downloadMode,
        items: downloadMode === 'region' ? selectedRegions : selectedDistricts,
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
        `Successfully downloaded ${downloadedCount} tiles.\n\nEstimated size: ${estimatedSize}\nTime taken: ${downloadDuration} seconds`,
        [{ text: 'OK' }]
      );
      
      if (downloadMode === 'region') {
        setSelectedRegions([]);
      } else {
        setSelectedDistricts([]);
      }
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

  const toggleDistrict = (districtName) => {
    setSelectedDistricts(prev => 
      prev.includes(districtName)
        ? prev.filter(d => d !== districtName)
        : [...prev, districtName]
    );
  };

  const selectAllRegions = () => {
    if (downloadMode === 'region') {
      setSelectedRegions(REGION_OPTIONS.map(r => r.name));
    } else {
      setSelectedDistricts(WEST_BENGAL_DISTRICTS.map(d => d.name));
    }
  };

  const clearAllSelections = () => {
    if (downloadMode === 'region') {
      setSelectedRegions([]);
    } else {
      setSelectedDistricts([]);
    }
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

  const focusOnWestBengal = () => {
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: 23.5,
        longitude: 87.5,
        latitudeDelta: 6,
        longitudeDelta: 6,
      }, 1000);
    }
  };

  const focusOnDistrict = (districtName) => {
    const district = WEST_BENGAL_DISTRICTS.find(d => d.name === districtName);
    if (district && mapRef.current) {
      const latDelta = district.bounds.north - district.bounds.south;
      const lngDelta = district.bounds.east - district.bounds.west;
      const centerLat = (district.bounds.north + district.bounds.south) / 2;
      const centerLng = (district.bounds.east + district.bounds.west) / 2;
      
      mapRef.current.animateToRegion({
        latitude: centerLat,
        longitude: centerLng,
        latitudeDelta: latDelta * 1.2,
        longitudeDelta: lngDelta * 1.2,
      }, 1000);
    }
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

  const handleActionPress = useCallback((name) => {
    switch (name) {
      case 'toggleEdit':
        setEditing(!editing);
        break;
      case 'finalizePolygon':
        finalizePolygon();
        break;
      case 'clear':
        clearNewPolygon();
        break;
      case 'undoMark':
        undoMark();
        break;
      case 'downloadMap':
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
      case 'focusWestBengal':
        focusOnWestBengal();
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
        text: 'Download Map',
        name: 'downloadMap',
        position: 5,
        color: '#3498DB',
        icon: <Icon name="download" size={24} color="white" />,
      },
      {
        text: 'Focus West Bengal',
        name: 'focusWestBengal',
        position: 6,
        color: '#9B59B6',
        icon: <Icon name="my-location" size={24} color="white" />,
      },
      {
        text: 'Storage Info',
        name: 'storageInfo',
        position: 7,
        color: '#E67E22',
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
          position: 8,
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

  const renderDownloadModal = () => {
    return (
      <Modal
        visible={showDownloadModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDownloadModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Download Offline Map</Text>
              <TouchableOpacity onPress={() => setShowDownloadModal(false)}>
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.sectionTitle}>Download Mode</Text>
              <View style={styles.modeSelector}>
                <TouchableOpacity
                  style={[
                    styles.modeButton,
                    downloadMode === 'region' && styles.modeButtonSelected
                  ]}
                  onPress={() => {
                    setDownloadMode('region');
                    setShowDistrictSelection(false);
                  }}
                >
                  <Icon 
                    name="public" 
                    size={20} 
                    color={downloadMode === 'region' ? 'white' : '#666'} 
                  />
                  <Text style={[
                    styles.modeButtonText,
                    downloadMode === 'region' && styles.modeButtonTextSelected
                  ]}>
                    Regions
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.modeButton,
                    downloadMode === 'district' && styles.modeButtonSelected
                  ]}
                  onPress={() => {
                    setDownloadMode('district');
                    setShowDistrictSelection(true);
                  }}
                >
                  <Icon 
                    name="location-city" 
                    size={20} 
                    color={downloadMode === 'district' ? 'white' : '#666'} 
                  />
                  <Text style={[
                    styles.modeButtonText,
                    downloadMode === 'district' && styles.modeButtonTextSelected
                  ]}>
                    West Bengal Districts
                  </Text>
                </TouchableOpacity>
              </View>

              {downloadMode === 'region' ? (
                <>
                  <Text style={styles.sectionTitle}>Select Regions</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.regionGrid}>
                      {REGION_OPTIONS.map(region => (
                        <TouchableOpacity
                          key={region.name}
                          style={[
                            styles.regionButton,
                            selectedRegions.includes(region.name) && styles.regionButtonSelected
                          ]}
                          onPress={() => toggleRegion(region.name)}
                        >
                          <Icon 
                            name={region.icon} 
                            size={20} 
                            color={selectedRegions.includes(region.name) ? 'white' : '#666'} 
                          />
                          <Text style={[
                            styles.regionButtonText,
                            selectedRegions.includes(region.name) && styles.regionButtonTextSelected
                          ]}>
                            {region.name}
                          </Text>
                          <Text style={[
                            styles.regionDescription,
                            selectedRegions.includes(region.name) && styles.regionDescriptionSelected
                          ]}>
                            {region.description}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </>
              ) : (
                <>
                  <Text style={styles.sectionTitle}>Select West Bengal Districts</Text>
                  <View style={styles.districtGrid}>
                    {WEST_BENGAL_DISTRICTS.map(district => (
                      <TouchableOpacity
                        key={district.name}
                        style={[
                          styles.districtButton,
                          selectedDistricts.includes(district.name) && styles.districtButtonSelected
                        ]}
                        onPress={() => toggleDistrict(district.name)}
                        onLongPress={() => focusOnDistrict(district.name)}
                      >
                        <Text style={[
                          styles.districtButtonText,
                          selectedDistricts.includes(district.name) && styles.districtButtonTextSelected
                        ]}>
                          {district.name}
                        </Text>
                        <Icon 
                          name="zoom-in" 
                          size={16} 
                          color={selectedDistricts.includes(district.name) ? 'white' : '#999'} 
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}

              <View style={styles.selectionActions}>
                <TouchableOpacity style={styles.actionButton} onPress={selectAllRegions}>
                  <Icon name="select-all" size={20} color="#333" />
                  <Text style={styles.actionButtonText}>Select All</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={clearAllSelections}>
                  <Icon name="clear-all" size={20} color="#333" />
                  <Text style={styles.actionButtonText}>Clear All</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.sectionTitle}>Zoom Level: {zoomLevel}</Text>
              <Slider
                style={styles.slider}
                minimumValue={8}
                maximumValue={16}
                step={1}
                value={zoomLevel}
                onValueChange={setZoomLevel}
                minimumTrackTintColor={Colors.useGreen}
                maximumTrackTintColor="#ddd"
                thumbTintColor={Colors.useGreen}
              />
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabel}>Street Level (8)</Text>
                <Text style={styles.sliderLabel}>City Level (12)</Text>
                <Text style={styles.sliderLabel}>Building Level (16)</Text>
              </View>

              <Text style={styles.sectionTitle}>Download Quality</Text>
              <View style={styles.qualitySelector}>
                {[
                  { key: 'low', label: 'Low', icon: 'speed' },
                  { key: 'medium', label: 'Medium', icon: 'equalizer' },
                  { key: 'high', label: 'High', icon: 'high-quality' }
                ].map(quality => (
                  <TouchableOpacity
                    key={quality.key}
                    style={[
                      styles.qualityButton,
                      downloadQuality === quality.key && styles.qualityButtonSelected
                    ]}
                    onPress={() => setDownloadQuality(quality.key)}
                  >
                    <Icon 
                      name={quality.icon} 
                      size={20} 
                      color={downloadQuality === quality.key ? 'white' : '#666'} 
                    />
                    <Text style={[
                      styles.qualityButtonText,
                      downloadQuality === quality.key && styles.qualityButtonTextSelected
                    ]}>
                      {quality.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.infoContainer}>
                <View style={styles.infoRow}>
                  <Icon name="info" size={20} color="#3498DB" />
                  <Text style={styles.infoText}>
                    Selected: {downloadMode === 'region' ? selectedRegions.length : selectedDistricts.length} items
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
                {downloadMode === 'district' && (
                  <View style={styles.infoRow}>
                    <Icon name="touch-app" size={20} color="#3498DB" />
                    <Text style={styles.infoText}>
                      Tip: Long press district to view on map
                    </Text>
                  </View>
                )}
              </View>

              <Text style={styles.note}>
                Note: Download requires stable internet connection. 
                For large downloads, use Wi-Fi connection. 
                Downloads will continue in background.
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
                  ((downloadMode === 'region' && selectedRegions.length === 0) ||
                   (downloadMode === 'district' && selectedDistricts.length === 0)) && 
                  styles.downloadButtonDisabled
                ]}
                onPress={downloadMap}
                disabled={
                  (downloadMode === 'region' && selectedRegions.length === 0) ||
                  (downloadMode === 'district' && selectedDistricts.length === 0)
                }
              >
                <Icon name="download" size={20} color="white" />
                <Text style={styles.downloadButtonText}>
                  Download ({estimatedSize})
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      {renderDownloadModal()}

      {downloading && (
        <View style={styles.downloadOverlay}>
          <LoadingScreen />
          <View style={styles.progressContainer}>
            <Text style={styles.progressTitle}>
              Downloading {downloadMode === 'region' ? 'Regions' : 'Districts'}
            </Text>
            <Text style={styles.progressText}>
              Progress: {Math.round(downloadProgress)}% ({downloadedTiles}/{totalTiles} tiles)
            </Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${downloadProgress}%` }]} />
            </View>
            <Text style={styles.downloadDetails}>
              {downloadMode === 'region' 
                ? `Regions: ${selectedRegions.join(', ')}`
                : `Districts: ${selectedDistricts.join(', ')}`
              }
            </Text>
            <Text style={styles.noteText}>
              Downloading... Do not close the app
            </Text>
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
        onPress={handleMapPress}
        onRegionChangeComplete={handleRegionChangeComplete}
        initialRegion={{
          latitude: 22.9868,
          longitude: 87.8550,
          latitudeDelta: 10,
          longitudeDelta: 10,
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
        {/* 
        
         */}
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
                `${new Date(d.date).toLocaleDateString()}: ${d.type === 'region' ? 'Regions' : 'Districts'}: ${d.items.join(', ')} (${d.tilesDownloaded} tiles)`
              ).join('\n\n')
            );
          }}
        >
          <Icon name="history" size={20} color="white" />
          <Text style={styles.historyText}>{downloadHistory.length}</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.westBengalButton}
        onPress={focusOnWestBengal}
      >
        <Icon name="location-city" size={20} color="white" />
        <Text style={styles.westBengalText}>WB</Text>
      </TouchableOpacity>

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
    maxHeight: '90%',
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
  modeSelector: {
    flexDirection: 'row',
    marginVertical: 10,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginHorizontal: 5,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  modeButtonSelected: {
    backgroundColor: Colors.useGreen,
    borderColor: Colors.useGreen,
  },
  modeButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    marginLeft: 8,
  },
  modeButtonTextSelected: {
    color: 'white',
  },
  regionGrid: {
    flexDirection: 'row',
    paddingVertical: 10,
  },
  regionButton: {
    width: 180,
    padding: 15,
    marginRight: 10,
    borderRadius: 10,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    alignItems: 'center',
  },
  regionButtonSelected: {
    backgroundColor: Colors.useGreen,
    borderColor: Colors.useGreen,
  },
  regionButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4,
  },
  regionButtonTextSelected: {
    color: 'white',
  },
  regionDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 14,
  },
  regionDescriptionSelected: {
    color: 'rgba(255,255,255,0.9)',
  },
  districtGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  districtButton: {
    width: '30%',
    padding: 10,
    margin: 5,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  districtButtonSelected: {
    backgroundColor: '#3498DB',
    borderColor: '#3498DB',
  },
  districtButtonText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
    flex: 1,
  },
  districtButtonTextSelected: {
    color: 'white',
  },
  selectionActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 15,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  actionButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    marginLeft: 8,
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
  sliderLabel: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  qualitySelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 15,
  },
  qualityButton: {
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
    width: '30%',
  },
  qualityButtonSelected: {
    backgroundColor: Colors.useGreen,
    borderColor: Colors.useGreen,
  },
  qualityButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    marginTop: 8,
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
  westBengalButton: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    backgroundColor: 'rgba(231, 76, 60, 0.8)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 999,
  },
  westBengalText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 4,
  },
});