"use client";

import { useState, type ReactNode, type FC } from "react";
import { Home01Icon, LibraryIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion } from "motion/react";

interface TabItem {
  id: string;
  label: string;
  icon: ReactNode;
}

interface FluidTabsProps {
  tabs?: TabItem[];
  active?: string;
  defaultActive?: string;
  onChange?: (id: string) => void;
  layoutId?: string;
  className?: string;
}

const DEFAULT_TABS: TabItem[] = [
  {
    id: "home",
    label: "Home",
    icon: <HugeiconsIcon icon={Home01Icon} size={22} color="currentColor" strokeWidth={1.8} />,
  },
  {
    id: "library",
    label: "Library",
    icon: <HugeiconsIcon icon={LibraryIcon} size={22} color="currentColor" strokeWidth={1.8} />,
  },
];

export const FluidTabs: FC<FluidTabsProps> = ({
  tabs = DEFAULT_TABS,
  active: activeProp,
  defaultActive = tabs[0]?.id,
  onChange,
  layoutId = "active-pill",
  className,
}) => {
  const [internalActive, setInternalActive] = useState<string>(defaultActive ?? tabs[0]?.id ?? "");
  const isControlled = activeProp !== undefined;
  const active = isControlled ? activeProp : internalActive;

  const handleChange = (id: string) => {
    if (!isControlled) {
      setInternalActive(id);
    }
    onChange?.(id);
  };

  return (
    <div className={`relative flex h-16 w-full max-w-xl items-center gap-1 rounded-full border-[1.6px] border-[#f5f1ebf4] bg-[#F5F1EB] px-1 py-1 transition-colors sm:gap-2 dark:border-neutral-800 dark:bg-neutral-900 ${className ?? ""}`}>
      {tabs.map((tab) => {
        const isActive = active === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => handleChange(tab.id)}
            className="group relative flex h-full flex-1 items-center justify-center rounded-full px-3 outline-none"
          >
            {isActive && (
              <motion.div
                layoutId={layoutId}
                transition={{
                  type: "spring",
                  stiffness: 280,
                  damping: 25,
                  mass: 0.8,
                }}
                className="absolute inset-0 rounded-full border border-[#fefefe]/90 bg-gradient-to-b from-[#fefefe] to-gray-50/80 shadow-xs dark:border-neutral-600/50 dark:from-neutral-700 dark:to-neutral-800/90"
              />
            )}

            <motion.div
              transition={{
                duration: 0.3,
                ease: "easeOut",
              }}
              animate={{
                filter: isActive
                  ? ["blur(0px)", "blur(4px)", "blur(0px)"]
                  : "blur(0px)",
              }}
              className={`relative z-10 flex items-center justify-center gap-1.5 transition-colors duration-200 sm:gap-3 ${
                isActive
                  ? "font-bold text-[#292926] dark:text-white"
                  : "font-semibold text-[#585652] dark:text-neutral-500 group-hover:dark:text-neutral-300"
              }`}
            >
              <motion.div
                animate={{ scale: isActive ? 1.03 : 1 }}
                transition={{
                  scale: { type: "spring", stiffness: 300, damping: 15 },
                }}
                className="flex shrink-0 items-center justify-center"
              >
                {tab.icon}
              </motion.div>

              <span className="text-sm tracking-tight whitespace-nowrap sm:text-base">
                {tab.label}
              </span>
            </motion.div>
          </button>
        );
      })}
    </div>
  );
};
