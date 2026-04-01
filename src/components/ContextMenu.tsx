import React, { useEffect, useRef } from 'react'
import { Pin, PinOff, Copy, Trash2, FolderInput, Pencil } from 'lucide-react'
import { useStore } from '@/store/store'

export function ContextMenu() {
  const contextMenu = useStore((s) => s.contextMenu)
  const closeContextMenu = useStore((s) => s.closeContextMenu)
  const notes = useStore((s) => s.notes)
  const folders = useStore((s) => s.folders)
  const togglePinNote = useStore((s) => s.togglePinNote)
  const duplicateNote = useStore((s) => s.duplicateNote)
  const deleteNote = useStore((s) => s.deleteNote)
  const setEditingNoteId = useStore((s) => s.setEditingNoteId)
  const openMoveFolderMenu = useStore((s) => s.openMoveFolderMenu)
  const moveNote = useStore((s) => s.moveNote)

  const menuRef = useRef<HTMLDivElement>(null)
  const [showFolders, setShowFolders] = React.useState(false)

  useEffect(() => {
    if (!contextMenu.isOpen) {
      setShowFolders(false)
      return
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeContextMenu()
    }
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        closeContextMenu()
      }
    }
    document.addEventListener('keydown', handleKey)
    document.addEventListener('mousedown', handleClick)
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.removeEventListener('mousedown', handleClick)
    }
  }, [contextMenu.isOpen, closeContextMenu])

  if (!contextMenu.isOpen || !contextMenu.noteId) return null

  const note = notes.find((n) => n.id === contextMenu.noteId)
  if (!note) return null

  // Clamp position to viewport
  const maxX = window.innerWidth - 160
  const maxY = window.innerHeight - 260
  const x = Math.min(contextMenu.x, maxX)
  const y = Math.min(contextMenu.y, maxY)

  function item(
    label: string,
    icon: React.ReactNode,
    onClick: () => void,
    danger = false
  ) {
    return (
      <button
        key={label}
        onClick={() => {
          onClick()
          closeContextMenu()
        }}
        className={[
          'w-full text-left flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors',
          danger
            ? 'text-red-600 dark:text-red-400'
            : 'text-gray-700 dark:text-gray-300',
        ].join(' ')}
      >
        <span className="opacity-60">{icon}</span>
        {label}
      </button>
    )
  }

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl py-1 w-44 animate-scale-in"
      style={{ left: x, top: y }}
      role="menu"
      aria-label="Note options"
    >
      {item('Edit', <Pencil size={13} />, () => setEditingNoteId(note.id))}
      {item(
        note.isPinned ? 'Unpin' : 'Pin',
        note.isPinned ? <PinOff size={13} /> : <Pin size={13} />,
        () => togglePinNote(note.id)
      )}
      {item('Duplicate', <Copy size={13} />, () => duplicateNote(note.id))}

      {/* Move to folder */}
      <div className="relative">
        <button
          onClick={() => setShowFolders((s) => !s)}
          className="w-full text-left flex items-center gap-2 px-3 py-1.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <span className="opacity-60">
            <FolderInput size={13} />
          </span>
          Move to…
        </button>

        {showFolders && (
          <div className="absolute left-full top-0 ml-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl py-1 w-36 animate-scale-in">
            <button
              onClick={() => {
                moveNote(note.id, null)
                closeContextMenu()
              }}
              className={[
                'w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors',
                note.folderId === null
                  ? 'text-amber-600 dark:text-amber-400 font-medium'
                  : 'text-gray-700 dark:text-gray-300',
              ].join(' ')}
            >
              Inbox
            </button>
            {folders.map((folder) => (
              <button
                key={folder.id}
                onClick={() => {
                  moveNote(note.id, folder.id)
                  closeContextMenu()
                }}
                className={[
                  'w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors truncate',
                  note.folderId === folder.id
                    ? 'text-amber-600 dark:text-amber-400 font-medium'
                    : 'text-gray-700 dark:text-gray-300',
                ].join(' ')}
              >
                {folder.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="h-px bg-gray-100 dark:bg-gray-800 my-1" />

      {item(
        'Delete',
        <Trash2 size={13} />,
        () => {
          if (confirm('Delete this note?')) deleteNote(note.id)
        },
        true
      )}
    </div>
  )
}
