/**
 * Advanced Tile System - Complete Integration Package
 *
 * This module provides the complete advanced tile planning system including:
 * - Enhanced dimension editing with popover forms
 * - Konva-based tile pattern visualization
 * - Advanced calculation engine with real-world accuracy
 * - Mobile-optimized responsive design
 * - WCAG accessibility compliance
 */

// Core Tiling Engine
export { TilePatternGenerator, createTilePatternGenerator } from '../../../packages/tiling-engine/src/tiles'
export type { TilePosition, TileGenerationResult, TilePatternConfig } from '../../../packages/tiling-engine/src/tiles'

// Canvas Components
export { EdgeLine } from '../canvas/EdgeLine'
export { DimensionPopover } from '../canvas/DimensionPopover'

// Visualization Components
export { TilePatternRenderer } from '../visualization/TilePatternRenderer'
export { CanvasTileIntegration } from '../visualization/CanvasTileIntegration'

// Enhanced Results System
export { EnhancedResultsStep } from '../wizard/steps/enhanced-results-step'

// Advanced Calculations
export {
  calculateAdvancedProject,
  generateShoppingList,
  generateDetailedReport
} from '../../utils/advanced-tile-calculations'
export type { DetailedResults } from '../../utils/advanced-tile-calculations'

// Layout and Responsiveness
export { MobileOptimizedLayout, useResponsiveValue } from '../layout/MobileOptimizedLayout'

// Re-export enhanced UI components
export { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs'
export { Alert, AlertTitle, AlertDescription } from '../ui/alert'
export { Switch } from '../ui/switch'
export { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetFooter, SheetTitle, SheetDescription } from '../ui/sheet'

/**
 * Quick Setup Guide:
 *
 * 1. Basic Tile Visualization:
 * ```tsx
 * import { TilePatternRenderer } from '@/components/advanced-tile-system'
 *
 * <TilePatternRenderer
 *   width={600}
 *   height={400}
 *   interactive={true}
 *   showControls={true}
 * />
 * ```
 *
 * 2. Complete Integration:
 * ```tsx
 * import { CanvasTileIntegration, MobileOptimizedLayout } from '@/components/advanced-tile-system'
 *
 * <MobileOptimizedLayout title="Tile Planning">
 *   <CanvasTileIntegration
 *     showStats={true}
 *     interactive={true}
 *   />
 * </MobileOptimizedLayout>
 * ```
 *
 * 3. Enhanced Results:
 * ```tsx
 * import { EnhancedResultsStep } from '@/components/advanced-tile-system'
 *
 * <EnhancedResultsStep />
 * ```
 *
 * 4. Custom Calculations:
 * ```tsx
 * import { calculateAdvancedProject, generateShoppingList } from '@/components/advanced-tile-system'
 *
 * const results = calculateAdvancedProject(project, nodes, edges, tileResult)
 * const shopping = generateShoppingList(results, tile)
 * ```
 */

// Type exports for consumers
export type {
  // Core types from existing system
  Unit,
  LayoutPattern,
  TileSpecification,
  Project,
  ProjectCalculations
} from '../../types'

export type {
  // Canvas types
  LayoutNode,
  LayoutEdge,
  LayoutEdgeData
} from '../../types/canvas'