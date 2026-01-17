import { Playfair_Display, JetBrains_Mono, Outfit } from "next/font/google"
import "./globals.css"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { ThemeProvider } from "../components/ThemeProvider"
import type { ReactNode } from "react"

const playfair = Playfair_Display({ 
  subsets: ["latin"],
  variable: "--font-serif",
})

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata = {
  title: "Vasta",
  description: "Hub de presença digital monetizável"
}

type Props = {
  children: ReactNode
}

import { TurnstileProtection } from "../components/TurnstileProtection"
import { AuthProvider } from "../lib/AuthContext"
import { AuthModal } from "../components/AuthModal"

export default function RootLayout({ children }: Props) {
  return (
    <html lang="pt-BR" className={`${playfair.variable} ${jetbrains.variable} ${outfit.variable}`} suppressHydrationWarning>
      <body className="bg-vasta-bg text-vasta-text antialiased font-sans transition-colors duration-300">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <TurnstileProtection />
            {children}
            <AuthModal />
            <SpeedInsights />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

