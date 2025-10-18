'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CalculatorIcon, DownloadIcon, SaveIcon, ShareIcon, ZoomInIcon, TrendingUpIcon, AlertTriangleIcon } from 'lucide-react'
import { useProjectStore } from '@/store/project-store'
import { motion } from 'framer-motion'
import { TilePreview } from '@/components/visualization'
import { formatWithUnit } from '@/utils/unit-conversions'
import type { Project } from '@/types'

export function ResultsStep() {
  const { currentProject, calculateProject, isLoading, error } = useProjectStore()

  useEffect(() => {
    calculateProject()
  }, [calculateProject])

  const handleSave = () => {
    console.log('Save project')
  }

  const handleExport = () => {
    console.log('Export project data')
  }

  if (!currentProject.layout || !currentProject.tile) {
    return (
      <div className="text-center py-8">
        <AlertTriangleIcon className="w-16 h-16 text-layit-orange mx-auto mb-4" />
        <p className="text-layit-blue font-medium">Project data incomplete. Please complete all steps.</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-layit-blue border-t-layit-orange rounded-full mx-auto mb-4"
        />
        <p className="text-layit-blue font-medium">Calculating your tiling project...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <p className="text-red-600 font-medium">Error: {error}</p>
        <Button onClick={calculateProject} className="mt-4">
          Try Again
        </Button>
      </div>
    )
  }

  const { layout, tile, calculations } = currentProject

  if (!calculations) {
    return (
      <div className="text-center py-8">
        <p className="text-layit-blue/70">Unable to calculate results. Please check your inputs.</p>
        <Button onClick={calculateProject} className="mt-4">
          Recalculate
        </Button>
      </div>
    )
  }

  const roomUnit = layout.dimensions.unit
  const tileUnit = tile.unit

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-xl font-bold text-layit-blue mb-2 uppercase">
          PROJECT RESULTS
        </h3>
        <p className="text-layit-blue/70 font-medium">
          Your complete tiling calculation with material requirements
        </p>
      </div>

      {/* Key Results Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-gradient-to-r from-layit-yellow/10 to-layit-orange/10 border-4 border-layit-blue">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-layit-blue">
              <CalculatorIcon className="h-5 w-5" />
              PROJECT SUMMARY
            </CardTitle>
            <CardDescription className="font-medium text-layit-blue/70">
              {layout.shape.toUpperCase()}: {layout.dimensions.length} × {layout.dimensions.width} {roomUnit} |
              TILE: {tile.length} × {tile.width} {tileUnit} |
              PATTERN: {layout.pattern.toUpperCase()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="text-center p-6 bg-layit-white border-4 border-layit-blue shadow-[4px_4px_0px_theme(colors.layit.orange)]"
              >
                <p className="text-3xl font-bold text-layit-blue">{calculations.totalArea}</p>
                <p className="text-sm font-medium text-layit-blue/70 uppercase">Room Area ({roomUnit}²)</p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="text-center p-6 bg-layit-white border-4 border-layit-blue shadow-[4px_4px_0px_theme(colors.layit.orange)]"
              >
                <p className="text-3xl font-bold text-layit-blue">{calculations.totalTiles}</p>
                <p className="text-sm font-medium text-layit-blue/70 uppercase">Total Tiles</p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="text-center p-6 bg-layit-white border-4 border-layit-blue shadow-[4px_4px_0px_theme(colors.layit.orange)]"
              >
                <p className="text-3xl font-bold text-layit-blue">{calculations.fullTiles}</p>
                <p className="text-sm font-medium text-layit-blue/70 uppercase">Full Tiles</p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="text-center p-6 bg-layit-white border-4 border-layit-blue shadow-[4px_4px_0px_theme(colors.layit.orange)]"
              >
                <p className="text-3xl font-bold text-layit-blue">{calculations.cutTiles}</p>
                <p className="text-sm font-medium text-layit-blue/70 uppercase">Cut Tiles</p>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Visual Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="border-4 border-layit-blue">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-layit-blue">
              <ZoomInIcon className="h-4 w-4" />
              LAYOUT PREVIEW
            </CardTitle>
            <CardDescription className="font-medium">
              Visual representation of your {layout.pattern} tiling pattern
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <TilePreview
                project={currentProject as Project}
                width={600}
                height={400}
                showGrid={true}
                showDimensions={true}
                className="mx-auto"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Detailed Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="grid md:grid-cols-2 gap-6"
      >
        <Card className="border-4 border-layit-blue">
          <CardHeader>
            <CardTitle className="text-base text-layit-blue uppercase">Area Calculations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 font-mono text-sm">
            <div className="flex justify-between py-2 border-b border-layit-blue/20">
              <span className="text-layit-blue/70">Room Area:</span>
              <span className="font-bold text-layit-blue">{formatWithUnit(calculations.totalArea, roomUnit + '²')}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-layit-blue/20">
              <span className="text-layit-blue/70">Tile Area:</span>
              <span className="font-bold text-layit-blue">{formatWithUnit(calculations.tileArea, 'm²')}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-layit-blue/20">
              <span className="text-layit-blue/70">Grout Area:</span>
              <span className="font-bold text-layit-blue">{formatWithUnit(calculations.groutArea, roomUnit + '²')}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-layit-blue/20">
              <span className="text-layit-blue/70">Coverage:</span>
              <span className="font-bold text-layit-blue">{calculations.coverage}%</span>
            </div>
            <div className="flex justify-between py-3 border-t-4 border-layit-orange bg-layit-yellow/10">
              <span className="text-layit-blue font-bold">WASTE ALLOWANCE:</span>
              <span className="font-bold text-layit-blue">{calculations.wastePercentage}%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-4 border-layit-blue">
          <CardHeader>
            <CardTitle className="text-base text-layit-blue uppercase flex items-center gap-2">
              <TrendingUpIcon className="h-4 w-4" />
              Material Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 font-mono text-sm">
            <div className="flex justify-between py-2 border-b border-layit-blue/20">
              <span className="text-layit-blue/70">Full Tiles:</span>
              <span className="font-bold text-layit-blue">{calculations.fullTiles}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-layit-blue/20">
              <span className="text-layit-blue/70">Tiles to Cut:</span>
              <span className="font-bold text-layit-blue">{calculations.cutTiles}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-layit-blue/20">
              <span className="text-layit-blue/70">Grout Width:</span>
              <span className="font-bold text-layit-blue">{tile.groutWidth} {tileUnit}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-layit-blue/20">
              <span className="text-layit-blue/70">Layout Pattern:</span>
              <span className="font-bold text-layit-blue uppercase">{layout.pattern}</span>
            </div>
            <div className="flex justify-between py-3 border-t-4 border-layit-orange bg-layit-yellow/10">
              <span className="text-layit-blue font-bold">TOTAL TILES:</span>
              <span className="font-bold text-layit-blue text-lg">{calculations.totalTiles}</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Shopping List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Card className="bg-layit-blue/5 border-4 border-layit-blue">
          <CardHeader>
            <CardTitle className="text-lg text-layit-blue uppercase">🛍️ Shopping List</CardTitle>
            <CardDescription className="font-medium">
              Materials you need to purchase for this project
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-layit-white border-2 border-layit-blue">
                <div className="text-2xl mb-2">🔲</div>
                <p className="font-bold text-layit-blue text-xl">{calculations.totalTiles}</p>
                <p className="text-sm text-layit-blue/70 uppercase font-medium">
                  Tiles ({tile.length}×{tile.width}{tileUnit})
                </p>
              </div>

              <div className="text-center p-6 bg-layit-white border-2 border-layit-blue">
                <div className="text-2xl mb-2">🧱</div>
                <p className="font-bold text-layit-blue text-xl">{formatWithUnit(calculations.groutArea * 0.5, 'kg')}</p>
                <p className="text-sm text-layit-blue/70 uppercase font-medium">
                  Grout (Estimated)
                </p>
              </div>

              <div className="text-center p-6 bg-layit-white border-2 border-layit-blue">
                <div className="text-2xl mb-2">🪣</div>
                <p className="font-bold text-layit-blue text-xl">{formatWithUnit(calculations.totalArea * 1.2, 'L')}</p>
                <p className="text-sm text-layit-blue/70 uppercase font-medium">
                  Adhesive (Estimated)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="flex flex-col sm:flex-row gap-4 justify-between pt-6"
      >
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleSave}
            className="flex items-center gap-2 border-4 border-layit-blue text-layit-blue hover:bg-layit-yellow font-bold"
          >
            <SaveIcon className="h-4 w-4" />
            SAVE PROJECT
          </Button>
          <Button
            variant="outline"
            onClick={handleExport}
            className="flex items-center gap-2 border-4 border-layit-blue text-layit-blue hover:bg-layit-yellow font-bold"
          >
            <DownloadIcon className="h-4 w-4" />
            EXPORT PDF
          </Button>
        </div>
        <Button
          className="bg-layit-yellow text-layit-blue hover:bg-layit-orange hover:text-layit-white font-bold shadow-[4px_4px_0px_theme(colors.layit.blue)] border-4 border-layit-blue"
        >
          <ShareIcon className="h-4 w-4 mr-2" />
          SHARE RESULTS
        </Button>
      </motion.div>
    </div>
  )
}