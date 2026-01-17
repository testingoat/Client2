import { View, StyleSheet, FlatList, Image, Pressable } from 'react-native';
import React, { useEffect, useState } from 'react';
import CustomHeader from '@components/ui/CustomHeader';
import CustomText from '@components/ui/CustomText';
import { Fonts, Colors } from '@utils/Constants';
import { useWishlistStore } from '@state/wishlistStore';
import { fetchWishlist, removeFromWishlist } from '@service/wishlistService';
import UniversalAdd from '@components/ui/UniversalAdd';

const WishlistScreen = () => {
    const { items, setItems, hydrated, setHydrated, removeById } = useWishlistStore();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            try {
                setLoading(true);
                const serverItems = await fetchWishlist();
                if (!mounted) return;
                setItems(serverItems);
                setHydrated(true);
            } catch (e) {
                // keep local persisted items if offline
                if (!mounted) return;
                setHydrated(true);
            } finally {
                if (mounted) setLoading(false);
            }
        };
        load();
        return () => { mounted = false; };
    }, []);

    return (
        <View style={styles.container}>
            <CustomHeader title="Your Wishlist" />
            {items.length === 0 ? (
                <View style={styles.content}>
                    <CustomText variant="h5" fontFamily={Fonts.SemiBold}>
                        {loading ? 'Loading...' : 'Your Wishlist is empty'}
                    </CustomText>
                    <CustomText variant="h7" fontFamily={Fonts.Regular} style={styles.subtitle}>
                        Save items you love to buy later!
                    </CustomText>
                </View>
            ) : (
                <FlatList
                    data={items}
                    keyExtractor={(item, index) => String(item?._id || item?.id || index)}
                    numColumns={2}
                    contentContainerStyle={styles.list}
                    columnWrapperStyle={styles.row}
                    renderItem={({ item }) => {
                        const price = Number(item?.price ?? 0);
                        const discountPrice = item?.discountPrice != null ? Number(item.discountPrice) : null;
                        const hasDiscount = discountPrice != null && discountPrice > 0 && discountPrice < price;

                        return (
                            <View style={styles.card}>
                                <Pressable
                                    onPress={async () => {
                                        const id = String(item?._id || item?.id || '')
                                        if (!id) return
                                        await removeFromWishlist(id);
                                        removeById(id);
                                    }}
                                    style={styles.removeBtn}
                                    hitSlop={10}
                                >
                                    <CustomText style={{ color: Colors.secondary }}>Remove</CustomText>
                                </Pressable>

                                <View style={styles.imageWrap}>
                                    <Image
                                        source={typeof item?.imageUrl === 'string' ? { uri: item.imageUrl } : { uri: item?.image }}
                                        style={styles.image}
                                        resizeMode="contain"
                                    />
                                </View>

                                <CustomText numberOfLines={2} style={styles.name} fontFamily={Fonts.Medium}>
                                    {String(item?.name || 'Product')}
                                </CustomText>

                                <CustomText variant="h10" style={styles.qty} fontFamily={Fonts.Medium}>
                                    {String(item?.quantity || '')}
                                </CustomText>

                                <View style={styles.priceRow}>
                                    <CustomText style={styles.price} fontFamily={Fonts.SemiBold}>
                                        ₹{hasDiscount ? discountPrice : price}
                                    </CustomText>
                                    {hasDiscount ? (
                                        <CustomText style={styles.mrp} fontFamily={Fonts.Medium}>
                                            ₹{price}
                                        </CustomText>
                                    ) : null}
                                </View>

                                <View style={styles.addWrap}>
                                    <UniversalAdd item={item} />
                                </View>
                            </View>
                        );
                    }}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    subtitle: {
        marginTop: 10,
        opacity: 0.6,
    },
    list: { paddingHorizontal: 16, paddingBottom: 16, paddingTop: 12 },
    row: { justifyContent: 'space-between' },
    card: {
        width: '48%',
        borderRadius: 16,
        backgroundColor: '#fff',
        padding: 12,
        marginBottom: 12,
    },
    imageWrap: {
        height: 120,
        borderRadius: 14,
        backgroundColor: '#FFF5F2',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        marginBottom: 10,
    },
    image: { width: 110, height: 110 },
    name: { color: Colors.text, fontSize: 12, lineHeight: 16, minHeight: 32 },
    qty: { opacity: 0.6, marginTop: 4, marginBottom: 8 },
    priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    price: { color: Colors.text },
    mrp: { opacity: 0.5, textDecorationLine: 'line-through' },
    addWrap: { marginTop: 10, alignItems: 'flex-start' },
    removeBtn: { alignSelf: 'flex-end' },
});

export default WishlistScreen;
