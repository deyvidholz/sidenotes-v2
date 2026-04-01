import type { Note, Folder, View, SortBy, SortDir } from '@/types'

// ─── ID Generation ───────────────────────────────────────────────────────────

export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

// ─── Date Formatting ─────────────────────────────────────────────────────────

const SECOND = 1000
const MINUTE = 60 * SECOND
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR
const WEEK = 7 * DAY

export function formatRelativeDate(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp

  if (diff < MINUTE) return 'Just now'
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)}m ago`
  if (diff < DAY) return `${Math.floor(diff / HOUR)}h ago`
  if (diff < 2 * DAY) return 'Yesterday'
  if (diff < WEEK) return `${Math.floor(diff / DAY)}d ago`

  return new Date(timestamp).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: diff > 365 * DAY ? 'numeric' : undefined,
  })
}

export function formatFullDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

// ─── Note Filtering and Sorting ──────────────────────────────────────────────

export function filterNotesByView(notes: Note[], view: View): Note[] {
  switch (view) {
    case 'all':
      return notes
    case 'pinned':
      return notes.filter((n) => n.isPinned)
    case 'inbox':
      return notes.filter((n) => n.folderId === null)
    default:
      if (view.startsWith('folder:')) {
        const folderId = view.slice(7)
        return notes.filter((n) => n.folderId === folderId)
      }
      return notes
  }
}

export function filterNotesBySearch(notes: Note[], query: string): Note[] {
  if (!query.trim()) return notes
  const q = query.toLowerCase()
  return notes.filter(
    (n) =>
      n.title.toLowerCase().includes(q) ||
      n.content.toLowerCase().includes(q)
  )
}

export function sortNotes(notes: Note[], sortBy: SortBy, sortDir: SortDir): Note[] {
  if (sortBy === 'manual') return [...notes]

  const sorted = [...notes].sort((a, b) => {
    switch (sortBy) {
      case 'updated':
        return b.updatedAt - a.updatedAt
      case 'created':
        return b.createdAt - a.createdAt
      case 'title': {
        const ta = (a.title || a.content || '').toLowerCase()
        const tb = (b.title || b.content || '').toLowerCase()
        return ta.localeCompare(tb)
      }
      case 'color':
        return a.color.localeCompare(b.color)
      default:
        return 0
    }
  })

  if (sortDir === 'asc' && sortBy !== 'updated' && sortBy !== 'created') {
    return sorted
  }
  if (sortDir === 'asc' && (sortBy === 'updated' || sortBy === 'created')) {
    return sorted.reverse()
  }
  if (sortDir === 'desc' && sortBy === 'title') {
    return sorted.reverse()
  }

  return sorted
}

export function getNotesForView(
  notes: Note[],
  view: View,
  searchQuery: string,
  sortBy: SortBy,
  sortDir: SortDir
): Note[] {
  let result = filterNotesByView(notes, view)
  result = filterNotesBySearch(result, searchQuery)

  // Pinned notes always appear first within the current view
  const pinned = sortNotes(
    result.filter((n) => n.isPinned),
    sortBy,
    sortDir
  )
  const unpinned = sortNotes(
    result.filter((n) => !n.isPinned),
    sortBy,
    sortDir
  )

  return [...pinned, ...unpinned]
}

// ─── View Helpers ────────────────────────────────────────────────────────────

export function getFolderIdFromView(view: View): string | null {
  if (view.startsWith('folder:')) return view.slice(7)
  return null
}

export function getViewLabel(view: View, folders: Folder[]): string {
  switch (view) {
    case 'all':
      return 'All Notes'
    case 'pinned':
      return 'Pinned'
    case 'inbox':
      return 'Inbox'
    default:
      if (view.startsWith('folder:')) {
        const folderId = view.slice(7)
        return folders.find((f) => f.id === folderId)?.name ?? 'Unknown Folder'
      }
      return 'Notes'
  }
}

// ─── Debounce ─────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<TArgs extends any[]>(
  fn: (...args: TArgs) => void,
  delay: number
): (...args: TArgs) => void {
  let timer: ReturnType<typeof setTimeout>
  return (...args: TArgs) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

// ─── Truncate ────────────────────────────────────────────────────────────────

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trimEnd() + '…'
}

// ─── Dark Mode ───────────────────────────────────────────────────────────────

export function prefersDark(): boolean {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
}
