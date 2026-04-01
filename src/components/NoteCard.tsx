import React, { useCallback } from 'react'
import { Pin, MoreHorizontal, GripVertical } from 'lucide-react'
import { useStore } from '@/store/store'
import { NOTE_COLORS } from '@/types'
import { formatRelativeDate, prefersDark } from '@/utils/helpers'
import type { Note } from '@/types'

interface NoteCardProps {
  note: Note
  layoutMode: 'grid' | 'list'
  dragHandleListeners?: React.HTMLAttributes<HTMLButtonElement>
}

export function NoteCard({ note, layoutMode, dragHandleListeners }: NoteCardProps) {
  const setEditingNoteId = useStore((s) => s.setEditingNoteId)
  const openContextMenu = useStore((s) => s.openContextMenu)
  const togglePinNote = useStore((s) => s.togglePinNote)

  const dark = prefersDark()
  const theme = NOTE_COLORS[note.color]
  const bg = dark ? theme.darkBg : theme.lightBg
  const border = dark ? theme.darkBorder : theme.lightBorder

  const displayTitle = note.title || note.content.split('\n')[0] || 'Untitled'
  const hasTitle = !!note.title
  const previewContent = hasTitle ? note.content : note.content.split('\n').slice(1).join('\n')

  // Instead of stopPropagation (unreliable with dnd-kit wrapper), action buttons carry
  // data-no-click so the outer onClick can bail out when they're the click source.
  const handleCardClick = useCallback(
    (e: React.MouseEvent) => {
      if ((e.target as Element).closest('[data-no-click]')) return
      setEditingNoteId(note.id)
    },
    [note.id, setEditingNoteId]
  )

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      openContextMenu(note.id, e.clientX, e.clientY)
    },
    [note.id, openContextMenu]
  )

  const handleMoreClick = useCallback(
    (e: React.MouseEvent) => {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
      openContextMenu(note.id, rect.left, rect.bottom + 4)
    },
    [note.id, openContextMenu]
  )

  const handlePinClick = useCallback(() => {
    togglePinNote(note.id)
  }, [note.id, togglePinNote])

  const gripHandle = dragHandleListeners && (
    <button
      data-no-click
      {...dragHandleListeners}
      className="flex-shrink-0 p-0.5 rounded opacity-0 group-hover:opacity-30 hover:!opacity-60 touch-none transition-opacity"
      style={{ cursor: 'grab' }}
      aria-label="Drag to reorder"
      tabIndex={-1}
    >
      <GripVertical size={12} className="text-gray-500 dark:text-gray-400" />
    </button>
  )

  if (layoutMode === 'list') {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={handleCardClick}
        onContextMenu={handleContextMenu}
        onKeyDown={(e) => e.key === 'Enter' && setEditingNoteId(note.id)}
        className="group flex items-center gap-1 px-2 py-2.5 rounded-xl border cursor-pointer transition-all hover:shadow-sm active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
        style={{ backgroundColor: bg, borderColor: border }}
        aria-label={`Note: ${displayTitle}`}
      >
        {gripHandle}

        <div
          className="w-2 h-2 rounded-full flex-shrink-0 mx-1"
          style={{ backgroundColor: theme.dot }}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-1">
            <p className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate leading-4">
              {displayTitle}
            </p>
            <div className="flex items-center gap-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              {note.isPinned && (
                <Pin size={11} className="text-amber-500" fill="currentColor" />
              )}
              <button
                data-no-click
                onClick={handleMoreClick}
                className="p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                aria-label="Note options"
              >
                <MoreHorizontal size={12} className="text-gray-500 dark:text-gray-400" />
              </button>
            </div>
          </div>
          {previewContent && (
            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5 leading-4">
              {previewContent}
            </p>
          )}
        </div>

        <span className="text-xs text-gray-400 dark:text-gray-600 flex-shrink-0 tabular-nums ml-1">
          {formatRelativeDate(note.updatedAt)}
        </span>
      </div>
    )
  }

  // Grid layout
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onContextMenu={handleContextMenu}
      onKeyDown={(e) => e.key === 'Enter' && setEditingNoteId(note.id)}
      className="group relative flex flex-col rounded-xl border cursor-pointer transition-all hover:shadow-md hover:-translate-y-px active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 overflow-hidden"
      style={{ backgroundColor: bg, borderColor: border }}
      aria-label={`Note: ${displayTitle}`}
    >
      {note.isPinned && (
        <div className="absolute top-2 right-2">
          <Pin size={11} className="text-amber-500 opacity-80" fill="currentColor" />
        </div>
      )}

      <div className="flex-1 p-2.5 pb-1.5 min-h-0">
        <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 leading-tight line-clamp-2 mb-1 pr-3">
          {displayTitle}
        </p>
        {previewContent && (
          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3">
            {previewContent}
          </p>
        )}
      </div>

      <div className="flex items-center gap-1 px-2 py-1.5">
        {gripHandle}

        <span className="flex-1 text-xs text-gray-400 dark:text-gray-600 tabular-nums">
          {formatRelativeDate(note.updatedAt)}
        </span>

        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            data-no-click
            onClick={handlePinClick}
            className={[
              'p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors',
              note.isPinned ? 'opacity-100' : 'opacity-60 hover:opacity-100',
            ].join(' ')}
            aria-label={note.isPinned ? 'Unpin note' : 'Pin note'}
            title={note.isPinned ? 'Unpin' : 'Pin'}
          >
            <Pin
              size={11}
              className={note.isPinned ? 'text-amber-500' : 'text-gray-500 dark:text-gray-400'}
              fill={note.isPinned ? 'currentColor' : 'none'}
            />
          </button>
          <button
            data-no-click
            onClick={handleMoreClick}
            className="p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            aria-label="Note options"
          >
            <MoreHorizontal size={11} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  )
}
