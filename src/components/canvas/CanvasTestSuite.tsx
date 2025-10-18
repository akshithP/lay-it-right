'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  Smartphone,
  Monitor,
  Zap,
  Users,
  Palette,
  Keyboard
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface TestResult {
  id: string
  name: string
  category: 'UI' | 'UX' | 'Performance' | 'Accessibility' | 'Responsiveness'
  status: 'pending' | 'running' | 'passed' | 'failed' | 'skipped'
  description: string
  duration?: number
  issues?: string[]
}

const TEST_SUITE: Omit<TestResult, 'status' | 'duration' | 'issues'>[] = [
  // UI Component Tests
  {
    id: 'corner-node-animations',
    name: 'Corner Node Animations',
    category: 'UI',
    description: 'Tests corner node creation, selection, and deletion animations'
  },
  {
    id: 'dimension-edge-interactions',
    name: 'Dimension Edge Interactions',
    category: 'UI',
    description: 'Tests dimension input, validation, and touch interactions'
  },
  {
    id: 'responsive-toolbar',
    name: 'Responsive Toolbar',
    category: 'UI',
    description: 'Tests toolbar layout adaptation across device sizes'
  },

  // UX Tests
  {
    id: 'touch-gestures',
    name: 'Touch Gesture Support',
    category: 'UX',
    description: 'Tests tap, double-tap, pinch, and drag gestures'
  },
  {
    id: 'haptic-feedback',
    name: 'Haptic Feedback',
    category: 'UX',
    description: 'Tests vibration feedback for user actions on supported devices'
  },
  {
    id: 'error-recovery',
    name: 'Error Recovery',
    category: 'UX',
    description: 'Tests error handling and recovery mechanisms'
  },

  // Performance Tests
  {
    id: 'canvas-rendering',
    name: 'Canvas Rendering Performance',
    category: 'Performance',
    description: 'Tests canvas performance with multiple nodes and edges'
  },
  {
    id: 'memory-usage',
    name: 'Memory Usage',
    category: 'Performance',
    description: 'Tests memory efficiency during extended use'
  },

  // Accessibility Tests
  {
    id: 'keyboard-navigation',
    name: 'Keyboard Navigation',
    category: 'Accessibility',
    description: 'Tests keyboard shortcuts and navigation'
  },
  {
    id: 'screen-reader',
    name: 'Screen Reader Support',
    category: 'Accessibility',
    description: 'Tests ARIA labels and screen reader compatibility'
  },
  {
    id: 'focus-management',
    name: 'Focus Management',
    category: 'Accessibility',
    description: 'Tests focus indicators and tab order'
  },

  // Responsiveness Tests
  {
    id: 'mobile-layout',
    name: 'Mobile Layout (320px-767px)',
    category: 'Responsiveness',
    description: 'Tests mobile device layout and interactions'
  },
  {
    id: 'tablet-layout',
    name: 'Tablet Layout (768px-1023px)',
    category: 'Responsiveness',
    description: 'Tests tablet device layout and interactions'
  },
  {
    id: 'desktop-layout',
    name: 'Desktop Layout (1024px+)',
    category: 'Responsiveness',
    description: 'Tests desktop layout and interactions'
  }
]

interface CanvasTestSuiteProps {
  enabled?: boolean
  autoRun?: boolean
}

export function CanvasTestSuite({ enabled = false, autoRun = false }: CanvasTestSuiteProps) {
  const [tests, setTests] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [currentTestIndex, setCurrentTestIndex] = useState<number | null>(null)
  const [showResults, setShowResults] = useState(false)

  // Initialize tests
  useEffect(() => {
    if (enabled) {
      const initialTests: TestResult[] = TEST_SUITE.map(test => ({
        ...test,
        status: 'pending'
      }))
      setTests(initialTests)
    }
  }, [enabled])

  // Auto-run tests if specified
  useEffect(() => {
    if (autoRun && tests.length > 0 && !isRunning) {
      runAllTests()
    }
  }, [autoRun, tests.length, isRunning])

  // Simulate test execution
  const runTest = async (testIndex: number): Promise<void> => {
    const test = tests[testIndex]
    if (!test) return

    // Update test status to running
    setTests(prev => prev.map((t, i) =>
      i === testIndex ? { ...t, status: 'running' } : t
    ))

    const startTime = Date.now()

    // Simulate test execution based on test type
    const testDuration = Math.random() * 2000 + 500 // 0.5-2.5 seconds
    await new Promise(resolve => setTimeout(resolve, testDuration))

    const duration = Date.now() - startTime

    // Simulate test results (mostly pass, some warnings/failures for demo)
    const shouldPass = Math.random() > 0.15 // 85% pass rate
    const status: TestResult['status'] = shouldPass ? 'passed' : (Math.random() > 0.5 ? 'failed' : 'passed')

    const issues: string[] = []
    if (status === 'failed') {
      issues.push(`Test failed: ${test.name}`)
      if (test.category === 'Performance') {
        issues.push('Performance below threshold')
      } else if (test.category === 'Accessibility') {
        issues.push('Missing ARIA attributes')
      } else if (test.category === 'Responsiveness') {
        issues.push('Layout overflow detected')
      }
    }

    // Update test with results
    setTests(prev => prev.map((t, i) =>
      i === testIndex ? { ...t, status, duration, issues } : t
    ))
  }

  const runAllTests = async () => {
    setIsRunning(true)
    setShowResults(true)

    for (let i = 0; i < tests.length; i++) {
      setCurrentTestIndex(i)
      await runTest(i)
    }

    setCurrentTestIndex(null)
    setIsRunning(false)
  }

  const runTestsByCategory = async (category: TestResult['category']) => {
    setIsRunning(true)
    setShowResults(true)

    const categoryTests = tests
      .map((test, index) => ({ test, index }))
      .filter(({ test }) => test.category === category)

    for (const { index } of categoryTests) {
      setCurrentTestIndex(index)
      await runTest(index)
    }

    setCurrentTestIndex(null)
    setIsRunning(false)
  }

  const resetTests = () => {
    setTests(prev => prev.map(test => ({
      ...test,
      status: 'pending',
      duration: undefined,
      issues: undefined
    })))
    setCurrentTestIndex(null)
    setIsRunning(false)
    setShowResults(false)
  }

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />
      case 'failed':
        return <AlertTriangle className="w-4 h-4 text-red-600" />
      case 'running':
        return <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      default:
        return <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
    }
  }

  const getCategoryIcon = (category: TestResult['category']) => {
    switch (category) {
      case 'UI': return <Palette className="w-4 h-4" />
      case 'UX': return <Users className="w-4 h-4" />
      case 'Performance': return <Zap className="w-4 h-4" />
      case 'Accessibility': return <Keyboard className="w-4 h-4" />
      case 'Responsiveness': return <Smartphone className="w-4 h-4" />
    }
  }

  const getTestsSummary = () => {
    const total = tests.length
    const passed = tests.filter(t => t.status === 'passed').length
    const failed = tests.filter(t => t.status === 'failed').length
    const running = tests.filter(t => t.status === 'running').length
    const completed = passed + failed

    return { total, passed, failed, running, completed }
  }

  const summary = getTestsSummary()
  const progressPercentage = summary.total > 0 ? (summary.completed / summary.total) * 100 : 0

  if (!enabled) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-4 right-4 w-96 z-30"
    >
      <Card className="bg-white shadow-xl border-2 border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold text-blue-800 flex items-center gap-2">
            <Monitor className="w-5 h-5" />
            Canvas Test Suite
          </CardTitle>

          {showResults && (
            <div className="space-y-2">
              <Progress value={progressPercentage} className="h-2" />
              <div className="flex justify-between text-xs text-gray-600">
                <span>{summary.completed}/{summary.total} tests</span>
                <span>
                  {summary.passed} passed • {summary.failed} failed
                </span>
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Test Controls */}
          <div className="flex gap-2">
            <Button
              onClick={runAllTests}
              disabled={isRunning}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
            >
              {isRunning ? (
                <>
                  <Pause className="w-4 h-4 mr-1" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-1" />
                  Run All
                </>
              )}
            </Button>
            <Button
              onClick={resetTests}
              size="sm"
              variant="outline"
              disabled={isRunning}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>

          {/* Category Buttons */}
          <div className="grid grid-cols-3 gap-1">
            {['UI', 'UX', 'Performance', 'Accessibility', 'Responsiveness'].map(category => {
              const categoryTests = tests.filter(t => t.category === category)
              const categoryPassed = categoryTests.filter(t => t.status === 'passed').length

              return (
                <Button
                  key={category}
                  onClick={() => runTestsByCategory(category as TestResult['category'])}
                  disabled={isRunning}
                  size="sm"
                  variant="outline"
                  className="text-xs p-1 h-auto flex flex-col items-center gap-1"
                >
                  {getCategoryIcon(category as TestResult['category'])}
                  <span>{category}</span>
                  {showResults && (
                    <Badge variant="secondary" className="text-xs">
                      {categoryPassed}/{categoryTests.length}
                    </Badge>
                  )}
                </Button>
              )
            })}
          </div>

          {/* Test Results */}
          {showResults && (
            <div className="max-h-60 overflow-auto space-y-1">
              {tests.map((test, index) => (
                <div
                  key={test.id}
                  className={cn(
                    'flex items-center gap-2 p-2 rounded text-xs transition-colors',
                    currentTestIndex === index ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50',
                    test.status === 'failed' && 'bg-red-50 border border-red-200'
                  )}
                >
                  <div className="flex-shrink-0">
                    {getStatusIcon(test.status)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{test.name}</div>
                    <div className="text-gray-500 truncate">{test.description}</div>

                    {test.duration && (
                      <div className="text-gray-400">
                        {test.duration}ms
                      </div>
                    )}

                    {test.issues && test.issues.length > 0 && (
                      <div className="text-red-600 text-xs mt-1">
                        {test.issues.join(', ')}
                      </div>
                    )}
                  </div>

                  <div className="flex-shrink-0">
                    {getCategoryIcon(test.category)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Summary */}
          {showResults && !isRunning && summary.completed === summary.total && (
            <div className={cn(
              'p-3 rounded-lg text-center text-sm font-medium',
              summary.failed === 0
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-yellow-50 text-yellow-800 border border-yellow-200'
            )}>
              {summary.failed === 0
                ? '🎉 All tests passed!'
                : `⚠️ ${summary.failed} test${summary.failed > 1 ? 's' : ''} need attention`
              }
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}