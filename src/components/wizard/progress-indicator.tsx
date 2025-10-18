'use client'

import { motion } from 'framer-motion'
import { useProjectStore } from '@/store/project-store'

export function ProgressIndicator() {
  const { wizardSteps, currentStep } = useProjectStore()

  return (
    <div className="mb-12">
      <div className="bg-layit-white border-4 border-layit-blue rounded-none shadow-[8px_8px_0px_theme(colors.layit.blue)] p-6 font-mono">
        <h3 className="text-lg font-bold mb-6 uppercase text-layit-blue">
          STEP {currentStep + 1}: {wizardSteps[currentStep]?.title?.toUpperCase()}
        </h3>

        <div className="flex items-center justify-center">
          {wizardSteps.map((step, index) => {
            const isActive = index === currentStep
            const isCompleted = step.completed
            const isPast = index < currentStep

            return (
              <div key={step.id} className="flex items-center">
                {/* Step Circle */}
                <motion.div
                  initial={false}
                  animate={{
                    scale: isActive ? 1.1 : 1,
                  }}
                  transition={{ duration: 0.2 }}
                  className={`
                    w-12 h-12 border-4 border-layit-blue flex items-center justify-center font-bold text-xl transition-all
                    ${
                      isActive
                        ? 'bg-layit-blue text-layit-white shadow-[4px_4px_0px_theme(colors.layit.orange)]'
                        : isCompleted || isPast
                        ? 'bg-layit-orange text-layit-white shadow-[2px_2px_0px_theme(colors.layit.blue)]'
                        : 'bg-layit-white text-layit-blue'
                    }
                  `}
                >
                  {isCompleted && !isActive ? '✓' : index + 1}
                </motion.div>

                {/* Progress Line */}
                {index < wizardSteps.length - 1 && (
                  <div className="flex-1 mx-4">
                    <div
                      className={`
                        h-2 border-3 border-layit-blue transition-all duration-300
                        ${isPast || isCompleted ? 'bg-layit-blue' : 'bg-layit-white'}
                      `}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Step Labels */}
        <div className="flex justify-between mt-4 text-sm font-bold uppercase">
          {wizardSteps.map((step, index) => {
            const isActive = index === currentStep
            const isPastOrActive = index <= currentStep

            return (
              <span
                key={step.id}
                className={`transition-colors ${
                  isActive
                    ? 'text-layit-blue'
                    : isPastOrActive
                    ? 'text-layit-blue/70'
                    : 'text-layit-blue/30'
                }`}
              >
                {step.title}
              </span>
            )
          })}
        </div>
      </div>
    </div>
  )
}