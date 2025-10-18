import type { Unit } from './index'

/**
 * Context types for DimensionsInput component usage
 */
export type DimensionContext = 'room' | 'tile' | 'display'

/**
 * Complete dimension data structure
 */
export interface DimensionData {
  length: number
  width: number
  unit: Unit
  area: number
  perimeter: number
}

/**
 * Validation result for dimension inputs
 */
export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
}

/**
 * Individual validation error
 */
export interface ValidationError {
  field: 'length' | 'width' | 'both'
  message: string
  code: 'REQUIRED' | 'MIN_VALUE' | 'MAX_VALUE' | 'INVALID_NUMBER' | 'DECIMAL_PRECISION'
}

/**
 * Visual rectangle calculation result
 */
export interface RectangleCalculation {
  width: number
  height: number
  x: number
  y: number
  labelPositions: {
    top: { x: number; y: number }
    left: { x: number; y: number }
  }
}

/**
 * Props for DimensionsInput main component
 */
export interface DimensionsInputProps {
  context: DimensionContext
  title: string
  subtitle?: string
  initialLength?: number
  initialWidth?: number
  initialUnit?: Unit
  onComplete?: (data: DimensionData) => void
  onChange?: (data: DimensionData) => void
  readOnly?: boolean
  showVisualizer?: boolean
  showStats?: boolean
  minValue?: number
  maxValue?: number
  className?: string
  testId?: string
}

/**
 * Props for DimensionInputField component
 */
export interface DimensionInputFieldProps {
  label: string
  value: number
  onChange: (value: number) => void
  unit: Unit
  readOnly?: boolean
  minValue?: number
  maxValue?: number
  error?: string
  testId?: string
  autoFocus?: boolean
  className?: string
}

/**
 * Props for UnitSelector component
 */
export interface UnitSelectorProps {
  selectedUnit: Unit
  onUnitChange: (unit: Unit) => void
  disabled?: boolean
  className?: string
  testId?: string
}

/**
 * Props for DimensionsVisualizer component
 */
export interface DimensionsVisualizerProps {
  length: number
  width: number
  unit: Unit
  className?: string
}

/**
 * Props for DimensionsStats component
 */
export interface DimensionsStatsProps {
  area: number
  perimeter: number
  unit: Unit
  className?: string
}

/**
 * Dimension store state
 */
export interface DimensionStoreState {
  // Room dimensions
  roomLength: number
  roomWidth: number
  roomUnit: Unit

  // Tile dimensions
  tileLength: number
  tileWidth: number
  tileUnit: Unit

  // Current context
  currentContext: DimensionContext

  // Calculated values
  roomArea: number
  roomPerimeter: number
  tileArea: number
  tilePerimeter: number

  // Validation state
  validationErrors: Map<string, ValidationError[]>

  // UI state
  isDirty: boolean
  isCalculating: boolean
}

/**
 * Dimension store actions
 */
export interface DimensionStoreActions {
  // Room dimension setters
  setRoomLength: (value: number) => void
  setRoomWidth: (value: number) => void
  setRoomUnit: (unit: Unit) => void
  setRoomDimensions: (length: number, width: number, unit: Unit) => void

  // Tile dimension setters
  setTileLength: (value: number) => void
  setTileWidth: (value: number) => void
  setTileUnit: (unit: Unit) => void
  setTileDimensions: (length: number, width: number, unit: Unit) => void

  // Context management
  setContext: (context: DimensionContext) => void

  // Calculation methods
  calculateRoomArea: () => number
  calculateRoomPerimeter: () => number
  calculateTileArea: () => number
  calculateTilePerimeter: () => number
  recalculateAll: () => void

  // Validation methods
  validateRoomDimensions: () => ValidationResult
  validateTileDimensions: () => ValidationResult
  validateDimension: (value: number, field: 'length' | 'width', context: DimensionContext) => ValidationResult
  setValidationErrors: (context: string, errors: ValidationError[]) => void
  clearValidationErrors: (context?: string) => void

  // Utility methods
  getRoomData: () => DimensionData
  getTileData: () => DimensionData
  convertRoomToUnit: (targetUnit: Unit) => void
  convertTileToUnit: (targetUnit: Unit) => void
  resetRoom: () => void
  resetTile: () => void
  resetAll: () => void

  // State flags
  markDirty: () => void
  markClean: () => void
  setCalculating: (isCalculating: boolean) => void
}

/**
 * Complete dimension store type
 */
export type DimensionStore = DimensionStoreState & DimensionStoreActions
