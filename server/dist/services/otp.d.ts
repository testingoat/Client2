export default OTPService;
declare class OTPService {
    /**
     * Generate a random OTP
     * @param {number} length - Length of OTP to generate
     * @returns {string} Generated OTP
     */
    static generateOTP(length?: number): string;
    /**
     * Hash OTP using bcrypt
     * @param {string} otp - OTP to hash
     * @returns {Promise<string>} Hashed OTP
     */
    static hashOTP(otp: string): Promise<string>;
    /**
     * Verify OTP against hashed version
     * @param {string} otp - OTP to verify
     * @param {string} hashedOTP - Hashed OTP to compare against
     * @returns {Promise<boolean>} Whether OTP is valid
     */
    static verifyOTP(otp: string, hashedOTP: string): Promise<boolean>;
    /**
     * Store OTP token in database
     * @param {string} phone - Phone number
     * @param {string} otp - OTP to store
     * @param {string} requestId - Optional request ID from provider
     * @returns {Promise<Object>} Stored OTP token
     */
    static storeOTPToken(phone: string, otp: string, requestId?: string): Promise<Object>;
    /**
     * Get valid OTP token for phone number
     * @param {string} phone - Phone number
     * @returns {Promise<Object|null>} Valid OTP token or null
     */
    static getValidOTPToken(phone: string): Promise<Object | null>;
    /**
     * Mark OTP token as consumed
     * @param {string} tokenId - OTP token ID
     * @returns {Promise<Object>} Updated OTP token
     */
    static consumeOTPToken(tokenId: string): Promise<Object>;
    /**
     * Parse rate limits safely with sensible defaults per context
     */
    static parseLimits(context: any): {
        window: number;
        maxRequests: number;
    };
    /**
     * Record OTP attempt for rate limiting
     * @param {string} phone - Phone number
     * @param {string} ip - IP address
     * @returns {Promise<Object>} OTP attempt record
     */
    static recordOTPAttempt(phone: string, ip: string, context?: string): Promise<Object>;
    /**
     * Check if phone number is rate limited
     * @param {string} phone - Phone number
     * @param {string} ip - IP address
     * @returns {Promise<{isLimited: boolean, blockedUntil?: Date}>} Rate limit status
     */
    static isRateLimited(phone: string, ip: string, context?: string): Promise<{
        isLimited: boolean;
        blockedUntil?: Date;
    }>;
    /**
     * Send OTP via FAST2SMS
     * @param {string} phone - Phone number
     * @param {string} otp - OTP to send
     * @returns {Promise<{success: boolean, message: string, requestId?: string}>} Send result
     */
    static sendOTP(phone: string, otp: string): Promise<{
        success: boolean;
        message: string;
        requestId?: string;
    }>;
    /**
     * Clear request attempts helper (admin/debug or after resend policy)
     */
    static resetRequestAttempts(phone: any, ip: any): Promise<void>;
    /**
     * Reset verification attempts after success to prevent lockouts
     */
    static resetVerifyAttempts(phone: any, ip: any): Promise<void>;
    /**
     * Clean up expired OTP tokens
     * @returns {Promise<number>} Number of deleted tokens
     */
    static cleanupExpiredTokens(): Promise<number>;
}
//# sourceMappingURL=otp.d.ts.map