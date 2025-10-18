import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { persist } from 'zustand/middleware'
import type {
  Project,
  LayoutConfiguration,
  TileSpecification,
  ProjectCalculations,
  ProjectWizardStep,
  Unit,
  LayoutShape,
  LayoutPattern,
  CustomLayout,
  CustomLayoutPoint
} from '@/types'

interface ProjectState {
  currentProject: Partial<Project>
  wizardSteps: ProjectWizardStep[]
  currentStep: number
  savedProjects: Project[]
  isLoading: boolean
  error: string | null
}

interface ProjectActions {
  createNewProject: () => void
  saveProject: () => void
  loadProject: (projectId: string) => void
  deleteProject: (projectId: string) => void
  updateProjectName: (name: string) => void
  nextStep: () => void
  previousStep: () => void
  goToStep: (stepIndex: number) => void
  completeStep: (stepIndex: number) => void
  setLayoutShape: (shape: LayoutShape) => void
  setLayoutDimensions: (length: number, width: number, unit: Unit) => void
  setLayoutPattern: (pattern: LayoutPattern) => void
  setCustomLayout: (customLayout: CustomLayout) => void
  setTileSpecification: (tile: TileSpecification) => void
  calculateProject: () => void
  setCalculations: (calculations: ProjectCalculations) => void
  resetProject: () => void
  setError: (error: string | null) => void
  setLoading: (loading: boolean) => void
}

const initialWizardSteps: ProjectWizardStep[] = [
  {
    id: 'dimensions',
    title: 'Room Dimensions',
    description: 'Enter room measurements',
    completed: false,
    current: true
  },
  {
    id: 'tile-selection',
    title: 'Tile & Grout',
    description: 'Select tile size and grout width',
    completed: false,
    current: false
  },
  {
    id: 'pattern-selection',
    title: 'Layout Pattern',
    description: 'Choose tiling pattern',
    completed: false,
    current: false
  },
  {
    id: 'results',
    title: 'Results',
    description: 'View calculations and preview',
    completed: false,
    current: false
  }
]

const initialProject: Partial<Project> = {
  name: 'New Tiling Project',
  layout: {
    shape: 'rectangle',
    dimensions: {
      length: 0,
      width: 0,
      unit: 'm'
    },
    pattern: 'grid'
  },
  tile: {
    length: 300,
    width: 300,
    unit: 'mm',
    groutWidth: 2
  }
}

export const useProjectStore = create<ProjectState & ProjectActions>()(
  persist(
    immer((set, get) => ({
      currentProject: initialProject,
      wizardSteps: initialWizardSteps,
      currentStep: 0,
      savedProjects: [],
      isLoading: false,
      error: null,

      createNewProject: () => {
        set((state) => {
          state.currentProject = {
            ...initialProject,
            id: crypto.randomUUID(),
            createdAt: new Date(),
            updatedAt: new Date()
          }
          state.wizardSteps = initialWizardSteps
          state.currentStep = 0
          state.error = null
        })
      },

      saveProject: () => {
        set((state) => {
          const project = state.currentProject as Project
          if (!project.id) return

          project.updatedAt = new Date()
          const existingIndex = state.savedProjects.findIndex(p => p.id === project.id)
          
          if (existingIndex >= 0) {
            state.savedProjects[existingIndex] = project
          } else {
            state.savedProjects.push(project)
          }
        })
      },

      loadProject: (projectId: string) => {
        set((state) => {
          const project = state.savedProjects.find(p => p.id === projectId)
          if (project) {
            state.currentProject = { ...project }
            state.currentStep = 3
            state.wizardSteps = state.wizardSteps.map((step, index) => ({
              ...step,
              completed: index < 3,
              current: index === 3
            }))
          }
        })
      },

      deleteProject: (projectId: string) => {
        set((state) => {
          state.savedProjects = state.savedProjects.filter(p => p.id !== projectId)
        })
      },

      updateProjectName: (name: string) => {
        set((state) => {
          state.currentProject.name = name
        })
      },

      nextStep: () => {
        set((state) => {
          const currentStep = state.currentStep
          if (currentStep < state.wizardSteps.length - 1) {
            state.wizardSteps[currentStep].completed = true
            state.wizardSteps[currentStep].current = false
            state.currentStep = currentStep + 1
            state.wizardSteps[currentStep + 1].current = true
          }
        })
      },

      previousStep: () => {
        set((state) => {
          const currentStep = state.currentStep
          if (currentStep > 0) {
            state.wizardSteps[currentStep].current = false
            state.currentStep = currentStep - 1
            state.wizardSteps[currentStep - 1].current = true
          }
        })
      },

      goToStep: (stepIndex: number) => {
        set((state) => {
          if (stepIndex >= 0 && stepIndex < state.wizardSteps.length) {
            state.wizardSteps[state.currentStep].current = false
            state.currentStep = stepIndex
            state.wizardSteps[stepIndex].current = true
          }
        })
      },

      completeStep: (stepIndex: number) => {
        set((state) => {
          if (stepIndex >= 0 && stepIndex < state.wizardSteps.length) {
            state.wizardSteps[stepIndex].completed = true
          }
        })
      },

      setLayoutShape: (shape: LayoutShape) => {
        set((state) => {
          if (state.currentProject.layout) {
            state.currentProject.layout.shape = shape
          }
        })
      },

      setLayoutDimensions: (length: number, width: number, unit: Unit) => {
        set((state) => {
          if (state.currentProject.layout) {
            state.currentProject.layout.dimensions = { length, width, unit }
          }
        })
      },

      setLayoutPattern: (pattern: LayoutPattern) => {
        set((state) => {
          if (state.currentProject.layout) {
            state.currentProject.layout.pattern = pattern
          }
        })
      },

      setCustomLayout: (customLayout: CustomLayout) => {
        set((state) => {
          if (state.currentProject.layout) {
            state.currentProject.layout.customLayout = customLayout
          }
        })
      },

      setTileSpecification: (tile: TileSpecification) => {
        set((state) => {
          state.currentProject.tile = tile
        })
      },

      calculateProject: () => {
        const state = get()
        const { currentProject } = state

        if (!currentProject.layout || !currentProject.tile) return

        set((draft) => {
          draft.isLoading = true
        })

        // Simulate async calculation
        setTimeout(async () => {
          try {
            // Import calculation function dynamically to avoid circular dependencies
            const { calculateProject } = await import('@/utils/tile-calculations')

            if (currentProject.layout && currentProject.tile) {
              const calculations = calculateProject(currentProject as Project)

              if (calculations) {
                set((draft) => {
                  draft.currentProject.calculations = calculations
                  draft.isLoading = false
                })
              } else {
                set((draft) => {
                  draft.error = 'Failed to calculate project'
                  draft.isLoading = false
                })
              }
            }
          } catch (error) {
            set((draft) => {
              draft.error = 'Calculation error occurred'
              draft.isLoading = false
            })
          }
        }, 500)
      },

      setCalculations: (calculations: ProjectCalculations) => {
        set((state) => {
          state.currentProject.calculations = calculations
        })
      },

      resetProject: () => {
        set((state) => {
          state.currentProject = initialProject
          state.wizardSteps = initialWizardSteps
          state.currentStep = 0
          state.error = null
        })
      },

      setError: (error: string | null) => {
        set((state) => {
          state.error = error
        })
      },

      setLoading: (loading: boolean) => {
        set((state) => {
          state.isLoading = loading
        })
      }
    })),
    {
      name: 'layitright-project-store',
      partialize: (state) => ({ 
        savedProjects: state.savedProjects 
      })
    }
  )
)
