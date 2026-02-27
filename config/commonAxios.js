import axios from 'axios';
import {getItem} from './getDataFromStorage';
import CryptoJS from 'crypto-js';
import {NativeModules} from 'react-native';

// const secretKey = 'greenQube_96740_64428'; // Must match encryption key
let instance;

const commonAxios = async () => {
  const {ConfigModule} = NativeModules;

  try {
    const baseURL = "http://134.209.155.11:4003/";
  //  const baseURL = 'http://134.209.155.11:6006/';
          //  const baseURL = 'https://mygreenqube.com:4003/';
     
     const encKey = "greenQube_96740_64428";

    instance = axios.create({
      baseURL: baseURL, // use dynamic URL
      timeout: 50000,
    });

    instance.interceptors.response.use(
      response => {
        try {
          console.log('BASE_URL22', baseURL);
          console.log('check12', encKey);
          const encrypted = findField(response?.data, 'respo');
          const ivHex = findField(response?.data, 'eid');
          if (encrypted != undefined) {
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
            const resultJson = {
              data: parsed,
              status: 200,
            };
            console.log('check13');
            return resultJson;
          } else {
            response.data = response?.data;
          }
        } catch (err) {
          console.error('Decryption failed:', err);
        }
        return response;
      },
      error => Promise.reject(error),
    );
  } catch (error) {
    console.error('Error creating Axios instance:', error);
    throw error;
  }

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
};
export default commonAxios;
