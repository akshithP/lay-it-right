import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type {
  LayoutNode,
  LayoutEdge,
  CanvasState,
  CanvasSnapshot,
  ValidationResult,
  InteractionMode,
  CanvasConfig
} from '@/types/canvas'
import { DEFAULT_CANVAS_CONFIG } from '@/types/canvas'
import type { Unit } from '@/types'
import {
  createLayoutNode,
  createLayoutEdge,
  autoConnectNodes,
  generateNodeLabel
} from '@/lib/canvas/canvas-utils'
import { validateLayoutShape } from '@/lib/canvas/shape-validation'

interface CanvasActions {
  // Node management
  addNode: (position: { x: number; y: number }) => void
  removeNode: (nodeId: string) => void
  updateNodePosition: (nodeId: string, position: { x: number; y: number }) => void
  selectNode: (nodeId: string | undefined) => void

  // Edge management
  updateEdgeDimension: (edgeId: string, dimension: number, unit: Unit) => void
  removeEdge: (edgeId: string) => void

  // Canvas operations
  setInteractionMode: (mode: InteractionMode) => void
  updateViewport: (viewport: { x: number; y: number; zoom: number }) => void
  setCanvasConfig: (config: Partial<CanvasConfig>) => void

  // History management (undo/redo)
  undo: () => void
  redo: () => void
  saveToHistory: () => void
  clearHistory: () => void

  // Validation and completion
  validateLayout: () => ValidationResult
  canCompleteLayout: () => boolean
  exportLayoutData: () => { nodes: LayoutNode[]; edges: LayoutEdge[]; validation: ValidationResult } | null

  // Canvas lifecycle
  clearCanvas: () => void
  resetCanvas: () => void
  loadCanvasState: (state: Partial<CanvasState>) => void
}

const initialCanvasState: CanvasState = {
  nodes: [],
  edges: [],
  selectedNodeId: undefined,
  isDrawingMode: true,
  canvasHistory: [],
  currentHistoryIndex: -1,
  nextNodeLabel: 'A',
  viewport: { x: 0, y: 0, zoom: 1 }
}

export const useCanvasStore = create<CanvasState & CanvasActions & { config: CanvasConfig }>()(
  immer((set, get) => ({
    // Initial state
    ...initialCanvasState,
    config: DEFAULT_CANVAS_CONFIG,

    // Node management actions
    addNode: (position) => {
      set((state) => {
        // Check maximum nodes limit
        if (state.nodes.length >= state.config.maxNodes) {
          return // Don't add if at maximum
        }

        const newNode = createLayoutNode(position, state.nodes)
        state.nodes.push(newNode)

        // Auto-connect if enabled and we have 2+ nodes
        if (state.config.autoConnect && state.nodes.length >= 2) {
          // Remove existing auto-generated edges to regenerate them
          state.edges = state.edges.filter(edge => !edge.id.startsWith('edge-node-'))

          // Generate new edges with auto-connect logic
          const newEdges = autoConnectNodes(state.nodes, 'm')
          state.edges.push(...newEdges)
        }

        // Update next label
        state.nextNodeLabel = generateNodeLabel(state.nodes)

      })
    },

    removeNode: (nodeId) => {
      set((state) => {
        // Don't allow removal if below minimum nodes
        if (state.nodes.length <= state.config.minNodes && state.nodes.length > 0) {
          return
        }

        // Remove the node
        state.nodes = state.nodes.filter(node => node.id !== nodeId)

        // Remove associated edges
        state.edges = state.edges.filter(edge =>
          edge.source !== nodeId && edge.target !== nodeId
        )

        // Clear selection if deleted node was selected
        if (state.selectedNodeId === nodeId) {
          state.selectedNodeId = undefined
        }

        // Regenerate auto-connections if enabled
        if (state.config.autoConnect && state.nodes.length >= 2) {
          // Remove all auto-generated edges and regenerate
          state.edges = []
          const newEdges = autoConnectNodes(state.nodes, 'm')
          state.edges.push(...newEdges)
        }

        // Update labels for remaining nodes
        state.nodes.forEach((node, index) => {
          const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
          node.data.label = alphabet[index] || `${alphabet[index % 26]}${Math.floor(index / 26) + 1}`
        })

        // Update next label
        state.nextNodeLabel = generateNodeLabel(state.nodes)

      })
    },

    updateNodePosition: (nodeId, position) => {
      set((state) => {
        const node = state.nodes.find(n => n.id === nodeId)
        if (node) {
          node.position = position
          // Don't auto-save to history for position updates (too frequent)
        }
      })
    },

    selectNode: (nodeId) => {
      set((state) => {
        state.selectedNodeId = nodeId
      })
    },

    // Edge management actions
    updateEdgeDimension: (edgeId, dimension, unit) => {
      set((state) => {
        const edge = state.edges.find(e => e.id === edgeId)
        if (edge) {
          edge.data.dimension = dimension
          edge.data.unit = unit
          edge.data.isBeingEdited = false
        }
      })
    },

    removeEdge: (edgeId) => {
      set((state) => {
        state.edges = state.edges.filter(edge => edge.id !== edgeId)
      })
    },

    // Canvas operations
    setInteractionMode: (mode) => {
      set((state) => {
        state.isDrawingMode = mode === 'drawing'
      })
    },

    updateViewport: (viewport) => {
      set((state) => {
        state.viewport = viewport
      })
    },

    setCanvasConfig: (config) => {
      set((state) => {
        state.config = { ...state.config, ...config }
      })
    },

    // History management
    saveToHistory: () => {
      set((state) => {
        const snapshot: CanvasSnapshot = {
          nodes: JSON.parse(JSON.stringify(state.nodes)),
          edges: JSON.parse(JSON.stringify(state.edges)),
          timestamp: Date.now()
        }

        // Remove any history after current index
        state.canvasHistory = state.canvasHistory.slice(0, state.currentHistoryIndex + 1)

        // Add new snapshot
        state.canvasHistory.push(snapshot)

        // Limit history size (keep last 50 states)
        if (state.canvasHistory.length > 50) {
          state.canvasHistory = state.canvasHistory.slice(-50)
        }

        state.currentHistoryIndex = state.canvasHistory.length - 1
      })
    },

    undo: () => {
      set((state) => {
        if (state.currentHistoryIndex > 0) {
          state.currentHistoryIndex -= 1
          const snapshot = state.canvasHistory[state.currentHistoryIndex]

          if (snapshot) {
            state.nodes = JSON.parse(JSON.stringify(snapshot.nodes))
            state.edges = JSON.parse(JSON.stringify(snapshot.edges))
            state.nextNodeLabel = generateNodeLabel(state.nodes)
          }
        }
      })
    },

    redo: () => {
      set((state) => {
        if (state.currentHistoryIndex < state.canvasHistory.length - 1) {
          state.currentHistoryIndex += 1
          const snapshot = state.canvasHistory[state.currentHistoryIndex]

          if (snapshot) {
            state.nodes = JSON.parse(JSON.stringify(snapshot.nodes))
            state.edges = JSON.parse(JSON.stringify(snapshot.edges))
            state.nextNodeLabel = generateNodeLabel(state.nodes)
          }
        }
      })
    },

    clearHistory: () => {
      set((state) => {
        state.canvasHistory = []
        state.currentHistoryIndex = -1
      })
    },

    // Validation and completion
    validateLayout: () => {
      const state = get()
      return validateLayoutShape(state.nodes, state.edges)
    },

    canCompleteLayout: () => {
      const validation = get().validateLayout()
      return validation.isValid && validation.isClosed && validation.missingDimensions.length === 0
    },

    exportLayoutData: () => {
      const state = get()
      const validation = get().validateLayout()

      if (!validation.isValid) {
        return null
      }

      return {
        nodes: state.nodes,
        edges: state.edges,
        validation
      }
    },

    // Canvas lifecycle
    clearCanvas: () => {
      set((state) => {
        state.nodes = []
        state.edges = []
        state.selectedNodeId = undefined
        state.nextNodeLabel = 'A'
        get().clearHistory()
      })
    },

    resetCanvas: () => {
      set((state) => {
        Object.assign(state, initialCanvasState)
        state.config = DEFAULT_CANVAS_CONFIG
        get().clearHistory()
      })
    },

    loadCanvasState: (newState) => {
      set((state) => {
        Object.assign(state, { ...state, ...newState })
        if (newState.nodes) {
          state.nextNodeLabel = generateNodeLabel(newState.nodes)
        }
      })
    }
  }))
)