import RNFS from 'react-native-fs';
import { unzip } from 'react-native-zip-archive';
import AsyncStorage from 'react-native-encrypted-storage';

const API_URL = 'http://188.166.254.225:8000/download';

const STORAGE_KEYS = {
  LAST_MODIFIED: '@last_modified',
};

// =======================================
// STEP 1: CHECK SERVER (GET HEADERS)
// =======================================
const checkForUpdate = async (savedLastModified) => {
  const response = await fetch(API_URL, {
    method: 'GET', // safer than HEAD
    headers: savedLastModified
      ? { 'If-Modified-Since': savedLastModified }
      : {},
  });

  console.log('📡 CHECK STATUS:', response.status);

  // 304 → no update
  if (response.status === 304) {
    return { updated: false };
  }

  // get header (lowercase!)
  const lastModified = response.headers.get('last-modified');

  console.log('🆕 Server Last-Modified:', lastModified);

  return {
    updated: true,
    lastModified,
  };
};

// =======================================
// STEP 2: DOWNLOAD ZIP
// =======================================
const downloadZip = async (zipPath, onProgress) => {
  const download = RNFS.downloadFile({
    fromUrl: API_URL,
    toFile: zipPath,

    progress: (res) => {
      const percent =
        res.contentLength > 0
          ? (res.bytesWritten / res.contentLength) * 100
          : 0;

      onProgress(Math.round(percent));
    },

    progressDivider: 1,
  });

  const result = await download.promise;

  if (result.statusCode !== 200) {
    throw new Error(`Download failed: ${result.statusCode}`);
  }

  console.log('✅ Download complete');
};

// =======================================
// MAIN FUNCTION (FINAL)
// =======================================
export const downloadWithCache = async ({
  onProgress = () => {},
  onStage = () => {},
}) => {
  const zipPath = `${RNFS.DocumentDirectoryPath}/latest.zip`;
  const extractPath = RNFS.DocumentDirectoryPath;

  try {
    // ===============================
    // 1. GET SAVED LAST-MODIFIED
    // ===============================
    const savedLastModified = await AsyncStorage.getItem(
      STORAGE_KEYS.LAST_MODIFIED
    );

    console.log('📦 Saved Last-Modified:', savedLastModified);

    // ===============================
    // 2. CHECK UPDATE (IMPORTANT)
    // ===============================
    onStage('checking');

    const check = await checkForUpdate(savedLastModified);

    if (!check.updated) {
      console.log('⚡ No update needed');
      onStage('not_modified');
      return { updated: false };
    }

    // ===============================
    // 3. CLEAN OLD ZIP
    // ===============================
    if (await RNFS.exists(zipPath)) {
      await RNFS.unlink(zipPath);
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

    await unzip(zipPath, extractPath);

    console.log('✅ Unzip complete');

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
    console.error('❌ ERROR:', error);

    if (await RNFS.exists(zipPath)) {
      await RNFS.unlink(zipPath);
    }

    throw error;
  }
};