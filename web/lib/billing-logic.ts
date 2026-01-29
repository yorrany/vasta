import { createClient } from '@/lib/supabase/server'
import { getPlanByCode, type PlanCode } from '@/lib/plans'

/**
 * Enforces plan quotas for a user.
 * Specifically, if the user has more active products than their plan allows,
 * the excess products (newest first) are archived.
 * @param client Optional Supabase client (for testing). If not provided, creates a new server client.
 */
export async function enforcePlanQuotas(userId: string, planCode: string, client?: any) {
    const plan = getPlanByCode(planCode as PlanCode)

    if (!plan) {
        console.error(`[Quota] Plan not found: ${planCode}`)
        return
    }

    // If the plan has no limit (e.g., Business), we don't need to do anything
    if (plan.offer_limit === null) {
        console.log(`[Quota] Plan ${planCode} has no limits. Skipping check.`)
        return
    }

    const supabase = client || await createClient()

    // 1. Count active products
    const { count, error: countError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('profile_id', userId)
        .eq('status', 'active')

    if (countError) {
        console.error('[Quota] Error counting products:', countError)
        return
    }

    const activeCount = count || 0
    const limit = plan.offer_limit

    console.log(`[Quota] User ${userId} has ${activeCount} active products. Limit is ${limit}.`)

    if (activeCount <= limit) {
        return
    }

    const excessCount = activeCount - limit
    console.log(`[Quota] Removing ${excessCount} excess products for user ${userId}...`)

    // 2. Fetch excess products to archive (Reverse Chronological - newest first)
    // We want to KEEP the oldest 'limit' products, so we find the ones that are NOT in the "top 'limit' oldest"
    // OR simply: order by created_at DESC and take the first 'excessCount' rows.

    const { data: productsToArchive, error: fetchError } = await supabase
        .from('products')
        .select('id, title, created_at')
        .eq('profile_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false }) // Newest first
        .limit(excessCount)

    if (fetchError) {
        console.error('[Quota] Error fetching excess products:', fetchError)
        return
    }

    if (!productsToArchive || productsToArchive.length === 0) {
        return
    }

    const productIds = productsToArchive.map(p => p.id)

    // 3. Archive them
    const { error: updateError } = await supabase
        .from('products')
        .update({ status: 'archived' })
        .in('id', productIds)

    if (updateError) {
        console.error('[Quota] Error archiving products:', updateError)
    } else {
        console.log(`[Quota] Successfully archived ${productIds.length} products:`, productIds)
    }
}
