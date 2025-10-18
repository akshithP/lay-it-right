/**
 * DimensionsVisualizer Component
 *
 * SVG-based visual preview of dimensions.
 * Shows proportional rectangle with dimension labels.
 * Follows design from simple_dimensions_v1.html
 *
 * @pattern Single Responsibility - handles visualization only
 * @pattern Pure Presentation - no state management
 */

'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import type { DimensionsVisualizerProps } from '@/types/dimensions'
import { calculateProportionalSize, formatDimension } from '@/utils/dimensions'

export function DimensionsVisualizer({
  length,
  width,
  unit,
  className
}: DimensionsVisualizerProps) {
  // Calculate proportional rectangle size
  const rect = calculateProportionalSize(length, width, 600, 400, 300, 200)

  // Format dimension labels
  const lengthLabel = length > 0 ? `${formatDimension(length)} ${unit}` : ''
  const widthLabel = width > 0 ? `${formatDimension(width)} ${unit}` : ''

  return (
    <div className={cn('w-full', className)}>
      {/* Title */}
      <h3 className="text-xl font-bold mb-6 uppercase text-[#10375C]">
        VISUAL PREVIEW
      </h3>

      {/* Container - matching simple_dimensions_v1.html */}
      <div className="bg-[#F4F6FF] border-6 border-[#10375C] relative min-h-[400px]">
        {/* Grid Background */}
        <div
          className="w-full h-full absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'radial-gradient(circle, #10375C 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}
        />

        {/* SVG Canvas */}
        <svg
          className="w-full h-full absolute inset-0"
          style={{ zIndex: 5 }}
          viewBox="0 0 600 400"
          preserveAspectRatio="xMidYMid meet"
          aria-label={`Rectangle visualization: ${lengthLabel} by ${widthLabel}`}
        >
          {length > 0 && width > 0 ? (
            <>
              {/* Rectangle Shape */}
              <rect
                x={rect.x}
                y={rect.y}
                width={rect.width}
                height={rect.height}
                className="stroke-[#10375C] stroke-[4px] fill-[#F3C623] fill-opacity-15"
              />

              {/* Top Dimension Label (Length) */}
              {lengthLabel && (
                <text
                  x={rect.labelPositions.top.x}
                  y={rect.labelPositions.top.y}
                  className="fill-[#10375C] font-bold text-base"
                  textAnchor="middle"
                >
                  {lengthLabel}
                </text>
              )}

              {/* Left Dimension Label (Width) */}
              {widthLabel && (
                <text
                  x={rect.labelPositions.left.x}
                  y={rect.labelPositions.left.y}
                  className="fill-[#10375C] font-bold text-base"
                  textAnchor="end"
                >
                  {widthLabel}
                </text>
              )}
            </>
          ) : (
            /* Placeholder text when no dimensions */
            <text
              x="300"
              y="200"
              className="fill-[#10375C] opacity-40 font-bold text-lg"
              textAnchor="middle"
            >
              Enter dimensions to see preview
            </text>
          )}
        </svg>
      </div>
    </div>
  )
}
