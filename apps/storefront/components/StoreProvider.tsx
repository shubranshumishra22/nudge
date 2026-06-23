'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Tables } from '@nudge/db'
import { useCart } from '@/store/cart'

export interface StoreData {
  store: Tables<'stores'>
  theme: Tables<'store_themes'>
  products: Tables<'products'>[]
  ownerPlan: string
}

const StoreContext = createContext<StoreData | null>(null)

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}

export function StoreProvider({
  children,
  storeData,
}: {
  children: ReactNode
  storeData: StoreData
}) {
  const setSlug = useCart((s) => s.setSlug)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setSlug(storeData.store.slug)
    setReady(true)
  }, [storeData.store.slug, setSlug])

  if (!ready) return null

  return (
    <StoreContext.Provider value={storeData}>
      {children}
    </StoreContext.Provider>
  )
}
