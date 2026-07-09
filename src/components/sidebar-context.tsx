'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

type SidebarContextType = {
  /** User's pinned collapse preference (persisted). */
  collapsed: boolean
  setCollapsed: (value: boolean) => void
  toggleCollapsed: () => void
  /** Transient hover state, only meaningful while collapsed. */
  hovered: boolean
  setHovered: (value: boolean) => void
  /** Effective visual expansion: expanded when not collapsed, or when hovered. */
  expanded: boolean
}

const STORAGE_KEY = 'jp-sidebar-collapsed'

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: ReactNode }) {
  // Collapsed by default; a saved preference (if any) overrides this after mount.
  const [collapsed, setCollapsedState] = useState(true)
  const [hovered, setHovered] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored !== null) {
      setCollapsedState(stored === 'true')
    }
  }, [])

  const setCollapsed = (value: boolean) => {
    setCollapsedState(value)
    try {
      localStorage.setItem(STORAGE_KEY, String(value))
    } catch {
      // ignore storage failures (e.g. private mode)
    }
  }

  const toggleCollapsed = () => setCollapsed(!collapsed)

  const expanded = !collapsed || hovered

  return (
    <SidebarContext.Provider
      value={{ collapsed, setCollapsed, toggleCollapsed, hovered, setHovered, expanded }}
    >
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const ctx = useContext(SidebarContext)
  if (!ctx) {
    throw new Error('useSidebar must be used within a SidebarProvider')
  }
  return ctx
}
