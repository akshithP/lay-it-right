'use client'

import { useCallback, Suspense } from 'react'
import { SimpleReactFlowCanvas } from './SimpleReactFlowCanvas'
import { CanvasErrorBoundary } from './CanvasErrorBoundary'
import { FeedbackProvider } from './CanvasFeedbackSystem'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import type { LayoutNode, LayoutEdge } from '@/types/canvas'
import type { CustomLayoutPoint } from '@/types'

interface DrawingCanvasWrapperProps {
  className?: string
  onLayoutComplete?: (points: CustomLayoutPoint[]) => void
}

// Loading fallback component
function CanvasLoadingFallback() {
  return (
    <Card className="bg-white border-3 border-layit-blue">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-layit-blue flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          LOADING CANVAS
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center h-96 bg-slate-50 rounded-lg border-2 border-layit-blue">
          <div className="text-center text-layit-blue">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="font-medium">Initializing drawing canvas...</p>
            <p className="text-sm opacity-70 mt-1">This may take a moment on first load</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Wrapper component that bridges the old DrawingCanvas interface
 * with the new ReactFlow-based implementation.
 *
 * Includes error boundary, loading states, and accessibility features.
 */
export function DrawingCanvasWrapper({
  className,
  onLayoutComplete
}: DrawingCanvasWrapperProps) {
  const handleReactFlowComplete = useCallback(
    (layoutData: { nodes: LayoutNode[]; edges: LayoutEdge[] }) => {
      // Enhanced conversion with validation and proper coordinate handling
      try {
        // Sort nodes by creation order (using node ID timestamp) for consistent polygon order
        const sortedNodes = [...layoutData.nodes].sort((a, b) => {
          const aId = parseInt(a.id.split('-')[1] || '0')
          const bId = parseInt(b.id.split('-')[1] || '0')
          return aId - bId
        })

        // Convert React Flow nodes to CustomLayoutPoint format for backward compatibility
        const points: CustomLayoutPoint[] = sortedNodes.map(node => ({
          x: Math.round(node.position.x * 100) / 100, // Round to 2 decimal places
          y: Math.round(node.position.y * 100) / 100
        }))

        // Validate minimum points requirement
        if (points.length < 3) {
          console.warn('Canvas: Insufficient points for layout completion', { points: points.length })
          return
        }

        console.log('Canvas: Completing layout with points:', points)
        onLayoutComplete?.(points)
      } catch (error) {
        console.error('Canvas: Error processing layout completion:', error)

        // Fallback to basic conversion
        const fallbackPoints: CustomLayoutPoint[] = layoutData.nodes.map(node => ({
          x: node.position.x,
          y: node.position.y
        }))

        onLayoutComplete?.(fallbackPoints)
      }
    },
    [onLayoutComplete]
  )

  const handleCanvasError = useCallback((error: Error, errorInfo: React.ErrorInfo) => {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Canvas Error:', error)
      console.error('Error Info:', errorInfo)
    }

    // In production, you might want to send this to an error reporting service
    // Example: Sentry.captureException(error, { extra: errorInfo })
  }, [])

  return (
    <FeedbackProvider position="top-right" maxMessages={3}>
      <div className={className} role="application" aria-label="Custom layout drawing canvas">
        <CanvasErrorBoundary onError={handleCanvasError}>
          <Suspense fallback={<CanvasLoadingFallback />}>
            <SimpleReactFlowCanvas
              onLayoutComplete={handleReactFlowComplete}
              className="w-full"
            />
          </Suspense>
        </CanvasErrorBoundary>
      </div>
    </FeedbackProvider>
  )
}