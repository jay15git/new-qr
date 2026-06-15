import type { LibraryIndexV1 } from "@/features/library/model/types"

const DB_NAME = "new-qr-library"
const DB_VERSION = 1
const STORE_NAME = "index"
const INDEX_ID = "library"
const LOCAL_STORAGE_KEY = "new-qr:library:index"

type StoredLibraryIndexRecord = {
  id: typeof INDEX_ID
  index: unknown
  updatedAt: number
}

export function createEmptyLibraryIndex(): LibraryIndexV1 {
  return {
    version: 1,
    designs: [],
    collections: [],
    updatedAt: Date.now(),
  }
}

export function parseLibraryIndex(value: unknown): LibraryIndexV1 | null {
  if (
    typeof value !== "object" ||
    value === null ||
    !("version" in value) ||
    value.version !== 1 ||
    !("designs" in value) ||
    !Array.isArray(value.designs) ||
    !("collections" in value) ||
    !Array.isArray(value.collections)
  ) {
    return null
  }

  return value as LibraryIndexV1
}

export async function readLibraryIndex(): Promise<LibraryIndexV1 | null> {
  const idbRecord = await readIndexedDbIndex().catch(() => null)
  if (idbRecord) {
    return parseLibraryIndex(idbRecord.index)
  }

  try {
    const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY)
    return raw ? parseLibraryIndex(JSON.parse(raw)) : null
  } catch {
    return null
  }
}

export async function writeLibraryIndex(index: LibraryIndexV1): Promise<void> {
  const payload = {
    ...index,
    updatedAt: Date.now(),
  }

  try {
    await writeIndexedDbIndex(payload)
    return
  } catch {
    try {
      window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(payload))
    } catch {
      // Library UI can still render mock data when storage is unavailable.
    }
  }
}

export async function upsertLibraryDesign(
  index: LibraryIndexV1,
  design: LibraryIndexV1["designs"][number],
): Promise<LibraryIndexV1> {
  const existingIndex = index.designs.findIndex((entry) => entry.id === design.id)
  const designs =
    existingIndex === -1
      ? [...index.designs, design]
      : index.designs.map((entry, entryIndex) => (entryIndex === existingIndex ? design : entry))

  const nextIndex: LibraryIndexV1 = {
    ...index,
    designs,
    updatedAt: Date.now(),
  }

  await writeLibraryIndex(nextIndex)
  return nextIndex
}

export function getDesktopLibraryUrl(designId: string): string {
  return `/desktop?id=${encodeURIComponent(designId)}`
}

function openLibraryDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB is unavailable."))
      return
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error ?? new Error("IndexedDB open failed."))
    request.onsuccess = () => resolve(request.result)
    request.onupgradeneeded = () => {
      const db = request.result

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" })
      }
    }
  })
}

async function readIndexedDbIndex(): Promise<StoredLibraryIndexRecord | null> {
  const db = await openLibraryDb()

  try {
    return await new Promise<StoredLibraryIndexRecord | null>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readonly")
      const request = transaction.objectStore(STORE_NAME).get(INDEX_ID)

      transaction.onerror = () => reject(transaction.error ?? new Error("IndexedDB read failed."))
      request.onerror = () => reject(request.error ?? new Error("IndexedDB get failed."))
      request.onsuccess = () => resolve(normalizeStoredRecord(request.result))
    })
  } finally {
    db.close()
  }
}

async function writeIndexedDbIndex(index: LibraryIndexV1): Promise<void> {
  const db = await openLibraryDb()

  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite")

      transaction.onerror = () => reject(transaction.error ?? new Error("IndexedDB write failed."))
      transaction.oncomplete = () => resolve()
      transaction.objectStore(STORE_NAME).put({
        id: INDEX_ID,
        index,
        updatedAt: Date.now(),
      } satisfies StoredLibraryIndexRecord)
    })
  } finally {
    db.close()
  }
}

function normalizeStoredRecord(value: unknown): StoredLibraryIndexRecord | null {
  if (
    typeof value !== "object" ||
    value === null ||
    !("id" in value) ||
    value.id !== INDEX_ID ||
    !("index" in value)
  ) {
    return null
  }

  return value as StoredLibraryIndexRecord
}
