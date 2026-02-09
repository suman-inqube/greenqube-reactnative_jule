import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  TouchableOpacity,
  Text,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import MapView, {
  Polygon,
  Marker,
  Callout,
  PROVIDER_GOOGLE,
  MAP_TYPES,
  LocalTile,
} from 'react-native-maps';
import { getItem } from '../../../config/getDataFromStorage';
import Geolocation from '@react-native-community/geolocation';
import { Colors } from '../../utils/Constants';
import { getDistance } from 'geolib';
import * as geolib from 'geolib';
import { isWithin20Meters } from '../../Common/calculateAreaFun';
import RNFS from 'react-native-fs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import NetInfo from '@react-native-community/netinfo';
import SuggestiveSearchInput from '../../Common/SuggestiveSearchInput';
import { getMapLocation } from '../../../config/apiHere';
import LoadingScreen from '../../Common/LoadingScreen';
import FloatingActionButton from '../../Components/FloatingActionButton';

// Sleep helper function (this fixes your error)
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const GOOGLE_PLACES_API_KEY = 'AIzaSyDZUR2UHEteHVQgwiGA7XJNOV5lHe0r8m4';

const TILE_DIR = `${RNFS.DocumentDirectoryPath}/offline_tiles`;
const SATELLITE_DIR = `${RNFS.DocumentDirectoryPath}/satellite_tiles`;

const TILE_PROVIDERS = {
  standard: {
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    extension: 'png',
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    extension: 'jpg',
  },
};

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
  isLoading,
}) {
  const mapRef = useRef(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [drawingReference, setDrawingReference] = useState(null);
  const [distanceThreshold] = useState(20);
  const [marker, setMarker] = useState({ lat: 0, lng: 0 });
  const [selectedArea, setSelectedArea] = useState(0);
  const [coordinatesCurrent, setCoordinatesCurrent] = useState([]);

  // Offline / Online Mode
  const [isOffline, setIsOffline] = useState(false);
  const [tilesAvailable, setTilesAvailable] = useState(false);
  const [satelliteTilesAvailable, setSatelliteTilesAvailable] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [totalTilesToDownload, setTotalTilesToDownload] = useState(0);
  const [useSatelliteOffline, setUseSatelliteOffline] = useState(true); // true = satellite, false = standard

  const [region, setRegion] = useState({
    latitude: baselatLong?.latitude || 22.5726,
    longitude: baselatLong?.longitude || 88.3639,
    latitudeDelta: 0.08,   // wider view by default
    longitudeDelta: 0.08,
  });

  // ─── Tile Helpers ──────────────────────────────────────────────────
  const getTileXYZ = (lat, lon, zoom) => {
    const x = Math.floor(((lon + 180) / 360) * Math.pow(2, zoom));
    const y = Math.floor(
      ((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2) *
        Math.pow(2, zoom)
    );
    return { x, y, z: zoom };
  };

  const calculateTilesCount = (bbox, minZoom, maxZoom) => {
    let total = 0;
    for (let z = minZoom; z <= maxZoom; z++) {
      const tl = getTileXYZ(bbox.maxLat, bbox.minLon, z);
      const br = getTileXYZ(bbox.minLat, bbox.maxLon, z);
      total += (br.x - tl.x + 1) * (br.y - tl.y + 1);
    }
    return total;
  };

  const downloadOfflineTiles = async () => {
    if (isOffline) {
      Alert.alert('Offline', 'Please connect to internet to download map.');
      return;
    }

    setIsDownloading(true);
    setDownloadProgress(0);

    const bbox = {
      maxLat: region.latitude + region.latitudeDelta / 2,
      minLat: region.latitude - region.latitudeDelta / 2,
      minLon: region.longitude - region.longitudeDelta / 2,
      maxLon: region.longitude + region.longitudeDelta / 2,
    };

    const minZoom = 12;
    const maxZoom = 16; // good balance for offline use
    const total = calculateTilesCount(bbox, minZoom, maxZoom);
    setTotalTilesToDownload(total);

    let count = 0;
    const provider = useSatelliteOffline ? TILE_PROVIDERS.satellite : TILE_PROVIDERS.standard;
    const baseDir = useSatelliteOffline ? SATELLITE_DIR : TILE_DIR;
    const ext = provider.extension;

    try {
      for (let z = minZoom; z <= maxZoom; z++) {
        const tl = getTileXYZ(bbox.maxLat, bbox.minLon, z);
        const br = getTileXYZ(bbox.minLat, bbox.maxLon, z);

        for (let x = tl.x; x <= br.x; x++) {
          for (let y = tl.y; y <= br.y; y++) {
            const folder = `${baseDir}/${z}/${x}`;
            const file = `${folder}/${y}.${ext}`;

            const url = provider.url.replace('{z}', z).replace('{x}', x).replace('{y}', y);

            await RNFS.mkdir(folder);

            if (!(await RNFS.exists(file))) {
              await RNFS.downloadFile({
                fromUrl: url,
                toFile: file,
                headers: { 'User-Agent': 'MyApp/1.0' },
              }).promise;
            }

            count++;
            setDownloadProgress(count);
            await sleep(350); // polite delay to avoid rate limit
          }
        }
      }

      await checkOfflineTiles();
      Alert.alert('Success', `Downloaded ${count} tiles successfully`);
    } catch (err) {
      console.error('Download error:', err);
      Alert.alert('Download Failed', err.message || 'Something went wrong');
    } finally {
      setIsDownloading(false);
    }
  };

  const checkOfflineTiles = async () => {
    try {
      const std = await RNFS.readDir(TILE_DIR);
      const sat = await RNFS.readDir(SATELLITE_DIR);
      setTilesAvailable(std.length > 0);
      setSatelliteTilesAvailable(sat.length > 0);
    } catch {
      setTilesAvailable(false);
      setSatelliteTilesAvailable(false);
    }
  };

  const getOfflineTilePath = () => {
    if (useSatelliteOffline && satelliteTilesAvailable) {
      return `${SATELLITE_DIR}/{z}/{x}/{y}.jpg`;
    }
    if (tilesAvailable) {
      return `${TILE_DIR}/{z}/{x}/{y}.png`;
    }
    return null;
  };

  // ─── Network & Init ────────────────────────────────────────────────
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOffline(!state.isConnected);
    });

    checkOfflineTiles();

    return () => unsubscribe();
  }, []);

  // ─── Initial Location & Zoom ──────────────────────────────────────
  useEffect(() => {
    const onPageLoad = async () => {
      let lat = baselatLong?.latitude || 22.5726;
      let lng = baselatLong?.longitude || 88.3639;

      if (location?.length && location[0]?.latitude && location[0]?.longitude) {
        lat = parseFloat(location[0].latitude);
        lng = parseFloat(location[0].longitude);
      }

      // When offline and tiles exist → use wider zoom for downloaded area
      const targetDelta = isOffline && (tilesAvailable || satelliteTilesAvailable) ? 0.12 : 0.05;

      animateToLocation(lat, lng, targetDelta);
    };

    onPageLoad();
  }, [baselatLong, location, isOffline, tilesAvailable, satelliteTilesAvailable]);

  const animateToLocation = (latitude, longitude, delta = 0.05) => {
    if (mapRef.current && !isNaN(latitude) && !isNaN(longitude)) {
      setTimeout(() => {
        mapRef.current.animateToRegion(
          {
            latitude,
            longitude,
            latitudeDelta: delta,
            longitudeDelta: delta,
          },
          1200
        );
      }, 200);
    }
  };

  // ─── Area Calculation ──────────────────────────────────────────────
  useEffect(() => {
    if (newPolygon.length > 2) {
      const rawArea = geolib.getAreaOfPolygon(newPolygon);
      if (landUnitsquareMetre?.[0]?.defined_unit_value) {
        setSelectedArea(Number(landUnitsquareMetre[0].defined_unit_value) * rawArea);
      } else {
        setSelectedArea(rawArea);
      }
    } else {
      setSelectedArea(0);
    }
  }, [newPolygon, landUnitsquareMetre]);

  // ─── Actions for Floating Button ──────────────────────────────────
  const actions = useMemo(() => {
    const base = [
      {
        text: editing ? 'Stop Editing' : 'Start Editing',
        icon: require('../../Common/images/editing.png'),
        name: 'toggleEdit',
        position: 1,
        color: Colors.useGreen,
      },
    ];

    if (editing) {
      base.push(
        { text: 'Finalize', icon: require('../../Common/images/check.png'), name: 'finalizePolygon', position: 2, color: Colors.useGreen },
        { text: 'Clear', icon: require('../../Common/images/bin.png'), name: 'clear', position: 3, color: Colors.useGreen },
        { text: 'Undo', icon: require('../../Common/images/undo.png'), name: 'undoMark', position: 4, color: Colors.useGreen },
      );
    }

    return base;
  }, [editing]);

  const handleActionPress = useCallback((name) => {
    switch (name) {
      case 'toggleEdit': setEditing(!editing); break;
      case 'finalizePolygon': finalizePolygon(); break;
      case 'clear': clearNewPolygon(); break;
      case 'undoMark': undoMark(); break;
      default: console.log('Action:', name);
    }
  }, [editing, setEditing, finalizePolygon, clearNewPolygon, undoMark]);

  return (
    <View style={styles.container}>
      {isLoading && (
        <View style={styles.loaderOverlay}>
          <LoadingScreen />
        </View>
      )}

      {/* Download button - visible only when online */}
      {!isOffline && (
        <TouchableOpacity
          style={styles.downloadButton}
          onPress={downloadOfflineTiles}
          disabled={isDownloading}
        >
          <Icon name="cloud-download" size={24} color="#fff" />
          <Text style={{ color: '#fff', marginLeft: 8, fontSize: 14 }}>
            {isDownloading ? 'Downloading...' : 'Download Map'}
          </Text>
        </TouchableOpacity>
      )}

      {/* Download progress overlay */}
      {isDownloading && (
        <View style={styles.downloadOverlay}>
          <ActivityIndicator size="large" color={Colors.useGreen} />
          <Text style={styles.downloadText}>
            Downloading tiles... {downloadProgress} / {totalTilesToDownload}
          </Text>
          <Text style={{ color: '#fff', fontSize: 16 }}>
            {totalTilesToDownload > 0 ? Math.round((downloadProgress / totalTilesToDownload) * 100) : 0}%
          </Text>
        </View>
      )}

      {/* No tiles warning when offline */}
      {isOffline && !tilesAvailable && !satelliteTilesAvailable && (
        <View style={styles.noTilesOverlay}>
          <Icon name="cloud-off" size={60} color="#fff" />
          <Text style={styles.noTilesText}>No offline map available</Text>
          <Text style={{ color: '#ddd', marginTop: 8, textAlign: 'center' }}>
            Connect to internet and download the map first
          </Text>
        </View>
      )}

      <TouchableOpacity style={styles.searchIcon} onPress={() => setShowModal(false)}>
        <Image source={require('../../Common/images/cross100.png')} style={{ width: 35, height: 35 }} />
      </TouchableOpacity>

      <MapView
        ref={mapRef}
        style={styles.map}
        provider={isOffline ? undefined : PROVIDER_GOOGLE}
        mapType={isOffline ? MAP_TYPES.NONE : 'hybrid'}
        region={region}
        onRegionChangeComplete={(r) => {
          setRegion(r);
          handleRegionChangeComplete?.(r);
        }}
        onPress={(e) => {
          if (!isDownloading) {
            handleMapPress(e);
          }
        }}
        showsUserLocation={true}
        showsMyLocationButton={true}
        minZoomLevel={10}
        maxZoomLevel={18}
        zoomEnabled={true}
        zoomControlEnabled={true}
        rotateEnabled={false}
      >
        {/* Offline tiles layer */}
        {isOffline && getOfflineTilePath() && (
          <LocalTile
            pathTemplate={getOfflineTilePath()}
            tileSize={256}
            zIndex={-1}
          />
        )}

        {/* Your existing map features */}
        {polygons.map((polygon, index) => {
          if (polygon.length >= 3) {
            return (
              <Polygon
                key={index}
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

        {newPolygon.map((coord, index) => (
          <Marker key={index} coordinate={coord} />
        ))}

        <Marker coordinate={{ latitude: marker.lat, longitude: marker.lng }} />
      </MapView>

      {selectedArea !== 0 && (
        <View style={styles.areaInfo}>
          <Text style={styles.areaText}>
            Area: {selectedArea.toFixed(2)}{' '}
            {landAreaUnit?.[0]?.defined_unit_value ? landAreaUnit[0].unit_name : 'm²'}
          </Text>
        </View>
      )}

      <View style={styles.searchContainer}>
        <SuggestiveSearchInput
          fetchSuggestions={async (query) => {
            const res = await getMapLocation(query);
            return res?.data?.features || [];
          }}
          onSelect={(item) => {
            setMarker({ lat: item?.lat, lng: item?.lng });
            animateToLocation(item?.lat, item?.lng);
          }}
        />
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { ...StyleSheet.absoluteFillObject },
  searchIcon: {
    position: 'absolute',
    top: 12,
    left: 10,
    zIndex: 999,
    backgroundColor: '#e6dfdf',
    borderRadius: 20,
    padding: 4,
  },
  searchContainer: {
    position: 'absolute',
    top: 10,
    width: '80%',
    alignSelf: 'center',
    zIndex: 999,
  },
  areaInfo: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  areaText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  downloadButton: {
    position: 'absolute',
    top: 60,
    right: 16,
    backgroundColor: Colors.useGreen,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 999,
    elevation: 5,
  },
  downloadOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  downloadText: { color: '#fff', fontSize: 18, marginTop: 16, marginBottom: 8 },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  noTilesOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 998,
  },
  noTilesText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
  },
});