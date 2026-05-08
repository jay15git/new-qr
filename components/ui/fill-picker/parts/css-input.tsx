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
  const [draft, setDraft] = React.useState(formatted);
  const [error, setError] = React.useState(false);

  // Sync draft when canonical value changes externally (slider drags etc.)
  React.useEffect(() => {
    setDraft((currentDraft) => (currentDraft === formatted ? currentDraft : formatted));
    setError((currentError) => (currentError ? false : currentError));
  }, [formatted]);

  const commit = (value: string) => {
    const ok = setFromString(value.trim());
    setError(!ok);
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
      value={draft}
      aria-invalid={error || undefined}
      aria-label="Color value"
      onChange={(e) => {
        setDraft(e.target.value);
        setError(false);
      }}
      onBlur={(e) => commit(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          commit(e.currentTarget.value);
        } else if (e.key === "Escape") {
          setDraft(formatted);
          setError(false);
        }
      }}
      className={cn("h-8 px-2 font-mono text-xs", className)}
      {...rest}
    />
  );
});
