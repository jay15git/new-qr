import type { Metadata } from "next";
import { FaBell } from "react-icons/fa6";
import { HiCalendarDays } from "react-icons/hi2";
import { MdMailOutline } from "react-icons/md";

import { DiscreteTabs } from "@/components/ui/discrete-tabs";

export const metadata: Metadata = {
  title: "Mobile Workspace",
  description: "A mobile-first QR workspace shell.",
};

const mobileTabs = [
  {
    id: "mail",
    icon: <MdMailOutline size={24} />,
    label: "Inbox",
    activeColor: "text-blue-500",
  },
  {
    id: "planner",
    icon: <HiCalendarDays size={24} />,
    label: "Planner",
    activeColor: "text-yellow-500",
  },
  {
    id: "mail2",
    icon: <FaBell size={24} />,
    label: "Alerts",
    activeColor: "text-red-500",
  },
];

export default function MobilePage() {
  return (
    <main
      data-slot="mobile-page"
      className="flex min-h-dvh flex-col items-center justify-end bg-transparent"
    >
      <div className="flex flex-col items-center justify-center gap-10 bg-transparent p-10">
        <DiscreteTabs tabs={mobileTabs} defaultTab="mail" />
      </div>
    </main>
  );
}
