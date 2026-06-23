'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface CartItem {
  productId: string
  name: string
  price: number
  image: string | null
  quantity: number
}

interface CartState {
  items: CartItem[]
  slug: string
  itemCount: number
  subtotal: number
  setSlug: (slug: string) => void
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
}

const storageKey = () => {
  if (typeof window === 'undefined') return 'nudge-cart-store'
  try {
    const raw = localStorage.getItem('nudge-cart-store')
    if (raw) {
      const parsed = JSON.parse(raw)
      const slug = parsed?.state?.slug || 'store'
      return `nudge-cart-${slug}`
    }
  } catch {}
  return 'nudge-cart-store'
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      slug: '',
      itemCount: 0,
      subtotal: 0,

      setSlug: (slug) => {
        const old = get().slug
        if (old && old !== slug) {
          set({ items: [], slug, itemCount: 0, subtotal: 0 })
        } else {
          set({ slug })
        }
      },

      addItem: (item) => {
        const items = get().items
        const existing = items.find((i) => i.productId === item.productId)
        let newItems: CartItem[]
        if (existing) {
          newItems = items.map((i) =>
            i.productId === item.productId
              ? { ...i, quantity: i.quantity + 1 }
              : i,
          )
        } else {
          newItems = [...items, { ...item, quantity: 1 }]
        }
        set({
          items: newItems,
          itemCount: newItems.reduce((a, i) => a + i.quantity, 0),
          subtotal: newItems.reduce((a, i) => a + i.price * i.quantity, 0),
        })
      },

      removeItem: (productId) =>
        set((state) => {
          const items = state.items.filter((i) => i.productId !== productId)
          return {
            items,
            itemCount: items.reduce((a, i) => a + i.quantity, 0),
            subtotal: items.reduce((a, i) => a + i.price * i.quantity, 0),
          }
        }),

      updateQuantity: (productId, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            const items = state.items.filter((i) => i.productId !== productId)
            return {
              items,
              itemCount: items.reduce((a, i) => a + i.quantity, 0),
              subtotal: items.reduce((a, i) => a + i.price * i.quantity, 0),
            }
          }
          const items = state.items.map((i) =>
            i.productId === productId ? { ...i, quantity } : i,
          )
          return {
            items,
            itemCount: items.reduce((a, i) => a + i.quantity, 0),
            subtotal: items.reduce((a, i) => a + i.price * i.quantity, 0),
          }
        }),

      clearCart: () => set({ items: [], itemCount: 0, subtotal: 0 }),
    }),
    {
      name: 'nudge-cart-store',
      storage: createJSONStorage(() => ({
        getItem: (name) => {
          if (typeof window === 'undefined') return null
          const raw = localStorage.getItem(name)
          if (raw) {
            try {
              const parsed = JSON.parse(raw)
              const slug = parsed?.state?.slug || 'store'
              const scoped = `nudge-cart-${slug}`
              return localStorage.getItem(scoped)
            } catch {}
          }
          return null
        },
        setItem: (name, value) => {
          if (typeof window === 'undefined') return
          try {
            const parsed = JSON.parse(value)
            const slug = parsed?.state?.slug || 'store'
            const scoped = `nudge-cart-${slug}`
            localStorage.setItem(scoped, value)
            localStorage.setItem(name, value)
          } catch {}
        },
        removeItem: (name) => {
          if (typeof window === 'undefined') return
          localStorage.removeItem(name)
          try {
            const raw = localStorage.getItem(name)
            if (raw) {
              const parsed = JSON.parse(raw)
              const slug = parsed?.state?.slug || 'store'
              localStorage.removeItem(`nudge-cart-${slug}`)
            }
          } catch {}
        },
      })),
      partialize: (state) => ({
        items: state.items,
        slug: state.slug,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.itemCount = state.items.reduce((a, i) => a + i.quantity, 0)
          state.subtotal = state.items.reduce((a, i) => a + i.price * i.quantity, 0)
        }
      },
    },
  ),
)
