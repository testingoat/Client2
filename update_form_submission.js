// Script to update form submission to handle all user types
const fs = require('fs');

const htmlPath = 'fcm_dashboard_updated.html';
let content = fs.readFileSync(htmlPath, 'utf8');

// Update form submission to include customer and delivery IDs
const oldFormData = `                    // Build form data with Phase 5.1 enhancements
                    const formData = {
                        title: document.getElementById('notificationTitle').value.trim(),
                        message: document.getElementById('notificationMessage').value.trim(),
                        targetType: targetType
                    };
                    
                    // Add specific targets based on selection
                    if (targetType === 'sellers' && selectedSellers.length > 0) {
                        formData.sellerIds = selectedSellers.map(s => s.id);
                    } else if (targetType === 'tokens' && selectedTokens.length > 0) {
                        formData.tokens = selectedTokens.map(t => t.token);
                    }`;

const newFormData = `                    // Build form data with all user types
                    const formData = {
                        title: document.getElementById('notificationTitle').value.trim(),
                        message: document.getElementById('notificationMessage').value.trim(),
                        targetType: targetType
                    };
                    
                    // Add specific targets based on selection
                    if (targetType === 'customers' && selectedCustomers.length > 0) {
                        formData.customerIds = selectedCustomers.map(c => c.userId);
                    } else if (targetType === 'sellers' && selectedSellers.length > 0) {
                        formData.sellerIds = selectedSellers.map(s => s.id || s.userId);
                    } else if (targetType === 'delivery' && selectedDelivery.length > 0) {
                        formData.deliveryPartnerIds = selectedDelivery.map(d => d.userId);
                    } else if (targetType === 'tokens' && selectedTokens.length > 0) {
                        formData.tokens = selectedTokens.map(t => t.token);
                    }`;

content = content.replace(oldFormData, newFormData);

// Update form validation
const oldValidation = `            if (targetType === 'sellers' && selectedSellers.length === 0) {
                return { valid: false, error: 'Please select at least one seller' };
            }
            
            if (targetType === 'tokens' && selectedTokens.length === 0) {
                return { valid: false, error: 'Please select at least one token' };
            }`;

const newValidation = `            if (targetType === 'customers' && selectedCustomers.length === 0) {
                return { valid: false, error: 'Please select at least one customer' };
            }
            
            if (targetType === 'sellers' && selectedSellers.length === 0) {
                return { valid: false, error: 'Please select at least one seller' };
            }
            
            if (targetType === 'delivery' && selectedDelivery.length === 0) {
                return { valid: false, error: 'Please select at least one delivery partner' };
            }
            
            if (targetType === 'tokens' && selectedTokens.length === 0) {
                return { valid: false, error: 'Please select at least one token' };
            }`;

content = content.replace(oldValidation, newValidation);

// Add dropdown click handlers for customer and delivery
const oldDropdownHandlers = `            // Setup dropdown click handlers
            const sellerHeader = document.getElementById('sellerSelectHeader');
            const tokenHeader = document.getElementById('tokenSelectHeader');
            
            if (sellerHeader) {
                sellerHeader.addEventListener('click', () => {
                    toggleDropdown('sellerSelectHeader', 'sellerSelectOptions');
                });
            }
            
            if (tokenHeader) {
                tokenHeader.addEventListener('click', () => {
                    toggleDropdown('tokenSelectHeader', 'tokenSelectOptions');
                });
            }`;

const newDropdownHandlers = `            // Setup dropdown click handlers
            const customerHeader = document.getElementById('customerSelectHeader');
            const sellerHeader = document.getElementById('sellerSelectHeader');
            const deliveryHeader = document.getElementById('deliverySelectHeader');
            const tokenHeader = document.getElementById('tokenSelectHeader');
            
            if (customerHeader) {
                customerHeader.addEventListener('click', () => {
                    toggleDropdown('customerSelectHeader', 'customerSelectOptions');
                });
            }
            
            if (sellerHeader) {
                sellerHeader.addEventListener('click', () => {
                    toggleDropdown('sellerSelectHeader', 'sellerSelectOptions');
                });
            }
            
            if (deliveryHeader) {
                deliveryHeader.addEventListener('click', () => {
                    toggleDropdown('deliverySelectHeader', 'deliverySelectOptions');
                });
            }
            
            if (tokenHeader) {
                tokenHeader.addEventListener('click', () => {
                    toggleDropdown('tokenSelectHeader', 'tokenSelectOptions');
                });
            }`;

content = content.replace(oldDropdownHandlers, newDropdownHandlers);

// Write the updated content
fs.writeFileSync('fcm_dashboard_updated.html', content, 'utf8');
console.log('✅ Updated form submission to handle all user types');
console.log('📝 Dashboard HTML is now complete!');

