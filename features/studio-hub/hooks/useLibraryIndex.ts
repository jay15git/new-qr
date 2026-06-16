"use client"

import * as React from "react"

import {
  createEmptyLibraryIndex,
  readLibraryIndex,
} from "@/features/library/model/storage"
import type { LibraryIndexV1 } from "@/features/library/model/types"
import { buildDemoLibraryDesigns } from "@/features/studio-hub/model/demo-library"

type LibraryIndexState = {
  index: LibraryIndexV1
  isLoading: boolean
  isMockFallback: boolean
  refresh: () => Promise<void>
}

export function useLibraryIndex(): LibraryIndexState {
  const [index, setIndex] = React.useState<LibraryIndexV1>(() => ({
    ...createEmptyLibraryIndex(),
    designs: buildDemoLibraryDesigns(),
    collections: [],
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
        setIndex(stored)
        setIsMockFallback(stored.designs.length === 0)
        return
      }

      setIndex({
        ...createEmptyLibraryIndex(),
        designs: buildDemoLibraryDesigns(),
        collections: [],
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
