import axios from 'axios';
import {getItem} from './getDataFromStorage';
const instance = axios.create({
  baseURL: 'https://mygreenqube.com:4003/',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});
instance.interceptors.request.use(
  async config => {
    try {
      const loginUser_data = await getItem('loginUser_data');
      const {token} = loginUser_data || {};

      if (token) {
        config.headers['Authorization'] = token;
      }
      return config;
    } catch (error) {
      console.error('Axios token load error:', error);
      return config; 
    }
  },
  error => Promise.reject(error),
);
export default instance;