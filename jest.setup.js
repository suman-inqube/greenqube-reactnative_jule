import 'react-native-gesture-handler/jestSetup';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
jest.mock('@react-native-community/geolocation', () => ({}));
jest.mock('react-native-permissions', () => require('react-native-permissions/mock'));
jest.mock('react-native-device-info', () => ({ getUniqueId: jest.fn() }));
jest.mock('react-native/Libraries/Utilities/BackHandler', () => require('react-native/Libraries/Utilities/__mocks__/BackHandler'));
