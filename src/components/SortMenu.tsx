import React, { useRef, useState, useEffect } from 'react'
import { ArrowDownUp, LayoutGrid, List } from 'lucide-react'
import { useStore } from '@/store/store'
import { IconButton } from './ui/Button'
import type { SortBy } from '@/types'
import { getViewLabel } from '@/utils/helpers'

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: 'updated', label: 'Last modified' },
  { value: 'created', label: 'Date created' },
  { value: 'title', label: 'Title' },
  { value: 'color', label: 'Color' },
  { value: 'manual', label: 'Manual order' },
]

export function NotesToolbar() {
  const activeView = useStore((s) => s.activeView)
  const folders = useStore((s) => s.folders)
  const sortBy = useStore((s) => s.sortBy)
  const sortDir = useStore((s) => s.sortDir)
  const layoutMode = useStore((s) => s.layoutMode)
  const setSortBy = useStore((s) => s.setSortBy)
  const setSortDir = useStore((s) => s.setSortDir)
  const setLayoutMode = useStore((s) => s.setLayoutMode)
  const createNote = useStore((s) => s.createNote)
  const notes = useStore((s) => s.notes)
  const searchQuery = useStore((s) => s.searchQuery)

  const [sortOpen, setSortOpen] = useState(false)
  const sortRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sortOpen) return
    function handleClick(e: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [sortOpen])

  const viewLabel = getViewLabel(activeView, folders)

  // Count notes visible in current view
  const visibleCount = (() => {
    if (activeView === 'all') return notes.length
    if (activeView === 'pinned') return notes.filter((n) => n.isPinned).length
    if (activeView === 'inbox') return notes.filter((n) => n.folderId === null).length
    if (activeView.startsWith('folder:')) {
      const fid = activeView.slice(7)
      return notes.filter((n) => n.folderId === fid).length
    }
    return 0
  })()

  const currentSortLabel = SORT_OPTIONS.find((o) => o.value === sortBy)?.label ?? ''

  return (
    <div className="flex-shrink-0 flex items-center gap-1 px-2 h-9 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950">
      {/* View title + count */}
      <div className="flex-1 flex items-center gap-1.5 min-w-0">
        <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
          {searchQuery ? `Results` : viewLabel}
        </span>
        <span className="text-xs text-gray-400 dark:text-gray-600 tabular-nums">
          {visibleCount}
        </span>
      </div>

      {/* Sort menu */}
      <div ref={sortRef} className="relative">
        <IconButton
          size="xs"
          active={sortOpen}
          onClick={() => setSortOpen((o) => !o)}
          title={`Sort: ${currentSortLabel}`}
          aria-label="Sort options"
        >
          <ArrowDownUp size={13} />
        </IconButton>

        {sortOpen && (
          <div className="absolute right-0 top-7 z-20 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 w-40 animate-scale-in">
            <div className="px-2 py-1 text-xs text-gray-400 dark:text-gray-600 uppercase tracking-wider font-medium">
              Sort by
            </div>
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  if (opt.value === 'manual') {
                    setSortBy('manual')
                  } else if (sortBy === opt.value) {
                    setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
                  } else {
                    setSortBy(opt.value)
                    setSortDir('desc')
                  }
                  setSortOpen(false)
                }}
                className={[
                  'w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors',
                  sortBy === opt.value
                    ? 'text-amber-600 dark:text-amber-400 font-medium'
                    : 'text-gray-700 dark:text-gray-300',
                ].join(' ')}
              >
                <span>{opt.label}</span>
                {sortBy === opt.value && opt.value !== 'manual' && (
                  <span className="opacity-60">{sortDir === 'asc' ? '↑' : '↓'}</span>
                )}
                {sortBy === opt.value && opt.value === 'manual' && (
                  <span className="opacity-60">✓</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Layout toggle */}
      <IconButton
        size="xs"
        active={layoutMode === 'grid'}
        onClick={() => setLayoutMode(layoutMode === 'grid' ? 'list' : 'grid')}
        title={layoutMode === 'grid' ? 'Switch to list view' : 'Switch to grid view'}
        aria-label={layoutMode === 'grid' ? 'List view' : 'Grid view'}
      >
        {layoutMode === 'grid' ? <LayoutGrid size={13} /> : <List size={13} />}
      </IconButton>
    </div>
  )
}
