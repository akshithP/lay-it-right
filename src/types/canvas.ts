import type { Node, Edge } from '@xyflow/react'
import type { Unit } from './index'

// Canvas-specific node data
export interface LayoutNodeData extends Record<string, unknown> {
  label: string // A, B, C, D, etc.
  isConnectable: boolean
  canDelete: boolean
  isStartNode?: boolean
}

// Canvas-specific edge data
export interface LayoutEdgeData extends Record<string, unknown> {
  dimension?: number
  unit: Unit
  isRequired: boolean
  canEdit: boolean
  isBeingEdited?: boolean
}

// React Flow specific types
export type LayoutNode = Node<LayoutNodeData>
export type LayoutEdge = Edge<LayoutEdgeData>

// Canvas state interface
export interface CanvasState {
  nodes: LayoutNode[]
  edges: LayoutEdge[]
  selectedNodeId?: string
  isDrawingMode: boolean
  canvasHistory: CanvasSnapshot[]
  currentHistoryIndex: number
  nextNodeLabel: string
  viewport: { x: number; y: number; zoom: number }
}

// Canvas snapshot for undo/redo
export interface CanvasSnapshot {
  nodes: LayoutNode[]
  edges: LayoutEdge[]
  timestamp: number
}

// Validation results
export interface ValidationResult {
  isValid: boolean
  isClosed: boolean
  hasMinimumNodes: boolean
  hasSelfIntersection: boolean
  missingDimensions: string[]
  errors: ValidationError[]
  warnings: ValidationWarning[]
  area?: number
  perimeter?: number
}

export interface ValidationError {
  type: 'geometry' | 'dimensions' | 'topology'
  message: string
  nodeId?: string
  edgeId?: string
}

export interface ValidationWarning {
  type: 'usability' | 'performance' | 'accuracy'
  message: string
  nodeId?: string
  edgeId?: string
}

// Canvas configuration
export interface CanvasConfig {
  minNodes: number
  maxNodes: number
  snapToGrid: boolean
  gridSize: number
  autoConnect: boolean
  showGrid: boolean
  panOnDrag: boolean
  selectionOnDrag: boolean
  multiSelectionKeyCode: 'Meta' | 'Ctrl'
  deleteKeyCode: 'Backspace' | 'Delete'
}

// Canvas interaction modes
export type InteractionMode = 'drawing' | 'editing' | 'viewing'

// Touch gesture types
export interface GestureState {
  isPanning: boolean
  isZooming: boolean
  lastTouchDistance?: number
  touchStartPos?: { x: number; y: number }
}

// Canvas dimensions and responsive breakpoints
export interface CanvasDimensions {
  width: number
  height: number
  minWidth: number
  minHeight: number
  aspectRatio?: number
}

export const CANVAS_BREAKPOINTS = {
  mobile: 320,
  tablet: 768,
  desktop: 1024,
  wide: 1440
} as const

// Default canvas configuration
export const DEFAULT_CANVAS_CONFIG: CanvasConfig = {
  minNodes: 3,
  maxNodes: 20,
  snapToGrid: true,
  gridSize: 20,
  autoConnect: true,
  showGrid: true,
  panOnDrag: true,
  selectionOnDrag: false,
  multiSelectionKeyCode: 'Meta',
  deleteKeyCode: 'Delete'
}

// Node styling constants
export const NODE_DIMENSIONS = {
  width: 44, // Minimum touch target
  height: 44,
  borderWidth: 3,
  fontSize: 14
}

// Edge styling constants
export const EDGE_DIMENSIONS = {
  strokeWidth: 3,
  labelBgPadding: 8,
  labelFontSize: 12,
  minClickArea: 10
}