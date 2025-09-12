import axios from 'axios';
import {Platform} from 'react-native';
import {useStore} from '../store/useStore';

// Dynamic API URL configuration (same as customer app)
const getApiBaseURL = () => {
  const IS_DEVELOPMENT = __DEV__;
  const USE_CLOUD = true; // Set to true for production

  if (USE_CLOUD) {
    return 'https://api.goatgoat.xyz/api'; // Production VPS URL - MAINTAIN API CONSISTENCY
  }

  // Development URLs
  if (Platform.OS === 'android') {
    return IS_DEVELOPMENT
      ? 'http://192.168.1.10:3000/api'  // Network IP for real device
      : 'http://10.0.2.2:3000/api';     // Emulator localhost
  }

  return 'http://192.168.1.10:3000/api'; // iOS/other platforms
};

const API_BASE_URL = getApiBaseURL();

class ApiService {
  private getAuthHeaders() {
    const {token} = useStore.getState();
    return token ? {Authorization: `Bearer ${token}`} : {};
  }

  // Authentication
  async login(email: string, password: string) {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email,
      password,
      userType: 'seller',
    });
    return response.data;
  }

  // Products
  async getProducts() {
    const response = await axios.get(`${API_BASE_URL}/products/seller`, {
      headers: this.getAuthHeaders(),
    });
    return response.data;
  }

  async addProduct(product: any) {
    const response = await axios.post(`${API_BASE_URL}/products`, product, {
      headers: this.getAuthHeaders(),
    });
    return response.data;
  }

  async updateProduct(id: string, updates: any) {
    const response = await axios.put(`${API_BASE_URL}/products/${id}`, updates, {
      headers: this.getAuthHeaders(),
    });
    return response.data;
  }

  // Orders
  async getOrders() {
    const response = await axios.get(`${API_BASE_URL}/orders/seller`, {
      headers: this.getAuthHeaders(),
    });
    return response.data;
  }

  async updateOrderStatus(id: string, status: string) {
    const response = await axios.put(
      `${API_BASE_URL}/orders/${id}/status`,
      {status},
      {headers: this.getAuthHeaders()}
    );
    return response.data;
  }

  // Profile
  async getProfile() {
    const response = await axios.get(`${API_BASE_URL}/users/profile`, {
      headers: this.getAuthHeaders(),
    });
    return response.data;
  }

  async updateProfile(profile: any) {
    const response = await axios.put(`${API_BASE_URL}/users/profile`, profile, {
      headers: this.getAuthHeaders(),
    });
    return response.data;
  }
}

export const apiService = new ApiService();
