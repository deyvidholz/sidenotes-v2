import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import {
  Notebook,
  Pin,
  Inbox,
  Folder,
  FolderOpen,
  Plus,
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'
import { useStore } from '@/store/store'
import { IconButton } from './ui/Button'
import type { View } from '@/types'

interface FolderMenuState {
  id: string
  x: number
  y: number
  isPinned: boolean
}

export function FolderNav() {
  const notes = useStore((s) => s.notes)
  const folders = useStore((s) => s.folders)
  const activeView = useStore((s) => s.activeView)
  const setActiveView = useStore((s) => s.setActiveView)
  const toggleExpandFolder = useStore((s) => s.toggleExpandFolder)
  const openFolderModal = useStore((s) => s.openFolderModal)

  const [folderMenu, setFolderMenu] = useState<FolderMenuState | null>(null)
  const [foldersCollapsed, setFoldersCollapsed] = useState(false)

  const allCount = notes.length
  const pinnedCount = notes.filter((n) => n.isPinned).length
  const inboxCount = notes.filter((n) => n.folderId === null).length

  const sortedFolders = [...folders].sort((a, b) => {
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1
    return a.name.localeCompare(b.name)
  })

  function getFolderNoteCount(folderId: string): number {
    return notes.filter((n) => n.folderId === folderId).length
  }

  return (
    <nav
      className="flex-shrink-0 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50"
      aria-label="Navigation"
    >
      {/* Static views */}
      <div className="px-2 pt-1.5 pb-0.5 space-y-0.5">
        <NavItem
          view="all"
          activeView={activeView}
          icon={<Notebook size={13} />}
          label="All Notes"
          count={allCount}
          onClick={() => setActiveView('all')}
        />
        <NavItem
          view="pinned"
          activeView={activeView}
          icon={<Pin size={13} />}
          label="Pinned"
          count={pinnedCount}
          onClick={() => setActiveView('pinned')}
        />
        <NavItem
          view="inbox"
          activeView={activeView}
          icon={<Inbox size={13} />}
          label="Inbox"
          count={inboxCount}
          onClick={() => setActiveView('inbox')}
        />
      </div>

      {/* Folders section */}
      <div className="px-2 pb-1.5">
        <div className="flex items-center justify-between h-7 px-1 mt-1">
          <button
            className="flex items-center gap-1 text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            onClick={() => setFoldersCollapsed((c) => !c)}
            aria-expanded={!foldersCollapsed}
          >
            {foldersCollapsed ? (
              <ChevronRight size={10} />
            ) : (
              <ChevronDown size={10} />
            )}
            Folders
          </button>
          <IconButton
            size="xs"
            onClick={() => openFolderModal('create')}
            title="New folder"
            aria-label="Create folder"
          >
            <Plus size={12} />
          </IconButton>
        </div>

        {!foldersCollapsed && (
          <div className="space-y-0.5">
            {sortedFolders.length === 0 && (
              <p className="text-xs text-gray-400 dark:text-gray-600 px-2 py-1 italic">
                No folders yet
              </p>
            )}
            {sortedFolders.map((folder) => {
              const view: View = `folder:${folder.id}`
              const count = getFolderNoteCount(folder.id)
              const isActive = activeView === view

              return (
                <div key={folder.id} className="group relative">
                  <button
                    onClick={() => setActiveView(view)}
                    className={[
                      'w-full flex items-center gap-1.5 px-2 h-7 rounded-md text-xs transition-colors',
                      isActive
                        ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 font-medium'
                        : 'text-gray-700 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <span
                      className="flex-shrink-0 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleExpandFolder(folder.id)
                      }}
                    >
                      {folder.isExpanded ? (
                        <FolderOpen size={13} />
                      ) : (
                        <Folder size={13} />
                      )}
                    </span>

                    <span className="flex-1 text-left truncate">{folder.name}</span>

                    {folder.isPinned && (
                      <Pin size={9} className="flex-shrink-0 opacity-60" />
                    )}

                    <span className="flex-shrink-0 text-xs opacity-50 tabular-nums">
                      {count}
                    </span>
                  </button>

                  {/* Folder actions on hover */}
                  <div
                    className={[
                      'absolute right-1 top-0.5 flex items-center gap-0.5',
                      folderMenu?.id === folder.id ? 'flex' : 'hidden group-hover:flex',
                    ].join(' ')}
                  >
                    <IconButton
                      size="xs"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (folderMenu?.id === folder.id) {
                          setFolderMenu(null)
                          return
                        }
                        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
                        setFolderMenu({
                          id: folder.id,
                          isPinned: folder.isPinned,
                          x: rect.right,
                          y: rect.bottom + 4,
                        })
                      }}
                      aria-label="Folder options"
                    >
                      <MoreHorizontal size={12} />
                    </IconButton>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {folderMenu &&
        createPortal(
          <FolderActionsMenu
            folderId={folderMenu.id}
            isPinned={folderMenu.isPinned}
            x={folderMenu.x}
            y={folderMenu.y}
            onClose={() => setFolderMenu(null)}
          />,
          document.body
        )}
    </nav>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface NavItemProps {
  view: View
  activeView: View
  icon: React.ReactNode
  label: string
  count: number
  onClick: () => void
}

function NavItem({ view, activeView, icon, label, count, onClick }: NavItemProps) {
  const isActive = activeView === view
  return (
    <button
      onClick={onClick}
      className={[
        'w-full flex items-center gap-2 px-2 h-7 rounded-md text-xs transition-colors',
        isActive
          ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 font-medium'
          : 'text-gray-700 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-current={isActive ? 'page' : undefined}
    >
      <span className="flex-shrink-0">{icon}</span>
      <span className="flex-1 text-left">{label}</span>
      <span className="flex-shrink-0 opacity-50 tabular-nums">{count}</span>
    </button>
  )
}

interface FolderActionsMenuProps {
  folderId: string
  isPinned: boolean
  x: number
  y: number
  onClose: () => void
}

const MENU_WIDTH = 144

function FolderActionsMenu({ folderId, isPinned, x, y, onClose }: FolderActionsMenuProps) {
  const togglePinFolder = useStore((s) => s.togglePinFolder)
  const deleteFolder = useStore((s) => s.deleteFolder)
  const openFolderModal = useStore((s) => s.openFolderModal)
  const menuRef = useRef<HTMLDivElement>(null)

  // Clamp so menu doesn't overflow viewport
  const left = Math.min(x, window.innerWidth - MENU_WIDTH - 8)
  const top = Math.min(y, window.innerHeight - 120)

  useEffect(() => {
    function handlePointerDown(e: PointerEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [onClose])

  return (
    <div
      ref={menuRef}
      style={{ position: 'fixed', left, top, width: MENU_WIDTH, zIndex: 500 }}
      className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 animate-scale-in"
    >
      <MenuItem
        onClick={() => {
          openFolderModal('rename', folderId)
          onClose()
        }}
      >
        Rename
      </MenuItem>
      <MenuItem
        onClick={() => {
          togglePinFolder(folderId)
          onClose()
        }}
      >
        {isPinned ? 'Unpin' : 'Pin'}
      </MenuItem>
      <div className="h-px bg-gray-100 dark:bg-gray-800 my-1" />
      <MenuItem
        danger
        onClick={() => {
          if (confirm('Delete folder? Notes inside will move to Inbox.')) {
            deleteFolder(folderId)
          }
          onClose()
        }}
      >
        Delete
      </MenuItem>
    </div>
  )
}

function MenuItem({
  children,
  danger = false,
  onClick,
}: {
  children: React.ReactNode
  danger?: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={[
        'w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors',
        danger
          ? 'text-red-600 dark:text-red-400'
          : 'text-gray-700 dark:text-gray-300',
      ].join(' ')}
    >
      {children}
    </button>
  )
}
