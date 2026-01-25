/**
 * Planos de assinatura do Vasta
 * Este arquivo centraliza a configuração de planos para uso consistente
 * em toda a aplicação (Home, Dashboard, Onboarding)
 */

export type PlanCode = 'start' | 'pro' | 'business'

export type Plan = {
  code: PlanCode
  name: string
  price: {
    monthly: number
    yearly: number
  }
  stripePriceId?: {
    monthly?: string
    yearly?: string
  }
  transaction_fee_percent: number
  offer_limit: number | null
  admin_user_limit: number | null
  features: string[]
}

export const PLANS: Plan[] = [
  {
    code: 'start',
    name: 'Começo',
    price: { monthly: 0, yearly: 0 },
    transaction_fee_percent: 8,
    offer_limit: 3,
    admin_user_limit: null,
    features: [
      'Até 3 produtos',
      'Checkout transparente',
      'Bio escalável',
      'Analytics básico',
      'Suporte por e-mail'
    ]
  },
  {
    code: 'pro',
    name: 'Pro',
    price: { monthly: 49, yearly: 38 },
    stripePriceId: {
      // Estes IDs serão preenchidos após criar os produtos no Stripe
      monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY,
      yearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY
    },
    transaction_fee_percent: 4,
    offer_limit: 10,
    admin_user_limit: null,
    features: [
      'Até 10 produtos',
      'Sem marca d\'água',
      'Bio escalável',
      'Analytics básico',
      'Suporte por e-mail',
      'Domínio personalizado',
      'Temas premium'
    ]
  },
  {
    code: 'business',
    name: 'Business',
    price: { monthly: 99, yearly: 87 },
    stripePriceId: {
      monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_BUSINESS_MONTHLY,
      yearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_BUSINESS_YEARLY
    },
    transaction_fee_percent: 1,
    offer_limit: null,
    admin_user_limit: null,
    features: [
      'Produtos ilimitados',
      'Suporte VIP',
      'Analytics avançado',
      'Sem marca d\'água',
      'Bio escalável',
      'Domínio personalizado',
      'Temas premium',
      'API de integração',
      'Múltiplos membros'
    ]
  }
]

export function getPlanByCode(code: PlanCode): Plan | undefined {
  return PLANS.find(p => p.code === code)
}

export function getStripePriceId(planCode: PlanCode, billingCycle: 'monthly' | 'yearly'): string | undefined {
  const plan = getPlanByCode(planCode)
  return plan?.stripePriceId?.[billingCycle]
}
