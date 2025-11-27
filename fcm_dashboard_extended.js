// Extended FCM Management Dashboard - Supports both Sellers and Customers
import { Customer, DeliveryPartner, Seller } from '../../../models/index.js';
import { sendPushNotification, sendBulkPushNotifications } from '../../../services/fcmService.js';

export async function getFCMManagementDashboard(request, reply) {
  try {
    // Get token counts
    const customerTokenCount = await Customer.countDocuments({ fcmToken: { $exists: true, $ne: null } });
    const deliveryPartnerTokenCount = await DeliveryPartner.countDocuments({ fcmToken: { $exists: true, $ne: null } });
    
    // Try to get Seller count (may not exist in all environments)
    let sellerTokenCount = 0;
    try {
      if (Seller) {
        sellerTokenCount = await Seller.countDocuments({ fcmTokens: { $exists: true, $ne: [] } });
      }
    } catch (e) {
      console.log('Seller model not available');
    }

    const totalTokens = customerTokenCount + deliveryPartnerTokenCount + sellerTokenCount;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GoatGoat FCM Management</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0f0f0f; color: #fff; padding: 20px; }
        .container { max-width: 1400px; margin: 0 auto; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px; margin-bottom: 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); }
        .header h1 { font-size: 32px; margin-bottom: 10px; }
        .header p { opacity: 0.9; font-size: 16px; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .stat-card { background: #1a1a1a; border: 1px solid #333; border-radius: 12px; padding: 25px; transition: transform 0.2s, box-shadow 0.2s; }
        .stat-card:hover { transform: translateY(-5px); box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3); }
        .stat-card h3 { font-size: 14px; color: #888; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; }
        .stat-card .number { font-size: 36px; font-weight: bold; color: #667eea; margin-bottom: 5px; }
        .stat-card .label { font-size: 12px; color: #666; }
        .section { background: #1a1a1a; border: 1px solid #333; border-radius: 12px; padding: 30px; margin-bottom: 20px; }
        .section h2 { font-size: 24px; margin-bottom: 20px; color: #667eea; border-bottom: 2px solid #333; padding-bottom: 10px; }
        .form-group { margin-bottom: 20px; }
        .form-group label { display: block; margin-bottom: 8px; font-weight: 600; color: #aaa; }
        .form-group input, .form-group textarea, .form-group select { width: 100%; padding: 12px; background: #0f0f0f; border: 1px solid #333; border-radius: 8px; color: #fff; font-size: 14px; }
        .form-group input:focus, .form-group textarea:focus, .form-group select:focus { outline: none; border-color: #667eea; }
        .form-group textarea { min-height: 100px; resize: vertical; font-family: inherit; }
        .btn { display: inline-block; padding: 12px 24px; background: #667eea; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600; text-decoration: none; transition: background 0.2s; margin-right: 10px; }
        .btn:hover { background: #5568d3; }
        .btn-secondary { background: #444; }
        .btn-secondary:hover { background: #555; }
        .btn-danger { background: #e74c3c; }
        .btn-danger:hover { background: #c0392b; }
        .btn-success { background: #27ae60; }
        .btn-success:hover { background: #229954; }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .result { margin-top: 20px; padding: 15px; border-radius: 8px; display: none; }
        .result.success { background: #27ae6020; border: 1px solid #27ae60; color: #27ae60; }
        .result.error { background: #e74c3c20; border: 1px solid #e74c3c; color: #e74c3c; }
        .nav-links { margin-top: 20px; padding-top: 20px; border-top: 1px solid #333; }
        @media (max-width: 768px) { .grid-2 { grid-template-columns: 1fr; } }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔔 FCM Management Dashboard</h1>
            <p>Manage push notifications for Customers, Sellers, and Delivery Partners</p>
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <h3>Total Tokens</h3>
                <div class="number">${totalTokens}</div>
                <div class="label">Active FCM Tokens</div>
            </div>
            <div class="stat-card">
                <h3>Customers</h3>
                <div class="number">${customerTokenCount}</div>
                <div class="label">Customer Tokens</div>
            </div>
            <div class="stat-card">
                <h3>Sellers</h3>
                <div class="number">${sellerTokenCount}</div>
                <div class="label">Seller Tokens</div>
            </div>
            <div class="stat-card">
                <h3>Delivery Partners</h3>
                <div class="number">${deliveryPartnerTokenCount}</div>
                <div class="label">Delivery Tokens</div>
            </div>
        </div>

        <div class="grid-2">
            <!-- Send to Customers -->
            <div class="section">
                <h2>📱 Send to Customers</h2>
                <form id="customerForm">
                    <div class="form-group">
                        <label>Target</label>
                        <select id="customerTarget" name="target">
                            <option value="all">All Customers</option>
                            <option value="specific">Specific Customer (Phone)</option>
                        </select>
                    </div>
                    <div class="form-group" id="customerPhoneGroup" style="display:none;">
                        <label>Customer Phone</label>
                        <input type="text" id="customerPhone" placeholder="Enter phone number">
                    </div>
                    <div class="form-group">
                        <label>Title</label>
                        <input type="text" id="customerTitle" placeholder="Notification title" required>
                    </div>
                    <div class="form-group">
                        <label>Message</label>
                        <textarea id="customerMessage" placeholder="Notification message" required></textarea>
                    </div>
                    <div class="form-group">
                        <label>Type</label>
                        <select id="customerType">
                            <option value="general">General</option>
                            <option value="order">Order Update</option>
                            <option value="delivery">Delivery Update</option>
                            <option value="promotion">Promotion</option>
                        </select>
                    </div>
                    <button type="submit" class="btn btn-success">Send to Customers</button>
                </form>
                <div id="customerResult" class="result"></div>
            </div>

            <!-- Send to Sellers -->
            <div class="section">
                <h2>🏪 Send to Sellers</h2>
                <form id="sellerForm">
                    <div class="form-group">
                        <label>Target</label>
                        <select id="sellerTarget" name="target">
                            <option value="all">All Sellers</option>
                            <option value="specific">Specific Seller (Phone)</option>
                        </select>
                    </div>
                    <div class="form-group" id="sellerPhoneGroup" style="display:none;">
                        <label>Seller Phone</label>
                        <input type="text" id="sellerPhone" placeholder="Enter phone number">
                    </div>
                    <div class="form-group">
                        <label>Title</label>
                        <input type="text" id="sellerTitle" placeholder="Notification title" required>
                    </div>
                    <div class="form-group">
                        <label>Message</label>
                        <textarea id="sellerMessage" placeholder="Notification message" required></textarea>
                    </div>
                    <div class="form-group">
                        <label>Type</label>
                        <select id="sellerType">
                            <option value="general">General</option>
                            <option value="order">New Order</option>
                            <option value="system">System Update</option>
                        </select>
                    </div>
                    <button type="submit" class="btn btn-success">Send to Sellers</button>
                </form>
                <div id="sellerResult" class="result"></div>
            </div>
        </div>

        <!-- Send to Delivery Partners -->
        <div class="section">
            <h2>🚴 Send to Delivery Partners</h2>
            <form id="deliveryForm">
                <div class="grid-2">
                    <div class="form-group">
                        <label>Target</label>
                        <select id="deliveryTarget" name="target">
                            <option value="all">All Delivery Partners</option>
                            <option value="specific">Specific Partner (Email)</option>
                        </select>
                    </div>
                    <div class="form-group" id="deliveryEmailGroup" style="display:none;">
                        <label>Partner Email</label>
                        <input type="email" id="deliveryEmail" placeholder="Enter email">
                    </div>
                </div>
                <div class="grid-2">
                    <div class="form-group">
                        <label>Title</label>
                        <input type="text" id="deliveryTitle" placeholder="Notification title" required>
                    </div>
                    <div class="form-group">
                        <label>Type</label>
                        <select id="deliveryType">
                            <option value="general">General</option>
                            <option value="order">New Delivery</option>
                            <option value="system">System Update</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label>Message</label>
                    <textarea id="deliveryMessage" placeholder="Notification message" required></textarea>
                </div>
                <button type="submit" class="btn btn-success">Send to Delivery Partners</button>
            </form>
            <div id="deliveryResult" class="result"></div>
        </div>

        <div class="nav-links">
            <a href="/admin" class="btn btn-secondary">← Back to Admin</a>
            <a href="/admin/monitoring-dashboard" class="btn btn-secondary">📊 Monitoring</a>
            <a href="/api/notifications/fcm-status" class="btn btn-secondary" target="_blank">🔍 FCM Status</a>
        </div>
    </div>

    <script>
        // Show/hide specific target fields
        document.getElementById('customerTarget').addEventListener('change', (e) => {
            document.getElementById('customerPhoneGroup').style.display = e.target.value === 'specific' ? 'block' : 'none';
        });
        document.getElementById('sellerTarget').addEventListener('change', (e) => {
            document.getElementById('sellerPhoneGroup').style.display = e.target.value === 'specific' ? 'block' : 'none';
        });
        document.getElementById('deliveryTarget').addEventListener('change', (e) => {
            document.getElementById('deliveryEmailGroup').style.display = e.target.value === 'specific' ? 'block' : 'none';
        });

        // Customer Form Submit
        document.getElementById('customerForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const resultDiv = document.getElementById('customerResult');
            const target = document.getElementById('customerTarget').value;
            const phone = document.getElementById('customerPhone').value;
            const title = document.getElementById('customerTitle').value;
            const message = document.getElementById('customerMessage').value;
            const type = document.getElementById('customerType').value;

            try {
                const response = await fetch('/api/fcm/send-to-customers', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ target, phone, title, message, type })
                });
                const data = await response.json();
                resultDiv.className = 'result ' + (data.success ? 'success' : 'error');
                resultDiv.textContent = data.message || JSON.stringify(data);
                resultDiv.style.display = 'block';
            } catch (error) {
                resultDiv.className = 'result error';
                resultDiv.textContent = 'Error: ' + error.message;
                resultDiv.style.display = 'block';
            }
        });

        // Seller Form Submit
        document.getElementById('sellerForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const resultDiv = document.getElementById('sellerResult');
            const target = document.getElementById('sellerTarget').value;
            const phone = document.getElementById('sellerPhone').value;
            const title = document.getElementById('sellerTitle').value;
            const message = document.getElementById('sellerMessage').value;
            const type = document.getElementById('sellerType').value;

            try {
                const response = await fetch('/api/fcm/send-to-sellers', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ target, phone, title, message, type })
                });
                const data = await response.json();
                resultDiv.className = 'result ' + (data.success ? 'success' : 'error');
                resultDiv.textContent = data.message || JSON.stringify(data);
                resultDiv.style.display = 'block';
            } catch (error) {
                resultDiv.className = 'result error';
                resultDiv.textContent = 'Error: ' + error.message;
                resultDiv.style.display = 'block';
            }
        });

        // Delivery Form Submit
        document.getElementById('deliveryForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const resultDiv = document.getElementById('deliveryResult');
            const target = document.getElementById('deliveryTarget').value;
            const email = document.getElementById('deliveryEmail').value;
            const title = document.getElementById('deliveryTitle').value;
            const message = document.getElementById('deliveryMessage').value;
            const type = document.getElementById('deliveryType').value;

            try {
                const response = await fetch('/api/fcm/send-to-delivery', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ target, email, title, message, type })
                });
                const data = await response.json();
                resultDiv.className = 'result ' + (data.success ? 'success' : 'error');
                resultDiv.textContent = data.message || JSON.stringify(data);
                resultDiv.style.display = 'block';
            } catch (error) {
                resultDiv.className = 'result error';
                resultDiv.textContent = 'Error: ' + error.message;
                resultDiv.style.display = 'block';
            }
        });
    </script>
</body>
</html>`;

    reply.type('text/html').send(html);
  } catch (error) {
    console.error('FCM Dashboard error:', error);
    reply.status(500).send({ error: 'Failed to load FCM dashboard', message: error.message });
  }
}

// API endpoint to send notifications to customers
export async function sendToCustomers(request, reply) {
  try {
    const { target, phone, title, message, type } = request.body;
    
    if (target === 'all') {
      // Broadcast to all customers
      const customers = await Customer.find({ fcmToken: { $exists: true, $ne: null } });
      const tokens = customers.map(c => c.fcmToken).filter(t => t);
      
      if (tokens.length === 0) {
        return reply.send({ success: false, message: 'No customer tokens found' });
      }

      const result = await sendBulkPushNotifications(tokens, {
        title,
        body: message,
        data: { type }
      });

      return reply.send({ 
        success: true, 
        message: `Sent to ${result.successCount}/${tokens.length} customers`,
        details: result
      });
    } else {
      // Send to specific customer
      const customer = await Customer.findOne({ phone: parseInt(phone) });
      if (!customer || !customer.fcmToken) {
        return reply.send({ success: false, message: 'Customer not found or no FCM token' });
      }

      const result = await sendPushNotification(customer.fcmToken, {
        title,
        body: message,
        data: { type }
      });

      return reply.send({ success: true, message: 'Notification sent to customer', details: result });
    }
  } catch (error) {
    console.error('Send to customers error:', error);
    return reply.status(500).send({ success: false, message: error.message });
  }
}

// API endpoint to send notifications to sellers
export async function sendToSellers(request, reply) {
  try {
    const { target, phone, title, message, type } = request.body;
    
    if (target === 'all') {
      // Broadcast to all sellers
      const sellers = await Seller.find({ fcmTokens: { $exists: true, $ne: [] } });
      const tokens = sellers.flatMap(s => s.fcmTokens || []).filter(t => t);
      
      if (tokens.length === 0) {
        return reply.send({ success: false, message: 'No seller tokens found' });
      }

      const result = await sendBulkPushNotifications(tokens, {
        title,
        body: message,
        data: { type }
      });

      return reply.send({ 
        success: true, 
        message: `Sent to ${result.successCount}/${tokens.length} sellers`,
        details: result
      });
    } else {
      // Send to specific seller
      const seller = await Seller.findOne({ phone: parseInt(phone) });
      if (!seller || !seller.fcmTokens || seller.fcmTokens.length === 0) {
        return reply.send({ success: false, message: 'Seller not found or no FCM tokens' });
      }

      const result = await sendBulkPushNotifications(seller.fcmTokens, {
        title,
        body: message,
        data: { type }
      });

      return reply.send({ success: true, message: 'Notification sent to seller', details: result });
    }
  } catch (error) {
    console.error('Send to sellers error:', error);
    return reply.status(500).send({ success: false, message: error.message });
  }
}

// API endpoint to send notifications to delivery partners
export async function sendToDelivery(request, reply) {
  try {
    const { target, email, title, message, type } = request.body;
    
    if (target === 'all') {
      // Broadcast to all delivery partners
      const partners = await DeliveryPartner.find({ fcmToken: { $exists: true, $ne: null } });
      const tokens = partners.map(p => p.fcmToken).filter(t => t);
      
      if (tokens.length === 0) {
        return reply.send({ success: false, message: 'No delivery partner tokens found' });
      }

      const result = await sendBulkPushNotifications(tokens, {
        title,
        body: message,
        data: { type }
      });

      return reply.send({ 
        success: true, 
        message: `Sent to ${result.successCount}/${tokens.length} delivery partners`,
        details: result
      });
    } else {
      // Send to specific delivery partner
      const partner = await DeliveryPartner.findOne({ email });
      if (!partner || !partner.fcmToken) {
        return reply.send({ success: false, message: 'Delivery partner not found or no FCM token' });
      }

      const result = await sendPushNotification(partner.fcmToken, {
        title,
        body: message,
        data: { type }
      });

      return reply.send({ success: true, message: 'Notification sent to delivery partner', details: result });
    }
  } catch (error) {
    console.error('Send to delivery error:', error);
    return reply.status(500).send({ success: false, message: error.message });
  }
}

