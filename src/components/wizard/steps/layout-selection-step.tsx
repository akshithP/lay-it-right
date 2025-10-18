'use client'

import { useState } from 'react'
import { PencilIcon, LayoutTemplateIcon } from 'lucide-react'
import { useProjectStore } from '@/store/project-store'
import { motion } from 'framer-motion'
import type { LayoutShape, CustomLayoutPoint } from '@/types'
import {
  RectangleTemplate,
  LShapeTemplate,
  UShapeTemplate,
  TShapeTemplate,
  CustomTemplate
} from '../templates'
import { DrawingCanvas } from '../canvas'

type TabType = 'custom' | 'templates'

export function LayoutSelectionStep() {
  const { currentProject, setLayoutShape, setCustomLayout } = useProjectStore()
  const [activeTab, setActiveTab] = useState<TabType>('templates')
  const [selectedLayout, setSelectedLayout] = useState<LayoutShape>(
    currentProject.layout?.shape || 'rectangle'
  )
  const [customLayoutComplete, setCustomLayoutComplete] = useState(false)

  const handleLayoutSelect = (shape: LayoutShape) => {
    setSelectedLayout(shape)
    setLayoutShape(shape)
  }

  const handleCustomLayoutComplete = (points: CustomLayoutPoint[]) => {
    setCustomLayoutComplete(true)

    // Store the custom layout points in the project store
    const customLayout = {
      points,
      isClosed: true, // Assuming the drawing canvas creates closed shapes
      segments: [] // Will be calculated in dimensions step
    }

    setCustomLayout(customLayout)
    setSelectedLayout('custom')
  }

  return (
    <div className="space-y-8">
      {/* Method Selection Tabs */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Draw Custom Tab */}
        <motion.div
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveTab('custom')}
          className={`
            cursor-pointer transition-all duration-200 font-mono text-center p-8
            bg-layit-white border-4 border-layit-blue
            ${
              activeTab === 'custom'
                ? 'bg-layit-blue text-layit-white shadow-[6px_6px_0px_theme(colors.layit.orange)]'
                : 'hover:shadow-[6px_6px_0px_theme(colors.layit.orange)] hover:translate-x-[-2px] hover:translate-y-[-2px]'
            }
          `}
        >
          <div className="flex items-center justify-center mb-4">
            <div
              className={`
                w-16 h-16 border-4 border-layit-blue flex items-center justify-center
                ${
                  activeTab === 'custom'
                    ? 'bg-layit-orange border-layit-white'
                    : 'bg-layit-orange border-layit-blue'
                }
              `}
            >
              <PencilIcon className="w-8 h-8 text-layit-white" />
            </div>
          </div>
          <h3 className="text-xl font-bold mb-2 uppercase">DRAW CUSTOM</h3>
          <p className="font-medium uppercase text-sm opacity-70">CREATE EXACT LAYOUT</p>
        </motion.div>

        {/* Templates Tab */}
        <motion.div
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveTab('templates')}
          className={`
            cursor-pointer transition-all duration-200 font-mono text-center p-8
            bg-layit-white border-4 border-layit-blue
            ${
              activeTab === 'templates'
                ? 'bg-layit-blue text-layit-white shadow-[6px_6px_0px_theme(colors.layit.orange)]'
                : 'hover:shadow-[6px_6px_0px_theme(colors.layit.orange)] hover:translate-x-[-2px] hover:translate-y-[-2px]'
            }
          `}
        >
          <div className="flex items-center justify-center mb-4">
            <div
              className={`
                w-16 h-16 border-4 flex items-center justify-center
                ${
                  activeTab === 'templates'
                    ? 'bg-layit-orange border-layit-white'
                    : 'bg-layit-orange border-layit-blue'
                }
              `}
            >
              <LayoutTemplateIcon className="w-8 h-8 text-layit-white" />
            </div>
          </div>
          <h3 className="text-xl font-bold mb-2 uppercase">TEMPLATES</h3>
          <p className="font-medium uppercase text-sm opacity-70">PREDEFINED SHAPES</p>
        </motion.div>
      </div>

      {/* Content Area */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'custom' ? (
          /* Custom Drawing Area */
          <div>
            <DrawingCanvas
              onLayoutComplete={handleCustomLayoutComplete}
              className="mx-auto max-w-4xl"
            />

            {customLayoutComplete && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-6"
              >
                <div className="bg-green-50 border-4 border-green-200 p-6 text-center">
                  <div className="flex items-center justify-center space-x-2 text-green-800">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="font-bold uppercase">CUSTOM LAYOUT COMPLETE</span>
                  </div>
                  <p className="text-green-700 mt-2 text-sm">
                    Your custom room layout has been captured. You can now proceed to enter dimensions.
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        ) : (
          /* Template Gallery */
          <div>
            <h3 className="text-xl font-bold mb-6 uppercase text-layit-blue">TEMPLATE GALLERY</h3>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              <RectangleTemplate
                isSelected={selectedLayout === 'rectangle'}
                onSelect={handleLayoutSelect}
              />
              <LShapeTemplate
                isSelected={selectedLayout === 'l-shape'}
                onSelect={handleLayoutSelect}
              />
              <UShapeTemplate
                isSelected={selectedLayout === 'u-shape'}
                onSelect={handleLayoutSelect}
              />
              <TShapeTemplate
                isSelected={selectedLayout === 't-shape'}
                onSelect={handleLayoutSelect}
              />
              <CustomTemplate
                isSelected={selectedLayout === 'custom'}
                onSelect={handleLayoutSelect}
              />

              {/* More Templates - Future Expansion */}
              <div className="bg-layit-white border-4 border-layit-blue p-6 flex flex-col items-center text-center cursor-pointer transition-all hover:shadow-[4px_4px_0px_theme(colors.layit.orange)] hover:translate-x-[-2px] hover:translate-y-[-2px]">
                <div className="w-15 h-15 bg-layit-yellow border-4 border-layit-blue mb-4 flex items-center justify-center text-2xl font-bold text-layit-blue">
                  +
                </div>
                <span className="font-bold uppercase text-sm text-layit-blue">MORE</span>
              </div>
            </div>

            {/* Selected Template Info */}
            {selectedLayout && selectedLayout !== 'custom' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
                className="mt-8"
              >
                <div className="bg-layit-blue/5 border-4 border-layit-blue/20 p-6">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-8 border-2 border-layit-blue rounded flex items-center justify-center">
                        <span className="text-xs text-layit-blue font-medium">
                          {selectedLayout === 'rectangle' ? 'L × W' : selectedLayout.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-layit-blue uppercase">
                        {selectedLayout.replace('-', ' ')} LAYOUT
                      </h4>
                      <p className="text-sm text-layit-blue/70">
                        {selectedLayout === 'rectangle' && 'Perfect for most rooms. Simply enter length and width measurements in the next step.'}
                        {selectedLayout === 'l-shape' && 'Great for open floor plans and connected rooms.'}
                        {selectedLayout === 'u-shape' && 'Ideal for kitchen layouts and wraparound spaces.'}
                        {selectedLayout === 't-shape' && 'Perfect for hallway intersections and T-shaped areas.'}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  )
}