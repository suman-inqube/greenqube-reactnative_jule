
import EncryptedStorage from 'react-native-encrypted-storage';
const STORAGE_KEY = {
    USER_DATA: 'user_data',
    // Add more keys as needed
};

export const setItem = async (key, value) => {
    try {
        if (!key) {
            console.warn('setItem: key is required');
            return;
        }
        if (value === undefined) {
            console.warn(`setItem: Attempted to store undefined for key "${key}". Removing key instead.`);
            await removeItem(key);
            return;
        }

        const serialized = JSON.stringify(value);
        if (typeof serialized !== 'string') {
            console.warn(`setItem: Unable to serialize value for key "${key}"`);
            return;
        }

        await EncryptedStorage.setItem(key, serialized);
    } catch (error) {
        console.error('Error saving data to local storage:', error);
    }
};

export const getItem = async (key) => {
    try {
        if (!key) return null;
        const value = await EncryptedStorage.getItem(key);
        if (value === null || value === undefined) {
            return null;
        }
        try {
            return JSON.parse(value);
        } catch {
            return value;
        }
    } catch (error) {
        console.error('Error getting data from local storage:', error);
        return null;
    }
};

export const removeItem = async (key) => {
    try {
        if (!key) return;
        await EncryptedStorage.removeItem(key);
    } catch (error) {
        if (error?.code === '-25300' || error?.code === -25300) {
            return;
        }
        console.error('Error removing data from local storage:', error);
    }
};

export const clearStorage = async () => {
    try {
        await EncryptedStorage.clear();
    } catch (error) {
        console.error('Error clearing local storage:', error);
    }
};
