import React from 'react'
import { Plus, Search, X } from 'lucide-react'
import { useStore } from '@/store/store'
import { IconButton } from './ui/Button'

export function AppHeader() {
  const createNote = useStore((s) => s.createNote)
  const isSearchOpen = useStore((s) => s.isSearchOpen)
  const setIsSearchOpen = useStore((s) => s.setIsSearchOpen)
  const searchQuery = useStore((s) => s.searchQuery)
  const setSearchQuery = useStore((s) => s.setSearchQuery)

  function handleNewNote() {
    createNote()
  }

  function handleSearchToggle() {
    setIsSearchOpen(!isSearchOpen)
  }

  return (
    <header className="flex-shrink-0">
      {/* Top bar */}
      <div className="flex items-center gap-1 px-3 h-11 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-amber-500 text-lg" aria-hidden="true">📝</span>
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
            Sidenotes
          </span>
        </div>

        <div className="flex items-center gap-0.5">
          <IconButton
            onClick={handleSearchToggle}
            active={isSearchOpen}
            aria-label={isSearchOpen ? 'Close search' : 'Open search'}
            title="Search (Ctrl+F)"
          >
            <Search size={15} />
          </IconButton>
          <IconButton
            onClick={handleNewNote}
            aria-label="New note"
            title="New note (Ctrl+N)"
            variant="ghost"
          >
            <Plus size={16} />
          </IconButton>
        </div>
      </div>

      {/* Collapsible search bar */}
      {isSearchOpen && (
        <div className="flex items-center gap-1 px-2 py-1.5 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 animate-slide-up">
          <Search size={13} className="text-gray-400 flex-shrink-0" />
          <input
            autoFocus
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes…"
            className="flex-1 text-sm bg-transparent outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 min-w-0"
            aria-label="Search notes"
          />
          {searchQuery && (
            <IconButton
              size="xs"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
            >
              <X size={12} />
            </IconButton>
          )}
        </div>
      )}
    </header>
  )
}
