import { View, StyleSheet } from 'react-native'
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react'
import { Image } from 'react-native'
import AdCarousal from './AdCarousal'
import { Fonts } from '@utils/Constants'
import CustomText from '@components/ui/CustomText'
import CategoryContainer from './CategoryContainer'
import { getHome, HomeSection } from '@service/homeService'
import { adData as fallbackAdData } from '@utils/dummyData'
import OfferProductsSection from './OfferProductsSection'
import { useThemeStore } from '@state/themeStore'
import HomeSkeleton from './HomeSkeleton'

const Content: FC<{ refreshToken?: number; bypassCache?: boolean; onLoaded?: () => void }> = ({ refreshToken = 0, bypassCache = false, onLoaded }) => {
  const [sections, setSections] = useState<HomeSection[]>([])
  const [loading, setLoading] = useState(true)
  const setTheme = useThemeStore((s) => s.setTheme)

  const loadHome = useCallback(async (opts?: { bypassCache?: boolean }) => {
    setLoading(true)
    const data = await getHome(opts)
    setSections(Array.isArray(data?.sections) ? data.sections : [])
    if (data?.theme) setTheme(data.theme)
    // Prefetch images (best-effort, no extra libs)
    try {
      const urls: string[] = []
      const safeSections: any[] = Array.isArray(data?.sections) ? data.sections : []
      for (const section of safeSections) {
        if (section?.type === 'banner_carousel') {
          const items = section?.data?.items
          if (Array.isArray(items)) {
            for (const item of items) {
              const url = typeof item === 'string' ? item : item?.imageUrl
              if (typeof url === 'string') urls.push(url)
            }
          }
        } else if (section?.type === 'banner_strip') {
          const url = section?.data?.imageUrl
          if (typeof url === 'string') urls.push(url)
        } else if (section?.type === 'offer_products') {
          const products = section?.data?.products
          if (Array.isArray(products)) {
            for (const p of products) {
              const url = p?.imageUrl || p?.image
              if (typeof url === 'string') urls.push(url)
            }
          }
        } else if (section?.type === 'category_grid') {
          const tiles = section?.data?.tiles
          if (Array.isArray(tiles)) {
            for (const t of tiles) {
              const url = t?.imageUrl || t?.image
              if (typeof url === 'string') urls.push(url)
            }
          }
        }
      }
      const unique = Array.from(new Set(urls)).slice(0, 60)
      await Promise.allSettled(unique.map((u) => Image.prefetch(u)))
    } catch {}
    setLoading(false)
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
      {loading ? <HomeSkeleton /> : renderSections}
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
