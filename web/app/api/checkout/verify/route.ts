import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover'
})

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const sessionId = searchParams.get('session_id')

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID não fornecido' },
        { status: 400 }
      )
    }

    // Buscar sessão no Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.payment_status !== 'paid') {
      return NextResponse.json({
        success: false,
        message: 'Pagamento ainda não confirmado'
      })
    }

    // Atualizar perfil do usuário com informações da assinatura
    const supabase = await createClient()
    const userId = session.metadata?.supabase_user_id

    if (userId && session.subscription) {
      // Buscar detalhes da subscription
      const subscription = await stripe.subscriptions.retrieve(
        session.subscription as string
      )

      // Atualizar perfil
      await supabase
        .from('profiles')
        .update({
          stripe_subscription_id: subscription.id,
          stripe_customer_id: session.customer as string,
          subscription_status: subscription.status,
          plan_code: session.metadata?.plan_code || 'pro',
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
    }

    return NextResponse.json({
      success: true,
      subscription: session.subscription,
      customerId: session.customer
    })

  } catch (error) {
    console.error('Erro ao verificar checkout:', error)
    return NextResponse.json(
      { error: 'Erro ao verificar checkout' },
      { status: 500 }
    )
  }
}
