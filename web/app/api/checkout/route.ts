import { NextResponse } from 'next/server'
import { stripe } from '../../../lib/stripe'

export async function POST(req: Request) {
  try {
    const { priceId } = await req.json()

    if (!priceId) {
      return new NextResponse('Missing priceId', { status: 400 })
    }

    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      return_url: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
      mode: 'subscription',
      billing_address_collection: 'auto',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
    })

    return NextResponse.json({ clientSecret: session.client_secret })
  } catch (error) {
    console.error('Stripe Checkout Error:', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
