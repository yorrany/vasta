"use client"

import * as React from "react"
import { Moon, Sun, Laptop } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex items-center gap-1 rounded-full border border-slate-800 bg-slate-900/50 p-1">
         <div className="h-7 w-7 rounded-full bg-slate-800 animate-pulse" />
         <div className="h-7 w-7 rounded-full bg-transparent" />
         <div className="h-7 w-7 rounded-full bg-transparent" />
      </div>
    )
  }

  return (
    <div className="flex items-center rounded-full border border-vasta-border bg-vasta-surface p-1 shadow-sm backdrop-blur-sm">
      <button
        onClick={() => setTheme("light")}
        className={`rounded-full p-2 transition-all ${
          theme === "light"
            ? "bg-vasta-bg text-vasta-primary shadow-sm ring-1 ring-vasta-border"
            : "text-vasta-muted hover:text-vasta-text"
        }`}
        title="Claro"
      >
        <Sun className="h-4 w-4" />
        <span className="sr-only">Tema Claro</span>
      </button>
      <button
        onClick={() => setTheme("dark")}
        className={`rounded-full p-2 transition-all ${
          theme === "dark"
             ? "bg-vasta-bg text-vasta-primary shadow-sm ring-1 ring-vasta-border"
            : "text-vasta-muted hover:text-vasta-text"
        }`}
        title="Escuro"
      >
        <Moon className="h-4 w-4" />
        <span className="sr-only">Tema Escuro</span>
      </button>
      <button
        onClick={() => setTheme("system")}
        className={`rounded-full p-2 transition-all ${
          theme === "system"
             ? "bg-vasta-bg text-vasta-primary shadow-sm ring-1 ring-vasta-border"
            : "text-vasta-muted hover:text-vasta-text"
        }`}
        title="Automático (Sistema)"
      >
        <Laptop className="h-4 w-4" />
        <span className="sr-only">Automático</span>
      </button>
    </div>
  )
}
