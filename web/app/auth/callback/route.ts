import { NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/dashboard'

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.delete({ name, ...options })
          },
        },
      }
    )
    
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Simple check: does profile exist?
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('username, bio')
          .eq('id', user.id)
          .maybeSingle()

        // If no profile or no username, send to onboarding
        if (profileError || !profile || !profile.username) {
          console.log("Callback: New or incomplete profile, redirecting to onboarding")
          return NextResponse.redirect(new URL('/onboarding', request.url))
        }
      }
      
      console.log("Callback: Profile complete, redirecting to", next)
      return NextResponse.redirect(new URL(next, request.url))
    }
  }

  // Return to login with error if something failed
  return NextResponse.redirect(new URL('/login?error=auth-code-error', request.url))
}
