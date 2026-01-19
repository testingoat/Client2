import { View, StyleSheet, Pressable, useWindowDimensions } from 'react-native'
import React, { FC, useCallback, useEffect, useMemo, useState, memo } from 'react'
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
import { navigate } from '@utils/NavigationUtils'
import FlashDealsSection from './FlashDealsSection'
import TrendingSection from './TrendingSection'
import RecentlyViewedSection from './RecentlyViewedSection'

type FilterChip = { id?: string; label?: string; value?: string | number } | null;

const getEffectivePrice = (p: any) => {
  const price = Number(p?.price ?? 0)
  const discountPrice = p?.discountPrice != null ? Number(p.discountPrice) : null
  if (discountPrice != null && discountPrice > 0 && discountPrice < price) return discountPrice
  return price
}

const hasDiscount = (p: any) => {
  const price = Number(p?.price ?? 0)
  const discountPrice = p?.discountPrice != null ? Number(p.discountPrice) : null
  return discountPrice != null && discountPrice > 0 && discountPrice < price
}

const discountPercent = (p: any) => {
  const price = Number(p?.price ?? 0)
  const discountPrice = p?.discountPrice != null ? Number(p.discountPrice) : null
  if (!discountPrice || discountPrice <= 0 || discountPrice >= price) return 0
  return Math.round(((price - discountPrice) / price) * 100)
}

const applyChipFilter = (products: any[], chip: FilterChip) => {
  if (!chip?.id) return Array.isArray(products) ? products : []
  const list = Array.isArray(products) ? products : []

  // Server-driven chips: trust backend ordering/filtering for deterministic results.
  if (chip.id === 'fresh' || chip.id === 'popular') return list

  switch (chip.id) {
    case 'under500':
      return list.filter((p) => getEffectivePrice(p) <= 500)
    case 'deals':
      return list
        .filter((p) => hasDiscount(p))
        .sort((a, b) => discountPercent(b) - discountPercent(a))
    case 'newArrivals':
      return list
        .slice()
        .sort((a, b) => {
          const ad = new Date(a?.createdAt || a?.created_at || 0).getTime()
          const bd = new Date(b?.createdAt || b?.created_at || 0).getTime()
          return bd - ad
        })
    case 'popular':
      return list
        .slice()
        .sort((a, b) => Number(b?.rating ?? b?.popularity ?? 0) - Number(a?.rating ?? a?.popularity ?? 0))
    case 'fresh':
      return list.filter((p) => {
        const tags = Array.isArray(p?.tags) ? p.tags.map(String) : []
        return tags.includes('fresh') || tags.includes('fresh_today') || p?.isFresh === true
      })
    default:
      return list
  }
}

const Content: FC<{ refreshToken?: number; bypassCache?: boolean; onLoaded?: () => void; filterChip?: FilterChip }> = ({ refreshToken = 0, bypassCache = false, onLoaded, filterChip = null }) => {
  const [sections, setSections] = useState<HomeSection[]>([])
  const [loading, setLoading] = useState(true)
  const setTheme = useThemeStore((s) => s.setTheme)
  const contentBackgroundColor = useThemeStore((s) => s.contentBackgroundColor)
  const { width: windowWidth } = useWindowDimensions()

  const loadHome = useCallback(async (opts?: { bypassCache?: boolean }) => {
    setLoading(true)
    const chip = filterChip?.id ? String(filterChip.id) : null
    const data = await getHome({ ...opts, chip })
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
    } catch { }
    setLoading(false)
    onLoaded?.()
  }, [filterChip?.id, onLoaded, setTheme])

  useEffect(() => {
    loadHome({ bypassCache })
  }, [loadHome, refreshToken, bypassCache])

  const renderSections = useMemo(() => {
    const safeSections = Array.isArray(sections) ? sections : []
    return safeSections.map((section, index) => {
      if (section?.type === 'offer_products') {
        const anySection: any = section
        const filteredProducts = applyChipFilter(anySection?.data?.products || [], filterChip)
        return (
          <OfferProductsSection
            key={`${anySection?.data?.title || 'offer'}-${index}`}
            title={anySection?.data?.title || 'Offers'}
            titleVariant={anySection?.data?.titleVariant}
            titleColor={anySection?.data?.titleColor}
            products={filteredProducts}
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
        const imageUrl = String(anySection?.data?.imageUrl || '').trim()
        const deepLink = String(anySection?.data?.deepLink || '').trim()
        if (!imageUrl) return null

        const stripWidth = windowWidth - 40
        const stripHeight = Math.round(stripWidth * 0.25)
        return (
          <View key={`strip-${index}`} style={styles.stripWrap}>
            <Pressable
              onPress={() => {
                if (deepLink.startsWith('category:')) {
                  const id = deepLink.replace('category:', '').trim()
                  if (id) return navigate('ProductCategories', { initialCategoryId: id })
                }
              }}
              disabled={!deepLink}
            >
              <View style={[styles.bannerStrip, { width: stripWidth, height: stripHeight }]}>
                <Image source={{ uri: imageUrl }} style={styles.bannerStripImage} resizeMode="cover" />
              </View>
            </Pressable>
          </View>
        )
      }

      // NEW: Flash Deals Section
      if (section?.type === 'flash_deals') {
        const anySection: any = section
        const endTime = anySection?.data?.endTime || (Date.now() + 4 * 60 * 60 * 1000) // Default 4 hours
        const filteredProducts = applyChipFilter(anySection?.data?.products || [], filterChip)
        return (
          <FlashDealsSection
            key={`flash-${index}`}
            title={anySection?.data?.title || '⚡ Flash Deals'}
            endTime={endTime}
            products={filteredProducts}
          />
        )
      }

      // NEW: Trending Section
      if (section?.type === 'trending') {
        const anySection: any = section
        const filteredProducts = applyChipFilter(anySection?.data?.products || [], filterChip)
        return (
          <TrendingSection
            key={`trending-${index}`}
            title={anySection?.data?.title || '🔥 Trending Now'}
            products={filteredProducts}
          />
        )
      }

      return null
    })
  }, [sections, windowWidth, filterChip])

  return (
    <View style={[styles.container, { backgroundColor: contentBackgroundColor || '#FFFFFF' }]}>
      {loading ? <HomeSkeleton /> : (
        <>
          {renderSections}
          {/* Recently Viewed - always shown if user has history */}
          <RecentlyViewedSection maxItems={10} />
        </>
      )}
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
  bannerStrip: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F0F0F0',
  },
  bannerStripImage: {
    width: '100%',
    height: '100%',
  },
})

export default Content
