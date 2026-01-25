import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { getStripePriceId } from '@/lib/plans'
import type { PlanCode } from '@/lib/plans'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover'
})

export async function POST(request: NextRequest) {
  try {
    const { planCode, billingCycle = 'monthly' } = await request.json()

    if (!planCode || !['start', 'pro', 'business'].includes(planCode)) {
      return NextResponse.json(
        { error: 'Plano inválido' },
        { status: 400 }
      )
    }

    // Plano gratuito não precisa de checkout
    if (planCode === 'start') {
      return NextResponse.json(
        { error: 'Plano gratuito não requer checkout' },
        { status: 400 }
      )
    }

    // Verificar autenticação
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    // Buscar ou criar customer no Stripe
    let customerId: string | undefined

    // Verificar se já existe um customer_id salvo
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id, email')
      .eq('id', user.id)
      .single()

    if (profile?.stripe_customer_id) {
      customerId = profile.stripe_customer_id
    } else {
      // Criar novo customer no Stripe
      const customer = await stripe.customers.create({
        email: user.email || profile?.email,
        metadata: {
          supabase_user_id: user.id
        }
      })

      customerId = customer.id

      // Salvar customer_id no perfil
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id)
    }

    // Obter o price ID do Stripe
    const priceId = getStripePriceId(planCode as PlanCode, billingCycle)

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID do Stripe não configurado para este plano' },
        { status: 500 }
      )
    }

    // Criar sessão de checkout
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/?canceled=true`,
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      metadata: {
        supabase_user_id: user.id,
        plan_code: planCode,
        billing_cycle: billingCycle
      }
    })

    if (!session.client_secret) {
      return NextResponse.json(
        { error: 'Erro ao criar sessão de checkout' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      clientSecret: session.client_secret,
      sessionId: session.id
    })

  } catch (error) {
    console.error('Erro ao criar checkout:', error)
    return NextResponse.json(
      { error: 'Erro interno ao criar checkout' },
      { status: 500 }
    )
  }
}
