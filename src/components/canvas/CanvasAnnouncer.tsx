'use client'

import { useEffect, useState, useRef } from 'react'
import { useCanvasStore } from '@/stores/canvas-store'

/**
 * Live region for screen reader announcements related to canvas interactions
 */
export function CanvasAnnouncer() {
  const [announcement, setAnnouncement] = useState('')
  const { nodes, edges, validateLayout } = useCanvasStore()
  const announcementRef = useRef<HTMLDivElement>(null)
  const lastNodeCountRef = useRef(0)
  const lastValidationRef = useRef<string>('')

  useEffect(() => {
    const currentNodeCount = nodes.length
    const validation = validateLayout()
    const validationKey = `${validation.isValid}-${validation.isClosed}-${validation.hasMinimumNodes}`

    let newAnnouncement = ''

    // Announce node changes
    if (currentNodeCount !== lastNodeCountRef.current) {
      if (currentNodeCount > lastNodeCountRef.current) {
        const addedNodes = currentNodeCount - lastNodeCountRef.current
        newAnnouncement = `Added ${addedNodes} corner point${addedNodes > 1 ? 's' : ''}. Total: ${currentNodeCount} points.`
      } else if (currentNodeCount < lastNodeCountRef.current) {
        const removedNodes = lastNodeCountRef.current - currentNodeCount
        newAnnouncement = `Removed ${removedNodes} corner point${removedNodes > 1 ? 's' : ''}. Total: ${currentNodeCount} points.`
      }
      lastNodeCountRef.current = currentNodeCount
    }

    // Announce validation state changes
    if (validationKey !== lastValidationRef.current) {
      if (validation.isClosed && !lastValidationRef.current.includes('true-true')) {
        newAnnouncement = 'Shape is now closed. You can add dimensions to the edges.'
      } else if (validation.isValid && !lastValidationRef.current.includes('true-true-true')) {
        newAnnouncement = 'Layout is complete and ready for tile calculations.'
      } else if (!validation.hasMinimumNodes && currentNodeCount > 0) {
        const needed = 3 - currentNodeCount
        newAnnouncement = `Need ${needed} more corner point${needed > 1 ? 's' : ''} to create a valid shape.`
      }
      lastValidationRef.current = validationKey
    }

    if (newAnnouncement) {
      setAnnouncement(newAnnouncement)

      // Clear announcement after a delay so it doesn't interfere with navigation
      setTimeout(() => {
        setAnnouncement('')
      }, 3000)
    }
  }, [nodes, edges, validateLayout])

  return (
    <div
      ref={announcementRef}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {announcement}
    </div>
  )
}