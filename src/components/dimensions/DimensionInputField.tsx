/**
 * DimensionInputField Component
 *
 * Single dimension input field with label, validation, and styling.
 * Follows design from simple_dimensions_v1.html
 *
 * @pattern Single Responsibility - handles one dimension input
 * @pattern Controlled Component - value managed by parent
 */

'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import type { DimensionInputFieldProps } from '@/types/dimensions'
import { parseInputValue } from '@/utils/dimensions'

export function DimensionInputField({
  label,
  value,
  onChange,
  unit,
  readOnly = false,
  minValue = 0,
  maxValue = 10000,
  error,
  testId,
  autoFocus = false,
  className
}: DimensionInputFieldProps) {
  const [localValue, setLocalValue] = React.useState(value.toString())

  // Sync local value with prop value
  React.useEffect(() => {
    setLocalValue(value > 0 ? value.toString() : '')
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value
    setLocalValue(rawValue)

    const parsed = parseInputValue(rawValue)
    onChange(parsed)
  }

  const handleBlur = () => {
    // Format value on blur
    if (value > 0) {
      setLocalValue(value.toString())
    } else {
      setLocalValue('')
    }
  }

  return (
    <div className={cn('w-full', className)}>
      {/* Label */}
      <label
        htmlFor={testId}
        className="block text-sm font-bold uppercase mb-3 text-[#10375C]"
      >
        {label}
      </label>

      {/* Input Field - matching simple_dimensions_v1.html */}
      <input
        id={testId}
        type="number"
        value={localValue}
        onChange={handleChange}
        onBlur={handleBlur}
        readOnly={readOnly}
        autoFocus={autoFocus}
        min={minValue}
        max={maxValue}
        step="0.1"
        placeholder="0.0"
        data-testid={testId}
        className={cn(
          // Base styles from design
          'w-full bg-[#F4F6FF] border-4 border-[#10375C]',
          'text-[#10375C] font-bold text-2xl p-4 text-center',
          'transition-all duration-200',
          // Focus state
          'focus:outline-none focus:shadow-[6px_6px_0px_#EB8317]',
          'focus:translate-x-[-2px] focus:translate-y-[-2px]',
          // Error state
          error && 'border-red-500',
          // Read-only state
          readOnly && 'opacity-60 cursor-not-allowed'
        )}
        aria-label={label}
        aria-invalid={!!error}
        aria-describedby={error ? `${testId}-error` : undefined}
      />

      {/* Error Message */}
      {error && (
        <p
          id={`${testId}-error`}
          className="mt-2 text-sm font-bold text-red-600"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  )
}
