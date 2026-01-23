"use client"

import Link from 'next/link'
import { ReactNode } from 'react'
import { ChevronLeft } from 'lucide-react'

interface LegalLayoutProps {
    title: string
    description?: string
    lastUpdated?: string
    children: ReactNode
}

export function LegalLayout({ title, description, lastUpdated, children }: LegalLayoutProps) {
    return (
        <div className="min-h-screen bg-vasta-bg font-sans">
            {/* Header */}
            <header className="border-b border-vasta-border bg-vasta-surface/80 backdrop-blur-sm sticky top-0 z-50">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-sm text-vasta-muted hover:text-vasta-primary transition-colors group"
                    >
                        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span>Voltar para o início</span>
                    </Link>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Title Section */}
                <div className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-vasta-text mb-3">
                        {title}
                    </h1>
                    {description && (
                        <p className="text-lg text-vasta-muted max-w-3xl">
                            {description}
                        </p>
                    )}
                    {lastUpdated && (
                        <p className="text-sm text-vasta-muted mt-4 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Última atualização: {lastUpdated}
                        </p>
                    )}
                </div>

                {/* Content */}
                <div className="prose prose-stone dark:prose-invert max-w-none">
                    <div className="space-y-8">
                        {children}
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-16 pt-8 border-t border-vasta-border">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-sm text-vasta-muted">
                            © 2026 YORRANY MARTINS BRAGA LTDA - Vasta Pro
                        </p>
                        <div className="flex gap-4 text-sm">
                            <Link href="/privacy" className="text-vasta-muted hover:text-vasta-primary transition-colors">
                                Privacidade
                            </Link>
                            <Link href="/terms" className="text-vasta-muted hover:text-vasta-primary transition-colors">
                                Termos
                            </Link>
                            <Link href="/data-deletion" className="text-vasta-muted hover:text-vasta-primary transition-colors">
                                Exclusão de Dados
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

// Section Component
export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section>
            <h2 className="text-2xl font-semibold text-vasta-text mb-4">
                {title}
            </h2>
            <div className="text-vasta-text-soft leading-relaxed space-y-4">
                {children}
            </div>
        </section>
    )
}

// Subsection Component
export function LegalSubsection({ title, children }: { title?: string; children: ReactNode }) {
    return (
        <div className="ml-4">
            {title && (
                <h3 className="text-xl font-semibold text-vasta-text mb-3">
                    {title}
                </h3>
            )}
            <div className="text-vasta-text-soft leading-relaxed space-y-3">
                {children}
            </div>
        </div>
    )
}

// Feature Box Component
export function LegalFeatureBox({
    variant = 'default',
    title,
    children
}: {
    variant?: 'default' | 'primary' | 'accent' | 'warning' | 'success'
    title?: string
    children: ReactNode
}) {
    const variants = {
        default: 'bg-vasta-surface border-vasta-border',
        primary: 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-900',
        accent: 'bg-pink-50 dark:bg-pink-950/30 border-pink-200 dark:border-pink-900',
        warning: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900',
        success: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900'
    }

    return (
        <div className={`${variants[variant]} border rounded-xl p-6`}>
            {title && <h3 className="font-semibold text-vasta-text mb-3">{title}</h3>}
            <div className="text-vasta-text-soft leading-relaxed space-y-2">
                {children}
            </div>
        </div>
    )
}
