import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { generateId, debounce } from '@/utils/helpers'
import { loadData, saveData } from '@/storage/storage'
import { SEED_DATA } from '@/utils/seeds'
import type {
  Note,
  Folder,
  NoteColor,
  View,
  SortBy,
  SortDir,
  LayoutMode,
  ContextMenuState,
  StorageData,
} from '@/types'

// ─── State Interface ─────────────────────────────────────────────────────────

interface AppState {
  // ── Data ──
  notes: Note[]
  folders: Folder[]
  isLoaded: boolean

  // ── Navigation ──
  activeView: View
  searchQuery: string
  isSearchOpen: boolean

  // ── Sorting & Layout ──
  sortBy: SortBy
  sortDir: SortDir
  layoutMode: LayoutMode

  // ── Editor ──
  editingNoteId: string | null

  // ── Context Menu ──
  contextMenu: ContextMenuState

  // ── Folder Modal ──
  folderModal: {
    isOpen: boolean
    mode: 'create' | 'rename'
    folderId: string | null
  }

  // ── Move to Folder Menu ──
  moveFolderMenu: {
    isOpen: boolean
    noteId: string | null
  }

  // ─── Note Actions ──────────────────────────────────────────────────────────
  createNote: (folderId?: string | null) => string
  updateNote: (id: string, updates: Partial<Omit<Note, 'id' | 'createdAt'>>) => void
  deleteNote: (id: string) => void
  togglePinNote: (id: string) => void
  duplicateNote: (id: string) => string
  moveNote: (id: string, folderId: string | null) => void
  /** Reorder notes by supplying the desired order of all visible note IDs.
   *  Only the slots those notes occupy in the full notes array are touched;
   *  notes in other folders/views are left untouched. Automatically switches
   *  sortBy to 'manual'. */
  reorderNotes: (orderedIds: string[]) => void

  // ─── Folder Actions ───────────────────────────────────────────────────────
  createFolder: (name: string) => string
  renameFolder: (id: string, name: string) => void
  deleteFolder: (id: string) => void
  togglePinFolder: (id: string) => void
  toggleExpandFolder: (id: string) => void

  // ─── UI Actions ───────────────────────────────────────────────────────────
  setActiveView: (view: View) => void
  setSearchQuery: (query: string) => void
  setIsSearchOpen: (open: boolean) => void
  setSortBy: (sortBy: SortBy) => void
  setSortDir: (sortDir: SortDir) => void
  setLayoutMode: (mode: LayoutMode) => void
  setEditingNoteId: (id: string | null) => void
  openContextMenu: (noteId: string, x: number, y: number) => void
  closeContextMenu: () => void
  openFolderModal: (mode: 'create' | 'rename', folderId?: string) => void
  closeFolderModal: () => void
  openMoveFolderMenu: (noteId: string) => void
  closeMoveFolderMenu: () => void

  // ─── Storage ──────────────────────────────────────────────────────────────
  loadData: () => Promise<void>
  persistData: () => void
}

// ─── Auto-Save ───────────────────────────────────────────────────────────────

const debouncedSave = debounce(async (data: StorageData) => {
  try {
    await saveData(data)
  } catch (err) {
    console.error('[Sidenotes] Failed to save:', err)
  }
}, 800)

// ─── Store ───────────────────────────────────────────────────────────────────

export const useStore = create<AppState>()(
  subscribeWithSelector((set, get) => ({
    // ── Initial State ────────────────────────────────────────────────────────
    notes: [],
    folders: [],
    isLoaded: false,
    activeView: 'all',
    searchQuery: '',
    isSearchOpen: false,
    sortBy: 'updated',
    sortDir: 'desc',
    layoutMode: 'grid',
    editingNoteId: null,
    contextMenu: { isOpen: false, x: 0, y: 0, noteId: null },
    folderModal: { isOpen: false, mode: 'create', folderId: null },
    moveFolderMenu: { isOpen: false, noteId: null },

    // ─── Note Actions ─────────────────────────────────────────────────────────

    createNote: (folderId) => {
      const resolvedFolderId =
        folderId !== undefined
          ? folderId
          : getFolderIdFromView(get().activeView)

      const note: Note = {
        id: generateId(),
        title: '',
        content: '',
        color: 'slate',
        folderId: resolvedFolderId,
        isPinned: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
      set((s) => ({ notes: [note, ...s.notes], editingNoteId: note.id }))
      get().persistData()
      return note.id
    },

    updateNote: (id, updates) => {
      set((s) => ({
        notes: s.notes.map((n) =>
          n.id === id ? { ...n, ...updates, updatedAt: Date.now() } : n
        ),
      }))
      get().persistData()
    },

    deleteNote: (id) => {
      set((s) => ({
        notes: s.notes.filter((n) => n.id !== id),
        editingNoteId: s.editingNoteId === id ? null : s.editingNoteId,
      }))
      get().persistData()
    },

    togglePinNote: (id) => {
      set((s) => ({
        notes: s.notes.map((n) =>
          n.id === id ? { ...n, isPinned: !n.isPinned, updatedAt: Date.now() } : n
        ),
      }))
      get().persistData()
    },

    duplicateNote: (id) => {
      const original = get().notes.find((n) => n.id === id)
      if (!original) return ''
      const copy: Note = {
        ...original,
        id: generateId(),
        title: original.title ? `${original.title} (copy)` : '',
        isPinned: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
      set((s) => {
        const idx = s.notes.findIndex((n) => n.id === id)
        const notes = [...s.notes]
        notes.splice(idx + 1, 0, copy)
        return { notes }
      })
      get().persistData()
      return copy.id
    },

    reorderNotes: (orderedIds) => {
      const notes = get().notes

      // Find the array slots currently occupied by the visible notes, sorted
      // by their current position so we fill them in positional order.
      const slots = orderedIds
        .map((id) => notes.findIndex((n) => n.id === id))
        .filter((i) => i !== -1)
        .sort((a, b) => a - b)

      const noteById = new Map(notes.map((n) => [n.id, n]))
      const newNotes = [...notes]
      orderedIds.forEach((id, i) => {
        const note = noteById.get(id)
        if (note !== undefined) newNotes[slots[i]] = note
      })

      set({ notes: newNotes, sortBy: 'manual' })
      get().persistData()
    },

    moveNote: (id, folderId) => {
      set((s) => ({
        notes: s.notes.map((n) =>
          n.id === id ? { ...n, folderId, updatedAt: Date.now() } : n
        ),
      }))
      get().persistData()
    },

    // ─── Folder Actions ───────────────────────────────────────────────────────

    createFolder: (name) => {
      const folder: Folder = {
        id: generateId(),
        name: name.trim(),
        isPinned: false,
        isExpanded: true,
        createdAt: Date.now(),
      }
      set((s) => ({ folders: [...s.folders, folder] }))
      get().persistData()
      return folder.id
    },

    renameFolder: (id, name) => {
      set((s) => ({
        folders: s.folders.map((f) =>
          f.id === id ? { ...f, name: name.trim() } : f
        ),
      }))
      get().persistData()
    },

    deleteFolder: (id) => {
      set((s) => ({
        folders: s.folders.filter((f) => f.id !== id),
        // Move notes from deleted folder to inbox
        notes: s.notes.map((n) =>
          n.folderId === id ? { ...n, folderId: null } : n
        ),
        // If currently viewing this folder, switch to all
        activeView: s.activeView === `folder:${id}` ? 'all' : s.activeView,
      }))
      get().persistData()
    },

    togglePinFolder: (id) => {
      set((s) => ({
        folders: s.folders.map((f) =>
          f.id === id ? { ...f, isPinned: !f.isPinned } : f
        ),
      }))
      get().persistData()
    },

    toggleExpandFolder: (id) => {
      set((s) => ({
        folders: s.folders.map((f) =>
          f.id === id ? { ...f, isExpanded: !f.isExpanded } : f
        ),
      }))
    },

    // ─── UI Actions ───────────────────────────────────────────────────────────

    setActiveView: (view) => {
      set({ activeView: view, searchQuery: '', isSearchOpen: false })
    },

    setSearchQuery: (query) => set({ searchQuery: query }),

    setIsSearchOpen: (open) => {
      set({ isSearchOpen: open })
      if (!open) set({ searchQuery: '' })
    },

    setSortBy: (sortBy) => {
      set({ sortBy })
      get().persistData()
    },

    setSortDir: (sortDir) => {
      set({ sortDir })
      get().persistData()
    },

    setLayoutMode: (mode) => {
      set({ layoutMode: mode })
      get().persistData()
    },

    setEditingNoteId: (id) => set({ editingNoteId: id }),

    openContextMenu: (noteId, x, y) => {
      set({ contextMenu: { isOpen: true, noteId, x, y } })
    },

    closeContextMenu: () => {
      set({ contextMenu: { isOpen: false, noteId: null, x: 0, y: 0 } })
    },

    openFolderModal: (mode, folderId) => {
      set({ folderModal: { isOpen: true, mode, folderId: folderId ?? null } })
    },

    closeFolderModal: () => {
      set({ folderModal: { isOpen: false, mode: 'create', folderId: null } })
    },

    openMoveFolderMenu: (noteId) => {
      set({ moveFolderMenu: { isOpen: true, noteId } })
    },

    closeMoveFolderMenu: () => {
      set({ moveFolderMenu: { isOpen: false, noteId: null } })
    },

    // ─── Storage ──────────────────────────────────────────────────────────────

    loadData: async () => {
      try {
        const data = await loadData()
        if (data) {
          set({
            notes: data.notes,
            folders: data.folders,
            sortBy: data.prefs.sortBy,
            sortDir: data.prefs.sortDir,
            layoutMode: data.prefs.layoutMode,
            activeView: data.prefs.lastView,
            isLoaded: true,
          })
        } else {
          set({ isLoaded: true })
        }
      } catch (err) {
        console.error('[Sidenotes] Failed to load data:', err)
        set({ isLoaded: true })
      }
    },

    persistData: () => {
      const s = get()
      debouncedSave({
        version: 1,
        notes: s.notes,
        folders: s.folders,
        prefs: {
          sortBy: s.sortBy,
          sortDir: s.sortDir,
          layoutMode: s.layoutMode,
          lastView: s.activeView,
        },
      })
    },
  }))
)

// ─── Selectors ───────────────────────────────────────────────────────────────

export function useNote(id: string): Note | undefined {
  return useStore((s) => s.notes.find((n) => n.id === id))
}

export function useFolder(id: string): Folder | undefined {
  return useStore((s) => s.folders.find((f) => f.id === id))
}

export function useNoteColor(id: string): NoteColor {
  return useStore((s) => s.notes.find((n) => n.id === id)?.color ?? 'yellow')
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getFolderIdFromView(view: View): string | null {
  if (view.startsWith('folder:')) return view.slice(7)
  return null
}
