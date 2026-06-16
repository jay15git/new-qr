"use client"

import * as React from "react"

import {
  createEmptyLibraryIndex,
  readLibraryIndex,
} from "@/features/library/model/storage"
import type { LibraryIndexV1 } from "@/features/library/model/types"
import { MOCK_LIBRARY_COLLECTIONS, MOCK_LIBRARY_DESIGNS } from "@/features/library/model/mock-library"

type LibraryIndexState = {
  index: LibraryIndexV1
  isLoading: boolean
  isMockFallback: boolean
  refresh: () => Promise<void>
}

export function useLibraryIndex(): LibraryIndexState {
  const [index, setIndex] = React.useState<LibraryIndexV1>(() => ({
    ...createEmptyLibraryIndex(),
    designs: MOCK_LIBRARY_DESIGNS,
    collections: MOCK_LIBRARY_COLLECTIONS,
  }))
  const [isLoading, setIsLoading] = React.useState(true)
  const [isMockFallback, setIsMockFallback] = React.useState(true)

  const refresh = React.useCallback(async () => {
    setIsLoading(true)

    try {
      const stored = await readLibraryIndex()
      if (stored && stored.designs.length > 0) {
        setIndex(stored)
        setIsMockFallback(false)
        return
      }

      if (stored) {
        setIndex({
          ...stored,
          collections: stored.collections.length > 0 ? stored.collections : MOCK_LIBRARY_COLLECTIONS,
        })
        setIsMockFallback(stored.designs.length === 0)
        return
      }

      setIndex({
        ...createEmptyLibraryIndex(),
        designs: MOCK_LIBRARY_DESIGNS,
        collections: MOCK_LIBRARY_COLLECTIONS,
      })
      setIsMockFallback(true)
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    void refresh()
  }, [refresh])

  return {
    index,
    isLoading,
    isMockFallback,
    refresh,
  }
}
