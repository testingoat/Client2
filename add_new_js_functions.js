// Script to add new JavaScript functions for customers and delivery partners
const fs = require('fs');

const htmlPath = 'fcm_dashboard_updated.html';
let content = fs.readFileSync(htmlPath, 'utf8');

// Find where to insert new functions - after loadAndPopulateSellerOptions
const insertPoint = `        // Load and populate token options
        async function loadAndPopulateTokenOptions() {`;

const newFunctions = `        // Load and populate customer options
        async function loadAndPopulateCustomerOptions() {
            const customerLoader = document.getElementById('customerLoader');
            const optionsContainer = document.getElementById('customerSelectOptions');
            
            try {
                customerLoader.style.display = 'inline-block';
                
                if (!sellersData) {
                    sellersData = await fetchSellersData();
                }
                
                if (sellersData && sellersData.tokens) {
                    const customers = sellersData.tokens.filter(t => t.userType === 'customer');
                    optionsContainer.innerHTML = '';
                    
                    if (customers.length > 0) {
                        customers.forEach(customer => {
                            const option = document.createElement('div');
                            option.className = 'multi-select-option';
                            option.innerHTML = \`
                                <span class="badge badge-customer">Customer</span>
                                <span>\${customer.userIdentifier}</span>
                            \`;
                            option.addEventListener('click', () => toggleCustomerSelection(customer, option));
                            optionsContainer.appendChild(option);
                        });
                        console.log(\`✅ Populated \${customers.length} customer options\`);
                    } else {
                        optionsContainer.innerHTML = '<div style="padding: 12px; color: #999;">No customers found</div>';
                    }
                } else {
                    optionsContainer.innerHTML = '<div style="padding: 12px; color: #999;">No customers found</div>';
                }
            } catch (error) {
                console.error('❌ Error loading customer options:', error);
                optionsContainer.innerHTML = '<div style="padding: 12px; color: #f44336;">Error loading customers</div>';
            } finally {
                customerLoader.style.display = 'none';
            }
        }
        
        // Load and populate delivery partner options
        async function loadAndPopulateDeliveryOptions() {
            const deliveryLoader = document.getElementById('deliveryLoader');
            const optionsContainer = document.getElementById('deliverySelectOptions');
            
            try {
                deliveryLoader.style.display = 'inline-block';
                
                if (!sellersData) {
                    sellersData = await fetchSellersData();
                }
                
                if (sellersData && sellersData.tokens) {
                    const deliveryPartners = sellersData.tokens.filter(t => t.userType === 'delivery');
                    optionsContainer.innerHTML = '';
                    
                    if (deliveryPartners.length > 0) {
                        deliveryPartners.forEach(partner => {
                            const option = document.createElement('div');
                            option.className = 'multi-select-option';
                            option.innerHTML = \`
                                <span class="badge badge-delivery">Delivery</span>
                                <span>\${partner.userIdentifier}</span>
                            \`;
                            option.addEventListener('click', () => toggleDeliverySelection(partner, option));
                            optionsContainer.appendChild(option);
                        });
                        console.log(\`✅ Populated \${deliveryPartners.length} delivery partner options\`);
                    } else {
                        optionsContainer.innerHTML = '<div style="padding: 12px; color: #999;">No delivery partners found</div>';
                    }
                } else {
                    optionsContainer.innerHTML = '<div style="padding: 12px; color: #999;">No delivery partners found</div>';
                }
            } catch (error) {
                console.error('❌ Error loading delivery partner options:', error);
                optionsContainer.innerHTML = '<div style="padding: 12px; color: #f44336;">Error loading delivery partners</div>';
            } finally {
                deliveryLoader.style.display = 'none';
            }
        }
        
        // Load and populate token options`;

content = content.replace(insertPoint, newFunctions + '\n        ' + insertPoint);

// Add selection state variables
const oldVars = `        let sellersData = null;
        let selectedSellers = [];
        let selectedTokens = [];`;

const newVars = `        let sellersData = null;
        let selectedCustomers = [];
        let selectedSellers = [];
        let selectedDelivery = [];
        let selectedTokens = [];`;

content = content.replace(oldVars, newVars);

// Add toggle functions for customers and delivery
const insertPoint2 = `        // Toggle token selection
        function toggleTokenSelection(token, optionElement) {`;

const newToggleFunctions = `        // Toggle customer selection
        function toggleCustomerSelection(customer, optionElement) {
            const index = selectedCustomers.findIndex(c => c.userId === customer.userId);
            if (index > -1) {
                selectedCustomers.splice(index, 1);
                optionElement.classList.remove('selected');
            } else {
                selectedCustomers.push(customer);
                optionElement.classList.add('selected');
            }
            updateSelectedCustomersDisplay();
        }
        
        // Toggle delivery partner selection
        function toggleDeliverySelection(partner, optionElement) {
            const index = selectedDelivery.findIndex(d => d.userId === partner.userId);
            if (index > -1) {
                selectedDelivery.splice(index, 1);
                optionElement.classList.remove('selected');
            } else {
                selectedDelivery.push(partner);
                optionElement.classList.add('selected');
            }
            updateSelectedDeliveryDisplay();
        }
        
        // Toggle token selection`;

content = content.replace(insertPoint2, newToggleFunctions + '\n        ' + insertPoint2);

// Add display update functions
const insertPoint3 = `        // Update selected tokens display
        function updateSelectedTokensDisplay() {`;

const newDisplayFunctions = `        // Update selected customers display
        function updateSelectedCustomersDisplay() {
            const container = document.getElementById('selectedCustomers');
            container.innerHTML = '';
            
            selectedCustomers.forEach(customer => {
                const item = document.createElement('div');
                item.className = 'selected-item';
                item.innerHTML = \`
                    <span class="badge badge-customer">Customer</span>
                    <span>\${customer.userIdentifier}</span>
                    <span class="remove" onclick="removeSelectedCustomer('\${customer.userId}')" title="Remove">×</span>
                \`;
                container.appendChild(item);
            });
        }
        
        // Update selected delivery partners display
        function updateSelectedDeliveryDisplay() {
            const container = document.getElementById('selectedDelivery');
            container.innerHTML = '';
            
            selectedDelivery.forEach(partner => {
                const item = document.createElement('div');
                item.className = 'selected-item';
                item.innerHTML = \`
                    <span class="badge badge-delivery">Delivery</span>
                    <span>\${partner.userIdentifier}</span>
                    <span class="remove" onclick="removeSelectedDelivery('\${partner.userId}')" title="Remove">×</span>
                \`;
                container.appendChild(item);
            });
        }
        
        // Update selected tokens display`;

content = content.replace(insertPoint3, newDisplayFunctions + '\n        ' + insertPoint3);

// Add remove functions
const insertPoint4 = `        // Remove selected token
        function removeSelectedToken(tokenValue) {`;

const newRemoveFunctions = `        // Remove selected customer
        function removeSelectedCustomer(userId) {
            selectedCustomers = selectedCustomers.filter(c => c.userId !== userId);
            updateSelectedCustomersDisplay();
        }
        
        // Remove selected delivery partner
        function removeSelectedDelivery(userId) {
            selectedDelivery = selectedDelivery.filter(d => d.userId !== userId);
            updateSelectedDeliveryDisplay();
        }
        
        // Remove selected token`;

content = content.replace(insertPoint4, newRemoveFunctions + '\n        ' + insertPoint4);

// Update clearSelections function
const oldClearSelections = `        function clearSelections() {
            selectedSellers = [];
            selectedTokens = [];
            updateSelectedSellersDisplay();
            updateSelectedTokensDisplay();
        }`;

const newClearSelections = `        function clearSelections() {
            selectedCustomers = [];
            selectedSellers = [];
            selectedDelivery = [];
            selectedTokens = [];
            updateSelectedCustomersDisplay();
            updateSelectedSellersDisplay();
            updateSelectedDeliveryDisplay();
            updateSelectedTokensDisplay();
        }`;

content = content.replace(oldClearSelections, newClearSelections);

// Write the updated content
fs.writeFileSync('fcm_dashboard_updated.html', content, 'utf8');
console.log('✅ Added new JavaScript functions for customers and delivery partners');

