/**
 * LayItRight Tiling Engine
 *
 * Core geometry and tiling calculation system for production-ready polygon drawing.
 */

export * from './geometry';

// Re-export key types for easy access
export type {
  Point,
  CanvasPoint,
  Polygon,
  CanvasBounds,
} from './geometry';