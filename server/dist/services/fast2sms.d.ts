export default Fast2SMSService;
declare class Fast2SMSService {
    /**
     * Send OTP via FAST2SMS using the OTP route
     * @param {string} phone - Phone number to send OTP to
     * @param {string} otp - OTP to send
     * @returns {Promise<{success: boolean, message: string, requestId?: string}>}
     */
    static sendOTP(phone: string, otp: string): Promise<{
        success: boolean;
        message: string;
        requestId?: string;
    }>;
    /**
     * Send OTP via FAST2SMS using DLT Manual route
     * This is used when you have DLT approved content
     * @param {string} phone - Phone number to send OTP to
     * @param {string} otp - OTP to send
     * @returns {Promise<{success: boolean, message: string, requestId?: string}>}
     */
    static sendDLTManualOTP(phone: string, otp: string): Promise<{
        success: boolean;
        message: string;
        requestId?: string;
    }>;
    /**
     * Send OTP using the configured route (DLT or standard)
     * Based on the architecture document, we should support both routes
     * @param {string} phone - Phone number to send OTP to
     * @param {string} otp - OTP to send
     * @returns {Promise<{success: boolean, message: string, requestId?: string}>}
     */
    static sendConfiguredOTP(phone: string, otp: string): Promise<{
        success: boolean;
        message: string;
        requestId?: string;
    }>;
    /**
     * Check FAST2SMS account balance
     * @returns {Promise<{success: boolean, balance?: number, message: string}>}
     */
    static checkBalance(): Promise<{
        success: boolean;
        balance?: number;
        message: string;
    }>;
}
//# sourceMappingURL=fast2sms.d.ts.map