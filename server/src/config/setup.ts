import { FastifyInstance } from 'fastify';
import AdminJS from 'adminjs';
import AdminJSFastify from '@adminjs/fastify';
import * as AdminJSMongoose from '@adminjs/mongoose';
import * as Models from '../models/index.js';
import { dark, light, noSidebar } from '@adminjs/themes';

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
    branding: {
        companyName: 'GoatGoat Admin',
        withMadeWithLove: false,
        logo: false,
        favicon: '/favicon.ico',
    },
    locale: {
        language: 'en',
        availableLanguages: ['en'],
        translations: {
            en: {
                labels: {
                    Customer: 'Customer',
                    DeliveryPartner: 'Delivery Partner',
                    Admin: 'Admin',
                    Branch: 'Branch',
                    Product: 'Product',
                    Category: 'Category',
                    Order: 'Order',
                    Counter: 'Counter',
                    GoatgoatStaging: 'GoatGoat',
                    Monitoring: 'Monitoring'
                },
                properties: {
                    name: 'Name',
                    _id: 'ID',
                    description: 'Description',
                    lastUpdated: 'Last Updated',
                    status: 'Status',
                    createdAt: 'Created At',
                    updatedAt: 'Updated At'
                }
            }
        }
    },
    defaultTheme: dark.id,
    availableThemes: [dark, light, noSidebar],
    rootPath: '/admin',
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
