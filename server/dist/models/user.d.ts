import mongoose, { Document } from 'mongoose';
interface IUser extends Document {
    _id: mongoose.Types.ObjectId | string;
    name?: string;
    role: 'Customer' | 'Admin' | 'DeliveryPartner';
    isActivated: boolean;
}
interface IAdmin extends IUser {
    email: string;
    password?: string;
    role: 'Admin';
}
export declare const Customer: mongoose.Model<{
    role: "Customer";
    phone: number;
    fcmToken?: string | null | undefined;
    lastTokenUpdate?: NativeDate | null | undefined;
    liveLocation?: {
        latitude?: number | null | undefined;
        longitude?: number | null | undefined;
    } | {
        latitude?: number | null | undefined;
        longitude?: number | null | undefined;
    } | null | undefined;
    address?: string | null | undefined;
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    role: "Customer";
    phone: number;
    fcmToken?: string | null | undefined;
    lastTokenUpdate?: NativeDate | null | undefined;
    liveLocation?: {
        latitude?: number | null | undefined;
        longitude?: number | null | undefined;
    } | {
        latitude?: number | null | undefined;
        longitude?: number | null | undefined;
    } | null | undefined;
    address?: string | null | undefined;
}, {}, mongoose.DefaultSchemaOptions> & {
    role: "Customer";
    phone: number;
    fcmToken?: string | null | undefined;
    lastTokenUpdate?: NativeDate | null | undefined;
    liveLocation?: {
        latitude?: number | null | undefined;
        longitude?: number | null | undefined;
    } | {
        latitude?: number | null | undefined;
        longitude?: number | null | undefined;
    } | null | undefined;
    address?: string | null | undefined;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, {
    role: "Customer";
    phone: number;
    fcmToken?: string | null | undefined;
    lastTokenUpdate?: NativeDate | null | undefined;
    liveLocation?: {
        latitude?: number | null | undefined;
        longitude?: number | null | undefined;
    } | {
        latitude?: number | null | undefined;
        longitude?: number | null | undefined;
    } | null | undefined;
    address?: string | null | undefined;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    role: "Customer";
    phone: number;
    fcmToken?: string | null | undefined;
    lastTokenUpdate?: NativeDate | null | undefined;
    liveLocation?: {
        latitude?: number | null | undefined;
        longitude?: number | null | undefined;
    } | {
        latitude?: number | null | undefined;
        longitude?: number | null | undefined;
    } | null | undefined;
    address?: string | null | undefined;
}>, {}, mongoose.ResolveSchemaOptions<mongoose.DefaultSchemaOptions>> & mongoose.FlatRecord<{
    role: "Customer";
    phone: number;
    fcmToken?: string | null | undefined;
    lastTokenUpdate?: NativeDate | null | undefined;
    liveLocation?: {
        latitude?: number | null | undefined;
        longitude?: number | null | undefined;
    } | {
        latitude?: number | null | undefined;
        longitude?: number | null | undefined;
    } | null | undefined;
    address?: string | null | undefined;
}> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
export declare const DeliveryPartner: mongoose.Model<{
    role: "DeliveryPartner";
    phone: number;
    email: string;
    password: string;
    fcmToken?: string | null | undefined;
    lastTokenUpdate?: NativeDate | null | undefined;
    liveLocation?: {
        latitude?: number | null | undefined;
        longitude?: number | null | undefined;
    } | {
        latitude?: number | null | undefined;
        longitude?: number | null | undefined;
    } | null | undefined;
    address?: string | null | undefined;
    branch?: mongoose.Types.ObjectId | null | undefined;
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    role: "DeliveryPartner";
    phone: number;
    email: string;
    password: string;
    fcmToken?: string | null | undefined;
    lastTokenUpdate?: NativeDate | null | undefined;
    liveLocation?: {
        latitude?: number | null | undefined;
        longitude?: number | null | undefined;
    } | {
        latitude?: number | null | undefined;
        longitude?: number | null | undefined;
    } | null | undefined;
    address?: string | null | undefined;
    branch?: mongoose.Types.ObjectId | null | undefined;
}, {}, mongoose.DefaultSchemaOptions> & {
    role: "DeliveryPartner";
    phone: number;
    email: string;
    password: string;
    fcmToken?: string | null | undefined;
    lastTokenUpdate?: NativeDate | null | undefined;
    liveLocation?: {
        latitude?: number | null | undefined;
        longitude?: number | null | undefined;
    } | {
        latitude?: number | null | undefined;
        longitude?: number | null | undefined;
    } | null | undefined;
    address?: string | null | undefined;
    branch?: mongoose.Types.ObjectId | null | undefined;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, {
    role: "DeliveryPartner";
    phone: number;
    email: string;
    password: string;
    fcmToken?: string | null | undefined;
    lastTokenUpdate?: NativeDate | null | undefined;
    liveLocation?: {
        latitude?: number | null | undefined;
        longitude?: number | null | undefined;
    } | {
        latitude?: number | null | undefined;
        longitude?: number | null | undefined;
    } | null | undefined;
    address?: string | null | undefined;
    branch?: mongoose.Types.ObjectId | null | undefined;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    role: "DeliveryPartner";
    phone: number;
    email: string;
    password: string;
    fcmToken?: string | null | undefined;
    lastTokenUpdate?: NativeDate | null | undefined;
    liveLocation?: {
        latitude?: number | null | undefined;
        longitude?: number | null | undefined;
    } | {
        latitude?: number | null | undefined;
        longitude?: number | null | undefined;
    } | null | undefined;
    address?: string | null | undefined;
    branch?: mongoose.Types.ObjectId | null | undefined;
}>, {}, mongoose.ResolveSchemaOptions<mongoose.DefaultSchemaOptions>> & mongoose.FlatRecord<{
    role: "DeliveryPartner";
    phone: number;
    email: string;
    password: string;
    fcmToken?: string | null | undefined;
    lastTokenUpdate?: NativeDate | null | undefined;
    liveLocation?: {
        latitude?: number | null | undefined;
        longitude?: number | null | undefined;
    } | {
        latitude?: number | null | undefined;
        longitude?: number | null | undefined;
    } | null | undefined;
    address?: string | null | undefined;
    branch?: mongoose.Types.ObjectId | null | undefined;
}> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
export declare const Admin: mongoose.Model<IAdmin, {}, {}, {}, mongoose.Document<unknown, {}, IAdmin, {}, {}> & IAdmin & Required<{
    _id: string | mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export { IAdmin };
//# sourceMappingURL=user.d.ts.map