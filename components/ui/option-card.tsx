import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type OptionCardProps = {
  checked: boolean
  children: ReactNode
  label: string
  name: string
  onSelect: () => void
  value: string
}

export function OptionCard({
  checked,
  children,
  label,
  name,
  onSelect,
  value,
}: OptionCardProps) {
  return (
    <label
      data-slot="option-card-root"
      data-state={checked ? "checked" : "unchecked"}
      className="group flex w-[108px] cursor-pointer flex-col items-center gap-3 text-center"
    >
      <input
        aria-label={label}
        checked={checked}
        className="peer sr-only"
        data-slot="option-card-input"
        name={name}
        onChange={onSelect}
        type="radio"
        value={value}
      />
      <span
        data-slot="option-card"
        data-state={checked ? "checked" : "unchecked"}
        className={cn(
          "flex size-[108px] items-center justify-center border bg-white transition-[border-color,box-shadow,transform] duration-150 ease-out group-active:translate-y-px peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-black/55",
          checked
            ? "border-2 border-black shadow-[0_0_22px_2px_rgba(0,0,0,0.14),0_5px_10px_1px_rgba(0,0,0,0.1)] group-hover:shadow-[0_0_28px_3px_rgba(0,0,0,0.18),0_6px_14px_1px_rgba(0,0,0,0.12)]"
            : "border border-[#00000017] shadow-[0_0_10px_0_rgba(0,0,0,0.08),0_2px_4px_0_rgba(0,0,0,0.06)] group-hover:border-[#0000002A] group-hover:shadow-[0_0_16px_1px_rgba(0,0,0,0.1),0_3px_8px_0_rgba(0,0,0,0.08)] group-active:border-[#00000034] group-active:shadow-[0_0_8px_0_rgba(0,0,0,0.08),0_1px_3px_0_rgba(0,0,0,0.08)]",
        )}
      >
        <span
          data-slot="option-card-motif"
          data-state={checked ? "checked" : "unchecked"}
          className="flex size-14 items-center justify-center text-[#4B4F56]"
        >
          {children}
        </span>
      </span>
      <span
        data-slot="option-card-label"
        data-state={checked ? "checked" : "unchecked"}
        className={cn(
          "text-sm font-medium leading-none",
          checked ? "text-[#111111]" : "text-[#00000073]",
        )}
      >
        {label}
      </span>
    </label>
  )
}
