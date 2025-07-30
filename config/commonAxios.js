import axios from 'axios';
import {getItem} from './getDataFromStorage';
import CryptoJS from 'crypto-js';
import {NativeModules} from 'react-native';
 
// const secretKey = 'greenQube_96740_64428'; // Must match encryption key

const getApiConfig = async (item) => {
  const {ConfigModule} = NativeModules;
 
  try {
    // const [BASE_URL, key] = Promise.all([
      
    //   ,
    // ]);

    // const BASE_URL = await ConfigModule.getBaseURL();
    //  const key = await ConfigModule.getEncryptedKey();
    
     if (item === 'BASE_URL') {
       return await ConfigModule.getBaseURL();
     } else if (item === 'key'){
       return await ConfigModule.getEncryptedKey();
     }
    // const decryptSecretKey = config.encryptedKey;
  }catch(err){
    console.log('config index',err);

  }
}
// const getEncryptKey = async () => {
 
//   try {
//     const key = await ConfigModule.getEncryptedKey();
//     console.log('key', key);

//     return key;
//     // const decryptSecretKey = config.encryptedKey;
//   } catch (err) {
//     console.log('config index', err);
//   }
// };
const instance = axios.create({
  baseURL: 'http://34.87.10.106:4003/',
  timeout: 5000,
});

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


instance.interceptors.response.use(
   response => {
    try {
       console.log('BASE_URL22', getApiConfig('BASE_URL'));
    console.log('check12', getApiConfig('key'));
      const encrypted = findField(response?.data, 'respo');
       const ivHex = findField(response?.data, 'eid');
      if (encrypted != undefined) {

            const keyBytes = CryptoJS.SHA256(getApiConfig('key'));
            const ivBytes = CryptoJS.enc.Hex.parse(ivHex);

            const cipherParams = CryptoJS.lib.CipherParams.create({
              ciphertext: CryptoJS.enc.Hex.parse(encrypted),
            });

            const decrypted = CryptoJS.AES.decrypt(
              cipherParams,
              keyBytes,
              {
                iv: ivBytes,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7,
              },
            );

            const parsed = JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
            const resultJson = {
              data: parsed,
              status: 200,
            };
            console.log('check13');
             return resultJson;

        
      }else{
         response.data = response?.data;
      }
    } catch (err) {
      console.error('Decryption failed:', err);
    }
     return response;
  },
  error => Promise.reject(error),
);
 export default instance;

