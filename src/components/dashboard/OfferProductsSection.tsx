import React, { FC, useMemo } from 'react'
import { FlatList, Image, StyleSheet, View } from 'react-native'
import CustomText from '@components/ui/CustomText'
import { Colors, Fonts } from '@utils/Constants'
import UniversalAdd from '@components/ui/UniversalAdd'

const OfferProductsSection: FC<{
  title: string
  products: any[]
  showAddButton?: boolean
  showDiscountBadge?: boolean
}> = ({ title, products, showAddButton = true, showDiscountBadge = true }) => {
  const data = useMemo(() => (Array.isArray(products) ? products : []), [products])

  if (data.length === 0) return null

  return (
    <View style={styles.container}>
      <CustomText variant="h4" fontFamily={Fonts.SemiBold} style={styles.title}>
        {title}
      </CustomText>

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
              <View style={styles.imageWrap}>
                {showDiscountBadge && hasDiscount ? (
                  <View style={styles.badge}>
                    <CustomText style={styles.badgeText} fontFamily={Fonts.SemiBold}>
                      {`${discountPercent}% OFF`}
                    </CustomText>
                  </View>
                ) : null}

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
  title: {
    marginTop: 10,
    marginBottom: 10,
    paddingHorizontal: 20,
    letterSpacing: 0.2,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 6,
  },
  card: {
    width: 170,
    marginRight: 12,
    borderRadius: 16,
    backgroundColor: '#fff',
    padding: 12,
    // No shadow (requested): keep flat cards for cleaner UI
  },
  imageWrap: {
    height: 120,
    borderRadius: 14,
    backgroundColor: '#FFF5F2',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 10,
  },
  image: {
    width: 110,
    height: 110,
  },
  badge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#FF5A5A',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    zIndex: 2,
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
