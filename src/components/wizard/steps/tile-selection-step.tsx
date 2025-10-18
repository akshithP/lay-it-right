'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useProjectStore } from '@/store/project-store'
import { cn } from '@/lib/utils'
import type { Unit } from '@/types'

// Preset tile sizes (4 options only as per design)
const TILE_PRESETS = [
  { length: 30, width: 30, unit: 'cm' as Unit, label: '30×30 cm', description: 'Common' },
  { length: 60, width: 60, unit: 'cm' as Unit, label: '60×60 cm', description: 'Large' },
  { length: 20, width: 20, unit: 'cm' as Unit, label: '20×20 cm', description: 'Small' },
  { length: 15, width: 15, unit: 'cm' as Unit, label: '15×15 cm', description: 'Mosaic' }
]

// Preset grout widths (4 options only as per design)
const GROUT_PRESETS = [
  { width: 2, label: '2 mm', description: 'Ceramic tiles - tight' },
  { width: 3, label: '3 mm', description: 'Standard ceramic' },
  { width: 5, label: '5 mm', description: 'Floor tiles' },
  { width: 10, label: '10 mm', description: 'Decorative/rustic' }
]

const MAX_TILE_DIMENSION = 200 // cm (2m in cm)
const MAX_GROUT_WIDTH = 20 // mm

export function TileSelectionStep() {
  const { currentProject, setTileSpecification, nextStep, previousStep } = useProjectStore()

  // Get room dimensions from Step 1
  const roomLength = currentProject.layout?.dimensions.length || 5
  const roomWidth = currentProject.layout?.dimensions.width || 4
  const roomUnit = currentProject.layout?.dimensions.unit || 'm'

  // Tile state
  const [tileLength, setTileLength] = useState<number>(currentProject.tile?.length || 30)
  const [tileWidth, setTileWidth] = useState<number>(currentProject.tile?.width || 30)
  const [tileUnit, setTileUnit] = useState<Unit>(currentProject.tile?.unit || 'cm')
  const [selectedTilePreset, setSelectedTilePreset] = useState<string | null>(TILE_PRESETS[0].label)

  // Grout state
  const [groutWidth, setGroutWidth] = useState<number>(currentProject.tile?.groutWidth || 3)
  const [selectedGroutPreset, setSelectedGroutPreset] = useState<string | null>(GROUT_PRESETS[1].label)

  // Validation errors
  const [tileLengthError, setTileLengthError] = useState<string | null>(null)
  const [tileWidthError, setTileWidthError] = useState<string | null>(null)
  const [groutWidthError, setGroutWidthError] = useState<string | null>(null)

  // Validate tile dimensions
  const validateTileDimension = (value: number, field: 'length' | 'width') => {
    if (value <= 0) {
      return 'Must be greater than 0'
    }
    if (tileUnit === 'cm' && value > MAX_TILE_DIMENSION) {
      return `Max ${MAX_TILE_DIMENSION} cm (2m)`
    }
    if (tileUnit === 'm' && value > 2) {
      return 'Max 2 m per side'
    }
    return null
  }

  // Validate grout width
  const validateGroutWidth = (value: number) => {
    if (value < 0) {
      return 'Must be 0 or greater'
    }
    if (value > MAX_GROUT_WIDTH) {
      return `Max ${MAX_GROUT_WIDTH} mm`
    }
    return null
  }

  // Handle preset tile selection
  const handlePresetTileSelect = (preset: typeof TILE_PRESETS[0]) => {
    setTileLength(preset.length)
    setTileWidth(preset.width)
    setTileUnit(preset.unit)
    setSelectedTilePreset(preset.label)
    setTileLengthError(null)
    setTileWidthError(null)
  }

  // Handle preset grout selection
  const handlePresetGroutSelect = (preset: typeof GROUT_PRESETS[0]) => {
    setGroutWidth(preset.width)
    setSelectedGroutPreset(preset.label)
    setGroutWidthError(null)
  }

  // Handle manual tile input
  const handleTileLengthChange = (value: string) => {
    const numValue = parseFloat(value)
    setTileLength(numValue)
    setSelectedTilePreset(null) // Deselect preset when manual input
    const error = validateTileDimension(numValue, 'length')
    setTileLengthError(error)
  }

  const handleTileWidthChange = (value: string) => {
    const numValue = parseFloat(value)
    setTileWidth(numValue)
    setSelectedTilePreset(null) // Deselect preset when manual input
    const error = validateTileDimension(numValue, 'width')
    setTileWidthError(error)
  }

  const handleGroutWidthChange = (value: string) => {
    const numValue = parseFloat(value)
    setGroutWidth(numValue)
    setSelectedGroutPreset(null) // Deselect preset when manual input
    const error = validateGroutWidth(numValue)
    setGroutWidthError(error)
  }

  // Calculate tile area
  const tileArea = useMemo(() => {
    if (tileLength > 0 && tileWidth > 0) {
      const area = tileLength * tileWidth
      return `${area.toFixed(0)} ${tileUnit}²`
    }
    return null
  }, [tileLength, tileWidth, tileUnit])

  // Calculate estimated tiles
  const estimatedTiles = useMemo(() => {
    // Convert room to cm²
    let roomAreaCm = 0
    if (roomUnit === 'm') {
      roomAreaCm = roomLength * roomWidth * 10000 // m² to cm²
    } else if (roomUnit === 'cm') {
      roomAreaCm = roomLength * roomWidth
    }

    // Convert tile to cm²
    let tileAreaCm = 0
    if (tileUnit === 'cm') {
      tileAreaCm = tileLength * tileWidth
    } else if (tileUnit === 'm') {
      tileAreaCm = tileLength * tileWidth * 10000
    }

    if (roomAreaCm > 0 && tileAreaCm > 0) {
      const tiles = Math.ceil((roomAreaCm / tileAreaCm) * 1.05) // 5% waste
      return tiles
    }
    return 0
  }, [roomLength, roomWidth, roomUnit, tileLength, tileWidth, tileUnit])

  // Calculate grout impact
  const groutImpact = useMemo(() => {
    if (groutWidth > 0 && tileLength > 0) {
      // Convert tile length to mm
      const tileLengthMm = tileUnit === 'cm' ? tileLength * 10 : tileLength * 1000
      const totalSpacing = tileLengthMm + groutWidth
      const impact = (groutWidth / totalSpacing) * 100
      return impact.toFixed(1)
    }
    return '0.0'
  }, [groutWidth, tileLength, tileUnit])

  // Check if form is valid
  const isFormValid =
    tileLength > 0 &&
    tileWidth > 0 &&
    groutWidth >= 0 &&
    !tileLengthError &&
    !tileWidthError &&
    !groutWidthError

  // Handle continue
  const handleContinue = () => {
    if (isFormValid) {
      setTileSpecification({
        length: tileLength,
        width: tileWidth,
        unit: tileUnit,
        groutWidth: groutWidth
      })
      nextStep()
    }
  }

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-layit-blue mb-2" style={{ textShadow: '3px 3px 0px #EB8317' }}>
          TILE & GROUT
        </h2>
        <p className="text-layit-blue/70 font-semibold">
          Select tile dimensions and grout width for accurate calculations
        </p>
      </div>

      {/* 1. Tile Dimensions Section */}
      <Card className="block-container">
        <CardHeader>
          <CardTitle className="section-title text-layit-blue">1. TILE DIMENSIONS</CardTitle>
          <CardDescription className="info-text">
            Select common tile size or enter custom dimensions (max 2m per side)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Preset Selection */}
            <div>
              <h3 className="text-base font-bold uppercase mb-4 text-layit-blue">QUICK PRESETS</h3>
              <div className="grid grid-cols-2 gap-4 mb-8">
                {TILE_PRESETS.map((preset) => (
                  <motion.button
                    key={preset.label}
                    whileHover={{ scale: 1.02, x: -2, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handlePresetTileSelect(preset)}
                    className={cn(
                      'preset-button',
                      selectedTilePreset === preset.label && 'active'
                    )}
                  >
                    <div className="text-2xl mb-2 text-layit-orange">████</div>
                    <div className="text-sm font-bold">{preset.label}</div>
                    <div className="text-xs opacity-70">{preset.description}</div>
                  </motion.button>
                ))}
              </div>

              {/* Manual Input */}
              <div className="border-t-2 border-dashed border-layit-blue pt-4">
                <h3 className="text-base font-bold uppercase mb-4 text-layit-blue">OR ENTER CUSTOM</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label className="block text-sm font-bold uppercase mb-2 text-layit-blue">LENGTH</Label>
                    <Input
                      type="number"
                      value={tileLength}
                      onChange={(e) => handleTileLengthChange(e.target.value)}
                      className={cn(
                        'dimension-input',
                        tileLengthError && 'border-red-500'
                      )}
                      step="0.1"
                      min="0.1"
                    />
                    {tileLengthError && (
                      <p className="text-xs text-red-600 font-bold mt-1">{tileLengthError}</p>
                    )}
                  </div>
                  <div>
                    <Label className="block text-sm font-bold uppercase mb-2 text-layit-blue">WIDTH</Label>
                    <Input
                      type="number"
                      value={tileWidth}
                      onChange={(e) => handleTileWidthChange(e.target.value)}
                      className={cn(
                        'dimension-input',
                        tileWidthError && 'border-red-500'
                      )}
                      step="0.1"
                      min="0.1"
                    />
                    {tileWidthError && (
                      <p className="text-xs text-red-600 font-bold mt-1">{tileWidthError}</p>
                    )}
                  </div>
                </div>
                <div>
                  <Label className="block text-sm font-bold uppercase mb-2 text-layit-blue">UNIT</Label>
                  <select
                    value={tileUnit}
                    onChange={(e) => setTileUnit(e.target.value as Unit)}
                    className="unit-selector w-full"
                  >
                    <option value="mm">MM (Millimeters)</option>
                    <option value="cm">CM (Centimeters)</option>
                    <option value="m">M (Meters)</option>
                    <option value="in">IN (Inches)</option>
                    <option value="ft">FT (Feet)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Right: Tile Preview */}
            <div className="tile-preview">
              <div className="tile-label">YOUR SELECTED TILE</div>
              <div className="tile-size-display text-layit-blue">
                {tileLength}×{tileWidth} {tileUnit.toUpperCase()}
              </div>
              <svg viewBox="0 0 200 200" width="150" height="150" className="my-4">
                <rect
                  x="20"
                  y="20"
                  width="160"
                  height="160"
                  stroke="#10375C"
                  strokeWidth="3"
                  fill="rgba(243, 198, 35, 0.2)"
                />
                <line x1="10" y1="100" x2="20" y2="100" stroke="#10375C" strokeWidth="2"/>
                <line x1="180" y1="100" x2="190" y2="100" stroke="#10375C" strokeWidth="2"/>
                <text x="100" y="115" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#10375C">
                  TILE
                </text>
              </svg>
              {tileArea && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="info-text text-layit-blue"
                >
                  Area per tile: {tileArea}
                </motion.div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Grout Width Section */}
      <Card className="block-container">
        <CardHeader>
          <CardTitle className="section-title text-layit-blue">2. GROUT WIDTH</CardTitle>
          <CardDescription className="info-text">
            Space between tiles (max 20mm)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Grout Settings */}
            <div>
              <h3 className="text-base font-bold uppercase mb-4 text-layit-blue">GROUT SETTINGS</h3>

              {/* Preset Grout Buttons */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {GROUT_PRESETS.map((preset) => (
                  <motion.button
                    key={preset.label}
                    whileHover={{ scale: 1.02, x: -2, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handlePresetGroutSelect(preset)}
                    className={cn(
                      'preset-button text-xs',
                      selectedGroutPreset === preset.label && 'active'
                    )}
                  >
                    <div className="font-bold">{preset.label}</div>
                    <div className="text-xs opacity-70">{preset.description}</div>
                  </motion.button>
                ))}
              </div>

              {/* Manual Grout Input */}
              <div className="mb-6">
                <Label className="block text-sm font-bold uppercase mb-3 text-layit-blue">
                  CUSTOM GROUT WIDTH
                </Label>
                <div className="flex gap-4">
                  <Input
                    type="number"
                    value={groutWidth}
                    onChange={(e) => handleGroutWidthChange(e.target.value)}
                    className={cn(
                      'dimension-input flex-1',
                      groutWidthError && 'border-red-500'
                    )}
                    step="0.5"
                    min="0"
                  />
                  <div className="unit-selector px-4 flex items-center">MM</div>
                </div>
                {groutWidthError && (
                  <p className="text-xs text-red-600 font-bold mt-1">{groutWidthError}</p>
                )}
                <div className="info-text mt-2">Max: 20mm</div>
              </div>

              {/* Common Grout Info */}
              <div className="bg-layit-yellow border-4 border-layit-blue p-4">
                <h4 className="font-bold uppercase mb-2 text-layit-blue text-sm">
                  COMMON GROUT WIDTHS
                </h4>
                <ul className="text-xs font-bold text-layit-blue space-y-1">
                  <li>• 2-3mm: Ceramic wall tiles</li>
                  <li>• 3-5mm: Standard floor tiles</li>
                  <li>• 5-8mm: Large format tiles</li>
                  <li>• 10-20mm: Decorative/rustic style</li>
                </ul>
              </div>
            </div>

            {/* Right: Grout Preview */}
            <div className="grout-preview">
              <div className="tile-label">GROUT VISUALIZATION</div>
              <svg viewBox="0 0 200 200" width="150" height="150" className="my-4">
                {/* 3x2 Grid with grout lines */}
                <rect x="20" y="20" width="50" height="50" stroke="#10375C" strokeWidth="2" fill="rgba(243, 198, 35, 0.3)"/>
                <rect x="75" y="20" width="50" height="50" stroke="#10375C" strokeWidth="2" fill="rgba(243, 198, 35, 0.3)"/>
                <rect x="130" y="20" width="50" height="50" stroke="#10375C" strokeWidth="2" fill="rgba(243, 198, 35, 0.3)"/>
                <rect x="20" y="75" width="50" height="50" stroke="#10375C" strokeWidth="2" fill="rgba(243, 198, 35, 0.3)"/>
                <rect x="75" y="75" width="50" height="50" stroke="#10375C" strokeWidth="2" fill="rgba(243, 198, 35, 0.3)"/>
                <rect x="130" y="75" width="50" height="50" stroke="#10375C" strokeWidth="2" fill="rgba(243, 198, 35, 0.3)"/>

                {/* Grout lines highlighting */}
                <line x1="70" y1="20" x2="70" y2="125" stroke="#EB8317" strokeWidth="3" opacity="0.7"/>
                <line x1="20" y1="70" x2="180" y2="70" stroke="#EB8317" strokeWidth="3" opacity="0.7"/>

                {/* Grout label */}
                <text x="85" y="140" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#EB8317">
                  ← GROUT
                </text>
              </svg>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="info-text text-layit-blue"
              >
                Grout impact: -{groutImpact}% usable area
              </motion.div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Section */}
      <Card className="block-container bg-layit-yellow/30">
        <CardHeader>
          <CardTitle className="section-title text-layit-blue">SUMMARY</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-sm font-bold uppercase text-layit-blue/70">ROOM SIZE</div>
              <div className="text-xl font-bold text-layit-blue">
                {roomLength}{roomUnit} × {roomWidth}{roomUnit}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm font-bold uppercase text-layit-blue/70">TILE SIZE</div>
              <div className="text-xl font-bold text-layit-blue">
                {tileLength}×{tileWidth}{tileUnit}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm font-bold uppercase text-layit-blue/70">GROUT</div>
              <div className="text-xl font-bold text-layit-blue">
                {groutWidth} mm
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm font-bold uppercase text-layit-blue/70">EST. TILES</div>
              <div className="text-xl font-bold text-layit-blue">
                ~{estimatedTiles}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between gap-6 pt-4">
        <Button
          onClick={previousStep}
          className="btn-secondary"
        >
          ← BACK
        </Button>
        <Button
          onClick={handleContinue}
          disabled={!isFormValid}
          className={cn(
            'btn-primary',
            !isFormValid && 'opacity-50 cursor-not-allowed'
          )}
        >
          CONTINUE →
        </Button>
      </div>
    </div>
  )
}
