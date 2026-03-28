import type { Metadata, Viewport } from "next"
import "./globals.css"
import { Sidebar } from "@/components/layout/Sidebar"
import { ClientProviders } from "@/components/layout/ClientProviders"

export const metadata: Metadata = {
  title: "OpenChamber — Claude Code Control Plane",
  description: "Manage, monitor and review your Claude Code sessions. Open source control panel for Claude Code.",
  metadataBase: new URL("https://openchamber.dev"),
  openGraph: {
    title: "OpenChamber — Claude Code Control Plane",
    description: "57 Sessions. 92 Diffs. Zero Setup. Open source control panel for Claude Code.",
    type: "website",
    siteName: "OpenChamber",
  },
  twitter: {
    card: "summary_large_image",
    title: "OpenChamber — Claude Code Control Plane",
    description: "Open source control panel for Claude Code sessions, diffs and workspaces.",
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/icon-192.png",
  },
}

export const viewport: Viewport = {
  themeColor: "#0a0a0f",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("openchamber-theme");if(t==="light")document.documentElement.setAttribute("data-theme","light");else if(t==="system"&&window.matchMedia("(prefers-color-scheme:light)").matches)document.documentElement.setAttribute("data-theme","light")}catch{}})()`,
          }}
        />
      </head>
      <body className="min-h-screen">
        <ClientProviders>
          <Sidebar />
          <main className="md:ml-56 pb-20 md:pb-0">
            <div className="p-4 md:p-6 max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </ClientProviders>
      </body>
    </html>
  )
}
