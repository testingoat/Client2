import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    RefreshControl,
    ActivityIndicator,
    TextInput,
    Alert,
    Clipboard,
    Animated,
    Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import CustomHeader from '@components/ui/CustomHeader';
import CustomText from '@components/ui/CustomText';
import ScalePress from '@components/ui/ScalePress';
import { Colors, Fonts } from '@utils/Constants';
import { getAvailableCoupons } from '@service/promotionService';

const { width } = Dimensions.get('window');

interface Coupon {
    _id: string;
    code: string;
    name: string;
    description: string;
    type: 'flat' | 'percentage' | 'free_delivery' | 'bogo' | 'cashback';
    displayDiscount: string;
    minOrderValue: number;
    maxDiscount?: number;
    terms?: string;
    validUntil: string;
    canApply?: boolean;
    amountNeeded?: number;
}

// Animated Coupon Card Component
const CouponCard = ({
    coupon,
    index,
    onCopy,
    onApply
}: {
    coupon: Coupon;
    index: number;
    onCopy: (code: string) => void;
    onApply: (code: string) => void;
}) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const scaleAnim = useRef(new Animated.Value(0.95)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 400,
                delay: index * 100,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 400,
                delay: index * 100,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 8,
                tension: 40,
                delay: index * 100,
                useNativeDriver: true,
            }),
        ]).start();
    }, [fadeAnim, slideAnim, scaleAnim, index]);

    const getDiscountColor = () => {
        const colors: { [key: string]: string } = {
            flat: '#10b981',
            percentage: '#3b82f6',
            free_delivery: '#8b5cf6',
            bogo: '#f59e0b',
            cashback: '#ec4899'
        };
        return colors[coupon.type] || '#10b981';
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short'
        });
    };

    return (
        <Animated.View
            style={[
                styles.couponCard,
                {
                    opacity: fadeAnim,
                    transform: [
                        { translateY: slideAnim },
                        { scale: scaleAnim }
                    ],
                },
            ]}
        >
            {/* Left Discount Badge - Vertical */}
            <View style={[styles.discountBadge, { backgroundColor: getDiscountColor() }]}>
                <CustomText variant="h8" fontFamily={Fonts.Bold} style={styles.discountText}>
                    {coupon.displayDiscount || 'DISCOUNT'}
                </CustomText>
            </View>

            {/* Middle Content */}
            <View style={styles.couponContent}>
                {/* Code Name & Apply Button Row */}
                <View style={styles.headerRow}>
                    <CustomText variant="h6" fontFamily={Fonts.Bold} style={styles.couponCode}>
                        {coupon.code}
                    </CustomText>
                    <ScalePress style={styles.applyBtn} onPress={() => onApply(coupon.code)}>
                        <CustomText variant="h8" fontFamily={Fonts.SemiBold} style={styles.applyBtnText}>
                            APPLY
                        </CustomText>
                    </ScalePress>
                </View>

                {/* Savings Highlight */}
                <CustomText variant="h8" fontFamily={Fonts.Medium} style={styles.savingsText}>
                    {coupon.name}
                </CustomText>

                {/* Divider */}
                <View style={styles.dashedDivider} />

                {/* Description */}
                <CustomText variant="h9" style={styles.descText} numberOfLines={2}>
                    {coupon.description || `Use code ${coupon.code} & get ${coupon.displayDiscount} on orders above ₹${coupon.minOrderValue}.`}
                </CustomText>

                {/* Terms & Copy Row */}
                <View style={styles.bottomRow}>
                    <View style={styles.metaRow}>
                        <CustomText variant="h9" style={styles.metaText}>
                            Min ₹{coupon.minOrderValue}
                        </CustomText>
                        <View style={styles.metaDot} />
                        <CustomText variant="h9" style={styles.metaText}>
                            Valid till {formatDate(coupon.validUntil)}
                        </CustomText>
                    </View>
                    <ScalePress style={styles.copyBtn} onPress={() => onCopy(coupon.code)}>
                        <Icon name="copy-outline" size={14} color={Colors.secondary} />
                        <CustomText variant="h9" fontFamily={Fonts.Medium} style={styles.copyBtnText}>
                            COPY
                        </CustomText>
                    </ScalePress>
                </View>
            </View>
        </Animated.View>
    );
};

const CouponsScreen = () => {
    const navigation = useNavigation<any>();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(false);
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [inputCode, setInputCode] = useState('');

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
        Alert.alert('Copied! ✓', `Code "${code}" copied to clipboard`);
    };

    const handleApplyCode = async () => {
        if (!inputCode.trim()) return;
        Clipboard.setString(inputCode.trim().toUpperCase());
        Alert.alert(
            'Code Copied!',
            `Use code "${inputCode.trim().toUpperCase()}" at checkout to apply the discount.`,
            [{ text: 'OK' }]
        );
        setInputCode('');
    };

    const handleApplyCoupon = (code: string) => {
        Clipboard.setString(code);
        Alert.alert(
            'Coupon Applied! 🎉',
            `Code "${code}" copied. Proceed to checkout to use this discount.`,
            [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <CustomHeader title="Coupons" />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.secondary} />
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <CustomHeader title="Coupons" />
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={Colors.secondary}
                    />
                }
            >
                {/* Input Section */}
                <View style={styles.inputSection}>
                    <TextInput
                        style={styles.codeInput}
                        placeholder="Enter Coupon Code"
                        placeholderTextColor={Colors.disabled}
                        value={inputCode}
                        onChangeText={setInputCode}
                        autoCapitalize="characters"
                    />
                    <ScalePress
                        style={{
                            ...styles.inputApplyBtn,
                            ...(inputCode.trim() ? {} : styles.inputApplyBtnDisabled)
                        }}
                        onPress={handleApplyCode}
                        disabled={!inputCode.trim()}
                    >
                        <CustomText variant="h7" fontFamily={Fonts.SemiBold} style={styles.inputApplyBtnText}>
                            APPLY
                        </CustomText>
                    </ScalePress>
                </View>

                {/* Error */}
                {error && (
                    <View style={styles.errorCard}>
                        <Icon name="alert-circle" size={20} color="#dc2626" />
                        <CustomText variant="h8" style={styles.errorText}>
                            Could not load coupons. Pull to refresh.
                        </CustomText>
                    </View>
                )}

                {/* Section Header */}
                <View style={styles.sectionHeader}>
                    <CustomText variant="h6" fontFamily={Fonts.Bold}>
                        Available Coupons
                    </CustomText>
                    <View style={styles.countBadge}>
                        <CustomText variant="h9" fontFamily={Fonts.SemiBold} style={styles.countText}>
                            {coupons.length}
                        </CustomText>
                    </View>
                </View>

                {/* Coupons List */}
                {coupons.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Icon name="pricetag-outline" size={48} color={Colors.disabled} />
                        <CustomText variant="h7" style={styles.emptyText}>
                            No coupons available right now
                        </CustomText>
                        <CustomText variant="h9" style={styles.emptySubtext}>
                            Check back later for exclusive offers!
                        </CustomText>
                    </View>
                ) : (
                    coupons.map((coupon, index) => (
                        <CouponCard
                            key={coupon._id}
                            coupon={coupon}
                            index={index}
                            onCopy={handleCopyCode}
                            onApply={handleApplyCoupon}
                        />
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
    scroll: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 100,
    },
    inputSection: {
        flexDirection: 'row',
        marginBottom: 20,
        gap: 10,
    },
    codeInput: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontFamily: Fonts.Medium,
        fontSize: 14,
        color: Colors.text,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    inputApplyBtn: {
        backgroundColor: Colors.secondary,
        borderRadius: 10,
        paddingHorizontal: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    inputApplyBtnDisabled: {
        opacity: 0.5,
    },
    inputApplyBtnText: {
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
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 8,
    },
    countBadge: {
        backgroundColor: Colors.secondary,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    countText: {
        color: '#fff',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        color: Colors.disabled,
        marginTop: 12,
    },
    emptySubtext: {
        color: Colors.disabled,
        marginTop: 4,
    },
    // Coupon Card Styles
    couponCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#e8e8e8',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    discountBadge: {
        width: 70,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 8,
    },
    discountText: {
        color: '#fff',
        fontSize: 12,
        textAlign: 'center',
        lineHeight: 16,
    },
    couponContent: {
        flex: 1,
        padding: 12,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    couponCode: {
        color: Colors.text,
        letterSpacing: 0.5,
    },
    applyBtn: {
        backgroundColor: 'transparent',
    },
    applyBtnText: {
        color: Colors.secondary,
        letterSpacing: 0.5,
    },
    savingsText: {
        color: Colors.secondary,
        marginTop: 4,
    },
    dashedDivider: {
        height: 1,
        backgroundColor: '#e8e8e8',
        marginVertical: 10,
        borderStyle: 'dashed',
    },
    descText: {
        color: '#666',
        lineHeight: 18,
    },
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metaText: {
        color: '#999',
    },
    metaDot: {
        width: 3,
        height: 3,
        borderRadius: 1.5,
        backgroundColor: '#999',
        marginHorizontal: 6,
    },
    copyBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    copyBtnText: {
        color: Colors.secondary,
    },
});

export default CouponsScreen;
