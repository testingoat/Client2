import { appAxios } from './apiInterceptors';

/**
 * Promotion Service - API calls for Wallet, Coupons, Referral, Loyalty
 */

// ============ WALLET ============

interface WalletBalance {
    balance: number;
    availableBalance: number;
    expiringBalance: number;
    totalEarned: number;
    totalSpent: number;
    isFrozen: boolean;
}

interface Transaction {
    _id: string;
    type: 'credit' | 'debit';
    amount: number;
    source: string;
    description: string;
    expiresAt?: string;
    createdAt: string;
}

export const getWalletBalance = async (): Promise<WalletBalance> => {
    const response = await appAxios.get('/api/wallet');
    return response.data.data;
};

export const getWalletTransactions = async (page = 1, limit = 20) => {
    const response = await appAxios.get('/api/wallet/transactions', {
        params: { page, limit }
    });
    return response.data.data;
};

export const getExpiringCredits = async (days = 7) => {
    const response = await appAxios.get('/api/wallet/expiring', {
        params: { days }
    });
    return response.data.data;
};

// ============ COUPONS ============

interface Coupon {
    _id: string;
    code: string;
    name: string;
    description: string;
    discountType: 'flat' | 'percentage' | 'free_delivery' | 'bogo' | 'cashback';
    discountValue: number;
    minOrderValue: number;
    maxDiscount?: number;
    terms?: string;
    validUntil: string;
}

interface CouponValidation {
    valid: boolean;
    error?: string;
    message?: string;
    discount?: number;
    discountType?: string;
    finalAmount?: number;
}

export const getAvailableCoupons = async (): Promise<Coupon[]> => {
    const response = await appAxios.get('/api/coupons/available');
    return response.data.data?.coupons || [];
};

export const validateCoupon = async (
    code: string,
    cartTotal: number,
    items: Array<{ productId: string; quantity: number }>
): Promise<CouponValidation> => {
    const response = await appAxios.post('/api/coupons/validate', {
        code,
        cartTotal,
        items
    });
    return response.data.data;
};

export const getCouponHistory = async (page = 1, limit = 20) => {
    const response = await appAxios.get('/api/coupons/history', {
        params: { page, limit }
    });
    return response.data.data;
};

// ============ REFERRAL ============

interface ReferralCode {
    code: string;
    shareMessage: string;
    stats: {
        pending: number;
        completed: number;
        expired: number;
        totalEarned: number;
    };
}

interface ReferralHistoryItem {
    id: string;
    refereeName: string;
    refereePhone: string;
    status: 'pending' | 'completed' | 'expired';
    reward: number;
    rewarded: boolean;
    createdAt: string;
}

export const getMyReferralCode = async (): Promise<ReferralCode> => {
    const response = await appAxios.get('/api/referral/my-code');
    return response.data.data;
};

export const applyReferralCode = async (code: string) => {
    const response = await appAxios.post('/api/referral/apply', { code });
    return response.data;
};

export const getReferralHistory = async (page = 1, limit = 20) => {
    const response = await appAxios.get('/api/referral/history', {
        params: { page, limit }
    });
    return response.data.data;
};

export const getReferralLeaderboard = async (limit = 10) => {
    const response = await appAxios.get('/api/referral/leaderboard', {
        params: { limit }
    });
    return response.data.data;
};

// ============ LOYALTY ============

interface LoyaltyStatus {
    tier: 'bronze' | 'silver' | 'gold' | 'platinum';
    tierDisplay: string;
    ordersThisMonth: number;
    spentThisMonth: number;
    totalOrders: number;
    totalSpent: number;
    points: number;
    lifetimePoints: number;
    benefits: {
        extraCashbackPercent: number;
        freeDelivery: boolean;
        prioritySupport: boolean;
        exclusiveDeals: boolean;
    };
    nextTierProgress: {
        isMaxTier: boolean;
        nextTier?: string;
        ordersNeeded?: number;
        spentNeeded?: number;
        ordersProgress?: number;
        spentProgress?: number;
    };
    tierExpiresAt?: string;
}

export const getLoyaltyStatus = async (): Promise<LoyaltyStatus> => {
    const response = await appAxios.get('/api/loyalty');
    return response.data.data;
};

export const getLoyaltyProgress = async () => {
    const response = await appAxios.get('/api/loyalty/progress');
    return response.data.data;
};

export const getLoyaltyBenefits = async () => {
    const response = await appAxios.get('/api/loyalty/benefits');
    return response.data.data;
};

export const redeemPoints = async (points: number) => {
    const response = await appAxios.post('/api/loyalty/redeem', { points });
    return response.data.data;
};

export const getLoyaltyLeaderboard = async (limit = 10) => {
    const response = await appAxios.get('/api/loyalty/leaderboard', {
        params: { limit }
    });
    return response.data.data;
};
