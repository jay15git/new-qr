import type { Metadata } from "next";
import localFont from "next/font/local";
import { DraftingSurface } from "@/components/new/drafting-surface";

const satoshi = localFont({
  src: "../../public/Satoshi_Complete/Fonts/WEB/fonts/Satoshi-Variable.woff2",
  display: "swap",
  fallback: ["system-ui", "Arial", "sans-serif"],
  weight: "300 900",
});

export const metadata: Metadata = {
  title: "New Workspace",
  description:
    "A drafting surface with a unified frame for structured QR workspace layouts.",
};

export default function NewPage() {
  return (
    <main
      data-slot="new-page"
      className={`${satoshi.className} bg-[var(--drafting-page-bg)] p-0 text-[var(--drafting-ink)] sm:px-8 sm:pb-8 sm:pt-8`}
    >
      <DraftingSurface fontClassName={satoshi.className} />
    </main>
  );
}
