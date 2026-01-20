import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import CustomHeader from '@components/ui/CustomHeader';
import CustomText from '@components/ui/CustomText';
import ScalePress from '@components/ui/ScalePress';
import { Colors, Fonts } from '@utils/Constants';
import { getWalletBalance, getWalletTransactions, getExpiringCredits } from '@service/promotionService';

interface Transaction {
    _id: string;
    type: 'credit' | 'debit';
    amount: number;
    source: string;
    description: string;
    expiresAt?: string;
    createdAt: string;
}

const WalletScreen = () => {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(false);
    const [balance, setBalance] = useState({
        balance: 0,
        availableBalance: 0,
        expiringBalance: 0,
        totalEarned: 0,
        totalSpent: 0,
        isFrozen: false
    });
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [expiringAmount, setExpiringAmount] = useState(0);

    const fetchData = useCallback(async () => {
        setError(false);
        try {
            const [walletData, txData, expiringData] = await Promise.all([
                getWalletBalance(),
                getWalletTransactions(1, 10),
                getExpiringCredits(7)
            ]);
            if (walletData) setBalance(walletData);
            setTransactions(txData?.transactions || []);
            setExpiringAmount(expiringData?.totalExpiring || 0);
        } catch (err) {
            console.log('Error fetching wallet data:', err);
            setError(true);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchData();
    }, [fetchData]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getSourceIcon = (source: string) => {
        const icons: { [key: string]: string } = {
            cashback: 'gift',
            referral: 'people',
            refund: 'refresh',
            promo: 'pricetag',
            order_payment: 'cart',
            expired: 'time'
        };
        return icons[source] || 'wallet';
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <CustomHeader title="My Wallet" />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <CustomHeader title="My Wallet" />
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Balance Card */}
                <View style={styles.balanceCard}>
                    <View style={styles.balanceHeader}>
                        <Icon name="wallet" size={24} color="#fff" />
                        <CustomText variant="h7" style={styles.balanceLabel}>
                            Available Balance
                        </CustomText>
                    </View>
                    <CustomText variant="h1" fontFamily={Fonts.Bold} style={styles.balanceAmount}>
                        ₹{balance.availableBalance.toFixed(2)}
                    </CustomText>

                    {balance.isFrozen && (
                        <View style={styles.frozenBadge}>
                            <Icon name="lock-closed" size={14} color="#fff" />
                            <CustomText variant="h8" style={styles.frozenText}>
                                Wallet Frozen
                            </CustomText>
                        </View>
                    )}

                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <CustomText variant="h8" style={styles.statLabel}>
                                Total Earned
                            </CustomText>
                            <CustomText variant="h6" fontFamily={Fonts.SemiBold} style={styles.statValue}>
                                ₹{balance.totalEarned.toFixed(0)}
                            </CustomText>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <CustomText variant="h8" style={styles.statLabel}>
                                Total Spent
                            </CustomText>
                            <CustomText variant="h6" fontFamily={Fonts.SemiBold} style={styles.statValue}>
                                ₹{balance.totalSpent.toFixed(0)}
                            </CustomText>
                        </View>
                    </View>
                </View>

                {/* Error Message */}
                {error && (
                    <View style={styles.errorCard}>
                        <Icon name="cloud-offline-outline" size={20} color="#dc2626" />
                        <CustomText variant="h8" style={styles.errorText}>
                            Could not load latest data. Pull to refresh.
                        </CustomText>
                    </View>
                )}

                {/* Expiring Soon Warning */}
                {expiringAmount > 0 && (
                    <ScalePress style={styles.expiringCard}>
                        <View style={styles.expiringContent}>
                            <Icon name="time-outline" size={24} color="#f59e0b" />
                            <View style={styles.expiringText}>
                                <CustomText variant="h7" fontFamily={Fonts.SemiBold}>
                                    ₹{expiringAmount} expiring soon!
                                </CustomText>
                                <CustomText variant="h8" style={styles.expiringSubtext}>
                                    Use within 7 days to avoid losing credits
                                </CustomText>
                            </View>
                        </View>
                    </ScalePress>
                )}

                {/* Transactions Section */}
                <View style={styles.transactionsSection}>
                    <CustomText variant="h5" fontFamily={Fonts.SemiBold} style={styles.sectionTitle}>
                        Recent Transactions
                    </CustomText>

                    {transactions.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Icon name="receipt-outline" size={48} color={Colors.disabled} />
                            <CustomText variant="h7" style={styles.emptyText}>
                                No transactions yet
                            </CustomText>
                            <CustomText variant="h8" style={styles.emptySubtext}>
                                Your wallet activity will appear here
                            </CustomText>
                        </View>
                    ) : (
                        transactions.map((tx) => (
                            <ScalePress key={tx._id} style={styles.transactionItem}>
                                <View style={[
                                    styles.txIconContainer,
                                    { backgroundColor: tx.type === 'credit' ? '#dcfce7' : '#fee2e2' }
                                ]}>
                                    <Icon
                                        name={getSourceIcon(tx.source)}
                                        size={20}
                                        color={tx.type === 'credit' ? '#16a34a' : '#dc2626'}
                                    />
                                </View>
                                <View style={styles.txDetails}>
                                    <CustomText variant="h7" fontFamily={Fonts.Medium}>
                                        {tx.description}
                                    </CustomText>
                                    <CustomText variant="h8" style={styles.txDate}>
                                        {formatDate(tx.createdAt)}
                                    </CustomText>
                                </View>
                                <CustomText
                                    variant="h6"
                                    fontFamily={Fonts.SemiBold}
                                    style={tx.type === 'credit' ? styles.creditAmount : styles.debitAmount}
                                >
                                    {tx.type === 'credit' ? '+' : '-'}₹{tx.amount}
                                </CustomText>
                            </ScalePress>
                        ))
                    )}
                </View>
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
    balanceCard: {
        borderRadius: 20,
        padding: 24,
        marginBottom: 16,
        backgroundColor: '#0d8320',
    },
    balanceHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    balanceLabel: {
        color: 'rgba(255,255,255,0.8)',
    },
    balanceAmount: {
        color: '#fff',
        fontSize: 42,
        marginBottom: 16,
    },
    frozenBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(255,0,0,0.3)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        alignSelf: 'flex-start',
        marginBottom: 16,
    },
    frozenText: {
        color: '#fff',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.2)',
    },
    statItem: {
        alignItems: 'center',
    },
    statLabel: {
        color: 'rgba(255,255,255,0.7)',
        marginBottom: 4,
    },
    statValue: {
        color: '#fff',
    },
    statDivider: {
        width: 1,
        backgroundColor: 'rgba(255,255,255,0.2)',
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
    expiringCard: {
        backgroundColor: '#fef3c7',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#fcd34d',
    },
    expiringContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    expiringText: {
        flex: 1,
    },
    expiringSubtext: {
        color: '#92400e',
        marginTop: 2,
    },
    transactionsSection: {
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
    },
    emptySubtext: {
        color: Colors.disabled,
        marginTop: 4,
    },
    transactionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.backgroundSecondary,
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
    },
    txIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    txDetails: {
        flex: 1,
        marginLeft: 12,
    },
    txDate: {
        color: Colors.disabled,
        marginTop: 2,
    },
    creditAmount: {
        color: '#16a34a',
    },
    debitAmount: {
        color: '#dc2626',
    },
});

export default WalletScreen;
