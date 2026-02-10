import { MMKV } from 'react-native-mmkv';

export const storage = new MMKV();

export const cacheManager = {
  setCache: (key, data) => storage.set(key, JSON.stringify(data)),
  getCache: (key) => {
    const data = storage.getString(key);
    return data ? JSON.parse(data) : null;
  },

  addToQueue: (request) => {
    const queue = JSON.parse(storage.getString('offline_queue') || '[]');
    
    let storableBody = request.body;
    let isForm = false;

    // Convert FormData to plain object for MMKV storage
    if (request.body instanceof FormData) {
      isForm = true;
      storableBody = {};
      // Accessing internal _parts of React Native FormData
      request.body._parts.forEach(([key, value]) => {
        storableBody[key] = value;
      });
    }

    queue.push({ 
      ...request, 
      body: storableBody, 
      isFormData: isForm, 
      id: Date.now() 
    });
    
    storage.set('offline_queue', JSON.stringify(queue));
  },

  getQueue: () => JSON.parse(storage.getString('offline_queue') || '[]'),
  updateQueue: (newQueue) => storage.set('offline_queue', JSON.stringify(newQueue)),
};