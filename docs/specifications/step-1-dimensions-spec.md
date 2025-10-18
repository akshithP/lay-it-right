# Step 1: Dimensions Input Screen - Technical Specification

**Project**: LayItRight - DIY Tiling Project Planner
**Version**: 1.0
**Last Updated**: 2025-10-16
**Document Type**: Frontend Implementation Specification

---

## Table of Contents

1. [Overview](#overview)
2. [User Flow Context](#user-flow-context)
3. [Feature Requirements](#feature-requirements)
4. [Component Architecture](#component-architecture)
5. [State Management](#state-management)
6. [Form Validation](#form-validation)
7. [Unit Conversion System](#unit-conversion-system)
8. [SVG Preview System](#svg-preview-system)
9. [Accessibility Requirements](#accessibility-requirements)
10. [Responsive Design](#responsive-design)
11. [Error Handling](#error-handling)
12. [Performance Considerations](#performance-considerations)
13. [Testing Strategy](#testing-strategy)
14. [Implementation Checklist](#implementation-checklist)

---

## Overview

### Purpose
Step 1 is the dimensions input screen where users specify the measurements of their selected layout shape. This screen is the second step in a four-step project creation wizard.

### Technical Stack
- **Framework**: Next.js 14+ (App Router)
- **UI Library**: React 18+, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Animations**: Framer Motion
- **Forms**: react-hook-form + zod validation
- **State**: Zustand + Immer
- **Utilities**: convert-units (unit conversion)

### Wizard Flow Position
```
Step 0: Layout Selection
    ↓
Step 1: Dimensions Input ← [THIS SPECIFICATION]
    ↓
Step 2: Tile & Grout Selection
    ↓
Step 3: Layout Pattern Selection
    ↓
Results: Calculations & Visual Preview
```

---

## User Flow Context

### Entry Point
- User arrives from Step 0 (Layout Selection) after choosing a layout shape
- Available shapes: Rectangle, Square, L-Shape, Custom Polygon (future)

### Exit Points
- **Forward**: Proceed to Step 2 (Tile & Grout Selection) with validated dimensions
- **Backward**: Return to Step 0 to change layout shape
- **Abandon**: Close wizard (prompt for unsaved changes)

### User Actions
1. View selected layout shape context
2. Input dimensions for each side of the shape
3. Select measurement unit (mm/cm/m/in/ft)
4. View real-time SVG preview with dimension labels
5. Validate inputs (automatic inline validation)
6. Navigate to next step or go back

---

## Feature Requirements

### 1. Layout Shape Context Display

**Location**: Top of screen, above form
**Display Elements**:
- Selected shape icon (visual representation)
- Shape name (e.g., "Rectangle Layout", "L-Shape Layout")
- Step indicator: "Step 1 of 4: Dimensions"
- Back button to Step 0

**Visual Design**:
```
┌─────────────────────────────────────────────┐
│  ← Back to Layout Selection                 │
│  ╔═══════════════════════════════╗          │
│  ║  Step 1 of 4: Dimensions      ║          │
│  ║  Selected: Rectangle Layout   ║          │
│  ║  [Rectangle Icon SVG]          ║          │
│  ╚═══════════════════════════════╝          │
└─────────────────────────────────────────────┘
```

**Implementation Notes**:
- Shape icon dynamically loaded based on `layoutType` from store
- Progress indicator uses shadcn/ui Progress component
- Back button includes aria-label for accessibility

---

### 2. Dimension Input Form

#### 2.1 Form Fields by Layout Type

##### Rectangle Layout
```typescript
interface RectangleDimensions {
  length: number        // Primary dimension (longer side)
  width: number         // Secondary dimension (shorter side)
  unit: MeasurementUnit // Selected unit
}

type MeasurementUnit = 'mm' | 'cm' | 'm' | 'in' | 'ft'
```

**Form Structure**:
- Length input field (numeric, required)
- Width input field (numeric, required)
- Unit selector dropdown (default: mm)
- Calculated area display (read-only)

##### Square Layout
```typescript
interface SquareDimensions {
  sideLength: number
  unit: MeasurementUnit
}
```

**Form Structure**:
- Side length input field (numeric, required)
- Unit selector dropdown
- Calculated area display

##### L-Shape Layout (Complex)
```typescript
interface LShapeDimensions {
  outerLength: number    // Total length of L
  outerWidth: number     // Total width of L
  cutoutLength: number   // Inner cutout length
  cutoutWidth: number    // Inner cutout width
  cutoutOffsetX: number  // Cutout position from left
  cutoutOffsetY: number  // Cutout position from top
  unit: MeasurementUnit
}
```

**Form Structure**:
- Outer dimensions group (length, width)
- Cutout dimensions group (length, width)
- Cutout position group (offset X, offset Y)
- Unit selector
- Calculated area display

##### Custom Polygon (Future Phase)
```typescript
interface CustomPolygonDimensions {
  vertices: Point[]      // Array of {x, y} coordinates
  unit: MeasurementUnit
}
```

---

#### 2.2 Input Field Component Specification

**Component**: `<DimensionInput />`

**Props**:
```typescript
interface DimensionInputProps {
  label: string                    // "Length", "Width", etc.
  name: string                     // Form field name
  value: number | undefined        // Current value
  unit: MeasurementUnit            // Display unit
  onChange: (value: number) => void
  error?: string                   // Validation error message
  placeholder?: string             // e.g., "e.g., 2500"
  min?: number                     // Minimum allowed value
  max?: number                     // Maximum allowed value
  step?: number                    // Input step increment
  disabled?: boolean
  required?: boolean
}
```

**Behavior**:
- Debounced input (300ms delay before validation)
- Real-time validation display
- Error state: red border + error message below
- Success state: green checkmark icon right side
- Focus state: blue ring (Tailwind focus-visible)
- Blur validation trigger

**Visual States**:
```
Default:    [Label      ]  [ Input field           ] [unit]
Focus:      [Label      ]  [ Input field (blue ring)] [unit]
Error:      [Label      ]  [ Input field (red)     ] [unit]
            ⚠️ Error message here
Success:    [Label      ]  [ Input field           ] ✓ [unit]
```

**Accessibility**:
- `<label htmlFor={id}>` properly associated
- `aria-describedby` linking to error message
- `aria-invalid="true"` on error state
- `aria-required="true"` for required fields
- Visible focus indicator (Tailwind ring)

---

#### 2.3 Unit Selector Component

**Component**: `<UnitSelector />`

**Props**:
```typescript
interface UnitSelectorProps {
  value: MeasurementUnit
  onChange: (unit: MeasurementUnit) => void
  disabled?: boolean
}
```

**Display Options**:
```typescript
const UNIT_OPTIONS = [
  { value: 'mm', label: 'Millimeters (mm)' },
  { value: 'cm', label: 'Centimeters (cm)' },
  { value: 'm', label: 'Meters (m)' },
  { value: 'in', label: 'Inches (in)' },
  { value: 'ft', label: 'Feet (ft)' },
] as const
```

**Behavior**:
- Dropdown using shadcn/ui Select component
- On change: triggers unit conversion for all values
- Conversion happens in store action
- Display values update immediately

**Conversion Display** (Optional Enhancement):
Show equivalent values in secondary units below input:
```
Length: 2500 mm
        ≈ 250 cm | 2.5 m | 98.4 in | 8.2 ft
```

---

#### 2.4 Form Validation Rules

**Validation Schema** (Zod):
```typescript
import { z } from 'zod'

const DimensionValueSchema = z.number()
  .min(0.1, 'Value must be at least 0.1 mm')
  .max(100000, 'Value cannot exceed 100,000 mm')
  .finite('Value must be a valid number')

const MeasurementUnitSchema = z.enum(['mm', 'cm', 'm', 'in', 'ft'])

const RectangleDimensionsSchema = z.object({
  layoutType: z.literal('rectangle'),
  length: DimensionValueSchema,
  width: DimensionValueSchema,
  unit: MeasurementUnitSchema.default('mm'),
})

const SquareDimensionsSchema = z.object({
  layoutType: z.literal('square'),
  sideLength: DimensionValueSchema,
  unit: MeasurementUnitSchema.default('mm'),
})

const LShapeDimensionsSchema = z.object({
  layoutType: z.literal('l-shape'),
  outerLength: DimensionValueSchema,
  outerWidth: DimensionValueSchema,
  cutoutLength: DimensionValueSchema,
  cutoutWidth: DimensionValueSchema,
  cutoutOffsetX: DimensionValueSchema,
  cutoutOffsetY: DimensionValueSchema,
  unit: MeasurementUnitSchema.default('mm'),
}).refine(
  (data) => data.cutoutLength < data.outerLength,
  { message: 'Cutout length must be less than outer length' }
).refine(
  (data) => data.cutoutWidth < data.outerWidth,
  { message: 'Cutout width must be less than outer width' }
)

export const DimensionsSchema = z.discriminatedUnion('layoutType', [
  RectangleDimensionsSchema,
  SquareDimensionsSchema,
  LShapeDimensionsSchema,
])
```

**Validation Triggers**:
- **On Change** (debounced 300ms): Field-level validation
- **On Blur**: Full field validation, display errors
- **On Submit**: Full form validation before navigation

**Error Messages**:
- Required field: "This field is required"
- Invalid number: "Please enter a valid number"
- Out of range: "Value must be between 0.1 mm and 100,000 mm"
- L-shape constraints: "Cutout dimensions must be smaller than outer dimensions"

---

### 3. Live Preview Canvas (SVG)

#### 3.1 Canvas Specifications

**Component**: `<LayoutPreview />`

**Canvas Dimensions**:
- **Mobile** (320px - 767px): Full width, height 300px
- **Tablet** (768px - 1023px): 50% width, height 400px
- **Desktop** (1024px+): 60% width, height 600px

**SVG Viewbox**:
- Dynamic based on shape dimensions
- Maintains aspect ratio
- 20px padding around shape edges
- Centered in canvas

**Visual Elements**:
1. Grid background (subtle, 5mm × 5mm grid lines)
2. Shape outline (stroke width 2px, primary color)
3. Dimension labels on each edge
4. Area calculation at center
5. Scale indicator at bottom

**Preview States**:
```
Empty State:
  - Dashed outline placeholder
  - Text: "Enter dimensions to see preview"

Loading State:
  - Skeleton shape with shimmer effect

Active State:
  - Filled shape with dimensions
  - Animated transitions between dimension changes
```

---

#### 3.2 Shape Rendering Logic

**Rectangle**:
```typescript
function renderRectangle(length: number, width: number): SVGElement {
  // Scale to fit canvas
  const scale = calculateScale(length, width, canvasSize)
  const scaledLength = length * scale
  const scaledWidth = width * scale

  return (
    <g>
      <rect
        x={padding}
        y={padding}
        width={scaledLength}
        height={scaledWidth}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
      />
      <DimensionLabel
        start={{x: padding, y: padding}}
        end={{x: padding + scaledLength, y: padding}}
        label={`${length} mm`}
        position="top"
      />
      <DimensionLabel
        start={{x: padding + scaledLength, y: padding}}
        end={{x: padding + scaledLength, y: padding + scaledWidth}}
        label={`${width} mm`}
        position="right"
      />
    </g>
  )
}
```

**Square** (similar to rectangle):
```typescript
function renderSquare(sideLength: number): SVGElement {
  return renderRectangle(sideLength, sideLength)
}
```

**L-Shape**:
```typescript
function renderLShape(dims: LShapeDimensions): SVGElement {
  const scale = calculateScale(dims.outerLength, dims.outerWidth, canvasSize)

  // Create path for L-shape polygon
  const pathData = createLShapePath(dims, scale)

  return (
    <g>
      <path
        d={pathData}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
      />
      {/* Multiple dimension labels for each segment */}
      {renderLShapeDimensionLabels(dims, scale)}
    </g>
  )
}

function createLShapePath(dims: LShapeDimensions, scale: number): string {
  // Calculate vertices for L-shape
  const vertices = [
    { x: 0, y: 0 },
    { x: dims.outerLength, y: 0 },
    { x: dims.outerLength, y: dims.outerWidth - dims.cutoutWidth },
    { x: dims.cutoutOffsetX + dims.cutoutLength, y: dims.outerWidth - dims.cutoutWidth },
    { x: dims.cutoutOffsetX + dims.cutoutLength, y: dims.outerWidth },
    { x: 0, y: dims.outerWidth },
  ].map(v => ({ x: v.x * scale, y: v.y * scale }))

  return `M ${vertices.map(v => `${v.x},${v.y}`).join(' L ')} Z`
}
```

---

#### 3.3 Dimension Labels

**Component**: `<DimensionLabel />`

**Props**:
```typescript
interface DimensionLabelProps {
  start: Point        // {x, y} start point
  end: Point          // {x, y} end point
  label: string       // "2500 mm"
  position: 'top' | 'bottom' | 'left' | 'right' | 'center'
}
```

**Rendering**:
```typescript
function DimensionLabel({ start, end, label, position }: DimensionLabelProps) {
  const midpoint = {
    x: (start.x + end.x) / 2,
    y: (start.y + end.y) / 2,
  }

  const offset = getOffsetForPosition(position) // e.g., {x: 0, y: -15}

  return (
    <g>
      {/* Dimension line */}
      <line
        x1={start.x}
        y1={start.y}
        x2={end.x}
        y2={end.y}
        stroke="currentColor"
        strokeWidth={1}
        strokeDasharray="5,5"
      />

      {/* Label text */}
      <text
        x={midpoint.x + offset.x}
        y={midpoint.y + offset.y}
        textAnchor="middle"
        fontSize={14}
        fontWeight={600}
        fill="currentColor"
      >
        {label}
      </text>
    </g>
  )
}
```

---

#### 3.4 Area Display

**Component**: `<AreaDisplay />`

**Position**: Center of shape
**Format**: "Area: 3,750,000 mm²" or "Area: 3.75 m²" (based on selected unit)

**Rendering**:
```typescript
function AreaDisplay({ area, unit }: { area: number; unit: MeasurementUnit }) {
  const formattedArea = formatArea(area, unit)

  return (
    <text
      x={canvasCenter.x}
      y={canvasCenter.y}
      textAnchor="middle"
      fontSize={18}
      fontWeight={700}
      fill="var(--primary)"
    >
      Area: {formattedArea}
    </text>
  )
}

function formatArea(area: number, unit: MeasurementUnit): string {
  // Convert area from mm² to selected unit²
  const convertedArea = convertAreaUnit(area, 'mm', unit)
  return `${convertedArea.toLocaleString()} ${unit}²`
}
```

---

#### 3.5 Scale Indicator

**Component**: `<ScaleIndicator />`

**Position**: Bottom-right corner of canvas
**Display**: "Scale: 1:50" or "1 mm = 0.5 px"

**Calculation**:
```typescript
function calculateScale(
  realLength: number,
  realWidth: number,
  canvasSize: { width: number; height: number }
): number {
  const availableWidth = canvasSize.width - (2 * padding)
  const availableHeight = canvasSize.height - (2 * padding)

  const scaleX = availableWidth / realLength
  const scaleY = availableHeight / realWidth

  return Math.min(scaleX, scaleY) // Use smaller scale to fit both dimensions
}
```

---

#### 3.6 Animations (Framer Motion)

**Preview Update Transitions**:
```typescript
import { motion } from 'framer-motion'

const previewVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.2,
    }
  },
}

function LayoutPreview() {
  return (
    <motion.div
      variants={previewVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <svg>{/* shape rendering */}</svg>
    </motion.div>
  )
}
```

**Dimension Change Animation**:
- Morph shape smoothly between dimension changes
- Use `layout` animation for position changes
- Debounce updates to avoid excessive re-renders

---

### 4. Navigation Controls

#### 4.1 Next Button

**Component**: `<Button variant="default" />`

**Label**: "Continue to Tile & Grout →"

**Behavior**:
- **Disabled State**: When form is invalid (any validation errors)
- **Enabled State**: When all required fields are valid
- **On Click**:
  1. Validate full form
  2. Save dimensions to Zustand store
  3. Navigate to `/wizard/step-2` (Tile & Grout)

**Visual States**:
```typescript
<Button
  disabled={!isFormValid}
  onClick={handleContinue}
  className="w-full md:w-auto"
>
  Continue to Tile & Grout →
</Button>
```

---

#### 4.2 Back Button

**Component**: `<Button variant="ghost" />`

**Label**: "← Back to Layout Selection"

**Behavior**:
- Always enabled
- On Click: Navigate to `/wizard/step-0` (Layout Selection)
- No confirmation needed (auto-save to store)

---

#### 4.3 Save Draft (Optional Enhancement)

**Component**: `<Button variant="outline" />`

**Label**: "Save Draft"

**Behavior**:
- Save current form state to localStorage
- Show toast notification: "Draft saved"
- Persist across page reloads

---

## Component Architecture

### File Structure

```
src/
├── app/
│   └── wizard/
│       └── step-1/
│           └── page.tsx                    # Main page component
│
├── components/
│   └── wizard/
│       └── step-1-dimensions/
│           ├── Step1Dimensions.tsx         # Container component
│           ├── DimensionForm.tsx           # Form with all inputs
│           ├── DimensionInput.tsx          # Single input field
│           ├── UnitSelector.tsx            # Unit dropdown
│           ├── LayoutPreview.tsx           # SVG canvas
│           ├── DimensionLabel.tsx          # SVG dimension label
│           ├── AreaDisplay.tsx             # Area calculation display
│           ├── ScaleIndicator.tsx          # Scale reference
│           └── index.ts                    # Barrel export
│
├── stores/
│   └── layout-store.ts                     # Zustand store
│
├── lib/
│   ├── validation/
│   │   └── dimensions-schema.ts            # Zod schemas
│   ├── utils/
│   │   ├── unit-converter.ts               # Unit conversion functions
│   │   ├── area-calculator.ts              # Area calculation
│   │   └── scale-calculator.ts             # SVG scale calculation
│   └── constants/
│       └── measurement-units.ts            # Unit definitions
│
├── types/
│   └── dimensions.ts                       # TypeScript interfaces
│
└── hooks/
    └── use-dimension-calculator.ts         # Custom hook for calculations
```

---

### Component Hierarchy

```
Step1Dimensions (Container)
│
├── LayoutShapeContext (Header)
│   ├── BackButton
│   ├── StepIndicator
│   └── ShapeIcon
│
├── DimensionForm (Main Form)
│   ├── DimensionInput (Length)
│   ├── DimensionInput (Width)
│   ├── UnitSelector
│   └── AreaDisplay (Calculated)
│
├── LayoutPreview (SVG Canvas)
│   ├── GridBackground
│   ├── ShapeOutline (Rectangle/Square/L-Shape)
│   ├── DimensionLabel (× multiple)
│   ├── AreaDisplay (Center)
│   └── ScaleIndicator
│
└── NavigationControls
    ├── BackButton
    └── NextButton
```

---

### Component Specifications

#### `Step1Dimensions.tsx` (Container)

**Responsibilities**:
- Orchestrate all child components
- Manage form state with react-hook-form
- Connect to Zustand store
- Handle navigation logic

```typescript
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useLayoutStore } from '@/stores/layout-store'
import { DimensionsSchema } from '@/lib/validation/dimensions-schema'
import { DimensionForm } from './DimensionForm'
import { LayoutPreview } from './LayoutPreview'

export function Step1Dimensions() {
  const { currentProject, setDimensions } = useLayoutStore()

  const form = useForm({
    resolver: zodResolver(DimensionsSchema),
    defaultValues: {
      layoutType: currentProject.layoutType,
      length: currentProject.dimensions.length,
      width: currentProject.dimensions.width,
      unit: currentProject.dimensions.unit || 'mm',
    },
    mode: 'onChange', // Validate on change
  })

  const handleSubmit = form.handleSubmit((data) => {
    setDimensions(data)
    router.push('/wizard/step-2')
  })

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <DimensionForm form={form} />
      <LayoutPreview dimensions={form.watch()} />

      <div className="col-span-full flex justify-between">
        <Button variant="ghost" onClick={() => router.back()}>
          ← Back to Layout Selection
        </Button>
        <Button
          disabled={!form.formState.isValid}
          onClick={handleSubmit}
        >
          Continue to Tile & Grout →
        </Button>
      </div>
    </div>
  )
}
```

---

#### `DimensionForm.tsx`

**Responsibilities**:
- Render form fields based on layout type
- Handle unit conversion
- Display validation errors

```typescript
import { UseFormReturn } from 'react-hook-form'
import { DimensionInput } from './DimensionInput'
import { UnitSelector } from './UnitSelector'

interface DimensionFormProps {
  form: UseFormReturn<DimensionsFormData>
}

export function DimensionForm({ form }: DimensionFormProps) {
  const layoutType = form.watch('layoutType')
  const unit = form.watch('unit')

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Enter Dimensions</h2>

      {layoutType === 'rectangle' && (
        <>
          <DimensionInput
            label="Length"
            name="length"
            unit={unit}
            control={form.control}
            error={form.formState.errors.length?.message}
          />
          <DimensionInput
            label="Width"
            name="width"
            unit={unit}
            control={form.control}
            error={form.formState.errors.width?.message}
          />
        </>
      )}

      {layoutType === 'square' && (
        <DimensionInput
          label="Side Length"
          name="sideLength"
          unit={unit}
          control={form.control}
          error={form.formState.errors.sideLength?.message}
        />
      )}

      <UnitSelector
        value={unit}
        onChange={(newUnit) => form.setValue('unit', newUnit)}
      />
    </div>
  )
}
```

---

#### `DimensionInput.tsx`

**Responsibilities**:
- Single controlled input field
- Display validation states
- Debounced onChange

```typescript
import { useController, Control } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useDebouncedCallback } from 'use-debounce'

interface DimensionInputProps {
  label: string
  name: string
  unit: MeasurementUnit
  control: Control<any>
  error?: string
}

export function DimensionInput({ label, name, unit, control, error }: DimensionInputProps) {
  const { field } = useController({ name, control })

  const debouncedOnChange = useDebouncedCallback(
    (value: string) => field.onChange(parseFloat(value)),
    300
  )

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <div className="relative">
        <Input
          id={name}
          type="number"
          step="0.01"
          min="0.1"
          max="100000"
          placeholder={`e.g., 2500`}
          onChange={(e) => debouncedOnChange(e.target.value)}
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : undefined}
          className={error ? 'border-red-500' : ''}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
          {unit}
        </span>
        {!error && field.value && (
          <span className="absolute right-10 top-1/2 -translate-y-1/2 text-green-500">
            ✓
          </span>
        )}
      </div>
      {error && (
        <p id={`${name}-error`} className="text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  )
}
```

---

#### `LayoutPreview.tsx`

**Responsibilities**:
- Render SVG shape based on dimensions
- Calculate scale dynamically
- Display dimension labels and area

```typescript
import { motion } from 'framer-motion'
import { useMemo } from 'react'
import { calculateScale } from '@/lib/utils/scale-calculator'

interface LayoutPreviewProps {
  dimensions: DimensionsFormData
}

export function LayoutPreview({ dimensions }: LayoutPreviewProps) {
  const canvasSize = { width: 600, height: 600 }
  const padding = 40

  const scale = useMemo(() => {
    if (!dimensions.length || !dimensions.width) return 1
    return calculateScale(
      dimensions.length,
      dimensions.width,
      canvasSize
    )
  }, [dimensions])

  if (!dimensions.length || !dimensions.width) {
    return (
      <div className="flex items-center justify-center h-full border-2 border-dashed border-gray-300 rounded-lg">
        <p className="text-gray-500">Enter dimensions to see preview</p>
      </div>
    )
  }

  const scaledLength = dimensions.length * scale
  const scaledWidth = dimensions.width * scale

  return (
    <motion.svg
      width={canvasSize.width}
      height={canvasSize.height}
      viewBox={`0 0 ${canvasSize.width} ${canvasSize.height}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Grid background */}
      <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
        <path d="M 10 0 L 0 0 0 10" fill="none" stroke="gray" strokeWidth="0.5" />
      </pattern>
      <rect width="100%" height="100%" fill="url(#grid)" opacity="0.1" />

      {/* Rectangle shape */}
      <rect
        x={padding}
        y={padding}
        width={scaledLength}
        height={scaledWidth}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
      />

      {/* Dimension labels */}
      <DimensionLabel
        start={{ x: padding, y: padding - 10 }}
        end={{ x: padding + scaledLength, y: padding - 10 }}
        label={`${dimensions.length} ${dimensions.unit}`}
      />

      {/* Area display */}
      <AreaDisplay
        area={dimensions.length * dimensions.width}
        unit={dimensions.unit}
        center={{ x: canvasSize.width / 2, y: canvasSize.height / 2 }}
      />
    </motion.svg>
  )
}
```

---

## State Management

### Zustand Store Structure

**File**: `src/stores/layout-store.ts`

```typescript
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { devtools, persist } from 'zustand/middleware'

export interface LayoutStore {
  // Current project state
  currentProject: {
    id: string | null
    layoutType: 'rectangle' | 'square' | 'l-shape' | 'custom'
    dimensions: {
      // Rectangle/Square
      length?: number        // Always stored in mm
      width?: number         // Always stored in mm
      sideLength?: number    // For square

      // L-Shape
      outerLength?: number
      outerWidth?: number
      cutoutLength?: number
      cutoutWidth?: number
      cutoutOffsetX?: number
      cutoutOffsetY?: number

      // Display unit
      unit: MeasurementUnit
    }
    calculatedArea: number   // In mm²

    // Step 2 data (future)
    tileSettings?: TileSettings

    // Step 3 data (future)
    layoutPattern?: LayoutPattern
  }

  // Actions
  setLayoutType: (type: LayoutType) => void
  setDimensions: (dims: DimensionsFormData) => void
  setUnit: (unit: MeasurementUnit) => void
  calculateArea: () => void
  resetProject: () => void

  // Computed values
  getDisplayDimensions: () => DimensionsFormData
}

export const useLayoutStore = create<LayoutStore>()(
  devtools(
    persist(
      immer((set, get) => ({
        currentProject: {
          id: null,
          layoutType: 'rectangle',
          dimensions: {
            unit: 'mm',
          },
          calculatedArea: 0,
        },

        setLayoutType: (type) => set((state) => {
          state.currentProject.layoutType = type
        }),

        setDimensions: (dims) => set((state) => {
          // Convert to mm for storage
          const lengthInMm = convertToMm(dims.length, dims.unit)
          const widthInMm = convertToMm(dims.width, dims.unit)

          state.currentProject.dimensions = {
            length: lengthInMm,
            width: widthInMm,
            unit: dims.unit,
          }

          // Recalculate area
          state.currentProject.calculatedArea = lengthInMm * widthInMm
        }),

        setUnit: (unit) => set((state) => {
          state.currentProject.dimensions.unit = unit
        }),

        calculateArea: () => set((state) => {
          const dims = state.currentProject.dimensions
          if (dims.length && dims.width) {
            state.currentProject.calculatedArea = dims.length * dims.width
          }
        }),

        resetProject: () => set((state) => {
          state.currentProject = {
            id: null,
            layoutType: 'rectangle',
            dimensions: { unit: 'mm' },
            calculatedArea: 0,
          }
        }),

        getDisplayDimensions: () => {
          const state = get()
          const dims = state.currentProject.dimensions

          return {
            layoutType: state.currentProject.layoutType,
            length: convertFromMm(dims.length, dims.unit),
            width: convertFromMm(dims.width, dims.unit),
            unit: dims.unit,
          }
        },
      })),
      {
        name: 'layitright-layout-store',
        partialize: (state) => ({ currentProject: state.currentProject }),
      }
    )
  )
)
```

---

### Store Usage in Components

```typescript
// Read state
const { currentProject } = useLayoutStore()

// Update dimensions
const setDimensions = useLayoutStore((state) => state.setDimensions)

// Get computed values
const displayDimensions = useLayoutStore((state) => state.getDisplayDimensions())
```

---

## Form Validation

### Zod Schemas (Complete)

**File**: `src/lib/validation/dimensions-schema.ts`

```typescript
import { z } from 'zod'

// Base value schema
const DimensionValueSchema = z.number({
  required_error: 'This field is required',
  invalid_type_error: 'Please enter a valid number',
})
  .min(0.1, 'Value must be at least 0.1 mm')
  .max(100000, 'Value cannot exceed 100,000 mm')
  .finite('Value must be a valid number')

// Unit schema
const MeasurementUnitSchema = z.enum(['mm', 'cm', 'm', 'in', 'ft'], {
  required_error: 'Please select a unit',
})

// Rectangle dimensions
const RectangleDimensionsSchema = z.object({
  layoutType: z.literal('rectangle'),
  length: DimensionValueSchema,
  width: DimensionValueSchema,
  unit: MeasurementUnitSchema.default('mm'),
})

// Square dimensions
const SquareDimensionsSchema = z.object({
  layoutType: z.literal('square'),
  sideLength: DimensionValueSchema,
  unit: MeasurementUnitSchema.default('mm'),
})

// L-Shape dimensions with cross-field validation
const LShapeDimensionsSchema = z.object({
  layoutType: z.literal('l-shape'),
  outerLength: DimensionValueSchema,
  outerWidth: DimensionValueSchema,
  cutoutLength: DimensionValueSchema,
  cutoutWidth: DimensionValueSchema,
  cutoutOffsetX: DimensionValueSchema,
  cutoutOffsetY: DimensionValueSchema,
  unit: MeasurementUnitSchema.default('mm'),
})
  .refine(
    (data) => data.cutoutLength < data.outerLength,
    {
      message: 'Cutout length must be less than outer length',
      path: ['cutoutLength'],
    }
  )
  .refine(
    (data) => data.cutoutWidth < data.outerWidth,
    {
      message: 'Cutout width must be less than outer width',
      path: ['cutoutWidth'],
    }
  )
  .refine(
    (data) => data.cutoutOffsetX + data.cutoutLength <= data.outerLength,
    {
      message: 'Cutout exceeds outer boundary',
      path: ['cutoutOffsetX'],
    }
  )
  .refine(
    (data) => data.cutoutOffsetY + data.cutoutWidth <= data.outerWidth,
    {
      message: 'Cutout exceeds outer boundary',
      path: ['cutoutOffsetY'],
    }
  )

// Union schema for all layout types
export const DimensionsSchema = z.discriminatedUnion('layoutType', [
  RectangleDimensionsSchema,
  SquareDimensionsSchema,
  LShapeDimensionsSchema,
])

export type DimensionsFormData = z.infer<typeof DimensionsSchema>
```

---

### Form Integration with react-hook-form

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

const form = useForm<DimensionsFormData>({
  resolver: zodResolver(DimensionsSchema),
  mode: 'onChange',      // Validate on change
  reValidateMode: 'onChange',
  defaultValues: {
    layoutType: 'rectangle',
    length: undefined,
    width: undefined,
    unit: 'mm',
  },
})

// Access form state
const { formState: { errors, isValid } } = form
```

---

## Unit Conversion System

### Conversion Utilities

**File**: `src/lib/utils/unit-converter.ts`

```typescript
import convert from 'convert-units'

export type MeasurementUnit = 'mm' | 'cm' | 'm' | 'in' | 'ft'

/**
 * Convert any unit to millimeters (base unit for storage)
 */
export function convertToMm(value: number, fromUnit: MeasurementUnit): number {
  if (fromUnit === 'mm') return value
  return convert(value).from(fromUnit).to('mm')
}

/**
 * Convert millimeters to any unit (for display)
 */
export function convertFromMm(value: number | undefined, toUnit: MeasurementUnit): number | undefined {
  if (value === undefined) return undefined
  if (toUnit === 'mm') return value
  return convert(value).from('mm').to(toUnit)
}

/**
 * Convert area from mm² to target unit²
 */
export function convertAreaUnit(areaInMm2: number, toUnit: MeasurementUnit): number {
  switch (toUnit) {
    case 'mm':
      return areaInMm2
    case 'cm':
      return areaInMm2 / 100
    case 'm':
      return areaInMm2 / 1000000
    case 'in':
      return convert(areaInMm2).from('mm2').to('in2')
    case 'ft':
      return convert(areaInMm2).from('mm2').to('ft2')
    default:
      return areaInMm2
  }
}

/**
 * Format dimension value for display
 */
export function formatDimension(value: number, unit: MeasurementUnit): string {
  return `${value.toFixed(2)} ${unit}`
}

/**
 * Format area value for display
 */
export function formatArea(area: number, unit: MeasurementUnit): string {
  const convertedArea = convertAreaUnit(area, unit)
  return `${convertedArea.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })} ${unit}²`
}
```

---

### Unit Conversion on Unit Change

```typescript
// When user changes unit selector
function handleUnitChange(newUnit: MeasurementUnit) {
  const currentDimensions = form.getValues()

  // Convert all values from current unit to new unit
  const convertedLength = convertFromMm(
    convertToMm(currentDimensions.length, currentDimensions.unit),
    newUnit
  )

  const convertedWidth = convertFromMm(
    convertToMm(currentDimensions.width, currentDimensions.unit),
    newUnit
  )

  // Update form
  form.setValue('length', convertedLength)
  form.setValue('width', convertedWidth)
  form.setValue('unit', newUnit)
}
```

---

## SVG Preview System

### Scale Calculation Algorithm

**File**: `src/lib/utils/scale-calculator.ts`

```typescript
export interface CanvasSize {
  width: number
  height: number
}

export interface Padding {
  top: number
  right: number
  bottom: number
  left: number
}

/**
 * Calculate scale factor to fit shape within canvas
 */
export function calculateScale(
  shapeWidth: number,    // in mm
  shapeHeight: number,   // in mm
  canvasSize: CanvasSize,
  padding: Padding = { top: 40, right: 40, bottom: 40, left: 40 }
): number {
  const availableWidth = canvasSize.width - (padding.left + padding.right)
  const availableHeight = canvasSize.height - (padding.top + padding.bottom)

  const scaleX = availableWidth / shapeWidth
  const scaleY = availableHeight / shapeHeight

  // Use the smaller scale to ensure shape fits in both dimensions
  return Math.min(scaleX, scaleY)
}

/**
 * Calculate viewBox for SVG to center shape
 */
export function calculateViewBox(
  shapeWidth: number,
  shapeHeight: number,
  canvasSize: CanvasSize,
  scale: number,
  padding: Padding
): string {
  const scaledWidth = shapeWidth * scale
  const scaledHeight = shapeHeight * scale

  const offsetX = (canvasSize.width - scaledWidth) / 2 - padding.left
  const offsetY = (canvasSize.height - scaledHeight) / 2 - padding.top

  return `${offsetX} ${offsetY} ${canvasSize.width} ${canvasSize.height}`
}

/**
 * Get scale ratio text for display
 */
export function getScaleRatioText(scale: number): string {
  const ratio = 1 / scale
  return `1:${ratio.toFixed(0)}`
}
```

---

### Area Calculation

**File**: `src/lib/utils/area-calculator.ts`

```typescript
/**
 * Calculate area for rectangle/square
 */
export function calculateRectangleArea(length: number, width: number): number {
  return length * width
}

/**
 * Calculate area for L-shape
 */
export function calculateLShapeArea(dims: LShapeDimensions): number {
  const outerArea = dims.outerLength * dims.outerWidth
  const cutoutArea = dims.cutoutLength * dims.cutoutWidth
  return outerArea - cutoutArea
}

/**
 * Calculate area for custom polygon using Shoelace formula
 */
export function calculatePolygonArea(vertices: Point[]): number {
  let area = 0
  const n = vertices.length

  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n
    area += vertices[i].x * vertices[j].y
    area -= vertices[j].x * vertices[i].y
  }

  return Math.abs(area / 2)
}
```

---

## Accessibility Requirements

### WCAG Level AA Compliance Checklist

#### 1. Perceivable
- [ ] **1.1.1 Non-text Content**: All SVG shapes have `<title>` and `<desc>` elements
- [ ] **1.3.1 Info and Relationships**: Form labels properly associated with inputs
- [ ] **1.4.1 Use of Color**: Validation errors indicated by icon + text, not color alone
- [ ] **1.4.3 Contrast**: Minimum 4.5:1 contrast ratio for all text
- [ ] **1.4.10 Reflow**: Content reflows without horizontal scrolling at 320px width
- [ ] **1.4.11 Non-text Contrast**: 3:1 contrast for UI components and graphics
- [ ] **1.4.12 Text Spacing**: Text remains readable with increased spacing

#### 2. Operable
- [ ] **2.1.1 Keyboard**: All functionality available via keyboard
- [ ] **2.1.2 No Keyboard Trap**: Focus can move away from all components
- [ ] **2.4.3 Focus Order**: Focus order is logical (top to bottom, left to right)
- [ ] **2.4.7 Focus Visible**: Visible focus indicator on all interactive elements
- [ ] **2.5.5 Target Size**: Minimum 48px × 48px touch targets on mobile

#### 3. Understandable
- [ ] **3.2.2 On Input**: No unexpected context changes on input
- [ ] **3.3.1 Error Identification**: Errors identified and described in text
- [ ] **3.3.2 Labels or Instructions**: Clear labels and instructions provided
- [ ] **3.3.3 Error Suggestion**: Suggestions provided for fixing errors
- [ ] **3.3.4 Error Prevention**: Validation prevents errors before submission

#### 4. Robust
- [ ] **4.1.2 Name, Role, Value**: All components have accessible names
- [ ] **4.1.3 Status Messages**: Status updates announced to screen readers

---

### ARIA Implementation

#### Form Fields
```tsx
<Input
  id="length"
  aria-label="Length in millimeters"
  aria-describedby="length-error length-help"
  aria-invalid={!!errors.length}
  aria-required="true"
/>

{errors.length && (
  <p id="length-error" role="alert" aria-live="polite">
    {errors.length.message}
  </p>
)}

<p id="length-help" className="text-sm text-muted-foreground">
  Enter the length of your layout in the selected unit
</p>
```

#### SVG Preview
```tsx
<svg
  role="img"
  aria-label="Layout preview showing rectangle with dimensions"
  aria-describedby="svg-description"
>
  <title>Layout Preview</title>
  <desc id="svg-description">
    Rectangle layout with length {length} mm and width {width} mm,
    total area {area} square millimeters
  </desc>
  {/* SVG content */}
</svg>
```

#### Navigation Buttons
```tsx
<Button
  disabled={!isValid}
  aria-disabled={!isValid}
  aria-label="Continue to tile and grout selection step"
>
  Continue to Tile & Grout →
</Button>
```

---

### Keyboard Navigation

**Tab Order**:
1. Back to Layout Selection button
2. Length input field
3. Width input field
4. Unit selector dropdown
5. Continue button

**Keyboard Shortcuts**:
- `Tab`: Move focus forward
- `Shift + Tab`: Move focus backward
- `Enter`: Submit form (on Continue button)
- `Escape`: Close unit selector dropdown

---

### Screen Reader Announcements

```typescript
import { useAnnouncer } from '@/hooks/use-announcer'

function DimensionForm() {
  const announce = useAnnouncer()

  const handleValidationError = (errors) => {
    const errorCount = Object.keys(errors).length
    announce(`${errorCount} validation error${errorCount > 1 ? 's' : ''} found. Please review the form.`)
  }

  const handleSuccessfulSubmit = () => {
    announce('Dimensions saved successfully. Proceeding to tile and grout selection.')
  }
}
```

**Announcer Hook**:
```typescript
export function useAnnouncer() {
  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcer = document.createElement('div')
    announcer.setAttribute('aria-live', priority)
    announcer.setAttribute('aria-atomic', 'true')
    announcer.className = 'sr-only'
    announcer.textContent = message

    document.body.appendChild(announcer)

    setTimeout(() => {
      document.body.removeChild(announcer)
    }, 1000)
  }

  return announce
}
```

---

## Responsive Design

### Breakpoint Strategy

**Tailwind Breakpoints**:
- `sm`: 640px (Small tablets)
- `md`: 768px (Tablets)
- `lg`: 1024px (Desktop)
- `xl`: 1280px (Large desktop)

### Layout Adaptations

#### Mobile (< 768px)
```
┌─────────────────────────┐
│  ← Back | Step 1 of 4   │
├─────────────────────────┤
│                         │
│  [Form Fields]          │
│  - Length               │
│  - Width                │
│  - Unit                 │
│                         │
├─────────────────────────┤
│                         │
│  [SVG Preview]          │
│  (300px × 300px)        │
│                         │
├─────────────────────────┤
│  [Continue Button]      │
│  (Full width)           │
└─────────────────────────┘
```

#### Tablet (768px - 1023px)
```
┌─────────────────────────────────────┐
│  ← Back          Step 1 of 4        │
├─────────────┬───────────────────────┤
│             │                       │
│  [Form]     │   [SVG Preview]       │
│  (50%)      │   (50%)               │
│             │   (400px × 400px)     │
│             │                       │
├─────────────┴───────────────────────┤
│  ← Back          [Continue →]       │
└─────────────────────────────────────┘
```

#### Desktop (1024px+)
```
┌──────────────────────────────────────────────┐
│  ← Back to Layout    Step 1 of 4             │
├─────────────────┬────────────────────────────┤
│                 │                            │
│  [Form]         │   [SVG Preview]            │
│  (40%)          │   (60%)                    │
│                 │   (600px × 600px)          │
│                 │                            │
│                 │                            │
├─────────────────┴────────────────────────────┤
│  ← Back                   [Continue →]       │
└──────────────────────────────────────────────┘
```

---

### Responsive Component Classes

```tsx
// Container
<div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">

// Grid layout
<div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">

// Form column
<div className="space-y-6">

// Preview column
<div className="w-full md:sticky md:top-8">

// Buttons
<Button className="w-full md:w-auto">
```

---

### Touch Target Sizing

**Minimum Sizes**:
- Buttons: 48px × 48px
- Input fields: 48px height minimum
- Dropdown selectors: 48px height
- SVG interactive elements: 44px × 44px

```tsx
// Mobile-optimized input
<Input className="h-12 text-base" /> // 48px height

// Mobile-optimized button
<Button className="h-12 px-6 text-base">
```

---

## Error Handling

### Error Types & Messages

#### Input Validation Errors
```typescript
const ERROR_MESSAGES = {
  REQUIRED: 'This field is required',
  INVALID_NUMBER: 'Please enter a valid number',
  OUT_OF_RANGE: 'Value must be between 0.1 mm and 100,000 mm',
  TOO_SMALL: 'Value must be at least 0.1 mm',
  TOO_LARGE: 'Value cannot exceed 100,000 mm',

  // L-Shape specific
  CUTOUT_TOO_LARGE: 'Cutout dimensions must be smaller than outer dimensions',
  CUTOUT_OUT_OF_BOUNDS: 'Cutout position exceeds outer boundary',
}
```

#### Unit Conversion Errors
```typescript
try {
  const converted = convertToMm(value, unit)
} catch (error) {
  console.error('Unit conversion failed:', error)
  toast.error('Unable to convert units. Please try again.')
}
```

#### Store Update Errors
```typescript
try {
  setDimensions(formData)
} catch (error) {
  console.error('Failed to save dimensions:', error)
  toast.error('Failed to save dimensions. Please try again.')
}
```

---

### Error Display Patterns

#### Inline Field Errors
```tsx
{errors.length && (
  <div className="flex items-start gap-2 mt-1">
    <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
    <p className="text-sm text-red-500">{errors.length.message}</p>
  </div>
)}
```

#### Form-Level Errors
```tsx
{Object.keys(errors).length > 0 && (
  <Alert variant="destructive">
    <AlertCircle className="h-4 w-4" />
    <AlertTitle>Validation Errors</AlertTitle>
    <AlertDescription>
      Please correct the errors above before continuing.
    </AlertDescription>
  </Alert>
)}
```

#### Toast Notifications
```typescript
import { toast } from 'sonner'

// Success
toast.success('Dimensions saved successfully')

// Error
toast.error('Failed to save dimensions')

// Warning
toast.warning('Please fill all required fields')
```

---

### Edge Case Handling

#### Very Large Numbers
```typescript
function validateDimensionValue(value: string): number | null {
  const parsed = parseFloat(value)

  if (isNaN(parsed)) return null
  if (!isFinite(parsed)) return null
  if (parsed > 100000) return 100000 // Cap at max
  if (parsed < 0.1) return null

  return parsed
}
```

#### Decimal Precision
```typescript
function roundToPrecision(value: number, decimals: number = 2): number {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals)
}
```

#### Invalid Input Recovery
```typescript
// Auto-correct on blur
<Input
  onBlur={(e) => {
    const value = parseFloat(e.target.value)
    if (value < 0.1) {
      field.onChange(0.1)
      toast.warning('Value adjusted to minimum allowed')
    }
    if (value > 100000) {
      field.onChange(100000)
      toast.warning('Value adjusted to maximum allowed')
    }
  }}
/>
```

---

## Performance Considerations

### Debouncing Strategy

```typescript
import { useDebouncedCallback } from 'use-debounce'

// Input debounce (300ms)
const debouncedOnChange = useDebouncedCallback(
  (value: string) => {
    const parsed = parseFloat(value)
    if (!isNaN(parsed)) {
      field.onChange(parsed)
    }
  },
  300
)

// Preview update debounce (300ms)
const debouncedPreviewUpdate = useDebouncedCallback(
  (dimensions) => {
    updatePreview(dimensions)
  },
  300
)
```

---

### Memoization

```typescript
import { useMemo } from 'react'

// Memoize scale calculation
const scale = useMemo(() => {
  if (!dimensions.length || !dimensions.width) return 1
  return calculateScale(dimensions.length, dimensions.width, canvasSize)
}, [dimensions.length, dimensions.width, canvasSize])

// Memoize area calculation
const area = useMemo(() => {
  if (!dimensions.length || !dimensions.width) return 0
  return calculateRectangleArea(dimensions.length, dimensions.width)
}, [dimensions.length, dimensions.width])
```

---

### React Optimization

```typescript
// Prevent unnecessary re-renders
const MemoizedPreview = React.memo(LayoutPreview, (prev, next) => {
  return (
    prev.dimensions.length === next.dimensions.length &&
    prev.dimensions.width === next.dimensions.width &&
    prev.dimensions.unit === next.dimensions.unit
  )
})

// Use callback for event handlers
const handleContinue = useCallback(() => {
  setDimensions(form.getValues())
  router.push('/wizard/step-2')
}, [form, setDimensions, router])
```

---

### SVG Performance

```typescript
// Limit SVG complexity
const MAX_GRID_LINES = 100

function renderGridBackground(canvasSize, gridSpacing) {
  const horizontalLines = Math.min(canvasSize.height / gridSpacing, MAX_GRID_LINES)
  const verticalLines = Math.min(canvasSize.width / gridSpacing, MAX_GRID_LINES)

  // Use pattern instead of individual lines for better performance
  return (
    <defs>
      <pattern id="grid" width={gridSpacing} height={gridSpacing} patternUnits="userSpaceOnUse">
        <path d={`M ${gridSpacing} 0 L 0 0 0 ${gridSpacing}`} fill="none" stroke="currentColor" strokeWidth="0.5" />
      </pattern>
    </defs>
  )
}
```

---

## Testing Strategy

### Unit Tests (Jest + Testing Library)

#### 1. Unit Conversion Tests
```typescript
// src/lib/utils/__tests__/unit-converter.test.ts

import { convertToMm, convertFromMm, convertAreaUnit } from '../unit-converter'

describe('convertToMm', () => {
  test('converts centimeters to millimeters', () => {
    expect(convertToMm(10, 'cm')).toBe(100)
  })

  test('converts meters to millimeters', () => {
    expect(convertToMm(1, 'm')).toBe(1000)
  })

  test('converts inches to millimeters', () => {
    expect(convertToMm(1, 'in')).toBeCloseTo(25.4, 1)
  })

  test('converts feet to millimeters', () => {
    expect(convertToMm(1, 'ft')).toBeCloseTo(304.8, 1)
  })

  test('returns same value for millimeters', () => {
    expect(convertToMm(100, 'mm')).toBe(100)
  })
})

describe('convertAreaUnit', () => {
  test('converts mm² to m²', () => {
    expect(convertAreaUnit(1000000, 'm')).toBe(1)
  })

  test('converts mm² to cm²', () => {
    expect(convertAreaUnit(100, 'cm')).toBe(1)
  })
})
```

#### 2. Area Calculation Tests
```typescript
// src/lib/utils/__tests__/area-calculator.test.ts

import { calculateRectangleArea, calculateLShapeArea } from '../area-calculator'

describe('calculateRectangleArea', () => {
  test('calculates area correctly', () => {
    expect(calculateRectangleArea(2500, 1500)).toBe(3750000)
  })

  test('handles decimal values', () => {
    expect(calculateRectangleArea(2500.5, 1500.3)).toBeCloseTo(3751125.15, 2)
  })
})

describe('calculateLShapeArea', () => {
  test('calculates L-shape area correctly', () => {
    const dims = {
      outerLength: 5000,
      outerWidth: 3000,
      cutoutLength: 2000,
      cutoutWidth: 1500,
    }
    expect(calculateLShapeArea(dims)).toBe(12000000) // 15M - 3M
  })
})
```

#### 3. Validation Schema Tests
```typescript
// src/lib/validation/__tests__/dimensions-schema.test.ts

import { DimensionsSchema } from '../dimensions-schema'

describe('RectangleDimensionsSchema', () => {
  test('validates correct rectangle data', () => {
    const data = {
      layoutType: 'rectangle',
      length: 2500,
      width: 1500,
      unit: 'mm',
    }
    expect(() => DimensionsSchema.parse(data)).not.toThrow()
  })

  test('rejects negative dimensions', () => {
    const data = {
      layoutType: 'rectangle',
      length: -100,
      width: 1500,
      unit: 'mm',
    }
    expect(() => DimensionsSchema.parse(data)).toThrow()
  })

  test('rejects dimensions exceeding maximum', () => {
    const data = {
      layoutType: 'rectangle',
      length: 200000,
      width: 1500,
      unit: 'mm',
    }
    expect(() => DimensionsSchema.parse(data)).toThrow()
  })
})

describe('LShapeDimensionsSchema', () => {
  test('rejects cutout larger than outer dimensions', () => {
    const data = {
      layoutType: 'l-shape',
      outerLength: 5000,
      outerWidth: 3000,
      cutoutLength: 6000, // Too large
      cutoutWidth: 1500,
      cutoutOffsetX: 0,
      cutoutOffsetY: 0,
      unit: 'mm',
    }
    expect(() => DimensionsSchema.parse(data)).toThrow()
  })
})
```

---

### Integration Tests (Testing Library)

#### 1. Form Interaction Tests
```typescript
// src/components/wizard/step-1-dimensions/__tests__/DimensionForm.test.tsx

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DimensionForm } from '../DimensionForm'

describe('DimensionForm', () => {
  test('renders length and width inputs for rectangle layout', () => {
    render(<DimensionForm layoutType="rectangle" />)

    expect(screen.getByLabelText(/length/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/width/i)).toBeInTheDocument()
  })

  test('displays validation error for invalid input', async () => {
    const user = userEvent.setup()
    render(<DimensionForm layoutType="rectangle" />)

    const lengthInput = screen.getByLabelText(/length/i)
    await user.type(lengthInput, '-100')
    await user.tab() // Trigger blur validation

    await waitFor(() => {
      expect(screen.getByText(/value must be at least/i)).toBeInTheDocument()
    })
  })

  test('shows success indicator for valid input', async () => {
    const user = userEvent.setup()
    render(<DimensionForm layoutType="rectangle" />)

    const lengthInput = screen.getByLabelText(/length/i)
    await user.type(lengthInput, '2500')

    await waitFor(() => {
      expect(screen.getByText('✓')).toBeInTheDocument()
    })
  })

  test('converts values when unit changes', async () => {
    const user = userEvent.setup()
    render(<DimensionForm layoutType="rectangle" />)

    const lengthInput = screen.getByLabelText(/length/i)
    await user.type(lengthInput, '2500') // 2500 mm

    const unitSelector = screen.getByRole('combobox', { name: /unit/i })
    await user.selectOptions(unitSelector, 'cm')

    await waitFor(() => {
      expect(lengthInput).toHaveValue(250) // 2500mm = 250cm
    })
  })
})
```

#### 2. Preview Update Tests
```typescript
// src/components/wizard/step-1-dimensions/__tests__/LayoutPreview.test.tsx

import { render, screen } from '@testing-library/react'
import { LayoutPreview } from '../LayoutPreview'

describe('LayoutPreview', () => {
  test('renders placeholder when no dimensions provided', () => {
    render(<LayoutPreview dimensions={{}} />)

    expect(screen.getByText(/enter dimensions/i)).toBeInTheDocument()
  })

  test('renders SVG shape with correct dimensions', () => {
    const dimensions = {
      layoutType: 'rectangle',
      length: 2500,
      width: 1500,
      unit: 'mm',
    }

    render(<LayoutPreview dimensions={dimensions} />)

    const svg = screen.getByRole('img')
    expect(svg).toBeInTheDocument()

    expect(screen.getByText(/2500 mm/i)).toBeInTheDocument()
    expect(screen.getByText(/1500 mm/i)).toBeInTheDocument()
  })

  test('displays calculated area', () => {
    const dimensions = {
      layoutType: 'rectangle',
      length: 2500,
      width: 1500,
      unit: 'mm',
    }

    render(<LayoutPreview dimensions={dimensions} />)

    expect(screen.getByText(/area.*3,750,000/i)).toBeInTheDocument()
  })
})
```

---

### E2E Tests (Playwright)

#### Happy Path Test
```typescript
// tests/e2e/wizard-step-1.spec.ts

import { test, expect } from '@playwright/test'

test('complete dimension input flow', async ({ page }) => {
  // Navigate to Step 1
  await page.goto('/wizard/step-1')

  // Verify page title
  await expect(page.getByText(/step 1 of 4/i)).toBeVisible()

  // Fill length
  await page.getByLabel(/length/i).fill('2500')

  // Fill width
  await page.getByLabel(/width/i).fill('1500')

  // Verify preview updates
  await expect(page.locator('svg text:has-text("2500 mm")')).toBeVisible()
  await expect(page.locator('svg text:has-text("1500 mm")')).toBeVisible()

  // Verify area calculation
  await expect(page.locator('text=Area: 3,750,000')).toBeVisible()

  // Change unit to meters
  await page.selectOption('[name="unit"]', 'm')

  // Verify conversion
  await expect(page.getByLabel(/length/i)).toHaveValue('2.5')
  await expect(page.getByLabel(/width/i)).toHaveValue('1.5')

  // Click continue
  await page.click('button:has-text("Continue to Tile & Grout")')

  // Verify navigation to Step 2
  await expect(page).toHaveURL(/\/wizard\/step-2/)
})

test('validation prevents invalid submission', async ({ page }) => {
  await page.goto('/wizard/step-1')

  // Try to continue without filling fields
  const continueButton = page.getByRole('button', { name: /continue/i })
  await expect(continueButton).toBeDisabled()

  // Fill invalid value
  await page.getByLabel(/length/i).fill('-100')
  await page.getByLabel(/length/i).blur()

  // Verify error message
  await expect(page.getByText(/value must be at least/i)).toBeVisible()

  // Continue button still disabled
  await expect(continueButton).toBeDisabled()
})

test('back navigation preserves state', async ({ page }) => {
  await page.goto('/wizard/step-1')

  // Fill form
  await page.getByLabel(/length/i).fill('2500')
  await page.getByLabel(/width/i).fill('1500')

  // Go back
  await page.click('button:has-text("Back to Layout Selection")')

  // Return to Step 1
  await page.goBack()

  // Verify values preserved
  await expect(page.getByLabel(/length/i)).toHaveValue('2500')
  await expect(page.getByLabel(/width/i)).toHaveValue('1500')
})
```

---

### Accessibility Tests

```typescript
// tests/accessibility/step-1.spec.ts

import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('should not have accessibility violations', async ({ page }) => {
  await page.goto('/wizard/step-1')

  const accessibilityScanResults = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze()

  expect(accessibilityScanResults.violations).toEqual([])
})

test('keyboard navigation works correctly', async ({ page }) => {
  await page.goto('/wizard/step-1')

  // Tab through form
  await page.keyboard.press('Tab') // Back button
  await page.keyboard.press('Tab') // Length input
  await expect(page.getByLabel(/length/i)).toBeFocused()

  await page.keyboard.press('Tab') // Width input
  await expect(page.getByLabel(/width/i)).toBeFocused()

  await page.keyboard.press('Tab') // Unit selector
  await expect(page.getByRole('combobox')).toBeFocused()

  await page.keyboard.press('Tab') // Continue button
  await expect(page.getByRole('button', { name: /continue/i })).toBeFocused()
})
```

---

## Implementation Checklist

### Phase 1: Foundation
- [ ] Create TypeScript types (`src/types/dimensions.ts`)
- [ ] Set up Zod validation schemas (`src/lib/validation/dimensions-schema.ts`)
- [ ] Implement unit conversion utilities (`src/lib/utils/unit-converter.ts`)
- [ ] Implement area calculation utilities (`src/lib/utils/area-calculator.ts`)
- [ ] Implement scale calculation utilities (`src/lib/utils/scale-calculator.ts`)
- [ ] Create Zustand store slice (`src/stores/layout-store.ts`)

### Phase 2: Components
- [ ] Build `DimensionInput` component with validation states
- [ ] Build `UnitSelector` component with shadcn/ui Select
- [ ] Build `DimensionForm` component with react-hook-form integration
- [ ] Build `LayoutPreview` SVG component for rectangle
- [ ] Build `DimensionLabel` SVG component
- [ ] Build `AreaDisplay` component
- [ ] Build `ScaleIndicator` component

### Phase 3: Layout-Specific Features
- [ ] Implement square layout rendering
- [ ] Implement L-shape layout form fields
- [ ] Implement L-shape SVG rendering
- [ ] Add L-shape validation rules

### Phase 4: Integration
- [ ] Create main `Step1Dimensions` container component
- [ ] Integrate form with Zustand store
- [ ] Add Framer Motion animations
- [ ] Implement navigation controls (Back/Continue)
- [ ] Add debouncing for input and preview updates

### Phase 5: Accessibility
- [ ] Add ARIA labels and descriptions
- [ ] Implement keyboard navigation
- [ ] Add screen reader announcements
- [ ] Test with screen reader (NVDA/JAWS/VoiceOver)
- [ ] Ensure focus management
- [ ] Verify color contrast ratios

### Phase 6: Responsive Design
- [ ] Test mobile layout (320px - 767px)
- [ ] Test tablet layout (768px - 1023px)
- [ ] Test desktop layout (1024px+)
- [ ] Verify touch target sizes
- [ ] Test with actual mobile devices

### Phase 7: Error Handling
- [ ] Implement all validation error messages
- [ ] Add toast notifications for system errors
- [ ] Handle edge cases (very large/small numbers)
- [ ] Implement error recovery flows

### Phase 8: Performance
- [ ] Add debouncing for input changes
- [ ] Memoize expensive calculations
- [ ] Optimize SVG rendering
- [ ] Test with performance profiling

### Phase 9: Testing
- [ ] Write unit tests for utilities
- [ ] Write integration tests for components
- [ ] Write E2E test for happy path
- [ ] Write accessibility tests
- [ ] Achieve 80%+ code coverage

### Phase 10: Polish
- [ ] Add loading states
- [ ] Add skeleton states for preview
- [ ] Implement smooth transitions
- [ ] Add helpful tooltips
- [ ] Final UX review

---

## Success Criteria

### Functional Requirements
- [x] User can input dimensions for rectangle layout
- [x] User can input dimensions for square layout
- [x] User can input dimensions for L-shape layout
- [x] User can switch between mm/cm/m/in/ft units
- [x] SVG preview updates in real-time with dimensions
- [x] Form validates and shows errors for invalid input
- [x] All data persists to Zustand store
- [x] Navigation to next/previous steps works correctly

### Quality Requirements
- [x] Fully responsive on mobile, tablet, desktop
- [x] WCAG AA accessibility compliance
- [x] No console errors or warnings
- [x] Smooth animations on preview updates
- [x] Forms are intuitive and easy to use
- [x] Error messages are clear and helpful
- [x] Touch targets meet minimum size requirements

### Performance Requirements
- [x] Page loads in < 2 seconds
- [x] Input response time < 300ms
- [x] Preview updates smooth at 60fps
- [x] No layout shifts or jank

### Testing Requirements
- [x] Unit test coverage > 80%
- [x] All integration tests pass
- [x] E2E happy path test passes
- [x] Accessibility tests pass (zero violations)
- [x] Manual testing on real devices

---

## Notes for Implementers

### Development Order Recommendation
1. Start with basic rectangle layout (simplest case)
2. Add unit conversion and validation
3. Implement SVG preview
4. Add responsive design
5. Add accessibility features
6. Extend to square and L-shape layouts
7. Polish and optimize

### Common Pitfalls to Avoid
- Don't store dimensions in display units (always use mm internally)
- Don't forget to debounce input changes (can cause performance issues)
- Don't skip accessibility testing (use screen readers early)
- Don't hard-code canvas sizes (make responsive from start)
- Don't validate only on submit (use real-time validation)

### External Dependencies
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-hook-form": "^7.45.0",
    "zod": "^3.22.0",
    "@hookform/resolvers": "^3.3.0",
    "zustand": "^4.4.0",
    "immer": "^10.0.0",
    "framer-motion": "^10.16.0",
    "convert-units": "^2.3.4",
    "use-debounce": "^9.0.4"
  },
  "devDependencies": {
    "@testing-library/react": "^14.0.0",
    "@testing-library/user-event": "^14.5.0",
    "@playwright/test": "^1.40.0",
    "@axe-core/playwright": "^4.8.0",
    "jest": "^29.7.0"
  }
}
```

---

## Appendix

### Type Definitions

```typescript
// src/types/dimensions.ts

export type LayoutType = 'rectangle' | 'square' | 'l-shape' | 'custom'

export type MeasurementUnit = 'mm' | 'cm' | 'm' | 'in' | 'ft'

export interface Point {
  x: number
  y: number
}

export interface RectangleDimensions {
  layoutType: 'rectangle'
  length: number
  width: number
  unit: MeasurementUnit
}

export interface SquareDimensions {
  layoutType: 'square'
  sideLength: number
  unit: MeasurementUnit
}

export interface LShapeDimensions {
  layoutType: 'l-shape'
  outerLength: number
  outerWidth: number
  cutoutLength: number
  cutoutWidth: number
  cutoutOffsetX: number
  cutoutOffsetY: number
  unit: MeasurementUnit
}

export type DimensionsFormData =
  | RectangleDimensions
  | SquareDimensions
  | LShapeDimensions

export interface CanvasSize {
  width: number
  height: number
}

export interface Padding {
  top: number
  right: number
  bottom: number
  left: number
}
```

---

### Constants

```typescript
// src/lib/constants/measurement-units.ts

export const MEASUREMENT_UNITS = [
  { value: 'mm', label: 'Millimeters (mm)', shortLabel: 'mm' },
  { value: 'cm', label: 'Centimeters (cm)', shortLabel: 'cm' },
  { value: 'm', label: 'Meters (m)', shortLabel: 'm' },
  { value: 'in', label: 'Inches (in)', shortLabel: 'in' },
  { value: 'ft', label: 'Feet (ft)', shortLabel: 'ft' },
] as const

export const DIMENSION_CONSTRAINTS = {
  MIN_VALUE: 0.1,      // mm
  MAX_VALUE: 100000,   // mm
  DECIMAL_PLACES: 2,
} as const

export const CANVAS_CONFIG = {
  DEFAULT_WIDTH: 600,
  DEFAULT_HEIGHT: 600,
  MIN_WIDTH: 300,
  MIN_HEIGHT: 300,
  PADDING: {
    top: 40,
    right: 40,
    bottom: 40,
    left: 40,
  },
  GRID_SPACING: 10, // mm
} as const
```

---

## Document Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-10-16 | Technical Writer | Initial specification created |

---

**End of Specification Document**
