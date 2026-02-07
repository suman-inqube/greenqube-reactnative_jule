import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';

import MapView, {
  PROVIDER_GOOGLE,
  MAP_TYPES,
  LocalTile,
  Marker,
} from 'react-native-maps';

import NetInfo from '@react-native-community/netinfo';
import Geolocation from '@react-native-community/geolocation';
import RNFS from 'react-native-fs';
import Icon from 'react-native-vector-icons/MaterialIcons';

/* ================= CONFIG ================= */
const TILE_DIR = `${RNFS.DocumentDirectoryPath}/offline_tiles`;
// Use a template that we can easily replace
const TILE_URL_TEMPLATE = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
// Identify your app to avoid being blocked!
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
  const [userLocation, setUserLocation] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);

  const [region, setRegion] = useState({
    latitude: 22.5726,
    longitude: 88.3639,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  useEffect(() => {
    const init = async () => {
      if (!(await RNFS.exists(TILE_DIR))) {
        await RNFS.mkdir(TILE_DIR);
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
      const folders = await RNFS.readDir(TILE_DIR);
      setTilesAvailable(folders.length > 0);
    } catch {
      setTilesAvailable(false);
    }
  };

  const startDownload = async () => {
    if (offline) return Alert.alert("Error", "Connect to internet to download.");
    
    setIsDownloading(true);
    setProgress(0);

    const bbox = {
      maxLat: region.latitude + region.latitudeDelta / 2,
      minLat: region.latitude - region.latitudeDelta / 2,
      minLon: region.longitude - region.longitudeDelta / 2,
      maxLon: region.longitude + region.longitudeDelta / 2,
    };

    // Zoom 12-14 is safe. Zoom 15+ for large areas will get you banned.
    const minZoom = 12;
    const maxZoom = 14; 
    let downloadCount = 0;

    try {
      for (let z = minZoom; z <= maxZoom; z++) {
        const topLeft = getTileXYZ(bbox.maxLat, bbox.minLon, z);
        const bottomRight = getTileXYZ(bbox.minLat, bbox.maxLon, z);

        for (let x = topLeft.x; x <= bottomRight.x; x++) {
          for (let y = topLeft.y; y <= bottomRight.y; y++) {
            const folder = `${TILE_DIR}/${z}/${x}`;
            const file = `${folder}/${y}.png`;
            const url = TILE_URL_TEMPLATE.replace('{z}', z).replace('{x}', x).replace('{y}', y);

            await RNFS.mkdir(folder);
            
            if (!(await RNFS.exists(file))) {
              const result = await RNFS.downloadFile({
                fromUrl: url,
                toFile: file,
                headers: { 'User-Agent': USER_AGENT }
              }).promise;

              if (result.statusCode === 403) {
                throw new Error("Blocked by OSM Policy. Try changing User-Agent or slowing down.");
              }

              // CRITICAL: Delay 200ms between tiles to respect OSM servers
              await sleep(200);
            }
            downloadCount++;
            setProgress(downloadCount);
          }
        }
      }
      setTilesAvailable(true);
      Alert.alert("Complete", `Downloaded ${downloadCount} tiles.`);
    } catch (error) {
      Alert.alert("Download Error", error.message);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        provider={offline ? undefined : PROVIDER_GOOGLE}
        mapType={offline ? MAP_TYPES.NONE : MAP_TYPES.STANDARD}
        region={region}
        onRegionChangeComplete={setRegion}
      >
        {tilesAvailable && (
          <LocalTile
            pathTemplate={`${TILE_DIR}/{z}/{x}/{y}.png`}
            tileSize={256}
            zIndex={10}
          />
        )}
        {userLocation && <Marker coordinate={userLocation} />}
      </MapView>

      <View style={styles.ui}>
        <View style={[styles.status, { backgroundColor: offline ? '#d35400' : '#27ae60' }]}>
          <Text style={styles.statusText}>{offline ? "OFFLINE" : "ONLINE"}</Text>
        </View>

        {!offline && (
          <TouchableOpacity style={styles.btn} onPress={startDownload}>
            <Icon name="file-download" size={24} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      {isDownloading && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" />
          <Text>Downloading: {progress} tiles...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  ui: { position: 'absolute', top: 50, right: 20, alignItems: 'flex-end' },
  status: { padding: 8, borderRadius: 5, marginBottom: 10 },
  statusText: { color: '#fff', fontWeight: 'bold' },
  btn: { backgroundColor: '#2980b9', padding: 15, borderRadius: 30, elevation: 5 },
  loader: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.8)', justifyContent: 'center', alignItems: 'center' }
});