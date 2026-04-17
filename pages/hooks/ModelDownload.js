import RNFS from 'react-native-fs';
import { unzip } from 'react-native-zip-archive';
import AsyncStorage from 'react-native-encrypted-storage';
import NetInfo from '@react-native-community/netinfo';

const API_URL = 'http://188.166.254.225:8000/download';

const TIMEOUT_MS = 8 * 60 * 1000; // 8 minutes
const MAX_RETRIES = 3;

const STORAGE_KEYS = {
  LAST_MODIFIED: '@last_modified',
};

// =======================================
// INTERNET CHECK
// =======================================
const checkInternet = async () => {
  const state = await NetInfo.fetch();
  if (!state.isConnected) {
    throw new Error('No internet connection');
  }
};

// =======================================
// FETCH WITH TIMEOUT
// =======================================
const fetchWithTimeout = async (url, options = {}, timeout = TIMEOUT_MS) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
};

// =======================================
// STEP 1: CHECK SERVER
// =======================================
const checkForUpdate = async (savedLastModified) => {
  const response = await fetchWithTimeout(API_URL, {
    method: 'GET',
    headers: savedLastModified
      ? { 'If-Modified-Since': savedLastModified }
      : {},
  });

  console.log('📡 CHECK STATUS:', response.status);

  if (response.status === 304) {
    return { updated: false };
  }

  const lastModified = response.headers.get('last-modified');

  console.log('🆕 Server Last-Modified:', lastModified);

  return {
    updated: true,
    lastModified,
  };
};

// =======================================
// STEP 2: DOWNLOAD WITH RETRY + RESUME
// =======================================
const downloadZip = async (zipPath, onProgress) => {
  let attempt = 0;

  while (attempt < MAX_RETRIES) {
    try {
      console.log(`⬇️ Download attempt ${attempt + 1}`);

      const exists = await RNFS.exists(zipPath);
      let headers = {};

      if (exists) {
        const stats = await RNFS.stat(zipPath);
        headers['Range'] = `bytes=${stats.size}-`;
        console.log('🔁 Resuming from:', stats.size);
      }

      const download = RNFS.downloadFile({
        fromUrl: API_URL,
        toFile: zipPath,
        headers,

        background: true,
        discretionary: true,

        progress: (res) => {
          const percent =
            res.contentLength > 0
              ? (res.bytesWritten / res.contentLength) * 100
              : 0;

          onProgress(Math.floor(percent));
        },

        progressDivider: 1,
      });

      const result = await download.promise;

      if (result.statusCode === 200 || result.statusCode === 206) {
        console.log('✅ Download success');
        return;
      }

      throw new Error(`HTTP ${result.statusCode}`);
    } catch (error) {
      attempt++;
      console.log(`❌ Retry ${attempt}:`, error.message);

      if (attempt >= MAX_RETRIES) {
        throw error;
      }
    }
  }
};

// =======================================
// SAFE UNZIP
// =======================================
const safeUnzip = async (zipPath, extractPath) => {
  try {
    await unzip(zipPath, extractPath);
    console.log('✅ Unzip complete');
  } catch (err) {
    console.log('❌ Unzip failed (corrupt zip)');
    throw new Error('Zip extraction failed');
  }
};

// =======================================
// MAIN FUNCTION
// =======================================
export const downloadWithCache = async ({
  onProgress = () => {},
  onStage = () => {},
}) => {
  const zipPath = `${RNFS.DocumentDirectoryPath}/latest.zip`;
  const extractPath = RNFS.DocumentDirectoryPath;

  try {
    // ===============================
    // 0. INTERNET CHECK
    // ===============================
    await checkInternet();

    // ===============================
    // 1. GET SAVED LAST-MODIFIED
    // ===============================
    const savedLastModified = await AsyncStorage.getItem(
      STORAGE_KEYS.LAST_MODIFIED
    );

    console.log('📦 Saved Last-Modified:', savedLastModified);

    // ===============================
    // 2. CHECK UPDATE
    // ===============================
    onStage('checking');

    const check = await checkForUpdate(savedLastModified);

    if (!check.updated) {
      console.log('⚡ No update needed');
      onStage('not_modified');
      return { updated: false };
    }

    // ===============================
    // 3. CLEAN OLD ZIP (ONLY IF CORRUPT)
    // ===============================
    if (await RNFS.exists(zipPath)) {
      const stats = await RNFS.stat(zipPath);
      if (stats.size < 1000) {
        console.log('🧹 Removing corrupt zip');
        await RNFS.unlink(zipPath);
      }
    }

    // ===============================
    // 4. DOWNLOAD
    // ===============================
    onStage('downloading');
    await downloadZip(zipPath, onProgress);

    // ===============================
    // 5. UNZIP
    // ===============================
    onStage('extracting');
    await safeUnzip(zipPath, extractPath);

    // ===============================
    // 6. DELETE ZIP
    // ===============================
    if (await RNFS.exists(zipPath)) {
      await RNFS.unlink(zipPath);
    }

    // ===============================
    // 7. SAVE LAST-MODIFIED
    // ===============================
    if (check.lastModified) {
      await AsyncStorage.setItem(
        STORAGE_KEYS.LAST_MODIFIED,
        check.lastModified
      );
    }

    onStage('complete');

    return {
      updated: true,
      lastModified: check.lastModified,
    };
  } catch (error) {
    console.error('❌ FINAL ERROR:', error);

    if (await RNFS.exists(zipPath)) {
      await RNFS.unlink(zipPath);
    }

    throw error;
  }
};