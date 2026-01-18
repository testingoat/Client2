import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

export interface RecentlyViewedProduct {
    _id?: string
    id?: string
    name: string
    imageUrl?: string
    image?: string
    price: number
    discountPrice?: number
    viewedAt: number
}

interface RecentlyViewedStore {
    items: RecentlyViewedProduct[]
    addItem: (product: Omit<RecentlyViewedProduct, 'viewedAt'>) => void
    removeItem: (productId: string) => void
    clearAll: () => void
}

const MAX_ITEMS = 20

const getProductId = (p: Partial<RecentlyViewedProduct>) => String(p?._id || p?.id || '')

export const useRecentlyViewedStore = create<RecentlyViewedStore>()(
    persist(
        (set, get) => ({
            items: [],

            addItem: (product) => {
                const productId = getProductId(product)
                if (!productId) return

                const newItem: RecentlyViewedProduct = {
                    ...product,
                    viewedAt: Date.now(),
                }

                set((state) => {
                    // Remove existing entry if present
                    const filtered = state.items.filter((item) => getProductId(item) !== productId)

                    // Add new item at the beginning
                    const updated = [newItem, ...filtered]

                    // Keep only MAX_ITEMS
                    return { items: updated.slice(0, MAX_ITEMS) }
                })
            },

            removeItem: (productId) => {
                set((state) => ({
                    items: state.items.filter((item) => getProductId(item) !== productId),
                }))
            },

            clearAll: () => {
                set({ items: [] })
            },
        }),
        {
            name: 'recently-viewed-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
)
