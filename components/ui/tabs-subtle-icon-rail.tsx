"use client";

import {
  useRef,
  useState,
  useCallback,
  useEffect,
  createContext,
  useContext,
  forwardRef,
  type ReactNode,
  type HTMLAttributes,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { spring } from "@/lib/springs";
import { useProximityHover, type ItemRect } from "@/hooks/use-proximity-hover";

/** Icon visual size (size-11 / size-10). */
const ICON_RAIL_ICON_SIZE_PX = 44;
const ICON_RAIL_ICON_SIZE_MD_PX = 40;
const ICON_RAIL_ICON_SIZE_MD_QUERY = "(max-width: 768px)";

/**
 * Square hitbox stride = icon + former gap-1.5 (6px).
 * Tiles edge-to-edge so proximity + pointer never hit dead zones between icons.
 */
const ICON_RAIL_HITBOX_CLASS = "size-[3.125rem] max-md:size-[2.875rem]";

function toVisualPillRect(rect: ItemRect, iconSize: number): ItemRect {
  const insetY = (rect.height - iconSize) / 2;
  const insetX = (rect.width - iconSize) / 2;
  return {
    top: rect.top + insetY,
    left: rect.left + insetX,
    width: iconSize,
    height: iconSize,
  };
}

function useIconRailIconSize() {
  const [iconSize, setIconSize] = useState(ICON_RAIL_ICON_SIZE_PX);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const media = window.matchMedia(ICON_RAIL_ICON_SIZE_MD_QUERY);
    const update = () => {
      setIconSize(media.matches ? ICON_RAIL_ICON_SIZE_MD_PX : ICON_RAIL_ICON_SIZE_PX);
    };
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return iconSize;
}

interface TabsSubtleIconRailContextValue {
  registerItem: (index: number, element: HTMLElement | null) => void;
  hoveredIndex: number | null;
  selectedIndex: number;
  onSelect: (index: number) => void;
}

const TabsSubtleIconRailContext = createContext<TabsSubtleIconRailContextValue | null>(null);

function useTabsSubtleIconRail() {
  const ctx = useContext(TabsSubtleIconRailContext);
  if (!ctx) {
    throw new Error("TabsSubtleIconRailItem must be used within TabsSubtleIconRail");
  }
  return ctx;
}

interface TabsSubtleIconRailProps extends Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> {
  children: ReactNode;
  onRailPresenceChange?: (present: boolean) => void;
  selectedIndex: number;
  onSelect: (index: number) => void;
  selectedPillClassName?: string;
  hoverPillClassName?: string;
  focusRingClassName?: string;
}

const DEFAULT_SELECTED_PILL = "rounded-full bg-active";
const DEFAULT_HOVER_PILL = "rounded-full bg-active";
const DEFAULT_FOCUS_RING = "rounded-full border border-[#6B97FF]";

const TabsSubtleIconRail = forwardRef<HTMLDivElement, TabsSubtleIconRailProps>(
  (
    {
      children,
      onRailPresenceChange,
      selectedIndex,
      onSelect,
      selectedPillClassName = DEFAULT_SELECTED_PILL,
      hoverPillClassName = DEFAULT_HOVER_PILL,
      focusRingClassName = DEFAULT_FOCUS_RING,
      className,
      onMouseEnter,
      onMouseLeave,
      ...props
    },
    ref,
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const isMouseInside = useRef(false);

    const {
      activeIndex: hoveredIndex,
      setActiveIndex: setHoveredIndex,
      itemRects,
      handlers,
      registerItem,
      measureItems,
    } = useProximityHover(containerRef, { axis: "y" });

    const itemElementsRef = useRef(new Map<number, HTMLElement>());
    const registerItemWithTracking = useCallback(
      (index: number, element: HTMLElement | null) => {
        registerItem(index, element);
        if (element) {
          itemElementsRef.current.set(index, element);
        } else {
          itemElementsRef.current.delete(index);
        }
      },
      [registerItem],
    );

    useEffect(() => {
      measureItems();
    }, [measureItems, children]);

    useEffect(() => {
      const elements = itemElementsRef.current;
      if (elements.size === 0) return;
      if (typeof ResizeObserver === "undefined") {
        measureItems();
        return;
      }
      const ro = new ResizeObserver(() => measureItems());
      elements.forEach((el) => ro.observe(el));
      return () => ro.disconnect();
    }, [measureItems, children]);

    const handleMouseMove = useCallback(
      (e: React.MouseEvent) => {
        isMouseInside.current = true;
        handlers.onMouseMove(e);
      },
      [handlers],
    );

    const handleMouseEnter = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        isMouseInside.current = true;
        onRailPresenceChange?.(true);
        onMouseEnter?.(e);
      },
      [onMouseEnter, onRailPresenceChange],
    );

    const handleMouseLeave = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        isMouseInside.current = false;
        handlers.onMouseLeave();
        onRailPresenceChange?.(false);
        onMouseLeave?.(e);
      },
      [handlers, onMouseLeave, onRailPresenceChange],
    );

    const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
    const iconSize = useIconRailIconSize();

    const selectedRect = selectedIndex >= 0 ? itemRects[selectedIndex] : null;
    const hoverRect = hoveredIndex !== null ? itemRects[hoveredIndex] : null;
    const focusRect = focusedIndex !== null ? itemRects[focusedIndex] : null;
    const selectedPillRect = selectedRect ? toVisualPillRect(selectedRect, iconSize) : null;
    const hoverPillRect = hoverRect ? toVisualPillRect(hoverRect, iconSize) : null;
    const focusPillRect = focusRect ? toVisualPillRect(focusRect, iconSize) : null;
    const isHoveringSelected = hoveredIndex === selectedIndex;
    const isHovering = hoveredIndex !== null && !isHoveringSelected;
    const anchorPillRect = selectedPillRect ?? hoverPillRect;

    return (
      <TabsSubtleIconRailContext.Provider
        value={{
          registerItem: registerItemWithTracking,
          hoveredIndex,
          selectedIndex,
          onSelect,
        }}
      >
        <div
          ref={(node) => {
            (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
            if (typeof ref === "function") ref(node);
            else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
          }}
          data-slot="tabs-subtle-icon-rail"
          onMouseEnter={handleMouseEnter}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onFocus={(e) => {
            const indexAttr = (e.target as HTMLElement)
              .closest("[data-proximity-index]")
              ?.getAttribute("data-proximity-index");
            if (indexAttr != null) {
              const idx = Number(indexAttr);
              setHoveredIndex(idx);
              setFocusedIndex(
                (e.target as HTMLElement).matches(":focus-visible") ? idx : null,
              );
            }
          }}
          onBlur={(e) => {
            if (containerRef.current?.contains(e.relatedTarget as Node)) return;
            setFocusedIndex(null);
            if (isMouseInside.current) return;
            setHoveredIndex(null);
          }}
          onKeyDown={(e) => {
            const items = Array.from(
              containerRef.current?.querySelectorAll("[data-proximity-index]") ?? [],
            ) as HTMLElement[];
            const currentIdx = items.indexOf(e.target as HTMLElement);
            if (currentIdx === -1) return;

            if (["ArrowUp", "ArrowDown"].includes(e.key)) {
              e.preventDefault();
              const next = e.key === "ArrowDown"
                ? (currentIdx + 1) % items.length
                : (currentIdx - 1 + items.length) % items.length;
              items[next]?.focus();
            } else if (e.key === "Home") {
              e.preventDefault();
              items[0]?.focus();
            } else if (e.key === "End") {
              e.preventDefault();
              items[items.length - 1]?.focus();
            }
          }}
          className={cn(
            "relative flex cursor-pointer flex-col items-center gap-0 select-none",
            className,
          )}
          {...props}
        >
          {selectedPillRect ? (
            <motion.div
              data-slot="tabs-subtle-icon-rail-pill"
              data-pill="selected"
              className={cn("absolute pointer-events-none", selectedPillClassName)}
              initial={false}
              animate={{
                left: selectedPillRect.left,
                width: selectedPillRect.width,
                top: selectedPillRect.top,
                height: selectedPillRect.height,
                opacity: isHovering ? 0.8 : 1,
              }}
              transition={{
                ...spring.moderate,
                opacity: { duration: 0.08 },
              }}
            />
          ) : null}

          <AnimatePresence>
            {hoverPillRect && !isHoveringSelected && anchorPillRect ? (
              <motion.div
                data-slot="tabs-subtle-icon-rail-pill"
                data-pill="hover"
                className={cn("absolute pointer-events-none", hoverPillClassName)}
                initial={{
                  left: anchorPillRect.left,
                  width: anchorPillRect.width,
                  top: anchorPillRect.top,
                  height: anchorPillRect.height,
                  opacity: 0,
                }}
                animate={{
                  left: hoverPillRect.left,
                  width: hoverPillRect.width,
                  top: hoverPillRect.top,
                  height: hoverPillRect.height,
                  opacity: 0.4,
                }}
                exit={
                  !isMouseInside.current && anchorPillRect
                    ? {
                        left: anchorPillRect.left,
                        width: anchorPillRect.width,
                        top: anchorPillRect.top,
                        height: anchorPillRect.height,
                        opacity: 0,
                        transition: { ...spring.moderate, opacity: { duration: 0.06 } },
                      }
                    : { opacity: 0, transition: spring.fast.exit }
                }
                transition={{
                  ...spring.fast,
                  opacity: { duration: 0.08 },
                }}
              />
            ) : null}
          </AnimatePresence>

          <AnimatePresence>
            {focusPillRect ? (
              <motion.div
                className={cn("absolute pointer-events-none z-20", focusRingClassName)}
                initial={false}
                animate={{
                  left: focusPillRect.left - 2,
                  top: focusPillRect.top - 2,
                  width: focusPillRect.width + 4,
                  height: focusPillRect.height + 4,
                }}
                exit={{ opacity: 0, transition: spring.fast.exit }}
                transition={{
                  ...spring.fast,
                  opacity: { duration: 0.08 },
                }}
              />
            ) : null}
          </AnimatePresence>

          {children}
        </div>
      </TabsSubtleIconRailContext.Provider>
    );
  },
);

interface TabsSubtleIconRailAccessoryProps extends HTMLAttributes<HTMLButtonElement> {
  index: number;
}

const TabsSubtleIconRailAccessory = forwardRef<HTMLButtonElement, TabsSubtleIconRailAccessoryProps>(
  ({ index, className, onClick, children, ...props }, ref) => {
    const internalRef = useRef<HTMLButtonElement>(null);
    const { registerItem, hoveredIndex } = useTabsSubtleIconRail();

    useEffect(() => {
      registerItem(index, internalRef.current);
      return () => registerItem(index, null);
    }, [index, registerItem]);

    const isHovered = hoveredIndex === index;

    return (
      <button
        ref={(node) => {
          (internalRef as React.MutableRefObject<HTMLButtonElement | null>).current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node;
        }}
        type="button"
        data-proximity-index={index}
        data-active={isHovered ? "" : undefined}
        tabIndex={0}
        onClick={onClick}
        className={cn(ICON_RAIL_ITEM_CLASS, ICON_RAIL_HITBOX_CLASS, className)}
        {...props}
      >
        {children}
      </button>
    );
  },
);

TabsSubtleIconRailAccessory.displayName = "TabsSubtleIconRailAccessory";

interface TabsSubtleIconRailItemProps extends HTMLAttributes<HTMLButtonElement> {
  index: number;
}

const ICON_RAIL_ITEM_CLASS =
  "relative z-10 grid shrink-0 cursor-inherit place-items-center rounded-none border-none bg-transparent text-current outline-none transition-[color] duration-80 ease-out focus-visible:outline-none";

const TabsSubtleIconRailItem = forwardRef<HTMLButtonElement, TabsSubtleIconRailItemProps>(
  ({ index, className, onClick, children, ...props }, ref) => {
    const internalRef = useRef<HTMLButtonElement>(null);
    const { registerItem, hoveredIndex, selectedIndex, onSelect } = useTabsSubtleIconRail();

    useEffect(() => {
      registerItem(index, internalRef.current);
      return () => registerItem(index, null);
    }, [index, registerItem]);

    const isSelected = selectedIndex === index;
    const isHovered = hoveredIndex === index;
    const isActive = isHovered || isSelected;

    return (
      <button
        ref={(node) => {
          (internalRef as React.MutableRefObject<HTMLButtonElement | null>).current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node;
        }}
        type="button"
        data-proximity-index={index}
        data-active={isActive ? "" : undefined}
        data-selected={isSelected ? "" : undefined}
        tabIndex={isSelected ? 0 : -1}
        aria-pressed={isSelected}
        onClick={(event) => {
          onSelect(index);
          onClick?.(event);
        }}
        className={cn(ICON_RAIL_ITEM_CLASS, ICON_RAIL_HITBOX_CLASS, className)}
        {...props}
      >
        <span
          aria-hidden="true"
          data-slot="tabs-subtle-icon-rail-icon"
          className="pointer-events-none grid size-11 max-md:size-10 place-items-center [&_svg]:pointer-events-none"
        >
          {children}
        </span>
      </button>
    );
  },
);

TabsSubtleIconRailItem.displayName = "TabsSubtleIconRailItem";

const TabsSubtleIconRailSeparator = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      aria-hidden="true"
      data-slot="tabs-subtle-icon-rail-separator"
      className={cn(
        "pointer-events-none my-1.5 h-px w-7 shrink-0 bg-white/[0.13]",
        className,
      )}
      {...props}
    />
  ),
);

TabsSubtleIconRailSeparator.displayName = "TabsSubtleIconRailSeparator";

export {
  TabsSubtleIconRail,
  TabsSubtleIconRailAccessory,
  TabsSubtleIconRailItem,
  TabsSubtleIconRailSeparator,
  ICON_RAIL_ITEM_CLASS,
  ICON_RAIL_HITBOX_CLASS,
};
export default TabsSubtleIconRail;
