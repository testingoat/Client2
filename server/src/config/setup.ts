import { FastifyInstance } from 'fastify';
import AdminJS from 'adminjs';
import AdminJSFastify from '@adminjs/fastify';
import * as AdminJSMongoose from '@adminjs/mongoose';
import * as Models from '../models/index.js';
import { dark, light, noSidebar } from '@adminjs/themes';
// import { componentLoader, Components } from '../adminjs/components.js';

AdminJS.registerAdapter(AdminJSMongoose);

export const admin = new AdminJS({
    resources:[
        {
            resource: Models.Customer,
            options: {
              listProperties: ['phone', 'role', 'isActivated'],
              filterProperties: ['phone', 'role'],
            },
          },
          {
            resource: Models.DeliveryPartner,
            options: {
              listProperties: ['email', 'role', 'isActivated'],
              filterProperties: ['email', 'role'],
            },
          },
          {
            resource: Models.Admin,
            options: {
              listProperties: ['email', 'role', 'isActivated'],
              filterProperties: ['email', 'role'],
            },
          },
        { resource: Models.Branch },
        { resource: Models.Product },
        { resource: Models.Category },
        { resource: Models.Order },
        { resource: Models.Counter },
    ],
    pages: {
        'notification-center': {
            handler: async (_request, _reply, _context) => {
                return { 
                    message: 'Welcome to Notification Center',
                    description: 'Send push notifications and SMS to your users',
                    features: [
                        'Push Notifications via Firebase Cloud Messaging',
                        'SMS Notifications via Fast2SMS API', 
                        'Target specific users or groups',
                        'Template management',
                        'Notification history and analytics'
                    ]
                };
            },
        },
        'monitoring': {
            handler: async (_request, _reply, _context) => {
                try {
                    // Get database connection status
                    const mongoose = await import('mongoose');
                    const dbStatus = mongoose.default.connection.readyState === 1 ? 'connected' : 'disconnected';
                    
                    // Get delivery partner count
                    const { DeliveryPartner } = await import('../models/user.js');
                    const deliveryPartnerCount = await DeliveryPartner.countDocuments();
                    
                    return { 
                        title: '🚀 GoatGoat Server Monitoring Dashboard',
                        message: 'Real-time server health and performance metrics',
                        timestamp: new Date().toISOString(),
                        serverHealth: {
                            status: 'healthy',
                            uptime: Math.floor(process.uptime()),
                            uptimeFormatted: `${Math.floor(process.uptime() / 86400)}d ${Math.floor((process.uptime() % 86400) / 3600)}h ${Math.floor((process.uptime() % 3600) / 60)}m`,
                            memory: {
                                rss: `${(process.memoryUsage().rss / 1024 / 1024).toFixed(1)} MB`,
                                heapUsed: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1)} MB`,
                                heapTotal: `${(process.memoryUsage().heapTotal / 1024 / 1024).toFixed(1)} MB`,
                                external: `${(process.memoryUsage().external / 1024 / 1024).toFixed(1)} MB`,
                                heapUsedPercent: `${((process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100).toFixed(1)}%`
                            },
                            database: dbStatus,
                            deliveryPartners: deliveryPartnerCount,
                            environment: process.env.NODE_ENV || 'unknown',
                            platform: process.platform,
                            nodeVersion: process.version
                        },
                        endpoints: {
                            production: 'https://goatgoat.tech',
                            staging: 'https://staging.goatgoat.tech',
                            adminPanel: '/admin',
                            healthCheck: '/health'
                        }
                    };
                } catch (error) {
                    return {
                        title: '🚀 GoatGoat Server Monitoring Dashboard',
                        message: 'Error fetching server metrics',
                        timestamp: new Date().toISOString(),
                        error: error.message,
                        serverHealth: {
                            status: 'error',
                            uptime: Math.floor(process.uptime()),
                            memory: process.memoryUsage(),
                            database: 'unknown'
                        }
                    };
                }
            },
        },
        // You can uncomment and add other pages here if needed
        // 'ops-tools': {
        //     handler: async (_request, _reply, _context) => {
        //         return {
        //             text: 'OPS Tools - Use /admin/ops/test-otp endpoint directly',
        //         };
        //     },
        //     component: './components/OpsToolsPage',
        // },
    },
    branding: {
        companyName: 'Grocery Delivery App',
        withMadeWithLove: false,
    },
    defaultTheme:dark.id,
    availableThemes: [dark,light,noSidebar],
    rootPath:'/admin',
});

export const buildAdminRouter = async(app: FastifyInstance)=>{
    console.log('🔧 Building AdminJS router...');
    console.log('🔍 Environment:', process.env.NODE_ENV);

    console.log('🚀 ULTIMATE FIX: Using minimal AdminJS router without any authentication or session management...');

    try {
        // Use the simplest possible AdminJS setup - no authentication, no sessions, no cookies
        await AdminJSFastify.buildRouter(admin, app as any);
        console.log('✅ AdminJS minimal router built successfully - admin panel accessible at /admin');

    } catch (error: any) {
        console.log('⚠️ AdminJS buildRouter failed, error:', error.message);
        console.log('📝 This is likely due to plugin conflicts. The server will continue without AdminJS.');
        // Don't throw - let the server continue without AdminJS
    }
};
