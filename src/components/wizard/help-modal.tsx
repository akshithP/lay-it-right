'use client'

import { HelpCircle, Ruler, Grid3x3, Paintbrush, BarChart3 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface HelpModalProps {
  currentStep: number
}

interface StepHelp {
  icon: React.ReactNode
  title: string
  description: string
  instructions: string[]
  tips: string[]
}

const STEP_HELP: Record<number, StepHelp> = {
  0: {
    icon: <Ruler className="w-8 h-8 text-layit-orange" />,
    title: 'Room Dimensions',
    description: 'Enter the measurements of the area you want to tile.',
    instructions: [
      'Enter the length and width of your room',
      'Select your preferred unit of measurement (mm, cm, m, in, ft)',
      'You can choose from predefined layouts (Rectangle, L-shape, T-shape, U-shape) or draw a custom layout',
      'For custom layouts, click points to create straight-line polygon shapes',
      'Make sure all measurements are accurate for best results'
    ],
    tips: [
      'Measure your room carefully before entering dimensions',
      'For irregular rooms, use the custom layout option',
      'You can switch between units at any time',
      'Double-check your measurements to avoid ordering incorrect quantities'
    ]
  },
  1: {
    icon: <Grid3x3 className="w-8 h-8 text-layit-orange" />,
    title: 'Tile & Grout Selection',
    description: 'Specify your tile dimensions and grout line width.',
    instructions: [
      'Enter the length and width of a single tile',
      'Select the unit for tile measurements (typically mm or inches)',
      'Specify the grout line width (space between tiles)',
      'Common grout widths are 2-3mm for floor tiles, 1-2mm for wall tiles',
      'Ensure tile dimensions match the actual tiles you plan to purchase'
    ],
    tips: [
      'Check your tile packaging for exact dimensions',
      'Larger grout lines provide more flexibility but affect aesthetics',
      'Smaller tiles create more grout lines and may require more precision',
      'Consider ordering 10-15% extra tiles for cuts and future repairs'
    ]
  },
  2: {
    icon: <Paintbrush className="w-8 h-8 text-layit-orange" />,
    title: 'Layout Pattern',
    description: 'Choose how your tiles will be arranged.',
    instructions: [
      'Grid: Tiles aligned in straight rows and columns',
      'Brick/Running Bond: Offset pattern like brickwork (tiles shifted by half)',
      'Herringbone: Diagonal V-shaped pattern at 90-degree angles',
      'Different patterns create different visual effects',
      'Some patterns may result in more tile waste due to cuts'
    ],
    tips: [
      'Grid pattern is easiest to install and minimizes waste',
      'Brick pattern adds visual interest and is good for rectangular tiles',
      'Herringbone creates a dynamic look but requires more cuts',
      'Consider the room\'s purpose and traffic when choosing patterns',
      'Preview the pattern before making your final decision'
    ]
  },
  3: {
    icon: <BarChart3 className="w-8 h-8 text-layit-orange" />,
    title: 'Results & Preview',
    description: 'Review your calculations and tile layout visualization.',
    instructions: [
      'View total area to be tiled',
      'See the number of full tiles and cut tiles needed',
      'Check the waste percentage for your chosen pattern',
      'Interact with the visual preview - drag to pan, zoom to see details',
      'Save your project to reference or modify later'
    ],
    tips: [
      'Add 10-15% to the calculated tile count for waste and future repairs',
      'Full tiles are cheaper than cut tiles',
      'Higher waste percentage means more cuts and installation time',
      'Use the preview to visualize how the pattern will look in your space',
      'Save multiple project variations to compare different options'
    ]
  }
}

export function HelpModal({ currentStep }: HelpModalProps) {
  const helpContent = STEP_HELP[currentStep] || STEP_HELP[0]

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="bg-layit-white border-3 border-layit-blue transition-all hover:shadow-[3px_3px_0px_theme(colors.layit.orange)] hover:translate-x-[-1px] hover:translate-y-[-1px]"
          aria-label="Open help"
        >
          <HelpCircle className="w-5 h-5 text-layit-blue" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            {helpContent.icon}
            <DialogTitle className="text-2xl">{helpContent.title}</DialogTitle>
          </div>
          <DialogDescription className="text-base">
            {helpContent.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Instructions Section */}
          <div>
            <h3 className="font-bold text-layit-blue mb-3 text-lg uppercase border-b-2 border-layit-orange pb-2">
              📋 Instructions
            </h3>
            <ul className="space-y-2">
              {helpContent.instructions.map((instruction, index) => (
                <li
                  key={index}
                  className="flex gap-3 text-sm text-layit-blue/90"
                >
                  <span className="font-bold text-layit-orange min-w-[20px]">
                    {index + 1}.
                  </span>
                  <span>{instruction}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Tips Section */}
          <div className="bg-layit-yellow/30 border-2 border-layit-orange p-4">
            <h3 className="font-bold text-layit-blue mb-3 text-lg uppercase flex items-center gap-2">
              💡 Pro Tips
            </h3>
            <ul className="space-y-2">
              {helpContent.tips.map((tip, index) => (
                <li
                  key={index}
                  className="flex gap-3 text-sm text-layit-blue/90"
                >
                  <span className="text-layit-orange font-bold">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Navigation Hint */}
          <div className="text-center text-xs text-layit-blue/70 pt-4 border-t-2 border-layit-blue/20">
            Need more help? Click the help button (
            <HelpCircle className="inline w-3 h-3" />) at any step for
            step-specific guidance.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
