import { View, StyleSheet } from 'react-native'
import React, { FC, useEffect, useMemo, useState } from 'react'
import AdCarousal from './AdCarousal'
import { Fonts } from '@utils/Constants'
import CustomText from '@components/ui/CustomText'
import CategoryContainer from './CategoryContainer'
import { getHome, HomeSection } from '@service/homeService'
import { adData as fallbackAdData } from '@utils/dummyData'

const Content: FC = () => {
  const [sections, setSections] = useState<HomeSection[]>([])

  useEffect(() => {
    let isMounted = true
    getHome().then((data) => {
      if (!isMounted) return
      setSections(Array.isArray(data?.sections) ? data.sections : [])
    })
    return () => {
      isMounted = false
    }
  }, [])

  const bannerItems = useMemo(() => {
    const bannerSection = sections.find((s) => s?.type === 'banner_carousel') as any
    const items = bannerSection?.data?.items ?? []
    return Array.isArray(items) && items.length > 0 ? items : fallbackAdData
  }, [sections])

  const categoryGridSections = useMemo(() => {
    return sections.filter((s) => s?.type === 'category_grid') as any[]
  }, [sections])

  return (
    <View style={styles.container}>
      <AdCarousal adData={bannerItems} />
      {categoryGridSections.map((section, index) => (
        <View key={`${section?.data?.title || 'grid'}-${index}`}>
          <CustomText variant='h5' fontFamily={Fonts.SemiBold} style={styles.sectionTitle}>
            {section?.data?.title || 'Shop'}
          </CustomText>
          <CategoryContainer data={section?.data?.tiles || []} />
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginTop: 4,
  },
  sectionTitle: {
    marginTop: 20,
    marginBottom: 10,
  },
})

export default Content
