export const OTPAttempt: mongoose.Model<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    phone: string;
    context: "request" | "verify";
    ipHash: string;
    attemptCount: number;
    lastAttemptAt: NativeDate;
    windowStart: NativeDate;
    blockedUntil?: NativeDate | null | undefined;
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    phone: string;
    context: "request" | "verify";
    ipHash: string;
    attemptCount: number;
    lastAttemptAt: NativeDate;
    windowStart: NativeDate;
    blockedUntil?: NativeDate | null | undefined;
}, {}, {
    timestamps: true;
}> & {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    phone: string;
    context: "request" | "verify";
    ipHash: string;
    attemptCount: number;
    lastAttemptAt: NativeDate;
    windowStart: NativeDate;
    blockedUntil?: NativeDate | null | undefined;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    phone: string;
    context: "request" | "verify";
    ipHash: string;
    attemptCount: number;
    lastAttemptAt: NativeDate;
    windowStart: NativeDate;
    blockedUntil?: NativeDate | null | undefined;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    phone: string;
    context: "request" | "verify";
    ipHash: string;
    attemptCount: number;
    lastAttemptAt: NativeDate;
    windowStart: NativeDate;
    blockedUntil?: NativeDate | null | undefined;
}>, {}, mongoose.ResolveSchemaOptions<{
    timestamps: true;
}>> & mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    phone: string;
    context: "request" | "verify";
    ipHash: string;
    attemptCount: number;
    lastAttemptAt: NativeDate;
    windowStart: NativeDate;
    blockedUntil?: NativeDate | null | undefined;
}> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
export const OTPToken: mongoose.Model<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    phone: string;
    createdAt: NativeDate;
    otpHash: string;
    expiresAt: NativeDate;
    requestId?: string | null | undefined;
    consumedAt?: NativeDate | null | undefined;
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    phone: string;
    createdAt: NativeDate;
    otpHash: string;
    expiresAt: NativeDate;
    requestId?: string | null | undefined;
    consumedAt?: NativeDate | null | undefined;
}, {}, {
    timestamps: true;
}> & {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    phone: string;
    createdAt: NativeDate;
    otpHash: string;
    expiresAt: NativeDate;
    requestId?: string | null | undefined;
    consumedAt?: NativeDate | null | undefined;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    phone: string;
    createdAt: NativeDate;
    otpHash: string;
    expiresAt: NativeDate;
    requestId?: string | null | undefined;
    consumedAt?: NativeDate | null | undefined;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    phone: string;
    createdAt: NativeDate;
    otpHash: string;
    expiresAt: NativeDate;
    requestId?: string | null | undefined;
    consumedAt?: NativeDate | null | undefined;
}>, {}, mongoose.ResolveSchemaOptions<{
    timestamps: true;
}>> & mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    phone: string;
    createdAt: NativeDate;
    otpHash: string;
    expiresAt: NativeDate;
    requestId?: string | null | undefined;
    consumedAt?: NativeDate | null | undefined;
}> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
import mongoose from 'mongoose';
//# sourceMappingURL=otp.d.ts.map