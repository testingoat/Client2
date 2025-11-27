// Import required modules
// Note: User models imported only when needed for push notifications
import Fast2SMSService from './fast2sms.js'; // Adjust the path as needed
import { sendPushNotification, sendBulkPushNotifications, getUserFCMTokens, FCMNotificationPayload } from './fcmService.js';

/**
 * Send SMS notification via Fast2SMS
 * @param {string|string[]} phoneNumbers - Phone number(s) to send SMS to
 * @param {string} message - SMS message content
 * @param {Object} options - Additional options for SMS
 */
export const sendSMSNotification = async (phoneNumbers: string | string[], message: string, _options: any = {}) => {
  try {
    // Convert single phone number to array
    const numbers = Array.isArray(phoneNumbers) ? phoneNumbers : [phoneNumbers];

    // Send SMS via Fast2SMS service
    // Using the sendConfiguredOTP method which handles both DLT and standard routes
    const results = [];
    for (const number of numbers) {
      // For bulk sending, we'll send individual messages
      // In a real implementation, you might want to use a bulk sending method if available
      const response = await Fast2SMSService.sendConfiguredOTP(number, message);
      results.push(response);
    }

    // Check if all messages were sent successfully
    const allSuccessful = results.every(result => result.success);

    if (allSuccessful) {
      console.log('SMS sent successfully via Fast2SMS');
      return { success: true, message: 'SMS sent successfully', results };
    } else {
      const failedResults = results.filter(result => !result.success);
      console.error('Failed to send some SMS via Fast2SMS:', failedResults);
      return { success: false, message: 'Some SMS failed to send', results };
    }
  } catch (error: any) {
    console.error('Error sending SMS notification:', error);
    return { success: false, message: error.message };
  }
};

/**
 * Send push notification to users
 */
export const sendPushNotificationToUsers = async (
  userIds: string[],
  role: 'Customer' | 'DeliveryPartner',
  payload: FCMNotificationPayload
): Promise<{ success: boolean; message: string; results?: any }> => {
  try {
    // Get FCM tokens for users
    const fcmTokens = await getUserFCMTokens(userIds, role);
    
    if (fcmTokens.length === 0) {
      return { success: false, message: 'No valid FCM tokens found for users' };
    }

    // Send bulk push notifications
    const result = await sendBulkPushNotifications(fcmTokens, payload);
    
    return {
      success: result.success,
      message: `Push notifications sent: ${result.successCount}/${fcmTokens.length}`,
      results: result,
    };
  } catch (error: any) {
    console.error('Error sending push notifications to users:', error);
    return { success: false, message: error.message };
  }
};

/**
 * Enhanced multi-channel notification with FCM support
 */
export const sendEnhancedMultiChannelNotification = async (
  userIds: string[],
  role: 'Customer' | 'DeliveryPartner',
  phoneNumbers: string | string[],
  title: string,
  body: string,
  smsMessage: string,
  options: {
    sendPush?: boolean;
    sendSMS?: boolean;
    imageUrl?: string;
    data?: { [key: string]: string };
  } = {}
) => {
  try {
    const results: any = {
      push: null,
      sms: null,
    };

    // Send push notifications if enabled
    if (options.sendPush !== false) {
      const pushPayload: FCMNotificationPayload = {
        title,
        body,
        data: options.data,
        imageUrl: options.imageUrl,
      };
      
      results.push = await sendPushNotificationToUsers(userIds, role, pushPayload);
    }

    // Send SMS notifications if enabled
    if (options.sendSMS !== false) {
      results.sms = await sendSMSNotification(phoneNumbers, smsMessage);
    }

    const overallSuccess = (results.push?.success !== false) && (results.sms?.success !== false);

    return {
      success: overallSuccess,
      results,
    };
  } catch (error: any) {
    console.error('Error sending enhanced multi-channel notification:', error);
    return { success: false, message: error.message };
  }
};

/**
 * Send both SMS notifications (backward compatibility - now includes FCM)
 * @param {string[]} userIds - Array of user IDs
 * @param {string|string[]} phoneNumbers - Phone number(s)
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {string} smsMessage - SMS message content
 */
export const sendMultiChannelNotification = async (
  userIds: string[], 
  phoneNumbers: string | string[], 
  title: string, 
  body: string, 
  smsMessage: string
) => {
  try {
    // Enhanced version with both SMS and FCM support
    // Default to sending both push and SMS notifications
    const result = await sendEnhancedMultiChannelNotification(
      userIds,
      'Customer', // Default to Customer role, can be enhanced later
      phoneNumbers,
      title,
      body,
      smsMessage,
      {
        sendPush: true,
        sendSMS: true,
      }
    );

    return {
      success: result.success,
      smsResult: result.results?.sms,
      pushResult: result.results?.push,
    };
  } catch (error: any) {
    console.error('Error sending multi-channel notification:', error);
    return { success: false, message: error.message };
  }
};
