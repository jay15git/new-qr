'use client';

import { Image02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { defineSound, ensureReady } from '@web-kits/audio';
import { AnimatePresence, motion } from 'motion/react';
import { useRef, useState } from 'react';
import useMeasure from 'react-use-measure';

import { GripIcon } from '@/components/ui/grip';
import { LayersIcon } from '@/components/ui/layers';
import { MessageCircleIcon } from '@/components/ui/message-circle';
import { PlayIcon } from '@/components/ui/play';
import { ReceiptTextIcon } from '@/components/ui/receipt-text';
import { BlocksIcon } from '@/components/vendor/animate-ui/icons/blocks';

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

const icons = {
    house: (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={24}
            height={24}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide size-4 fill-current"
            aria-hidden="true"
        >
            <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
            <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        </svg>
    ),
    bell: (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={24}
            height={24}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide size-4 fill-current"
            aria-hidden="true"
        >
            <path d="M10.268 21a2 2 0 0 0 3.464 0" />
            <path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326" />
        </svg>
    ),
    settings: (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={24}
            height={24}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide size-4 fill-current"
            aria-hidden="true"
        >
            <path d="M20 7h-9" />
            <path d="M14 17H5" />
            <circle cx={17} cy={17} r={3} />
            <circle cx={7} cy={7} r={3} />
        </svg>
    ),
    book: (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={24}
            height={24}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide size-4 fill-current"
            aria-hidden="true"
        >
            <path d="M12 7v14" />
            <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />
        </svg>
    ),
    shield: (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={24}
            height={24}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide size-4 fill-current"
            aria-hidden="true"
        >
            <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
            <path d="M12 8v4" />
            <path d="M12 16h.01" />
        </svg>
    ),
    user: (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={24}
            height={24}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide size-4"
            aria-hidden="true"
        >
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx={12} cy={7} r={4} />
        </svg>
    ),
    upgrade: (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={24}
            height={24}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide size-4"
            aria-hidden="true"
        >
            <path d="M12 2a10 10 0 0 1 7.38 16.75" />
            <path d="m16 12-4-4-4 4" />
            <path d="M12 16V8" />
            <path d="M2.5 8.875a10 10 0 0 0-.5 3" />
            <path d="M2.83 16a10 10 0 0 0 2.43 3.4" />
            <path d="M4.636 5.235a10 10 0 0 1 .891-.857" />
            <path d="M8.644 21.42a10 10 0 0 0 7.631-.38" />
        </svg>
    ),
    folder: (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={24}
            height={24}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide size-4"
            aria-hidden="true"
        >
            <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
            <path d="M8 10v4" />
            <path d="M12 10v2" />
            <path d="M16 10v6" />
        </svg>
    ),
    logout: (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={24}
            height={24}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide size-4"
            aria-hidden="true"
        >
            <path d="m16 17 5-5-5-5" />
            <path d="M21 12H9" />
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        </svg>
    ),
    chevron: (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={24}
            height={24}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide size-4"
            aria-hidden="true"
        >
            <path d="m9 18 6-6-6-6" />
        </svg>
    ),
};

const StatusBar = ({ filled, total = 29, color }: { filled: number; total?: number; color?: string }) => (
    <div className="flex h-10 w-full justify-between gap-1">
        {Array.from({ length: total }).map((_, i) => (
            <div
                key={i}
                className="flex h-10 w-0.5 items-center justify-center rounded-full"
                style={{ backgroundColor: i < filled ? color : 'rgba(0,0,0,0.06)' }}
            />
        ))}
    </div>
);

const MenuItem = ({ icon, label }: { icon: React.ReactNode; label: string }) => (
    <div className="hover:bg-black/5 flex h-10 cursor-pointer items-center justify-between gap-2 rounded-xl px-2 text-sm font-medium transition-colors">
        <span className="flex items-center gap-2">
            {icon}
            {label}
        </span>
        <span className="text-black/20">{icons.chevron}</span>
    </div>
);

const ToggleRow = ({ label, on }: { label: string; on: boolean }) => (
    <div className="flex h-9 items-center justify-between px-2">
        <span className="text-sm font-medium">{label}</span>
        <div
            className="relative h-5 w-9 rounded-full transition-colors"
            style={{ backgroundColor: on ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.06)' }}
        >
            <div
                className="absolute top-0.5 h-4 w-4 rounded-full transition-all shadow-sm"
                style={{ left: on ? '18px' : '2px', backgroundColor: on ? '#3b82f6' : '#fff' }}
            />
        </div>
    </div>
);

const NotifRow = ({ dot, title, time }: { dot: string; title: string; time: string }) => (
    <div className="flex items-start gap-2.5 rounded-xl px-2 py-2 hover:bg-black/5 cursor-pointer transition-colors">
        <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: dot }} />
        <div className="flex flex-1 flex-col gap-0.5 min-w-0">
            <span className="text-xs font-medium leading-tight text-zinc-900">{title}</span>
            <span className="text-xs" style={{ color: 'rgba(0,0,0,0.45)' }}>
                {time}
            </span>
        </div>
    </div>
);

const ChangelogRow = ({
    version,
    desc,
    badge,
    badgeColor,
}: {
    version: string;
    desc: string;
    badge?: string;
    badgeColor?: string;
}) => (
    <div className="flex items-start gap-2.5 rounded-xl px-2 py-2 hover:bg-black/5 cursor-pointer transition-colors">
        <span className="mt-0.5 shrink-0 text-[10px] font-mono font-medium" style={{ color: 'rgba(0,0,0,0.4)' }}>
            {version}
        </span>
        <div className="flex flex-1 flex-col gap-0.5 min-w-0">
            <span className="text-xs font-medium leading-tight text-zinc-900">{desc}</span>
            <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: badgeColor }}>
                {badge}
            </span>
        </div>
    </div>
);

const tabs = [
    {
        id: 'content',
        label: 'Content',
        icon: <ReceiptTextIcon size={18} />,
        content: (
            <div className="flex flex-col gap-0.5">
                <MenuItem icon={icons.user} label="profile" />
                <MenuItem icon={icons.upgrade} label="upgrade" />
                <MenuItem icon={icons.folder} label="projects" />
                <MenuItem icon={icons.book} label="documentation" />
                <MenuItem icon={icons.logout} label="logout" />
            </div>
        ),
    },
    {
        id: 'pattern',
        label: 'Pattern',
        icon: <GripIcon size={18} />,
        content: (
            <div className="flex flex-col gap-0">
                <NotifRow dot="#3b82f6" title="New comment on your project" time="2 min ago" />
                <NotifRow dot="#10b981" title="Deploy succeeded — v2.4.1" time="14 min ago" />
                <NotifRow dot="#ef4444" title="Usage limit at 90%" time="1 hr ago" />
                <NotifRow dot="rgba(0,0,0,0.2)" title="Welcome to the team 👋" time="Yesterday" />
            </div>
        ),
    },
    {
        id: 'corners',
        label: 'Corners',
        icon: <BlocksIcon animateOnHover size={18} />,
        content: (
            <div className="flex flex-col gap-0">
                <ToggleRow label="Email notifications" on={true} />
                <ToggleRow label="Two-factor auth" on={true} />
                <ToggleRow label="Dark mode" on={false} />
                <ToggleRow label="Analytics tracking" on={false} />
            </div>
        ),
    },
    {
        id: 'logo',
        label: 'Logo',
        icon: <MessageCircleIcon size={18} />,
        content: (
            <div className="flex flex-col gap-0">
                <ChangelogRow version="v2.5" desc="Animated nav with Framer Motion" badge="new" badgeColor="#059669" />
                <ChangelogRow
                    version="v2.4"
                    desc="Deploy pipeline speed up by 40%"
                    badge="improvement"
                    badgeColor="#2563eb"
                />
                <ChangelogRow version="v2.3" desc="Fixed memory leak in sidebar" badge="fix" badgeColor="#dc2626" />
                <ChangelogRow
                    version="v2.2"
                    desc="Added team collaboration features"
                    badge="new"
                    badgeColor="#059669"
                />
            </div>
        ),
    },
    {
        id: 'shape',
        label: 'Frame',
        icon: (
            <HugeiconsIcon icon={Image02Icon} size={18} color="currentColor" strokeWidth={1.8} />
        ),
        content: (
            <div className="flex flex-col gap-0">
                <div className="space-y-2 p-2">
                    <div
                        className="flex w-full justify-between gap-2 text-xs font-medium"
                        style={{ color: 'rgba(0,0,0,0.5)' }}
                    >
                        <span>API</span>
                        <span style={{ color: '#2563eb' }}>operational</span>
                    </div>
                    <StatusBar filled={25} color="#3b82f6" />
                </div>
                <div className="space-y-2 p-2">
                    <div
                        className="flex w-full justify-between gap-2 text-xs font-medium"
                        style={{ color: 'rgba(0,0,0,0.5)' }}
                    >
                        <span>Build and Deploy</span>
                        <span style={{ color: '#dc2626' }}>system failure</span>
                    </div>
                    <StatusBar filled={15} color="#ef4444" />
                </div>
            </div>
        ),
    },
    {
        id: 'motion',
        label: 'Motion',
        icon: <PlayIcon size={18} />,
        content: (
            <div className="flex flex-col gap-0">
                <ToggleRow label="Email notifications" on={true} />
                <ToggleRow label="Two-factor auth" on={true} />
                <ToggleRow label="Dark mode" on={false} />
                <ToggleRow label="Analytics tracking" on={false} />
            </div>
        ),
    },
    {
        id: 'layers',
        label: 'Layers',
        icon: <LayersIcon size={18} />,
        content: (
            <div className="flex flex-col gap-0.5">
                <MenuItem icon={icons.user} label="profile" />
                <MenuItem icon={icons.upgrade} label="upgrade" />
                <MenuItem icon={icons.folder} label="projects" />
                <MenuItem icon={icons.book} label="documentation" />
                <MenuItem icon={icons.logout} label="logout" />
            </div>
        ),
    },
];

const NAV_H = 50;
const CARD_W = 440;
const COLLAPSED_W = 440;

const slideVariants = {
    enter: (dir: number) => ({ x: dir * 32, opacity: 0, filter: 'blur(4px)' }),
    center: { x: 0, opacity: 1, filter: 'blur(0px)' },
    exit: (dir: number) => ({ x: dir * -32, opacity: 0, filter: 'blur(4px)' }),
};

const SPRING = { type: 'spring' as const, stiffness: 340, damping: 28 };
const EASE = { duration: 0.3, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] };
const SLIDE_T = { duration: 0.24, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] };

export function ExpandableTab() {
    const [activeId, setActiveId] = useState<string | null>('content');
    const [direction, setDirection] = useState(0);
    const prevIdxRef = useRef(0);

    const [ghostRef, { height: contentHeight }] = useMeasure({ debounce: 0 });

    const activeTab = tabs.find((t) => t.id === activeId);
    const isExpanded = activeId !== null;
    const cardHeight = isExpanded ? contentHeight + NAV_H : NAV_H;

    const handleNavClick = async (id: string) => {
        const newIdx = tabs.findIndex((t) => t.id === id);
        if (id === activeId) {
            setActiveId(null as string | null);
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
            {isExpanded && (
                <div
                    aria-hidden="true"
                    style={{
                        position: 'fixed',
                        left: -9999,
                        top: 0,
                        width: CARD_W,
                        pointerEvents: 'none',
                        visibility: 'hidden',
                    }}
                >
                    <div ref={ghostRef} className="p-2">
                        {activeTab?.content}
                    </div>
                </div>
            )}
            <div className="flex h-96 items-end justify-center">
                <motion.div
                    className="bg-white relative mx-auto rounded-3xl border border-zinc-200 shadow-xl shadow-zinc-200/50"
                    style={{ overflow: 'hidden' }}
                    animate={{
                        height: cardHeight,
                        width: isExpanded ? CARD_W : COLLAPSED_W,
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
                            {isExpanded && (
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
                                    className="p-2"
                                >
                                    {activeTab?.content}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div
                        className="bg-white absolute bottom-0 left-0 right-0 p-2 border-t border-zinc-100"
                        style={{ height: NAV_H }}
                    >
                        <div className="flex h-9 w-full items-center justify-center gap-1">
                            {tabs.map((tab) => {
                                const isActive = activeId === tab.id;
                                return (
                                    <motion.button
                                        key={tab.id}
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
                                            {isActive && (
                                                <motion.span
                                                    key={tab.id + '-lbl'}
                                                    initial={{ opacity: 0, width: 0 }}
                                                    animate={{ opacity: 1, width: 'auto' }}
                                                    exit={{ opacity: 0, width: 0 }}
                                                    transition={{
                                                        opacity: { duration: 0.15, ease: 'easeInOut' },
                                                        width: { duration: 0.28, ease: [0.4, 0, 0.2, 1] },
                                                    }}
                                                    className="overflow-hidden leading-4 whitespace-nowrap font-semibold tracking-tight"
                                                >
                                                    {tab.label}
                                                </motion.span>
                                            )}
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

