import React, { FC, useMemo } from 'react'
import { FlatList, Image, Pressable, StyleSheet, View } from 'react-native'
import CustomText from '@components/ui/CustomText'
import { Colors, Fonts } from '@utils/Constants'
import UniversalAdd from '@components/ui/UniversalAdd'
import { navigate } from '@utils/NavigationUtils'
import Icon from 'react-native-vector-icons/Ionicons'
import { useWishlistStore } from '@state/wishlistStore'
import { addToWishlist, removeFromWishlist } from '@service/wishlistService'

const getProductId = (p: any) => String(p?._id || p?.id || '')

const OfferProductsSection: FC<{
  title: string
  titleVariant?: 'h3' | 'h4' | 'h5'
  titleColor?: string
  seeAllLabel?: string
  seeAllDeepLink?: string
  products: any[]
  showAddButton?: boolean
  showDiscountBadge?: boolean
}> = ({ title, titleVariant = 'h4', titleColor = '#222222', seeAllLabel = 'See all', seeAllDeepLink, products, showAddButton = true, showDiscountBadge = true }) => {
  const data = useMemo(() => (Array.isArray(products) ? products : []), [products])
  const toggleLocal = useWishlistStore((s) => s.toggleLocal)
  const wishlistItems = useWishlistStore((s) => s.items)

  const wishlistedIdSet = useMemo(() => {
    const ids = (Array.isArray(wishlistItems) ? wishlistItems : []).map((p) => getProductId(p)).filter(Boolean)
    return new Set(ids)
  }, [wishlistItems])

  if (data.length === 0) return null

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <CustomText variant={titleVariant as any} fontFamily={Fonts.SemiBold} style={[styles.title, { color: titleColor }]}>
          {title}
        </CustomText>
        <Pressable
          onPress={() => {
            // Basic deep link support (safe). If not provided, open default list for this section.
            const dl = String(seeAllDeepLink || '').trim()
            if (dl.startsWith('category:')) {
              const id = dl.replace('category:', '').trim()
              if (id) return navigate('ProductCategories', { initialCategoryId: id })
            }
            // Default: open a simple list screen with these products
            return navigate('OfferProductsScreen', { title, products: data })
          }}
          hitSlop={10}
          style={styles.seeAllBtn}
        >
          <CustomText style={styles.seeAll} fontFamily={Fonts.SemiBold}>
            {seeAllLabel}
          </CustomText>
          <Icon name="chevron-forward" size={16} color={Colors.secondary} />
        </Pressable>
      </View>

      <FlatList
        data={data}
        keyExtractor={(item, index) => String(item?._id || item?.id || index)}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const price = Number(item?.price ?? 0)
          const discountPrice = item?.discountPrice != null ? Number(item.discountPrice) : null
          const hasDiscount = discountPrice != null && discountPrice > 0 && discountPrice < price

          const discountPercent = hasDiscount ? Math.round(((price - (discountPrice as number)) / price) * 100) : 0

          return (
            <View style={styles.card}>
              <Pressable
                onPressIn={() => {
                  // Helps on Android when scrollviews compete for touches.
                  // Also provides immediate feedback in logs while debugging.
                  if (__DEV__) console.log('wishlist:pressIn', getProductId(item))
                }}
                onPress={async () => {
                  const productId = getProductId(item)
                  if (!productId) return
                  const nowWishlisted = toggleLocal(item)
                  try {
                    if (nowWishlisted) await addToWishlist(productId)
                    else await removeFromWishlist(productId)
                  } catch {
                    // revert if server call fails
                    toggleLocal(item)
                  }
                }}
                style={styles.heartBtn}
                hitSlop={12}
              >
                <Icon
                  name={wishlistedIdSet.has(getProductId(item)) ? 'heart' : 'heart-outline'}
                  size={18}
                  color={wishlistedIdSet.has(getProductId(item)) ? '#FF5A5A' : '#333'}
                />
              </Pressable>

              <View style={styles.imageWrap}>
                {showDiscountBadge && hasDiscount ? (
                  <View style={styles.badge}>
                    <CustomText style={styles.badgeText} fontFamily={Fonts.SemiBold}>
                      {`${discountPercent}% OFF`}
                    </CustomText>
                  </View>
                ) : null}

                <Image
                  pointerEvents="none"
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

              {showAddButton ? (
                <View style={styles.addWrap}>
                  <UniversalAdd item={item} />
                </View>
              ) : null}
            </View>
          )
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 20,
  },
  title: {
    marginTop: 10,
    marginBottom: 10,
    paddingHorizontal: 20,
    letterSpacing: 0.2,
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
    paddingBottom: 6,
  },
  card: {
    width: 182,
    marginRight: 12,
    borderRadius: 16,
    backgroundColor: '#fff',
    padding: 12,
    position: 'relative',
    // No shadow (requested): keep flat cards for cleaner UI
  },
  imageWrap: {
    height: 136,
    borderRadius: 14,
    backgroundColor: '#FFF5F2',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 10,
  },
  heartBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 3,
    elevation: 4,
    backgroundColor: 'rgba(255,255,255,0.85)',
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 124,
    height: 124,
  },
  badge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#FF5A5A',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    zIndex: 2,
    elevation: 3,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
  },
  name: {
    color: Colors.text,
    fontSize: 12,
    lineHeight: 16,
    minHeight: 32,
  },
  qty: {
    opacity: 0.6,
    marginTop: 4,
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  price: {
    color: Colors.text,
  },
  mrp: {
    opacity: 0.5,
    textDecorationLine: 'line-through',
  },
  addWrap: {
    marginTop: 10,
    alignItems: 'flex-start',
  },
})

export default OfferProductsSection
