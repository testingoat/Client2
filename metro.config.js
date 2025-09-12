const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const defaultConfig = getDefaultConfig(__dirname);
const { assetExts, sourceExts } = defaultConfig.resolver;

/**
 * Metro configuration with Android 8 compatibility fixes
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  transformer: {
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
    // Increase timeout for slower devices
    minifierConfig: {
      keep_fnames: true,
      mangle: {
        keep_fnames: true,
      },
    },
  },
  resolver: {
    assetExts: assetExts.filter((ext) => ext !== 'svg'),
    sourceExts: [...sourceExts, 'svg'],
    alias: {
      buffer: require.resolve('buffer'),
    },
  },
  server: {
    // Enhanced server configuration for better connectivity
    port: 8081,
    // Note: Metro config does not support `server.host`. Use CLI flag `--host` if needed.
    enhanceMiddleware: (middleware) => {
      return (req, res, next) => {
        // Add CORS headers for better compatibility
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        if (req.method === 'OPTIONS') {
          res.writeHead(200);
          res.end();
          return;
        }

        return middleware(req, res, next);
      };
    },
  },
  // Increase watchman timeout for slower devices
  watchFolders: [],
  maxWorkers: 2, // Reduce workers for older devices
};

module.exports = mergeConfig(defaultConfig, config);