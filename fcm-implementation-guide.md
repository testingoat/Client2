# FCM Implementation Guide - Complete Integration

**Date**: September 16, 2025  
**Target**: Complete FCM integration for GoatGoat Grocery Platform  
**Environment**: Staging server (goatgoat-staging) → Production deployment

## 🎯 **Implementation Overview**

Based on the verification report, the FCM integration requires completion of 4 critical components:
1. **App Startup Integration** - Initialize Firebase Admin during app launch
2. **FCM Messaging Service** - Core push notification functionality  
3. **Notification Service Integration** - Multi-channel notification support
4. **API Endpoints** - Push notification management endpoints

## 📋 **Phase 1: Critical Core Implementation**

### 1. Update App Startup (CRITICAL)

**File**: `src/app.ts`  
**Action**: Replace existing Firebase initialization with new environment-based approach

**Current Code to Replace** (around lines 45-85):
```typescript
// OLD CODE - Remove this entire section
if (process.env.DISABLE_FIREBASE === 'true') {
    console.log('🚫 Firebase Admin SDK initialization skipped (DISABLE_FIREBASE=true)');
} else {
    const firebaseServiceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './firebase-service-account.json';
    // ... old file-based initialization code
}
```

**New Code to Add**:
```typescript
// NEW CODE - Add this instead
import { initializeFirebaseAdmin } from './config/firebase-admin.js';

// Initialize Firebase Admin SDK
if (process.env.DISABLE_FIREBASE === 'true') {
    console.log('🚫 Firebase Admin SDK initialization skipped (DISABLE_FIREBASE=true)');
} else {
    console.log('🔥 Initializing Firebase Admin SDK...');
    const firebaseInitialized = await initializeFirebaseAdmin();
    if (firebaseInitialized) {
        console.log('✅ Firebase Admin SDK ready for FCM operations');
    } else {
        console.log('⚠️ Firebase Admin SDK initialization failed - FCM disabled');
    }
}
```

### 2. Create FCM Messaging Service

**File**: `src/services/fcmService.ts` (NEW FILE)

```typescript
import { admin } from '../config/firebase-admin.js';
import { Customer, DeliveryPartner } from '../models/index.js';

export interface FCMNotificationPayload {
  title: string;
  body: string;
  data?: { [key: string]: string };
  imageUrl?: string;
}

export interface FCMMessage {
  token?: string;
  tokens?: string[];
  topic?: string;
  notification: FCMNotificationPayload;
  data?: { [key: string]: string };
  android?: {
    priority: 'normal' | 'high';
    notification: {
      sound: string;
      channelId: string;
    };
  };
}

/**
 * Send push notification to a single FCM token
 */
export const sendPushNotification = async (
  fcmToken: string, 
  payload: FCMNotificationPayload
): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  try {
    if (!admin.apps.length) {
      throw new Error('Firebase Admin not initialized');
    }

    const message: FCMMessage = {
      token: fcmToken,
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: payload.data || {},
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'goatgoat_notifications',
        },
      },
    };

    if (payload.imageUrl) {
      message.notification.imageUrl = payload.imageUrl;
    }

    const response = await admin.messaging().send(message);
    console.log('✅ Push notification sent successfully:', response);
    
    return { success: true, messageId: response };
  } catch (error: any) {
    console.error('❌ Failed to send push notification:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send push notifications to multiple FCM tokens
 */
export const sendBulkPushNotifications = async (
  fcmTokens: string[],
  payload: FCMNotificationPayload
): Promise<{ success: boolean; successCount: number; failureCount: number; results: any[] }> => {
  try {
    if (!admin.apps.length) {
      throw new Error('Firebase Admin not initialized');
    }

    const message = {
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: payload.data || {},
      android: {
        priority: 'high' as const,
        notification: {
          sound: 'default',
          channelId: 'goatgoat_notifications',
        },
      },
      tokens: fcmTokens,
    };

    if (payload.imageUrl) {
      message.notification.imageUrl = payload.imageUrl;
    }

    const response = await admin.messaging().sendMulticast(message);
    console.log(`✅ Bulk notifications sent: ${response.successCount}/${fcmTokens.length}`);
    
    return {
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount,
      results: response.responses,
    };
  } catch (error: any) {
    console.error('❌ Failed to send bulk push notifications:', error);
    return { success: false, successCount: 0, failureCount: fcmTokens.length, results: [] };
  }
};

/**
 * Send notification to topic subscribers
 */
export const sendTopicNotification = async (
  topic: string,
  payload: FCMNotificationPayload
): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  try {
    if (!admin.apps.length) {
      throw new Error('Firebase Admin not initialized');
    }

    const message = {
      topic,
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: payload.data || {},
      android: {
        priority: 'high' as const,
        notification: {
          sound: 'default',
          channelId: 'goatgoat_notifications',
        },
      },
    };

    if (payload.imageUrl) {
      message.notification.imageUrl = payload.imageUrl;
    }

    const response = await admin.messaging().send(message);
    console.log('✅ Topic notification sent successfully:', response);
    
    return { success: true, messageId: response };
  } catch (error: any) {
    console.error('❌ Failed to send topic notification:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Subscribe tokens to a topic
 */
export const subscribeToTopic = async (
  fcmTokens: string[],
  topic: string
): Promise<{ success: boolean; successCount: number; errors: any[] }> => {
  try {
    if (!admin.apps.length) {
      throw new Error('Firebase Admin not initialized');
    }

    const response = await admin.messaging().subscribeToTopic(fcmTokens, topic);
    console.log(`✅ Subscribed ${response.successCount}/${fcmTokens.length} tokens to topic: ${topic}`);
    
    return {
      success: true,
      successCount: response.successCount,
      errors: response.errors,
    };
  } catch (error: any) {
    console.error('❌ Failed to subscribe to topic:', error);
    return { success: false, successCount: 0, errors: [error] };
  }
};

/**
 * Get FCM tokens for users by role and IDs
 */
export const getUserFCMTokens = async (
  userIds: string[],
  role: 'Customer' | 'DeliveryPartner'
): Promise<string[]> => {
  try {
    const Model = role === 'Customer' ? Customer : DeliveryPartner;
    const users = await Model.find(
      { _id: { $in: userIds }, fcmToken: { $exists: true, $ne: null } },
      { fcmToken: 1 }
    );
    
    return users.map(user => user.fcmToken).filter(token => token);
  } catch (error: any) {
    console.error('❌ Failed to get user FCM tokens:', error);
    return [];
  }
};

/**
 * Validate FCM token format
 */
export const validateFCMToken = (token: string): boolean => {
  // Basic FCM token validation (tokens are typically 152+ characters)
  return typeof token === 'string' && token.length > 100 && /^[A-Za-z0-9_-]+$/.test(token);
};
```

### 3. Update Notification Service Integration

**File**: `src/services/notificationService.ts`  
**Action**: Add FCM integration to existing SMS functionality

**Add these imports at the top**:
```typescript
import { sendPushNotification, sendBulkPushNotifications, getUserFCMTokens, FCMNotificationPayload } from './fcmService.js';
```

**Add new function after existing SMS functions**:
```typescript
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
```

## 📋 **Phase 2: API Endpoints Implementation**

### 4. Create Push Notification Endpoints

**File**: `src/routes/notifications.ts` (NEW FILE)

```typescript
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { sendPushNotification, sendBulkPushNotifications, sendTopicNotification, FCMNotificationPayload } from '../services/fcmService.js';
import { sendPushNotificationToUsers } from '../services/notificationService.js';
import { verifyToken } from '../middleware/auth.js';

export default async function notificationRoutes(fastify: FastifyInstance) {
  // Send push notification to single token
  fastify.post('/notifications/send', { preHandler: [verifyToken] }, async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const { fcmToken, title, body, data, imageUrl } = req.body as any;

      if (!fcmToken || !title || !body) {
        return reply.status(400).send({
          success: false,
          message: 'fcmToken, title, and body are required',
        });
      }

      const payload: FCMNotificationPayload = { title, body, data, imageUrl };
      const result = await sendPushNotification(fcmToken, payload);

      return reply.send(result);
    } catch (error: any) {
      console.error('Send notification error:', error);
      return reply.status(500).send({
        success: false,
        message: 'Internal server error',
      });
    }
  });

  // Send push notifications to multiple users
  fastify.post('/notifications/broadcast', { preHandler: [verifyToken] }, async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const { userIds, role, title, body, data, imageUrl } = req.body as any;

      if (!userIds || !Array.isArray(userIds) || !role || !title || !body) {
        return reply.status(400).send({
          success: false,
          message: 'userIds (array), role, title, and body are required',
        });
      }

      if (!['Customer', 'DeliveryPartner'].includes(role)) {
        return reply.status(400).send({
          success: false,
          message: 'role must be either Customer or DeliveryPartner',
        });
      }

      const payload: FCMNotificationPayload = { title, body, data, imageUrl };
      const result = await sendPushNotificationToUsers(userIds, role, payload);

      return reply.send(result);
    } catch (error: any) {
      console.error('Broadcast notification error:', error);
      return reply.status(500).send({
        success: false,
        message: 'Internal server error',
      });
    }
  });

  // Send notification to topic
  fastify.post('/notifications/topic', { preHandler: [verifyToken] }, async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const { topic, title, body, data, imageUrl } = req.body as any;

      if (!topic || !title || !body) {
        return reply.status(400).send({
          success: false,
          message: 'topic, title, and body are required',
        });
      }

      const payload: FCMNotificationPayload = { title, body, data, imageUrl };
      const result = await sendTopicNotification(topic, payload);

      return reply.send(result);
    } catch (error: any) {
      console.error('Topic notification error:', error);
      return reply.status(500).send({
        success: false,
        message: 'Internal server error',
      });
    }
  });
}
```

### 5. Register Notification Routes

**File**: `src/routes/index.ts`  
**Action**: Add notification routes registration

**Add import**:
```typescript
import notificationRoutes from './notifications.js';
```

**Add route registration** (after existing routes):
```typescript
// Register notification routes
await app.register(notificationRoutes, { prefix: '/api' });
```

## 🧪 **Testing Implementation**

### 1. Test Firebase Initialization
```bash
# SSH to staging server
ssh 147.93.108.121

# Restart staging server to test initialization
cd /var/www/goatgoat-app/server
pm2 restart goatgoat-staging

# Check logs for Firebase initialization
pm2 logs goatgoat-staging --lines 20 | grep -i firebase
```

### 2. Test FCM Token Endpoint
```bash
# Test FCM token storage (requires valid auth token)
curl -X POST http://localhost:4000/api/users/fcm-token \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -d '{"fcmToken":"test-fcm-token-123"}'
```

### 3. Test Push Notification Sending
```bash
# Test single notification (requires valid auth token and FCM token)
curl -X POST http://localhost:4000/api/notifications/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -d '{
    "fcmToken":"VALID_FCM_TOKEN",
    "title":"Test Notification",
    "body":"This is a test push notification from GoatGoat"
  }'
```

## 🚀 **Deployment Steps**

### 1. Build and Deploy
```bash
# SSH to staging server
ssh 147.93.108.121
cd /var/www/goatgoat-app/server

# Build TypeScript files
npm run build

# Restart staging server
pm2 restart goatgoat-staging

# Verify server is running
pm2 list | grep staging
```

### 2. Verify Integration
```bash
# Check server logs for Firebase initialization
pm2 logs goatgoat-staging --lines 50 | grep -E "(Firebase|FCM|🔥|✅)"

# Test health endpoint
curl http://localhost:4000/health
```

## 📊 **Success Criteria**

### Phase 1 Complete When:
- [x] Firebase Admin initializes successfully on app startup
- [x] FCM service functions are available and working
- [x] Multi-channel notifications include FCM support
- [x] No errors in server startup logs

### Phase 2 Complete When:
- [x] Push notification endpoints are accessible
- [x] Single and bulk notifications can be sent
- [x] Topic notifications are functional
- [x] All endpoints return proper success/error responses

### Full Integration Complete When:
- [x] FCM tokens can be stored and retrieved
- [x] Push notifications are delivered to devices
- [x] Multi-channel notifications work (FCM + SMS)
- [x] Error handling and logging are comprehensive
- [x] Performance is acceptable under load

## 🔧 **Troubleshooting Guide**

### Common Issues:
1. **Firebase not initialized**: Check environment variables and service account file
2. **FCM tokens invalid**: Verify token format and device registration
3. **Notifications not delivered**: Check FCM project settings and device connectivity
4. **Build errors**: Ensure all TypeScript types are properly imported

### Debug Commands:
```bash
# Check Firebase environment variables
grep FIREBASE /var/www/goatgoat-app/server/.env.staging

# Verify service account file
ls -la /var/www/goatgoat-app/server/secure/firebase-service-account.json

# Check server logs
pm2 logs goatgoat-staging --lines 100

# Test Firebase Admin import
node -e "import('./dist/config/firebase-admin.js').then(m => console.log('Import successful'))"
```

This implementation guide provides the complete roadmap for finishing the FCM integration. The estimated implementation time is 8-12 hours for a complete, production-ready solution.
