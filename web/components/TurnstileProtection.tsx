"use client"

import { useEffect, useRef, useState } from "react"
import Script from "next/script"

// Cloudflare Turnstile keys
const TURNSTILE_TEST_KEY = '1x00000000000000000000AA' // Always passes
const TURNSTILE_PROD_KEY = process.env.NEXT_PUBLIC_TURNSTILE_KEY || '0x4AAAAAACLyd4XoDMS56kOLRKOQfMRUUJU'

export function TurnstileProtection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isLocalhost, setIsLocalhost] = useState(true) // Default to true to prevent flash

  useEffect(() => {
    // Check if we're on localhost
    const hostname = window.location.hostname
    const isLocal = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.')
    setIsLocalhost(isLocal)

    // Don't load Turnstile on localhost to avoid errors
    if (isLocal) {
      console.log('[Turnstile] Skipping on localhost')
      return
    }

    const windowAny = window as any

    const renderTurnstile = () => {
      if (windowAny.turnstile && containerRef.current) {
        windowAny.turnstile.render(containerRef.current, {
          sitekey: TURNSTILE_PROD_KEY,
          size: 'invisible',
          callback: (token: string) => {
            console.log("Turnstile protection active")
          },
          'error-callback': () => {
            console.warn('[Turnstile] Challenge failed, but continuing...')
          }
        })
      }
    }

    if (windowAny.turnstile) {
      renderTurnstile()
    } else {
      windowAny.onloadTurnstileCallback = renderTurnstile
    }
  }, [isLocalhost])

  // Don't render anything on localhost
  if (isLocalhost) {
    return null
  }

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback"
        async
        defer
      />
      <div ref={containerRef} className="hidden" />
    </>
  )
}
