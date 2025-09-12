import { View, StyleSheet, Image, Dimensions } from 'react-native'
import React, { FC, useState } from 'react'
import ScalePress from '@components/ui/ScalePress'
import { navigate } from '@utils/NavigationUtils'
import CustomText from '@components/ui/CustomText'
import { Fonts, Colors } from '@utils/Constants'
import FadeInView from '@components/ui/FadeInView'

const { width: screenWidth } = Dimensions.get('window')

// Fallback placeholder component
const ImagePlaceholder = ({ name }: { name: string }) => (
  <View style={styles.placeholder}>
    <CustomText style={styles.placeholderText}>
      {name?.charAt(0)?.toUpperCase() || '?'}
    </CustomText>
  </View>
)

const CategoryContainer: FC<{ data: any }> = ({ data }) => {
  const [imageErrors, setImageErrors] = useState<{[key: string]: boolean}>({})

  // Debug: Log the data structure
  React.useEffect(() => {
    if (__DEV__) {
      console.log('CategoryContainer data:', JSON.stringify(data));
      if (data && data.length > 0) {
        console.log('First item:', JSON.stringify(data[0]));
        console.log('First item image:', data[0]?.image ? 'has image' : 'no image');
      }
    }
  }, [data]);

  const handleImageError = (itemId: string) => {
    setImageErrors(prev => ({ ...prev, [itemId]: true }))
    if (__DEV__) {
      console.log('Image loading error for item:', itemId || 'unknown')
    }
  }

  const renderItems=(items:any[])=>{
    if (!items || items.length === 0) {
      return <View />;
    }

    return items
      .filter(item => item && typeof item === 'object') // ✅ filter booleans/numbers
      .map((item,index)=>{
        const itemKey = item?.id?.toString() || index.toString()
        const hasImageError = imageErrors[itemKey]

        return(
            <FadeInView
                key={itemKey}
                delay={index * 100}
                fadeFrom="bottom"
                style={styles.item}
            >
                <ScalePress onPress={()=>navigate("ProductCategories")}>
                    <View style={styles.imageContainer}>
                        {hasImageError ? (
                            <ImagePlaceholder name={String(item?.name || '?')} />
                        ) : (
                            <Image
                                source={item?.image}
                                style={styles.image}
                                onError={() => {
                                    if (__DEV__) {
                                        console.log('Image loading error for:', item?.name || 'unknown item');
                                    }
                                    handleImageError(itemKey);
                                }}
                                onLoad={() => {
                                    if (__DEV__) {
                                        console.log('Image loaded successfully for:', item?.name || 'unknown item');
                                    }
                                }}
                                onLoadStart={() => {
                                    if (__DEV__) {
                                        console.log('Image loading started for:', item?.name || 'unknown item');
                                    }
                                }}
                            />
                        )}
                    </View>
                    <CustomText
                        style={styles.text}
                        variant='h8'
                        fontFamily={Fonts.Medium}
                        numberOfLines={2}
                    >
                        {String(item?.name || 'Unknown Item')}
                    </CustomText>
                </ScalePress>
            </FadeInView>
        )
    });
 }


  return (
    <View style={styles.container}>
        <View style={styles.row}>
            {renderItems(data?.slice(0,4))}
        </View>
        <View style={styles.row}>
            {renderItems(data?.slice(4))}
        </View>
    </View>
  )
}

const styles = StyleSheet.create({
    container:{
        marginVertical: 15,
    },
    row:{
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
        width: 70,
        height: 70,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
        padding: 8,
        backgroundColor: "#E5F3F3",
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
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
    }
})

export default CategoryContainer