"use client"

import * as React from "react"
import {
  hslaToHsva,
  hsvaToHex,
  hsvaToHsla,
  hsvaToHslaString,
  hsvaToRgba,
  type HsvaColor,
  rgbaToHsva,
} from "@uiw/color-convert"
import Hue from "@uiw/react-color-hue"
import Saturation from "@uiw/react-color-saturation"
import { ChevronDownIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

import {
  coerceHexColor,
  toHsvaColor,
  updateHslaChannel,
  updateRgbaChannel,
} from "./color-picker-utils"

type ColorPickerProps = {
  className?: string
  chrome?: "default" | "embedded" | "drafting"
  onColorChange: (value: string) => void
  size?: number
  value: string
}

type ColorType = "hex" | "hsl" | "rgb"

const DRAFTING_COLOR_PICKER_CONTROL_CLASS_NAME =
  "rounded-none border-[var(--drafting-line)] bg-[var(--drafting-control-bg)] text-[var(--drafting-ink)] shadow-none hover:border-[var(--drafting-line-hover)] hover:bg-[var(--drafting-control-bg-hover)] hover:text-[var(--drafting-ink)] focus-visible:border-[var(--drafting-line-strong)] focus-visible:ring-0"

export default function ColorPicker({
  className,
  chrome = "default",
  onColorChange,
  size = 320,
  value,
}: ColorPickerProps) {
  const [colorType, setColorType] = React.useState<ColorType>("hsl")
  const isDrafting = chrome === "drafting"
  const externalHexValue = coerceHexColor(value)
  const [hsva, setHsva] = React.useState<HsvaColor>(() => toHsvaColor(externalHexValue))
  const currentHexValue = coerceHexColor(hsvaToHex(hsva))
  const hsl = hsvaToHsla(hsva)
  const rgb = hsvaToRgba(hsva)
  const huePointerColor = hsvaToHslaString({ ...hsva, s: 100, v: 100, a: 1 })

  React.useEffect(() => {
    if (currentHexValue === externalHexValue) {
      return
    }

    setHsva(toHsvaColor(externalHexValue))
  }, [currentHexValue, externalHexValue])

  function emitColor(nextColor: Partial<HsvaColor>) {
    const mergedColor = {
      ...hsva,
      ...nextColor,
      ...(nextColor.h !== undefined
        ? { h: Math.min(359.99, Math.max(0, nextColor.h)) }
        : null),
    }
    setHsva(mergedColor)
    onColorChange(coerceHexColor(hsvaToHex(mergedColor)))
  }

  const saturationPointer = ({ color, left, top }: PickerPointerProps) => (
    <ColorPickerPointer chrome={chrome} color={color} left={left} top={top} />
  )

  const huePointer = ({ left, top }: PickerPointerProps) => (
    <ColorPickerPointer
      chrome={chrome}
      color={huePointerColor}
      left={left}
      top={top}
      variant="bar"
    />
  )

  return (
    <div
      className={cn("space-y-3", className)}
      data-chrome={chrome}
      data-slot="color-picker"
      style={{ maxWidth: size, width: "100%" }}
    >
      <Saturation
        hsva={hsva}
        onChange={(newColor) => emitColor({ ...newColor, a: hsva.a })}
        pointer={saturationPointer}
        style={{
          aspectRatio: "4 / 2",
          borderRadius: isDrafting ? "0" : "0.75rem",
          height: "auto",
          width: "100%",
        }}
        className={cn(
          "overflow-hidden",
          chrome === "default" && "border border-border bg-background",
          chrome === "embedded" && "border border-white/8 bg-white/[0.03]",
          chrome === "drafting" && "bg-transparent",
        )}
      />
      <Hue
        hue={hsva.h}
        onChange={(newHue) => emitColor(newHue)}
        pointer={huePointer}
        style={
          {
            "--alpha-pointer-background-color": "hsl(var(--foreground))",
            ...(isDrafting
              ? {
                  "--alpha-pointer-background-color": "var(--drafting-ink)",
                  "--alpha-pointer-box-shadow": "var(--drafting-shadow-rest)",
                }
              : null),
            borderRadius: isDrafting ? "0" : "0.5rem",
            height: "0.875rem",
            width: "100%",
          } as React.CSSProperties
        }
        className={cn(
          "[&>div:first-child]:overflow-hidden",
          isDrafting
            ? "[&>div:first-child]:rounded-none"
            : "[&>div:first-child]:rounded-lg",
        )}
      />

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              className={cn(
                "shrink-0 justify-between uppercase",
                chrome === "embedded" &&
                  "border-white/8 bg-white/[0.03] hover:bg-white/[0.05]",
                chrome === "drafting" && DRAFTING_COLOR_PICKER_CONTROL_CLASS_NAME,
              )}
              variant={isDrafting ? "ghost" : "outline"}
            >
              {colorType}
              <ChevronDownIcon
                aria-hidden="true"
                className="-me-1 ms-2 opacity-60"
                size={16}
                strokeWidth={2}
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuCheckboxItem
              checked={colorType === "hex"}
              onCheckedChange={() => setColorType("hex")}
            >
              HEX
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={colorType === "hsl"}
              onCheckedChange={() => setColorType("hsl")}
            >
              HSL
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={colorType === "rgb"}
              onCheckedChange={() => setColorType("rgb")}
            >
              RGB
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex grow">
          {colorType === "hex" ? (
            <Input
              className={cn(
                "flex",
                isDrafting && DRAFTING_COLOR_PICKER_CONTROL_CLASS_NAME,
              )}
              value={hsvaToHex(hsva)}
              onChange={(event) => {
                const nextValue = event.target.value.startsWith("#")
                  ? event.target.value
                  : `#${event.target.value}`

                if (/^#[0-9a-f]{6}$/i.test(nextValue)) {
                  const nextHexValue = coerceHexColor(nextValue)
                  setHsva(toHsvaColor(nextHexValue))
                  onColorChange(nextHexValue)
                }
              }}
            />
          ) : null}

          {colorType === "hsl" ? (
            <HslColorInput
              chrome={chrome}
              channels={[
                { key: "h", value: hsl.h.toFixed(0) },
                { key: "s", value: hsl.s.toFixed(0) },
                { key: "l", value: hsl.l.toFixed(0) },
              ]}
              onValueChange={(channel, nextValue) =>
                emitColor(hslaToHsva(updateHslaChannel(hsl, channel, nextValue)))
              }
            />
          ) : null}

          {colorType === "rgb" ? (
            <RgbColorInput
              chrome={chrome}
              channels={[
                { key: "r", value: String(rgb.r) },
                { key: "g", value: String(rgb.g) },
                { key: "b", value: String(rgb.b) },
              ]}
              onValueChange={(channel, nextValue) =>
                emitColor(rgbaToHsva(updateRgbaChannel(rgb, channel, nextValue)))
              }
            />
          ) : null}
        </div>
      </div>
    </div>
  )
}

type PickerPointerProps = {
  chrome?: "default" | "embedded" | "drafting"
  color?: string
  left?: React.CSSProperties["left"]
  top?: React.CSSProperties["top"]
  variant?: "bar" | "surface"
}

function ColorPickerPointer({
  chrome = "default",
  color,
  left,
  top,
  variant = "surface",
}: PickerPointerProps) {
  const isBarPointer = variant === "bar"
  const isDrafting = chrome === "drafting"

  return (
    <div
      style={{
        position: "absolute",
        left,
        top: top ?? (isBarPointer ? "50%" : undefined),
      }}
    >
      <span
        className={cn(
          "pointer-events-none flex size-[18px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[4px] border",
          isDrafting
            ? "border-[var(--drafting-line)] bg-[var(--drafting-panel-bg-active)] shadow-[var(--drafting-shadow-rest)]"
            : "border-black/10 bg-white shadow-[0_1px_4px_rgba(0,0,0,0.15),0_0_0_1px_rgba(0,0,0,0.06)]",
        )}
      >
        <span
          className={cn(
            "size-2.5 rounded-[2px] border",
            isDrafting ? "border-[var(--drafting-line-hover)]" : "border-black/10",
          )}
          style={{ backgroundColor: color ?? (isDrafting ? "var(--drafting-ink)" : "#111111") }}
        />
      </span>
    </div>
  )
}

function HslColorInput({
  channels,
  chrome,
  onValueChange,
}: {
  channels: Array<{
    key: "h" | "l" | "s"
    value: string
  }>
  chrome?: "default" | "embedded" | "drafting"
  onValueChange: (channel: "h" | "l" | "s", nextValue: string) => void
}) {
  return (
    <div className="-mt-px flex w-full">
      {channels.map((channel, index) => (
        <div
          className={cn(
            "relative min-w-0 flex-1 focus-within:z-10",
            index > 0 && "-ms-px",
          )}
          key={channel.key}
        >
          <Input
            className={cn(
              "shadow-none [direction:inherit]",
              chrome === "drafting" && DRAFTING_COLOR_PICKER_CONTROL_CLASS_NAME,
              chrome === "drafting" && index === 0 && "rounded-none",
              chrome === "drafting" &&
                index > 0 &&
                index < channels.length - 1 &&
                "rounded-none",
              chrome === "drafting" &&
                index === channels.length - 1 &&
                "rounded-none",
              index === 0 && "rounded-e-none",
              index > 0 && index < channels.length - 1 && "rounded-none",
              index === channels.length - 1 && "rounded-s-none",
            )}
            value={channel.value}
            onChange={(event) => onValueChange(channel.key, event.target.value)}
          />
        </div>
      ))}
    </div>
  )
}

function RgbColorInput({
  channels,
  chrome,
  onValueChange,
}: {
  channels: Array<{
    key: "b" | "g" | "r"
    value: string
  }>
  chrome?: "default" | "embedded" | "drafting"
  onValueChange: (channel: "b" | "g" | "r", nextValue: string) => void
}) {
  return (
    <div className="-mt-px flex w-full">
      {channels.map((channel, index) => (
        <div
          className={cn(
            "relative min-w-0 flex-1 focus-within:z-10",
            index > 0 && "-ms-px",
          )}
          key={channel.key}
        >
          <Input
            className={cn(
              "shadow-none [direction:inherit]",
              chrome === "drafting" && DRAFTING_COLOR_PICKER_CONTROL_CLASS_NAME,
              chrome === "drafting" && index === 0 && "rounded-none",
              chrome === "drafting" &&
                index > 0 &&
                index < channels.length - 1 &&
                "rounded-none",
              chrome === "drafting" &&
                index === channels.length - 1 &&
                "rounded-none",
              index === 0 && "rounded-e-none",
              index > 0 && index < channels.length - 1 && "rounded-none",
              index === channels.length - 1 && "rounded-s-none",
            )}
            value={channel.value}
            onChange={(event) => onValueChange(channel.key, event.target.value)}
          />
        </div>
      ))}
    </div>
  )
}
