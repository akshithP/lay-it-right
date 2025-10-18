'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface AnimatedTileGridProps {
  className?: string
}

export function AnimatedTileGrid({ className = '' }: AnimatedTileGridProps) {
  // Create 24 tiles (8x3 grid)
  const tiles = Array.from({ length: 24 }, (_, index) => index)

  return (
    <div className={`tile-grid-large ${className}`}>
      {tiles.map((index) => (
        <motion.div
          key={index}
          className="tile-large"
          initial={{ scale: 1, opacity: 1 }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [1, 0.8, 1]
          }}
          transition={{
            duration: 2,
            ease: "easeInOut",
            repeat: Infinity,
            delay: (index % 3) * 0.2 // Stagger animation based on tile position
          }}
        />
      ))}
    </div>
  )
}