'use client'

import { useProjectStore } from '@/store/project-store'
import { WizardLayout } from '@/components/wizard/wizard-layout'
import { DimensionsStep } from '@/components/wizard/steps/dimensions-step'
import { TileSelectionStep } from '@/components/wizard/steps/tile-selection-step'
import { PatternSelectionStep } from '@/components/wizard/steps/pattern-selection-step'
import { ResultsStep } from '@/components/wizard/steps/results-step'

export default function ProjectWizardPage() {
  const { currentStep } = useProjectStore()

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <DimensionsStep />
      case 1:
        return <TileSelectionStep />
      case 2:
        return <PatternSelectionStep />
      case 3:
        return <ResultsStep />
      default:
        return <DimensionsStep />
    }
  }

  return (
    <WizardLayout>
      {renderStep()}
    </WizardLayout>
  )
}
