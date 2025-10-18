/**
 * UnitSelector Component
 *
 * Unit selection buttons for choosing measurement units.
 * Follows design from simple_dimensions_v1.html
 *
 * @pattern Single Responsibility - handles unit selection only
 * @pattern Controlled Component - selection managed by parent
 */

'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import type { Unit } from '@/types'
import type { UnitSelectorProps } from '@/types/dimensions'

// Available units with display labels
const AVAILABLE_UNITS: Array<{ value: Unit; label: string }> = [
  { value: 'mm', label: 'MM' },
  { value: 'cm', label: 'CM' },
  { value: 'm', label: 'M' },
  { value: 'in', label: 'INCH' },
  { value: 'ft', label: 'FEET' }
]

export function UnitSelector({
  selectedUnit,
  onUnitChange,
  disabled = false,
  className,
  testId = 'unit-selector'
}: UnitSelectorProps) {
  const handleUnitClick = (unit: Unit) => {
    if (!disabled) {
      onUnitChange(unit)
    }
  }

  return (
    <div className={cn('w-full', className)}>
      {/* Label */}
      <label className="block text-sm font-bold uppercase mb-3 text-[#10375C]">
        MEASUREMENT UNITS
      </label>

      {/* Unit Buttons - matching simple_dimensions_v1.html */}
      <div
        className="flex flex-wrap gap-2 justify-center"
        role="group"
        aria-label="Select measurement unit"
        data-testid={testId}
      >
        {AVAILABLE_UNITS.map(({ value, label }) => {
          const isSelected = value === selectedUnit

          return (
            <button
              key={value}
              type="button"
              onClick={() => handleUnitClick(value)}
              disabled={disabled}
              data-testid={`${testId}-${value}`}
              aria-pressed={isSelected}
              aria-label={`Select ${label} unit`}
              className={cn(
                // Base styles from design
                'bg-[#F4F6FF] border-4 border-[#10375C]',
                'px-6 py-3 mx-1 font-bold uppercase',
                'transition-all duration-200 cursor-pointer',
                // Hover state
                'hover:bg-[#EB8317] hover:text-white',
                'hover:shadow-[3px_3px_0px_#10375C]',
                'hover:translate-x-[-1px] hover:translate-y-[-1px]',
                // Active/Selected state
                isSelected && [
                  'bg-[#10375C] text-white',
                  'shadow-[3px_3px_0px_#EB8317]'
                ],
                // Disabled state
                disabled && 'opacity-50 cursor-not-allowed hover:bg-[#F4F6FF]'
              )}
            >
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
