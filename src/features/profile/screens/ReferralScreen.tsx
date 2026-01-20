import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    RefreshControl,
    ActivityIndicator,
    Share,
    Alert,
    Animated,
    Clipboard,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import CustomHeader from '@components/ui/CustomHeader';
import CustomText from '@components/ui/CustomText';
import ScalePress from '@components/ui/ScalePress';
import { Colors, Fonts } from '@utils/Constants';
import { getMyReferralCode, getReferralHistory } from '@service/promotionService';

interface ReferralStats {
    pending: number;
    completed: number;
    expired: number;
    totalEarned: number;
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

const ReferralScreen = () => {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [referralCode, setReferralCode] = useState('');
    const [shareMessage, setShareMessage] = useState('');
    const [stats, setStats] = useState<ReferralStats>({
        pending: 0,
        completed: 0,
        expired: 0,
        totalEarned: 0
    });
    const [history, setHistory] = useState<ReferralHistoryItem[]>([]);
    const fadeAnim = useState(new Animated.Value(0))[0];

    const fetchData = useCallback(async () => {
        try {
            const [codeData, historyData] = await Promise.all([
                getMyReferralCode(),
                getReferralHistory(1, 10)
            ]);

            setReferralCode(codeData.code);
            setShareMessage(codeData.shareMessage);
            setStats(codeData.stats);
            setHistory(historyData?.referrals || []);

            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }).start();
        } catch (error) {
            console.log('Error fetching referral data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [fadeAnim]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchData();
    }, [fetchData]);

    const handleCopyCode = () => {
        Clipboard.setString(referralCode);
        Alert.alert('Copied!', 'Referral code copied to clipboard');
    };

    const handleShare = async () => {
        try {
            await Share.share({
                message: shareMessage,
            });
        } catch (error) {
            console.log('Share error:', error);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return '#f59e0b';
            case 'completed': return '#10b981';
            case 'expired': return '#ef4444';
            default: return Colors.disabled;
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending': return 'time';
            case 'completed': return 'checkmark-circle';
            case 'expired': return 'close-circle';
            default: return 'help-circle';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <CustomHeader title="Refer & Earn" />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <CustomHeader title="Refer & Earn" />
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                <Animated.View style={{ opacity: fadeAnim }}>
                    {/* Hero Section */}
                    <LinearGradient
                        colors={[Colors.primary, '#f59e0b', Colors.primary]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.heroCard}
                    >
                        <Icon name="people" size={48} color="#fff" />
                        <CustomText variant="h4" fontFamily={Fonts.Bold} style={styles.heroTitle}>
                            Invite Friends & Earn
                        </CustomText>
                        <CustomText variant="h7" style={styles.heroSubtitle}>
                            Get ₹100 when your friend places their first order. They get ₹50 too!
                        </CustomText>
                    </LinearGradient>

                    {/* Code Card */}
                    <View style={styles.codeCard}>
                        <CustomText variant="h7" style={styles.codeLabel}>
                            YOUR REFERRAL CODE
                        </CustomText>
                        <View style={styles.codeContainer}>
                            <CustomText variant="h2" fontFamily={Fonts.Bold} style={styles.codeText}>
                                {referralCode}
                            </CustomText>
                        </View>
                        <View style={styles.buttonRow}>
                            <ScalePress style={styles.copyButton} onPress={handleCopyCode}>
                                <Icon name="copy-outline" size={20} color={Colors.secondary} />
                                <CustomText variant="h7" fontFamily={Fonts.Medium} style={styles.copyButtonText}>
                                    Copy
                                </CustomText>
                            </ScalePress>
                            <ScalePress style={styles.shareButton} onPress={handleShare}>
                                <Icon name="share-social" size={20} color="#fff" />
                                <CustomText variant="h7" fontFamily={Fonts.SemiBold} style={styles.shareButtonText}>
                                    Share
                                </CustomText>
                            </ScalePress>
                        </View>
                    </View>

                    {/* Stats Section */}
                    <View style={styles.statsContainer}>
                        <View style={styles.statCard}>
                            <CustomText variant="h3" fontFamily={Fonts.Bold} style={styles.statNumber}>
                                ₹{stats.totalEarned}
                            </CustomText>
                            <CustomText variant="h8" style={styles.statLabel}>
                                Total Earned
                            </CustomText>
                        </View>
                        <View style={styles.statCard}>
                            <CustomText variant="h3" fontFamily={Fonts.Bold} style={styles.statNumber}>
                                {stats.completed}
                            </CustomText>
                            <CustomText variant="h8" style={styles.statLabel}>
                                Successful
                            </CustomText>
                        </View>
                        <View style={styles.statCard}>
                            <CustomText variant="h3" fontFamily={Fonts.Bold} style={styles.statNumber}>
                                {stats.pending}
                            </CustomText>
                            <CustomText variant="h8" style={styles.statLabel}>
                                Pending
                            </CustomText>
                        </View>
                    </View>

                    {/* History Section */}
                    <View style={styles.historySection}>
                        <CustomText variant="h5" fontFamily={Fonts.SemiBold} style={styles.sectionTitle}>
                            Referral History
                        </CustomText>

                        {history.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Icon name="people-outline" size={48} color={Colors.disabled} />
                                <CustomText variant="h7" style={styles.emptyText}>
                                    No referrals yet. Share your code!
                                </CustomText>
                            </View>
                        ) : (
                            history.map((item) => (
                                <View key={item.id} style={styles.historyItem}>
                                    <View style={[styles.statusIcon, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                                        <Icon
                                            name={getStatusIcon(item.status)}
                                            size={20}
                                            color={getStatusColor(item.status)}
                                        />
                                    </View>
                                    <View style={styles.historyDetails}>
                                        <CustomText variant="h7" fontFamily={Fonts.Medium}>
                                            {item.refereeName}
                                        </CustomText>
                                        <CustomText variant="h8" style={styles.historyDate}>
                                            {formatDate(item.createdAt)}
                                        </CustomText>
                                    </View>
                                    <View style={styles.historyReward}>
                                        {item.rewarded ? (
                                            <CustomText variant="h7" fontFamily={Fonts.SemiBold} style={styles.rewardEarned}>
                                                +₹{item.reward}
                                            </CustomText>
                                        ) : (
                                            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                                                <CustomText variant="h8" style={{ color: getStatusColor(item.status) }}>
                                                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                                                </CustomText>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            ))
                        )}
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
    heroCard: {
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        marginBottom: 20,
    },
    heroTitle: {
        color: '#fff',
        marginTop: 12,
        textAlign: 'center',
    },
    heroSubtitle: {
        color: 'rgba(255,255,255,0.9)',
        marginTop: 8,
        textAlign: 'center',
    },
    codeCard: {
        backgroundColor: Colors.backgroundSecondary,
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        marginBottom: 20,
    },
    codeLabel: {
        color: Colors.disabled,
        letterSpacing: 1,
        marginBottom: 12,
    },
    codeContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderWidth: 2,
        borderColor: Colors.secondary,
        borderStyle: 'dashed',
        marginBottom: 16,
    },
    codeText: {
        color: Colors.secondary,
        letterSpacing: 3,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 16,
    },
    copyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#fff',
        borderRadius: 10,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: Colors.secondary,
    },
    copyButtonText: {
        color: Colors.secondary,
    },
    shareButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: Colors.secondary,
        borderRadius: 10,
        paddingHorizontal: 24,
        paddingVertical: 12,
    },
    shareButtonText: {
        color: '#fff',
    },
    statsContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    statCard: {
        flex: 1,
        backgroundColor: Colors.backgroundSecondary,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    statNumber: {
        color: Colors.secondary,
    },
    statLabel: {
        color: Colors.disabled,
        marginTop: 4,
    },
    historySection: {
        marginTop: 8,
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
        textAlign: 'center',
    },
    historyItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.backgroundSecondary,
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
    },
    statusIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    historyDetails: {
        flex: 1,
        marginLeft: 12,
    },
    historyDate: {
        color: Colors.disabled,
        marginTop: 2,
    },
    historyReward: {
        alignItems: 'flex-end',
    },
    rewardEarned: {
        color: '#10b981',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
});

export default ReferralScreen;
