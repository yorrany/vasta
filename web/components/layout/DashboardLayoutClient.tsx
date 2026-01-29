"use client"

import { useState, useRef, useEffect, type ReactNode } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  Menu,
  X,
  Image as ImageIcon,
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
  FileText,
  Layers
} from "lucide-react"
import Image from "next/image"
import { QRCodeSVG } from "qrcode.react"
import { createClient } from "../../lib/supabase/client"
import { useAuth } from "../../lib/AuthContext"
import { VastaLogo } from "../../components/VastaLogo"
import { AppearanceProvider, useAppearance, type AppearanceSettings } from "../../components/providers/AppearanceProvider"
import { DialogProvider, useConfirm } from "../../components/providers/DialogProvider"
import { PreviewMockup } from "./PreviewMockup"

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

function InnerLayout({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const { settings } = useAppearance()
  const { confirm } = useConfirm()
  const supabase = createClient()
  const router = useRouter()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const accountMenuRef = useRef<HTMLDivElement>(null)

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

  return (
    <div className="flex h-screen bg-vasta-bg text-vasta-text overflow-hidden">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

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
            <div className="rounded-2xl bg-vasta-surface-soft p-3 border border-vasta-border/50 shadow-sm">
              <div className="flex gap-2">
                <button
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
                  className={`flex-1 flex items-center justify-center gap-2 rounded-xl border py-2 text-[11px] font-bold transition-all ${copied
                    ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-500"
                    : "bg-vasta-surface border-vasta-border text-vasta-text hover:bg-vasta-border/30"
                    }`}
                  title="Compartilhar Link"
                >
                  <Share2 size={14} className={copied ? "text-emerald-500" : "text-vasta-muted"} />
                  <span>{copied ? 'Copiado' : 'Link'}</span>
                </button>

                <button
                  onClick={() => confirm({
                    title: "Seu QR Code",
                    description: "Escaneie para acessar seu perfil instantaneamente.",
                    variant: 'info',
                    confirmText: "Fechar",
                    cancelText: "",
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
                  className="w-10 flex items-center justify-center rounded-xl border border-vasta-border bg-vasta-surface text-vasta-muted hover:text-vasta-text hover:bg-vasta-border/30 transition-all"
                  title="Ver QR Code"
                >
                  <QrCode size={16} />
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
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-vasta-surface border border-vasta-border overflow-hidden shadow-sm relative">
                  {settings.profileImage ? (
                    <Image 
                      src={settings.profileImage} 
                      alt="Profile" 
                      fill 
                      className="object-cover" 
                      sizes="36px"
                    />
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

          <aside className="hidden w-80 border-l border-vasta-border bg-vasta-surface-soft/30 px-6 py-8 xl:block overflow-y-auto custom-scrollbar">
            <div className="text-xs font-bold uppercase tracking-wider text-vasta-muted mb-6">
              Pré-visualização
            </div>
            <PreviewMockup settings={settings} />
          </aside>
        </main>
      </div>
    </div>
  )
}

export default function DashboardLayoutClient({
  children,
  initialSettings
}: {
  children: ReactNode;
  initialSettings?: AppearanceSettings;
}) {
  return (
    <DialogProvider>
      <AppearanceProvider initialSettings={initialSettings}>
        <InnerLayout>{children}</InnerLayout>
      </AppearanceProvider>
    </DialogProvider>
  )
}
