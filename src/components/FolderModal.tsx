import React, { useEffect, useRef, useState } from 'react'
import { useStore } from '@/store/store'
import { Modal } from './ui/Modal'
import { Button } from './ui/Button'

export function FolderModal() {
  const folderModal = useStore((s) => s.folderModal)
  const closeFolderModal = useStore((s) => s.closeFolderModal)
  const createFolder = useStore((s) => s.createFolder)
  const renameFolder = useStore((s) => s.renameFolder)
  const folders = useStore((s) => s.folders)
  const setActiveView = useStore((s) => s.setActiveView)

  const inputRef = useRef<HTMLInputElement>(null)
  const [name, setName] = useState('')

  useEffect(() => {
    if (!folderModal.isOpen) {
      setName('')
      return
    }
    if (folderModal.mode === 'rename' && folderModal.folderId) {
      const folder = folders.find((f) => f.id === folderModal.folderId)
      setName(folder?.name ?? '')
    } else {
      setName('')
    }
    // Autofocus input after animation
    setTimeout(() => inputRef.current?.focus(), 50)
  }, [folderModal.isOpen, folderModal.mode, folderModal.folderId, folders])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return

    if (folderModal.mode === 'create') {
      const newId = createFolder(trimmed)
      setActiveView(`folder:${newId}`)
    } else if (folderModal.mode === 'rename' && folderModal.folderId) {
      renameFolder(folderModal.folderId, trimmed)
    }

    closeFolderModal()
  }

  const title = folderModal.mode === 'create' ? 'New Folder' : 'Rename Folder'

  return (
    <Modal isOpen={folderModal.isOpen} onClose={closeFolderModal} title={title}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Folder name"
          maxLength={64}
          className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 outline-none focus:border-amber-400 dark:focus:border-amber-500 transition-colors"
          aria-label="Folder name"
        />
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" onClick={closeFolderModal} type="button">
            Cancel
          </Button>
          <Button variant="solid" type="submit" disabled={!name.trim()}>
            {folderModal.mode === 'create' ? 'Create' : 'Rename'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
