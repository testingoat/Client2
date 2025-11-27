import { Platform } from 'react-native';
import Config from 'react-native-config';

// 🚀 GOATGOAT API CONFIGURATION - MULTI-ENVIRONMENT SUPPORT
const DEVELOPMENT_IP = '192.168.1.10'; // Your local network IP for development

// 🌐 SERVER ENDPOINTS
const PRODUCTION_URL = 'https://goatgoat.tech'; // ✅ Production server with SSL
const STAGING_URL = 'https://staging.goatgoat.tech'; // 🧪 Staging server with SSL (CORRECT URL)
const LOCAL_URL = `http://${DEVELOPMENT_IP}:3000`; // 🏠 Local development server

// 📱 ENVIRONMENT DETECTION
const IS_DEVELOPMENT = __DEV__;
// 🎯 AUTOMATIC ENVIRONMENT SELECTION BASED ON BUILD TYPE
// Debug builds (__DEV__ = true) → Staging Server
// Release builds (__DEV__ = false) → Production Server
const ENVIRONMENT = __DEV__ ? 'staging' : 'production'; // staging | production

// 🎯 ENVIRONMENT-SPECIFIC URL GENERATION
const getBaseURL = () => {
  switch (ENVIRONMENT) {
    case 'production':
      return `${PRODUCTION_URL}/api`;
    
    case 'staging':
      return `${STAGING_URL}/api`;
    
    case 'development':
    default:
      // Local development with platform-specific handling
      if (Platform.OS === 'android') {
        return IS_DEVELOPMENT
          ? `http://${DEVELOPMENT_IP}:3000/api`  // Real Android device
          : 'http://10.0.2.2:3000/api';         // Android emulator
      }
      return `${LOCAL_URL}/api`; // iOS/other platforms
  }
};

const getSocketURL = () => {
  switch (ENVIRONMENT) {
    case 'production':
      return PRODUCTION_URL;
    
    case 'staging':
      return STAGING_URL;
    
    case 'development':
    default:
      // Local development with platform-specific handling
      if (Platform.OS === 'android') {
        return IS_DEVELOPMENT
          ? `http://${DEVELOPMENT_IP}:3000`      // Real Android device
          : 'http://10.0.2.2:3000';             // Android emulator
      }
      return LOCAL_URL; // iOS/other platforms
  }
};

export const BASE_URL = getBaseURL();
export const SOCKET_URL = getSocketURL();
export const GOOGLE_MAP_API = Config.GOOGLE_MAP_API || 'YOUR_DEFAULT_API_KEY';
export const BRANCH_ID = Config.BRANCH_ID || '68a1a76e2c93ad61799983b3';

// 📊 DEBUG LOGGING & ENVIRONMENT INFO
if (__DEV__) {
  console.log('🚀 === GOATGOAT API CONFIGURATION ===');
  console.log('🏗️ Build Type:', __DEV__ ? 'DEBUG BUILD' : 'RELEASE BUILD');
  console.log('🌎 Environment:', ENVIRONMENT);
  console.log('📡 BASE_URL:', BASE_URL);
  console.log('🔌 SOCKET_URL:', SOCKET_URL);
  console.log('📱 Platform:', Platform.OS);
  console.log('🛠️ Development Mode:', IS_DEVELOPMENT);
  console.log('✅ Debug → Staging | Release → Production');
  console.log('=====================================');
}

// 🚑 EXPORT ENVIRONMENT INFO (for debugging)
export const ENVIRONMENT_INFO = {
  environment: ENVIRONMENT,
  isDevelopment: IS_DEVELOPMENT,
  platform: Platform.OS,
  baseUrl: BASE_URL,
  socketUrl: SOCKET_URL,
};
