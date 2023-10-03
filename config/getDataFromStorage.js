import AsyncStorage from '@react-native-async-storage/async-storage';

//Define keys for your data in local storage
const STORAGE_KEY = {
    USER_DATA: 'user_data',
    // Add more keys as needed
};

// Set data in local storage
export const setItem = async (key, value) => {
    try {
        await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error('Error saving data to local storage:', error);
    }
};

// Get data from local storage
export const getItem = async (key) => {
    try {
        const value = await AsyncStorage.getItem(key);
        return value ? JSON.parse(value) : null;
    } catch (error) {
        console.error('Error getting data from local storage:', error);
        return null;
    }
};

// Remove data from local storage
export const removeItem = async (key) => {
    try {
        await AsyncStorage.removeItem(key);
    } catch (error) {
        console.error('Error removing data from local storage:', error);
    }
};
