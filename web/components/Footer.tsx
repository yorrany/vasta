"use client"

import { useState } from "react"
import Link from "next/link"
import { Instagram, Linkedin, Twitter, Loader2, Check } from "lucide-react"
import { VastaLogo } from "./VastaLogo"

export function Footer() {
    const currentYear = new Date().getFullYear()
    const [email, setEmail] = useState("")
    const [status, setStatus] = useState<"idle" | "loading" | "success">("idle")

    const [error, setError] = useState(false)

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(false)

        const trimmedEmail = email.trim().toLowerCase()
        // More robust email regex
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

        if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
            setError(true)
            return
        }

        setStatus("loading")
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500))
            setStatus("success")
            setEmail("")
        } catch (err) {
            setStatus("idle")
        }
    }

    return (
        <footer className="border-t border-vasta-border bg-vasta-bg pt-16">
            <div className="mx-auto max-w-6xl px-4">

                {/* Newsletter Section */}
                <div className="mb-16 rounded-3xl bg-vasta-surface border border-vasta-border p-8 md:p-12 relative overflow-hidden">

                    {/* Glow effect */}
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-vasta-primary/10 blur-[80px]" />

                    <div className="relative z-10 flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
                        <div className="max-w-md">
                            <h3 className="text-2xl font-bold text-vasta-text mb-2">Baixe nosso Guia Secreto</h3>
                            <p className="text-vasta-muted">Descubra como estruturar sua bio para faturar R$ 10k/mês. Digite seu melhor e-mail para receber.</p>
                        </div>
                        <form onSubmit={handleSubscribe} className="flex w-full max-w-md flex-col gap-3 sm:flex-row relative">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value.toLowerCase().trim())
                                    if (error) setError(false)
                                }}
                                disabled={status === "success" || status === "loading"}
                                placeholder="seu@email.com"
                                className={`flex-1 rounded-xl border px-4 py-3 text-vasta-text placeholder:text-vasta-muted focus:outline-none transition-all disabled:opacity-50 ${error
                                    ? "border-red-500 bg-red-500/10 ring-1 ring-red-500"
                                    : "border-vasta-border bg-vasta-surface-soft/50 focus:border-vasta-primary focus:ring-1 focus:ring-vasta-primary"
                                    }`}
                            />
                            <button
                                type="submit"
                                disabled={status === "success" || status === "loading" || !email}
                                className={`rounded-xl px-6 py-3 font-semibold text-white transition-all disabled:opacity-50 flex items-center justify-center min-w-[120px] ${error
                                    ? "bg-red-500"
                                    : "bg-gradient-to-r from-vasta-primary to-vasta-accent hover:opacity-90"
                                    }`}
                            >
                                {status === "loading" ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : status === "success" ? (
                                    <Check className="h-5 w-5" />
                                ) : error ? (
                                    "E-mail inválido"
                                ) : (
                                    "Inscrever"
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Status Badge */}
                    {status === "success" && (
                        <div className="mt-8 flex items-center gap-4 border-t border-vasta-border/50 pt-4 md:mt-0 md:border-0 md:pt-0 md:absolute md:bottom-8 md:right-12 lg:right-16 animate-fade-in-up">
                            <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 shadow-lg shadow-emerald-500/5">
                                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Inscrição realizada!</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="grid gap-12 border-t border-vasta-border py-12 md:grid-cols-2 lg:grid-cols-6">
                    <div className="lg:col-span-2">
                        <div className="flex items-center text-vasta-text">
                            <VastaLogo className="h-10 w-auto fill-current" />
                        </div>
                        <p className="mt-4 max-w-xs text-sm text-vasta-muted">
                            A plataforma de bio-links para profissionais. Unifique sua presença digital e venda mais.
                        </p>
                        <div className="mt-6 flex gap-4">
                            <a href="#" className="rounded-lg bg-vasta-surface-soft p-2 text-vasta-muted hover:bg-vasta-surface hover:text-vasta-primary transition-colors">
                                <Instagram className="h-5 w-5" />
                            </a>
                            <a href="#" className="rounded-lg bg-vasta-surface-soft p-2 text-vasta-muted hover:bg-vasta-surface hover:text-vasta-primary transition-colors">
                                <Linkedin className="h-5 w-5" />
                            </a>
                            <a href="#" className="rounded-lg bg-vasta-surface-soft p-2 text-vasta-muted hover:bg-vasta-surface hover:text-vasta-primary transition-colors">
                                <Twitter className="h-5 w-5" />
                            </a>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <h4 className="font-semibold text-vasta-text">Produto</h4>
                        <Link href="/#recursos" className="text-sm text-vasta-muted hover:text-vasta-primary">Recursos</Link>
                        <Link href="/#precos" className="text-sm text-vasta-muted hover:text-vasta-primary">Preços</Link>
                        <Link href="/exemplos" className="text-sm text-vasta-muted hover:text-vasta-primary">Exemplos</Link>
                        <Link href="/integracoes" className="text-sm text-vasta-muted hover:text-vasta-primary">Integrações</Link>
                    </div>

                    <div className="flex flex-col gap-4">
                        <h4 className="font-semibold text-vasta-text">Produto</h4>
                        <Link href="/sobre" className="text-sm text-vasta-muted hover:text-vasta-primary">Sobre nós</Link>
                        <Link href="/blog" className="text-sm text-vasta-muted hover:text-vasta-primary">Blog</Link>
                        <Link href="/carreiras" className="text-sm text-vasta-muted hover:text-vasta-primary">Carreiras</Link>
                        <Link href="/contato" className="text-sm text-vasta-muted hover:text-vasta-primary">Contato</Link>
                    </div>

                    <div className="flex flex-col gap-4">
                        <h4 className="font-semibold text-vasta-text">Recursos</h4>
                        <Link href="/ajuda" className="text-sm text-vasta-muted hover:text-vasta-primary">Central de Ajuda</Link>
                        <Link href="/docs" className="text-sm text-vasta-muted hover:text-vasta-primary">Documentação</Link>
                        <Link href="/status" className="text-sm text-vasta-muted hover:text-vasta-primary">Status</Link>
                        <Link href="/api-docs" className="text-sm text-vasta-muted hover:text-vasta-primary">API</Link>
                        <Link href="/llms.txt" className="text-sm text-vasta-muted hover:text-vasta-primary">llms.txt</Link>
                    </div>

                    <div className="flex flex-col gap-4">
                        <h4 className="font-semibold text-vasta-text">Legal</h4>
                        <Link href="/privacy" className="text-sm text-vasta-muted hover:text-vasta-primary">Privacidade</Link>
                        <Link href="/terms" className="text-sm text-vasta-muted hover:text-vasta-primary">Termos de Uso</Link>
                        <Link href="/data-deletion" className="text-sm text-vasta-muted hover:text-vasta-primary">Exclusão de Dados</Link>
                        <Link href="/instagram-data" className="text-sm text-vasta-muted hover:text-vasta-primary">Dados do Instagram</Link>
                        <Link href="/legal/lgpd" className="text-sm text-vasta-muted hover:text-vasta-primary">Padrão LGPD</Link>
                        <Link href="/legal/cookies" className="text-sm text-vasta-muted hover:text-vasta-primary">Cookies</Link>
                    </div>
                </div>

                <div className="border-t border-vasta-border py-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-xs text-vasta-muted">
                            YORRANY MARTINS BRAGA LTDA - CNPJ: 63.839.428/0001-04 - (92) 98101-5056
                        </p>
                        <div className="flex gap-6 text-xs text-vasta-muted">
                            <Link href="/legal/privacidade" className="hover:text-vasta-text">Privacidade</Link>
                            <Link href="/legal/termos" className="hover:text-vasta-text">Termos</Link>
                            <Link href="/legal/lgpd" className="hover:text-vasta-text">LGPD</Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}
