'use client'

import { useRef, useState, useCallback } from 'react'
import { ReactSketchCanvas, type ReactSketchCanvasRef } from 'react-sketch-canvas'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  UndoIcon,
  RedoIcon,
  Trash2Icon,
  CheckIcon,
  RulerIcon,
  TouchIcon,
  MousePointerIcon,
  Edit3Icon
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useProjectStore } from '@/store/project-store'
import { cn } from '@/lib/utils'
import type { CustomLayoutPoint } from '@/types'

interface DrawingCanvasProps {
  className?: string
  onLayoutComplete?: (points: CustomLayoutPoint[]) => void
}

export function DrawingCanvas({ className, onLayoutComplete }: DrawingCanvasProps) {
  const canvasRef = useRef<ReactSketchCanvasRef>(null)
  const { setLayoutShape } = useProjectStore()

  const [isDrawing, setIsDrawing] = useState(false)
  const [strokeWidth, setStrokeWidth] = useState(3)
  const [canvasSize, setCanvasSize] = useState({ width: 600, height: 400 })

  const handleClear = useCallback(() => {
    canvasRef.current?.clearCanvas()
    setIsDrawing(false)
  }, [])

  const handleUndo = useCallback(() => {
    canvasRef.current?.undo()
  }, [])

  const handleRedo = useCallback(() => {
    canvasRef.current?.redo()
  }, [])

  const handleComplete = useCallback(async () => {
    if (!canvasRef.current) return

    try {
      // Export the drawing as SVG
      const svgString = await canvasRef.current.exportSvg()

      // Parse SVG to extract path points (simplified for demo)
      // In a production app, you'd want more sophisticated path analysis
      const mockPoints: CustomLayoutPoint[] = [
        { x: 50, y: 50 },
        { x: 350, y: 50 },
        { x: 350, y: 300 },
        { x: 50, y: 300 }
      ]

      // Mark as custom layout and trigger callback
      setLayoutShape('custom')
      onLayoutComplete?.(mockPoints)

    } catch (error) {
      console.error('Failed to process drawing:', error)
    }
  }, [setLayoutShape, onLayoutComplete])

  const canvasStyles = {
    border: '4px solid theme(colors.layit.blue)',
    borderRadius: '0px',
    backgroundColor: '#F4F6FF'
  }

  return (
    <Card className={cn("bg-layit-white border-4 border-layit-blue", className)}>
      <CardHeader>
        <CardTitle className="text-xl font-bold text-layit-blue flex items-center gap-2">
          <Edit3Icon className="w-6 h-6" />
          DRAW YOUR ROOM LAYOUT
        </CardTitle>
        <CardDescription className="font-medium text-layit-blue/70">
          Draw the outline of your room. Start from any corner and create a closed shape.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Drawing Tools */}
        <div className="flex items-center justify-between bg-layit-yellow/10 border-2 border-layit-yellow p-4">
          <div className="flex items-center gap-2">
            <RulerIcon className="w-5 h-5 text-layit-blue" />
            <span className="text-sm font-medium text-layit-blue">DRAWING TOOLS</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Stroke Width */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-layit-blue font-medium">LINE:</span>
              {[2, 3, 5].map((width) => (
                <button
                  key={width}
                  onClick={() => setStrokeWidth(width)}
                  className={cn(
                    "w-8 h-8 rounded border-2 border-layit-blue flex items-center justify-center",
                    strokeWidth === width
                      ? "bg-layit-orange text-layit-white"
                      : "bg-layit-white text-layit-blue hover:bg-layit-yellow"
                  )}
                >
                  <div
                    className="rounded-full bg-current"
                    style={{
                      width: `${width * 2}px`,
                      height: `${width * 2}px`
                    }}
                  />
                </button>
              ))}
            </div>

            <Separator orientation="vertical" className="h-6 bg-layit-blue/30" />

            {/* Action Buttons */}
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleUndo}
                className="h-8 px-3 border-layit-blue text-layit-blue hover:bg-layit-yellow"
              >
                <UndoIcon className="w-4 h-4" />
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRedo}
                className="h-8 px-3 border-layit-blue text-layit-blue hover:bg-layit-yellow"
              >
                <RedoIcon className="w-4 h-4" />
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClear}
                className="h-8 px-3 border-layit-blue text-layit-blue hover:bg-layit-orange hover:text-layit-white"
              >
                <Trash2Icon className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Drawing Canvas */}
        <div className="relative">
          <ReactSketchCanvas
            ref={canvasRef}
            style={canvasStyles}
            width={canvasSize.width.toString()}
            height={canvasSize.height.toString()}
            strokeWidth={strokeWidth}
            strokeColor="#10375C"
            canvasColor="transparent"
            allowOnlyPointerType="all"
            onStroke={() => setIsDrawing(true)}
          />

          {/* Overlay instructions for first time users */}
          {!isDrawing && (
            <motion.div
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <div className="text-center bg-layit-white/90 p-6 border-2 border-dashed border-layit-blue/50">
                <TouchIcon className="w-8 h-8 text-layit-blue/70 mx-auto mb-2" />
                <p className="text-sm font-medium text-layit-blue/70">
                  TAP OR CLICK TO START DRAWING
                </p>
                <p className="text-xs text-layit-blue/50 mt-1">
                  Draw the outline of your room layout
                </p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Drawing Tips */}
        <div className="bg-layit-blue/5 border-2 border-layit-blue/20 p-4">
          <h4 className="font-medium text-layit-blue mb-2 flex items-center gap-2">
            <MousePointerIcon className="w-4 h-4" />
            DRAWING TIPS
          </h4>
          <ul className="text-sm text-layit-blue/70 space-y-1">
            <li>• Draw a continuous line to create your room outline</li>
            <li>• Start and end at the same point to close the shape</li>
            <li>• Works with mouse, touch, and stylus input</li>
            <li>• Use undo/redo to make corrections</li>
          </ul>
        </div>

        {/* Complete Drawing */}
        {isDrawing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Button
              type="button"
              onClick={handleComplete}
              className="w-full bg-layit-yellow text-layit-blue hover:bg-layit-orange hover:text-layit-white font-bold uppercase"
            >
              <CheckIcon className="w-5 h-5 mr-2" />
              COMPLETE LAYOUT DRAWING
            </Button>
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}