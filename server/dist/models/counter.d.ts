export default Counter;
declare const Counter: mongoose.Model<{
    name: string;
    sequence_value: number;
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    name: string;
    sequence_value: number;
}, {}, mongoose.DefaultSchemaOptions> & {
    name: string;
    sequence_value: number;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, {
    name: string;
    sequence_value: number;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    name: string;
    sequence_value: number;
}>, {}, mongoose.ResolveSchemaOptions<mongoose.DefaultSchemaOptions>> & mongoose.FlatRecord<{
    name: string;
    sequence_value: number;
}> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
import mongoose from 'mongoose';
//# sourceMappingURL=counter.d.ts.map