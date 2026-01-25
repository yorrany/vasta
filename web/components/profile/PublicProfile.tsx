"use client"

import { useEffect, useState, useRef } from "react"
import { createClient } from "../../lib/supabase/client"
import { Loader2, ExternalLink, Camera, ShoppingBag, ArrowRight } from "lucide-react"
import { PremiumLinkCard } from './PremiumLinkCard'
import { VastaLogo } from '../VastaLogo'
import { InstagramFeedSection } from './InstagramFeedSection'
import { PublicProductModal } from "../products/PublicProductModal"
import "../../app/globals.css" // Import global styles for Tailwind components

type LinkStyle = 'glass' | 'solid' | 'outline'
type SiteTheme = 'adaptive' | 'dark' | 'light' | 'neo' | 'noir' | 'bento' | 'custom'

interface ProfileData {
    id: string
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
    const [selectedProduct, setSelectedProduct] = useState<any | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const footerRef = useRef<HTMLDivElement>(null)
    const [isFooterVisible, setIsFooterVisible] = useState(false)

    const supabase = createClient()

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsFooterVisible(entry.isIntersecting)
            },
            { threshold: 0.1 }
        )

        if (footerRef.current) {
            observer.observe(footerRef.current)
        }

        return () => {
            if (footerRef.current) {
                observer.unobserve(footerRef.current)
            }
        }
    }, [loading]) // Re-run when loading is done to attach ref

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

    const handleBuyProduct = async (product: any) => {
        try {
            // Check if user is seller (optional, but good UX)
            // Initiate Checkout
            const response = await fetch('/api/store/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId: product.id,
                    profileId: profile?.id
                })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Erro ao processar checkout')
            }

            if (data.url) {
                window.location.href = data.url
            }
        } catch (error: any) {
            console.error('Checkout error:', error)
            alert('Não foi possível iniciar o pagamento. Verifique se o vendedor configurou a conta de recebimento.')
        }
    }

    const openProductDetails = (product: any) => {
        setSelectedProduct(product)
    }



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

    const isDark = ['dark', 'noir'].includes(theme) || (theme === 'adaptive' && !bg_color)

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
            sidebar: 'bg-white border-b-4 border-black',
            card: 'bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-none',
            avatar: 'rounded-none border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]',
            link: 'bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all rounded-none text-black font-bold',
        },
        noir: {
            sidebar: 'bg-black border-b border-white/10',
            card: 'bg-zinc-900 border border-white/10 shadow-2xl rounded-none',
            avatar: 'rounded-none border border-white/20 grayscale hover:grayscale-0 transition-all duration-500',
            link: 'bg-white/5 border border-white/5 hover:bg-white/10 transition-all rounded-sm text-stone-200 uppercase tracking-widest text-sm backdrop-blur-md',
        },
        bento: {
            sidebar: 'bg-white/80 backdrop-blur-xl border-b border-gray-200',
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
        <div style={pageStyle} className="min-h-screen w-full transition-colors duration-500 flex flex-col items-center">

            {/* Profile Identity - Centered Column */}
            <aside className={`w-full max-w-3xl shrink-0 flex flex-col relative z-10 ${currentThemeConfig?.sidebar || 'bg-transparent'}`}>
                <div className="flex-1 flex flex-col items-center p-4 lg:p-8 w-full h-full">

                    {/* Profile Card */}
                    <div className={`relative w-full overflow-hidden flex flex-col ${currentThemeConfig?.card || 'bg-white/5 backdrop-blur-sm rounded-[2rem] border border-white/10 shadow-2xl'}`}>
                        {/* Cover */}
                        <div className="h-48 lg:h-80 w-full bg-black/10 relative shrink-0">
                            {cover_image ? (
                                <img src={cover_image} className="h-full w-full object-cover" alt="Cover" loading="eager" fetchPriority="high" />
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
                        <div className="px-6 lg:px-10 -mt-16 relative z-10 pb-10 flex flex-col items-center text-center">
                            {/* Avatar */}
                            <div className="mb-6">
                                <div className={`h-32 w-32 lg:h-48 lg:w-48 overflow-hidden ${currentThemeConfig?.avatar || 'rounded-full border-[6px] shadow-2xl'}`}
                                    style={currentThemeConfig ? {} : { borderColor: pageStyle.backgroundColor }}
                                >
                                    {profile_image ? (
                                        <img src={profile_image} className="h-full w-full object-cover" alt={profile.display_name} loading="eager" fetchPriority="high" />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center bg-gray-200 text-gray-400 font-bold text-2xl uppercase">
                                            {profile.username.slice(0, 2)}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Text Info */}
                            <div className="w-full max-w-2xl">
                                <h1 className="text-3xl lg:text-5xl font-bold tracking-tight mb-4">{profile.display_name || `@${profile.username}`}</h1>
                                {profile.bio && (
                                    <p className="text-base lg:text-lg opacity-80 leading-relaxed font-medium">{profile.bio}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Content Scroll - Centered Column */}
            <main className="flex-1 w-full max-w-3xl px-4 py-8 lg:px-8 lg:py-12 space-y-12 pb-8">

                {/* Links Section */}
                <div className="w-full mx-auto">
                    {(() => {
                        // Masonry Layout Logic: Group links by sections (Headers break the flow)
                        const renderedContent = [];
                        let currentBuffer: LinkData[] = [];

                        const flushBuffer = (keyPrefix: number) => {
                            if (currentBuffer.length === 0) return null;
                            const bufferCopy = [...currentBuffer];
                            currentBuffer = [];

                            return (
                                <div key={`group-${keyPrefix}`} className="flex flex-col gap-4 w-full">
                                    {bufferCopy.map((link) => (
                                        <div key={link.id} className="break-inside-avoid">
                                            {/* Standard Link Item Render */}
                                            {currentThemeConfig ? (
                                                <PremiumLinkCard link={link} theme={theme as any} themeConfig={currentThemeConfig} />
                                            ) : (
                                                <a
                                                    href={link.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={`block w-full p-4 lg:p-5 group relative overflow-hidden rounded-2xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-xl border border-transparent`}
                                                    style={{
                                                        ...(link_style === 'solid' ? { backgroundColor: accent_color, color: '#fff' } : {}),
                                                        ...(link_style === 'outline' ? { border: `2px solid ${accent_color}`, color: accent_color } : {}),
                                                        ...(link_style === 'glass' ? { backgroundColor: theme === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' } : {}),
                                                        ...(!['solid', 'outline'].includes(link_style) && link_style !== 'glass' ? { backgroundColor: accent_color } : {})
                                                    }}
                                                >
                                                    <div className="flex items-center justify-between relative z-10">
                                                        <span className="font-medium text-lg text-center w-full">{link.title}</span>
                                                        <ExternalLink size={16} className="absolute right-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    </div>
                                                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                                                </a>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            );
                        };

                        links.forEach((link, index) => {
                            // Check if this item acts as a full-width Section Breaker
                            const isSectionBreaker = link.url.startsWith('header://') || link.url.startsWith('text://');

                            if (isSectionBreaker) {
                                // Flush any pending standard links first
                                if (currentBuffer.length > 0) {
                                    renderedContent.push(flushBuffer(index));
                                }

                                // Render the Breaker Item (Full Width)
                                if (link.url.startsWith('header://')) {
                                    const subtitle = link.url.replace('header://', '')
                                    renderedContent.push(
                                        <div key={link.id} className="text-center w-full pt-6 pb-8 break-inside-avoid">
                                            <h2 className="text-2xl lg:text-3xl font-bold" style={{ color: pageStyle.color }}>
                                                {link.title}
                                            </h2>
                                            {subtitle && (
                                                <p className="text-sm lg:text-base opacity-70 mt-2 max-w-2xl mx-auto leading-relaxed" style={{ color: pageStyle.color }}>
                                                    {subtitle}
                                                </p>
                                            )}
                                        </div>
                                    )
                                } else if (link.url.startsWith('text://')) {
                                    renderedContent.push(
                                        <div key={link.id} className="w-full pb-6 pt-2 break-inside-avoid">
                                            <p className="text-base lg:text-lg text-center w-full opacity-80 whitespace-pre-wrap leading-relaxed max-w-2xl mx-auto" style={{ color: pageStyle.color }}>
                                                {link.title}
                                            </p>
                                        </div>
                                    )
                                }
                            } else {
                                // Standard Item: Add to buffer for Masonry Grouping
                                currentBuffer.push(link);
                            }
                        });

                        // Flush remaining items
                        if (currentBuffer.length > 0) {
                            renderedContent.push(flushBuffer(links.length));
                        }

                        return renderedContent;
                    })()}

                    {(!links || links.length === 0) && (
                        <div className="text-center opacity-50 py-12">
                            <p>Nenhum link adicionado ainda.</p>
                        </div>
                    )}
                </div>

                {/* Instagram Section */}
                {profile.id && (
                    <div className="w-full mx-auto">
                        <InstagramFeedSection userId={profile.id} theme={theme} />
                    </div>
                )}

                {/* Products Section */}
                {/* Products Section (Carousel Mode) */}
                {products.length > 0 && (
                    <div className="mt-12 lg:mt-0">
                        <h3 className="text-center lg:text-left text-sm font-bold uppercase tracking-widest opacity-50 mb-6 font-sans flex items-center gap-4">
                            <span className="h-px flex-1 bg-current opacity-20 lg:hidden"></span>
                            Loja
                            <span className="h-px flex-1 bg-current opacity-20"></span>
                        </h3>

                        <div className="relative group/carousel">
                            {/* Horizontal Slider */}
                            <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar snap-x snap-mandatory scroll-smooth -mx-4 px-4 lg:-mx-2 lg:px-2">
                                {products.map((product) => (
                                    <div
                                        key={product.id}
                                        onClick={() => openProductDetails(product)}
                                        className={`snap-center shrink-0 w-[240px] md:w-[280px] relative overflow-hidden rounded-[1.5rem] border group cursor-pointer hover:scale-[1.01] transition-all hover:shadow-xl flex flex-col ${isDark
                                            ? 'bg-white/5 border-white/10'
                                            : 'bg-white border-black/10 shadow-sm'
                                            }`}
                                    >
                                        {/* Portrait Aspect Ratio Container 3:4 */}
                                        <div className={`aspect-[3/4] w-full relative overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                                            {product.image_url ? (
                                                <>
                                                    <img src={product.image_url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={product.title} loading="lazy" />
                                                </>
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500/10 to-purple-500/10">
                                                    <span className="text-4xl">🛍️</span>
                                                </div>
                                            )}

                                            {/* Price Tag Overlay - Top Right */}
                                            <div className="absolute top-3 right-3">
                                                <span className="font-bold text-xs bg-black/70 text-white px-2.5 py-1.5 rounded-full backdrop-blur-md">
                                                    {product.price > 0 ? `R$ ${product.price.toFixed(2).replace('.', ',')}` : 'Grátis'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className={`p-4 flex flex-col flex-1 border-t ${isDark
                                            ? 'bg-[#111] border-white/5'
                                            : 'bg-white border-black/5'
                                            }`}>
                                            <h4 className={`font-bold text-base leading-tight line-clamp-2 mb-1 transition-colors ${isDark ? 'text-gray-100 group-hover:text-indigo-400' : 'text-gray-900 group-hover:text-indigo-600'}`}>
                                                {product.title}
                                            </h4>

                                            {product.description && (
                                                <p className={`text-xs line-clamp-2 leading-relaxed mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                                    {product.description}
                                                </p>
                                            )}

                                            <div className="mt-auto">
                                                <button
                                                    className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs transition-all ${isDark
                                                        ? 'bg-white/10 text-white hover:bg-white hover:text-black'
                                                        : 'bg-black/5 text-gray-900 hover:bg-black hover:text-white'
                                                        }`}
                                                >
                                                    <ShoppingBag size={14} />
                                                    Ver detalhes
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Desktop Arrows (Visual Polish) */}
                            <div className="hidden lg:flex justify-end gap-2 mt-4 opacity-50">
                                <div className="h-10 w-10 rounded-full border border-current flex items-center justify-center opacity-50">
                                    ←
                                </div>
                                <div className="h-10 w-10 rounded-full border border-current flex items-center justify-center">
                                    →
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <PublicProductModal
                    isOpen={!!selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                    product={selectedProduct}
                    onBuy={handleBuyProduct}
                    accentColor={accent_color}
                    isDark={isDark}
                />

                {/* Floating CTA Widget */}
                <div className={`fixed inset-x-0 bottom-0 z-50 flex justify-center pb-8 pt-32 bg-gradient-to-t from-black/30 via-black/5 to-transparent pointer-events-none transition-all duration-500 ${isFooterVisible ? 'translate-y-20 opacity-0' : 'translate-y-0 opacity-100'}`}>
                    <a
                        href="https://vasta.pro"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="pointer-events-auto flex items-center gap-2 bg-black border border-white/20 text-white px-6 py-3 rounded-full font-bold text-sm shadow-lg hover:scale-105 active:scale-95 transition-all backdrop-blur-md"
                    >
                        Crie seu Vasta <ArrowRight size={16} />
                    </a>
                </div>

                {/* Footer Widget */}
                <footer ref={footerRef} className="mt-16 w-full pb-0">
                    <a
                        href="https://vasta.pro"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center justify-between w-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 backdrop-blur-md border border-black/10 dark:border-white/10 py-6 px-6 rounded-2xl transition-all hover:scale-[1.01] active:scale-[0.99]"
                        style={{ color: pageStyle.color }}
                    >
                        <span className="font-bold text-sm flex items-center gap-2">
                            Crie seu Vasta <ArrowRight size={14} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                        </span>
                        <VastaLogo className="h-5 w-auto fill-current opacity-50 group-hover:opacity-100 transition-opacity" />
                    </a>
                </footer>
            </main >
        </div >

    )
}
