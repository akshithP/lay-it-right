import type { Project, LayoutPattern, Unit, CustomLayoutPoint } from '@/types'
import { normalizeToMm, convertFromMm } from './unit-conversions'

interface TileCalculationResult {
  totalArea: number
  tileArea: number
  totalTiles: number
  fullTiles: number
  cutTiles: number
  wastePercentage: number
  groutArea: number
  coverage: number
}

/**
 * Calculate total area for different layout shapes
 */
export function calculateLayoutArea(project: Project): number {
  const { layout } = project

  if (!layout) return 0

  switch (layout.shape) {
    case 'rectangle':
    case 'square':
      return layout.dimensions.length * layout.dimensions.width

    case 'l-shape':
      // Simplified L-shape calculation - assume it's two rectangles
      // In a real app, you'd have more detailed L-shape configuration
      return layout.dimensions.length * layout.dimensions.width * 0.75

    case 'u-shape':
      // Simplified U-shape calculation
      return layout.dimensions.length * layout.dimensions.width * 0.8

    case 't-shape':
      // Simplified T-shape calculation
      return layout.dimensions.length * layout.dimensions.width * 0.7

    case 'custom':
      if (layout.customLayout?.points) {
        return calculatePolygonArea(layout.customLayout.points)
      }
      return 0

    default:
      return 0
  }
}

/**
 * Calculate area of a polygon using the shoelace formula
 */
export function calculatePolygonArea(points: CustomLayoutPoint[]): number {
  if (points.length < 3) return 0

  let area = 0
  const n = points.length

  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n
    area += points[i].x * points[j].y
    area -= points[j].x * points[i].y
  }

  return Math.abs(area) / 2
}

/**
 * Calculate number of tiles needed based on pattern
 */
export function calculateTilesByPattern(
  roomArea: number,
  tileLength: number,
  tileWidth: number,
  groutWidth: number,
  pattern: LayoutPattern,
  unit: Unit
): {
  totalTiles: number
  fullTiles: number
  cutTiles: number
  wastePercentage: number
} {
  // Normalize all measurements to mm for consistent calculation
  const roomAreaMm = normalizeToMm(roomArea, unit + '²' as Unit)
  const tileLengthMm = normalizeToMm(tileLength, unit)
  const tileWidthMm = normalizeToMm(tileWidth, unit)
  const groutWidthMm = normalizeToMm(groutWidth, unit)

  // Calculate effective tile size including grout
  const effectiveTileLength = tileLengthMm + groutWidthMm
  const effectiveTileWidth = tileWidthMm + groutWidthMm
  const effectiveTileArea = effectiveTileLength * effectiveTileWidth

  // Base calculation
  let baseTilesNeeded = Math.ceil(roomAreaMm / effectiveTileArea)

  // Pattern-specific adjustments
  let wastePercentage: number
  let cutTileRatio: number

  switch (pattern) {
    case 'grid':
      wastePercentage = 5 // 5% waste for grid pattern
      cutTileRatio = 0.15 // 15% of tiles will need cutting
      break

    case 'brick':
      wastePercentage = 8 // 8% waste for brick/running bond
      cutTileRatio = 0.25 // 25% of tiles will need cutting
      baseTilesNeeded *= 1.05 // Slight increase for brick pattern
      break

    case 'herringbone':
      wastePercentage = 15 // 15% waste for herringbone (most complex)
      cutTileRatio = 0.4 // 40% of tiles will need cutting
      baseTilesNeeded *= 1.15 // Significant increase for herringbone complexity
      break

    default:
      wastePercentage = 5
      cutTileRatio = 0.15
  }

  const totalTiles = Math.ceil(baseTilesNeeded * (1 + wastePercentage / 100))
  const cutTiles = Math.ceil(totalTiles * cutTileRatio)
  const fullTiles = totalTiles - cutTiles

  return {
    totalTiles,
    fullTiles,
    cutTiles,
    wastePercentage
  }
}

/**
 * Calculate grout area
 */
export function calculateGroutArea(
  roomArea: number,
  tileLength: number,
  tileWidth: number,
  groutWidth: number,
  totalTiles: number,
  unit: Unit
): number {
  // Normalize measurements
  const tileLengthMm = normalizeToMm(tileLength, unit)
  const tileWidthMm = normalizeToMm(tileWidth, unit)
  const groutWidthMm = normalizeToMm(groutWidth, unit)

  // Calculate tile area vs total area
  const singleTileArea = tileLengthMm * tileWidthMm
  const totalTileArea = singleTileArea * totalTiles

  // Convert room area to mm²
  const roomAreaMm = normalizeToMm(roomArea, unit + '²' as Unit)

  // Grout area is the difference plus additional for joint intersections
  const baseGroutArea = roomAreaMm - totalTileArea
  const jointIntersectionArea = totalTiles * (groutWidthMm * groutWidthMm)

  return Math.max(0, baseGroutArea + jointIntersectionArea)
}

/**
 * Main calculation function for complete project
 */
export function calculateProject(project: Project): TileCalculationResult | null {
  const { layout, tile } = project

  if (!layout?.dimensions || !tile) return null

  // Calculate total area
  const totalArea = calculateLayoutArea(project)

  if (totalArea <= 0) return null

  // Calculate individual tile area
  const tileArea = (tile.length / 1000) * (tile.width / 1000) // Convert mm to m for display

  // Calculate tiles needed by pattern
  const {
    totalTiles,
    fullTiles,
    cutTiles,
    wastePercentage
  } = calculateTilesByPattern(
    totalArea,
    tile.length,
    tile.width,
    tile.groutWidth,
    layout.pattern,
    layout.dimensions.unit
  )

  // Calculate grout area
  const groutArea = calculateGroutArea(
    totalArea,
    tile.length,
    tile.width,
    tile.groutWidth,
    totalTiles,
    layout.dimensions.unit
  )

  // Calculate coverage percentage
  const actualTileArea = fullTiles * tileArea
  const coverage = totalArea > 0 ? (actualTileArea / totalArea) * 100 : 0

  return {
    totalArea: Number(totalArea.toFixed(2)),
    tileArea: Number(tileArea.toFixed(6)),
    totalTiles,
    fullTiles,
    cutTiles,
    wastePercentage,
    groutArea: Number(convertFromMm(groutArea, layout.dimensions.unit).toFixed(2)),
    coverage: Number(coverage.toFixed(1))
  }
}

/**
 * Estimate project cost (basic calculation)
 */
export function estimateProjectCost(
  totalTiles: number,
  tilePrice: number,
  groutArea: number,
  groutPricePerSqM: number = 10
): {
  tileCost: number
  groutCost: number
  totalCost: number
} {
  const tileCost = totalTiles * tilePrice
  const groutCost = groutArea * groutPricePerSqM
  const totalCost = tileCost + groutCost

  return {
    tileCost: Number(tileCost.toFixed(2)),
    groutCost: Number(groutCost.toFixed(2)),
    totalCost: Number(totalCost.toFixed(2))
  }
}