'use client'

import { ReactNode } from 'react'
import { ArrowLeftIcon } from 'lucide-react'
import { useProjectStore } from '@/store/project-store'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ProgressIndicator } from './progress-indicator'
import { HelpModal } from './help-modal'

interface WizardLayoutProps {
  children: ReactNode
  onNext?: () => void
  onPrevious?: () => void
  canContinue?: boolean
  isLoading?: boolean
}

export function WizardLayout({
  children,
  onNext,
  onPrevious,
  canContinue = true,
  isLoading = false
}: WizardLayoutProps) {
  const router = useRouter()
  const {
    wizardSteps,
    currentStep,
    nextStep,
    previousStep,
    currentProject
  } = useProjectStore()

  const currentStepData = wizardSteps[currentStep]
  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === wizardSteps.length - 1

  const handleNext = () => {
    if (onNext) {
      onNext()
    } else {
      nextStep()
    }
  }

  const handlePrevious = () => {
    if (onPrevious) {
      onPrevious()
    } else {
      previousStep()
    }
  }

  const handleHome = () => {
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-layit-yellow font-mono">
      {/* Header */}
      <header className="w-full px-6 py-4 flex justify-between items-center border-b-4 border-layit-blue bg-layit-white">
        <div className="text-2xl font-bold text-layit-blue">LAYITRIGHT</div>
        <div className="flex gap-4">
          <HelpModal currentStep={currentStep} />
          <button
            onClick={handleHome}
            className="bg-layit-white border-3 border-layit-blue p-2 transition-all hover:shadow-[3px_3px_0px_theme(colors.layit.orange)] hover:translate-x-[-1px] hover:translate-y-[-1px]"
            aria-label="Go to home"
          >
            <ArrowLeftIcon className="w-5 h-5 text-layit-blue" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 text-layit-blue">
            CREATE YOUR TILING PROJECT
          </h1>
        </div>

        {/* Progress Steps */}
        <ProgressIndicator />

        {/* Content Area */}
        <div className="mb-8">
          <div className="bg-layit-white border-4 border-layit-blue rounded-none shadow-[8px_8px_0px_theme(colors.layit.blue)] p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-6">
          <button
            onClick={handlePrevious}
            disabled={isFirstStep || isLoading}
            className={`
              bg-layit-white text-layit-blue border-4 border-layit-blue px-8 py-4 font-bold uppercase letter-spacing-wider transition-all
              ${
                isFirstStep || isLoading
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-layit-orange hover:text-layit-white hover:shadow-[4px_4px_0px_theme(colors.layit.blue)] hover:translate-x-[-2px] hover:translate-y-[-2px]'
              }
            `}
          >
            CANCEL
          </button>

          <button
            onClick={handleNext}
            disabled={!canContinue || isLoading}
            className={`
              bg-layit-blue text-layit-white border-4 border-layit-blue px-8 py-4 font-bold uppercase letter-spacing-wider transition-all
              ${
                !canContinue || isLoading
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:shadow-[4px_4px_0px_theme(colors.layit.orange)] hover:translate-x-[-2px] hover:translate-y-[-2px]'
              }
            `}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2 inline-block" />
                PROCESSING...
              </>
            ) : (
              isLastStep ? 'COMPLETE' : 'CONTINUE'
            )}
          </button>
        </div>
      </main>
    </div>
  )
}