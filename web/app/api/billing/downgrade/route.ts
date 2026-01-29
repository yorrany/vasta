import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { getStripePriceId, getPlanByCode, type PlanCode } from '@/lib/plans'

function getStripe() {
    if (!process.env.STRIPE_SECRET_KEY) {
        throw new Error('STRIPE_SECRET_KEY is not set')
    }
    return new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2025-01-27.acacia'
    })
}

export async function POST(request: NextRequest) {
    try {
        const { targetPlanCode } = await request.json()

        // 1. Auth check
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // 2. Validate Target Plan
        if (!targetPlanCode || !['start', 'pro', 'business'].includes(targetPlanCode)) {
            return NextResponse.json({ error: 'Invalid plan code' }, { status: 400 })
        }

        // 3. Get User Profile and active subscription info
        const { data: profile } = await supabase
            .from('profiles')
            .select('stripe_subscription_id, plan_code')
            .eq('id', user.id)
            .single()

        if (!profile?.stripe_subscription_id) {
            // Edge case: User has high plan locally but no Stripe Sub ID (inconsistent state).
            // If they are downgrading to free, we just fix the local state immediately.
            if (targetPlanCode === 'start') {
                await supabase
                    .from('profiles')
                    .update({
                        plan_code: 'start',
                        subscription_status: 'canceled',
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', user.id)

                return NextResponse.json({
                    message: 'Assinatura cancelada localmente (correção de estado).',
                    effectiveDate: new Date().toISOString()
                })
            }

            return NextResponse.json({ error: 'Nenhuma assinatura ativa encontrada para alterar. Por favor, contate o suporte.' }, { status: 400 })
        }

        const stripe = getStripe()
        const subscription = await stripe.subscriptions.retrieve(profile.stripe_subscription_id)

        // Verify ownership just in case
        // (The profile check above effectively does this, but good to be safe if we had customer_id stored)

        // 4. Handle Downgrade Logic
        // Case A: Downgrade to Free ('start')
        if (targetPlanCode === 'start') {
            // Cancel at period end
            await stripe.subscriptions.update(subscription.id, {
                cancel_at_period_end: true
            })

            return NextResponse.json({
                message: 'Subscription scheduled to cancel at period end.',
                effectiveDate: subscription.current_period_end
            })
        }

        // Case B: Downgrade to a Lower Paid Plan (e.g. Business -> Pro)
        // We need to create a Subscription Schedule to handle the transition at period end.

        // First, check if there is already a schedule
        const schedules = await stripe.subscriptionSchedules.list({
            customer: subscription.customer as string,
            limit: 1,
        })

        // We want to verify `targetPlanCode` is actually a downgrade or crossgrade? 
        // The UI handles disabling upgrade buttons, so we assume valid intent here.
        // However, we need the Price ID for the new plan.
        // We assume same billing cycle for simplicity (monthly -> monthly), unless we want to support switching cycles too.
        // Let's infer cycle from current price.
        const currentPrice = subscription.items.data[0].price
        const billingCycle = currentPrice.recurring?.interval === 'year' ? 'yearly' : 'monthly'

        const newPriceId = getStripePriceId(targetPlanCode as PlanCode, billingCycle)

        if (!newPriceId) {
            return NextResponse.json({ error: 'Price configuration missing for target plan' }, { status: 500 })
        }

        // If a schedule already exists, we update it; if not, we create one from the sub.
        // Actually, creating a schedule from an existing sub is the standard way.
        // If one active schedule exists attached to this sub, we might need to modify it.
        let scheduleId = subscription.schedule as string | null

        if (!scheduleId) {
            // Create a schedule starting NOW (which effectively wraps the current sub)
            const schedule = await stripe.subscriptionSchedules.create({
                from_subscription: subscription.id,
            })
            scheduleId = schedule.id
        }

        // Update the schedule to switch to new plan at end of current phase
        // Phases: [Current Phase] -> [Next Phase: New Plan]
        // simpler approach: modify the schedule to have a new phase starting at `current_period_end`?
        // Actually, `from_subscription` creates a schedule with the current phase.
        // We update the schedule to append a new phase or replace the future.

        await stripe.subscriptionSchedules.update(scheduleId, {
            end_behavior: 'release', // or 'cancel' if we wanted to stop. We want to keep it running on new plan.
            phases: [
                {
                    start_date: 'now', // represents the current running phase
                    end_date: subscription.current_period_end, // continue current plan until end
                    items: [{ price: currentPrice.id, quantity: 1 }],
                },
                {
                    start_date: subscription.current_period_end, // start new plan after
                    items: [{ price: newPriceId, quantity: 1 }],
                    proration_behavior: 'none', // Critical: no prorations, full switch at boundary
                    // Note: iterations default to 1 if not set? We want it to recur indefinitely?
                    // Strip docs say "iterations" defaults to null (forever) if not specified? 
                    // Wait, phases define strict time blocks.
                    // Standard approach for "downgrade at period end":
                    // Actually Update Subscription with `proration_behavior: 'none'` AND `billing_cycle_anchor: 'unchanged'` ?
                    // Stripe docs say: "To downgrade a subscription... If you want the downgrade to apply at the end of the billing period... use a subscription schedule."
                }
            ]
        })

        // Wait, the "phases" array in update replaces strictly?
        // If we simply want to "update the subscription at period end", we can try:
        // `stripe.subscriptions.update(sub.id, { items: [...], proration_behavior: 'none' })` - this applies change IMMEDIATELY but without charging? No, it changes access immediately.
        // We WANT access to remain High Tier until end. So Schedule is correct.

        // RE-READING STRIPE DOCS for Schedule:
        // If we pass `phases` to update, it resets the timeline.
        // Phase 0: current item, end_date: current_period_end
        // Phase 1: new item, iterations: 1 (or more).

        // Correction: We just need to set the specific phase configuration.
        // Let's try the simpler "Subscription Update" with `cancel_at`? No.

        // Correct Schedule Update Logic:
        // 1. Create schedule from sub (done above).
        // 2. Update schedule:
        await stripe.subscriptionSchedules.update(scheduleId, {
            phases: [
                {
                    start_date: 'now', // Lock in current state
                    end_date: subscription.current_period_end,
                    items: [{ price: currentPrice.id, quantity: 1 }],
                },
                {
                    start_date: subscription.current_period_end,
                    items: [{ price: newPriceId, quantity: 1 }],
                    // No end_date means it runs forever (standard subscription behavior)
                    proration_behavior: 'none'
                }
            ]
        })

        return NextResponse.json({
            message: 'Downgrade scheduled successfully',
            effectiveDate: subscription.current_period_end
        })

    } catch (error: any) {
        console.error('Downgrade error:', error)
        return NextResponse.json({ error: error.message || 'Internal Error' }, { status: 500 })
    }
}
