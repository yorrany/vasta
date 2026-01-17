"use client"

import { useState, useEffect } from "react"
import { 
  X, 
  Mail, 
  Lock, 
  Loader2, 
  ArrowRight, 
  ChevronLeft, 
  Linkedin,
  CheckCircle2,
  MoreHorizontal,
  ShieldCheck
} from "lucide-react"
import { createClient } from "../lib/supabase"
import { useRouter } from "next/navigation"
import { useAuth } from "../lib/AuthContext"

type Step = 'EMAIL' | 'PASSWORD' | 'SIGNUP_OPTIONS' | 'SUCCESS'

export function AuthModal() {
  const { isOpen, closeAuthModal, mode, contextualCTA } = useAuth()
  const [step, setStep] = useState<Step>('EMAIL')
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showMoreSocial, setShowMoreSocial] = useState(false)
  
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    if (isOpen) {
      setStep('EMAIL')
      setError(null)
      setLoading(false)
      setEmail("")
      setPassword("")
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleContinueEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
        // Progressive logic: Check if email exists
        const { data, error: checkError } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', email)
            .maybeSingle()

        if (data) {
            setStep('PASSWORD')
        } else {
            setStep('SIGNUP_OPTIONS')
        }
    } catch (err) {
        setStep('SIGNUP_OPTIONS')
    } finally {
        setLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (loginError) {
      setError(loginError.message === "Invalid login credentials" ? "Senha incorreta. Tente novamente." : loginError.message)
      setLoading(false)
    } else {
      router.refresh()
      closeAuthModal()
    }
  }

  const handleMagicLink = async () => {
    setLoading(true)
    const { error: magicError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      }
    })

    if (magicError) {
      setError(magicError.message)
      setLoading(false)
    } else {
      setStep('SUCCESS')
      setLoading(false)
    }
  }

  const handleOAuth = async (provider: 'google' | 'linkedin' | 'github' | 'facebook') => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      }
    })
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className="relative w-full max-w-[440px] overflow-hidden rounded-[2.5rem] border border-vasta-border bg-vasta-surface shadow-2xl animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 h-1.5 w-full bg-gradient-to-r from-vasta-primary to-vasta-accent" />
        
        <button 
          onClick={closeAuthModal}
          className="absolute right-6 top-6 rounded-full p-2 text-vasta-muted hover:bg-vasta-surface-soft hover:text-vasta-text transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-8 pt-12 md:p-10 md:pt-14">
          <div className="mb-8 text-center">
             <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-vasta-primary/10 shadow-inner">
                <ShieldCheck className="h-6 w-6 text-vasta-primary" />
             </div>
             <h2 className="text-2xl font-black text-vasta-text">
                {step === 'SUCCESS' ? 'Verifique seu e-mail' : 
                 step === 'PASSWORD' ? 'Acessar minha conta' : 
                 step === 'SIGNUP_OPTIONS' ? 'Criar conta gratuita' : 
                 contextualCTA || (mode === 'login' ? 'Bem-vindo de volta' : 'Bem-vindo ao Vasta')}
             </h2>
             <p className="mt-2 text-sm text-vasta-muted">
                {step === 'EMAIL' && 'Sem cartão de crédito • Leva menos de 1 minuto'}
                {step === 'PASSWORD' && `Entrando como ${email}`}
                {step === 'SIGNUP_OPTIONS' && 'Escolha como deseja começar sua jornada'}
                {step === 'SUCCESS' && 'Enviamos um link de acesso para você.'}
             </p>
          </div>

          {step === 'EMAIL' && (
            <form onSubmit={handleContinueEmail} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-vasta-muted" />
                <input
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Seu melhor e-mail"
                  className="w-full rounded-2xl border border-vasta-border bg-vasta-surface-soft/50 py-4 pl-12 pr-4 text-vasta-text placeholder:text-vasta-muted focus:border-vasta-primary focus:ring-1 focus:ring-vasta-primary transition-all font-sans"
                />
              </div>

              {error && <p className="text-xs text-red-400 px-1">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-vasta-text py-4 text-sm font-bold text-vasta-bg transition-all hover:bg-vasta-text/90 disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                  <>
                    Continuar
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-vasta-border"></div>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
                  <span className="bg-vasta-surface px-4 text-vasta-muted">Ou continuar com</span>
                </div>
              </div>

              <div className="space-y-3">
                <button 
                  type="button"
                  onClick={() => handleOAuth('google')}
                  className="flex w-full items-center justify-center gap-3 rounded-2xl border border-vasta-border bg-vasta-surface-soft/50 py-3.5 text-sm font-semibold text-vasta-text transition-all hover:bg-vasta-surface-soft"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Continuar com Google
                </button>
                <button 
                  type="button"
                  onClick={() => handleOAuth('linkedin')}
                  className="flex w-full items-center justify-center gap-3 rounded-2xl border border-vasta-border bg-vasta-surface-soft/50 py-3.5 text-sm font-semibold text-vasta-text transition-all hover:bg-vasta-surface-soft"
                >
                  <Linkedin className="h-5 w-5 text-[#0A66C2]" fill="currentColor" />
                  Continuar com LinkedIn
                </button>

                {!showMoreSocial ? (
                  <button 
                    type="button"
                    onClick={() => setShowMoreSocial(true)}
                    className="flex w-full items-center justify-center gap-2 py-2 text-[10px] font-bold uppercase tracking-widest text-vasta-muted hover:text-vasta-text transition-colors"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                    Mais opções
                  </button>
                ) : (
                  <div className="flex justify-center gap-4 animate-in slide-in-from-top-2 duration-300">
                     <button onClick={() => handleOAuth('github')} className="rounded-xl border border-vasta-border p-3 text-vasta-muted hover:text-vasta-text transition-colors">
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.85 10.91.57.11.78-.25.78-.55v-1.94c-3.19.69-3.86-1.54-3.86-1.54-.52-1.32-1.28-1.67-1.28-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.68 1.24 3.34.95.1-.76.41-1.28.75-1.57-2.55-.29-5.23-1.28-5.23-5.69 0-1.26.45-2.28 1.18-3.08-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.17 1.18.92-.26 1.9-.39 2.88-.39.98 0 1.96.13 2.88.39 2.2-1.5 3.17-1.18 3.17-1.18.62 1.58.23 2.75.11 3.04.74.8 1.18 1.83 1.18 3.08 0 4.42-2.69 5.39-5.25 5.68.41.35.78 1.04.78 2.1v3.11c0 .3.21.67.79.55C20.71 21.39 24 17.08 24 12c0-6.35-5.15-11.5-11.5-11.5z"/></svg>
                     </button>
                     <button onClick={() => handleOAuth('facebook')} className="rounded-xl border border-vasta-border p-3 text-vasta-muted hover:text-vasta-text transition-colors">
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                     </button>
                  </div>
                )}
              </div>
            </form>
          )}

          {step === 'PASSWORD' && (
            <form onSubmit={handleLogin} className="space-y-4 animate-in slide-in-from-right-4 duration-300">
               <button 
                type="button"
                onClick={() => setStep('EMAIL')}
                className="flex items-center gap-1 text-xs text-vasta-muted hover:text-vasta-text transition-colors"
               >
                 <ChevronLeft className="h-3 w-3" />
                 Mudar e-mail
               </button>

               <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-vasta-muted" />
                <input
                  type="password"
                  required
                  autoFocus
                  placeholder="Sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl border border-vasta-border bg-vasta-surface-soft/50 py-4 pl-12 pr-4 text-vasta-text placeholder:text-vasta-muted focus:border-vasta-primary focus:ring-1 focus:ring-vasta-primary transition-all font-sans"
                />
              </div>

              {error && <p className="text-xs text-red-400 px-1">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-vasta-primary py-4 text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Acessar minha conta"}
              </button>

              <button 
                type="button"
                onClick={handleMagicLink}
                className="w-full text-center text-xs text-vasta-muted hover:text-vasta-text underline decoration-vasta-border"
              >
                Esqueci minha senha ou entrar com Magic Link
              </button>
            </form>
          )}

          {step === 'SIGNUP_OPTIONS' && (
            <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
               <button 
                type="button"
                onClick={() => setStep('EMAIL')}
                className="flex items-center gap-1 text-xs text-vasta-muted hover:text-vasta-text transition-colors"
               >
                 <ChevronLeft className="h-3 w-3" />
                 Mudar e-mail
               </button>

               <button
                onClick={handleMagicLink}
                disabled={loading}
                className="group flex w-full items-center justify-center gap-2 rounded-2xl border border-vasta-border bg-vasta-surface-soft/20 py-4 text-sm font-bold text-vasta-text transition-all hover:bg-vasta-surface-soft/40"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Continuar com Magic Link (E-mail)"}
              </button>

               <div className="rounded-2xl border border-vasta-border bg-vasta-surface/50 p-6">
                  <h4 className="text-sm font-bold text-vasta-text mb-2 font-sans">Criar com senha</h4>
                  <div className="space-y-3">
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-vasta-muted" />
                      <input
                        type="password"
                        placeholder="Escolha uma senha"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-xl border border-vasta-border bg-vasta-surface-soft/40 py-2.5 pl-10 pr-4 text-sm text-vasta-text focus:border-vasta-primary font-sans"
                      />
                    </div>
                    <button
                      onClick={handleLogin}
                      className="w-full rounded-xl bg-vasta-text py-2.5 text-xs font-bold text-vasta-bg hover:opacity-90"
                    >
                      Criar conta gratuita
                    </button>
                  </div>
               </div>
            </div>
          )}

          {step === 'SUCCESS' && (
            <div className="text-center animate-in zoom-in-95 duration-500">
               <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10">
                  <CheckCircle2 className="h-10 w-10 text-emerald-500" />
               </div>
               <p className="text-vasta-text-soft leading-relaxed mb-8 text-sm">
                 Enviamos um link mágico para <strong>{email}</strong>. <br/>
                 Clique no link e você será conectado instantaneamente.
               </p>
               <button 
                onClick={closeAuthModal}
                className="w-full rounded-2xl border border-vasta-border bg-vasta-surface-soft/50 py-4 text-sm font-bold text-vasta-text hover:bg-vasta-surface-soft transition-colors"
               >
                 Fechar janelas
               </button>
            </div>
          )}

          {step !== 'SUCCESS' && (
            <div className="mt-10 border-t border-vasta-border pt-6 text-center">
              <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-vasta-muted">
                Sem cartão de crédito • Cancelamento a qualquer momento
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
