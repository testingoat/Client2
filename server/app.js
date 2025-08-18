// Load dotenv first if not in production
if (process.env.NODE_ENV !== 'production') {
    try {
        const dotenv = await import('dotenv');
        dotenv.config();
        console.log('✅ dotenv loaded for development');
    } catch (error) {
        console.log('ℹ️ dotenv not available, using environment variables directly');
    }
}

import { connectDB } from "./src/config/connect.js";
import fastify from 'fastify';
import { PORT } from "./src/config/config.js";
import fastifySocketIO from "fastify-socket.io";
import { registerRoutes } from "./src/routes/index.js";
import { admin, buildAdminRouter } from './src/config/setup.js';
import mongoose from 'mongoose';

const start = async()=>{
    // Debug environment variables
    console.log('🔍 DEBUGGING ENVIRONMENT VARIABLES:');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('PORT:', process.env.PORT);
    console.log('MONGO_URI exists:', !!process.env.MONGO_URI);
    console.log('MONGO_URI value:', process.env.MONGO_URI ? 'SET' : 'UNDEFINED');
    console.log('All env keys:', Object.keys(process.env).filter(key => key.includes('MONGO')));

    // Validate environment variables
    if (!process.env.MONGO_URI) {
        console.error('❌ MONGO_URI environment variable is required');
        console.error('🔧 Please set MONGO_URI in Render dashboard Environment Variables');
        console.error('📝 Value should be: mongodb+srv://testingoat24:Qwe_2897@cluster6.l5jkmi9.mongodb.net/Goatgoat?retryWrites=true&w=majority&appName=Cluster6');
        process.exit(1);
    }

    console.log('🔗 Connecting to MongoDB...');
    await connectDB(process.env.MONGO_URI);
    const app = fastify()

    app.register(fastifySocketIO,{
        cors:{
            origin:"*"
        },
        pingInterval:10000,
        pingTimeout:5000,
        transports:['websocket']
    })

    // Health check endpoint for cloud deployment
    app.get('/health', async (request, reply) => {
        try {
            // Check database connection
            const dbState = mongoose.connection.readyState;
            const dbStatus = dbState === 1 ? 'connected' : 'disconnected';

            return {
                status: 'healthy',
                timestamp: new Date().toISOString(),
                database: dbStatus,
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                version: process.env.npm_package_version || '1.0.0'
            };
        } catch (error) {
            reply.code(500);
            return {
                status: 'unhealthy',
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    });

    await registerRoutes(app)

    await buildAdminRouter(app);

    app.listen({port:PORT,host:'0.0.0.0'},(err,addr)=>{
        if(err){
            console.log(err);
        }else{
            console.log(`Grocery App running on http://localhost:${PORT}${admin.options.rootPath}`)
        }
    })

    app.ready().then(()=>{
        app.io.on('connection',(socket)=>{
            console.log("A User Connected ✅")

            socket.on("joinRoom",(orderId)=>{
                socket.join(orderId);
                console.log(` 🔴 User Joined room ${orderId}`)
            })

            socket.on('disconnect',()=>{
                console.log("User Disconnected ❌")
            })
        })
    })

}

start()