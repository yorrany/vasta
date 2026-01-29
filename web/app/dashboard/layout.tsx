import { redirect } from "next/navigation"
import { createClient } from "../../lib/supabase/server"
import DashboardLayoutClient from "../../components/layout/DashboardLayoutClient"
import type { AppearanceSettings, LinkStyle, SiteTheme } from "../../components/providers/AppearanceProvider"
import type { PlanCode } from "../../lib/plans"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  
  // Guard clause for build time
  if (!supabase) return <>{children}</>

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  let initialSettings: AppearanceSettings | undefined

  if (profile) {
    initialSettings = {
      profileImage: profile.profile_image,
      coverImage: profile.cover_image,
      coverImageCredit: profile.cover_image_credit || null,
      accentColor: profile.accent_color || "#6366F1",
      bgColor: profile.bg_color,
      typography: profile.typography || "Inter",
      linkStyle: (profile.link_style as LinkStyle) || "glass",
      theme: (profile.theme as SiteTheme) || "adaptive",
      username: profile.username || user.user_metadata?.username || user.email?.split('@')[0] || "seunome",
      displayName: profile.display_name || null,
      bio: profile.bio || "",
      backgroundImage: profile.background_image || null,
      backgroundImageCredit: profile.background_image_credit || null,
      planCode: (profile.plan_code as PlanCode) || 'start'
    }
  }

  return (
    <DashboardLayoutClient initialSettings={initialSettings}>
      {children}
    </DashboardLayoutClient>
  )
}
