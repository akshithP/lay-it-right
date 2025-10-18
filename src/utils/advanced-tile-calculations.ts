/**
 * Advanced tile calculations with real-world accuracy
 * Integrates with canvas geometry and handles unit conversions
 */

import type { Project, ProjectCalculations, Unit } from '@/types'
import type { LayoutNode, LayoutEdge } from '@/types/canvas'
import { calculatePolygonArea, calculatePolygonPerimeter } from '@/lib/canvas/geometry-utils'
import { TilePatternGenerator, type TileGenerationResult } from '../../packages/tiling-engine/src/tiles'
import convert from 'convert-units'

interface AdvancedCalculationOptions {
  includeWasteFactor: boolean
  wasteFactor?: number // Additional waste factor (default 10%)
  includeCuttingLoss: boolean
  cuttingLoss?: number // Loss due to cutting (default 5%)
  groutCalculation: boolean
  laborCost?: number // Per square unit
  tileCost?: number // Per tile or per square unit
  deliveryCost?: number
}

interface DetailedResults extends ProjectCalculations {
  // Enhanced measurements
  realWorldArea: number // Calculated from actual dimensions
  realWorldPerimeter: number
  canvasArea: number // Canvas pixel area for reference
  scaleFactor: number // Pixels per real unit

  // Advanced tile metrics
  tilesPerSquareUnit: number
  groutVolume: number // Volume of grout needed
  groutWeight?: number // If grout density provided
  surfacePreparationArea: number

  // Cost calculations
  tileCost?: number
  groutCost?: number
  laborCost?: number
  deliveryCost?: number
  totalCost?: number

  // Cutting and waste details
  cuttingComplexity: 'simple' | 'moderate' | 'complex'
  borderTiles: number
  cornerTiles: number
  fieldTiles: number

  // Quality metrics
  patternAccuracy: number // 0-100%
  layoutEfficiency: number // 0-100%
  estimatedInstallTime: number // Hours

  // Environmental
  recycledContentPercentage?: number
  carbonFootprint?: number
}

/**
 * Enhanced unit conversion with validation
 */
function convertUnits(value: number, from: Unit, to: Unit): number {
  if (from === to) return value

  // Define conversion factors
  const conversions: Record<Unit, Record<Unit, number>> = {
    mm: {
      cm: 0.1,
      m: 0.001,
      in: 0.0393701,
      ft: 0.00328084
    },
    cm: {
      mm: 10,
      m: 0.01,
      in: 0.393701,
      ft: 0.0328084
    },
    m: {
      mm: 1000,
      cm: 100,
      in: 39.3701,
      ft: 3.28084
    },
    in: {
      mm: 25.4,
      cm: 2.54,
      m: 0.0254,
      ft: 0.0833333
    },
    ft: {
      mm: 304.8,
      cm: 30.48,
      m: 0.3048,
      in: 12
    }
  }

  const factor = conversions[from]?.[to]
  if (factor) {
    return value * factor
  }

  // Fallback to convert-units library
  try {
    return convert(value).from(from as any).to(to as any)
  } catch (error) {
    console.warn(`Unit conversion failed: ${from} to ${to}`, error)
    return value
  }
}

/**
 * Calculate real-world dimensions from canvas geometry
 */
function calculateRealWorldDimensions(
  nodes: LayoutNode[],
  edges: LayoutEdge[]
): {
  area: number
  perimeter: number
  scaleFactor: number
  unit: Unit
} | null {
  if (nodes.length < 3 || edges.length === 0) return null

  try {
    // Calculate canvas dimensions
    const canvasArea = calculatePolygonArea(nodes)
    const canvasPerimeter = calculatePolygonPerimeter(nodes)

    // Find edges with dimensions to establish scale
    const dimensionedEdges = edges.filter(edge => edge.data.dimension && edge.data.dimension > 0)
    if (dimensionedEdges.length === 0) return null

    // Calculate scale factors from multiple edges for accuracy
    const scaleFactors: number[] = []
    const units: Unit[] = []

    for (const edge of dimensionedEdges) {
      // Find the corresponding nodes
      const sourceNode = nodes.find(node => node.id === edge.source)
      const targetNode = nodes.find(node => node.id === edge.target)

      if (!sourceNode || !targetNode || !edge.data.dimension) continue

      // Calculate pixel length of this edge
      const pixelLength = Math.sqrt(
        Math.pow(targetNode.position.x - sourceNode.position.x, 2) +
        Math.pow(targetNode.position.y - sourceNode.position.y, 2)
      )

      if (pixelLength > 0) {
        const scaleFactor = pixelLength / edge.data.dimension
        scaleFactors.push(scaleFactor)
        units.push(edge.data.unit)
      }
    }

    if (scaleFactors.length === 0) return null

    // Use average scale factor for better accuracy
    const avgScaleFactor = scaleFactors.reduce((sum, factor) => sum + factor, 0) / scaleFactors.length

    // Use the most common unit
    const primaryUnit = units[0] // Simplification - could be more sophisticated

    // Convert canvas measurements to real-world
    const realArea = canvasArea / (avgScaleFactor * avgScaleFactor)
    const realPerimeter = canvasPerimeter / avgScaleFactor

    return {
      area: realArea,
      perimeter: realPerimeter,
      scaleFactor: avgScaleFactor,
      unit: primaryUnit
    }
  } catch (error) {
    console.error('Failed to calculate real-world dimensions:', error)
    return null
  }
}

/**
 * Analyze cutting complexity based on polygon shape
 */
function analyzeCuttingComplexity(
  nodes: LayoutNode[],
  tileResult: TileGenerationResult
): {
  complexity: 'simple' | 'moderate' | 'complex'
  borderTiles: number
  cornerTiles: number
  fieldTiles: number
} {
  const cutTiles = tileResult.cutTiles
  const totalTiles = tileResult.totalTiles

  // Simple heuristics based on cut tile ratio
  const cutRatio = cutTiles / totalTiles

  let complexity: 'simple' | 'moderate' | 'complex' = 'simple'
  if (cutRatio > 0.4) {
    complexity = 'complex'
  } else if (cutRatio > 0.2) {
    complexity = 'moderate'
  }

  // Estimate tile types (simplified calculation)
  const cornerTiles = nodes.length // Approximate corners
  const borderTiles = Math.max(0, cutTiles - cornerTiles)
  const fieldTiles = tileResult.fullTiles

  return {
    complexity,
    borderTiles,
    cornerTiles,
    fieldTiles
  }
}

/**
 * Calculate grout requirements
 */
function calculateGroutRequirements(
  area: number,
  tile: { length: number; width: number; groutWidth: number; unit: Unit },
  targetUnit: Unit
): {
  volume: number
  surfaceArea: number
  weight?: number
} {
  // Convert tile dimensions to target unit
  const tileLength = convertUnits(tile.length, tile.unit, targetUnit)
  const tileWidth = convertUnits(tile.width, tile.unit, targetUnit)
  const groutWidth = convertUnits(tile.groutWidth, tile.unit, targetUnit)

  // Calculate grout surface area as percentage of total area
  const tileArea = tileLength * tileWidth
  const groutArea = (tileLength + tileWidth + 2 * groutWidth) * groutWidth

  const groutRatio = groutArea / (tileArea + groutArea)
  const totalGroutArea = area * groutRatio

  // Estimate grout volume (assuming 3mm depth)
  const groutDepth = convertUnits(3, 'mm', targetUnit)
  const groutVolume = totalGroutArea * groutDepth

  return {
    volume: groutVolume,
    surfaceArea: totalGroutArea,
    // Weight calculation would require grout density
  }
}

/**
 * Estimate installation time
 */
function estimateInstallationTime(
  area: number,
  complexity: 'simple' | 'moderate' | 'complex',
  pattern: string
): number {
  // Base rates (square meters per hour)
  const baseRates = {
    simple: 3.0,
    moderate: 2.0,
    complex: 1.0
  }

  // Pattern multipliers
  const patternMultipliers: Record<string, number> = {
    grid: 1.0,
    brick: 1.2,
    herringbone: 1.8
  }

  const baseRate = baseRates[complexity]
  const patternMultiplier = patternMultipliers[pattern] || 1.0

  const adjustedRate = baseRate / patternMultiplier
  return area / adjustedRate
}

/**
 * Advanced project calculation with enhanced accuracy
 */
export function calculateAdvancedProject(
  project: Project,
  nodes: LayoutNode[],
  edges: LayoutEdge[],
  tileResult: TileGenerationResult,
  options: AdvancedCalculationOptions = {
    includeWasteFactor: true,
    wasteFactor: 0.10,
    includeCuttingLoss: true,
    cuttingLoss: 0.05,
    groutCalculation: true
  }
): DetailedResults | null {
  const { layout, tile } = project

  if (!layout || !tile) {
    throw new Error('Project must have layout and tile configuration')
  }

  // Calculate real-world dimensions
  const realDimensions = calculateRealWorldDimensions(nodes, edges)
  if (!realDimensions) {
    throw new Error('Unable to determine real-world scale from canvas dimensions')
  }

  // Basic calculations
  const canvasArea = calculatePolygonArea(nodes)
  const tileArea = convertUnits(tile.length * tile.width, tile.unit, realDimensions.unit)

  // Cutting complexity analysis
  const cuttingAnalysis = analyzeCuttingComplexity(nodes, tileResult)

  // Grout calculations
  const groutRequirements = options.groutCalculation
    ? calculateGroutRequirements(realDimensions.area, tile, realDimensions.unit)
    : { volume: 0, surfaceArea: 0 }

  // Enhanced waste calculation
  let totalWaste = tileResult.wastePercentage / 100

  if (options.includeWasteFactor) {
    totalWaste += options.wasteFactor || 0.10
  }

  if (options.includeCuttingLoss) {
    totalWaste += options.cuttingLoss || 0.05
  }

  const adjustedTotalTiles = Math.ceil(tileResult.totalTiles * (1 + totalWaste))

  // Installation time estimate
  const installTime = estimateInstallationTime(
    realDimensions.area,
    cuttingAnalysis.complexity,
    layout.pattern
  )

  // Cost calculations
  let tileCost = 0
  let groutCost = 0
  let laborCost = 0
  let totalCost = 0

  if (options.tileCost) {
    tileCost = adjustedTotalTiles * options.tileCost
  }

  if (options.laborCost) {
    laborCost = realDimensions.area * options.laborCost
  }

  totalCost = tileCost + groutCost + laborCost + (options.deliveryCost || 0)

  // Quality metrics
  const patternAccuracy = Math.max(0, 100 - tileResult.wastePercentage)
  const layoutEfficiency = (tileResult.fullTiles / tileResult.totalTiles) * 100

  // Tiles per square unit
  const tilesPerSquareUnit = tileResult.totalTiles / realDimensions.area

  const results: DetailedResults = {
    // Basic ProjectCalculations
    totalArea: realDimensions.area,
    tileArea,
    totalTiles: adjustedTotalTiles,
    fullTiles: tileResult.fullTiles,
    cutTiles: tileResult.cutTiles,
    wastePercentage: totalWaste * 100,
    groutArea: groutRequirements.surfaceArea,
    coverage: tileResult.coverage,

    // Enhanced measurements
    realWorldArea: realDimensions.area,
    realWorldPerimeter: realDimensions.perimeter,
    canvasArea,
    scaleFactor: realDimensions.scaleFactor,

    // Advanced metrics
    tilesPerSquareUnit,
    groutVolume: groutRequirements.volume,
    surfacePreparationArea: realDimensions.area * 1.05, // 5% extra for prep

    // Cost breakdown
    tileCost: tileCost || undefined,
    groutCost: groutCost || undefined,
    laborCost: laborCost || undefined,
    deliveryCost: options.deliveryCost,
    totalCost: totalCost || undefined,

    // Cutting details
    cuttingComplexity: cuttingAnalysis.complexity,
    borderTiles: cuttingAnalysis.borderTiles,
    cornerTiles: cuttingAnalysis.cornerTiles,
    fieldTiles: cuttingAnalysis.fieldTiles,

    // Quality metrics
    patternAccuracy,
    layoutEfficiency,
    estimatedInstallTime: installTime
  }

  return results
}

/**
 * Generate shopping list from calculations
 */
export function generateShoppingList(
  results: DetailedResults,
  tile: { length: number; width: number; unit: Unit }
): {
  tiles: { quantity: number; unit: string; description: string }
  grout: { quantity: number; unit: string; description: string }
  accessories: Array<{ item: string; quantity: number; unit: string }>
} {
  const tileDescription = `${tile.length}×${tile.width}${tile.unit} tiles`

  const accessories = [
    {
      item: 'Tile spacers',
      quantity: Math.ceil(results.totalTiles / 100), // Packs of spacers
      unit: 'pack'
    },
    {
      item: 'Tile adhesive',
      quantity: Math.ceil(results.realWorldArea / 5), // 5m² per bag typically
      unit: 'bag'
    },
    {
      item: 'Grout sealer',
      quantity: Math.ceil(results.realWorldArea / 20), // Coverage varies
      unit: 'liter'
    }
  ]

  // Add cutting tools for complex jobs
  if (results.cuttingComplexity === 'complex') {
    accessories.push({
      item: 'Tile cutting discs',
      quantity: Math.ceil(results.cutTiles / 50),
      unit: 'piece'
    })
  }

  return {
    tiles: {
      quantity: results.totalTiles,
      unit: 'piece',
      description: tileDescription
    },
    grout: {
      quantity: Math.ceil(results.groutVolume * 1000), // Convert to grams/ml
      unit: 'kg',
      description: 'Tile grout'
    },
    accessories
  }
}

/**
 * Export detailed report
 */
export function generateDetailedReport(
  project: Project,
  results: DetailedResults
): {
  summary: string
  details: Record<string, any>
  recommendations: string[]
  warnings: string[]
} {
  const recommendations: string[] = []
  const warnings: string[] = []

  // Generate recommendations
  if (results.wastePercentage > 20) {
    recommendations.push('Consider simplifying the layout to reduce waste')
  }

  if (results.cuttingComplexity === 'complex') {
    recommendations.push('Consider professional installation due to cutting complexity')
    recommendations.push('Rent or buy a high-quality tile cutter')
  }

  if (results.layoutEfficiency < 70) {
    recommendations.push('Review tile size and pattern for better efficiency')
  }

  // Generate warnings
  if (results.cutTiles / results.totalTiles > 0.5) {
    warnings.push('High number of cut tiles - double-check measurements')
  }

  if (results.estimatedInstallTime > 16) {
    warnings.push('Installation may require multiple days')
  }

  const summary = `
Project: ${project.name}
Total area: ${results.realWorldArea.toFixed(2)} m²
Tiles needed: ${results.totalTiles} pieces
Estimated waste: ${results.wastePercentage.toFixed(1)}%
Installation time: ${results.estimatedInstallTime.toFixed(1)} hours
Complexity: ${results.cuttingComplexity}
  `.trim()

  return {
    summary,
    details: results,
    recommendations,
    warnings
  }
}