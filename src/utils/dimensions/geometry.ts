import type { RectangleCalculation } from '@/types/dimensions'

/**
 * Calculate area of a rectangle
 * @param length - Length dimension
 * @param width - Width dimension
 * @returns Area in square units
 */
export function calculateArea(length: number, width: number): number {
  if (length <= 0 || width <= 0) return 0
  return length * width
}

/**
 * Calculate perimeter of a rectangle
 * @param length - Length dimension
 * @param width - Width dimension
 * @returns Perimeter in linear units
 */
export function calculatePerimeter(length: number, width: number): number {
  if (length <= 0 || width <= 0) return 0
  return 2 * (length + width)
}

/**
 * Calculate proportional rectangle size for SVG visualization
 * Maintains aspect ratio and centers within canvas bounds
 *
 * @param length - Rectangle length
 * @param width - Rectangle width
 * @param canvasWidth - Canvas width (default: 600)
 * @param canvasHeight - Canvas height (default: 400)
 * @param maxRectWidth - Maximum rectangle width (default: 300)
 * @param maxRectHeight - Maximum rectangle height (default: 200)
 * @returns Rectangle dimensions and position with label positions
 */
export function calculateProportionalSize(
  length: number,
  width: number,
  canvasWidth: number = 600,
  canvasHeight: number = 400,
  maxRectWidth: number = 300,
  maxRectHeight: number = 200
): RectangleCalculation {
  // Handle edge cases
  if (length <= 0 || width <= 0) {
    return {
      width: 0,
      height: 0,
      x: canvasWidth / 2,
      y: canvasHeight / 2,
      labelPositions: {
        top: { x: canvasWidth / 2, y: canvasHeight / 2 - 15 },
        left: { x: canvasWidth / 2 - 15, y: canvasHeight / 2 }
      }
    }
  }

  const ratio = length / width
  let rectWidth: number
  let rectHeight: number

  // Scale proportionally to fit within max bounds
  if (ratio > maxRectWidth / maxRectHeight) {
    // Length is the limiting dimension
    rectWidth = maxRectWidth
    rectHeight = maxRectWidth / ratio
  } else {
    // Width is the limiting dimension
    rectHeight = maxRectHeight
    rectWidth = maxRectHeight * ratio
  }

  // Center the rectangle on canvas
  const x = (canvasWidth - rectWidth) / 2
  const y = (canvasHeight - rectHeight) / 2

  // Calculate label positions
  const labelPositions = {
    top: {
      x: x + rectWidth / 2,
      y: y - 15
    },
    left: {
      x: x - 15,
      y: y + rectHeight / 2
    }
  }

  return {
    width: rectWidth,
    height: rectHeight,
    x,
    y,
    labelPositions
  }
}

/**
 * Format a dimension value with appropriate precision
 * @param value - Numeric value
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted string
 */
export function formatDimension(value: number, decimals: number = 2): string {
  if (value === 0) return '0'

  // Remove trailing zeros
  const formatted = value.toFixed(decimals)
  return formatted.replace(/\.?0+$/, '')
}

/**
 * Round to specified decimal places
 * @param value - Value to round
 * @param decimals - Number of decimal places
 * @returns Rounded value
 */
export function roundToDecimals(value: number, decimals: number = 2): number {
  const multiplier = Math.pow(10, decimals)
  return Math.round(value * multiplier) / multiplier
}

/**
 * Check if a value is within valid range
 * @param value - Value to check
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 * @returns Boolean indicating if value is in range
 */
export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max
}

/**
 * Clamp a value between min and max
 * @param value - Value to clamp
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Clamped value
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * Check if dimensions are valid (non-zero, non-negative)
 * @param length - Length dimension
 * @param width - Width dimension
 * @returns Boolean indicating validity
 */
export function areValidDimensions(length: number, width: number): boolean {
  return length > 0 && width > 0 &&
         !isNaN(length) && !isNaN(width) &&
         isFinite(length) && isFinite(width)
}

/**
 * Calculate aspect ratio
 * @param length - Length dimension
 * @param width - Width dimension
 * @returns Aspect ratio (length / width)
 */
export function calculateAspectRatio(length: number, width: number): number {
  if (width === 0) return 0
  return length / width
}
