import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type OptionCardProps = {
  checked: boolean
  children: ReactNode
  className?: string
  darkShadowTone?: "default" | "ink"
  labelClassName?: string
  label: string
  motifClassName?: string
  name: string
  onSelect: () => void
  size?: "default" | "compact"
  value: string
}

export function OptionCard({
  checked,
  children,
  className,
  darkShadowTone = "default",
  labelClassName,
  label,
  motifClassName,
  name,
  onSelect,
  size = "default",
  value,
}: OptionCardProps) {
  const isCompact = size === "compact"
  const useInkDarkShadow = darkShadowTone === "ink"

  return (
    <label
      data-slot="option-card-root"
      data-state={checked ? "checked" : "unchecked"}
      className={cn(
        "group relative flex cursor-pointer flex-col items-center gap-3 text-center",
        isCompact ? "w-[76px] gap-2.5" : "w-[108px]",
        className,
      )}
    >
      <input
        aria-label={label}
        checked={checked}
        className="peer absolute inset-0 z-10 cursor-pointer opacity-0"
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
          "flex items-center justify-center border border-dashed bg-white transition-[border-color,box-shadow,transform] duration-150 ease-out group-active:translate-y-px peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-black/55 dark:border-foreground/10 dark:bg-card dark:peer-focus-visible:outline-ring",
          isCompact ? "size-[76px]" : "size-[108px]",
          checked
            ? cn(
                "border-2 border-black shadow-[0_0_22px_2px_rgba(0,0,0,0.14),0_5px_10px_1px_rgba(0,0,0,0.1)] group-hover:shadow-[0_0_28px_3px_rgba(0,0,0,0.18),0_6px_14px_1px_rgba(0,0,0,0.12)] dark:border-foreground dark:bg-accent/70",
                useInkDarkShadow
                  ? "dark:shadow-[0_0_22px_2px_rgba(0,0,0,0.08),0_5px_10px_1px_rgba(0,0,0,0.32)] dark:group-hover:shadow-[0_0_28px_3px_rgba(0,0,0,0.10),0_6px_14px_1px_rgba(0,0,0,0.36)]"
                  : "dark:shadow-[0_0_22px_2px_rgba(255,255,255,0.08),0_5px_10px_1px_rgba(0,0,0,0.32)] dark:group-hover:shadow-[0_0_28px_3px_rgba(255,255,255,0.10),0_6px_14px_1px_rgba(0,0,0,0.36)]",
              )
            : cn(
                "border border-[#00000017] shadow-[0_0_10px_0_rgba(0,0,0,0.08),0_2px_4px_0_rgba(0,0,0,0.06)] group-hover:border-[#0000002A] group-hover:shadow-[0_0_16px_1px_rgba(0,0,0,0.1),0_3px_8px_0_rgba(0,0,0,0.08)] group-active:border-[#00000034] group-active:shadow-[0_0_8px_0_rgba(0,0,0,0.08),0_1px_3px_0_rgba(0,0,0,0.08)] dark:border-foreground/10 dark:bg-card dark:group-hover:border-foreground/18 dark:group-hover:bg-muted/40 dark:group-active:border-foreground/14",
                useInkDarkShadow
                  ? "dark:shadow-[0_0_10px_0_rgba(0,0,0,0.04),0_2px_4px_0_rgba(0,0,0,0.28)] dark:group-hover:shadow-[0_0_16px_1px_rgba(0,0,0,0.06),0_3px_8px_0_rgba(0,0,0,0.34)]"
                  : "dark:shadow-[0_0_10px_0_rgba(255,255,255,0.04),0_2px_4px_0_rgba(0,0,0,0.28)] dark:group-hover:shadow-[0_0_16px_1px_rgba(255,255,255,0.06),0_3px_8px_0_rgba(0,0,0,0.34)]",
              ),
        )}
      >
        <span
          data-slot="option-card-motif"
          data-state={checked ? "checked" : "unchecked"}
          className={cn(
            "flex items-center justify-center text-[#4B4F56] dark:text-muted-foreground",
            isCompact ? "size-10" : "size-14",
            motifClassName,
          )}
        >
          {children}
        </span>
      </span>
      <span
        data-slot="option-card-label"
        data-state={checked ? "checked" : "unchecked"}
        className={cn(
          isCompact ? "text-[0.72rem]" : "text-sm",
          "font-medium leading-none",
          checked
            ? "text-[#111111] dark:text-foreground"
            : "text-[#00000073] dark:text-muted-foreground",
          labelClassName,
        )}
      >
        {label}
      </span>
    </label>
  )
}
