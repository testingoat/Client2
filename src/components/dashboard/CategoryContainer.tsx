import { View, StyleSheet, Image, Dimensions } from 'react-native'
import React, { FC, useEffect, useState } from 'react'
import ScalePress from '@components/ui/ScalePress'
import { navigate } from '@utils/NavigationUtils'
import CustomText from '@components/ui/CustomText'
import { Fonts, Colors } from '@utils/Constants'
import FadeInView from '@components/ui/FadeInView'

const { width: screenWidth } = Dimensions.get('window')

const ImagePlaceholder = ({ label }: { label: string }) => (
  <View style={styles.placeholder}>
    <CustomText style={styles.placeholderText}>
      {label?.charAt(0)?.toUpperCase() || '?'}
    </CustomText>
  </View>
)

const getItemKey = (item: any, index: number) => {
  return (
    (item?.categoryId?.toString?.() || item?.categoryId) ||
    (item?._id?.toString?.() || item?._id) ||
    (item?.id?.toString?.() || item?.id) ||
    index.toString()
  )
}

const getItemLabel = (item: any) =>
  String(
    item?.label ??
    item?.name ??
    item?.title ??
    item?.labelOverride ??
    item?.categoryName ??
    item?.category?.name ??
    'Unknown'
  )

const CategoryContainer: FC<{ data: any }> = ({ data }) => {
  const [imageErrors, setImageErrors] = useState<{ [key: string]: boolean }>({})

  useEffect(() => {
    if (__DEV__) {
      console.log('CategoryContainer items:', Array.isArray(data) ? data.length : 0)
      if (Array.isArray(data) && data.length > 0) {
        console.log('CategoryContainer first item keys:', Object.keys(data[0] || {}))
      }
    }
  }, [data])

  const handleImageError = (itemId: string) => {
    setImageErrors(prev => ({ ...prev, [itemId]: true }))
  }

  const renderItems = (items: any[]) => {
    if (!items || items.length === 0) return <View />

    return items
      .filter(item => item && typeof item === 'object')
      .map((item, index) => {
        const itemKey = getItemKey(item, index)
        const itemLabel = getItemLabel(item)
        const hasImageError = imageErrors[itemKey]

        return (
          <FadeInView
            key={itemKey}
            delay={index * 100}
            fadeFrom="bottom"
            style={styles.item}
          >
            <ScalePress onPress={() => navigate('ProductCategories', { initialCategoryId: item?.categoryId || item?._id })}>
              <View style={styles.imageContainer}>
                {hasImageError ? (
                  <ImagePlaceholder label={itemLabel} />
                ) : (
                  <Image
                    source={
                      typeof item?.imageUrl === 'string'
                        ? { uri: item.imageUrl }
                        : typeof item?.image === 'string'
                          ? { uri: item.image }
                          : item?.image
                    }
                    style={styles.image}
                    onError={() => handleImageError(itemKey)}
                  />
                )}
              </View>
              <CustomText
                style={styles.text}
                variant="h8"
                fontFamily={Fonts.Medium}
                numberOfLines={2}
              >
                {itemLabel}
              </CustomText>
            </ScalePress>
          </FadeInView>
        )
      })
  }

  return (
    <View style={styles.container}>
      <View style={styles.row}>{renderItems(data?.slice(0, 4))}</View>
      <View style={styles.row}>{renderItems(data?.slice(4))}</View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 25,
    paddingHorizontal: 0,
  },
  text: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 12,
    color: Colors.text,
    lineHeight: 16,
  },
  item: {
    flex: 1,
    maxWidth: '25%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  imageContainer: {
    width: 72,
    height: 72,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    padding: 8,
    backgroundColor: '#E8F5F5',
    marginBottom: 8,
    // Gradient-like border
    borderWidth: 1.5,
    borderColor: 'rgba(0, 180, 180, 0.15)',
  },
  image: {
    width: 54,
    height: 54,
    resizeMode: 'contain',
  },
  placeholder: {
    width: 50,
    height: 50,
    backgroundColor: Colors.border,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
})

export default CategoryContainer
