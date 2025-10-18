/**
 * Tiling Engine - Advanced tile pattern generation and calculation
 * Supports Grid, Brick/Running Bond, and Herringbone patterns with clipping
 */

import type { LayoutNode } from '@/types/canvas'
import type { LayoutPattern, TileSpecification, Unit } from '@/types'
import { pointInPolygon, normalizePolygon } from '@/lib/canvas/geometry-utils'
import convert from 'convert-units'

export interface TilePosition {
  x: number
  y: number
  width: number
  height: number
  rotation: number // in degrees
  type: 'full' | 'cut' | 'partial'
  cutPercentage?: number
  id: string
}

export interface TileGenerationResult {
  tiles: TilePosition[]
  fullTiles: number
  cutTiles: number
  totalTiles: number
  wastePercentage: number
  coverage: number
  pattern: LayoutPattern
  boundingBox: {
    minX: number
    minY: number
    maxX: number
    maxY: number
    width: number
    height: number
  }
}

export interface TilePatternConfig {
  tile: TileSpecification
  pattern: LayoutPattern
  targetWidth: number
  targetHeight: number
  margin: number
  resolution: number // pixels per unit for accuracy
}

/**
 * Convert measurement from one unit to another
 */
function convertUnits(value: number, from: Unit, to: Unit): number {
  if (from === to) return value

  // Handle metric conversions
  if (from === 'mm' && to === 'cm') return value / 10
  if (from === 'cm' && to === 'mm') return value * 10
  if (from === 'm' && to === 'cm') return value * 100
  if (from === 'cm' && to === 'm') return value / 100
  if (from === 'm' && to === 'mm') return value * 1000
  if (from === 'mm' && to === 'm') return value / 1000

  // Handle imperial conversions
  if (from === 'in' && to === 'ft') return value / 12
  if (from === 'ft' && to === 'in') return value * 12

  // Cross conversions (metric to imperial)
  try {
    return convert(value).from(from as any).to(to as any)
  } catch {
    console.warn(`Unit conversion failed: ${from} to ${to}`)
    return value
  }
}

/**
 * Calculate tile dimensions in pixels based on canvas resolution
 */
function calculateTilePixelDimensions(
  tile: TileSpecification,
  targetUnit: Unit,
  pixelsPerUnit: number
): { width: number; height: number; groutWidth: number } {
  const tileWidth = convertUnits(tile.width, tile.unit, targetUnit) * pixelsPerUnit
  const tileHeight = convertUnits(tile.length, tile.unit, targetUnit) * pixelsPerUnit
  const groutWidth = convertUnits(tile.groutWidth, tile.unit, targetUnit) * pixelsPerUnit

  return {
    width: tileWidth,
    height: tileHeight,
    groutWidth
  }
}

/**
 * Generate grid pattern tiles
 */
function generateGridPattern(config: TilePatternConfig): TilePosition[] {
  const { tile, targetWidth, targetHeight, margin } = config
  const { width: tileWidth, height: tileHeight, groutWidth } =
    calculateTilePixelDimensions(tile, 'm', 100) // 100 pixels per meter

  const tiles: TilePosition[] = []
  const effectiveTileWidth = tileWidth + groutWidth
  const effectiveTileHeight = tileHeight + groutWidth

  const cols = Math.ceil((targetWidth - 2 * margin) / effectiveTileWidth)
  const rows = Math.ceil((targetHeight - 2 * margin) / effectiveTileHeight)

  let tileId = 0

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = margin + col * effectiveTileWidth
      const y = margin + row * effectiveTileHeight

      tiles.push({
        x,
        y,
        width: tileWidth,
        height: tileHeight,
        rotation: 0,
        type: 'full',
        id: `grid-${tileId++}`
      })
    }
  }

  return tiles
}

/**
 * Generate brick/running bond pattern tiles
 */
function generateBrickPattern(config: TilePatternConfig): TilePosition[] {
  const { tile, targetWidth, targetHeight, margin } = config
  const { width: tileWidth, height: tileHeight, groutWidth } =
    calculateTilePixelDimensions(tile, 'm', 100)

  const tiles: TilePosition[] = []
  const effectiveTileWidth = tileWidth + groutWidth
  const effectiveTileHeight = tileHeight + groutWidth

  const cols = Math.ceil((targetWidth - 2 * margin) / effectiveTileWidth) + 1 // Extra for offset
  const rows = Math.ceil((targetHeight - 2 * margin) / effectiveTileHeight)

  let tileId = 0

  for (let row = 0; row < rows; row++) {
    const offset = (row % 2) * (effectiveTileWidth / 2) // Offset every other row

    for (let col = 0; col < cols; col++) {
      const x = margin + col * effectiveTileWidth + offset
      const y = margin + row * effectiveTileHeight

      // Skip tiles that would be completely outside the bounds
      if (x >= targetWidth - margin) continue

      tiles.push({
        x,
        y,
        width: tileWidth,
        height: tileHeight,
        rotation: 0,
        type: 'full',
        id: `brick-${tileId++}`
      })
    }
  }

  return tiles
}

/**
 * Generate herringbone pattern tiles
 */
function generateHerringbonePattern(config: TilePatternConfig): TilePosition[] {
  const { tile, targetWidth, targetHeight, margin } = config
  const { width: tileWidth, height: tileHeight, groutWidth } =
    calculateTilePixelDimensions(tile, 'm', 100)

  const tiles: TilePosition[] = []
  const effectiveTileWidth = tileWidth + groutWidth
  const effectiveTileHeight = tileHeight + groutWidth

  // Herringbone uses pairs of tiles in V-shape
  const pairWidth = Math.max(effectiveTileWidth, effectiveTileHeight)
  const pairHeight = Math.max(effectiveTileWidth, effectiveTileHeight)

  const cols = Math.ceil((targetWidth - 2 * margin) / pairWidth)
  const rows = Math.ceil((targetHeight - 2 * margin) / pairHeight)

  let tileId = 0

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const baseX = margin + col * pairWidth
      const baseY = margin + row * pairHeight

      // First tile (horizontal)
      tiles.push({
        x: baseX,
        y: baseY,
        width: tileWidth,
        height: tileHeight,
        rotation: 0,
        type: 'full',
        id: `herringbone-${tileId++}`
      })

      // Second tile (vertical, forming L-shape)
      tiles.push({
        x: baseX,
        y: baseY + effectiveTileHeight,
        width: tileHeight, // Swapped for 90° rotation
        height: tileWidth,
        rotation: 90,
        type: 'full',
        id: `herringbone-${tileId++}`
      })
    }
  }

  return tiles
}

/**
 * Clip tiles to polygon shape and determine cut status
 */
function clipTilesToPolygon(tiles: TilePosition[], polygonNodes: LayoutNode[]): TilePosition[] {
  if (polygonNodes.length < 3) return tiles

  return tiles
    .map(tile => {
      const corners = [
        { x: tile.x, y: tile.y },
        { x: tile.x + tile.width, y: tile.y },
        { x: tile.x + tile.width, y: tile.y + tile.height },
        { x: tile.x, y: tile.y + tile.height }
      ]

      const cornersInside = corners.filter(corner => pointInPolygon(corner, polygonNodes))
      const insideCount = cornersInside.length

      if (insideCount === 0) {
        // Check if polygon intersects tile (tile might be larger than polygon)
        const tileCenter = {
          x: tile.x + tile.width / 2,
          y: tile.y + tile.height / 2
        }

        if (!pointInPolygon(tileCenter, polygonNodes)) {
          return null // Tile is completely outside
        }
      }

      let tileType: 'full' | 'cut' | 'partial' = 'full'
      let cutPercentage = 100

      if (insideCount === 4) {
        tileType = 'full'
        cutPercentage = 100
      } else if (insideCount > 0) {
        tileType = 'cut'
        cutPercentage = (insideCount / 4) * 100
      } else {
        tileType = 'partial'
        cutPercentage = 25 // Estimate for intersection
      }

      return {
        ...tile,
        type: tileType,
        cutPercentage
      }
    })
    .filter((tile): tile is TilePosition => tile !== null)
}

/**
 * Calculate waste percentage and statistics
 */
function calculateTileStatistics(tiles: TilePosition[]): {
  fullTiles: number
  cutTiles: number
  totalTiles: number
  wastePercentage: number
  coverage: number
} {
  const fullTiles = tiles.filter(tile => tile.type === 'full').length
  const cutTiles = tiles.filter(tile => tile.type === 'cut' || tile.type === 'partial').length
  const totalTiles = tiles.length

  const totalCoverage = tiles.reduce((sum, tile) => {
    return sum + (tile.cutPercentage || 100)
  }, 0)

  const averageCoverage = totalTiles > 0 ? totalCoverage / totalTiles : 0
  const wastePercentage = Math.max(0, 100 - averageCoverage)

  return {
    fullTiles,
    cutTiles,
    totalTiles,
    wastePercentage,
    coverage: averageCoverage
  }
}

/**
 * Main tile pattern generator class
 */
export class TilePatternGenerator {
  private config: TilePatternConfig

  constructor(config: TilePatternConfig) {
    this.config = config
  }

  /**
   * Generate tiles for the specified pattern
   */
  generatePattern(polygonNodes?: LayoutNode[]): TileGenerationResult {
    let tiles: TilePosition[] = []

    // Generate base pattern
    switch (this.config.pattern) {
      case 'grid':
        tiles = generateGridPattern(this.config)
        break
      case 'brick':
        tiles = generateBrickPattern(this.config)
        break
      case 'herringbone':
        tiles = generateHerringbonePattern(this.config)
        break
      default:
        throw new Error(`Unsupported pattern: ${this.config.pattern}`)
    }

    // Clip to polygon if provided
    if (polygonNodes && polygonNodes.length >= 3) {
      tiles = clipTilesToPolygon(tiles, polygonNodes)
    }

    // Calculate statistics
    const statistics = calculateTileStatistics(tiles)

    // Calculate bounding box
    const boundingBox = this.calculateBoundingBox(tiles)

    return {
      tiles,
      ...statistics,
      pattern: this.config.pattern,
      boundingBox
    }
  }

  /**
   * Update pattern configuration
   */
  updateConfig(updates: Partial<TilePatternConfig>): void {
    this.config = { ...this.config, ...updates }
  }

  /**
   * Calculate bounding box of all tiles
   */
  private calculateBoundingBox(tiles: TilePosition[]): TileGenerationResult['boundingBox'] {
    if (tiles.length === 0) {
      return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 }
    }

    let minX = tiles[0].x
    let minY = tiles[0].y
    let maxX = tiles[0].x + tiles[0].width
    let maxY = tiles[0].y + tiles[0].height

    for (const tile of tiles) {
      minX = Math.min(minX, tile.x)
      minY = Math.min(minY, tile.y)
      maxX = Math.max(maxX, tile.x + tile.width)
      maxY = Math.max(maxY, tile.y + tile.height)
    }

    return {
      minX,
      minY,
      maxX,
      maxY,
      width: maxX - minX,
      height: maxY - minY
    }
  }

  /**
   * Get tile count for purchasing calculation
   */
  getTileCountForPurchase(): number {
    const result = this.generatePattern()

    // Add 10% buffer for breakage and cuts
    const bufferMultiplier = 1.1
    const tilesNeeded = Math.ceil(result.totalTiles * bufferMultiplier)

    return tilesNeeded
  }

  /**
   * Export pattern data for visualization
   */
  exportForVisualization(polygonNodes?: LayoutNode[]): {
    tiles: TilePosition[]
    pattern: LayoutPattern
    config: TilePatternConfig
  } {
    const result = this.generatePattern(polygonNodes)

    return {
      tiles: result.tiles,
      pattern: this.config.pattern,
      config: this.config
    }
  }
}

/**
 * Factory function to create pattern generator
 */
export function createTilePatternGenerator(
  tile: TileSpecification,
  pattern: LayoutPattern,
  canvasWidth: number,
  canvasHeight: number,
  options: {
    margin?: number
    resolution?: number
  } = {}
): TilePatternGenerator {
  const config: TilePatternConfig = {
    tile,
    pattern,
    targetWidth: canvasWidth,
    targetHeight: canvasHeight,
    margin: options.margin || 20,
    resolution: options.resolution || 100
  }

  return new TilePatternGenerator(config)
}