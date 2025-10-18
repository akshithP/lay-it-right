'use client'

import { useCallback, useState, useRef } from 'react'
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
  addEdge,
  Handle,
  Position
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

// Import our custom edge component
import { DimensionEdge } from './DimensionEdge'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MousePointer2, Trash2, CheckCircle, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

// Simple custom node component with proper handles for edge connections
function SimpleCornerNode({ data }: { data: { label: string } }) {
  return (
    <>
      {/* Hidden handles for edge connections - positioned at all sides */}
      <Handle
        type="source"
        position={Position.Top}
        style={{ visibility: 'hidden' }}
        id="top"
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{ visibility: 'hidden' }}
        id="right"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ visibility: 'hidden' }}
        id="bottom"
      />
      <Handle
        type="source"
        position={Position.Left}
        style={{ visibility: 'hidden' }}
        id="left"
      />

      {/* Target handles for receiving connections */}
      <Handle
        type="target"
        position={Position.Top}
        style={{ visibility: 'hidden' }}
        id="top-target"
      />
      <Handle
        type="target"
        position={Position.Right}
        style={{ visibility: 'hidden' }}
        id="right-target"
      />
      <Handle
        type="target"
        position={Position.Bottom}
        style={{ visibility: 'hidden' }}
        id="bottom-target"
      />
      <Handle
        type="target"
        position={Position.Left}
        style={{ visibility: 'hidden' }}
        id="left-target"
      />

      <div className="w-11 h-11 bg-layit-yellow border-3 border-layit-blue rounded-full flex items-center justify-center text-sm font-bold text-layit-blue shadow-lg">
        {data.label}
      </div>
    </>
  )
}

const nodeTypes = {
  cornerNode: SimpleCornerNode,
}

const edgeTypes = {
  dimensionEdge: DimensionEdge,
}

const initialNodes: Node[] = []
const initialEdges: Edge[] = []

interface SimpleReactFlowCanvasProps {
  className?: string
  onLayoutComplete?: (layoutData: { nodes: Node[]; edges: Edge[] }) => void
}

// Shape validation utility
function validateShape(nodes: Node[]): {
  isComplete: boolean
  canComplete: boolean
  status: 'incomplete' | 'ready' | 'complete'
  message: string
} {
  const nodeCount = nodes.length

  if (nodeCount < 3) {
    return {
      isComplete: false,
      canComplete: false,
      status: 'incomplete',
      message: `Need ${3 - nodeCount} more point${3 - nodeCount !== 1 ? 's' : ''} to complete shape`
    }
  }

  if (nodeCount >= 3) {
    return {
      isComplete: true,
      canComplete: true,
      status: 'complete',
      message: 'Shape is complete! You can add more points or continue.'
    }
  }

  return {
    isComplete: false,
    canComplete: true,
    status: 'ready',
    message: 'Shape is ready to complete!'
  }
}

function SimpleReactFlowCanvasInner({
  className,
  onLayoutComplete
}: SimpleReactFlowCanvasProps) {
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null)
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [nodeCounter, setNodeCounter] = useState(0)
  const reactFlowWrapper = useRef<HTMLDivElement>(null)

  // Shape validation state
  const shapeValidation = validateShape(nodes)
  const isShapeValid = shapeValidation.canComplete

  // Handle canvas clicks to add nodes - FIXED coordinate calculation
  const onCanvasClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!reactFlowInstance || !reactFlowWrapper.current) return

      // FIXED: Get the wrapper bounds, not event target bounds
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect()
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      })

      // FIXED: Constrain position within canvas bounds (400px height, full width)
      const constrainedPosition = {
        x: Math.max(50, Math.min(position.x, reactFlowBounds.width - 50)),
        y: Math.max(50, Math.min(position.y, 350)) // 400px height - 50px margin
      }

      const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
      const label = alphabet[nodeCounter % 26]

      const newNode: Node = {
        id: `node-${nodeCounter}`,
        type: 'cornerNode',
        position: constrainedPosition, // Use constrained position
        data: { label },
        draggable: true,
      }

      setNodes((nds) => [...nds, newNode])
      setNodeCounter(prev => prev + 1)

      // Auto-connect nodes - only create edges when we have at least 2 nodes
      const updatedNodes = [...nodes, newNode]

      if (updatedNodes.length >= 2) {
        // Clear existing edges and recreate all connections
        const newEdges: Edge[] = []

        // Connect consecutive nodes with custom edge type
        for (let i = 0; i < updatedNodes.length - 1; i++) {
          newEdges.push({
            id: `edge-${updatedNodes[i].id}-${updatedNodes[i + 1].id}`,
            source: updatedNodes[i].id,
            target: updatedNodes[i + 1].id,
            type: 'dimensionEdge', // Use our custom edge type
            data: {
              unit: 'm' as const,
              isRequired: true,
              canEdit: true,
              isBeingEdited: false
            },
            style: { strokeWidth: 3, stroke: '#10375C' }
          })
        }

        // Close the loop if we have 3+ nodes
        if (updatedNodes.length >= 3) {
          newEdges.push({
            id: `edge-${updatedNodes[updatedNodes.length - 1].id}-${updatedNodes[0].id}`,
            source: updatedNodes[updatedNodes.length - 1].id,
            target: updatedNodes[0].id,
            type: 'dimensionEdge', // Use our custom edge type
            data: {
              unit: 'm' as const,
              isRequired: true,
              canEdit: true,
              isBeingEdited: false
            },
            style: { strokeWidth: 3, stroke: '#10375C' }
          })
        }

        setEdges(newEdges)
      }
    },
    [reactFlowInstance, nodes, nodeCounter, setNodes, setEdges]
  )

  const onConnect: OnConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, style: { strokeWidth: 3, stroke: '#10375C' } }, eds)),
    [setEdges]
  )

  // Enhanced onNodesChange with position constraints for dragging
  const onNodesChangeWithConstraints = useCallback((changes) => {
    const constrainedChanges = changes.map(change => {
      if (change.type === 'position' && change.position && reactFlowWrapper.current) {
        const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect()

        // Apply same constraints as onCanvasClick
        const constrainedPosition = {
          x: Math.max(50, Math.min(change.position.x, reactFlowBounds.width - 50)),
          y: Math.max(50, Math.min(change.position.y, 350)) // 400px height - 50px margin
        }

        return {
          ...change,
          position: constrainedPosition
        }
      }
      return change
    })

    onNodesChange(constrainedChanges)
  }, [onNodesChange])

  const clearCanvas = useCallback(() => {
    setNodes([])
    setEdges([])
    setNodeCounter(0)
  }, [setNodes, setEdges])

  const handleComplete = useCallback(() => {
    if (nodes.length >= 3) {
      onLayoutComplete?.({ nodes, edges })
    }
  }, [nodes, edges, onLayoutComplete])

  return (
    <Card className={cn("bg-white border-3 border-layit-blue", className)}>
      <CardHeader>
        <CardTitle className="text-xl font-bold text-layit-blue flex items-center gap-2">
          <MousePointer2 className="w-6 h-6" />
          DRAW YOUR CUSTOM LAYOUT
        </CardTitle>
        <CardDescription className="font-medium text-layit-blue/70">
          Click to place corner points. They will automatically connect to form your room shape.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Canvas Tools - Enhanced with validation feedback */}
        <div className="flex items-center justify-between bg-layit-yellow/10 border-2 border-layit-yellow p-3 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-layit-blue">
                {nodes.length} corner point{nodes.length !== 1 ? 's' : ''}
              </span>

              {/* Shape status indicator */}
              <Badge
                variant={shapeValidation.status === 'complete' ? 'default' : 'secondary'}
                className={cn(
                  'text-xs',
                  shapeValidation.status === 'complete' ? 'bg-green-100 text-green-800 border-green-300' :
                  shapeValidation.status === 'ready' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                  'bg-gray-100 text-gray-600 border-gray-300'
                )}
              >
                {shapeValidation.status === 'complete' && <CheckCircle className="w-3 h-3 mr-1" />}
                {shapeValidation.status === 'incomplete' && <AlertTriangle className="w-3 h-3 mr-1" />}
                {shapeValidation.status === 'complete' ? 'Complete' :
                 shapeValidation.status === 'ready' ? 'Ready' : 'Building'}
              </Badge>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={clearCanvas}
            disabled={nodes.length === 0}
            className="h-8 px-3 border-layit-blue text-layit-blue hover:bg-layit-orange hover:text-layit-white disabled:opacity-50"
            title="Clear canvas"
          >
            <Trash2 className="w-4 h-4" />
            Clear
          </Button>
        </div>

        {/* React Flow Canvas - FIXED: Added ref for proper coordinate calculation */}
        <div
          ref={reactFlowWrapper}
          className="relative border-3 border-layit-blue rounded-lg overflow-hidden bg-slate-50"
          style={{ width: '100%', height: 400 }}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChangeWithConstraints}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onPaneClick={onCanvasClick}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes} // FIXED: Added custom edge types
            nodesDraggable={true} // Enable node dragging
            proOptions={{ hideAttribution: true }}
            minZoom={0.5}
            maxZoom={2}
            defaultViewport={{ x: 0, y: 0, zoom: 1 }}
            fitView={false}
          >
            <Background
              variant="dots"
              gap={20}
              size={1}
              color="#10375C"
              style={{ opacity: 0.2 }}
            />
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
          </ReactFlow>
        </div>

        {/* Enhanced Status and Complete Button */}
        <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            {shapeValidation.status === 'complete' && <CheckCircle className="w-4 h-4 text-green-600" />}
            {shapeValidation.status === 'incomplete' && <AlertTriangle className="w-4 h-4 text-amber-600" />}
            <span className={cn(
              'text-sm font-medium',
              shapeValidation.status === 'complete' ? 'text-green-700' :
              shapeValidation.status === 'ready' ? 'text-blue-700' :
              'text-layit-blue/70'
            )}>
              {shapeValidation.message}
            </span>
          </div>

          {isShapeValid && (
            <Button
              type="button"
              onClick={handleComplete}
              className={cn(
                'font-bold uppercase transition-all duration-200',
                shapeValidation.status === 'complete'
                  ? 'bg-green-600 text-white hover:bg-green-700 hover:shadow-lg'
                  : 'bg-layit-yellow text-layit-blue hover:bg-layit-orange hover:text-layit-white'
              )}
              disabled={!isShapeValid}
            >
              {shapeValidation.status === 'complete' ? '✓ Complete Layout' : 'Complete Layout'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Wrapper component with ReactFlowProvider
export function SimpleReactFlowCanvas(props: SimpleReactFlowCanvasProps) {
  return (
    <ReactFlowProvider>
      <SimpleReactFlowCanvasInner {...props} />
    </ReactFlowProvider>
  )
}