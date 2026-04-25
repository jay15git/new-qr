import type { Metadata } from "next";
import { DraftingSurface } from "@/components/new/drafting-surface";

export const metadata: Metadata = {
  title: "New Workspace",
  description:
    "A drafting surface with a unified frame for structured QR workspace layouts.",
};

export default function NewPage() {
  return (
    <main
      data-slot="new-page"
      className="bg-[var(--drafting-page-bg)] p-0 text-[var(--drafting-ink)] sm:px-8 sm:pb-8 sm:pt-8"
    >
      <DraftingSurface />
    </main>
  );
}
