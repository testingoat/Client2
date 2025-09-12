import {create} from 'zustand';
import {createJSONStorage, persist} from 'zustand/middleware';
import {mmkvStorage} from './storage';

interface CartItem {
  _id: string | number;
  item: any;
  count: number;
  addedAt?: number;
  notes?: string;
}

interface SavedItem {
  _id: string | number;
  item: any;
  savedAt: number;
  notes?: string;
}

interface CartStore {
  cart: CartItem[];
  savedForLater: SavedItem[];

  // Cart methods
  addItem: (item: any, count?: number) => void;
  removeItem: (id: string | number) => void;
  updateItemCount: (id: string | number, count: number) => void;
  updateItemNotes: (id: string | number, notes: string) => void;
  clearCart: () => void;
  getItemCount: (id: string | number) => number;
  getTotalPrice: () => number;
  getTotalItems: () => number;

  // Saved for later methods
  saveForLater: (id: string | number, notes?: string) => void;
  moveToCart: (id: string | number) => void;
  removeSavedItem: (id: string | number) => void;
  clearSavedItems: () => void;
  getSavedItemsCount: () => number;

  // Quick actions
  quickAddItem: (item: any, count?: number) => Promise<boolean>;
  bulkAddItems: (items: Array<{item: any, count: number}>) => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      cart: [],
      savedForLater: [],

      addItem: (item, count = 1) => {
        const currentCart = get().cart;
        const existingItemIndex = currentCart?.findIndex(
          cartItem => cartItem?._id === item?._id,
        );

        if (existingItemIndex >= 0) {
          const updatedCart = [...currentCart];
          updatedCart[existingItemIndex] = {
            ...updatedCart[existingItemIndex],
            count: updatedCart[existingItemIndex].count + count,
          };
          set({cart: updatedCart});
        } else {
          set({
            cart: [...currentCart, {
              _id: item._id,
              item: item,
              count: count,
              addedAt: Date.now()
            }],
          });
        }
      },

      clearCart: () => set({cart: []}),

      removeItem: id => {
        const currentCart = get().cart
        const existingItemIndex = currentCart.findIndex(cartItem => cartItem?._id === id)

        if (existingItemIndex >= 0) {
            const updatedCart = [...currentCart]
            const existingItem = updatedCart[existingItemIndex];

            if (existingItem.count > 1) {
                updatedCart[existingItemIndex] = {
                    ...existingItem,
                    count: existingItem?.count - 1
                }
            } else {
                updatedCart.splice(existingItemIndex, 1)
            }

            set({ cart: updatedCart })
        }

      },

      getItemCount: id => {
        const currentItem = get().cart.find(cartItem => cartItem._id === id);
        return currentItem ? currentItem?.count : 0;
      },

      updateItemCount: (id, count) => {
        const currentCart = get().cart;
        const existingItemIndex = currentCart.findIndex(cartItem => cartItem._id === id);

        if (existingItemIndex >= 0) {
          const updatedCart = [...currentCart];
          if (count <= 0) {
            updatedCart.splice(existingItemIndex, 1);
          } else {
            updatedCart[existingItemIndex] = {
              ...updatedCart[existingItemIndex],
              count: count
            };
          }
          set({ cart: updatedCart });
        }
      },

      updateItemNotes: (id, notes) => {
        const currentCart = get().cart;
        const existingItemIndex = currentCart.findIndex(cartItem => cartItem._id === id);

        if (existingItemIndex >= 0) {
          const updatedCart = [...currentCart];
          updatedCart[existingItemIndex] = {
            ...updatedCart[existingItemIndex],
            notes: notes
          };
          set({ cart: updatedCart });
        }
      },

      getTotalPrice: () => {
        return get().cart.reduce(
          (total, cartItem) => total + cartItem.item.price * cartItem.count,
          0,
        );
      },

      getTotalItems: () => {
        return get().cart.reduce((total, cartItem) => total + cartItem.count, 0);
      },

      // Saved for later methods
      saveForLater: (id, notes) => {
        const currentCart = get().cart;
        const itemToSave = currentCart.find(cartItem => cartItem._id === id);

        if (itemToSave) {
          const savedItem: SavedItem = {
            _id: itemToSave._id,
            item: itemToSave.item,
            savedAt: Date.now(),
            notes: notes || itemToSave.notes
          };

          const currentSaved = get().savedForLater;
          const existingSavedIndex = currentSaved.findIndex(saved => saved._id === id);

          if (existingSavedIndex >= 0) {
            // Update existing saved item
            const updatedSaved = [...currentSaved];
            updatedSaved[existingSavedIndex] = savedItem;
            set({ savedForLater: updatedSaved });
          } else {
            // Add new saved item
            set({ savedForLater: [...currentSaved, savedItem] });
          }

          // Remove from cart
          const updatedCart = currentCart.filter(cartItem => cartItem._id !== id);
          set({ cart: updatedCart });
        }
      },

      moveToCart: (id) => {
        const currentSaved = get().savedForLater;
        const itemToMove = currentSaved.find(saved => saved._id === id);

        if (itemToMove) {
          // Add to cart
          get().addItem(itemToMove.item, 1);

          // Remove from saved
          const updatedSaved = currentSaved.filter(saved => saved._id !== id);
          set({ savedForLater: updatedSaved });
        }
      },

      removeSavedItem: (id) => {
        const currentSaved = get().savedForLater;
        const updatedSaved = currentSaved.filter(saved => saved._id !== id);
        set({ savedForLater: updatedSaved });
      },

      clearSavedItems: () => {
        set({ savedForLater: [] });
      },

      getSavedItemsCount: () => {
        return get().savedForLater.length;
      },

      // Quick actions
      quickAddItem: async (item, count = 1) => {
        try {
          get().addItem(item, count);
          return true;
        } catch (error) {
          console.error('Quick add failed:', error);
          return false;
        }
      },

      bulkAddItems: (items) => {
        items.forEach(({ item, count }) => {
          get().addItem(item, count);
        });
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
);
