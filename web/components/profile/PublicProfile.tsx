"use client"

import { useEffect, useState } from "react"
import { createClient } from "../../lib/supabase/client"
import { Loader2, ExternalLink, Camera } from "lucide-react"
import { PremiumLinkCard } from './PremiumLinkCard'
import { VastaLogo } from '../VastaLogo'

type LinkStyle = 'glass' | 'solid' | 'outline'
type SiteTheme = 'adaptive' | 'dark' | 'light' | 'neo' | 'noir' | 'bento' | 'custom'

interface ProfileData {
    username: string
    display_name: string
    bio: string
    profile_image: string
    cover_image: string
    cover_image_credit: string | null
    theme: SiteTheme
    link_style: LinkStyle
    accent_color: string
    bg_color: string | null
    typography: string
}

interface LinkData {
    id: number
    title: string
    url: string
    icon: string | null
    is_active: boolean
}

interface PublicProfileProps {
    username: string
}

export function PublicProfile({ username }: PublicProfileProps) {
    const [profile, setProfile] = useState<ProfileData | null>(null)
    const [links, setLinks] = useState<LinkData[]>([])
    // Products State
    const [products, setProducts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

    const supabase = createClient()

    useEffect(() => {
        async function fetchData() {
            setLoading(true)
            // 1. Get Profile by username
            // Note: We need to make sure username column is searchable.
            // It should be unique.

            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('username', username)
                .single()

            if (profileError || !profileData) {
                console.error("Profile not found or error:", profileError)
                setError(true)
                setLoading(false)
                return
            }

            setProfile(profileData as ProfileData)

            // 2. Get Links
            const { data: linksData } = await supabase
                .from('links')
                .select('*')
                .eq('profile_id', profileData.id)
                .eq('is_active', true)
                .order('display_order', { ascending: true })

            if (linksData) setLinks(linksData)

            // 3. Get Products (Store)
            const { data: productsData } = await supabase
                .from('products')
                .select('*')
                .eq('profile_id', profileData.id)
                .eq('status', 'active')
                .order('created_at', { ascending: false })

            if (productsData) setProducts(productsData)

            // 4. Increment View Count (Fire & Forget)
            // Ideally handled by backend function to avoid spam, but client-side is fine for MVP
            // supabase.rpc('increment_page_view', { page_id: ... })

            setLoading(false)
        }

        if (username) fetchData()
    }, [username])

    if (loading) {
        return <div className="flex h-screen items-center justify-center bg-vasta-bg text-vasta-primary"><Loader2 className="h-10 w-10 animate-spin" /></div>
    }

    if (error || !profile) {
        return (
            <div className="flex h-screen flex-col items-center justify-center bg-vasta-bg text-center p-4">
                <h1 className="text-4xl font-bold text-vasta-text mb-2">404</h1>
                <p className="text-vasta-muted">Perfil não encontrado.</p>
            </div>
        )
    }

    // Styles Injection
    const {
        theme,
        link_style,
        accent_color,
        bg_color,
        typography,
        cover_image,
        cover_image_credit,
        profile_image
    } = profile

    const isDark = theme === 'dark'

    // Map font name to CSS variable (from next/font/google setup in layout.tsx)
    const fontFamilyMap: Record<string, string> = {
        'Inter': 'var(--font-inter)',
        'Poppins': 'var(--font-poppins)',
        'Montserrat': 'var(--font-montserrat)',
        'Outfit': 'var(--font-sans)',
    }

    // Dynamic Styles
    const pageStyle = {
        backgroundColor: bg_color || (theme === 'light' ? '#FAFAF9' : '#0B0E14'),
        color: theme === 'light' ? '#1C1917' : '#F3F4F6',
        fontFamily: theme === 'neo' ? fontFamilyMap['Outfit'] :
            theme === 'noir' ? fontFamilyMap['Montserrat'] :
                theme === 'bento' ? fontFamilyMap['Inter'] :
                    (fontFamilyMap[typography] || fontFamilyMap['Inter'])
    }

    // Theme Logic
    const themeConfig = {
        neo: {
            sidebar: 'bg-white lg:border-r-4 lg:border-black',
            card: 'bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-none',
            avatar: 'rounded-none border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]',
            link: 'bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all rounded-none text-black font-bold',
        },
        noir: {
            sidebar: 'bg-black lg:border-r lg:border-white/10',
            card: 'bg-zinc-900 border border-white/10 shadow-2xl rounded-none',
            avatar: 'rounded-none border border-white/20 grayscale hover:grayscale-0 transition-all duration-500',
            link: 'bg-white/5 border border-white/5 hover:bg-white/10 transition-all rounded-sm text-stone-200 uppercase tracking-widest text-sm backdrop-blur-md',
        },
        bento: {
            sidebar: 'bg-white/80 backdrop-blur-xl lg:border-r lg:border-gray-200',
            card: 'bg-white shadow-[0_20px_40px_rgb(0,0,0,0.08)] rounded-[2.5rem]',
            avatar: 'rounded-[2rem] border-4 border-white shadow-xl',
            link: 'bg-white shadow-sm border border-gray-100 hover:shadow-md hover:scale-[1.01] transition-all rounded-2xl text-gray-700 font-medium',
        }
    }

    const currentThemeConfig = ['neo', 'noir', 'bento'].includes(theme) ? themeConfig[theme as keyof typeof themeConfig] : null

    // Override colors for presets
    if (theme === 'neo') {
        pageStyle.backgroundColor = bg_color || '#FEF3C7' // Yellow
        pageStyle.color = '#000000'
    } else if (theme === 'noir') {
        pageStyle.backgroundColor = bg_color || '#09090b' // Black
        pageStyle.color = '#F5F5F4'
    } else if (theme === 'bento') {
        pageStyle.backgroundColor = bg_color || '#F3F4F6' // Gray
        pageStyle.color = '#1F2937'
    }

    return (
        <div style={pageStyle} className="min-h-screen w-full transition-colors duration-500 overflow-x-hidden flex flex-col lg:flex-row">

            {/* Left Column: Profile Identity - Sticky on Desktop */}
            <aside className={`w-full lg:w-[480px] lg:h-screen lg:sticky lg:top-0 shrink-0 flex flex-col relative z-10 ${currentThemeConfig?.sidebar || 'lg:border-r lg:border-white/5 lg:bg-black/5 lg:backdrop-blur-sm'}`}>
                <div className="flex-1 flex flex-col lg:justify-center p-4 lg:p-8 w-full max-w-lg mx-auto lg:max-w-none h-full">

                    {/* Profile Card */}
                    <div className={`relative overflow-hidden flex-1 flex flex-col ${currentThemeConfig?.card || 'bg-white/5 backdrop-blur-sm lg:rounded-[2.5rem] lg:border lg:border-white/10 lg:shadow-2xl'}`}>
                        {/* Cover */}
                        <div className="h-48 lg:h-64 w-full bg-black/10 relative shrink-0">
                            {cover_image ? (
                                <img src={cover_image} className="h-full w-full object-cover" alt="Cover" />
                            ) : (
                                <div className="h-full w-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20" style={{ backgroundColor: accent_color + '22' }} />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/0 to-black/30" />

                            {/* Credits - Elegant Hover Reveal */}
                            {cover_image_credit && (
                                <div className="absolute bottom-3 right-3 z-30 flex flex-col items-end pointer-events-none">
                                    <div className="group flex items-center bg-black/20 hover:bg-black/80 backdrop-blur-sm border border-white/10 hover:border-white/20 rounded-full py-1.5 px-2 transition-all duration-500 ease-out max-w-[32px] hover:max-w-[280px] overflow-hidden shadow-lg hover:shadow-2xl pointer-events-auto cursor-default">
                                        <Camera className="w-4 h-4 text-white/90 shrink-0" strokeWidth={2} />
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 ml-2.5 flex flex-col leading-none whitespace-nowrap min-w-[140px]">
                                            <span className="text-[10px] text-white/50 font-medium uppercase tracking-wider mb-0.5">Photo by</span>
                                            <div className="text-[11px] text-white font-medium flex gap-1">
                                                {cover_image_credit.includes('|') ? (
                                                    <>
                                                        <a
                                                            href={cover_image_credit.split('|')[1].startsWith('http') ? cover_image_credit.split('|')[1] : `https://www.pexels.com/@${cover_image_credit.split('|')[1]}?utm_source=vasta&utm_medium=referral`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="hover:text-indigo-400 hover:underline transition-colors"
                                                        >
                                                            {cover_image_credit.split('|')[0]}
                                                        </a>
                                                        <span className="text-white/40">on</span>
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
                                                    <span>{cover_image_credit}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Profile Info */}
                        <div className="px-6 lg:px-8 -mt-16 relative z-10 pb-8 flex flex-col items-center lg:items-start flex-1 text-center lg:text-left">
                            {/* Avatar */}
                            <div className="mb-6">
                                <div className={`h-32 w-32 lg:h-40 lg:w-40 overflow-hidden ${currentThemeConfig?.avatar || 'rounded-full border-[6px] shadow-2xl'}`}
                                    style={currentThemeConfig ? {} : { borderColor: pageStyle.backgroundColor }}
                                >
                                    {profile_image ? (
                                        <img src={profile_image} className="h-full w-full object-cover" alt={profile.display_name} />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center bg-gray-200 text-gray-400 font-bold text-2xl uppercase">
                                            {profile.username.slice(0, 2)}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Text Info */}
                            <div className="w-full">
                                <h1 className="text-3xl lg:text-4xl font-bold tracking-tight mb-3 lg:mb-4">{profile.display_name || `@${profile.username}`}</h1>
                                {profile.bio && (
                                    <p className="text-sm lg:text-base opacity-80 leading-relaxed max-w-xs mx-auto lg:mx-0 font-medium">{profile.bio}</p>
                                )}
                            </div>

                            {/* Desktop Footer in Sidebar */}
                            <div className="hidden lg:flex mt-auto pt-12 items-center gap-2 opacity-30 hover:opacity-100 transition-opacity">
                                <a href="https://vasta.pro" target="_blank" rel="noopener noreferrer" className="flex items-center transition-transform hover:scale-105">
                                    <VastaLogo className="h-4 w-auto fill-current" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Right Column: Content Scroll */}
            <main className="flex-1 w-full lg:h-screen lg:overflow-y-auto px-6 py-8 lg:p-16 lg:py-24 space-y-12 pb-32">

                {/* Links Section */}
                <div className="space-y-4 max-w-2xl mx-auto">
                    {links.map((link) => {
                        // Premium Themes (Noir, Neo, Bento)
                        // Uses the specialized component with OG Image Fetching
                        if (currentThemeConfig) {
                            return <PremiumLinkCard key={link.id} link={link} theme={theme as any} themeConfig={currentThemeConfig} />
                        }

                        // Classic Themes (Light, Dark, Adaptive)
                        // Uses the standard Button Layout
                        return (
                            <a
                                key={link.id}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`block w-full p-4 lg:p-5 group relative overflow-hidden rounded-2xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-xl border border-transparent`}
                                style={{
                                    ...(link_style === 'solid' ? { backgroundColor: accent_color, color: '#fff' } : {}),
                                    ...(link_style === 'outline' ? { border: `2px solid ${accent_color}`, color: accent_color } : {}),
                                    ...(link_style === 'glass' ? { backgroundColor: theme === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' } : {}),
                                    // Fallback default
                                    ...(!['solid', 'outline'].includes(link_style) && link_style !== 'glass' ? { backgroundColor: accent_color } : {})
                                }}
                            >
                                <div className="flex items-center justify-between relative z-10">
                                    <span className="font-medium text-lg text-center w-full">{link.title}</span>
                                    <ExternalLink size={16} className="absolute right-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>

                                {/* Hover Effect Light */}
                                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                            </a>
                        )
                    })}

                    {(!links || links.length === 0) && (
                        <div className="text-center opacity-50 py-12">
                            <p>Nenhum link adicionado ainda.</p>
                        </div>
                    )}
                </div>

                {/* Products Section */}
                {products.length > 0 && (
                    <div className="mt-12 lg:mt-0">
                        <h3 className="text-center lg:text-left text-sm font-bold uppercase tracking-widest opacity-50 mb-6 font-sans flex items-center gap-4">
                            <span className="h-px flex-1 bg-current opacity-20 lg:hidden"></span>
                            Loja
                            <span className="h-px flex-1 bg-current opacity-20"></span>
                        </h3>

                        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-2">
                            {products.map((product) => (
                                <div key={product.id} className="relative overflow-hidden rounded-[1.5rem] bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 group cursor-pointer hover:scale-[1.02] transition-transform hover:shadow-xl lg:flex lg:flex-col lg:h-full">
                                    <div className="flex h-24 lg:h-48 lg:flex-col">
                                        {product.image_url && (
                                            <div className="w-24 lg:w-full h-full lg:h-48 shrink-0 bg-gray-100 dark:bg-gray-800">
                                                <img src={product.image_url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={product.title} />
                                            </div>
                                        )}
                                        <div className="p-4 flex flex-col justify-center flex-1 min-w-0 lg:justify-start lg:pt-5">
                                            <h4 className="font-bold text-lg truncate pr-2 leading-tight lg:text-xl lg:whitespace-normal lg:line-clamp-2">{product.title}</h4>
                                            <div className="mt-2 flex items-center justify-between lg:mt-auto">
                                                <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg text-xs lg:text-sm">
                                                    {product.price > 0 ? `R$ ${product.price.toFixed(2).replace('.', ',')}` : 'Grátis'}
                                                </span>
                                                <div className="h-8 w-8 rounded-full bg-vasta-text text-vasta-bg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                                    <ExternalLink size={14} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Mobile Footer */}
                <footer className="mt-16 text-center lg:hidden">
                    <a href="https://vasta.pro" target="_blank" rel="noopener noreferrer" className="inline-flex items-center opacity-40 hover:opacity-100 transition-opacity hover:scale-105">
                        <VastaLogo className="h-4 w-auto fill-current" />
                    </a>
                </footer>

            </main>
        </div>

    )
}
