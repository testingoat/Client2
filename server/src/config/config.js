import fastifySession from "@fastify/session";
import ConnectMongoDBSession from "connect-mongodb-session";
import { Admin } from "../models/index.js";

export const PORT = process.env.PORT || 3000;
export const COOKIE_PASSWORD = process.env.COOKIE_PASSWORD;

const MongoDBStore = ConnectMongoDBSession(fastifySession)

// Debug MongoDB URI
console.log('🔍 CONFIG.JS - MONGO_URI exists:', !!process.env.MONGO_URI);
console.log('🔍 CONFIG.JS - MONGO_URI length:', process.env.MONGO_URI?.length);
console.log('🔍 CONFIG.JS - MONGO_URI starts with:', process.env.MONGO_URI?.substring(0, 20));

// Clean and validate MONGO_URI
let mongoUri = process.env.MONGO_URI;
if (mongoUri) {
    // Remove any potential whitespace or newlines
    mongoUri = mongoUri.trim();
    console.log('🔍 CONFIG.JS - Cleaned MONGO_URI starts with:', mongoUri.substring(0, 20));
}

// Create session store only if MONGO_URI is available
let sessionStore;
if (mongoUri && (mongoUri.startsWith('mongodb://') || mongoUri.startsWith('mongodb+srv://'))) {
    try {
        sessionStore = new MongoDBStore({
            uri: mongoUri,
            collection: "sessions"
        });
        console.log('✅ SessionStore created successfully');
    } catch (error) {
        console.error('❌ Error creating SessionStore:', error.message);
        sessionStore = null;
    }
} else {
    console.error('❌ Invalid or missing MONGO_URI in config.js');
    console.error('📝 MONGO_URI should start with mongodb:// or mongodb+srv://');
    sessionStore = null;
}

export { sessionStore };

sessionStore.on('error',(error)=>{
    console.log("Session store error",error)
})

export const authenticate =async(email,password)=>{

     // UNCOMMENT THIS WHEN CREATING ADMIN  FIRST TIME

    // if(email && password){
    //     if(email=='ritik@gmail.com' && password==="12345678"){
    //         return Promise.resolve({ email: email, password: password }); 
    //     }else{
    //         return null
    //     }
    // }


    // UNCOMMENT THIS WHEN ALREADY CREATED ADMIN ON DATABASE

    if(email && password){
        const user = await Admin.findOne({email});
        if(!user){
            return null
        }
        if(user.password===password){
            return Promise.resolve({ email: email, password: password }); 
        }else{
            return null
        }
    }
    

    return null
}
