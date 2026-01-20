"use client"

import { useState, createContext, useContext, useEffect, type ReactNode } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  Menu,
  X,
  GripVertical,
  Image as ImageIcon,
  Link as LinkIcon,
  ShoppingBag,
  BarChart3,
  ArrowUpRight,
  User,
  Settings,
  CreditCard,
  LogOut,
  ChevronsUpDown,
  Sparkles
} from "lucide-react"
import { createClient } from "../../lib/supabase/client"
import { useAuth } from "../../lib/AuthContext"

// Types for Appearance
export type LinkStyle = 'glass' | 'solid' | 'outline'
export type SiteTheme = 'adaptive' | 'dark' | 'light'

interface AppearanceSettings {
  profileImage: string | null
  coverImage: string | null
  coverImageCredit: string | null // Added credit field
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

// Types for Dialog
interface ConfirmOptions {
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'info'
  onConfirm: () => void
}

interface DialogContextType {
  confirm: (options: ConfirmOptions) => void
}

const DialogContext = createContext<DialogContextType | undefined>(undefined)

export const useConfirm = () => {
  const context = useContext(DialogContext)
  if (!context) throw new Error("useConfirm must be used within Layout")
  return context
}

type Props = {
  children: ReactNode
}

const navItems = [
  { href: "/dashboard", label: "Início", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/links", label: "Links", icon: LinkIcon, exact: false }, // Renamed from Link to LinkIcon in import to avoid conflict
  { href: "/dashboard/aparencia", label: "Aparência", icon: ImageIcon, exact: false },
  { href: "/dashboard/minha-loja", label: "Minha Loja", icon: ShoppingBag, exact: false },
  { href: "/dashboard/vendas", label: "Vendas", icon: BarChart3, exact: false }
]

function SidebarLink({ href, label, icon: Icon, exact }: { href: string; label: string; icon: any; exact?: boolean }) {
  const pathname = usePathname()
  const active = exact ? pathname === href : pathname.startsWith(href)

  return (
    <Link
      href={href}
      className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200 ${active
          ? "bg-vasta-primary/10 text-vasta-primary font-bold shadow-sm"
          : "text-vasta-muted hover:bg-vasta-surface-soft hover:text-vasta-text"
        }`}
    >
      <Icon className={`h-4 w-4 transition-colors ${active ? "text-vasta-primary" : "text-vasta-muted group-hover:text-vasta-text"}`} />
      <span>{label}</span>
      {active && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-vasta-primary shadow-sm" />}
    </Link>
  )
}

import AuthGuard from "../../components/auth/AuthGuard"

export default function DashboardLayout({ children }: Props) {
  const { user } = useAuth()
  const supabase = createClient()
  const router = useRouter() // Import useRouter from next/navigation
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false)

  // Dialog State (Moved up)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogConfig, setDialogConfig] = useState<ConfirmOptions | null>(null)

  const confirm = (options: ConfirmOptions) => {
    setDialogConfig(options)
    setDialogOpen(true)
  }

  const handleConfirm = () => {
    dialogConfig?.onConfirm()
    setDialogOpen(false)
  }

  // Default settings
  const defaultSettings: AppearanceSettings = {
    profileImage: null,
    coverImage: null,
    coverImageCredit: null,
    accentColor: "#6366F1",
    bgColor: null,
    typography: "Inter",
    linkStyle: "glass",
    theme: "adaptive",
    username: "seunome",
    bio: "Sua bio inspiradora"
  }

  const [settings, setSettings] = useState<AppearanceSettings>(defaultSettings)

  // Fetch initial settings
  useEffect(() => {
    async function fetchProfile() {
      if (!user) return

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle() // Use maybeSingle to avoid 406 if profile doesn't exist

      if (error) {
        console.error("Error fetching profile:", error)
      }

      if (data) {
        setSettings({
          profileImage: data.profile_image,
          coverImage: data.cover_image,
          coverImageCredit: data.cover_image_credit || null,
          accentColor: data.accent_color || "#6366F1",
          bgColor: data.bg_color,
          typography: data.typography || "Inter",
          linkStyle: (data.link_style as LinkStyle) || "glass",
          theme: (data.theme as SiteTheme) || "adaptive",
          username: data.username || "seunome",
          bio: data.bio || ""
        })
      } else {
        console.warn("No profile found for user, using defaults.")
        // Ideally we might want to trigger profile creation here if it's missing
      }
    }
    fetchProfile()
  }, [user])

  const updateSettings = async (newSettings: Partial<AppearanceSettings>) => {
    console.log("updateSettings called with:", newSettings)
    // Optimistic UI update
    setSettings(prev => ({ ...prev, ...newSettings }))

    if (!user) {
      console.error("User not found in updateSettings, skipping DB update")
      return
    }

    // Map frontend settings to DB columns (snake_case)
    const updates: any = {}
    if (newSettings.profileImage !== undefined) updates.profile_image = newSettings.profileImage
    if (newSettings.coverImage !== undefined) updates.cover_image = newSettings.coverImage
    if (newSettings.coverImageCredit !== undefined) updates.cover_image_credit = newSettings.coverImageCredit
    if (newSettings.accentColor !== undefined) updates.accent_color = newSettings.accentColor
    if (newSettings.bgColor !== undefined) updates.bg_color = newSettings.bgColor
    if (newSettings.typography !== undefined) updates.typography = newSettings.typography
    if (newSettings.linkStyle !== undefined) updates.link_style = newSettings.linkStyle
    if (newSettings.theme !== undefined) updates.theme = newSettings.theme
    if (newSettings.username !== undefined) updates.username = newSettings.username
    if (newSettings.bio !== undefined) updates.bio = newSettings.bio

    // Use upsert to create profile if it doesn't exist (though it should)
    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      updated_at: new Date(),
      ...updates
    })

    if (error) {
      console.error('Error updating profile:', error)
      confirm({
        title: "Erro ao salvar",
        description: `Não foi possível salvar as alterações. Detalhes: ${error.message}`,
        variant: 'danger',
        confirmText: "OK",
        onConfirm: () => { }
      })
    } else {
      console.log('Profile updated successfully', updates)
    }
  }

  return (
    <AuthGuard>
      <AppearanceContext.Provider value={{ settings, updateSettings }}>
        <DialogContext.Provider value={{ confirm }}>
          <div className="flex h-screen bg-vasta-bg text-vasta-text overflow-hidden">

            {/* Custom Confirm Dialog */}
            {dialogOpen && dialogConfig && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="w-full max-w-sm rounded-[2rem] bg-vasta-surface border border-vasta-border shadow-2xl overflow-hidden scale-100 animate-in zoom-in-95 duration-200">
                  <div className="p-6 text-center space-y-4">
                    <div className={`mx-auto h-12 w-12 rounded-full flex items-center justify-center ${dialogConfig.variant === 'danger' ? 'bg-red-500/10 text-red-500' : 'bg-vasta-primary/10 text-vasta-primary'}`}>
                      {dialogConfig.variant === 'danger' ? <LogOut size={24} /> : <Sparkles size={24} />}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-vasta-text">{dialogConfig.title}</h3>
                      <p className="text-sm text-vasta-muted mt-2">{dialogConfig.description}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <button
                        onClick={() => setDialogOpen(false)}
                        className="py-3 rounded-xl font-bold text-sm border border-vasta-border text-vasta-text hover:bg-vasta-surface-soft transition-colors"
                      >
                        {dialogConfig.cancelText || "Cancelar"}
                      </button>
                      <button
                        onClick={handleConfirm}
                        className={`py-3 rounded-xl font-bold text-sm text-white shadow-lg transition-all ${dialogConfig.variant === 'danger'
                            ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20'
                            : 'bg-vasta-primary hover:bg-vasta-primary-soft shadow-vasta-primary/20'
                          }`}
                      >
                        {dialogConfig.confirmText || "Confirmar"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
              <div
                className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
                onClick={() => setIsSidebarOpen(false)}
              />
            )}

            {/* Sidebar */}
            <aside
              className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-vasta-border bg-vasta-surface transition-transform duration-300 md:relative md:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
              <div className="flex items-center justify-between px-4 py-4">
                <Link href="/dashboard" className="flex items-center justify-start">
                  <img src="/logo.svg" alt="Vasta Logo" className="w-32 h-auto dark:hidden" />
                  <img src="/logo_branca.svg" alt="Vasta Logo" className="w-32 h-auto hidden dark:block" />
                </Link>
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
                  <a
                    href={`/${settings.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 block text-center w-full rounded-full bg-vasta-bg border border-vasta-border py-1.5 text-xs font-medium text-vasta-text hover:bg-vasta-border/50 transition-colors"
                  >
                    Ver página pública
                  </a>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`https://vasta.pro/${settings.username}`)
                      // Ideally show a toast here
                    }}
                    className="mt-2 w-full rounded-full bg-gradient-to-r from-vasta-primary to-vasta-accent py-1.5 text-xs font-bold text-white shadow-md shadow-vasta-primary/20 hover:shadow-lg transition-all"
                  >
                    Copiar link
                  </button>
                </div>
              </div>
              <nav className="mt-6 flex flex-1 flex-col gap-1 px-4 text-sm">
                {navItems.map(item => (
                  <SidebarLink key={item.href} href={item.href} label={item.label} icon={item.icon} exact={item.exact} />
                ))}
                <div className="my-2 h-px bg-vasta-border/50 mx-2" />
                <SidebarLink href="/" label="Voltar para o site" icon={ArrowUpRight} />
              </nav>
              <div className="border-t border-vasta-border p-3">
                <div className="relative">
                  <button
                    onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                    className={`flex w-full items-center justify-between rounded-xl p-2 transition-all hover:bg-vasta-surface-soft ${isAccountMenuOpen ? 'bg-vasta-surface-soft' : ''}`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden text-left">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-vasta-primary to-violet-600 text-white shadow-md">
                        <User size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-vasta-text">@{settings.username}</p>
                        <p className="truncate text-[10px] text-vasta-muted">Plano Free</p>
                      </div>
                    </div>
                    <ChevronsUpDown className="h-4 w-4 text-vasta-muted" />
                  </button>

                  {/* Dropdown Menu */}
                  {isAccountMenuOpen && (
                    <div className="absolute bottom-full left-0 mb-2 w-full min-w-[240px] origin-bottom rounded-2xl border border-vasta-border bg-vasta-surface p-1.5 shadow-xl animate-in fade-in slide-in-from-bottom-2 z-50">

                      <div className="mb-1 px-2 py-1.5">
                        <p className="text-xs font-bold text-vasta-text">Minha Conta</p>
                        <p className="text-[10px] text-vasta-muted truncate">{user?.email}</p>
                      </div>

                      <div className="space-y-0.5">
                        <Link
                          href="/dashboard/settings"
                          className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-xs font-medium text-vasta-text hover:bg-vasta-surface-soft transition-colors"
                          onClick={() => setIsAccountMenuOpen(false)}
                        >
                          <Settings size={14} className="text-vasta-muted" />
                          Configurações
                        </Link>

                        <Link
                          href="/dashboard/billing"
                          className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-xs font-medium text-vasta-text hover:bg-vasta-surface-soft transition-colors"
                          onClick={() => setIsAccountMenuOpen(false)}
                        >
                          <CreditCard size={14} className="text-vasta-muted" />
                          Assinatura e Cobrança
                        </Link>

                        <div className="my-1 h-px bg-vasta-border/50" />

                        <button className="group flex w-full items-center gap-2 rounded-lg bg-gradient-to-r from-vasta-text to-stone-800 px-2 py-2 text-xs font-bold text-vasta-bg shadow-sm transition-all hover:opacity-90">
                          <Sparkles size={14} className="text-amber-300" />
                          Fazer Upgrade
                        </button>

                        <div className="my-1 h-px bg-vasta-border/50" />

                        <button
                          onClick={async () => {
                            await supabase.auth.signOut()
                            router.push('/')
                          }}
                          className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-xs font-medium text-red-500 hover:bg-red-500/10 transition-colors"
                        >
                          <LogOut size={14} />
                          Sair da conta
                        </button>
                      </div>
                    </div>
                  )}
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
                  <a
                    href={`/${settings.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-full bg-vasta-surface-soft border border-vasta-border px-3 py-1 text-vasta-text hover:bg-vasta-border/50 transition-colors"
                  >
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="hidden sm:inline font-medium">vasta.pro/{settings.username}</span>
                    <ArrowUpRight size={12} className="opacity-50" />
                  </a>
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

                  <PreviewMockup settings={settings} />
                </aside>
              </main>
            </div>
          </div>
        </DialogContext.Provider>
      </AppearanceContext.Provider>
    </AuthGuard>
  )
}

function PreviewMockup({ settings }: { settings: AppearanceSettings }) {
  const { user } = useAuth()
  const supabase = createClient()
  const [links, setLinks] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      if (!user) return

      // Fetch Links
      const { data: linksData } = await supabase
        .from('links')
        .select('*')
        .eq('profile_id', user.id)
        .eq('is_active', true)
        .order('display_order', { ascending: true })

      if (linksData) setLinks(linksData)

      // Fetch Products
      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .eq('profile_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(4) // Limit for preview

      if (productsData) setProducts(productsData)
      setLoading(false)
    }

    fetchData()

    // Real-time simple subscription for updates (Optional improvement)
    const channel = supabase.channel('preview-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'links', filter: `profile_id=eq.${user?.id}` }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products', filter: `profile_id=eq.${user?.id}` }, () => fetchData())
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  return (
    <div className="flex justify-center sticky top-0">
      <div
        className="relative h-[600px] w-[300px] rounded-[3.5rem] border-8 border-vasta-surface shadow-2xl overflow-hidden transition-all duration-500 overflow-y-auto custom-scrollbar"
        style={{
          fontFamily: settings.typography,
          backgroundColor: settings.bgColor || (settings.theme === 'light' ? '#FAFAF9' : '#0B0E14'),
          color: settings.theme === 'light' ? '#1C1917' : '#F3F4F6'
        }}
      >
        {/* Cover */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-vasta-surface-soft overflow-hidden shrink-0">
          {settings.coverImage ? (
            <img src={settings.coverImage} className="h-full w-full object-cover" alt="Cover" />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-vasta-primary/20 to-vasta-accent/20" />
          )}
          <div className="absolute inset-0 bg-black/10" />
          {settings.coverImageCredit && (
            <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/40 backdrop-blur-md rounded text-[7px] text-white/70 pointer-events-auto z-20">
              {settings.coverImageCredit.includes('|') ? (
                <>
                  Photo by{" "}
                  <a
                    href={`https://unsplash.com/@${settings.coverImageCredit.split('|')[1]}?utm_source=vasta&utm_medium=referral`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white hover:underline"
                  >
                    {settings.coverImageCredit.split('|')[0]}
                  </a>
                  {" "}on{" "}
                  <a
                    href="https://unsplash.com/?utm_source=vasta&utm_medium=referral"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white hover:underline"
                  >
                    Unsplash
                  </a>
                </>
              ) : settings.coverImageCredit.includes(':') ? (
                <span>@{settings.coverImageCredit.split(':')[1]}</span>
              ) : (
                <span>{settings.coverImageCredit}</span>
              )}
            </div>
          )}
        </div>

        <div className="relative z-10 p-4 flex flex-col items-center pt-20">
          {/* Avatar */}
          <div className="h-24 w-24 rounded-full border-4 shadow-xl overflow-hidden shrink-0"
            style={{ borderColor: settings.bgColor || (settings.theme === 'light' ? '#FAFAF9' : '#0B0E14') }}
          >
            {settings.profileImage ? (
              <img src={settings.profileImage} className="h-full w-full object-cover" alt="Avatar" />
            ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-tr from-vasta-primary to-vasta-accent">
                <span className="text-xl font-bold text-white uppercase">{settings.username.slice(0, 2)}</span>
              </div>
            )}
          </div>

          <div className="text-center mt-3 mb-6">
            <h2 className="text-base font-bold">@{settings.username}</h2>
            <p className="text-[10px] opacity-60 mt-1 max-w-[200px] leading-relaxed">{settings.bio}</p>
          </div>

          {/* Links */}
          {/* Links */}
          <div className="w-full space-y-3 px-2">
            {links.map((link) => (
              <div
                key={link.id}
                className={`group relative flex items-center justify-center p-3 rounded-2xl transition-all shadow-sm overflow-hidden cursor-default`}
                style={{
                  ...(settings.linkStyle === 'solid' ? { backgroundColor: settings.accentColor, color: '#fff' } : {}),
                  ...(settings.linkStyle === 'outline' ? { border: `2px solid ${settings.accentColor}`, color: settings.accentColor } : {}),
                  ...(settings.linkStyle === 'glass' ? { backgroundColor: settings.theme === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' } : {}),
                  // Fallback default
                  ...(!['solid', 'outline'].includes(settings.linkStyle) && settings.linkStyle !== 'glass' ? { backgroundColor: settings.accentColor, color: '#fff' } : {})
                }}
              >
                <div className="relative z-10 text-center text-xs font-bold truncate px-6">
                  {link.title}
                </div>
                {/* Shine Effect */}
                {(settings.linkStyle === 'solid' || settings.linkStyle === 'glass') && (
                  <div className="absolute inset-0 translate-x-[-100%] group-hover:animate-[shine_1s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                )}
              </div>
            ))}
            {links.length === 0 && !loading && (
              <div className="text-center py-4 opacity-50 text-[10px] uppercase font-bold tracking-widest">
                Sem links
              </div>
            )}
          </div>

          {/* Store Preview */}
          {products.length > 0 && (
            <div className="w-full mt-8 px-2">
              <h3 className="text-center text-[10px] font-bold uppercase tracking-widest opacity-50 mb-3 font-sans">Loja</h3>
              <div className="grid gap-3">
                {products.map(p => (
                  <div key={p.id} className="relative overflow-hidden rounded-[1.25rem] bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 group cursor-default">
                    <div className="flex h-16">
                      {p.image_url && (
                        <div className="w-16 h-full shrink-0 bg-black/5">
                          <img src={p.image_url} className="w-full h-full object-cover" alt={p.title} />
                        </div>
                      )}
                      <div className="p-3 flex flex-col justify-center flex-1 min-w-0">
                        <p className="font-bold text-xs truncate leading-tight">{p.title}</p>
                        <div className="mt-1 flex items-center justify-between">
                          <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded text-[10px]">
                            {p.price > 0 ? `R$ ${p.price.toFixed(2).replace('.', ',')}` : 'Grátis'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-6 w-24 bg-vasta-surface rounded-b-3xl z-50 shadow-inner" />
      </div>
    </div>
  )
}


