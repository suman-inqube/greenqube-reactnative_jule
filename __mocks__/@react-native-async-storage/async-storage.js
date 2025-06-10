// __mocks__/@react-native-async-storage/async-storage.js
const mockAsyncStorage = (() => {
    let storage = {};
  
    return {
      setItem: jest.fn((key, value) => {
        return new Promise((resolve) => {
          storage[key] = value;
          resolve(value);
        });
      }),
      getItem: jest.fn((key) => {
        return new Promise((resolve) => {
          resolve(storage[key] || null);
        });
      }),
      removeItem: jest.fn((key) => {
        return new Promise((resolve) => {
          delete storage[key];
          resolve();
        });
      }),
      clear: jest.fn(() => {
        return new Promise((resolve) => {
          storage = {};
          resolve();
        });
      }),
    };
  })();
  
  export default mockAsyncStorage;
  