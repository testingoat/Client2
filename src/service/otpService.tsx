import axios from 'axios';
import {BASE_URL} from './config';

interface OTPRequestResponse {
  success: boolean;
  message: string;
  requestId?: string;
}

interface OTPVerifyResponse {
  success: boolean;
  message: string;
  token?: {
    accessToken: string;
    refreshToken: string;
  };
  user?: any;
}

/**
 * Request OTP for phone number
 * @param phone - Phone number to send OTP to
 * @returns Promise with OTP request response
 */
export const requestOTP = async (phone: string): Promise<OTPRequestResponse> => {
  try {
    console.log('Sending OTP request for phone:', phone);
    const response = await axios.post<OTPRequestResponse>(`${BASE_URL}/auth/otp/request`, {
      phone,
    });
    console.log('OTP request response:', response.data);
    return response.data;
  } catch (error) {
    console.error('OTP Request Error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to request OTP',
    };
  }
};

/**
 * Verify OTP for phone number
 * @param phone - Phone number
 * @param otp - OTP code to verify
 * @returns Promise with OTP verification response
 */
export const verifyOTP = async (
  phone: string,
  otp: string,
): Promise<OTPVerifyResponse> => {
  try {
    const response = await axios.post<OTPVerifyResponse>(`${BASE_URL}/auth/otp/verify`, {
      phone,
      otp,
    });
    return response.data;
  } catch (error) {
    console.error('OTP Verification Error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to verify OTP',
    };
  }
};

/**
 * Test OTP endpoint (for development/testing only)
 * @param phone - Phone number to test
 * @returns Promise with test response
 */
export const testOTP = async (phone: string): Promise<OTPRequestResponse> => {
  try {
    const response = await axios.post<OTPRequestResponse>(`${BASE_URL}/auth/otp/test`, {
      phone,
    });
    return response.data;
  } catch (error) {
    console.error('Test OTP Error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to test OTP',
    };
  }
};