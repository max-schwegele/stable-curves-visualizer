import { useCallback, useEffect, useState } from 'react'

const MOBILE_BREAKPOINT = 1024

function isMobileViewport() {
  return typeof window !== 'undefined' && window.innerWidth < MOBILE_BREAKPOINT
}

export function useResponsiveLayout() {
  const [isMobile, setIsMobile] = useState(isMobileViewport)
  const [isSidebarOpen, setIsSidebarOpen] = useState(
    () => !isMobileViewport(),
  )

  useEffect(() => {
    let previousWidth = window.innerWidth

    const handleResize = () => {
      const currentWidth = window.innerWidth

      // Mobile keyboards commonly change only the viewport height.
      if (currentWidth === previousWidth) return

      const mobile = currentWidth < MOBILE_BREAKPOINT
      setIsMobile(mobile)

      if (!mobile) {
        setIsSidebarOpen(true)
      } else if (previousWidth >= MOBILE_BREAKPOINT) {
        setIsSidebarOpen(false)
      }

      previousWidth = currentWidth
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const closeSidebar = useCallback(() => setIsSidebarOpen(false), [])
  const toggleSidebar = useCallback(
    () => setIsSidebarOpen((isOpen) => !isOpen),
    [],
  )

  return {
    closeSidebar,
    isMobile,
    isSidebarOpen,
    toggleSidebar,
  }
}
