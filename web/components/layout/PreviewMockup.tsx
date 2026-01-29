"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Camera } from "lucide-react"
import { VastaLogo } from "../VastaLogo"
import { createClient } from "../../lib/supabase/client"
import { useAuth } from "../../lib/AuthContext"
import { InstagramFeedSection } from "../profile/InstagramFeedSection"
import { PremiumLinkCard } from "../profile/PremiumLinkCard"
import { PublicCollectionItem } from "../profile/PublicCollectionItem"
import type { AppearanceSettings } from "../providers/AppearanceProvider"

export function PreviewMockup({ settings }: { settings: AppearanceSettings }) {
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

    const channel = supabase.channel('preview-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'links', filter: `profile_id=eq.${user?.id}` }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products', filter: `profile_id=eq.${user?.id}` }, () => fetchData())
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') console.log('Preview subscribed to changes')
      })

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

  const theme = settings.theme

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
        <div className="h-32 w-full bg-vasta-surface-soft overflow-hidden shrink-0 relative">
          {settings.coverImage ? (
            <div className="relative h-full w-full">
               <Image 
                 src={settings.coverImage} 
                 alt="Cover"
                 fill
                 className="object-cover"
                 sizes="(max-width: 768px) 100vw, 300px"
                 priority
               />
            </div>
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-vasta-primary/20 to-vasta-accent/20" />
          )}
          <div className="absolute inset-0 bg-black/10" />

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
          <div className={`w-full flex flex-col items-center p-4 mb-4 ${currentThemeConfig?.card || 'bg-white/5 backdrop-blur-sm rounded-[1.5rem] border border-white/10 shadow-xl'}`}>
            <div className={`h-20 w-20 shadow-2xl overflow-hidden shrink-0 relative ${currentThemeConfig?.avatar || 'rounded-full border-[6px]'}`}
              style={{ borderColor: !currentThemeConfig ? (settings.bgColor || (settings.theme === 'light' ? '#FAFAF9' : '#0B0E14')) : undefined }}
            >
              {settings.profileImage ? (
                <Image 
                  src={settings.profileImage} 
                  alt="Avatar" 
                  fill
                  className="object-cover"
                  sizes="80px"
                />
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

          <div className="w-full space-y-3 px-2">
            {links.map((link) => {
              if (hiddenLinkIds.has(link.id)) return null;

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
                    onLinkClick={() => {}}
                    isPreview={true}
                  />
                )
              }

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

              if (currentThemeConfig) {
                return (
                  <div key={link.id}>
                    <PremiumLinkCard
                      link={link}
                      theme={theme as any}
                      themeConfig={currentThemeConfig}
                      onClick={() => {}} // Pass empty function or one that matches expected signature
                      isPreview={true}
                    />
                  </div>
                )
              }

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

                  {(settings.linkStyle === 'solid' || settings.linkStyle === 'glass') && (
                    <div className="absolute inset-0 translate-x-[-100%] group-hover:animate-[shine_1s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  )}
                </div>
              )
            })}
          </div>

          {user && (
            <div className="w-full px-2 mt-4 scale-90 origin-top">
              <InstagramFeedSection userId={user.id} theme={theme} isPreview={true} />
            </div>
          )}

          {products.length > 0 && (
            <div className="w-full mt-8 px-2">
              <h3 className="text-center text-[10px] font-bold uppercase tracking-widest opacity-50 mb-3 font-sans">Loja</h3>
              <div className="grid gap-3">
                {products.map(p => (
                  <div key={p.id} className={`relative overflow-hidden group cursor-default ${currentThemeConfig?.card || 'rounded-[1.25rem] bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10'}`}>
                    <div className="flex h-14">
                      {p.image_url && (
                        <div className="w-14 h-full shrink-0 bg-black/5 relative">
                          <Image 
                            src={p.image_url} 
                            alt={p.title}
                            fill
                            className="object-cover"
                            sizes="56px"
                          />
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

          <div className="mt-12 mb-8 opacity-40 text-center flex flex-col items-center">
            <VastaLogo className="h-4 w-auto fill-current" />
          </div>
        </div>

        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-6 w-24 bg-vasta-surface rounded-b-3xl z-50 shadow-inner" />
      </div>
    </div>
  )
}
