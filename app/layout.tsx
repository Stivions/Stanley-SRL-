import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Stanley SRL - Productos Exclusivos",
  description: "Descubre nuestra colección de productos premium. Solicita información personalizada.",
  keywords: "productos, premium, exclusivos, stanley, srl",
  authors: [{ name: "Stivion" }],
  creator: "Stivion",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
  openGraph: {
    title: "Stanley SRL - Productos Exclusivos",
    description: "Descubre nuestra colección de productos premium",
    url: "https://stanley-srl.netlify.app",
    siteName: "Stanley SRL",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Stanley SRL - Productos Exclusivos",
    description: "Descubre nuestra colección de productos premium",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="theme-color" content="#3b82f6" />
      </head>
      <body className={`${inter.className} touch-manipulation`}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
