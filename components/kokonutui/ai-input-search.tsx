"use client";

/**
 * @author: @kokonutui
 * @description: AI Input Search
 * @version: 1.0.0
 * @date: 2025-06-26
 * @license: MIT
 * @website: https://kokonutui.com
 * @github: https://github.com/kokonut-labs/kokonutui
 */

import { Globe, Paperclip, Send } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { useAutoResizeTextarea } from "@/hooks/use-auto-resize-textarea";
import { cn } from "@/lib/utils";

interface AIInputShortcut {
  label: string;
  icon: ReactNode;
}

interface AIInputSearchProps {
  placeholder?: string;
  searchLabel?: string;
  onSubmit?: (value: string) => void;
  className?: string;
  shortcuts?: AIInputShortcut[];
}

export default function AI_Input_Search({
  placeholder = "Search the web...",
  searchLabel = "Search",
  onSubmit,
  className,
  shortcuts,
}: AIInputSearchProps) {
  const [value, setValue] = useState("");
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 52,
    maxHeight: 200,
  });
  const [showSearch, setShowSearch] = useState(true);
  const [isFocused, setIsFocused] = useState(false);
  const [activeShortcut, setActiveShortcut] = useState<string | null>(
    shortcuts?.[0]?.label ?? null
  );
  const resolvedActiveShortcut =
    shortcuts?.find((shortcut) => shortcut.label === activeShortcut)?.label ??
    shortcuts?.[0]?.label ??
    null;

  const handleSubmit = () => {
    onSubmit?.(value);
    setValue("");
    adjustHeight(true);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const handleContainerClick = () => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <div className={cn("w-full py-4", className)}>
      <div className="relative mx-auto w-full max-w-2xl">
        <div
          aria-label="Search input container"
          className={cn(
            "relative flex w-full cursor-text flex-col rounded-xl text-left transition-all duration-200",
            "ring-1 ring-black/10 dark:ring-white/10",
            isFocused && "ring-black/20 dark:ring-white/20"
          )}
          onClick={handleContainerClick}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              handleContainerClick();
            }
          }}
          role="textbox"
          tabIndex={0}
        >
          <div className="max-h-[200px] overflow-y-auto">
            <Textarea
              className="w-full resize-none rounded-xl rounded-b-none border-none bg-black/5 px-4 py-3 leading-[1.2] placeholder:text-black/70 focus-visible:ring-0 dark:bg-white/5 dark:text-white dark:placeholder:text-white/70"
              id="ai-input-04"
              onBlur={handleBlur}
              onChange={(e) => {
                setValue(e.target.value);
                adjustHeight();
              }}
              onFocus={handleFocus}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder={placeholder}
              ref={textareaRef}
              value={value}
            />
          </div>

          <div className="h-12 rounded-b-xl bg-black/5 dark:bg-white/5">
            <div className="absolute bottom-3 left-3 right-14 flex items-center gap-2 overflow-x-auto">
              <label className="cursor-pointer rounded-lg bg-black/5 p-2 dark:bg-white/5">
                <input className="hidden" type="file" />
                <Paperclip className="h-4 w-4 text-black/40 transition-colors hover:text-black dark:text-white/40 dark:hover:text-white" />
              </label>
              {shortcuts?.length ? (
                shortcuts.map((shortcut) => {
                  const isActive = shortcut.label === resolvedActiveShortcut;

                  return (
                    <button
                      key={shortcut.label}
                      aria-label={shortcut.label}
                      aria-pressed={isActive}
                      className={cn(
                        "flex h-8 shrink-0 items-center gap-2 rounded-full border px-1.5 py-1 transition-all",
                        isActive
                          ? "border-sky-400 bg-sky-500/15 text-sky-500"
                          : "border-transparent bg-black/5 text-black/40 hover:text-black dark:bg-white/5 dark:text-white/40 dark:hover:text-white"
                      )}
                      onClick={() => setActiveShortcut(shortcut.label)}
                      onFocus={() => setActiveShortcut(shortcut.label)}
                      onMouseEnter={() => setActiveShortcut(shortcut.label)}
                      type="button"
                    >
                      <div className="flex h-4 w-4 shrink-0 items-center justify-center">
                        <motion.div
                          animate={{
                            scale: isActive ? 1.1 : 1,
                          }}
                          transition={{
                            type: "spring",
                            stiffness: 260,
                            damping: 25,
                          }}
                          whileHover={{
                            scale: 1.1,
                            transition: {
                              type: "spring",
                              stiffness: 300,
                              damping: 10,
                            },
                          }}
                        >
                          {shortcut.icon}
                        </motion.div>
                      </div>
                      <AnimatePresence initial={false}>
                        {isActive ? (
                          <motion.span
                            animate={{
                              width: "auto",
                              opacity: 1,
                            }}
                            className="shrink-0 overflow-hidden whitespace-nowrap text-sky-500 text-sm"
                            exit={{ width: 0, opacity: 0 }}
                            initial={{ width: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            {shortcut.label}
                          </motion.span>
                        ) : null}
                      </AnimatePresence>
                    </button>
                  );
                })
              ) : (
                <button
                  className={cn(
                    "flex h-8 cursor-pointer items-center gap-2 rounded-full border px-1.5 py-1 transition-all",
                    showSearch
                      ? "border-sky-400 bg-sky-500/15 text-sky-500"
                      : "border-transparent bg-black/5 text-black/40 hover:text-black dark:bg-white/5 dark:text-white/40 dark:hover:text-white"
                  )}
                  onClick={() => {
                    setShowSearch(!showSearch);
                  }}
                  type="button"
                >
                  <div className="flex h-4 w-4 shrink-0 items-center justify-center">
                    <motion.div
                      animate={{
                        rotate: showSearch ? 180 : 0,
                        scale: showSearch ? 1.1 : 1,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 25,
                      }}
                      whileHover={{
                        rotate: showSearch ? 180 : 15,
                        scale: 1.1,
                        transition: {
                          type: "spring",
                          stiffness: 300,
                          damping: 10,
                        },
                      }}
                    >
                      <Globe
                        className={cn(
                          "h-4 w-4",
                          showSearch ? "text-sky-500" : "text-inherit"
                        )}
                      />
                    </motion.div>
                  </div>
                  <AnimatePresence>
                    {showSearch && (
                      <motion.span
                        animate={{
                          width: "auto",
                          opacity: 1,
                        }}
                        className="shrink-0 overflow-hidden whitespace-nowrap text-sky-500 text-sm"
                        exit={{ width: 0, opacity: 0 }}
                        initial={{ width: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {searchLabel}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              )}
            </div>
            <div className="absolute right-3 bottom-3">
              <button
                className={cn(
                  "rounded-lg p-2 transition-colors",
                  value
                    ? "bg-sky-500/15 text-sky-500"
                    : "cursor-pointer bg-black/5 text-black/40 hover:text-black dark:bg-white/5 dark:text-white/40 dark:hover:text-white"
                )}
                onClick={handleSubmit}
                type="button"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
