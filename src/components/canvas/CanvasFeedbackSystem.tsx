'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle2,
  AlertCircle,
  Info,
  X,
  Wifi,
  WifiOff,
  AlertTriangle,
  Loader2,
  Zap
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Types for feedback system
export type FeedbackType = 'success' | 'error' | 'warning' | 'info' | 'loading'
export type FeedbackPosition = 'top-right' | 'top-center' | 'bottom-right' | 'bottom-center' | 'top-left' | 'bottom-left'

export interface FeedbackMessage {
  id: string
  type: FeedbackType
  title: string
  description?: string
  duration?: number
  persistent?: boolean
  action?: {
    label: string
    onClick: () => void
  }
  haptic?: boolean
}

export interface SystemStatus {
  online: boolean
  performance: 'good' | 'moderate' | 'poor'
  errors: number
  warnings: number
}

interface FeedbackContextType {
  // Toast management
  messages: FeedbackMessage[]
  showMessage: (message: Omit<FeedbackMessage, 'id'>) => string
  hideMessage: (id: string) => void
  clearAll: () => void

  // System status
  systemStatus: SystemStatus
  updateSystemStatus: (status: Partial<SystemStatus>) => void

  // Quick feedback methods
  showSuccess: (title: string, description?: string, options?: Partial<FeedbackMessage>) => void
  showError: (title: string, description?: string, options?: Partial<FeedbackMessage>) => void
  showWarning: (title: string, description?: string, options?: Partial<FeedbackMessage>) => void
  showInfo: (title: string, description?: string, options?: Partial<FeedbackMessage>) => void
  showLoading: (title: string, description?: string) => string
}

const FeedbackContext = createContext<FeedbackContextType | null>(null)

export function useFeedback() {
  const context = useContext(FeedbackContext)
  if (!context) {
    throw new Error('useFeedback must be used within a FeedbackProvider')
  }
  return context
}

interface FeedbackProviderProps {
  children: React.ReactNode
  position?: FeedbackPosition
  maxMessages?: number
}

export function FeedbackProvider({
  children,
  position = 'top-right',
  maxMessages = 5
}: FeedbackProviderProps) {
  const [messages, setMessages] = useState<FeedbackMessage[]>([])
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    online: navigator.onLine,
    performance: 'good',
    errors: 0,
    warnings: 0
  })

  // Auto-remove messages after duration
  useEffect(() => {
    const timers: NodeJS.Timeout[] = []

    messages.forEach((message) => {
      if (!message.persistent && message.duration !== 0) {
        const timer = setTimeout(() => {
          hideMessage(message.id)
        }, message.duration || 5000)
        timers.push(timer)
      }
    })

    return () => {
      timers.forEach(clearTimeout)
    }
  }, [messages])

  // Monitor network status
  useEffect(() => {
    const updateOnlineStatus = () => {
      setSystemStatus(prev => ({ ...prev, online: navigator.onLine }))
    }

    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)

    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    }
  }, [])

  const generateId = () => `feedback-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`

  const triggerHaptic = useCallback((pattern: number | number[] = 50) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern)
    }
  }, [])

  const showMessage = useCallback((message: Omit<FeedbackMessage, 'id'>) => {
    const id = generateId()
    const fullMessage: FeedbackMessage = {
      ...message,
      id,
      duration: message.duration ?? (message.type === 'loading' ? 0 : 5000)
    }

    // Trigger haptic feedback
    if (message.haptic !== false) {
      switch (message.type) {
        case 'success':
          triggerHaptic(50)
          break
        case 'error':
          triggerHaptic([100, 50, 100])
          break
        case 'warning':
          triggerHaptic([50, 50, 50])
          break
        default:
          triggerHaptic(25)
      }
    }

    setMessages(prev => {
      const updated = [fullMessage, ...prev]
      return updated.slice(0, maxMessages)
    })

    // Update system status counters
    if (message.type === 'error') {
      setSystemStatus(prev => ({ ...prev, errors: prev.errors + 1 }))
    } else if (message.type === 'warning') {
      setSystemStatus(prev => ({ ...prev, warnings: prev.warnings + 1 }))
    }

    return id
  }, [maxMessages, triggerHaptic])

  const hideMessage = useCallback((id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    setMessages([])
  }, [])

  const updateSystemStatus = useCallback((status: Partial<SystemStatus>) => {
    setSystemStatus(prev => ({ ...prev, ...status }))
  }, [])

  // Quick feedback methods
  const showSuccess = useCallback((title: string, description?: string, options?: Partial<FeedbackMessage>) => {
    showMessage({ type: 'success', title, description, ...options })
  }, [showMessage])

  const showError = useCallback((title: string, description?: string, options?: Partial<FeedbackMessage>) => {
    showMessage({ type: 'error', title, description, persistent: true, ...options })
  }, [showMessage])

  const showWarning = useCallback((title: string, description?: string, options?: Partial<FeedbackMessage>) => {
    showMessage({ type: 'warning', title, description, ...options })
  }, [showMessage])

  const showInfo = useCallback((title: string, description?: string, options?: Partial<FeedbackMessage>) => {
    showMessage({ type: 'info', title, description, ...options })
  }, [showMessage])

  const showLoading = useCallback((title: string, description?: string) => {
    return showMessage({ type: 'loading', title, description, persistent: true })
  }, [showMessage])

  const contextValue: FeedbackContextType = {
    messages,
    showMessage,
    hideMessage,
    clearAll,
    systemStatus,
    updateSystemStatus,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showLoading
  }

  return (
    <FeedbackContext.Provider value={contextValue}>
      {children}
      <FeedbackDisplay position={position} />
      <SystemStatusIndicator />
    </FeedbackContext.Provider>
  )
}

// Toast message component
function FeedbackMessage({ message, onClose }: { message: FeedbackMessage; onClose: () => void }) {
  const getIcon = () => {
    switch (message.type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />
      case 'info':
        return <Info className="w-5 h-5 text-blue-600" />
      case 'loading':
        return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
    }
  }

  const getBorderColor = () => {
    switch (message.type) {
      case 'success':
        return 'border-green-200'
      case 'error':
        return 'border-red-200'
      case 'warning':
        return 'border-yellow-200'
      case 'info':
        return 'border-blue-200'
      case 'loading':
        return 'border-blue-200'
    }
  }

  const getBackgroundColor = () => {
    switch (message.type) {
      case 'success':
        return 'bg-green-50'
      case 'error':
        return 'bg-red-50'
      case 'warning':
        return 'bg-yellow-50'
      case 'info':
        return 'bg-blue-50'
      case 'loading':
        return 'bg-blue-50'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={cn(
        'relative w-full max-w-md bg-white rounded-lg border-2 shadow-lg p-4',
        getBorderColor(),
        getBackgroundColor()
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 text-sm leading-5">
            {message.title}
          </h4>
          {message.description && (
            <p className="mt-1 text-sm text-gray-600 leading-5">
              {message.description}
            </p>
          )}
          {message.action && (
            <button
              onClick={message.action.onClick}
              className="mt-2 text-sm font-medium text-layit-blue hover:text-layit-orange transition-colors"
            >
              {message.action.label}
            </button>
          )}
        </div>

        {!message.persistent && (
          <button
            onClick={onClose}
            className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Progress bar for non-persistent messages */}
      {!message.persistent && message.duration && message.type !== 'loading' && (
        <motion.div
          className="absolute bottom-0 left-0 h-1 bg-current opacity-30 rounded-b-lg"
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: (message.duration || 5000) / 1000, ease: 'linear' }}
        />
      )}
    </motion.div>
  )
}

// Toast display container
function FeedbackDisplay({ position }: { position: FeedbackPosition }) {
  const { messages, hideMessage } = useFeedback()

  const getPositionClasses = () => {
    switch (position) {
      case 'top-right':
        return 'top-4 right-4'
      case 'top-center':
        return 'top-4 left-1/2 -translate-x-1/2'
      case 'top-left':
        return 'top-4 left-4'
      case 'bottom-right':
        return 'bottom-4 right-4'
      case 'bottom-center':
        return 'bottom-4 left-1/2 -translate-x-1/2'
      case 'bottom-left':
        return 'bottom-4 left-4'
    }
  }

  return (
    <div className={cn('fixed z-50 pointer-events-none', getPositionClasses())}>
      <div className="flex flex-col gap-2 pointer-events-auto">
        <AnimatePresence>
          {messages.map((message) => (
            <FeedbackMessage
              key={message.id}
              message={message}
              onClose={() => hideMessage(message.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

// System status indicator
function SystemStatusIndicator() {
  const { systemStatus } = useFeedback()
  const [showDetails, setShowDetails] = useState(false)

  const getStatusColor = () => {
    if (!systemStatus.online) return 'text-red-500'
    if (systemStatus.errors > 0) return 'text-red-500'
    if (systemStatus.warnings > 0) return 'text-yellow-500'
    if (systemStatus.performance === 'poor') return 'text-red-500'
    if (systemStatus.performance === 'moderate') return 'text-yellow-500'
    return 'text-green-500'
  }

  const getPerformanceIcon = () => {
    switch (systemStatus.performance) {
      case 'good':
        return <Zap className="w-3 h-3" />
      case 'moderate':
        return <AlertTriangle className="w-3 h-3" />
      case 'poor':
        return <AlertCircle className="w-3 h-3" />
    }
  }

  return (
    <div className="fixed bottom-4 left-4 z-40">
      <button
        onClick={() => setShowDetails(!showDetails)}
        className={cn(
          'flex items-center gap-2 bg-white rounded-full border-2 px-3 py-1 shadow-md transition-all duration-200 hover:scale-105',
          'border-gray-200 text-gray-600 hover:border-gray-300'
        )}
        title="System Status"
      >
        {systemStatus.online ? (
          <Wifi className={cn('w-4 h-4', getStatusColor())} />
        ) : (
          <WifiOff className="w-4 h-4 text-red-500" />
        )}
        <span className="text-xs font-medium">Status</span>
      </button>

      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-full mb-2 bg-white rounded-lg border shadow-lg p-3 min-w-48"
          >
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span>Connection:</span>
                <span className={cn('font-medium', systemStatus.online ? 'text-green-600' : 'text-red-600')}>
                  {systemStatus.online ? 'Online' : 'Offline'}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span>Performance:</span>
                <div className={cn('flex items-center gap-1 font-medium', getStatusColor())}>
                  {getPerformanceIcon()}
                  <span className="capitalize">{systemStatus.performance}</span>
                </div>
              </div>

              {systemStatus.errors > 0 && (
                <div className="flex justify-between items-center">
                  <span>Errors:</span>
                  <span className="font-medium text-red-600">{systemStatus.errors}</span>
                </div>
              )}

              {systemStatus.warnings > 0 && (
                <div className="flex justify-between items-center">
                  <span>Warnings:</span>
                  <span className="font-medium text-yellow-600">{systemStatus.warnings}</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Hook for canvas-specific feedback
export function useCanvasFeedback() {
  const feedback = useFeedback()

  const showNodeAdded = useCallback((nodeLabel: string) => {
    feedback.showSuccess('Corner Added', `Point ${nodeLabel} placed successfully`)
  }, [feedback])

  const showNodeRemoved = useCallback((nodeLabel: string) => {
    feedback.showInfo('Corner Removed', `Point ${nodeLabel} has been deleted`)
  }, [feedback])

  const showDimensionAdded = useCallback((dimension: number, unit: string) => {
    feedback.showSuccess('Dimension Added', `${dimension} ${unit} has been set`)
  }, [feedback])

  const showValidationError = useCallback((message: string) => {
    feedback.showError('Validation Error', message, {
      action: {
        label: 'Fix Layout',
        onClick: () => {
          // Could trigger specific validation guidance
        }
      }
    })
  }, [feedback])

  const showLayoutComplete = useCallback(() => {
    feedback.showSuccess('Layout Complete!', 'Your custom layout is ready for tiling calculations', {
      haptic: true,
      duration: 7000
    })
  }, [feedback])

  const showOperationInProgress = useCallback((operation: string) => {
    return feedback.showLoading('Processing', operation)
  }, [feedback])

  return {
    ...feedback,
    showNodeAdded,
    showNodeRemoved,
    showDimensionAdded,
    showValidationError,
    showLayoutComplete,
    showOperationInProgress
  }
}