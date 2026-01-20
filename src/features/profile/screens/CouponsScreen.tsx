import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    RefreshControl,
    ActivityIndicator,
    TextInput,
    Alert,
    Clipboard,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import CustomHeader from '@components/ui/CustomHeader';
import CustomText from '@components/ui/CustomText';
import ScalePress from '@components/ui/ScalePress';
import { Colors, Fonts } from '@utils/Constants';
import { getAvailableCoupons, validateCoupon } from '@service/promotionService';

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

const CouponsScreen = () => {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(false);
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [inputCode, setInputCode] = useState('');
    const [validating, setValidating] = useState(false);

    const fetchCoupons = useCallback(async () => {
        setError(false);
        try {
            const data = await getAvailableCoupons();
            setCoupons(data || []);
        } catch (err) {
            console.log('Error fetching coupons:', err);
            setError(true);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchCoupons();
    }, [fetchCoupons]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchCoupons();
    }, [fetchCoupons]);

    const handleCopyCode = (code: string) => {
        Clipboard.setString(code);
        Alert.alert('Copied!', `Code "${code}" copied to clipboard`);
    };

    const handleApplyCode = async () => {
        if (!inputCode.trim()) return;

        setValidating(true);
        try {
            const result = await validateCoupon(inputCode.trim(), 500, []);
            if (result.valid) {
                Alert.alert('Valid!', `Discount: ₹${result.discount}`);
            } else {
                Alert.alert('Invalid', result.message || 'Code not valid');
            }
        } catch (err) {
            Alert.alert('Error', 'Failed to validate code');
        } finally {
            setValidating(false);
        }
    };

    const getDiscountDisplay = (coupon: Coupon) => {
        switch (coupon.discountType) {
            case 'flat':
                return `₹${coupon.discountValue} OFF`;
            case 'percentage':
                return `${coupon.discountValue}% OFF`;
            case 'free_delivery':
                return 'FREE DELIVERY';
            case 'bogo':
                return 'BUY 1 GET 1';
            case 'cashback':
                return `₹${coupon.discountValue} CASHBACK`;
            default:
                return 'DISCOUNT';
        }
    };

    const getDiscountColor = (type: string) => {
        const colors: { [key: string]: string } = {
            flat: '#10b981',
            percentage: '#3b82f6',
            free_delivery: '#8b5cf6',
            bogo: '#f59e0b',
            cashback: '#ec4899'
        };
        return colors[type] || Colors.secondary;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short'
        });
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <CustomHeader title="Coupons" />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <CustomHeader title="Coupons" />
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Apply Code Section */}
                <View style={styles.applySection}>
                    <CustomText variant="h6" fontFamily={Fonts.SemiBold}>
                        Have a code?
                    </CustomText>
                    <View style={styles.inputRow}>
                        <TextInput
                            style={styles.codeInput}
                            placeholder="Enter coupon code"
                            placeholderTextColor={Colors.disabled}
                            value={inputCode}
                            onChangeText={setInputCode}
                            autoCapitalize="characters"
                        />
                        <ScalePress
                            style={styles.applyButton}
                            onPress={handleApplyCode}
                            disabled={!inputCode.trim() || validating}
                        >
                            {validating ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <CustomText variant="h7" fontFamily={Fonts.SemiBold} style={styles.applyButtonText}>
                                    APPLY
                                </CustomText>
                            )}
                        </ScalePress>
                    </View>
                </View>

                {/* Error Message */}
                {error && (
                    <View style={styles.errorCard}>
                        <Icon name="cloud-offline-outline" size={20} color="#dc2626" />
                        <CustomText variant="h8" style={styles.errorText}>
                            Could not load coupons. Pull to refresh.
                        </CustomText>
                    </View>
                )}

                {/* Available Coupons */}
                <CustomText variant="h5" fontFamily={Fonts.SemiBold} style={styles.sectionTitle}>
                    Available Coupons ({coupons.length})
                </CustomText>

                {coupons.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Icon name="pricetag-outline" size={48} color={Colors.disabled} />
                        <CustomText variant="h7" style={styles.emptyText}>
                            No coupons available right now
                        </CustomText>
                        <CustomText variant="h8" style={styles.emptySubtext}>
                            Check back later for exclusive offers!
                        </CustomText>
                    </View>
                ) : (
                    coupons.map((coupon) => (
                        <ScalePress key={coupon._id} style={styles.couponCard}>
                            <View style={styles.couponLeft}>
                                <View style={[styles.discountBadge, { backgroundColor: getDiscountColor(coupon.discountType) }]}>
                                    <CustomText variant="h7" fontFamily={Fonts.Bold} style={styles.discountText}>
                                        {getDiscountDisplay(coupon)}
                                    </CustomText>
                                </View>
                            </View>
                            <View style={styles.couponDivider}>
                                {[...Array(8)].map((_, i) => (
                                    <View key={i} style={styles.dividerDot} />
                                ))}
                            </View>
                            <View style={styles.couponRight}>
                                <CustomText variant="h6" fontFamily={Fonts.SemiBold}>
                                    {coupon.name}
                                </CustomText>
                                <CustomText variant="h8" style={styles.couponDesc} numberOfLines={2}>
                                    {coupon.description}
                                </CustomText>
                                <View style={styles.couponMeta}>
                                    <CustomText variant="h9" style={styles.couponMinOrder}>
                                        Min order: ₹{coupon.minOrderValue}
                                    </CustomText>
                                    <CustomText variant="h9" style={styles.couponExpiry}>
                                        Valid till {formatDate(coupon.validUntil)}
                                    </CustomText>
                                </View>
                                <View style={styles.codeRow}>
                                    <View style={styles.codeBox}>
                                        <CustomText variant="h7" fontFamily={Fonts.SemiBold} style={styles.codeText}>
                                            {coupon.code}
                                        </CustomText>
                                    </View>
                                    <ScalePress
                                        style={styles.copyButton}
                                        onPress={() => handleCopyCode(coupon.code)}
                                    >
                                        <Icon name="copy-outline" size={18} color={Colors.secondary} />
                                        <CustomText variant="h8" fontFamily={Fonts.Medium} style={styles.copyText}>
                                            COPY
                                        </CustomText>
                                    </ScalePress>
                                </View>
                            </View>
                        </ScalePress>
                    ))
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 100,
    },
    applySection: {
        backgroundColor: Colors.backgroundSecondary,
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
    },
    inputRow: {
        flexDirection: 'row',
        marginTop: 12,
        gap: 12,
    },
    codeInput: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 10,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontFamily: Fonts.Medium,
        fontSize: 14,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    applyButton: {
        backgroundColor: Colors.secondary,
        borderRadius: 10,
        paddingHorizontal: 24,
        justifyContent: 'center',
        alignItems: 'center',
        opacity: 1,
    },
    applyButtonText: {
        color: '#fff',
    },
    errorCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#fee2e2',
        borderRadius: 10,
        padding: 12,
        marginBottom: 16,
    },
    errorText: {
        color: '#dc2626',
        flex: 1,
    },
    sectionTitle: {
        marginBottom: 16,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        color: Colors.disabled,
        marginTop: 12,
    },
    emptySubtext: {
        color: Colors.disabled,
        marginTop: 4,
    },
    couponCard: {
        flexDirection: 'row',
        backgroundColor: Colors.backgroundSecondary,
        borderRadius: 12,
        marginBottom: 12,
        overflow: 'hidden',
    },
    couponLeft: {
        width: 90,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 12,
    },
    discountBadge: {
        paddingHorizontal: 8,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    discountText: {
        color: '#fff',
        fontSize: 11,
        textAlign: 'center',
    },
    couponDivider: {
        width: 1,
        justifyContent: 'space-evenly',
        alignItems: 'center',
        paddingVertical: 8,
    },
    dividerDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#fff',
    },
    couponRight: {
        flex: 1,
        padding: 12,
    },
    couponDesc: {
        color: Colors.text,
        marginTop: 4,
        opacity: 0.7,
    },
    couponMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    couponMinOrder: {
        color: Colors.disabled,
    },
    couponExpiry: {
        color: Colors.disabled,
    },
    codeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
        gap: 12,
    },
    codeBox: {
        backgroundColor: '#fff',
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderWidth: 1,
        borderColor: Colors.border,
        borderStyle: 'dashed',
    },
    codeText: {
        color: Colors.secondary,
        letterSpacing: 1,
    },
    copyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    copyText: {
        color: Colors.secondary,
    },
});

export default CouponsScreen;
