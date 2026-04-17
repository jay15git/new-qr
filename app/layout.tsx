import type { Metadata } from "next"
import {
  Bricolage_Grotesque,
  Geist_Mono,
  Manrope,
} from "next/font/google"

import "./globals.css"

const displayFont = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
})

const bodyFont = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
})

const monoFont = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "QR Studio",
  description: "A premium QR studio for branded codes, live refinement, and export.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${displayFont.variable} ${bodyFont.variable} ${monoFont.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  )
}
