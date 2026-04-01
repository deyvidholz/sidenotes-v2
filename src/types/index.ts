// ─── Domain Types ───────────────────────────────────────────────────────────

export type NoteColor =
  | 'yellow'
  | 'blue'
  | 'green'
  | 'pink'
  | 'purple'
  | 'orange'
  | 'teal'
  | 'rose'
  | 'slate'
  | 'white'

export interface Note {
  id: string
  title: string
  content: string
  color: NoteColor
  folderId: string | null
  isPinned: boolean
  createdAt: number
  updatedAt: number
}

export interface Folder {
  id: string
  name: string
  isPinned: boolean
  isExpanded: boolean
  createdAt: number
}

// ─── UI Types ────────────────────────────────────────────────────────────────

/** All possible navigation views */
export type View =
  | 'all'
  | 'pinned'
  | 'inbox'
  | `folder:${string}`

export type SortBy = 'updated' | 'created' | 'title' | 'color' | 'manual'
export type SortDir = 'asc' | 'desc'
export type LayoutMode = 'grid' | 'list'

export interface ContextMenuState {
  isOpen: boolean
  x: number
  y: number
  noteId: string | null
}

// ─── Storage Types ───────────────────────────────────────────────────────────

export const STORAGE_VERSION = 1

export interface StorageData {
  version: number
  notes: Note[]
  folders: Folder[]
  prefs: UserPrefs
}

export interface UserPrefs {
  sortBy: SortBy
  sortDir: SortDir
  layoutMode: LayoutMode
  lastView: View
}

// ─── Color Definitions ───────────────────────────────────────────────────────

export interface ColorTheme {
  label: string
  /** CSS background color for light mode */
  lightBg: string
  /** CSS background color for dark mode */
  darkBg: string
  /** CSS border color for light mode */
  lightBorder: string
  /** CSS border color for dark mode */
  darkBorder: string
  /** Dot indicator color */
  dot: string
}

export const NOTE_COLORS: Record<NoteColor, ColorTheme> = {
  yellow: {
    label: 'Yellow',
    lightBg: '#fef9c3',
    darkBg: '#3d2a00',
    lightBorder: '#fde047',
    darkBorder: '#92400e',
    dot: '#eab308',
  },
  blue: {
    label: 'Blue',
    lightBg: '#dbeafe',
    darkBg: '#0f2744',
    lightBorder: '#93c5fd',
    darkBorder: '#1d4ed8',
    dot: '#3b82f6',
  },
  green: {
    label: 'Green',
    lightBg: '#dcfce7',
    darkBg: '#0a2e1a',
    lightBorder: '#86efac',
    darkBorder: '#15803d',
    dot: '#22c55e',
  },
  pink: {
    label: 'Pink',
    lightBg: '#fce7f3',
    darkBg: '#2d0a1e',
    lightBorder: '#f9a8d4',
    darkBorder: '#be185d',
    dot: '#ec4899',
  },
  purple: {
    label: 'Purple',
    lightBg: '#f3e8ff',
    darkBg: '#1e0a35',
    lightBorder: '#c4b5fd',
    darkBorder: '#7c3aed',
    dot: '#a855f7',
  },
  orange: {
    label: 'Orange',
    lightBg: '#ffedd5',
    darkBg: '#2d1300',
    lightBorder: '#fdba74',
    darkBorder: '#c2410c',
    dot: '#f97316',
  },
  teal: {
    label: 'Teal',
    lightBg: '#ccfbf1',
    darkBg: '#042f2e',
    lightBorder: '#5eead4',
    darkBorder: '#0f766e',
    dot: '#14b8a6',
  },
  rose: {
    label: 'Rose',
    lightBg: '#ffe4e6',
    darkBg: '#2d0a0e',
    lightBorder: '#fda4af',
    darkBorder: '#be123c',
    dot: '#f43f5e',
  },
  slate: {
    label: 'Slate',
    lightBg: '#f1f5f9',
    darkBg: '#1e293b',
    lightBorder: '#cbd5e1',
    darkBorder: '#475569',
    dot: '#64748b',
  },
  white: {
    label: 'Default',
    lightBg: '#ffffff',
    darkBg: '#1e1e2e',
    lightBorder: '#e2e8f0',
    darkBorder: '#334155',
    dot: '#94a3b8',
  },
}
