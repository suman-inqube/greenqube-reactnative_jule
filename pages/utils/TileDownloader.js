// utils/TileDownloader.js
import RNFS from 'react-native-fs';
import offlineMapStorage from './OfflineMapStorage';

class TileDownloader {
  constructor() {
    // Use OpenStreetMap tiles (legal for offline use)
    this.TILE_SERVER_URL = 'https://tile.openstreetmap.org';
    this.MAX_CONCURRENT_DOWNLOADS = 3;
    this.USER_AGENT = 'GreenQube-Map-Downloader/1.0';
    
    // Create temp directory for downloads
    this.TEMP_DIR = `${RNFS.CachesDirectoryPath}/map_tiles_temp`;
    
    this.isCancelled = false;
    this.currentDownloads = new Map(); // Map of regionId -> AbortController
    
    // Ensure temp directory exists
    this.ensureTempDirectory();
  }

  /**
   * Ensure temp directory exists
   */
  async ensureTempDirectory() {
    try {
      const exists = await RNFS.exists(this.TEMP_DIR);
      if (!exists) {
        await RNFS.mkdir(this.TEMP_DIR);
        console.log('Created temp directory:', this.TEMP_DIR);
      }
    } catch (error) {
      console.error('Error creating temp directory:', error);
    }
  }

  /**
   * Download a region
   * @param {Object} regionData - Region data
   * @param {Function} onProgress - Progress callback
   * @returns {Promise<Object>} Download result
   */
  async downloadRegion(regionData, onProgress = null) {
    this.isCancelled = false;
    
    try {
      const regionId = regionData.id;
      console.log(`Starting download for region: ${regionData.name}`);
      
      // Create AbortController for this download
      const abortController = new AbortController();
      this.currentDownloads.set(regionId, abortController);
      
      // Update region status
      regionData.status = 'downloading';
      regionData.downloadStartTime = new Date().toISOString();
      offlineMapStorage.saveRegion(regionData);
      
      // Calculate total tiles
      const sizeEstimation = offlineMapStorage.estimateRegionSize(regionData);
      regionData.totalTiles = sizeEstimation.totalTiles;
      regionData.estimatedSizeMB = sizeEstimation.estimatedSizeMB;
      offlineMapStorage.saveRegion(regionData);
      
      let downloadedCount = 0;
      let failedCount = 0;
      const failedTiles = [];
      
      const totalTiles = regionData.totalTiles;
      console.log(`Total tiles to download: ${totalTiles}`);
      
      // Download tiles for each zoom level
      for (let zoom = regionData.minZoom; zoom <= regionData.maxZoom; zoom++) {
        if (this.isCancelled) break;
        
        const tileRange = this.calculateTileRange(regionData, zoom);
        console.log(`Downloading zoom ${zoom}: x=${tileRange.minX}-${tileRange.maxX}, y=${tileRange.minY}-${tileRange.maxY}`);
        
        // Create array of all tile coordinates for this zoom level
        const tileCoordinates = [];
        for (let x = tileRange.minX; x <= tileRange.maxX; x++) {
          for (let y = tileRange.minY; y <= tileRange.maxY; y++) {
            tileCoordinates.push({ zoom, x, y });
          }
        }
        
        // Download tiles in batches
        for (let i = 0; i < tileCoordinates.length; i += this.MAX_CONCURRENT_DOWNLOADS) {
          if (this.isCancelled) break;
          
          const batch = tileCoordinates.slice(i, i + this.MAX_CONCURRENT_DOWNLOADS);
          const batchPromises = batch.map(tile => 
            this.downloadSingleTile(regionId, tile.zoom, tile.x, tile.y, abortController)
          );
          
          const results = await Promise.allSettled(batchPromises);
          
          results.forEach(result => {
            if (result.status === 'fulfilled' && result.value.success) {
              downloadedCount++;
            } else {
              failedCount++;
              const tile = batch[results.indexOf(result)];
              if (tile) {
                failedTiles.push({ ...tile, error: result.reason?.message || 'Unknown error' });
              }
            }
          });
          
          // Update progress
          const progress = Math.round((downloadedCount / totalTiles) * 100);
          
          // Update region in storage
          regionData.downloadedTiles = downloadedCount;
          regionData.failedTiles = failedCount;
          offlineMapStorage.saveRegion(regionData);
          
          // Call progress callback
          if (onProgress && typeof onProgress === 'function') {
            onProgress(progress, downloadedCount, totalTiles);
          }
          
          // Small delay between batches to avoid rate limiting
          if (!this.isCancelled) {
            await this.delay(100);
          }
        }
      }
      
      // Clean up temp files
      await this.cleanupTempFiles();
      
      // Clean up AbortController
      this.currentDownloads.delete(regionId);
      
      if (this.isCancelled) {
        console.log(`Download cancelled for region: ${regionData.name}`);
        regionData.status = 'cancelled';
        offlineMapStorage.saveRegion(regionData);
        
        return {
          success: false,
          cancelled: true,
          downloaded: downloadedCount,
          failed: failedCount,
          region: regionData
        };
      }
      
      // Finalize download
      regionData.status = failedCount === 0 ? 'complete' : 'partial';
      regionData.downloadedTiles = downloadedCount;
      regionData.failedTiles = failedCount;
      regionData.downloadEndTime = new Date().toISOString();
      regionData.failedTileList = failedTiles;
      
      // Calculate actual size
      const storageInfo = offlineMapStorage.getStorageInfo();
      const regionDetail = storageInfo.regionDetails.find(r => r.id === regionId);
      if (regionDetail) {
        regionData.actualSizeMB = regionDetail.sizeMB;
      }
      
      offlineMapStorage.saveRegion(regionData);
      
      console.log(`Download completed for region: ${regionData.name}`);
      console.log(`- Downloaded: ${downloadedCount} tiles`);
      console.log(`- Failed: ${failedCount} tiles`);
      console.log(`- Status: ${regionData.status}`);
      
      return {
        success: true,
        cancelled: false,
        downloaded: downloadedCount,
        failed: failedCount,
        region: regionData,
        failedTiles
      };
      
    } catch (error) {
      console.error('Region download error:', error);
      
      // Clean up temp files on error
      await this.cleanupTempFiles();
      
      // Update region status to failed
      regionData.status = 'failed';
      regionData.error = error.message;
      offlineMapStorage.saveRegion(regionData);
      
      return {
        success: false,
        cancelled: false,
        error: error.message,
        region: regionData
      };
    }
  }

  /**
   * Download a single tile
   * @param {string} regionId - Region ID
   * @param {number} zoom - Zoom level
   * @param {number} x - Tile X coordinate
   * @param {number} y - Tile Y coordinate
   * @param {AbortController} abortController - Abort controller
   * @returns {Promise<Object>} Download result
   */
  async downloadSingleTile(regionId, zoom, x, y, abortController) {
    const tileUrl = `${this.TILE_SERVER_URL}/${zoom}/${x}/${y}.png`;
    const tempFilePath = `${this.TEMP_DIR}/tile_${regionId}_${zoom}_${x}_${y}.png`;
    
    try {
      // Check if already downloaded
      if (offlineMapStorage.hasTile(regionId, zoom, x, y)) {
        console.log(`Tile already exists: z${zoom}-x${x}-y${y}`);
        return { zoom, x, y, success: true, cached: true };
      }
      
      // Check if cancelled
      if (abortController.signal.aborted) {
        throw new Error('Download aborted');
      }
      
      // Download tile using react-native-fs
      const options = {
        fromUrl: tileUrl,
        toFile: tempFilePath,
        background: true,
        discretionary: true,
        cacheable: false,
        headers: {
          'User-Agent': this.USER_AGENT,
          'Accept': 'image/png',
        },
        progressInterval: 100,
        progress: (res) => {
          // Optional: Handle download progress for individual tiles
          // console.log(`Download progress: ${res.bytesWritten}/${res.contentLength}`);
        }
      };
      
      // Start download
      const downloadResult = await RNFS.downloadFile(options).promise;
      
      // Check if cancelled during download
      if (abortController.signal.aborted) {
        await RNFS.unlink(tempFilePath).catch(() => {});
        throw new Error('Download aborted');
      }
      
      // Check download status
      if (downloadResult.statusCode === 200) {
        // Read the downloaded file as base64
        const base64Data = await RNFS.readFile(tempFilePath, 'base64');
        
        // Save to storage
        const saved = offlineMapStorage.saveTile(regionId, zoom, x, y, base64Data);
        
        if (!saved) {
          throw new Error('Failed to save tile to storage');
        }
        
        // Clean up temp file
        await RNFS.unlink(tempFilePath).catch(() => {});
        
        return { zoom, x, y, success: true };
      } else {
        // Clean up temp file on error
        await RNFS.unlink(tempFilePath).catch(() => {});
        throw new Error(`HTTP ${downloadResult.statusCode}`);
      }
      
    } catch (error) {
      // Clean up temp file on any error
      await RNFS.unlink(tempFilePath).catch(() => {});
      
      console.error(`Tile download failed z${zoom}-x${x}-y${y}:`, error.message);
      throw error;
    }
  }

  /**
   * Calculate tile range for a region at specific zoom
   * @param {Object} region - Region data
   * @param {number} zoom - Zoom level
   * @returns {Object} Tile range
   */
  calculateTileRange(region, zoom) {
    const n = Math.pow(2, zoom);
    
    // Convert coordinates to tile numbers
    const latRadNorth = region.north * Math.PI / 180;
    const latRadSouth = region.south * Math.PI / 180;
    
    const minX = Math.floor((region.west + 180) / 360 * n);
    const maxX = Math.floor((region.east + 180) / 360 * n);
    const minY = Math.floor((1 - Math.log(Math.tan(latRadNorth) + 1 / Math.cos(latRadNorth)) / Math.PI) / 2 * n);
    const maxY = Math.floor((1 - Math.log(Math.tan(latRadSouth) + 1 / Math.cos(latRadSouth)) / Math.PI) / 2 * n);
    
    // Clamp values to valid tile range
    return {
      minX: Math.max(0, minX),
      maxX: Math.min(n - 1, maxX),
      minY: Math.max(0, minY),
      maxY: Math.min(n - 1, maxY)
    };
  }

  /**
   * Cancel current download
   * @param {string} regionId - Region ID to cancel
   */
  cancelDownload(regionId = null) {
    this.isCancelled = true;
    
    if (regionId && this.currentDownloads.has(regionId)) {
      const abortController = this.currentDownloads.get(regionId);
      if (abortController) {
        abortController.abort();
      }
      this.currentDownloads.delete(regionId);
    } else {
      // Cancel all downloads
      this.currentDownloads.forEach(abortController => {
        if (abortController) {
          abortController.abort();
        }
      });
      this.currentDownloads.clear();
    }
    
    console.log(`Download cancelled ${regionId ? 'for region: ' + regionId : 'for all regions'}`);
  }

  /**
   * Delay function
   * @param {number} ms - Milliseconds to delay
   * @returns {Promise} Delay promise
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Clean up temp files
   */
  async cleanupTempFiles() {
    try {
      const files = await RNFS.readDir(this.TEMP_DIR);
      const deletePromises = files.map(file => 
        RNFS.unlink(file.path).catch(() => {})
      );
      
      await Promise.all(deletePromises);
      console.log('Cleaned up temp files');
    } catch (error) {
      console.error('Error cleaning up temp files:', error);
    }
  }

  /**
   * Resume incomplete downloads
   * @returns {Array} List of resumed regions
   */
  async resumeIncompleteDownloads() {
    try {
      const incompleteRegions = offlineMapStorage.getRegionsByStatus('downloading');
      const resumedRegions = [];
      
      console.log(`Found ${incompleteRegions.length} incomplete downloads`);
      
      for (const region of incompleteRegions) {
        console.log(`Resuming download for: ${region.name}`);
        
        const result = await this.downloadRegion(region);
        if (result.success || result.cancelled) {
          resumedRegions.push({
            region: region,
            result: result
          });
        }
      }
      
      return resumedRegions;
    } catch (error) {
      console.error('Error resuming downloads:', error);
      return [];
    }
  }

  /**
   * Get download statistics
   * @param {string} regionId - Region ID (optional)
   * @returns {Object} Download statistics
   */
  getDownloadStats(regionId = null) {
    try {
      const stats = {
        activeDownloads: this.currentDownloads.size,
        isCancelled: this.isCancelled,
        tempDirSize: 0,
      };
      
      if (regionId) {
        stats.regionStatus = this.currentDownloads.has(regionId) ? 'downloading' : 'idle';
      }
      
      return stats;
    } catch (error) {
      console.error('Error getting download stats:', error);
      return {
        activeDownloads: 0,
        isCancelled: false,
        tempDirSize: 0,
      };
    }
  }

  /**
   * Test tile server connection
   * @returns {Promise<boolean>} Connection status
   */
  async testConnection() {
    try {
      const testUrl = `${this.TILE_SERVER_URL}/0/0/0.png`;
      const tempFile = `${this.TEMP_DIR}/test_connection.png`;
      
      const result = await RNFS.downloadFile({
        fromUrl: testUrl,
        toFile: tempFile,
        timeout: 10000,
        headers: {
          'User-Agent': this.USER_AGENT,
        }
      }).promise;
      
      // Clean up test file
      await RNFS.unlink(tempFile).catch(() => {});
      
      return result.statusCode === 200;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }

  /**
   * Estimate download time
   * @param {Object} region - Region data
   * @param {number} connectionSpeedMbps - Estimated connection speed in Mbps
   * @returns {Object} Time estimation
   */
  estimateDownloadTime(region, connectionSpeedMbps = 5) {
    try {
      const sizeEstimation = offlineMapStorage.estimateRegionSize(region);
      const totalTiles = sizeEstimation.totalTiles;
      
      // Average tile size: ~15KB
      const avgTileSizeKB = 15;
      const totalSizeMB = (totalTiles * avgTileSizeKB) / 1024;
      
      // Convert Mbps to MBps (1 Mbps = 0.125 MBps)
      const speedMBps = connectionSpeedMbps * 0.125;
      
      // Calculate time in seconds
      const timeSeconds = totalSizeMB / speedMBps;
      
      // Format time
      let timeFormatted = '';
      if (timeSeconds < 60) {
        timeFormatted = `${Math.ceil(timeSeconds)} seconds`;
      } else if (timeSeconds < 3600) {
        timeFormatted = `${Math.ceil(timeSeconds / 60)} minutes`;
      } else {
        timeFormatted = `${(timeSeconds / 3600).toFixed(1)} hours`;
      }
      
      return {
        totalTiles,
        estimatedSizeMB: totalSizeMB.toFixed(2),
        estimatedTimeSeconds: timeSeconds,
        estimatedTimeFormatted: timeFormatted,
        recommendedMinZoom: Math.max(region.minZoom, 10), // Don't go too low
        recommendedMaxZoom: Math.min(region.maxZoom, 16), // Don't go too high
      };
    } catch (error) {
      console.error('Error estimating download time:', error);
      return {
        totalTiles: 0,
        estimatedSizeMB: '0.00',
        estimatedTimeSeconds: 0,
        estimatedTimeFormatted: 'Unknown',
        recommendedMinZoom: 10,
        recommendedMaxZoom: 16,
      };
    }
  }

  /**
   * Get recommended zoom levels based on area size
   * @param {Object} region - Region data
   * @returns {Object} Recommended zoom levels
   */
  getRecommendedZoomLevels(region) {
    try {
      const latDiff = region.north - region.south;
      const lngDiff = region.east - region.west;
      
      // Calculate approximate area in square degrees
      const area = Math.abs(latDiff * lngDiff);
      
      let recommendedMinZoom = 10;
      let recommendedMaxZoom = 14;
      
      if (area > 1) {
        // Large area (>1° × 1°)
        recommendedMinZoom = 8;
        recommendedMaxZoom = 12;
      } else if (area > 0.1) {
        // Medium area (0.1° × 0.1° to 1° × 1°)
        recommendedMinZoom = 10;
        recommendedMaxZoom = 14;
      } else {
        // Small area (<0.1° × 0.1°)
        recommendedMinZoom = 12;
        recommendedMaxZoom = 16;
      }
      
      return {
        area,
        recommendedMinZoom,
        recommendedMaxZoom,
        tilesEstimate: this.estimateTileCount(region, recommendedMinZoom, recommendedMaxZoom),
      };
    } catch (error) {
      console.error('Error getting recommended zoom levels:', error);
      return {
        area: 0,
        recommendedMinZoom: 10,
        recommendedMaxZoom: 14,
        tilesEstimate: 0,
      };
    }
  }

  /**
   * Estimate tile count for zoom range
   * @param {Object} region - Region data
   * @param {number} minZoom - Minimum zoom
   * @param {number} maxZoom - Maximum zoom
   * @returns {number} Estimated tile count
   */
  estimateTileCount(region, minZoom, maxZoom) {
    let totalTiles = 0;
    
    for (let zoom = minZoom; zoom <= maxZoom; zoom++) {
      const tileRange = this.calculateTileRange(region, zoom);
      const xTiles = tileRange.maxX - tileRange.minX + 1;
      const yTiles = tileRange.maxY - tileRange.minY + 1;
      totalTiles += xTiles * yTiles;
    }
    
    return totalTiles;
  }

  /**
   * Validate region bounds
   * @param {Object} region - Region data
   * @returns {Object} Validation result
   */
  validateRegion(region) {
    try {
      const errors = [];
      const warnings = [];
      
      // Check bounds
      if (region.north <= region.south) {
        errors.push('North must be greater than south');
      }
      
      if (region.east <= region.west) {
        errors.push('East must be greater than west');
      }
      
      // Check zoom levels
      if (region.minZoom < 0 || region.minZoom > 19) {
        errors.push('Min zoom must be between 0 and 19');
      }
      
      if (region.maxZoom < 0 || region.maxZoom > 19) {
        errors.push('Max zoom must be between 0 and 19');
      }
      
      if (region.minZoom > region.maxZoom) {
        errors.push('Min zoom must be less than or equal to max zoom');
      }
      
      // Check zoom range (warnings)
      const zoomDiff = region.maxZoom - region.minZoom;
      if (zoomDiff > 6) {
        warnings.push('Large zoom range may result in many tiles');
      }
      
      if (region.maxZoom > 16) {
        warnings.push('Zoom levels above 16 may result in very large downloads');
      }
      
      // Estimate size
      const sizeEstimation = offlineMapStorage.estimateRegionSize(region);
      const estimatedSizeMB = parseFloat(sizeEstimation.estimatedSizeMB);
      
      if (estimatedSizeMB > 500) {
        warnings.push(`Large download size: ${estimatedSizeMB.toFixed(2)} MB`);
      } else if (estimatedSizeMB > 100) {
        warnings.push(`Moderate download size: ${estimatedSizeMB.toFixed(2)} MB`);
      }
      
      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        estimation: sizeEstimation,
        recommendedZoom: this.getRecommendedZoomLevels(region),
      };
    } catch (error) {
      console.error('Error validating region:', error);
      return {
        isValid: false,
        errors: ['Validation error'],
        warnings: [],
        estimation: { totalTiles: 0, estimatedSizeMB: '0.00' },
        recommendedZoom: { recommendedMinZoom: 10, recommendedMaxZoom: 14 },
      };
    }
  }
}

// Create and export singleton instance
const tileDownloader = new TileDownloader();
export default tileDownloader;