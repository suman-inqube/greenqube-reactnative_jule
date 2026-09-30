import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  useContext,
} from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import MapView, {
  Polygon,
  Marker,
  PROVIDER_GOOGLE,
  MAP_TYPES,
  LocalTile,
} from 'react-native-maps';
import { getItem } from '../../../config/getDataFromStorage';
import { Colors } from '../../utils/Constants';
import RNFS from 'react-native-fs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as geolib from 'geolib';
import { getDistance } from 'geolib';
import { isWithin20Meters } from '../../Common/calculateAreaFun';
import SuggestiveSearchInput from '../../Common/SuggestiveSearchInput';
import { getMapLocation } from '../../../config/apiHere';
import LoadingScreen from '../../Common/LoadingScreen';
import FloatingActionButton from '../../Components/FloatingActionButton';
import NetInfo from '@react-native-community/netinfo';
import { userCreateContext } from '../../Context/usersCreateContext';

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const TILE_DIR = `${RNFS.DocumentDirectoryPath}/offline_tiles`;
const SATELLITE_DIR = `${RNFS.DocumentDirectoryPath}/satellite_tiles`;

const TILE_PROVIDERS = {
  standard: {
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    extension: 'png',
    avgSizeKB: 15,
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    extension: 'jpg',
    avgSizeKB: 25,
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
  offline_mode = 0,
}) {
  const { t } = useContext(userCreateContext);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [drawingReference, setDrawingReference] = useState(null);
  const [distanceThreshold] = useState(20);
  const [marker, setMarker] = useState({ lat: 0, lng: 0 });
  const [selectedArea, setSelectedArea] = useState(0);
  const mapRef = useRef(null);
  const [isOffline, setIsOffline] = useState(false);
  const [satelliteTilesAvailable, setSatelliteTilesAvailable] = useState(false);
  const [useSatelliteOffline] = useState(true);
  const [tilesAvailable, setTilesAvailable] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [totalTilesToDownload, setTotalTilesToDownload] = useState(0);
  const [region, setRegion] = useState({
    latitude: baselatLong?.latitude || 22.5726,
    longitude: baselatLong?.longitude || 88.3639,
    latitudeDelta: 0.08,
    longitudeDelta: 0.08,
  });

  const checkOfflineTiles = useCallback(async () => {
    try {
      const tileDirExists = await RNFS.exists(TILE_DIR);
      const satelliteDirExists = await RNFS.exists(SATELLITE_DIR);

      let isStdAvailable = false;
      let isSatAvailable = false;

      if (tileDirExists) {
        const std = await RNFS.readDir(TILE_DIR);
        isStdAvailable = std.length > 0;
      }

      if (satelliteDirExists) {
        const sat = await RNFS.readDir(SATELLITE_DIR);
        isSatAvailable = sat.length > 0;
      }

      setTilesAvailable(isStdAvailable);
      setSatelliteTilesAvailable(isSatAvailable);

      return { tilesAvailable: isStdAvailable, satelliteTilesAvailable: isSatAvailable };
    } catch (err) {
      console.error('Error checking offline tiles:', err);
      setTilesAvailable(false);
      setSatelliteTilesAvailable(false);
      return { tilesAvailable: false, satelliteTilesAvailable: false };
    }
  }, []);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOffline(!state.isConnected);
    });

    checkOfflineTiles();

    return () => unsubscribe();
  }, [checkOfflineTiles]);

  const animateToLocation = useCallback((latitude, longitude, delta = 0.01) => {
    if (mapRef.current && !isNaN(latitude) && !isNaN(longitude)) {
      setTimeout(() => {
        mapRef.current?.animateToRegion(
          {
            latitude,
            longitude,
            latitudeDelta: delta,
            longitudeDelta: delta,
          },
          1200,
        );
      }, 200);
    }
  }, []);

  useEffect(() => {
    const onPageLoad = async () => {
      try {
        let lat = baselatLong?.latitude || 22.5726;
        let lng = baselatLong?.longitude || 88.3639;

        if (location?.length && location[0]?.latitude && location[0]?.longitude) {
          lat = parseFloat(location[0].latitude);
          lng = parseFloat(location[0].longitude);
        } else if (polygons.length === 0 && baselatLong?.latitude && baselatLong?.longitude) {
          setCurrentLocation({
            latitude: baselatLong.latitude,
            longitude: baselatLong.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          });
        }

        const targetDelta =
          isOffline && (tilesAvailable || satelliteTilesAvailable) ? 0.12 : 0.01;

        animateToLocation(lat, lng, targetDelta);
      } catch (error) {
        console.log('Error setting initial location:', error);
      }
    };

    onPageLoad();
  }, [
    baselatLong,
    location,
    isOffline,
    tilesAvailable,
    satelliteTilesAvailable,
    polygons.length,
    animateToLocation,
  ]);

  useEffect(() => {
    if (polygons.length !== 0 && polygons[0]?.[0]) {
      setCurrentLocation({
        latitude: polygons[0][0]?.latitude,
        longitude: polygons[0][0]?.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    }
  }, [polygons]);

  useEffect(() => {
    if (newPolygon.length > 2) {
      const unitValue = Number(landUnitsquareMetre?.[0]?.defined_unit_value);
      const polyArea = geolib.getAreaOfPolygon(newPolygon);
      setSelectedArea(unitValue ? unitValue * polyArea : polyArea);
    } else if (newPolygon.length === 0 && polygons.length !== 0) {
      setSelectedArea(area);
    } else {
      setSelectedArea(0);
    }
  }, [newPolygon, polygons, landUnitsquareMetre, area]);

  const editingLocation = useCallback(async () => {
    const fusedLocation = await getItem('fusedLocation');
    if (fusedLocation?.latitude && fusedLocation?.longitude) {
      setDrawingReference({
        latitude: fusedLocation.latitude,
        longitude: fusedLocation.longitude,
      });
    }
  }, []);

  useEffect(() => {
    if (editing && !drawingReference) {
      editingLocation();
    }
  }, [editing, drawingReference, editingLocation]);

  const coordinatesCurrent = useMemo(() => {
    return (
      location
        ?.filter(
          coord =>
            coord?.latitude !== undefined &&
            coord?.longitude !== undefined &&
            coord?.latitude !== null &&
            coord?.longitude !== null &&
            coord?.latitude !== '' &&
            coord?.longitude !== '',
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
        })) || []
    );
  }, [location]);

  const clearMapGetDistance = useCallback(async () => {
    try {
      if (statuslevel === 'PENDING' || statuslevel === 'REJECTED') {
        if (type === 'livehoood' || location.length === 1) {
          clearNewPolygon();
        } else {
          const dist = isWithin20Meters(drawingReference, location, 20);
          if (dist.length !== 0) {
            clearNewPolygon();
          } else {
            Alert.alert(
              '❌ Out of Range',
              'Plot location and current location not are same!.',
              [{ text: 'OK', onPress: () => console.log('OK Pressed') }],
              { cancelable: false },
            );
          }
        }
      }
    } catch (error) {
      console.log('Error in clearMapGetDistance:', error);
    }
  }, [statuslevel, type, location, drawingReference, clearNewPolygon]);

  const handleMapPressGetDistance = useCallback(
    async event => {
      try {
        if (type === 'livehoood') {
          handleMapPress(event);
        } else {
          const { latitude, longitude } = event.nativeEvent.coordinate;
          const pressedPoint = { latitude, longitude };
          const reference = editing ? (drawingReference || currentLocation) : currentLocation;

          if (!reference) {
            return;
          }

          if (newPolygon.length === 0) {
            const distance = getDistance({ latitude, longitude }, reference);
            if (distance <= distanceThreshold) {
              handleMapPress(event);
            } else if (editing) {
              Alert.alert(
                '❌ Out of Range',
                'Plot location and current location not same!',
              );
            }
          } else {
            const dist = isWithin20Meters(pressedPoint, newPolygon, 40);
            if (dist !== 0) {
              handleMapPress(event);
            } else {
              console.log('❌ Point is more than 10m away.');
            }
          }
        }
      } catch (error) {
        console.log('Error in handleMapPressGetDistance:', error);
      }
    },
    [type, editing, drawingReference, currentLocation, newPolygon, distanceThreshold, handleMapPress],
  );

  const fetchSearchSuggestions = useCallback(async query => {
    const suggestiveRes = await getMapLocation(query);
    return suggestiveRes?.data?.features || [];
  }, []);

  const handleSelect = useCallback(
    item => {
      if (item?.lat && item?.lng) {
        setMarker({ lat: item.lat, lng: item.lng });
        animateToLocation(item.lat, item.lng);
      }
    },
    [animateToLocation],
  );

  const getTileXYZ = (lat, lon, zoom) => {
    const x = Math.floor(((lon + 180) / 360) * Math.pow(2, zoom));
    const y = Math.floor(
      ((1 -
        Math.log(
          Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180),
        ) /
        Math.PI) /
        2) *
      Math.pow(2, zoom),
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

  const calculateDownloadSize = (tileCount, isSatellite = false) => {
    const avgSizeKB = isSatellite
      ? TILE_PROVIDERS.satellite.avgSizeKB
      : TILE_PROVIDERS.standard.avgSizeKB;
    const totalSizeKB = tileCount * avgSizeKB;

    if (totalSizeKB > 1024 * 1024) {
      return `${(totalSizeKB / (1024 * 1024)).toFixed(2)} GB`;
    } else if (totalSizeKB > 1024) {
      return `${(totalSizeKB / 1024).toFixed(1)} MB`;
    } else {
      return `${totalSizeKB.toFixed(0)} KB`;
    }
  };

  const downloadOfflineTiles = useCallback(async () => {
    if (isOffline) {
      Alert.alert('Offline', 'Please connect to internet to download map.');
      return;
    }

    const bbox = {
      maxLat: region.latitude + region.latitudeDelta / 2,
      minLat: region.latitude - region.latitudeDelta / 2,
      minLon: region.longitude - region.longitudeDelta / 2,
      maxLon: region.longitude + region.longitudeDelta / 2,
    };

    const minZoom = 12;
    const maxZoom = 20;
    const total = calculateTilesCount(bbox, minZoom, maxZoom);

    if (total > 200) {
      Alert.alert(
        'Download Limit Exceeded',
        `You selected ${total} tiles.\n\n` +
        `The maximum allowed is 200 tiles.\n` +
        `Please zoom in or select a smaller area.`,
        [{ text: 'OK' }],
      );
      return;
    }

    const estimatedSize = calculateDownloadSize(total, useSatelliteOffline);

    Alert.alert(
      'Download Offline Map',
      `Download ${total} tiles (${estimatedSize})?\n` +
      `Type: ${useSatelliteOffline ? 'Satellite' : 'Standard'}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Download',
          onPress: async () => {
            setIsDownloading(true);
            setDownloadProgress(0);
            setTotalTilesToDownload(total);

            let count = 0;
            const provider = useSatelliteOffline
              ? TILE_PROVIDERS.satellite
              : TILE_PROVIDERS.standard;
            const baseDir = useSatelliteOffline ? SATELLITE_DIR : TILE_DIR;
            const ext = provider.extension;

            try {
              await RNFS.mkdir(baseDir, { recursive: true });

              for (let z = minZoom; z <= maxZoom; z++) {
                const tl = getTileXYZ(bbox.maxLat, bbox.minLon, z);
                const br = getTileXYZ(bbox.minLat, bbox.maxLon, z);

                for (let x = tl.x; x <= br.x; x++) {
                  const folder = `${baseDir}/${z}/${x}`;
                  await RNFS.mkdir(folder, { recursive: true });

                  for (let y = tl.y; y <= br.y; y++) {
                    const file = `${folder}/${y}.${ext}`;
                    const url = provider.url
                      .replace('{z}', z)
                      .replace('{x}', x)
                      .replace('{y}', y);

                    if (!(await RNFS.exists(file))) {
                      try {
                        await RNFS.downloadFile({
                          fromUrl: url,
                          toFile: file,
                          headers: { 'User-Agent': 'MyApp/1.0' },
                        }).promise;
                      } catch (error) {
                        console.warn(`Failed ${z}/${x}/${y}`);
                      }
                    }

                    count++;
                    setDownloadProgress(count);
                    await sleep(350);
                  }
                }
              }

              await checkOfflineTiles();
              Alert.alert(
                'Success',
                `Downloaded ${count} tiles successfully!`,
                [{ text: 'OK' }],
              );
            } catch (err) {
              Alert.alert('Error', 'Download failed: ' + err.message);
            } finally {
              setIsDownloading(false);
            }
          },
        },
      ],
    );
  }, [isOffline, region, useSatelliteOffline, checkOfflineTiles]);

  const getOfflineTilePath = useCallback(() => {
    if (useSatelliteOffline && satelliteTilesAvailable) {
      return `${SATELLITE_DIR}/{z}/{x}/{y}.jpg`;
    }
    if (tilesAvailable) {
      return `${TILE_DIR}/{z}/{x}/{y}.png`;
    }
    return null;
  }, [useSatelliteOffline, satelliteTilesAvailable, tilesAvailable]);

  const actions = useMemo(() => {
    const baseActions = [
      {
        text:
          type === 'plotWise'
            ? t('search_location')
            : editing
              ? t('stop_editing')
              : t('start_editing'),

        icon:
          type === 'plotWise'
            ? require('../../Common/images/find.png')
            : require('../../Common/images/editing.png'),

        name: 'toggleEdit',
        position: 1,
        color: Colors.useGreen,
      },
    ];

    if (editing) {
      baseActions.push(
        {
          text: t('finalize_polygon'),
          icon: require('../../Common/images/check.png'),
          name: 'finalizePolygon',
          position: 2,
          color: Colors.useGreen,
        },
        {
          text: t('clear'),
          icon: require('../../Common/images/bin.png'),
          name: 'clear',
          position: 3,
          color: Colors.useGreen,
        },
        {
          text: t('undo_mark'),
          icon: require('../../Common/images/undo.png'),
          name: 'undoMark',
          position: 4,
          color: Colors.useGreen,
        },
      );
    }
    if (!isOffline && offline_mode === 1) {
      baseActions.push({
        text: isDownloading ? 'Downloading...' : 'Download Map',
        icon: <Icon name="cloud-download" size={24} color="#fff" />,
        name: 'downloadMap',
        position: 6,
        color: Colors.useGreen,
      });
    }
    return baseActions;
  }, [editing, isOffline, offline_mode, isDownloading, type, t]);

  const handleActionPress = useCallback(
    name => {
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
        case 'MapView':
          setShowModal(prev => !prev);
          break;
        case 'downloadMap':
          if (!isDownloading) {
            downloadOfflineTiles();
          }
          break;
        default:
          console.log('Unhandled action:', name);
      }
    },
    [
      editing,
      setEditing,
      finalizePolygon,
      clearMapGetDistance,
      undoMark,
      setShowModal,
      isDownloading,
      downloadOfflineTiles,
    ],
  );

  return (
    <View style={styles.container}>
      {isLoading && (
        <View style={styles.loaderOverlay}>
          <LoadingScreen />
        </View>
      )}
      <TouchableOpacity
        style={styles.searchIcon}
        onPress={() => setShowModal(false)}>
        <Image
          source={require('../../Common/images/cross100.png')}
          style={styles.crossIcon}
        />
      </TouchableOpacity>

      {isDownloading && (
        <View style={styles.downloadOverlay}>
          <ActivityIndicator size="large" color={Colors.useGreen} />
          <Text style={styles.downloadText}>
            Downloading tiles... {downloadProgress} / {totalTilesToDownload}
          </Text>
          <Text style={styles.downloadPercent}>
            {totalTilesToDownload > 0
              ? Math.round((downloadProgress / totalTilesToDownload) * 100)
              : 0}
            %
          </Text>
        </View>
      )}

      {isOffline && !tilesAvailable && !satelliteTilesAvailable && (
        <View style={styles.noTilesOverlay}>
          <Icon name="cloud-off" size={60} color="#fff" />
          <Text style={styles.noTilesText}>No offline map available</Text>
          <Text style={styles.noTilesSubText}>
            Connect to internet and download the map first
          </Text>
        </View>
      )}

      <MapView
        ref={mapRef}
        style={styles.map}
        provider={isOffline ? undefined : PROVIDER_GOOGLE}
        mapType={isOffline ? MAP_TYPES.NONE : 'hybrid'}
        onRegionChangeComplete={newRegion => {
          setRegion(newRegion);
          handleRegionChangeComplete?.(newRegion);
        }}
        onPress={handleMapPressGetDistance}
        showsUserLocation={true}
        followsUserLocation={true}
        showsCompass={true}
        compassOffset={{ x: 20, y: 20 }}
        scrollEnabled={true}
        showsScale={true}
        zoomTapEnabled={true}
        rotateEnabled={false}
        userLocationUpdateInterval={5000}
        showsMyLocationButton={true}
        zoomEnabled={true}
        zoomControlEnabled={true}
        pitchEnabled={true}>
        {isOffline && getOfflineTilePath() && (
          <LocalTile
            pathTemplate={getOfflineTilePath()}
            tileSize={256}
            zIndex={-1}
          />
        )}

        {polygons.map((polygon, index) => {
          if (polygon.length >= 3) {
            return (
              <Polygon
                key={index}
                coordinates={polygon}
                fillColor="rgba(167, 3, 3, 0.66)"
                strokeColor="rgb(240, 9, 9)"
                strokeWidth={2}
                name="MyPolygon"
              />
            );
          }
          return null;
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
          <Marker key={`new-poly-marker-${index}`} coordinate={coordinate} />
        ))}

        <Marker coordinate={{ latitude: marker.lat, longitude: marker.lng }} />
      </MapView>

      {selectedArea !== 0 && (
        <View style={styles.selectedAreaContainer}>
          <Text style={styles.selectedAreaText}>
            Selected Area: {selectedArea}{' '}
            {landAreaUnit?.[0]?.defined_unit_value
              ? landAreaUnit?.[0]?.unit_name
              : 'Square meter'}
          </Text>
        </View>
      )}

      <View style={styles.searchContainer}>
        <SuggestiveSearchInput
          fetchSuggestions={fetchSearchSuggestions}
          onSelect={handleSelect}
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
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  map: {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    position: 'absolute',
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
  },
  crossIcon: {
    width: 35,
    height: 35,
    margin: 1,
  },
  downloadOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  downloadText: {
    color: '#fff',
    fontSize: 18,
    marginTop: 16,
    marginBottom: 8,
  },
  downloadPercent: {
    color: '#fff',
    fontSize: 16,
  },
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
  noTilesSubText: {
    color: '#ddd',
    marginTop: 8,
    textAlign: 'center',
  },
  selectedAreaContainer: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  selectedAreaText: {
    fontSize: 15,
    color: '#FFF',
    backgroundColor: '#000',
  },
  searchContainer: {
    width: '70%',
    position: 'absolute',
    top: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
