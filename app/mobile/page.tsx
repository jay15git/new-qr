import type { Metadata } from "next";

import { FluidTabs } from "@/components/ui/fluid-tabs";

export const metadata: Metadata = {
  title: "Mobile Workspace",
  description: "A mobile-first QR workspace shell.",
};

export default function MobilePage() {
  return (
    <main
      data-slot="mobile-page"
      className="flex min-h-dvh flex-col items-center justify-end bg-transparent"
    >
      <div className="flex w-full flex-col items-start justify-center gap-10 bg-transparent p-4">
        <FluidTabs />
      </div>
    </main>
  );
}
