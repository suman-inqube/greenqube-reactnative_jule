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
} from 'react-native';

import MapView, {
  PROVIDER_GOOGLE,
  MAP_TYPES,
  LocalTile,
  Marker,
  Polygon,
  Callout,
} from 'react-native-maps';

import NetInfo from '@react-native-community/netinfo';
import Geolocation from '@react-native-community/geolocation';
import RNFS from 'react-native-fs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Slider from '@react-native-community/slider';

/* ================= CONFIG ================= */
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

const USER_AGENT = 'MyOfflineMapApp/1.0 (contact@example.com)';

/* ================= HELPERS ================= */
const getTileXYZ = (lat, lon, zoom) => {
  const x = Math.floor(((lon + 180) / 360) * Math.pow(2, zoom));
  const y = Math.floor(
    ((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2) *
      Math.pow(2, zoom)
  );
  return { x, y, z: zoom };
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/* ================= MAIN COMPONENT ================= */
export default function OfflineMapScreen() {
  const mapRef = useRef(null);
  const [offline, setOffline] = useState(false);
  const [tilesAvailable, setTilesAvailable] = useState(false);
  const [satelliteTilesAvailable, setSatelliteTilesAvailable] = useState(false);

  const [userLocation, setUserLocation] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [totalTiles, setTotalTiles] = useState(0);

  const [mapType, setMapType] = useState('hybrid');
  const [isSatelliteMode, setIsSatelliteMode] = useState(true);

  const [markers, setMarkers] = useState([]);
  const [editingMarker, setEditingMarker] = useState(null);

  const [polygons, setPolygons] = useState([]);
  const [currentPolygon, setCurrentPolygon] = useState([]);
  const [isDrawingPolygon, setIsDrawingPolygon] = useState(false);

  const [showMarkerModal, setShowMarkerModal] = useState(false);
  const [markerTitle, setMarkerTitle] = useState('');
  const [markerDescription, setMarkerDescription] = useState('');
  const [selectedMarkerCoord, setSelectedMarkerCoord] = useState(null);

  const [showPolygonModal, setShowPolygonModal] = useState(false);
  const [polygonTitle, setPolygonTitle] = useState('');

  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadZoomLevels, setDownloadZoomLevels] = useState({ min: 12, max: 15 });
  const [downloadMapType, setDownloadMapType] = useState('satellite');

  const [region, setRegion] = useState({
    latitude: 22.5726,
    longitude: 88.3639,
    latitudeDelta: 0.08,
    longitudeDelta: 0.08,
  });

  useEffect(() => {
    const init = async () => {
      try {
        if (!(await RNFS.exists(TILE_DIR))) await RNFS.mkdir(TILE_DIR);
        if (!(await RNFS.exists(SATELLITE_DIR))) await RNFS.mkdir(SATELLITE_DIR);
        await checkTiles();
      } catch (e) {
        console.warn('Directory creation error:', e);
      }
    };
    init();

    const unsubscribe = NetInfo.addEventListener((state) => {
      setOffline(!state.isConnected);
    });

    Geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation({ latitude, longitude });
        setRegion((prev) => ({ ...prev, latitude, longitude }));
      },
      (err) => console.warn('Geolocation error:', err),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );

    return () => unsubscribe();
  }, []);

  const checkTiles = async () => {
    try {
      const std = await RNFS.readDir(TILE_DIR);
      const sat = await RNFS.readDir(SATELLITE_DIR);
      setTilesAvailable(std.length > 0);
      setSatelliteTilesAvailable(sat.length > 0);
    } catch (e) {
      setTilesAvailable(false);
      setSatelliteTilesAvailable(false);
    }
  };

  const calculateTiles = (bbox, minZoom, maxZoom) => {
    let total = 0;
    for (let z = minZoom; z <= maxZoom; z++) {
      const tl = getTileXYZ(bbox.maxLat, bbox.minLon, z);
      const br = getTileXYZ(bbox.minLat, bbox.maxLon, z);
      total += (br.x - tl.x + 1) * (br.y - tl.y + 1);
    }
    return total;
  };

  const handleMapPress = (event) => {
    const { coordinate } = event.nativeEvent;
    if (isDrawingPolygon) {
      setCurrentPolygon((prev) => [...prev, coordinate]);
      return;
    }
    setSelectedMarkerCoord(coordinate);
    setShowMarkerModal(true);
  };

  const downloadTiles = async () => {
    if (offline) {
      Alert.alert('No Internet', 'Please connect to internet to download tiles.');
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

    let count = 0;
    let errors = 0;

    try {
      const provider = TILE_PROVIDERS[downloadMapType];
      const ext = provider.extension;
      const baseDir = downloadMapType === 'standard' ? TILE_DIR : SATELLITE_DIR;

      for (let z = min; z <= max; z++) {
        const tl = getTileXYZ(bbox.maxLat, bbox.minLon, z);
        const br = getTileXYZ(bbox.minLat, bbox.maxLon, z);

        for (let x = tl.x; x <= br.x; x++) {
          for (let y = tl.y; y <= br.y; y++) {
            const folder = `${baseDir}/${z}/${x}`;
            const file = `${folder}/${y}.${ext}`;

            const url = provider.url.replace('{z}', z).replace('{x}', x).replace('{y}', y);

            await RNFS.mkdir(folder);

            if (!(await RNFS.exists(file))) {
              try {
                await RNFS.downloadFile({
                  fromUrl: url,
                  toFile: file,
                  headers: { 'User-Agent': USER_AGENT },
                }).promise;
              } catch (e) {
                errors++;
              }
            }

            count++;
            setProgress(count);
            await sleep(400); // Respectful delay to avoid rate limiting
          }
        }
      }

      await checkTiles();
      Alert.alert('Success', `Downloaded ${count} tiles (Errors: ${errors})`);
    } catch (err) {
      Alert.alert('Download Failed', err.message || 'Unknown error');
    } finally {
      setIsDownloading(false);
      setShowDownloadModal(false);
    }
  };

  const startDownload = () => {
    const total = calculateTiles(
      {
        maxLat: region.latitude + region.latitudeDelta / 2,
        minLat: region.latitude - region.latitudeDelta / 2,
        minLon: region.longitude - region.longitudeDelta / 2,
        maxLon: region.longitude + region.longitudeDelta / 2,
      },
      downloadZoomLevels.min,
      downloadZoomLevels.max
    );
    const estMB = Math.round((total * 65) / 1024);

    Alert.alert(
      'Download Offline Map',
      `Estimated: ${total} tiles (~${estMB} MB)\nZoom: ${downloadZoomLevels.min}–${downloadZoomLevels.max}\nType: ${downloadMapType.toUpperCase()}\n\nContinue?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Download', onPress: downloadTiles },
      ]
    );
  };

  const toggleMapType = () => {
    setIsSatelliteMode((prev) => !prev);
    setMapType((prev) => (prev === 'standard' ? 'hybrid' : 'standard'));
  };

  const getTilePath = () => {
    if (!offline) return null;
    if (isSatelliteMode && satelliteTilesAvailable) {
      return `${SATELLITE_DIR}/{z}/{x}/{y}.jpg`;
    }
    if (tilesAvailable) {
      return `${TILE_DIR}/{z}/{x}/{y}.png`;
    }
    return null;
  };

  const saveMarker = () => {
    if (!selectedMarkerCoord) return;

    if (editingMarker) {
      setMarkers((prev) =>
        prev.map((m) =>
          m.id === editingMarker.id
            ? { ...m, title: markerTitle || 'Unnamed', description: markerDescription }
            : m
        )
      );
      setEditingMarker(null);
    } else {
      const newMarker = {
        id: Date.now().toString(),
        latitude: selectedMarkerCoord.latitude,
        longitude: selectedMarkerCoord.longitude,
        title: markerTitle || `Marker ${markers.length + 1}`,
        description: markerDescription || '',
        color: '#2196F3',
      };
      setMarkers((prev) => [...prev, newMarker]);
    }

    setShowMarkerModal(false);
    setMarkerTitle('');
    setMarkerDescription('');
    setSelectedMarkerCoord(null);
  };

  const handleMarkerPress = (marker) => {
    Alert.alert(
      marker.title || 'Marker',
      marker.description || 'No description',
      [
        { text: 'Close' },
        {
          text: 'Edit',
          onPress: () => {
            setEditingMarker(marker);
            setMarkerTitle(marker.title);
            setMarkerDescription(marker.description);
            setShowMarkerModal(true);
          },
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => setMarkers((prev) => prev.filter((m) => m.id !== marker.id)),
        },
      ]
    );
  };

  const startDrawingPolygon = () => {
    setIsDrawingPolygon(true);
    setCurrentPolygon([]);
    Alert.alert('Draw Area', 'Tap on map to add points\nLong press anywhere to finish');
  };

  const finishPolygon = () => {
    if (currentPolygon.length < 3) {
      Alert.alert('Error', 'Need at least 3 points');
      return;
    }
    setShowPolygonModal(true);
  };

  const savePolygon = () => {
    if (!polygonTitle.trim()) {
      Alert.alert('Error', 'Please enter area name');
      return;
    }

    const center = currentPolygon.reduce(
      (acc, c) => ({
        latitude: acc.latitude + c.latitude / currentPolygon.length,
        longitude: acc.longitude + c.longitude / currentPolygon.length,
      }),
      { latitude: 0, longitude: 0 }
    );

    const newPoly = {
      id: Date.now().toString(),
      coordinates: [...currentPolygon, currentPolygon[0]],
      title: polygonTitle.trim(),
      center,
      strokeColor: '#FF4444',
      fillColor: '#FF444433',
      strokeWidth: 3,
    };

    setPolygons((prev) => [...prev, newPoly]);
    setShowPolygonModal(false);
    setCurrentPolygon([]);
    setIsDrawingPolygon(false);
    setPolygonTitle('');
  };

  const clearAll = () => {
    Alert.alert('Clear All', 'Remove all markers and polygons?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: () => {
          setMarkers([]);
          setPolygons([]);
          setCurrentPolygon([]);
          setIsDrawingPolygon(false);
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        provider={offline ? undefined : PROVIDER_GOOGLE}
        mapType={offline ? MAP_TYPES.NONE : mapType}
        showsUserLocation={true}
        showsMyLocationButton={true}
        region={region}
        onRegionChangeComplete={setRegion}
        onPress={handleMapPress}
        onLongPress={() => isDrawingPolygon && currentPolygon.length >= 3 && finishPolygon()}
        minZoomLevel={10}
        maxZoomLevel={18}
      >
        {offline && getTilePath() && (
          <LocalTile pathTemplate={getTilePath()} tileSize={256} zIndex={-1} />
        )}

        {markers.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
            pinColor={marker.color}
            onPress={() => handleMarkerPress(marker)}
          >
            <Callout tooltip>
              <View style={styles.callout}>
                <Text style={styles.calloutTitle}>{marker.title}</Text>
                {marker.description ? <Text style={styles.calloutDesc}>{marker.description}</Text> : null}
              </View>
            </Callout>
          </Marker>
        ))}

        {polygons.map((poly) => (
          <React.Fragment key={poly.id}>
            <Polygon
              coordinates={poly.coordinates}
              strokeColor={poly.strokeColor}
              fillColor={poly.fillColor}
              strokeWidth={poly.strokeWidth}
            />
            <Marker coordinate={poly.center} anchor={{ x: 0.5, y: 0.5 }} flat pointerEvents="none">
              <View style={styles.polygonLabel}>
                <Text style={styles.polygonLabelText}>{poly.title}</Text>
              </View>
            </Marker>
          </React.Fragment>
        ))}

        {currentPolygon.length > 0 && (
          <Polygon
            coordinates={currentPolygon}
            strokeColor="#FF5722"
            fillColor="#FF572233"
            strokeWidth={2.5}
          />
        )}
      </MapView>

      {/* Floating Controls */}
      <View style={styles.controlPanel}>
        <View style={[styles.status, { backgroundColor: offline ? '#e74c3c' : '#27ae60' }]}>
          <Text style={styles.statusText}>{offline ? 'OFFLINE' : 'ONLINE'}</Text>
        </View>

        <TouchableOpacity style={styles.btn} onPress={toggleMapType}>
          <Icon name={isSatelliteMode ? 'satellite' : 'map'} size={28} color="#fff" />
        </TouchableOpacity>

        {!offline && (
          <TouchableOpacity style={styles.btn} onPress={() => setShowDownloadModal(true)}>
            <Icon name="cloud-download" size={28} color="#fff" />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.btn, isDrawingPolygon && { backgroundColor: '#e67e22' }]}
          onPress={isDrawingPolygon ? () => setIsDrawingPolygon(false) : startDrawingPolygon}
        >
          <Icon name={isDrawingPolygon ? 'close' : 'gesture'} size={28} color="#fff" />
        </TouchableOpacity>

        {isDrawingPolygon && currentPolygon.length >= 3 && (
          <TouchableOpacity style={styles.btnCheck} onPress={finishPolygon}>
            <Icon name="check" size={28} color="#fff" />
          </TouchableOpacity>
        )}

        <TouchableOpacity style={[styles.btn, { backgroundColor: '#c0392b' }]} onPress={clearAll}>
          <Icon name="delete-forever" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Download Modal */}
      <Modal visible={showDownloadModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Download Offline Map</Text>

            <Text style={styles.sectionTitle}>Map Type</Text>
            <View style={styles.typeRow}>
              {['satellite', 'standard'].map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.typeBtn, downloadMapType === t && styles.typeBtnActive]}
                  onPress={() => setDownloadMapType(t)}
                >
                  <Icon name={t === 'satellite' ? 'satellite' : 'map'} size={32} color={downloadMapType === t ? '#fff' : '#555'} />
                  <Text style={[styles.typeText, downloadMapType === t && { color: '#fff' }]}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionTitle}>Zoom Levels</Text>
            <View style={styles.zoomContainer}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text>Min: {downloadZoomLevels.min}</Text>
                <Slider
                  minimumValue={10}
                  maximumValue={16}
                  step={1}
                  value={downloadZoomLevels.min}
                  onValueChange={(v) => setDownloadZoomLevels((p) => ({ ...p, min: Math.round(v) }))}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text>Max: {downloadZoomLevels.max}</Text>
                <Slider
                  minimumValue={downloadZoomLevels.min + 1}
                  maximumValue={downloadMapType === 'satellite' ? 17 : 19}
                  step={1}
                  value={downloadZoomLevels.max}
                  onValueChange={(v) => setDownloadZoomLevels((p) => ({ ...p, max: Math.round(v) }))}
                />
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.btnCancel} onPress={() => setShowDownloadModal(false)}>
                <Text style={{ color: '#fff' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnDownload} onPress={startDownload}>
                <Text style={{ color: '#fff' }}>Download</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Marker Modal */}
      <Modal visible={showMarkerModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSmall}>
            <Text style={styles.modalSmallTitle}>{editingMarker ? 'Edit Marker' : 'Add Marker'}</Text>
            <TextInput style={styles.input} placeholder="Title" value={markerTitle} onChangeText={setMarkerTitle} />
            <TextInput
              style={[styles.input, { height: 90, textAlignVertical: 'top' }]}
              placeholder="Description (optional)"
              value={markerDescription}
              onChangeText={setMarkerDescription}
              multiline
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.btnCancel} onPress={() => setShowMarkerModal(false)}>
                <Text style={{ color: '#fff' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnSave} onPress={saveMarker}>
                <Text style={{ color: '#fff' }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Polygon Modal */}
      <Modal visible={showPolygonModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSmall}>
            <Text style={styles.modalSmallTitle}>Name this Area</Text>
            <TextInput style={styles.input} placeholder="Area name" value={polygonTitle} onChangeText={setPolygonTitle} />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.btnCancel} onPress={() => setShowPolygonModal(false)}>
                <Text style={{ color: '#fff' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnSave} onPress={savePolygon}>
                <Text style={{ color: '#fff' }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {isDownloading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#27ae60" />
          <Text style={styles.loadingText}>
            Downloading... {progress} / {totalTiles} • {totalTiles > 0 ? Math.round((progress / totalTiles) * 100) : 0}%
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  controlPanel: {
    position: 'absolute',
    top: 50,
    right: 16,
    alignItems: 'center',
  },
  status: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 12,
  },
  statusText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  btn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2c3e50',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 5,
  },
  btnCheck: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#27ae60',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 5,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: { color: '#fff', fontSize: 18, marginTop: 20 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: { backgroundColor: '#fff', borderRadius: 16, padding: 24, width: '92%', maxWidth: 420 },
  modalSmall: { backgroundColor: '#fff', borderRadius: 16, padding: 24, width: '88%', maxWidth: 360 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  modalSmallTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginTop: 16, marginBottom: 10 },
  typeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  typeBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#ddd',
    marginHorizontal: 6,
  },
  typeBtnActive: { backgroundColor: '#2c3e50', borderColor: '#2c3e50' },
  typeText: { marginTop: 8, fontWeight: '500' },
  zoomContainer: { flexDirection: 'row', marginBottom: 20 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  btnCancel: { flex: 1, padding: 14, backgroundColor: '#95a5a6', borderRadius: 10, alignItems: 'center', marginRight: 10 },
  btnDownload: { flex: 1, padding: 14, backgroundColor: '#27ae60', borderRadius: 10, alignItems: 'center' },
  btnSave: { flex: 1, padding: 14, backgroundColor: '#2980b9', borderRadius: 10, alignItems: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 10, padding: 12, marginBottom: 14, fontSize: 16 },
  callout: { backgroundColor: '#fff', padding: 12, borderRadius: 10, minWidth: 160, elevation: 4 },
  calloutTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 4 },
  calloutDesc: { fontSize: 14, color: '#555' },
  polygonLabel: { backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  polygonLabelText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
});