"use client"

import { useState, createContext, useContext, useEffect, useRef, type ReactNode } from "react"
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
  Sparkles,
  Share2,
  QrCode,
  Camera,
  FileText,
  Layers // Imported Layers icon
} from "lucide-react"
import { QRCodeSVG } from "qrcode.react"
import { VastaLogo } from "../../components/VastaLogo"
import { createClient } from "../../lib/supabase/client"
import { useAuth } from "../../lib/AuthContext"
import { InstagramFeedSection } from "../../components/profile/InstagramFeedSection"
import { PremiumLinkCard } from "../../components/profile/PremiumLinkCard"
import { PublicCollectionItem } from "../../components/profile/PublicCollectionItem"

import { PlanCode } from "../../lib/plans"

// Types for Appearance
export type LinkStyle = 'glass' | 'solid' | 'outline'
export type SiteTheme = 'adaptive' | 'dark' | 'light' | 'neo' | 'noir' | 'bento' | 'custom'

interface AppearanceSettings {
  profileImage: string | null
  coverImage: string | null
  coverImageCredit: string | null
  backgroundImage: string | null
  backgroundImageCredit: string | null
  accentColor: string
  bgColor: string | null
  typography: string
  linkStyle: LinkStyle
  theme: SiteTheme
  username: string
  displayName: string | null
  bio: string
  planCode?: PlanCode
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

// ... (Dialog types omitted for brevity, they are unchanged)
// Types for Dialog
interface ConfirmOptions {
  title: string
  description: string
  content?: ReactNode
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

// ... (navItems omitted)
const navItems = [
  { href: "/dashboard", label: "Início", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/links", label: "Conteúdo", icon: Layers, exact: false },
  { href: "/dashboard/formularios", label: "Formulários", icon: FileText, exact: false },
  { href: "/dashboard/aparencia", label: "Aparência", icon: ImageIcon, exact: false },
  { href: "/dashboard/minha-loja", label: "Minha Loja", icon: ShoppingBag, exact: false },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3, exact: false },
  { href: "/dashboard/vendas", label: "Vendas", icon: CreditCard, exact: false }
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
  const router = useRouter()
  const pathname = usePathname()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const accountMenuRef = useRef<HTMLDivElement>(null)

  // Click outside to close account menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setIsAccountMenuOpen(false)
      }
    }

    if (isAccountMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    } else {
      document.removeEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isAccountMenuOpen])

  // Dialog State
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
    displayName: null,
    bio: "Sua bio inspiradora",
    backgroundImage: null,
    backgroundImageCredit: null,
    planCode: 'start'
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
        .maybeSingle()

      if (error) {
        console.error("Error fetching profile:", error)
      }

      if (data) {
        // Redirection to onboarding if profile is incomplete
        if (!data.username && !pathname.includes('onboarding')) {
          router.push("/onboarding")
        }

        setSettings({
          profileImage: data.profile_image,
          coverImage: data.cover_image,
          coverImageCredit: data.cover_image_credit || null,
          accentColor: data.accent_color || "#6366F1",
          bgColor: data.bg_color,
          typography: data.typography || "Inter",
          linkStyle: (data.link_style as LinkStyle) || "glass",
          theme: (data.theme as SiteTheme) || "adaptive",
          username: data.username || user.user_metadata?.username || user.email?.split('@')[0] || "seunome",
          displayName: data.display_name || null,
          bio: data.bio || "",
          backgroundImage: data.background_image || null,
          backgroundImageCredit: data.background_image_credit || null,
          planCode: (data.plan_code as PlanCode) || 'start'
        })
      } else {
        // No profile found, redirect to onboarding
        router.push("/onboarding")

        setSettings({
          ...defaultSettings,
          username: user.user_metadata?.username || user.email?.split('@')[0] || "seunome"
        })
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
    if (newSettings.displayName !== undefined) updates.display_name = newSettings.displayName
    if (newSettings.bio !== undefined) updates.bio = newSettings.bio
    if (newSettings.backgroundImage !== undefined) updates.background_image = newSettings.backgroundImage
    if (newSettings.backgroundImageCredit !== undefined) updates.background_image_credit = newSettings.backgroundImageCredit

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
                  {dialogConfig.content && (
                    <div className="py-2 flex justify-center w-full">
                      {dialogConfig.content}
                    </div>
                  )}
                  <div className={`grid gap-3 pt-2 ${dialogConfig.cancelText?.trim() ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    {dialogConfig.cancelText && dialogConfig.cancelText.trim() !== "" && (
                      <button
                        onClick={() => setDialogOpen(false)}
                        className="py-3 rounded-xl font-bold text-sm border border-vasta-border text-vasta-text hover:bg-vasta-surface-soft transition-colors"
                      >
                        {dialogConfig.cancelText}
                      </button>
                    )}
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
              <Link href="/dashboard" className="w-full">
                <img src="/logo.svg" alt="Vasta Logo" className="w-full h-auto dark:hidden" />
                <img src="/logo_branca.svg" alt="Vasta Logo" className="w-full h-auto hidden dark:block" />
              </Link>
              <button
                className="text-vasta-muted hover:text-vasta-text md:hidden"
                onClick={() => setIsSidebarOpen(false)}
                title="Fechar menu lateral"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-2 custom-scrollbar">
              <nav className="flex flex-col gap-1 text-sm">
                {navItems.map(item => (
                  <SidebarLink key={item.href} href={item.href} label={item.label} icon={item.icon} exact={item.exact} />
                ))}
                <div className="my-2 h-px bg-vasta-border/50 mx-2" />
                <SidebarLink href="/" label="Voltar para o site" icon={ArrowUpRight} />
              </nav>

              <div className="mt-8">
                <div className="rounded-2xl bg-vasta-surface-soft p-4 border border-vasta-border/50 shadow-sm">
                  <div className="mb-3">
                    <div className="text-[10px] font-bold text-vasta-muted uppercase tracking-widest">Link Vasta</div>
                    <div className="mt-0.5 text-sm font-black text-vasta-text truncate">@{settings.username}</div>
                  </div>

                  <div className="space-y-2">
                      onClick={() => {
                        const url = `https://vasta.pro/${settings.username}`;
                        if (navigator.share) {
                          navigator.share({
                            title: `Vasta | @${settings.username}`,
                            text: settings.bio || `Confira meu perfil no Vasta!`,
                            url: url,
                          }).catch(console.error);
                        } else {
                          navigator.clipboard.writeText(url);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }
                      }}
                      className={`w-full flex items-center justify-center gap-2 rounded-xl border py-2 text-[11px] font-bold transition-all ${copied
                        ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-500"
                        : "bg-vasta-surface border-vasta-border text-vasta-text hover:bg-vasta-border/30"
                        }`}
                    >
                      <Share2 size={14} className={copied ? "text-emerald-500" : "text-vasta-muted"} />
                      <span>{copied ? 'Copiado!' : 'Compartilhar'}</span>
                    </button>

                    <button
                      onClick={() => confirm({
                        title: "Seu QR Code",
                        description: "Escaneie para acessar seu perfil instantaneamente.",
                        variant: 'info',
                        confirmText: "Fechar",
                        cancelText: "", // Empty to hide cancel button
                        onConfirm: () => { },
                        content: (
                          <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-tr from-vasta-primary to-purple-500 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity" />
                            <div className="relative p-4 bg-white rounded-3xl shadow-2xl flex justify-center w-full max-w-[240px] mx-auto">
                              <QRCodeSVG
                                value={`https://vasta.pro/${settings.username}`}
                                size={200}
                                bgColor="#FFFFFF"
                                fgColor="#000000"
                                level="L"
                                className="w-full h-auto"
                              />
                            </div>
                          </div>
                        )
                      })}
                      className="w-full flex items-center justify-center gap-2 rounded-xl border border-vasta-border bg-vasta-surface py-2 text-[11px] font-bold text-vasta-muted hover:text-vasta-text hover:bg-vasta-border/30 transition-all"
                    >
                      <QrCode size={14} />
                      <span>Ver QR Code</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="border-t border-vasta-border p-3" ref={accountMenuRef}>
              <div className="relative">
                <button
                  onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                  className={`flex w-full items-center justify-between rounded-xl p-2 transition-all hover:bg-vasta-surface-soft ${isAccountMenuOpen ? 'bg-vasta-surface-soft' : ''}`}
                >
                  <div className="flex items-center gap-3 overflow-hidden text-left">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-vasta-surface border border-vasta-border overflow-hidden shadow-sm">
                      {settings.profileImage ? (
                        <img src={settings.profileImage} alt="Profile" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-vasta-primary to-violet-600 text-white font-bold text-xs">
                          {settings.username?.charAt(0).toUpperCase() || <User size={16} />}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-vasta-text">@{settings.username}</p>
                      <p className="truncate text-[10px] text-vasta-muted">
                        {settings.planCode === 'business' ? 'Plano Business' :
                          settings.planCode === 'pro' ? 'Plano Pro' : 'Plano Grátis'}
                      </p>
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

                      {settings.planCode === 'start' && (
                        <button className="group flex w-full items-center gap-2 rounded-lg bg-gradient-to-r from-vasta-text to-stone-800 px-2 py-2 text-xs font-bold text-vasta-bg shadow-sm transition-all hover:opacity-90">
                          <Sparkles size={14} className="text-amber-300" />
                          Fazer Upgrade
                        </button>
                      )}

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
                  title="Abrir menu lateral"
                >
                  <Menu className="h-6 w-6" />
                </button>
                <div className="text-sm font-bold text-vasta-text">Painel</div>
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
                  Pré-visualização
                </div>

                <PreviewMockup settings={settings} />
              </aside>
            </main>
          </div>
        </div>
      </DialogContext.Provider>
    </AppearanceContext.Provider>
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

      const { data: linksData } = await supabase
        .from('links')
        .select('*')
        .eq('profile_id', user.id)
        .eq('is_active', true)
        .order('display_order', { ascending: true })

      if (linksData) setLinks(linksData)

      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .eq('profile_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(4)

      if (productsData) setProducts(productsData)
      setLoading(false)
    }

    fetchData()

    // Realtime subscription
    const channel = supabase.channel('preview-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'links', filter: `profile_id=eq.${user?.id}` }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products', filter: `profile_id=eq.${user?.id}` }, () => fetchData())
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') console.log('Preview subscribed to changes')
      })

    // Custom event for local updates (failsafe)
    const handleLocalUpdate = () => {
      console.log('Received local link update event')
      fetchData()
    }
    window.addEventListener('vasta:link-update', handleLocalUpdate)

    return () => {
      supabase.removeChannel(channel)
      window.removeEventListener('vasta:link-update', handleLocalUpdate)
    }
  }, [user])

  // Theme Logic from PublicProfile
  const theme = settings.theme

  // Map font name to CSS variable
  const fontFamilyMap: Record<string, string> = {
    'Inter': 'var(--font-inter)',
    'Poppins': 'var(--font-poppins)',
    'Montserrat': 'var(--font-montserrat)',
    'Outfit': 'var(--font-sans)',
  }

  const pageStyle = {
    backgroundColor: settings.bgColor || (theme === 'light' ? '#FAFAF9' : '#0B0E14'),
    color: theme === 'light' ? '#1C1917' : '#F3F4F6',
    fontFamily: theme === 'neo' ? fontFamilyMap['Outfit'] :
      theme === 'noir' ? fontFamilyMap['Montserrat'] :
        theme === 'bento' ? fontFamilyMap['Inter'] :
          (fontFamilyMap[settings.typography] || fontFamilyMap['Inter'])
  }

  const themeConfig = {
    neo: {
      sidebar: 'bg-white',
      card: 'bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none',
      avatar: 'rounded-none border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]',
      link: 'bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-none text-black font-bold h-10',
    },
    noir: {
      sidebar: 'bg-black',
      card: 'bg-zinc-900 border border-white/10 shadow-2xl rounded-none',
      avatar: 'rounded-none border border-white/20 grayscale',
      link: 'bg-white/5 border border-white/5 transition-all rounded-sm text-stone-200 uppercase tracking-widest text-[10px] backdrop-blur-md h-12',
    },
    bento: {
      sidebar: 'bg-white/80',
      card: 'bg-white shadow-[0_10px_20px_rgb(0,0,0,0.05)] rounded-[2rem]',
      avatar: 'rounded-[1.5rem] border-2 border-white shadow-lg',
      link: 'bg-white shadow-sm border border-gray-100 rounded-xl text-gray-700 font-medium h-12',
    }
  }

  const currentThemeConfig = ['neo', 'noir', 'bento'].includes(theme) ? themeConfig[theme as keyof typeof themeConfig] : null

  if (theme === 'neo') {
    pageStyle.backgroundColor = settings.bgColor || '#FEF3C7'
    pageStyle.color = '#000000'
  } else if (theme === 'noir') {
    pageStyle.backgroundColor = settings.bgColor || '#09090b'
    pageStyle.color = '#F5F5F4'
  } else if (theme === 'bento') {
    pageStyle.backgroundColor = settings.bgColor || '#F3F4F6'
    pageStyle.color = '#1F2937'
  }

  // Pre-calculate hidden links from collections
  const hiddenLinkIds = new Set<number>();
  links.forEach(link => {
    if (link && link.url && link.url.startsWith('#collection:')) {
      try {
        const data = JSON.parse(link.url.replace('#collection:', ''));
        if (Array.isArray(data.links)) {
          data.links.forEach((id: number) => hiddenLinkIds.add(id));
        }
      } catch (e) { }
    }
  });

  const handleMockupClick = (e: React.MouseEvent) => {
    e.preventDefault();
  }

  return (
    <div className="flex justify-center sticky top-0">
      <div
        className={`relative h-[600px] w-[300px] rounded-[3.5rem] border-8 border-vasta-surface shadow-2xl overflow-hidden transition-all duration-500 overflow-y-auto custom-scrollbar flex flex-col ${currentThemeConfig?.sidebar || ''}`}
        style={pageStyle}
      >
        {/* Cover */}
        <div className="h-32 w-full bg-vasta-surface-soft overflow-hidden shrink-0 relative">
          {settings.coverImage ? (
            <img src={settings.coverImage} className="h-full w-full object-cover" alt="Cover" />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-vasta-primary/20 to-vasta-accent/20" />
          )}
          <div className="absolute inset-0 bg-black/10" />

          {/* Credits - Elegant Hover Reveal (Matches Public Profile) */}
          {settings.coverImageCredit && (
            <div className="absolute bottom-2 right-2 z-30 flex flex-col items-end pointer-events-none">
              <div className="group flex items-center bg-black/20 hover:bg-black/80 backdrop-blur-sm border border-white/10 hover:border-white/20 rounded-full py-1 px-1.5 transition-all duration-500 ease-out max-w-[24px] hover:max-w-[200px] overflow-hidden shadow-lg hover:shadow-2xl pointer-events-auto cursor-default">
                <Camera className="w-3 h-3 text-white/90 shrink-0" strokeWidth={2} />
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 ml-2 flex flex-col leading-none whitespace-nowrap min-w-[120px]">
                  <span className="text-[8px] text-white/50 font-medium uppercase tracking-wider mb-0.5">Foto por</span>
                  <div className="text-[9px] text-white font-medium flex gap-1">
                    {settings.coverImageCredit.includes('|') ? (
                      <>
                        <a
                          href={settings.coverImageCredit.split('|')[1].startsWith('http') ? settings.coverImageCredit.split('|')[1] : `https://www.pexels.com/@${settings.coverImageCredit.split('|')[1]}?utm_source=vasta&utm_medium=referral`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-indigo-400 hover:underline transition-colors"
                        >
                          {settings.coverImageCredit.split('|')[0]}
                        </a>
                        <span className="text-white/40">no</span>
                        <a
                          href="https://www.pexels.com/?utm_source=vasta&utm_medium=referral"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-indigo-400 hover:underline transition-colors"
                        >
                          Pexels
                        </a>
                      </>
                    ) : (
                      <span>{settings.coverImageCredit}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="relative z-10 p-4 flex flex-col items-center -mt-12">
          {/* Main Card (For specific themes) */}
          <div className={`w-full flex flex-col items-center p-4 mb-4 ${currentThemeConfig?.card || 'bg-white/5 backdrop-blur-sm rounded-[1.5rem] border border-white/10 shadow-xl'}`}>
            {/* Avatar */}
            <div className={`h-20 w-20 shadow-2xl overflow-hidden shrink-0 ${currentThemeConfig?.avatar || 'rounded-full border-[6px]'}`}
              style={{ borderColor: !currentThemeConfig ? (settings.bgColor || (settings.theme === 'light' ? '#FAFAF9' : '#0B0E14')) : undefined }}
            >
              {settings.profileImage ? (
                <img src={settings.profileImage} className="h-full w-full object-cover" alt="Avatar" />
              ) : (
                <div className="flex h-full items-center justify-center bg-gradient-to-tr from-vasta-primary to-vasta-accent">
                  <span className="text-xl font-bold text-white uppercase">{settings.username.slice(0, 2)}</span>
                </div>
              )}
            </div>

            <div className="text-center mt-3 mb-2 px-4">
              <h1 className={`font-bold transition-all ${theme === 'neo' ? 'text-xl uppercase' : theme === 'noir' ? 'text-lg font-serif' : 'text-lg'}`}>
                {settings.displayName || `@${settings.username}`}
              </h1>
              {settings.bio && (
                <p className="text-[10px] opacity-60 mt-1 max-w-[220px] leading-relaxed">
                  {settings.bio}
                </p>
              )}
            </div>
          </div>

          {/* Links */}
          <div className="w-full space-y-3 px-2">
            {links.map((link) => {
              if (hiddenLinkIds.has(link.id)) return null;

              // Collection Rendering
              if (link.url.startsWith('#collection:')) {
                return (
                  <PublicCollectionItem
                    key={link.id}
                    link={link}
                    allLinks={links}
                    theme={theme}
                    themeConfig={currentThemeConfig}
                    linkStyle={settings.linkStyle}
                    accentColor={settings.accentColor}
                    openForm={() => { }}
                    onLinkClick={handleMockupClick}
                    isPreview={true}
                  />
                )
              }

              // Special Rendering for Headers and Text
              if (link.url.startsWith('header://')) {
                const subtitle = link.url.replace('header://', '')
                return (
                  <div key={link.id} className="text-center w-full pt-4 pb-2">
                    <h2 className="text-lg font-bold" style={{ color: pageStyle.color }}>
                      {link.title}
                    </h2>
                    {subtitle && (
                      <p className="text-[10px] opacity-70 mt-1 max-w-[200px] mx-auto leading-relaxed" style={{ color: pageStyle.color }}>
                        {subtitle}
                      </p>
                    )}
                  </div>
                )
              }

              if (link.url.startsWith('text://')) {
                return (
                  <div key={link.id} className="w-full pb-3 pt-1">
                    <p className="text-[10px] text-center w-full opacity-80 whitespace-pre-wrap leading-relaxed max-w-[220px] mx-auto" style={{ color: pageStyle.color }}>
                      {link.title}
                    </p>
                  </div>
                )
              }

              // Use PremiumLinkCard for themes that support it
              if (currentThemeConfig) {
                return (
                  <div key={link.id}>
                    <PremiumLinkCard
                      link={link}
                      theme={theme as any}
                      themeConfig={currentThemeConfig}
                      onClick={handleMockupClick}
                      isPreview={true}
                    />
                  </div>
                )
              }

              // Standard Logic for Custom/Light/Dark/Adaptive
              return (
                <div
                  key={link.id}
                  className={`group relative flex items-center justify-center transition-all shadow-sm overflow-hidden cursor-default rounded-2xl p-3 h-12`}
                  style={{
                    ...(settings.linkStyle === 'solid' ? { backgroundColor: settings.accentColor, color: '#fff' } : {}),
                    ...(settings.linkStyle === 'outline' ? { border: `2px solid ${settings.accentColor}`, color: settings.accentColor } : {}),
                    ...(settings.linkStyle === 'glass' ? { backgroundColor: settings.theme === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' } : {}),
                    ...(!['solid', 'outline'].includes(settings.linkStyle) && settings.linkStyle !== 'glass' ? { backgroundColor: settings.accentColor, color: '#fff' } : {})
                  }}
                >
                  <div className={`relative z-10 flex-1 px-4 flex flex-col justify-center items-center`}>
                    <span className={`text-[10px] truncate font-bold`}>
                      {link.title}
                    </span>
                  </div>

                  {/* Shine Effect (For non-themed) */}
                  {(settings.linkStyle === 'solid' || settings.linkStyle === 'glass') && (
                    <div className="absolute inset-0 translate-x-[-100%] group-hover:animate-[shine_1s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  )}
                </div>
              )
            })}
          </div>

          {/* Instagram Section */}
          {user && (
            <div className="w-full px-2 mt-4 scale-90 origin-top">
              <InstagramFeedSection userId={user.id} theme={theme} isPreview={true} />
            </div>
          )}

          {/* Store Preview */}
          {products.length > 0 && (
            <div className="w-full mt-8 px-2">
              <h3 className="text-center text-[10px] font-bold uppercase tracking-widest opacity-50 mb-3 font-sans">Loja</h3>
              <div className="grid gap-3">
                {products.map(p => (
                  <div key={p.id} className={`relative overflow-hidden group cursor-default ${currentThemeConfig?.card || 'rounded-[1.25rem] bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10'}`}>
                    <div className="flex h-14">
                      {p.image_url && (
                        <div className="w-14 h-full shrink-0 bg-black/5">
                          <img src={p.image_url} className="w-full h-full object-cover" alt={p.title} />
                        </div>
                      )}
                      <div className="p-2 flex flex-col justify-center flex-1 min-w-0">
                        <p className="font-bold text-[10px] truncate leading-tight">{p.title}</p>
                        <div className="mt-1 flex items-center justify-between">
                          <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded text-[8px]">
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

          {/* Vasta Footer in Mockup */}
          <div className="mt-12 mb-8 opacity-40 text-center flex flex-col items-center">
            <VastaLogo className="h-4 w-auto fill-current" />
          </div>
        </div>

        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-6 w-24 bg-vasta-surface rounded-b-3xl z-50 shadow-inner" />
      </div>
    </div>
  )
}


