export default Order;
declare const Order: mongoose.Model<{
    branch: mongoose.Types.ObjectId;
    customer: mongoose.Types.ObjectId;
    items: mongoose.Types.DocumentArray<{
        id: mongoose.Types.ObjectId;
        item: mongoose.Types.ObjectId;
        count: number;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        id: mongoose.Types.ObjectId;
        item: mongoose.Types.ObjectId;
        count: number;
    }> & {
        id: mongoose.Types.ObjectId;
        item: mongoose.Types.ObjectId;
        count: number;
    }>;
    status: "available" | "confirmed" | "arriving" | "delivered" | "cancelled";
    totalPrice: number;
    createdAt: NativeDate;
    updatedAt: NativeDate;
    orderId?: string | null | undefined;
    deliveryPartner?: mongoose.Types.ObjectId | null | undefined;
    deliveryLocation?: {
        latitude: number;
        longitude: number;
        address?: string | null | undefined;
    } | null | undefined;
    pickupLocation?: {
        latitude: number;
        longitude: number;
        address?: string | null | undefined;
    } | null | undefined;
    deliveryPersonLocation?: {
        latitude?: number | null | undefined;
        longitude?: number | null | undefined;
        address?: string | null | undefined;
    } | null | undefined;
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    branch: mongoose.Types.ObjectId;
    customer: mongoose.Types.ObjectId;
    items: mongoose.Types.DocumentArray<{
        id: mongoose.Types.ObjectId;
        item: mongoose.Types.ObjectId;
        count: number;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        id: mongoose.Types.ObjectId;
        item: mongoose.Types.ObjectId;
        count: number;
    }> & {
        id: mongoose.Types.ObjectId;
        item: mongoose.Types.ObjectId;
        count: number;
    }>;
    status: "available" | "confirmed" | "arriving" | "delivered" | "cancelled";
    totalPrice: number;
    createdAt: NativeDate;
    updatedAt: NativeDate;
    orderId?: string | null | undefined;
    deliveryPartner?: mongoose.Types.ObjectId | null | undefined;
    deliveryLocation?: {
        latitude: number;
        longitude: number;
        address?: string | null | undefined;
    } | null | undefined;
    pickupLocation?: {
        latitude: number;
        longitude: number;
        address?: string | null | undefined;
    } | null | undefined;
    deliveryPersonLocation?: {
        latitude?: number | null | undefined;
        longitude?: number | null | undefined;
        address?: string | null | undefined;
    } | null | undefined;
}, {}, mongoose.DefaultSchemaOptions> & {
    branch: mongoose.Types.ObjectId;
    customer: mongoose.Types.ObjectId;
    items: mongoose.Types.DocumentArray<{
        id: mongoose.Types.ObjectId;
        item: mongoose.Types.ObjectId;
        count: number;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        id: mongoose.Types.ObjectId;
        item: mongoose.Types.ObjectId;
        count: number;
    }> & {
        id: mongoose.Types.ObjectId;
        item: mongoose.Types.ObjectId;
        count: number;
    }>;
    status: "available" | "confirmed" | "arriving" | "delivered" | "cancelled";
    totalPrice: number;
    createdAt: NativeDate;
    updatedAt: NativeDate;
    orderId?: string | null | undefined;
    deliveryPartner?: mongoose.Types.ObjectId | null | undefined;
    deliveryLocation?: {
        latitude: number;
        longitude: number;
        address?: string | null | undefined;
    } | null | undefined;
    pickupLocation?: {
        latitude: number;
        longitude: number;
        address?: string | null | undefined;
    } | null | undefined;
    deliveryPersonLocation?: {
        latitude?: number | null | undefined;
        longitude?: number | null | undefined;
        address?: string | null | undefined;
    } | null | undefined;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, {
    branch: mongoose.Types.ObjectId;
    customer: mongoose.Types.ObjectId;
    items: mongoose.Types.DocumentArray<{
        id: mongoose.Types.ObjectId;
        item: mongoose.Types.ObjectId;
        count: number;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        id: mongoose.Types.ObjectId;
        item: mongoose.Types.ObjectId;
        count: number;
    }> & {
        id: mongoose.Types.ObjectId;
        item: mongoose.Types.ObjectId;
        count: number;
    }>;
    status: "available" | "confirmed" | "arriving" | "delivered" | "cancelled";
    totalPrice: number;
    createdAt: NativeDate;
    updatedAt: NativeDate;
    orderId?: string | null | undefined;
    deliveryPartner?: mongoose.Types.ObjectId | null | undefined;
    deliveryLocation?: {
        latitude: number;
        longitude: number;
        address?: string | null | undefined;
    } | null | undefined;
    pickupLocation?: {
        latitude: number;
        longitude: number;
        address?: string | null | undefined;
    } | null | undefined;
    deliveryPersonLocation?: {
        latitude?: number | null | undefined;
        longitude?: number | null | undefined;
        address?: string | null | undefined;
    } | null | undefined;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    branch: mongoose.Types.ObjectId;
    customer: mongoose.Types.ObjectId;
    items: mongoose.Types.DocumentArray<{
        id: mongoose.Types.ObjectId;
        item: mongoose.Types.ObjectId;
        count: number;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        id: mongoose.Types.ObjectId;
        item: mongoose.Types.ObjectId;
        count: number;
    }> & {
        id: mongoose.Types.ObjectId;
        item: mongoose.Types.ObjectId;
        count: number;
    }>;
    status: "available" | "confirmed" | "arriving" | "delivered" | "cancelled";
    totalPrice: number;
    createdAt: NativeDate;
    updatedAt: NativeDate;
    orderId?: string | null | undefined;
    deliveryPartner?: mongoose.Types.ObjectId | null | undefined;
    deliveryLocation?: {
        latitude: number;
        longitude: number;
        address?: string | null | undefined;
    } | null | undefined;
    pickupLocation?: {
        latitude: number;
        longitude: number;
        address?: string | null | undefined;
    } | null | undefined;
    deliveryPersonLocation?: {
        latitude?: number | null | undefined;
        longitude?: number | null | undefined;
        address?: string | null | undefined;
    } | null | undefined;
}>, {}, mongoose.ResolveSchemaOptions<mongoose.DefaultSchemaOptions>> & mongoose.FlatRecord<{
    branch: mongoose.Types.ObjectId;
    customer: mongoose.Types.ObjectId;
    items: mongoose.Types.DocumentArray<{
        id: mongoose.Types.ObjectId;
        item: mongoose.Types.ObjectId;
        count: number;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        id: mongoose.Types.ObjectId;
        item: mongoose.Types.ObjectId;
        count: number;
    }> & {
        id: mongoose.Types.ObjectId;
        item: mongoose.Types.ObjectId;
        count: number;
    }>;
    status: "available" | "confirmed" | "arriving" | "delivered" | "cancelled";
    totalPrice: number;
    createdAt: NativeDate;
    updatedAt: NativeDate;
    orderId?: string | null | undefined;
    deliveryPartner?: mongoose.Types.ObjectId | null | undefined;
    deliveryLocation?: {
        latitude: number;
        longitude: number;
        address?: string | null | undefined;
    } | null | undefined;
    pickupLocation?: {
        latitude: number;
        longitude: number;
        address?: string | null | undefined;
    } | null | undefined;
    deliveryPersonLocation?: {
        latitude?: number | null | undefined;
        longitude?: number | null | undefined;
        address?: string | null | undefined;
    } | null | undefined;
}> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
import mongoose from 'mongoose';
//# sourceMappingURL=order.d.ts.map