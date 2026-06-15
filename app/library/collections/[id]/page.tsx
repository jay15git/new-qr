import type { Metadata } from "next"
import localFont from "next/font/local"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import Gallery from "@/components/shadcn-space/blocks/gallery-01/gallery"
import {
  DESKTOP_INSPECTOR_CONTROL_CLASS,
  DESKTOP_INSPECTOR_FG_MUTED,
  DESKTOP_INSPECTOR_PANEL_TITLE_CLASS,
} from "@/features/desktop-shell/components/InspectorControls"
import { LibraryEmptyState } from "@/features/library/components/LibraryEmptyState"
import { LibraryPageShell } from "@/features/library/components/LibraryPageShell"
import {
  getMockCollectionById,
  getMockDesignsForCollection,
} from "@/features/library/model/mock-library"
import { cn } from "@/lib/utils"

const satoshi = localFont({
  src: "../../../../public/Satoshi_Complete/Fonts/WEB/fonts/Satoshi-Variable.woff2",
  display: "swap",
  fallback: ["system-ui", "Arial", "sans-serif"],
  weight: "300 900",
})

type CollectionDetailPageProps = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({
  params,
}: CollectionDetailPageProps): Promise<Metadata> {
  const { id } = await params
  const collection = getMockCollectionById(id)

  return {
    title: collection ? `${collection.name} · Library` : "Collection · Library",
  }
}

export default async function CollectionDetailPage({ params }: CollectionDetailPageProps) {
  const { id } = await params
  const collection = getMockCollectionById(id)

  if (!collection) {
    notFound()
  }

  const designs = getMockDesignsForCollection(id)
  const codeCount = designs.length

  return (
    <LibraryPageShell fontClassName={satoshi.className}>
      <section
        data-slot="library-shell"
        className="mx-auto flex w-full max-w-5xl flex-col gap-5 pt-10"
      >
        <header className="flex flex-col gap-4">
          <Link
            href="/library"
            className={cn(
              "inline-flex h-9 w-fit items-center gap-2 rounded-[6px] px-3 text-[12px] font-semibold",
              DESKTOP_INSPECTOR_CONTROL_CLASS,
            )}
          >
            <ArrowLeft className="size-3.5" />
            Library
          </Link>
          <div className="space-y-1">
            <h1 className={cn(DESKTOP_INSPECTOR_PANEL_TITLE_CLASS, "text-[1.35rem]")}>
              {collection.name}
            </h1>
            <p className={cn("drafting-type-caption", DESKTOP_INSPECTOR_FG_MUTED)}>
              {codeCount} {codeCount === 1 ? "code" : "codes"}
            </p>
          </div>
        </header>

        {designs.length === 0 ? (
          <LibraryEmptyState
            title="This collection is empty"
            description="Add QR codes to this collection from your library."
            actionLabel="Back to library"
            actionHref="/library"
          />
        ) : (
          <Gallery designs={designs} />
        )}
      </section>
    </LibraryPageShell>
  )
}
