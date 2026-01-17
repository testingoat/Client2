import React from 'react'
import { FlatList, Image, StyleSheet, View } from 'react-native'
import { useRoute } from '@react-navigation/native'
import CustomHeader from '@components/ui/CustomHeader'
import CustomText from '@components/ui/CustomText'
import { Colors, Fonts } from '@utils/Constants'
import UniversalAdd from '@components/ui/UniversalAdd'

type RouteParams = {
  title: string
  products: any[]
}

const OfferProductsScreen = () => {
  const route = useRoute<any>()
  const { title, products } = (route.params || {}) as RouteParams
  const data = Array.isArray(products) ? products : []

  return (
    <View style={styles.container}>
      <CustomHeader title={title || 'Offers'} search hideBack />

      <FlatList
        data={data}
        keyExtractor={(item, index) => String(item?._id || item?.id || index)}
        numColumns={2}
        contentContainerStyle={styles.list}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => {
          const price = Number(item?.price ?? 0)
          const discountPrice = item?.discountPrice != null ? Number(item.discountPrice) : null
          const hasDiscount = discountPrice != null && discountPrice > 0 && discountPrice < price

          return (
            <View style={styles.card}>
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
          )
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <CustomText style={{ color: Colors.disabled }}>No products</CustomText>
          </View>
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
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
  empty: { padding: 24, alignItems: 'center' },
})

export default OfferProductsScreen

