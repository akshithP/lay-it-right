/**
 * Validation utilities for dimension inputs
 * Provides comprehensive validation with context-aware rules
 */

import type { ValidationResult, ValidationError, DimensionContext } from '@/types/dimensions'
import type { Unit } from '@/types'

/**
 * Context-specific validation rules
 */
const VALIDATION_RULES = {
  room: {
    minValue: 0.1,
    maxValue: 10000,
    minLength: 0.1,
    maxLength: 10000,
    minWidth: 0.1,
    maxWidth: 10000
  },
  tile: {
    minValue: 0.1,
    maxValue: 1000,
    minLength: 0.1,
    maxLength: 1000,
    minWidth: 0.1,
    maxWidth: 1000
  },
  display: {
    minValue: 0,
    maxValue: Infinity,
    minLength: 0,
    maxLength: Infinity,
    minWidth: 0,
    maxWidth: Infinity
  }
} as const

/**
 * Validate a single dimension input
 *
 * @param value - Value to validate
 * @param field - Field name ('length' or 'width')
 * @param context - Validation context ('room', 'tile', or 'display')
 * @param min - Optional minimum override
 * @param max - Optional maximum override
 * @returns Validation result with errors
 */
export function validateDimensionInput(
  value: number,
  field: 'length' | 'width',
  context: DimensionContext = 'room',
  min?: number,
  max?: number
): ValidationResult {
  const errors: ValidationError[] = []
  const rules = VALIDATION_RULES[context]

  const minValue = min !== undefined ? min : rules.minValue
  const maxValue = max !== undefined ? max : rules.maxValue

  // Check if value is a valid number
  if (isNaN(value) || !isFinite(value)) {
    errors.push({
      field,
      message: 'Please enter a valid number',
      code: 'INVALID_NUMBER'
    })
    return { isValid: false, errors }
  }

  // Check if value is provided
  if (value === 0) {
    errors.push({
      field,
      message: `${field.charAt(0).toUpperCase() + field.slice(1)} is required`,
      code: 'REQUIRED'
    })
  }

  // Check minimum value
  if (value < minValue) {
    errors.push({
      field,
      message: `Minimum ${field} is ${minValue}`,
      code: 'MIN_VALUE'
    })
  }

  // Check maximum value
  if (value > maxValue) {
    errors.push({
      field,
      message: `Maximum ${field} is ${maxValue}`,
      code: 'MAX_VALUE'
    })
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Validate complete dimensions (length and width)
 *
 * @param length - Length value
 * @param width - Width value
 * @param context - Validation context
 * @param minValue - Optional minimum override
 * @param maxValue - Optional maximum override
 * @returns Validation result with all errors
 */
export function validateDimensions(
  length: number,
  width: number,
  context: DimensionContext = 'room',
  minValue?: number,
  maxValue?: number
): ValidationResult {
  const lengthValidation = validateDimensionInput(length, 'length', context, minValue, maxValue)
  const widthValidation = validateDimensionInput(width, 'width', context, minValue, maxValue)

  const allErrors = [...lengthValidation.errors, ...widthValidation.errors]

  return {
    isValid: allErrors.length === 0,
    errors: allErrors
  }
}

/**
 * Check if a value is within valid range
 *
 * @param value - Value to check
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 * @returns Boolean indicating if value is valid
 */
export function isValidRange(value: number, min: number, max: number): boolean {
  return !isNaN(value) && isFinite(value) && value >= min && value <= max
}

/**
 * Check if dimensions are complete (both length and width provided)
 *
 * @param length - Length value
 * @param width - Width value
 * @returns Boolean indicating if dimensions are complete
 */
export function areDimensionsComplete(length: number, width: number): boolean {
  return length > 0 && width > 0 && !isNaN(length) && !isNaN(width)
}

/**
 * Get validation rules for a specific context
 *
 * @param context - Validation context
 * @returns Validation rules object
 */
export function getValidationRules(context: DimensionContext) {
  return VALIDATION_RULES[context]
}

/**
 * Format validation errors for display
 *
 * @param errors - Array of validation errors
 * @returns Object with errors keyed by field
 */
export function formatValidationErrors(
  errors: ValidationError[]
): Record<string, string> {
  const formatted: Record<string, string> = {}

  errors.forEach(error => {
    if (!formatted[error.field]) {
      formatted[error.field] = error.message
    }
  })

  return formatted
}

/**
 * Get error message for a specific field
 *
 * @param errors - Array of validation errors
 * @param field - Field to get error for
 * @returns Error message or undefined
 */
export function getFieldError(
  errors: ValidationError[],
  field: 'length' | 'width' | 'both'
): string | undefined {
  const fieldError = errors.find(e => e.field === field)
  return fieldError?.message
}

/**
 * Check if there are any validation errors
 *
 * @param errors - Array of validation errors
 * @returns Boolean indicating if errors exist
 */
export function hasValidationErrors(errors: ValidationError[]): boolean {
  return errors.length > 0
}

/**
 * Sanitize input value (remove non-numeric characters except decimal point)
 *
 * @param value - Raw input value
 * @returns Sanitized numeric string
 */
export function sanitizeNumericInput(value: string): string {
  // Remove all non-numeric characters except decimal point and minus sign
  return value.replace(/[^0-9.-]/g, '')
}

/**
 * Parse input value safely
 *
 * @param value - Raw input value
 * @returns Parsed number or 0 if invalid
 */
export function parseInputValue(value: string | number): number {
  if (typeof value === 'number') return value

  const sanitized = sanitizeNumericInput(value)
  const parsed = parseFloat(sanitized)

  return isNaN(parsed) ? 0 : parsed
}

/**
 * Validate decimal precision based on unit
 *
 * @param value - Value to check
 * @param unit - Measurement unit
 * @param maxDecimals - Maximum allowed decimals
 * @returns Validation result
 */
export function validateDecimalPrecision(
  value: number,
  unit: Unit,
  maxDecimals: number = 2
): boolean {
  const valueStr = value.toString()
  const decimalIndex = valueStr.indexOf('.')

  if (decimalIndex === -1) return true

  const decimals = valueStr.length - decimalIndex - 1
  return decimals <= maxDecimals
}
