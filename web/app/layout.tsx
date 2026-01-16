import { Inter } from "next/font/google"
import "./globals.css"
import type { ReactNode } from "react"

const inter = Inter({ 
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

export default function RootLayout({ children }: Props) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body className="bg-vasta-bg text-vasta-text antialiased font-sans">
        {children}
      </body>
    </html>
  )
}

