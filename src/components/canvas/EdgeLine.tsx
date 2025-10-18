'use client'

import { memo, useState, useCallback, useRef, useEffect } from 'react'
import { BaseEdge, getBezierPath, type EdgeProps } from '@xyflow/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Ruler, Edit3, Check, X, Calculator, Smartphone } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCanvasStore } from '@/stores/canvas-store'
import { DimensionPopover } from './DimensionPopover'
import type { LayoutEdgeData } from '@/types/canvas'
import type { Unit } from '@/types'
import convert from 'convert-units'

interface EdgeLineProps extends Omit<EdgeProps, 'data'> {
  data?: LayoutEdgeData
}

interface EdgeMeasurements {
  pixelLength: number
  realWorldLength?: number
  unit: Unit
  scaleFactor: number
}

/**
 * Convert between units safely
 */
function convertUnits(value: number, from: Unit, to: Unit): number {
  if (from === to) return value

  // Handle metric conversions manually first
  const metricConversions: Record<string, Record<string, number>> = {
    mm: { cm: 0.1, m: 0.001 },
    cm: { mm: 10, m: 0.01 },
    m: { mm: 1000, cm: 100 }
  }

  if (metricConversions[from]?.[to]) {
    return value * metricConversions[from][to]
  }

  // Handle imperial conversions
  const imperialConversions: Record<string, Record<string, number>> = {
    in: { ft: 1/12 },
    ft: { in: 12 }
  }

  if (imperialConversions[from]?.[to]) {
    return value * imperialConversions[from][to]
  }

  // Fallback to convert-units for cross-system conversions
  try {
    return convert(value).from(from as any).to(to as any)
  } catch {
    console.warn(`Unit conversion failed: ${from} to ${to}`)
    return value
  }
}

/**
 * Enhanced EdgeLine component with dimension editing capabilities
 */
export const EdgeLine = memo<EdgeLineProps>(function EdgeLine({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
  selected
}) {
  const { updateEdgeDimension } = useCanvasStore()
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [showMeasurement, setShowMeasurement] = useState(false)
  const [lastTap, setLastTap] = useState(0)
  const [measurements, setMeasurements] = useState<EdgeMeasurements>({
    pixelLength: 0,
    unit: data?.unit || 'm',
    scaleFactor: 1
  })

  const labelRef = useRef<HTMLDivElement>(null)

  // Touch device detection
  const isTouchDevice = typeof window !== 'undefined' && ('ontouchstart' in window)
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  // Calculate edge measurements
  useEffect(() => {
    const pixelLength = Math.sqrt(Math.pow(targetX - sourceX, 2) + Math.pow(targetY - sourceY, 2))

    setMeasurements(prev => ({
      ...prev,
      pixelLength: Math.round(pixelLength),
      realWorldLength: data?.dimension
    }))
  }, [sourceX, sourceY, targetX, targetY, data?.dimension])

  // Calculate edge path and label position
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  })

  // Calculate label rotation
  const angle = Math.atan2(targetY - sourceY, targetX - sourceX) * (180 / Math.PI)
  const shouldRotate = Math.abs(angle) > 90
  const displayAngle = shouldRotate ? angle + 180 : angle

  // Handle dimension updates
  const handleDimensionUpdate = useCallback(
    (dimension: number, unit: Unit) => {
      updateEdgeDimension(id, dimension, unit)
      setIsPopoverOpen(false)

      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(50)
      }
    },
    [id, updateEdgeDimension]
  )

  // Handle click/tap interactions
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()

    if (!data?.canEdit || isPopoverOpen) return

    if (isTouchDevice) {
      // Handle double-tap on mobile
      const currentTime = Date.now()
      const tapGap = currentTime - lastTap

      if (tapGap < 300 && tapGap > 0) {
        setIsPopoverOpen(true)
      }

      setLastTap(currentTime)
    } else {
      // Single click on desktop
      setIsPopoverOpen(true)
    }
  }, [data?.canEdit, isPopoverOpen, isTouchDevice, lastTap])

  // Handle keyboard interactions
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (data?.canEdit && !isPopoverOpen) {
        setIsPopoverOpen(true)
      }
    }
    if (e.key === 'Escape') {
      setIsPopoverOpen(false)
    }
  }, [data?.canEdit, isPopoverOpen])

  // Format display value
  const getDisplayValue = () => {
    if (data?.dimension) {
      return `${data.dimension} ${data.unit}`
    }
    return isTouchDevice ? 'Double tap to add' : 'Click to add dimension'
  }

  // Get status styling
  const getStatusStyle = () => {
    const needsDimension = data?.isRequired && !data?.dimension

    if (needsDimension) {
      return {
        stroke: '#F59E0B',
        strokeDasharray: '8,4',
        animate: 'pulse'
      }
    }

    if (selected) {
      return {
        stroke: '#3B82F6',
        strokeWidth: 4,
        animate: 'glow'
      }
    }

    return {
      stroke: '#10375C',
      strokeWidth: isMobile ? 4 : 3
    }
  }

  const statusStyle = getStatusStyle()
  const needsDimension = data?.isRequired && !data?.dimension

  // Accessibility label
  const getAriaLabel = () => {
    const baseLabel = `Edge dimension between corner points`
    const currentValue = data?.dimension ? ` currently ${data.dimension} ${data.unit}` : ' not set'
    const instructions = data?.canEdit
      ? (isTouchDevice ? '. Double tap to edit' : '. Click to edit')
      : ''
    return baseLabel + currentValue + instructions
  }

  // Scale calculation for context
  const getScaleReference = () => {
    if (!data?.dimension || !measurements.pixelLength) return null

    const pixelsPerUnit = measurements.pixelLength / data.dimension
    return `1 ${data.unit} ≈ ${Math.round(pixelsPerUnit)}px`
  }

  return (
    <TooltipProvider>
      <>
        {/* Enhanced edge line with status styling */}
        <BaseEdge
          path={edgePath}
          style={{
            ...statusStyle,
            filter: selected ? 'drop-shadow(0 0 6px rgba(59, 130, 246, 0.4))' : undefined,
            transition: 'all 0.2s ease'
          }}
        />

        {/* Interactive dimension label */}
        <foreignObject
          x={labelX - (isMobile ? 80 : 65)}
          y={labelY - (isMobile ? 30 : 25)}
          width={isMobile ? 160 : 130}
          height={isMobile ? 60 : 50}
          style={{
            transform: `rotate(${displayAngle}deg)`,
            transformOrigin: `${isMobile ? 80 : 65}px ${isMobile ? 30 : 25}px`,
            pointerEvents: 'auto'
          }}
        >
          <DimensionPopover
            isOpen={isPopoverOpen}
            onOpenChange={setIsPopoverOpen}
            currentDimension={data?.dimension}
            currentUnit={data?.unit || 'm'}
            onSave={handleDimensionUpdate}
            edgeId={id}
            pixelReference={measurements.pixelLength}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.button
                  ref={labelRef}
                  onClick={handleClick}
                  onKeyDown={handleKeyDown}
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                  className={cn(
                    'group flex flex-col items-center justify-center w-full h-full',
                    'bg-white rounded-lg border-2 shadow-md relative',
                    'font-medium transition-all duration-200',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500/50',

                    // Responsive sizing
                    isMobile ? 'text-sm min-h-[44px] px-2' : 'text-xs px-1',

                    // Hover effects (desktop only)
                    !isTouchDevice && 'hover:scale-105 hover:shadow-lg',

                    // Status styling
                    needsDimension
                      ? 'border-amber-400 text-amber-600 hover:border-amber-500 animate-pulse'
                      : selected
                      ? 'border-blue-500 text-blue-600 shadow-blue-100'
                      : 'border-slate-300 text-slate-700 hover:border-blue-400',

                    // Interaction styling
                    data?.canEdit ? 'cursor-pointer' : 'cursor-default opacity-75'
                  )}
                  disabled={!data?.canEdit}
                  aria-label={getAriaLabel()}
                  title={data?.canEdit ? (isTouchDevice ? 'Double tap to edit dimension' : 'Click to edit dimension') : getDisplayValue()}
                >
                  {/* Status indicators */}
                  <div className="flex items-center gap-1 mb-1">
                    {needsDimension && (
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                      >
                        <Edit3 size={isMobile ? 12 : 10} className="text-amber-500" />
                      </motion.div>
                    )}

                    {data?.dimension && (
                      <Ruler size={isMobile ? 12 : 10} className="opacity-60" />
                    )}

                    {selected && (
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                      >
                        <Check size={isMobile ? 12 : 10} className="text-green-500" />
                      </motion.div>
                    )}

                    {isTouchDevice && (
                      <Smartphone size={8} className="opacity-40" />
                    )}
                  </div>

                  {/* Main dimension display */}
                  <span className={cn(
                    'text-center leading-tight',
                    needsDimension && 'text-amber-600 font-semibold'
                  )}>
                    {getDisplayValue()}
                  </span>

                  {/* Context information */}
                  {data?.dimension && (
                    <div className="flex flex-col items-center mt-1">
                      <Badge variant="secondary" className="text-xs opacity-60">
                        ~{measurements.pixelLength}px
                      </Badge>
                      {getScaleReference() && (
                        <Badge variant="outline" className="text-xs opacity-50 mt-1">
                          {getScaleReference()}
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Measurement mode toggle */}
                  {data?.dimension && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute -top-1 -right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowMeasurement(!showMeasurement)
                      }}
                      aria-label="Toggle measurement display"
                    >
                      <Calculator size={10} />
                    </Button>
                  )}
                </motion.button>
              </TooltipTrigger>

              <TooltipContent side="top" className="max-w-xs">
                <div className="text-center space-y-1">
                  <p className="font-medium">
                    {data?.canEdit ? 'Edit Dimension' : 'Dimension Display'}
                  </p>

                  {data?.dimension && (
                    <>
                      <p className="text-xs opacity-75">
                        Canvas: ~{measurements.pixelLength}px
                      </p>
                      {getScaleReference() && (
                        <p className="text-xs opacity-60">
                          Scale: {getScaleReference()}
                        </p>
                      )}
                    </>
                  )}

                  {data?.canEdit && (
                    <p className="text-xs opacity-75">
                      {isTouchDevice ? 'Double tap to edit' : 'Click to edit'}
                    </p>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          </DimensionPopover>
        </foreignObject>

        {/* Enhanced visual indicators for missing dimensions */}
        <AnimatePresence>
          {needsDimension && (
            <motion.g
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
            >
              {/* Pulsing attention circle */}
              <motion.circle
                cx={labelX}
                cy={labelY}
                r={isMobile ? 15 : 12}
                fill="none"
                stroke="#F59E0B"
                strokeWidth="2"
                strokeDasharray="4,4"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.4, 1, 0.4],
                  rotate: [0, 360]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              />

              {/* Warning dot */}
              <motion.circle
                cx={labelX}
                cy={labelY}
                r="3"
                fill="#F59E0B"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              />
            </motion.g>
          )}
        </AnimatePresence>

        {/* Selected state indicator */}
        <AnimatePresence>
          {selected && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.circle
                cx={labelX}
                cy={labelY}
                r={isMobile ? 20 : 16}
                fill="none"
                stroke="#3B82F6"
                strokeWidth="2"
                strokeDasharray="6,6"
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.1, 1]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'linear'
                }}
              />
            </motion.g>
          )}
        </AnimatePresence>
      </>
    </TooltipProvider>
  )
})

EdgeLine.displayName = 'EdgeLine'