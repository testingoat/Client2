import { View, StyleSheet } from 'react-native'
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react'
import AdCarousal from './AdCarousal'
import { Fonts } from '@utils/Constants'
import CustomText from '@components/ui/CustomText'
import CategoryContainer from './CategoryContainer'
import { getHome, HomeSection } from '@service/homeService'
import { adData as fallbackAdData } from '@utils/dummyData'
import OfferProductsSection from './OfferProductsSection'
import { useThemeStore } from '@state/themeStore'

const Content: FC<{ refreshToken?: number; bypassCache?: boolean; onLoaded?: () => void }> = ({ refreshToken = 0, bypassCache = false, onLoaded }) => {
  const [sections, setSections] = useState<HomeSection[]>([])
  const setTheme = useThemeStore((s) => s.setTheme)

  const loadHome = useCallback(async (opts?: { bypassCache?: boolean }) => {
    const data = await getHome(opts)
    setSections(Array.isArray(data?.sections) ? data.sections : [])
    if (data?.theme) setTheme(data.theme)
    onLoaded?.()
  }, [onLoaded])

  useEffect(() => {
    loadHome({ bypassCache })
  }, [loadHome, refreshToken, bypassCache])

  const renderSections = useMemo(() => {
    const safeSections = Array.isArray(sections) ? sections : []
    return safeSections.map((section, index) => {
      if (section?.type === 'offer_products') {
        const anySection: any = section
        return (
          <OfferProductsSection
            key={`${anySection?.data?.title || 'offer'}-${index}`}
            title={anySection?.data?.title || 'Offers'}
            titleVariant={anySection?.data?.titleVariant}
            titleColor={anySection?.data?.titleColor}
            products={anySection?.data?.products || []}
            showAddButton={anySection?.data?.showAddButton}
            showDiscountBadge={anySection?.data?.showDiscountBadge}
          />
        )
      }

      if (section?.type === 'banner_carousel') {
        const bannerSection: any = section
        const items = bannerSection?.data?.items ?? []
        const bannerItems = Array.isArray(items) && items.length > 0 ? items : fallbackAdData
        return <AdCarousal key={`banner-${index}`} adData={bannerItems} />
      }

      if (section?.type === 'category_grid') {
        const anySection: any = section
        return (
          <View key={`${anySection?.data?.title || 'grid'}-${index}`}>
            <CustomText variant='h5' fontFamily={Fonts.SemiBold} style={styles.sectionTitle}>
              {anySection?.data?.title || 'Shop'}
            </CustomText>
            <CategoryContainer data={anySection?.data?.tiles || []} />
          </View>
        )
      }

      if (section?.type === 'banner_strip') {
        const anySection: any = section
        return (
          <View key={`strip-${index}`} style={styles.stripWrap}>
            <AdCarousal adData={[anySection?.data?.imageUrl].filter(Boolean)} />
          </View>
        )
      }

      return null
    })
  }, [sections])

  return (
    <View style={styles.container}>
      {renderSections}
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
  stripWrap: {
    marginTop: 12,
  },
})

export default Content
