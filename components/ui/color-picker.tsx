"use client"

import * as React from "react"
import {
  hslaToHsva,
  hsvaToHex,
  hsvaToHsla,
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
  chrome?: "default" | "embedded"
  onColorChange: (value: string) => void
  size?: number
  value: string
}

type ColorType = "hex" | "hsl" | "rgb"

export default function ColorPicker({
  className,
  chrome = "default",
  onColorChange,
  size = 320,
  value,
}: ColorPickerProps) {
  const [colorType, setColorType] = React.useState<ColorType>("hsl")
  const hsva = toHsvaColor(value)
  const hsl = hsvaToHsla(hsva)
  const rgb = hsvaToRgba(hsva)

  function emitColor(nextColor: Partial<HsvaColor>) {
    const mergedColor = { ...hsva, ...nextColor }
    onColorChange(coerceHexColor(hsvaToHex(mergedColor)))
  }

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
        style={{
          aspectRatio: "4 / 2",
          borderRadius: "0.75rem",
          height: "auto",
          width: "100%",
        }}
        className={cn(
          "overflow-hidden",
          chrome === "default" && "border border-border bg-background",
          chrome === "embedded" && "border border-white/8 bg-white/[0.03]",
        )}
      />
      <Hue
        hue={hsva.h}
        onChange={(newHue) => emitColor(newHue)}
        style={
          {
            "--alpha-pointer-background-color": "hsl(var(--foreground))",
            borderRadius: "0.5rem",
            height: "0.875rem",
            width: "100%",
          } as React.CSSProperties
        }
        className="[&>div:first-child]:overflow-hidden [&>div:first-child]:rounded-lg"
      />

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              className={cn(
                "shrink-0 justify-between uppercase",
                chrome === "embedded" &&
                  "border-white/8 bg-white/[0.03] hover:bg-white/[0.05]",
              )}
              variant="outline"
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
              className="flex"
              value={hsvaToHex(hsva)}
              onChange={(event) => {
                const nextValue = event.target.value.startsWith("#")
                  ? event.target.value
                  : `#${event.target.value}`

                if (/^#[0-9a-f]{6}$/i.test(nextValue)) {
                  onColorChange(nextValue)
                }
              }}
            />
          ) : null}

          {colorType === "hsl" ? (
            <HslColorInput
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

function HslColorInput({
  channels,
  onValueChange,
}: {
  channels: Array<{
    key: "h" | "l" | "s"
    value: string
  }>
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
  onValueChange,
}: {
  channels: Array<{
    key: "b" | "g" | "r"
    value: string
  }>
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
