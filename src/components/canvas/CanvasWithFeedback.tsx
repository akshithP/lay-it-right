'use client'

import { useEffect } from 'react'
import { useCanvasStore } from '@/stores/canvas-store'
import { useCanvasFeedback } from './CanvasFeedbackSystem'

/**
 * Component that connects canvas store operations with user feedback
 * This provides automatic feedback for user actions
 */
export function CanvasWithFeedback() {
  const { nodes, edges } = useCanvasStore()
  const {
    showNodeAdded,
    showNodeRemoved,
    showDimensionAdded,
    showValidationError,
    showLayoutComplete,
    updateSystemStatus
  } = useCanvasFeedback()

  // Track node changes for feedback
  useEffect(() => {
    const previousNodeCount = JSON.parse(
      sessionStorage.getItem('canvas-node-count') || '0'
    )

    if (nodes.length > previousNodeCount) {
      // Node was added
      const newNode = nodes[nodes.length - 1]
      if (newNode?.data?.label) {
        showNodeAdded(newNode.data.label)
      }
    } else if (nodes.length < previousNodeCount && previousNodeCount > 0) {
      // Node was removed
      showNodeRemoved('Corner point')
    }

    sessionStorage.setItem('canvas-node-count', JSON.stringify(nodes.length))
  }, [nodes.length, showNodeAdded, showNodeRemoved])

  // Track edge dimension changes for feedback
  useEffect(() => {
    const previousDimensionCount = JSON.parse(
      sessionStorage.getItem('canvas-dimension-count') || '0'
    )

    const currentDimensionCount = edges.filter(edge => edge.data?.dimension).length

    if (currentDimensionCount > previousDimensionCount) {
      // Dimension was added
      const newDimensionEdge = edges.find(edge => edge.data?.dimension)
      if (newDimensionEdge?.data) {
        showDimensionAdded(newDimensionEdge.data.dimension!, newDimensionEdge.data.unit)
      }
    }

    sessionStorage.setItem('canvas-dimension-count', JSON.stringify(currentDimensionCount))
  }, [edges, showDimensionAdded])

  // Monitor canvas performance and update system status
  useEffect(() => {
    const updatePerformanceStatus = () => {
      const nodeCount = nodes.length
      const edgeCount = edges.length

      let performance: 'good' | 'moderate' | 'poor' = 'good'

      if (nodeCount > 20 || edgeCount > 20) {
        performance = 'moderate'
      }
      if (nodeCount > 50 || edgeCount > 50) {
        performance = 'poor'
      }

      updateSystemStatus({ performance })
    }

    updatePerformanceStatus()
  }, [nodes.length, edges.length, updateSystemStatus])

  return null // This component only provides side effects
}