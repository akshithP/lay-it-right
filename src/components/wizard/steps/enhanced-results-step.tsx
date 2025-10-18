'use client'

import { useEffect, useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Calculator,
  Download,
  Save,
  Share2,
  Eye,
  TrendingUp,
  AlertTriangle,
  Clock,
  DollarSign,
  Package,
  Ruler,
  Target,
  ShoppingCart,
  FileText,
  Zap
} from 'lucide-react'
import { useProjectStore } from '@/store/project-store'
import { useCanvasStore } from '@/stores/canvas-store'
import { motion, AnimatePresence } from 'framer-motion'
import { CanvasTileIntegration } from '@/components/visualization/CanvasTileIntegration'
import { TilePatternRenderer } from '@/components/visualization/TilePatternRenderer'
import {
  calculateAdvancedProject,
  generateShoppingList,
  generateDetailedReport,
  type DetailedResults
} from '@/utils/advanced-tile-calculations'
import {
  TilePatternGenerator,
  createTilePatternGenerator,
  type TileGenerationResult
} from '../../../../packages/tiling-engine/src/tiles'
import { cn } from '@/lib/utils'
import type { Project } from '@/types'

interface EnhancedResultsStepProps {
  className?: string
}

export function EnhancedResultsStep({ className }: EnhancedResultsStepProps) {
  const { currentProject, calculateProject, setCalculations, isLoading, error } = useProjectStore()
  const { nodes, edges, validateLayout, exportLayoutData } = useCanvasStore()

  // Component state
  const [detailedResults, setDetailedResults] = useState<DetailedResults | null>(null)
  const [tilePattern, setTilePattern] = useState<TileGenerationResult | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [calculationProgress, setCalculationProgress] = useState(0)
  const [activeTab, setActiveTab] = useState('overview')
  const [showAdvancedMetrics, setShowAdvancedMetrics] = useState(false)

  // Validation status
  const canCalculate = useMemo(() => {
    const validation = validateLayout()
    return !!(
      currentProject.layout &&
      currentProject.tile &&
      validation.isValid &&
      validation.isClosed &&
      validation.missingDimensions.length === 0
    )
  }, [currentProject, validateLayout])

  // Advanced calculation effect
  useEffect(() => {
    if (canCalculate) {
      performAdvancedCalculation()
    }
  }, [canCalculate, currentProject, nodes, edges])

  // Perform advanced calculations
  const performAdvancedCalculation = async () => {
    if (!canCalculate || !currentProject.layout || !currentProject.tile) return

    setIsCalculating(true)
    setCalculationProgress(0)

    try {
      // Step 1: Generate tile pattern
      setCalculationProgress(25)
      const generator = createTilePatternGenerator(
        currentProject.tile,
        currentProject.layout.pattern,
        600, // Canvas width
        400, // Canvas height
        { margin: 20, resolution: 100 }
      )

      const validation = validateLayout()
      const polygonNodes = validation.isValid && validation.isClosed ? nodes : undefined
      const patternResult = generator.generatePattern(polygonNodes)

      setTilePattern(patternResult)
      setCalculationProgress(50)

      // Step 2: Advanced calculations
      const advancedResults = calculateAdvancedProject(
        currentProject as Project,
        nodes,
        edges,
        patternResult,
        {
          includeWasteFactor: true,
          wasteFactor: 0.10,
          includeCuttingLoss: true,
          cuttingLoss: 0.05,
          groutCalculation: true,
          tileCost: 2.50, // Example cost per tile
          laborCost: 35.00 // Example cost per m²
        }
      )

      setDetailedResults(advancedResults)
      setCalculationProgress(75)

      // Step 3: Update project store
      setCalculations({
        totalArea: advancedResults.realWorldArea,
        tileArea: advancedResults.tileArea,
        totalTiles: advancedResults.totalTiles,
        fullTiles: advancedResults.fullTiles,
        cutTiles: advancedResults.cutTiles,
        wastePercentage: advancedResults.wastePercentage,
        groutArea: advancedResults.groutArea,
        coverage: advancedResults.coverage
      })

      setCalculationProgress(100)
    } catch (error) {
      console.error('Advanced calculation failed:', error)
    } finally {
      setTimeout(() => {
        setIsCalculating(false)
        setCalculationProgress(0)
      }, 500)
    }
  }

  // Handle manual recalculation
  const handleRecalculate = () => {
    performAdvancedCalculation()
  }

  // Export functions
  const handleSaveProject = () => {
    // Implementation depends on your save system
    console.log('Saving project with detailed results')
  }

  const handleExportPDF = () => {
    // Implementation for PDF export
    console.log('Exporting detailed PDF report')
  }

  const handleShareResults = () => {
    // Implementation for sharing
    console.log('Sharing project results')
  }

  // Generate shopping list
  const shoppingList = useMemo(() => {
    if (!detailedResults || !currentProject.tile) return null

    return generateShoppingList(detailedResults, currentProject.tile)
  }, [detailedResults, currentProject.tile])

  // Generate detailed report
  const detailedReport = useMemo(() => {
    if (!detailedResults) return null

    return generateDetailedReport(currentProject as Project, detailedResults)
  }, [detailedResults, currentProject])

  // Loading state
  if (isLoading || isCalculating) {
    return (
      <div className="text-center py-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-blue-500 border-t-orange-500 rounded-full mx-auto mb-4"
        />
        <p className="text-blue-600 font-medium mb-4">
          {isCalculating ? 'Performing advanced calculations...' : 'Calculating your tiling project...'}
        </p>
        {calculationProgress > 0 && (
          <div className="max-w-xs mx-auto">
            <Progress value={calculationProgress} className="h-2" />
            <p className="text-xs text-gray-500 mt-2">{calculationProgress}% complete</p>
          </div>
        )}
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <p className="text-red-600 font-medium mb-4">Error: {error}</p>
        <Button onClick={handleRecalculate} className="gap-2">
          <Calculator size={16} />
          Recalculate
        </Button>
      </div>
    )
  }

  // Validation state
  if (!canCalculate) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
        <p className="text-amber-600 font-medium mb-4">
          Complete your layout and add dimensions to see results
        </p>
        <Alert className="max-w-md mx-auto">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Make sure your canvas layout is closed and all edges have dimensions before calculating results.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!detailedResults || !tilePattern) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 mb-4">Unable to calculate results. Please check your inputs.</p>
        <Button onClick={handleRecalculate} className="gap-2">
          <Calculator size={16} />
          Recalculate
        </Button>
      </div>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="text-center mb-8">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-blue-900 mb-2"
        >
          Project Results & Analysis
        </motion.h2>
        <p className="text-gray-600">
          Complete tiling calculation with advanced metrics and recommendations
        </p>
      </div>

      {/* Key Metrics Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
      >
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4 text-center">
            <Ruler className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <p className="text-2xl font-bold text-blue-900">
              {detailedResults.realWorldArea.toFixed(2)}
            </p>
            <p className="text-sm text-blue-600">Area (m²)</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4 text-center">
            <Package className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <p className="text-2xl font-bold text-green-900">
              {detailedResults.totalTiles}
            </p>
            <p className="text-sm text-green-600">Total Tiles</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardContent className="p-4 text-center">
            <Target className="w-8 h-8 mx-auto mb-2 text-amber-600" />
            <p className="text-2xl font-bold text-amber-900">
              {detailedResults.wastePercentage.toFixed(1)}%
            </p>
            <p className="text-sm text-amber-600">Total Waste</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4 text-center">
            <Clock className="w-8 h-8 mx-auto mb-2 text-purple-600" />
            <p className="text-2xl font-bold text-purple-900">
              {detailedResults.estimatedInstallTime.toFixed(1)}
            </p>
            <p className="text-sm text-purple-600">Hours</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="gap-2">
            <Eye size={16} />
            Overview
          </TabsTrigger>
          <TabsTrigger value="visualization" className="gap-2">
            <Zap size={16} />
            Visual
          </TabsTrigger>
          <TabsTrigger value="shopping" className="gap-2">
            <ShoppingCart size={16} />
            Shopping
          </TabsTrigger>
          <TabsTrigger value="advanced" className="gap-2">
            <TrendingUp size={16} />
            Advanced
          </TabsTrigger>
          <TabsTrigger value="report" className="gap-2">
            <FileText size={16} />
            Report
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator size={20} />
                  Area Calculations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Room Area:</span>
                  <span className="font-bold">{detailedResults.realWorldArea.toFixed(2)} m²</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Tile Coverage:</span>
                  <span className="font-bold">{detailedResults.coverage.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Grout Area:</span>
                  <span className="font-bold">{detailedResults.groutArea.toFixed(2)} m²</span>
                </div>
                <div className="flex justify-between py-3 border-t bg-blue-50 px-4 -mx-6">
                  <span className="font-bold text-blue-900">Scale Factor:</span>
                  <span className="font-bold text-blue-900">
                    {detailedResults.scaleFactor.toFixed(1)} px/unit
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target size={20} />
                  Material Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Full Tiles:</span>
                  <span className="font-bold text-green-600">
                    {detailedResults.fullTiles}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Cut Tiles:</span>
                  <span className="font-bold text-amber-600">
                    {detailedResults.cutTiles}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Border Tiles:</span>
                  <span className="font-bold text-purple-600">
                    {detailedResults.borderTiles}
                  </span>
                </div>
                <div className="flex justify-between py-3 border-t bg-amber-50 px-4 -mx-6">
                  <span className="font-bold text-amber-900">Complexity:</span>
                  <Badge variant={
                    detailedResults.cuttingComplexity === 'simple' ? 'default' :
                    detailedResults.cuttingComplexity === 'moderate' ? 'secondary' : 'destructive'
                  }>
                    {detailedResults.cuttingComplexity}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cost Summary */}
          {detailedResults.totalCost && (
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <DollarSign size={20} />
                  Cost Estimate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-700">
                      ${detailedResults.tileCost?.toFixed(2) || '0'}
                    </p>
                    <p className="text-sm text-green-600">Tiles</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-700">
                      ${detailedResults.laborCost?.toFixed(2) || '0'}
                    </p>
                    <p className="text-sm text-green-600">Labor</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-700">
                      ${detailedResults.groutCost?.toFixed(2) || '0'}
                    </p>
                    <p className="text-sm text-green-600">Materials</p>
                  </div>
                  <div className="text-center p-4 bg-green-100 rounded-lg">
                    <p className="text-3xl font-bold text-green-800">
                      ${detailedResults.totalCost.toFixed(2)}
                    </p>
                    <p className="text-sm font-medium text-green-700">Total</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Visualization Tab */}
        <TabsContent value="visualization" className="space-y-6">
          <CanvasTileIntegration
            showStats={true}
            interactive={true}
            onResultsChange={(result) => {
              if (result) {
                setTilePattern(result)
              }
            }}
          />
        </TabsContent>

        {/* Shopping Tab */}
        <TabsContent value="shopping" className="space-y-6">
          {shoppingList && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart size={20} />
                    Material Shopping List
                  </CardTitle>
                  <CardDescription>
                    Everything you need to complete this project
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Primary Materials */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900">Primary Materials</h4>

                        <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                          <div>
                            <p className="font-medium">Tiles</p>
                            <p className="text-sm text-gray-600">{shoppingList.tiles.description}</p>
                          </div>
                          <Badge variant="default" className="text-lg px-3">
                            {shoppingList.tiles.quantity} {shoppingList.tiles.unit}
                          </Badge>
                        </div>

                        <div className="flex justify-between items-center p-4 bg-amber-50 rounded-lg">
                          <div>
                            <p className="font-medium">Grout</p>
                            <p className="text-sm text-gray-600">{shoppingList.grout.description}</p>
                          </div>
                          <Badge variant="secondary" className="text-lg px-3">
                            {shoppingList.grout.quantity} {shoppingList.grout.unit}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900">Accessories & Tools</h4>
                        {shoppingList.accessories.map((item, index) => (
                          <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm font-medium">{item.item}</span>
                            <Badge variant="outline">
                              {item.quantity} {item.unit}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Advanced Tab */}
        <TabsContent value="advanced" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Quality Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Pattern Accuracy</span>
                    <span>{detailedResults.patternAccuracy.toFixed(1)}%</span>
                  </div>
                  <Progress value={detailedResults.patternAccuracy} />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Layout Efficiency</span>
                    <span>{detailedResults.layoutEfficiency.toFixed(1)}%</span>
                  </div>
                  <Progress value={detailedResults.layoutEfficiency} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Installation Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Estimated Time:</span>
                  <span className="font-bold">{detailedResults.estimatedInstallTime.toFixed(1)} hours</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Tiles per m²:</span>
                  <span className="font-bold">{detailedResults.tilesPerSquareUnit.toFixed(1)}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Grout Volume:</span>
                  <span className="font-bold">{(detailedResults.groutVolume * 1000).toFixed(1)} ml</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Report Tab */}
        <TabsContent value="report" className="space-y-6">
          {detailedReport && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Project Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-sm bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">
                    {detailedReport.summary}
                  </pre>
                </CardContent>
              </Card>

              {detailedReport.recommendations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-green-700">Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {detailedReport.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                          <span className="text-sm">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {detailedReport.warnings.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-amber-700">Warnings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {detailedReport.warnings.map((warning, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-500 mt-1" />
                          <span className="text-sm">{warning}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-wrap gap-4 justify-between pt-6 border-t"
      >
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleSaveProject} className="gap-2">
            <Save size={16} />
            Save Project
          </Button>
          <Button variant="outline" onClick={handleExportPDF} className="gap-2">
            <Download size={16} />
            Export PDF
          </Button>
          <Button variant="outline" onClick={handleRecalculate} className="gap-2">
            <Calculator size={16} />
            Recalculate
          </Button>
        </div>

        <Button onClick={handleShareResults} className="gap-2">
          <Share2 size={16} />
          Share Results
        </Button>
      </motion.div>
    </div>
  )
}