"use client"

import { useState, useEffect } from "react"
import { 
  Camera, 
  Image as ImageIcon, 
  Search, 
  X, 
  Loader2, 
  Check, 
  Sparkles,
  RefreshCcw,
  Palette,
  Type,
  Layout,
  Plus
} from "lucide-react"
import { useAppearance, type LinkStyle, type SiteTheme } from "../layout"

const UNSPLASH_ACCESS_KEY = "Gs8VRjjRzth-J04KlkcfYKViV2lh4Qtj9yyLXFXjme4"

export default function AparenciaPage() {
  const { settings, updateSettings } = useAppearance()
  const [isUnsplashOpen, setIsUnsplashOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [unsplashResult, setUnsplashResult] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const handleUnsplashSearch = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!searchQuery) return
    
    setIsSearching(true)
    try {
      const res = await fetch(
        `https://api.unsplash.com/search/photos?query=${searchQuery}&client_id=${UNSPLASH_ACCESS_KEY}&per_page=12`
      )
      const data = await res.json()
      setUnsplashResult(data.results || [])
    } catch (error) {
      console.error("Error searching Unsplash:", error)
    } finally {
      setIsSearching(false)
    }
  }

  useEffect(() => {
    if (isUnsplashOpen && unsplashResult.length === 0) {
      setSearchQuery("abstract background")
      handleUnsplashSearch()
    }
  }, [isUnsplashOpen])

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'cover') => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      if (type === 'profile') updateSettings({ profileImage: url })
      else updateSettings({ coverImage: url })
    }
  }

  const handleReset = () => {
    updateSettings({
      profileImage: null,
      coverImage: null,
      accentColor: "#6366F1",
      bgColor: null,
      typography: "Inter",
      linkStyle: "glass",
      theme: "adaptive",
      username: "seunome",
      bio: "Sua bio inspiradora"
    })
  }

  return (
    <div className="mx-auto max-w-5xl space-y-10 pb-32">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-vasta-text uppercase tracking-tight">Personalização da Página</h1>
          <p className="text-xs font-bold text-vasta-muted uppercase tracking-widest mt-1">Deixe seu perfil com a sua cara</p>
        </div>
        <button 
          onClick={handleReset}
          className="p-2.5 rounded-xl bg-vasta-surface-soft border border-vasta-border text-vasta-muted hover:text-vasta-text transition-all"
        >
          <RefreshCcw size={18} />
        </button>
      </header>

      {/* Mídias do Perfil */}
      <section className="animate-fade-in [animation-delay:100ms] space-y-4">
        <div className="flex items-center gap-2 px-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-vasta-primary/10 text-vasta-primary">
            <ImageIcon size={18} />
          </div>
          <h3 className="text-sm font-bold text-vasta-text uppercase tracking-wider">Mídias do Perfil</h3>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Cover Photo */}
          <div className="group relative overflow-hidden rounded-3xl border border-vasta-border bg-vasta-surface p-1 shadow-card transition-all hover:shadow-xl">
             <div className="relative h-40 w-full overflow-hidden rounded-2xl bg-vasta-surface-soft">
                {settings.coverImage ? (
                  <img src={settings.coverImage} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" alt="Capa" />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-vasta-primary/10 to-vasta-accent/10">
                    <ImageIcon className="h-10 w-10 text-vasta-muted/30" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/20 opacity-0 transition-opacity group-hover:opacity-100 flex items-center justify-center gap-2">
                   <button 
                    onClick={() => setIsUnsplashOpen(true)}
                    className="rounded-full bg-white/90 px-4 py-2 text-xs font-bold text-black hover:bg-white shadow-lg flex items-center gap-2"
                   >
                     <Search size={14} /> Buscar no Unsplash
                   </button>
                </div>
             </div>
             <div className="p-4 flex items-center justify-between">
                <div>
                   <h4 className="text-sm font-bold text-vasta-text">Capa do Perfil</h4>
                   <p className="text-xs text-vasta-muted">Recomendado: 1200x400px</p>
                </div>
                <div className="flex gap-2">
                   <button 
                    onClick={() => setIsUnsplashOpen(true)}
                    className="p-2 rounded-xl bg-vasta-surface-soft text-vasta-text hover:bg-vasta-border transition-colors border border-vasta-border"
                   >
                     <Search size={16} />
                   </button>
                   <label className="p-2 rounded-xl bg-vasta-primary text-white hover:bg-vasta-primary-soft transition-colors cursor-pointer shadow-md shadow-vasta-primary/10">
                     <ImageIcon size={16} />
                     <input type="file" className="hidden" accept="image/*" onChange={(e) => handleUpload(e, 'cover')} />
                   </label>
                </div>
             </div>
          </div>

          {/* Profile Photo */}
          <div className="group relative overflow-hidden rounded-3xl border border-vasta-border bg-vasta-surface p-1 shadow-card transition-all hover:shadow-xl">
             <div className="p-6 flex flex-col items-center justify-center">
                <div className="relative">
                  <div className="h-24 w-24 rounded-full border-4 border-vasta-surface bg-vasta-surface-soft shadow-xl overflow-hidden mb-4">
                    {settings.profileImage ? (
                      <img src={settings.profileImage} className="h-full w-full object-cover" alt="Avatar" />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-tr from-vasta-primary to-vasta-accent">
                          <ImageIcon className="h-8 w-8 text-white/50" />
                      </div>
                    )}
                  </div>
                  <label className="absolute bottom-4 right-0 p-2 rounded-full bg-vasta-primary text-white shadow-lg cursor-pointer border-2 border-vasta-surface hover:scale-110 transition-transform">
                     <Camera size={14} />
                     <input type="file" className="hidden" accept="image/*" onChange={(e) => handleUpload(e, 'profile')} />
                  </label>
                </div>
                <div className="text-center">
                   <h4 className="text-sm font-bold text-vasta-text">Foto de Perfil</h4>
                   <p className="text-xs text-vasta-muted">PNG, JPG até 5MB</p>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Informações do Perfil */}
      <section className="animate-fade-in [animation-delay:150ms] space-y-4">
        <div className="flex items-center gap-2 px-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-vasta-primary/10 text-vasta-primary">
            <Sparkles size={18} />
          </div>
          <h3 className="text-sm font-bold text-vasta-text uppercase tracking-wider">Informações do Perfil</h3>
        </div>

        <div className="rounded-[2.5rem] border border-vasta-border bg-vasta-surface p-2 shadow-card">
          <div className="grid gap-6 p-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-bold text-vasta-muted uppercase tracking-widest px-1">Username</label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-vasta-muted group-focus-within:text-vasta-primary transition-colors">@</span>
                <input 
                  type="text" 
                  value={settings.username}
                  onChange={(e) => updateSettings({ username: e.target.value })}
                  placeholder="vasta.pro/seu-user"
                  className="w-full rounded-2xl bg-vasta-surface-soft border border-vasta-border px-8 py-3 text-sm font-medium text-vasta-text focus:outline-none focus:ring-2 focus:ring-vasta-primary/20 focus:border-vasta-primary transition-all placeholder:text-vasta-muted/50"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-vasta-muted uppercase tracking-widest px-1">Bio</label>
              <textarea 
                value={settings.bio}
                onChange={(e) => updateSettings({ bio: e.target.value })}
                placeholder="Conte algo incrível sobre você..."
                rows={1}
                className="w-full rounded-2xl bg-vasta-surface-soft border border-vasta-border px-4 py-3 text-sm font-medium text-vasta-text focus:outline-none focus:ring-2 focus:ring-vasta-primary/20 focus:border-vasta-primary transition-all placeholder:text-vasta-muted/50 resize-none"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Temas & Cores */}
      <section className="animate-fade-in [animation-delay:200ms] space-y-4">
        <div className="flex items-center gap-2 px-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-vasta-primary/10 text-vasta-primary">
            <Palette size={18} />
          </div>
          <h3 className="text-sm font-bold text-vasta-text uppercase tracking-wider">Temas & Cores</h3>
        </div>
        
        <div className="rounded-[2.5rem] border border-vasta-border bg-vasta-surface p-2 shadow-card">
          <div className="p-6">
            <h4 className="text-xs font-bold text-vasta-muted uppercase tracking-widest mb-4 px-1">Temas Prontos</h4>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => updateSettings({ theme: 'light' })}
                className={`relative group overflow-hidden rounded-3xl border-2 p-1 transition-all hover:scale-[1.02] active:scale-[0.98] ${settings.theme === 'light' ? 'border-vasta-primary shadow-lg shadow-vasta-primary/10' : 'border-vasta-border hover:border-vasta-muted'}`}
              >
                <div className="h-20 w-full rounded-2xl bg-[#FAFAF9] flex items-center justify-center">
                  <div className="h-8 w-16 bg-white rounded-lg shadow-sm" />
                </div>
                <div className="p-3 text-center">
                  <span className="text-sm font-bold text-vasta-text">Sol de Verão</span>
                  {settings.theme === 'light' && <div className="absolute top-2 right-2 bg-vasta-primary text-white p-1 rounded-full"><Check size={10} /></div>}
                </div>
              </button>

              <button 
                onClick={() => updateSettings({ theme: 'dark' })}
                className={`relative group overflow-hidden rounded-3xl border-2 p-1 transition-all hover:scale-[1.02] active:scale-[0.98] ${settings.theme === 'dark' ? 'border-vasta-primary shadow-lg shadow-vasta-primary/10' : 'border-vasta-border hover:border-vasta-muted'}`}
              >
                <div className="h-20 w-full rounded-2xl bg-[#0B0E14] flex items-center justify-center">
                  <div className="h-8 w-16 bg-[#151923] rounded-lg shadow-sm" />
                </div>
                <div className="p-3 text-center">
                  <span className="text-sm font-bold text-vasta-text">Escuro Puro</span>
                  {settings.theme === 'dark' && <div className="absolute top-2 right-2 bg-vasta-primary text-white p-1 rounded-full"><Check size={10} /></div>}
                </div>
              </button>
            </div>

            <h4 className="text-xs font-bold text-vasta-muted uppercase tracking-widest mt-8 mb-4 px-1">Cor de Destaque</h4>
            <div className="flex flex-wrap gap-4 px-1">
              {['#6366F1', '#EC4899', '#10B981', '#F59E0B', '#000000', '#EF4444'].map((color) => (
                <button
                  key={color}
                  onClick={() => updateSettings({ accentColor: color })}
                  className={`h-12 w-12 rounded-2xl transition-all hover:scale-110 active:scale-90 flex items-center justify-center group ${settings.accentColor === color ? 'ring-4 ring-vasta-primary/10 border-2 border-vasta-primary' : 'border border-vasta-border'}`}
                  style={{ backgroundColor: color }}
                >
                  {settings.accentColor === color && <Check className={color === '#000000' ? 'text-white' : 'text-black/50'} size={20} />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Estilo dos Links */}
      <section className="animate-fade-in [animation-delay:250ms] space-y-4">
        <div className="flex items-center gap-2 px-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-vasta-primary/10 text-vasta-primary">
            <Layout size={18} />
          </div>
          <h3 className="text-sm font-bold text-vasta-text uppercase tracking-wider">Estilo dos Links</h3>
        </div>

        <div className="rounded-[2.5rem] border border-vasta-border bg-vasta-surface p-2 shadow-card">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
              {[
                { id: 'glass', name: 'Neon Glass' },
                { id: 'solid', name: 'Sólido' },
                { id: 'outline', name: 'Contorno' }
              ].map((style) => (
                <button
                  key={style.id}
                  onClick={() => updateSettings({ linkStyle: style.id as any })}
                  className={`p-4 rounded-3xl border-2 transition-all hover:scale-[1.02] active:scale-[0.98] flex flex-col items-center gap-3 ${settings.linkStyle === style.id ? 'border-vasta-primary bg-vasta-primary/5' : 'border-vasta-border'}`}
                >
                   <div 
                    className={`h-10 w-full rounded-xl border ${style.id === 'glass' ? 'bg-white/10 backdrop-blur-md border-white/20' : style.id === 'solid' ? 'bg-vasta-primary border-transparent' : 'bg-transparent border-vasta-primary'}`}
                    style={{ 
                      backgroundColor: style.id === 'solid' ? settings.accentColor : undefined,
                      borderColor: (style.id === 'outline' || style.id === 'glass') ? settings.accentColor : undefined
                    }}
                   />
                   <span className="text-xs font-bold text-vasta-text">{style.name}</span>
                </button>
              ))}
           </div>
        </div>
      </section>

      {/* Tipografia */}
      <section className="animate-fade-in [animation-delay:300ms] space-y-4">
        <div className="flex items-center gap-2 px-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-vasta-primary/10 text-vasta-primary">
            <Type size={18} />
          </div>
          <h3 className="text-sm font-bold text-vasta-text uppercase tracking-wider">Tipografia</h3>
        </div>

        <div className="rounded-[2.5rem] border border-vasta-border bg-vasta-surface p-2 shadow-card">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4">
             {['Inter', 'Poppins', 'Montserrat', 'Outfit'].map((font) => (
               <button
                 key={font}
                 onClick={() => updateSettings({ typography: font })}
                 className={`p-4 rounded-3xl border-2 transition-all flex flex-col items-center gap-2 ${settings.typography === font ? 'border-vasta-primary bg-vasta-primary/5' : 'border-vasta-border hover:border-vasta-muted'}`}
               >
                 <span className="text-xl font-bold" style={{ fontFamily: font }}>Aa</span>
                 <span className="text-[10px] font-bold text-vasta-muted uppercase tracking-widest">{font}</span>
               </button>
             ))}
          </div>
        </div>
      </section>

      {/* Reset */}
      <div className="flex justify-center pt-8 pb-12">
        <button 
          onClick={handleReset}
          className="flex items-center gap-2 rounded-full border border-vasta-border bg-vasta-surface px-6 py-3 text-sm font-bold text-vasta-muted hover:bg-vasta-surface-soft hover:text-vasta-text transition-all"
        >
          <RefreshCcw size={16} /> Resetar Aparência 
        </button>
      </div>

      {/* Unsplash Modal */}
      {isUnsplashOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-md transition-all">
          <div className="w-full max-w-2xl rounded-[2.5rem] bg-vasta-surface border border-vasta-border shadow-2xl overflow-hidden animate-slide-up">
            <div className="flex items-center justify-between border-b border-vasta-border px-8 py-6">
              <h3 className="text-lg font-bold text-vasta-text flex items-center gap-2">
                <Search className="text-vasta-primary" /> Buscar no Unsplash
              </h3>
              <button 
                onClick={() => setIsUnsplashOpen(false)}
                className="rounded-full bg-vasta-surface-soft p-2 text-vasta-muted hover:text-vasta-text transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-8">
              <form onSubmit={handleUnsplashSearch} className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-vasta-muted" size={18} />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Ex: sunset, nature, minimalism..."
                    className="w-full rounded-2xl bg-vasta-surface-soft border border-vasta-border px-12 py-3 text-sm font-medium text-vasta-text focus:outline-none focus:ring-2 focus:ring-vasta-primary/20 focus:border-vasta-primary transition-all shadow-inner"
                  />
                </div>
                <button 
                  type="submit"
                  disabled={isSearching}
                  className="rounded-2xl bg-vasta-primary px-8 py-3 text-sm font-bold text-white shadow-lg shadow-vasta-primary/20 hover:bg-vasta-primary-soft transition-all disabled:opacity-50"
                >
                  {isSearching ? <Loader2 className="animate-spin" /> : "Buscar"}
                </button>
              </form>

              <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-4 h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                {unsplashResult.map((photo: any) => (
                  <button 
                    key={photo.id}
                    onClick={() => {
                      updateSettings({ coverImage: photo.urls.regular })
                      setIsUnsplashOpen(false)
                    }}
                    className="group relative aspect-video overflow-hidden rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-xl"
                  >
                    <img src={photo.urls.small} className="h-full w-full object-cover" alt={photo.alt_description} />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <Plus className="text-white" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="border-t border-vasta-border px-8 py-4 bg-vasta-surface-soft/50">
               <p className="text-[10px] text-vasta-muted text-center uppercase tracking-widest font-bold">
                 Imagens por Unsplash API
               </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
