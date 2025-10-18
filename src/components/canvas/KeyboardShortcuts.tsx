'use client'

import { useEffect, useCallback, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCanvasStore } from '@/stores/canvas-store'
import { useCanvasFeedback } from './CanvasFeedbackSystem'
import {
  Keyboard,
  Command,
  Undo2,
  Redo2,
  Trash2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Info,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ShortcutDefinition {
  key: string
  modifiers: string[]
  description: string
  action: () => void
  category: 'Navigation' | 'Editing' | 'View' | 'Help'
  icon?: React.ReactNode
}

interface KeyboardShortcutsProps {
  reactFlowInstance?: any
  disabled?: boolean
}

export function KeyboardShortcuts({ reactFlowInstance, disabled = false }: KeyboardShortcutsProps) {
  const [showHelp, setShowHelp] = useState(false)
  const [recentShortcut, setRecentShortcut] = useState<string | null>(null)

  const {
    undo,
    redo,
    clearCanvas,
    nodes,
    canvasHistory,
    currentHistoryIndex,
    selectNode,
    selectedNodeId
  } = useCanvasStore()

  const { showInfo, showSuccess } = useCanvasFeedback()

  // Enhanced keyboard shortcuts with accessibility
  const shortcuts: ShortcutDefinition[] = [
    // Editing shortcuts
    {
      key: 'z',
      modifiers: ['ctrl'],
      description: 'Undo last action',
      action: () => {
        if (currentHistoryIndex > 0) {
          undo()
          showRecentShortcut('Undo')
        }
      },
      category: 'Editing',
      icon: <Undo2 className="w-4 h-4" />
    },
    {
      key: 'y',
      modifiers: ['ctrl'],
      description: 'Redo last action',
      action: () => {
        if (currentHistoryIndex < canvasHistory.length - 1) {
          redo()
          showRecentShortcut('Redo')
        }
      },
      category: 'Editing',
      icon: <Redo2 className="w-4 h-4" />
    },
    {
      key: 'z',
      modifiers: ['ctrl', 'shift'],
      description: 'Redo last action',
      action: () => {
        if (currentHistoryIndex < canvasHistory.length - 1) {
          redo()
          showRecentShortcut('Redo')
        }
      },
      category: 'Editing',
      icon: <Redo2 className="w-4 h-4" />
    },
    {
      key: 'Delete',
      modifiers: [],
      description: 'Delete selected corner',
      action: () => {
        if (selectedNodeId) {
          const selectedNode = nodes.find(n => n.id === selectedNodeId)
          if (selectedNode?.data?.canDelete) {
            showRecentShortcut('Delete Corner')
          }
        }
      },
      category: 'Editing',
      icon: <Trash2 className="w-4 h-4" />
    },
    {
      key: 'Backspace',
      modifiers: [],
      description: 'Delete selected corner',
      action: () => {
        if (selectedNodeId) {
          const selectedNode = nodes.find(n => n.id === selectedNodeId)
          if (selectedNode?.data?.canDelete) {
            showRecentShortcut('Delete Corner')
          }
        }
      },
      category: 'Editing',
      icon: <Trash2 className="w-4 h-4" />
    },

    // Navigation shortcuts
    {
      key: 'Tab',
      modifiers: [],
      description: 'Select next corner point',
      action: () => {
        const currentIndex = selectedNodeId ? nodes.findIndex(n => n.id === selectedNodeId) : -1
        const nextIndex = (currentIndex + 1) % nodes.length
        if (nodes[nextIndex]) {
          selectNode(nodes[nextIndex].id)
          showRecentShortcut(`Selected ${nodes[nextIndex].data?.label}`)
        }
      },
      category: 'Navigation'
    },
    {
      key: 'Tab',
      modifiers: ['shift'],
      description: 'Select previous corner point',
      action: () => {
        const currentIndex = selectedNodeId ? nodes.findIndex(n => n.id === selectedNodeId) : -1
        const prevIndex = currentIndex <= 0 ? nodes.length - 1 : currentIndex - 1
        if (nodes[prevIndex]) {
          selectNode(nodes[prevIndex].id)
          showRecentShortcut(`Selected ${nodes[prevIndex].data?.label}`)
        }
      },
      category: 'Navigation'
    },
    {
      key: 'Escape',
      modifiers: [],
      description: 'Deselect all',
      action: () => {
        selectNode(undefined)
        showRecentShortcut('Deselected')
      },
      category: 'Navigation'
    },

    // View shortcuts
    {
      key: '=',
      modifiers: ['ctrl'],
      description: 'Zoom in',
      action: () => {
        if (reactFlowInstance) {
          reactFlowInstance.zoomIn({ duration: 300 })
          showRecentShortcut('Zoom In')
        }
      },
      category: 'View',
      icon: <ZoomIn className="w-4 h-4" />
    },
    {
      key: '-',
      modifiers: ['ctrl'],
      description: 'Zoom out',
      action: () => {
        if (reactFlowInstance) {
          reactFlowInstance.zoomOut({ duration: 300 })
          showRecentShortcut('Zoom Out')
        }
      },
      category: 'View',
      icon: <ZoomOut className="w-4 h-4" />
    },
    {
      key: '0',
      modifiers: ['ctrl'],
      description: 'Fit view to canvas',
      action: () => {
        if (reactFlowInstance) {
          reactFlowInstance.fitView({ duration: 500, padding: 0.1 })
          showRecentShortcut('Fit to View')
        }
      },
      category: 'View',
      icon: <RotateCcw className="w-4 h-4" />
    },

    // Help shortcuts
    {
      key: '?',
      modifiers: ['shift'],
      description: 'Show keyboard shortcuts',
      action: () => {
        setShowHelp(true)
        showRecentShortcut('Help')
      },
      category: 'Help',
      icon: <Info className="w-4 h-4" />
    },
    {
      key: 'h',
      modifiers: ['ctrl'],
      description: 'Show keyboard shortcuts',
      action: () => {
        setShowHelp(true)
        showRecentShortcut('Help')
      },
      category: 'Help',
      icon: <Info className="w-4 h-4" />
    }
  ]

  const showRecentShortcut = useCallback((shortcut: string) => {
    setRecentShortcut(shortcut)
    setTimeout(() => setRecentShortcut(null), 2000)
  }, [])

  // Enhanced keyboard event handler
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (disabled) return

    // Don't intercept if user is typing in an input
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement ||
      event.target instanceof HTMLSelectElement ||
      (event.target as HTMLElement)?.contentEditable === 'true'
    ) {
      return
    }

    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
    const ctrlKey = isMac ? event.metaKey : event.ctrlKey

    // Find matching shortcut
    const matchingShortcut = shortcuts.find(shortcut => {
      const keyMatches = shortcut.key.toLowerCase() === event.key.toLowerCase()
      const modifiersMatch = shortcut.modifiers.every(modifier => {
        switch (modifier) {
          case 'ctrl':
            return ctrlKey
          case 'shift':
            return event.shiftKey
          case 'alt':
            return event.altKey
          default:
            return false
        }
      })

      // Check that no extra modifiers are pressed
      const expectedModifierCount = shortcut.modifiers.length
      const actualModifierCount = [ctrlKey, event.shiftKey, event.altKey].filter(Boolean).length

      return keyMatches && modifiersMatch && expectedModifierCount === actualModifierCount
    })
    if (matchingShortcut) {
      event.preventDefault()
      event.stopPropagation()
      matchingShortcut.action()
      
      // Add haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(25)
      }
    }
  }, [disabled, shortcuts, reactFlowInstance])

  // Set up keyboard event listener
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // Group shortcuts by category
  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = []
    }
    acc[shortcut.category].push(shortcut)
    return acc
  }, {} as Record<string, ShortcutDefinition[]>)

  const formatShortcut = (shortcut: ShortcutDefinition) => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
    const modifierSymbols = shortcut.modifiers.map(mod => {
      switch (mod) {
        case 'ctrl':
          return isMac ? '⌘' : 'Ctrl'
        case 'shift':
          return '⇧'
        case 'alt':
          return isMac ? '⌥' : 'Alt'
        default:
          return mod
      }
    })
    
    return [...modifierSymbols, shortcut.key.toUpperCase()].join(' + ')
  }

  return (
    <>
      {/* Recent shortcut indicator */}
      <AnimatePresence>
        {recentShortcut && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-20 right-4 bg-layit-blue text-white px-3 py-2 rounded-lg shadow-lg z-50"
          >
            <div className="flex items-center gap-2 text-sm font-medium">
              <Keyboard className="w-4 h-4" />
              {recentShortcut}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keyboard shortcut help panel */}
      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowHelp(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-layit-blue flex items-center gap-2">
                  <Keyboard className="w-5 h-5" />
                  Keyboard Shortcuts
                </h2>
                <button
                  onClick={() => setShowHelp(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
                  <div key={category}>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      {category === 'Editing' && <Command className="w-4 h-4" />}
                      {category === 'Navigation' && <RotateCcw className="w-4 h-4" />}
                      {category === 'View' && <ZoomIn className="w-4 h-4" />}
                      {category === 'Help' && <Info className="w-4 h-4" />}
                      {category}
                    </h3>
                    <div className="grid gap-2">
                      {categoryShortcuts.map((shortcut, index) => (
                        <div
                          key={`${shortcut.key}-${shortcut.modifiers.join('-')}-${index}`}
                          className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            {shortcut.icon && (
                              <div className="text-gray-500">
                                {shortcut.icon}
                              </div>
                            )}
                            <span className="text-gray-700">{shortcut.description}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {formatShortcut(shortcut).split(' + ').map((key, keyIndex) => (
                              <React.Fragment key={keyIndex}>
                                {keyIndex > 0 && <span className="text-gray-400 text-xs">+</span>}
                                <kbd className="px-2 py-1 bg-white border border-gray-200 rounded text-xs font-mono text-gray-600 shadow-sm">
                                  {key}
                                </kbd>
                              </React.Fragment>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="pt-4 border-t text-sm text-gray-600">
                  <p className="mb-2">💡 <strong>Tips:</strong></p>
                  <ul className="space-y-1 text-xs">
                    <li>• Shortcuts work when not typing in input fields</li>
                    <li>• Use Tab/Shift+Tab to navigate between corner points</li>
                    <li>• Press Esc to deselect all elements</li>
                    <li>• Hold Ctrl/Cmd while scrolling to zoom</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// Hook for accessing keyboard shortcuts programmatically
export function useKeyboardShortcuts() {
  const [helpVisible, setHelpVisible] = useState(false)
  
  const showHelp = useCallback(() => {
    setHelpVisible(true)
  }, [])
  
  const hideHelp = useCallback(() => {
    setHelpVisible(false)
  }, [])
  
  return {
    helpVisible,
    showHelp,
    hideHelp
  }
}
