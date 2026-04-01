import type { StorageData } from '@/types'
import { STORAGE_VERSION } from '@/types'

/**
 * Storage layer for Sidenotes V2.
 *
 * Priority:
 *   1. chrome.storage.local — used when running as an Opera extension (10 MB limit)
 *   2. localStorage — fallback for development / non-extension environments
 *
 * Note on sync: Opera does not sync chrome.storage.sync via Opera accounts across
 * devices (unlike Chrome). To avoid data loss from the 100 KB sync quota, we use
 * chrome.storage.local which provides a reliable 10 MB local store. Cross-device
 * sync is not available without a custom backend (see README for details).
 */

const STORAGE_KEY = 'sidenotes_v2_data'

function isChromeStorageAvailable(): boolean {
  return (
    typeof chrome !== 'undefined' &&
    typeof chrome.storage !== 'undefined' &&
    typeof chrome.storage.local !== 'undefined'
  )
}

async function loadFromChrome(): Promise<StorageData | null> {
  return new Promise((resolve) => {
    chrome.storage.local.get(STORAGE_KEY, (result) => {
      if (chrome.runtime.lastError) {
        console.error('[Sidenotes] Storage read error:', chrome.runtime.lastError)
        resolve(null)
        return
      }
      resolve((result[STORAGE_KEY] as StorageData) ?? null)
    })
  })
}

async function saveToChrome(data: StorageData): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ [STORAGE_KEY]: data }, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError)
      } else {
        resolve()
      }
    })
  })
}

function loadFromLocalStorage(): StorageData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as StorageData
  } catch {
    return null
  }
}

function saveToLocalStorage(data: StorageData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export async function loadData(): Promise<StorageData | null> {
  const raw = isChromeStorageAvailable()
    ? await loadFromChrome()
    : loadFromLocalStorage()

  if (!raw) return null

  // Migrate older versions if needed
  if (raw.version !== STORAGE_VERSION) {
    return migrateData(raw)
  }

  return raw
}

export async function saveData(data: StorageData): Promise<void> {
  const payload: StorageData = { ...data, version: STORAGE_VERSION }
  if (isChromeStorageAvailable()) {
    await saveToChrome(payload)
  } else {
    saveToLocalStorage(payload)
  }
}

function migrateData(raw: StorageData): StorageData {
  // Placeholder for future migrations.
  // Always return a valid StorageData with the current version.
  return {
    version: STORAGE_VERSION,
    notes: raw.notes ?? [],
    folders: raw.folders ?? [],
    prefs: raw.prefs ?? {
      sortBy: 'updated',
      sortDir: 'desc',
      layoutMode: 'grid',
      lastView: 'all',
    },
  }
}
