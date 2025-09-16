import axios from 'axios';
import NetInfo from '@react-native-community/netinfo';
import {Alert, NativeModules} from 'react-native';
import qs from 'qs';
import CryptoJS from 'crypto-js';
const instance = axios.create({
  baseURL: 'http://134.209.155.11:4003/',

  // baseURL: 'https://mygreenqube.com:4003/',

  timeout: 10000,
});

// 🔹 Add decode support
(async () => {
  try {
    const {ConfigModule} = NativeModules;
    const encKey = await ConfigModule.getEncryptedKey();

    instance.interceptors.response.use(
      response => {
        try {
          const encrypted = findField(response?.data, 'respo');
          const ivHex = findField(response?.data, 'eid');

          if (encrypted && ivHex) {
            const keyBytes = CryptoJS.SHA256(encKey);
            const ivBytes = CryptoJS.enc.Hex.parse(ivHex);

            const cipherParams = CryptoJS.lib.CipherParams.create({
              ciphertext: CryptoJS.enc.Hex.parse(encrypted),
            });

            const decrypted = CryptoJS.AES.decrypt(cipherParams, keyBytes, {
              iv: ivBytes,
              mode: CryptoJS.mode.CBC,
              padding: CryptoJS.pad.Pkcs7,
            });

            const parsed = JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
            return {data: parsed, status: 200};
          }
        } catch (err) {
          console.error('Decryption failed:', err);
        }
        return response;
      },
      error => Promise.reject(error),
    );
  } catch (err) {
    console.error('Failed to setup decode interceptor:', err);
  }
})();

// Helper to find nested field
function findField(obj, keyToFind) {
  if (obj === null || typeof obj !== 'object') return undefined;
  if (obj.hasOwnProperty(keyToFind)) return obj[keyToFind];
  for (let key in obj) {
    if (typeof obj[key] === 'object') {
      const result = findField(obj[key], keyToFind);
      if (result !== undefined) return result;
    }
  }
  return undefined;
}

const isFormData = data => data instanceof FormData;

const isInternetAvailable = async () => {
  const state = await NetInfo.fetch();
  if (!state.isConnected) {
    Alert.alert('No Network', 'You are not connected to a network.');
    return false;
  }
  if (!state.isInternetReachable) {
    Alert.alert(
      'No Internet',
      'You are connected to a network but have no internet access.',
    );
    return false;
  }
  try {
    const start = Date.now();
    const response = await fetch('https://www.google.com/favicon.ico', {
      method: 'HEAD',
      cache: 'no-store',
    });
    const duration = Date.now() - start;
    if (!response.ok || duration > 2000) {
      Alert.alert(
        'Slow Internet',
        'Your internet connection seems to be slow.',
      );
    }
  } catch {
    Alert.alert('Slow Internet', 'Could not verify internet speed.');
  }
  return true;
};

const handleError = error => {
  if (axios.isCancel(error) || error.name === 'AbortError') {
    return {status: 499, data: {message: 'Request cancelled'}};
  }
  if (error.code === 'ECONNABORTED') {
    Alert.alert('Timeout', 'The request took too long. Please try again.');
    return {status: 408, data: {message: 'Request timed out'}};
  }
  if (error.response) {
    return {
      status: error.response.status || 500,
      data: error.response.data || {message: 'Unknown error'},
    };
  }
  Alert.alert('Error', 'Unable to connect to the server. Please try again.');
  return {status: 500, data: {message: 'Connection error'}};
};

// ====== GET ======
export const axiosGet = async (
  url,
  token = null,
  extraHeaders = {},
  abortController = null,
) => {
  if (!(await isInternetAvailable()))
    return Promise.reject({status: 0, data: {message: 'No internet'}});
  const controller = abortController || new AbortController();
  console.log(url);
  try {
    return await instance.get(url, {
      headers: {...(token && {Authorization: token}), ...extraHeaders},
      signal: controller.signal,
    });
  } catch (error) {
    throw handleError(error);
  }
};

// ====== POST ======
export const axiosPost = async (
  url,
  body,
  token = null,
  isUrlEncoded = false,
  extraHeaders = {},
  abortController = null,
) => {
  console.log('URL', url);
  if (!(await isInternetAvailable()))
    return Promise.reject({status: 0, data: {message: 'No internet'}});
  const controller = abortController || new AbortController();
  let contentType = 'application/json';
  if (isFormData(body)) contentType = 'multipart/form-data';
  else if (isUrlEncoded) contentType = 'application/x-www-form-urlencoded';
  const payload = isUrlEncoded ? qs.stringify(body) : body;
  try {
    return await instance.post(url, payload, {
      headers: {
        'Content-Type': contentType,
        ...(token && {Authorization: token}),
        ...extraHeaders,
      },
      signal: controller.signal,
    });
  } catch (error) {
    throw handleError(error);
  }
};

// ====== PUT ======
export const axiosPut = async (
  url,
  body,
  token = null,
  isUrlEncoded = false,
  extraHeaders = {},
  abortController = null,
) => {
  if (!(await isInternetAvailable()))
    return Promise.reject({status: 0, data: {message: 'No internet'}});
  const controller = abortController || new AbortController();
  let contentType = 'application/json';
  if (isFormData(body)) contentType = 'multipart/form-data';
  else if (isUrlEncoded) contentType = 'application/x-www-form-urlencoded';
  const payload = isUrlEncoded ? qs.stringify(body) : body;
  try {
    return await instance.put(url, payload, {
      headers: {
        'Content-Type': contentType,
        ...(token && {Authorization: token}),
        ...extraHeaders,
      },
      signal: controller.signal,
    });
  } catch (error) {
    throw handleError(error);
  }
};

// ====== DELETE ======
export const axiosDelete = async (
  url,
  token = null,
  extraHeaders = {},
  abortController = null,
) => {
  if (!(await isInternetAvailable()))
    return Promise.reject({status: 0, data: {message: 'No internet'}});
  const controller = abortController || new AbortController();
  try {
    return await instance.delete(url, {
      headers: {...(token && {Authorization: token}), ...extraHeaders},
      signal: controller.signal,
    });
  } catch (error) {
    throw handleError(error);
  }
};

// ====== PATCH ======
export const axiosPatch = async (
  url,
  body,
  token = null,
  extraHeaders = {},
  abortController = null,
) => {
  if (!(await isInternetAvailable()))
    return Promise.reject({status: 0, data: {message: 'No internet'}});
  const controller = abortController || new AbortController();
  try {
    return await instance.patch(url, body, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(token && {Authorization: token}),
        ...extraHeaders,
      },
      signal: controller.signal,
      onUploadProgress: e => {
        const percent = Math.round((e.loaded * 100) / e.total);
        console.log(`Upload Progress: ${percent}%`);
      },
    });
  } catch (error) {
    throw handleError(error);
  }
};

export default {
  getInstance: () => instance,
  axiosGet,
  axiosPost,
  axiosPut,
  axiosDelete,
  axiosPatch,
};
