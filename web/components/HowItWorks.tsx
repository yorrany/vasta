"use client"

import { UserPlus, Palette, Rocket } from "lucide-react"

export function HowItWorks() {
  const steps = [
    {
      icon: <UserPlus className="h-6 w-6 text-vasta-primary" />,
      title: "Crie sua página grátis",
      description:
        "Cadastre-se em segundos e ganhe sua URL personalizada para centralizar seus links e ofertas.",
      color: "from-vasta-primary/20",
    },
    {
      icon: <Palette className="h-6 w-6 text-vasta-accent" />,
      title: "Estilo Único",
      description:
        "Escolha cores, fontes e organize seus produtos com um layout que reflete sua marca pessoal.",
      color: "from-vasta-accent/20",
    },
    {
      icon: <Rocket className="h-6 w-6 text-cyan-400" />,
      title: "Escala & Venda",
      description:
        "Receba pagamentos via Stripe e acompanhe seu crescimento com analytics em tempo real.",
      color: "from-cyan-400/20",
    },
  ]

  return (
    <section id="como-funciona" className="relative border-b border-vasta-border bg-vasta-bg py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-vasta-text md:text-4xl">
            Como funciona o Vasta
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-vasta-muted">
            Comece gratuitamente em poucos passos e transforme seus seguidores em clientes fiéis.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <div
              key={index}
              className="group relative rounded-[2.5rem] border border-vasta-border bg-vasta-surface p-10 transition-all hover:bg-vasta-surface-soft"
            >
              {/* Step counter */}
              <div className="absolute top-8 right-8 text-4xl font-black text-vasta-surface-soft transition-colors group-hover:text-vasta-border">
                0{index + 1}
              </div>

              <div className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${step.color} to-transparent border border-vasta-border`}>
                {step.icon}
              </div>

              <h3 className="mt-8 text-lg font-bold text-vasta-text">
                {step.title}
              </h3>
              <p className="mt-4 text-vasta-muted leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
