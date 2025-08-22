import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();
// FAST2SMS API Configuration
const FAST2SMS_API_KEY = process.env.FAST2SMS_API_KEY;
const FAST2SMS_BASE_URL = 'https://www.fast2sms.com/dev/bulkV2';
const SENDER_ID = process.env.FAST2SMS_SENDER_ID || 'FTWSMS';
const DLT_ENTITY_ID = process.env.DLT_ENTITY_ID;
const DLT_TEMPLATE_ID = process.env.DLT_TEMPLATE_ID;
// Check if required environment variables are set
if (!FAST2SMS_API_KEY) {
    console.warn('WARNING: FAST2SMS_API_KEY is not set in environment variables');
}
class Fast2SMSService {
    /**
     * Send OTP via FAST2SMS using the OTP route
     * @param {string} phone - Phone number to send OTP to
     * @param {string} otp - OTP to send
     * @returns {Promise<{success: boolean, message: string, requestId?: string}>}
     */
    static async sendOTP(phone, otp) {
        // Check if API key is set
        if (!FAST2SMS_API_KEY || FAST2SMS_API_KEY === 'YOUR_DEFAULT_API_KEY') {
            console.warn('FAST2SMS API key not set, skipping SMS sending');
            return {
                success: true,
                message: 'OTP generated successfully (SMS not sent due to missing API key)',
            };
        }
        try {
            // Using the OTP route as specified in the FAST2SMS documentation
            const response = await axios.post(FAST2SMS_BASE_URL, `variables_values=${otp}&route=otp&numbers=${phone}`, {
                headers: {
                    authorization: FAST2SMS_API_KEY,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });
            if (response.data.return) {
                return {
                    success: true,
                    message: 'OTP sent successfully',
                    requestId: response.data.request_id,
                };
            }
            else {
                return {
                    success: false,
                    message: response.data.message?.join(', ') || 'Failed to send OTP',
                };
            }
        }
        catch (error) {
            console.error('FAST2SMS OTP Error:', error.response?.data || error.message);
            // Provide more detailed error message
            let errorMessage = 'Failed to send OTP via SMS';
            if (error.response?.data?.message) {
                errorMessage = Array.isArray(error.response.data.message)
                    ? error.response.data.message.join(', ')
                    : error.response.data.message;
            }
            else if (error.message) {
                errorMessage = error.message;
            }
            return {
                success: false,
                message: errorMessage,
            };
        }
    }
    /**
     * Send OTP via FAST2SMS using DLT Manual route
     * This is used when you have DLT approved content
     * @param {string} phone - Phone number to send OTP to
     * @param {string} otp - OTP to send
     * @returns {Promise<{success: boolean, message: string, requestId?: string}>}
     */
    static async sendDLTManualOTP(phone, otp) {
        // Check if API key is set
        if (!FAST2SMS_API_KEY || FAST2SMS_API_KEY === 'YOUR_DEFAULT_API_KEY') {
            console.warn('FAST2SMS API key not set, skipping SMS sending');
            return {
                success: true,
                message: 'OTP generated successfully (SMS not sent due to missing API key)',
            };
        }
        try {
            // Check if DLT configuration is available
            const hasDLTConfig = DLT_ENTITY_ID && DLT_ENTITY_ID !== 'YOUR_DEFAULT_ENTITY_ID' &&
                DLT_TEMPLATE_ID && DLT_TEMPLATE_ID !== 'YOUR_DEFAULT_TEMPLATE_ID';
            if (!hasDLTConfig) {
                // Fall back to standard OTP route if DLT not configured
                return await this.sendOTP(phone, otp);
            }
            // Using the DLT Manual route with approved template
            const message = `Your OTP for Grocery Delivery App is ${otp}. Please use this code to verify your mobile number.`;
            const response = await axios.post(FAST2SMS_BASE_URL, `sender_id=${SENDER_ID}&message=${encodeURIComponent(message)}&template_id=${DLT_TEMPLATE_ID}&entity_id=${DLT_ENTITY_ID}&route=dlt_manual&numbers=${phone}`, {
                headers: {
                    authorization: FAST2SMS_API_KEY,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });
            if (response.data.return) {
                return {
                    success: true,
                    message: 'OTP sent successfully via DLT',
                    requestId: response.data.request_id,
                };
            }
            else {
                return {
                    success: false,
                    message: response.data.message?.join(', ') || 'Failed to send OTP via DLT',
                };
            }
        }
        catch (error) {
            console.error('FAST2SMS DLT Error:', error.response?.data || error.message);
            // Provide more detailed error message
            let errorMessage = 'Failed to send OTP via DLT SMS';
            if (error.response?.data?.message) {
                errorMessage = Array.isArray(error.response.data.message)
                    ? error.response.data.message.join(', ')
                    : error.response.data.message;
            }
            else if (error.message) {
                errorMessage = error.message;
            }
            return {
                success: false,
                message: errorMessage,
            };
        }
    }
    /**
     * Send OTP using the configured route (DLT or standard)
     * Based on the architecture document, we should support both routes
     * @param {string} phone - Phone number to send OTP to
     * @param {string} otp - OTP to send
     * @returns {Promise<{success: boolean, message: string, requestId?: string}>}
     */
    static async sendConfiguredOTP(phone, otp) {
        // Check if DLT configuration is available
        const useDLT = DLT_ENTITY_ID && DLT_ENTITY_ID !== 'YOUR_DEFAULT_ENTITY_ID' &&
            DLT_TEMPLATE_ID && DLT_TEMPLATE_ID !== 'YOUR_DEFAULT_TEMPLATE_ID';
        if (useDLT) {
            return await this.sendDLTManualOTP(phone, otp);
        }
        else {
            return await this.sendOTP(phone, otp);
        }
    }
    /**
     * Check FAST2SMS account balance
     * @returns {Promise<{success: boolean, balance?: number, message: string}>}
     */
    static async checkBalance() {
        try {
            // Check if API key is set
            if (!FAST2SMS_API_KEY || FAST2SMS_API_KEY === 'YOUR_DEFAULT_API_KEY') {
                return {
                    success: false,
                    message: 'FAST2SMS API key not set',
                };
            }
            const response = await axios.get(`https://www.fast2sms.com/dev/wallet?authorization=${FAST2SMS_API_KEY}`);
            if (response.data.return) {
                return {
                    success: true,
                    balance: response.data.wallet,
                    message: 'Balance retrieved successfully',
                };
            }
            else {
                return {
                    success: false,
                    message: response.data.message || 'Failed to retrieve balance',
                };
            }
        }
        catch (error) {
            console.error('FAST2SMS Balance Error:', error.response?.data || error.message);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to retrieve balance',
            };
        }
    }
}
export default Fast2SMSService;
