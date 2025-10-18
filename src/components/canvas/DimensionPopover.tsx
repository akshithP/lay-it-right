'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Check,
  X,
  Calculator,
  Ruler,
  AlertTriangle,
  ArrowRightLeft,
  Info,
  Smartphone
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { Unit } from '@/types'
import convert from 'convert-units'

// Validation schema
const dimensionSchema = z.object({
  value: z
    .number({
      required_error: "Dimension is required",
      invalid_type_error: "Please enter a valid number"
    })
    .positive("Dimension must be greater than 0")
    .min(0.001, "Dimension is too small")
    .max(1000, "Dimension seems too large - please check"),
  unit: z.enum(['mm', 'cm', 'm', 'in', 'ft'], {
    required_error: "Unit is required"
  })
})

type DimensionFormData = z.infer<typeof dimensionSchema>

interface DimensionPopoverProps {
  children: React.ReactNode
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  currentDimension?: number
  currentUnit: Unit
  onSave: (dimension: number, unit: Unit) => void
  edgeId: string
  pixelReference?: number
  className?: string
}

interface UnitConversion {
  unit: Unit
  value: number
  label: string
  category: 'metric' | 'imperial'
}

/**
 * Convert between units with enhanced error handling
 */
function convertUnits(value: number, from: Unit, to: Unit): number {
  if (from === to) return value

  // Manual metric conversions for reliability
  const metricConversions: Record<string, Record<string, number>> = {
    mm: { cm: 0.1, m: 0.001 },
    cm: { mm: 10, m: 0.01 },
    m: { mm: 1000, cm: 100 }
  }

  if (metricConversions[from]?.[to]) {
    return value * metricConversions[from][to]
  }

  // Manual imperial conversions
  const imperialConversions: Record<string, Record<string, number>> = {
    in: { ft: 1/12 },
    ft: { in: 12 }
  }

  if (imperialConversions[from]?.[to]) {
    return value * imperialConversions[from][to]
  }

  // Use convert-units for cross-system conversions
  try {
    return convert(value).from(from as any).to(to as any)
  } catch (error) {
    console.warn(`Unit conversion failed: ${from} to ${to}`, error)
    return value
  }
}

/**
 * Enhanced dimension popover with validation and unit conversion
 */
export function DimensionPopover({
  children,
  isOpen,
  onOpenChange,
  currentDimension,
  currentUnit,
  onSave,
  edgeId,
  pixelReference,
  className
}: DimensionPopoverProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConversions, setShowConversions] = useState(false)
  const [validationProgress, setValidationProgress] = useState(0)

  // Device detection
  const isTouchDevice = typeof window !== 'undefined' && ('ontouchstart' in window)
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  // Form setup
  const form = useForm<DimensionFormData>({
    resolver: zodResolver(dimensionSchema),
    defaultValues: {
      value: currentDimension || undefined,
      unit: currentUnit
    },
    mode: 'onChange'
  })

  const watchedValues = form.watch()
  const { formState: { errors, isValid, isDirty } } = form

  // Reset form when popover opens/closes
  useEffect(() => {
    if (isOpen) {
      form.reset({
        value: currentDimension || undefined,
        unit: currentUnit
      })
      setValidationProgress(0)
      setShowConversions(false)
    }
  }, [isOpen, currentDimension, currentUnit, form])

  // Update validation progress
  useEffect(() => {
    if (watchedValues.value && !errors.value) {
      setValidationProgress(100)
    } else if (watchedValues.value) {
      setValidationProgress(60)
    } else {
      setValidationProgress(0)
    }
  }, [watchedValues.value, errors.value])

  // Unit conversions for reference
  const unitConversions = useMemo((): UnitConversion[] => {
    if (!watchedValues.value || errors.value) return []

    const value = watchedValues.value
    const fromUnit = watchedValues.unit

    const units: Array<{ unit: Unit; category: 'metric' | 'imperial' }> = [
      { unit: 'mm', category: 'metric' },
      { unit: 'cm', category: 'metric' },
      { unit: 'm', category: 'metric' },
      { unit: 'in', category: 'imperial' },
      { unit: 'ft', category: 'imperial' }
    ]

    return units
      .filter(({ unit }) => unit !== fromUnit)
      .map(({ unit, category }) => ({
        unit,
        value: convertUnits(value, fromUnit, unit),
        label: `${convertUnits(value, fromUnit, unit).toFixed(unit === 'mm' ? 0 : 2)} ${unit}`,
        category
      }))
      .sort((a, b) => a.category.localeCompare(b.category))
  }, [watchedValues.value, watchedValues.unit, errors.value])

  // Handle form submission
  const handleSubmit = useCallback(async (data: DimensionFormData) => {
    setIsSubmitting(true)

    try {
      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(50)
      }

      // Simulate processing for UX
      await new Promise(resolve => setTimeout(resolve, 150))

      onSave(data.value, data.unit)
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to save dimension:', error)

      // Error haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate([100, 50, 100])
      }
    } finally {
      setIsSubmitting(false)
    }
  }, [onSave, onOpenChange])

  // Handle cancel
  const handleCancel = useCallback(() => {
    form.reset()
    onOpenChange(false)

    if ('vibrate' in navigator) {
      navigator.vibrate(25)
    }
  }, [form, onOpenChange])

  // Quick unit conversion
  const handleQuickConvert = useCallback((targetUnit: Unit) => {
    const currentValue = form.getValues('value')
    if (currentValue) {
      const convertedValue = convertUnits(currentValue, form.getValues('unit'), targetUnit)
      form.setValue('value', convertedValue, { shouldValidate: true })
      form.setValue('unit', targetUnit)
    }
  }, [form])

  // Keyboard shortcuts
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isValid && !isSubmitting) {
      e.preventDefault()
      form.handleSubmit(handleSubmit)()
    }
    if (e.key === 'Escape') {
      e.preventDefault()
      handleCancel()
    }
  }, [isValid, isSubmitting, form, handleSubmit, handleCancel])

  // Get pixel scale reference
  const getPixelScale = () => {
    if (!pixelReference || !watchedValues.value || errors.value) return null

    const pixelsPerUnit = pixelReference / watchedValues.value
    return {
      ratio: `1 ${watchedValues.unit} ≈ ${Math.round(pixelsPerUnit)}px`,
      accuracy: pixelsPerUnit > 10 ? 'high' : pixelsPerUnit > 5 ? 'medium' : 'low'
    }
  }

  const pixelScale = getPixelScale()

  return (
    <TooltipProvider>
      <Popover open={isOpen} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>
          {children}
        </PopoverTrigger>

        <PopoverContent
          className={cn(
            'w-80 p-0 shadow-lg border-0',
            isMobile && 'w-[calc(100vw-2rem)] max-w-sm',
            className
          )}
          side={isMobile ? 'bottom' : 'top'}
          align="center"
          sideOffset={8}
          onKeyDown={handleKeyDown}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center gap-2">
                <Ruler size={16} className="text-blue-600" />
                <h3 className="font-semibold text-sm text-gray-900">
                  Edit Dimension
                </h3>
                {isTouchDevice && <Smartphone size={12} className="text-gray-400" />}
              </div>

              <Badge variant="outline" className="text-xs">
                Edge {edgeId.slice(-4)}
              </Badge>
            </div>

            {/* Form */}
            <form onSubmit={form.handleSubmit(handleSubmit)} className="p-4 space-y-4">
              {/* Input Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Label htmlFor="dimension-value" className="text-sm font-medium">
                    Dimension
                  </Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info size={12} className="text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Enter the real-world measurement for this edge</p>
                    </TooltipContent>
                  </Tooltip>
                </div>

                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      id="dimension-value"
                      type="number"
                      placeholder="0"
                      min="0"
                      step="0.01"
                      inputMode="decimal"
                      className={cn(
                        'text-center font-mono',
                        errors.value && 'border-red-500 focus:ring-red-300',
                        isMobile && 'text-lg h-12'
                      )}
                      {...form.register('value', { valueAsNumber: true })}
                      autoFocus={!isTouchDevice}
                      aria-describedby={errors.value ? 'value-error' : undefined}
                      aria-invalid={!!errors.value}
                    />
                    <AnimatePresence>
                      {errors.value && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          id="value-error"
                          className="text-red-600 text-xs mt-1 flex items-center gap-1"
                          role="alert"
                        >
                          <AlertTriangle size={12} />
                          {errors.value.message}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="w-20">
                    <Select
                      value={watchedValues.unit}
                      onValueChange={(value) => form.setValue('unit', value as Unit, { shouldValidate: true })}
                    >
                      <SelectTrigger className={cn(isMobile && 'h-12')}>
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
                  </div>
                </div>

                {/* Validation Progress */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Validation</span>
                    <span className={cn(
                      validationProgress === 100 ? 'text-green-600' : 'text-gray-500'
                    )}>
                      {validationProgress}%
                    </span>
                  </div>
                  <Progress
                    value={validationProgress}
                    className="h-1"
                  />
                </div>
              </div>

              {/* Unit Conversions */}
              {unitConversions.length > 0 && (
                <div className="space-y-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowConversions(!showConversions)}
                    className="h-8 px-2 text-xs w-full justify-between"
                  >
                    <span className="flex items-center gap-1">
                      <ArrowRightLeft size={12} />
                      Unit Conversions
                    </span>
                    <motion.div
                      animate={{ rotate: showConversions ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Info size={12} />
                    </motion.div>
                  </Button>

                  <AnimatePresence>
                    {showConversions && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="grid grid-cols-2 gap-2"
                      >
                        {unitConversions.map(({ unit, value, label, category }) => (
                          <Button
                            key={unit}
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuickConvert(unit)}
                            className="h-8 text-xs justify-between group hover:bg-blue-50"
                          >
                            <Badge variant={category === 'metric' ? 'default' : 'secondary'} className="text-xs">
                              {category}
                            </Badge>
                            <span className="font-mono">{label}</span>
                          </Button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Scale Reference */}
              {pixelScale && (
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <Calculator size={12} className="text-gray-500" />
                    <span className="text-xs font-medium text-gray-700">Scale Reference</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-gray-600">
                      {pixelScale.ratio}
                    </span>
                    <Badge
                      variant={
                        pixelScale.accuracy === 'high' ? 'default' :
                        pixelScale.accuracy === 'medium' ? 'secondary' : 'destructive'
                      }
                      className="text-xs"
                    >
                      {pixelScale.accuracy} precision
                    </Badge>
                  </div>

                  {pixelReference && (
                    <p className="text-xs text-gray-500">
                      Canvas edge: ~{pixelReference}px
                    </p>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  className={cn(
                    'flex-1 gap-2',
                    isMobile && 'h-12'
                  )}
                  disabled={isSubmitting}
                >
                  <X size={14} />
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={!isValid || isSubmitting}
                  className={cn(
                    'flex-1 gap-2',
                    isMobile && 'h-12'
                  )}
                >
                  {isSubmitting ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <Calculator size={14} />
                    </motion.div>
                  ) : (
                    <Check size={14} />
                  )}
                  {isSubmitting ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </form>

            {/* Mobile-specific help */}
            {isTouchDevice && (
              <div className="px-4 pb-3 border-t bg-gray-50">
                <p className="text-xs text-gray-500 text-center">
                  Tip: Use number keypad for faster input
                </p>
              </div>
            )}
          </motion.div>
        </PopoverContent>
      </Popover>
    </TooltipProvider>
  )
}