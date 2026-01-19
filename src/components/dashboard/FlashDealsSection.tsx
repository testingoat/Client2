import React, { FC, useMemo } from 'react'
import { View, StyleSheet, FlatList, Image, Pressable } from 'react-native'
import CustomText from '@components/ui/CustomText'
import { Colors, Fonts } from '@utils/Constants'
import CountdownTimer from '@components/ui/CountdownTimer'
import AnimatedBadge from '@components/ui/AnimatedBadge'
import UniversalAdd from '@components/ui/UniversalAdd'
import { navigate } from '@utils/NavigationUtils'
import Icon from 'react-native-vector-icons/Ionicons'
import LinearGradient from 'react-native-linear-gradient'

interface FlashDealProduct {
    _id?: string
    id?: string
    name: string
    imageUrl?: string
    image?: string
    price: number
    discountPrice?: number
    stockLeft?: number
    totalStock?: number
}

interface FlashDealsSectionProps {
    title?: string
    endTime: number // timestamp in milliseconds
    products: FlashDealProduct[]
    onViewAll?: () => void
}

const getProductId = (p: FlashDealProduct) => String(p?._id || p?.id || '')

/**
 * Flash Deals section with countdown timer and urgency-inducing design.
 */
const FlashDealsSection: FC<FlashDealsSectionProps> = ({
    title = '⚡ Flash Deals',
    endTime,
    products,
    onViewAll,
}) => {
    const data = useMemo(() => (Array.isArray(products) ? products : []), [products])

    if (data.length === 0) return null

    const renderProduct = ({ item, index }: { item: FlashDealProduct; index: number }) => {
        const price = Number(item?.price ?? 0)
        const discountPrice = item?.discountPrice != null ? Number(item.discountPrice) : null
        const hasDiscount = discountPrice != null && discountPrice > 0 && discountPrice < price
        const discountPercent = hasDiscount
            ? Math.round(((price - (discountPrice as number)) / price) * 100)
            : 0

        const stockLeft = item?.stockLeft ?? 0
        const totalStock = item?.totalStock ?? 100
        const stockPercent = Math.min(100, Math.max(0, (stockLeft / totalStock) * 100))
        const isLowStock = stockPercent < 30

        return (
            <Pressable
                style={styles.card}
                onPress={() => navigate('ProductOrder', { item })}
            >
                {/* Discount Badge */}
                {hasDiscount && (
                    <View style={styles.badgeContainer}>
                        <AnimatedBadge text={`${discountPercent}% OFF`} variant="discount" />
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

                {/* Stock Progress Bar */}
                <View style={styles.stockContainer}>
                    <View style={styles.stockBar}>
                        <View
                            style={[
                                styles.stockFill,
                                {
                                    width: `${stockPercent}%`,
                                    backgroundColor: isLowStock ? '#FF5A5A' : '#00C853',
                                },
                            ]}
                        />
                    </View>
                    <CustomText style={styles.stockText} fontFamily={Fonts.Medium}>
                        {isLowStock ? '🔥 Selling fast!' : `${stockLeft} left`}
                    </CustomText>
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
            {/* Header with Gradient */}
            <LinearGradient
                colors={['#FF6B35', '#FF5A5A']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.header}
            >
                <View style={styles.headerLeft}>
                    <Icon name="flash" size={20} color="#fff" />
                    <CustomText
                        style={styles.title}
                        fontFamily={Fonts.Bold}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                    >
                        {title}
                    </CustomText>
                </View>

                <View style={styles.headerRight}>
                    <CustomText style={styles.endsIn} fontFamily={Fonts.Medium} numberOfLines={1}>
                        Ends in
                    </CustomText>
                    <CountdownTimer endTime={endTime} showLabels={false} compact />
                </View>
            </LinearGradient>

            {/* Products List */}
            <FlatList
                data={data}
                keyExtractor={(item, index) => getProductId(item) || String(index)}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                renderItem={renderProduct}
            />

            {/* View All Button */}
            {onViewAll && (
                <Pressable style={styles.viewAllBtn} onPress={onViewAll}>
                    <CustomText style={styles.viewAllText} fontFamily={Fonts.SemiBold}>
                        View All Deals
                    </CustomText>
                    <Icon name="chevron-forward" size={16} color={Colors.secondary} />
                </Pressable>
            )}
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
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        marginHorizontal: 0,
        marginBottom: 12,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flex: 1,
        minWidth: 0,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        flexShrink: 0,
    },
    title: {
        color: '#fff',
        fontSize: 16,
        flexShrink: 1,
    },
    endsIn: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 11,
        flexShrink: 0,
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
        borderWidth: 1,
        borderColor: 'rgba(255, 107, 53, 0.15)',
    },
    badgeContainer: {
        position: 'absolute',
        top: 8,
        left: 8,
        zIndex: 2,
    },
    imageWrap: {
        height: 100,
        borderRadius: 12,
        backgroundColor: '#FFF5F2',
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
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 4,
    },
    price: {
        color: '#FF5A5A',
        fontSize: 14,
    },
    mrp: {
        opacity: 0.5,
        fontSize: 11,
        textDecorationLine: 'line-through',
    },
    stockContainer: {
        marginTop: 8,
    },
    stockBar: {
        height: 4,
        backgroundColor: '#f0f0f0',
        borderRadius: 2,
        overflow: 'hidden',
    },
    stockFill: {
        height: '100%',
        borderRadius: 2,
    },
    stockText: {
        fontSize: 9,
        color: '#666',
        marginTop: 4,
    },
    addWrap: {
        marginTop: 8,
        alignItems: 'flex-start',
    },
    viewAllBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        gap: 4,
    },
    viewAllText: {
        color: Colors.secondary,
        fontSize: 13,
    },
})

export default FlashDealsSection
