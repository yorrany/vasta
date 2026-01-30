"use client"

import { motion } from "framer-motion"

const INTEGRATIONS = [
  { name: "Stripe", logo: (props: any) => (
    <svg viewBox="0 0 32 32" fill="none" {...props}>
      <path fill="#635BFF" d="M14.6 15.6c0-1.4 1.2-2.1 3.2-2.1 2.4 0 4.6.9 4.6.9l.6-3.8s-2-.7-4.6-.7c-4.3 0-7.3 2.2-7.3 6 0 5.4 7.4 5.6 7.4 8.5 0 1.6-1.5 2.4-3.5 2.4-2.7 0-5.3-1.1-5.3-1.1l-.7 4s2.4.9 5.3.9c4.6 0 7.8-2.2 7.8-6.3 0-5.8-7.5-6.1-7.5-8.7z"/>
    </svg>
  )},
  { name: "Google Analytics", logo: (props: any) => (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path fill="#F9AB00" d="M12.75 1.7C12.75.8 12 0 11.2 0H9.7v14.7h3.05V1.7z"/>
      <path fill="#E37400" d="M6 9.3c0-.9-.7-1.5-1.5-1.5H3v6.9h3V9.3z" style={{ opacity: 0.8 }}/>
      <path fill="#E37400" d="M19.5 14.7V5.5c0-.8-.7-1.5-1.5-1.5h-1.5v10.7h3z"/>
    </svg>
  )},
  { name: "Meta Pixel", logo: (props: any) => (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path fill="#0668E1" d="M22.5 11.75c0-4.06-3.26-7.34-7.27-7.34-2.15 0-4.08.97-5.4 2.5a7.33 7.33 0 0 0-5.4-2.5C4.38 4.41 1.75 6.42 1.5 9.17c-.24 2.65 1.57 4.96 4.96 6.32v-3.76c0-1.37 1.1-2.48 2.47-2.48.51 0 .97.15 1.36.41l.26.54.4 4.1.4-4.1.26-.54c.39-.26.85-.41 1.36-.41 1.37 0 2.47 1.11 2.47 2.48v3.76c3.4-1.36 5.2-3.67 4.96-6.32zM8.94 13.91l.46-.38c1.55-1.28 2.48-2.53 2.48-4.52 0-3.32-2.73-6-6.04-6-1.52 0-2.92.57-3.99 1.53L8.94 13.91z" />
      <path fill="#0668E1" d="M12.01 12.01c0-1.63 1.02-3.05 2.48-3.66V4.49c0-1.37-1.11-2.48-2.48-2.48-1.37 0-2.48 1.11-2.48 2.48v7.52z"/>
    </svg>
  )},
  { name: "TikTok Pixel", logo: (props: any) => (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <g style={{ mixBlendMode: 'multiply' }}>
        <path fill="#25F4EE" d="M19.5 7.4c-1.6 0-3.1-.5-4.4-1.4-.1 1.2-.2 2.4-.2 3.6 0 4.1-3.2 7.5-7.3 7.8-4.5.3-8.2-3.3-7.6-7.8.4-3.1 3-5.5 6.1-5.5v3.1c-1.7 0-3.1 1.4-3.1 3.1s1.4 3.1 3.1 3.1c1.7 0 3.1-1.3 3.1-3V.7h3.3c.2 1.9 1.2 3.5 2.8 4.6.9.6 2 .9 3.2 1V7.4h-2z" transform="translate(-2, -2)"/>
        <path fill="#FE2C55" d="M19.5 7.4c-1.6 0-3.1-.5-4.4-1.4-.1 1.2-.2 2.4-.2 3.6 0 4.1-3.2 7.5-7.3 7.8-4.5.3-8.2-3.3-7.6-7.8.4-3.1 3-5.5 6.1-5.5v3.1c-1.7 0-3.1 1.4-3.1 3.1s1.4 3.1 3.1 3.1c1.7 0 3.1-1.3 3.1-3V.7h3.3c.2 1.9 1.2 3.5 2.8 4.6.9.6 2 .9 3.2 1V7.4h-2z" transform="translate(2, 2)"/>
      </g>
      <path className="fill-black dark:fill-white" d="M19.5 7.4c-1.6 0-3.1-.5-4.4-1.4-.1 1.2-.2 2.4-.2 3.6 0 4.1-3.2 7.5-7.3 7.8-4.5.3-8.2-3.3-7.6-7.8.4-3.1 3-5.5 6.1-5.5v3.1c-1.7 0-3.1 1.4-3.1 3.1s1.4 3.1 3.1 3.1c1.7 0 3.1-1.3 3.1-3V.7h3.3c.2 1.9 1.2 3.5 2.8 4.6.9.6 2 .9 3.2 1V7.4h-2z"/>
    </svg>
  )},
]

export function Integrations() {
  return (
    <section className="border-b border-vasta-border bg-vasta-bg py-12">
      <div className="mx-auto max-w-7xl px-4 text-center">
        <p className="mb-8 text-xs font-bold uppercase tracking-widest text-vasta-muted">
          Integração nativa com suas ferramentas favoritas
        </p>
        
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
          {INTEGRATIONS.map((tool) => (
            <motion.div 
              key={tool.name}
              whileHover={{ scale: 1.1, y: -2 }}
              className="group flex flex-col items-center gap-2 cursor-pointer"
            >
              <tool.logo className="h-8 w-auto md:h-10 transition-transform" />
              <span className="text-[10px] font-bold text-vasta-muted opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all">
                {tool.name}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
