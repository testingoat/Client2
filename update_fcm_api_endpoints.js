// Script to update FCM API endpoints in app.ts to support Customers and DeliveryPartners
const fs = require('fs');

const appTsPath = 'staging_app.ts';
let content = fs.readFileSync(appTsPath, 'utf8');

// 1. UPDATE /admin/fcm-management/api/tokens endpoint
const oldTokensEndpoint = `    app.get("/admin/fcm-management/api/tokens", async (request, reply) => {
        try {
            const { Seller } = await import('./models/index.js');
            
            // Get all sellers with FCM tokens
            const sellers = await Seller.find({ 
                'fcmTokens.0': { $exists: true } 
            }).select('_id email fcmTokens createdAt').sort({ createdAt: -1 });
            
            const tokenData: any[] = [];
            sellers.forEach((seller: any) => {
                seller.fcmTokens.forEach((fcmToken: any) => {
                    tokenData.push({
                        sellerId: seller._id,
                        sellerEmail: seller.email,
                        token: fcmToken.token,
                        platform: fcmToken.platform || 'android',
                        deviceInfo: fcmToken.deviceInfo || {},
                        createdAt: fcmToken.createdAt,
                        updatedAt: fcmToken.updatedAt
                    });
                });
            });
            
            reply.type('application/json');
            return {
                success: true,
                count: tokenData.length,
                totalSellers: sellers.length,
                tokens: tokenData
            };
        } catch (error: any) {
            reply.status(500);
            return {
                success: false,
                error: error?.message || 'Failed to fetch FCM tokens',
                count: 0,
                tokens: []
            };
        }
    });`;

const newTokensEndpoint = `    app.get("/admin/fcm-management/api/tokens", async (request, reply) => {
        try {
            const { Customer, Seller, DeliveryPartner } = await import('./models/index.js');
            
            // Get all customers with FCM tokens
            const customers = await Customer.find({ 
                fcmToken: { $exists: true, $ne: null, $ne: '' } 
            }).select('_id phone fcmToken lastTokenUpdate createdAt').sort({ createdAt: -1 });
            
            // Get all sellers with FCM tokens
            const sellers = await Seller.find({ 
                'fcmTokens.0': { $exists: true } 
            }).select('_id email fcmTokens createdAt').sort({ createdAt: -1 });
            
            // Get all delivery partners with FCM tokens
            const deliveryPartners = await DeliveryPartner.find({ 
                fcmToken: { $exists: true, $ne: null, $ne: '' } 
            }).select('_id email fcmToken lastTokenUpdate createdAt').sort({ createdAt: -1 });
            
            const tokenData: any[] = [];
            
            // Add customer tokens
            customers.forEach((customer: any) => {
                tokenData.push({
                    userType: 'customer',
                    userId: customer._id,
                    userIdentifier: customer.phone,
                    token: customer.fcmToken,
                    platform: 'android',
                    createdAt: customer.lastTokenUpdate || customer.createdAt,
                    updatedAt: customer.lastTokenUpdate
                });
            });
            
            // Add seller tokens
            sellers.forEach((seller: any) => {
                seller.fcmTokens.forEach((fcmToken: any) => {
                    tokenData.push({
                        userType: 'seller',
                        userId: seller._id,
                        userIdentifier: seller.email,
                        sellerId: seller._id,
                        sellerEmail: seller.email,
                        token: fcmToken.token,
                        platform: fcmToken.platform || 'android',
                        deviceInfo: fcmToken.deviceInfo || {},
                        createdAt: fcmToken.createdAt,
                        updatedAt: fcmToken.updatedAt
                    });
                });
            });
            
            // Add delivery partner tokens
            deliveryPartners.forEach((partner: any) => {
                tokenData.push({
                    userType: 'delivery',
                    userId: partner._id,
                    userIdentifier: partner.email,
                    token: partner.fcmToken,
                    platform: 'android',
                    createdAt: partner.lastTokenUpdate || partner.createdAt,
                    updatedAt: partner.lastTokenUpdate
                });
            });
            
            reply.type('application/json');
            return {
                success: true,
                count: tokenData.length,
                totalCustomers: customers.length,
                totalSellers: sellers.length,
                totalDeliveryPartners: deliveryPartners.length,
                tokens: tokenData
            };
        } catch (error: any) {
            reply.status(500);
            return {
                success: false,
                error: error?.message || 'Failed to fetch FCM tokens',
                count: 0,
                tokens: []
            };
        }
    });`;

content = content.replace(oldTokensEndpoint, newTokensEndpoint);

// 2. UPDATE /admin/fcm-management/api/stats endpoint - find and replace the Seller import
const oldStatsImport = `            const { Seller } = await import('./models/index.js');`;
const newStatsImport = `            const { Customer, Seller, DeliveryPartner } = await import('./models/index.js');`;

content = content.replace(oldStatsImport, newStatsImport);

// Add customer and delivery partner stats queries
const oldStatsQueries = `            const [
                // Token statistics
                sellersWithTokens,
                totalTokenCount,
                androidTokens,
                iosTokens,`;

const newStatsQueries = `            const [
                // Token statistics
                customersWithTokens,
                sellersWithTokens,
                deliveryPartnersWithTokens,
                totalTokenCount,
                androidTokens,
                iosTokens,`;

content = content.replace(oldStatsQueries, newStatsQueries);

// Add the actual queries for customers and delivery partners
const oldTokenQueries = `            ] = await Promise.all([
                // Token queries
                Seller.countDocuments({ 'fcmTokens.0': { $exists: true } }),`;

const newTokenQueries = `            ] = await Promise.all([
                // Token queries
                Customer.countDocuments({ fcmToken: { $exists: true, $ne: null, $ne: '' } }),
                Seller.countDocuments({ 'fcmTokens.0': { $exists: true } }),
                DeliveryPartner.countDocuments({ fcmToken: { $exists: true, $ne: null, $ne: '' } }),`;

content = content.replace(oldTokenQueries, newTokenQueries);

// Update the stats response to include customer and delivery partner data
const oldStatsResponse = `                overview: {
                    totalTokens: totalTokenCount,
                    totalSellers: sellersWithTokens,`;

const newStatsResponse = `                overview: {
                    totalTokens: totalTokenCount,
                    totalCustomers: customersWithTokens,
                    totalSellers: sellersWithTokens,
                    totalDeliveryPartners: deliveryPartnersWithTokens,`;

content = content.replace(oldStatsResponse, newStatsResponse);

// Write the updated content
fs.writeFileSync(appTsPath, content, 'utf8');
console.log('✅ Updated app.ts with Customer and DeliveryPartner support');

