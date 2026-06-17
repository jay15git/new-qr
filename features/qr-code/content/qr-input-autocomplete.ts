"use client"

import { useFilter, useListCollection } from "@ark-ui/react"
import type { LucideIcon } from "lucide-react"
import * as React from "react"

import {
  QR_CATEGORIES,
  type QrInputType,
} from "@/features/qr-code/content/input-options"

export type QrInputAutocompleteItem = {
  label: string
  value: QrInputType
  category: string
  icon: LucideIcon
}

export function buildQrInputAutocompleteItems(): QrInputAutocompleteItem[] {
  return QR_CATEGORIES.flatMap((category) =>
    category.items.map((item) => ({
      label: item.label,
      value: item.value,
      category: category.label,
      icon: item.icon,
    })),
  )
}

export function filterQrInputAutocompleteItems(
  items: readonly QrInputAutocompleteItem[],
  query: string,
): QrInputAutocompleteItem[] {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return [...items]

  return items.filter(
    (item) =>
      item.label.toLowerCase().includes(normalized) ||
      item.value.toLowerCase().includes(normalized) ||
      item.category.toLowerCase().includes(normalized),
  )
}

const QR_INPUT_AUTOCOMPLETE_ITEMS = buildQrInputAutocompleteItems()

function matchQrInputAutocompleteItem(
  itemString: string,
  filterText: string,
  item: QrInputAutocompleteItem,
) {
  return filterQrInputAutocompleteItems([item], filterText).length > 0
}

export function useQrInputAutocompleteCollection() {
  const { contains } = useFilter({ sensitivity: "base" })

  const { collection, filter } = useListCollection<QrInputAutocompleteItem>({
    initialItems: QR_INPUT_AUTOCOMPLETE_ITEMS,
    itemToValue: (item) => item.value,
    itemToString: (item) => item.label,
    groupBy: (item) => item.category,
    filter: (itemString, filterText, item) =>
      matchQrInputAutocompleteItem(itemString, filterText, item) || contains(itemString, filterText),
  })

  return React.useMemo(
    () => ({
      collection,
      filter,
      items: QR_INPUT_AUTOCOMPLETE_ITEMS,
    }),
    [collection, filter],
  )
}
