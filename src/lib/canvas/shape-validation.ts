import type {
  LayoutNode,
  LayoutEdge,
  ValidationResult,
  ValidationError,
  ValidationWarning
} from '@/types/canvas'
import {
  isPolygonClosed,
  detectSelfIntersections,
  calculatePolygonArea,
  calculatePolygonPerimeter,
  arePointsCollinear
} from './geometry-utils'

/**
 * Comprehensive shape validation function
 */
export function validateLayoutShape(
  nodes: LayoutNode[],
  edges: LayoutEdge[]
): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []

  // Check minimum nodes requirement
  const hasMinimumNodes = nodes.length >= 3
  if (!hasMinimumNodes) {
    errors.push({
      type: 'topology',
      message: `Minimum 3 corner points required. Currently have ${nodes.length}.`
    })
  }

  // Check if polygon is closed
  const isClosed = isPolygonClosed(nodes, edges)
  if (hasMinimumNodes && !isClosed) {
    errors.push({
      type: 'topology',
      message: 'Shape must be closed. Connect the last point to the first point.'
    })
  }

  // Check for self-intersections
  const hasSelfIntersection = detectSelfIntersections(nodes)
  if (hasSelfIntersection) {
    errors.push({
      type: 'geometry',
      message: 'Shape cannot intersect with itself. Adjust corner positions to fix overlapping lines.'
    })
  }

  // Check for missing dimensions
  const missingDimensions = findMissingDimensions(edges)
  if (missingDimensions.length > 0 && isClosed) {
    errors.push({
      type: 'dimensions',
      message: `${missingDimensions.length} edge(s) missing dimensions. Click on edges to add measurements.`
    })
  }

  // Check for collinear points (warning)
  const collinearPoints = findCollinearPoints(nodes)
  if (collinearPoints.length > 0) {
    warnings.push({
      type: 'usability',
      message: `${collinearPoints.length} points are on straight lines. Consider removing unnecessary corner points.`
    })
  }

  // Check for very small dimensions (warning)
  const smallDimensions = findSmallDimensions(edges)
  if (smallDimensions.length > 0) {
    warnings.push({
      type: 'accuracy',
      message: `${smallDimensions.length} edge(s) have very small dimensions. Verify measurements are correct.`
    })
  }

  // Check for very large shapes (performance warning)
  const area = hasMinimumNodes ? calculatePolygonArea(nodes) : 0
  const perimeter = hasMinimumNodes ? calculatePolygonPerimeter(nodes) : 0

  if (area > 1000000) { // Large area threshold
    warnings.push({
      type: 'performance',
      message: 'Large room layout may affect tile calculation performance.'
    })
  }

  // Overall validation status
  const isValid = errors.length === 0 && hasMinimumNodes && isClosed && !hasSelfIntersection

  return {
    isValid,
    isClosed,
    hasMinimumNodes,
    hasSelfIntersection,
    missingDimensions: missingDimensions.map(edge => edge.id),
    errors,
    warnings,
    area: hasMinimumNodes ? area : undefined,
    perimeter: hasMinimumNodes ? perimeter : undefined
  }
}

/**
 * Find edges that are missing dimension values
 */
function findMissingDimensions(edges: LayoutEdge[]): LayoutEdge[] {
  return edges.filter(edge =>
    edge.data.isRequired &&
    (edge.data.dimension === undefined || edge.data.dimension <= 0)
  )
}

/**
 * Find sets of collinear points (3+ points on the same line)
 */
function findCollinearPoints(nodes: LayoutNode[]): string[][] {
  const collinearSets: string[][] = []

  if (nodes.length < 3) return collinearSets

  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      for (let k = j + 1; k < nodes.length; k++) {
        const p1 = nodes[i].position
        const p2 = nodes[j].position
        const p3 = nodes[k].position

        if (arePointsCollinear(p1, p2, p3, 5)) { // 5 pixel tolerance
          collinearSets.push([nodes[i].id, nodes[j].id, nodes[k].id])
        }
      }
    }
  }

  return collinearSets
}

/**
 * Find edges with very small dimensions
 */
function findSmallDimensions(edges: LayoutEdge[]): LayoutEdge[] {
  const SMALL_DIMENSION_THRESHOLD = {
    'mm': 100, // 10cm
    'cm': 10,  // 10cm
    'm': 0.1,  // 10cm
    'in': 4,   // 4 inches (~10cm)
    'ft': 0.33 // ~4 inches
  }

  return edges.filter(edge => {
    if (!edge.data.dimension || edge.data.dimension <= 0) return false

    const threshold = SMALL_DIMENSION_THRESHOLD[edge.data.unit]
    return edge.data.dimension < threshold
  })
}

/**
 * Check if a shape can be auto-closed
 */
export function canAutoCloseShape(nodes: LayoutNode[], edges: LayoutEdge[]): boolean {
  if (nodes.length < 3) return false
  if (isPolygonClosed(nodes, edges)) return false

  const firstNode = nodes[0]
  const lastNode = nodes[nodes.length - 1]

  // Calculate distance between first and last node
  const distance = Math.sqrt(
    Math.pow(firstNode.position.x - lastNode.position.x, 2) +
    Math.pow(firstNode.position.y - lastNode.position.y, 2)
  )

  // Can auto-close if nodes are within 50 pixels of each other
  return distance < 50
}

/**
 * Get validation summary for UI display
 */
export function getValidationSummary(validation: ValidationResult): {
  status: 'valid' | 'invalid' | 'incomplete'
  message: string
  priority: 'high' | 'medium' | 'low'
} {
  if (!validation.hasMinimumNodes) {
    return {
      status: 'incomplete',
      message: `Add ${3 - (validation.errors.find(e => e.type === 'topology')?.message.match(/\d+/) ?
        parseInt(validation.errors.find(e => e.type === 'topology')!.message.match(/\d+/)![0]) : 0)} more corner points`,
      priority: 'high'
    }
  }

  if (!validation.isClosed) {
    return {
      status: 'incomplete',
      message: 'Close the shape by connecting to the starting point',
      priority: 'high'
    }
  }

  if (validation.hasSelfIntersection) {
    return {
      status: 'invalid',
      message: 'Shape cannot cross over itself',
      priority: 'high'
    }
  }

  if (validation.missingDimensions.length > 0) {
    return {
      status: 'incomplete',
      message: `Add dimensions to ${validation.missingDimensions.length} edge(s)`,
      priority: 'medium'
    }
  }

  if (validation.warnings.length > 0) {
    const highPriorityWarning = validation.warnings.find(w => w.type === 'accuracy')
    if (highPriorityWarning) {
      return {
        status: 'valid',
        message: 'Review small dimensions for accuracy',
        priority: 'low'
      }
    }
  }

  return {
    status: 'valid',
    message: 'Shape is ready for tile calculations',
    priority: 'low'
  }
}

/**
 * Get step-by-step guidance for completing the shape
 */
export function getValidationGuidance(
  nodes: LayoutNode[],
  edges: LayoutEdge[],
  validation: ValidationResult
): string[] {
  const guidance: string[] = []

  if (!validation.hasMinimumNodes) {
    const needed = 3 - nodes.length
    guidance.push(`• Click ${needed} more time${needed > 1 ? 's' : ''} to add corner points`)
  } else if (!validation.isClosed) {
    guidance.push('• Click near the starting point (A) to close the shape')
    guidance.push('• Or add more corner points if your layout is more complex')
  } else if (validation.hasSelfIntersection) {
    guidance.push('• Drag corner points to prevent lines from crossing')
    guidance.push('• Make sure your shape represents a real room layout')
  } else if (validation.missingDimensions.length > 0) {
    guidance.push('• Click on the lines to add measurements')
    guidance.push('• All edges need dimensions for accurate tile calculations')
  } else if (validation.isValid) {
    guidance.push('• Shape is complete and ready!')
    guidance.push('• Click "Next" to proceed with tile selection')
  }

  // Add general tips
  if (nodes.length > 0 && nodes.length < 8) {
    guidance.push('• Drag points to adjust the shape as needed')
    guidance.push('• Delete points by selecting them and pressing Delete')
  }

  return guidance
}