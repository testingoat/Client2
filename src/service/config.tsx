import { Platform } from "react-native"

// CLOUD-FIRST CONFIGURATION - PRODUCTION READY
// Using your network IP for development, easily switchable to cloud
const DEVELOPMENT_IP = '192.168.1.10'; // Your current network IP
const CLOUD_API_URL = 'https://client-d9x3.onrender.com'; // Replace with your actual Render URL

// Environment detection
const IS_DEVELOPMENT = __DEV__;
const USE_CLOUD = true; // Set to true when deploying to cloud

// Dynamic URL configuration
const getBaseURL = () => {
  if (USE_CLOUD) {
    return `${CLOUD_API_URL}/api`;
  }

  if (Platform.OS === 'android') {
    return IS_DEVELOPMENT
      ? `http://${DEVELOPMENT_IP}:3000/api`  // Use network IP for real device
      : 'http://10.0.2.2:3000/api';         // Use emulator localhost
  }

  return `http://${DEVELOPMENT_IP}:3000/api`; // iOS/other platforms
};

const getSocketURL = () => {
  if (USE_CLOUD) {
    return CLOUD_API_URL;
  }

  if (Platform.OS === 'android') {
    return IS_DEVELOPMENT
      ? `http://${DEVELOPMENT_IP}:3000`      // Use network IP for real device
      : 'http://10.0.2.2:3000';             // Use emulator localhost
  }

  return `http://${DEVELOPMENT_IP}:3000`;   // iOS/other platforms
};

export const BASE_URL = getBaseURL();
export const SOCKET_URL = getSocketURL();
export const GOOGLE_MAP_API = "AIzaSyDOBBimUu_eGMwsXZUqrNFk3puT5rMWbig"
export const BRANCH_ID ='68a1a76e2c93ad61799983b3'

// Debug logging
if (__DEV__) {
  console.log('🔧 API Configuration:');
  console.log('📡 BASE_URL:', BASE_URL);
  console.log('🔌 SOCKET_URL:', SOCKET_URL);
  console.log('🌍 Platform:', Platform.OS);
  console.log('☁️ Using Cloud:', USE_CLOUD);
}

