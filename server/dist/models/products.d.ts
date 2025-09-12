export default Product;
declare const Product: mongoose.Model<{
    name: string;
    image: string;
    price: number;
    quantity: string;
    category: mongoose.Types.ObjectId;
    discountPrice?: number | null | undefined;
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    name: string;
    image: string;
    price: number;
    quantity: string;
    category: mongoose.Types.ObjectId;
    discountPrice?: number | null | undefined;
}, {}, mongoose.DefaultSchemaOptions> & {
    name: string;
    image: string;
    price: number;
    quantity: string;
    category: mongoose.Types.ObjectId;
    discountPrice?: number | null | undefined;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, {
    name: string;
    image: string;
    price: number;
    quantity: string;
    category: mongoose.Types.ObjectId;
    discountPrice?: number | null | undefined;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    name: string;
    image: string;
    price: number;
    quantity: string;
    category: mongoose.Types.ObjectId;
    discountPrice?: number | null | undefined;
}>, {}, mongoose.ResolveSchemaOptions<mongoose.DefaultSchemaOptions>> & mongoose.FlatRecord<{
    name: string;
    image: string;
    price: number;
    quantity: string;
    category: mongoose.Types.ObjectId;
    discountPrice?: number | null | undefined;
}> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
import mongoose from 'mongoose';
//# sourceMappingURL=products.d.ts.map