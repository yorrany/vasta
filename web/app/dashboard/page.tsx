"use client"

import { 
  BarChart3, 
  ArrowUpRight, 
  Wallet, 
  Plus, 
  MoreHorizontal, 
  CheckCircle2, 
  Clock, 
  AlertCircle 
} from "lucide-react"

export default function DashboardHome() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Top Section: Income Tracker & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Income Tracker Chart Card */}
        <div className="lg:col-span-2 rounded-[2.5rem] bg-vasta-surface p-8 shadow-sm border border-vasta-border relative overflow-hidden group">
          <div className="flex items-center justify-between mb-8">
             <div className="flex items-center gap-3">
                <div className="p-3 bg-vasta-surface-soft rounded-2xl">
                   <Wallet className="w-6 h-6 text-vasta-text" />
                </div>
                <div>
                   <h2 className="text-xl font-bold text-vasta-text">Vendas da Semana</h2>
                   <p className="text-xs text-vasta-muted">Acompanhe seu rendimento</p>
                </div>
             </div>
             <div className="flex gap-2">
                <button className="px-4 py-2 rounded-xl bg-vasta-surface-soft text-xs font-bold text-vasta-text hover:bg-vasta-border transition-colors">
                  Semana
                </button>
             </div>
          </div>

          <div className="flex items-end justify-between h-48 gap-2 md:gap-4 px-2">
             {[
               { day: 'D', val: 30, active: false },
               { day: 'S', val: 45, active: false },
               { day: 'T', val: 75, active: true, price: 'R$ 2.567' },
               { day: 'Q', val: 50, active: false },
               { day: 'Q', val: 60, active: false },
               { day: 'S', val: 40, active: false },
               { day: 'S', val: 35, active: false },
             ].map((item, idx) => (
                <div key={idx} className="flex flex-col items-center gap-3 flex-1 group/bar cursor-pointer">
                   {item.active && (
                      <div className="mb-2 px-3 py-1.5 bg-vasta-text text-vasta-bg text-xs font-bold rounded-xl animate-in fade-in slide-in-from-bottom-2">
                        {item.price}
                      </div>
                   )}
                   <div 
                      className={`w-2 md:w-3 rounded-full transition-all duration-500 relative ${item.active ? 'bg-vasta-text h-32' : 'bg-vasta-border/50 hover:bg-vasta-primary/50 h-20'}`}
                      style={{ height: `${item.active ? 100 : item.val}%` }}
                   >
                       {item.active && (
                          <div className="absolute inset-0 bg-white/20 blur-sm animate-pulse" />
                       )}
                   </div>
                   <span className={`text-xs font-bold ${item.active ? 'text-vasta-text px-3 py-1 bg-vasta-text/5 rounded-lg' : 'text-vasta-muted'}`}>
                     {item.day}
                   </span>
                </div>
             ))}
          </div>

          <div className="mt-8 flex items-end gap-2">
             <h3 className="text-4xl font-black text-vasta-text tracking-tight">+20%</h3>
             <p className="text-sm text-vasta-muted mb-1.5 font-medium">vs. semana passada</p>
          </div>
        </div>

        {/* Right Column: Recent Projects / Activity */}
        <div className="space-y-6">
           <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-vasta-text">Vendas Recentes</h3>
              <button className="text-xs font-bold text-vasta-muted hover:text-vasta-primary transition-colors underline decoration-dotted">Ver tudo</button>
           </div>

           <div className="space-y-3">
              {[
                { title: "E-book Design System", amount: "R$ 49,90", status: "Pago", time: "2h atrás", type: "digital" },
                { title: "Mentoria 1h", amount: "R$ 150,00", status: "Pendente", time: "5h atrás", type: "service" },
                { title: "Pack Presets", amount: "R$ 29,90", status: "Pago", time: "1d atrás", type: "digital" },
              ].map((item, i) => (
                 <div key={i} className="group p-4 rounded-[1.5rem] bg-vasta-surface border border-vasta-border hover:border-vasta-primary/30 transition-all hover:shadow-lg hover:shadow-vasta-primary/5 cursor-pointer">
                    <div className="flex justify-between items-start mb-2">
                       <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl ${item.type === 'digital' ? 'bg-orange-500/10 text-orange-500' : 'bg-blue-500/10 text-blue-500'}`}>
                             {item.type === 'digital' ? <Wallet size={16} /> : <Clock size={16} />}
                          </div>
                          <div>
                             <h4 className="font-bold text-sm text-vasta-text">{item.title}</h4>
                             <p className="text-xs text-vasta-primary font-semibold">{item.amount}</p>
                          </div>
                       </div>
                       <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${item.status === 'Pago' ? 'bg-vasta-text text-vasta-bg' : 'bg-vasta-surface-soft text-vasta-muted'}`}>
                          {item.status}
                       </span>
                    </div>
                    <div className="flex items-center justify-between mt-3 pl-11">
                       <div className="flex gap-2">
                          <span className="text-[10px] font-medium bg-vasta-surface-soft px-2 py-0.5 rounded-md text-vasta-muted">Automático</span>
                       </div>
                       <span className="text-[10px] text-vasta-muted flex items-center gap-1">
                          <Clock size={10} /> {item.time}
                       </span>
                    </div>
                 </div>
              ))}
           </div>
        </div>
      </div>

      {/* Bottom Section: Connect & Premium Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         
         {/* Left: Quick Actions / Connect */}
         <div className="bg-vasta-surface p-6 rounded-[2rem] border border-vasta-border">
            <div className="flex items-center justify-between mb-6">
               <h3 className="font-bold text-vasta-text">Ações Rápidas</h3>
               <button className="text-xs text-vasta-muted hover:text-vasta-text">Editar</button>
            </div>
            
            <div className="space-y-4">
               <div className="flex items-center justify-between p-3 rounded-2xl bg-vasta-surface-soft/50 border border-vasta-border hover:bg-vasta-surface-soft transition-colors cursor-pointer group">
                  <div className="flex items-center gap-3">
                     <div className="h-10 w-10 rounded-full bg-vasta-surface border flex items-center justify-center shadow-sm">
                        <Plus size={18} className="text-vasta-text group-hover:scale-110 transition-transform" />
                     </div>
                     <div>
                        <p className="text-sm font-bold text-vasta-text">Novo Produto</p>
                        <p className="text-[10px] text-vasta-muted">Digital ou Físico</p>
                     </div>
                  </div>
                  <div className="h-8 w-8 rounded-full border border-vasta-border flex items-center justify-center bg-vasta-bg group-hover:bg-white group-hover:dark:bg-black transition-colors">
                     <ArrowUpRight size={14} className="text-vasta-muted" />
                  </div>
               </div>

               <div className="flex items-center justify-between p-3 rounded-2xl bg-vasta-surface-soft/50 border border-vasta-border hover:bg-vasta-surface-soft transition-colors cursor-pointer group">
                  <div className="flex items-center gap-3">
                     <div className="h-10 w-10 rounded-full bg-vasta-surface border flex items-center justify-center shadow-sm">
                        <MoreHorizontal size={18} className="text-vasta-text group-hover:scale-110 transition-transform" />
                     </div>
                     <div>
                        <p className="text-sm font-bold text-vasta-text">Personalizar Link</p>
                        <p className="text-[10px] text-vasta-muted">Aparência e temas</p>
                     </div>
                  </div>
                  <div className="h-8 w-8 rounded-full border border-vasta-border flex items-center justify-center bg-vasta-bg group-hover:bg-white group-hover:dark:bg-black transition-colors">
                     <ArrowUpRight size={14} className="text-vasta-muted" />
                  </div>
               </div>
            </div>
         </div>

         {/* Middle: Premium Banner */}
         <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-vasta-text to-stone-800 p-8 text-vasta-bg shadow-lg flex flex-col justify-between group">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-vasta-primary/30 blur-3xl group-hover:bg-vasta-primary/50 transition-colors duration-700"></div>
            
            <div className="relative z-10">
               <h3 className="text-2xl font-black tracking-tight mb-2">Vasta Premium</h3>
               <p className="text-vasta-bg/70 text-sm max-w-[200px]">Desbloqueie taxas menores, domínio próprio e temas exclusivos.</p>
            </div>

            <div className="relative z-10 mt-6">
               <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-vasta-bg text-vasta-text font-bold text-sm shadow-xl hover:scale-105 transition-transform">
                  Fazer Upgrade
                  <ArrowUpRight size={16} />
               </button>
            </div>
         </div>

         {/* Right: Pipeline Stats */}
         <div className="bg-vasta-surface p-6 rounded-[2rem] border border-vasta-border">
            <div className="flex items-center justify-between mb-6">
               <h3 className="font-bold text-vasta-text">Funil de Vendas</h3>
               <span className="text-xs text-vasta-muted">30 dias</span>
            </div>

            <div className="space-y-6">
               <div className="flex justify-between items-end">
                  <div>
                     <p className="text-xs text-vasta-muted mb-1">Visitantes</p>
                     <p className="text-2xl font-bold text-vasta-text">1.2k</p>
                  </div>
                  <div className="h-8 w-[1px] bg-vasta-border"></div>
                  <div>
                     <p className="text-xs text-vasta-muted mb-1">Cliques</p>
                     <p className="text-2xl font-bold text-vasta-text">840</p>
                  </div>
                  <div className="h-8 w-[1px] bg-vasta-border"></div>
                  <div>
                     <p className="text-xs text-vasta-muted mb-1">Vendas</p>
                     <p className="text-2xl font-bold text-vasta-text">42</p>
                  </div>
               </div>

               <div className="pt-4 flex items-end justify-between gap-1 h-12">
                   {[...Array(20)].map((_, i) => (
                      <div 
                        key={i} 
                        className={`w-1 rounded-full ${i > 14 ? 'bg-vasta-text' : (i > 8 ? 'bg-orange-500' : 'bg-vasta-border')}`}
                        style={{ height: `${Math.random() * 100}%`}}
                      />
                   ))}
               </div>
            </div>
         </div>

      </div>
    </div>
  )
}
