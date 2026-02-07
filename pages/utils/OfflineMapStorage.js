// utils/OfflineMapStorage.js
import { MMKV } from 'react-native-mmkv';

class OfflineMapStorage {
  constructor() {
    // Initialize MMKV instances with separate IDs for better organization
    this.regionsStore = new MMKV({ 
      id: 'offline_map_regions',
      encryptionKey: 'offline_regions_encryption_key_2024'
    });
    
    this.tilesStore = new MMKV({ 
      id: 'offline_map_tiles',
      encryptionKey: 'offline_tiles_encryption_key_2024'
    });
    
    this.settingsStore = new MMKV({ 
      id: 'offline_map_settings',
      encryptionKey: 'offline_settings_encryption_key_2024'
    });
    
    // Define storage keys
    this.REGIONS_KEY = 'offline_regions_list';
    this.TILE_PREFIX = 'tile_';
    this.REGION_TILES_COUNT_PREFIX = 'region_tiles_count_';
    
    // Default region structure
    this.DEFAULT_REGION = {
      id: '',
      name: '',
      latitude: 0,
      longitude: 0,
      north: 0,
      south: 0,
      east: 0,
      west: 0,
      minZoom: 10,
      maxZoom: 16,
      createdAt: '',
      updatedAt: '',
      status: 'pending', // pending, downloading, complete, partial, failed
      totalTiles: 0,
      downloadedTiles: 0,
      failedTiles: 0,
      estimatedSizeMB: 0,
      actualSizeMB: 0
    };
  }

  // ==================== REGION MANAGEMENT ====================
  
  /**
   * Save or update a region
   * @param {Object} regionData - Region data to save
   * @returns {boolean} Success status
   */
  saveRegion(regionData) {
    try {
      if (!regionData.id) {
        console.error('Region ID is required');
        return false;
      }

      // Validate required fields
      const requiredFields = ['name', 'north', 'south', 'east', 'west', 'minZoom', 'maxZoom'];
      for (const field of requiredFields) {
        if (!regionData[field]) {
          console.error(`Missing required field: ${field}`);
          return false;
        }
      }

      // Set timestamps
      const now = new Date().toISOString();
      if (!regionData.createdAt) {
        regionData.createdAt = now;
      }
      regionData.updatedAt = now;

      // Get existing regions
      const regions = this.getRegions();
      const regionIndex = regions.findIndex(r => r.id === regionData.id);
      
      if (regionIndex >= 0) {
        // Update existing region
        regions[regionIndex] = { ...regions[regionIndex], ...regionData };
      } else {
        // Add new region
        regions.push(regionData);
      }
      
      // Save back to storage
      this.regionsStore.set(this.REGIONS_KEY, JSON.stringify(regions));
      
      // Update settings last modified
      this.settingsStore.set('lastModified', now);
      
      return true;
    } catch (error) {
      console.error('Error saving region:', error);
      return false;
    }
  }

  /**
   * Get all regions
   * @returns {Array} List of regions
   */
  getRegions() {
    try {
      const regionsJson = this.regionsStore.getString(this.REGIONS_KEY);
      return regionsJson ? JSON.parse(regionsJson) : [];
    } catch (error) {
      console.error('Error getting regions:', error);
      return [];
    }
  }

  /**
   * Get a specific region by ID
   * @param {string} regionId - Region ID
   * @returns {Object|null} Region data or null if not found
   */
  getRegion(regionId) {
    try {
      const regions = this.getRegions();
      return regions.find(r => r.id === regionId) || null;
    } catch (error) {
      console.error('Error getting region:', error);
      return null;
    }
  }

  /**
   * Delete a region and all its tiles
   * @param {string} regionId - Region ID to delete
   * @returns {boolean} Success status
   */
  deleteRegion(regionId) {
    try {
      // Get current regions
      const regions = this.getRegions();
      
      // Filter out the region to delete
      const filteredRegions = regions.filter(r => r.id !== regionId);
      
      // Check if region existed
      if (filteredRegions.length === regions.length) {
        console.warn(`Region ${regionId} not found`);
        return false;
      }
      
      // Save updated regions list
      this.regionsStore.set(this.REGIONS_KEY, JSON.stringify(filteredRegions));
      
      // Delete all tiles for this region
      this.deleteTilesByRegion(regionId);
      
      // Delete tile count record
      this.tilesStore.delete(`${this.REGION_TILES_COUNT_PREFIX}${regionId}`);
      
      console.log(`Deleted region: ${regionId}`);
      return true;
    } catch (error) {
      console.error('Error deleting region:', error);
      return false;
    }
  }

  /**
   * Update region status
   * @param {string} regionId - Region ID
   * @param {string} status - New status
   * @param {Object} extraData - Additional data to update
   * @returns {boolean} Success status
   */
  updateRegionStatus(regionId, status, extraData = {}) {
    try {
      const region = this.getRegion(regionId);
      if (!region) {
        console.error(`Region ${regionId} not found`);
        return false;
      }
      
      region.status = status;
      region.updatedAt = new Date().toISOString();
      
      // Merge extra data
      Object.assign(region, extraData);
      
      return this.saveRegion(region);
    } catch (error) {
      console.error('Error updating region status:', error);
      return false;
    }
  }

  /**
   * Get regions by status
   * @param {string} status - Status to filter by
   * @returns {Array} Filtered regions
   */
  getRegionsByStatus(status) {
    try {
      const regions = this.getRegions();
      return regions.filter(r => r.status === status);
    } catch (error) {
      console.error('Error getting regions by status:', error);
      return [];
    }
  }

  // ==================== TILE MANAGEMENT ====================

  /**
   * Save a tile to storage
   * @param {string} regionId - Region ID
   * @param {number} zoom - Zoom level
   * @param {number} x - Tile X coordinate
   * @param {number} y - Tile Y coordinate
   * @param {string} tileData - Base64 encoded tile data
   * @returns {boolean} Success status
   */
  saveTile(regionId, zoom, x, y, tileData) {
    try {
      if (!tileData || !tileData.startsWith('data:image/')) {
        // If not base64 data URL, convert it
        tileData = `data:image/png;base64,${tileData}`;
      }
      
      const tileKey = this.generateTileKey(regionId, zoom, x, y);
      
      // Save tile data
      this.tilesStore.set(tileKey, tileData);
      
      // Update tile count for region
      this.incrementTileCount(regionId);
      
      // Update region downloaded tiles count
      const region = this.getRegion(regionId);
      if (region) {
        region.downloadedTiles = (region.downloadedTiles || 0) + 1;
        region.updatedAt = new Date().toISOString();
        this.saveRegion(region);
      }
      
      return true;
    } catch (error) {
      console.error('Error saving tile:', error);
      return false;
    }
  }

  /**
   * Get a tile from storage
   * @param {string} regionId - Region ID
   * @param {number} zoom - Zoom level
   * @param {number} x - Tile X coordinate
   * @param {number} y - Tile Y coordinate
   * @returns {string|null} Tile data or null if not found
   */
  getTile(regionId, zoom, x, y) {
    try {
      const tileKey = this.generateTileKey(regionId, zoom, x, y);
      return this.tilesStore.getString(tileKey);
    } catch (error) {
      console.error('Error getting tile:', error);
      return null;
    }
  }

  /**
   * Check if a tile exists
   * @param {string} regionId - Region ID
   * @param {number} zoom - Zoom level
   * @param {number} x - Tile X coordinate
   * @param {number} y - Tile Y coordinate
   * @returns {boolean} Whether tile exists
   */
  hasTile(regionId, zoom, x, y) {
    try {
      const tileKey = this.generateTileKey(regionId, zoom, x, y);
      return this.tilesStore.contains(tileKey);
    } catch (error) {
      console.error('Error checking tile:', error);
      return false;
    }
  }

  /**
   * Delete tiles for a region
   * @param {string} regionId - Region ID
   * @returns {boolean} Success status
   */
  deleteTilesByRegion(regionId) {
    try {
      const allKeys = this.tilesStore.getAllKeys();
      const regionTileKeys = allKeys.filter(key => 
        key.startsWith(`${this.TILE_PREFIX}${regionId}_`)
      );
      
      console.log(`Deleting ${regionTileKeys.length} tiles for region ${regionId}`);
      
      regionTileKeys.forEach(key => {
        this.tilesStore.delete(key);
      });
      
      // Reset tile count
      this.tilesStore.delete(`${this.REGION_TILES_COUNT_PREFIX}${regionId}`);
      
      return true;
    } catch (error) {
      console.error('Error deleting tiles by region:', error);
      return false;
    }
  }

  /**
   * Get tile count for a region
   * @param {string} regionId - Region ID
   * @returns {number} Tile count
   */
  getTileCount(regionId) {
    try {
      const count = this.tilesStore.getNumber(`${this.REGION_TILES_COUNT_PREFIX}${regionId}`);
      return count || 0;
    } catch (error) {
      console.error('Error getting tile count:', error);
      return 0;
    }
  }

  /**
   * Get all tiles for a region
   * @param {string} regionId - Region ID
   * @returns {Array} Array of tile info objects
   */
  getTilesByRegion(regionId) {
    try {
      const allKeys = this.tilesStore.getAllKeys();
      const regionTileKeys = allKeys.filter(key => 
        key.startsWith(`${this.TILE_PREFIX}${regionId}_`)
      );
      
      return regionTileKeys.map(key => {
        const parts = key.split('_');
        return {
          regionId,
          zoom: parseInt(parts[2]),
          x: parseInt(parts[3]),
          y: parseInt(parts[4]),
          key
        };
      });
    } catch (error) {
      console.error('Error getting tiles by region:', error);
      return [];
    }
  }

  // ==================== SETTINGS MANAGEMENT ====================

  /**
   * Save a setting
   * @param {string} key - Setting key
   * @param {any} value - Setting value
   * @returns {boolean} Success status
   */
  setSetting(key, value) {
    try {
      this.settingsStore.set(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Error saving setting:', error);
      return false;
    }
  }

  /**
   * Get a setting
   * @param {string} key - Setting key
   * @param {any} defaultValue - Default value if not found
   * @returns {any} Setting value
   */
  getSetting(key, defaultValue = null) {
    try {
      const value = this.settingsStore.getString(key);
      return value ? JSON.parse(value) : defaultValue;
    } catch (error) {
      console.error('Error getting setting:', error);
      return defaultValue;
    }
  }

  /**
   * Get all settings
   * @returns {Object} All settings
   */
  getAllSettings() {
    try {
      const allKeys = this.settingsStore.getAllKeys();
      const settings = {};
      
      allKeys.forEach(key => {
        settings[key] = this.getSetting(key);
      });
      
      return settings;
    } catch (error) {
      console.error('Error getting all settings:', error);
      return {};
    }
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Generate tile storage key
   * @param {string} regionId - Region ID
   * @param {number} zoom - Zoom level
   * @param {number} x - Tile X coordinate
   * @param {number} y - Tile Y coordinate
   * @returns {string} Tile key
   */
  generateTileKey(regionId, zoom, x, y) {
    return `${this.TILE_PREFIX}${regionId}_${zoom}_${x}_${y}`;
  }

  /**
   * Increment tile count for a region
   * @param {string} regionId - Region ID
   */
  incrementTileCount(regionId) {
    try {
      const currentCount = this.getTileCount(regionId);
      this.tilesStore.set(`${this.REGION_TILES_COUNT_PREFIX}${regionId}`, currentCount + 1);
    } catch (error) {
      console.error('Error incrementing tile count:', error);
    }
  }

  /**
   * Get storage information
   * @returns {Object} Storage info
   */
  getStorageInfo() {
    try {
      const regions = this.getRegions();
      const allKeys = this.tilesStore.getAllKeys();
      
      // Calculate total size (rough estimate)
      let totalSizeBytes = 0;
      let regionDetails = [];
      
      // Calculate size per region
      regions.forEach(region => {
        const regionTiles = this.getTilesByRegion(region.id);
        let regionSizeBytes = 0;
        
        regionTiles.forEach(tileInfo => {
          const tileData = this.tilesStore.getString(tileInfo.key);
          if (tileData) {
            // Remove data URL prefix and calculate base64 size
            const base64Data = tileData.replace(/^data:image\/\w+;base64,/, '');
            regionSizeBytes += base64Data.length * 0.75; // Approximate bytes
          }
        });
        
        const regionSizeMB = (regionSizeBytes / (1024 * 1024)).toFixed(2);
        totalSizeBytes += regionSizeBytes;
        
        regionDetails.push({
          id: region.id,
          name: region.name,
          tileCount: regionTiles.length,
          sizeMB: regionSizeMB,
          status: region.status,
          coverage: `${((regionTiles.length / region.totalTiles) * 100).toFixed(1)}%`
        });
      });
      
      const totalSizeMB = (totalSizeBytes / (1024 * 1024)).toFixed(2);
      
      return {
        regionCount: regions.length,
        totalTiles: allKeys.length,
        totalSizeMB,
        regionDetails,
        lastSync: this.getSetting('lastSync', 'Never'),
        lastModified: this.getSetting('lastModified', 'Never'),
        storageStatus: this.getSetting('storageStatus', 'normal')
      };
    } catch (error) {
      console.error('Error getting storage info:', error);
      return {
        regionCount: 0,
        totalTiles: 0,
        totalSizeMB: '0.00',
        regionDetails: [],
        lastSync: 'Never',
        lastModified: 'Never',
        storageStatus: 'error'
      };
    }
  }

  /**
   * Check if a location has offline coverage
   * @param {number} latitude - Latitude
   * @param {number} longitude - Longitude
   * @returns {Object|null} Region covering the location or null
   */
  hasOfflineCoverage(latitude, longitude) {
    try {
      const regions = this.getRegions();
      
      for (const region of regions) {
        if (region.status === 'complete' || region.status === 'partial') {
          // Check if location is within region bounds
          const withinLat = latitude >= region.south && latitude <= region.north;
          const withinLng = longitude >= region.west && longitude <= region.east;
          
          if (withinLat && withinLng) {
            // Check if we have sufficient tiles for this region
            const tileCount = this.getTileCount(region.id);
            if (tileCount > 0) {
              return {
                ...region,
                availableTiles: tileCount,
                coveragePercentage: region.totalTiles ? ((tileCount / region.totalTiles) * 100).toFixed(1) : 'Unknown'
              };
            }
          }
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error checking offline coverage:', error);
      return null;
    }
  }

  /**
   * Get regions covering a location
   * @param {number} latitude - Latitude
   * @param {number} longitude - Longitude
   * @returns {Array} Regions covering the location
   */
  getRegionsCoveringLocation(latitude, longitude) {
    try {
      const regions = this.getRegions();
      return regions.filter(region => {
        if (region.status === 'complete' || region.status === 'partial') {
          const withinLat = latitude >= region.south && latitude <= region.north;
          const withinLng = longitude >= region.west && longitude <= region.east;
          return withinLat && withinLng;
        }
        return false;
      });
    } catch (error) {
      console.error('Error getting regions covering location:', error);
      return [];
    }
  }

  /**
   * Estimate region size
   * @param {Object} region - Region data
   * @returns {Object} Size estimation
   */
  estimateRegionSize(region) {
    try {
      const { minZoom, maxZoom, north, south, east, west } = region;
      let totalTiles = 0;
      
      for (let zoom = minZoom; zoom <= maxZoom; zoom++) {
        const n = Math.pow(2, zoom);
        
        // Convert coordinates to tile numbers
        const latRadNorth = north * Math.PI / 180;
        const latRadSouth = south * Math.PI / 180;
        
        const minX = Math.floor((west + 180) / 360 * n);
        const maxX = Math.floor((east + 180) / 360 * n);
        const minY = Math.floor((1 - Math.log(Math.tan(latRadNorth) + 1 / Math.cos(latRadNorth)) / Math.PI) / 2 * n);
        const maxY = Math.floor((1 - Math.log(Math.tan(latRadSouth) + 1 / Math.cos(latRadSouth)) / Math.PI) / 2 * n);
        
        const xTiles = Math.max(0, maxX - minX + 1);
        const yTiles = Math.max(0, maxY - minY + 1);
        totalTiles += xTiles * yTiles;
      }
      
      // Average tile size is about 10KB
      const estimatedSizeMB = (totalTiles * 10) / 1024; // Convert KB to MB
      
      return {
        totalTiles,
        estimatedSizeMB: estimatedSizeMB.toFixed(2),
        minZoom,
        maxZoom,
        coverageArea: this.calculateArea(region)
      };
    } catch (error) {
      console.error('Error estimating region size:', error);
      return {
        totalTiles: 0,
        estimatedSizeMB: '0.00',
        minZoom: 0,
        maxZoom: 0,
        coverageArea: '0.00'
      };
    }
  }

  /**
   * Calculate area of region in square kilometers
   * @param {Object} region - Region data
   * @returns {string} Area in km²
   */
  calculateArea(region) {
    try {
      // Simple approximation (not exact for large areas)
      const latDiff = region.north - region.south;
      const lngDiff = region.east - region.west;
      
      // Convert to kilometers (approx)
      const latKm = latDiff * 111.32;
      const lngKm = lngDiff * 111.32 * Math.cos((region.north + region.south) / 2 * Math.PI / 180);
      
      const area = Math.abs(latKm * lngKm);
      return area.toFixed(2);
    } catch (error) {
      console.error('Error calculating area:', error);
      return '0.00';
    }
  }

  /**
   * Clear all data
   * @returns {boolean} Success status
   */
  clearAll() {
    try {
      console.log('Clearing all offline map data...');
      
      this.regionsStore.clearAll();
      this.tilesStore.clearAll();
      this.settingsStore.clearAll();
      
      console.log('All offline map data cleared');
      return true;
    } catch (error) {
      console.error('Error clearing all data:', error);
      return false;
    }
  }

  /**
   * Export data for backup
   * @returns {Object} Export data
   */
  exportData() {
    try {
      const regions = this.getRegions();
      const settings = this.getAllSettings();
      
      return {
        version: '1.0',
        exportDate: new Date().toISOString(),
        regions,
        settings,
        storageInfo: this.getStorageInfo()
      };
    } catch (error) {
      console.error('Error exporting data:', error);
      return null;
    }
  }

  /**
   * Import data from backup
   * @param {Object} importData - Data to import
   * @returns {boolean} Success status
   */
  importData(importData) {
    try {
      if (!importData || importData.version !== '1.0') {
        console.error('Invalid import data format');
        return false;
      }
      
      // Clear existing data
      this.clearAll();
      
      // Import regions
      if (importData.regions && Array.isArray(importData.regions)) {
        this.regionsStore.set(this.REGIONS_KEY, JSON.stringify(importData.regions));
      }
      
      // Import settings
      if (importData.settings && typeof importData.settings === 'object') {
        Object.entries(importData.settings).forEach(([key, value]) => {
          this.setSetting(key, value);
        });
      }
      
      console.log('Data imported successfully');
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }

  /**
   * Check storage health
   * @returns {Object} Health status
   */
  checkHealth() {
    try {
      const regions = this.getRegions();
      const totalTiles = this.tilesStore.getAllKeys().length;
      const settings = this.getAllSettings();
      
      let corruptedRegions = 0;
      let incompleteDownloads = 0;
      
      regions.forEach(region => {
        const tileCount = this.getTileCount(region.id);
        const tiles = this.getTilesByRegion(region.id);
        
        if (tileCount !== tiles.length) {
          corruptedRegions++;
        }
        
        if (region.status === 'downloading') {
          incompleteDownloads++;
        }
      });
      
      return {
        status: 'healthy',
        regions: regions.length,
        tiles: totalTiles,
        corruptedRegions,
        incompleteDownloads,
        lastBackup: settings.lastBackup || 'Never',
        storageUtilization: this.getStorageUtilization()
      };
    } catch (error) {
      console.error('Error checking health:', error);
      return {
        status: 'error',
        regions: 0,
        tiles: 0,
        corruptedRegions: 0,
        incompleteDownloads: 0,
        lastBackup: 'Never',
        storageUtilization: '0%'
      };
    }
  }

  /**
   * Get storage utilization percentage
   * @returns {string} Utilization percentage
   */
  getStorageUtilization() {
    try {
      // This is a rough estimate
      const allKeys = this.tilesStore.getAllKeys();
      const totalKeys = allKeys.length;
      
      // Assuming each key-value pair takes about 1KB on average
      const estimatedSizeKB = totalKeys * 1;
      const maxStorageKB = 10 * 1024; // 10MB limit (adjust as needed)
      
      const utilization = (estimatedSizeKB / maxStorageKB) * 100;
      return `${Math.min(utilization, 100).toFixed(1)}%`;
    } catch (error) {
      console.error('Error getting storage utilization:', error);
      return '0%';
    }
  }

  /**
   * Clean up old/incomplete downloads
   * @returns {Object} Cleanup results
   */
  cleanup() {
    try {
      const regions = this.getRegions();
      let deletedRegions = 0;
      let deletedTiles = 0;
      
      const now = new Date();
      
      regions.forEach(region => {
        // Delete regions that have been downloading for more than 24 hours
        if (region.status === 'downloading') {
          const createdDate = new Date(region.createdAt);
          const hoursDiff = (now - createdDate) / (1000 * 60 * 60);
          
          if (hoursDiff > 24) {
            if (this.deleteRegion(region.id)) {
              deletedRegions++;
              deletedTiles += this.getTileCount(region.id);
            }
          }
        }
        
        // Delete regions with 0 tiles and older than 7 days
        if (region.downloadedTiles === 0) {
          const createdDate = new Date(region.createdAt);
          const daysDiff = (now - createdDate) / (1000 * 60 * 60 * 24);
          
          if (daysDiff > 7) {
            if (this.deleteRegion(region.id)) {
              deletedRegions++;
            }
          }
        }
      });
      
      return {
        success: true,
        deletedRegions,
        deletedTiles,
        message: `Cleaned up ${deletedRegions} regions and ${deletedTiles} tiles`
      };
    } catch (error) {
      console.error('Error during cleanup:', error);
      return {
        success: false,
        deletedRegions: 0,
        deletedTiles: 0,
        message: 'Cleanup failed'
      };
    }
  }
}

// Create and export singleton instance
const offlineMapStorage = new OfflineMapStorage();
export default offlineMapStorage;