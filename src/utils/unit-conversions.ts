import convert from 'convert-units'
import type { Unit } from '@/types'

// Convert-units doesn't include all our units, so we'll create our own conversion system
const UNIT_TO_METERS = {
  mm: 0.001,
  cm: 0.01,
  m: 1,
  in: 0.0254,
  ft: 0.3048
} as const

const UNIT_TO_MM = {
  mm: 1,
  cm: 10,
  m: 1000,
  in: 25.4,
  ft: 304.8
} as const

/**
 * Convert a value from one unit to another
 */
export function convertUnit(value: number, fromUnit: Unit, toUnit: Unit): number {
  if (fromUnit === toUnit) return value
  
  // Convert to meters first, then to target unit
  const valueInMeters = value * UNIT_TO_METERS[fromUnit]
  const convertedValue = valueInMeters / UNIT_TO_METERS[toUnit]
  
  return convertedValue
}

/**
 * Convert area from one unit to another (squared units)
 */
export function convertArea(area: number, fromUnit: Unit, toUnit: Unit): number {
  if (fromUnit === toUnit) return area
  
  const conversionFactor = UNIT_TO_METERS[fromUnit] / UNIT_TO_METERS[toUnit]
  return area * (conversionFactor * conversionFactor)
}

/**
 * Normalize all measurements to millimeters for consistent calculations
 */
export function normalizeToMm(value: number, unit: Unit): number {
  return value * UNIT_TO_MM[unit]
}

/**
 * Convert from millimeters to specified unit
 */
export function convertFromMm(value: number, unit: Unit): number {
  return value / UNIT_TO_MM[unit]
}

/**
 * Get display name for unit
 */
export function getUnitDisplayName(unit: Unit, plural = false): string {
  const names = {
    mm: plural ? 'millimeters' : 'millimeter',
    cm: plural ? 'centimeters' : 'centimeter',
    m: plural ? 'meters' : 'meter',
    in: plural ? 'inches' : 'inch',
    ft: plural ? 'feet' : 'foot'
  }
  
  return names[unit]
}

/**
 * Get short display name for unit
 */
export function getUnitShortName(unit: Unit): string {
  return unit
}

/**
 * Format a number with unit for display
 */
export function formatWithUnit(value: number, unit: Unit, decimals = 2): string {
  const formattedValue = value.toFixed(decimals).replace(/\\.?0+$/, '')
  return `${formattedValue} ${unit}`
}

/**
 * Get appropriate precision based on unit
 */
export function getUnitPrecision(unit: Unit): number {
  switch (unit) {
    case 'mm':
      return 0
    case 'cm':
      return 1
    case 'm':
      return 2
    case 'in':
      return 2
    case 'ft':
      return 2
    default:
      return 2
  }
}

/**
 * Check if unit is metric
 */
export function isMetricUnit(unit: Unit): boolean {
  return ['mm', 'cm', 'm'].includes(unit)
}

/**
 * Check if unit is imperial
 */
export function isImperialUnit(unit: Unit): boolean {
  return ['in', 'ft'].includes(unit)
}

/**
 * Get suggested step value for input based on unit
 */
export function getUnitStep(unit: Unit): number {
  switch (unit) {
    case 'mm':
      return 1
    case 'cm':
      return 0.1
    case 'm':
      return 0.01
    case 'in':
      return 0.1
    case 'ft':
      return 0.1
    default:
      return 0.1
  }
}
