'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Smartphone,
  Tablet,
  Monitor,
  Tv,
  Eye,
  EyeOff,
  RotateCcw,
  Ruler,
  CheckCircle2,
  AlertTriangle,
  Info
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

// Standard device breakpoints for testing
const DEVICE_BREAKPOINTS = [
  // Mobile devices
  { name: 'iPhone SE', width: 320, height: 568, category: 'mobile', icon: <Smartphone className="w-4 h-4" /> },
  { name: 'iPhone 12', width: 390, height: 844, category: 'mobile', icon: <Smartphone className="w-4 h-4" /> },
  { name: 'iPhone 12 Pro Max', width: 428, height: 926, category: 'mobile', icon: <Smartphone className="w-4 h-4" /> },
  { name: 'Samsung Galaxy S20', width: 360, height: 800, category: 'mobile', icon: <Smartphone className="w-4 h-4" /> },

  // Tablets
  { name: 'iPad Mini', width: 768, height: 1024, category: 'tablet', icon: <Tablet className="w-4 h-4" /> },
  { name: 'iPad Air', width: 820, height: 1180, category: 'tablet', icon: <Tablet className="w-4 h-4" /> },
  { name: 'iPad Pro 11"', width: 834, height: 1194, category: 'tablet', icon: <Tablet className="w-4 h-4" /> },
  { name: 'iPad Pro 12.9"', width: 1024, height: 1366, category: 'tablet', icon: <Tablet className="w-4 h-4" /> },

  // Laptops & Desktops
  { name: 'Laptop Small', width: 1366, height: 768, category: 'desktop', icon: <Monitor className="w-4 h-4" /> },
  { name: 'Laptop Medium', width: 1440, height: 900, category: 'desktop', icon: <Monitor className="w-4 h-4" /> },
  { name: 'Desktop 1080p', width: 1920, height: 1080, category: 'desktop', icon: <Monitor className="w-4 h-4" /> },
  { name: 'Desktop 1440p', width: 2560, height: 1440, category: 'desktop', icon: <Tv className="w-4 h-4" /> },
  { name: 'Desktop 4K', width: 3840, height: 2160, category: 'desktop', icon: <Tv className="w-4 h-4" /> },
]

interface ResponsiveTest {
  device: typeof DEVICE_BREAKPOINTS[0]
  status: 'pending' | 'testing' | 'passed' | 'failed' | 'warning'
  issues: string[]
  timestamp?: number
}

interface ResponsiveTestingPanelProps {
  onDeviceChange?: (device: { width: number; height: number }) => void
  enabled?: boolean
}

export function ResponsiveTestingPanel({ onDeviceChange, enabled = false }: ResponsiveTestingPanelProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [currentViewport, setCurrentViewport] = useState({ width: window.innerWidth, height: window.innerHeight })
  const [tests, setTests] = useState<ResponsiveTest[]>([])
  const [currentTestIndex, setCurrentTestIndex] = useState<number | null>(null)
  const [isAutoTesting, setIsAutoTesting] = useState(false)

  // Monitor viewport changes
  useEffect(() => {
    const handleResize = () => {
      setCurrentViewport({ width: window.innerWidth, height: window.innerHeight })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Initialize tests
  useEffect(() => {
    if (enabled) {
      const initialTests: ResponsiveTest[] = DEVICE_BREAKPOINTS.map(device => ({
        device,
        status: 'pending',
        issues: []
      }))
      setTests(initialTests)
    }
  }, [enabled])

  // Auto-test functionality
  useEffect(() => {
    if (!isAutoTesting || currentTestIndex === null) return

    const currentTest = tests[currentTestIndex]
    if (!currentTest || currentTest.status !== 'testing') return

    // Simulate device viewport
    onDeviceChange?.(currentTest.device)

    // Run automated checks after a delay to allow rendering
    const testTimeout = setTimeout(() => {
      const issues = runAutomatedChecks(currentTest.device)

      setTests(prev => prev.map((test, index) =>
        index === currentTestIndex
          ? {
              ...test,
              status: issues.length === 0 ? 'passed' : issues.length > 2 ? 'failed' : 'warning',
              issues,
              timestamp: Date.now()
            }
          : test
      ))

      // Move to next test
      const nextIndex = currentTestIndex + 1
      if (nextIndex < tests.length) {
        setCurrentTestIndex(nextIndex)
        setTests(prev => prev.map((test, index) =>
          index === nextIndex
            ? { ...test, status: 'testing' }
            : test
        ))
      } else {
        // Auto-testing complete
        setIsAutoTesting(false)
        setCurrentTestIndex(null)
      }
    }, 2000)

    return () => clearTimeout(testTimeout)
  }, [isAutoTesting, currentTestIndex, tests, onDeviceChange])

  // Automated responsive design checks
  const runAutomatedChecks = (device: typeof DEVICE_BREAKPOINTS[0]): string[] => {
    const issues: string[] = []

    // Check for horizontal scrolling
    if (document.documentElement.scrollWidth > device.width) {
      issues.push('Horizontal scrolling detected')
    }

    // Check for touch targets on mobile
    if (device.category === 'mobile') {
      const buttons = document.querySelectorAll('button')
      buttons.forEach(button => {
        const rect = button.getBoundingClientRect()
        if (rect.width < 44 || rect.height < 44) {
          issues.push(`Touch target too small: ${Math.round(rect.width)}x${Math.round(rect.height)}px`)
        }
      })
    }

    // Check for text readability
    const elements = document.querySelectorAll('p, span, div')
    elements.forEach(el => {
      const styles = window.getComputedStyle(el)
      const fontSize = parseFloat(styles.fontSize)

      if (device.category === 'mobile' && fontSize < 14) {
        issues.push(`Text too small: ${fontSize}px`)
      }
    })

    // Check for viewport meta tag
    const viewportMeta = document.querySelector('meta[name="viewport"]')
    if (!viewportMeta && device.category === 'mobile') {
      issues.push('Missing viewport meta tag')
    }

    // Check for canvas responsiveness
    const canvasElements = document.querySelectorAll('[role="img"]')
    canvasElements.forEach(canvas => {
      const rect = canvas.getBoundingClientRect()
      if (rect.width > device.width || rect.height > device.height) {
        issues.push(`Canvas exceeds viewport: ${Math.round(rect.width)}x${Math.round(rect.height)}px`)
      }
    })

    return issues.slice(0, 5) // Limit to 5 most important issues
  }

  const startAutoTesting = () => {
    setIsAutoTesting(true)
    setCurrentTestIndex(0)
    setTests(prev => prev.map((test, index) => ({
      ...test,
      status: index === 0 ? 'testing' : 'pending',
      issues: [],
      timestamp: undefined
    })))
  }

  const testSingleDevice = (deviceIndex: number) => {
    const device = DEVICE_BREAKPOINTS[deviceIndex]
    onDeviceChange?.(device)

    setTests(prev => prev.map((test, index) =>
      index === deviceIndex
        ? { ...test, status: 'testing' }
        : test
    ))

    setTimeout(() => {
      const issues = runAutomatedChecks(device)
      setTests(prev => prev.map((test, index) =>
        index === deviceIndex
          ? {
              ...test,
              status: issues.length === 0 ? 'passed' : issues.length > 2 ? 'failed' : 'warning',
              issues,
              timestamp: Date.now()
            }
          : test
      ))
    }, 1000)
  }

  const getStatusColor = (status: ResponsiveTest['status']) => {
    switch (status) {
      case 'passed': return 'text-green-600'
      case 'failed': return 'text-red-600'
      case 'warning': return 'text-yellow-600'
      case 'testing': return 'text-blue-600'
      default: return 'text-gray-400'
    }
  }

  const getStatusIcon = (status: ResponsiveTest['status']) => {
    switch (status) {
      case 'passed': return <CheckCircle2 className="w-4 h-4" />
      case 'failed': return <AlertTriangle className="w-4 h-4" />
      case 'warning': return <Info className="w-4 h-4" />
      case 'testing': return <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      default: return <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
    }
  }

  const getCurrentDeviceCategory = () => {
    if (currentViewport.width < 768) return 'mobile'
    if (currentViewport.width < 1024) return 'tablet'
    return 'desktop'
  }

  if (!enabled) return null

  return (
    <>
      {/* Toggle Button */}
      <Button
        onClick={() => setIsVisible(!isVisible)}
        className={cn(
          'fixed top-4 left-4 z-40',
          'bg-purple-600 hover:bg-purple-700 text-white',
          'shadow-lg transition-all duration-200'
        )}
        title="Responsive Testing Panel"
      >
        {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </Button>

      {/* Testing Panel */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, x: -300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            className="fixed left-4 top-16 z-30 w-80 max-h-[80vh] overflow-auto"
          >
            <Card className="bg-white shadow-xl border-2 border-purple-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-bold text-purple-800 flex items-center gap-2">
                  <Ruler className="w-5 h-5" />
                  Responsive Testing
                </CardTitle>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    Current: {currentViewport.width} × {currentViewport.height}
                  </span>
                  <Badge variant="secondary" className={cn(
                    getCurrentDeviceCategory() === 'mobile' && 'bg-blue-100 text-blue-800',
                    getCurrentDeviceCategory() === 'tablet' && 'bg-green-100 text-green-800',
                    getCurrentDeviceCategory() === 'desktop' && 'bg-purple-100 text-purple-800'
                  )}>
                    {getCurrentDeviceCategory()}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Test Controls */}
                <div className="flex gap-2">
                  <Button
                    onClick={startAutoTesting}
                    disabled={isAutoTesting}
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700 text-white flex-1"
                  >
                    {isAutoTesting ? 'Testing...' : 'Run All Tests'}
                  </Button>
                  <Button
                    onClick={() => setTests(prev => prev.map(test => ({
                      ...test,
                      status: 'pending',
                      issues: [],
                      timestamp: undefined
                    })))}
                    size="sm"
                    variant="outline"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>

                {/* Test Results by Category */}
                {['mobile', 'tablet', 'desktop'].map(category => {
                  const categoryTests = tests.filter(test => test.device.category === category)
                  const passedCount = categoryTests.filter(test => test.status === 'passed').length
                  const totalCount = categoryTests.length

                  return (
                    <div key={category} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-700 capitalize flex items-center gap-2">
                          {category === 'mobile' && <Smartphone className="w-4 h-4" />}
                          {category === 'tablet' && <Tablet className="w-4 h-4" />}
                          {category === 'desktop' && <Monitor className="w-4 h-4" />}
                          {category}
                        </h4>
                        <Badge variant="outline" className="text-xs">
                          {passedCount}/{totalCount}
                        </Badge>
                      </div>

                      <div className="space-y-1">
                        {categoryTests.map((test, index) => {
                          const deviceIndex = tests.findIndex(t => t.device === test.device)
                          return (
                            <div
                              key={test.device.name}
                              className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs hover:bg-gray-100 transition-colors"
                            >
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <div className={cn('flex-shrink-0', getStatusColor(test.status))}>
                                  {getStatusIcon(test.status)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium truncate">{test.device.name}</div>
                                  <div className="text-gray-500">
                                    {test.device.width} × {test.device.height}
                                  </div>
                                  {test.issues.length > 0 && (
                                    <div className="text-red-600 text-xs mt-1">
                                      {test.issues.slice(0, 2).join(', ')}
                                      {test.issues.length > 2 && ` +${test.issues.length - 2} more`}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <Button
                                onClick={() => testSingleDevice(deviceIndex)}
                                disabled={isAutoTesting}
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0 text-purple-600 hover:text-purple-700"
                              >
                                {test.device.icon}
                              </Button>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}

                {/* Testing Summary */}
                {tests.some(test => test.status !== 'pending') && (
                  <div className="pt-3 border-t text-xs text-gray-600">
                    <div className="flex justify-between mb-1">
                      <span>Passed:</span>
                      <span className="text-green-600 font-medium">
                        {tests.filter(test => test.status === 'passed').length}
                      </span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span>Warnings:</span>
                      <span className="text-yellow-600 font-medium">
                        {tests.filter(test => test.status === 'warning').length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Failed:</span>
                      <span className="text-red-600 font-medium">
                        {tests.filter(test => test.status === 'failed').length}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}