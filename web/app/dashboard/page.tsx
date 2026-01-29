import { redirect } from "next/navigation"
import { createClient } from "../../lib/supabase/server"
import DashboardHomeClient from "../../components/dashboard/DashboardHomeClient"

export default async function DashboardHome() {
   const supabase = await createClient()

   if (!supabase) return null

   const { data: { user } } = await supabase.auth.getUser()

   if (!user) {
      redirect("/login")
   }

   // Fetch recent orders (last 30 days for chart)
   const thirtyDaysAgo = new Date()
   thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

   const { data: ordersData } = await supabase
      .from('orders')
      .select('*, products(title)')
      .eq('profile_id', user.id)
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false })

   return <DashboardHomeClient ordersData={ordersData} />
}
