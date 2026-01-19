import React, { FC, useEffect, useState, useCallback } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Dimensions,
    Image,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { RFValue } from 'react-native-responsive-fontsize';

import CustomHeader from '@components/ui/CustomHeader';
import CustomText from '@components/ui/CustomText';
import ImageGallery from '@components/product/ImageGallery';
import UniversalAdd from '@components/ui/UniversalAdd';
import { Colors, Fonts } from '@utils/Constants';
import { getProductById, getRelatedProducts, ProductDetail, RelatedProduct } from '@service/productService';
import { useCartStore } from '@state/cartStore';
import { useRecentlyViewedStore } from '@state/recentlyViewedStore';
import { navigate, goBack } from '@utils/NavigationUtils';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type ProductDetailRouteProp = RouteProp<{ ProductDetailScreen: { productId: string } }, 'ProductDetailScreen'>;

const ProductDetailScreen: FC = () => {
    const route = useRoute<ProductDetailRouteProp>();
    const { productId } = route.params;

    const [product, setProduct] = useState<ProductDetail | null>(null);
    const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { addItem } = useCartStore();
    const { addItem: addRecentlyViewed } = useRecentlyViewedStore();

    const fetchProductDetails = useCallback(async () => {
        try {
            setError(null);
            const data = await getProductById(productId);
            if (data) {
                setProduct(data);
                // Add to recently viewed
                addRecentlyViewed({
                    _id: data._id,
                    name: data.name,
                    image: data.image,
                    price: data.price,
                    discountPrice: data.discountPrice,
                });
                // Fetch related products
                const related = await getRelatedProducts(productId, 6);
                setRelatedProducts(related);
            } else {
                setError('Product not found');
            }
        } catch (err) {
            setError('Failed to load product details');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [productId, addRecentlyViewed]);

    useEffect(() => {
        fetchProductDetails();
    }, [fetchProductDetails]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchProductDetails();
        setRefreshing(false);
    };

    const handleAddToCart = () => {
        if (product) {
            addItem({
                _id: product._id,
                name: product.name,
                image: product.image,
                price: product.price,
                discountPrice: product.discountPrice,
                quantity: product.quantity,
            });
        }
    };

    const navigateToRelatedProduct = (relatedProductId: string) => {
        navigate('ProductDetailScreen', { productId: relatedProductId });
    };

    const calculateDiscount = () => {
        if (product?.discountPrice && product.price > product.discountPrice) {
            return Math.round(((product.price - product.discountPrice) / product.price) * 100);
        }
        return 0;
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.secondary} />
                <CustomText variant="h7" style={styles.loadingText}>
                    Loading product details...
                </CustomText>
            </View>
        );
    }

    if (error || !product) {
        return (
            <View style={styles.errorContainer}>
                <CustomHeader title="Product" />
                <View style={styles.errorContent}>
                    <Icon name="alert-circle-outline" size={RFValue(48)} color={Colors.text} />
                    <CustomText variant="h6" style={styles.errorText}>
                        {error || 'Product not found'}
                    </CustomText>
                    <TouchableOpacity style={styles.retryButton} onPress={fetchProductDetails}>
                        <CustomText variant="h7" style={styles.retryText}>Try Again</CustomText>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    const discount = calculateDiscount();
    const displayPrice = product.discountPrice || product.price;

    return (
        <View style={styles.container}>
            <CustomHeader title={product.category?.name || 'Product'} />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        tintColor={Colors.secondary}
                    />
                }
            >
                {/* Image Gallery */}
                <ImageGallery images={product.allImages || [product.image]} />

                {/* Product Info Card */}
                <View style={styles.infoCard}>
                    {/* Brand */}
                    {product.brand && (
                        <CustomText variant="h9" style={styles.brand}>
                            {product.brand}
                        </CustomText>
                    )}

                    {/* Product Name */}
                    <CustomText variant="h5" fontFamily={Fonts.SemiBold} style={styles.productName}>
                        {product.name}
                    </CustomText>

                    {/* Quantity */}
                    <CustomText variant="h8" style={styles.quantity}>
                        {product.quantity}
                    </CustomText>

                    {/* Price Section */}
                    <View style={styles.priceSection}>
                        <View style={styles.priceContainer}>
                            <CustomText variant="h4" fontFamily={Fonts.Bold} style={styles.price}>
                                ₹{displayPrice}
                            </CustomText>
                            {discount > 0 && (
                                <>
                                    <CustomText variant="h7" style={styles.originalPrice}>
                                        ₹{product.price}
                                    </CustomText>
                                    <View style={styles.discountBadge}>
                                        <CustomText variant="h9" style={styles.discountText}>
                                            {discount}% OFF
                                        </CustomText>
                                    </View>
                                </>
                            )}
                        </View>

                        {/* Add to Cart Button */}
                        <View style={styles.addButtonContainer}>
                            <UniversalAdd item={product} />
                        </View>
                    </View>

                    {/* Stock Status */}
                    {product.stock !== undefined && (
                        <View style={[
                            styles.stockBadge,
                            product.stock > 0 ? styles.inStock : styles.outOfStock
                        ]}>
                            <Icon
                                name={product.stock > 0 ? 'check-circle' : 'alert-circle'}
                                size={RFValue(12)}
                                color={product.stock > 0 ? '#27ae60' : '#e74c3c'}
                            />
                            <CustomText variant="h9" style={[
                                styles.stockText,
                                { color: product.stock > 0 ? '#27ae60' : '#e74c3c' }
                            ]}>
                                {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                            </CustomText>
                        </View>
                    )}
                </View>

                {/* Description Section */}
                {product.description && (
                    <View style={styles.section}>
                        <CustomText variant="h6" fontFamily={Fonts.SemiBold} style={styles.sectionTitle}>
                            Description
                        </CustomText>
                        <CustomText variant="h8" style={styles.description}>
                            {product.description}
                        </CustomText>
                    </View>
                )}

                {/* Highlights Section */}
                {product.highlights && product.highlights.length > 0 && (
                    <View style={styles.section}>
                        <CustomText variant="h6" fontFamily={Fonts.SemiBold} style={styles.sectionTitle}>
                            Highlights
                        </CustomText>
                        <View style={styles.highlightsList}>
                            {product.highlights.map((highlight, index) => (
                                <View key={index} style={styles.highlightItem}>
                                    <Icon name="check-circle" size={RFValue(14)} color={Colors.secondary} />
                                    <CustomText variant="h8" style={styles.highlightText}>
                                        {highlight}
                                    </CustomText>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Specifications Section */}
                {product.specifications && product.specifications.length > 0 && (
                    <View style={styles.section}>
                        <CustomText variant="h6" fontFamily={Fonts.SemiBold} style={styles.sectionTitle}>
                            Specifications
                        </CustomText>
                        <View style={styles.specsList}>
                            {product.specifications.map((spec, index) => (
                                <View key={index} style={styles.specRow}>
                                    <CustomText variant="h8" style={styles.specKey}>
                                        {spec.key}
                                    </CustomText>
                                    <CustomText variant="h8" fontFamily={Fonts.Medium} style={styles.specValue}>
                                        {spec.value}
                                    </CustomText>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Nutritional Info Section */}
                {product.nutritionalInfo && Object.values(product.nutritionalInfo).some(v => v) && (
                    <View style={styles.section}>
                        <CustomText variant="h6" fontFamily={Fonts.SemiBold} style={styles.sectionTitle}>
                            Nutritional Information
                        </CustomText>
                        <View style={styles.nutritionGrid}>
                            {product.nutritionalInfo.servingSize && (
                                <View style={styles.nutritionItem}>
                                    <CustomText variant="h9" style={styles.nutritionLabel}>Serving Size</CustomText>
                                    <CustomText variant="h7" fontFamily={Fonts.Medium}>{product.nutritionalInfo.servingSize}</CustomText>
                                </View>
                            )}
                            {product.nutritionalInfo.calories && (
                                <View style={styles.nutritionItem}>
                                    <CustomText variant="h9" style={styles.nutritionLabel}>Calories</CustomText>
                                    <CustomText variant="h7" fontFamily={Fonts.Medium}>{product.nutritionalInfo.calories}</CustomText>
                                </View>
                            )}
                            {product.nutritionalInfo.protein && (
                                <View style={styles.nutritionItem}>
                                    <CustomText variant="h9" style={styles.nutritionLabel}>Protein</CustomText>
                                    <CustomText variant="h7" fontFamily={Fonts.Medium}>{product.nutritionalInfo.protein}</CustomText>
                                </View>
                            )}
                            {product.nutritionalInfo.carbs && (
                                <View style={styles.nutritionItem}>
                                    <CustomText variant="h9" style={styles.nutritionLabel}>Carbs</CustomText>
                                    <CustomText variant="h7" fontFamily={Fonts.Medium}>{product.nutritionalInfo.carbs}</CustomText>
                                </View>
                            )}
                            {product.nutritionalInfo.fat && (
                                <View style={styles.nutritionItem}>
                                    <CustomText variant="h9" style={styles.nutritionLabel}>Fat</CustomText>
                                    <CustomText variant="h7" fontFamily={Fonts.Medium}>{product.nutritionalInfo.fat}</CustomText>
                                </View>
                            )}
                            {product.nutritionalInfo.fiber && (
                                <View style={styles.nutritionItem}>
                                    <CustomText variant="h9" style={styles.nutritionLabel}>Fiber</CustomText>
                                    <CustomText variant="h7" fontFamily={Fonts.Medium}>{product.nutritionalInfo.fiber}</CustomText>
                                </View>
                            )}
                        </View>
                    </View>
                )}

                {/* Warnings Section */}
                {product.warnings && (
                    <View style={styles.section}>
                        <View style={styles.warningHeader}>
                            <Icon name="alert-outline" size={RFValue(16)} color="#e67e22" />
                            <CustomText variant="h6" fontFamily={Fonts.SemiBold} style={[styles.sectionTitle, { marginLeft: 8, marginBottom: 0 }]}>
                                Warnings
                            </CustomText>
                        </View>
                        <View style={styles.warningBox}>
                            <CustomText variant="h8" style={styles.warningText}>
                                {product.warnings}
                            </CustomText>
                        </View>
                    </View>
                )}

                {/* Storage Instructions Section */}
                {product.storageInstructions && (
                    <View style={styles.section}>
                        <View style={styles.storageHeader}>
                            <Icon name="fridge-outline" size={RFValue(16)} color={Colors.secondary} />
                            <CustomText variant="h6" fontFamily={Fonts.SemiBold} style={[styles.sectionTitle, { marginLeft: 8, marginBottom: 0 }]}>
                                Storage Instructions
                            </CustomText>
                        </View>
                        <CustomText variant="h8" style={styles.storageText}>
                            {product.storageInstructions}
                        </CustomText>
                    </View>
                )}

                {/* Seller Info */}
                {product.seller?.storeName && (
                    <View style={styles.section}>
                        <CustomText variant="h6" fontFamily={Fonts.SemiBold} style={styles.sectionTitle}>
                            Sold By
                        </CustomText>
                        <View style={styles.sellerInfo}>
                            <Icon name="store" size={RFValue(18)} color={Colors.secondary} />
                            <CustomText variant="h7" fontFamily={Fonts.Medium} style={styles.sellerName}>
                                {product.seller.storeName}
                            </CustomText>
                        </View>
                    </View>
                )}

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <View style={styles.relatedSection}>
                        <CustomText variant="h6" fontFamily={Fonts.SemiBold} style={styles.sectionTitle}>
                            You May Also Like
                        </CustomText>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.relatedList}
                        >
                            {relatedProducts.map((relatedProduct) => (
                                <TouchableOpacity
                                    key={relatedProduct._id}
                                    style={styles.relatedCard}
                                    onPress={() => navigateToRelatedProduct(relatedProduct._id)}
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.relatedImageContainer}>
                                        <Image
                                            source={{ uri: relatedProduct.image }}
                                            style={styles.relatedImage}
                                            resizeMode="cover"
                                        />
                                    </View>
                                    <CustomText variant="h9" numberOfLines={2} style={styles.relatedName}>
                                        {relatedProduct.name}
                                    </CustomText>
                                    <CustomText variant="h9" style={styles.relatedQuantity}>
                                        {relatedProduct.quantity}
                                    </CustomText>
                                    <CustomText variant="h8" fontFamily={Fonts.Medium} style={styles.relatedPrice}>
                                        ₹{relatedProduct.discountPrice || relatedProduct.price}
                                    </CustomText>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}

                {/* Bottom Spacer */}
                <View style={styles.bottomSpacer} />
            </ScrollView>
        </View>
    );
};



const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    loadingText: {
        marginTop: 12,
        color: Colors.text,
        opacity: 0.7,
    },
    errorContainer: {
        flex: 1,
        backgroundColor: '#fff',
    },
    errorContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        marginTop: 12,
        textAlign: 'center',
        color: Colors.text,
        opacity: 0.7,
    },
    retryButton: {
        marginTop: 16,
        paddingHorizontal: 24,
        paddingVertical: 12,
        backgroundColor: Colors.secondary,
        borderRadius: 8,
    },
    retryText: {
        color: '#fff',
    },
    infoCard: {
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 8,
        borderBottomColor: Colors.backgroundSecondary,
    },
    brand: {
        color: Colors.secondary,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 4,
    },
    productName: {
        color: Colors.text,
        lineHeight: RFValue(22),
    },
    quantity: {
        color: Colors.text,
        opacity: 0.6,
        marginTop: 4,
    },
    priceSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 16,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    price: {
        color: Colors.text,
    },
    originalPrice: {
        color: Colors.text,
        opacity: 0.5,
        textDecorationLine: 'line-through',
    },
    discountBadge: {
        backgroundColor: '#e8f5e9',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    discountText: {
        color: '#27ae60',
        fontWeight: '600',
    },
    addButtonContainer: {
        minWidth: 100,
    },
    stockBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 12,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 6,
        alignSelf: 'flex-start',
    },
    inStock: {
        backgroundColor: '#e8f5e9',
    },
    outOfStock: {
        backgroundColor: '#ffebee',
    },
    stockText: {
        fontWeight: '500',
    },
    section: {
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 8,
        borderBottomColor: Colors.backgroundSecondary,
    },
    sectionTitle: {
        color: Colors.text,
        marginBottom: 12,
    },
    description: {
        color: Colors.text,
        opacity: 0.8,
        lineHeight: RFValue(18),
    },
    highlightsList: {
        gap: 10,
    },
    highlightItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
    },
    highlightText: {
        flex: 1,
        color: Colors.text,
        opacity: 0.8,
    },
    specsList: {
        backgroundColor: Colors.backgroundSecondary,
        borderRadius: 8,
        overflow: 'hidden',
    },
    specRow: {
        flexDirection: 'row',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#fff',
    },
    specKey: {
        flex: 1,
        color: Colors.text,
        opacity: 0.7,
    },
    specValue: {
        flex: 1,
        color: Colors.text,
        textAlign: 'right',
    },
    nutritionGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    nutritionItem: {
        width: (SCREEN_WIDTH - 64) / 3,
        backgroundColor: Colors.backgroundSecondary,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    nutritionLabel: {
        color: Colors.text,
        opacity: 0.6,
        marginBottom: 4,
    },
    warningHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    warningBox: {
        backgroundColor: '#fff8e1',
        padding: 12,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#e67e22',
    },
    warningText: {
        color: '#5d4037',
        lineHeight: RFValue(16),
    },
    storageHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    storageText: {
        color: Colors.text,
        opacity: 0.8,
        lineHeight: RFValue(16),
    },
    sellerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: Colors.backgroundSecondary,
        padding: 12,
        borderRadius: 8,
    },
    sellerName: {
        color: Colors.text,
    },
    relatedSection: {
        padding: 16,
        backgroundColor: '#fff',
    },
    relatedList: {
        gap: 12,
        paddingRight: 16,
    },
    relatedCard: {
        width: 130,
        backgroundColor: Colors.backgroundSecondary,
        borderRadius: 12,
        padding: 10,
    },
    relatedImageContainer: {
        width: 110,
        height: 90,
        borderRadius: 8,
        overflow: 'hidden',
        marginBottom: 8,
    },
    relatedImage: {
        width: '100%',
        height: '100%',
    },
    relatedName: {
        color: Colors.text,
        marginBottom: 4,
    },
    relatedQuantity: {
        color: Colors.text,
        opacity: 0.6,
        marginBottom: 4,
    },
    relatedPrice: {
        color: Colors.secondary,
    },
    bottomSpacer: {
        height: 20,
    },
});

export default ProductDetailScreen;
