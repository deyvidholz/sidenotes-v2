import React from 'react'
import { Plus, Search } from 'lucide-react'
import { useStore } from '@/store/store'

interface EmptyStateProps {
  isSearch?: boolean
}

export function EmptyState({ isSearch = false }: EmptyStateProps) {
  const createNote = useStore((s) => s.createNote)

  if (isSearch) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 px-6 py-10 text-center">
        <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
          <Search size={20} className="text-gray-400 dark:text-gray-500" />
        </div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          No notes found
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">
          Try a different search term
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center flex-1 px-6 py-10 text-center">
      <div className="text-4xl mb-3" aria-hidden="true">
        📝
      </div>
      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
        No notes here yet
      </p>
      <p className="text-xs text-gray-400 dark:text-gray-600 mb-4">
        Create your first note to get started
      </p>
      <button
        onClick={() => createNote()}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-amber-400 hover:bg-amber-500 text-amber-900 rounded-lg transition-colors"
      >
        <Plus size={12} />
        New note
      </button>
    </div>
  )
}
