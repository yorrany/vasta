import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { enforcePlanQuotas } from '@/lib/billing-logic'

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set')
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-12-15.clover'
  })
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    )
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not set')
    return NextResponse.json(
      { error: 'Webhook configuration error' },
      { status: 500 }
    )
  }

  let event: Stripe.Event
  const stripe = getStripe()

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err: any) {
    console.error(`Webhook signature verification failed:`, err.message)
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    )
  }

  // Get Supabase client
  const supabase = await createClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.supabase_user_id
        const planCode = session.metadata?.plan_code

        if (userId && session.subscription && planCode) {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          )

          await supabase
            .from('profiles')
            .update({
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: subscription.id,
              subscription_status: subscription.status,
              plan_code: planCode,
              updated_at: new Date().toISOString()
            })
            .eq('id', userId)

          console.log(`✅ Checkout completed for user ${userId}, plan: ${planCode}`)
        }
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // Determinar plan_code baseado no price_id
        let planCode = 'pro' // default
        const priceId = subscription.items.data[0]?.price.id

        if (
          priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_BUSINESS_MONTHLY ||
          priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_BUSINESS_YEARLY
        ) {
          planCode = 'business'
        }

        // Primeiro atualiza o perfil
        await supabase
          .from('profiles')
          .update({
            stripe_subscription_id: subscription.id,
            subscription_status: subscription.status,
            plan_code: planCode,
            updated_at: new Date().toISOString()
          })
          .eq('stripe_customer_id', customerId)

        // Depois verifica cotas caso tenha sido um downgrade
        // Buscamos o user_id através do customer_id
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (profile) {
          await enforcePlanQuotas(profile.id, planCode)
        }

        console.log(`✅ Subscription ${event.type} for customer ${customerId}`)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // Downgrade para plano gratuito
        await supabase
          .from('profiles')
          .update({
            stripe_subscription_id: null,
            subscription_status: 'canceled',
            plan_code: 'start',
            updated_at: new Date().toISOString()
          })
          .eq('stripe_customer_id', customerId)

        const { data: profileDeleted } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (profileDeleted) {
          await enforcePlanQuotas(profileDeleted.id, 'start')
        }

        console.log(`✅ Subscription canceled for customer ${customerId}`)
        break
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        // Marcar assinatura como ativa
        await supabase
          .from('profiles')
          .update({
            subscription_status: 'active',
            updated_at: new Date().toISOString()
          })
          .eq('stripe_customer_id', customerId)

        console.log(`✅ Invoice paid for customer ${customerId}`)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        // Marcar como pagamento falho
        await supabase
          .from('profiles')
          .update({
            subscription_status: 'past_due',
            updated_at: new Date().toISOString()
          })
          .eq('stripe_customer_id', customerId)

        console.error(`❌ Payment failed for customer ${customerId}`)

        // TODO: Enviar email de notificação para o usuário
        // TODO: Enviar alerta para admin
        break
      }

      case 'customer.subscription.trial_will_end': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        console.log(`⏰ Trial ending soon for customer ${customerId}`)

        // TODO: Enviar email de lembrete
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
