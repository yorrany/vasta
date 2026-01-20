"use client"

import { useState, useEffect } from "react"
import { createClient } from "../../lib/supabase/client"
import {
  Github,
  Mail,
  Loader2,
  ArrowRight,
  Lock,
  Linkedin,
  Facebook,
  ChevronLeft,
  ShieldCheck,
  CheckCircle2
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

type Step = 'EMAIL' | 'PASSWORD' | 'SIGNUP_OPTIONS' | 'SUCCESS'

export default function LoginPage() {
  const [step, setStep] = useState<Step>('EMAIL')
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()
  const router = useRouter()

  const handleContinueEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data } = await supabase
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
      router.push("/dashboard")
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
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12">
      {/* Background Decor */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-vasta-primary/5 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 h-[500px] w-[500px] rounded-full bg-vasta-accent/5 blur-[120px]" />
      </div>

      <div className="w-full max-w-[440px] space-y-8 animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 transition-opacity hover:opacity-80">
            <img src="/logo.svg" alt="Vasta Logo" className="h-10 w-auto dark:hidden" />
            <img src="/logo_branca.svg" alt="Vasta Logo" className="h-10 w-auto hidden dark:block" />
          </Link>
        </div>

        <div className="relative overflow-hidden rounded-[2.5rem] border border-slate-800 bg-slate-900/50 p-8 shadow-2xl backdrop-blur-xl md:p-10">
          <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-vasta-primary to-vasta-accent" />

          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-vasta-primary/10 shadow-inner">
              <ShieldCheck className="h-6 w-6 text-vasta-primary" />
            </div>
            <h1 className="text-2xl font-black text-white">
              {step === 'SUCCESS' ? 'Verifique seu e-mail' :
                step === 'PASSWORD' ? 'Acessar minha conta' :
                  step === 'SIGNUP_OPTIONS' ? 'Criar conta gratuita' :
                    'Bem-vindo ao Vasta'}
            </h1>
            <p className="mt-2 text-sm text-vasta-muted">
              {step === 'EMAIL' && 'O hub definitivo para sua presença digital'}
              {step === 'PASSWORD' && `Entrando como ${email}`}
              {step === 'SIGNUP_OPTIONS' && 'Escolha como deseja começar sua jornada'}
              {step === 'SUCCESS' && 'Enviamos um link de acesso para você.'}
            </p>
          </div>

          {step === 'EMAIL' && (
            <form onSubmit={handleContinueEmail} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <input
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Seu melhor e-mail"
                  className="w-full rounded-2xl border border-slate-700 bg-slate-800/50 py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:border-vasta-primary focus:ring-1 focus:ring-vasta-primary transition-all font-sans"
                />
              </div>

              {error && <p className="text-xs text-red-400 px-1">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-white py-4 text-sm font-bold text-slate-950 transition-all hover:bg-slate-200 disabled:opacity-50"
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
                  <div className="w-full border-t border-slate-800"></div>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
                  <span className="bg-[#121826] px-4 text-slate-500">Ou continuar com</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleOAuth('google')}
                  className="flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/50 py-3.5 text-sm font-semibold text-white transition-all hover:bg-slate-800"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Google
                </button>
                <button
                  type="button"
                  onClick={() => handleOAuth('linkedin')}
                  className="flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/50 py-3.5 text-sm font-semibold text-white transition-all hover:bg-slate-800"
                >
                  <Linkedin className="h-5 w-5 text-[#0A66C2]" fill="currentColor" />
                  LinkedIn
                </button>
                <button
                  type="button"
                  onClick={() => handleOAuth('github')}
                  className="flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/50 py-3.5 text-sm font-semibold text-white transition-all hover:bg-slate-800"
                >
                  <Github className="h-5 w-5 text-white" fill="currentColor" />
                  GitHub
                </button>
                <button
                  type="button"
                  onClick={() => handleOAuth('facebook')}
                  className="flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/50 py-3.5 text-sm font-semibold text-white transition-all hover:bg-slate-800"
                >
                  <Facebook className="h-5 w-5 text-[#1877F2]" fill="currentColor" />
                  Facebook
                </button>
              </div>
            </form>
          )}

          {step === 'PASSWORD' && (
            <form onSubmit={handleLogin} className="space-y-4 animate-in slide-in-from-right-4 duration-300">
              <button
                type="button"
                onClick={() => setStep('EMAIL')}
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-white transition-colors"
              >
                <ChevronLeft className="h-3 w-3" />
                Mudar e-mail
              </button>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <input
                  type="password"
                  required
                  autoFocus
                  placeholder="Sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-800/50 py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:border-vasta-primary focus:ring-1 focus:ring-vasta-primary transition-all font-sans"
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
                className="w-full text-center text-xs text-slate-500 hover:text-white underline decoration-slate-700"
              >
                Entrar com Magic Link
              </button>
            </form>
          )}

          {step === 'SIGNUP_OPTIONS' && (
            <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
              <button
                type="button"
                onClick={() => setStep('EMAIL')}
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-white transition-colors"
              >
                <ChevronLeft className="h-3 w-3" />
                Mudar e-mail
              </button>

              <button
                onClick={handleMagicLink}
                disabled={loading}
                className="group flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-700 bg-slate-800/20 py-4 text-sm font-bold text-white transition-all hover:bg-slate-800/40"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Continuar com Magic Link (E-mail)"}
              </button>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
                <h4 className="text-sm font-bold text-white mb-2 font-sans">Criar com senha</h4>
                <div className="space-y-3">
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input
                      type="password"
                      placeholder="Escolha uma senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-800/40 py-2.5 pl-10 pr-4 text-sm text-white focus:border-vasta-primary font-sans"
                    />
                  </div>
                  <button
                    onClick={handleLogin}
                    className="w-full rounded-xl bg-white py-2.5 text-xs font-bold text-slate-950 hover:bg-slate-200"
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
              <p className="text-slate-300 leading-relaxed mb-8 text-sm">
                Enviamos um link mágico para <strong>{email}</strong>. <br />
                Clique no link e você será conectado instantaneamente.
              </p>
              <Link
                href="/"
                className="block w-full rounded-2xl border border-slate-800 bg-slate-800/50 py-4 text-sm font-bold text-white hover:bg-slate-800 transition-colors"
              >
                Voltar ao início
              </Link>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-slate-600 font-bold uppercase tracking-widest">
          Sem cartão de crédito • Cancelamento a qualquer momento
        </p>

        <p className="text-center text-sm text-vasta-muted">
          Precisa de ajuda?{" "}
          <Link href="/ajuda" className="font-bold text-white hover:underline transition-colors">
            Central de Suporte
          </Link>
        </p>
      </div>
    </div>
  )
}
