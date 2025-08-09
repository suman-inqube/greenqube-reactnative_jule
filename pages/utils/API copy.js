import axios from 'axios';
import NetInfo from '@react-native-community/netinfo';
import { Alert } from 'react-native';
import qs from 'qs';
const instance = axios.create({
  baseURL: 'http://18.233.99.1:2500/v1/redbus/',
  timeout: 10000,
});
const isConnected = async () => {
  const state = await NetInfo.fetch();
  if (!state.isConnected) {
    Alert.alert('No Internet', 'Please check your internet connection.');
    return false;
  }
  return true;
};
const isFormData = (data) => {
  return typeof data === 'object' && data instanceof FormData;
};
const handleError = (error) => {
  const status = error?.response?.status || 500;
  const data = error?.response?.data || { message: 'Unknown error' };
  return { status, data };
};
const axiosGet = async (url, token = null) => {
  if (!(await isConnected())) return Promise.reject({ status: 0, data: { message: 'No internet' } });
  try {
    const res = await instance.get(url, {
      headers: token ? { Authorization: token } : {},
    });
    return res;
  } catch (error) {
    throw handleError(error);
  }
};
const axiosPost = async (url, body, token = null, isUrlEncoded = false) => {
  if (!(await isConnected())) return Promise.reject({ status: 0, data: { message: 'No internet' } });
  const headers = {
    ...(token && { Authorization: token }),
    'Content-Type': isFormData(body)
      ? 'multipart/form-data'
      : isUrlEncoded
      ? 'application/x-www-form-urlencoded'
      : 'application/json',
  };
  try {
    const payload = isUrlEncoded ? qs.stringify(body) : body;
    const res = await instance.post(url, payload, { headers });
    return res;
  } catch (error) {
    throw handleError(error);
  }
};
const axiosPut = async (url, body, token = null, isUrlEncoded = false) => {
  if (!(await isConnected())) return Promise.reject({ status: 0, data: { message: 'No internet' } });
  const headers = {
    ...(token && { Authorization: token }),
    'Content-Type': isFormData(body)
      ? 'multipart/form-data'
      : isUrlEncoded
      ? 'application/x-www-form-urlencoded'
      : 'application/json',
  };
  try {
    const payload = isUrlEncoded ? qs.stringify(body) : body;
    const res = await instance.put(url, payload, { headers });
    return res;
  } catch (error) {
    throw handleError(error);
  }
};
const axiosDelete = async (url, token = null) => {
  if (!(await isConnected())) return Promise.reject({ status: 0, data: { message: 'No internet' } });
  try {
    const res = await instance.delete(url, {
      headers: token ? { Authorization: token } : {},
    });
    return res;
  } catch (error) {
    throw handleError(error);
  }
};
const axiosPatch = async (url, body, token = null) => {
  if (!(await isConnected())) return Promise.reject({ status: 0, data: { message: 'No internet' } });
  const headers = {
    ...(token && { Authorization: token }),
    'Content-Type': 'multipart/form-data',
  };
  try {
    const res = await instance.patch(url, body, {
      headers,
      onUploadProgress: (progressEvent) => {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        console.log(`Upload Progress: ${percent}%`);
      },
    });
    return res;
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
