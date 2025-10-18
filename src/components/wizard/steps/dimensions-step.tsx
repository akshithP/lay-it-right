'use client'

import { useState, useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RulerIcon, RotateCcwIcon } from 'lucide-react'
import { useProjectStore } from '@/store/project-store'
import { motion } from 'framer-motion'
import type { Unit } from '@/types'
import { dimensionsFormSchema, type DimensionsFormData } from '@/lib/validations'
import { getUnitStep, formatWithUnit } from '@/utils/unit-conversions'

const unitOptions: Array<{
  value: Unit
  label: string
  category: 'metric' | 'imperial'
}> = [
  { value: 'm', label: 'Meters (m)', category: 'metric' },
  { value: 'cm', label: 'Centimeters (cm)', category: 'metric' },
  { value: 'mm', label: 'Millimeters (mm)', category: 'metric' },
  { value: 'ft', label: 'Feet (ft)', category: 'imperial' },
  { value: 'in', label: 'Inches (in)', category: 'imperial' }
]

interface RectangleDimensions {
  length: number
  width: number
  area: number
  perimeter: number
}

/**
 * DimensionsStep Component
 *
 * Handles user input for room dimensions with:
 * - Real-time validation using Zod
 * - Unit conversion (metric/imperial)
 * - Live SVG preview of room shape
 * - Area and perimeter calculations
 * - Accessibility compliance (WCAG)
 * - Responsive design for mobile/tablet/desktop
 */
export function DimensionsStep() {
  const { currentProject, setLayoutDimensions, nextStep } = useProjectStore()
  const [unit, setUnit] = useState<Unit>(currentProject.layout?.dimensions.unit || 'm')

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
    trigger
  } = useForm<DimensionsFormData>({
    resolver: zodResolver(dimensionsFormSchema),
    defaultValues: {
      length: currentProject.layout?.dimensions.length?.toString() || '',
      width: currentProject.layout?.dimensions.width?.toString() || '',
      unit: unit
    },
    mode: 'onChange'
  })

  const watchedLength = watch('length')
  const watchedWidth = watch('width')

  // Update form when unit changes
  useEffect(() => {
    setValue('unit', unit)
    trigger()
  }, [unit, setValue, trigger])

  const onSubmit = (data: DimensionsFormData) => {
    setLayoutDimensions(data.length, data.width, data.unit)
    nextStep()
  }

  const handleUnitChange = (newUnit: Unit) => {
    setUnit(newUnit)
  }

  const swapDimensions = () => {
    const currentLength = watchedLength
    const currentWidth = watchedWidth
    setValue('length', currentWidth)
    setValue('width', currentLength)
    trigger()
  }

  // Calculate rectangle dimensions with memoization for performance
  const rectangleDimensions = useMemo<RectangleDimensions | null>(() => {
    const length = parseFloat(watchedLength || '0')
    const width = parseFloat(watchedWidth || '0')

    if (length > 0 && width > 0) {
      return {
        length,
        width,
        area: length * width,
        perimeter: 2 * (length + width)
      }
    }
    return null
  }, [watchedLength, watchedWidth])

  // SVG Preview dimensions with responsive scaling
  const getSVGDimensions = () => {
    if (!rectangleDimensions) return null

    // Reduce max dimensions to add padding/margin within the viewBox
    const maxWidth = 440  // Was 500, now 440 (30px padding on each side)
    const maxHeight = 240  // Was 300, now 240 (30px padding top/bottom)
    const ratio = rectangleDimensions.length / rectangleDimensions.width

    let rectWidth, rectHeight
    if (ratio > maxWidth / maxHeight) {
      rectWidth = maxWidth
      rectHeight = maxWidth / ratio
    } else {
      rectHeight = maxHeight
      rectWidth = maxHeight * ratio
    }

    const x = (500 - rectWidth) / 2
    const y = (300 - rectHeight) / 2

    return {
      roomRect: { x, y, width: rectWidth, height: rectHeight },
      topLabel: { x: x + rectWidth / 2, y: y - 20 },
      leftLabel: { x: x - 25, y: y + rectHeight / 2 }
    }
  }

  const svgDims = getSVGDimensions()
  const step = getUnitStep(unit)

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Page Title */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 text-layit-blue uppercase" style={{ textShadow: '3px 3px 0px #EB8317' }}>
          ROOM DIMENSIONS
        </h1>
        <p className="text-layit-blue font-bold text-lg">
          Measure your room carefully for accurate tile calculations
        </p>
      </div>

      {/* Unit Selection - Neo-brutalism style */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="bg-layit-white border-4 border-layit-blue p-8" style={{ boxShadow: '8px 8px 0px #10375C' }}>
          <h2 className="text-xl font-bold mb-6 uppercase text-layit-blue flex items-center gap-3">
            <RulerIcon className="w-6 h-6" />
            Measurement Unit
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {unitOptions.map(option => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleUnitChange(option.value)}
                aria-pressed={unit === option.value}
                className={`font-bold uppercase py-3 px-4 border-3 transition-all duration-200 ${
                  unit === option.value
                    ? 'bg-layit-blue text-layit-white border-layit-orange'
                    : 'bg-layit-white text-layit-blue border-layit-blue hover:bg-layit-orange hover:text-layit-white'
                }`}
                style={unit === option.value ? { boxShadow: '4px 4px 0px #F3C623' } : {}}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Dimension Inputs - Neo-brutalism style */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="bg-layit-white border-4 border-layit-blue p-8" style={{ boxShadow: '8px 8px 0px #10375C' }}>
          <h2 className="text-xl font-bold mb-6 uppercase text-layit-blue">
            Room Measurements
          </h2>
          <p className="text-layit-blue font-bold mb-6">Enter the length and width of your room in {unit}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Length Input */}
            <div>
              <Label htmlFor="length" className="block text-sm font-bold uppercase mb-3 text-layit-blue">
                LENGTH (HORIZONTAL)
              </Label>
              <Input
                id="length"
                type="number"
                step={step}
                min="0.1"
                max="1000"
                placeholder="0.0"
                {...register('length')}
                className={`w-full border-4 p-4 text-lg font-bold text-center uppercase text-layit-blue placeholder-gray-400 ${
                  errors.length ? 'border-red-500' : 'border-layit-blue'
                }`}
                style={{ boxShadow: errors.length ? 'none' : '4px 4px 0px #F3C623' }}
                aria-invalid={!!errors.length}
                aria-describedby={errors.length ? 'length-error' : undefined}
              />
              {errors.length && (
                <p id="length-error" className="bg-red-600 text-white font-bold text-sm mt-2 uppercase px-3 py-2 border-2 border-red-700">
                  ✗ {errors.length.message}
                </p>
              )}
            </div>

            {/* Width Input */}
            <div>
              <Label htmlFor="width" className="block text-sm font-bold uppercase mb-3 text-layit-blue">
                WIDTH (VERTICAL)
              </Label>
              <Input
                id="width"
                type="number"
                step={step}
                min="0.1"
                max="1000"
                placeholder="0.0"
                {...register('width')}
                className={`w-full border-4 p-4 text-lg font-bold text-center uppercase text-layit-blue placeholder-gray-400 ${
                  errors.width ? 'border-red-500' : 'border-layit-blue'
                }`}
                style={{ boxShadow: errors.width ? 'none' : '4px 4px 0px #F3C623' }}
                aria-invalid={!!errors.width}
                aria-describedby={errors.width ? 'width-error' : undefined}
              />
              {errors.width && (
                <p id="width-error" className="bg-red-600 text-white font-bold text-sm mt-2 uppercase px-3 py-2 border-2 border-red-700">
                  ✗ {errors.width.message}
                </p>
              )}
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center mt-8">
            <button
              type="button"
              onClick={swapDimensions}
              disabled={!watchedLength || !watchedWidth}
              className="flex items-center gap-3 bg-layit-white border-4 border-layit-blue text-layit-blue font-bold uppercase px-6 py-3 transition-all duration-200 hover:bg-layit-orange hover:text-layit-white disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ boxShadow: '4px 4px 0px #10375C' }}
            >
              <RotateCcwIcon className="w-5 h-5" />
              SWAP DIMENSIONS
            </button>
          </div>
        </div>
      </motion.div>

      {/* Visual Preview and Stats */}
      {rectangleDimensions && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          {/* Stats Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-layit-yellow border-4 border-layit-blue p-6" style={{ boxShadow: '4px 4px 0px #EB8317' }}>
              <p className="text-xs font-bold uppercase text-layit-blue mb-2">TOTAL AREA</p>
              <p className="text-2xl font-bold text-layit-blue">
                {rectangleDimensions.area.toFixed(1)} {unit}²
              </p>
            </div>
            <div className="bg-layit-yellow border-4 border-layit-blue p-6" style={{ boxShadow: '4px 4px 0px #EB8317' }}>
              <p className="text-xs font-bold uppercase text-layit-blue mb-2">PERIMETER</p>
              <p className="text-2xl font-bold text-layit-blue">
                {rectangleDimensions.perimeter.toFixed(1)} {unit}
              </p>
            </div>
          </div>

          {/* Visual Preview */}
          <div className="bg-layit-white border-6 border-layit-blue p-6 overflow-auto" style={{ boxShadow: '6px 6px 0px #10375C' }}>
            <p className="text-sm font-bold uppercase text-layit-blue mb-4">Visual Preview</p>
            <svg
              viewBox="0 0 500 300"
              className="w-full border-2 border-dashed border-gray-400"
              style={{ background: 'linear-gradient(135deg, rgba(243,198,35,0.05) 25%, transparent 25%, transparent 75%, rgba(243,198,35,0.05) 75%, rgba(243,198,35,0.05)), linear-gradient(135deg, rgba(243,198,35,0.05) 25%, transparent 25%, transparent 75%, rgba(243,198,35,0.05) 75%, rgba(243,198,35,0.05))' }}
              role="img"
              aria-label={`Room preview: ${rectangleDimensions.length} x ${rectangleDimensions.width} ${unit}`}
            >
              {svgDims && (
                <>
                  {/* Grid background */}
                  <defs>
                    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <circle cx="10" cy="10" r="1" fill="#10375C" opacity="0.2" />
                    </pattern>
                  </defs>
                  <rect width="500" height="300" fill="url(#grid)" />

                  {/* Rectangle shape */}
                  <rect
                    x={svgDims.roomRect.x}
                    y={svgDims.roomRect.y}
                    width={svgDims.roomRect.width}
                    height={svgDims.roomRect.height}
                    stroke="#10375C"
                    strokeWidth="4"
                    fill="rgba(243,198,35,0.15)"
                  />

                  {/* Dimension labels */}
                  <text
                    x={svgDims.topLabel.x}
                    y={svgDims.topLabel.y}
                    textAnchor="middle"
                    className="text-sm font-bold fill-layit-blue"
                    aria-hidden="true"
                  >
                    {rectangleDimensions.length.toFixed(1)} {unit}
                  </text>
                  <text
                    x={svgDims.leftLabel.x}
                    y={svgDims.leftLabel.y + 5}
                    textAnchor="end"
                    className="text-sm font-bold fill-layit-blue"
                    aria-hidden="true"
                  >
                    {rectangleDimensions.width.toFixed(1)} {unit}
                  </text>
                </>
              )}
            </svg>
          </div>
        </motion.div>
      )}

      {/* Tips Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="bg-layit-white border-4 border-layit-blue p-6 text-layit-blue" style={{ boxShadow: '4px 4px 0px #10375C' }}>
          <h3 className="text-lg font-bold uppercase mb-4">💡 MEASURING TIPS</h3>
          <ul className="space-y-3 font-bold">
            <li className="flex items-start gap-3">
              <span className="text-xl">•</span>
              <span>Measure the longest walls for length and width</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-xl">•</span>
              <span>Account for any obstacles like cabinets or fixtures</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-xl">•</span>
              <span>Double-check your measurements before continuing</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-xl">•</span>
              <span>Use a tape measure for accurate results (avoid visual estimates)</span>
            </li>
          </ul>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex justify-center gap-6 pt-6"
      >
        <Button
          type="submit"
          disabled={!isValid}
          className="bg-layit-blue text-layit-white border-4 border-layit-blue font-bold uppercase px-8 py-6 text-lg hover:bg-layit-orange hover:border-layit-orange transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ boxShadow: isValid ? '6px 6px 0px #F3C623' : 'none' }}
        >
          CONTINUE →
        </Button>
      </motion.div>
    </form>
  )
}