import 'dotenv/config';
console.log(process.env);
import { connectDB } from './config/connect.js';
import fastify from 'fastify';
import { PORT } from './config/config.js';
import websocket from '@fastify/websocket';
import { registerRoutes } from './routes/index.js';
import { Server as SocketIOServer } from 'socket.io';
import { admin, buildAdminRouter } from './config/setup.js';
import mongoose from 'mongoose';
const start = async () => {
    console.log('DEBUG: process.env.NODE_ENV in app.ts:', process.env.NODE_ENV);
    // Initialize Firebase Admin SDK (optional - won't crash if missing)
    const firebaseServiceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './firebase-service-account.json';
    try {
        console.log('🔍 Attempting to initialize Firebase Admin SDK...');
        console.log('🔍 Looking for Firebase service account at:', firebaseServiceAccountPath);
        // Check if file exists
        const fs = await import('fs');
        const path = await import('path');
        let serviceAccount;
        let serviceAccountSource = 'unknown';
        // Method 1: Try to read from file path
        const absolutePath = path.resolve(firebaseServiceAccountPath);
        if (fs.existsSync(absolutePath)) {
            console.log('📄 Reading Firebase service account from file:', absolutePath);
            const fileContent = fs.readFileSync(absolutePath, 'utf8');
            serviceAccount = JSON.parse(fileContent);
            serviceAccountSource = 'file';
        }
        // Method 2: Try environment variable with JSON string (not base64)
        else if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
            console.log('📄 Reading Firebase service account from environment variable');
            serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
            serviceAccountSource = 'env_json';
        }
        // Method 3: Try base64 environment variable (fallback)
        else if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON) {
            console.log('📄 Reading Firebase service account from base64 environment variable');
            const buffer = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON, 'base64');
            const jsonString = buffer.toString('utf8');
            serviceAccount = JSON.parse(jsonString);
            serviceAccountSource = 'env_base64';
        }
        else {
            throw new Error('No Firebase service account found. Tried file path, JSON env var, and base64 env var.');
        }
        console.log('✅ Firebase service account loaded from:', serviceAccountSource);
        console.log('📋 Project ID:', serviceAccount.project_id);
        console.log('📧 Client Email:', serviceAccount.client_email);
        // Dynamically import firebase-admin
        let adminModule;
        try {
            adminModule = await import('firebase-admin');
        }
        catch (importError) {
            console.error('❌ Failed to import firebase-admin. Is it installed?', importError);
            throw importError;
        }
        // Initialize Firebase Admin SDK
        adminModule.default.initializeApp({
            credential: adminModule.default.credential.cert(serviceAccount),
        });
        console.log('✅ Firebase Admin SDK initialized successfully.');
    }
    catch (error) {
        console.error('⚠️ Failed to initialize Firebase Admin SDK (continuing without it):', error);
        console.error('Error type:', error?.constructor?.name || 'Unknown');
        console.error('Error message:', error?.message || 'No message');
        console.log('💡 Tip: Place firebase-service-account.json in server directory or set FIREBASE_SERVICE_ACCOUNT_JSON env var');
    }
    // Connect to MongoDB
    console.log('🔗 Connecting to MongoDB...');
    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI environment variable is required');
    }
    await connectDB(process.env.MONGO_URI);
    const app = fastify();
    // Register WebSocket support
    await app.register(websocket);
    // Health check endpoint for cloud deployment
    app.get('/health', async (_request, _reply) => {
        try {
            // Check database connection
            const dbState = mongoose.connection.readyState;
            const dbStatus = dbState === 1 ? 'connected' : 'disconnected';
            // Test delivery partner count
            const { DeliveryPartner } = await import('./models/user.js');
            const deliveryPartnerCount = await DeliveryPartner.countDocuments();
            console.log(`Found ${deliveryPartnerCount} delivery partners in database`);
            return {
                status: 'healthy',
                timestamp: new Date().toISOString(),
                database: dbStatus,
                deliveryPartners: deliveryPartnerCount,
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                version: process.env.npm_package_version || '1.0.0',
            };
        }
        catch (error) {
            _reply.code(500);
            return {
                status: 'unhealthy',
                error: error.message,
                timestamp: new Date().toISOString(),
            };
        }
    });
    try {
        await registerRoutes(app);
        console.log('Routes registered successfully');
    }
    catch (error) {
        console.error('Error registering routes:', error);
        process.exit(1);
    }
    // Add admin debug route
    app.get('/admin/debug', async (_request, _reply) => {
        try {
            const { Admin } = await import('./models/index.js');
            const admins = await Admin.find({});
            return {
                status: 'success',
                totalAdmins: admins.length,
                admins: admins.map((adminUser) => ({
                    id: adminUser._id,
                    email: adminUser.email,
                    name: adminUser.name,
                    role: adminUser.role,
                    isActivated: adminUser.isActivated,
                    passwordLength: adminUser.password?.length,
                })),
            };
        }
        catch (error) {
            return {
                status: 'error',
                error: error.message,
            };
        }
    });
    // Add authentication test route
    app.post('/admin/test-auth', async (_request, _reply) => {
        try {
            const { email, password } = _request.body;
            console.log('Test auth attempt with email:', email);
            const { authenticate } = await import('./config/config.js');
            const result = await authenticate(email, password);
            return {
                status: 'success',
                authenticated: !!result,
                result: result,
            };
        }
        catch (error) {
            return {
                status: 'error',
                error: error.message,
            };
        }
    });
    // Add route test endpoint
    app.get('/admin/test-routes', async (_request, _reply) => {
        try {
            // List all registered routes
            const routes = app.printRoutes({ commonPrefix: false });
            console.log('Registered routes:', routes);
            return {
                status: 'success',
                routes: routes,
            };
        }
        catch (error) {
            return {
                status: 'error',
                error: error.message,
            };
        }
    });
    // Add session test route
    app.get('/admin/test-session', async (_request, _reply) => {
        try {
            return {
                status: 'success',
                session: _request.session,
                headers: _request.headers,
            };
        }
        catch (error) {
            return {
                status: 'error',
                error: error.message,
            };
        }
    });
    console.log('DEBUG: COOKIE_PASSWORD in app.ts before buildAdminRouter:', process.env.COOKIE_PASSWORD);
    // Log registered routes before starting
    console.log('Routes before starting server:');
    try {
        const routes = app.printRoutes({ commonPrefix: false });
        console.log('Registered routes:', routes);
    }
    catch (error) {
        console.log('Error getting routes:', error);
    }
    // Create Socket.IO server using Fastify's HTTP server BEFORE starting
    const io = new SocketIOServer(app.server, {
        cors: {
            origin: '*',
        },
        pingInterval: 10000,
        pingTimeout: 5000,
        transports: ['websocket', 'polling'],
    });
    // Attach Socket.IO to the app instance for access in routes BEFORE starting
    app.decorate('io', io);
    // Build AdminJS router AFTER registering socket but BEFORE starting the server
    await buildAdminRouter(app);
    // Start the Fastify server and get the server instance
    try {
        await app.listen({ port: Number(PORT), host: '0.0.0.0' });
        console.log(`Grocery App running on http://localhost:${PORT}${admin.options.rootPath}`);
    }
    catch (error) {
        console.error('Error starting server:', error);
        process.exit(1);
    }
    // Setup Socket.IO connection handling
    io.on('connection', (socket) => {
        console.log('A User Connected ✅');
        socket.on('joinRoom', (orderId) => {
            socket.join(orderId);
            console.log(` 🔴 User Joined room ${orderId}`);
        });
        socket.on('disconnect', () => {
            console.log('User Disconnected ❌');
        });
    });
};
start();
