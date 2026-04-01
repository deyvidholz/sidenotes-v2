import React, { useEffect, useRef, useState, useCallback } from 'react'
import {
  ArrowLeft,
  Pin,
  PinOff,
  Copy,
  Trash2,
  Folder,
  ChevronDown,
  Check,
} from 'lucide-react'
import { useStore, useNote } from '@/store/store'
import { NOTE_COLORS } from '@/types'
import type { NoteColor } from '@/types'
import { ColorPicker } from './ColorPicker'
import { IconButton } from './ui/Button'
import { prefersDark, formatFullDate } from '@/utils/helpers'
import { debounce } from '@/utils/helpers'

export function NoteEditor() {
  const editingNoteId = useStore((s) => s.editingNoteId)
  const setEditingNoteId = useStore((s) => s.setEditingNoteId)
  const updateNote = useStore((s) => s.updateNote)
  const deleteNote = useStore((s) => s.deleteNote)
  const togglePinNote = useStore((s) => s.togglePinNote)
  const duplicateNote = useStore((s) => s.duplicateNote)
  const moveNote = useStore((s) => s.moveNote)
  const folders = useStore((s) => s.folders)

  const note = useNote(editingNoteId ?? '')

  const [localTitle, setLocalTitle] = useState('')
  const [localContent, setLocalContent] = useState('')
  const [showFolderPicker, setShowFolderPicker] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')

  const titleRef = useRef<HTMLInputElement>(null)
  const contentRef = useRef<HTMLTextAreaElement>(null)
  const folderPickerRef = useRef<HTMLDivElement>(null)

  const dark = prefersDark()

  // Sync local state when note changes (or editor opens)
  useEffect(() => {
    if (!note) return
    setLocalTitle(note.title)
    setLocalContent(note.content)
    setSaveStatus('idle')
  }, [note?.id]) // only re-sync when switching notes, not on every update

  // Auto-focus title if empty on open
  useEffect(() => {
    if (!note) return
    if (!note.title && !note.content) {
      titleRef.current?.focus()
    } else {
      contentRef.current?.focus()
    }
  }, [note?.id])

  // Close folder picker on outside click
  useEffect(() => {
    if (!showFolderPicker) return
    function handleClick(e: MouseEvent) {
      if (
        folderPickerRef.current &&
        !folderPickerRef.current.contains(e.target as Node)
      ) {
        setShowFolderPicker(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showFolderPicker])

  // Keyboard shortcuts
  useEffect(() => {
    if (!editingNoteId) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setEditingNoteId(null)
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [editingNoteId, setEditingNoteId])

  // Debounced save
  const debouncedUpdate = useCallback(
    debounce((id: string, title: string, content: string) => {
      updateNote(id, { title, content })
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
    }, 600),
    [updateNote]
  )

  function handleTitleChange(value: string) {
    setLocalTitle(value)
    setSaveStatus('saving')
    if (editingNoteId) debouncedUpdate(editingNoteId, value, localContent)
  }

  function handleContentChange(value: string) {
    setLocalContent(value)
    setSaveStatus('saving')
    if (editingNoteId) debouncedUpdate(editingNoteId, localTitle, value)
    // Auto-resize textarea
    if (contentRef.current) {
      contentRef.current.style.height = 'auto'
      contentRef.current.style.height = `${contentRef.current.scrollHeight}px`
    }
  }

  function handleColorChange(color: NoteColor) {
    if (!editingNoteId) return
    updateNote(editingNoteId, { color })
  }

  function handleDelete() {
    if (!editingNoteId) return
    if (confirm('Delete this note?')) {
      setEditingNoteId(null)
      deleteNote(editingNoteId)
    }
  }

  function handleDuplicate() {
    if (!editingNoteId) return
    const newId = duplicateNote(editingNoteId)
    setEditingNoteId(newId)
  }

  function handleBack() {
    // Flush any pending save immediately
    if (editingNoteId) {
      updateNote(editingNoteId, { title: localTitle, content: localContent })
    }
    setEditingNoteId(null)
  }

  if (!note) return null

  const theme = NOTE_COLORS[note.color]
  const bg = dark ? theme.darkBg : theme.lightBg
  const textClass = 'text-gray-900 dark:text-gray-100'
  const subTextClass = 'text-gray-500 dark:text-gray-400'

  const currentFolder = note.folderId
    ? folders.find((f) => f.id === note.folderId)
    : null

  return (
    <div
      className="fixed inset-0 z-40 flex flex-col animate-fade-in"
      style={{ backgroundColor: bg }}
      role="dialog"
      aria-label="Note editor"
      aria-modal="true"
    >
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-2 h-11 border-b border-black/10 dark:border-white/10 flex-shrink-0">
        <IconButton onClick={handleBack} aria-label="Back to notes" title="Back (Esc)">
          <ArrowLeft size={16} />
        </IconButton>

        <div className="flex-1" />

        {/* Save status */}
        <span
          className={[
            'text-xs transition-opacity duration-300 mr-1',
            subTextClass,
            saveStatus === 'idle' ? 'opacity-0' : 'opacity-100',
          ].join(' ')}
          aria-live="polite"
          aria-label={saveStatus === 'saving' ? 'Saving…' : 'Saved'}
        >
          {saveStatus === 'saving' ? 'Saving…' : 'Saved'}
        </span>

        <ColorPicker value={note.color} onChange={handleColorChange} />

        <IconButton
          onClick={() => togglePinNote(note.id)}
          active={note.isPinned}
          title={note.isPinned ? 'Unpin' : 'Pin'}
          aria-label={note.isPinned ? 'Unpin note' : 'Pin note'}
          aria-pressed={note.isPinned}
        >
          {note.isPinned ? <PinOff size={15} /> : <Pin size={15} />}
        </IconButton>

        <IconButton onClick={handleDuplicate} title="Duplicate" aria-label="Duplicate note">
          <Copy size={14} />
        </IconButton>

        <IconButton
          variant="danger"
          onClick={handleDelete}
          title="Delete"
          aria-label="Delete note"
        >
          <Trash2 size={14} />
        </IconButton>
      </div>

      {/* Folder selector */}
      <div
        ref={folderPickerRef}
        className="relative flex-shrink-0 px-4 py-1.5 border-b border-black/5 dark:border-white/5"
      >
        <button
          onClick={() => setShowFolderPicker((s) => !s)}
          className={[
            'flex items-center gap-1.5 text-xs rounded-md px-2 py-1 transition-colors hover:bg-black/5 dark:hover:bg-white/10 -ml-2',
            subTextClass,
          ].join(' ')}
          aria-label="Change folder"
          aria-expanded={showFolderPicker}
        >
          <Folder size={12} />
          <span>{currentFolder ? currentFolder.name : 'Inbox'}</span>
          <ChevronDown size={10} className="opacity-60" />
        </button>

        {showFolderPicker && (
          <div className="absolute left-2 top-full mt-1 z-20 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg py-1 w-44 animate-scale-in">
            <FolderPickerItem
              label="Inbox"
              isActive={note.folderId === null}
              onClick={() => {
                moveNote(note.id, null)
                setShowFolderPicker(false)
              }}
            />
            {folders.map((folder) => (
              <FolderPickerItem
                key={folder.id}
                label={folder.name}
                isActive={note.folderId === folder.id}
                onClick={() => {
                  moveNote(note.id, folder.id)
                  setShowFolderPicker(false)
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto overscroll-contain flex flex-col min-h-0">
        {/* Title */}
        <input
          ref={titleRef}
          type="text"
          value={localTitle}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Title"
          maxLength={200}
          className={[
            'w-full px-4 pt-4 pb-1 text-base font-semibold bg-transparent outline-none placeholder-gray-400/60',
            textClass,
          ].join(' ')}
          aria-label="Note title"
        />

        {/* Content */}
        <textarea
          ref={contentRef}
          value={localContent}
          onChange={(e) => handleContentChange(e.target.value)}
          placeholder="Write something…"
          className={[
            'w-full flex-1 px-4 py-2 text-sm bg-transparent outline-none resize-none placeholder-gray-400/60 leading-relaxed min-h-[200px]',
            subTextClass,
          ].join(' ')}
          aria-label="Note content"
          style={{ height: 'auto' }}
          onInput={(e) => {
            const el = e.currentTarget
            el.style.height = 'auto'
            el.style.height = `${el.scrollHeight}px`
          }}
        />
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 px-4 py-2 border-t border-black/5 dark:border-white/5">
        <p className={`text-xs ${subTextClass} opacity-60`}>
          {formatFullDate(note.updatedAt)}
        </p>
      </div>
    </div>
  )
}

function FolderPickerItem({
  label,
  isActive,
  onClick,
}: {
  label: string
  isActive: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={[
        'w-full text-left flex items-center justify-between px-3 py-1.5 text-xs hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors',
        isActive
          ? 'text-amber-600 dark:text-amber-400 font-medium'
          : 'text-gray-700 dark:text-gray-300',
      ].join(' ')}
    >
      <span className="truncate">{label}</span>
      {isActive && <Check size={12} />}
    </button>
  )
}
