"use client"

import { Quote } from "lucide-react"

const testimonials = [
  {
    name: "Marina Silva",
    role: "Influenciadora digital",
    initials: "MS",
    color: "from-pink-500 to-rose-500",
    quote:
      "Minha taxa de conversão em infoprodutos subiu 35% depois que migrei para a Vasta. O checkout transparente é um divisor de águas.",
  },
  {
    name: "Pedro Henrique",
    role: "Músico e produtor",
    initials: "PH",
    color: "from-indigo-500 to-blue-500",
    quote:
      "Centralizei minha agenda e venda de beats em um só lugar. Economizei mais de R$ 400 em taxas só no primeiro mês de uso.",
  },
  {
    name: "Ana Beatriz",
    role: "Designer freelancer",
    initials: "AB",
    color: "from-emerald-500 to-teal-500",
    quote:
      "Simples de configurar e extremamente profissional. Meus clientes de consultoria fecham muito mais rápido com o portfólio integrado.",
  },
]

export function Testimonials() {
  return (
    <section id="depoimentos" className="relative border-b border-vasta-border bg-vasta-bg py-24 md:py-32 overflow-hidden">
      
      {/* Background glow */}
       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl opacity-20 bg-[radial-gradient(circle,rgba(99,102,241,0.15),transparent_70%)] pointer-events-none" />

      <div className="relative mx-auto max-w-6xl px-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-vasta-text md:text-4xl">
            Amado por criadores independentes
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-vasta-muted">
            Veja como especialistas estão transformando sua audiência em receita recorrente com o vasta.pro.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {testimonials.map((t, index) => (
            <article
              key={t.name}
              className="relative flex flex-col rounded-3xl border border-vasta-border bg-vasta-surface p-8 shadow-2xl transition-all hover:border-vasta-primary/20 hover:bg-vasta-surface-soft"
            >
              <Quote className="absolute top-8 right-8 h-8 w-8 text-vasta-muted/20" />
              
              <div className="mb-6 flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              <p className="flex-1 text-base text-vasta-text-soft italic leading-relaxed">
                "{t.quote}"
              </p>

              <div className="mt-8 flex items-center gap-4">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${t.color} text-sm font-bold text-white shadow-lg`}>
                  {t.initials}
                </div>
                <div>
                  <div className="text-sm font-bold text-vasta-text">
                    {t.name}
                  </div>
                  <div className="text-xs font-medium text-vasta-muted">
                    {t.role}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
