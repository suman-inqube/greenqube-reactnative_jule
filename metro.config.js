const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  resolver: {
    assetExts: [
      ...getDefaultConfig(__dirname).resolver.assetExts,
      'onnx',  // Add ONNX files as assets
      'ort',   // Optional: for ORT format files
      'bin',   // Optional: for binary model files
    ],
  },
  transformer: {
    // Optional: Add custom transformer for ONNX files if needed
    // But usually just treating as assets is sufficient
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);