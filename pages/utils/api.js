import axios from 'axios';
import NetInfo from '@react-native-community/netinfo';
import {Alert} from 'react-native';
import qs from 'qs';
import CryptoJS from 'crypto-js';
import {Toast} from '@sekizlipenguen/react-native-popup-confirm-toast';
import {AlertMesg} from '../Common/ToastAlert';
import {getItem, removeItem} from '../../config/getDataFromStorage';
import {resetTo} from './NavigationUtils';
import {cacheManager} from './mmkvStorage';
import {BASE_URL, ENCRYPTION_KEY} from '../../config/environment';
const STORAGE_KEYS = [
  'logoImageData',
  'loginUser_data',
  'profileImgData',
  'userNameData',
  'userType',
  'bottomBannerData',
  'topBannerData',
  'currency',
  'fcmToken',
  'company_website',
];

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const SLOW_THRESHOLD = 30000;

const instance = axios.create({
  baseURL: BASE_URL,

  // baseURL: 'http://134.209.155.11:4003/',
  // baseURL: 'http://134.209.155.11:6006/',
  // baseURL: 'https://mygreenqube.com:4003/',
  timeout: 50000,
});

instance.interceptors.request.use(config => {
  config.metadata = {startTime: new Date().getTime()};
  return config;
});

// Decryption Interceptor logic
const setupInterceptors = () => {
  const encKey = 'greenQube_96740_64428';
  instance.interceptors.response.use(
    response => {
      const start = response.config?.metadata?.startTime;
      if (start && new Date().getTime() - start > SLOW_THRESHOLD) {
        // console.log("Slow Network Detected");
      }
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
};
setupInterceptors();

const isInternetAvailable = async (silent = false) => {
  const state = await NetInfo.fetch();
  const connected = !!(state.isConnected && state.isInternetReachable);
  if (!connected && !silent) {
    Toast.show({
      time: 2,
      text: `You are offline. Showing cached data.`,
      ...AlertMesg[0],
    });
  }
  return connected;
};

const logCurl = ({url, method, headers, body}) => {
  let curl = `curl -X ${method} 'http://134.209.155.11:4003/${url}'`;

  // 1. Format Headers
  Object.entries(headers || {}).forEach(([key, value]) => {
    curl += ` \\\n  -H '${key}: ${value}'`;
  });

  // 2. Format Body
  if (body) {
    if (body instanceof FormData) {
      // Handle FormData (Multipart)
      body._parts.forEach(([key, value]) => {
        if (typeof value === 'object' && value?.uri) {
          // It's a file/image
          curl += ` \\\n  -F '${key}=@${value.uri}'`;
        } else {
          // It's a text field
          curl += ` \\\n  -F '${key}=${value}'`;
        }
      });
    } else if (typeof body === 'string' && body.includes('=')) {
      // Handle x-www-form-urlencoded (already stringified by qs)
      curl += ` \\\n  --data '${body}'`;
    } else {
      // Handle standard JSON
      const jsonBody =
        typeof body === 'string' ? body : JSON.stringify(body, null, 2);
      curl += ` \\\n  --data '${jsonBody}'`;
    }
  }

  console.log('\n🚀 ====== CURL REQUEST ======\n');
  console.log(curl);
  console.log('\n==============================\n');
};

// --- GET ---
export const axiosGet = async (
  url,
  token = null,
  extraHeaders = {},
  abortController = null,
) => {
  const cacheKey = `GET_${url}`;
  const online = await isInternetAvailable(true);
  if (!online) {
    const cached = cacheManager.getCache(cacheKey);
    if (cached) return {data: cached, status: 200, fromCache: true};
    return Promise.reject({
      status: 0,
      data: {message: 'No internet & no cache'},
    });
  }
  console.log("url",url)
  console.log("extraHeaders",extraHeaders)
  try {
    const response = await instance.get(url, {
      headers: {...(token && {Authorization: token}), ...extraHeaders},
      signal: abortController?.signal,
    });
    cacheManager.setCache(cacheKey, response.data);
    return response;
  } catch (error) {
    console.log('errorAPI', error);
    console.log('url', url);

    if (!online) {
      const cached = cacheManager.getCache(cacheKey);
      if (cached) return {data: cached, status: 200, fromCache: true};
    }
    throw await handleError(error);
  }
};

// --- POST ---
export const axiosPost = async (
  url,
  body,
  token = null,
  isUrlEncoded = false,
  extraHeaders = {},
  abortController = null,
) => {
  const online = await isInternetAvailable(true);
  //  console.log('body==', body);
  if (!online) {
    cacheManager.addToQueue({
      url,
      body,
      token,
      isUrlEncoded,
      extraHeaders,
      method: 'POST',
    });
    return {data: {message: 'Queued Locally'}, status: 202, isOffline: true};
  }

  const payload = isUrlEncoded ? qs.stringify(body) : body;
  const headers = {
    'Content-Type': isFormData(body)
      ? 'multipart/form-data'
      : isUrlEncoded
      ? 'application/x-www-form-urlencoded'
      : 'application/json',
    ...(token && {Authorization: token}),
    ...extraHeaders,
  };
  // const headers = {
  //   ...(token && {Authorization: token}),
  //   ...extraHeaders,
  // };
  logCurl({url, method: 'POST', headers, body: payload});
  // console.log('check', url, body, headers);
  try {
    return await instance.post(url, payload, {
      headers,
      signal: abortController?.signal,
    });
  } catch (error) {
    console.log('gggg', error);

    throw await handleError(error);
  }
};

// --- PUT ---
export const axiosPut = async (
  url,
  body,
  token = null,
  isUrlEncoded = false,
  extraHeaders = {},
  abortController = null,
) => {
  const online = await isInternetAvailable(true);
  const headers = {
    'Content-Type': isFormData(body)
      ? 'multipart/form-data'
      : isUrlEncoded
      ? 'application/x-www-form-urlencoded'
      : 'application/json',
    ...(token && {Authorization: token}),
    ...extraHeaders,
  };
  if (!online) {
    cacheManager.addToQueue({
      url,
      body,
      token,
      isUrlEncoded,
      headers,
      method: 'PUT',
    });
    return {data: {message: 'Queued Locally'}, status: 202, isOffline: true};
  }
  const payload = isUrlEncoded ? qs.stringify(body) : body;
  logCurl({url, method: 'PUT', headers, body: payload});

  try {
    return await instance.put(url, payload, {
      headers: headers,
      signal: abortController?.signal,
    });
  } catch (error) {
    throw await handleError(error);
  }
};

// Helpers
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

const handleError = async error => {
  if (error?.response?.status === 409) {
    console.log('error', error?.response?.status);
    return {
      status: error.response.status || 409,
      data: error.response.data || {message: 'Unknown error'},
    };
  }

  if (axios.isCancel(error) || error.name === 'AbortError')
    return {status: 499, data: {message: 'Request cancelled'}};
  if (error.code === 'ECONNABORTED')
    return {status: 408, data: {message: 'Request timed out'}};
  if (
    error?.response?.status === 401 &&
    error?.response?.data?.data?.code == 'TOKEN_EXPIRED'
  ) {
    await delay(3000);
    resetTo('Login', {locale: getItem('loginUser_data').lan_id || 1});
    await Promise.all(STORAGE_KEYS.map(key => removeItem(key)));
  }
  return {
    status: error?.response?.status || 500,
    data: error?.response?.data || {message: 'Connection error'},
  };
};

export const axiosDelete = async (
  url,
  token = null,
  extraHeaders = {},
  abortController = null,
) => {
  if (!(await isInternetAvailable()))
    return Promise.reject({status: 0, data: {message: 'No internet'}});
  try {
    return await instance.delete(url, {
      headers: {...(token && {Authorization: token}), ...extraHeaders},
      signal: abortController?.signal,
    });
  } catch (error) {
    throw await handleError(error);
  }
};

export default {
  getInstance: () => instance,
  axiosGet,
  axiosPost,
  axiosPut,
  axiosDelete,
};
