'use client'

import { memo, useState, useCallback, useRef, useEffect } from 'react'
import { BaseEdge, getBezierPath, type EdgeProps } from '@xyflow/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Check, X, Edit3, Ruler, Smartphone } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCanvasStore } from '@/stores/canvas-store'
import type { LayoutEdgeData } from '@/types/canvas'
import type { Unit } from '@/types'

interface DimensionEdgeProps extends Omit<EdgeProps, 'data'> {
  data?: LayoutEdgeData
}

export const DimensionEdge = memo(function DimensionEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data
}: DimensionEdgeProps) {
  const { updateEdgeDimension } = useCanvasStore()
  const [isEditing, setIsEditing] = useState(data?.isBeingEdited || false)
  const [tempDimension, setTempDimension] = useState(data?.dimension?.toString() || '')
  const [tempUnit, setTempUnit] = useState<Unit>(data?.unit || 'm')
  const [validationError, setValidationError] = useState<string>('')
  const [showTooltip, setShowTooltip] = useState(false)
  const [lastTap, setLastTap] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Enhanced touch and mobile detection
  const isTouchDevice = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0)
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  // Calculate edge length for reference
  const edgeLength = Math.sqrt(Math.pow(targetX - sourceX, 2) + Math.pow(targetY - sourceY, 2))
  const pixelLength = Math.round(edgeLength)

  // Calculate edge path and label position using getBezierPath for React Flow v12
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  })

  // Calculate angle for label rotation
  const angle = Math.atan2(targetY - sourceY, targetX - sourceX) * (180 / Math.PI)
  const shouldRotate = Math.abs(angle) > 90
  const displayAngle = shouldRotate ? angle + 180 : angle

  // Enhanced focus management for mobile
  useEffect(() => {
    if (isEditing && inputRef.current) {
      // Delay focus on mobile to prevent viewport jumping
      if (isMobile) {
        setTimeout(() => {
          inputRef.current?.focus()
          inputRef.current?.select()
        }, 100)
      } else {
        inputRef.current.focus()
        inputRef.current.select()
      }
      setValidationError('')
    }
  }, [isEditing, isMobile])

  // Enhanced validation for dimension input
  const validateDimension = useCallback((value: string): string => {
    const num = parseFloat(value)

    if (!value.trim()) {
      return 'Dimension is required'
    }
    if (isNaN(num)) {
      return 'Please enter a valid number'
    }
    if (num <= 0) {
      return 'Dimension must be greater than 0'
    }
    if (num > 100) {
      return 'Dimension seems too large. Please check.'
    }
    if (num < 0.01) {
      return 'Dimension seems too small. Please check.'
    }

    return ''
  }, [])

  const handleStartEdit = useCallback(() => {
    if (data?.canEdit) {
      setTempDimension(data.dimension?.toString() || '')
      setTempUnit(data.unit)
      setValidationError('')
      setIsEditing(true)

      // Add haptic feedback on supported devices
      if ('vibrate' in navigator) {
        navigator.vibrate(25)
      }
    }
  }, [data])

  const handleSave = useCallback(() => {
    const error = validateDimension(tempDimension)
    if (error) {
      setValidationError(error)
      if ('vibrate' in navigator) {
        navigator.vibrate([100, 50, 100]) // Error vibration pattern
      }
      return
    }

    const dimension = parseFloat(tempDimension)
    updateEdgeDimension(id, dimension, tempUnit)
    setIsEditing(false)
    setValidationError('')

    // Success haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(50)
    }
  }, [id, tempDimension, tempUnit, updateEdgeDimension, validateDimension])

  const handleCancel = useCallback(() => {
    setTempDimension(data?.dimension?.toString() || '')
    setTempUnit(data?.unit || 'm')
    setValidationError('')
    setIsEditing(false)

    // Light haptic feedback for cancel
    if ('vibrate' in navigator) {
      navigator.vibrate(25)
    }
  }, [data])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        handleSave()
      } else if (e.key === 'Escape') {
        e.preventDefault()
        handleCancel()
      }
    },
    [handleSave, handleCancel]
  )

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setTempDimension(value)

    // Real-time validation feedback
    const error = validateDimension(value)
    setValidationError(error)
  }, [validateDimension])

  const handleUnitChange = useCallback((value: Unit) => {
    setTempUnit(value)
    // Light haptic feedback for unit change
    if ('vibrate' in navigator) {
      navigator.vibrate(25)
    }
  }, [])

  // Enhanced touch handling for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const currentTime = Date.now()
    const tapGap = currentTime - lastTap

    // Double tap to edit on mobile
    if (tapGap < 300 && tapGap > 0 && data?.canEdit) {
      e.preventDefault()
      handleStartEdit()
    }

    setLastTap(currentTime)
  }, [lastTap, data?.canEdit, handleStartEdit])

  // Enhanced click handler for better accessibility
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    if (data?.canEdit && !isEditing) {
      handleStartEdit()
    }
  }, [data?.canEdit, isEditing, handleStartEdit])

  // Enhanced display formatting
  const formatDisplayValue = () => {
    if (data?.dimension) {
      return `${data.dimension} ${data.unit}`
    }
    return isTouchDevice ? 'Tap to add' : 'Click to add dimension'
  }

  const displayValue = formatDisplayValue()
  const needsDimension = data?.isRequired && !data?.dimension
  const hasValidationError = validationError.length > 0

  // Accessible label for screen readers
  const getAriaLabel = () => {
    const baseLabel = `Edge dimension between corner points`
    const currentValue = data?.dimension ? ` currently ${data.dimension} ${data.unit}` : ' not set'
    const instructions = data?.canEdit
      ? (isTouchDevice ? '. Double tap to edit' : '. Click to edit')
      : ''
    return baseLabel + currentValue + instructions
  }

  return (
    <>
      {/* Enhanced Edge line with better visual states */}
      <BaseEdge
        path={edgePath}
        style={{
          strokeWidth: isMobile ? 4 : 3,
          stroke: needsDimension ? '#F59E0B' : hasValidationError ? '#EF4444' : '#10375C',
          strokeDasharray: needsDimension ? '8,4' : hasValidationError ? '4,2' : undefined,
          filter: isEditing ? 'drop-shadow(0 0 4px rgba(16, 55, 92, 0.3))' : undefined
        }}
      />

      {/* Enhanced Dimension Label with responsive sizing */}
      <foreignObject
        ref={containerRef}
        x={labelX - (isMobile ? 75 : 60)}
        y={labelY - (isMobile ? 25 : 20)}
        width={isMobile ? 150 : 120}
        height={isMobile ? 50 : 40}
        style={{
          transform: `rotate(${displayAngle}deg)`,
          transformOrigin: `${isMobile ? 75 : 60}px ${isMobile ? 25 : 20}px`,
        }}
        role="group"
        aria-label={getAriaLabel()}
      >
        <TooltipProvider>
          <AnimatePresence mode="wait">
            {isEditing ? (
              <motion.div
                key="editing"
                initial={{ scale: 0.8, opacity: 0, y: -5 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0, y: -5 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className={cn(
                  'flex flex-col gap-2 bg-white rounded-lg shadow-lg',
                  'border-2 transition-colors duration-200',
                  hasValidationError ? 'border-red-500' : 'border-layit-blue',
                  isMobile ? 'p-2' : 'p-1'
                )}
              >
                <div className="flex items-center gap-1">
                  <div className="flex flex-col gap-1">
                    <Input
                      ref={inputRef}
                      value={tempDimension}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      placeholder="0"
                      className={cn(
                        'text-center border-0 focus:ring-1 focus:ring-layit-blue',
                        isMobile ? 'h-8 w-16 text-sm' : 'h-7 w-12 text-xs',
                        hasValidationError ? 'bg-red-50 focus:ring-red-300' : ''
                      )}
                      type="number"
                      min="0"
                      step="0.1"
                      inputMode="decimal"
                      aria-label="Dimension value"
                      aria-invalid={hasValidationError}
                      aria-describedby={hasValidationError ? `error-${id}` : undefined}
                    />
                    {hasValidationError && (
                      <div id={`error-${id}`} className="text-red-500 text-xs whitespace-nowrap">
                        {validationError}
                      </div>
                    )}
                  </div>

                  <Select value={tempUnit} onValueChange={handleUnitChange}>
                    <SelectTrigger
                      className={cn(
                        'border-0',
                        isMobile ? 'h-8 w-12 text-sm' : 'h-7 w-10 text-xs'
                      )}
                      aria-label="Unit selector"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mm">mm</SelectItem>
                      <SelectItem value="cm">cm</SelectItem>
                      <SelectItem value="m">m</SelectItem>
                      <SelectItem value="in">in</SelectItem>
                      <SelectItem value="ft">ft</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          onClick={handleSave}
                          disabled={hasValidationError || !tempDimension}
                          className={cn(
                            'p-0 bg-green-600 hover:bg-green-700 disabled:bg-gray-400',
                            isMobile ? 'h-8 w-8' : 'h-7 w-7'
                          )}
                          aria-label="Save dimension"
                        >
                          <Check size={isMobile ? 14 : 12} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Save dimension</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancel}
                          className={cn(
                            'p-0 border-red-300 text-red-600 hover:bg-red-50',
                            isMobile ? 'h-8 w-8' : 'h-7 w-7'
                          )}
                          aria-label="Cancel editing"
                        >
                          <X size={isMobile ? 14 : 12} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Cancel editing</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </motion.div>
            ) : (
              <Tooltip open={showTooltip && !isTouchDevice}>
                <TooltipTrigger asChild>
                  <motion.button
                    key="display"
                    initial={{ scale: 0.8, opacity: 0, y: 5 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.8, opacity: 0, y: 5 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    onClick={handleClick}
                    onTouchStart={handleTouchStart}
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                    className={cn(
                      'group flex flex-col items-center justify-center w-full h-full',
                      'bg-white rounded-lg border-2 shadow-md relative',
                      'font-medium transition-all duration-200',
                      'focus:outline-none focus:ring-2 focus:ring-layit-blue/50',

                      // Enhanced sizing for touch
                      isMobile ? 'text-sm min-h-[44px] px-2' : 'text-xs px-1',

                      // Enhanced hover effects
                      !isTouchDevice && 'hover:scale-105 hover:shadow-lg',

                      // Enhanced state styling
                      needsDimension
                        ? 'border-layit-yellow text-layit-orange hover:border-layit-orange animate-pulse'
                        : 'border-layit-blue text-layit-blue hover:border-layit-orange hover:text-layit-orange',

                      // Cursor styling
                      data?.canEdit && 'cursor-pointer',
                      !data?.canEdit && 'cursor-default opacity-75'
                    )}
                    disabled={!data?.canEdit}
                    aria-label={getAriaLabel()}
                    title={data?.canEdit ? (isTouchDevice ? 'Double tap to edit dimension' : 'Click to edit dimension') : displayValue}
                  >
                    <div className="flex items-center gap-1 mb-1">
                      {needsDimension && (
                        <motion.div
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                        >
                          <Edit3 size={isMobile ? 12 : 10} />
                        </motion.div>
                      )}
                      {data?.dimension && <Ruler size={isMobile ? 12 : 10} className="opacity-60" />}
                      {isTouchDevice && <Smartphone size={8} className="opacity-40" />}
                    </div>

                    <span className={cn(
                      'text-center',
                      needsDimension && 'text-layit-orange font-semibold'
                    )}>
                      {displayValue}
                    </span>

                    {/* Pixel reference for context */}
                    {data?.dimension && (
                      <Badge variant="secondary" className="text-xs opacity-60 mt-1">
                        ~{pixelLength}px
                      </Badge>
                    )}
                  </motion.button>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-center">
                    <p>{data?.canEdit ? 'Click to edit dimension' : 'Dimension display'}</p>
                    {data?.dimension && (
                      <p className="text-xs opacity-75">~{pixelLength}px on canvas</p>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            )}
          </AnimatePresence>
        </TooltipProvider>
      </foreignObject>

      {/* Enhanced visual indicators */}
      <AnimatePresence>
        {needsDimension && (
          <motion.g
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
          >
            {/* Pulsing circle */}
            <motion.circle
              cx={labelX}
              cy={labelY}
              r={isMobile ? 12 : 8}
              fill="none"
              stroke="#F59E0B"
              strokeWidth="2"
              strokeDasharray="3,3"
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />
            {/* Warning indicator */}
            <motion.circle
              cx={labelX}
              cy={labelY}
              r="3"
              fill="#F59E0B"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />
          </motion.g>
        )}
      </AnimatePresence>
    </>
  )
})

DimensionEdge.displayName = 'DimensionEdge'