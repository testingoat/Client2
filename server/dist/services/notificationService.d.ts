/**
 * Send SMS notification via Fast2SMS
 * @param {string|string[]} phoneNumbers - Phone number(s) to send SMS to
 * @param {string} message - SMS message content
 * @param {Object} options - Additional options for SMS
 */
export declare const sendSMSNotification: (phoneNumbers: string | string[], message: string, _options?: any) => Promise<{
    success: boolean;
    message: string;
    results: {
        success: boolean;
        message: string;
        requestId?: string;
    }[];
} | {
    success: boolean;
    message: any;
    results?: undefined;
}>;
/**
 * Send both SMS notifications (placeholder for push notifications)
 * @param {string[]} userIds - Array of user IDs
 * @param {string|string[]} phoneNumbers - Phone number(s)
 * @param {string} title - Notification title (unused for SMS)
 * @param {string} body - Notification body
 * @param {string} smsMessage - SMS message content
 */
export declare const sendMultiChannelNotification: (userIds: string[], phoneNumbers: string | string[], title: string, body: string, smsMessage: string) => Promise<{
    success: boolean;
    smsResult: {
        success: boolean;
        message: string;
        results: {
            success: boolean;
            message: string;
            requestId?: string;
        }[];
    } | {
        success: boolean;
        message: any;
        results?: undefined;
    };
    message?: undefined;
} | {
    success: boolean;
    message: any;
    smsResult?: undefined;
}>;
//# sourceMappingURL=notificationService.d.ts.map