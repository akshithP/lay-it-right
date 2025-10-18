'use client';

import { useCallback, useRef, useState } from 'react';
import { Circle } from 'react-konva';
import Konva from 'konva';
import { CanvasPoint } from '../../../packages/tiling-engine/src/geometry';

export interface VertexNodeProps {
  x: number;
  y: number;
  index: number;
  isFirst?: boolean;
  isHovered?: boolean;
  canDrag?: boolean;
  onDrag?: (index: number, newPosition: CanvasPoint) => void;
  onHover?: (index: number | null) => void;
  onClick?: (index: number) => void;
}

export function VertexNode({
  x,
  y,
  index,
  isFirst = false,
  isHovered = false,
  canDrag = true,
  onDrag,
  onHover,
  onClick,
}: VertexNodeProps) {
  const nodeRef = useRef<Konva.Circle>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Handle drag start
  const handleDragStart = useCallback(() => {
    if (!canDrag) return;
    setIsDragging(true);
    onHover?.(index);
  }, [canDrag, index, onHover]);

  // Handle drag move
  const handleDragMove = useCallback((e: Konva.KonvaEventObject<DragEvent>) => {
    if (!canDrag || !onDrag) return;

    const node = e.target;
    const newPosition: CanvasPoint = {
      x: node.x(),
      y: node.y(),
    };

    onDrag(index, newPosition);
  }, [canDrag, index, onDrag]);

  // Handle drag end
  const handleDragEnd = useCallback((e: Konva.KonvaEventObject<DragEvent>) => {
    if (!canDrag) return;

    setIsDragging(false);

    if (onDrag) {
      const node = e.target;
      const finalPosition: CanvasPoint = {
        x: node.x(),
        y: node.y(),
      };
      onDrag(index, finalPosition);
    }
  }, [canDrag, index, onDrag]);

  // Handle mouse enter
  const handleMouseEnter = useCallback(() => {
    if (!isDragging) {
      onHover?.(index);
      // Change cursor to indicate draggable
      document.body.style.cursor = canDrag ? 'grab' : 'default';
    }
  }, [isDragging, index, onHover, canDrag]);

  // Handle mouse leave
  const handleMouseLeave = useCallback(() => {
    if (!isDragging) {
      onHover?.(null);
      document.body.style.cursor = 'default';
    }
  }, [isDragging, onHover]);

  // Handle click
  const handleClick = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true; // Prevent stage click
    onClick?.(index);
  }, [index, onClick]);

  // Calculate visual properties
  const baseRadius = 6;
  const radius = isHovered || isDragging ? baseRadius + 2 : baseRadius;
  const fill = isFirst ? '#22c55e' : '#3b82f6';
  const stroke = isHovered || isDragging ? '#1f2937' : '#fff';
  const strokeWidth = isHovered || isDragging ? 2 : 1;
  const opacity = isDragging ? 0.8 : 1;

  return (
    <Circle
      ref={nodeRef}
      x={x}
      y={y}
      radius={radius}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      opacity={opacity}
      draggable={canDrag}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      hitStrokeWidth={20} // Larger hit area for better touch/click handling
      // Smooth dragging performance
      perfectDrawEnabled={false}
      shadowColor="rgba(0, 0, 0, 0.3)"
      shadowBlur={isDragging ? 6 : 3}
      shadowOffset={{
        x: isDragging ? 2 : 1,
        y: isDragging ? 2 : 1,
      }}
      // Accessibility
      name={`vertex-${index}`}
      // Performance optimization
      listening={true}
    />
  );
}