'use client'

import { motion } from 'framer-motion'
import type { LayoutShape } from '@/types'

interface RectangleTemplateProps {
  isSelected: boolean
  onSelect: (shape: LayoutShape) => void
}

export function RectangleTemplate({ isSelected, onSelect }: RectangleTemplateProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect('rectangle')}
      className={`
        cursor-pointer transition-all duration-200 font-mono
        bg-layit-white border-4 border-layit-blue p-6 flex flex-col items-center text-center
        ${
          isSelected
            ? 'bg-layit-blue text-layit-white shadow-[4px_4px_0px_theme(colors.layit.orange)]'
            : 'hover:shadow-[4px_4px_0px_theme(colors.layit.orange)] hover:translate-x-[-2px] hover:translate-y-[-2px]'
        }
      `}
    >
      <div
        className={`
          w-15 h-15 border-4 border-layit-blue mb-4 flex items-center justify-center text-2xl font-bold
          ${
            isSelected
              ? 'bg-layit-orange text-layit-white'
              : 'bg-layit-yellow text-layit-blue'
          }
        `}
      >
        ▢
      </div>
      <span className="font-bold uppercase text-sm">RECTANGLE</span>
    </motion.div>
  )
}