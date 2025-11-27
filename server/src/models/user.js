import mongoose from "mongoose";

// Base User Schema

const userSchema = new mongoose.Schema({
    name: { type : String },
    role: {
        type: String,
        enum: ["Customer", "Admin", "DeliveryPartner", "Seller"],
        required: true,
    },
    isActivated: {type: Boolean, default: false}
})

// Customer Schema

const customerSchema = new mongoose.Schema({
    ...userSchema.obj,
    phone : { type: Number, required: true, unique: true },
    role: { type: String, enum: ["Customer"], default: "Customer" },
    liveLocation: {
      latitude: { type: Number },
      longitude: { type: Number },
    },
    address: { type: String },
})

// Delivery Partner Schema
const deliveryPartnerSchema = new mongoose.Schema({
    ...userSchema.obj,
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: Number, required: true },
    role: { type: String, enum: ["DeliveryPartner"], default: "DeliveryPartner" },
    liveLocation: {
      latitude: { type: Number },
      longitude: { type: Number },
    },
    address: { type: String },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
    },
  });

// Admin Schema

const adminSchema = new mongoose.Schema({
    ...userSchema.obj,
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["Admin"], default: "Admin" },
});

// Seller Schema
const sellerSchema = new mongoose.Schema({
    ...userSchema.obj,
    name: { type: String, required: true },
    phone: { type: Number, required: true, unique: true },
    email: { type: String },
    role: { type: String, enum: ["Seller"], default: "Seller" },
    storeName: { type: String },
    storeAddress: { type: String },
    businessHours: {
        monday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
        tuesday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
        wednesday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
        thursday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
        friday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
        saturday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
        sunday: { open: String, close: String, isOpen: { type: Boolean, default: true } }
    },
    deliveryAreas: [{ type: String }],
    bankAccounts: [{
        bankName: { type: String },
        accountNumber: { type: String },
        ifscCode: { type: String },
        accountHolderName: { type: String }
    }],
    fcmTokens: [{ type: String }],
    isVerified: { type: Boolean, default: false },
    profileCompleted: { type: Boolean, default: false },
    location: {
        latitude: { type: Number },
        longitude: { type: Number }
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

export const Customer = mongoose.model("Customer", customerSchema);
export const DeliveryPartner = mongoose.model(
  "DeliveryPartner",
  deliveryPartnerSchema
);
export const Admin = mongoose.model("Admin", adminSchema);
export const Seller = mongoose.model("Seller", sellerSchema);

  
