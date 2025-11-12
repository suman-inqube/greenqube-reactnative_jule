const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

/**
 * ⚡ Optimized Metro configuration for React Native
 * - Speeds up startup time
 * - Reduces bundle size
 * - Enables inlineRequires for lazy loading
 * - Caches results aggressively
 */
const config = {
  transformer: {
    // Enables lazy loading of JS modules → faster startup
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
    // Optional: improves build performance
    minifierPath: 'metro-minify-terser',
    minifierConfig: {
      keep_classnames: false,
      keep_fnames: false,
      mangle: {
        toplevel: true,
      },
      output: {
        comments: false,
      },
      compress: {
        // Remove console.* and debugger statements in production
        drop_console: true,
        drop_debugger: true,
      },
    },
  },

  // Cache configuration to speed up rebuilds
  cacheStores: [
    new (require('metro-cache')).FileStore({
      root: require('path').join(__dirname, 'metro-cache'),
    }),
  ],

  // Watch fewer files to reduce CPU usage
  watchFolders: [],

  resolver: {
    assetExts: defaultConfig.resolver.assetExts,
    sourceExts: [...defaultConfig.resolver.sourceExts, 'cjs'], // Fix for some node packages
  },
};

module.exports = mergeConfig(defaultConfig, config);
