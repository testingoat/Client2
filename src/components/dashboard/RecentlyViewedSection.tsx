import React, { FC, useMemo } from 'react'
import { View, StyleSheet, FlatList, Image, Pressable } from 'react-native'
import CustomText from '@components/ui/CustomText'
import { Colors, Fonts } from '@utils/Constants'
import { navigate } from '@utils/NavigationUtils'
import Icon from 'react-native-vector-icons/Ionicons'
import { useRecentlyViewedStore, RecentlyViewedProduct } from '@state/recentlyViewedStore'

interface RecentlyViewedSectionProps {
    maxItems?: number
    onViewAll?: () => void
}

const getProductId = (p: RecentlyViewedProduct) => String(p?._id || p?.id || '')

/**
 * Recently Viewed products carousel.
 * Automatically pulls data from the recentlyViewedStore.
 */
const RecentlyViewedSection: FC<RecentlyViewedSectionProps> = ({
    maxItems = 10,
    onViewAll,
}) => {
    const items = useRecentlyViewedStore((s) => s.items)

    const data = useMemo(() => {
        const safeItems = Array.isArray(items) ? items : []
        return safeItems.slice(0, maxItems)
    }, [items, maxItems])

    if (data.length === 0) return null

    const renderProduct = ({ item }: { item: RecentlyViewedProduct }) => {
        const price = Number(item?.price ?? 0)
        const discountPrice = item?.discountPrice != null ? Number(item.discountPrice) : null
        const hasDiscount = discountPrice != null && discountPrice > 0 && discountPrice < price

        return (
            <Pressable
                style={styles.card}
                onPress={() => navigate('ProductOrder', { item })}
            >
                {/* Product Image */}
                <View style={styles.imageWrap}>
                    <Image
                        source={{ uri: item?.imageUrl || item?.image }}
                        style={styles.image}
                        resizeMode="contain"
                    />
                </View>

                {/* Product Info */}
                <CustomText numberOfLines={1} style={styles.name} fontFamily={Fonts.Medium}>
                    {String(item?.name || 'Product')}
                </CustomText>

                {/* Price */}
                <CustomText style={styles.price} fontFamily={Fonts.SemiBold}>
                    ₹{hasDiscount ? discountPrice : price}
                </CustomText>
            </Pressable>
        )
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Icon name="time-outline" size={18} color={Colors.text} />
                    <CustomText style={styles.title} fontFamily={Fonts.SemiBold}>
                        Recently Viewed
                    </CustomText>
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
        marginBottom: 8,
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
        gap: 8,
    },
    title: {
        color: Colors.text,
        fontSize: 16,
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
    },
    card: {
        width: 110,
        marginRight: 10,
        borderRadius: 12,
        backgroundColor: '#fff',
        padding: 8,
    },
    imageWrap: {
        height: 70,
        borderRadius: 8,
        backgroundColor: '#F8F9FA',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 6,
    },
    image: {
        width: 55,
        height: 55,
    },
    name: {
        color: Colors.text,
        fontSize: 10,
        lineHeight: 14,
    },
    price: {
        color: Colors.text,
        fontSize: 11,
        marginTop: 2,
    },
})

export default RecentlyViewedSection
