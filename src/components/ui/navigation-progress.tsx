'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'

/**
 * Global top progress bar that appears the moment an internal link is clicked
 * (or on browser back/forward) and completes once the new route commits.
 * Gives users immediate feedback that a navigation is in progress.
 */
export function NavigationProgress() {
  const pathname = usePathname()
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)
  const trickle = useRef<ReturnType<typeof setInterval> | null>(null)
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const startedRef = useRef(false)

  const clearTimers = () => {
    if (trickle.current) { clearInterval(trickle.current); trickle.current = null }
    if (timeout.current) { clearTimeout(timeout.current); timeout.current = null }
  }

  const start = () => {
    if (startedRef.current) return
    startedRef.current = true
    clearTimers()
    setVisible(true)
    setProgress(8)
    // Creep towards 90% while we wait for the server to respond.
    trickle.current = setInterval(() => {
      setProgress((p) => (p < 90 ? p + Math.max(0.5, (90 - p) * 0.1) : p))
    }, 300)
    // Safety net: auto-finish if navigation is cancelled (e.g. same target).
    timeout.current = setTimeout(() => finish(), 10000)
  }

  const finish = () => {
    clearTimers()
    startedRef.current = false
    setProgress(100)
    timeout.current = setTimeout(() => {
      setVisible(false)
      setProgress(0)
    }, 250)
  }

  // The new route has committed once the pathname changes -> complete the bar.
  useEffect(() => {
    if (startedRef.current) finish()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const anchor = (e.target as HTMLElement)?.closest?.('a')
      if (!anchor) return

      const href = anchor.getAttribute('href')
      const target = anchor.getAttribute('target')
      if (!href || (target && target !== '_self') || anchor.hasAttribute('download')) return
      if (/^(https?:)?\/\//.test(href) || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return

      const url = new URL(href, window.location.href)
      // Ignore navigations that don't actually change the page.
      if (url.pathname === window.location.pathname && url.search === window.location.search) return

      start()
    }

    const handlePopState = () => start()

    document.addEventListener('click', handleClick, true)
    window.addEventListener('popstate', handlePopState)
    return () => {
      document.removeEventListener('click', handleClick, true)
      window.removeEventListener('popstate', handlePopState)
      clearTimers()
    }
  }, [])

  if (!visible) return null

  return (
    <div
      className="fixed left-0 top-0 z-[99999] h-0.5 w-full bg-transparent pointer-events-none"
      role="progressbar"
      aria-hidden="true"
    >
      <div
        className="h-full bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.7),0_0_4px_rgba(37,99,235,0.9)] transition-[width] duration-200 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
