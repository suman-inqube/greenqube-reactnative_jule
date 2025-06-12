// __mocks__/react-native-permissions.js
export const request = jest.fn().mockResolvedValue('granted');
export const check = jest.fn().mockResolvedValue('granted');
export const RESULTS = {
  GRANTED: 'granted',
  DENIED: 'denied',
};
