"use client"

import { useState, createContext, useContext, type ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Menu, X, GripVertical, Image as ImageIcon } from "lucide-react"

// Types for Appearance
export type LinkStyle = 'glass' | 'solid' | 'outline'
export type SiteTheme = 'adaptive' | 'dark' | 'light'

interface AppearanceSettings {
  profileImage: string | null
  coverImage: string | null
  accentColor: string
  bgColor: string | null
  typography: string
  linkStyle: LinkStyle
  theme: SiteTheme
  username: string
  bio: string
}

interface AppearanceContextType {
  settings: AppearanceSettings
  updateSettings: (newSettings: Partial<AppearanceSettings>) => void
}

const AppearanceContext = createContext<AppearanceContextType | undefined>(undefined)

export const useAppearance = () => {
  const context = useContext(AppearanceContext)
  if (!context) throw new Error("useAppearance must be used within AppearanceProvider")
  return context
}

type Props = {
  children: ReactNode
}

const navItems = [
  { href: "/dashboard/links", label: "Links" },
  { href: "/dashboard/aparencia", label: "Aparência" },
  { href: "/dashboard/minha-loja", label: "Minha Loja" },
  { href: "/dashboard/vendas", label: "Vendas" }
]

function SidebarLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname()
  const active = pathname === href

  return (
    <Link
      href={href}
      className={`flex items-center rounded-xl px-3 py-2 text-sm transition-colors ${
        active
          ? "bg-vasta-primary/10 text-vasta-primary font-medium"
          : "text-vasta-muted hover:bg-vasta-surface-soft hover:text-vasta-text"
      }`}
    >
      {label}
    </Link>
  )
}

export default function DashboardLayout({ children }: Props) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [settings, setSettings] = useState<AppearanceSettings>({
    profileImage: null,
    coverImage: null,
    accentColor: "#6366F1", // Default Vasta Primary
    bgColor: null,
    typography: "Inter",
    linkStyle: "glass",
    theme: "adaptive",
    username: "seunome",
    bio: "Sua bio inspiradora"
  })

  const updateSettings = (newSettings: Partial<AppearanceSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }))
  }

  return (
    <AppearanceContext.Provider value={{ settings, updateSettings }}>
      <div className="flex h-screen bg-vasta-bg text-vasta-text overflow-hidden">
        
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div 
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
              onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside 
          className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-vasta-border bg-vasta-surface transition-transform duration-300 md:relative md:translate-x-0 ${
              isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between px-4 py-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-vasta-primary to-vasta-accent shadow-lg shadow-vasta-primary/20">
                  <span className="text-xs font-bold text-white">V</span>
                </div>
                <span className="text-sm font-bold text-vasta-text tracking-tight">vasta.pro</span>
              </div>
              <button 
                  className="text-vasta-muted hover:text-vasta-text md:hidden"
                  onClick={() => setIsSidebarOpen(false)}
              >
                  <X className="h-5 w-5" />
              </button>
          </div>

          <div className="px-4">
            <div className="rounded-2xl bg-vasta-surface-soft p-4 text-xs border border-vasta-border/50">
              <div className="text-vasta-muted font-medium">Seu link</div>
              <div className="mt-1 text-sm font-bold text-vasta-text">@{settings.username}</div>
              <button className="mt-3 w-full rounded-full bg-vasta-bg border border-vasta-border py-1.5 text-xs font-medium text-vasta-text hover:bg-vasta-border/50 transition-colors">
                Copiar link
              </button>
              <button className="mt-2 w-full rounded-full bg-gradient-to-r from-vasta-primary to-vasta-accent py-1.5 text-xs font-bold text-white shadow-md shadow-vasta-primary/20 hover:shadow-lg transition-all">
                Compartilhar
              </button>
            </div>
          </div>
          <nav className="mt-6 flex flex-1 flex-col gap-1 px-4 text-sm">
            {navItems.map(item => (
               <SidebarLink key={item.href} href={item.href} label={item.label} />
            ))}
          </nav>
          <div className="border-t border-vasta-border px-4 py-4 text-xs text-vasta-muted">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-vasta-text">@{settings.username}</div>
                <div className="text-[11px] text-vasta-muted">Plano Free ativo</div>
              </div>
            </div>
          </div>
        </aside>

        <div className="flex flex-1 flex-col min-w-0 bg-vasta-bg">
          <header className="flex items-center justify-between border-b border-vasta-border bg-vasta-surface/80 backdrop-blur-md px-4 py-3 md:px-6 z-30">
            <div className="flex items-center gap-4">
                <button 
                  className="text-vasta-muted hover:text-vasta-text md:hidden"
                  onClick={() => setIsSidebarOpen(true)}
                >
                  <Menu className="h-6 w-6" />
                </button>
                <div className="text-sm font-bold text-vasta-text">Dashboard</div>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="hidden sm:inline-block rounded-full bg-emerald-500/10 px-2.5 py-1 text-emerald-600 dark:text-emerald-400 font-medium border border-emerald-500/20">
                Pagamentos ativos
              </span>
              <button className="flex items-center gap-2 rounded-full bg-vasta-surface-soft border border-vasta-border px-3 py-1 text-vasta-text hover:bg-vasta-border/50 transition-colors">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="hidden sm:inline font-medium">@{settings.username}</span>
              </button>
            </div>
          </header>
          
          <main className="flex flex-1 overflow-hidden relative">
            <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8 custom-scrollbar">
              {children}
            </div>
            
            {/* Preview Panel */}
            <aside className="hidden w-80 border-l border-vasta-border bg-vasta-surface-soft/30 px-6 py-8 xl:block overflow-y-auto custom-scrollbar">
              <div className="text-xs font-bold uppercase tracking-wider text-vasta-muted mb-6">
                Preview ao vivo
              </div>
              
              <div className="flex justify-center sticky top-0">
                <div 
                  className="relative h-[600px] w-[300px] rounded-[3.5rem] border-8 border-vasta-surface shadow-2xl overflow-hidden transition-all duration-500"
                  style={{ 
                    fontFamily: settings.typography,
                    backgroundColor: settings.bgColor || (settings.theme === 'light' ? '#FAFAF9' : '#0B0E14'),
                    color: settings.theme === 'light' ? '#1C1917' : '#F3F4F6'
                  }}
                >
                   {/* Cover */}
                   <div className="absolute top-0 left-0 right-0 h-32 bg-vasta-surface-soft overflow-hidden">
                      {settings.coverImage ? (
                        <img src={settings.coverImage} className="h-full w-full object-cover" alt="Cover" />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-vasta-primary/20 to-vasta-accent/20" />
                      )}
                   </div>

                   <div className="relative z-10 p-4 flex flex-col items-center pt-20">
                      {/* Avatar */}
                      <div className="h-24 w-24 rounded-full border-4 border-vasta-surface bg-vasta-surface-soft shadow-xl overflow-hidden">
                        {settings.profileImage ? (
                          <img src={settings.profileImage} className="h-full w-full object-cover" alt="Avatar" />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-gradient-to-tr from-vasta-primary to-vasta-accent">
                             <span className="text-xl font-bold text-white uppercase">{settings.username.slice(0,2)}</span>
                          </div>
                        )}
                      </div>

                      <div className="text-center mt-3">
                         <h2 className="text-base font-bold">@{settings.username}</h2>
                         <p className="text-[10px] opacity-60 mt-1 max-w-[200px] line-clamp-2">{settings.bio}</p>
                      </div>

                      {/* Mock Links */}
                      <div className="w-full space-y-3 mt-8">
                        {[1, 2, 3].map((i) => (
                          <div 
                            key={i}
                            className={`flex items-center gap-3 p-3 rounded-2xl transition-all shadow-sm ${
                              settings.linkStyle === 'glass' 
                                ? 'bg-white/10 backdrop-blur-md border border-white/20' 
                                : settings.linkStyle === 'solid'
                                ? 'text-white border-transparent'
                                : 'bg-transparent border-2'
                            }`}
                            style={{ 
                              borderColor: (settings.linkStyle === 'outline' || settings.linkStyle === 'glass') ? settings.accentColor : 'transparent',
                              backgroundColor: settings.linkStyle === 'solid' ? settings.accentColor : undefined,
                              boxShadow: settings.linkStyle === 'glass' ? `0 0 15px ${settings.accentColor}33` : undefined
                            }}
                          >
                             <div className="h-8 w-8 rounded-xl bg-white/20 flex items-center justify-center">
                                <ImageIcon size={16} />
                             </div>
                             <div className="flex-1 h-3 rounded bg-white/20" />
                          </div>
                        ))}
                      </div>

                      {/* Store Mock */}
                      <div className="w-full mt-8 p-4 rounded-[2rem] bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
                         <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] font-bold opacity-50">Minha Loja</span>
                            <div className="h-1.5 w-12 rounded bg-vasta-primary" />
                         </div>
                         <div className="grid grid-cols-2 gap-2">
                            <div className="aspect-square rounded-2xl bg-black/5 dark:bg-white/5" />
                            <div className="aspect-square rounded-2xl bg-black/5 dark:bg-white/5" />
                         </div>
                      </div>
                   </div>

                   {/* Notch */}
                   <div className="absolute top-0 left-1/2 -translate-x-1/2 h-6 w-24 bg-vasta-surface rounded-b-3xl z-50 shadow-inner" />
                </div>
              </div>
            </aside>
          </main>
        </div>
      </div>
    </AppearanceContext.Provider>
  )
}

