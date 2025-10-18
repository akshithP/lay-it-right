/**
 * Dimensions Store
 *
 * Zustand store with Immer middleware for dimensions state management.
 * Manages room and tile dimensions with automatic calculations and persistence.
 *
 * @pattern Single Responsibility Principle - manages only dimension state
 * @pattern Immutability - uses Immer for safe state updates
 */

import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Unit } from '@/types'
import type {
  DimensionData,
  DimensionContext,
  ValidationError,
  DimensionStore,
  DimensionStoreState,
  DimensionStoreActions
} from '@/types/dimensions'
import {
  calculateArea,
  calculatePerimeter,
  validateDimensions,
  validateDimensionInput
} from '@/utils/dimensions'
import { convertUnit } from '@/utils/unit-conversions'

/**
 * Initial state for the dimensions store
 */
const initialState: DimensionStoreState = {
  // Room dimensions
  roomLength: 0,
  roomWidth: 0,
  roomUnit: 'm',

  // Tile dimensions
  tileLength: 0,
  tileWidth: 0,
  tileUnit: 'cm',

  // Current context
  currentContext: 'room',

  // Calculated values
  roomArea: 0,
  roomPerimeter: 0,
  tileArea: 0,
  tilePerimeter: 0,

  // Validation state
  validationErrors: new Map(),

  // UI state
  isDirty: false,
  isCalculating: false
}

/**
 * Create the dimensions store with Immer and persistence middleware
 */
export const useDimensionsStore = create<DimensionStore>()(
  persist(
    immer<DimensionStore>((set, get) => ({
      ...initialState,

      // ====================
      // Room Dimension Setters
      // ====================

      setRoomLength: (value: number) =>
        set((state) => {
          state.roomLength = value
          state.roomArea = calculateArea(value, state.roomWidth)
          state.roomPerimeter = calculatePerimeter(value, state.roomWidth)
          state.isDirty = true

          // Validate
          const validation = validateDimensionInput(value, 'length', 'room')
          if (!validation.isValid) {
            state.validationErrors.set('room.length', validation.errors)
          } else {
            state.validationErrors.delete('room.length')
          }
        }),

      setRoomWidth: (value: number) =>
        set((state) => {
          state.roomWidth = value
          state.roomArea = calculateArea(state.roomLength, value)
          state.roomPerimeter = calculatePerimeter(state.roomLength, value)
          state.isDirty = true

          // Validate
          const validation = validateDimensionInput(value, 'width', 'room')
          if (!validation.isValid) {
            state.validationErrors.set('room.width', validation.errors)
          } else {
            state.validationErrors.delete('room.width')
          }
        }),

      setRoomUnit: (unit: Unit) =>
        set((state) => {
          const oldUnit = state.roomUnit

          // Convert existing values to new unit
          if (state.roomLength > 0) {
            state.roomLength = convertUnit(state.roomLength, oldUnit, unit)
          }
          if (state.roomWidth > 0) {
            state.roomWidth = convertUnit(state.roomWidth, oldUnit, unit)
          }

          state.roomUnit = unit

          // Recalculate with converted values
          state.roomArea = calculateArea(state.roomLength, state.roomWidth)
          state.roomPerimeter = calculatePerimeter(state.roomLength, state.roomWidth)
          state.isDirty = true
        }),

      setRoomDimensions: (length: number, width: number, unit: Unit) =>
        set((state) => {
          state.roomLength = length
          state.roomWidth = width
          state.roomUnit = unit
          state.roomArea = calculateArea(length, width)
          state.roomPerimeter = calculatePerimeter(length, width)
          state.isDirty = true

          // Validate
          const validation = validateDimensions(length, width, 'room')
          if (!validation.isValid) {
            state.validationErrors.set('room', validation.errors)
          } else {
            state.validationErrors.delete('room')
          }
        }),

      // ====================
      // Tile Dimension Setters
      // ====================

      setTileLength: (value: number) =>
        set((state) => {
          state.tileLength = value
          state.tileArea = calculateArea(value, state.tileWidth)
          state.tilePerimeter = calculatePerimeter(value, state.tileWidth)
          state.isDirty = true

          // Validate
          const validation = validateDimensionInput(value, 'length', 'tile')
          if (!validation.isValid) {
            state.validationErrors.set('tile.length', validation.errors)
          } else {
            state.validationErrors.delete('tile.length')
          }
        }),

      setTileWidth: (value: number) =>
        set((state) => {
          state.tileWidth = value
          state.tileArea = calculateArea(state.tileLength, value)
          state.tilePerimeter = calculatePerimeter(state.tileLength, value)
          state.isDirty = true

          // Validate
          const validation = validateDimensionInput(value, 'width', 'tile')
          if (!validation.isValid) {
            state.validationErrors.set('tile.width', validation.errors)
          } else {
            state.validationErrors.delete('tile.width')
          }
        }),

      setTileUnit: (unit: Unit) =>
        set((state) => {
          const oldUnit = state.tileUnit

          // Convert existing values to new unit
          if (state.tileLength > 0) {
            state.tileLength = convertUnit(state.tileLength, oldUnit, unit)
          }
          if (state.tileWidth > 0) {
            state.tileWidth = convertUnit(state.tileWidth, oldUnit, unit)
          }

          state.tileUnit = unit

          // Recalculate with converted values
          state.tileArea = calculateArea(state.tileLength, state.tileWidth)
          state.tilePerimeter = calculatePerimeter(state.tileLength, state.tileWidth)
          state.isDirty = true
        }),

      setTileDimensions: (length: number, width: number, unit: Unit) =>
        set((state) => {
          state.tileLength = length
          state.tileWidth = width
          state.tileUnit = unit
          state.tileArea = calculateArea(length, width)
          state.tilePerimeter = calculatePerimeter(length, width)
          state.isDirty = true

          // Validate
          const validation = validateDimensions(length, width, 'tile')
          if (!validation.isValid) {
            state.validationErrors.set('tile', validation.errors)
          } else {
            state.validationErrors.delete('tile')
          }
        }),

      // ====================
      // Context Management
      // ====================

      setContext: (context: DimensionContext) =>
        set((state) => {
          state.currentContext = context
        }),

      // ====================
      // Calculation Methods
      // ====================

      calculateRoomArea: () => {
        const state = get()
        return calculateArea(state.roomLength, state.roomWidth)
      },

      calculateRoomPerimeter: () => {
        const state = get()
        return calculatePerimeter(state.roomLength, state.roomWidth)
      },

      calculateTileArea: () => {
        const state = get()
        return calculateArea(state.tileLength, state.tileWidth)
      },

      calculateTilePerimeter: () => {
        const state = get()
        return calculatePerimeter(state.tileLength, state.tileWidth)
      },

      recalculateAll: () =>
        set((state) => {
          state.roomArea = calculateArea(state.roomLength, state.roomWidth)
          state.roomPerimeter = calculatePerimeter(state.roomLength, state.roomWidth)
          state.tileArea = calculateArea(state.tileLength, state.tileWidth)
          state.tilePerimeter = calculatePerimeter(state.tileLength, state.tileWidth)
        }),

      // ====================
      // Validation Methods
      // ====================

      validateRoomDimensions: () => {
        const state = get()
        return validateDimensions(state.roomLength, state.roomWidth, 'room')
      },

      validateTileDimensions: () => {
        const state = get()
        return validateDimensions(state.tileLength, state.tileWidth, 'tile')
      },

      validateDimension: (value: number, field: 'length' | 'width', context: DimensionContext) => {
        return validateDimensionInput(value, field, context)
      },

      setValidationErrors: (context: string, errors: ValidationError[]) =>
        set((state) => {
          if (errors.length > 0) {
            state.validationErrors.set(context, errors)
          } else {
            state.validationErrors.delete(context)
          }
        }),

      clearValidationErrors: (context?: string) =>
        set((state) => {
          if (context) {
            state.validationErrors.delete(context)
          } else {
            state.validationErrors.clear()
          }
        }),

      // ====================
      // Utility Methods
      // ====================

      getRoomData: (): DimensionData => {
        const state = get()
        const validation = validateDimensions(state.roomLength, state.roomWidth, 'room')
        return {
          length: state.roomLength,
          width: state.roomWidth,
          unit: state.roomUnit,
          area: state.roomArea,
          perimeter: state.roomPerimeter
        }
      },

      getTileData: (): DimensionData => {
        const state = get()
        const validation = validateDimensions(state.tileLength, state.tileWidth, 'tile')
        return {
          length: state.tileLength,
          width: state.tileWidth,
          unit: state.tileUnit,
          area: state.tileArea,
          perimeter: state.tilePerimeter
        }
      },

      convertRoomToUnit: (targetUnit: Unit) =>
        set((state) => {
          const oldUnit = state.roomUnit
          state.roomLength = convertUnit(state.roomLength, oldUnit, targetUnit)
          state.roomWidth = convertUnit(state.roomWidth, oldUnit, targetUnit)
          state.roomUnit = targetUnit
          state.roomArea = calculateArea(state.roomLength, state.roomWidth)
          state.roomPerimeter = calculatePerimeter(state.roomLength, state.roomWidth)
        }),

      convertTileToUnit: (targetUnit: Unit) =>
        set((state) => {
          const oldUnit = state.tileUnit
          state.tileLength = convertUnit(state.tileLength, oldUnit, targetUnit)
          state.tileWidth = convertUnit(state.tileWidth, oldUnit, targetUnit)
          state.tileUnit = targetUnit
          state.tileArea = calculateArea(state.tileLength, state.tileWidth)
          state.tilePerimeter = calculatePerimeter(state.tileLength, state.tileWidth)
        }),

      resetRoom: () =>
        set((state) => {
          state.roomLength = 0
          state.roomWidth = 0
          state.roomArea = 0
          state.roomPerimeter = 0
          state.validationErrors.delete('room')
          state.validationErrors.delete('room.length')
          state.validationErrors.delete('room.width')
        }),

      resetTile: () =>
        set((state) => {
          state.tileLength = 0
          state.tileWidth = 0
          state.tileArea = 0
          state.tilePerimeter = 0
          state.validationErrors.delete('tile')
          state.validationErrors.delete('tile.length')
          state.validationErrors.delete('tile.width')
        }),

      resetAll: () => set(initialState),

      // ====================
      // State Flags
      // ====================

      markDirty: () =>
        set((state) => {
          state.isDirty = true
        }),

      markClean: () =>
        set((state) => {
          state.isDirty = false
        }),

      setCalculating: (isCalculating: boolean) =>
        set((state) => {
          state.isCalculating = isCalculating
        })
    })),
    {
      name: 'layitright-dimensions',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist these fields
        roomLength: state.roomLength,
        roomWidth: state.roomWidth,
        roomUnit: state.roomUnit,
        tileLength: state.tileLength,
        tileWidth: state.tileWidth,
        tileUnit: state.tileUnit
      })
    }
  )
)
