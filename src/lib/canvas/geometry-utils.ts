import type { LayoutNode, LayoutEdge } from '@/types/canvas'

/**
 * Check if a polygon is closed (first and last points are connected)
 */
export function isPolygonClosed(nodes: LayoutNode[], edges: LayoutEdge[]): boolean {
  if (nodes.length < 3) return false

  const firstNode = nodes[0]
  const lastNode = nodes[nodes.length - 1]

  // Check if there's an edge connecting the last node to the first node
  return edges.some(
    edge =>
      (edge.source === lastNode.id && edge.target === firstNode.id) ||
      (edge.source === firstNode.id && edge.target === lastNode.id)
  )
}

/**
 * Detect self-intersecting polygons using the Shoelace algorithm
 */
export function detectSelfIntersections(nodes: LayoutNode[]): boolean {
  if (nodes.length < 4) return false // Need at least 4 points to self-intersect

  // Check if any two non-adjacent edges intersect
  for (let i = 0; i < nodes.length; i++) {
    const edge1Start = nodes[i]
    const edge1End = nodes[(i + 1) % nodes.length]

    for (let j = i + 2; j < nodes.length; j++) {
      // Skip the edge that shares a vertex
      if (j === nodes.length - 1 && i === 0) continue

      const edge2Start = nodes[j]
      const edge2End = nodes[(j + 1) % nodes.length]

      if (linesIntersect(edge1Start.position, edge1End.position, edge2Start.position, edge2End.position)) {
        return true
      }
    }
  }

  return false
}

/**
 * Check if two line segments intersect
 */
function linesIntersect(
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  p3: { x: number; y: number },
  p4: { x: number; y: number }
): boolean {
  const denominator = (p4.y - p3.y) * (p2.x - p1.x) - (p4.x - p3.x) * (p2.y - p1.y)

  // Lines are parallel
  if (Math.abs(denominator) < 1e-10) {
    return false
  }

  const ua = ((p4.x - p3.x) * (p1.y - p3.y) - (p4.y - p3.y) * (p1.x - p3.x)) / denominator
  const ub = ((p2.x - p1.x) * (p1.y - p3.y) - (p2.y - p1.y) * (p1.x - p3.x)) / denominator

  // Check if intersection point is on both line segments
  return ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1
}

/**
 * Calculate polygon area using the Shoelace formula
 */
export function calculatePolygonArea(nodes: LayoutNode[]): number {
  if (nodes.length < 3) return 0

  let area = 0
  const n = nodes.length

  for (let i = 0; i < n; i++) {
    const current = nodes[i].position
    const next = nodes[(i + 1) % n].position

    area += current.x * next.y - next.x * current.y
  }

  return Math.abs(area) / 2
}

/**
 * Calculate polygon perimeter
 */
export function calculatePolygonPerimeter(nodes: LayoutNode[]): number {
  if (nodes.length < 2) return 0

  let perimeter = 0
  const n = nodes.length

  for (let i = 0; i < n; i++) {
    const current = nodes[i].position
    const next = nodes[(i + 1) % n].position

    const distance = Math.sqrt(
      Math.pow(next.x - current.x, 2) + Math.pow(next.y - current.y, 2)
    )

    perimeter += distance
  }

  return perimeter
}

/**
 * Check if a point is inside a polygon using ray casting algorithm
 */
export function pointInPolygon(point: { x: number; y: number }, nodes: LayoutNode[]): boolean {
  if (nodes.length < 3) return false

  let inside = false
  const n = nodes.length

  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = nodes[i].position.x
    const yi = nodes[i].position.y
    const xj = nodes[j].position.x
    const yj = nodes[j].position.y

    if (((yi > point.y) !== (yj > point.y)) && point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi) {
      inside = !inside
    }
  }

  return inside
}

/**
 * Find the centroid of a polygon
 */
export function calculatePolygonCentroid(nodes: LayoutNode[]): { x: number; y: number } {
  if (nodes.length === 0) return { x: 0, y: 0 }

  let x = 0
  let y = 0

  for (const node of nodes) {
    x += node.position.x
    y += node.position.y
  }

  return {
    x: x / nodes.length,
    y: y / nodes.length
  }
}

/**
 * Check if three points are collinear (on the same line)
 */
export function arePointsCollinear(
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  p3: { x: number; y: number },
  tolerance: number = 1e-10
): boolean {
  // Calculate the area of the triangle formed by the three points
  // If the area is 0 (or very close to 0), the points are collinear
  const area = Math.abs(
    (p1.x * (p2.y - p3.y) + p2.x * (p3.y - p1.y) + p3.x * (p1.y - p2.y)) / 2
  )

  return area < tolerance
}

/**
 * Suggest a position to complete the shape (auto-close)
 */
export function suggestShapeCompletion(nodes: LayoutNode[]): LayoutNode | null {
  if (nodes.length < 3) return null

  const firstNode = nodes[0]
  const lastNode = nodes[nodes.length - 1]

  // Calculate distance between first and last node
  const distance = Math.sqrt(
    Math.pow(firstNode.position.x - lastNode.position.x, 2) +
    Math.pow(firstNode.position.y - lastNode.position.y, 2)
  )

  // If nodes are close enough (within 50 pixels), suggest closing the shape
  if (distance < 50) {
    return firstNode
  }

  return null
}

/**
 * Check if a polygon is convex (all interior angles < 180°)
 */
export function isPolygonConvex(nodes: LayoutNode[]): boolean {
  if (nodes.length < 3) return false

  let sign = 0
  const n = nodes.length

  for (let i = 0; i < n; i++) {
    const p1 = nodes[i].position
    const p2 = nodes[(i + 1) % n].position
    const p3 = nodes[(i + 2) % n].position

    // Calculate cross product
    const crossProduct = (p2.x - p1.x) * (p3.y - p2.y) - (p2.y - p1.y) * (p3.x - p2.x)

    if (crossProduct !== 0) {
      const currentSign = crossProduct > 0 ? 1 : -1

      if (sign === 0) {
        sign = currentSign
      } else if (sign !== currentSign) {
        return false // Found a turn in the opposite direction
      }
    }
  }

  return true
}

/**
 * Calculate the bounding box of a set of nodes
 */
export function calculateBoundingBox(nodes: LayoutNode[]): {
  minX: number
  minY: number
  maxX: number
  maxY: number
  width: number
  height: number
} {
  if (nodes.length === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 }
  }

  let minX = nodes[0].position.x
  let minY = nodes[0].position.y
  let maxX = nodes[0].position.x
  let maxY = nodes[0].position.y

  for (const node of nodes) {
    minX = Math.min(minX, node.position.x)
    minY = Math.min(minY, node.position.y)
    maxX = Math.max(maxX, node.position.x)
    maxY = Math.max(maxY, node.position.y)
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
 * Normalize polygon points to fit within a bounding rectangle
 */
export function normalizePolygon(
  nodes: LayoutNode[],
  targetWidth: number,
  targetHeight: number,
  padding: number = 20
): { x: number; y: number }[] {
  if (nodes.length === 0) return []

  const bbox = calculateBoundingBox(nodes)
  const availableWidth = targetWidth - 2 * padding
  const availableHeight = targetHeight - 2 * padding

  const scaleX = availableWidth / bbox.width
  const scaleY = availableHeight / bbox.height
  const scale = Math.min(scaleX, scaleY)

  return nodes.map(node => ({
    x: padding + (node.position.x - bbox.minX) * scale,
    y: padding + (node.position.y - bbox.minY) * scale
  }))
}