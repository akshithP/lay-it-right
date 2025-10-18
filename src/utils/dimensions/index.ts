/**
 * Dimensions utilities index
 * Centralized exports for all dimension-related utilities
 */

// Geometry utilities
export {
  calculateArea,
  calculatePerimeter,
  calculateProportionalSize,
  formatDimension,
  roundToDecimals,
  isInRange,
  clamp,
  areValidDimensions,
  calculateAspectRatio
} from './geometry'

// Validation utilities
export {
  validateDimensionInput,
  validateDimensions,
  isValidRange,
  areDimensionsComplete,
  getValidationRules,
  formatValidationErrors,
  getFieldError,
  hasValidationErrors,
  sanitizeNumericInput,
  parseInputValue,
  validateDecimalPrecision
} from './validation'
