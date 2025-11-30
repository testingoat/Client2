import {
    loginSeller,
    verifySellerOTP,
    resendSellerOTP,
    registerSeller,
    refreshSellerToken,
    logoutSeller
} from '../controllers/auth/sellerAuth.js';
import { verifyToken } from '../middleware/auth.js';

export const sellerRoutes = async (fastify, options) => {
    console.log('Registering seller routes');
    
    // Authentication routes (no auth required)
    console.log('Registering /seller/login');
    fastify.post('/seller/login', loginSeller);
    
    console.log('Registering /seller/verify-otp');
    fastify.post('/seller/verify-otp', verifySellerOTP);
    
    console.log('Registering /seller/resend-otp');
    fastify.post('/seller/resend-otp', resendSellerOTP);
    
    console.log('Registering /seller/refresh-token');
    fastify.post('/seller/refresh-token', refreshSellerToken);

    // Protected routes (auth required)
    console.log('Registering /seller/register');
    fastify.post('/seller/register', { preHandler: [verifyToken] }, registerSeller);
    
    console.log('Registering /seller/logout');
    fastify.post('/seller/logout', { preHandler: [verifyToken] }, logoutSeller);
    
    // Profile routes (for future use)
    console.log('Registering /seller/profile');
    fastify.get('/seller/profile', { preHandler: [verifyToken] }, async (req, reply) => {
        try {
            const { userId, role } = req.user;
            
            if (role !== 'Seller') {
                return reply.status(403).send({
                    success: false,
                    message: 'Access denied. Seller role required.'
                });
            }

            const { Seller } = await import('../models/user.js');
            const seller = await Seller.findById(userId);
            
            if (!seller) {
                return reply.status(404).send({
                    success: false,
                    message: 'Seller not found'
                });
            }

            return reply.send({
                success: true,
                message: 'Seller profile retrieved successfully',
                user: {
                    id: seller._id,
                    name: seller.name,
                    phone: seller.phone,
                    email: seller.email,
                    role: seller.role,
                    storeName: seller.storeName,
                    storeAddress: seller.storeAddress,
                    businessHours: seller.businessHours,
                    deliveryAreas: seller.deliveryAreas,
                    isVerified: seller.isVerified,
                    profileCompleted: seller.profileCompleted,
                    createdAt: seller.createdAt,
                    updatedAt: seller.updatedAt
                }
            });
            
        } catch (error) {
            console.error('Get Seller Profile Error:', error);
            return reply.status(500).send({
                success: false,
                message: 'Failed to retrieve seller profile'
            });
        }
    });
    
    console.log('Seller routes registered successfully');
};