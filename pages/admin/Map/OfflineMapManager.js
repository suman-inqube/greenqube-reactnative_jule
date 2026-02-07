// OfflineMapManager.js
import RNFS from 'react-native-fs';
import {MMKV} from 'react-native-mmkv';
import NetInfo from '@react-native-community/netinfo';

// Initialize MMKV storage
export const storage = new MMKV({
  id: 'offline-map-storage',
});

class OfflineMapManager {
  constructor() {
    this.isOnline = true;
    this.mapTilesDir = `${RNFS.DocumentDirectoryPath}/mapTiles`;
    this.polygonsKey = 'saved_polygons';
    this.locationsKey = 'saved_locations';
    this.mapRegionsKey = 'cached_map_regions';
    this.networkListenerUnsubscribe = null;
    this.initNetworkListener();
    this.ensureTilesDirectory();
  }

  initNetworkListener() {
    this.networkListenerUnsubscribe = NetInfo.addEventListener(state => {
      const previousStatus = this.isOnline;
      this.isOnline = state.isConnected && state.isInternetReachable;
      
      if (previousStatus !== this.isOnline) {
        console.log('Network status changed:', this.isOnline ? 'Online' : 'Offline');
      }
    });
  }

  cleanup() {
    if (this.networkListenerUnsubscribe) {
      this.networkListenerUnsubscribe();
    }
  }

  async checkOnlineStatus() {
    const state = await NetInfo.fetch();
    this.isOnline = state.isConnected && state.isInternetReachable;
    return this.isOnline;
  }

  async ensureTilesDirectory() {
    try {
      const dirExists = await RNFS.exists(this.mapTilesDir);
      if (!dirExists) {
        await RNFS.mkdir(this.mapTilesDir);
        console.log('Map tiles directory created');
      }
    } catch (error) {
      console.error('Error creating tiles directory:', error);
    }
  }

  savePolygons(polygons) {
    try {
      storage.set(this.polygonsKey, JSON.stringify(polygons));
      console.log('Polygons saved offline');
      return true;
    } catch (error) {
      console.error('Error saving polygons:', error);
      return false;
    }
  }

  loadPolygons() {
    try {
      const data = storage.getString(this.polygonsKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading polygons:', error);
      return [];
    }
  }

  saveLocations(locations) {
    try {
      storage.set(this.locationsKey, JSON.stringify(locations));
      console.log('Locations saved offline');
      return true;
    } catch (error) {
      console.error('Error saving locations:', error);
      return false;
    }
  }

  loadLocations() {
    try {
      const data = storage.getString(this.locationsKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading locations:', error);
      return [];
    }
  }

  saveCurrentLocation(latitude, longitude) {
    try {
      const locationData = {latitude, longitude, timestamp: Date.now()};
      storage.set('current_location', JSON.stringify(locationData));
      return true;
    } catch (error) {
      console.error('Error saving current location:', error);
      return false;
    }
  }

  loadCurrentLocation() {
    try {
      const data = storage.getString('current_location');
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error loading current location:', error);
      return null;
    }
  }

  saveMapRegion(latitude, longitude, latitudeDelta, longitudeDelta) {
    try {
      const regions = this.loadMapRegions();
      const newRegion = {latitude, longitude, latitudeDelta, longitudeDelta, timestamp: Date.now()};
      regions.push(newRegion);
      storage.set(this.mapRegionsKey, JSON.stringify(regions));
      return true;
    } catch (error) {
      console.error('Error saving map region:', error);
      return false;
    }
  }

  loadMapRegions() {
    try {
      const data = storage.getString(this.mapRegionsKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      return [];
    }
  }

  async downloadOfflineMapArea(centerLat, centerLng, radius = 0.01) {
    if (!this.isOnline) {
      console.log('Cannot download - device is offline');
      return false;
    }
    try {
      const tileDir = `${this.mapTilesDir}/area_${centerLat}_${centerLng}`;
      const dirExists = await RNFS.exists(tileDir);
      if (!dirExists) {
        await RNFS.mkdir(tileDir);
      }
      this.saveMapRegion(centerLat, centerLng, radius, radius);
      console.log(`Offline map area saved`);
      return true;
    } catch (error) {
      console.error('Error downloading offline map:', error);
      return false;
    }
  }

  async clearCache() {
    try {
      const dirExists = await RNFS.exists(this.mapTilesDir);
      if (dirExists) {
        await RNFS.unlink(this.mapTilesDir);
      }
      await this.ensureTilesDirectory();
      storage.delete(this.polygonsKey);
      storage.delete(this.locationsKey);
      storage.delete('current_location');
      storage.delete(this.mapRegionsKey);
      console.log('Cache cleared');
      return true;
    } catch (error) {
      console.error('Error clearing cache:', error);
      return false;
    }
  }

  async getCacheStats() {
    try {
      const dirExists = await RNFS.exists(this.mapTilesDir);
      if (!dirExists) {
        return {totalFiles: 0, totalSize: 0, polygons: 0, locations: 0};
      }
      const files = await RNFS.readDir(this.mapTilesDir);
      const totalSize = files.reduce((sum, file) => sum + parseInt(file.size || 0), 0);
      const polygons = this.loadPolygons();
      const locations = this.loadLocations();
      return {
        totalFiles: files.length,
        totalSize: (totalSize / (1024 * 1024)).toFixed(2) + ' MB',
        polygons: polygons.length,
        locations: locations.length,
      };
    } catch (error) {
      return null;
    }
  }
}

export default new OfflineMapManager();
