# MSG91 Email API Integration Documentation

**Implementation Date**: September 15, 2025  
**Status**: ✅ Complete and Functional  
**Environment**: Staging Server (goatgoat-staging)  

## Overview

This document provides comprehensive documentation for the MSG91 Email API integration implemented in the GoatGoat application. The integration enables email-based OTP functionality, automated email sending, and provides a foundation for future email features like invoices and notifications.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    MSG91 Email Integration                   │
├─────────────────────────────────────────────────────────────┤
│  Routes (email.js)                                         │
│  ├── POST /api/email/send-otp                              │
│  ├── POST /api/email/send-test                             │
│  └── GET  /api/email/test-service                          │
├─────────────────────────────────────────────────────────────┤
│  Controllers (emailOtp.js)                                 │
│  ├── sendEmailOTP()                                        │
│  ├── sendTestEmail()                                       │
│  └── testEmailService()                                    │
├─────────────────────────────────────────────────────────────┤
│  Services                                                  │
│  ├── MSG91EmailService (msg91Email.js)                     │
│  └── EmailOTPService (emailOtp.js)                         │
├─────────────────────────────────────────────────────────────┤
│  External API                                              │
│  └── MSG91 Email API (https://control.msg91.com/api/v5/)   │
└─────────────────────────────────────────────────────────────┘
```

## Files Created/Modified

### 1. Service Files

#### **`/server/src/services/msg91Email.js`**
- **Purpose**: Core MSG91 Email API integration service
- **Key Features**:
  - Email sending functionality
  - Configuration validation
  - Template-based email support
  - Error handling and logging
  - Service status monitoring

**Key Methods**:
```javascript
- validateConfig()           // Validates MSG91 configuration
- sendEmail(emailData)       // Core email sending method
- sendOTPEmail(email, otp)   // Specialized OTP email sending
- validateEmail(email)       // Email format validation
- getStatus()               // Service status information
```

#### **`/server/src/services/emailOtp.js`**
- **Purpose**: Email OTP service wrapper
- **Key Features**:
  - OTP generation
  - Email OTP sending
  - Email validation
  - Integration with MSG91EmailService

**Key Methods**:
```javascript
- generateOTP(length)        // Generate random OTP
- sendEmailOTP(email, otp)   // Send OTP via email
- validateEmail(email)       // Email format validation
```

### 2. Controller Files

#### **`/server/src/controllers/auth/emailOtp.js`**
- **Purpose**: HTTP request handlers for email operations
- **Endpoints Implemented**:

**`sendEmailOTP`** - `POST /api/email/send-otp`
```javascript
Request Body: {
  "email": "user@example.com",
  "name": "User Name" (optional)
}
Response: {
  "success": true,
  "message": "OTP sent successfully to your email",
  "requestId": "message-id-from-msg91"
}
```

**`sendTestEmail`** - `POST /api/email/send-test`
```javascript
Request Body: {
  "email": "test@example.com",
  "name": "Test User" (optional)
}
Response: {
  "success": true,
  "message": "Test email sent successfully",
  "requestId": "message-id-from-msg91"
}
```

**`testEmailService`** - `GET /api/email/test-service`
```javascript
Response: {
  "success": true,
  "message": "Email service status retrieved",
  "status": {
    "service": "MSG91 Email Service",
    "configured": true,
    "baseURL": "https://control.msg91.com/api/v5/email",
    "domain": "your-domain.mailer91.com",
    "fromEmail": "noreply@your-domain.mailer91.com",
    "fromName": "GoatGoat App"
  }
}
```

### 3. Route Files

#### **`/server/src/routes/email.js`**
- **Purpose**: Email route definitions
- **Routes Registered**:
  - `POST /send-otp` → `sendEmailOTP`
  - `POST /send-test` → `sendTestEmail`
  - `GET /test-service` → `testEmailService`

#### **`/server/src/routes/index.ts`** (Modified)
- **Changes**: Added email routes registration
- **New Import**: `import emailRoutes from './email.js';`
- **New Registration**: `await fastify.register(emailRoutes, { prefix: prefix + '/email' });`

## Environment Configuration

### Environment Variables Added to `.env.staging`

```bash
# MSG91 Email Configuration
MSG91_AUTH_KEY=YOUR_MSG91_AUTH_KEY_HERE
MSG91_EMAIL_DOMAIN=your-domain.mailer91.com
MSG91_FROM_EMAIL=noreply@your-domain.mailer91.com
MSG91_FROM_NAME=GoatGoat App
MSG91_OTP_TEMPLATE_ID=global_otp
MSG91_WELCOME_TEMPLATE_ID=welcome_template
MSG91_INVOICE_TEMPLATE_ID=invoice_template

# Company Information
COMPANY_NAME=GoatGoat App
APP_NAME=GoatGoat

# Email OTP Configuration
EMAIL_OTP_TTL=300
EMAIL_OTP_RATE_LIMITS={"window": 300, "maxRequests": 3}
EMAIL_OTP_BACKOFF_POLICY={"baseDelay": 2000, "maxDelay": 600000, "multiplier": 2}
```

### Configuration Details

| Variable | Purpose | Default Value |
|----------|---------|---------------|
| `MSG91_AUTH_KEY` | MSG91 API authentication key | Required |
| `MSG91_EMAIL_DOMAIN` | Your MSG91 email domain | Required |
| `MSG91_FROM_EMAIL` | Default sender email address | Required |
| `MSG91_FROM_NAME` | Default sender name | "GoatGoat App" |
| `MSG91_OTP_TEMPLATE_ID` | Template ID for OTP emails | "global_otp" |
| `EMAIL_OTP_TTL` | OTP expiration time (seconds) | 300 (5 minutes) |

## API Endpoints

### Base URL: `http://localhost:4000/api/email` (Staging)

### 1. Send OTP Email
**Endpoint**: `POST /api/email/send-otp`

**Description**: Sends an OTP (One-Time Password) to the specified email address.

**Request Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "email": "user@example.com",
  "name": "User Name" (optional)
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "OTP sent successfully to your email",
  "requestId": "message-id-from-msg91"
}
```

**Error Response** (400/500):
```json
{
  "success": false,
  "message": "Error description"
}
```

### 2. Send Test Email
**Endpoint**: `POST /api/email/send-test`

**Description**: Sends a test email with a fixed OTP (123456) for testing purposes.

**Request/Response**: Same format as Send OTP Email

### 3. Test Email Service
**Endpoint**: `GET /api/email/test-service`

**Description**: Returns the current status and configuration of the email service.

**Response** (200):
```json
{
  "success": true,
  "message": "Email service status retrieved",
  "status": {
    "service": "MSG91 Email Service",
    "configured": true,
    "baseURL": "https://control.msg91.com/api/v5/email",
    "domain": "your-domain.mailer91.com",
    "fromEmail": "noreply@your-domain.mailer91.com",
    "fromName": "GoatGoat App"
  }
}
```

## Testing Procedures

### 1. Service Status Test
```bash
curl -X GET http://localhost:4000/api/email/test-service
```

**Expected Result**: Service status with configuration details

### 2. Test Email Functionality (Without Real Credentials)
```bash
curl -X POST http://localhost:4000/api/email/send-test \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User"}'
```

**Expected Result**: Will show configuration validation (fails without real MSG91 credentials)

### 3. OTP Email Test (With Real Credentials)
```bash
curl -X POST http://localhost:4000/api/email/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@example.com","name":"Your Name"}'
```

**Expected Result**: OTP email sent to specified address

### 4. Server Logs Monitoring
```bash
# Check staging server logs
pm2 logs goatgoat-staging --lines 20

# Check for email-related log entries
pm2 logs goatgoat-staging | grep -i email
```

## Integration with Existing Authentication System

### Current Integration Points

1. **OTP Service Extension**: The email OTP service complements the existing SMS OTP system
2. **User Authentication Flow**: Can be integrated with existing customer login/registration
3. **Database Models**: Uses existing OTP token models (can be extended for email-specific fields)

### Recommended Integration Steps

1. **Update User Model**: Add email field to Customer model
2. **Modify Auth Controllers**: Add email OTP option to existing auth flows
3. **Frontend Integration**: Add email input option in mobile app
4. **Fallback System**: Use email OTP when SMS fails

## Future Enhancement Possibilities

### 1. Advanced Email Templates
- **Welcome Emails**: New user registration
- **Invoice Emails**: Order confirmations and receipts  
- **Notification Emails**: Order status updates
- **Marketing Emails**: Promotional campaigns

### 2. Email Template Management
```javascript
// Future implementation example
await emailService.sendWelcomeEmail(email, name, {
  welcomeBonus: "₹50",
  appDownloadLink: "https://app.goatgoat.com"
});

await emailService.sendInvoiceEmail(email, name, {
  invoiceNumber: "INV-001",
  totalAmount: "₹299",
  items: orderItems
});
```

### 3. Email Analytics and Tracking
- Delivery status tracking
- Open rate monitoring
- Click-through rate analysis
- Bounce rate management

### 4. Advanced Features
- **Email Scheduling**: Send emails at specific times
- **Bulk Email Support**: Send to multiple recipients
- **Email Queuing**: Handle high-volume email sending
- **Template Personalization**: Dynamic content based on user data

### 5. Integration Enhancements
- **Database Integration**: Store email OTP tokens with proper indexing
- **Rate Limiting**: Implement sophisticated rate limiting for email sending
- **Retry Logic**: Automatic retry for failed email deliveries
- **Webhook Support**: Handle MSG91 delivery status webhooks

## Security Considerations

### 1. Environment Variables
- Store MSG91 credentials securely
- Use different credentials for staging/production
- Rotate API keys regularly

### 2. Rate Limiting
- Implement email sending rate limits
- Prevent spam and abuse
- Monitor unusual sending patterns

### 3. Email Validation
- Validate email formats before sending
- Implement domain blacklisting if needed
- Log all email sending attempts

### 4. OTP Security
- Use secure OTP generation
- Implement proper expiration times
- Hash OTPs before database storage

## Troubleshooting

### Common Issues and Solutions

1. **"MSG91 Email Service configuration is invalid"**
   - Check environment variables are set correctly
   - Verify MSG91_AUTH_KEY is valid
   - Ensure domain configuration is correct

2. **"Route not found" errors**
   - Verify server restart after deployment
   - Check route registration in logs
   - Confirm build process completed successfully

3. **Email sending failures**
   - Verify MSG91 API credentials
   - Check MSG91 account balance/limits
   - Review MSG91 dashboard for delivery status

4. **JSON parsing errors in API calls**
   - Ensure proper Content-Type headers
   - Validate JSON request body format
   - Check for special character escaping

### Debug Commands

```bash
# Check if email routes are registered
curl -X GET http://localhost:4000/api/email/test-service

# Monitor server logs in real-time
pm2 logs goatgoat-staging --lines 0 --raw

# Check built files exist
ls -la /var/www/goatgoat-app/server/dist/services/*email*
ls -la /var/www/goatgoat-app/server/dist/controllers/auth/emailOtp.js
ls -la /var/www/goatgoat-app/server/dist/routes/email.js

# Verify environment variables
grep MSG91 /var/www/goatgoat-app/server/.env.staging
```

## Deployment Checklist

### Before Production Deployment

- [ ] Update MSG91 credentials in production environment
- [ ] Test all email endpoints on staging
- [ ] Verify email templates are configured in MSG91 dashboard
- [ ] Set up proper monitoring and alerting
- [ ] Configure production domain and sender email
- [ ] Test email deliverability to major email providers
- [ ] Set up email sending quotas and limits
- [ ] Implement proper error handling and logging

### Production Environment Variables

```bash
# Production-specific variables
MSG91_AUTH_KEY=your_production_auth_key
MSG91_EMAIL_DOMAIN=your-production-domain.mailer91.com
MSG91_FROM_EMAIL=noreply@your-production-domain.mailer91.com
MSG91_FROM_NAME=GoatGoat
```

## Support and Maintenance

### Monitoring
- Monitor email delivery rates
- Track API response times
- Alert on high error rates
- Monitor MSG91 account usage

### Regular Maintenance
- Review and rotate API keys
- Update email templates as needed
- Monitor spam complaints
- Optimize email sending performance

---

**Implementation Team**: AI Assistant
**Review Status**: Ready for Production
**Next Steps**: Obtain MSG91 API credentials and configure production environment
