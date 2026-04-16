import type { Metadata } from "next"
import { WandSparklesIcon } from "lucide-react"

import { QrStudio } from "@/components/qr/qr-studio"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = {
  title: "QR Studio",
  description:
    "Build and export styled QR codes with live controls for dots, corners, backgrounds, and logos.",
}

export default function SettingsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <section className="rounded-[calc(var(--radius-3xl)+2px)] border border-border/70 bg-card/80 p-6 shadow-sm backdrop-blur sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex max-w-3xl flex-col gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="secondary">QR Studio</Badge>
                <Badge variant="outline">Next.js + shadcn/ui</Badge>
              </div>
              <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
                  Build polished QR codes with live styling controls.
                </h1>
                <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                  Tune dots, corner geometry, background, logo treatment, and
                  encoding settings in one workspace, then export in the format
                  you need.
                </p>
              </div>
            </div>
            <div className="flex max-w-sm items-start gap-3 rounded-[var(--radius-2xl)] border border-border/70 bg-background/80 p-4 text-sm text-muted-foreground">
              <WandSparklesIcon className="mt-0.5 size-4 text-foreground/70" />
              <p>
                Inspired by the upstream `qr-code-styling` demo, but rebuilt as
                a native shadcn workstation for this repo.
              </p>
            </div>
          </div>
        </section>

        <QrStudio />
      </div>
    </main>
  )
}
