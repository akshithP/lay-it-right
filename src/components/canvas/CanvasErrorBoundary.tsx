'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface CanvasErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

interface CanvasErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

export class CanvasErrorBoundary extends React.Component<
  CanvasErrorBoundaryProps,
  CanvasErrorBoundaryState
> {
  constructor(props: CanvasErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): CanvasErrorBoundaryState {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Canvas Error Boundary caught an error:', error, errorInfo)

    this.setState({
      error,
      errorInfo,
    })

    // Call the optional onError callback
    this.props.onError?.(error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      const { fallback: Fallback } = this.props

      if (Fallback && this.state.error) {
        return <Fallback error={this.state.error} retry={this.handleRetry} />
      }

      return <DefaultErrorFallback error={this.state.error} retry={this.handleRetry} />
    }

    return this.props.children
  }
}

interface DefaultErrorFallbackProps {
  error?: Error
  retry: () => void
}

function DefaultErrorFallback({ error, retry }: DefaultErrorFallbackProps) {
  return (
    <Card className="bg-white border-3 border-red-400">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-red-600 flex items-center gap-2">
          <AlertTriangle className="w-6 h-6" />
          CANVAS ERROR
        </CardTitle>
        <CardDescription className="font-medium text-red-500">
          Something went wrong with the drawing canvas
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
          <h4 className="font-medium text-red-800 mb-2">Error Details:</h4>
          <p className="text-sm text-red-700 font-mono break-all">
            {error?.message || 'Unknown error occurred'}
          </p>
        </div>

        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-2">What you can do:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Try refreshing the canvas using the button below</li>
            <li>• Check your internet connection</li>
            <li>• Try using a different browser if the problem persists</li>
            <li>• Contact support if you continue to experience issues</li>
          </ul>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={retry}
            className="bg-layit-blue text-white hover:bg-layit-orange flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Retry Canvas
          </Button>

          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="border-layit-blue text-layit-blue hover:bg-layit-yellow"
          >
            Refresh Page
          </Button>
        </div>

        {/* Development error info */}
        {process.env.NODE_ENV === 'development' && error?.stack && (
          <details className="mt-4">
            <summary className="cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-800">
              Stack Trace (Development)
            </summary>
            <pre className="mt-2 text-xs text-gray-600 bg-gray-100 p-3 rounded overflow-auto max-h-40">
              {error.stack}
            </pre>
          </details>
        )}
      </CardContent>
    </Card>
  )
}

// Hook for using error boundary in functional components
export function useCanvasErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null)

  React.useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      // Only handle canvas-related errors
      if (event.error && (
        event.error.message?.includes('ReactFlow') ||
        event.error.message?.includes('canvas') ||
        event.filename?.includes('reactflow')
      )) {
        setError(event.error)
      }
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      // Handle promise rejections that might be canvas-related
      if (event.reason && typeof event.reason === 'object' && 'message' in event.reason) {
        const message = event.reason.message as string
        if (message.includes('ReactFlow') || message.includes('canvas')) {
          setError(new Error(message))
        }
      }
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  const clearError = React.useCallback(() => {
    setError(null)
  }, [])

  return { error, clearError }
}