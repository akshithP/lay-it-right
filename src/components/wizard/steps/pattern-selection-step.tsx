'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useProjectStore } from '@/store/project-store'
import { motion } from 'framer-motion'
import type { LayoutPattern } from '@/types'
import { getRecommendedWastePercentage } from '@/utils/tile-calculations'

const patternOptions: Array<{
  id: LayoutPattern
  title: string
  description: string
  wastePercentage: number
  difficulty: 'Easy' | 'Medium' | 'Hard'
  pros: string[]
  cons: string[]
  pattern: React.ReactNode
}> = [
  {
    id: 'grid',
    title: 'Grid (Straight Lay)',
    description: 'Tiles aligned in straight rows and columns',
    wastePercentage: 10,
    difficulty: 'Easy',
    pros: ['Easy installation', 'Minimal waste', 'Clean, classic look'],
    cons: ['Can show imperfections', 'May feel static'],
    pattern: (
      <div className="grid grid-cols-3 gap-1 p-2">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="aspect-square bg-layit-yellow/60 rounded-sm" />
        ))}
      </div>
    )
  },
  {
    id: 'brick',
    title: 'Brick (Running Bond)',
    description: 'Offset pattern like traditional brickwork',
    wastePercentage: 15,
    difficulty: 'Medium',
    pros: ['Hides imperfections', 'Dynamic visual', 'Traditional appeal'],
    cons: ['More cuts needed', 'Slightly more complex'],
    pattern: (
      <div className="p-2">
        <div className="grid grid-cols-3 gap-1 mb-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="aspect-square bg-layit-orange/60 rounded-sm" />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-1 translate-x-[16.67%]">
          <div className="aspect-square bg-layit-orange/60 rounded-sm w-2/3" />
          <div className="aspect-square bg-layit-orange/60 rounded-sm" />
          <div className="aspect-square bg-layit-orange/60 rounded-sm" />
        </div>
      </div>
    )
  },
  {
    id: 'herringbone',
    title: 'Herringbone',
    description: 'Zigzag pattern with tiles at 90° angles',
    wastePercentage: 20,
    difficulty: 'Hard',
    pros: ['Stunning visual impact', 'Perceived larger space', 'Premium look'],
    cons: ['Complex installation', 'Higher waste', 'More expensive'],
    pattern: (
      <div className="p-2">
        <div className="flex items-center justify-center h-16">
          <div className="space-y-1">
            <div className="flex items-center">
              <div className="w-6 h-3 bg-layit-blue/60 rounded-sm" />
              <div className="w-3 h-6 bg-layit-blue/60 rounded-sm -ml-1" />
            </div>
            <div className="flex items-center">
              <div className="w-3 h-6 bg-layit-blue/60 rounded-sm" />
              <div className="w-6 h-3 bg-layit-blue/60 rounded-sm -ml-1" />
            </div>
          </div>
        </div>
      </div>
    )
  }
]

export function PatternSelectionStep() {
  const { currentProject, setLayoutPattern, nextStep } = useProjectStore()
  const [selectedPattern, setSelectedPattern] = useState<LayoutPattern>(
    currentProject.layout?.pattern || 'grid'
  )

  const handlePatternSelect = (pattern: LayoutPattern) => {
    setSelectedPattern(pattern)
    setLayoutPattern(pattern)
  }

  const handleContinue = () => {
    nextStep()
  }

  const selectedPatternData = patternOptions.find(p => p.id === selectedPattern)!

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-lg font-medium text-layit-blue mb-2">
          Choose Layout Pattern
        </h3>
        <p className="text-muted-foreground">
          Select how you want your tiles arranged. Each pattern affects waste and installation difficulty.
        </p>
      </div>

      {/* Pattern Options */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {patternOptions.map((option, index) => {
          const isSelected = selectedPattern === option.id

          return (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card
                className={`cursor-pointer transition-all duration-200 h-full ${
                  isSelected
                    ? 'border-layit-yellow bg-layit-yellow/5 shadow-md'
                    : 'hover:border-layit-yellow/50 hover:shadow-sm'
                }`}
                onClick={() => handlePatternSelect(option.id)}
              >
                <CardHeader className="text-center pb-3">
                  <div className={`mx-auto mb-4 w-24 h-16 rounded-lg border-2 transition-colors ${
                    isSelected
                      ? 'border-layit-yellow bg-white'
                      : 'border-muted bg-muted/20'
                  }`}>
                    {option.pattern}
                  </div>
                  <CardTitle className={`text-lg ${
                    isSelected ? 'text-layit-blue' : ''
                  }`}>
                    {option.title}
                  </CardTitle>
                  <CardDescription>{option.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Pattern Stats */}
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Difficulty:</span>
                      <span className={`font-medium ${
                        option.difficulty === 'Easy' ? 'text-green-600' :
                        option.difficulty === 'Medium' ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {option.difficulty}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Waste Factor:</span>
                      <span className="font-medium">{option.wastePercentage}%</span>
                    </div>
                  </div>

                  {/* Pros and Cons */}
                  <div className="space-y-3">
                    <div>
                      <h5 className="text-xs font-medium text-green-700 mb-1">Advantages</h5>
                      <ul className="text-xs text-green-600 space-y-1">
                        {option.pros.map((pro, idx) => (
                          <li key={idx}>• {pro}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="text-xs font-medium text-orange-700 mb-1">Considerations</h5>
                      <ul className="text-xs text-orange-600 space-y-1">
                        {option.cons.map((con, idx) => (
                          <li key={idx}>• {con}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mt-4 flex justify-center"
                    >
                      <div className="bg-layit-yellow text-layit-blue px-3 py-1 rounded-full text-sm font-medium">
                        Selected
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Selected Pattern Details */}
      {selectedPattern && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-layit-blue/20 bg-layit-blue/5">
            <CardHeader>
              <CardTitle className="text-lg text-layit-blue flex items-center gap-3">
                <div className="w-16 h-12 rounded border-2 border-layit-yellow bg-white">
                  {selectedPatternData.pattern}
                </div>
                {selectedPatternData.title} Pattern
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-medium mb-2 text-layit-blue">Installation</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    {selectedPatternData.description}
                  </p>
                  <div className="text-sm">
                    <span className={`inline-block px-2 py-1 rounded text-xs ${
                      selectedPatternData.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                      selectedPatternData.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {selectedPatternData.difficulty} Installation
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2 text-layit-blue">Material Planning</h4>
                  <div className="text-sm space-y-1">
                    <p><strong>Waste Factor:</strong> {selectedPatternData.wastePercentage}%</p>
                    <p className="text-muted-foreground">
                      Order {selectedPatternData.wastePercentage}% extra tiles to account for cuts and breakage.
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2 text-layit-blue">Visual Impact</h4>
                  <div className="text-sm space-y-1">
                    {selectedPatternData.pros.slice(0, 2).map((pro, idx) => (
                      <p key={idx} className="text-green-600">✓ {pro}</p>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="flex justify-end mt-8">
        <Button
          onClick={handleContinue}
          className="bg-layit-yellow text-layit-blue hover:bg-layit-orange"
          disabled={!selectedPattern}
        >
          Calculate Results
        </Button>
      </div>
    </div>
  )
}