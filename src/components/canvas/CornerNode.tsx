'use client'

import { memo, useCallback, useState, useEffect, useRef } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { motion, useAnimation, AnimatePresence } from 'framer-motion'
import { X, GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCanvasStore } from '@/stores/canvas-store'
import type { LayoutNodeData } from '@/types/canvas'

interface CornerNodeProps extends Omit<NodeProps, 'data'> {
  data: LayoutNodeData
}

export const CornerNode = memo(function CornerNode({
  id,
  data,
  selected
}: CornerNodeProps) {
  const { removeNode } = useCanvasStore()
  const [isHovered, setIsHovered] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [lastTap, setLastTap] = useState(0)
  const nodeRef = useRef<HTMLDivElement>(null)
  const controls = useAnimation()

  // Enhanced touch and interaction detection
  const isTouchDevice = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0)

  const handleDelete = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.stopPropagation()
      // Add haptic feedback on supported devices
      if ('vibrate' in navigator) {
        navigator.vibrate(50)
      }
      removeNode(id)
    },
    [id, removeNode]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault()
        // Add haptic feedback on supported devices
        if ('vibrate' in navigator) {
          navigator.vibrate(50)
        }
        removeNode(id)
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        // Simulate click for accessibility
        if (nodeRef.current) {
          nodeRef.current.click()
        }
      }
    },
    [id, removeNode]
  )

  // Enhanced touch handling for better mobile experience
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const currentTime = Date.now()
    const tapGap = currentTime - lastTap

    // Double tap to select/deselect (mobile accessibility)
    if (tapGap < 300 && tapGap > 0) {
      e.preventDefault()
      // Trigger selection logic
      setIsHovered(true)
      if ('vibrate' in navigator) {
        navigator.vibrate([50, 50, 50])
      }
    }

    setLastTap(currentTime)
    setIsDragging(true)
  }, [lastTap])

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true)
    controls.start({
      scale: 1.05,
      transition: { type: 'spring', stiffness: 400, damping: 25 }
    })
  }, [controls])

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false)
    controls.start({
      scale: 1,
      transition: { type: 'spring', stiffness: 400, damping: 25 }
    })
  }, [controls])

  // Animation on selection change
  useEffect(() => {
    if (selected) {
      controls.start({
        scale: [1, 1.1, 1],
        rotate: [0, 5, -5, 0],
        transition: { duration: 0.5, ease: 'easeInOut' }
      })
    }
  }, [selected, controls])

  return (
    <motion.div
      ref={nodeRef}
      initial={{ scale: 0, opacity: 0, y: -20 }}
      animate={controls}
      exit={{
        scale: 0,
        opacity: 0,
        y: -20,
        transition: { duration: 0.2 }
      }}
      whileHover={isTouchDevice ? {} : { scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      drag={!isTouchDevice}
      dragMomentum={false}
      dragElastic={0.1}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => setIsDragging(false)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 25
      }}
      className="relative group cursor-grab active:cursor-grabbing"
    >
      {/* Corner Node Circle */}
      <motion.div
        layout
        className={cn(
          // Base styles
          'flex items-center justify-center rounded-full border-3 bg-white shadow-lg cursor-pointer select-none relative',
          'transition-all duration-200 ease-out',

          // Enhanced size for better touch targets - minimum 44px
          isTouchDevice ? 'w-12 h-12' : 'w-11 h-11',

          // Colors and states with enhanced contrast
          'border-layit-blue text-layit-blue font-bold',
          isTouchDevice ? 'text-base' : 'text-sm',

          // Enhanced hover states
          !isTouchDevice && 'hover:bg-layit-yellow hover:border-layit-orange hover:shadow-xl',

          // Enhanced selected state with better visibility
          selected && [
            'bg-layit-orange text-white border-layit-orange shadow-xl',
            'ring-4 ring-layit-orange/30',
            'transform-gpu'
          ],

          // Start node special styling with better contrast
          data.isStartNode && [
            'ring-2 ring-layit-green/60 border-layit-green',
            selected ? 'ring-4 ring-layit-green/40' : 'ring-2 ring-layit-green/60'
          ],

          // Enhanced focus styles for accessibility
          'focus:outline-none focus:ring-4 focus:ring-layit-blue/60 focus:border-layit-blue',

          // Dragging state
          isDragging && 'shadow-2xl ring-4 ring-layit-blue/20 scale-105'
        )}
        tabIndex={0}
        role="button"
        aria-label={`Corner point ${data.label}${selected ? ' (selected)' : ''}${data.isStartNode ? ' (starting point)' : ''}. ${isTouchDevice ? 'Double tap to select, long press for options' : 'Click to select, drag to move'}`}
        aria-pressed={selected}
        aria-describedby={`node-help-${id}`}
        onKeyDown={handleKeyDown}
        animate={{
          borderColor: selected ? '#F97316' : isHovered ? '#F97316' : '#10375C',
          backgroundColor: selected ? '#F97316' : isHovered ? '#FEF3C7' : '#FFFFFF'
        }}
        transition={{ duration: 0.15 }}
      >
        <span className="pointer-events-none font-semibold">
          {data.label}
        </span>

        {/* Drag affordance for touch devices */}
        {isTouchDevice && isHovered && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="absolute -bottom-1 -right-1 w-4 h-4 bg-layit-blue/80 rounded-full flex items-center justify-center"
          >
            <GripVertical size={8} className="text-white" />
          </motion.div>
        )}
      </motion.div>

      {/* Hidden accessible description */}
      <div id={`node-help-${id}`} className="sr-only">
        {isTouchDevice
          ? 'This is a corner point you can drag to reposition. Double tap to select, long press for more options.'
          : 'This is a corner point you can click and drag to reposition. Use Delete key to remove when selected.'
        }
      </div>

      {/* Enhanced Delete Button with better touch targets */}
      <AnimatePresence>
        {selected && data.canDelete && (
          <motion.button
            initial={{ scale: 0, opacity: 0, rotate: -90 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0, rotate: 90 }}
            whileHover={!isTouchDevice ? { scale: 1.1 } : {}}
            whileTap={{ scale: 0.9 }}
            onClick={handleDelete}
            onTouchStart={handleDelete} // Better touch support
            className={cn(
              'absolute -top-2 -right-2 rounded-full',
              'bg-red-500 text-white border-2 border-white shadow-lg',
              'flex items-center justify-center',
              'hover:bg-red-600 focus:bg-red-600',
              'focus:outline-none focus:ring-2 focus:ring-red-300',
              'transition-all duration-200',
              'active:bg-red-700',
              // Enhanced touch targets
              isTouchDevice ? 'w-8 h-8' : 'w-6 h-6'
            )}
            aria-label={`Delete corner point ${data.label}`}
            title="Delete point"
            type="button"
          >
            <X size={isTouchDevice ? 14 : 12} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Enhanced Start Node Indicator with animation */}
      <AnimatePresence>
        {data.isStartNode && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: 1,
              opacity: 1,
              y: [0, -2, 0] // Subtle floating animation
            }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{
              y: {
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut'
              }
            }}
            className={cn(
              'absolute -bottom-1 -right-1 rounded-full border-2 border-white shadow-sm',
              'bg-layit-green',
              isTouchDevice ? 'w-4 h-4' : 'w-3 h-3'
            )}
            title="Starting point"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Enhanced Connection Handles - invisible but necessary for React Flow */}
      <Handle
        type="source"
        position={Position.Top}
        style={{ opacity: 0, pointerEvents: 'none' }}
        isConnectable={data.isConnectable}
        aria-hidden="true"
      />
      <Handle
        type="target"
        position={Position.Top}
        style={{ opacity: 0, pointerEvents: 'none' }}
        isConnectable={data.isConnectable}
        aria-hidden="true"
      />

      {/* Ripple effect on touch */}
      {isTouchDevice && isDragging && (
        <motion.div
          initial={{ scale: 0, opacity: 0.5 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0 bg-layit-blue rounded-full pointer-events-none"
        />
      )}
    </motion.div>
  )
})

CornerNode.displayName = 'CornerNode'