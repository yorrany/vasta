"use client"

import { useState, useEffect } from "react"
import { Check, CreditCard, Zap, Shield, Star, Clock, Loader2 } from "lucide-react"
import { PLANS } from "@/lib/plans"
import { createClient } from "@/lib/supabase/client"
import { CheckoutModal } from "@/components/CheckoutModal"

export default function BillingPage() {
    const [currentPlan, setCurrentPlan] = useState<string>('start')
    const [loading, setLoading] = useState(true)
    const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)
    const [clientSecret, setClientSecret] = useState<string | null>(null)
    const [billingCycle] = useState<'monthly' | 'yearly'>('monthly')

    useEffect(() => {
        const fetchCurrentPlan = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('plan_code')
                    .eq('id', user.id)
                    .single()

                if (profile?.plan_code) {
                    setCurrentPlan(profile.plan_code)
                }
            }

            setLoading(false)
        }

        fetchCurrentPlan()
    }, [])

    const handleUpgrade = async (planCode: string) => {
        if (planCode === 'start' || planCode === currentPlan) {
            return
        }

        setCheckoutLoading(planCode)

        try {
            const response = await fetch('/api/checkout/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    planCode,
                    billingCycle
                })
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Erro ao criar checkout')
            }

            const data = await response.json()

            if (data.clientSecret) {
                setClientSecret(data.clientSecret)
            }
        } catch (error) {
            console.error('Erro ao criar checkout:', error)
            alert('Erro ao processar upgrade. Por favor, tente novamente.')
        } finally {
            setCheckoutLoading(null)
        }
    }

    return (
        <>
            <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">

                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-vasta-text">Assinatura e Cobrança</h1>
                    <p className="text-sm text-vasta-muted">Gerencie seu plano e veja seu histórico de pagamentos.</p>
                </div>

                {/* Current Plan Status */}
                <div className="bg-gradient-to-br from-stone-900 via-stone-800 to-black text-white rounded-[2rem] p-8 relative overflow-hidden shadow-xl">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                    {/* Glow effect */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-vasta-primary/30 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>

                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-bold mb-4 backdrop-blur-sm">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                Plano Atual
                            </div>
                            <h2 className="text-3xl font-black mb-2">
                                {PLANS.find(p => p.code === currentPlan)?.name || 'Vasta'}
                            </h2>
                            <p className="text-gray-400 text-sm max-w-md">
                                {currentPlan === 'start'
                                    ? 'Você está no plano gratuito. Faça upgrade para desbloquear taxas reduzidas e recursos exclusivos.'
                                    : 'Aproveite todos os recursos do seu plano! 🚀'
                                }
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 min-w-[200px]">
                            <div className="flex items-center justify-between text-xs font-medium text-gray-400">
                                <span>Renovação</span>
                                <span>{currentPlan === 'start' ? 'Vitalício' : 'Mensal'}</span>
                            </div>
                            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                                <div className="bg-emerald-500 w-full h-full"></div>
                            </div>
                            <p className="text-[10px] text-right text-emerald-500 font-bold">Ativo</p>
                        </div>
                    </div>
                </div>

                {/* Plans Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {PLANS.map((plan) => {
                        const isCurrent = plan.code === currentPlan
                        const isDowngrade = PLANS.findIndex(p => p.code === currentPlan) > PLANS.findIndex(p => p.code === plan.code)
                        const isLoading = checkoutLoading === plan.code
                        const price = plan.price.monthly

                        return (
                            <div
                                key={plan.code}
                                className={`rounded-2xl border p-6 transition-all duration-300 ${isCurrent
                                        ? 'opacity-60 grayscale filter'
                                        : plan.code === 'pro'
                                            ? 'border-vasta-primary/50 bg-vasta-surface relative shadow-lg shadow-vasta-primary/5 scale-[1.02]'
                                            : 'border-vasta-border bg-vasta-surface hover:border-vasta-text/20'
                                    }`}
                            >
                                {plan.code === 'pro' && !isCurrent && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-vasta-primary text-white text-[10px] font-bold rounded-full shadow-md">
                                        RECOMENDADO
                                    </div>
                                )}

                                <h3 className="text-lg font-bold text-vasta-text mb-2">{plan.name}</h3>
                                <p className="text-2xl font-black text-vasta-text mb-4">
                                    R$ {price}
                                    <span className="text-sm font-normal text-vasta-muted">/mês</span>
                                </p>

                                <ul className="space-y-3 mb-8">
                                    {plan.features.slice(0, 4).map((feature, idx) => (
                                        <li key={idx} className="flex items-center gap-2 text-xs text-vasta-text">
                                            <Check size={14} className={plan.code === 'pro' && !isCurrent ? 'text-vasta-primary' : 'text-vasta-text'} />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    disabled={isCurrent || isDowngrade || isLoading}
                                    onClick={() => handleUpgrade(plan.code)}
                                    className={`w-full py-2 rounded-xl text-xs font-bold transition-transform shadow-lg ${isCurrent
                                            ? 'bg-vasta-surface-soft border border-vasta-border text-vasta-muted cursor-default'
                                            : isDowngrade
                                                ? 'bg-vasta-surface-soft border border-vasta-border text-vasta-muted cursor-not-allowed opacity-50'
                                                : plan.code === 'pro'
                                                    ? 'bg-vasta-text text-vasta-bg hover:scale-105'
                                                    : 'bg-vasta-surface-soft hover:bg-vasta-text hover:text-vasta-bg border border-vasta-border'
                                        }`}
                                >
                                    {isLoading ? (
                                        <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                                    ) : isCurrent ? (
                                        'Plano Atual'
                                    ) : isDowngrade ? (
                                        'Indisponível'
                                    ) : (
                                        plan.code === 'start' ? 'Plano Gratuito' : plan.code === 'business' ? 'Contactar Vendas' : 'Fazer Upgrade'
                                    )}
                                </button>
                            </div>
                        )
                    })}
                </div>

                {/* History */}
                <div className="pt-8">
                    <h3 className="text-lg font-bold text-vasta-text mb-4">Histórico de Cobrança</h3>
                    <div className="rounded-2xl border border-vasta-border bg-vasta-surface overflow-hidden">
                        <div className="p-8 text-center flex flex-col items-center justify-center text-vasta-muted">
                            <Clock className="w-8 h-8 mb-3 opacity-50" />
                            <p className="text-sm font-medium">Nenhuma fatura gerada</p>
                            <p className="text-xs opacity-70">Suas faturas aparecerão aqui.</p>
                        </div>
                    </div>
                </div>

            </div>

            {clientSecret && (
                <CheckoutModal
                    clientSecret={clientSecret}
                    onClose={() => setClientSecret(null)}
                />
            )}
        </>
    )
}
