'use client'

import { useEffect, useState } from 'react'

/**
 * Component that only renders on the client side.
 * Useful for preventing hydration mismatches with components
 * that generate random IDs or interact with browser APIs.
 */
export function ClientOnly({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  return isClient ? children : fallback
}
