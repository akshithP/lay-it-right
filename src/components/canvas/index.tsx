// Re-export canvas components
export { ReactFlowCanvas } from './ReactFlowCanvas'
export { CornerNode } from './CornerNode'
export { DimensionEdge } from './DimensionEdge'

// Enhanced components
export { DrawingCanvasWrapper } from './DrawingCanvasWrapper'
export { CanvasErrorBoundary, useCanvasErrorHandler } from './CanvasErrorBoundary'
export { CanvasAnnouncer } from './CanvasAnnouncer'

// Feedback and interaction systems
export {
  FeedbackProvider,
  useFeedback,
  useCanvasFeedback,
  type FeedbackType,
  type FeedbackMessage,
  type SystemStatus
} from './CanvasFeedbackSystem'

export { KeyboardShortcuts, useKeyboardShortcuts } from './KeyboardShortcuts'
export { CanvasWithFeedback } from './CanvasWithFeedback'

// Testing and development utilities
export { ResponsiveTestingPanel } from './ResponsiveTestingPanel'
export { CanvasTestSuite } from './CanvasTestSuite'

// Legacy export for backward compatibility
export { ReactFlowCanvas as DrawingCanvas } from './ReactFlowCanvas'