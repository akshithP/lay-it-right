'use client';

import { useCallback, useRef, useEffect, useState } from 'react';
import { Stage, Layer, Line, Circle } from 'react-konva';
import Konva from 'konva';
import { motion } from 'framer-motion';
import {
  Point,
  CanvasPoint,
  CanvasBounds,
  pointToCanvas,
  canvasToPoint,
  isCanvasPointNear,
  constrainPointToBounds,
  calculateDistance,
  DEFAULT_PIXELS_PER_MM,
} from '../../../packages/tiling-engine/src/geometry';
import { VertexNode } from './VertexNode';

export interface LayoutCanvasProps {
  width?: number;
  height?: number;
  pixelsPerMm?: number;
  onPolygonChange?: (vertices: Point[]) => void;
  onDrawingStateChange?: (isDrawing: boolean) => void;
  className?: string;
  readOnly?: boolean;
}

interface DrawingState {
  isDrawing: boolean;
  currentVertices: Point[];
  isComplete: boolean;
  hoveredVertexIndex: number | null;
}

export function LayoutCanvas({
  width = 800,
  height = 600,
  pixelsPerMm = DEFAULT_PIXELS_PER_MM,
  onPolygonChange,
  onDrawingStateChange,
  className = '',
  readOnly = false,
}: LayoutCanvasProps) {
  const stageRef = useRef<Konva.Stage>(null);

  const [drawingState, setDrawingState] = useState<DrawingState>({
    isDrawing: false,
    currentVertices: [],
    isComplete: false,
    hoveredVertexIndex: null,
  });

  const [canvasBounds] = useState<CanvasBounds>({
    width,
    height,
    pixelsPerMm,
  });

  // Convert vertices to canvas points for display
  const canvasVertices = drawingState.currentVertices.map(vertex =>
    pointToCanvas(vertex, pixelsPerMm)
  );

  // Handle stage click for point placement
  const handleStageClick = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (readOnly) return;

    const stage = e.target.getStage();
    if (!stage) return;

    const pos = stage.getPointerPosition();
    if (!pos) return;

    // Check if we're clicking on a vertex (higher priority)
    if (e.target !== stage) return;

    const canvasPoint: CanvasPoint = { x: pos.x, y: pos.y };
    const constrainedPoint = constrainPointToBounds(canvasPoint, canvasBounds);
    const mmPoint = canvasToPoint(constrainedPoint, pixelsPerMm);

    setDrawingState(prev => {
      // If not drawing, start new polygon
      if (!prev.isDrawing) {
        onDrawingStateChange?.(true);
        return {
          ...prev,
          isDrawing: true,
          currentVertices: [mmPoint],
          isComplete: false,
        };
      }

      // Check if clicking near first vertex to close polygon
      if (prev.currentVertices.length >= 3) {
        const firstCanvasPoint = pointToCanvas(prev.currentVertices[0], pixelsPerMm);
        if (isCanvasPointNear(constrainedPoint, firstCanvasPoint, 15)) {
          const completedVertices = [...prev.currentVertices];
          onPolygonChange?.(completedVertices);
          onDrawingStateChange?.(false);
          return {
            ...prev,
            isDrawing: false,
            isComplete: true,
          };
        }
      }

      // Add new vertex
      const newVertices = [...prev.currentVertices, mmPoint];
      onPolygonChange?.(newVertices);
      return {
        ...prev,
        currentVertices: newVertices,
      };
    });
  }, [readOnly, canvasBounds, pixelsPerMm, onPolygonChange, onDrawingStateChange]);

  // Handle vertex drag
  const handleVertexDrag = useCallback((index: number, newCanvasPoint: CanvasPoint) => {
    const constrainedPoint = constrainPointToBounds(newCanvasPoint, canvasBounds);
    const newMmPoint = canvasToPoint(constrainedPoint, pixelsPerMm);

    setDrawingState(prev => {
      const newVertices = [...prev.currentVertices];
      newVertices[index] = newMmPoint;
      onPolygonChange?.(newVertices);
      return {
        ...prev,
        currentVertices: newVertices,
      };
    });
  }, [canvasBounds, pixelsPerMm, onPolygonChange]);

  // Handle vertex hover
  const handleVertexHover = useCallback((index: number | null) => {
    setDrawingState(prev => ({
      ...prev,
      hoveredVertexIndex: index,
    }));
  }, []);

  // Generate line points for rendering
  const linePoints = canvasVertices.length >= 2
    ? canvasVertices.flatMap(point => [point.x, point.y])
    : [];

  // Add line back to first point if polygon is complete
  const closedLinePoints = drawingState.isComplete && canvasVertices.length >= 3
    ? [...linePoints, canvasVertices[0].x, canvasVertices[0].y]
    : linePoints;

  // Handle mouse move for preview line
  const [previewLine, setPreviewLine] = useState<number[]>([]);

  const handleStageMouseMove = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!drawingState.isDrawing || drawingState.currentVertices.length === 0) {
      setPreviewLine([]);
      return;
    }

    const stage = e.target.getStage();
    const pos = stage?.getPointerPosition();
    if (!pos) return;

    const lastVertex = canvasVertices[canvasVertices.length - 1];
    setPreviewLine([lastVertex.x, lastVertex.y, pos.x, pos.y]);
  }, [drawingState.isDrawing, drawingState.currentVertices.length, canvasVertices]);

  // Handle escape key to cancel drawing
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && drawingState.isDrawing) {
        setDrawingState(prev => ({
          ...prev,
          isDrawing: false,
          currentVertices: [],
          isComplete: false,
        }));
        onDrawingStateChange?.(false);
        onPolygonChange?.([]);
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [drawingState.isDrawing, onDrawingStateChange, onPolygonChange]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`relative ${className}`}
      style={{ width, height }}
    >
      {/* Drawing Instructions */}
      <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg max-w-xs">
        <div className="text-sm text-gray-700">
          {!drawingState.isDrawing && !drawingState.isComplete && (
            <p>Click to start drawing your layout</p>
          )}
          {drawingState.isDrawing && drawingState.currentVertices.length < 3 && (
            <p>Click to add points (minimum 3 required)</p>
          )}
          {drawingState.isDrawing && drawingState.currentVertices.length >= 3 && (
            <p>Click first point to close polygon or add more points</p>
          )}
          {drawingState.isComplete && (
            <p>Polygon complete! Drag vertices to adjust shape</p>
          )}
          {drawingState.isDrawing && (
            <p className="text-xs text-gray-500 mt-1">Press Escape to cancel</p>
          )}
        </div>
      </div>

      {/* Canvas Stats */}
      {drawingState.currentVertices.length > 0 && (
        <div className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
          <div className="text-sm text-gray-700">
            <p>Vertices: {drawingState.currentVertices.length}</p>
            {drawingState.currentVertices.length >= 2 && (
              <p>
                Last edge: {Math.round(
                  calculateDistance(
                    drawingState.currentVertices[drawingState.currentVertices.length - 1],
                    drawingState.currentVertices[drawingState.currentVertices.length - 2]
                  )
                )}mm
              </p>
            )}
          </div>
        </div>
      )}

      {/* Konva Stage */}
      <Stage
        ref={stageRef}
        width={width}
        height={height}
        onClick={handleStageClick}
        onMouseMove={handleStageMouseMove}
        style={{ cursor: drawingState.isDrawing ? 'crosshair' : 'default' }}
      >
        <Layer>
          {/* Grid background */}
          {Array.from({ length: Math.ceil(width / 50) }, (_, i) => (
            <Line
              key={`v-${i}`}
              points={[i * 50, 0, i * 50, height]}
              stroke="#f0f0f0"
              strokeWidth={1}
            />
          ))}
          {Array.from({ length: Math.ceil(height / 50) }, (_, i) => (
            <Line
              key={`h-${i}`}
              points={[0, i * 50, width, i * 50]}
              stroke="#f0f0f0"
              strokeWidth={1}
            />
          ))}

          {/* Main polygon lines */}
          {closedLinePoints.length >= 4 && (
            <Line
              points={closedLinePoints}
              stroke={drawingState.isComplete ? '#3b82f6' : '#6b7280'}
              strokeWidth={drawingState.isComplete ? 3 : 2}
              closed={drawingState.isComplete}
              fill={drawingState.isComplete ? 'rgba(59, 130, 246, 0.1)' : undefined}
            />
          )}

          {/* Preview line while drawing */}
          {previewLine.length === 4 && (
            <Line
              points={previewLine}
              stroke="#9ca3af"
              strokeWidth={2}
              dash={[5, 5]}
            />
          )}

          {/* First vertex highlight (for closing polygon) */}
          {drawingState.isDrawing && canvasVertices.length >= 3 && (
            <Circle
              x={canvasVertices[0].x}
              y={canvasVertices[0].y}
              radius={12}
              fill="rgba(34, 197, 94, 0.2)"
              stroke="#22c55e"
              strokeWidth={2}
            />
          )}

          {/* Vertex nodes */}
          {canvasVertices.map((vertex, index) => (
            <VertexNode
              key={`vertex-${index}`}
              x={vertex.x}
              y={vertex.y}
              index={index}
              isFirst={index === 0}
              isHovered={drawingState.hoveredVertexIndex === index}
              canDrag={!readOnly}
              onDrag={handleVertexDrag}
              onHover={handleVertexHover}
            />
          ))}
        </Layer>
      </Stage>
    </motion.div>
  );
}