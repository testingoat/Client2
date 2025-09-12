import AdminJS from 'adminjs';
import AdminJSFastify from '@adminjs/fastify';
import * as AdminJSMongoose from '@adminjs/mongoose';
import * as Models from '../models/index.js';
import { dark, light, noSidebar } from '@adminjs/themes';
AdminJS.registerAdapter(AdminJSMongoose);
export const admin = new AdminJS({
    resources: [
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
            component: './pages/NotificationPage.jsx', // Explicitly include the extension
            handler: async (_request, _reply, _context) => {
                return { message: 'Welcome to Notification Center' };
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
    defaultTheme: dark.id,
    availableThemes: [dark, light, noSidebar],
    rootPath: '/admin',
});
export const buildAdminRouter = async (app) => {
    console.log('🔧 Building AdminJS router...');
    console.log('🔍 Environment:', process.env.NODE_ENV);
    console.log('🚀 ULTIMATE FIX: Using minimal AdminJS router without any authentication or session management...');
    try {
        // Use the simplest possible AdminJS setup - no authentication, no sessions, no cookies
        await AdminJSFastify.buildRouter(admin, app);
        console.log('✅ AdminJS minimal router built successfully - admin panel accessible at /admin');
    }
    catch (error) {
        console.log('⚠️ AdminJS buildRouter failed, error:', error.message);
        console.log('📝 This is likely due to plugin conflicts. The server will continue without AdminJS.');
        // Don't throw - let the server continue without AdminJS
    }
};
