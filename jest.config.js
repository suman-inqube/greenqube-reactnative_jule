module.exports = {
  preset: '@testing-library/react-native',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  setupFilesAfterEnv: ['./jest-setup.js'],
  transform: {
    '^.+\\.(ts|tsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|react-native-swiper|react-redux|react-native-linear-gradient|@react-navigation|@react-native|@react-native/assets)|react-native-element-dropdown|@react-native-async-storage/async-storage|@react-native-community/permissions|@react-native-firebase/messaging|react-native-device-info|@react-native-community/netinfo|i18next|react-i18next/)',
  ],
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$',
  testPathIgnorePatterns: ['/node_modules/', '/android/', '/ios/'],
  collectCoverage: true,
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/pages/$1',
    '\\.(png|jpg|jpeg|gif|svg)$': '<rootDir>/__mocks__/fileMock.tsx',
    'react-native-responsive-fontsize':
      '<rootDir>/__mocks__/react-native-responsive-fontsize.tsx',
    'react-native-size-matters':
      '<rootDir>/__mocks__/react-native-size-matters.tsx',
      '^react-navigation$': '<rootDir>/__mocks__/react-navigation.js',
  },
  coverageReporters: ['json', 'text', 'lcov', 'clover'],
  collectCoverageFrom: ['pages/**/*.{js,jsx,ts,tsx}', '!pages/**/*.d.ts' , '!pages/navigation/*.{js,jsx,ts,tsx}','!pages/Common*.{js,jsx,ts,tsx}'],
  globals: {
    'ts-jest': {
      babelConfig: true,
    },
  },
};
