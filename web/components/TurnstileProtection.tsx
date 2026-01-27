"use client"

import { useEffect, useState } from "react"
import Script from "next/script"

export function TurnstileProtection() {
  const [isLocalhost, setIsLocalhost] = useState(true) // Default to true to prevent flash

  useEffect(() => {
    // Check if we're on localhost
    const hostname = window.location.hostname
    const isLocal = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.')
    setIsLocalhost(isLocal)
  }, [])

  return null
}
