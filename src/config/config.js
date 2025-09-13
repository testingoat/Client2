// 🚀 GOATGOAT WEB API CONFIGURATION - MULTI-ENVIRONMENT SUPPORT

// 🌐 SERVER ENDPOINTS  
const PRODUCTION_URL = 'https://goatgoat.tech';
const STAGING_URL = 'https://staging.goatgoat.tech';
const LOCAL_URL = 'http://localhost:3000';

// 📱 ENVIRONMENT DETECTION (Web-compatible)
const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';
const ENVIRONMENT = process.env.REACT_APP_ENVIRONMENT || process.env.NODE_ENV || 'production';

// 🎯 ENVIRONMENT-SPECIFIC URL GENERATION
const getBaseURL = () => {
  switch (ENVIRONMENT) {
    case 'production':
      return `${PRODUCTION_URL}/api`;
    
    case 'staging':
      return `${STAGING_URL}/api`;
    
    case 'development':
    default:
      return `${LOCAL_URL}/api`;
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
      return LOCAL_URL;
  }
};

export const BASE_URL = getBaseURL();
export const SOCKET_URL = getSocketURL();
export const BRANCH_ID = '68a1a76e2c93ad61799983b3';

// 📊 DEBUG LOGGING & ENVIRONMENT INFO
if (IS_DEVELOPMENT) {
  console.log('🚀 === GOATGOAT WEB API CONFIGURATION ===');
  console.log('🌎 Environment:', ENVIRONMENT);
  console.log('📡 BASE_URL:', BASE_URL);
  console.log('🔌 SOCKET_URL:', SOCKET_URL);
  console.log('🛠️ Development Mode:', IS_DEVELOPMENT);
  console.log('==========================================');
}

// 🚑 EXPORT ENVIRONMENT INFO (for debugging)
export const ENVIRONMENT_INFO = {
  environment: ENVIRONMENT,
  isDevelopment: IS_DEVELOPMENT,
  baseUrl: BASE_URL,
  socketUrl: SOCKET_URL,
};

export default {
  BASE_URL,
  SOCKET_URL,
  BRANCH_ID,
  ENVIRONMENT_INFO
};
