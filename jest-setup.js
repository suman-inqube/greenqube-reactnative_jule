import '@testing-library/react-native/extend-expect';
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');
// include this line for mocking react-native-gesture-handler
import 'react-native-gesture-handler/jestSetup';
jest.autoMockOff();
// include this section and the NativeAnimatedHelper section for mocking react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');

  // The mock for `call` immediately calls the callback which is incorrect
  // So we override it with a no-op
  Reanimated.default.call = () => {};

  return Reanimated;
});

// Silence the warning: Animated: `useNativeDriver` is not supported because the native animated module is missing
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');
jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter');
jest.mock('react-native-permissions');
jest.mock('react-native-element-dropdown', () => jest.fn());

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
jest.mock('react-native-fused-location', () => {
  return {
    getFusedLocation: jest.fn().mockResolvedValue({
      latitude: 37.7749,
      longitude: -122.4194,
      accuracy: 5,
      timestamp: Date.now(),
    }),
    startLocationUpdates: jest.fn(),
    stopLocationUpdates: jest.fn(),
    setLocationPriority: jest.fn(),  // Mock the function here
    isLocationAvailable: jest.fn().mockResolvedValue(true),
  };
});
// jest.setup.js or in your test file

// Mock @react-navigation/native for navigation props
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    openDrawer: jest.fn(),
    closeDrawer: jest.fn(),
    goBack: jest.fn(),
  }),
}));
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
  useRoute: () => ({
    params: { id: 42 },
  }),
}));

// Optionally mock @react-navigation/drawer if you need to mock drawer-specific functionality
jest.mock('@react-navigation/drawer', () => ({
  createDrawerNavigator: jest.fn().mockReturnValue({
    Navigator: jest.fn(),
    Screen: jest.fn(),
  }),
}));


jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};  // Necessary for mocks
  return Reanimated;
});
jest.mock('react-native-device-info', () => ({
  getUniqueId: jest.fn(() => 'unique-id'),
  getSystemName: jest.fn(() => 'iOS'),
}));
jest.mock('react-i18next', () => ({
  useTranslation: () => {
    return {
      t: (key) => key, // Simply returns the key in place of the translated value
      i18n: {
        changeLanguage: jest.fn(),
      },
    };
  },
  Trans: ({ children }) => children, // Mock the Trans component
  initReactI18next: {
    type: '3rdParty',
    init: jest.fn(),
  },
}));

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
      // useIsFocused: jest.fn(() => true),
      useIsFocused: jest.fn(),
  }),
  useIsFocused: jest.fn(), // Mock the useIsFocused hook
}));

jest.mock('react-native-element-dropdown', () => {
  return {
    Dropdown: ({ data = [], value, onChange, testID }) => {
      return (
          <select
            data-testid={testID}
            value={value}
            onChange={(e) => onChange(e.target.value)} // Simulate change event
          >
            {data.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
      );
    },
  };
});

jest.mock('react-native-fs', () => ({
  readFile: jest.fn(() => Promise.resolve('mocked file content')),
  writeFile: jest.fn(() => Promise.resolve()),
  RNFSFileTypeRegular: 'mockedFileType', // Mock the property directly here
}));
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ goBack: jest.fn() }),
  useRoute: () => ({
      params: {
          yourParamName: '<paramValue>',
          yourParamName2: '<paramValue2>',
      }
  }),
}));

jest.mock('react-native-fs', () => ({
  readFile: jest.fn(() => Promise.resolve('mocked content')),
}));

// jest.mock('@react-navigation/native', () => ({
//   useRoute: jest.fn().mockReturnValue({ name: 'MockRoute' }),
//   useNavigation: jest.fn(),
// }));

jest.mock('react-native-maps', () => {
  const { View } = require('react-native');
  const MockMapView = (props) => {
    return <View>{props.children}</View>;
  };
  const MockMarker = (props) => {
    return <View>{props.children}</View>;
  };
  return {
    __esModule: true,
    default: MockMapView,
    Marker: MockMarker,
  };
});

