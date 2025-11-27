const fs = require('fs');

const appJsPath = '/var/www/goatgoat-staging/server/dist/app.js';

// Read the file
let content = fs.readFileSync(appJsPath, 'utf8');

// Find the line after the /stats endpoint
const searchString = 'app.get("/admin/fcm-management/api/stats"';
const insertPosition = content.indexOf(searchString);

if (insertPosition === -1) {
    console.error('❌ Could not find insertion point');
    process.exit(1);
}

// Find the end of the stats endpoint (look for the closing });)
let endPosition = insertPosition;
let braceCount = 0;
let foundStart = false;

for (let i = insertPosition; i < content.length; i++) {
    if (content[i] === '{') {
        braceCount++;
        foundStart = true;
    } else if (content[i] === '}') {
        braceCount--;
        if (foundStart && braceCount === 0) {
            // Found the end of the stats endpoint
            // Move to after the });
            endPosition = i + 3; // Skip }); and newline
            break;
        }
    }
}

// The code to insert AFTER the stats endpoint
const deleteEndpointCode = `
    // 🔔 FCM API Endpoints - DELETE /tokens/:id
    app.delete("/admin/fcm-management/api/tokens/:tokenId", async (request, reply) => {
        try {
            const { tokenId } = request.params;
            const { Seller, Customer, DeliveryPartner } = await import('./models/index.js');
            
            console.log('🗑️ Deleting FCM token:', tokenId);
            
            // Try to find and delete from Seller
            let deleted = await Seller.findOneAndUpdate(
                { 'fcmTokens._id': tokenId },
                { $pull: { fcmTokens: { _id: tokenId } } },
                { new: true }
            );
            
            // If not found in Seller, try Customer
            if (!deleted) {
                deleted = await Customer.findOneAndUpdate(
                    { 'fcmTokens._id': tokenId },
                    { $pull: { fcmTokens: { _id: tokenId } } },
                    { new: true }
                );
            }
            
            // If not found in Customer, try DeliveryPartner
            if (!deleted) {
                deleted = await DeliveryPartner.findOneAndUpdate(
                    { 'fcmTokens._id': tokenId },
                    { $pull: { fcmTokens: { _id: tokenId } } },
                    { new: true }
                );
            }
            
            if (deleted) {
                console.log('✅ FCM token deleted successfully');
                reply.send({
                    success: true,
                    message: 'Token deleted successfully'
                });
            } else {
                console.log('❌ FCM token not found');
                reply.status(404).send({
                    success: false,
                    error: 'Token not found'
                });
            }
        } catch (error) {
            console.error('❌ Error deleting FCM token:', error);
            reply.status(500).send({
                success: false,
                error: error.message
            });
        }
    });
    console.log('✅ FCM DELETE endpoint registered');
`;

// Insert the delete endpoint code
const newContent = content.slice(0, endPosition) + deleteEndpointCode + content.slice(endPosition);

// Write the file
fs.writeFileSync(appJsPath, newContent, 'utf8');

console.log('✅ DELETE endpoint added successfully');

