'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useProjectStore } from '@/store/project-store'
import { cn } from '@/lib/utils'
import type { LayoutPattern } from '@/types'

// Pattern metadata with detailed information
const patternOptions: Array<{
  id: LayoutPattern
  title: string
  description: string
  wastePercentage: number
  difficulty: 'Easy' | 'Medium' | 'Hard'
  installTime: string
  pros: string[]
  cons: string[]
  bestFor: string[]
}> = [
  {
    id: 'grid',
    title: 'Grid (Straight Lay)',
    description: 'Tiles aligned in straight rows and columns',
    wastePercentage: 10,
    difficulty: 'Easy',
    installTime: 'Fastest',
    pros: ['Easy to install', 'Minimal waste', 'Clean, classic look', 'DIY-friendly'],
    cons: ['Can show imperfections', 'May feel static', 'Shows uneven surfaces'],
    bestFor: ['Large tiles', 'Beginners', 'Budget projects', 'Modern spaces']
  },
  {
    id: 'brick',
    title: 'Brick (Running Bond)',
    description: 'Offset pattern like traditional brickwork, 50% stagger',
    wastePercentage: 15,
    difficulty: 'Medium',
    installTime: 'Moderate',
    pros: ['Hides imperfections', 'Dynamic visual', 'Traditional appeal', 'Versatile style'],
    cons: ['More cuts needed', 'Slightly more complex', 'Higher waste than grid'],
    bestFor: ['Rectangular tiles', 'Subway tiles', 'Classic spaces', 'Walls & floors']
  },
  {
    id: 'herringbone',
    title: 'Herringbone',
    description: 'Zigzag pattern with tiles at 45° angles creating a "V" shape',
    wastePercentage: 20,
    difficulty: 'Hard',
    installTime: 'Slowest',
    pros: ['Stunning visual impact', 'Perceived larger space', 'Premium look', 'Timeless elegance'],
    cons: ['Complex installation', 'Higher waste', 'More expensive', 'Requires precision'],
    bestFor: ['Experienced DIYers', 'Feature walls', 'High-end projects', 'Narrow spaces']
  }
]

// SVG Pattern Components for visual previews
const GridPatternSVG = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 120 120" className={cn('w-full h-full', className)}>
    {/* 3x3 Grid */}
    {Array.from({ length: 9 }).map((_, i) => {
      const row = Math.floor(i / 3)
      const col = i % 3
      const fillColors = ['#F3C623', '#EB8317', '#10375C']
      return (
        <rect
          key={i}
          x={col * 40 + 2}
          y={row * 40 + 2}
          width={36}
          height={36}
          fill={fillColors[i % 3]}
          stroke="#10375C"
          strokeWidth="2"
          opacity="0.9"
        />
      )
    })}
  </svg>
)

const BrickPatternSVG = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 120 120" className={cn('w-full h-full', className)}>
    {/* Row 1 - Full tiles */}
    <rect x="2" y="2" width="36" height="26" fill="#F3C623" stroke="#10375C" strokeWidth="2" opacity="0.9" />
    <rect x="40" y="2" width="36" height="26" fill="#EB8317" stroke="#10375C" strokeWidth="2" opacity="0.9" />
    <rect x="78" y="2" width="36" height="26" fill="#F3C623" stroke="#10375C" strokeWidth="2" opacity="0.9" />

    {/* Row 2 - Offset by 50% */}
    <rect x="2" y="30" width="18" height="26" fill="#EB8317" stroke="#10375C" strokeWidth="2" opacity="0.9" />
    <rect x="22" y="30" width="36" height="26" fill="#10375C" stroke="#10375C" strokeWidth="2" opacity="0.9" />
    <rect x="60" y="30" width="36" height="26" fill="#EB8317" stroke="#10375C" strokeWidth="2" opacity="0.9" />
    <rect x="98" y="30" width="18" height="26" fill="#F3C623" stroke="#10375C" strokeWidth="2" opacity="0.9" />

    {/* Row 3 - Full tiles */}
    <rect x="2" y="58" width="36" height="26" fill="#F3C623" stroke="#10375C" strokeWidth="2" opacity="0.9" />
    <rect x="40" y="58" width="36" height="26" fill="#EB8317" stroke="#10375C" strokeWidth="2" opacity="0.9" />
    <rect x="78" y="58" width="36" height="26" fill="#10375C" stroke="#10375C" strokeWidth="2" opacity="0.9" />

    {/* Row 4 - Offset */}
    <rect x="2" y="86" width="18" height="26" fill="#EB8317" stroke="#10375C" strokeWidth="2" opacity="0.9" />
    <rect x="22" y="86" width="36" height="26" fill="#F3C623" stroke="#10375C" strokeWidth="2" opacity="0.9" />
    <rect x="60" y="86" width="36" height="26" fill="#EB8317" stroke="#10375C" strokeWidth="2" opacity="0.9" />
    <rect x="98" y="86" width="18" height="26" fill="#10375C" stroke="#10375C" strokeWidth="2" opacity="0.9" />
  </svg>
)

const HerringbonePatternSVG = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 120 120" className={cn('w-full h-full', className)}>
    {/* Herringbone pattern with 45° rotated rectangles */}
    {/* Top left diagonal */}
    <rect x="10" y="30" width="40" height="15" fill="#F3C623" stroke="#10375C" strokeWidth="2" transform="rotate(-45 30 37)" opacity="0.9" />
    <rect x="30" y="10" width="15" height="40" fill="#EB8317" stroke="#10375C" strokeWidth="2" transform="rotate(-45 37 30)" opacity="0.9" />

    {/* Center */}
    <rect x="40" y="50" width="40" height="15" fill="#10375C" stroke="#10375C" strokeWidth="2" transform="rotate(-45 60 57)" opacity="0.9" />
    <rect x="60" y="30" width="15" height="40" fill="#F3C623" stroke="#10375C" strokeWidth="2" transform="rotate(-45 67 50)" opacity="0.9" />

    {/* Bottom right */}
    <rect x="70" y="70" width="40" height="15" fill="#EB8317" stroke="#10375C" strokeWidth="2" transform="rotate(-45 90 77)" opacity="0.9" />
    <rect x="50" y="70" width="15" height="40" fill="#10375C" stroke="#10375C" strokeWidth="2" transform="rotate(-45 57 90)" opacity="0.9" />

    {/* Additional tiles for fullness */}
    <rect x="10" y="70" width="40" height="15" fill="#F3C623" stroke="#10375C" strokeWidth="2" transform="rotate(-45 30 77)" opacity="0.9" />
    <rect x="70" y="30" width="40" height="15" fill="#EB8317" stroke="#10375C" strokeWidth="2" transform="rotate(-45 90 37)" opacity="0.9" />
  </svg>
)

const patternComponents: Record<LayoutPattern, React.ComponentType<{ className?: string }>> = {
  grid: GridPatternSVG,
  brick: BrickPatternSVG,
  herringbone: HerringbonePatternSVG
}

/**
 * PatternSelectionStep Component
 *
 * Step 3 of the project wizard where users select their tile layout pattern.
 * Features:
 * - Three pattern options: Grid, Brick, Herringbone
 * - Visual SVG previews with animations
 * - Detailed information about each pattern
 * - Waste percentage, difficulty, and pros/cons
 * - Brutalist design aesthetic
 * - Responsive layout
 * - Accessibility compliant
 */
export function PatternSelectionStep() {
  const { currentProject, setLayoutPattern, nextStep, previousStep } = useProjectStore()
  const [selectedPattern, setSelectedPattern] = useState<LayoutPattern>(
    currentProject.layout?.pattern || 'grid'
  )
  const [hoveredPattern, setHoveredPattern] = useState<LayoutPattern | null>(null)

  const handlePatternSelect = (pattern: LayoutPattern) => {
    setSelectedPattern(pattern)
    setLayoutPattern(pattern)
  }

  const handleContinue = () => {
    nextStep()
  }

  const selectedPatternData = patternOptions.find(p => p.id === selectedPattern)!
  const difficultyColors = {
    Easy: 'text-green-600 bg-green-100',
    Medium: 'text-orange-600 bg-orange-100',
    Hard: 'text-red-600 bg-red-100'
  }

  return (
    <div className="space-y-8">
      {/* Title Section */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-layit-blue mb-2" style={{ textShadow: '3px 3px 0px #EB8317' }}>
          LAYOUT PATTERN
        </h2>
        <p className="text-layit-blue/70 font-semibold">
          Choose how your tiles will be arranged. Each pattern affects installation difficulty and waste.
        </p>
      </div>

      {/* Pattern Selection Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {patternOptions.map((option) => {
          const isSelected = selectedPattern === option.id
          const isHovered = hoveredPattern === option.id
          const PatternComponent = patternComponents[option.id]

          return (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              onMouseEnter={() => setHoveredPattern(option.id)}
              onMouseLeave={() => setHoveredPattern(null)}
            >
              <button
                onClick={() => handlePatternSelect(option.id)}
                className={cn(
                  'w-full text-left transition-all duration-200',
                  'preset-button h-full flex flex-col',
                  isSelected && 'active',
                  !isSelected && isHovered && 'hover:scale-[1.02]'
                )}
                aria-label={`Select ${option.title} pattern`}
                aria-pressed={isSelected}
              >
                {/* Pattern Preview Box */}
                <div className={cn(
                  'w-full aspect-square border-4 mb-4 p-4 flex items-center justify-center transition-all',
                  isSelected
                    ? 'border-layit-orange bg-layit-yellow/20'
                    : 'border-layit-blue bg-layit-white'
                )}>
                  <motion.div
                    animate={isSelected ? { scale: [1, 1.05, 1] } : {}}
                    transition={{ duration: 0.5, repeat: isSelected ? Infinity : 0, repeatDelay: 2 }}
                    className="w-full h-full"
                  >
                    <PatternComponent className="w-full h-full" />
                  </motion.div>
                </div>

                {/* Pattern Info */}
                <div className="flex-1 flex flex-col">
                  <h3 className="text-lg font-bold uppercase mb-2 text-layit-blue">
                    {option.title}
                  </h3>
                  <p className="text-xs font-semibold text-layit-blue/70 mb-4">
                    {option.description}
                  </p>

                  {/* Stats Grid */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-layit-blue/70">DIFFICULTY:</span>
                      <span className={cn(
                        'text-xs font-bold px-2 py-1 rounded',
                        difficultyColors[option.difficulty]
                      )}>
                        {option.difficulty}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-layit-blue/70">WASTE:</span>
                      <span className="text-xs font-bold text-layit-blue">{option.wastePercentage}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-layit-blue/70">INSTALL TIME:</span>
                      <span className="text-xs font-bold text-layit-blue">{option.installTime}</span>
                    </div>
                  </div>

                  {/* Selection Indicator */}
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-auto pt-3 border-t-4 border-layit-orange"
                      >
                        <div className="bg-layit-blue text-layit-white px-3 py-2 text-center font-bold uppercase text-sm">
                          ✓ SELECTED
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </button>
            </motion.div>
          )
        })}
      </div>

      {/* Selected Pattern Details */}
      <AnimatePresence mode="wait">
        {selectedPattern && (
          <motion.div
            key={selectedPattern}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="block-container">
              <CardHeader>
                <CardTitle className="section-title text-layit-blue flex items-center gap-3">
                  <div className="w-16 h-16 border-4 border-layit-blue bg-layit-white p-2">
                    {React.createElement(patternComponents[selectedPattern], { className: 'w-full h-full' })}
                  </div>
                  {selectedPatternData.title} DETAILS
                </CardTitle>
                <CardDescription className="info-text">
                  Everything you need to know about this pattern
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Left Column - Pros and Cons */}
                  <div className="space-y-6">
                    {/* Advantages */}
                    <div>
                      <h4 className="font-bold uppercase mb-3 text-layit-blue text-sm border-b-2 border-layit-yellow pb-2">
                        ✓ ADVANTAGES
                      </h4>
                      <ul className="space-y-2">
                        {selectedPatternData.pros.map((pro, idx) => (
                          <motion.li
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="text-sm font-semibold text-green-700 flex items-start"
                          >
                            <span className="mr-2">•</span>
                            <span>{pro}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>

                    {/* Considerations */}
                    <div>
                      <h4 className="font-bold uppercase mb-3 text-layit-blue text-sm border-b-2 border-layit-orange pb-2">
                        ⚠ CONSIDERATIONS
                      </h4>
                      <ul className="space-y-2">
                        {selectedPatternData.cons.map((con, idx) => (
                          <motion.li
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 + 0.3 }}
                            className="text-sm font-semibold text-orange-700 flex items-start"
                          >
                            <span className="mr-2">•</span>
                            <span>{con}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Right Column - Best For and Stats */}
                  <div className="space-y-6">
                    {/* Best For */}
                    <div>
                      <h4 className="font-bold uppercase mb-3 text-layit-blue text-sm border-b-2 border-layit-blue pb-2">
                        👍 BEST FOR
                      </h4>
                      <ul className="space-y-2">
                        {selectedPatternData.bestFor.map((item, idx) => (
                          <motion.li
                            key={idx}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="text-sm font-semibold text-layit-blue flex items-start"
                          >
                            <span className="mr-2">→</span>
                            <span>{item}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>

                    {/* Installation Info Box */}
                    <div className="bg-layit-yellow/20 border-4 border-layit-blue p-4">
                      <h4 className="font-bold uppercase mb-3 text-layit-blue text-sm">
                        📋 INSTALLATION SUMMARY
                      </h4>
                      <div className="space-y-2 text-sm font-semibold text-layit-blue">
                        <div className="flex justify-between">
                          <span>Difficulty Level:</span>
                          <span className={cn(
                            'px-2 py-0.5 rounded font-bold',
                            difficultyColors[selectedPatternData.difficulty]
                          )}>
                            {selectedPatternData.difficulty}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Waste Factor:</span>
                          <span className="font-bold">{selectedPatternData.wastePercentage}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Installation Time:</span>
                          <span className="font-bold">{selectedPatternData.installTime}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      <div className="flex justify-between gap-6 pt-4">
        <Button
          onClick={previousStep}
          className="btn-secondary"
          aria-label="Go back to previous step"
        >
          ← BACK
        </Button>
        <Button
          onClick={handleContinue}
          disabled={!selectedPattern}
          className={cn(
            'btn-primary',
            !selectedPattern && 'opacity-50 cursor-not-allowed'
          )}
          aria-label="Continue to results"
        >
          VIEW RESULTS →
        </Button>
      </div>
    </div>
  )
}
