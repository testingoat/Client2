const fs = require('fs');

const appJsPath = '/var/www/goatgoat-staging/server/dist/app.js';

// Read the file
let content = fs.readFileSync(appJsPath, 'utf8');

// Find the line with "FCM Dashboard route registered"
const searchString = 'console.log(\'✅ FCM Dashboard route registered at /fcm-dashboard (bypasses AdminJS CSP)\');';
const insertPosition = content.indexOf(searchString);

if (insertPosition === -1) {
    console.error('❌ Could not find insertion point');
    process.exit(1);
}

// The code to insert BEFORE the FCM dashboard route
const assetsRouteCode = `    // 🔔 Static Assets Route - Serve Bootstrap files locally to bypass CSP
    app.get("/assets/*", async (request, reply) => {
        try {
            const fs = await import('fs');
            const path = await import('path');
            const requestedPath = request.url.replace('/assets/', '');
            const filePath = path.join('/var/www/goatgoat-staging/server/src/public/assets', requestedPath);
            const fileContent = await fs.promises.readFile(filePath);
            if (requestedPath.endsWith('.css')) {
                reply.type('text/css');
            }
            else if (requestedPath.endsWith('.js')) {
                reply.type('application/javascript');
            }
            else if (requestedPath.endsWith('.woff') || requestedPath.endsWith('.woff2')) {
                reply.type('font/woff2');
            }
            return fileContent;
        }
        catch (error) {
            reply.status(404).send('Asset not found');
        }
    });
    console.log('✅ Static assets route registered at /assets/*');
    `;

// Find the start of the FCM dashboard route (go back to find "app.get")
let fcmRouteStart = content.lastIndexOf('app.get("/fcm-dashboard"', insertPosition);

// Insert the assets route code before the FCM dashboard route
const newContent = content.slice(0, fcmRouteStart) + assetsRouteCode + content.slice(fcmRouteStart);

// Write the file
fs.writeFileSync(appJsPath, newContent, 'utf8');

console.log('✅ Assets route added successfully');

