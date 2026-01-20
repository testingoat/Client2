import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    RefreshControl,
    ActivityIndicator,
    Alert,
    Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import CustomHeader from '@components/ui/CustomHeader';
import CustomText from '@components/ui/CustomText';
import ScalePress from '@components/ui/ScalePress';
import { Colors, Fonts } from '@utils/Constants';
import { getLoyaltyStatus, redeemPoints } from '@service/promotionService';

interface Benefits {
    extraCashbackPercent: number;
    freeDelivery: boolean;
    prioritySupport: boolean;
    exclusiveDeals: boolean;
}

interface NextTierProgress {
    isMaxTier: boolean;
    nextTier?: string;
    ordersNeeded?: number;
    spentNeeded?: number;
    ordersProgress?: number;
    spentProgress?: number;
}

const LoyaltyScreen = () => {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [redeeming, setRedeeming] = useState(false);
    const [tier, setTier] = useState('bronze');
    const [tierDisplay, setTierDisplay] = useState('🥉 Bronze');
    const [points, setPoints] = useState(0);
    const [lifetimePoints, setLifetimePoints] = useState(0);
    const [ordersThisMonth, setOrdersThisMonth] = useState(0);
    const [spentThisMonth, setSpentThisMonth] = useState(0);
    const [totalOrders, setTotalOrders] = useState(0);
    const [benefits, setBenefits] = useState<Benefits>({
        extraCashbackPercent: 0,
        freeDelivery: false,
        prioritySupport: false,
        exclusiveDeals: false
    });
    const [nextTierProgress, setNextTierProgress] = useState<NextTierProgress>({
        isMaxTier: false,
        ordersProgress: 0,
        spentProgress: 0
    });

    const fadeAnim = useState(new Animated.Value(0))[0];
    const progressAnim = useState(new Animated.Value(0))[0];

    const fetchData = useCallback(async () => {
        try {
            const data = await getLoyaltyStatus();
            setTier(data.tier);
            setTierDisplay(data.tierDisplay);
            setPoints(data.points);
            setLifetimePoints(data.lifetimePoints);
            setOrdersThisMonth(data.ordersThisMonth);
            setSpentThisMonth(data.spentThisMonth);
            setTotalOrders(data.totalOrders);
            setBenefits(data.benefits);
            setNextTierProgress(data.nextTierProgress);

            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.timing(progressAnim, {
                    toValue: data.nextTierProgress.ordersProgress || 0,
                    duration: 1000,
                    useNativeDriver: false,
                })
            ]).start();
        } catch (error) {
            console.log('Error fetching loyalty data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [fadeAnim, progressAnim]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchData();
    }, [fetchData]);

    const handleRedeem = async () => {
        if (points < 100) {
            Alert.alert('Insufficient Points', 'You need at least 100 points to redeem');
            return;
        }

        Alert.alert(
            'Redeem Points',
            `Redeem ${points} points for ₹${Math.floor(points / 10)}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Redeem',
                    onPress: async () => {
                        setRedeeming(true);
                        try {
                            const result = await redeemPoints(points);
                            Alert.alert('Success!', `₹${result.rupeesCredited} added to your wallet`);
                            setPoints(result.remainingPoints);
                        } catch (error) {
                            Alert.alert('Error', 'Failed to redeem points');
                        } finally {
                            setRedeeming(false);
                        }
                    }
                }
            ]
        );
    };

    const getTierColor = (tierName: string) => {
        const colors: { [key: string]: string[] } = {
            bronze: ['#cd7f32', '#b87333', '#cd7f32'],
            silver: ['#c0c0c0', '#a8a8a8', '#c0c0c0'],
            gold: ['#ffd700', '#ffcc00', '#ffd700'],
            platinum: ['#e5e4e2', '#8b8b8b', '#e5e4e2']
        };
        return colors[tierName] || colors.bronze;
    };

    const getBenefitsList = () => {
        const list = [];
        if (benefits.extraCashbackPercent > 0) {
            list.push({ icon: 'gift', text: `${benefits.extraCashbackPercent}% Extra Cashback` });
        }
        if (benefits.freeDelivery) {
            list.push({ icon: 'bicycle', text: 'Free Delivery on all orders' });
        }
        if (benefits.prioritySupport) {
            list.push({ icon: 'headset', text: 'Priority Customer Support' });
        }
        if (benefits.exclusiveDeals) {
            list.push({ icon: 'star', text: 'Access to Exclusive Deals' });
        }
        if (list.length === 0) {
            list.push({ icon: 'trending-up', text: 'Keep ordering to unlock benefits!' });
        }
        return list;
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <CustomHeader title="Loyalty Rewards" />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <CustomHeader title="Loyalty Rewards" />
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                <Animated.View style={{ opacity: fadeAnim }}>
                    {/* Tier Card */}
                    <LinearGradient
                        colors={getTierColor(tier)}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.tierCard}
                    >
                        <View style={styles.tierBadge}>
                            <CustomText variant="h1" style={styles.tierEmoji}>
                                {tierDisplay.split(' ')[0]}
                            </CustomText>
                        </View>
                        <CustomText variant="h3" fontFamily={Fonts.Bold} style={styles.tierName}>
                            {tierDisplay.split(' ')[1]} Member
                        </CustomText>
                        <CustomText variant="h7" style={styles.tierSubtext}>
                            {totalOrders} orders • ₹{spentThisMonth} spent this month
                        </CustomText>
                    </LinearGradient>

                    {/* Points Card */}
                    <View style={styles.pointsCard}>
                        <View style={styles.pointsMain}>
                            <View>
                                <CustomText variant="h8" style={styles.pointsLabel}>
                                    AVAILABLE POINTS
                                </CustomText>
                                <CustomText variant="h2" fontFamily={Fonts.Bold} style={styles.pointsValue}>
                                    {points}
                                </CustomText>
                                <CustomText variant="h8" style={styles.pointsWorth}>
                                    Worth ₹{Math.floor(points / 10)}
                                </CustomText>
                            </View>
                            <ScalePress
                                style={StyleSheet.flatten([styles.redeemButton, points < 100 && styles.disabledButton])}
                                onPress={handleRedeem}
                                disabled={points < 100 || redeeming}
                            >
                                {redeeming ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <>
                                        <Icon name="gift" size={18} color="#fff" />
                                        <CustomText variant="h7" fontFamily={Fonts.SemiBold} style={styles.redeemText}>
                                            Redeem
                                        </CustomText>
                                    </>
                                )}
                            </ScalePress>
                        </View>
                        <CustomText variant="h9" style={styles.pointsNote}>
                            100 points = ₹10 • Min 100 points to redeem
                        </CustomText>
                    </View>

                    {/* Progress Section */}
                    {!nextTierProgress.isMaxTier && (
                        <View style={styles.progressSection}>
                            <CustomText variant="h6" fontFamily={Fonts.SemiBold}>
                                Progress to {nextTierProgress.nextTier?.charAt(0).toUpperCase()}{nextTierProgress.nextTier?.slice(1)}
                            </CustomText>
                            <View style={styles.progressBar}>
                                <Animated.View
                                    style={[
                                        styles.progressFill,
                                        {
                                            width: progressAnim.interpolate({
                                                inputRange: [0, 100],
                                                outputRange: ['0%', '100%']
                                            })
                                        }
                                    ]}
                                />
                            </View>
                            <View style={styles.progressStats}>
                                <CustomText variant="h8" style={styles.progressText}>
                                    {nextTierProgress.ordersNeeded || 0} more orders needed
                                </CustomText>
                                <CustomText variant="h8" style={styles.progressText}>
                                    or ₹{nextTierProgress.spentNeeded || 0} more spend
                                </CustomText>
                            </View>
                        </View>
                    )}

                    {nextTierProgress.isMaxTier && (
                        <View style={styles.maxTierBadge}>
                            <Icon name="trophy" size={24} color={Colors.primary} />
                            <CustomText variant="h6" fontFamily={Fonts.SemiBold}>
                                You've reached the highest tier!
                            </CustomText>
                        </View>
                    )}

                    {/* Benefits Section */}
                    <View style={styles.benefitsSection}>
                        <CustomText variant="h5" fontFamily={Fonts.SemiBold} style={styles.sectionTitle}>
                            Your Benefits
                        </CustomText>
                        {getBenefitsList().map((benefit, index) => (
                            <View key={index} style={styles.benefitItem}>
                                <View style={styles.benefitIcon}>
                                    <Icon name={benefit.icon as any} size={20} color={Colors.secondary} />
                                </View>
                                <CustomText variant="h7" fontFamily={Fonts.Medium}>
                                    {benefit.text}
                                </CustomText>
                            </View>
                        ))}
                    </View>

                    {/* How it Works */}
                    <View style={styles.howItWorks}>
                        <CustomText variant="h5" fontFamily={Fonts.SemiBold} style={styles.sectionTitle}>
                            How It Works
                        </CustomText>
                        <View style={styles.stepItem}>
                            <View style={styles.stepNumber}>
                                <CustomText variant="h7" fontFamily={Fonts.Bold} style={styles.stepNumberText}>1</CustomText>
                            </View>
                            <CustomText variant="h7">Order from any seller to earn points</CustomText>
                        </View>
                        <View style={styles.stepItem}>
                            <View style={styles.stepNumber}>
                                <CustomText variant="h7" fontFamily={Fonts.Bold} style={styles.stepNumberText}>2</CustomText>
                            </View>
                            <CustomText variant="h7">Earn 1 point per ₹1 spent</CustomText>
                        </View>
                        <View style={styles.stepItem}>
                            <View style={styles.stepNumber}>
                                <CustomText variant="h7" fontFamily={Fonts.Bold} style={styles.stepNumberText}>3</CustomText>
                            </View>
                            <CustomText variant="h7">Higher tiers earn bonus multipliers!</CustomText>
                        </View>
                    </View>
                </Animated.View>
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
    tierCard: {
        borderRadius: 20,
        padding: 28,
        alignItems: 'center',
        marginBottom: 20,
    },
    tierBadge: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    tierEmoji: {
        fontSize: 40,
    },
    tierName: {
        color: '#fff',
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    tierSubtext: {
        color: 'rgba(255,255,255,0.9)',
        marginTop: 8,
    },
    pointsCard: {
        backgroundColor: Colors.backgroundSecondary,
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
    },
    pointsMain: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    pointsLabel: {
        color: Colors.disabled,
        letterSpacing: 1,
    },
    pointsValue: {
        color: Colors.secondary,
        fontSize: 40,
    },
    pointsWorth: {
        color: Colors.disabled,
    },
    redeemButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: Colors.secondary,
        borderRadius: 12,
        paddingHorizontal: 20,
        paddingVertical: 14,
    },
    disabledButton: {
        opacity: 0.5,
    },
    redeemText: {
        color: '#fff',
    },
    pointsNote: {
        color: Colors.disabled,
        textAlign: 'center',
        marginTop: 12,
    },
    progressSection: {
        backgroundColor: Colors.backgroundSecondary,
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
    },
    progressBar: {
        height: 8,
        backgroundColor: '#e5e7eb',
        borderRadius: 4,
        marginVertical: 12,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: Colors.secondary,
        borderRadius: 4,
    },
    progressStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    progressText: {
        color: Colors.disabled,
    },
    maxTierBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        backgroundColor: '#fef3c7',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
    },
    benefitsSection: {
        marginBottom: 24,
    },
    sectionTitle: {
        marginBottom: 16,
    },
    benefitItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: Colors.backgroundSecondary,
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
    },
    benefitIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#dcfce7',
        justifyContent: 'center',
        alignItems: 'center',
    },
    howItWorks: {
        marginBottom: 20,
    },
    stepItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
    },
    stepNumber: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    stepNumberText: {
        color: '#fff',
    },
});

export default LoyaltyScreen;
