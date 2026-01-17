"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { 
  Menu, 
  X, 
  ChevronDown, 
  User, 
  Settings, 
  LogOut, 
  ArrowRight,
  LayoutDashboard
} from "lucide-react"
import { createClient } from "../lib/supabase"
import { useAuth } from "../lib/AuthContext"
import { ThemeToggle } from "./ThemeToggle"

export function Navbar() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  
  const { openAuthModal } = useAuth()
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setIsUserMenuOpen(false)
    router.refresh()
  }

  const navLinks = [
    { name: "Funcionalidades", href: "#features" },
    { name: "Preços", href: "#precos" },
    { name: "Blog", href: "/blog" },
  ]

  const openAuth = (mode: 'login' | 'signup') => {
    openAuthModal(mode)
    setIsMobileMenuOpen(false)
  }

  return (
    <header className="fixed top-0 z-50 w-full border-b border-vasta-border bg-vasta-bg/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6">
        <Link href="/" className="flex items-center transition-opacity hover:opacity-90">
          <img src="/logo.svg" alt="Vasta Logo" className="h-10 w-auto dark:hidden" />
          <img src="/logo_branca.svg" alt="Vasta Logo" className="h-10 w-auto hidden dark:block" />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-10 text-sm font-medium text-vasta-muted md:flex">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.href}
              className="transition-colors hover:text-vasta-text"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden md:block">
            <ThemeToggle />
          </div>
          {!loading && (
            <>
              {user ? (
                <div className="relative">
                  <button 
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 rounded-full border border-vasta-border bg-vasta-surface p-1.5 transition-colors hover:border-vasta-border-dark"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-vasta-primary/20 text-vasta-primary">
                      <User className="h-5 w-5" />
                    </div>
                    <ChevronDown className={`h-4 w-4 text-vasta-muted transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* User Dropdown */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-3 w-56 origin-top-right rounded-2xl border border-vasta-border bg-vasta-surface p-2 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                      <div className="px-3 py-2 text-xs font-bold text-vasta-muted uppercase tracking-widest">
                        Conta
                      </div>
                      <Link 
                        href="/dashboard"
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-vasta-text-soft transition-colors hover:bg-vasta-surface-soft hover:text-vasta-text"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                      </Link>
                      <Link 
                        href="/settings"
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-vasta-text-soft transition-colors hover:bg-vasta-surface-soft hover:text-vasta-text"
                      >
                        <Settings className="h-4 w-4" />
                        Configurações
                      </Link>
                      <div className="my-1 border-t border-vasta-border" />
                      <button 
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-400 transition-colors hover:bg-red-500/10"
                      >
                        <LogOut className="h-4 w-4" />
                        Sair
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-6">
                  <button
                    onClick={() => openAuth('login')}
                    className="hidden text-sm font-bold text-vasta-text transition-colors hover:text-vasta-primary sm:block"
                  >
                    Entrar
                  </button>
                  <button
                    onClick={() => openAuth('signup')}
                    className="group hidden items-center gap-2 rounded-xl bg-vasta-text px-6 py-2.5 text-sm font-bold text-vasta-bg transition-all hover:bg-vasta-text/90 sm:flex shadow-lg shadow-vasta-text/5"
                  >
                    Começar grátis
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              )}
            </>
          )}

          {/* Mobile Menu Toggle */}
          <button 
            className="flex rounded-lg p-2 text-vasta-muted hover:bg-vasta-surface-soft hover:text-vasta-text md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-x-0 top-[73px] z-40 h-screen border-t border-vasta-border bg-vasta-bg/95 p-6 backdrop-blur-xl animate-in slide-in-from-top duration-300 md:hidden">
          <nav className="flex flex-col gap-6">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-lg font-semibold text-vasta-text-soft"
              >
                {link.name}
              </Link>
            ))}
            <div className="mt-4 flex flex-col gap-4 border-t border-vasta-border pt-8">
              <div className="flex justify-center pb-4">
                <ThemeToggle />
              </div>
              {!user && (
                <>
                  <button 
                    onClick={() => openAuth('login')}
                    className="flex items-center justify-between rounded-xl border border-vasta-border p-4 text-vasta-text"
                  >
                    Entrar na minha conta
                    <ArrowRight className="h-5 w-5 opacity-50" />
                  </button>
                  <button 
                    onClick={() => openAuth('signup')}
                    className="flex items-center justify-between rounded-xl bg-vasta-text p-4 font-bold text-vasta-bg"
                  >
                    Começar agora
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </>
              )}
              {user && (
                <Link 
                   href="/dashboard"
                   onClick={() => setIsMobileMenuOpen(false)}
                   className="flex items-center justify-between rounded-xl bg-vasta-primary p-4 font-bold text-white"
                >
                   Ir para o Dashboard
                   <LayoutDashboard className="h-5 w-5" />
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
