"use client"

import { useState, useEffect } from "react"
import { Check, X, Loader2 } from "lucide-react"
import { useAuth } from "../lib/AuthContext"
import { CheckoutModal } from "./CheckoutModal"

type PlanFeature = {
  name: string
  included: boolean
}

type Plan = {
  code: string
  name: string
  price: {
    monthly: number
    yearly: number
  }
  transaction_fee_percent: number
  offer_limit: number | null
  admin_user_limit: number | null
  features: string[]
}

export function Pricing() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly")
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [clientSecret, setClientSecret] = useState<string | null>(null)

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
        const res = await fetch(`${apiUrl}/plans`);
        if (!res.ok) throw new Error("API Offline");
        const data = await res.json();
        setPlans(data);
      } catch (err) {
        console.error("Error fetching plans:", err);
        // Fallback with high fidelity plans if backend is offline
        setPlans([
          {
            code: "start",
            name: "Começo",
            price: { monthly: 0, yearly: 0 },
            transaction_fee_percent: 8,
            offer_limit: 3,
            admin_user_limit: null,
            features: ["Até 3 produtos", "Checkout transparente"]
          },
          {
            code: "pro",
            name: "Pro",
            price: { monthly: 49, yearly: 38 },
            transaction_fee_percent: 4,
            offer_limit: 10,
            admin_user_limit: null,
            features: ["Até 10 produtos", "Sem marca d'água"]
          },
          {
            code: "business",
            name: "Business",
            price: { monthly: 99, yearly: 87 },
            transaction_fee_percent: 1,
            offer_limit: null,
            admin_user_limit: null,
            features: ["Produtos ilimitados", "Suporte VIP", "Analytics avançado"]
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const getUiFeatures = (plan: Plan): PlanFeature[] => {
    const isStart = plan.code === "start"
    const isPro = plan.code === "pro"
    
    return [
      { name: plan.offer_limit ? `Até ${plan.offer_limit} produtos` : "Produtos ilimitados", included: true },
      { name: "Checkout transparente", included: true },
      { name: "Bio escalável", included: true },
      { name: "Analytics básico", included: true },
      { name: "Suporte por e-mail", included: true },
      { name: "Sem marca d'água", included: !isStart && !isPro },
      { name: "Analytics avançado", included: !isStart && !isPro },
      { name: "Suporte VIP", included: !isStart && !isPro },
    ]
  }

  const { openAuthModal } = useAuth()

  const handleCheckout = async (planCode: string) => {
    try {
      if (planCode === 'start') {
        openAuthModal('signup', 'Começar grátis agora')
        return
      }

      setLoading(true)
      
      const isYearly = billingCycle === 'yearly'
      let priceId: string | undefined

      if (planCode === 'pro') {
        priceId = isYearly 
          ? process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY 
          : process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO
      } else if (planCode === 'business') {
        priceId = isYearly 
          ? process.env.NEXT_PUBLIC_STRIPE_PRICE_BUSINESS_YEARLY 
          : process.env.NEXT_PUBLIC_STRIPE_PRICE_BUSINESS
      }

      if (!priceId) {
        throw new Error("Price ID not found")
      }

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId }),
      })

      if (!response.ok) throw new Error('Checkout failed')

      const { clientSecret } = await response.json()
      setClientSecret(clientSecret)
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Erro ao iniciar checkout. Tente novamente.')
    } finally {
      if (planCode !== 'start') setLoading(false)
    }
  }

  return (
    <>
    <section id="precos" className="relative border-b border-vasta-border bg-vasta-bg py-20 md:py-32">
      {/* Background Glow */}
      <div className="pointer-events-none absolute inset-0 flex justify-center overflow-hidden">
        <div className="h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-vasta-primary/5 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4">
        <div className="text-center">
          <div className="inline-block rounded-full border border-vasta-primary/30 bg-vasta-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-vasta-primary">
            Planos Flexíveis
          </div>
          <h2 className="mt-4 text-3xl font-bold text-vasta-text md:text-4xl">
            Escolha o plano ideal para sua escala
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-vasta-muted">
            Comece grátis e evolua conforme suas vendas crescem. Sem fidelidade ou taxas escondidas.
          </p>
        </div>

        {/* Toggle */}
        <div className="mt-8 flex justify-center">
          <div className="flex items-center gap-3 rounded-full border border-vasta-border bg-vasta-surface p-1">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${billingCycle === "monthly"
                  ? "bg-vasta-surface-soft text-vasta-text shadow-sm"
                  : "text-vasta-muted hover:text-vasta-text"
                }`}
            >
              Mensal
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`relative rounded-full px-4 py-1.5 text-sm font-medium transition-all ${billingCycle === "yearly"
                  ? "bg-vasta-surface-soft text-vasta-text shadow-sm"
                  : "text-vasta-muted hover:text-vasta-text"
                }`}
            >
              Anual
              <span className="absolute -right-3 -top-2 rounded-full bg-vasta-primary px-1.5 py-0.5 text-[9px] font-bold text-white">
                -20%
              </span>
            </button>
          </div>
        </div>

        {/* Cards */}
        <div className="mt-12 grid gap-8 lg:grid-cols-3 lg:gap-8 min-h-[400px]">
          {loading ? (
            <div className="col-span-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-vasta-primary animate-spin" />
                <span className="ml-3 text-vasta-muted">Carregando planos...</span>
            </div>
          ) : (
            plans.map((plan, index) => {
              const price = billingCycle === "monthly" 
                ? plan.price.monthly
                : plan.price.yearly
              
              const isPopular = plan.code === "pro"
              const uiFeatures = getUiFeatures(plan)

              return (
                <div
                  key={plan.code}
                  style={{ animationDelay: `${(index + 1) * 150}ms` }}
                  className={`animate-fade-in-up fill-mode-forwards opacity-0 relative flex flex-col rounded-[2.5rem] border p-10 transition-all duration-500 hover:scale-[1.02] ${isPopular
                      ? "border-vasta-primary/50 bg-vasta-surface ring-1 ring-vasta-primary/20 shadow-2xl shadow-vasta-primary/10"
                      : "border-vasta-border bg-vasta-surface/50 hover:border-vasta-border-dark hover:bg-vasta-surface"
                    }`}
                >
                  {isPopular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-vasta-primary to-vasta-accent px-5 py-1.5 text-[10px] font-black uppercase tracking-widest text-white shadow-xl">
                      Mais Popular
                    </div>
                  )}

                  <div className="mb-8">
                    <h3 className="text-xl font-black text-vasta-text tracking-tight uppercase opacity-90">{plan.name}</h3>
                    <div className="mt-5 flex items-baseline gap-1.5">
                      {plan.price.monthly === 0 ? (
                        <span className="text-3xl font-black text-vasta-text tracking-tighter">Grátis</span>
                      ) : (
                        <>
                          <span className="text-lg font-bold text-vasta-muted">R$</span>
                          <span className="text-5xl font-black text-vasta-text tracking-tighter">{price}</span>
                          <span className="text-sm font-bold text-vasta-muted">/mês</span>
                        </>
                      )}
                    </div>
                    <div className="mt-4 text-[10px] font-bold text-vasta-muted bg-vasta-surface-soft inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-vasta-border">
                      <div className="h-1.5 w-1.5 rounded-full bg-vasta-primary animate-pulse" />
                      Taxa: <span className="text-vasta-text">{plan.transaction_fee_percent}%</span>
                    </div>
                  </div>

                  <div className="mb-10 flex-1 space-y-4">
                    {uiFeatures.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3.5 text-sm">
                        {feature.included ? (
                          <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20">
                            <Check className="h-3 w-3 text-emerald-500" />
                          </div>
                        ) : (
                          <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-vasta-surface-soft border border-vasta-border">
                            <X className="h-3 w-3 text-vasta-text/50" />
                          </div>
                        )}
                        <span className={`font-medium ${feature.included ? "text-vasta-text-soft" : "text-vasta-muted/60 line-through decoration-vasta-muted/30"}`}>
                          {feature.name}
                        </span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => handleCheckout(plan.code)}
                    disabled={loading}
                    className={`w-full rounded-[1.25rem] py-4 text-sm font-black transition-all duration-300 active:scale-[0.98] ${isPopular
                        ? "bg-gradient-to-r from-vasta-primary to-vasta-accent text-white hover:shadow-2xl hover:shadow-vasta-primary/40 shadow-xl shadow-vasta-primary/25 disabled:opacity-70"
                        : "bg-vasta-text text-vasta-bg hover:opacity-90 disabled:opacity-70"
                      }`}
                  >
                    {loading && plan.code !== 'start' ? (
                      <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                    ) : (
                      plan.price.monthly === 0 ? "Começar grátis" : "Criar minha loja"
                    )}
                  </button>
                </div>
              )
            })
          )}
        </div>
      </div>
    </section>
    {clientSecret && (
      <CheckoutModal 
        clientSecret={clientSecret} 
        onClose={() => setClientSecret(null)} 
      />
    )}
    </>
  )
}
