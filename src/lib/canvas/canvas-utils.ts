import type {
  LayoutNode,
  LayoutEdge,
  LayoutNodeData,
  LayoutEdgeData,
  CanvasDimensions
} from '@/types/canvas'
import { CANVAS_BREAKPOINTS } from '@/types/canvas'
import type { Unit } from '@/types'

/**
 * Generate the next node label (A, B, C, ..., Z, AA, BB, etc.)
 */
export function generateNodeLabel(existingNodes: LayoutNode[]): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const nodeCount = existingNodes.length

  if (nodeCount < 26) {
    return alphabet[nodeCount]
  }

  // For more than 26 nodes, use AA, BB, CC pattern
  const letterIndex = nodeCount % 26
  const repeatCount = Math.floor(nodeCount / 26) + 1
  return alphabet[letterIndex].repeat(repeatCount)
}

/**
 * Create a new layout node
 */
export function createLayoutNode(
  position: { x: number; y: number },
  existingNodes: LayoutNode[]
): LayoutNode {
  const id = `node-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
  const label = generateNodeLabel(existingNodes)

  const nodeData: LayoutNodeData = {
    label,
    isConnectable: true,
    canDelete: existingNodes.length > 2, // Don't allow deleting if less than 3 nodes
    isStartNode: existingNodes.length === 0
  }

  return {
    id,
    type: 'cornerNode',
    position,
    data: nodeData,
    draggable: true,
    selectable: true
  }
}

/**
 * Create a new layout edge between two nodes
 */
export function createLayoutEdge(
  sourceNodeId: string,
  targetNodeId: string,
  unit: Unit = 'm'
): LayoutEdge {
  const id = `edge-${sourceNodeId}-${targetNodeId}`

  const edgeData: LayoutEdgeData = {
    unit,
    isRequired: true,
    canEdit: true,
    isBeingEdited: false
  }

  return {
    id,
    source: sourceNodeId,
    target: targetNodeId,
    type: 'dimensionEdge',
    data: edgeData,
    animated: false,
    style: {
      strokeWidth: 3,
      stroke: '#10375C' // layit-blue
    }
  }
}

/**
 * Auto-connect nodes in sequence
 */
export function autoConnectNodes(
  nodes: LayoutNode[],
  unit: Unit = 'm'
): LayoutEdge[] {
  if (nodes.length < 2) return []

  const edges: LayoutEdge[] = []

  // Connect consecutive nodes
  for (let i = 0; i < nodes.length - 1; i++) {
    edges.push(createLayoutEdge(nodes[i].id, nodes[i + 1].id, unit))
  }

  // Close the loop if we have 3+ nodes
  if (nodes.length >= 3) {
    const lastNode = nodes[nodes.length - 1]
    const firstNode = nodes[0]
    edges.push(createLayoutEdge(lastNode.id, firstNode.id, unit))
  }

  return edges
}

/**
 * Calculate canvas dimensions based on container and viewport
 */
export function calculateCanvasDimensions(
  containerWidth: number,
  containerHeight: number,
  viewportWidth: number
): CanvasDimensions {
  const isMobile = viewportWidth < CANVAS_BREAKPOINTS.tablet
  const isTablet = viewportWidth >= CANVAS_BREAKPOINTS.tablet && viewportWidth < CANVAS_BREAKPOINTS.desktop

  let width: number
  let height: number
  let minWidth: number
  let minHeight: number

  if (isMobile) {
    // Mobile: Use full container width, maintain 4:3 aspect ratio
    width = Math.max(300, containerWidth - 32) // Account for padding
    height = Math.max(225, (width * 3) / 4)
    minWidth = 300
    minHeight = 225
  } else if (isTablet) {
    // Tablet: Larger canvas with 3:2 aspect ratio
    width = Math.max(480, Math.min(600, containerWidth - 64))
    height = Math.max(320, (width * 2) / 3)
    minWidth = 480
    minHeight = 320
  } else {
    // Desktop: Large canvas with 16:10 aspect ratio
    width = Math.max(640, Math.min(800, containerWidth - 96))
    height = Math.max(400, (width * 10) / 16)
    minWidth = 640
    minHeight = 400
  }

  return {
    width: Math.round(width),
    height: Math.round(height),
    minWidth,
    minHeight,
    aspectRatio: width / height
  }
}

/**
 * Snap position to grid
 */
export function snapToGrid(position: { x: number; y: number }, gridSize: number = 20): { x: number; y: number } {
  return {
    x: Math.round(position.x / gridSize) * gridSize,
    y: Math.round(position.y / gridSize) * gridSize
  }
}

/**
 * Check if a position is within canvas bounds
 */
export function isWithinBounds(
  position: { x: number; y: number },
  canvasDimensions: CanvasDimensions,
  nodeSize: number = 44
): boolean {
  const padding = nodeSize / 2

  return (
    position.x >= padding &&
    position.x <= canvasDimensions.width - padding &&
    position.y >= padding &&
    position.y <= canvasDimensions.height - padding
  )
}

/**
 * Find the closest node to a position (for auto-closing shapes)
 */
export function findClosestNode(
  position: { x: number; y: number },
  nodes: LayoutNode[],
  maxDistance: number = 50
): LayoutNode | null {
  let closestNode: LayoutNode | null = null
  let minDistance = maxDistance

  for (const node of nodes) {
    const distance = Math.sqrt(
      Math.pow(position.x - node.position.x, 2) +
      Math.pow(position.y - node.position.y, 2)
    )

    if (distance < minDistance) {
      minDistance = distance
      closestNode = node
    }
  }

  return closestNode
}

/**
 * Convert canvas coordinates to real-world coordinates
 */
export function canvasToRealWorld(
  canvasPos: { x: number; y: number },
  canvasDimensions: CanvasDimensions,
  realWorldDimensions: { width: number; height: number }
): { x: number; y: number } {
  const scaleX = realWorldDimensions.width / canvasDimensions.width
  const scaleY = realWorldDimensions.height / canvasDimensions.height

  return {
    x: canvasPos.x * scaleX,
    y: canvasPos.y * scaleY
  }
}

/**
 * Convert real-world coordinates to canvas coordinates
 */
export function realWorldToCanvas(
  realPos: { x: number; y: number },
  canvasDimensions: CanvasDimensions,
  realWorldDimensions: { width: number; height: number }
): { x: number; y: number } {
  const scaleX = canvasDimensions.width / realWorldDimensions.width
  const scaleY = canvasDimensions.height / realWorldDimensions.height

  return {
    x: realPos.x * scaleX,
    y: realPos.y * scaleY
  }
}

/**
 * Calculate the distance between two points
 */
export function calculateDistance(
  point1: { x: number; y: number },
  point2: { x: number; y: number }
): number {
  return Math.sqrt(
    Math.pow(point2.x - point1.x, 2) +
    Math.pow(point2.y - point1.y, 2)
  )
}

/**
 * Generate a unique ID for canvas elements
 */
export function generateCanvasId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

/**
 * Determine if we're on a touch device
 */
export function isTouchDevice(): boolean {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

/**
 * Get responsive canvas settings based on viewport
 */
export function getResponsiveCanvasSettings(viewportWidth: number) {
  const isMobile = viewportWidth < CANVAS_BREAKPOINTS.tablet
  const isTablet = viewportWidth >= CANVAS_BREAKPOINTS.tablet && viewportWidth < CANVAS_BREAKPOINTS.desktop

  return {
    isMobile,
    isTablet,
    isDesktop: viewportWidth >= CANVAS_BREAKPOINTS.desktop,
    showGrid: !isMobile, // Hide grid on mobile for better performance
    panOnDrag: isMobile, // Enable pan on mobile
    selectionOnDrag: !isMobile, // Disable selection drag on mobile
    nodeMinDistance: isMobile ? 60 : 40, // Larger minimum distance on mobile
    touchTarget: isMobile ? 44 : 32, // Larger touch targets on mobile
    gridSize: isMobile ? 30 : 20 // Larger grid on mobile
  }
}