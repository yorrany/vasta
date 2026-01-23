"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "../../lib/supabase/client"
import {
    Loader2,
    ArrowRight,
    User,
    Sparkles,
    Layout,
    Check,
    Rocket,
    Palette,
    CheckCircle2,
    AlertCircle,
    ArrowUpRight,
    Camera
} from "lucide-react"

type Step = 'USERNAME' | 'BIO' | 'THEME' | 'FINISH'

export default function OnboardingPage() {
    const [step, setStep] = useState<Step>('USERNAME')
    const [loading, setLoading] = useState(false)
    const [authLoading, setAuthLoading] = useState(true)
    const [checkingUsername, setCheckingUsername] = useState(false)
    const [availability, setAvailability] = useState<{
        available: boolean;
        message: string;
        suggestions?: string[];
    } | null>(null);

    const [formData, setFormData] = useState({
        username: "",
        display_name: "",
        bio: "",
        theme: "adaptive"
    })

    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        // Check if user is logged in
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                // Double check with session
                const { data: { session } } = await supabase.auth.getSession()
                if (!session) {
                    router.push("/login")
                    return
                }
            }

            setAuthLoading(false)

            // Pre-fill email prefix as suggested username
            if (user?.email && !formData.username) {
                const prefix = user.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
                setFormData(prev => ({ ...prev, username: prefix, display_name: user.user_metadata?.full_name || prefix }))
            }
        }
        checkUser()
    }, [])

    useEffect(() => {
        if (formData.username.length < 3) {
            setAvailability(null);
            return;
        }

        const timer = setTimeout(async () => {
            setCheckingUsername(true);
            try {
                const res = await fetch(
                    `/api/profiles/check_username?username=${formData.username.toLowerCase()}`
                );

                if (!res.ok) throw new Error("API Offline");

                const data = await res.json();

                if (data.available === false) {
                    data.suggestions = data.suggestions || [
                        `${formData.username}pro`,
                        `${formData.username}hq`,
                        `sou${formData.username}`
                    ];
                }

                setAvailability(data);
            } catch (err) {
                console.error("Error checking username:", err);
                // Fail-safe
                setAvailability({ available: true, message: "Disponível!" });
            } finally {
                setCheckingUsername(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [formData.username]);

    const handleNext = () => {
        if (step === 'USERNAME') setStep('BIO')
        else if (step === 'BIO') setStep('THEME')
        else if (step === 'THEME') handleComplete()
    }

    const handleComplete = async () => {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return

        const { error } = await supabase
            .from('profiles')
            .upsert({
                id: user.id,
                username: formData.username,
                display_name: formData.display_name,
                bio: formData.bio,
                theme: formData.theme,
                updated_at: new Date().toISOString()
            })

        if (error) {
            console.error(error)
            setLoading(false)
            alert("Erro ao salvar perfil. Tente outro @username.")
        } else {
            setStep('FINISH')
            setTimeout(() => {
                router.push("/dashboard")
            }, 2000)
        }
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center px-4 py-8 md:py-12 overflow-x-hidden">
            {/* Background Decor - More intense and premium */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] h-[600px] w-[600px] rounded-full bg-vasta-primary/10 blur-[140px] animate-pulse-soft" />
                <div className="absolute bottom-[-10%] right-[-10%] h-[600px] w-[600px] rounded-full bg-vasta-accent/10 blur-[140px] animate-pulse-soft delay-1000" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[800px] w-[800px] rounded-full bg-indigo-500/5 blur-[160px]" />
            </div>

            <div className={`w-full ${step === 'THEME' ? 'max-w-6xl' : 'max-w-[540px]'} space-y-10 relative mt-4 md:mt-0 transition-all duration-700`}>
                {/* Progress Header */}
                <div className="space-y-6 px-4">
                    <div className="flex justify-between items-center gap-3">
                        {['USERNAME', 'BIO', 'THEME', 'FINISH'].map((s, idx) => {
                            const isActive = step === s
                            const isCompleted = ['USERNAME', 'BIO', 'THEME', 'FINISH'].indexOf(step) > idx
                            return (
                                <div key={s} className="flex-1">
                                    <div className={`h-1.5 w-full rounded-full transition-all duration-700 ease-out ${isActive || isCompleted ? 'bg-gradient-to-r from-vasta-primary to-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'bg-slate-800'}`} />
                                    <div className="mt-3 text-center">
                                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors duration-300 ${isActive ? 'text-vasta-primary' : isCompleted ? 'text-indigo-300/60' : 'text-slate-600'}`}>
                                            {idx + 1}
                                        </span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                <div className={`${step === 'THEME' ? '' : 'relative overflow-hidden group'}`}>
                    {step !== 'THEME' && (
                        <div className="absolute -inset-1 bg-gradient-to-r from-vasta-primary/10 to-vasta-accent/10 rounded-[3rem] blur-xl opacity-50 group-hover:opacity-100 transition duration-1000"></div>
                    )}

                    <div className={`${step === 'THEME' ? 'bg-transparent border-none p-0 backdrop-blur-none shadow-none text-left' : 'relative bg-slate-900/40 border border-slate-800/60 rounded-[3rem] p-10 md:p-12 backdrop-blur-2xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)]'} animate-in fade-in zoom-in-95 duration-700`}>
                        {step === 'USERNAME' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
                                <div className="text-center space-y-4">
                                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.25rem] bg-vasta-primary/10 ring-1 ring-vasta-primary/20">
                                        <User className="h-8 w-8 text-vasta-primary" />
                                    </div>
                                    <div className="space-y-1">
                                        <h1 className="text-3xl font-black tracking-tight bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">Reserve seu @username</h1>
                                        <p className="text-slate-400 text-base font-medium">Sua identidade única no Vasta Pro</p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="relative group">
                                        <div className="absolute left-5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 pointer-events-none">
                                            <span className="text-slate-500 font-bold text-lg tracking-tight">vasta.pro/</span>
                                        </div>
                                        <input
                                            type="text"
                                            value={formData.username}
                                            onChange={(e) => {
                                                const val = e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '')
                                                setFormData(prev => ({ ...prev, username: val }))
                                            }}
                                            placeholder="seunome"
                                            // Adjusted padding-left to 105px to avoid overlap with "vasta.pro/"
                                            className="w-full rounded-2xl border border-slate-700/50 bg-slate-800/30 py-5 pl-[105px] pr-14 text-white text-lg font-black placeholder:text-slate-700 focus:border-vasta-primary focus:ring-2 focus:ring-vasta-primary/20 transition-all outline-none"
                                        />
                                        <div className="absolute right-5 top-1/2 -translate-y-1/2">
                                            {checkingUsername ? <Loader2 className="h-6 w-6 animate-spin text-vasta-primary" /> :
                                                availability?.available === true ? (
                                                    <div className="h-7 w-7 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                                    </div>
                                                ) :
                                                    availability?.available === false ? (
                                                        <div className="h-7 w-7 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
                                                            <AlertCircle className="h-4 w-4 text-red-500" />
                                                        </div>
                                                    ) : null}
                                        </div>
                                    </div>

                                    {availability?.available === false && (
                                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <p className="text-sm font-bold text-red-400/90 flex items-center gap-2">
                                                <AlertCircle size={14} />
                                                Este nome já está em uso. Que tal:
                                            </p>
                                            {availability.suggestions && (
                                                <div className="flex flex-wrap gap-2.5">
                                                    {availability.suggestions.map((suggestion) => (
                                                        <button
                                                            key={suggestion}
                                                            onClick={() => setFormData(prev => ({ ...prev, username: suggestion }))}
                                                            className="group flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/40 px-4 py-2 text-xs font-bold text-white transition-all hover:border-vasta-primary/60 hover:bg-vasta-primary/10 hover:scale-[1.03] active:scale-95 shadow-sm"
                                                        >
                                                            <Sparkles className="h-3 w-3 text-vasta-primary group-hover:animate-pulse" />
                                                            {suggestion}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <button
                                        onClick={handleNext}
                                        disabled={!availability?.available || checkingUsername}
                                        className="w-full group relative flex items-center justify-center gap-3 rounded-[1.5rem] bg-white py-5 text-base font-black text-slate-950 transition-all hover:bg-slate-100 hover:shadow-[0_15px_30px_-5px_rgba(255,255,255,0.2)] active:scale-[0.97] disabled:opacity-30 disabled:grayscale disabled:pointer-events-none"
                                    >
                                        <span>Continuar para Perfil</span>
                                        <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1.5" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 'BIO' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
                                <div className="text-center space-y-4">
                                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.25rem] bg-vasta-accent/10 ring-1 ring-vasta-accent/20">
                                        <Sparkles className="h-8 w-8 text-vasta-accent" />
                                    </div>
                                    <div className="space-y-1">
                                        <h1 className="text-3xl font-black tracking-tight bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">Dê um rosto ao perfil</h1>
                                        <p className="text-slate-400 text-base font-medium">Personalize como o mundo te vê</p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2.5">
                                        <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] px-1">Nome Público</label>
                                        <input
                                            type="text"
                                            value={formData.display_name}
                                            onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                                            placeholder="Seu Nome Completo"
                                            className="w-full rounded-2xl border border-slate-700/50 bg-slate-800/30 py-4.5 px-5 text-white font-bold text-lg focus:border-vasta-accent focus:ring-2 focus:ring-vasta-accent/20 transition-all outline-none"
                                        />
                                    </div>

                                    <div className="space-y-2.5">
                                        <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] px-1">Biografia Curta</label>
                                        <textarea
                                            value={formData.bio}
                                            onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                                            placeholder="Ex: Transformando ideias em produtos digitais. Palestrante e Desenvolvedor."
                                            rows={4}
                                            className="w-full rounded-2xl border border-slate-700/50 bg-slate-800/30 py-4.5 px-5 text-white font-bold leading-relaxed focus:border-vasta-accent focus:ring-2 focus:ring-vasta-accent/20 transition-all outline-none resize-none"
                                        />
                                    </div>

                                    <div className="space-y-4 pt-2">
                                        <button
                                            onClick={handleNext}
                                            className="w-full group relative flex items-center justify-center gap-3 rounded-[1.5rem] bg-vasta-accent py-5 text-base font-black text-white transition-all hover:bg-opacity-90 hover:shadow-[0_15px_30px_-5px_rgba(236,72,153,0.3)] active:scale-[0.97]"
                                        >
                                            <span>Próximo Passo</span>
                                            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1.5" />
                                        </button>
                                        <button
                                            onClick={() => setStep('USERNAME')}
                                            className="w-full text-center text-xs font-black text-slate-500 hover:text-white transition-colors py-2 uppercase tracking-widest"
                                        >
                                            Voltar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 'THEME' && (
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center animate-in fade-in slide-in-from-bottom-8 duration-700">
                                {/* Options Side */}
                                <div className="lg:col-span-7 space-y-10">
                                    <div className="space-y-4">
                                        <div className="flex h-16 w-16 items-center justify-center rounded-[1.25rem] bg-indigo-500/10 ring-1 ring-indigo-500/20">
                                            <Palette className="h-8 w-8 text-indigo-400" />
                                        </div>
                                        <div className="space-y-1 text-left">
                                            <h1 className="text-4xl md:text-5xl font-black tracking-tighter bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">
                                                Defina sua Vibe Visual
                                            </h1>
                                            <p className="text-slate-400 text-lg font-medium">
                                                Sua presença digital começa com o estilo perfeito. Escolha uma base abaixo.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {[
                                            { id: 'adaptive', name: 'Adaptativo', desc: 'Auto Dark/Light', color: 'bg-indigo-500' },
                                            { id: 'dark', name: 'Dark Space', desc: 'Premium Black', color: 'bg-slate-950 border border-slate-800' },
                                            { id: 'neo', name: 'Neo-Brutal', desc: 'Pop High-Contrast', color: 'bg-amber-400 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]' },
                                            { id: 'noir', name: 'Minimal Noir', desc: 'Zinc Dark & Silver', color: 'bg-zinc-900 border border-white/10' }
                                        ].map(theme => (
                                            <button
                                                key={theme.id}
                                                onClick={() => setFormData(prev => ({ ...prev, theme: theme.id }))}
                                                className={`relative flex flex-col items-start p-6 rounded-[2rem] border-2 transition-all group/theme text-left overflow-hidden ${formData.theme === theme.id
                                                    ? 'border-vasta-primary bg-slate-800 shadow-[0_10px_30px_-5px_rgba(99,102,241,0.2)]'
                                                    : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
                                                    }`}
                                            >
                                                <div className={`h-16 w-full rounded-2xl mb-4 ${theme.color} transition-transform duration-500 group-hover/theme:scale-[1.02] shadow-sm`} />
                                                <span className="text-lg font-black text-white uppercase tracking-tighter">{theme.name}</span>
                                                <span className="text-sm text-slate-500 font-bold mt-1 leading-tight">{theme.desc}</span>
                                                {formData.theme === theme.id && (
                                                    <div className="absolute top-4 right-4 h-6 w-6 rounded-full bg-vasta-primary flex items-center justify-center shadow-lg">
                                                        <Check className="h-4 w-4 text-white font-black" />
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="pt-4 flex flex-col sm:flex-row gap-4">
                                        <button
                                            onClick={handleComplete}
                                            disabled={loading}
                                            className="flex-1 group relative flex items-center justify-center gap-3 rounded-[1.8rem] bg-gradient-to-r from-vasta-primary to-indigo-600 py-6 text-lg font-black text-white transition-all hover:shadow-[0_20px_40px_-10px_rgba(99,102,241,0.4)] hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50"
                                        >
                                            {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : (
                                                <>
                                                    <span>Concluir e Abrir Painel</span>
                                                    <Rocket className="h-5 w-5 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
                                                </>
                                            )}
                                        </button>
                                        <button
                                            onClick={() => setStep('BIO')}
                                            className="px-8 flex items-center justify-center rounded-[1.8rem] border border-slate-800 bg-slate-900/50 text-slate-400 font-black uppercase text-xs tracking-widest hover:bg-slate-800 transition-colors"
                                        >
                                            Voltar
                                        </button>
                                    </div>
                                </div>

                                {/* Preview Side - Separated and Parallel */}
                                <div className="lg:col-span-5 hidden lg:flex justify-center items-center">
                                    <div className="relative group">
                                        <div className="absolute -inset-20 rounded-[4rem] bg-vasta-primary/5 blur-3xl opacity-60" />

                                        <div className="relative animate-float scale-110">
                                            {/* Preview Mockup Header Label */}
                                            <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/60 border border-slate-800 backdrop-blur-md shadow-xl whitespace-nowrap">
                                                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">Prévia em Tempo Real</span>
                                            </div>

                                            <OnboardingPreview
                                                username={formData.username}
                                                displayName={formData.display_name}
                                                bio={formData.bio}
                                                theme={formData.theme}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 'FINISH' && (
                            <div className="text-center py-12 animate-in zoom-in-95 duration-1000">
                                <div className="relative mx-auto mb-8 w-max">
                                    <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full" />
                                    <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 p-1 shadow-[0_20px_50px_-15px_rgba(16,185,129,0.4)]">
                                        <div className="flex h-full w-full items-center justify-center rounded-full bg-slate-950">
                                            <CheckCircle2 className="h-16 w-16 text-emerald-500 animate-in zoom-in-50 duration-500" />
                                        </div>
                                    </div>
                                </div>
                                <h1 className="text-4xl font-black mb-4 tracking-tighter">É o seu momento!</h1>
                                <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-[320px] mx-auto">
                                    Seu perfil está pronto para decolar. Prepare-se para o Dashboard.
                                </p>
                                <div className="mt-12 flex flex-col items-center gap-4">
                                    <Loader2 className="h-8 w-8 animate-spin text-vasta-primary" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">Redirecionando</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="text-center space-y-4 pt-4">
                    <p className="text-slate-700 text-[10px] font-black uppercase tracking-[0.4em]">
                        Vasta Pro &bull; {new Date().getFullYear()} &bull; Beyond Limits
                    </p>
                </div>
            </div>
        </div>
    )
}

function OnboardingPreview({ username, displayName, bio, theme }: { username: string, displayName: string, bio: string, theme: string }) {
    // Theme configs adapted from dashboard
    const themeConfigs: Record<string, any> = {
        adaptive: {
            bg: 'bg-slate-950',
            text: 'text-white',
            card: 'bg-white/5 border-white/10 shadow-xl rounded-[1.5rem]',
            link: 'bg-indigo-500 text-white rounded-2xl'
        },
        dark: {
            bg: 'bg-black',
            text: 'text-zinc-100',
            card: 'bg-zinc-900/50 border-white/5 shadow-2xl rounded-[1.5rem]',
            link: 'bg-white/10 border-white/10 text-white rounded-2xl'
        },
        neo: {
            bg: 'bg-amber-400',
            text: 'text-black',
            card: 'bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none',
            link: 'bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-none text-black'
        },
        noir: {
            bg: 'bg-[#09090b]',
            text: 'text-zinc-100',
            card: 'bg-zinc-900 border border-white/10 shadow-2xl rounded-none',
            link: 'bg-white/5 border border-white/5 text-zinc-300 rounded-sm'
        }
    }

    const config = themeConfigs[theme] || themeConfigs.adaptive

    return (
        <div className={`w-[280px] h-[560px] rounded-[3.5rem] border-[10px] border-slate-900 shadow-2xl overflow-hidden flex flex-col ${config.bg} ${config.text} transition-colors duration-500 relative`}>
            {/* Header / Cover */}
            <div className="h-32 w-full relative overflow-hidden shrink-0">
                <img
                    src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=400"
                    className="h-full w-full object-cover transform scale-110"
                    alt="Cover"
                />
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute bottom-0 w-full h-12 bg-gradient-to-t from-black/40 to-transparent" />
            </div>

            <div className="relative z-10 p-5 flex flex-col items-center -mt-12 overflow-y-auto custom-scrollbar flex-1 pb-10">
                <div className={`w-full flex flex-col items-center p-5 mb-5 backdrop-blur-md ${config.card}`}>
                    <div className={`h-16 w-16 mb-3 overflow-hidden shadow-lg ${theme === 'neo' ? 'rounded-none border-2 border-black' : 'rounded-full border-4 border-slate-900'}`}>
                        <div className="h-full w-full bg-gradient-to-tr from-vasta-primary to-vasta-accent flex items-center justify-center">
                            <span className="text-xl font-black text-white">{username ? username.slice(0, 2).toUpperCase() : 'VP'}</span>
                        </div>
                    </div>

                    <div className="text-center">
                        <h2 className="text-sm font-black truncate">{displayName || `@${username || 'seunome'}`}</h2>
                        <p className={`text-[9px] mt-1 line-clamp-2 leading-relaxed ${theme === 'noir' ? 'text-zinc-500' : 'opacity-60'}`}>
                            {bio || 'Sua bio aparecerá aqui para seus seguidores.'}
                        </p>
                    </div>
                </div>

                <div className="w-full space-y-2">
                    {[1, 2, 3].map(i => (
                        <div key={i} className={`h-10 w-full flex items-center justify-center p-2 shadow-sm ${config.link}`}>
                            <span className="text-[10px] font-black uppercase tracking-widest">Link de Exemplo {i}</span>
                        </div>
                    ))}
                </div>

                <div className="mt-8 opacity-30 text-center">
                    <p className="text-[8px] font-black uppercase tracking-[0.3em]">vasta.pro</p>
                </div>
            </div>

            {/* Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-4 w-20 bg-slate-950 rounded-b-2xl z-50 shadow-inner" />
        </div>
    )
}
