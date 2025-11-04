import axios from 'axios';
import NetInfo from '@react-native-community/netinfo';
import { Toast } from '@sekizlipenguen/react-native-popup-confirm-toast';
import qs from 'qs';
import CryptoJS from 'crypto-js';
import { AlertMesg } from '../Common/ToastAlert';

// ================================
// ⚙️ Configuration
// ================================
// const BASE_URL = 'https://mygreenqube.com:4003/';
const BASE_URL = 'http://134.209.155.11:4003/';
const TIMEOUT = 10000;
const SLOW_THRESHOLD = 3000;
const ENC_KEY = 'greenQube_96740_64428';

// ================================
// 🚀 Axios Instance
// ================================
const instance = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT,
});

// ================================
// 🕒 Request Timer Setup
// ================================
instance.interceptors.request.use(config => {
  config.metadata = { startTime: new Date().getTime() };
  return config;
});

// ================================
// 🔐 Response Interceptor
// ================================
instance.interceptors.response.use(
  response => {
    // Measure request duration
    const start = response.config?.metadata?.startTime;
    if (start) {
      const duration = new Date().getTime() - start;
      if (duration > SLOW_THRESHOLD) {
        Toast.show({
          time: 2,
          text: 'Your network is slow. Please wait...',
          ...AlertMesg[0],
        });
      }
    }

    // Try AES Decryption
    try {
      const encrypted = findField(response?.data, 'respo');
      const ivHex = findField(response?.data, 'eid');
      if (encrypted && ivHex) {
        const keyBytes = CryptoJS.SHA256(ENC_KEY);
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
        return { data: parsed, status: 200 };
      }
    } catch (err) {
      console.error('Decryption failed:', err);
    }

    return response;
  },
  error => handleError(error)
);

// ================================
// 🔍 Utility: Recursive Field Finder
// ================================
function findField(obj, keyToFind) {
  if (obj === null || typeof obj !== 'object') return undefined;
  if (Object.prototype.hasOwnProperty.call(obj, keyToFind)) return obj[keyToFind];
  for (let key in obj) {
    if (typeof obj[key] === 'object') {
      const result = findField(obj[key], keyToFind);
      if (result !== undefined) return result;
    }
  }
  return undefined;
}

// ================================
// 🌐 Internet Connectivity Check
// ================================
const isInternetAvailable = async () => {
  const state = await NetInfo.fetch();
  if (!state.isConnected || !state.isInternetReachable) {
    Toast.show({
      time: 2,
      text: 'No internet connection. Please check your network.',
      ...AlertMesg[0],
    });
    return false;
  }
  return true;
};

// ================================
// ⚠️ Centralized Error Handler
// ================================
const handleError = (error,url) => {
  let message = 'Something went wrong. Please try again.';
  let status = 500;
  if (axios.isCancel(error) || error.name === 'AbortError') {
    message = 'Request was cancelled.';
    status = 499;
  } else if (error.code === 'ECONNABORTED') {
    message = 'The request took too long. Please try again.';
    status = 408;
  } else if (error.response) {
    status = error.response.status || 500;
    const data = error.response.data || {};
    if (status === 401) message = data.message+url || 'Session expired. Please log in again.';
    else if (status === 404) message = data.message+url || 'Requested resource not found.';
    else if (status >= 500) message = data.message+url || 'Server is unavailable right now.';
    else message = data.message || 'Unexpected error occurred.';
  } else {
    message = 'Network error. Please check your connection.';
  }
console.error(message)

  Toast.show({
    time: 2,
    text: url,
    ...AlertMesg[0],
  });

  return Promise.reject({ status, data: { message } });
};

// ================================
// 📦 Helper Functions
// ================================
const isFormData = data => data instanceof FormData;

// ================================
// 🌍 API Methods
// ================================
export const axiosGet = async (url, token = null, extraHeaders = {}, abortController = null) => {
  if (!(await isInternetAvailable())) return Promise.reject({ status: 0, data: { message: 'No internet' } });
  const controller = abortController || new AbortController();
  try {
    const response = await instance.get(url, {
      headers: { ...(token && { Authorization: token }), ...extraHeaders },
      signal: controller.signal,
    });
    return response;
  } catch (error) {
    return handleError(error,url);
  }
};

export const axiosPost = async (url, body, token = null, isUrlEncoded = false, extraHeaders = {}, abortController = null) => {
  if (!(await isInternetAvailable())) return Promise.reject({ status: 0, data: { message: 'No internet' } });
  const controller = abortController || new AbortController();
  let contentType = 'application/json';
  if (isFormData(body)) contentType = 'multipart/form-data';
  else if (isUrlEncoded) contentType = 'application/x-www-form-urlencoded';
  const payload = isUrlEncoded ? qs.stringify(body) : body;

  try {
    const response = await instance.post(url, payload, {
      headers: { 'Content-Type': contentType, ...(token && { Authorization: token }), ...extraHeaders },
      signal: controller.signal,
    });

    // Show success toast if needed
    if (response?.data?.message) {
      Toast.show({
        time: 2,
        text: response.data.message,
        ...AlertMesg[1],
      });
    }

    return response;
  } catch (error) {
    return handleError(error);
  }
};

export const axiosPut = async (url, body, token = null, isUrlEncoded = false, extraHeaders = {}, abortController = null) => {
  if (!(await isInternetAvailable())) return Promise.reject({ status: 0, data: { message: 'No internet' } });
  const controller = abortController || new AbortController();
  let contentType = 'application/json';
  if (isFormData(body)) contentType = 'multipart/form-data';
  else if (isUrlEncoded) contentType = 'application/x-www-form-urlencoded';
  const payload = isUrlEncoded ? qs.stringify(body) : body;

  try {
    return await instance.put(url, payload, {
      headers: { 'Content-Type': contentType, ...(token && { Authorization: token }), ...extraHeaders },
      signal: controller.signal,
    });
  } catch (error) {
    return handleError(error);
  }
};

export const axiosDelete = async (url, token = null, extraHeaders = {}, abortController = null) => {
  if (!(await isInternetAvailable())) return Promise.reject({ status: 0, data: { message: 'No internet' } });
  const controller = abortController || new AbortController();
  try {
    return await instance.delete(url, {
      headers: { ...(token && { Authorization: token }), ...extraHeaders },
      signal: controller.signal,
    });
  } catch (error) {
    return handleError(error);
  }
};

export const axiosPatch = async (url, body, token = null, extraHeaders = {}, abortController = null) => {
  if (!(await isInternetAvailable())) return Promise.reject({ status: 0, data: { message: 'No internet' } });
  const controller = abortController || new AbortController();
  try {
    return await instance.patch(url, body, {
      headers: { 'Content-Type': 'multipart/form-data', ...(token && { Authorization: token }), ...extraHeaders },
      signal: controller.signal,
      onUploadProgress: e => {
        const percent = Math.round((e.loaded * 100) / e.total);
        console.log(`Upload Progress: ${percent}%`);
      },
    });
  } catch (error) {
    return handleError(error);
  }
};

// ================================
// 📤 Export Instance
// ================================
export default {
  getInstance: () => instance,
  axiosGet,
  axiosPost,
  axiosPut,
  axiosDelete,
  axiosPatch,
};
