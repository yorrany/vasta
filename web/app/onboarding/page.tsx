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
    AlertCircle
} from "lucide-react"

type Step = 'USERNAME' | 'BIO' | 'THEME' | 'FINISH'

export default function OnboardingPage() {
    const [step, setStep] = useState<Step>('USERNAME')
    const [loading, setLoading] = useState(false)
    const [checkingUsername, setCheckingUsername] = useState(false)
    const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)

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
                router.push("/login")
                return
            }

            // Pre-fill email prefix as suggested username
            if (user.email && !formData.username) {
                const prefix = user.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
                setFormData(prev => ({ ...prev, username: prefix, display_name: user.user_metadata?.full_name || prefix }))
            }
        }
        checkUser()
    }, [])

    const checkUsername = async (val: string) => {
        if (val.length < 3) {
            setUsernameAvailable(null)
            return
        }
        setCheckingUsername(true)
        const { data } = await supabase
            .from('profiles')
            .select('username')
            .eq('username', val)
            .maybeSingle()

        setUsernameAvailable(!data)
        setCheckingUsername(false)
    }

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
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center px-4 py-12 overflow-hidden">
            {/* Background Decor */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-vasta-primary/5 blur-[120px]" />
                <div className="absolute bottom-0 right-1/4 h-[500px] w-[500px] rounded-full bg-vasta-accent/5 blur-[120px]" />
            </div>

            <div className="w-full max-w-[500px] space-y-8 relative">
                {/* Progress Bar */}
                <div className="flex justify-between items-center mb-12 px-2">
                    {['USERNAME', 'BIO', 'THEME', 'FINISH'].map((s, idx) => {
                        const isActive = step === s
                        const isCompleted = ['USERNAME', 'BIO', 'THEME', 'FINISH'].indexOf(step) > idx
                        return (
                            <div key={s} className="flex flex-col items-center gap-2">
                                <div className={`h-1.5 w-24 rounded-full transition-all duration-500 ${isActive || isCompleted ? 'bg-vasta-primary' : 'bg-slate-800'
                                    }`} />
                                <span className={`text-[10px] font-bold uppercase tracking-widest ${isActive ? 'text-vasta-primary' : 'text-slate-600'}`}>
                                    Passo {idx + 1}
                                </span>
                            </div>
                        )
                    })}
                </div>

                <div className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-8 md:p-10 backdrop-blur-xl shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {step === 'USERNAME' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="text-center">
                                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-vasta-primary/10">
                                    <User className="h-7 w-7 text-vasta-primary" />
                                </div>
                                <h1 className="text-2xl font-black">Escolha seu @username</h1>
                                <p className="text-slate-400 text-sm mt-2">Como seus fãs vão te encontrar na web</p>
                            </div>

                            <div className="space-y-4">
                                <div className="relative group">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold transition-colors group-focus-within:text-vasta-primary">vasta.pro/</span>
                                    <input
                                        type="text"
                                        value={formData.username}
                                        onChange={(e) => {
                                            const val = e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '')
                                            setFormData(prev => ({ ...prev, username: val }))
                                            checkUsername(val)
                                        }}
                                        placeholder="seunome"
                                        className="w-full rounded-2xl border border-slate-700 bg-slate-800/50 py-4 pl-[84px] pr-12 text-white font-bold focus:border-vasta-primary focus:ring-1 focus:ring-vasta-primary transition-all"
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                        {checkingUsername ? <Loader2 className="h-5 w-5 animate-spin text-slate-500" /> :
                                            usernameAvailable === true ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> :
                                                usernameAvailable === false ? <AlertCircle className="h-5 w-5 text-red-500" /> : null}
                                    </div>
                                </div>
                                {usernameAvailable === false && <p className="text-xs text-red-400 px-1">Este nome já está em uso. Tente outro.</p>}

                                <button
                                    onClick={handleNext}
                                    disabled={!usernameAvailable || checkingUsername}
                                    className="w-full group flex items-center justify-center gap-2 rounded-2xl bg-white py-4 text-sm font-bold text-slate-950 transition-all hover:bg-slate-200 active:scale-[0.98] disabled:opacity-50"
                                >
                                    Continuar
                                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 'BIO' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="text-center">
                                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-vasta-accent/10">
                                    <Sparkles className="h-7 w-7 text-vasta-accent" />
                                </div>
                                <h1 className="text-2xl font-black">Personalize seu perfil</h1>
                                <p className="text-slate-400 text-sm mt-2">Diga ao mundo quem você é</p>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Nome de Exibição</label>
                                    <input
                                        type="text"
                                        value={formData.display_name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                                        placeholder="Seu Nome"
                                        className="w-full rounded-xl border border-slate-700 bg-slate-800/50 py-3.5 px-4 text-white focus:border-vasta-accent transition-all"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Bio Curta</label>
                                    <textarea
                                        value={formData.bio}
                                        onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                                        placeholder="Ex: Criador de conteúdo e apaixonado por tecnologia"
                                        rows={3}
                                        className="w-full rounded-xl border border-slate-700 bg-slate-800/50 py-3.5 px-4 text-white focus:border-vasta-accent transition-all resize-none"
                                    />
                                </div>

                                <button
                                    onClick={handleNext}
                                    className="w-full group flex items-center justify-center gap-2 rounded-2xl bg-white py-4 text-sm font-bold text-slate-950 transition-all hover:bg-slate-200 active:scale-[0.98]"
                                >
                                    Próximo passo
                                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </button>
                                <button
                                    onClick={() => setStep('USERNAME')}
                                    className="w-full text-center text-xs text-slate-500 hover:text-white"
                                >
                                    Voltar
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 'THEME' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="text-center">
                                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-vasta-primary/10">
                                    <Palette className="h-7 w-7 text-vasta-primary" />
                                </div>
                                <h1 className="text-2xl font-black">Escolha um estilo</h1>
                                <p className="text-slate-400 text-sm mt-2">Você poderá mudar isso depois</p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { id: 'adaptive', name: 'Adaptativo', color: 'bg-slate-800' },
                                    { id: 'dark', name: 'Dark Mode', color: 'bg-black border border-slate-800' },
                                    { id: 'neo', name: 'Neo-Brutal', color: 'bg-amber-400 border-2 border-black' },
                                    { id: 'noir', name: 'Noir', color: 'bg-zinc-900' }
                                ].map(theme => (
                                    <button
                                        key={theme.id}
                                        onClick={() => setFormData(prev => ({ ...prev, theme: theme.id }))}
                                        className={`relative p-4 rounded-2xl border-2 transition-all text-left ${formData.theme === theme.id ? 'border-vasta-primary bg-slate-800' : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
                                            }`}
                                    >
                                        <div className={`h-12 w-full rounded-lg mb-2 ${theme.color} opacity-80`} />
                                        <span className="text-xs font-bold">{theme.name}</span>
                                        {formData.theme === theme.id && <Check className="absolute top-2 right-2 h-4 w-4 text-vasta-primary" />}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={handleComplete}
                                disabled={loading}
                                className="w-full group flex items-center justify-center gap-2 rounded-2xl bg-vasta-primary py-4 text-sm font-bold text-white transition-all hover:bg-vasta-primary/90 active:scale-[0.98] disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                                    <>
                                        Finalizar Criação
                                        <Rocket className="h-4 w-4 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                    {step === 'FINISH' && (
                        <div className="text-center py-8 animate-in zoom-in-95 duration-500">
                            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500/10">
                                <CheckCircle2 className="h-16 w-16 text-emerald-500" />
                            </div>
                            <h1 className="text-3xl font-black mb-4">Tudo pronto!</h1>
                            <p className="text-slate-400 leading-relaxed">
                                Seu perfil está sendo ativado. <br />
                                Estamos te levando para o seu novo dashboard.
                            </p>
                            <div className="mt-8 flex justify-center">
                                <Loader2 className="h-6 w-6 animate-spin text-vasta-primary" />
                            </div>
                        </div>
                    )}
                </div>

                <p className="text-center text-slate-600 text-xs font-bold uppercase tracking-[0.2em]">
                    Vasta Pro • Sua Presença Digital
                </p>
            </div>
        </div>
    )
}
