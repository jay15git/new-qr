"use client";

import * as React from "react";
import { useColorPickerContext } from "../context";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type CssInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange"
>;

export const CssInput = React.forwardRef<HTMLInputElement, CssInputProps>(function CssInput(
  { className, ...rest },
  ref,
) {
  const { formatted, setFromString } = useColorPickerContext();
  const [draft, setDraft] = React.useState("");
  const [isEditing, setIsEditing] = React.useState(false);
  const [error, setError] = React.useState(false);
  const value = isEditing || error ? draft : formatted;

  const commit = (value: string) => {
    const ok = setFromString(value.trim());
    setError(!ok);
    setIsEditing(false);
    if (ok) {
      setDraft("");
    } else {
      setDraft(value);
    }
  };

  return (
    <Input
      ref={ref}
      data-slot="color-picker-input"
      type="text"
      spellCheck={false}
      autoComplete="off"
      autoCorrect="off"
      autoCapitalize="off"
      value={value}
      aria-invalid={error || undefined}
      aria-label="Color value"
      onChange={(e) => {
        setIsEditing(true);
        setDraft(e.target.value);
        setError(false);
      }}
      onBlur={(e) => commit(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          commit(e.currentTarget.value);
        } else if (e.key === "Escape") {
          setDraft("");
          setIsEditing(false);
          setError(false);
        }
      }}
      className={cn("h-8 px-2 font-mono text-xs", className)}
      {...rest}
    />
  );
});
