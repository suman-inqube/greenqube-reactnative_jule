import axios from 'axios';
import CryptoJS from 'crypto-js';
import {NativeModules} from 'react-native';

let axiosInstance = null;

const findField = (obj, keyToFind) => {
  if (obj === null || typeof obj !== 'object') return undefined;

  if (Object.prototype.hasOwnProperty.call(obj, keyToFind))
    return obj[keyToFind];

  for (const key in obj) {
    if (typeof obj[key] === 'object') {
      const result = findField(obj[key], keyToFind);
      if (result !== undefined) return result;
    }
  }
  return undefined;
};

export const getAxiosInstance = async () => {
  const {ConfigModule} = NativeModules;
  if (axiosInstance) {
    return axiosInstance;
  }

  try {
    // const baseURL = await ConfigModule.getBaseURL();
    const encKey = 'greenQube_96740_64428';

    axiosInstance = axios.create({
      baseURL: 'http://134.209.155.11:4003/',
      // baseURL:' https://mygreenqube.com:4003/',
      timeout: 5000,
    });

    axiosInstance.interceptors.response.use(
      response => {
        try {
          const encrypted = findField(response?.data, 'respo');
          const ivHex = findField(response?.data, 'eid');

          if (encrypted !== undefined && ivHex !== undefined) {
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
            return {
              data: parsed,
              status: 200,
            };
          }
          return response;
        } catch (err) {
          console.error('Decryption failed:', err);
          return response;
        }
      },
      error => Promise.reject(error),
    );

    return axiosInstance;
  } catch (error) {
    console.error('Failed to create Axios instance:', error);
    throw error;
  }
};
