import axios from 'axios';
import NetInfo from '@react-native-community/netinfo';
import { Alert } from 'react-native';
import qs from 'qs';

const instance = axios.create({
    baseURL: 'http://34.87.10.106:4003/',
    timeout: 10000,
});

const isFormData = (data) => data instanceof FormData;

const isInternetAvailable = async () => {
    const state = await NetInfo.fetch();

    if (!state.isConnected) {
        Alert.alert('No Network', 'You are not connected to a network.');
        return false;
    }

    if (!state.isInternetReachable) {
        Alert.alert('No Internet', 'You are connected to a network but have no internet access.');
        return false;
    }

    // Slow internet check
    const speedTestUrl = 'https://www.google.com/favicon.ico'; // Small file
    try {
        const start = Date.now();
        const response = await fetch(speedTestUrl, {
            method: 'HEAD',
            cache: 'no-store',
        });
        const duration = Date.now() - start;

        if (!response.ok || duration > 2000) {
            Alert.alert('Slow Internet', 'Your internet connection seems to be slow.');
        }
    } catch (error) {
        Alert.alert('Slow Internet', 'Could not verify internet speed.');
    }

    return true;
};

const handleError = (error) => {
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

const axiosGet = async (url, token = null) => {
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

const axiosPost = async (url, body, token = null, isUrlEncoded = false) => {
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

const axiosPut = async (url, body, token = null, isUrlEncoded = false) => {
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

const axiosDelete = async (url, token = null) => {
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

const axiosPatch = async (url, body, token = null) => {
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
