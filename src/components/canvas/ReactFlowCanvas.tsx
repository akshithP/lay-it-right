'use client'

import { useCallback, useRef, useEffect, useState } from 'react'
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  ReactFlowProvider,
  ReactFlowInstance,
  OnConnect,
  Panel
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Undo2,
  Redo2,
  Trash2,
  Check,
  MousePointer2,
  Grid3x3,
  Info,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react'

import { CornerNode } from './CornerNode'
import { DimensionEdge } from './DimensionEdge'
import { CanvasAnnouncer } from './CanvasAnnouncer'
import { CanvasWithFeedback } from './CanvasWithFeedback'
import { KeyboardShortcuts } from './KeyboardShortcuts'
import { useCanvasStore } from '@/stores/canvas-store'
import { cn } from '@/lib/utils'
import { calculateCanvasDimensions, snapToGrid, isWithinBounds, getResponsiveCanvasSettings } from '@/lib/canvas/canvas-utils'
import { getValidationSummary, getValidationGuidance } from '@/lib/canvas/shape-validation'
import type { LayoutNode, LayoutEdge } from '@/types/canvas'
import type { Unit } from '@/types'

// Custom node and edge types
const nodeTypes = {
  cornerNode: CornerNode,
}

const edgeTypes = {
  dimensionEdge: DimensionEdge,
}

interface ReactFlowCanvasProps {
  className?: string
  onLayoutComplete?: (layoutData: { nodes: LayoutNode[]; edges: LayoutEdge[] }) => void
  containerWidth?: number
  containerHeight?: number
  isReadOnly?: boolean
  unit?: Unit
}

function ReactFlowCanvasInner({
  className,
  onLayoutComplete,
  containerWidth = 800,
  containerHeight = 600,
  isReadOnly = false
}: ReactFlowCanvasProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null)
  const [viewportWidth, setViewportWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024)

  // Canvas store
  const {
    nodes,
    edges,
    isDrawingMode,
    canvasHistory,
    currentHistoryIndex,
    config,
    addNode,
    selectNode,
    undo,
    redo,
    clearCanvas,
    validateLayout,
    canCompleteLayout,
    exportLayoutData,
    setCanvasConfig
  } = useCanvasStore()

  // Responsive settings
  const responsiveSettings = getResponsiveCanvasSettings(viewportWidth)
  const canvasDimensions = calculateCanvasDimensions(containerWidth, containerHeight, viewportWidth)

  // Update viewport width on resize
  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Update canvas config based on responsive settings
  useEffect(() => {
    setCanvasConfig({
      showGrid: responsiveSettings.showGrid,
      panOnDrag: responsiveSettings.panOnDrag,
      selectionOnDrag: responsiveSettings.selectionOnDrag,
      gridSize: responsiveSettings.gridSize
    })
  }, [responsiveSettings, setCanvasConfig])

  // Handle canvas clicks to add nodes
  const onCanvasClick = useCallback(
    (event: React.MouseEvent) => {
      if (!isDrawingMode || isReadOnly) return

      if (reactFlowInstance && reactFlowWrapper.current) {
        const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect()
        const position = reactFlowInstance.screenToFlowPosition({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        })

        // Snap to grid if enabled
        const finalPosition = config.snapToGrid
          ? snapToGrid(position, config.gridSize)
          : position

        // Check if position is within bounds
        if (isWithinBounds(finalPosition, canvasDimensions)) {
          addNode(finalPosition)
        }
      }
    },
    [isDrawingMode, isReadOnly, reactFlowInstance, config, canvasDimensions, addNode]
  )

  // Node deletion and dimension changes are handled directly by components through the store

  // Handle node selection
  const onSelectionChange = useCallback(
    ({ nodes }: { nodes: Node[] }) => {
      selectNode(nodes.length > 0 ? nodes[0].id : undefined)
    },
    [selectNode]
  )

  // Handle connections (manual edge creation - disabled for auto-connect)
  const onConnect: OnConnect = useCallback(() => {
    // Disabled for now as we use auto-connect
  }, [])

  // Validation state
  const validation = validateLayout()
  const validationSummary = getValidationSummary(validation)
  const guidance = getValidationGuidance(nodes, edges, validation)
  const canComplete = canCompleteLayout()

  // Handle layout completion
  const handleComplete = useCallback(() => {
    if (canComplete) {
      const layoutData = exportLayoutData()
      if (layoutData) {
        onLayoutComplete?.(layoutData)
      }
    }
  }, [canComplete, exportLayoutData, onLayoutComplete])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isReadOnly) return

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
      const metaKey = isMac ? event.metaKey : event.ctrlKey

      if (metaKey && event.key === 'z' && !event.shiftKey) {
        event.preventDefault()
        undo()
      } else if (metaKey && (event.key === 'y' || (event.key === 'z' && event.shiftKey))) {
        event.preventDefault()
        redo()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isReadOnly, undo, redo])

  const canUndo = currentHistoryIndex > 0
  const canRedo = currentHistoryIndex < canvasHistory.length - 1

  return (
    <Card className={cn("bg-white border-3 border-layit-blue", className)}>
      <CardHeader>
        <CardTitle className="text-xl font-bold text-layit-blue flex items-center gap-2">
          <MousePointer2 className="w-6 h-6" />
          DRAW YOUR CUSTOM LAYOUT
        </CardTitle>
        <CardDescription className="font-medium text-layit-blue/70">
          Click to place corner points. Connect them to create your room shape.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Canvas Tools */}
        <div className="flex items-center justify-between bg-layit-yellow/10 border-2 border-layit-yellow p-3">
          <div className="flex items-center gap-2">
            <Grid3x3 className="w-5 h-5 text-layit-blue" />
            <span className="text-sm font-medium text-layit-blue">CANVAS TOOLS</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={undo}
              disabled={!canUndo || isReadOnly}
              className="h-8 px-3 border-layit-blue text-layit-blue hover:bg-layit-yellow disabled:opacity-50"
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="w-4 h-4" />
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={redo}
              disabled={!canRedo || isReadOnly}
              className="h-8 px-3 border-layit-blue text-layit-blue hover:bg-layit-yellow disabled:opacity-50"
              title="Redo (Ctrl+Y)"
            >
              <Redo2 className="w-4 h-4" />
            </Button>

            <Separator orientation="vertical" className="h-6 bg-layit-blue/30" />

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={clearCanvas}
              disabled={nodes.length === 0 || isReadOnly}
              className="h-8 px-3 border-layit-blue text-layit-blue hover:bg-layit-orange hover:text-layit-white disabled:opacity-50"
              title="Clear canvas"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* React Flow Canvas */}
        <div
          ref={reactFlowWrapper}
          className="relative border-3 border-layit-blue rounded-lg overflow-hidden bg-slate-50"
          style={{
            width: canvasDimensions.width,
            height: canvasDimensions.height,
          }}
          role="img"
          aria-label={`Drawing canvas with ${nodes.length} corner points. ${validation.isValid ? 'Layout is valid and complete.' : validationSummary.message}`}
          tabIndex={0}
        >
          <ReactFlow
            nodes={nodes as Node[]}
            edges={edges as Edge[]}
            onNodesChange={() => {}} // Disable React Flow's node management
            onEdgesChange={() => {}} // Disable React Flow's edge management
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onPaneClick={onCanvasClick}
            onSelectionChange={onSelectionChange}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            proOptions={{ hideAttribution: true }}
            panOnDrag={config.panOnDrag}
            selectionOnDrag={config.selectionOnDrag}
            multiSelectionKeyCode={config.multiSelectionKeyCode}
            deleteKeyCode={isReadOnly ? null : config.deleteKeyCode}
            minZoom={0.5}
            maxZoom={2}
            defaultViewport={{ x: 0, y: 0, zoom: 1 }}
            fitView={false}
          >
            {/* Background grid */}
            {config.showGrid && (
              <Background
                variant="dots"
                gap={config.gridSize}
                size={1}
                color="#10375C"
                style={{ opacity: 0.2 }}
              />
            )}

            {/* Controls */}
            <Controls
              showInteractive={false}
              position="bottom-left"
              style={{
                button: {
                  backgroundColor: 'white',
                  border: '2px solid #10375C',
                  color: '#10375C',
                }
              }}
            />

            {/* Custom panels */}
            <Panel position="top-right" className="bg-white/90 rounded-lg p-2">
              <div className="text-xs text-layit-blue/70">
                {nodes.length} point{nodes.length !== 1 ? 's' : ''}
                {validation.area && ` • Area: ${validation.area.toFixed(1)} px²`}
              </div>
            </Panel>

            {/* Node and Edge handlers are integrated through nodeTypes and edgeTypes */}
          </ReactFlow>
        </div>

        {/* Validation Status */}
        <div className={cn(
          "flex items-start gap-3 p-4 border-2 rounded-lg",
          validationSummary.status === 'valid'
            ? "bg-green-50 border-green-200"
            : validationSummary.status === 'invalid'
            ? "bg-red-50 border-red-200"
            : "bg-blue-50 border-blue-200"
        )}>
          <div className="flex-shrink-0 mt-0.5">
            {validationSummary.status === 'valid' && <CheckCircle2 className="w-5 h-5 text-green-600" />}
            {validationSummary.status === 'invalid' && <AlertTriangle className="w-5 h-5 text-red-600" />}
            {validationSummary.status === 'incomplete' && <Info className="w-5 h-5 text-blue-600" />}
          </div>

          <div className="flex-1 min-w-0">
            <h4 className={cn(
              "font-medium",
              validationSummary.status === 'valid' ? "text-green-800" :
              validationSummary.status === 'invalid' ? "text-red-800" : "text-blue-800"
            )}>
              {validationSummary.message}
            </h4>

            {guidance.length > 0 && (
              <ul className={cn(
                "text-sm mt-2 space-y-1",
                validationSummary.status === 'valid' ? "text-green-700" :
                validationSummary.status === 'invalid' ? "text-red-700" : "text-blue-700"
              )}>
                {guidance.map((tip, index) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Complete Button */}
        <AnimatePresence>
          {canComplete && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              <Button
                type="button"
                onClick={handleComplete}
                disabled={isReadOnly}
                className="w-full bg-layit-yellow text-layit-blue hover:bg-layit-orange hover:text-layit-white font-bold uppercase py-3"
              >
                <Check className="w-5 h-5 mr-2" />
                COMPLETE CUSTOM LAYOUT
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Accessibility announcer for screen readers */}
        <CanvasAnnouncer />

        {/* Canvas feedback integration */}
        <CanvasWithFeedback />

        {/* Keyboard shortcuts integration */}
        <KeyboardShortcuts
          reactFlowInstance={reactFlowInstance}
          disabled={isReadOnly}
        />
      </CardContent>
    </Card>
  )
}

// Wrapper component with ReactFlowProvider
export function ReactFlowCanvas(props: ReactFlowCanvasProps) {
  return (
    <ReactFlowProvider>
      <ReactFlowCanvasInner {...props} />
    </ReactFlowProvider>
  )
}