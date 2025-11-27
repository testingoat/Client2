// Script to update FCM dashboard HTML to support Customers and DeliveryPartners
const fs = require('fs');

const htmlPath = 'fcm_dashboard_current_staging.html';
let content = fs.readFileSync(htmlPath, 'utf8');

// 1. Update statistics section to include Customers and Delivery Partners
const oldStats = `                <div class="metric">
                    <span class="metric-label">Active Sellers:</span>
                    <span class="metric-value">--</span>
                </div>`;

const newStats = `                <div class="metric">
                    <span class="metric-label">Total Customers:</span>
                    <span class="metric-value user-type-customer">--</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Total Sellers:</span>
                    <span class="metric-value user-type-seller">--</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Total Delivery Partners:</span>
                    <span class="metric-value user-type-delivery">--</span>
                </div>`;

content = content.replace(oldStats, newStats);

// 2. Update the Send To dropdown
const oldDropdown = `                        <select id="targetingType" name="targetType" required>
                            <option value="all">All Sellers (21 tokens)</option>
                            <option value="sellers">Specific Sellers</option>
                            <option value="tokens">Specific Tokens</option>
                        </select>`;

const newDropdown = `                        <select id="targetingType" name="targetType" required>
                            <option value="">-- Select Target --</option>
                            <option value="all-users">🌐 All Users (Customers + Sellers + Delivery)</option>
                            <option value="all-customers">👥 All Customers (<span id="customerCountInline">--</span>)</option>
                            <option value="all-sellers">🏪 All Sellers (<span id="sellerCountInline">--</span>)</option>
                            <option value="all-delivery">🚴 All Delivery Partners (<span id="deliveryCountInline">--</span>)</option>
                            <option value="customers">👤 Specific Customers</option>
                            <option value="sellers">🏪 Specific Sellers</option>
                            <option value="delivery">🚴 Specific Delivery Partners</option>
                            <option value="tokens">🎯 Specific Tokens</option>
                        </select>`;

content = content.replace(oldDropdown, newDropdown);

// 3. Add Customer and Delivery Partner selection controls after Seller controls
const sellerControlsEnd = `                    </div>

                    <div id="specificTokenControls"`;

const customerAndDeliveryControls = `                    </div>

                    <!-- Specific Customer Controls -->
                    <div id="specificCustomerControls" class="form-group" style="display: none;">
                        <label>Select Customers <span id="customerLoader" class="loader" style="display: none;">Loading...</span></label>
                        <div class="multi-select-container">
                            <div class="multi-select-header" id="customerSelectHeader">
                                <span>Choose customers...</span>
                                <span class="dropdown-arrow">▼</span>
                            </div>
                            <div class="multi-select-options" id="customerSelectOptions">
                                <!-- Dynamically populated -->
                            </div>
                        </div>
                        <div class="selected-items" id="selectedCustomers"></div>
                    </div>

                    <!-- Specific Delivery Partner Controls -->
                    <div id="specificDeliveryControls" class="form-group" style="display: none;">
                        <label>Select Delivery Partners <span id="deliveryLoader" class="loader" style="display: none;">Loading...</span></label>
                        <div class="multi-select-container">
                            <div class="multi-select-header" id="deliverySelectHeader">
                                <span>Choose delivery partners...</span>
                                <span class="dropdown-arrow">▼</span>
                            </div>
                            <div class="multi-select-options" id="deliverySelectOptions">
                                <!-- Dynamically populated -->
                            </div>
                        </div>
                        <div class="selected-items" id="selectedDelivery"></div>
                    </div>

                    <div id="specificTokenControls"`;

content = content.replace(sellerControlsEnd, customerAndDeliveryControls);

// 4. Update tokens table header to include User Type column
const oldTableHeader = `                    <thead>
                        <tr>
                            <th>Seller</th>
                            <th>Token</th>
                            <th>Platform</th>
                            <th>Created At</th>
                        </tr>
                    </thead>`;

const newTableHeader = `                    <thead>
                        <tr>
                            <th>User Type</th>
                            <th>User</th>
                            <th>Token</th>
                            <th>Platform</th>
                            <th>Created At</th>
                        </tr>
                    </thead>`;

content = content.replace(oldTableHeader, newTableHeader);

// 5. Update history table header to include User Type column
const oldHistoryHeader = `                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Message</th>
                            <th>Target</th>
                            <th>Status</th>
                            <th>Sent Count</th>
                            <th>Date</th>
                        </tr>
                    </thead>`;

const newHistoryHeader = `                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Message</th>
                            <th>Target Type</th>
                            <th>Status</th>
                            <th>Sent Count</th>
                            <th>Date</th>
                        </tr>
                    </thead>`;

content = content.replace(oldHistoryHeader, newHistoryHeader);

// 6. Add CSS for user type badges
const cssEnd = `        .placeholder p {
            margin: 8px 0;
        }`;

const newCSS = `        .placeholder p {
            margin: 8px 0;
        }
        .user-type-customer { color: #3498db !important; }
        .user-type-seller { color: #f39c12 !important; }
        .user-type-delivery { color: #27ae60 !important; }
        .badge-customer {
            background: #3498db;
            color: #ffffff;
        }
        .badge-seller {
            background: #f39c12;
            color: #1a1a1a;
        }
        .badge-delivery {
            background: #27ae60;
            color: #ffffff;
        }`;

content = content.replace(cssEnd, newCSS);

// Write the updated content
fs.writeFileSync('fcm_dashboard_updated.html', content, 'utf8');
console.log('✅ Updated dashboard HTML with Customer and DeliveryPartner support');
console.log('📝 Output file: fcm_dashboard_updated.html');

