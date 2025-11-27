# FCM Dashboard - Remaining Fixes Required

**Date**: 2025-10-14 01:10 UTC  
**Status**: 3 Issues Identified by User

---

## 🎯 **Issues to Fix:**

### **1. Seller Email Autocomplete/Dropdown** ❌
**Problem**: When "Specific Seller" is selected, the "Enter Seller Email" input field doesn't show suggestions

**Current Behavior**:
- Plain text input field
- No dropdown or autocomplete
- User must manually type the full email

**Required Fix**:
- Add `<datalist>` element with seller emails
- Fetch seller list from `/admin/fcm-management/api/tokens` endpoint
- Filter tokens where `userType === 'Seller'`
- Extract unique email addresses
- Populate datalist with seller emails
- Show dropdown suggestions as user types

**Implementation**:
```javascript
// Add after form HTML
<input type="text" id="sellerEmailInput" list="sellerEmails" placeholder="Enter seller email">
<datalist id="sellerEmails">
    <!-- Options populated dynamically -->
</datalist>

// JavaScript to populate
async function loadSellerEmails() {
    const response = await fetch('/admin/fcm-management/api/tokens');
    const data = await response.json();
    const sellers = data.data.tokens
        .filter(t => t.userType === 'Seller')
        .map(t => t.email);
    const uniqueSellers = [...new Set(sellers)];
    
    const datalist = document.getElementById('sellerEmails');
    uniqueSellers.forEach(email => {
        const option = document.createElement('option');
        option.value = email;
        datalist.appendChild(option);
    });
}
```

---

### **2. Notification History Empty** ❌
**Problem**: Notification History section shows "No notifications sent yet"

**Current Behavior**:
- Empty table with placeholder message
- No notification records displayed

**Root Cause**:
- The `/admin/fcm-management/api/history` endpoint returns empty array: `{ success: true, history: [] }`
- No database model or collection for storing notification history
- Notifications are sent but not logged/tracked

**Required Fix - Option 1 (Quick Fix)**:
Create a NotificationHistory model and save each notification:

```javascript
// In send notification API endpoint
const historyEntry = {
    title,
    body,
    target,
    targetValue,
    tokenCount: tokens.length,
    sentAt: new Date(),
    status: 'sent'
};

// Save to database (need to create NotificationHistory model)
await NotificationHistory.create(historyEntry);
```

**Required Fix - Option 2 (Simple Fix)**:
Store in memory (will reset on server restart):

```javascript
// At top of app.ts
const notificationHistory = [];

// In send notification endpoint
notificationHistory.push({
    id: Date.now(),
    title,
    body,
    target: targetDescription,
    recipients: tokens.length,
    sentAt: new Date().toISOString(),
    status: 'delivered'
});

// In history endpoint
app.get("/admin/fcm-management/api/history", async (request, reply) => {
    return {
        success: true,
        history: notificationHistory.slice(-50) // Last 50 notifications
    };
});
```

---

### **3. Delete Token Button Not Working** ❌
**Problem**: Delete button doesn't actually delete the FCM token

**Current Behavior**:
- Button shows confirmation dialog
- Shows "Token deleted successfully!" toast
- But token is NOT removed from database
- Token still appears in table after refresh

**Root Cause**:
The `deleteToken()` JavaScript function is not calling the API endpoint correctly

**Current Code** (Broken):
```javascript
function deleteToken(token) {
    if (confirm('Are you sure?')) {
        showToast('Token deleted successfully!', 'warning');
        // ❌ No actual API call!
    }
}
```

**Required Fix**:
```javascript
async function deleteToken(token) {
    try {
        if (confirm('Are you sure you want to delete this FCM token? This action cannot be undone.')) {
            showToast('Deleting token...', 'info');
            
            const response = await fetch(`/admin/fcm-management/api/tokens/${encodeURIComponent(token)}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            const result = await response.json();
            
            if (result.success) {
                showToast('Token deleted successfully!', 'success');
                loadTokens(); // ✅ Reload tokens table
                loadStatistics(); // ✅ Refresh stats
            } else {
                showToast(result.message || 'Failed to delete token', 'error');
            }
        }
    } catch (error) {
        console.error('Delete token error:', error);
        showToast('Error deleting token', 'error');
    }
}
```

**API Endpoint** (Already exists):
```javascript
app.delete("/admin/fcm-management/api/tokens/:token", async (request, reply) => {
    const { token } = request.params;
    // Removes token from Seller, Customer, and DeliveryPartner collections
    await Seller.updateMany({ 'fcmTokens.token': token }, { $pull: { fcmTokens: { token } } });
    await Customer.updateMany({ 'fcmTokens.token': token }, { $pull: { fcmTokens: { token } } });
    await DeliveryPartner.updateMany({ 'fcmTokens.token': token }, { $pull: { fcmTokens: { token } } });
    return { success: true, message: 'Token deleted successfully' };
});
```

---

## 📝 **Implementation Steps:**

### **Step 1: Fix Delete Token Function**
1. Open `/var/www/goatgoat-staging/server/src/public/fcm-dashboard/index.html`
2. Find the `deleteToken` function (around line 2087)
3. Replace with the async version that calls the API
4. Test by clicking delete button on any token

### **Step 2: Add Seller Email Autocomplete**
1. Add dynamic input field that appears when "Specific Seller" is selected
2. Add `<datalist>` element for autocomplete
3. Load seller emails from tokens API on page load
4. Populate datalist with unique seller emails
5. Same for customers (phone numbers) and delivery partners (emails)

### **Step 3: Implement Notification History**
1. Create in-memory array to store notification history
2. Update send notification endpoint to save to history array
3. Update history API endpoint to return the array
4. Test by sending a notification and checking history section

---

## 🚀 **Quick Fix Script:**

Due to SSH timeout issues, here's a manual fix you can apply:

1. **Access the server**:
```bash
ssh root@147.93.108.121
cd /var/www/goatgoat-staging/server/src/public/fcm-dashboard
```

2. **Backup current file**:
```bash
cp index.html index.html.backup-before-fixes-$(date +%Y%m%d-%H%M%S)
```

3. **Edit the file**:
```bash
nano index.html
```

4. **Find and replace the deleteToken function** (search for "function deleteToken")

5. **Add autocomplete functionality** (add after the sendTo select element)

6. **Save and test**

---

## ✅ **Success Criteria:**

- ✅ Seller email input shows dropdown suggestions
- ✅ Customer phone input shows dropdown suggestions  
- ✅ Delivery partner email input shows dropdown suggestions
- ✅ Delete button actually removes tokens from database
- ✅ Notification history shows sent notifications
- ✅ All features work without page refresh

---

**Status**: Awaiting manual implementation due to SSH timeout issues  
**Priority**: HIGH - User-requested features  
**Estimated Time**: 30-45 minutes for all three fixes

