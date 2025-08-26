import axios from 'axios';
import NetInfo from '@react-native-community/netinfo';
import { Alert } from 'react-native';
import qs from 'qs';
import CryptoJS from 'crypto-js';
const secretKey = 'your-256-bit-secret-key';
const instance = axios.create({
    // baseURL: 'https://mygreenqube.com:4003/',
    baseURL:'http://34.87.10.106:4003/',
    timeout: 10000,
});
instance.interceptors.response.use(
    response => {
        try {
            const encrypted = response?.data?.encrypted;
            if (encrypted) {
                const bytes = CryptoJS.AES.decrypt(encrypted, secretKey);
                const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
                response.data = decryptedData;
            }
        } catch (err) {
            console.error('Decryption failed:', err);
        }
        return response;
    },
    error => Promise.reject(error)
);
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
    const speedTestUrl = 'https://www.google.com/favicon.ico'; // small file for speed test
    try {
        const start = Date.now();
        const response = await fetch(speedTestUrl, {
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
    } catch (error) {
        Alert.alert('Slow Internet', 'Could not verify internet speed.');
    }

    return true;
};

// Central error handler for Axios errors
const handleError = error => {
    if (error.code === 'ECONNABORTED') {
        Alert.alert('Timeout', 'The request took too long. Please try again.');
        return { status: 408, data: { message: 'Request timed out' } };
    }

    if (error.response) {
        const status = error.response.status || 500;
        const data = error.response.data || { message: 'Unknown error' };
        return { status, data };
    }

    Alert.alert('Error', 'Unable to connect to the server. Please try again.');
    return { status: 500, data: { message: 'Connection error' } };
};
export const axiosGet = async (url, token = null) => {
    if (!(await isInternetAvailable())) {
        return Promise.reject({ status: 0, data: { message: 'No internet' } });
    }
    try {
        const res = await instance.get(url, {
            headers: token ? { Authorization: token } : {},
        });
        return res;
    } catch (error) {
        throw handleError(error);
    }
};
export const axiosPost = async (url, body, token = null, isUrlEncoded = false) => {
    if (!(await isInternetAvailable())) {
        return Promise.reject({ status: 0, data: { message: 'No internet' } });
    }
    let contentType = 'application/json';
    if (isFormData(body)) {
        contentType = 'multipart/form-data';
    } else if (isUrlEncoded) {
        contentType = 'application/x-www-form-urlencoded';
    }
    const headers = {
        'Content-Type': contentType,
        ...(token && { Authorization: token }),
    };
    const payload = isUrlEncoded ? qs.stringify(body) : body;
    try {
        const res = await instance.post(url, payload, { headers });
        return res;
    } catch (error) {
        throw handleError(error);
    }
};
export const axiosPut = async (url, body, token = null, isUrlEncoded = false) => {
    if (!(await isInternetAvailable())) {
        return Promise.reject({ status: 0, data: { message: 'No internet' } });
    }
    let contentType = 'application/json';
    if (isFormData(body)) {
        contentType = 'multipart/form-data';
    } else if (isUrlEncoded) {
        contentType = 'application/x-www-form-urlencoded';
    }

    const headers = {
        'Content-Type': contentType,
        ...(token && { Authorization: token }),
    };

    const payload = isUrlEncoded ? qs.stringify(body) : body;

    try {
        const res = await instance.put(url, payload, { headers });
        return res;
    } catch (error) {
        throw handleError(error);
    }
};

export const axiosDelete = async (url, token = null) => {
    if (!(await isInternetAvailable())) {
        return Promise.reject({ status: 0, data: { message: 'No internet' } });
    }

    try {
        const res = await instance.delete(url, {
            headers: token ? { Authorization: token } : {},
        });
        return res;
    } catch (error) {
        throw handleError(error);
    }
};

export const axiosPatch = async (url, body, token = null) => {
    if (!(await isInternetAvailable())) {
        return Promise.reject({ status: 0, data: { message: 'No internet' } });
    }

    const headers = {
        'Content-Type': 'multipart/form-data',
        ...(token && { Authorization: token }),
    };

    try {
        const res = await instance.patch(url, body, {
            headers,
            onUploadProgress: progressEvent => {
                const percent = Math.round(
                    (progressEvent.loaded * 100) / progressEvent.total,
                );
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
