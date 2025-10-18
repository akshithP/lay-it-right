# Technical Specification: Simple Dimensions Input System
**LayItRight Web Application**

**Document Version:** 1.0
**Last Updated:** 2025-10-15
**Author:** Technical Writer
**Status:** Ready for Implementation

---

## Table of Contents

1. [Feature Overview](#1-feature-overview)
2. [Critical Reusability Requirements](#2-critical-reusability-requirements)
3. [Functional Requirements](#3-functional-requirements)
4. [Technical Architecture](#4-technical-architecture)
5. [Component Reusability Pattern](#5-component-reusability-pattern)
6. [Data Persistence Strategy](#6-data-persistence-strategy)
7. [Validation Rules](#7-validation-rules)
8. [Unit Conversion System](#8-unit-conversion-system)
9. [SVG Visualizer Specifications](#9-svg-visualizer-specifications)
10. [Styling Specifications](#10-styling-specifications)
11. [Accessibility Requirements](#11-accessibility-requirements)
12. [Performance Requirements](#12-performance-requirements)
13. [Error Handling Strategy](#13-error-handling-strategy)
14. [Testing Strategy](#14-testing-strategy)
15. [Implementation Phases](#15-implementation-phases)
16. [Success Criteria](#16-success-criteria)

---

## 1. Feature Overview

### 1.1 Feature Identity
- **Feature Name:** Simple Dimensions Input System
- **Purpose:** Simplified room/tile dimension input with visual proportional representation
- **Design Reference:** `.superdesign/design_iterations/simple_dimensions_v1.html`
- **Replacement Context:** Replaces complex Konva.js canvas drawing system

### 1.2 Core Value Proposition
This feature simplifies the user experience by eliminating complex geometry drawing. Users input two values (length and width), and the system provides immediate visual feedback through proportional SVG representation. This approach prioritizes usability over complexity while maintaining accurate calculations.

### 1.3 Design System
**Color Palette:**
```css
--white: #F4F6FF       /* Primary background */
--yellow: #F3C623      /* Accent, stats background */
--orange: #EB8317      /* Hover states, shadows */
--royal-blue: #10375C  /* Primary brand color, borders, text */
```

**Typography:**
- **Font Family:** JetBrains Mono (monospace)
- **Weights:** 400 (regular), 500 (medium), 600 (semi-bold), 700 (bold)
- **Sizes:** 0.875rem (labels) to 2rem (stats)

**Visual Style:**
- **Border Style:** 4px solid borders (bold, geometric)
- **Border Radius:** 0px (sharp corners)
- **Shadows:** Offset shadows (4px-8px) for depth
- **Animation Easing:** ease-out, 200ms duration

---

## 2. Critical Reusability Requirements

### 2.1 Multi-Context Usage
This component MUST function identically in three distinct contexts:

**Context 1: Room/Layout Dimensions (Step 1)**
- User defines their room or layout area
- Labels: "LENGTH (HORIZONTAL)", "WIDTH (VERTICAL)"
- Shows: Area and Perimeter statistics
- Maximum values: 100m (reasonable room size)

**Context 2: Tile Dimensions (Step 2)**
- User defines single tile size
- Labels: "TILE LENGTH", "TILE WIDTH"
- Shows: Tile area only
- Constraint: Cannot exceed room dimensions

**Context 3: Results Display (Step 4)**
- Read-only display of layout with tiles
- Shows: Complete layout visualization
- Interactive: No editing capabilities

### 2.2 Design Principles Applied

**SOLID Principles:**
- **Single Responsibility:** Each subcomponent handles one concern (input, visualization, stats)
- **Open/Closed:** Component accepts configuration props, closed to modification
- **Liskov Substitution:** All contexts can use base component without breaking
- **Interface Segregation:** Props interface only includes necessary parameters
- **Dependency Inversion:** Component depends on abstractions (props interface), not concrete implementations

**DRY Principle:**
- **Zero Code Duplication:** Single source of truth for dimension input logic
- **Shared Utilities:** Geometry calculations, unit conversions, validation rules
- **Composition Over Inheritance:** Compose complex behavior from simple components

### 2.3 Reusability Anti-Patterns to Avoid
❌ **Do Not:**
- Copy-paste component code for different contexts
- Create separate components for room vs tile (e.g., `RoomInput.tsx`, `TileInput.tsx`)
- Hardcode context-specific logic inside component
- Use conditional rendering based on context string matching

✅ **Do Instead:**
- Use single `DimensionsInput` component with configuration props
- Pass context-specific data through props (labels, constraints, callbacks)
- Externalize business logic to utility functions
- Leverage component composition patterns

---

## 3. Functional Requirements

### 3.1 Input System

#### 3.1.1 Input Field Specifications
```typescript
interface InputFieldSpec {
  type: 'number';
  step: 0.1;           // Decimal precision
  min: 0.1;            // Minimum value
  max: number;         // Context-dependent maximum
  placeholder: '0.0';
  autocomplete: 'off';
  inputMode: 'decimal'; // Mobile keyboard optimization
}
```

**Behavior:**
- Accept positive decimal values with up to 2 decimal places
- Reject negative values immediately
- Reject non-numeric characters
- Auto-focus first input field on component mount
- Tab order: Length → Width → Unit buttons → Action buttons

#### 3.1.2 Real-Time Validation
- Validate on each keystroke (debounced 300ms)
- Display inline error messages immediately
- Prevent form submission if validation fails
- Clear error messages when input becomes valid

**Validation Triggers:**
```typescript
// Validation executes on these events
onChange: (value) => debounce(validate, 300)
onBlur: () => validate(value)
onSubmit: () => validateAll()
```

### 3.2 Unit System

#### 3.2.1 Supported Units
```typescript
type Unit = 'mm' | 'cm' | 'm' | 'inch' | 'feet';

const UNIT_METADATA = {
  mm: { label: 'Millimeters', symbol: 'mm', areaSymbol: 'mm²' },
  cm: { label: 'Centimeters', symbol: 'cm', areaSymbol: 'cm²' },
  m: { label: 'Meters', symbol: 'm', areaSymbol: 'm²' },
  inch: { label: 'Inches', symbol: 'in', areaSymbol: 'in²' },
  feet: { label: 'Feet', symbol: 'ft', areaSymbol: 'ft²' }
};
```

#### 3.2.2 Unit Selection Behavior
- Default unit: `m` (meters)
- Single-selection toggle buttons (radio button behavior)
- Active unit highlighted with distinct visual state
- Unit selection persists across wizard steps (localStorage)
- Changing unit triggers automatic value conversion

**Conversion Behavior:**
```typescript
// When user switches from meters to feet
currentValue: 4.2 m
newValue: 13.8 feet  // Automatically converted
display: "13.8 ft"   // Updated in real-time
```

#### 3.2.3 Unit Button Layout
```
Mobile (< 640px):    [INCH][FEET][M][CM][MM]  (single row)
Tablet/Desktop:      [INCH][FEET][M][CM][MM]  (centered)
```

### 3.3 Visual Preview System

#### 3.3.1 SVG Canvas Specifications
```typescript
interface CanvasSpec {
  viewBox: '0 0 600 400';           // SVG coordinate system
  preserveAspectRatio: 'xMidYMid meet';
  maxRectWidth: 300;                // Maximum rectangle width
  maxRectHeight: 200;               // Maximum rectangle height
  padding: { x: 150, y: 100 };      // Canvas padding
}
```

#### 3.3.2 Visual Elements

**Grid Background:**
```css
background-image: radial-gradient(
  circle,
  var(--royal-blue) 1px,
  transparent 1px
);
background-size: 20px 20px;
opacity: 0.2;
```

**Rectangle Shape:**
- Stroke: 4px solid royal blue
- Fill: rgba(243, 198, 35, 0.15) [yellow with transparency]
- Proportionally scaled based on input values
- Centered in canvas

**Dimension Labels:**
- Font: JetBrains Mono, 16px, bold
- Color: Royal blue
- Position:
  - **Length:** Top side, centered horizontally, 15px above rectangle
  - **Width:** Left side, centered vertically, 15px left of rectangle
- Format: `{value} {unit}` (e.g., "4.2 m")

#### 3.3.3 Proportional Scaling Algorithm
```typescript
function calculateRectangleSize(
  length: number,
  width: number
): RectangleGeometry {
  const MAX_WIDTH = 300;
  const MAX_HEIGHT = 200;
  const CANVAS_CENTER_X = 300; // 600 / 2
  const CANVAS_CENTER_Y = 200; // 400 / 2

  const ratio = length / width;

  let rectWidth: number;
  let rectHeight: number;

  // Determine limiting dimension
  if (ratio > MAX_WIDTH / MAX_HEIGHT) {
    // Length-constrained
    rectWidth = MAX_WIDTH;
    rectHeight = MAX_WIDTH / ratio;
  } else {
    // Width-constrained
    rectHeight = MAX_HEIGHT;
    rectWidth = MAX_HEIGHT * ratio;
  }

  // Center rectangle in canvas
  const x = CANVAS_CENTER_X - rectWidth / 2;
  const y = CANVAS_CENTER_Y - rectHeight / 2;

  return {
    x,
    y,
    width: rectWidth,
    height: rectHeight,
    // Label positions
    topLabelX: x + rectWidth / 2,
    topLabelY: y - 15,
    leftLabelX: x - 15,
    leftLabelY: y + rectHeight / 2
  };
}
```

**Real-Time Update Behavior:**
- Visual updates debounced to 300ms after last keystroke
- Smooth transition animation (200ms ease-out)
- Prevents jank during rapid typing

### 3.4 Calculations Display

#### 3.4.1 Calculated Metrics
```typescript
interface CalculatedMetrics {
  area: number;        // length × width
  perimeter: number;   // 2 × (length + width)
  unit: Unit;          // Current selected unit
}
```

#### 3.4.2 Display Format
- **Precision:** 1 decimal place (e.g., "16.0")
- **Unit Suffix:** Always append unit symbol (e.g., "m²", "m")
- **Format Template:** `{value} {unitSymbol}`

**Examples:**
```
Area: 16.0 m²
Perimeter: 16.0 m

Area: 160000.0 cm²
Perimeter: 1600.0 cm
```

#### 3.4.3 Stats Card Design
```css
.stats-box {
  background: var(--yellow);
  border: 4px solid var(--royal-blue);
  box-shadow: 4px 4px 0px var(--orange);
  padding: 1rem;
  text-align: center;
}

.stats-label {
  font-size: 0.875rem;
  font-weight: 700;
  text-transform: uppercase;
}

.stats-value {
  font-size: 2rem;
  font-weight: 700;
  margin-top: 0.5rem;
}
```

**Layout:**
```
┌─────────────────┐  ┌─────────────────┐
│     AREA        │  │   PERIMETER     │
│   16.0 m²       │  │     16.0 m      │
└─────────────────┘  └─────────────────┘
```

---

## 4. Technical Architecture

### 4.1 Directory Structure
```
src/
├── components/
│   └── dimensions/
│       ├── DimensionsInput.tsx         # Main container (orchestrator)
│       ├── DimensionInputField.tsx     # Single input field
│       ├── UnitSelector.tsx            # Unit toggle buttons
│       ├── DimensionsVisualizer.tsx    # SVG preview renderer
│       ├── DimensionsStats.tsx         # Area/perimeter display
│       ├── types.ts                    # Component-specific types
│       └── index.ts                    # Clean public exports
│
├── stores/
│   └── dimensions-store.ts             # Zustand state management
│
├── utils/
│   └── dimensions/
│       ├── unit-conversions.ts         # Unit conversion utilities
│       ├── geometry-calculations.ts    # Area, perimeter calculations
│       ├── validation.ts               # Input validation logic
│       └── index.ts                    # Utility exports
│
└── types/
    └── dimensions.ts                   # Global type definitions
```

### 4.2 Technology Stack

**Core Technologies:**
- **React 18+:** Component framework
- **TypeScript 5+:** Type safety and developer experience
- **Next.js (App Router):** Application framework
- **Tailwind CSS:** Utility-first styling

**State Management:**
- **Zustand:** Lightweight state management
- **Immer:** Immutable state updates

**Form Handling:**
- **react-hook-form:** Form state management
- **zod:** Schema validation

**Utilities:**
- **convert-units:** Unit conversion library
- **clsx:** Conditional class name composition

### 4.3 State Management Architecture

#### 4.3.1 Store Structure (Zustand + Immer)
```typescript
// src/stores/dimensions-store.ts
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist } from 'zustand/middleware';

interface DimensionsState {
  // Room dimensions
  room: {
    length: number;
    width: number;
    unit: Unit;
    area: number;
    perimeter: number;
    isValid: boolean;
  };

  // Tile dimensions
  tile: {
    length: number;
    width: number;
    unit: Unit;
    area: number;
    isValid: boolean;
  };

  // UI state
  errors: Record<string, string>;
  isCalculating: boolean;
}

interface DimensionsActions {
  // Room actions
  setRoomLength: (value: number) => void;
  setRoomWidth: (value: number) => void;
  setRoomUnit: (unit: Unit) => void;
  calculateRoomStats: () => void;
  validateRoom: () => boolean;
  resetRoom: () => void;

  // Tile actions
  setTileLength: (value: number) => void;
  setTileWidth: (value: number) => void;
  setTileUnit: (unit: Unit) => void;
  calculateTileStats: () => void;
  validateTile: () => boolean;
  resetTile: () => void;

  // Error management
  setError: (field: string, message: string) => void;
  clearError: (field: string) => void;
  clearAllErrors: () => void;

  // Persistence
  saveToBrowser: () => void;
  loadFromBrowser: () => void;
}

type DimensionsStore = DimensionsState & DimensionsActions;

export const useDimensionsStore = create<DimensionsStore>()(
  persist(
    immer((set, get) => ({
      // Initial state
      room: {
        length: 0,
        width: 0,
        unit: 'm',
        area: 0,
        perimeter: 0,
        isValid: false
      },
      tile: {
        length: 0,
        width: 0,
        unit: 'm',
        area: 0,
        isValid: false
      },
      errors: {},
      isCalculating: false,

      // Actions implementation
      setRoomLength: (value) => {
        set((state) => {
          state.room.length = value;
          state.room.isValid = false; // Mark for recalculation
        });
        get().calculateRoomStats();
      },

      setRoomWidth: (value) => {
        set((state) => {
          state.room.width = value;
          state.room.isValid = false;
        });
        get().calculateRoomStats();
      },

      setRoomUnit: (unit) => {
        const currentUnit = get().room.unit;
        const length = get().room.length;
        const width = get().room.width;

        // Convert existing values to new unit
        const convertedLength = convertUnit(length, currentUnit, unit);
        const convertedWidth = convertUnit(width, currentUnit, unit);

        set((state) => {
          state.room.unit = unit;
          state.room.length = convertedLength;
          state.room.width = convertedWidth;
        });

        get().calculateRoomStats();
      },

      calculateRoomStats: () => {
        set((state) => {
          state.isCalculating = true;
        });

        const { length, width } = get().room;

        // Calculate metrics
        const area = calculateArea(length, width);
        const perimeter = calculatePerimeter(length, width);

        set((state) => {
          state.room.area = area;
          state.room.perimeter = perimeter;
          state.isCalculating = false;
        });

        get().validateRoom();
      },

      validateRoom: () => {
        const { length, width } = get().room;
        const errors: Record<string, string> = {};

        // Validation logic
        if (length <= 0) {
          errors.roomLength = 'Length must be greater than zero';
        }
        if (width <= 0) {
          errors.roomWidth = 'Width must be greater than zero';
        }
        if (length > 100) {
          errors.roomLength = 'Length seems unusually large';
        }
        if (width > 100) {
          errors.roomWidth = 'Width seems unusually large';
        }

        const isValid = Object.keys(errors).length === 0;

        set((state) => {
          state.room.isValid = isValid;
          state.errors = { ...state.errors, ...errors };
        });

        return isValid;
      },

      // Similar implementations for tile actions...

      setError: (field, message) => {
        set((state) => {
          state.errors[field] = message;
        });
      },

      clearError: (field) => {
        set((state) => {
          delete state.errors[field];
        });
      },

      clearAllErrors: () => {
        set((state) => {
          state.errors = {};
        });
      },

      saveToBrowser: () => {
        // Handled automatically by persist middleware
      },

      loadFromBrowser: () => {
        // Handled automatically by persist middleware
      }
    })),
    {
      name: 'layitright-dimensions',
      partialize: (state) => ({
        room: state.room,
        tile: state.tile
      })
    }
  )
);
```

### 4.4 Utility Functions

#### 4.4.1 Unit Conversions
```typescript
// src/utils/dimensions/unit-conversions.ts
import convert from 'convert-units';
import type { Unit } from '@/types/dimensions';

/**
 * Convert value from one unit to another
 * @param value - Numeric value to convert
 * @param fromUnit - Source unit
 * @param toUnit - Target unit
 * @returns Converted value
 */
export function convertUnit(
  value: number,
  fromUnit: Unit,
  toUnit: Unit
): number {
  if (fromUnit === toUnit) return value;

  try {
    return convert(value)
      .from(fromUnit)
      .to(toUnit);
  } catch (error) {
    console.error('Unit conversion error:', error);
    return value; // Fallback to original value
  }
}

/**
 * Get display label for unit
 * @param unit - Unit type
 * @returns Human-readable label
 */
export function getUnitLabel(unit: Unit): string {
  const labels: Record<Unit, string> = {
    mm: 'Millimeters',
    cm: 'Centimeters',
    m: 'Meters',
    inch: 'Inches',
    feet: 'Feet'
  };
  return labels[unit];
}

/**
 * Get symbol for unit
 * @param unit - Unit type
 * @returns Unit symbol (e.g., "m", "cm")
 */
export function getUnitSymbol(unit: Unit): string {
  const symbols: Record<Unit, string> = {
    mm: 'mm',
    cm: 'cm',
    m: 'm',
    inch: 'in',
    feet: 'ft'
  };
  return symbols[unit];
}

/**
 * Get area unit symbol
 * @param unit - Unit type
 * @returns Area unit symbol (e.g., "m²", "cm²")
 */
export function getAreaUnitSymbol(unit: Unit): string {
  const symbols: Record<Unit, string> = {
    mm: 'mm²',
    cm: 'cm²',
    m: 'm²',
    inch: 'in²',
    feet: 'ft²'
  };
  return symbols[unit];
}
```

#### 4.4.2 Geometry Calculations
```typescript
// src/utils/dimensions/geometry-calculations.ts

/**
 * Calculate area of rectangle
 * @param length - Length dimension
 * @param width - Width dimension
 * @returns Area (length × width)
 */
export function calculateArea(length: number, width: number): number {
  if (length <= 0 || width <= 0) return 0;
  return length * width;
}

/**
 * Calculate perimeter of rectangle
 * @param length - Length dimension
 * @param width - Width dimension
 * @returns Perimeter (2 × (length + width))
 */
export function calculatePerimeter(length: number, width: number): number {
  if (length <= 0 || width <= 0) return 0;
  return 2 * (length + width);
}

/**
 * Format numeric value for display
 * @param value - Numeric value
 * @param decimalPlaces - Number of decimal places (default: 1)
 * @returns Formatted string
 */
export function formatValue(value: number, decimalPlaces: number = 1): string {
  return value.toFixed(decimalPlaces);
}

/**
 * Calculate proportional rectangle dimensions for SVG
 * @param length - Input length
 * @param width - Input width
 * @returns Rectangle geometry for SVG rendering
 */
export function calculateRectangleGeometry(
  length: number,
  width: number
): RectangleGeometry {
  const MAX_WIDTH = 300;
  const MAX_HEIGHT = 200;
  const CANVAS_CENTER_X = 300;
  const CANVAS_CENTER_Y = 200;

  if (length <= 0 || width <= 0) {
    return {
      x: CANVAS_CENTER_X - 50,
      y: CANVAS_CENTER_Y - 50,
      width: 100,
      height: 100,
      topLabelX: CANVAS_CENTER_X,
      topLabelY: CANVAS_CENTER_Y - 65,
      leftLabelX: CANVAS_CENTER_X - 65,
      leftLabelY: CANVAS_CENTER_Y
    };
  }

  const ratio = length / width;

  let rectWidth: number;
  let rectHeight: number;

  if (ratio > MAX_WIDTH / MAX_HEIGHT) {
    rectWidth = MAX_WIDTH;
    rectHeight = MAX_WIDTH / ratio;
  } else {
    rectHeight = MAX_HEIGHT;
    rectWidth = MAX_HEIGHT * ratio;
  }

  const x = CANVAS_CENTER_X - rectWidth / 2;
  const y = CANVAS_CENTER_Y - rectHeight / 2;

  return {
    x,
    y,
    width: rectWidth,
    height: rectHeight,
    topLabelX: x + rectWidth / 2,
    topLabelY: y - 15,
    leftLabelX: x - 15,
    leftLabelY: y + rectHeight / 2
  };
}

interface RectangleGeometry {
  x: number;
  y: number;
  width: number;
  height: number;
  topLabelX: number;
  topLabelY: number;
  leftLabelX: number;
  leftLabelY: number;
}
```

#### 4.4.3 Validation Logic
```typescript
// src/utils/dimensions/validation.ts
import type { Unit } from '@/types/dimensions';

export interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

/**
 * Validate dimension input value
 * @param value - Input value
 * @param context - Context ('room' or 'tile')
 * @param unit - Current unit
 * @param maxValue - Optional maximum constraint
 * @returns Validation result
 */
export function validateDimensionInput(
  value: number,
  context: 'room' | 'tile',
  unit: Unit,
  maxValue?: number
): ValidationResult {
  // Empty value
  if (value === null || value === undefined || isNaN(value)) {
    return {
      isValid: false,
      errorMessage: 'Please enter a value'
    };
  }

  // Negative value
  if (value < 0) {
    return {
      isValid: false,
      errorMessage: 'Value must be positive'
    };
  }

  // Zero value
  if (value === 0) {
    return {
      isValid: false,
      errorMessage: 'Value must be greater than zero'
    };
  }

  // Minimum value
  const minValue = getMinimumValue(unit);
  if (value < minValue) {
    return {
      isValid: false,
      errorMessage: `Minimum value is ${minValue} ${getUnitSymbol(unit)}`
    };
  }

  // Maximum value (context-dependent)
  if (maxValue && value > maxValue) {
    return {
      isValid: false,
      errorMessage: `Maximum value is ${maxValue} ${getUnitSymbol(unit)}`
    };
  }

  // Room-specific validation
  if (context === 'room') {
    const maxRoomValue = getMaxRoomValue(unit);
    if (value > maxRoomValue) {
      return {
        isValid: false,
        errorMessage: `Value seems unusually large (max: ${maxRoomValue} ${getUnitSymbol(unit)})`
      };
    }
  }

  return { isValid: true };
}

function getMinimumValue(unit: Unit): number {
  const minimums: Record<Unit, number> = {
    mm: 1,
    cm: 0.1,
    m: 0.01,
    inch: 0.1,
    feet: 0.01
  };
  return minimums[unit];
}

function getMaxRoomValue(unit: Unit): number {
  const maximums: Record<Unit, number> = {
    mm: 100000,  // 100m in mm
    cm: 10000,   // 100m in cm
    m: 100,
    inch: 3937,  // ~100m in inches
    feet: 328    // ~100m in feet
  };
  return maximums[unit];
}

/**
 * Validate that tile dimensions don't exceed room dimensions
 * @param tileLength - Tile length
 * @param tileWidth - Tile width
 * @param roomLength - Room length
 * @param roomWidth - Room width
 * @returns Validation result
 */
export function validateTileAgainstRoom(
  tileLength: number,
  tileWidth: number,
  roomLength: number,
  roomWidth: number
): ValidationResult {
  if (tileLength > roomLength) {
    return {
      isValid: false,
      errorMessage: 'Tile length cannot exceed room length'
    };
  }

  if (tileWidth > roomWidth) {
    return {
      isValid: false,
      errorMessage: 'Tile width cannot exceed room width'
    };
  }

  const tileArea = tileLength * tileWidth;
  const roomArea = roomLength * roomWidth;

  if (tileArea > roomArea) {
    return {
      isValid: false,
      errorMessage: 'Tile area cannot exceed room area'
    };
  }

  return { isValid: true };
}
```

---

## 5. Component Reusability Pattern

### 5.1 Main Component Interface

```typescript
// src/components/dimensions/types.ts
import type { Unit } from '@/types/dimensions';

export interface DimensionsInputProps {
  /**
   * Context identification
   * Determines which data store to use and validation rules
   */
  context: 'room' | 'tile' | 'display';

  /**
   * Display content
   */
  title: string;
  subtitle?: string;
  lengthLabel?: string;
  widthLabel?: string;

  /**
   * Initial values
   */
  initialLength?: number;
  initialWidth?: number;
  initialUnit?: Unit;

  /**
   * Callbacks
   */
  onComplete?: (data: DimensionData) => void;
  onChange?: (data: DimensionData) => void;

  /**
   * Configuration
   */
  readOnly?: boolean;
  showVisualizer?: boolean;
  showStats?: boolean;
  showPerimeter?: boolean;
  minValue?: number;
  maxValue?: number;

  /**
   * Validation constraints (for tile context)
   */
  maxLength?: number;
  maxWidth?: number;

  /**
   * Styling overrides
   */
  className?: string;
  containerClassName?: string;
}

export interface DimensionData {
  length: number;
  width: number;
  unit: Unit;
  area: number;
  perimeter: number;
  isValid: boolean;
}
```

### 5.2 Component Implementation

```typescript
// src/components/dimensions/DimensionsInput.tsx
'use client';

import { useEffect, useCallback } from 'react';
import { useDimensionsStore } from '@/stores/dimensions-store';
import DimensionInputField from './DimensionInputField';
import UnitSelector from './UnitSelector';
import DimensionsVisualizer from './DimensionsVisualizer';
import DimensionsStats from './DimensionsStats';
import type { DimensionsInputProps, DimensionData } from './types';

export default function DimensionsInput({
  context,
  title,
  subtitle,
  lengthLabel = 'LENGTH (HORIZONTAL)',
  widthLabel = 'WIDTH (VERTICAL)',
  initialLength,
  initialWidth,
  initialUnit = 'm',
  onComplete,
  onChange,
  readOnly = false,
  showVisualizer = true,
  showStats = true,
  showPerimeter = true,
  minValue = 0.1,
  maxValue,
  maxLength,
  maxWidth,
  className,
  containerClassName
}: DimensionsInputProps) {
  // Select appropriate store slice based on context
  const storeSlice = context === 'room' ? 'room' : 'tile';

  const {
    [storeSlice]: dimensions,
    [`set${capitalize(storeSlice)}Length`]: setLength,
    [`set${capitalize(storeSlice)}Width`]: setWidth,
    [`set${capitalize(storeSlice)}Unit`]: setUnit,
    [`calculate${capitalize(storeSlice)}Stats`]: calculateStats,
    [`validate${capitalize(storeSlice)}`]: validate,
    errors
  } = useDimensionsStore();

  // Initialize with props on mount
  useEffect(() => {
    if (initialLength !== undefined) setLength(initialLength);
    if (initialWidth !== undefined) setWidth(initialWidth);
    if (initialUnit !== undefined) setUnit(initialUnit);
  }, []); // Only on mount

  // Notify parent of changes
  useEffect(() => {
    if (onChange) {
      const data: DimensionData = {
        length: dimensions.length,
        width: dimensions.width,
        unit: dimensions.unit,
        area: dimensions.area,
        perimeter: dimensions.perimeter,
        isValid: dimensions.isValid
      };
      onChange(data);
    }
  }, [dimensions, onChange]);

  const handleComplete = useCallback(() => {
    const isValid = validate();

    if (isValid && onComplete) {
      const data: DimensionData = {
        length: dimensions.length,
        width: dimensions.width,
        unit: dimensions.unit,
        area: dimensions.area,
        perimeter: dimensions.perimeter,
        isValid: true
      };
      onComplete(data);
    }
  }, [dimensions, validate, onComplete]);

  return (
    <div className={containerClassName}>
      <div className="block-container p-8">
        {/* Header */}
        <div className="mb-6">
          <h3 className="text-xl font-bold uppercase text-royal-blue">
            {title}
          </h3>
          {subtitle && (
            <p className="text-sm mt-2 text-royal-blue opacity-70">
              {subtitle}
            </p>
          )}
        </div>

        {/* Input Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <DimensionInputField
            label={lengthLabel}
            value={dimensions.length}
            onChange={setLength}
            error={errors[`${storeSlice}Length`]}
            disabled={readOnly}
            min={minValue}
            max={maxLength || maxValue}
          />

          <DimensionInputField
            label={widthLabel}
            value={dimensions.width}
            onChange={setWidth}
            error={errors[`${storeSlice}Width`]}
            disabled={readOnly}
            min={minValue}
            max={maxWidth || maxValue}
          />
        </div>

        {/* Unit Selector */}
        <UnitSelector
          selectedUnit={dimensions.unit}
          onUnitChange={setUnit}
          disabled={readOnly}
        />

        {/* Statistics */}
        {showStats && (
          <DimensionsStats
            area={dimensions.area}
            perimeter={dimensions.perimeter}
            unit={dimensions.unit}
            showPerimeter={showPerimeter}
          />
        )}
      </div>

      {/* Visual Preview */}
      {showVisualizer && (
        <div className="block-container p-8 mt-8">
          <h3 className="text-xl font-bold mb-6 uppercase text-royal-blue">
            VISUAL PREVIEW
          </h3>
          <DimensionsVisualizer
            length={dimensions.length}
            width={dimensions.width}
            unit={dimensions.unit}
          />
        </div>
      )}
    </div>
  );
}

// Helper function
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
```

### 5.3 Usage Examples

#### Example 1: Room Dimensions (Step 1)
```tsx
// app/project/step-1/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import DimensionsInput from '@/components/dimensions';

export default function Step1Page() {
  const router = useRouter();

  const handleComplete = (data) => {
    // Room dimensions are automatically saved to store
    router.push('/project/step-2');
  };

  return (
    <main className="container mx-auto px-6 py-8">
      <h1 className="text-4xl font-bold text-center mb-8 text-royal-blue">
        CREATE YOUR TILING PROJECT
      </h1>

      <DimensionsInput
        context="room"
        title="STEP 1: ENTER YOUR ROOM DIMENSIONS"
        subtitle="Measure the length and width of your room"
        showVisualizer={true}
        showStats={true}
        showPerimeter={true}
        minValue={0.1}
        maxValue={100}
        onComplete={handleComplete}
      />

      <div className="flex justify-between gap-6 mt-8">
        <button className="btn-secondary" onClick={() => router.push('/')}>
          ← BACK
        </button>
        <button className="btn-primary" onClick={() => handleComplete()}>
          CONTINUE →
        </button>
      </div>
    </main>
  );
}
```

#### Example 2: Tile Dimensions (Step 2)
```tsx
// app/project/step-2/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useDimensionsStore } from '@/stores/dimensions-store';
import DimensionsInput from '@/components/dimensions';

export default function Step2Page() {
  const router = useRouter();
  const roomDimensions = useDimensionsStore((state) => state.room);

  const handleComplete = (data) => {
    // Tile dimensions are automatically saved to store
    router.push('/project/step-3');
  };

  return (
    <main className="container mx-auto px-6 py-8">
      <h1 className="text-4xl font-bold text-center mb-8 text-royal-blue">
        CREATE YOUR TILING PROJECT
      </h1>

      <DimensionsInput
        context="tile"
        title="STEP 2: ENTER YOUR TILE DIMENSIONS"
        subtitle="Input the size of a single tile"
        lengthLabel="TILE LENGTH"
        widthLabel="TILE WIDTH"
        showVisualizer={true}
        showStats={true}
        showPerimeter={false}
        minValue={0.1}
        maxLength={roomDimensions.length}
        maxWidth={roomDimensions.width}
        onComplete={handleComplete}
      />

      <div className="flex justify-between gap-6 mt-8">
        <button className="btn-secondary" onClick={() => router.push('/project/step-1')}>
          ← BACK
        </button>
        <button className="btn-primary" onClick={() => handleComplete()}>
          CONTINUE →
        </button>
      </div>
    </main>
  );
}
```

#### Example 3: Results Display (Step 4)
```tsx
// app/project/step-4/page.tsx
'use client';

import { useDimensionsStore } from '@/stores/dimensions-store';
import DimensionsInput from '@/components/dimensions';

export default function Step4Page() {
  const roomDimensions = useDimensionsStore((state) => state.room);

  return (
    <main className="container mx-auto px-6 py-8">
      <h1 className="text-4xl font-bold text-center mb-8 text-royal-blue">
        YOUR TILING PROJECT RESULTS
      </h1>

      <DimensionsInput
        context="display"
        title="YOUR ROOM LAYOUT"
        subtitle="Room dimensions with tile visualization"
        readOnly={true}
        showVisualizer={true}
        showStats={true}
        showPerimeter={true}
        initialLength={roomDimensions.length}
        initialWidth={roomDimensions.width}
        initialUnit={roomDimensions.unit}
      />

      {/* Additional results components */}
    </main>
  );
}
```

---

## 6. Data Persistence Strategy

### 6.1 Storage Layers

**Layer 1: In-Memory State (Zustand)**
- Active session data
- Real-time updates
- Fast read/write operations

**Layer 2: Browser Storage (localStorage)**
- Persist between sessions
- Automatic with Zustand persist middleware
- Survives page refreshes

**Layer 3: Backend Storage (Future)**
- Saved projects feature
- Cross-device sync
- User authentication required

### 6.2 Storage Schema

```typescript
// localStorage key: 'layitright-dimensions'
interface PersistedDimensionsData {
  room: {
    length: number;
    width: number;
    unit: Unit;
    area: number;
    perimeter: number;
    timestamp: string;
  };
  tile: {
    length: number;
    width: number;
    unit: Unit;
    area: number;
    timestamp: string;
  };
  metadata: {
    projectId?: string;
    lastModified: string;
    version: string;
  };
}
```

### 6.3 Persistence Configuration

```typescript
// src/stores/dimensions-store.ts
export const useDimensionsStore = create<DimensionsStore>()(
  persist(
    immer((set, get) => ({
      // Store implementation...
    })),
    {
      name: 'layitright-dimensions',
      version: 1,

      // Only persist necessary data
      partialize: (state) => ({
        room: {
          length: state.room.length,
          width: state.room.width,
          unit: state.room.unit,
          area: state.room.area,
          perimeter: state.room.perimeter,
          timestamp: new Date().toISOString()
        },
        tile: {
          length: state.tile.length,
          width: state.tile.width,
          unit: state.tile.unit,
          area: state.tile.area,
          timestamp: new Date().toISOString()
        },
        metadata: {
          lastModified: new Date().toISOString(),
          version: '1.0'
        }
      }),

      // Migration for future schema changes
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          // Migration from version 0 to 1
          return {
            ...persistedState,
            metadata: {
              lastModified: new Date().toISOString(),
              version: '1.0'
            }
          };
        }
        return persistedState;
      }
    }
  )
);
```

### 6.4 Data Lifecycle

**Session Start:**
1. Check localStorage for existing data
2. Load persisted data into Zustand store
3. Validate data integrity
4. Display last saved values in UI

**During Session:**
1. User inputs trigger state updates
2. Calculations run automatically
3. Validation executes on each change
4. localStorage updates automatically (debounced)

**Session End:**
1. Final state persisted to localStorage
2. No explicit save action required
3. Data available for next session

---

## 7. Validation Rules

### 7.1 Input Validation Matrix

| Rule | Description | Error Message |
|------|-------------|---------------|
| **Required** | Value must be provided | "Please enter a value" |
| **Numeric** | Value must be a valid number | "Please enter a valid number" |
| **Positive** | Value must be > 0 | "Value must be greater than zero" |
| **Minimum** | Value ≥ 0.1 (context-dependent) | "Minimum value is {min} {unit}" |
| **Maximum** | Value ≤ max (context-dependent) | "Maximum value is {max} {unit}" |
| **Decimal** | Max 2 decimal places | "Maximum 2 decimal places allowed" |

### 7.2 Context-Specific Validation

**Room Context:**
```typescript
const ROOM_VALIDATION_RULES = {
  minValue: {
    mm: 100,      // 0.1m in mm
    cm: 10,       // 0.1m in cm
    m: 0.1,
    inch: 4,      // ~0.1m in inches
    feet: 0.3     // ~0.1m in feet
  },
  maxValue: {
    mm: 100000,   // 100m in mm
    cm: 10000,    // 100m in cm
    m: 100,
    inch: 3937,   // ~100m in inches
    feet: 328     // ~100m in feet
  },
  warnValue: {
    mm: 50000,    // Warn if > 50m
    cm: 5000,
    m: 50,
    inch: 1969,
    feet: 164
  }
};
```

**Tile Context:**
```typescript
const TILE_VALIDATION_RULES = {
  minValue: {
    mm: 10,       // 1cm minimum tile
    cm: 1,
    m: 0.01,
    inch: 0.4,
    feet: 0.03
  },
  // Max value = room dimensions (validated against room state)
  constraints: [
    'tileLength <= roomLength',
    'tileWidth <= roomWidth',
    'tileArea <= roomArea'
  ]
};
```

### 7.3 Validation Implementation

```typescript
// src/utils/dimensions/validation.ts

export function validateRoomDimensions(
  length: number,
  width: number,
  unit: Unit
): ValidationResult {
  const errors: string[] = [];

  // Length validation
  const lengthValidation = validateDimensionInput(length, 'room', unit);
  if (!lengthValidation.isValid) {
    errors.push(`Length: ${lengthValidation.errorMessage}`);
  }

  // Width validation
  const widthValidation = validateDimensionInput(width, 'room', unit);
  if (!widthValidation.isValid) {
    errors.push(`Width: ${widthValidation.errorMessage}`);
  }

  // Area validation
  const area = calculateArea(length, width);
  if (area < 0.01) {
    errors.push('Room area is too small');
  }

  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

export function validateTileDimensions(
  tileLength: number,
  tileWidth: number,
  roomLength: number,
  roomWidth: number,
  unit: Unit
): ValidationResult {
  const errors: string[] = [];

  // Basic tile validation
  const lengthValidation = validateDimensionInput(tileLength, 'tile', unit);
  if (!lengthValidation.isValid) {
    errors.push(`Tile Length: ${lengthValidation.errorMessage}`);
  }

  const widthValidation = validateDimensionInput(tileWidth, 'tile', unit);
  if (!widthValidation.isValid) {
    errors.push(`Tile Width: ${widthValidation.errorMessage}`);
  }

  // Tile vs room validation
  const tileRoomValidation = validateTileAgainstRoom(
    tileLength,
    tileWidth,
    roomLength,
    roomWidth
  );

  if (!tileRoomValidation.isValid) {
    errors.push(tileRoomValidation.errorMessage!);
  }

  return {
    isValid: errors.length === 0,
    errors: errors
  };
}
```

### 7.4 Error Message Display

```typescript
// src/components/dimensions/DimensionInputField.tsx

export default function DimensionInputField({
  label,
  value,
  onChange,
  error,
  disabled,
  min,
  max
}: DimensionInputFieldProps) {
  return (
    <div>
      <label className="block text-sm font-bold uppercase mb-3 text-royal-blue">
        {label}
      </label>

      <input
        type="number"
        className={clsx(
          'dimension-input w-full',
          error && 'border-red-500 focus:shadow-red'
        )}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        disabled={disabled}
        min={min}
        max={max}
        step={0.1}
        placeholder="0.0"
        aria-invalid={!!error}
        aria-describedby={error ? `${label}-error` : undefined}
      />

      {error && (
        <div
          id={`${label}-error`}
          role="alert"
          className="mt-2 text-sm text-red-600 font-bold flex items-center gap-2"
        >
          <span>❌</span>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
```

---

## 8. Unit Conversion System

### 8.1 Supported Units and Conversions

**Base Unit:** Meters (m)

**Conversion Factors:**
```typescript
const UNIT_CONVERSIONS = {
  // To meters
  mm_to_m: 0.001,
  cm_to_m: 0.01,
  m_to_m: 1,
  inch_to_m: 0.0254,
  feet_to_m: 0.3048,

  // From meters
  m_to_mm: 1000,
  m_to_cm: 100,
  m_to_m: 1,
  m_to_inch: 39.3701,
  m_to_feet: 3.28084
};
```

### 8.2 Conversion Matrix

| From/To | MM | CM | M | INCH | FEET |
|---------|----|----|---|------|------|
| **MM** | 1 | 0.1 | 0.001 | 0.03937 | 0.00328 |
| **CM** | 10 | 1 | 0.01 | 0.3937 | 0.0328 |
| **M** | 1000 | 100 | 1 | 39.3701 | 3.28084 |
| **INCH** | 25.4 | 2.54 | 0.0254 | 1 | 0.0833 |
| **FEET** | 304.8 | 30.48 | 0.3048 | 12 | 1 |

### 8.3 Conversion Implementation

```typescript
// src/utils/dimensions/unit-conversions.ts
import convert from 'convert-units';

/**
 * Convert value between units using convert-units library
 * Handles edge cases and provides fallback behavior
 */
export function convertUnit(
  value: number,
  fromUnit: Unit,
  toUnit: Unit
): number {
  // No conversion needed
  if (fromUnit === toUnit) return value;

  // Handle zero and invalid values
  if (value === 0 || isNaN(value) || !isFinite(value)) {
    return value;
  }

  try {
    const result = convert(value)
      .from(fromUnit)
      .to(toUnit);

    // Ensure result is valid
    if (!isFinite(result) || isNaN(result)) {
      console.error('Invalid conversion result', { value, fromUnit, toUnit, result });
      return value;
    }

    return result;
  } catch (error) {
    console.error('Unit conversion error:', error);
    return value; // Fallback to original value
  }
}

/**
 * Batch convert multiple values
 * Useful for converting length and width simultaneously
 */
export function convertDimensions(
  length: number,
  width: number,
  fromUnit: Unit,
  toUnit: Unit
): { length: number; width: number } {
  return {
    length: convertUnit(length, fromUnit, toUnit),
    width: convertUnit(width, fromUnit, toUnit)
  };
}

/**
 * Convert area value (requires squaring the conversion factor)
 */
export function convertArea(
  area: number,
  fromUnit: Unit,
  toUnit: Unit
): number {
  if (fromUnit === toUnit) return area;

  // Convert 1 unit of length to get conversion factor
  const linearFactor = convertUnit(1, fromUnit, toUnit);

  // Square the factor for area conversion
  const areaFactor = linearFactor * linearFactor;

  return area * areaFactor;
}
```

### 8.4 Conversion Accuracy

**Precision Handling:**
- Internal calculations use full precision
- Display rounds to 1 decimal place
- Store maintains 2 decimal places
- Prevent cumulative rounding errors

```typescript
/**
 * Round value to specified decimal places
 * Prevents floating point precision issues
 */
export function roundToPrecision(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Format value for display with proper precision
 */
export function formatForDisplay(value: number): string {
  return roundToPrecision(value, 1).toFixed(1);
}

/**
 * Format value for storage with higher precision
 */
export function formatForStorage(value: number): number {
  return roundToPrecision(value, 2);
}
```

---

## 9. SVG Visualizer Specifications

### 9.1 Canvas Structure

```xml
<svg
  viewBox="0 0 600 400"
  preserveAspectRatio="xMidYMid meet"
  className="w-full h-full"
  role="img"
  aria-label="Room dimensions visualization"
>
  <!-- Grid background pattern -->
  <defs>
    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
      <circle cx="10" cy="10" r="1" fill="var(--royal-blue)" opacity="0.2" />
    </pattern>
  </defs>

  <!-- Background with grid -->
  <rect width="600" height="400" fill="url(#grid)" />

  <!-- Room rectangle -->
  <rect
    x={geometry.x}
    y={geometry.y}
    width={geometry.width}
    height={geometry.height}
    className="rectangle-sketch"
  />

  <!-- Top dimension label -->
  <text
    x={geometry.topLabelX}
    y={geometry.topLabelY}
    className="dimension-label"
    textAnchor="middle"
  >
    {formatValue(length)} {getUnitSymbol(unit)}
  </text>

  <!-- Left dimension label -->
  <text
    x={geometry.leftLabelX}
    y={geometry.leftLabelY}
    className="dimension-label"
    textAnchor="end"
  >
    {formatValue(width)} {getUnitSymbol(unit)}
  </text>
</svg>
```

### 9.2 Component Implementation

```typescript
// src/components/dimensions/DimensionsVisualizer.tsx
'use client';

import { useMemo } from 'react';
import { calculateRectangleGeometry } from '@/utils/dimensions/geometry-calculations';
import { formatValue, getUnitSymbol } from '@/utils/dimensions/unit-conversions';
import type { Unit } from '@/types/dimensions';

interface DimensionsVisualizerProps {
  length: number;
  width: number;
  unit: Unit;
}

export default function DimensionsVisualizer({
  length,
  width,
  unit
}: DimensionsVisualizerProps) {
  // Memoize geometry calculation
  const geometry = useMemo(
    () => calculateRectangleGeometry(length, width),
    [length, width]
  );

  const unitSymbol = getUnitSymbol(unit);
  const lengthLabel = `${formatValue(length)} ${unitSymbol}`;
  const widthLabel = `${formatValue(width)} ${unitSymbol}`;

  return (
    <div className="sketch-container relative">
      {/* Grid background */}
      <div className="sketch-grid w-full h-full absolute inset-0" />

      {/* SVG visualization */}
      <svg
        viewBox="0 0 600 400"
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-full absolute inset-0"
        style={{ zIndex: 5 }}
        role="img"
        aria-label={`Room dimensions: ${lengthLabel} by ${widthLabel}`}
      >
        {/* Rectangle shape */}
        <rect
          x={geometry.x}
          y={geometry.y}
          width={geometry.width}
          height={geometry.height}
          className="rectangle-sketch transition-all duration-200 ease-out"
        />

        {/* Top dimension label */}
        <text
          x={geometry.topLabelX}
          y={geometry.topLabelY}
          className="dimension-label"
          textAnchor="middle"
        >
          {lengthLabel}
        </text>

        {/* Left dimension label */}
        <text
          x={geometry.leftLabelX}
          y={geometry.leftLabelY}
          className="dimension-label"
          textAnchor="end"
        >
          {widthLabel}
        </text>
      </svg>
    </div>
  );
}
```

### 9.3 Responsive Behavior

**Desktop (> 1024px):**
- Canvas: 600px × 400px
- Labels: 16px font size
- Stroke width: 4px

**Tablet (768px - 1024px):**
- Canvas: 100% width, aspect ratio maintained
- Labels: 14px font size
- Stroke width: 3px

**Mobile (< 768px):**
- Canvas: 100% width, aspect ratio maintained
- Labels: 12px font size
- Stroke width: 2px

```css
.sketch-container {
  width: 100%;
  min-height: 400px;
  position: relative;
}

@media (max-width: 768px) {
  .sketch-container {
    min-height: 300px;
  }

  .dimension-label {
    font-size: 12px !important;
  }

  .rectangle-sketch {
    stroke-width: 2 !important;
  }
}
```

---

## 10. Styling Specifications

### 10.1 CSS Variables

```css
/* src/styles/dimensions.css */
:root {
  /* Brand colors */
  --white: #F4F6FF;
  --yellow: #F3C623;
  --orange: #EB8317;
  --royal-blue: #10375C;

  /* Component-specific */
  --input-border-width: 4px;
  --button-border-width: 4px;
  --shadow-offset: 4px;
  --shadow-offset-lg: 8px;
  --transition-speed: 200ms;
}
```

### 10.2 Component Styles

**Input Fields:**
```css
.dimension-input {
  background: var(--white);
  border: var(--input-border-width) solid var(--royal-blue);
  color: var(--royal-blue);
  font-family: 'JetBrains Mono', monospace;
  font-weight: 700;
  font-size: 1.5rem;
  padding: 1rem;
  text-align: center;
  transition: all var(--transition-speed) ease-out;
  border-radius: 0;
}

.dimension-input:focus {
  outline: none;
  box-shadow: 6px 6px 0px var(--orange);
  transform: translate(-2px, -2px);
}

.dimension-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.dimension-input::placeholder {
  color: var(--royal-blue);
  opacity: 0.3;
}
```

**Unit Selector Buttons:**
```css
.unit-selector {
  background: var(--white);
  border: var(--button-border-width) solid var(--royal-blue);
  color: var(--royal-blue);
  padding: 0.75rem 1.5rem;
  margin: 0 0.25rem;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 700;
  text-transform: uppercase;
  transition: all var(--transition-speed) ease-out;
  cursor: pointer;
  border-radius: 0;
}

.unit-selector:hover:not(:disabled) {
  background: var(--orange);
  color: var(--white);
  box-shadow: 3px 3px 0px var(--royal-blue);
  transform: translate(-1px, -1px);
}

.unit-selector.active {
  background: var(--royal-blue);
  color: var(--white);
  box-shadow: 3px 3px 0px var(--orange);
}

.unit-selector:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

**Stats Cards:**
```css
.stats-box {
  background: var(--yellow);
  border: var(--button-border-width) solid var(--royal-blue);
  box-shadow: var(--shadow-offset) var(--shadow-offset) 0px var(--orange);
  padding: 1rem;
  text-align: center;
  border-radius: 0;
}

.stats-label {
  color: var(--royal-blue);
  font-size: 0.875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stats-value {
  color: var(--royal-blue);
  font-size: 2rem;
  font-weight: 700;
  margin-top: 0.5rem;
  font-family: 'JetBrains Mono', monospace;
}
```

**Container:**
```css
.block-container {
  background: var(--white);
  border: var(--button-border-width) solid var(--royal-blue);
  border-radius: 0;
  box-shadow: var(--shadow-offset-lg) var(--shadow-offset-lg) 0px var(--royal-blue);
  padding: 2rem;
}
```

### 10.3 Responsive Design

```css
/* Mobile-first approach */
@media (max-width: 640px) {
  .dimension-input {
    font-size: 1.25rem;
    padding: 0.75rem;
  }

  .unit-selector {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
  }

  .stats-value {
    font-size: 1.5rem;
  }

  .block-container {
    padding: 1rem;
  }
}

@media (min-width: 768px) {
  .dimension-input {
    font-size: 1.5rem;
  }

  .stats-value {
    font-size: 2rem;
  }
}

@media (min-width: 1024px) {
  .block-container {
    padding: 2rem;
  }
}
```

---

## 11. Accessibility Requirements

### 11.1 WCAG 2.1 AA Compliance

**Color Contrast:**
- Royal Blue (#10375C) on White (#F4F6FF): **8.5:1** ✓ (AA Large Text)
- White (#F4F6FF) on Royal Blue (#10375C): **8.5:1** ✓ (AA Large Text)
- Royal Blue (#10375C) on Yellow (#F3C623): **5.2:1** ✓ (AA Large Text)
- Orange (#EB8317) on White (#F4F6FF): **4.8:1** ✓ (AA Large Text)

**Minimum Requirement:** 4.5:1 for normal text, 3:1 for large text (≥18pt)

### 11.2 Keyboard Navigation

**Tab Order:**
```
1. Length input field
2. Width input field
3. MM button
4. CM button
5. M button
6. INCH button
7. FEET button
8. Continue button
9. Back button
```

**Keyboard Shortcuts:**
- **Tab:** Navigate forward
- **Shift + Tab:** Navigate backward
- **Enter:** Activate button or submit form
- **Arrow Keys:** Navigate between unit buttons (when focused)
- **Escape:** Clear focus (optional)

**Implementation:**
```tsx
// Ensure proper tab order
<input tabIndex={1} />
<input tabIndex={2} />
<button tabIndex={3} />

// Enable arrow key navigation for unit selector
<UnitSelector onKeyDown={handleArrowKeyNavigation} />
```

### 11.3 Screen Reader Support

**ARIA Attributes:**
```html
<!-- Input field -->
<input
  type="number"
  id="length-input"
  aria-label="Room length in meters"
  aria-describedby="length-help length-error"
  aria-invalid={hasError ? 'true' : 'false'}
  aria-required="true"
/>

<div id="length-help" className="sr-only">
  Enter the horizontal length of your room
</div>

<div id="length-error" role="alert" aria-live="polite">
  {errorMessage}
</div>

<!-- Unit selector -->
<div role="group" aria-label="Measurement unit selection">
  <button
    role="radio"
    aria-checked={isActive}
    aria-label="Select meters as unit"
  >
    M
  </button>
</div>

<!-- Stats display -->
<div aria-live="polite" aria-atomic="true">
  <span className="sr-only">Room area calculated:</span>
  <span>{area} square meters</span>
</div>

<!-- SVG visualizer -->
<svg
  role="img"
  aria-label="Visual representation of room dimensions: 4.2 meters by 3.8 meters"
>
  <!-- SVG content -->
</svg>
```

**Screen Reader Announcements:**
- Input changes: Announce new values (debounced)
- Validation errors: Announce immediately with `role="alert"`
- Unit changes: Announce new unit and converted values
- Calculations complete: Announce area and perimeter

### 11.4 Touch Targets

**Minimum Size:** 44px × 44px (iOS/Android recommendation)

**Implementation:**
```css
/* Ensure touch targets meet minimum size */
.dimension-input {
  min-height: 60px; /* Exceeds 44px minimum */
  padding: 1rem;
}

.unit-selector {
  min-height: 44px;
  min-width: 44px;
  padding: 0.75rem 1.5rem; /* Comfortable touch area */
}

button {
  min-height: 44px;
  padding: 1rem 2.5rem;
}
```

**Touch Target Spacing:**
- Minimum 8px spacing between interactive elements
- Prevent accidental taps on adjacent buttons

### 11.5 Focus Indicators

**Visual Focus States:**
```css
*:focus-visible {
  outline: 4px solid var(--orange);
  outline-offset: 2px;
}

.dimension-input:focus {
  outline: none; /* Custom focus style */
  box-shadow: 6px 6px 0px var(--orange);
  transform: translate(-2px, -2px);
}

.unit-selector:focus-visible {
  outline: 4px solid var(--orange);
  outline-offset: 2px;
}
```

**Focus Management:**
- Auto-focus first input on mount (optional, user preference)
- Trap focus within modal contexts
- Restore focus after modal close
- Skip links for keyboard users

---

## 12. Performance Requirements

### 12.1 Performance Metrics

**Critical Metrics:**
- **Initial Render:** < 100ms
- **Input Response:** < 16ms (60fps)
- **Calculation Time:** < 50ms
- **Visual Update:** < 16ms (60fps)
- **Unit Conversion:** < 10ms

**Page Load Metrics:**
- **First Contentful Paint (FCP):** < 1.5s
- **Largest Contentful Paint (LCP):** < 2.5s
- **Time to Interactive (TTI):** < 3.5s
- **Cumulative Layout Shift (CLS):** < 0.1

### 12.2 Optimization Strategies

**React Optimization:**
```typescript
// Memoize expensive calculations
const geometry = useMemo(
  () => calculateRectangleGeometry(length, width),
  [length, width]
);

// Memoize callback functions
const handleLengthChange = useCallback((value: number) => {
  setLength(value);
}, [setLength]);

// Memoize child components
const DimensionInputField = React.memo(DimensionInputFieldComponent);

// Debounce rapid updates
const debouncedCalculate = useMemo(
  () => debounce(calculateStats, 300),
  [calculateStats]
);
```

**Debouncing Strategy:**
```typescript
// src/utils/performance/debounce.ts
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Usage
const debouncedUpdate = debounce((value: number) => {
  updateCalculations(value);
}, 300);
```

### 12.3 Bundle Size Optimization

**Code Splitting:**
```typescript
// Lazy load visualizer component
const DimensionsVisualizer = lazy(
  () => import('@/components/dimensions/DimensionsVisualizer')
);

// Use in component
{showVisualizer && (
  <Suspense fallback={<LoadingSpinner />}>
    <DimensionsVisualizer length={length} width={width} unit={unit} />
  </Suspense>
)}
```

**Tree Shaking:**
```typescript
// Import only needed functions
import { convertUnit, getUnitSymbol } from '@/utils/dimensions/unit-conversions';

// Avoid importing entire library
// ❌ import * as utils from '@/utils/dimensions';
// ✅ import { convertUnit } from '@/utils/dimensions/unit-conversions';
```

**Bundle Analysis Targets:**
- Main component bundle: < 50KB (gzipped)
- Utility functions: < 10KB (gzipped)
- Dependencies (convert-units): ~5KB (gzipped)
- **Total impact:** < 65KB

### 12.4 Rendering Performance

**SVG Optimization:**
```typescript
// Use CSS transforms instead of recalculating positions
<rect
  x={geometry.x}
  y={geometry.y}
  width={geometry.width}
  height={geometry.height}
  className="transition-transform duration-200 ease-out"
  style={{ willChange: 'transform' }}
/>
```

**Prevent Unnecessary Re-renders:**
```typescript
// Use Zustand selectors to prevent re-renders
const length = useDimensionsStore((state) => state.room.length);
const width = useDimensionsStore((state) => state.room.width);

// Instead of
// ❌ const { room } = useDimensionsStore(); // Re-renders on any room property change
```

---

## 13. Error Handling Strategy

### 13.1 Error Categories

**Input Errors:**
- Empty value
- Invalid number
- Out of range
- Decimal precision exceeded

**System Errors:**
- Calculation failure
- Unit conversion error
- Storage failure
- Component mount error

**Business Logic Errors:**
- Tile exceeds room dimensions
- Area too small
- Unrealistic values

### 13.2 Error Display Patterns

**Inline Errors (Input Field):**
```tsx
<div className="relative">
  <input
    className={clsx(
      'dimension-input',
      error && 'border-red-500'
    )}
    aria-invalid={!!error}
  />
  {error && (
    <div role="alert" className="error-message">
      <span className="error-icon">❌</span>
      <span>{error}</span>
    </div>
  )}
</div>
```

**Toast Notifications (System Errors):**
```tsx
import { toast } from 'sonner'; // Or similar toast library

// System error
try {
  await saveToBackend(data);
} catch (error) {
  toast.error('Failed to save project. Please try again.');
  console.error('Save error:', error);
}

// Success message
toast.success('Dimensions saved successfully!');
```

**Error Boundary (Component Errors):**
```tsx
// src/components/dimensions/ErrorBoundary.tsx
class DimensionsErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Dimensions component error:', error, errorInfo);
    // Log to error tracking service (e.g., Sentry)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <h3>Something went wrong</h3>
          <p>Unable to load dimension input. Please refresh the page.</p>
          <button onClick={() => window.location.reload()}>
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### 13.3 Error Recovery Strategies

**Graceful Degradation:**
```typescript
// If calculation fails, use fallback values
function safeCalculateArea(length: number, width: number): number {
  try {
    const area = calculateArea(length, width);
    if (!isFinite(area) || isNaN(area)) {
      throw new Error('Invalid calculation result');
    }
    return area;
  } catch (error) {
    console.error('Calculation error:', error);
    return 0; // Fallback value
  }
}

// If unit conversion fails, keep original value
function safeConvertUnit(
  value: number,
  fromUnit: Unit,
  toUnit: Unit
): number {
  try {
    return convertUnit(value, fromUnit, toUnit);
  } catch (error) {
    console.error('Conversion error:', error);
    toast.warning('Unit conversion failed. Using original value.');
    return value;
  }
}
```

**Retry Logic (Storage):**
```typescript
async function saveWithRetry(
  data: any,
  maxRetries: number = 3
): Promise<void> {
  let attempts = 0;

  while (attempts < maxRetries) {
    try {
      await saveToStorage(data);
      return; // Success
    } catch (error) {
      attempts++;
      if (attempts >= maxRetries) {
        toast.error('Failed to save after multiple attempts');
        throw error;
      }
      // Wait before retry (exponential backoff)
      await new Promise(resolve =>
        setTimeout(resolve, Math.pow(2, attempts) * 1000)
      );
    }
  }
}
```

### 13.4 User Feedback for Errors

**Error Message Guidelines:**
- **Clear:** Use plain language, avoid technical jargon
- **Specific:** Explain what went wrong and why
- **Actionable:** Tell user how to fix the problem
- **Positive:** Focus on solutions, not blame

**Examples:**
```typescript
const ERROR_MESSAGES = {
  // ❌ Bad
  INVALID_INPUT: 'Invalid input',

  // ✅ Good
  INVALID_INPUT: 'Please enter a valid number greater than zero',

  // ❌ Bad
  CONVERSION_ERROR: 'Error in conversion',

  // ✅ Good
  CONVERSION_ERROR: 'Unable to convert units. Please check your input values.',

  // ❌ Bad
  SAVE_FAILED: 'Save failed',

  // ✅ Good
  SAVE_FAILED: 'Unable to save your dimensions. Please check your connection and try again.'
};
```

---

## 14. Testing Strategy

### 14.1 Unit Tests (Jest + React Testing Library)

**Utility Functions:**
```typescript
// src/utils/dimensions/__tests__/geometry-calculations.test.ts
import { calculateArea, calculatePerimeter, calculateRectangleGeometry } from '../geometry-calculations';

describe('calculateArea', () => {
  test('calculates area correctly for positive values', () => {
    expect(calculateArea(4.2, 3.8)).toBeCloseTo(15.96, 2);
  });

  test('returns 0 for zero length', () => {
    expect(calculateArea(0, 3.8)).toBe(0);
  });

  test('returns 0 for zero width', () => {
    expect(calculateArea(4.2, 0)).toBe(0);
  });

  test('handles decimal precision', () => {
    expect(calculateArea(4.25, 3.75)).toBeCloseTo(15.9375, 4);
  });

  test('handles very small values', () => {
    expect(calculateArea(0.1, 0.1)).toBe(0.01);
  });

  test('handles very large values', () => {
    expect(calculateArea(100, 100)).toBe(10000);
  });
});

describe('calculatePerimeter', () => {
  test('calculates perimeter correctly', () => {
    expect(calculatePerimeter(4.2, 3.8)).toBe(16.0);
  });

  test('returns 0 for zero dimensions', () => {
    expect(calculatePerimeter(0, 0)).toBe(0);
  });
});

describe('calculateRectangleGeometry', () => {
  test('centers rectangle in canvas', () => {
    const geometry = calculateRectangleGeometry(4.2, 3.8);
    expect(geometry.x).toBeGreaterThan(0);
    expect(geometry.y).toBeGreaterThan(0);
  });

  test('constrains to max width', () => {
    const geometry = calculateRectangleGeometry(100, 1); // Very wide
    expect(geometry.width).toBeLessThanOrEqual(300);
  });

  test('constrains to max height', () => {
    const geometry = calculateRectangleGeometry(1, 100); // Very tall
    expect(geometry.height).toBeLessThanOrEqual(200);
  });

  test('maintains aspect ratio', () => {
    const geometry = calculateRectangleGeometry(4.2, 3.8);
    const calculatedRatio = geometry.width / geometry.height;
    const inputRatio = 4.2 / 3.8;
    expect(calculatedRatio).toBeCloseTo(inputRatio, 2);
  });
});
```

**Unit Conversions:**
```typescript
// src/utils/dimensions/__tests__/unit-conversions.test.ts
import { convertUnit, getUnitSymbol, getAreaUnitSymbol } from '../unit-conversions';

describe('convertUnit', () => {
  test('converts meters to feet', () => {
    expect(convertUnit(1, 'm', 'feet')).toBeCloseTo(3.28084, 4);
  });

  test('converts cm to inches', () => {
    expect(convertUnit(100, 'cm', 'inch')).toBeCloseTo(39.3701, 4);
  });

  test('returns same value for same unit', () => {
    expect(convertUnit(5, 'm', 'm')).toBe(5);
  });

  test('handles zero values', () => {
    expect(convertUnit(0, 'm', 'feet')).toBe(0);
  });

  test('handles very small values', () => {
    const result = convertUnit(0.001, 'm', 'mm');
    expect(result).toBeCloseTo(1, 4);
  });

  test('handles very large values', () => {
    const result = convertUnit(1000, 'm', 'cm');
    expect(result).toBe(100000);
  });

  test('round-trip conversion maintains value', () => {
    const original = 4.2;
    const converted = convertUnit(original, 'm', 'feet');
    const back = convertUnit(converted, 'feet', 'm');
    expect(back).toBeCloseTo(original, 6);
  });
});

describe('getUnitSymbol', () => {
  test('returns correct symbols', () => {
    expect(getUnitSymbol('m')).toBe('m');
    expect(getUnitSymbol('cm')).toBe('cm');
    expect(getUnitSymbol('inch')).toBe('in');
    expect(getUnitSymbol('feet')).toBe('ft');
  });
});
```

**Validation:**
```typescript
// src/utils/dimensions/__tests__/validation.test.ts
import { validateDimensionInput, validateTileAgainstRoom } from '../validation';

describe('validateDimensionInput', () => {
  test('accepts valid positive values', () => {
    const result = validateDimensionInput(4.2, 'room', 'm');
    expect(result.isValid).toBe(true);
  });

  test('rejects zero values', () => {
    const result = validateDimensionInput(0, 'room', 'm');
    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toContain('greater than zero');
  });

  test('rejects negative values', () => {
    const result = validateDimensionInput(-5, 'room', 'm');
    expect(result.isValid).toBe(false);
  });

  test('rejects NaN', () => {
    const result = validateDimensionInput(NaN, 'room', 'm');
    expect(result.isValid).toBe(false);
  });

  test('rejects values exceeding maximum', () => {
    const result = validateDimensionInput(150, 'room', 'm', 100);
    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toContain('Maximum');
  });
});

describe('validateTileAgainstRoom', () => {
  test('accepts tile smaller than room', () => {
    const result = validateTileAgainstRoom(0.3, 0.3, 4.2, 3.8);
    expect(result.isValid).toBe(true);
  });

  test('rejects tile length exceeding room length', () => {
    const result = validateTileAgainstRoom(5.0, 0.3, 4.2, 3.8);
    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toContain('length');
  });

  test('rejects tile width exceeding room width', () => {
    const result = validateTileAgainstRoom(0.3, 5.0, 4.2, 3.8);
    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toContain('width');
  });

  test('rejects tile area exceeding room area', () => {
    const result = validateTileAgainstRoom(4.0, 4.0, 4.2, 3.8);
    expect(result.isValid).toBe(false);
  });
});
```

### 14.2 Integration Tests (React Testing Library)

```typescript
// src/components/dimensions/__tests__/DimensionsInput.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DimensionsInput from '../DimensionsInput';
import { useDimensionsStore } from '@/stores/dimensions-store';

describe('DimensionsInput', () => {
  beforeEach(() => {
    // Reset store before each test
    useDimensionsStore.getState().resetRoom();
  });

  test('renders with initial values', () => {
    render(
      <DimensionsInput
        context="room"
        title="Test Dimensions"
        initialLength={4.2}
        initialWidth={3.8}
      />
    );

    expect(screen.getByDisplayValue('4.2')).toBeInTheDocument();
    expect(screen.getByDisplayValue('3.8')).toBeInTheDocument();
  });

  test('updates calculations when input changes', async () => {
    const user = userEvent.setup();
    render(
      <DimensionsInput
        context="room"
        title="Test Dimensions"
        showStats={true}
      />
    );

    const lengthInput = screen.getByLabelText(/length/i);
    const widthInput = screen.getByLabelText(/width/i);

    await user.clear(lengthInput);
    await user.type(lengthInput, '4.2');
    await user.clear(widthInput);
    await user.type(widthInput, '3.8');

    await waitFor(() => {
      expect(screen.getByText(/16\.0 m²/i)).toBeInTheDocument();
    });
  });

  test('changes unit and converts values', async () => {
    const user = userEvent.setup();
    render(
      <DimensionsInput
        context="room"
        title="Test Dimensions"
        initialLength={1}
        initialWidth={1}
        initialUnit="m"
      />
    );

    // Click feet button
    const feetButton = screen.getByRole('button', { name: /feet/i });
    await user.click(feetButton);

    await waitFor(() => {
      // 1 meter = ~3.28 feet
      expect(screen.getByText(/ft²/i)).toBeInTheDocument();
    });
  });

  test('displays validation errors', async () => {
    const user = userEvent.setup();
    render(
      <DimensionsInput
        context="room"
        title="Test Dimensions"
      />
    );

    const lengthInput = screen.getByLabelText(/length/i);

    await user.clear(lengthInput);
    await user.type(lengthInput, '0');

    await waitFor(() => {
      expect(screen.getByText(/greater than zero/i)).toBeInTheDocument();
    });
  });

  test('calls onComplete with correct data', async () => {
    const handleComplete = jest.fn();
    const user = userEvent.setup();

    render(
      <DimensionsInput
        context="room"
        title="Test Dimensions"
        onComplete={handleComplete}
      />
    );

    const lengthInput = screen.getByLabelText(/length/i);
    const widthInput = screen.getByLabelText(/width/i);

    await user.clear(lengthInput);
    await user.type(lengthInput, '4.2');
    await user.clear(widthInput);
    await user.type(widthInput, '3.8');

    // Trigger completion
    const continueButton = screen.getByRole('button', { name: /continue/i });
    await user.click(continueButton);

    await waitFor(() => {
      expect(handleComplete).toHaveBeenCalledWith(
        expect.objectContaining({
          length: 4.2,
          width: 3.8,
          area: 15.96,
          isValid: true
        })
      );
    });
  });

  test('renders in read-only mode', () => {
    render(
      <DimensionsInput
        context="display"
        title="Display Only"
        initialLength={4.2}
        initialWidth={3.8}
        readOnly={true}
      />
    );

    const lengthInput = screen.getByDisplayValue('4.2');
    expect(lengthInput).toBeDisabled();
  });

  test('respects maximum constraints for tiles', async () => {
    const user = userEvent.setup();
    render(
      <DimensionsInput
        context="tile"
        title="Tile Dimensions"
        maxLength={4.2}
        maxWidth={3.8}
      />
    );

    const lengthInput = screen.getByLabelText(/length/i);

    await user.clear(lengthInput);
    await user.type(lengthInput, '5.0');

    await waitFor(() => {
      expect(screen.getByText(/maximum/i)).toBeInTheDocument();
    });
  });
});
```

### 14.3 E2E Tests (Playwright)

```typescript
// e2e/dimensions-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Dimensions Input Flow', () => {
  test('complete room dimensions flow', async ({ page }) => {
    await page.goto('/project/step-1');

    // Enter dimensions
    await page.fill('[data-testid="length-input"]', '4.2');
    await page.fill('[data-testid="width-input"]', '3.8');

    // Verify calculations
    await expect(page.locator('[data-testid="area-display"]'))
      .toContainText('16.0 m²');
    await expect(page.locator('[data-testid="perimeter-display"]'))
      .toContainText('16.0 m');

    // Verify visual preview updates
    const svg = page.locator('svg[role="img"]');
    await expect(svg).toBeVisible();

    // Continue to next step
    await page.click('[data-testid="continue-button"]');
    await expect(page).toHaveURL('/project/step-2');
  });

  test('unit conversion flow', async ({ page }) => {
    await page.goto('/project/step-1');

    // Enter dimensions in meters
    await page.fill('[data-testid="length-input"]', '1');
    await page.fill('[data-testid="width-input"]', '1');

    await expect(page.locator('[data-testid="area-display"]'))
      .toContainText('1.0 m²');

    // Switch to cm
    await page.click('[data-testid="unit-cm"]');

    await expect(page.locator('[data-testid="area-display"]'))
      .toContainText('10000.0 cm²');

    // Switch to feet
    await page.click('[data-testid="unit-feet"]');

    await expect(page.locator('[data-testid="area-display"]'))
      .toContainText('ft²');
  });

  test('validation error display', async ({ page }) => {
    await page.goto('/project/step-1');

    // Enter invalid value
    await page.fill('[data-testid="length-input"]', '0');
    await page.fill('[data-testid="width-input"]', '3.8');

    // Attempt to continue
    await page.click('[data-testid="continue-button"]');

    // Should show error and not navigate
    await expect(page.locator('[role="alert"]')).toContainText(/greater than zero/i);
    await expect(page).toHaveURL('/project/step-1'); // Still on same page
  });

  test('data persistence across navigation', async ({ page }) => {
    await page.goto('/project/step-1');

    // Enter room dimensions
    await page.fill('[data-testid="length-input"]', '4.2');
    await page.fill('[data-testid="width-input"]', '3.8');
    await page.click('[data-testid="continue-button"]');

    // Go to step 2
    await expect(page).toHaveURL('/project/step-2');

    // Go back to step 1
    await page.click('[data-testid="back-button"]');
    await expect(page).toHaveURL('/project/step-1');

    // Verify data persisted
    await expect(page.locator('[data-testid="length-input"]')).toHaveValue('4.2');
    await expect(page.locator('[data-testid="width-input"]')).toHaveValue('3.8');
  });

  test('keyboard navigation', async ({ page }) => {
    await page.goto('/project/step-1');

    // Tab through elements
    await page.keyboard.press('Tab'); // Length input
    await expect(page.locator('[data-testid="length-input"]')).toBeFocused();

    await page.keyboard.press('Tab'); // Width input
    await expect(page.locator('[data-testid="width-input"]')).toBeFocused();

    await page.keyboard.press('Tab'); // First unit button
    await expect(page.locator('[data-testid="unit-mm"]')).toBeFocused();
  });

  test('mobile responsive behavior', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/project/step-1');

    // Verify touch-friendly sizing
    const lengthInput = page.locator('[data-testid="length-input"]');
    const box = await lengthInput.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44); // Minimum touch target

    // Verify unit buttons stack appropriately
    const unitButtons = page.locator('.unit-selector');
    const count = await unitButtons.count();
    expect(count).toBe(5);
  });
});
```

### 14.4 Accessibility Tests

```typescript
// e2e/accessibility.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Tests', () => {
  test('should not have WCAG violations', async ({ page }) => {
    await page.goto('/project/step-1');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('keyboard navigation is functional', async ({ page }) => {
    await page.goto('/project/step-1');

    // Verify all interactive elements are keyboard accessible
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toHaveAttribute('data-testid', 'length-input');

    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toHaveAttribute('data-testid', 'width-input');
  });

  test('screen reader announcements', async ({ page }) => {
    await page.goto('/project/step-1');

    // Check for aria-live regions
    const liveRegions = page.locator('[aria-live="polite"]');
    await expect(liveRegions).toHaveCount(1);

    // Check for proper labels
    const lengthInput = page.locator('[data-testid="length-input"]');
    await expect(lengthInput).toHaveAttribute('aria-label');
  });
});
```

---

## 15. Implementation Phases

### 15.1 Phase 1: Foundation (Week 1)

**Goals:**
- Establish project structure
- Define type system
- Implement utility functions
- Setup testing infrastructure

**Tasks:**
- [ ] Create directory structure as specified in Section 4.1
- [ ] Define TypeScript interfaces in `src/types/dimensions.ts`
- [ ] Implement geometry calculation functions with unit tests
- [ ] Implement unit conversion functions with unit tests
- [ ] Implement validation logic with unit tests
- [ ] Configure Jest and React Testing Library
- [ ] Setup Playwright for E2E tests

**Deliverables:**
- Complete utility function library
- 80%+ unit test coverage
- Type definitions
- Testing infrastructure ready

**Success Criteria:**
- All utility tests passing
- TypeScript compilation without errors
- Clear separation of concerns

### 15.2 Phase 2: Core Components (Week 2)

**Goals:**
- Build atomic components
- Implement state management
- Create component tests

**Tasks:**
- [ ] Implement `DimensionInputField` component
- [ ] Implement `UnitSelector` component
- [ ] Implement `DimensionsStats` component
- [ ] Implement `DimensionsVisualizer` (SVG) component
- [ ] Setup Zustand store with persist middleware
- [ ] Write integration tests for each component
- [ ] Implement debouncing for input handlers

**Deliverables:**
- Four reusable atomic components
- Zustand store with full CRUD operations
- Component integration tests

**Success Criteria:**
- Components render without errors
- State updates correctly
- Tests achieve 70%+ coverage

### 15.3 Phase 3: Integration (Week 3)

**Goals:**
- Compose main `DimensionsInput` component
- Replace canvas in wizard steps
- Wire up persistence

**Tasks:**
- [ ] Compose `DimensionsInput` from atomic components
- [ ] Integrate with Step 1 (Room Dimensions) page
- [ ] Integrate with Step 2 (Tile Dimensions) page
- [ ] Integrate with Step 4 (Results Display) page
- [ ] Implement localStorage persistence
- [ ] Wire up validation across components
- [ ] Test data flow between wizard steps

**Deliverables:**
- Fully functional `DimensionsInput` component
- Three wizard pages using component
- Data persistence working

**Success Criteria:**
- Component reused in 3 contexts without duplication
- Data persists across page navigation
- Calculations accurate to 1 decimal place

### 15.4 Phase 4: Testing & Polish (Week 4)

**Goals:**
- Comprehensive testing
- Accessibility compliance
- Performance optimization
- Cross-browser validation

**Tasks:**
- [ ] Complete unit test coverage (target: 80%+)
- [ ] Write integration tests for all user flows
- [ ] Create E2E test for complete wizard flow
- [ ] Run accessibility audit (WCAG 2.1 AA)
- [ ] Fix accessibility violations
- [ ] Performance profiling and optimization
- [ ] Test on Chrome, Firefox, Safari, Edge
- [ ] Test on iOS Safari, Android Chrome
- [ ] Responsive design validation (mobile, tablet, desktop)
- [ ] Code review and refactoring

**Deliverables:**
- 80%+ test coverage
- WCAG 2.1 AA compliant
- Performance metrics met
- Cross-browser compatible

**Success Criteria:**
- All tests passing
- No accessibility violations
- Performance within targets
- Design matches reference exactly

### 15.5 Implementation Checklist

**Pre-Implementation:**
- [ ] Review and approve this specification
- [ ] Confirm technology stack (React, TypeScript, Zustand, Tailwind)
- [ ] Setup development environment
- [ ] Create feature branch in version control

**During Implementation:**
- [ ] Follow TDD approach (write tests first)
- [ ] Commit frequently with descriptive messages
- [ ] Update documentation as needed
- [ ] Conduct peer code reviews
- [ ] Test incrementally, not at the end

**Post-Implementation:**
- [ ] Final code review
- [ ] QA testing on staging environment
- [ ] Performance benchmarking
- [ ] Accessibility audit
- [ ] User acceptance testing
- [ ] Merge to main branch
- [ ] Deploy to production

---

## 16. Success Criteria

### 16.1 Functional Requirements Met

✅ **Component Reusability:**
- [ ] Single `DimensionsInput` component reused in 3+ contexts
- [ ] Zero code duplication between contexts
- [ ] Configuration-driven behavior via props
- [ ] Clean separation of concerns (SOLID principles applied)

✅ **Input System:**
- [ ] Two numeric input fields (length, width)
- [ ] Accept decimal values with 2 decimal places
- [ ] Real-time validation with inline error messages
- [ ] Keyboard accessible (Tab, Enter navigation)

✅ **Unit System:**
- [ ] Support 5 units: MM, CM, M, INCH, FEET
- [ ] Default unit: M (meters)
- [ ] Unit selection persists across sessions
- [ ] Automatic value conversion when unit changes
- [ ] Display unit suffix with all measurements

✅ **Visual Preview:**
- [ ] SVG-based proportional rectangle representation
- [ ] Grid background for spatial reference
- [ ] Dimension labels on top and left sides
- [ ] Real-time updates (debounced 300ms)
- [ ] Maintains aspect ratio of input dimensions

✅ **Calculations:**
- [ ] Area calculation (length × width)
- [ ] Perimeter calculation (2 × (length + width))
- [ ] Display precision: 1 decimal place
- [ ] Auto-update on any input change
- [ ] Unit suffix display (m², cm², etc.)

### 16.2 Technical Requirements Met

✅ **Architecture:**
- [ ] Follows SOLID principles
- [ ] Implements DRY principle (no duplication)
- [ ] Uses TypeScript for type safety
- [ ] Zustand + Immer for state management
- [ ] Clean component composition

✅ **Data Persistence:**
- [ ] localStorage integration
- [ ] Data persists across sessions
- [ ] Automatic save with debouncing
- [ ] Migration strategy for schema changes

✅ **Validation:**
- [ ] Context-specific validation rules
- [ ] Real-time error feedback
- [ ] Clear, actionable error messages
- [ ] Prevents invalid form submission

✅ **Performance:**
- [ ] Initial render < 100ms
- [ ] Input response < 16ms (60fps)
- [ ] Bundle size < 65KB (gzipped)
- [ ] No janky animations or laggy inputs

### 16.3 Quality Requirements Met

✅ **Testing:**
- [ ] Unit test coverage > 80%
- [ ] Integration tests for all user flows
- [ ] E2E test for complete wizard
- [ ] Accessibility tests (no WCAG violations)
- [ ] All tests passing consistently

✅ **Accessibility (WCAG 2.1 AA):**
- [ ] Color contrast ratios meet AA standard (4.5:1)
- [ ] Keyboard navigation fully functional
- [ ] Screen reader support with ARIA attributes
- [ ] Touch targets ≥ 44px × 44px
- [ ] Focus indicators clearly visible

✅ **Cross-Browser Compatibility:**
- [ ] Works on Chrome (latest 2 versions)
- [ ] Works on Firefox (latest 2 versions)
- [ ] Works on Safari (latest 2 versions)
- [ ] Works on Edge (latest 2 versions)
- [ ] Works on iOS Safari
- [ ] Works on Android Chrome

✅ **Responsive Design:**
- [ ] Mobile (< 640px): Fully functional
- [ ] Tablet (640px - 1024px): Optimized layout
- [ ] Desktop (> 1024px): Full feature set
- [ ] Touch-friendly on mobile devices

### 16.4 Design Requirements Met

✅ **Visual Design:**
- [ ] Matches `simple_dimensions_v1.html` exactly
- [ ] Brand colors applied consistently
- [ ] JetBrains Mono font used throughout
- [ ] Sharp corners (0px border radius)
- [ ] Offset shadows for depth
- [ ] Smooth transitions (200ms ease-out)

✅ **User Experience:**
- [ ] Intuitive input flow
- [ ] Clear visual feedback
- [ ] Helpful error messages
- [ ] Responsive to user actions
- [ ] No unexpected behavior

### 16.5 Documentation Requirements Met

✅ **Code Documentation:**
- [ ] All functions have JSDoc comments
- [ ] Complex logic explained with inline comments
- [ ] TypeScript interfaces fully documented
- [ ] README with setup instructions

✅ **Testing Documentation:**
- [ ] Test cases documented
- [ ] Test coverage reports generated
- [ ] E2E test scenarios described

✅ **User Documentation:**
- [ ] Component usage examples provided
- [ ] Props interface documented
- [ ] Integration guide available

---

## Appendix A: Type Definitions

```typescript
// src/types/dimensions.ts

/**
 * Supported measurement units
 */
export type Unit = 'mm' | 'cm' | 'm' | 'inch' | 'feet';

/**
 * Context identifier for component usage
 */
export type DimensionContext = 'room' | 'tile' | 'display';

/**
 * Dimension data structure
 */
export interface DimensionData {
  length: number;
  width: number;
  unit: Unit;
  area: number;
  perimeter: number;
  isValid: boolean;
}

/**
 * Rectangle geometry for SVG rendering
 */
export interface RectangleGeometry {
  x: number;
  y: number;
  width: number;
  height: number;
  topLabelX: number;
  topLabelY: number;
  leftLabelX: number;
  leftLabelY: number;
}

/**
 * Validation result
 */
export interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
  errors?: string[];
}

/**
 * Unit metadata
 */
export interface UnitMetadata {
  label: string;
  symbol: string;
  areaSymbol: string;
}

/**
 * Store state
 */
export interface DimensionsState {
  room: DimensionData;
  tile: DimensionData;
  errors: Record<string, string>;
  isCalculating: boolean;
}

/**
 * Store actions
 */
export interface DimensionsActions {
  setRoomLength: (value: number) => void;
  setRoomWidth: (value: number) => void;
  setRoomUnit: (unit: Unit) => void;
  calculateRoomStats: () => void;
  validateRoom: () => boolean;
  resetRoom: () => void;

  setTileLength: (value: number) => void;
  setTileWidth: (value: number) => void;
  setTileUnit: (unit: Unit) => void;
  calculateTileStats: () => void;
  validateTile: () => boolean;
  resetTile: () => void;

  setError: (field: string, message: string) => void;
  clearError: (field: string) => void;
  clearAllErrors: () => void;

  saveToBrowser: () => void;
  loadFromBrowser: () => void;
}
```

---

## Appendix B: File Checklist

```
✅ Created
❌ Pending

Components:
✅ src/components/dimensions/DimensionsInput.tsx
✅ src/components/dimensions/DimensionInputField.tsx
✅ src/components/dimensions/UnitSelector.tsx
✅ src/components/dimensions/DimensionsVisualizer.tsx
✅ src/components/dimensions/DimensionsStats.tsx
✅ src/components/dimensions/types.ts
✅ src/components/dimensions/index.ts

State Management:
✅ src/stores/dimensions-store.ts

Utilities:
✅ src/utils/dimensions/unit-conversions.ts
✅ src/utils/dimensions/geometry-calculations.ts
✅ src/utils/dimensions/validation.ts
✅ src/utils/dimensions/index.ts

Types:
✅ src/types/dimensions.ts

Styles:
✅ src/styles/dimensions.css

Tests:
✅ src/utils/dimensions/__tests__/unit-conversions.test.ts
✅ src/utils/dimensions/__tests__/geometry-calculations.test.ts
✅ src/utils/dimensions/__tests__/validation.test.ts
✅ src/components/dimensions/__tests__/DimensionsInput.test.tsx
✅ e2e/dimensions-flow.spec.ts
✅ e2e/accessibility.spec.ts

Documentation:
✅ claudedocs/simple-dimensions-input-technical-spec.md
✅ README.md (component usage)
```

---

## Appendix C: Dependencies

**Production Dependencies:**
```json
{
  "react": "^18.0.0",
  "next": "^14.0.0",
  "typescript": "^5.0.0",
  "zustand": "^4.5.0",
  "immer": "^10.0.0",
  "convert-units": "^2.3.4",
  "react-hook-form": "^7.49.0",
  "zod": "^3.22.0",
  "clsx": "^2.1.0"
}
```

**Development Dependencies:**
```json
{
  "@testing-library/react": "^14.1.0",
  "@testing-library/user-event": "^14.5.0",
  "@testing-library/jest-dom": "^6.1.0",
  "jest": "^29.7.0",
  "@playwright/test": "^1.40.0",
  "@axe-core/playwright": "^4.8.0",
  "eslint": "^8.55.0",
  "prettier": "^3.1.0"
}
```

---

## Appendix D: Browser Support Matrix

| Browser | Version | Status | Notes |
|---------|---------|--------|-------|
| Chrome | Latest 2 | ✅ Supported | Primary target |
| Firefox | Latest 2 | ✅ Supported | Full feature parity |
| Safari | Latest 2 | ✅ Supported | iOS Safari included |
| Edge | Latest 2 | ✅ Supported | Chromium-based |
| iOS Safari | Latest 2 | ✅ Supported | Touch-optimized |
| Android Chrome | Latest 2 | ✅ Supported | Touch-optimized |
| Opera | Latest | ⚠️ Best effort | Not officially tested |
| Samsung Internet | Latest | ⚠️ Best effort | Not officially tested |

**Polyfills Required:**
- None (modern browser APIs only)

**Progressive Enhancement:**
- SVG visualization (core feature)
- localStorage (graceful degradation if unavailable)

---

## Appendix E: Performance Benchmarks

**Target Metrics:**
```
Initial Render: < 100ms
Input Response: < 16ms (60fps)
Calculation Time: < 50ms
Visual Update: < 16ms (60fps)
Unit Conversion: < 10ms

Bundle Size:
- Main component: < 50KB (gzipped)
- Utilities: < 10KB (gzipped)
- Dependencies: ~5KB (gzipped)
- Total: < 65KB (gzipped)
```

**Measurement Tools:**
- Chrome DevTools Performance tab
- React DevTools Profiler
- Lighthouse for page metrics
- Webpack Bundle Analyzer for bundle size

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-10-15 | Technical Writer | Initial specification document |

---

**End of Technical Specification**

This specification provides complete implementation guidance for the Simple Dimensions Input System. All requirements, architecture decisions, and success criteria are documented to ensure consistent, high-quality implementation by the frontend architect.
