import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Tone Fixer — Speak raw. Send polished.",
  description:
    "Dictate your unfiltered reaction. Get back a version that sounds like your actual professional voice — not HR-sanitized corporate-speak.",
  openGraph: {
    title: "Tone Fixer",
    description: "Speak raw. Send polished.",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" style={{ colorScheme: "light only" }}>
      <body>{children}</body>
    </html>
  )
}
