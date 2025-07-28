import axios from 'axios';
import {getItem} from './getDataFromStorage';
import CryptoJS from 'crypto-js';

const secretKey = 'greenQube_96740_64428'; // Must match encryption key

const instance = axios.create({
  baseURL: 'http://34.87.10.106:4003/',
  timeout: 5000,
  // headers: {
  //   'Content-Type': 'application/json',
  //   Accept: 'application/json',
  // },
});
 
  function findField(obj, keyToFind) {
    // console.log('zz encryt err')
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
    //  console.log('zz 1', response?.data?.data);
      const encrypted = findField(response?.data, 'respo');
       const ivHex = findField(response?.data, 'eid');
      if (encrypted != undefined) {

            const keyBytes = CryptoJS.SHA256('greenQube_96740_64428');
            const ivBytes = CryptoJS.enc.Hex.parse(ivHex);

            // Create the cipherParams object
            const cipherParams = CryptoJS.lib.CipherParams.create({
              ciphertext: CryptoJS.enc.Hex.parse(encrypted),
            });

            const decrypted = CryptoJS.AES.decrypt(
              cipherParams, // Use the properly typed cipherParams
              keyBytes,
              {
                iv: ivBytes,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7,
              },
            );

            return decrypted.toString(CryptoJS.enc.Utf8);

        // response.data = decryptedData;
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
// // instance.interceptors.request.use(
//   async config => {
//     try {
//       const loginUser_data = await getItem('loginUser_data');
//       const {token} = loginUser_data || {};

//       if (token) {
//         config.headers['Authorization'] = token;
//       }
//       return config;
//     } catch (error) {
//       console.error('Axios token load error:', error);
//       return config; 
//     }
//   },
//   error => Promise.reject(error),
// );
 export default instance;

