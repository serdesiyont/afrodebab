import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter"
})

export const metadata: Metadata = {
  title: "AfroDebab LLC | Pan-African Technology Holding Company",
  description: "Empowering African innovation, connecting local markets with the diaspora, and building trusted, scalable digital platforms.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <style>{`
html {
  font-family: ${inter.style.fontFamily};
  --font-sans: ${inter.style.fontFamily};
}
        `}</style>
      </head>
      <body className="dark antialiased">{children}</body>
    </html>
  )
}
