/**
 * Core Geometry System for LayItRight Tiling Engine
 *
 * Provides pure geometry functions for polygon calculation, validation, and transformations.
 * Uses millimeters as base units with pixel conversion utilities.
 */

// Base unit: millimeters
export const MM_PER_INCH = 25.4;
export const MM_PER_CM = 10;
export const MM_PER_M = 1000;
export const MM_PER_FT = 304.8;

// Canvas constants
export const DEFAULT_PIXELS_PER_MM = 2; // 2 pixels per mm for reasonable canvas size

/**
 * Point interface for 2D coordinates
 */
export interface Point {
  x: number; // in millimeters
  y: number; // in millimeters
}

/**
 * Canvas point interface for pixel coordinates
 */
export interface CanvasPoint {
  x: number; // in pixels
  y: number; // in pixels
}

/**
 * Polygon interface for storing vertex data
 */
export interface Polygon {
  vertices: Point[];
  isComplete: boolean;
  area?: number; // cached area in mm²
  perimeter?: number; // cached perimeter in mm
}

/**
 * Canvas bounds interface
 */
export interface CanvasBounds {
  width: number; // in pixels
  height: number; // in pixels
  pixelsPerMm: number;
}

/**
 * Convert millimeters to pixels
 */
export function mmToPixels(mm: number, pixelsPerMm: number = DEFAULT_PIXELS_PER_MM): number {
  return mm * pixelsPerMm;
}

/**
 * Convert pixels to millimeters
 */
export function pixelsToMm(pixels: number, pixelsPerMm: number = DEFAULT_PIXELS_PER_MM): number {
  return pixels / pixelsPerMm;
}

/**
 * Convert point from mm to pixels
 */
export function pointToCanvas(point: Point, pixelsPerMm: number = DEFAULT_PIXELS_PER_MM): CanvasPoint {
  return {
    x: mmToPixels(point.x, pixelsPerMm),
    y: mmToPixels(point.y, pixelsPerMm),
  };
}

/**
 * Convert point from pixels to mm
 */
export function canvasToPoint(canvasPoint: CanvasPoint, pixelsPerMm: number = DEFAULT_PIXELS_PER_MM): Point {
  return {
    x: pixelsToMm(canvasPoint.x, pixelsPerMm),
    y: pixelsToMm(canvasPoint.y, pixelsPerMm),
  };
}

/**
 * Calculate distance between two points
 */
export function calculateDistance(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate the length of a polygon edge
 */
export function calculateEdgeLength(p1: Point, p2: Point): number {
  return calculateDistance(p1, p2);
}

/**
 * Calculate polygon area using the shoelace formula
 * Returns area in square millimeters
 */
export function calculatePolygonArea(vertices: Point[]): number {
  if (vertices.length < 3) return 0;

  let area = 0;
  const n = vertices.length;

  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += vertices[i].x * vertices[j].y;
    area -= vertices[j].x * vertices[i].y;
  }

  return Math.abs(area) / 2;
}

/**
 * Calculate polygon perimeter
 * Returns perimeter in millimeters
 * For incomplete polygons (< 3 vertices), returns sum of line segments
 * For complete polygons (>= 3 vertices), returns full perimeter including closing edge
 */
export function calculatePolygonPerimeter(vertices: Point[], isComplete: boolean = true): number {
  if (vertices.length < 2) return 0;

  let perimeter = 0;
  const n = vertices.length;

  // For incomplete polygons or when explicitly specified, don't close the shape
  const shouldClose = isComplete && n >= 3;
  const edgeCount = shouldClose ? n : n - 1;

  for (let i = 0; i < edgeCount; i++) {
    const j = shouldClose ? (i + 1) % n : i + 1;
    perimeter += calculateDistance(vertices[i], vertices[j]);
  }

  return perimeter;
}

/**
 * Check if a polygon is valid (has at least 3 vertices and forms a closed shape)
 */
export function isValidPolygon(vertices: Point[]): boolean {
  if (vertices.length < 3) return false;

  // Check for duplicate points
  for (let i = 0; i < vertices.length; i++) {
    for (let j = i + 1; j < vertices.length; j++) {
      if (calculateDistance(vertices[i], vertices[j]) < 0.1) { // 0.1mm tolerance
        return false;
      }
    }
  }

  // Check if polygon is self-intersecting (basic check)
  // For production, this could be enhanced with more sophisticated intersection detection
  return true;
}

/**
 * Check if a point is close to another point within tolerance
 */
export function isPointNear(p1: Point, p2: Point, toleranceMm: number = 5): boolean {
  return calculateDistance(p1, p2) <= toleranceMm;
}

/**
 * Check if a canvas point is close to another canvas point within pixel tolerance
 */
export function isCanvasPointNear(p1: CanvasPoint, p2: CanvasPoint, tolerancePixels: number = 10): boolean {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy) <= tolerancePixels;
}

/**
 * Validate point is within canvas bounds
 */
export function isPointInBounds(point: CanvasPoint, bounds: CanvasBounds): boolean {
  return (
    point.x >= 0 &&
    point.y >= 0 &&
    point.x <= bounds.width &&
    point.y <= bounds.height
  );
}

/**
 * Constrain point to canvas bounds
 */
export function constrainPointToBounds(point: CanvasPoint, bounds: CanvasBounds): CanvasPoint {
  return {
    x: Math.max(0, Math.min(bounds.width, point.x)),
    y: Math.max(0, Math.min(bounds.height, point.y)),
  };
}

/**
 * Calculate polygon centroid
 */
export function calculatePolygonCentroid(vertices: Point[]): Point {
  if (vertices.length === 0) return { x: 0, y: 0 };

  const sum = vertices.reduce(
    (acc, vertex) => ({
      x: acc.x + vertex.x,
      y: acc.y + vertex.y,
    }),
    { x: 0, y: 0 }
  );

  return {
    x: sum.x / vertices.length,
    y: sum.y / vertices.length,
  };
}

/**
 * Convert area from square millimeters to other units
 */
export function convertArea(areaMm2: number, unit: 'cm2' | 'm2' | 'in2' | 'ft2'): number {
  switch (unit) {
    case 'cm2':
      return areaMm2 / 100; // 10mm x 10mm = 100mm²
    case 'm2':
      return areaMm2 / 1_000_000; // 1000mm x 1000mm = 1,000,000mm²
    case 'in2':
      return areaMm2 / (MM_PER_INCH * MM_PER_INCH); // 25.4mm x 25.4mm
    case 'ft2':
      return areaMm2 / (MM_PER_FT * MM_PER_FT); // 304.8mm x 304.8mm
    default:
      return areaMm2;
  }
}

/**
 * Convert length from millimeters to other units
 */
export function convertLength(lengthMm: number, unit: 'cm' | 'm' | 'in' | 'ft'): number {
  switch (unit) {
    case 'cm':
      return lengthMm / MM_PER_CM;
    case 'm':
      return lengthMm / MM_PER_M;
    case 'in':
      return lengthMm / MM_PER_INCH;
    case 'ft':
      return lengthMm / MM_PER_FT;
    default:
      return lengthMm;
  }
}

/**
 * Create a polygon with calculated properties
 */
export function createPolygon(vertices: Point[]): Polygon {
  const isComplete = vertices.length >= 3;

  return {
    vertices,
    isComplete,
    area: isComplete ? calculatePolygonArea(vertices) : undefined,
    perimeter: vertices.length >= 2 ? calculatePolygonPerimeter(vertices, isComplete) : undefined,
  };
}

/**
 * Update polygon properties after vertex changes
 */
export function updatePolygon(polygon: Polygon): Polygon {
  const isComplete = polygon.vertices.length >= 3;

  return {
    ...polygon,
    isComplete,
    area: isComplete ? calculatePolygonArea(polygon.vertices) : undefined,
    perimeter: polygon.vertices.length >= 2 ? calculatePolygonPerimeter(polygon.vertices, isComplete) : undefined,
  };
}