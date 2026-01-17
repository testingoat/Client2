import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { mmkvStorage } from './storage'

type WishlistState = {
  items: any[]
  hydrated: boolean
  setItems: (items: any[]) => void
  setHydrated: (v: boolean) => void
  removeById: (id: string) => void
  has: (id: string) => boolean
  toggleLocal: (product: any) => boolean
}

const getId = (productOrId: any) => {
  if (typeof productOrId === 'string' || typeof productOrId === 'number') return String(productOrId)
  return String(productOrId?._id || productOrId?.id || '')
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      hydrated: false,
      setItems: (items) => set({ items: Array.isArray(items) ? items : [] }),
      setHydrated: (v) => set({ hydrated: v }),
      removeById: (id) => set({ items: get().items.filter((p) => getId(p) !== getId(id)) }),
      has: (id) => get().items.some((p) => getId(p) === getId(id)),
      toggleLocal: (product) => {
        const id = getId(product)
        if (!id) return false
        const existing = get().items
        const idx = existing.findIndex((p) => getId(p) === id)
        if (idx >= 0) {
          const next = [...existing]
          next.splice(idx, 1)
          set({ items: next })
          return false
        }
        set({ items: [product, ...existing] })
        return true
      },
    }),
    { name: 'wishlist', storage: createJSONStorage(() => mmkvStorage) },
  ),
)
