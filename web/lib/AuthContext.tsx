"use client"

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react"

import { type User } from "@supabase/supabase-js"
import { createClient } from "./supabase/client"

type AuthModalMode = 'login' | 'signup'

interface AuthContextType {
  openAuthModal: (mode: AuthModalMode, contextualCTA?: string) => void
  closeAuthModal: () => void
  isOpen: boolean
  mode: AuthModalMode
  contextualCTA?: string
  user: User | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [mode, setMode] = useState<AuthModalMode>('signup')
  const [contextualCTA, setContextualCTA] = useState<string | undefined>(undefined)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    
    // Check active session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setLoading(false)
    })

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const openAuthModal = (newMode: AuthModalMode, cta?: string) => {
    setMode(newMode)
    setContextualCTA(cta)
    setIsOpen(true)
  }

  const closeAuthModal = () => setIsOpen(false)

  return (
    <AuthContext value={{ openAuthModal, closeAuthModal, isOpen, mode, contextualCTA, user, loading }}>
      {children}
    </AuthContext>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
