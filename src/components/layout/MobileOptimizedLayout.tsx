'use client'

import { useState, useEffect, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import {
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Settings,
  HelpCircle,
  Accessibility
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface MobileOptimizedLayoutProps {
  children: ReactNode
  title?: string
  subtitle?: string
  showNavigation?: boolean
  showSettings?: boolean
  className?: string
  onNavigationToggle?: (isOpen: boolean) => void
  navigationContent?: ReactNode
  settingsContent?: ReactNode
}

interface ViewportDimensions {
  width: number
  height: number
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  orientation: 'portrait' | 'landscape'
}

/**
 * Mobile-optimized responsive layout with WCAG compliance
 */
export function MobileOptimizedLayout({
  children,
  title,
  subtitle,
  showNavigation = true,
  showSettings = false,
  className,
  onNavigationToggle,
  navigationContent,
  settingsContent
}: MobileOptimizedLayoutProps) {
  // Viewport state
  const [viewport, setViewport] = useState<ViewportDimensions>({
    width: 0,
    height: 0,
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    orientation: 'portrait'
  })

  // UI state
  const [isNavigationOpen, setIsNavigationOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [hasReducedMotion, setHasReducedMotion] = useState(false)
  const [fontSize, setFontSize] = useState(16)

  // Accessibility preferences
  const [accessibilityMode, setAccessibilityMode] = useState({
    highContrast: false,
    reducedMotion: false,
    largerText: false,
    focusVisible: true
  })

  // Update viewport dimensions
  useEffect(() => {
    const updateViewport = () => {
      const width = window.innerWidth
      const height = window.innerHeight

      setViewport({
        width,
        height,
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
        orientation: width > height ? 'landscape' : 'portrait'
      })
    }

    updateViewport()
    window.addEventListener('resize', updateViewport)
    return () => window.removeEventListener('resize', updateViewport)
  }, [])

  // Check for reduced motion preference
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    setHasReducedMotion(prefersReducedMotion)
    setAccessibilityMode(prev => ({ ...prev, reducedMotion: prefersReducedMotion }))
  }, [])

  // Handle navigation toggle
  const handleNavigationToggle = (isOpen: boolean) => {
    setIsNavigationOpen(isOpen)
    onNavigationToggle?.(isOpen)

    // Haptic feedback on mobile
    if (viewport.isMobile && 'vibrate' in navigator) {
      navigator.vibrate(25)
    }
  }

  // Handle fullscreen toggle
  const handleFullscreenToggle = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen()
        setIsFullscreen(true)
      } else {
        await document.exitFullscreen()
        setIsFullscreen(false)
      }
    } catch (error) {
      console.warn('Fullscreen not supported:', error)
    }
  }

  // Accessibility controls
  const AccessibilityControls = () => (
    <div className="space-y-4 p-4">
      <h3 className="font-semibold text-lg">Accessibility Options</h3>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">High Contrast</label>
          <Button
            size="sm"
            variant={accessibilityMode.highContrast ? 'default' : 'outline'}
            onClick={() => setAccessibilityMode(prev => ({ ...prev, highContrast: !prev.highContrast }))}
          >
            {accessibilityMode.highContrast ? 'On' : 'Off'}
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Larger Text</label>
          <Button
            size="sm"
            variant={accessibilityMode.largerText ? 'default' : 'outline'}
            onClick={() => {
              const newLargerText = !accessibilityMode.largerText
              setAccessibilityMode(prev => ({ ...prev, largerText: newLargerText }))
              setFontSize(newLargerText ? 18 : 16)
            }}
          >
            {accessibilityMode.largerText ? 'On' : 'Off'}
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Reduced Motion</label>
          <Button
            size="sm"
            variant={accessibilityMode.reducedMotion ? 'default' : 'outline'}
            onClick={() => setAccessibilityMode(prev => ({ ...prev, reducedMotion: !prev.reducedMotion }))}
          >
            {accessibilityMode.reducedMotion ? 'On' : 'Off'}
          </Button>
        </div>
      </div>
    </div>
  )

  // Animation variants
  const animationVariants = accessibilityMode.reducedMotion ? {
    // Minimal animations for reduced motion
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.1 }
  } : {
    // Full animations
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3, ease: 'easeOut' }
  }

  return (
    <div
      className={cn(
        'min-h-screen bg-background text-foreground',
        accessibilityMode.highContrast && 'contrast-more',
        className
      )}
      style={{
        fontSize: `${fontSize}px`,
        ...(accessibilityMode.largerText && { lineHeight: 1.6 })
      }}
    >
      {/* Mobile Header */}
      {viewport.isMobile && (
        <motion.header
          {...animationVariants}
          className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b shadow-sm"
        >
          <div className="flex items-center justify-between p-4">
            {/* Navigation Toggle */}
            {showNavigation && (
              <Sheet open={isNavigationOpen} onOpenChange={handleNavigationToggle}>
                <SheetTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    aria-label="Open navigation menu"
                    className="p-2"
                  >
                    <Menu size={24} />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <div className="pt-6">
                    {navigationContent || (
                      <div className="space-y-4">
                        <h2 className="text-xl font-bold">Navigation</h2>
                        <p className="text-gray-600">Navigation content goes here</p>
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            )}

            {/* Title */}
            <div className="flex-1 text-center">
              {title && (
                <h1 className="font-bold text-lg text-gray-900 truncate">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-xs text-gray-600 truncate">
                  {subtitle}
                </p>
              )}
            </div>

            {/* Settings and Accessibility */}
            <div className="flex items-center gap-2">
              {/* Accessibility Menu */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    aria-label="Accessibility options"
                    className="p-2"
                  >
                    <Accessibility size={20} />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <AccessibilityControls />
                </SheetContent>
              </Sheet>

              {/* Settings */}
              {showSettings && (
                <Sheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                  <SheetTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      aria-label="Open settings"
                      className="p-2"
                    >
                      <Settings size={20} />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-80">
                    <div className="pt-6">
                      {settingsContent || (
                        <div className="space-y-4">
                          <h2 className="text-xl font-bold">Settings</h2>
                          <p className="text-gray-600">Settings content goes here</p>
                        </div>
                      )}
                    </div>
                  </SheetContent>
                </Sheet>
              )}
            </div>
          </div>
        </motion.header>
      )}

      {/* Desktop Header */}
      {viewport.isDesktop && (title || subtitle) && (
        <motion.header
          {...animationVariants}
          className="bg-white border-b"
        >
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                {title && (
                  <h1 className="text-2xl font-bold text-gray-900">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="text-gray-600 mt-1">
                    {subtitle}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-4">
                {/* Fullscreen Toggle */}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleFullscreenToggle}
                  aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                >
                  {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                </Button>

                {/* Accessibility Menu */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      aria-label="Accessibility options"
                    >
                      <Accessibility size={20} />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right">
                    <AccessibilityControls />
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </motion.header>
      )}

      {/* Main Content */}
      <motion.main
        {...animationVariants}
        className={cn(
          'flex-1',
          viewport.isMobile ? 'p-4' : 'container mx-auto px-6 py-8'
        )}
        style={{
          minHeight: viewport.isMobile ? 'calc(100vh - 80px)' : 'calc(100vh - 120px)'
        }}
      >
        {children}
      </main>

      {/* Focus Skip Link for Screen Readers */}
      <a
        href="#main-content"
        className={cn(
          'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4',
          'z-[100] bg-blue-600 text-white px-4 py-2 rounded-md',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
        )}
      >
        Skip to main content
      </a>

      {/* Screen Reader Announcements */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        id="screen-reader-announcements"
      />

      {/* Responsive Debugging (Development Only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-black/80 text-white text-xs p-2 rounded font-mono">
          <div>
            {viewport.width}x{viewport.height} |
            {viewport.isMobile && ' Mobile'}
            {viewport.isTablet && ' Tablet'}
            {viewport.isDesktop && ' Desktop'} |
            {viewport.orientation}
          </div>
          <div>Font: {fontSize}px | Motion: {accessibilityMode.reducedMotion ? 'Reduced' : 'Full'}</div>
        </div>
      )}
    </div>
  )
}

// Utility hook for responsive values
export function useResponsiveValue<T>(values: {
  mobile: T
  tablet?: T
  desktop?: T
}): T {
  const [viewport, setViewport] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const updateViewport = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight })
    }

    updateViewport()
    window.addEventListener('resize', updateViewport)
    return () => window.removeEventListener('resize', updateViewport)
  }, [])

  if (viewport.width >= 1024) {
    return values.desktop || values.tablet || values.mobile
  }
  if (viewport.width >= 768) {
    return values.tablet || values.mobile
  }
  return values.mobile
}