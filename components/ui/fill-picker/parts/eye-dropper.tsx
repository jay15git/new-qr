"use client";

import * as React from "react";
import { Pipette } from "lucide-react";
import { useColorPickerContext } from "../context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EyeDropperLike {
  open: (opts?: { signal?: AbortSignal }) => Promise<{ sRGBHex: string }>;
}

type EyeDropperWindow = Window & {
  EyeDropper?: { new (): EyeDropperLike };
};

export type EyeDropperProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export const EyeDropper = React.forwardRef<HTMLButtonElement, EyeDropperProps>(function EyeDropper(
  { className, ...rest },
  ref,
) {
  const { setColor } = useColorPickerContext();
  const [supported, setSupported] = React.useState(false);

  React.useEffect(() => {
    setSupported(
      typeof window !== "undefined" &&
        typeof (window as EyeDropperWindow).EyeDropper === "function",
    );
  }, []);

  if (!supported) return null;

  const onClick = async () => {
    const EyeDropperConstructor = (window as EyeDropperWindow).EyeDropper;

    if (!EyeDropperConstructor) return;

    try {
      const ed = new EyeDropperConstructor();
      const result = await ed.open();
      if (result?.sRGBHex) setColor(result.sRGBHex);
    } catch {
      // user cancelled
    }
  };

  return (
    <Button
      ref={ref}
      data-slot="color-picker-eye-dropper"
      type="button"
      variant="outline"
      size="icon-sm"
      aria-label="Pick color from screen"
      onClick={onClick}
      className={cn("cursor-pointer", className)}
      {...rest}
    >
      <Pipette className="size-4" />
    </Button>
  );
});
