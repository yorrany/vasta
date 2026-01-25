"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckCircle2, Loader2, ArrowRight } from "lucide-react"

function CheckoutSuccessContent() {
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const searchParams = useSearchParams()
    const sessionId = searchParams.get('session_id')

    useEffect(() => {
        if (!sessionId) {
            setError('Sessão inválida')
            setLoading(false)
            return
        }

        // Verificar status da sessão
        const verifySession = async () => {
            try {
                const response = await fetch(`/api/checkout/verify?session_id=${sessionId}`)

                if (!response.ok) {
                    throw new Error('Erro ao verificar pagamento')
                }

                const data = await response.json()

                if (data.success) {
                    setLoading(false)
                    // Redirecionar para dashboard após 3 segundos
                    setTimeout(() => {
                        router.push('/dashboard')
                    }, 3000)
                } else {
                    setError('Pagamento não confirmado')
                    setLoading(false)
                }
            } catch (err) {
                setError('Erro ao verificar pagamento')
                setLoading(false)
            }
        }

        verifySession()
    }, [sessionId, router])

    if (loading) {
        return (
            <div className="min-h-screen bg-vasta-bg flex items-center justify-center p-4">
                <div className="text-center space-y-6">
                    <Loader2 className="h-16 w-16 animate-spin text-vasta-primary mx-auto" />
                    <div>
                        <h2 className="text-2xl font-bold text-vasta-text">Processando seu pagamento...</h2>
                        <p className="text-vasta-muted mt-2">Por favor, aguarde</p>
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-vasta-bg flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-vasta-surface border border-vasta-border rounded-3xl p-8 text-center">
                    <div className="mx-auto w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
                        <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-vasta-text mb-2">Ops! Algo deu errado</h2>
                    <p className="text-vasta-muted mb-8">{error}</p>
                    <button
                        onClick={() => router.push('/')}
                        className="w-full bg-vasta-text text-vasta-bg py-3 rounded-xl font-bold hover:opacity-90 transition-opacity"
                    >
                        Voltar para o início
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-vasta-bg flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-vasta-surface border border-vasta-border rounded-3xl p-8 text-center animate-in zoom-in-95 duration-500">
                <div className="mx-auto w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6">
                    <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                </div>

                <h1 className="text-3xl font-bold text-vasta-text mb-3">
                    Pagamento Confirmado! 🎉
                </h1>

                <p className="text-vasta-muted mb-8 leading-relaxed">
                    Sua assinatura foi ativada com sucesso. Você será redirecionado para o dashboard em instantes.
                </p>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="group flex items-center justify-center gap-2 w-full bg-vasta-text text-vasta-bg py-4 rounded-xl font-bold hover:opacity-90 transition-all"
                    >
                        Ir para Dashboard
                        <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </button>

                    <div className="flex items-center gap-2 justify-center text-sm text-vasta-muted">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Redirecionando automaticamente...
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function CheckoutSuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-vasta-bg flex items-center justify-center p-4">
                <div className="text-center space-y-6">
                    <Loader2 className="h-16 w-16 animate-spin text-vasta-primary mx-auto" />
                    <div>
                        <h2 className="text-2xl font-bold text-vasta-text">Carregando...</h2>
                    </div>
                </div>
            </div>
        }>
            <CheckoutSuccessContent />
        </Suspense>
    )
}
