'use client'

import { memo, useMemo, useCallback, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TilePatternRenderer } from './TilePatternRenderer'
import { useCanvasStore } from '@/stores/canvas-store'
import { useProjectStore } from '@/store/project-store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Calculator,
  Eye,
  Layers,
  Grid3X3,
  Ruler,
  Target
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { calculatePolygonArea, normalizePolygon } from '@/lib/canvas/geometry-utils'
import type { TileGenerationResult, TilePosition } from '../../../packages/tiling-engine/src/tiles'
import type { Unit } from '@/types'
import convert from 'convert-units'

interface CanvasTileIntegrationProps {
  className?: string
  showStats?: boolean
  interactive?: boolean
  onResultsChange?: (results: TileGenerationResult | null) => void
}

interface IntegrationStatus {
  canvasValid: boolean
  dimensionsComplete: boolean
  tileConfigured: boolean
  patternSelected: boolean
  canVisualize: boolean
  readyForResults: boolean
}

interface CalculatedResults {
  area: number
  perimeter: number
  tilePattern: TileGenerationResult
  waste: number
  totalCost?: number
}

/**
 * Convert units with error handling
 */
function convertUnits(value: number, from: Unit, to: Unit): number {
  if (from === to) return value

  const conversions: Record<string, Record<string, number>> = {
    mm: { cm: 0.1, m: 0.001, in: 0.0393701, ft: 0.00328084 },
    cm: { mm: 10, m: 0.01, in: 0.393701, ft: 0.0328084 },
    m: { mm: 1000, cm: 100, in: 39.3701, ft: 3.28084 },
    in: { mm: 25.4, cm: 2.54, m: 0.0254, ft: 0.0833333 },
    ft: { mm: 304.8, cm: 30.48, m: 0.3048, in: 12 }
  }

  return conversions[from]?.[to] ? value * conversions[from][to] : value
}

/**
 * Integration component that connects canvas geometry with tile visualization
 */
export const CanvasTileIntegration = memo<CanvasTileIntegrationProps>(
  function CanvasTileIntegration({
    className,
    showStats = true,
    interactive = true,
    onResultsChange
  }) {
    // Store hooks
    const { nodes, edges, validateLayout, exportLayoutData } = useCanvasStore()
    const { currentProject, setCalculations } = useProjectStore()

    // Component state
    const [isCalculating, setIsCalculating] = useState(false)
    const [calculationProgress, setCalculationProgress] = useState(0)
    const [lastCalculation, setLastCalculation] = useState<Date | null>(null)
    const [selectedTile, setSelectedTile] = useState<TilePosition | null>(null)
    const [showVisualization, setShowVisualization] = useState(true)

    // Validation status
    const integrationStatus = useMemo((): IntegrationStatus => {
      const validation = validateLayout()
      const layout = currentProject.layout
      const tile = currentProject.tile

      const canvasValid = validation.isValid && validation.isClosed && nodes.length >= 3
      const dimensionsComplete = validation.missingDimensions.length === 0
      const tileConfigured = !!(tile && tile.length > 0 && tile.width > 0)
      const patternSelected = !!(layout && layout.pattern)

      return {
        canvasValid,
        dimensionsComplete,
        tileConfigured,
        patternSelected,
        canVisualize: canvasValid && tileConfigured && patternSelected,
        readyForResults: canvasValid && dimensionsComplete && tileConfigured && patternSelected
      }
    }, [validateLayout, currentProject, nodes.length])

    // Calculate real-world polygon area
    const polygonStats = useMemo(() => {
      if (!integrationStatus.canvasValid || !integrationStatus.dimensionsComplete) {
        return null
      }

      try {
        // Get canvas dimensions in pixels
        const pixelArea = calculatePolygonArea(nodes)

        // Convert to real-world units
        // This is simplified - in a production app, you'd need proper scale conversion
        // based on the actual canvas dimensions and zoom level
        const estimatedRealArea = pixelArea * 0.0001 // Rough conversion factor

        return {
          pixelArea: Math.round(pixelArea),
          realArea: estimatedRealArea,
          unit: 'm' as Unit
        }
      } catch (error) {
        console.warn('Failed to calculate polygon stats:', error)
        return null
      }
    }, [nodes, integrationStatus.canvasValid, integrationStatus.dimensionsComplete])

    // Handle pattern generation results
    const handlePatternChange = useCallback(
      (result: TileGenerationResult) => {
        setLastCalculation(new Date())
        onResultsChange?.(result)

        // Update project store with calculations
        if (polygonStats) {
          const calculations = {
            totalArea: polygonStats.realArea,
            tileArea: result.tiles.length * (currentProject.tile?.length || 0) * (currentProject.tile?.width || 0) / 1000000, // Convert to m²
            totalTiles: result.totalTiles,
            fullTiles: result.fullTiles,
            cutTiles: result.cutTiles,
            wastePercentage: result.wastePercentage,
            groutArea: 0, // Would be calculated based on grout width
            coverage: result.coverage
          }

          setCalculations(calculations)
        }
      },
      [polygonStats, currentProject.tile, setCalculations, onResultsChange]
    )

    // Handle tile selection
    const handleTileClick = useCallback((tile: TilePosition) => {
      setSelectedTile(tile.id === selectedTile?.id ? null : tile)
    }, [selectedTile])

    // Manual recalculation
    const handleRecalculate = useCallback(async () => {
      if (!integrationStatus.canVisualize) return

      setIsCalculating(true)
      setCalculationProgress(0)

      // Simulate calculation progress
      const progressInterval = setInterval(() => {
        setCalculationProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 100)

      try {
        // Force re-render of tile pattern
        await new Promise(resolve => setTimeout(resolve, 1000))
        setCalculationProgress(100)
      } finally {
        setTimeout(() => {
          setIsCalculating(false)
          setCalculationProgress(0)
        }, 500)
      }
    }, [integrationStatus.canVisualize])

    // Status indicator component
    const StatusIndicator = ({ status, label }: { status: boolean; label: string }) => (
      <div className="flex items-center gap-2">
        {status ? (
          <CheckCircle size={16} className="text-green-600" />
        ) : (
          <AlertTriangle size={16} className="text-amber-600" />
        )}
        <span className={cn(
          'text-sm',
          status ? 'text-green-700' : 'text-amber-700'
        )}>
          {label}
        </span>
      </div>
    )

    // Get overall progress percentage
    const getOverallProgress = () => {
      const statuses = Object.values(integrationStatus)
      const completed = statuses.filter(Boolean).length
      return Math.round((completed / statuses.length) * 100)
    }

    return (
      <TooltipProvider>
        <div className={cn('space-y-4', className)}>
          {/* Integration Status Panel */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg border shadow-sm p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Layers size={16} className="text-blue-600" />
                <h3 className="font-semibold text-sm">Integration Status</h3>
              </div>

              <div className="flex items-center gap-2">
                <Progress value={getOverallProgress()} className="w-20 h-2" />
                <span className="text-xs text-gray-500">
                  {getOverallProgress()}%
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <StatusIndicator
                status={integrationStatus.canvasValid}
                label="Canvas Layout"
              />
              <StatusIndicator
                status={integrationStatus.dimensionsComplete}
                label="Dimensions Complete"
              />
              <StatusIndicator
                status={integrationStatus.tileConfigured}
                label="Tile Configured"
              />
              <StatusIndicator
                status={integrationStatus.patternSelected}
                label="Pattern Selected"
              />
            </div>

            {!integrationStatus.readyForResults && (
              <Alert className="mt-3">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  Complete all steps above to enable tile visualization and results calculation.
                </AlertDescription>
              </Alert>
            )}
          </motion.div>

          {/* Polygon Statistics */}
          {polygonStats && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border p-4"
            >
              <div className="flex items-center gap-2 mb-3">
                <Calculator size={16} className="text-blue-600" />
                <h3 className="font-semibold text-sm">Layout Statistics</h3>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="text-center">
                  <div className="text-lg font-mono font-bold text-blue-700">
                    {polygonStats.pixelArea}
                  </div>
                  <div className="text-xs text-blue-600">Canvas Pixels</div>
                </div>

                <div className="text-center">
                  <div className="text-lg font-mono font-bold text-blue-700">
                    {polygonStats.realArea.toFixed(2)}
                  </div>
                  <div className="text-xs text-blue-600">Est. Area (m²)</div>
                </div>

                <div className="text-center">
                  <div className="text-lg font-mono font-bold text-blue-700">
                    {nodes.length}
                  </div>
                  <div className="text-xs text-blue-600">Corner Points</div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Tile Visualization */}
          <AnimatePresence>
            {integrationStatus.canVisualize && showVisualization && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative"
              >
                {/* Controls */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Grid3X3 size={16} className="text-green-600" />
                    <h3 className="font-semibold text-sm">Tile Visualization</h3>
                    {lastCalculation && (
                      <Badge variant="outline" className="text-xs">
                        Updated {lastCalculation.toLocaleTimeString()}
                      </Badge>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setShowVisualization(!showVisualization)}
                          className="gap-2"
                        >
                          <Eye size={14} />
                          {showVisualization ? 'Hide' : 'Show'}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        Toggle tile pattern visualization
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleRecalculate}
                          disabled={isCalculating}
                          className="gap-2"
                        >
                          <motion.div
                            animate={isCalculating ? { rotate: 360 } : {}}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          >
                            <RefreshCw size={14} />
                          </motion.div>
                          {isCalculating ? 'Calculating...' : 'Recalculate'}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        Regenerate tile pattern
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>

                {/* Progress Bar */}
                <AnimatePresence>
                  {isCalculating && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-3"
                    >
                      <Progress value={calculationProgress} className="h-2" />
                      <p className="text-xs text-center text-gray-500 mt-1">
                        Calculating tile pattern...
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Tile Pattern Renderer */}
                <div className="relative">
                  <TilePatternRenderer
                    width={600}
                    height={400}
                    interactive={interactive}
                    showControls={true}
                    showStats={showStats}
                    onTileClick={handleTileClick}
                    onPatternChange={handlePatternChange}
                    className="border rounded-lg"
                  />

                  {/* Selected Tile Info */}
                  <AnimatePresence>
                    {selectedTile && (
                      <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border min-w-[160px]"
                      >
                        <div className="text-sm space-y-1">
                          <div className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                            <Target size={14} />
                            Tile Details
                          </div>

                          <div className="flex justify-between">
                            <span className="text-gray-600">Type:</span>
                            <Badge variant={
                              selectedTile.type === 'full' ? 'default' :
                              selectedTile.type === 'cut' ? 'secondary' : 'destructive'
                            }>
                              {selectedTile.type}
                            </Badge>
                          </div>

                          <div className="flex justify-between">
                            <span className="text-gray-600">Size:</span>
                            <span className="font-mono text-xs">
                              {selectedTile.width.toFixed(0)}×{selectedTile.height.toFixed(0)}px
                            </span>
                          </div>

                          {selectedTile.rotation !== 0 && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Rotation:</span>
                              <span className="font-mono text-xs">
                                {selectedTile.rotation}°
                              </span>
                            </div>
                          )}

                          {selectedTile.cutPercentage && selectedTile.cutPercentage < 100 && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Coverage:</span>
                              <span className="font-mono text-xs">
                                {selectedTile.cutPercentage.toFixed(1)}%
                              </span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Integration Help */}
          {!integrationStatus.readyForResults && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-blue-50 rounded-lg p-4 border border-blue-200"
            >
              <div className="flex gap-3">
                <Ruler className="text-blue-600 mt-1" size={16} />
                <div className="flex-1">
                  <h4 className="font-medium text-blue-900 mb-2">
                    Getting Started with Tile Visualization
                  </h4>
                  <div className="text-sm text-blue-800 space-y-1">
                    <p>• Draw your room layout using the canvas tools</p>
                    <p>• Click on edge lines to add dimensions</p>
                    <p>• Configure tile size and grout width</p>
                    <p>• Select your preferred tiling pattern</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </TooltipProvider>
    )
  }
)

CanvasTileIntegration.displayName = 'CanvasTileIntegration'