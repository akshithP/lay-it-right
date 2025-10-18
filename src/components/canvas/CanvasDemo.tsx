'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutCanvas } from './LayoutCanvas';
import { useLayoutStore } from '../../stores/layout-store';
import { Point, convertArea, convertLength } from '../../../packages/tiling-engine/src/geometry';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';

interface CanvasDemoProps {
  className?: string;
}

export function CanvasDemo({ className = '' }: CanvasDemoProps) {
  const {
    currentPolygon,
    isDrawing,
    isEditing,
    area,
    perimeter,
    isValid,
    history,
    historyIndex,
    showGrid,
    showMeasurements,
    pixelsPerMm,
    setPolygon,
    clearPolygon,
    undo,
    redo,
    setShowGrid,
    setShowMeasurements,
  } = useLayoutStore();

  const [selectedUnit, setSelectedUnit] = useState<'mm' | 'cm' | 'm'>('mm');

  // Handle polygon changes from canvas
  const handlePolygonChange = useCallback((vertices: Point[]) => {
    // The canvas handles the polygon updates via the store
  }, []);

  // Handle drawing state changes
  const handleDrawingStateChange = useCallback((drawing: boolean) => {
    // The canvas updates the store directly
  }, []);

  // Calculate display values
  const displayArea = area > 0 ? convertArea(area, selectedUnit === 'cm' ? 'cm2' : selectedUnit === 'm' ? 'm2' : 'mm²' as any) : 0;
  const displayPerimeter = perimeter > 0 ? convertLength(perimeter, selectedUnit) : 0;

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return (
    <div className={`w-full h-full flex flex-col lg:flex-row gap-6 ${className}`}>
      {/* Canvas Area */}
      <div className="flex-1 min-h-[600px]">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Layout Canvas</span>
              <div className="flex items-center gap-2">
                <Badge variant={isDrawing ? 'default' : isEditing ? 'secondary' : 'outline'}>
                  {isDrawing ? 'Drawing' : isEditing ? 'Editing' : 'Ready'}
                </Badge>
                {isValid && (
                  <Badge variant="success" className="bg-green-100 text-green-800">
                    Valid Polygon
                  </Badge>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <LayoutCanvas
              width={800}
              height={600}
              pixelsPerMm={pixelsPerMm}
              onPolygonChange={handlePolygonChange}
              onDrawingStateChange={handleDrawingStateChange}
              className="border rounded-lg overflow-hidden"
            />
          </CardContent>
        </Card>
      </div>

      {/* Controls & Info Panel */}
      <div className="w-full lg:w-80 space-y-6">
        {/* Drawing Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Drawing Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={clearPolygon}
                disabled={!currentPolygon}
                size="sm"
              >
                Clear
              </Button>
              <Button
                variant="outline"
                onClick={undo}
                disabled={!canUndo}
                size="sm"
              >
                Undo
              </Button>
              <Button
                variant="outline"
                onClick={redo}
                disabled={!canRedo}
                size="sm"
              >
                Redo
              </Button>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label htmlFor="show-grid" className="text-sm font-medium">
                  Show Grid
                </label>
                <input
                  id="show-grid"
                  type="checkbox"
                  checked={showGrid}
                  onChange={(e) => setShowGrid(e.target.checked)}
                  className="rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <label htmlFor="show-measurements" className="text-sm font-medium">
                  Show Measurements
                </label>
                <input
                  id="show-measurements"
                  type="checkbox"
                  checked={showMeasurements}
                  onChange={(e) => setShowMeasurements(e.target.checked)}
                  className="rounded"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Display Unit</label>
                <div className="flex gap-1">
                  {(['mm', 'cm', 'm'] as const).map((unit) => (
                    <Button
                      key={unit}
                      variant={selectedUnit === unit ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedUnit(unit)}
                      className="px-2"
                    >
                      {unit}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Polygon Information */}
        <AnimatePresence>
          {currentPolygon && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Polygon Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="font-medium text-gray-500">Vertices</div>
                      <div className="text-lg font-semibold">
                        {currentPolygon.vertices.length}
                      </div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-500">Status</div>
                      <div className="text-lg font-semibold">
                        {currentPolygon.isComplete ? 'Complete' : 'Drawing'}
                      </div>
                    </div>
                  </div>

                  {currentPolygon.isComplete && (
                    <>
                      <Separator />

                      <div className="space-y-3">
                        <div>
                          <div className="font-medium text-gray-500">
                            Area ({selectedUnit}²)
                          </div>
                          <div className="text-xl font-bold text-blue-600">
                            {displayArea.toLocaleString(undefined, {
                              maximumFractionDigits: 2
                            })}
                          </div>
                        </div>

                        <div>
                          <div className="font-medium text-gray-500">
                            Perimeter ({selectedUnit})
                          </div>
                          <div className="text-xl font-bold text-green-600">
                            {displayPerimeter.toLocaleString(undefined, {
                              maximumFractionDigits: 2
                            })}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>How to Use</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold mt-0.5">
                  1
                </div>
                <div>Click on the canvas to start placing points for your layout</div>
              </div>

              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold mt-0.5">
                  2
                </div>
                <div>Continue clicking to add more vertices (minimum 3 required)</div>
              </div>

              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold mt-0.5">
                  3
                </div>
                <div>Click on the first point (green) to close the polygon</div>
              </div>

              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold mt-0.5">
                  4
                </div>
                <div>Drag vertices to adjust the shape after completion</div>
              </div>

              <div className="flex items-start gap-2 mt-4 pt-3 border-t">
                <div className="text-yellow-600">💡</div>
                <div>Press <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Escape</kbd> to cancel drawing</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technical Info */}
        {process.env.NODE_ENV === 'development' && currentPolygon && (
          <Card>
            <CardHeader>
              <CardTitle>Technical Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-xs text-gray-500 font-mono">
                <div>Scale: {pixelsPerMm} px/mm</div>
                <div>History: {historyIndex + 1}/{history.length}</div>
                <div>Valid: {isValid ? 'Yes' : 'No'}</div>
                {currentPolygon.area && (
                  <div>Area (raw): {currentPolygon.area.toFixed(2)} mm²</div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}