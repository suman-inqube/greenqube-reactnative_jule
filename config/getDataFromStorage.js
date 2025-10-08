
import EncryptedStorage from 'react-native-encrypted-storage';
//Define keys for your data in local storage
const STORAGE_KEY = {
    USER_DATA: 'user_data',
    // Add more keys as needed
};

// Set data in local storage
export const setItem = async (key, value) => {
    try {
        await EncryptedStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error('Error saving data to local storage:', error);
    }
};

// Get data from local storage
export const getItem = async (key) => {
    try {
        const value = await EncryptedStorage.getItem(key);
        return value ? JSON.parse(value) : null;
    } catch (error) {
        console.error('Error getting data from local storage:', error);
        return null;
    }
};

// Remove data from local storage
export const removeItem = async (key) => {
    try {
        await EncryptedStorage.removeItem(key);
    } catch (error) {
        console.error('Error removing data from local storage:', error);
    }
};

export const clearStorage=async()=> {
    try {
        await EncryptedStorage.clear();
        // Congrats! You've just cleared the device storage!
    } catch (error) {
        // There was an error on the native side
    }
}
