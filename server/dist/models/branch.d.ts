export default Branch;
declare const Branch: mongoose.Model<{
    name: string;
    deliveryPartners: mongoose.Types.ObjectId[];
    address?: string | null | undefined;
    location?: {
        latitude?: number | null | undefined;
        longitude?: number | null | undefined;
    } | null | undefined;
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    name: string;
    deliveryPartners: mongoose.Types.ObjectId[];
    address?: string | null | undefined;
    location?: {
        latitude?: number | null | undefined;
        longitude?: number | null | undefined;
    } | null | undefined;
}, {}, mongoose.DefaultSchemaOptions> & {
    name: string;
    deliveryPartners: mongoose.Types.ObjectId[];
    address?: string | null | undefined;
    location?: {
        latitude?: number | null | undefined;
        longitude?: number | null | undefined;
    } | null | undefined;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, {
    name: string;
    deliveryPartners: mongoose.Types.ObjectId[];
    address?: string | null | undefined;
    location?: {
        latitude?: number | null | undefined;
        longitude?: number | null | undefined;
    } | null | undefined;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    name: string;
    deliveryPartners: mongoose.Types.ObjectId[];
    address?: string | null | undefined;
    location?: {
        latitude?: number | null | undefined;
        longitude?: number | null | undefined;
    } | null | undefined;
}>, {}, mongoose.ResolveSchemaOptions<mongoose.DefaultSchemaOptions>> & mongoose.FlatRecord<{
    name: string;
    deliveryPartners: mongoose.Types.ObjectId[];
    address?: string | null | undefined;
    location?: {
        latitude?: number | null | undefined;
        longitude?: number | null | undefined;
    } | null | undefined;
}> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
import mongoose from 'mongoose';
//# sourceMappingURL=branch.d.ts.map