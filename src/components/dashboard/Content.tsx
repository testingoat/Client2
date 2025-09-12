import { View, StyleSheet } from 'react-native'
import React, { FC } from 'react'
import { adData, categories } from '@utils/dummyData'
import AdCarousal from './AdCarousal'
import { Fonts } from '@utils/Constants'
import CustomText from '@components/ui/CustomText'
import CategoryContainer from './CategoryContainer'

const Content:FC = () => {
  if (__DEV__) {
    console.log("🚨 Rendering Content component");
    console.log("🚨 adData:", adData?.length, "categories:", categories?.length);
  }
  return (
    <View style={styles.container}>
      <AdCarousal adData={adData} />
      <CustomText variant='h5' fontFamily={Fonts.SemiBold} style={styles.sectionTitle}>Grocery & Kitchen</CustomText>
      <CategoryContainer data={categories} />
      <CustomText variant='h5' fontFamily={Fonts.SemiBold} style={styles.sectionTitle}>Bestsellers</CustomText>
      <CategoryContainer data={categories} />
      <CustomText variant='h5' fontFamily={Fonts.SemiBold} style={styles.sectionTitle}>Snacks & Drinks</CustomText>
      <CategoryContainer data={categories} />
      <CustomText variant='h5' fontFamily={Fonts.SemiBold} style={styles.sectionTitle}>Home & Lifestyle</CustomText>
      <CategoryContainer data={categories} />
    </View>
  )
}

const styles = StyleSheet.create({
    container:{
        paddingHorizontal:20,
        marginTop: 10  // Reduced since scroll container now has proper padding
    },
    sectionTitle: {
        marginTop: 20,
        marginBottom: 10
    }
})

export default Content