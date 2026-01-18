import React, { FC, useMemo } from 'react'
import { View, StyleSheet, FlatList, Image, Pressable, Animated } from 'react-native'
import CustomText from '@components/ui/CustomText'
import { Colors, Fonts } from '@utils/Constants'
import UniversalAdd from '@components/ui/UniversalAdd'
import { navigate } from '@utils/NavigationUtils'
import Icon from 'react-native-vector-icons/Ionicons'
import LinearGradient from 'react-native-linear-gradient'

interface TrendingProduct {
    _id?: string
    id?: string
    name: string
    imageUrl?: string
    image?: string
    price: number
    discountPrice?: number
    soldCount?: number
}

interface TrendingSectionProps {
    title?: string
    products: TrendingProduct[]
    onViewAll?: () => void
}

const getProductId = (p: TrendingProduct) => String(p?._id || p?.id || '')

const RankBadge: FC<{ rank: number }> = ({ rank }) => {
    const colors = {
        1: ['#FFD700', '#FFA500'],
        2: ['#C0C0C0', '#A0A0A0'],
        3: ['#CD7F32', '#8B4513'],
    }

    const badgeColors = colors[rank as keyof typeof colors] || ['#666', '#444']

    return (
        <LinearGradient colors={badgeColors} style={styles.rankBadge}>
            <CustomText style={styles.rankText} fontFamily={Fonts.Bold}>
                #{rank}
            </CustomText>
        </LinearGradient>
    )
}

/**
 * Trending/Best Sellers section with fire animations and sold counts.
 */
const TrendingSection: FC<TrendingSectionProps> = ({
    title = '🔥 Trending Now',
    products,
    onViewAll,
}) => {
    const data = useMemo(() => (Array.isArray(products) ? products : []), [products])

    if (data.length === 0) return null

    const renderProduct = ({ item, index }: { item: TrendingProduct; index: number }) => {
        const price = Number(item?.price ?? 0)
        const discountPrice = item?.discountPrice != null ? Number(item.discountPrice) : null
        const hasDiscount = discountPrice != null && discountPrice > 0 && discountPrice < price
        const soldCount = item?.soldCount ?? 0

        return (
            <Pressable
                style={styles.card}
                onPress={() => navigate('ProductOrder', { item })}
            >
                {/* Rank Badge for top 3 */}
                {index < 3 && (
                    <View style={styles.rankContainer}>
                        <RankBadge rank={index + 1} />
                    </View>
                )}

                {/* Product Image */}
                <View style={styles.imageWrap}>
                    <Image
                        source={{ uri: item?.imageUrl || item?.image }}
                        style={styles.image}
                        resizeMode="contain"
                    />
                </View>

                {/* Product Info */}
                <CustomText numberOfLines={2} style={styles.name} fontFamily={Fonts.Medium}>
                    {String(item?.name || 'Product')}
                </CustomText>

                {/* Sold Count */}
                {soldCount > 0 && (
                    <View style={styles.soldRow}>
                        <Icon name="flame" size={12} color="#FF6B35" />
                        <CustomText style={styles.soldText} fontFamily={Fonts.SemiBold}>
                            {soldCount > 1000 ? `${(soldCount / 1000).toFixed(1)}k` : soldCount} sold
                        </CustomText>
                    </View>
                )}

                {/* Price Row */}
                <View style={styles.priceRow}>
                    <CustomText style={styles.price} fontFamily={Fonts.Bold}>
                        ₹{hasDiscount ? discountPrice : price}
                    </CustomText>
                    {hasDiscount && (
                        <CustomText style={styles.mrp} fontFamily={Fonts.Medium}>
                            ₹{price}
                        </CustomText>
                    )}
                </View>

                {/* Add Button */}
                <View style={styles.addWrap}>
                    <UniversalAdd item={item} />
                </View>
            </Pressable>
        )
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <CustomText style={styles.title} fontFamily={Fonts.Bold}>
                        {title}
                    </CustomText>
                    <View style={styles.trendingPill}>
                        <Icon name="trending-up" size={12} color="#00C853" />
                        <CustomText style={styles.trendingText} fontFamily={Fonts.SemiBold}>
                            Hot
                        </CustomText>
                    </View>
                </View>

                {onViewAll && (
                    <Pressable style={styles.seeAllBtn} onPress={onViewAll} hitSlop={10}>
                        <CustomText style={styles.seeAll} fontFamily={Fonts.SemiBold}>
                            See all
                        </CustomText>
                        <Icon name="chevron-forward" size={16} color={Colors.secondary} />
                    </Pressable>
                )}
            </View>

            {/* Products List */}
            <FlatList
                data={data}
                keyExtractor={(item, index) => getProductId(item) || String(index)}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                renderItem={renderProduct}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginTop: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginBottom: 12,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    title: {
        color: Colors.text,
        fontSize: 18,
    },
    trendingPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(0, 200, 83, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    trendingText: {
        color: '#00C853',
        fontSize: 10,
    },
    seeAllBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    seeAll: {
        color: Colors.secondary,
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 8,
    },
    card: {
        width: 160,
        marginRight: 12,
        borderRadius: 16,
        backgroundColor: '#fff',
        padding: 12,
        position: 'relative',
    },
    rankContainer: {
        position: 'absolute',
        top: -4,
        left: -4,
        zIndex: 2,
    },
    rankBadge: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    rankText: {
        color: '#fff',
        fontSize: 11,
    },
    imageWrap: {
        height: 100,
        borderRadius: 12,
        backgroundColor: '#F8F9FA',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    image: {
        width: 80,
        height: 80,
    },
    name: {
        color: Colors.text,
        fontSize: 12,
        lineHeight: 16,
        minHeight: 32,
    },
    soldRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 4,
    },
    soldText: {
        color: '#FF6B35',
        fontSize: 10,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 4,
    },
    price: {
        color: Colors.text,
        fontSize: 14,
    },
    mrp: {
        opacity: 0.5,
        fontSize: 11,
        textDecorationLine: 'line-through',
    },
    addWrap: {
        marginTop: 8,
        alignItems: 'flex-start',
    },
})

export default TrendingSection
