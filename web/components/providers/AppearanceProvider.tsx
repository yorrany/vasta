"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import { createClient } from "../../lib/supabase/client"
import { useAuth } from "../../lib/AuthContext"
import { PlanCode } from "../../lib/plans"
import { useConfirm } from "./DialogProvider"

export type LinkStyle = 'glass' | 'solid' | 'outline'
export type SiteTheme = 'adaptive' | 'dark' | 'light' | 'neo' | 'noir' | 'bento' | 'custom'

export interface AppearanceSettings {
  profileImage: string | null
  coverImage: string | null
  coverImageCredit: string | null
  backgroundImage: string | null
  backgroundImageCredit: string | null
  accentColor: string
  bgColor: string | null
  typography: string
  linkStyle: LinkStyle
  theme: SiteTheme
  username: string
  displayName: string | null
  bio: string
  planCode?: PlanCode
}

interface AppearanceContextType {
  settings: AppearanceSettings
  updateSettings: (newSettings: Partial<AppearanceSettings>) => void
}

const AppearanceContext = createContext<AppearanceContextType | undefined>(undefined)

export const useAppearance = () => {
  const context = useContext(AppearanceContext)
  if (!context) throw new Error("useAppearance must be used within AppearanceProvider")
  return context
}

export function AppearanceProvider({ children, initialSettings }: { children: ReactNode; initialSettings?: AppearanceSettings }) {
  const { user } = useAuth()
  const supabase = createClient()
  const router = useRouter()
  const pathname = usePathname()
  const { confirm } = useConfirm()

  const defaultSettings: AppearanceSettings = {
    profileImage: null,
    coverImage: null,
    coverImageCredit: null,
    accentColor: "#6366F1",
    bgColor: null,
    typography: "Inter",
    linkStyle: "glass",
    theme: "adaptive",
    username: "seunome",
    displayName: null,
    bio: "Sua bio inspiradora",
    backgroundImage: null,
    backgroundImageCredit: null,
    planCode: 'start'
  }

  const [settings, setSettings] = useState<AppearanceSettings>(initialSettings || defaultSettings)

  useEffect(() => {
    // Only fetch if no initialSettings provided or if we want to ensure freshness on mount?
    // If initialSettings is provided, we can skip the first fetch or doing it ONLY if it's missing.
    if (initialSettings) return; 

    async function fetchProfile() {
      if (!user) return

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      if (error) {
        console.error("Error fetching profile:", error)
      }

      if (data) {
        if (!data.username && !pathname.includes('onboarding')) {
          router.push("/onboarding")
        }

        setSettings({
          profileImage: data.profile_image,
          coverImage: data.cover_image,
          coverImageCredit: data.cover_image_credit || null,
          accentColor: data.accent_color || "#6366F1",
          bgColor: data.bg_color,
          typography: data.typography || "Inter",
          linkStyle: (data.link_style as LinkStyle) || "glass",
          theme: (data.theme as SiteTheme) || "adaptive",
          username: data.username || user.user_metadata?.username || user.email?.split('@')[0] || "seunome",
          displayName: data.display_name || null,
          bio: data.bio || "",
          backgroundImage: data.background_image || null,
          backgroundImageCredit: data.background_image_credit || null,
          planCode: (data.plan_code as PlanCode) || 'start'
        })
      } else {
        router.push("/onboarding")
        setSettings({
          ...defaultSettings,
          username: user.user_metadata?.username || user.email?.split('@')[0] || "seunome"
        })
      }
    }
    fetchProfile()
  }, [user])

  const updateSettings = async (newSettings: Partial<AppearanceSettings>) => {
    console.log("updateSettings called with:", newSettings)
    setSettings(prev => ({ ...prev, ...newSettings }))

    if (!user) {
      console.error("User not found in updateSettings, skipping DB update")
      return
    }

    const updates: any = {}
    if (newSettings.profileImage !== undefined) updates.profile_image = newSettings.profileImage
    if (newSettings.coverImage !== undefined) updates.cover_image = newSettings.coverImage
    if (newSettings.coverImageCredit !== undefined) updates.cover_image_credit = newSettings.coverImageCredit
    if (newSettings.accentColor !== undefined) updates.accent_color = newSettings.accentColor
    if (newSettings.bgColor !== undefined) updates.bg_color = newSettings.bgColor
    if (newSettings.typography !== undefined) updates.typography = newSettings.typography
    if (newSettings.linkStyle !== undefined) updates.link_style = newSettings.linkStyle
    if (newSettings.theme !== undefined) updates.theme = newSettings.theme
    if (newSettings.username !== undefined) updates.username = newSettings.username
    if (newSettings.displayName !== undefined) updates.display_name = newSettings.displayName
    if (newSettings.bio !== undefined) updates.bio = newSettings.bio
    if (newSettings.backgroundImage !== undefined) updates.background_image = newSettings.backgroundImage
    if (newSettings.backgroundImageCredit !== undefined) updates.background_image_credit = newSettings.backgroundImageCredit

    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      updated_at: new Date(),
      ...updates
    })

    if (error) {
      console.error('Error updating profile:', error)
      confirm({
        title: "Erro ao salvar",
        description: `Não foi possível salvar as alterações. Detalhes: ${error.message}`,
        variant: 'danger',
        confirmText: "OK",
        onConfirm: () => { }
      })
    } else {
      console.log('Profile updated successfully', updates)
    }
  }

  return (
    <AppearanceContext value={{ settings, updateSettings }}>
      {children}
    </AppearanceContext>
  )
}
