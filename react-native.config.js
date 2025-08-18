module.exports = {
  project: {
    ios: {},
    android: {
      // Android 8 compatibility settings
      sourceDir: './android',
      appName: 'app',
      packageName: 'com.grocery_app',
    },
  },
  dependencies: {
    // Disable autolinking for react-native-vector-icons to avoid conflicts
    'react-native-vector-icons': {
      platforms: {
        android: null, // disable Android platform auto linking
        ios: null, // disable iOS platform auto linking
      },
    },
  },
  assets: ['./src/assets/fonts/'],
};
