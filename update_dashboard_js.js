// Script to update JavaScript functions in the dashboard HTML
const fs = require('fs');

const htmlPath = 'fcm_dashboard_updated.html';
let content = fs.readFileSync(htmlPath, 'utf8');

// 1. Update loadFCMStatistics to handle all user types
const oldStatsUpdate = `            // Update Active Sellers - FIXED: use stats.overview.totalSellers  
            const activeSellersElement = findByLabel('Active Sellers');
            if (activeSellersElement) {
                activeSellersElement.textContent = stats.overview?.totalSellers || stats.tokens?.sellersWithTokens || '--';
                activeSellersElement.className = 'metric-value';
                console.log('Updated Active Sellers:', activeSellersElement.textContent);
            }`;

const newStatsUpdate = `            // Update Total Customers
            const totalCustomersElement = findByLabel('Total Customers');
            if (totalCustomersElement) {
                totalCustomersElement.textContent = stats.overview?.totalCustomers || '--';
                totalCustomersElement.className = 'metric-value user-type-customer';
                console.log('Updated Total Customers:', totalCustomersElement.textContent);
            }
            
            // Update Total Sellers
            const totalSellersElement = findByLabel('Total Sellers');
            if (totalSellersElement) {
                totalSellersElement.textContent = stats.overview?.totalSellers || '--';
                totalSellersElement.className = 'metric-value user-type-seller';
                console.log('Updated Total Sellers:', totalSellersElement.textContent);
            }
            
            // Update Total Delivery Partners
            const totalDeliveryElement = findByLabel('Total Delivery Partners');
            if (totalDeliveryElement) {
                totalDeliveryElement.textContent = stats.overview?.totalDeliveryPartners || '--';
                totalDeliveryElement.className = 'metric-value user-type-delivery';
                console.log('Updated Total Delivery Partners:', totalDeliveryElement.textContent);
            }
            
            // Update inline counts in dropdown
            const customerCountInline = document.getElementById('customerCountInline');
            const sellerCountInline = document.getElementById('sellerCountInline');
            const deliveryCountInline = document.getElementById('deliveryCountInline');
            if (customerCountInline) customerCountInline.textContent = stats.overview?.totalCustomers || '--';
            if (sellerCountInline) sellerCountInline.textContent = stats.overview?.totalSellers || '--';
            if (deliveryCountInline) deliveryCountInline.textContent = stats.overview?.totalDeliveryPartners || '--';`;

content = content.replace(oldStatsUpdate, newStatsUpdate);

// 2. Update loadTokens function to handle all user types
const oldTokensTable = `                    // Add each token to the table
                    data.tokens.forEach(token => {
                        const row = tableBody.insertRow();
                        row.innerHTML = \`
                            <td class="seller-email">\${token.sellerEmail}</td>
                            <td>
                                <code>\${token.token.substring(0, 25)}…</code>
                                <span style="cursor:pointer;margin-left:4px;" onclick="copyToken('\${token.token}')" title="Copy full token">📋</span>
                            </td>
                            <td>\${token.platform || 'android'}</td>
                            <td>\${new Date(token.createdAt).toLocaleDateString()}</td>
                        \`;
                    });`;

const newTokensTable = `                    // Add each token to the table
                    data.tokens.forEach(token => {
                        const row = tableBody.insertRow();
                        const userType = token.userType || 'seller';
                        const userTypeBadge = userType === 'customer' ? '<span class="badge badge-customer">Customer</span>' :
                                             userType === 'delivery' ? '<span class="badge badge-delivery">Delivery</span>' :
                                             '<span class="badge badge-seller">Seller</span>';
                        const userIdentifier = token.userIdentifier || token.sellerEmail || 'N/A';
                        
                        row.innerHTML = \`
                            <td>\${userTypeBadge}</td>
                            <td class="\${userType === 'customer' ? 'user-type-customer' : userType === 'delivery' ? 'user-type-delivery' : 'seller-email'}">\${userIdentifier}</td>
                            <td>
                                <code>\${token.token.substring(0, 25)}…</code>
                                <span style="cursor:pointer;margin-left:4px;" onclick="copyToken('\${token.token}')" title="Copy full token">📋</span>
                            </td>
                            <td>\${token.platform || 'android'}</td>
                            <td>\${new Date(token.createdAt).toLocaleDateString()}</td>
                        \`;
                    });`;

content = content.replace(oldTokensTable, newTokensTable);

// 3. Update table loading message colspan
content = content.replace(
    `<tr><td colspan="4" style="text-align: center; font-style: italic; color: #999;">No FCM tokens registered yet</td></tr>`,
    `<tr><td colspan="5" style="text-align: center; font-style: italic; color: #999;">No FCM tokens registered yet</td></tr>`
);

content = content.replace(
    `<tr><td colspan="4" style="text-align: center; color: #ff6b6b;">Error loading tokens</td></tr>`,
    `<tr><td colspan="5" style="text-align: center; color: #ff6b6b;">Error loading tokens</td></tr>`
);

// 4. Update handleTargetTypeChange to support new user types
const oldTargetTypeChange = `        function handleTargetTypeChange() {
            const targetType = document.getElementById('targetingType').value;
            const sellerControls = document.getElementById('specificSellerControls');
            const tokenControls = document.getElementById('specificTokenControls');
            
            // Hide all specific controls first
            sellerControls.style.display = 'none';
            tokenControls.style.display = 'none';
            
            // Clear previous selections
            clearSelections();
            
            // Show appropriate controls
            if (targetType === 'sellers') {
                sellerControls.style.display = 'block';
                loadAndPopulateSellerOptions();
            } else if (targetType === 'tokens') {
                tokenControls.style.display = 'block';
                loadAndPopulateTokenOptions();
            }
        }`;

const newTargetTypeChange = `        function handleTargetTypeChange() {
            const targetType = document.getElementById('targetingType').value;
            const customerControls = document.getElementById('specificCustomerControls');
            const sellerControls = document.getElementById('specificSellerControls');
            const deliveryControls = document.getElementById('specificDeliveryControls');
            const tokenControls = document.getElementById('specificTokenControls');
            
            // Hide all specific controls first
            customerControls.style.display = 'none';
            sellerControls.style.display = 'none';
            deliveryControls.style.display = 'none';
            tokenControls.style.display = 'none';
            
            // Clear previous selections
            clearSelections();
            
            // Show appropriate controls
            if (targetType === 'customers') {
                customerControls.style.display = 'block';
                loadAndPopulateCustomerOptions();
            } else if (targetType === 'sellers') {
                sellerControls.style.display = 'block';
                loadAndPopulateSellerOptions();
            } else if (targetType === 'delivery') {
                deliveryControls.style.display = 'block';
                loadAndPopulateDeliveryOptions();
            } else if (targetType === 'tokens') {
                tokenControls.style.display = 'block';
                loadAndPopulateTokenOptions();
            }
        }`;

content = content.replace(oldTargetTypeChange, newTargetTypeChange);

// Write the updated content
fs.writeFileSync('fcm_dashboard_updated.html', content, 'utf8');
console.log('✅ Updated JavaScript functions in dashboard HTML');

