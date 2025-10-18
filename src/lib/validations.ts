import { z } from 'zod'
import type { Unit, LayoutShape, LayoutPattern } from '@/types'

// Unit validation
export const unitSchema = z.enum(['mm', 'cm', 'm', 'in', 'ft']) satisfies z.ZodType<Unit>

// Layout shape validation
export const layoutShapeSchema = z.enum(['rectangle', 'l-shape', 'square', 'custom']) satisfies z.ZodType<LayoutShape>

// Layout pattern validation
export const layoutPatternSchema = z.enum(['grid', 'brick', 'herringbone']) satisfies z.ZodType<LayoutPattern>

// Dimensions schema
export const dimensionsSchema = z.object({
  length: z.number().min(0.1, 'Length must be greater than 0').max(1000, 'Length too large'),
  width: z.number().min(0.1, 'Width must be greater than 0').max(1000, 'Width too large'),
  unit: unitSchema
})

// Tile specification schema
export const tileSpecificationSchema = z.object({
  length: z.number().min(1, 'Tile length must be at least 1').max(2000, 'Tile length too large'),
  width: z.number().min(1, 'Tile width must be at least 1').max(2000, 'Tile width too large'),
  unit: unitSchema,
  groutWidth: z.number().min(0, 'Grout width cannot be negative').max(50, 'Grout width too large')
})

// Layout configuration schema
export const layoutConfigurationSchema = z.object({
  shape: layoutShapeSchema,
  dimensions: dimensionsSchema,
  pattern: layoutPatternSchema
})

// Project schema
export const projectSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Project name is required').max(100, 'Name too long'),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  layout: layoutConfigurationSchema,
  tile: tileSpecificationSchema,
  calculations: z.object({
    totalArea: z.number(),
    tileArea: z.number(),
    totalTiles: z.number(),
    fullTiles: z.number(),
    cutTiles: z.number(),
    wastePercentage: z.number(),
    groutArea: z.number(),
    coverage: z.number()
  }).optional()
})

// Form-specific schemas for wizard steps
export const layoutSelectionFormSchema = z.object({
  shape: layoutShapeSchema
})

export const dimensionsFormSchema = z.object({
  length: z.string()
    .min(1, 'Length is required')
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'Must be a valid positive number'),
  width: z.string()
    .min(1, 'Width is required')
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'Must be a valid positive number'),
  unit: unitSchema
}).transform((data) => ({
  ...data,
  length: Number(data.length),
  width: Number(data.width)
}))

export const tileSelectionFormSchema = z.object({
  length: z.string()
    .min(1, 'Tile length is required')
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'Must be a valid positive number'),
  width: z.string()
    .min(1, 'Tile width is required')
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'Must be a valid positive number'),
  unit: unitSchema,
  groutWidth: z.string()
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, 'Must be a valid non-negative number')
}).transform((data) => ({
  ...data,
  length: Number(data.length),
  width: Number(data.width),
  groutWidth: Number(data.groutWidth)
}))

export const patternSelectionFormSchema = z.object({
  pattern: layoutPatternSchema
})

export const projectNameFormSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(100, 'Name too long')
})

// Type exports for form data
export type LayoutSelectionFormData = z.infer<typeof layoutSelectionFormSchema>
export type DimensionsFormData = z.infer<typeof dimensionsFormSchema>
export type TileSelectionFormData = z.infer<typeof tileSelectionFormSchema>
export type PatternSelectionFormData = z.infer<typeof patternSelectionFormSchema>
export type ProjectNameFormData = z.infer<typeof projectNameFormSchema>
