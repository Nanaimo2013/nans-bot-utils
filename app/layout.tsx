import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/providers/session-provider"
import { Suspense } from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: "Nans Bot Utils - Discord Bot Management Dashboard",
  description:
    "Professional Discord bot management platform with advanced moderation, economy, leveling, and AI integration",
  generator: "v0.app",
  keywords: ["discord bot", "server management", "moderation", "economy", "leveling"],
  authors: [{ name: "Nan" }],
  openGraph: {
    title: "Nans Bot Utils Dashboard",
    description: "Manage your Discord servers with advanced bot utilities",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <Suspense fallback={null}>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
            <AuthProvider>{children}</AuthProvider>
          </ThemeProvider>
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
