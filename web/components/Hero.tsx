"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Check, ArrowRight, Verified, ExternalLink, Github, Monitor, Calendar, Heart, Loader2 } from "lucide-react"

export function Hero() {
  const [username, setUsername] = useState("")
  const [availability, setAvailability] = useState<{ available: boolean; message: string } | null>(null)
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    if (username.length < 3) {
      setAvailability(null)
      return
    }

    const timer = setTimeout(async () => {
      setChecking(true)
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profiles/check_username?username=${username}`)
        const data = await res.json()
        setAvailability(data)
      } catch (err) {
        console.error("Error checking username:", err)
      } finally {
        setChecking(false)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [username])

  return (
    <section className="relative overflow-hidden border-b border-vasta-border pt-24 pb-20 md:pb-32 lg:pt-48 bg-vasta-bg">
      {/* Background radial gradients for depth - Adjusted for both themes */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.15),transparent_50%),radial-gradient(circle_at_bottom_right,rgba(236,72,153,0.1),transparent_50%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.08),transparent_50%),radial-gradient(circle_at_bottom_right,rgba(236,72,153,0.05),transparent_50%)]" />

      <div className="mx-auto flex max-w-7xl flex-col gap-16 px-4 md:flex-row md:items-center lg:gap-24">
        
        {/* Left Side: Content */}
        <div className="flex-1 space-y-8 text-center md:text-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-vasta-primary/30 bg-vasta-primary/10 px-4 py-1.5 text-xs font-bold tracking-wide text-vasta-primary md:text-sm shadow-sm">
            <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-vasta-primary opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-vasta-primary"></span>
            </span>
            COMECE GRATUITAMENTE
          </div>

          <div className="space-y-4">
            <h1 className="text-5xl font-black tracking-tight text-vasta-text sm:text-6xl lg:text-7xl">
              Sua expertise <br />
              <span className="gradient-title">merece destaque.</span>
            </h1>
            <p className="mx-auto max-w-xl text-lg text-vasta-muted md:mx-0 md:text-xl leading-relaxed font-medium">
              Unifique sua presença digital. Compartilhe links, venda produtos e cresça sua audiência com uma única URL profissional.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:mx-auto sm:max-w-md md:mx-0">
            <div className={`flex flex-col gap-3 rounded-3xl border transition-all p-2 sm:flex-row sm:items-center shadow-lg ${
                availability?.available ? "border-emerald-500/50 bg-emerald-500/10" : 
                availability?.available === false ? "border-red-500/50 bg-red-500/10" : 
                "border-vasta-border bg-vasta-surface-soft/80"
            }`}>
                <div className="flex flex-1 items-center px-4 py-2 relative">
                    <span className="text-sm font-bold text-vasta-muted">vasta.pro/</span>
                    <input
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="seu-nome"
                        className="flex-1 bg-transparent px-1 text-sm font-bold text-vasta-text placeholder:text-vasta-muted/50 focus:outline-none"
                    />
                    {checking && <Loader2 className="absolute right-2 h-4 w-4 animate-spin text-vasta-primary" />}
                </div>
                <button className="flex items-center justify-center gap-2 rounded-2xl bg-vasta-text px-6 py-3 text-sm font-bold text-vasta-bg transition-all hover:bg-vasta-text-soft disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-xl">
                    Criar grátis <ArrowRight className="h-4 w-4" />
                </button>
            </div>
            
            {availability && (
                <div className={`text-[11px] font-bold px-4 ${availability.available ? "text-emerald-500" : "text-red-500"}`}>
                    {availability.available ? "✓ Nome disponível!" : `✗ Nome ${availability.message}`}
                </div>
            )}

            <div className="flex flex-wrap justify-center gap-6 text-xs font-bold text-vasta-muted md:justify-start pt-2">
                <div className="flex items-center gap-2">
                    <div className="rounded-full bg-emerald-500/20 p-0.5">
                        <Check className="h-3 w-3 text-emerald-500" />
                    </div>
                    <span>Plano Grátis</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="rounded-full bg-emerald-500/20 p-0.5">
                        <Check className="h-3 w-3 text-emerald-500" />
                    </div>
                    <span>Sem cartão de crédito</span>
                </div>
            </div>
          </div>
        </div>

        {/* Right Side: Phone Mockup */}
        <div className="flex flex-1 justify-center lg:justify-end">
          <div className="relative group">
            {/* Glow behind phone */}
            <div className="absolute -inset-4 rounded-[3.5rem] bg-gradient-to-tr from-vasta-primary/30 to-vasta-accent/30 opacity-60 blur-3xl transition-opacity group-hover:opacity-80 mix-blend-multiply dark:mix-blend-screen" />
            
            <div className="relative h-[550px] w-[280px] sm:h-[650px] sm:w-[320px] rounded-[3rem] border-8 border-vasta-surface bg-vasta-bg shadow-2xl">
              
              {/* Inner screen content */}
              <div className="h-full w-full overflow-hidden rounded-[2.5rem] bg-vasta-bg relative">
                
                {/* Banner */}
                <div className="h-32 w-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 relative">
                   <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-vasta-bg to-transparent" />
                </div>

                {/* Profile Info */}
                <div className="-mt-10 flex flex-col items-center px-6 relative z-10">
                    <div className="h-20 w-20 rounded-full border-4 border-vasta-bg bg-vasta-surface flex items-center justify-center overflow-hidden shadow-lg">
                        <div className="h-full w-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                             <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M4 4L9 20L12 12L20 9L4 4Z" fill="white" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                             </svg>
                        </div>
                    </div>
                    
                    <div className="mt-4 flex items-center gap-1.5">
                        <span className="text-base font-bold text-vasta-text">@{username || "seunome"}</span>
                        <Verified className="h-4 w-4 text-blue-500 fill-blue-500/20" />
                    </div>
                    <p className="mt-2 text-center text-xs font-medium leading-relaxed text-vasta-muted">
                        Designer de Produtos & Criador <br /> de Conteúdo.
                    </p>
                </div>

                {/* Search / Links */}
                <div className="mt-8 space-y-3 px-6 relative z-10">
                    <div className="group flex w-full items-center gap-3 rounded-2xl bg-vasta-surface-soft/60 border border-vasta-border/50 px-4 py-3 text-left transition-all hover:bg-vasta-surface-soft hover:scale-[1.02] cursor-pointer shadow-sm">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-vasta-bg shadow-sm">
                            <ExternalLink className="h-4 w-4 text-vasta-muted group-hover:text-vasta-primary transition-colors" />
                        </div>
                        <span className="text-xs font-bold text-vasta-text">Portfólio no Behance</span>
                    </div>
                    
                    <div className="group flex w-full items-center gap-3 rounded-2xl bg-vasta-surface-soft/60 border border-vasta-border/50 px-4 py-3 text-left transition-all hover:bg-vasta-surface-soft hover:scale-[1.02] cursor-pointer shadow-sm">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-vasta-bg shadow-sm">
                            <Github className="h-4 w-4 text-vasta-muted group-hover:text-vasta-primary transition-colors" />
                        </div>
                        <span className="text-xs font-bold text-vasta-text">Projetos GitHub</span>
                    </div>

                    <div className="group flex w-full items-center gap-3 rounded-2xl bg-vasta-surface-soft/60 border border-vasta-border/50 px-4 py-3 text-left transition-all hover:bg-vasta-surface-soft hover:scale-[1.02] cursor-pointer shadow-sm">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-vasta-bg shadow-sm">
                            <Calendar className="h-4 w-4 text-vasta-muted group-hover:text-vasta-primary transition-colors" />
                        </div>
                        <span className="text-xs font-bold text-vasta-text">Agendar Consultoria</span>
                        <ArrowRight className="ml-auto h-3 w-3 text-vasta-muted group-hover:text-vasta-primary transition-colors" />
                    </div>
                </div>

                {/* Products Section */}
                <div className="mt-8 px-6 pb-6 relative z-10">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-vasta-muted/80">Produtos & Ofertas</span>
                        <Heart className="h-3 w-3 text-vasta-accent" />
                    </div>

                    <div className="flex gap-3 overflow-x-auto pb-4 hide-scrollbar">
                        <div className="min-w-[130px] flex-shrink-0 rounded-[1.5rem] bg-vasta-surface-soft/60 border border-vasta-border/50 p-2 transition-transform hover:scale-105 cursor-pointer shadow-sm">
                             <div className="h-24 w-full rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 flex items-center justify-center">
                                <Monitor className="h-8 w-8 text-indigo-500/60" />
                             </div>
                             <div className="mt-2 text-center">
                                <div className="text-[10px] font-bold text-white px-2 py-0.5 rounded-full bg-vasta-text inline-block mb-1 shadow-sm">R$ 197</div>
                             </div>
                        </div>

                        <div className="min-w-[130px] flex-shrink-0 rounded-[1.5rem] bg-vasta-surface-soft/60 border border-vasta-border/50 p-2 transition-transform hover:scale-105 cursor-pointer shadow-sm">
                             <div className="h-24 w-full rounded-2xl bg-gradient-to-br from-pink-500/10 to-orange-500/10 flex items-center justify-center">
                                <Calendar className="h-8 w-8 text-pink-500/60" />
                             </div>
                             <div className="mt-2 text-center">
                                <div className="text-[10px] font-bold text-white px-2 py-0.5 rounded-full bg-vasta-text inline-block mb-1 shadow-sm">R$ 47</div>
                             </div>
                        </div>
                    </div>
                </div>

              </div>

              {/* Speaker/Camera notch */}
              <div className="absolute top-0 left-1/2 mt-3 h-6 w-32 -translate-x-1/2 rounded-full bg-vasta-surface shadow-inner" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
