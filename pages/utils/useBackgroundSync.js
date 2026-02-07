import { useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { cacheManager } from './mmkvStorage';
import { axiosPost, axiosPut } from './api';

export const useBackgroundSync = () => {
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(async state => {
      if (state.isConnected && state.isInternetReachable) {
        let queue = cacheManager.getQueue();
        if (queue.length === 0) return;

        while (queue.length > 0) {
          const item = queue[0];
          let finalBody = item.body;

          if (item.isFormData) {
            finalBody = new FormData();
            Object.keys(item.body).forEach(key => {
              finalBody.append(key, item.body[key]);
            });
          }

          try {
            const apiMethod = item.method === 'POST' ? axiosPost : axiosPut;
            await apiMethod(item.url, finalBody, item.token, item.isUrlEncoded, item.extraHeaders);
            
            queue.shift(); // Remove only on success
            cacheManager.updateQueue(queue);
          } catch (err) {
            break; // Stop and wait for next connection cycle
          }
        }
      }
    });
    return () => unsubscribe();
  }, []);
};