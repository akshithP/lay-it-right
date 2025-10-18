// Core types for the LayItRight application

export type Unit = 'mm' | 'cm' | 'm' | 'in' | 'ft'

export type LayoutPattern = 'grid' | 'brick' | 'herringbone'

export type LayoutShape = 'rectangle' | 'l-shape' | 'u-shape' | 't-shape' | 'square' | 'custom'

export interface Dimensions {
  length: number
  width: number
  unit: Unit
}

export interface TileSpecification {
  length: number
  width: number
  unit: Unit
  groutWidth: number
}

export interface LayoutConfiguration {
  shape: LayoutShape
  dimensions: Dimensions
  pattern: LayoutPattern
  customLayout?: CustomLayout
}

export interface ProjectCalculations {
  totalArea: number
  tileArea: number
  totalTiles: number
  fullTiles: number
  cutTiles: number
  wastePercentage: number
  groutArea: number
  coverage: number
}

export interface Project {
  id: string
  name: string
  createdAt: Date
  updatedAt: Date
  layout: LayoutConfiguration
  tile: TileSpecification
  calculations?: ProjectCalculations
}

export interface ProjectWizardStep {
  id: string
  title: string
  description: string
  completed: boolean
  current: boolean
}

export interface CustomLayoutPoint {
  x: number
  y: number
}

export interface CustomLayout {
  points: CustomLayoutPoint[]
  isClosed: boolean
  segments?: CustomLayoutSegment[]
}

export interface CustomLayoutSegment {
  id: string
  label: string
  startPoint: CustomLayoutPoint
  endPoint: CustomLayoutPoint
  length: number
  unit: Unit
}