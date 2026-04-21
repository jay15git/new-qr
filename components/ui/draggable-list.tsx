"use client"

import * as React from "react"
import { Reorder, useDragControls, type DragControls } from "framer-motion"
import { GripVertical } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type DraggableValue = {
  id: string
}

type DraggableListContextValue = {
  disabled: boolean
  dragControls: DragControls
} | null

const DraggableListItemContext =
  React.createContext<DraggableListContextValue>(null)

type DraggableListProps<T extends DraggableValue> = {
  children: React.ReactNode
  className?: string
  items: T[]
  onReorder: (items: T[]) => void
}

export function DraggableList<T extends DraggableValue>({
  children,
  className,
  items,
  onReorder,
}: DraggableListProps<T>) {
  return (
    <Reorder.Group
      axis="y"
      className={cn("flex flex-col gap-3", className)}
      data-slot="draggable-list"
      onReorder={onReorder}
      values={items}
    >
      {children}
    </Reorder.Group>
  )
}

type DraggableListItemProps<T extends DraggableValue> = {
  children: React.ReactNode
  className?: string
  disabled?: boolean
  value: T
}

export function DraggableListItem<T extends DraggableValue>({
  children,
  className,
  disabled = false,
  value,
}: DraggableListItemProps<T>) {
  const dragControls = useDragControls()

  return (
    <DraggableListItemContext.Provider value={{ disabled, dragControls }}>
      <Reorder.Item
        className={cn("list-none", className)}
        data-disabled={disabled ? "true" : "false"}
        data-slot="draggable-list-item"
        drag={disabled ? false : "y"}
        dragControls={dragControls}
        dragListener={false}
        value={value}
        whileDrag={
          disabled
            ? undefined
            : {
                boxShadow: "0 18px 40px rgba(15, 23, 42, 0.18)",
                scale: 1.01,
              }
        }
      >
        {children}
      </Reorder.Item>
    </DraggableListItemContext.Provider>
  )
}

type DraggableListHandleProps = {
  className?: string
  label?: string
}

export function DraggableListHandle({
  className,
  label = "Reorder item",
}: DraggableListHandleProps) {
  const context = React.useContext(DraggableListItemContext)

  if (!context) {
    throw new Error("DraggableListHandle must be used inside DraggableListItem.")
  }

  return (
    <Button
      aria-label={label}
      className={cn(
        "rounded-full border border-white/8 bg-white/[0.03] text-foreground/45 shadow-none hover:bg-white/[0.06] hover:text-foreground/68",
        className,
      )}
      data-slot="draggable-list-handle"
      disabled={context.disabled}
      onPointerDown={(event) => {
        event.preventDefault()
        event.stopPropagation()

        if (context.disabled) {
          return
        }

        context.dragControls.start(event.nativeEvent)
      }}
      size="icon-sm"
      type="button"
      variant="ghost"
    >
      <GripVertical className="size-4" />
    </Button>
  )
}
