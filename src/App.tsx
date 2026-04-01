import React, { useEffect } from 'react'
import { useStore } from '@/store/store'
import { AppHeader } from '@/components/AppHeader'
import { FolderNav } from '@/components/FolderNav'
import { NotesGrid } from '@/components/NotesGrid'
import { NoteEditor } from '@/components/NoteEditor'
import { ContextMenu } from '@/components/ContextMenu'
import { FolderModal } from '@/components/FolderModal'
import { NotesToolbar } from '@/components/SortMenu'

export function App() {
  const isLoaded = useStore((s) => s.isLoaded)
  const loadData = useStore((s) => s.loadData)
  const editingNoteId = useStore((s) => s.editingNoteId)
  const createNote = useStore((s) => s.createNote)
  const setIsSearchOpen = useStore((s) => s.setIsSearchOpen)
  const isSearchOpen = useStore((s) => s.isSearchOpen)

  useEffect(() => {
    loadData()
  }, [loadData])

  // Global keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Don't fire shortcuts when typing in inputs
      const target = e.target as HTMLElement
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable

      if (e.ctrlKey && e.key === 'n' && !isInput) {
        e.preventDefault()
        createNote()
      }
      if (e.ctrlKey && e.key === 'f') {
        e.preventDefault()
        setIsSearchOpen(!isSearchOpen)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [createNote, setIsSearchOpen, isSearchOpen])

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen bg-white dark:bg-gray-950">
        <div className="text-2xl animate-pulse" aria-label="Loading">
          📝
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-950 overflow-hidden select-none">
      <AppHeader />
      <FolderNav />
      <NotesToolbar />
      <NotesGrid />

      {/* Overlays */}
      {editingNoteId && <NoteEditor />}
      <ContextMenu />
      <FolderModal />
    </div>
  )
}
