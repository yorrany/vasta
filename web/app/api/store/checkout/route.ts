import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { getPlanByCode, type PlanCode } from '@/lib/plans'

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-27.acacia',
  typescript: true,
})

export async function POST(request: NextRequest) {
  try {
    const { productId, profileId } = await request.json()

    if (!productId || !profileId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = await createClient()

    // 1. Fetch Product Details
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single()

    if (productError || !product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // 2. Fetch Seller Profile (for Connected Account ID and Plan)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_account_id, plan_code') 
      .eq('id', profileId)
      .single()

    if (profileError || !profile?.stripe_account_id) {
      return NextResponse.json({ error: "Seller Stripe account not found" }, { status: 404 })
    }

    const connectedAccountId = profile.stripe_account_id
    
    // Determine Fee Percentage based on Plan
    const userPlanCode = (profile.plan_code as PlanCode) || 'start'
    const planDetails = getPlanByCode(userPlanCode)
    
    // Default to 'start' plan fee (8%) if plan not found, otherwise use plan's fee
    // Note: transaction_fee_percent is e.g. 8 for 8%, so we divide by 100
    const feePercent = planDetails ? planDetails.transaction_fee_percent / 100 : 0.08
    
    const priceInCents = Math.round(product.price * 100)
    const applicationFeeAmount = Math.round(priceInCents * feePercent)


    // 3. Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: product.title,
              description: product.description,
              images: product.image_url ? [product.image_url] : [],
            },
            unit_amount: priceInCents,
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        application_fee_amount: applicationFeeAmount,
        transfer_data: {
          destination: connectedAccountId,
        },
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cancel`,
    })

    return NextResponse.json({ url: session.url })

  } catch (error: any) {
    console.error('Store Checkout Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
