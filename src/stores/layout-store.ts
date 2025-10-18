import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import {
  Point,
  Polygon,
  calculatePolygonArea,
  calculatePolygonPerimeter,
  isValidPolygon,
  createPolygon,
  updatePolygon,
} from '../../packages/tiling-engine/src/geometry';

export interface LayoutState {
  // Current polygon being drawn/edited
  currentPolygon: Polygon | null;

  // Drawing state
  isDrawing: boolean;
  isEditing: boolean;

  // Interaction state
  selectedVertexIndex: number | null;
  hoveredVertexIndex: number | null;

  // Canvas configuration
  canvasWidth: number;
  canvasHeight: number;
  pixelsPerMm: number;

  // History for undo/redo
  history: Polygon[];
  historyIndex: number;

  // Layout properties (calculated from polygon)
  area: number; // in mm²
  perimeter: number; // in mm
  isValid: boolean;

  // UI state
  showGrid: boolean;
  showMeasurements: boolean;
  snapToGrid: boolean;
  gridSize: number; // in mm
}

export interface LayoutActions {
  // Drawing actions
  startDrawing: () => void;
  addVertex: (point: Point) => void;
  completePolygon: () => void;
  cancelDrawing: () => void;

  // Editing actions
  startEditing: () => void;
  updateVertex: (index: number, point: Point) => void;
  deleteVertex: (index: number) => void;
  selectVertex: (index: number | null) => void;
  hoverVertex: (index: number | null) => void;

  // Polygon operations
  setPolygon: (polygon: Polygon | null) => void;
  clearPolygon: () => void;
  validatePolygon: () => boolean;

  // History operations
  undo: () => void;
  redo: () => void;
  saveToHistory: () => void;
  clearHistory: () => void;

  // Canvas configuration
  setCanvasSize: (width: number, height: number) => void;
  setPixelsPerMm: (ratio: number) => void;

  // UI state
  setShowGrid: (show: boolean) => void;
  setShowMeasurements: (show: boolean) => void;
  setSnapToGrid: (snap: boolean) => void;
  setGridSize: (size: number) => void;

  // Calculated properties
  updateCalculations: () => void;
}

const initialState: LayoutState = {
  currentPolygon: null,
  isDrawing: false,
  isEditing: false,
  selectedVertexIndex: null,
  hoveredVertexIndex: null,
  canvasWidth: 800,
  canvasHeight: 600,
  pixelsPerMm: 2,
  history: [],
  historyIndex: -1,
  area: 0,
  perimeter: 0,
  isValid: false,
  showGrid: true,
  showMeasurements: false,
  snapToGrid: false,
  gridSize: 50, // 50mm grid
};

export const useLayoutStore = create<LayoutState & LayoutActions>()(
  immer((set, get) => ({
    ...initialState,

    // Drawing actions
    startDrawing: () => {
      set((state) => {
        state.currentPolygon = {
          vertices: [],
          isComplete: false,
        };
        state.isDrawing = true;
        state.isEditing = false;
      });
    },

    addVertex: (point: Point) => {
      set((state) => {
        if (!state.currentPolygon) {
          state.currentPolygon = {
            vertices: [point],
            isComplete: false,
          };
          state.isDrawing = true;
        } else {
          state.currentPolygon.vertices.push(point);
        }

        // Update polygon calculations
        state.currentPolygon = updatePolygon(state.currentPolygon);
        get().updateCalculations();
      });
    },

    completePolygon: () => {
      set((state) => {
        if (state.currentPolygon && state.currentPolygon.vertices.length >= 3) {
          state.currentPolygon.isComplete = true;
          state.currentPolygon = updatePolygon(state.currentPolygon);
          state.isDrawing = false;
          state.isEditing = true;

          // Save to history
          get().saveToHistory();
          get().updateCalculations();
        }
      });
    },

    cancelDrawing: () => {
      set((state) => {
        state.currentPolygon = null;
        state.isDrawing = false;
        state.isEditing = false;
        state.selectedVertexIndex = null;
        state.hoveredVertexIndex = null;
        get().updateCalculations();
      });
    },

    // Editing actions
    startEditing: () => {
      set((state) => {
        if (state.currentPolygon?.isComplete) {
          state.isEditing = true;
          state.isDrawing = false;
        }
      });
    },

    updateVertex: (index: number, point: Point) => {
      set((state) => {
        if (state.currentPolygon && index >= 0 && index < state.currentPolygon.vertices.length) {
          state.currentPolygon.vertices[index] = point;
          state.currentPolygon = updatePolygon(state.currentPolygon);
          get().updateCalculations();
        }
      });
    },

    deleteVertex: (index: number) => {
      set((state) => {
        if (state.currentPolygon && index >= 0 && index < state.currentPolygon.vertices.length) {
          // Don't allow deletion if it would make polygon invalid
          if (state.currentPolygon.vertices.length <= 3) {
            return;
          }

          state.currentPolygon.vertices.splice(index, 1);
          state.currentPolygon = updatePolygon(state.currentPolygon);

          // Adjust selection if needed
          if (state.selectedVertexIndex === index) {
            state.selectedVertexIndex = null;
          } else if (state.selectedVertexIndex !== null && state.selectedVertexIndex > index) {
            state.selectedVertexIndex -= 1;
          }

          get().updateCalculations();
        }
      });
    },

    selectVertex: (index: number | null) => {
      set((state) => {
        state.selectedVertexIndex = index;
      });
    },

    hoverVertex: (index: number | null) => {
      set((state) => {
        state.hoveredVertexIndex = index;
      });
    },

    // Polygon operations
    setPolygon: (polygon: Polygon | null) => {
      set((state) => {
        state.currentPolygon = polygon;
        if (polygon) {
          state.isDrawing = !polygon.isComplete;
          state.isEditing = polygon.isComplete;
        } else {
          state.isDrawing = false;
          state.isEditing = false;
        }
        get().updateCalculations();
      });
    },

    clearPolygon: () => {
      set((state) => {
        state.currentPolygon = null;
        state.isDrawing = false;
        state.isEditing = false;
        state.selectedVertexIndex = null;
        state.hoveredVertexIndex = null;
        get().updateCalculations();
      });
    },

    validatePolygon: () => {
      const state = get();
      if (!state.currentPolygon?.vertices) return false;
      return isValidPolygon(state.currentPolygon.vertices);
    },

    // History operations
    saveToHistory: () => {
      set((state) => {
        if (!state.currentPolygon) return;

        // Deep clone the current polygon
        const snapshot: Polygon = JSON.parse(JSON.stringify(state.currentPolygon));

        // Remove any history after current index
        state.history = state.history.slice(0, state.historyIndex + 1);

        // Add new snapshot
        state.history.push(snapshot);

        // Limit history size (keep last 50 states)
        if (state.history.length > 50) {
          state.history = state.history.slice(-50);
        }

        state.historyIndex = state.history.length - 1;
      });
    },

    undo: () => {
      set((state) => {
        if (state.historyIndex > 0) {
          state.historyIndex -= 1;
          const snapshot = state.history[state.historyIndex];

          if (snapshot) {
            state.currentPolygon = JSON.parse(JSON.stringify(snapshot));
            state.isDrawing = !state.currentPolygon.isComplete;
            state.isEditing = state.currentPolygon.isComplete;
            get().updateCalculations();
          }
        }
      });
    },

    redo: () => {
      set((state) => {
        if (state.historyIndex < state.history.length - 1) {
          state.historyIndex += 1;
          const snapshot = state.history[state.historyIndex];

          if (snapshot) {
            state.currentPolygon = JSON.parse(JSON.stringify(snapshot));
            state.isDrawing = !state.currentPolygon.isComplete;
            state.isEditing = state.currentPolygon.isComplete;
            get().updateCalculations();
          }
        }
      });
    },

    clearHistory: () => {
      set((state) => {
        state.history = [];
        state.historyIndex = -1;
      });
    },

    // Canvas configuration
    setCanvasSize: (width: number, height: number) => {
      set((state) => {
        state.canvasWidth = width;
        state.canvasHeight = height;
      });
    },

    setPixelsPerMm: (ratio: number) => {
      set((state) => {
        state.pixelsPerMm = ratio;
      });
    },

    // UI state
    setShowGrid: (show: boolean) => {
      set((state) => {
        state.showGrid = show;
      });
    },

    setShowMeasurements: (show: boolean) => {
      set((state) => {
        state.showMeasurements = show;
      });
    },

    setSnapToGrid: (snap: boolean) => {
      set((state) => {
        state.snapToGrid = snap;
      });
    },

    setGridSize: (size: number) => {
      set((state) => {
        state.gridSize = size;
      });
    },

    // Calculated properties
    updateCalculations: () => {
      set((state) => {
        if (state.currentPolygon?.vertices) {
          state.area = calculatePolygonArea(state.currentPolygon.vertices);
          state.perimeter = calculatePolygonPerimeter(state.currentPolygon.vertices);
          state.isValid = isValidPolygon(state.currentPolygon.vertices);
        } else {
          state.area = 0;
          state.perimeter = 0;
          state.isValid = false;
        }
      });
    },
  }))
);