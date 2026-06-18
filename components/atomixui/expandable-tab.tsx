'use client';

import { defineSound, ensureReady } from '@web-kits/audio';
import { AnimatePresence, motion } from 'motion/react';
import { useRef, useState, type ReactNode } from 'react';
import useMeasure from 'react-use-measure';

const playOpen = defineSound({
    source: { type: 'sine', frequency: 440 },
    envelope: { decay: 0.1 },
    gain: 0.15,
});

const playClose = defineSound({
    source: { type: 'sine', frequency: 880 },
    envelope: { decay: 0.08 },
    gain: 0.15,
});

const slideStart = defineSound({
    source: { type: 'sine', frequency: 400 },
    envelope: { decay: 0.08 },
    gain: 0.08,
});

const slideEnd = defineSound({
    source: { type: 'sine', frequency: 600 },
    envelope: { decay: 0.08 },
    gain: 0.08,
});

export type ExpandableTabItem = {
    id: string;
    label: string;
    icon: ReactNode;
};

export type ExpandableTabProps = {
    tabs: ExpandableTabItem[];
    defaultActiveId?: string | null;
    panelWidth?: number;
    renderPanel: (activeId: string) => ReactNode;
};

const NAV_H = 50;
const DEFAULT_PANEL_WIDTH = 440;

const slideVariants = {
    enter: (dir: number) => ({ x: dir * 32, opacity: 0, filter: 'blur(4px)' }),
    center: { x: 0, opacity: 1, filter: 'blur(0px)' },
    exit: (dir: number) => ({ x: dir * -32, opacity: 0, filter: 'blur(4px)' }),
};

const SPRING = { type: 'spring' as const, stiffness: 340, damping: 28 };
const EASE = { duration: 0.3, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] };
const SLIDE_T = { duration: 0.24, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] };

export function ExpandableTab({
    tabs,
    defaultActiveId = null,
    panelWidth = DEFAULT_PANEL_WIDTH,
    renderPanel,
}: ExpandableTabProps) {
    const [activeId, setActiveId] = useState<string | null>(defaultActiveId);
    const [direction, setDirection] = useState(0);
    const prevIdxRef = useRef(0);

    const [ghostRef, { height: contentHeight }] = useMeasure({ debounce: 0 });

    const panelContent = activeId ? renderPanel(activeId) : null;
    const isExpanded = activeId !== null;
    const cardHeight = isExpanded ? contentHeight + NAV_H : NAV_H;
    const collapsedWidth = panelWidth;

    const handleNavClick = async (id: string) => {
        const newIdx = tabs.findIndex((tab) => tab.id === id);
        if (id === activeId) {
            setActiveId(null);
            await ensureReady();
            playClose();
            return;
        }
        if (activeId === null) {
            await ensureReady();
            playOpen();
        } else {
            await ensureReady();
            slideStart();
            setTimeout(() => slideEnd(), 60);
        }
        setDirection(newIdx > prevIdxRef.current ? 1 : -1);
        prevIdxRef.current = newIdx;
        setActiveId(id);
    };

    return (
        <>
            {isExpanded ? (
                <div
                    aria-hidden="true"
                    style={{
                        position: 'fixed',
                        left: -9999,
                        top: 0,
                        width: panelWidth,
                        pointerEvents: 'none',
                        visibility: 'hidden',
                    }}
                >
                    <div ref={ghostRef} className="p-0">
                        {panelContent}
                    </div>
                </div>
            ) : null}
            <div className="flex h-96 items-end justify-center">
                <motion.div
                    className="relative mx-auto overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-xl shadow-zinc-200/50"
                    style={{ overflow: 'hidden' }}
                    animate={{
                        height: cardHeight,
                        width: isExpanded ? panelWidth : collapsedWidth,
                    }}
                    transition={SPRING}
                >
                    <div
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: NAV_H,
                            overflow: 'hidden',
                        }}
                    >
                        <AnimatePresence custom={direction} initial={false}>
                            {isExpanded ? (
                                <motion.div
                                    key={activeId}
                                    custom={direction}
                                    variants={slideVariants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={SLIDE_T}
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                    }}
                                    className="p-0"
                                >
                                    {panelContent}
                                </motion.div>
                            ) : null}
                        </AnimatePresence>
                    </div>

                    <div
                        className="absolute bottom-0 left-0 right-0 border-t border-zinc-100 bg-white p-2"
                        style={{ height: NAV_H }}
                    >
                        <div className="flex h-9 w-full items-center justify-center gap-1">
                            {tabs.map((tab) => {
                                const isActive = activeId === tab.id;

                                return (
                                    <motion.button
                                        key={tab.id}
                                        type="button"
                                        aria-label={`Open ${tab.label}`}
                                        aria-pressed={isActive}
                                        onClick={() => handleNavClick(tab.id)}
                                        className="relative flex h-full items-center justify-center rounded-2xl text-sm font-semibold"
                                        animate={{
                                            paddingLeft: isActive ? '1rem' : '0.5rem',
                                            paddingRight: isActive ? '1rem' : '0.5rem',
                                            gap: isActive ? '0.5rem' : '0rem',
                                            backgroundColor: isActive ? 'rgba(0,0,0,0.05)' : 'rgba(0,0,0,0)',
                                            color: isActive ? '#18181b' : '#a1a1aa',
                                        }}
                                        transition={EASE}
                                        whileHover={{ color: isActive ? '#18181b' : '#71717a' }}
                                    >
                                        {tab.icon}
                                        <AnimatePresence initial={false}>
                                            {isActive ? (
                                                <motion.span
                                                    key={tab.id + '-lbl'}
                                                    initial={{ opacity: 0, width: 0 }}
                                                    animate={{ opacity: 1, width: 'auto' }}
                                                    exit={{ opacity: 0, width: 0 }}
                                                    transition={{
                                                        opacity: { duration: 0.15, ease: 'easeInOut' },
                                                        width: { duration: 0.28, ease: [0.4, 0, 0.2, 1] },
                                                    }}
                                                    className="overflow-hidden whitespace-nowrap leading-4 font-semibold tracking-tight"
                                                >
                                                    {tab.label}
                                                </motion.span>
                                            ) : null}
                                        </AnimatePresence>
                                    </motion.button>
                                );
                            })}
                        </div>
                    </div>
                </motion.div>
            </div>
        </>
    );
}
