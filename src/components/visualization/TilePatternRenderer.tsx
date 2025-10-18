'use client'

import { memo, useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { Stage, Layer, Group, Rect, Line, Circle, Text } from 'react-konva'
import { motion } from 'framer-motion'
import { ZoomIn, ZoomOut, RotateCcw, Eye, EyeOff, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { useCanvasStore } from '@/stores/canvas-store'
import { useProjectStore } from '@/store/project-store'
import {
  TilePatternGenerator,
  createTilePatternGenerator,
  type TilePosition,
  type TileGenerationResult
} from '../../../packages/tiling-engine/src/tiles'
import { normalizePolygon } from '@/lib/canvas/geometry-utils'
import type { LayoutNode } from '@/types/canvas'
import type { LayoutPattern, TileSpecification } from '@/types'

interface TilePatternRendererProps {
  width: number
  height: number
  className?: string
  interactive?: boolean
  showControls?: boolean
  showStats?: boolean
  onTileClick?: (tile: TilePosition) => void
  onPatternChange?: (result: TileGenerationResult) => void
}

interface ViewportState {
  scale: number
  x: number
  y: number
}

interface RenderOptions {
  showGrid: boolean
  showTileNumbers: boolean
  showCutTiles: boolean
  highlightFullTiles: boolean
  animatePattern: boolean
}

export const TilePatternRenderer = memo<TilePatternRendererProps>(function TilePatternRenderer({
  width,
  height,
  className,
  interactive = true,
  showControls = true,
  showStats = true,
  onTileClick,
  onPatternChange
}) {
  // Stores
  const { nodes, edges, validateLayout } = useCanvasStore()
  const { currentProject } = useProjectStore()

  // Viewport and rendering state
  const [viewport, setViewport] = useState<ViewportState>({ scale: 1, x: 0, y: 0 })
  const [options, setOptions] = useState<RenderOptions>({
    showGrid: true,
    showTileNumbers: false,
    showCutTiles: true,
    highlightFullTiles: true,
    animatePattern: false
  })
  const [isRendering, setIsRendering] = useState(false)
  const [selectedTile, setSelectedTile] = useState<string | null>(null)

  const stageRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Generate tile pattern
  const patternResult = useMemo((): TileGenerationResult | null => {
    if (!currentProject.tile || !currentProject.layout?.pattern) {
      return null
    }

    try {
      const generator = createTilePatternGenerator(
        currentProject.tile,
        currentProject.layout.pattern,
        width,
        height,
        { margin: 20, resolution: 100 }
      )

      const validation = validateLayout()
      const polygonNodes = validation.isValid && validation.isClosed ? nodes : undefined

      const result = generator.generatePattern(polygonNodes)

      // Notify parent component
      onPatternChange?.(result)

      return result
    } catch (error) {
      console.error('Failed to generate tile pattern:', error)
      return null
    }
  }, [currentProject.tile, currentProject.layout?.pattern, width, height, nodes, validateLayout, onPatternChange])

  // Normalize polygon points for rendering
  const normalizedPolygon = useMemo(() => {
    const validation = validateLayout()
    if (!validation.isValid || !validation.isClosed) {
      return []
    }

    return normalizePolygon(nodes, width, height, 20)
  }, [nodes, width, height, validateLayout])

  // Handle tile interactions
  const handleTileClick = useCallback((tile: TilePosition) => {
    if (!interactive) return

    setSelectedTile(tile.id === selectedTile ? null : tile.id)
    onTileClick?.(tile)

    // Haptic feedback on mobile
    if ('vibrate' in navigator) {
      navigator.vibrate(25)
    }
  }, [interactive, selectedTile, onTileClick])

  // Viewport controls
  const handleZoomIn = useCallback(() => {
    setViewport(prev => ({ ...prev, scale: Math.min(prev.scale * 1.2, 3) }))
  }, [])

  const handleZoomOut = useCallback(() => {
    setViewport(prev => ({ ...prev, scale: Math.max(prev.scale / 1.2, 0.1) }))
  }, [])

  const handleReset = useCallback(() => {
    setViewport({ scale: 1, x: 0, y: 0 })
    setSelectedTile(null)
  }, [])

  const handleWheel = useCallback((e: any) => {
    if (!interactive) return

    e.evt.preventDefault()

    const scaleBy = 1.02
    const stage = e.target.getStage()
    const oldScale = stage.scaleX()
    const mousePointTo = {
      x: stage.getPointerPosition().x / oldScale - stage.x() / oldScale,
      y: stage.getPointerPosition().y / oldScale - stage.y() / oldScale
    }

    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy
    const boundedScale = Math.max(0.1, Math.min(3, newScale))

    setViewport({
      scale: boundedScale,
      x: -(mousePointTo.x - stage.getPointerPosition().x / boundedScale) * boundedScale,
      y: -(mousePointTo.y - stage.getPointerPosition().y / boundedScale) * boundedScale
    })
  }, [interactive])

  // Export functionality
  const handleExport = useCallback(() => {
    if (!stageRef.current) return

    try {
      const dataURL = stageRef.current.toDataURL({ mimeType: 'image/png', quality: 1 })
      const link = document.createElement('a')
      link.download = `${currentProject.name || 'tile-pattern'}.png`
      link.href = dataURL
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Export failed:', error)
    }
  }, [currentProject.name])

  // Responsive adjustments
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && stageRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect()
        stageRef.current.width(containerRect.width)
        stageRef.current.height(containerRect.height)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Render tile shapes
  const renderTiles = () => {
    if (!patternResult) return null

    return patternResult.tiles.map((tile, index) => {
      const isSelected = selectedTile === tile.id
      const isCut = tile.type === 'cut' || tile.type === 'partial'
      const isHighlighted = options.highlightFullTiles && tile.type === 'full'

      // Skip cut tiles if option is disabled
      if (isCut && !options.showCutTiles) return null

      return (
        <Group key={tile.id}>
          {/* Tile rectangle */}
          <Rect
            x={tile.x}
            y={tile.y}
            width={tile.width}
            height={tile.height}
            rotation={tile.rotation}
            fill={
              isSelected ? '#3b82f6' :
              isCut ? '#f59e0b' :
              isHighlighted ? '#10b981' :
              '#e5e7eb'
            }
            stroke={
              isSelected ? '#1e40af' :
              isCut ? '#d97706' :
              '#9ca3af'
            }
            strokeWidth={isSelected ? 2 : 1}
            opacity={
              isCut ? (tile.cutPercentage || 50) / 100 :
              options.animatePattern ? 0.8 : 1
            }
            onClick={() => handleTileClick(tile)}
            onTap={() => handleTileClick(tile)}
            listening={interactive}
            perfectDrawEnabled={false} // Performance optimization
          />

          {/* Tile number */}
          {options.showTileNumbers && (
            <Text
              x={tile.x + tile.width / 2}
              y={tile.y + tile.height / 2}
              text={String(index + 1)}
              fontSize={Math.min(tile.width, tile.height) / 4}
              fill={isSelected ? '#ffffff' : '#4b5563'}
              align="center"
              verticalAlign="middle"
              offsetX={0}
              offsetY={5}
              listening={false}
            />
          )}

          {/* Cut percentage indicator */}
          {isCut && tile.cutPercentage && tile.cutPercentage < 100 && (
            <Text
              x={tile.x + tile.width - 2}
              y={tile.y + 2}
              text={`${Math.round(tile.cutPercentage)}%`}
              fontSize={10}
              fill="#dc2626"
              align="right"
              listening={false}
            />
          )}
        </Group>
      )
    })
  }

  // Render polygon clipping mask
  const renderPolygonMask = () => {
    if (normalizedPolygon.length < 3) return null

    const points = normalizedPolygon.flatMap(point => [point.x, point.y])

    return (
      <Group>
        {/* Polygon outline */}
        <Line
          points={[...points, points[0], points[1]]} // Close the polygon
          stroke="#1e40af"
          strokeWidth={2}
          dash={[5, 5]}
          listening={false}
        />

        {/* Polygon vertices */}
        {normalizedPolygon.map((point, index) => (
          <Circle
            key={index}
            x={point.x}
            y={point.y}
            radius={4}
            fill="#1e40af"
            stroke="#ffffff"
            strokeWidth={2}
            listening={false}
          />
        ))}
      </Group>
    )
  }

  // Render grid lines
  const renderGrid = () => {
    if (!options.showGrid) return null

    const gridLines: JSX.Element[] = []
    const gridSize = 50 * viewport.scale
    const startX = Math.floor(viewport.x / gridSize) * gridSize
    const startY = Math.floor(viewport.y / gridSize) * gridSize

    // Vertical lines
    for (let x = startX; x < width + Math.abs(viewport.x); x += gridSize) {
      gridLines.push(
        <Line
          key={`v-${x}`}
          points={[x, 0, x, height]}
          stroke="#e5e7eb"
          strokeWidth={0.5}
          opacity={0.5}
          listening={false}
        />
      )
    }

    // Horizontal lines
    for (let y = startY; y < height + Math.abs(viewport.y); y += gridSize) {
      gridLines.push(
        <Line
          key={`h-${y}`}
          points={[0, y, width, y]}
          stroke="#e5e7eb"
          strokeWidth={0.5}
          opacity={0.5}
          listening={false}
        />
      )
    }

    return <>{gridLines}</>
  }

  return (
    <TooltipProvider>
      <div
        ref={containerRef}
        className={cn(
          'relative bg-white rounded-lg border shadow-sm overflow-hidden',
          className
        )}
        role="img"
        aria-label="Tile pattern visualization"
      >
        {/* Konva Stage */}
        <Stage
          ref={stageRef}
          width={width}
          height={height}
          scaleX={viewport.scale}
          scaleY={viewport.scale}
          x={viewport.x}
          y={viewport.y}
          onWheel={handleWheel}
          draggable={interactive}
          onDragEnd={(e) => {
            if (interactive) {
              setViewport(prev => ({
                ...prev,
                x: e.target.x(),
                y: e.target.y()
              }))
            }
          }}
        >
          <Layer>
            {/* Background grid */}
            {renderGrid()}

            {/* Tiles */}
            {renderTiles()}

            {/* Polygon clipping area */}
            {renderPolygonMask()}
          </Layer>
        </Stage>

        {/* Control Panel */}
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border"
          >
            <div className="flex items-center gap-2 mb-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleZoomIn}
                    disabled={viewport.scale >= 3}
                    aria-label="Zoom in"
                  >
                    <ZoomIn size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Zoom In</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleZoomOut}
                    disabled={viewport.scale <= 0.1}
                    aria-label="Zoom out"
                  >
                    <ZoomOut size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Zoom Out</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleReset}
                    aria-label="Reset view"
                  >
                    <RotateCcw size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Reset View</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleExport}
                    aria-label="Export image"
                  >
                    <Download size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Export PNG</TooltipContent>
              </Tooltip>
            </div>

            {/* Rendering Options */}
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex items-center gap-2">
                <Switch
                  id="show-grid"
                  checked={options.showGrid}
                  onCheckedChange={(checked) =>
                    setOptions(prev => ({ ...prev, showGrid: checked }))
                  }
                />
                <Label htmlFor="show-grid" className="cursor-pointer">
                  Grid
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="show-numbers"
                  checked={options.showTileNumbers}
                  onCheckedChange={(checked) =>
                    setOptions(prev => ({ ...prev, showTileNumbers: checked }))
                  }
                />
                <Label htmlFor="show-numbers" className="cursor-pointer">
                  Numbers
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="show-cut-tiles"
                  checked={options.showCutTiles}
                  onCheckedChange={(checked) =>
                    setOptions(prev => ({ ...prev, showCutTiles: checked }))
                  }
                />
                <Label htmlFor="show-cut-tiles" className="cursor-pointer">
                  Cut Tiles
                </Label>
              </div>
            </div>
          </motion.div>
        )}

        {/* Statistics Panel */}
        {showStats && patternResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border min-w-[200px]"
          >
            <div className="text-sm space-y-1">
              <div className="font-medium text-gray-900 mb-2">
                Pattern Statistics
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Pattern:</span>
                <Badge variant="outline">
                  {patternResult.pattern}
                </Badge>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Total Tiles:</span>
                <span className="font-medium">{patternResult.totalTiles}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-green-600">Full Tiles:</span>
                <span className="font-medium text-green-600">
                  {patternResult.fullTiles}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-amber-600">Cut Tiles:</span>
                <span className="font-medium text-amber-600">
                  {patternResult.cutTiles}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Coverage:</span>
                <span className="font-medium">
                  {patternResult.coverage.toFixed(1)}%
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-red-600">Waste:</span>
                <span className="font-medium text-red-600">
                  {patternResult.wastePercentage.toFixed(1)}%
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Loading State */}
        {isRendering && (
          <div className="absolute inset-0 bg-white/75 backdrop-blur-sm flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-layit-blue mx-auto mb-2" />
              <p className="text-sm text-gray-600">Generating pattern...</p>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  )
})

TilePatternRenderer.displayName = 'TilePatternRenderer'