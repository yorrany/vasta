"use client"

import { UserPlus, Palette, Rocket } from "lucide-react"

export function HowItWorks() {
  return (
    <section id="recursos" className="relative border-b border-vasta-border bg-vasta-bg py-24 md:py-32 overflow-hidden">
      
      {/* Background Blobs */}
      <div className="absolute top-0 right-0 -mr-64 -mt-64 h-[500px] w-[500px] rounded-full bg-vasta-primary/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-64 -mb-64 h-[500px] w-[500px] rounded-full bg-vasta-accent/5 blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-16 md:mb-24 text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-black text-vasta-text md:text-5xl tracking-tight mb-6">
            Tudo o que você precisa para <span className="text-transparent bg-clip-text bg-gradient-to-r from-vasta-primary to-vasta-accent">vender online</span>.
          </h2>
          <p className="text-lg text-vasta-muted md:text-xl">
            Uma plataforma unificada para gerenciar seus produtos, links e pagamentos sem dor de cabeça.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* Features List */}
          <div className="space-y-10">
            <div className="flex gap-5">
              <div className="flex-shrink-0 h-14 w-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                <Rocket className="h-7 w-7 text-emerald-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-vasta-text mb-2">Checkout Transparente</h3>
                <p className="text-vasta-muted leading-relaxed">
                  Aumente sua conversão em até 30%. Seu cliente compra e paga sem nunca sair da sua página. Zero fricção, máxima confiança.
                </p>
              </div>
            </div>

            <div className="flex gap-5">
              <div className="flex-shrink-0 h-14 w-14 rounded-2xl bg-vasta-primary/10 flex items-center justify-center border border-vasta-primary/20">
                <Palette className="h-7 w-7 text-vasta-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-vasta-text mb-2">Editor Visual Simples</h3>
                <p className="text-vasta-muted leading-relaxed">
                  Personalize cores, fontes e layout em tempo real. Crie uma vitrine profissional que reflete sua marca em minutos.
                </p>
              </div>
            </div>

            <div className="flex gap-5">
              <div className="flex-shrink-0 h-14 w-14 rounded-2xl bg-vasta-accent/10 flex items-center justify-center border border-vasta-accent/20">
                <UserPlus className="h-7 w-7 text-vasta-accent" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-vasta-text mb-2">CRM Integrado</h3>
                <p className="text-vasta-muted leading-relaxed">
                  Gerencie seus clientes, histórico de vendas e exporte dados a qualquer momento. Você é dono da sua audiência.
                </p>
              </div>
            </div>
          </div>

          {/* Demo Mockup */}
          <div className="relative">
             {/* Mockup Frame */}
             <div className="relative rounded-[2rem] bg-vasta-surface border border-vasta-border shadow-2xl overflow-hidden aspect-[4/3] group hover:scale-[1.02] transition-transform duration-500">
                
                {/* Header Mockup */}
                <div className="h-14 border-b border-vasta-border bg-vasta-bg/50 px-6 flex items-center justify-between">
                   <div className="flex gap-2">
                      <div className="h-3 w-3 rounded-full bg-red-400/50" />
                      <div className="h-3 w-3 rounded-full bg-amber-400/50" />
                      <div className="h-3 w-3 rounded-full bg-emerald-400/50" />
                   </div>
                   <div className="h-2 w-20 rounded-full bg-vasta-border/50" />
                </div>

                {/* Dashboard Content Mockup */}
                <div className="p-6 md:p-8 space-y-6">
                   {/* Stats Row */}
                   <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-vasta-bg border border-vasta-border">
                         <div className="text-xs text-vasta-muted font-bold uppercase mb-1">Vendas Hoje</div>
                         <div className="text-2xl font-black text-vasta-text">R$ 1.240,00</div>
                         <div className="text-[10px] text-emerald-500 font-bold mt-1">+12% vs ontem</div>
                      </div>
                      <div className="p-4 rounded-xl bg-vasta-bg border border-vasta-border">
                         <div className="text-xs text-vasta-muted font-bold uppercase mb-1">Visitantes</div>
                         <div className="text-2xl font-black text-vasta-text">843</div>
                         <div className="text-[10px] text-emerald-500 font-bold mt-1">Tempo real</div>
                      </div>
                   </div>

                   {/* Graph Mockup */}
                   <div className="h-32 w-full rounded-xl bg-gradient-to-b from-vasta-primary/5 to-transparent border border-vasta-primary/10 relative overflow-hidden flex items-end justify-between px-4 pb-0">
                      {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                         <div key={i} style={{ height: `${h}%` }} className="w-1/12 bg-vasta-primary/20 rounded-t-md hover:bg-vasta-primary/40 transition-colors cursor-pointer" />
                      ))}
                   </div>
                   
                   {/* Recent Sales List */}
                   <div className="space-y-3">
                      <div className="text-xs font-bold text-vasta-muted uppercase">Últimas Vendas</div>
                      {[1, 2].map((i) => (
                         <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-vasta-bg border border-vasta-border/50">
                            <div className="flex items-center gap-3">
                               <div className="h-8 w-8 rounded-full bg-gray-200" />
                               <div>
                                  <div className="h-2 w-24 bg-gray-200 rounded mb-1" />
                                  <div className="h-1.5 w-16 bg-gray-100 rounded" />
                               </div>
                            </div>
                            <div className="h-2 w-12 bg-emerald-500/20 rounded" />
                         </div>
                      ))}
                   </div>
                </div>

                {/* Floating Notification */}
                <div className="absolute top-20 right-8 bg-white dark:bg-zinc-800 p-3 rounded-xl shadow-xl border border-vasta-border flex items-center gap-3 animate-bounce-slow">
                   <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-xs">
                      $
                   </div>
                   <div>
                      <div className="text-xs font-bold text-vasta-text">Nova venda!</div>
                      <div className="text-[10px] text-vasta-muted">Você ganhou R$ 97,00</div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </section>
  )
}
