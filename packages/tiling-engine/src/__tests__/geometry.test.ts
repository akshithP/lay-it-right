/**
 * Unit tests for LayItRight Tiling Engine Geometry Functions
 */

import {
  Point,
  CanvasPoint,
  Polygon,
  CanvasBounds,
  mmToPixels,
  pixelsToMm,
  pointToCanvas,
  canvasToPoint,
  calculateDistance,
  calculateEdgeLength,
  calculatePolygonArea,
  calculatePolygonPerimeter,
  isValidPolygon,
  isPointNear,
  isCanvasPointNear,
  isPointInBounds,
  constrainPointToBounds,
  calculatePolygonCentroid,
  convertArea,
  convertLength,
  createPolygon,
  updatePolygon,
  DEFAULT_PIXELS_PER_MM,
  MM_PER_INCH,
  MM_PER_CM,
  MM_PER_M,
  MM_PER_FT,
} from '../geometry';

describe('Geometry Functions', () => {
  // Test constants
  describe('Constants', () => {
    test('should have correct conversion constants', () => {
      expect(MM_PER_INCH).toBe(25.4);
      expect(MM_PER_CM).toBe(10);
      expect(MM_PER_M).toBe(1000);
      expect(MM_PER_FT).toBe(304.8);
      expect(DEFAULT_PIXELS_PER_MM).toBe(2);
    });
  });

  // Test unit conversions
  describe('Unit Conversions', () => {
    test('mmToPixels should convert correctly', () => {
      expect(mmToPixels(10, 2)).toBe(20);
      expect(mmToPixels(50, 1)).toBe(50);
      expect(mmToPixels(0, 2)).toBe(0);
    });

    test('pixelsToMm should convert correctly', () => {
      expect(pixelsToMm(20, 2)).toBe(10);
      expect(pixelsToMm(50, 1)).toBe(50);
      expect(pixelsToMm(0, 2)).toBe(0);
    });

    test('pointToCanvas should convert point correctly', () => {
      const point: Point = { x: 10, y: 20 };
      const canvasPoint = pointToCanvas(point, 2);
      expect(canvasPoint).toEqual({ x: 20, y: 40 });
    });

    test('canvasToPoint should convert canvas point correctly', () => {
      const canvasPoint: CanvasPoint = { x: 20, y: 40 };
      const point = canvasToPoint(canvasPoint, 2);
      expect(point).toEqual({ x: 10, y: 20 });
    });

    test('should use default pixels per mm', () => {
      expect(mmToPixels(10)).toBe(20); // Uses DEFAULT_PIXELS_PER_MM = 2
      expect(pixelsToMm(20)).toBe(10);
    });
  });

  // Test distance calculations
  describe('Distance Calculations', () => {
    test('calculateDistance should compute correct distance', () => {
      const p1: Point = { x: 0, y: 0 };
      const p2: Point = { x: 3, y: 4 };
      expect(calculateDistance(p1, p2)).toBe(5); // 3-4-5 triangle
    });

    test('calculateDistance should handle same point', () => {
      const p1: Point = { x: 5, y: 5 };
      const p2: Point = { x: 5, y: 5 };
      expect(calculateDistance(p1, p2)).toBe(0);
    });

    test('calculateEdgeLength should be same as calculateDistance', () => {
      const p1: Point = { x: 0, y: 0 };
      const p2: Point = { x: 6, y: 8 };
      expect(calculateEdgeLength(p1, p2)).toBe(10); // 6-8-10 triangle
      expect(calculateEdgeLength(p1, p2)).toBe(calculateDistance(p1, p2));
    });
  });

  // Test polygon calculations
  describe('Polygon Calculations', () => {
    test('calculatePolygonArea should compute area of square', () => {
      const vertices: Point[] = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
        { x: 0, y: 10 },
      ];
      expect(calculatePolygonArea(vertices)).toBe(100);
    });

    test('calculatePolygonArea should compute area of triangle', () => {
      const vertices: Point[] = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 5, y: 10 },
      ];
      expect(calculatePolygonArea(vertices)).toBe(50);
    });

    test('calculatePolygonArea should return 0 for insufficient vertices', () => {
      expect(calculatePolygonArea([])).toBe(0);
      expect(calculatePolygonArea([{ x: 0, y: 0 }])).toBe(0);
      expect(calculatePolygonArea([{ x: 0, y: 0 }, { x: 1, y: 1 }])).toBe(0);
    });

    test('calculatePolygonPerimeter should compute perimeter of square', () => {
      const vertices: Point[] = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
        { x: 0, y: 10 },
      ];
      expect(calculatePolygonPerimeter(vertices)).toBe(40);
    });

    test('calculatePolygonPerimeter should compute perimeter of triangle', () => {
      const vertices: Point[] = [
        { x: 0, y: 0 },
        { x: 3, y: 0 },
        { x: 0, y: 4 },
      ];
      expect(calculatePolygonPerimeter(vertices)).toBe(12); // 3 + 4 + 5
    });

    test('calculatePolygonPerimeter should return 0 for insufficient vertices', () => {
      expect(calculatePolygonPerimeter([])).toBe(0);
      expect(calculatePolygonPerimeter([{ x: 0, y: 0 }])).toBe(0);
    });
  });

  // Test polygon validation
  describe('Polygon Validation', () => {
    test('isValidPolygon should return true for valid polygons', () => {
      const validSquare: Point[] = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
        { x: 0, y: 10 },
      ];
      expect(isValidPolygon(validSquare)).toBe(true);
    });

    test('isValidPolygon should return false for insufficient vertices', () => {
      expect(isValidPolygon([])).toBe(false);
      expect(isValidPolygon([{ x: 0, y: 0 }])).toBe(false);
      expect(isValidPolygon([{ x: 0, y: 0 }, { x: 1, y: 1 }])).toBe(false);
    });

    test('isValidPolygon should return false for duplicate points', () => {
      const duplicateVertices: Point[] = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 0, y: 0 }, // Duplicate of first point
      ];
      expect(isValidPolygon(duplicateVertices)).toBe(false);
    });
  });

  // Test proximity checks
  describe('Proximity Checks', () => {
    test('isPointNear should detect nearby points', () => {
      const p1: Point = { x: 0, y: 0 };
      const p2: Point = { x: 3, y: 0 };
      const p3: Point = { x: 10, y: 0 };

      expect(isPointNear(p1, p2, 5)).toBe(true);
      expect(isPointNear(p1, p3, 5)).toBe(false);
    });

    test('isCanvasPointNear should detect nearby canvas points', () => {
      const cp1: CanvasPoint = { x: 0, y: 0 };
      const cp2: CanvasPoint = { x: 5, y: 0 };
      const cp3: CanvasPoint = { x: 20, y: 0 };

      expect(isCanvasPointNear(cp1, cp2, 10)).toBe(true);
      expect(isCanvasPointNear(cp1, cp3, 10)).toBe(false);
    });
  });

  // Test bounds checking
  describe('Bounds Checking', () => {
    const bounds: CanvasBounds = {
      width: 800,
      height: 600,
      pixelsPerMm: 2,
    };

    test('isPointInBounds should detect points within bounds', () => {
      expect(isPointInBounds({ x: 400, y: 300 }, bounds)).toBe(true);
      expect(isPointInBounds({ x: 0, y: 0 }, bounds)).toBe(true);
      expect(isPointInBounds({ x: 800, y: 600 }, bounds)).toBe(true);
    });

    test('isPointInBounds should detect points outside bounds', () => {
      expect(isPointInBounds({ x: -10, y: 300 }, bounds)).toBe(false);
      expect(isPointInBounds({ x: 400, y: -10 }, bounds)).toBe(false);
      expect(isPointInBounds({ x: 900, y: 300 }, bounds)).toBe(false);
      expect(isPointInBounds({ x: 400, y: 700 }, bounds)).toBe(false);
    });

    test('constrainPointToBounds should constrain points to bounds', () => {
      expect(constrainPointToBounds({ x: -10, y: 300 }, bounds)).toEqual({ x: 0, y: 300 });
      expect(constrainPointToBounds({ x: 400, y: -10 }, bounds)).toEqual({ x: 400, y: 0 });
      expect(constrainPointToBounds({ x: 900, y: 300 }, bounds)).toEqual({ x: 800, y: 300 });
      expect(constrainPointToBounds({ x: 400, y: 700 }, bounds)).toEqual({ x: 400, y: 600 });
    });

    test('constrainPointToBounds should leave valid points unchanged', () => {
      const validPoint = { x: 400, y: 300 };
      expect(constrainPointToBounds(validPoint, bounds)).toEqual(validPoint);
    });
  });

  // Test polygon centroid
  describe('Polygon Centroid', () => {
    test('calculatePolygonCentroid should compute centroid of square', () => {
      const vertices: Point[] = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
        { x: 0, y: 10 },
      ];
      expect(calculatePolygonCentroid(vertices)).toEqual({ x: 5, y: 5 });
    });

    test('calculatePolygonCentroid should compute centroid of triangle', () => {
      const vertices: Point[] = [
        { x: 0, y: 0 },
        { x: 6, y: 0 },
        { x: 3, y: 6 },
      ];
      expect(calculatePolygonCentroid(vertices)).toEqual({ x: 3, y: 2 });
    });

    test('calculatePolygonCentroid should return origin for empty array', () => {
      expect(calculatePolygonCentroid([])).toEqual({ x: 0, y: 0 });
    });
  });

  // Test unit conversions for area and length
  describe('Area and Length Conversions', () => {
    test('convertArea should convert square mm to other units', () => {
      const areaMm2 = 1000000; // 1 square meter in mm²

      expect(convertArea(areaMm2, 'cm2')).toBe(10000); // 10000 cm²
      expect(convertArea(areaMm2, 'm2')).toBe(1); // 1 m²
      expect(convertArea(areaMm2, 'in2')).toBeCloseTo(1550.0031, 3); // ~1550 in²
      expect(convertArea(areaMm2, 'ft2')).toBeCloseTo(10.7639, 3); // ~10.76 ft²
    });

    test('convertLength should convert mm to other units', () => {
      const lengthMm = 1000; // 1 meter in mm

      expect(convertLength(lengthMm, 'cm')).toBe(100); // 100 cm
      expect(convertLength(lengthMm, 'm')).toBe(1); // 1 m
      expect(convertLength(lengthMm, 'in')).toBeCloseTo(39.3701, 3); // ~39.37 inches
      expect(convertLength(lengthMm, 'ft')).toBeCloseTo(3.2808, 3); // ~3.28 feet
    });
  });

  // Test polygon creation and updates
  describe('Polygon Creation and Updates', () => {
    test('createPolygon should create polygon with properties', () => {
      const vertices: Point[] = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
        { x: 0, y: 10 },
      ];

      const polygon = createPolygon(vertices);

      expect(polygon.vertices).toEqual(vertices);
      expect(polygon.isComplete).toBe(true);
      expect(polygon.area).toBe(100);
      expect(polygon.perimeter).toBe(40);
    });

    test('createPolygon should handle incomplete polygon', () => {
      const vertices: Point[] = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
      ];

      const polygon = createPolygon(vertices);

      expect(polygon.vertices).toEqual(vertices);
      expect(polygon.isComplete).toBe(false);
      expect(polygon.area).toBeUndefined();
      expect(polygon.perimeter).toBe(10);
    });

    test('updatePolygon should recalculate properties', () => {
      const originalPolygon: Polygon = {
        vertices: [
          { x: 0, y: 0 },
          { x: 5, y: 0 },
          { x: 5, y: 5 },
          { x: 0, y: 5 },
        ],
        isComplete: true,
        area: 20, // Incorrect value, should be recalculated
        perimeter: 15, // Incorrect value, should be recalculated
      };

      const updatedPolygon = updatePolygon(originalPolygon);

      expect(updatedPolygon.area).toBe(25); // Correct area for 5x5 square
      expect(updatedPolygon.perimeter).toBe(20); // Correct perimeter for 5x5 square
      expect(updatedPolygon.isComplete).toBe(true);
    });

    test('updatePolygon should handle incomplete polygon correctly', () => {
      const incompletePolygon: Polygon = {
        vertices: [
          { x: 0, y: 0 },
          { x: 10, y: 0 },
        ],
        isComplete: false,
      };

      const updatedPolygon = updatePolygon(incompletePolygon);

      expect(updatedPolygon.isComplete).toBe(false);
      expect(updatedPolygon.area).toBeUndefined();
      expect(updatedPolygon.perimeter).toBe(10);
    });
  });

  // Edge cases and error conditions
  describe('Edge Cases', () => {
    test('should handle negative coordinates', () => {
      const vertices: Point[] = [
        { x: -5, y: -5 },
        { x: 5, y: -5 },
        { x: 5, y: 5 },
        { x: -5, y: 5 },
      ];

      expect(calculatePolygonArea(vertices)).toBe(100);
      expect(calculatePolygonPerimeter(vertices)).toBe(40);
      expect(isValidPolygon(vertices)).toBe(true);
    });

    test('should handle very small distances', () => {
      const p1: Point = { x: 0, y: 0 };
      const p2: Point = { x: 0.001, y: 0 };

      expect(calculateDistance(p1, p2)).toBe(0.001);
      expect(isPointNear(p1, p2, 0.01)).toBe(true);
      expect(isPointNear(p1, p2, 0.0005)).toBe(false);
    });

    test('should handle very large coordinates', () => {
      const vertices: Point[] = [
        { x: 0, y: 0 },
        { x: 1000000, y: 0 },
        { x: 1000000, y: 1000000 },
        { x: 0, y: 1000000 },
      ];

      expect(calculatePolygonArea(vertices)).toBe(1000000000000); // 1 trillion mm²
      expect(calculatePolygonPerimeter(vertices)).toBe(4000000); // 4 million mm
    });

    test('should handle floating point precision', () => {
      const vertices: Point[] = [
        { x: 0.1, y: 0.1 },
        { x: 10.1, y: 0.1 },
        { x: 10.1, y: 10.1 },
        { x: 0.1, y: 10.1 },
      ];

      expect(calculatePolygonArea(vertices)).toBeCloseTo(100, 10);
      expect(calculatePolygonPerimeter(vertices)).toBeCloseTo(40, 10);
    });
  });
});