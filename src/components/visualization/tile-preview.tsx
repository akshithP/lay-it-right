'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { Project, LayoutPattern, CustomLayoutPoint } from '@/types'
import { normalizeToMm } from '@/utils/unit-conversions'

interface TilePreviewProps {
  project: Project
  width?: number
  height?: number
  showGrid?: boolean
  showDimensions?: boolean
  className?: string
}

export function TilePreview({
  project,
  width = 400,
  height = 300,
  showGrid = true,
  showDimensions = true,
  className = ''
}: TilePreviewProps) {
  const tileLayout = useMemo(() => {
    if (!project.layout || !project.tile) return null

    return generateTileLayout(project, width, height)
  }, [project, width, height])

  if (!tileLayout) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 border-2 border-dashed border-gray-300 ${className}`}
        style={{ width, height }}
      >
        <p className="text-gray-500 text-sm">No tile layout data available</p>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="border-4 border-layit-blue bg-layit-white"
      >
        {/* Background */}
        <rect
          x="0"
          y="0"
          width={width}
          height={height}
          fill="#F4F6FF"
          stroke="none"
        />

        {/* Room outline */}
        <path
          d={tileLayout.roomPath}
          fill="none"
          stroke="#10375C"
          strokeWidth="3"
          strokeDasharray="8,4"
        />

        {/* Tiles */}
        {tileLayout.tiles.map((tile, index) => (
          <motion.g
            key={index}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.01, duration: 0.2 }}
          >
            {/* Tile */}
            <rect
              x={tile.x}
              y={tile.y}
              width={tile.width}
              height={tile.height}
              fill={tile.isCut ? "#F3C623" : "#EB8317"}
              stroke="#10375C"
              strokeWidth="0.5"
              opacity={0.8}
            />

            {/* Grout lines */}
            {showGrid && (
              <>
                <rect
                  x={tile.x + tile.width}
                  y={tile.y}
                  width={tileLayout.groutWidth}
                  height={tile.height + tileLayout.groutWidth}
                  fill="#10375C"
                  opacity={0.3}
                />
                <rect
                  x={tile.x}
                  y={tile.y + tile.height}
                  width={tile.width + tileLayout.groutWidth}
                  height={tileLayout.groutWidth}
                  fill="#10375C"
                  opacity={0.3}
                />
              </>
            )}
          </motion.g>
        ))}

        {/* Pattern-specific visual elements */}
        {project.layout.pattern === 'brick' && (
          <defs>
            <pattern id="brickPattern" patternUnits="userSpaceOnUse" width="20" height="10">
              <rect width="20" height="10" fill="none" />
              <line x1="0" y1="5" x2="20" y2="5" stroke="#10375C" strokeWidth="0.5" opacity="0.3" />
            </pattern>
          </defs>
        )}

        {/* Dimensions */}
        {showDimensions && tileLayout.dimensions && (
          <g>
            {/* Length dimension */}
            <line
              x1={20}
              y1={height - 15}
              x2={width - 20}
              y2={height - 15}
              stroke="#10375C"
              strokeWidth="1"
              markerEnd="url(#arrowhead)"
              markerStart="url(#arrowhead)"
            />
            <text
              x={width / 2}
              y={height - 5}
              textAnchor="middle"
              className="fill-layit-blue text-xs font-bold"
            >
              {tileLayout.dimensions.lengthLabel}
            </text>

            {/* Width dimension */}
            <line
              x1={15}
              y1={20}
              x2={15}
              y2={height - 20}
              stroke="#10375C"
              strokeWidth="1"
              markerEnd="url(#arrowhead)"
              markerStart="url(#arrowhead)"
            />
            <text
              x={8}
              y={height / 2}
              textAnchor="middle"
              className="fill-layit-blue text-xs font-bold"
              transform={`rotate(-90 8 ${height / 2})`}
            >
              {tileLayout.dimensions.widthLabel}
            </text>
          </g>
        )}

        {/* Arrowhead marker for dimensions */}
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="0"
            refY="3.5"
            orient="auto"
          >
            <polygon
              points="0 0, 10 3.5, 0 7"
              fill="#10375C"
            />
          </marker>
        </defs>
      </svg>

      {/* Legend */}
      <div className="absolute bottom-2 right-2 bg-layit-white/90 border-2 border-layit-blue p-2 text-xs">
        <div className="flex items-center gap-1 mb-1">
          <div className="w-3 h-3 bg-layit-orange border border-layit-blue"></div>
          <span className="text-layit-blue font-medium">Full Tiles</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-layit-yellow border border-layit-blue"></div>
          <span className="text-layit-blue font-medium">Cut Tiles</span>
        </div>
      </div>
    </div>
  )
}

// Helper function to generate tile layout data
function generateTileLayout(project: Project, previewWidth: number, previewHeight: number) {
  const { layout, tile } = project

  if (!layout || !tile) return null

  // Normalize all measurements to mm for consistent calculation
  const roomLengthMm = normalizeToMm(layout.dimensions.length, layout.dimensions.unit)
  const roomWidthMm = normalizeToMm(layout.dimensions.width, layout.dimensions.unit)
  const tileLengthMm = normalizeToMm(tile.length, tile.unit)
  const tileWidthMm = normalizeToMm(tile.width, tile.unit)
  const groutWidthMm = normalizeToMm(tile.groutWidth, tile.unit)

  // Calculate scale to fit in preview
  const scale = Math.min(
    (previewWidth - 40) / roomLengthMm,
    (previewHeight - 40) / roomWidthMm
  )

  // Scaled dimensions for preview
  const roomLength = roomLengthMm * scale
  const roomWidth = roomWidthMm * scale
  const tileLength = tileLengthMm * scale
  const tileWidth = tileWidthMm * scale
  const groutWidth = Math.max(0.5, groutWidthMm * scale)

  // Center the room in the preview
  const offsetX = (previewWidth - roomLength) / 2
  const offsetY = (previewHeight - roomWidth) / 2

  // Generate room path based on shape
  let roomPath = ''
  switch (layout.shape) {
    case 'rectangle':
    case 'square':
      roomPath = `M ${offsetX} ${offsetY} L ${offsetX + roomLength} ${offsetY} L ${offsetX + roomLength} ${offsetY + roomWidth} L ${offsetX} ${offsetY + roomWidth} Z`
      break
    case 'l-shape':
      // Simplified L-shape
      const lWidth = roomLength * 0.6
      const lHeight = roomWidth * 0.6
      roomPath = `M ${offsetX} ${offsetY} L ${offsetX + lWidth} ${offsetY} L ${offsetX + lWidth} ${offsetY + lHeight} L ${offsetX + roomLength} ${offsetY + lHeight} L ${offsetX + roomLength} ${offsetY + roomWidth} L ${offsetX} ${offsetY + roomWidth} Z`
      break
    case 'custom':
      if (layout.customLayout?.points) {
        roomPath = generateCustomRoomPath(layout.customLayout.points, offsetX, offsetY, scale)
      }
      break
    default:
      roomPath = `M ${offsetX} ${offsetY} L ${offsetX + roomLength} ${offsetY} L ${offsetX + roomLength} ${offsetY + roomWidth} L ${offsetX} ${offsetY + roomWidth} Z`
  }

  // Generate tiles based on pattern
  const tiles = generateTilePattern(
    layout.pattern,
    offsetX,
    offsetY,
    roomLength,
    roomWidth,
    tileLength,
    tileWidth,
    groutWidth
  )

  return {
    roomPath,
    tiles,
    groutWidth,
    dimensions: {
      lengthLabel: `${layout.dimensions.length}${layout.dimensions.unit}`,
      widthLabel: `${layout.dimensions.width}${layout.dimensions.unit}`,
    }
  }
}

// Generate custom room path from points
function generateCustomRoomPath(points: CustomLayoutPoint[], offsetX: number, offsetY: number, scale: number): string {
  if (points.length < 3) return ''

  const scaledPoints = points.map(point => ({
    x: offsetX + (point.x * scale),
    y: offsetY + (point.y * scale)
  }))

  let path = `M ${scaledPoints[0].x} ${scaledPoints[0].y}`

  for (let i = 1; i < scaledPoints.length; i++) {
    path += ` L ${scaledPoints[i].x} ${scaledPoints[i].y}`
  }

  path += ' Z'
  return path
}

// Generate tiles based on pattern
function generateTilePattern(
  pattern: LayoutPattern,
  offsetX: number,
  offsetY: number,
  roomLength: number,
  roomWidth: number,
  tileLength: number,
  tileWidth: number,
  groutWidth: number
) {
  const tiles: Array<{
    x: number
    y: number
    width: number
    height: number
    isCut: boolean
  }> = []

  const tilesPerRow = Math.floor((roomLength + groutWidth) / (tileLength + groutWidth))
  const tilesPerColumn = Math.floor((roomWidth + groutWidth) / (tileWidth + groutWidth))

  for (let row = 0; row < tilesPerColumn; row++) {
    for (let col = 0; col < tilesPerRow; col++) {
      let x = offsetX + col * (tileLength + groutWidth)
      let y = offsetY + row * (tileWidth + groutWidth)
      let width = tileLength
      let height = tileWidth
      let isCut = false

      // Pattern-specific adjustments
      if (pattern === 'brick') {
        // Offset every other row for brick pattern
        if (row % 2 === 1) {
          x += tileLength / 2
        }
      } else if (pattern === 'herringbone') {
        // Simplified herringbone - just rotate some tiles
        if ((row + col) % 2 === 1) {
          width = tileWidth
          height = tileLength
        }
      }

      // Check if tile needs cutting (at edges)
      if (x + width > offsetX + roomLength - 2 || y + height > offsetY + roomWidth - 2) {
        isCut = true
        // Adjust tile size to fit
        width = Math.min(width, offsetX + roomLength - x - 2)
        height = Math.min(height, offsetY + roomWidth - y - 2)
      }

      // Only add tile if it has meaningful size
      if (width > 2 && height > 2) {
        tiles.push({ x, y, width, height, isCut })
      }
    }
  }

  return tiles
}