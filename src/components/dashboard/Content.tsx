import { View, StyleSheet } from 'react-native'
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react'
import AdCarousal from './AdCarousal'
import { Fonts } from '@utils/Constants'
import CustomText from '@components/ui/CustomText'
import CategoryContainer from './CategoryContainer'
import { getHome, HomeSection } from '@service/homeService'
import { adData as fallbackAdData } from '@utils/dummyData'
import OfferProductsSection from './OfferProductsSection'

const Content: FC<{ refreshToken?: number; bypassCache?: boolean; onLoaded?: () => void }> = ({ refreshToken = 0, bypassCache = false, onLoaded }) => {
  const [sections, setSections] = useState<HomeSection[]>([])

  const loadHome = useCallback(async (opts?: { bypassCache?: boolean }) => {
    const data = await getHome(opts)
    setSections(Array.isArray(data?.sections) ? data.sections : [])
    onLoaded?.()
  }, [onLoaded])

  useEffect(() => {
    loadHome({ bypassCache })
  }, [loadHome, refreshToken, bypassCache])

  const bannerItems = useMemo(() => {
    const bannerSection = sections.find((s) => s?.type === 'banner_carousel') as any
    const items = bannerSection?.data?.items ?? []
    return Array.isArray(items) && items.length > 0 ? items : fallbackAdData
  }, [sections])

  const offerSections = useMemo(() => {
    return sections.filter((s) => s?.type === 'offer_products') as any[]
  }, [sections])

  const categoryGridSections = useMemo(() => {
    return sections.filter((s) => s?.type === 'category_grid') as any[]
  }, [sections])

  return (
    <View style={styles.container}>
      {offerSections.map((section, index) => (
        <OfferProductsSection
          key={`${section?.data?.title || 'offer'}-${index}`}
          title={section?.data?.title || 'Offers'}
          products={section?.data?.products || []}
          showAddButton={section?.data?.showAddButton}
          showDiscountBadge={section?.data?.showDiscountBadge}
        />
      ))}

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
