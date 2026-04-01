import React, { useMemo, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCenter,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  rectSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useStore } from '@/store/store'
import { getNotesForView } from '@/utils/helpers'
import { NoteCard } from './NoteCard'
import { EmptyState } from './EmptyState'
import type { Note } from '@/types'

// ─── Sortable wrapper ────────────────────────────────────────────────────────

interface SortableNoteCardProps {
  note: Note
  layoutMode: 'grid' | 'list'
}

function SortableNoteCard({ note, layoutMode }: SortableNoteCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: note.id })

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0 : 1,
      }}
      // Intentionally not spreading {...attributes} here — it adds role="button" which
      // nests inside NoteCard's own role="button", creating invalid HTML and breaking
      // event propagation. Accessibility for the drag handle is handled by the grip
      // button's aria-label inside NoteCard.
    >
      <NoteCard note={note} layoutMode={layoutMode} dragHandleListeners={listeners} />
    </div>
  )
}

// ─── Main component ──────────────────────────────────────────────────────────

export function NotesGrid() {
  const notes = useStore((s) => s.notes)
  const activeView = useStore((s) => s.activeView)
  const searchQuery = useStore((s) => s.searchQuery)
  const sortBy = useStore((s) => s.sortBy)
  const sortDir = useStore((s) => s.sortDir)
  const layoutMode = useStore((s) => s.layoutMode)
  const reorderNotes = useStore((s) => s.reorderNotes)

  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  )

  const visibleNotes = useMemo(
    () => getNotesForView(notes, activeView, searchQuery, sortBy, sortDir),
    [notes, activeView, searchQuery, sortBy, sortDir]
  )

  const pinnedNotes = visibleNotes.filter((n) => n.isPinned)
  const unpinnedNotes = visibleNotes.filter((n) => !n.isPinned)

  const activeNote = activeId ? notes.find((n) => n.id === activeId) ?? null : null

  function handleDragStart({ active }: DragStartEvent) {
    setActiveId(active.id as string)
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveId(null)
    if (!over || active.id === over.id) return

    const activeNote = notes.find((n) => n.id === active.id)
    const overNote = notes.find((n) => n.id === over.id)
    if (!activeNote || !overNote) return

    // Enforce pin-group boundary: pinned ↔ pinned only, unpinned ↔ unpinned only
    if (activeNote.isPinned !== overNote.isPinned) return

    const oldIndex = visibleNotes.findIndex((n) => n.id === active.id)
    const newIndex = visibleNotes.findIndex((n) => n.id === over.id)

    const reorderedIds = arrayMove(visibleNotes, oldIndex, newIndex).map((n) => n.id)
    reorderNotes(reorderedIds)
  }

  function handleDragCancel() {
    setActiveId(null)
  }

  const isEmpty = visibleNotes.length === 0

  if (isEmpty) {
    return (
      <div className="flex-1 overflow-y-auto overscroll-contain min-h-0" role="main">
        <EmptyState isSearch={!!searchQuery} />
      </div>
    )
  }

  return (
    <div
      className="flex-1 overflow-y-auto overscroll-contain min-h-0"
      role="main"
      aria-label="Notes"
    >
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        {layoutMode === 'grid' ? (
          <div
            className="p-2 grid gap-2 content-start"
            style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gridAutoRows: '9rem' }}
          >
            <SortableContext items={pinnedNotes.map((n) => n.id)} strategy={rectSortingStrategy}>
              {pinnedNotes.map((note) => (
                <SortableNoteCard key={note.id} note={note} layoutMode="grid" />
              ))}
            </SortableContext>
            <SortableContext items={unpinnedNotes.map((n) => n.id)} strategy={rectSortingStrategy}>
              {unpinnedNotes.map((note) => (
                <SortableNoteCard key={note.id} note={note} layoutMode="grid" />
              ))}
            </SortableContext>
          </div>
        ) : (
          <div className="p-2 flex flex-col gap-1.5">
            <SortableContext items={pinnedNotes.map((n) => n.id)} strategy={rectSortingStrategy}>
              {pinnedNotes.map((note) => (
                <SortableNoteCard key={note.id} note={note} layoutMode="list" />
              ))}
            </SortableContext>
            <SortableContext items={unpinnedNotes.map((n) => n.id)} strategy={rectSortingStrategy}>
              {unpinnedNotes.map((note) => (
                <SortableNoteCard key={note.id} note={note} layoutMode="list" />
              ))}
            </SortableContext>
          </div>
        )}

        <DragOverlay dropAnimation={null}>
          {activeNote && (
            <div
              style={{
                transform: 'rotate(1.5deg)',
                opacity: 0.92,
                boxShadow: '0 16px 40px rgba(0,0,0,0.18)',
                borderRadius: 12,
                cursor: 'grabbing',
              }}
            >
              <NoteCard note={activeNote} layoutMode={layoutMode} />
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
