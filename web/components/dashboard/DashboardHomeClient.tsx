"use client"

import { useState, useEffect } from "react"
import {
   BarChart3,
   ArrowUpRight,
   Wallet,
   Plus,
   ShoppingBag,
   TrendingUp,
   CreditCard,
   Copy,
   AlertCircle,
   Instagram
} from "lucide-react"

interface DashboardHomeClientProps {
  ordersData: any[] | null
}

export default function DashboardHomeClient({ ordersData }: DashboardHomeClientProps) {
   const [loading, setLoading] = useState(true)
   const [recentOrders, setRecentOrders] = useState<any[]>([])
   const [weeklyRevenue, setWeeklyRevenue] = useState<any[]>([])
   const [totalRevenueWeek, setTotalRevenueWeek] = useState(0)

   // Quick Copied State
   const [copied, setCopied] = useState(false)

   useEffect(() => {
      if (ordersData) {
         // 1. Recent Orders (Top 4 for compact view)
         setRecentOrders(ordersData.slice(0, 4))

         // 2. Weekly Revenue Chart (Last 7 days)
         const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date()
            d.setDate(d.getDate() - (6 - i))
            return d
         })

         let weekTotal = 0;

         const chartData = last7Days.map(date => {
            const dayStr = date.toLocaleDateString('pt-BR', { weekday: 'narrow' }).toUpperCase()
            const dateStr = date.toISOString().split('T')[0]

            // Sum revenue for this day
            // Note: dateStr comparison might be sensitive to timezone if created_at is UTC. 
            // Ideally we normalize both to same timezone. For now keeping original logic.
            const daysOrders = ordersData.filter((o: any) => o.created_at.startsWith(dateStr) && o.status === 'paid')
            const dailyVal = daysOrders.reduce((acc: number, o: any) => acc + (o.amount || 0), 0)

            weekTotal += dailyVal;

            // Determine if it's the "active" highlight day (today)
            const isToday = date.getDate() === new Date().getDate()

            return {
               day: dayStr,
               val: dailyVal,
               active: isToday,
               price: `R$ ${dailyVal.toFixed(0)}`
            }
         })

         setTotalRevenueWeek(weekTotal)

         // Normalize values for bar height (max 100%)
         const maxVal = Math.max(...chartData.map(d => d.val)) || 1
         const normalizedChartData = chartData.map(d => ({
            ...d,
            heightPct: (d.val / maxVal) * 100
         }))

         setWeeklyRevenue(normalizedChartData)
      }
      setLoading(false)
   }, [ordersData])

   const copyLink = () => {
      // Mock copy for now, or use actual profile link if available globally
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
   }

   return (
      <div className="space-y-6 animate-in fade-in duration-500">

         {/* Top Grid */}
         <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

            {/* Main Chart Card */}
            <div className="xl:col-span-2 rounded-[2rem] bg-vasta-surface p-6 sm:p-8 shadow-sm border border-vasta-border relative overflow-hidden flex flex-col justify-between min-h-[320px]">
               <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 relative z-10">
                  <div>
                     <div className="flex items-center gap-2 text-vasta-muted mb-1">
                        <Wallet className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">Faturamento (7 dias)</span>
                     </div>
                     <h2 className="text-3xl sm:text-4xl font-black text-vasta-text tracking-tight">
                        R$ {loading ? '...' : totalRevenueWeek.toFixed(2).replace('.', ',')}
                     </h2>
                  </div>

                  <div className="flex gap-2">
                     <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 text-xs font-bold flex items-center gap-1.5 border border-emerald-500/20">
                        <TrendingUp size={14} />
                        <span>+0% esta semana</span>
                     </div>
                  </div>
               </div>

               <div className="flex items-end justify-between h-40 sm:h-48 gap-3 sm:gap-6 relative z-10">
                  {loading ? (
                     <div className="w-full h-full flex items-center justify-center text-vasta-muted text-xs animate-pulse">Carregando dados...</div>
                  ) : weeklyRevenue.length > 0 ? weeklyRevenue.map((item, idx) => (
                     <div key={idx} className="flex flex-col items-center gap-3 flex-1 group/bar cursor-default">
                        {/* Tooltip on Hover */}
                        <div className="opacity-0 group-hover/bar:opacity-100 transition-opacity absolute -top-8 bg-vasta-text text-vasta-bg text-[10px] font-bold px-2 py-1 rounded-lg pointer-events-none whitespace-nowrap z-20">
                           {item.price}
                        </div>

                        <div
                           className={`w-full max-w-[40px] rounded-t-xl sm:rounded-2xl transition-all duration-700 ease-out relative overflow-hidden ${item.active
                              ? 'bg-vasta-text shadow-lg shadow-vasta-text/20'
                              : 'bg-vasta-surface-soft hover:bg-vasta-primary/60'
                              }`}
                           style={{ height: item.val === 0 ? '8px' : `${Math.max(item.heightPct, 10)}%` }}
                        >
                           {item.active && (
                              <div className="absolute inset-0 bg-white/20 blur-md animate-pulse" />
                           )}
                        </div>
                        <span className={`text-[10px] sm:text-xs font-bold ${item.active ? 'text-vasta-text' : 'text-vasta-muted'}`}>
                           {item.day}
                        </span>
                     </div>
                  )) : (
                     <div className="w-full text-center text-xs text-vasta-muted flex flex-col items-center justify-center h-full border-2 border-dashed border-vasta-border rounded-xl">
                        <BarChart3 className="mb-2 opacity-50" />
                        Sem dados de vendas
                     </div>
                  )}
               </div>

               {/* Background Decor */}
               <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                  <Wallet className="w-64 h-64 rotate-[-15deg] translate-x-12 -translate-y-12" />
               </div>
            </div>

            {/* Right Column: Key Actions & Premium */}
            <div className="space-y-6 flex flex-col">

               {/* Action Cards */}
               <div className="grid grid-cols-2 gap-4">
                  <a href="/dashboard/minha-loja" className="bg-vasta-surface p-5 rounded-[1.5rem] border border-vasta-border hover:border-vasta-primary/50 hover:shadow-lg hover:shadow-vasta-primary/5 transition-all group flex flex-col justify-between aspect-square">
                     <div className="h-10 w-10 rounded-full bg-vasta-surface-soft flex items-center justify-center group-hover:bg-vasta-primary/10 group-hover:text-vasta-primary transition-colors">
                        <Plus size={20} />
                     </div>
                     <div>
                        <p className="font-bold text-sm text-vasta-text leading-tight">Novo Produto</p>
                        <p className="text-[10px] text-vasta-muted mt-1 group-hover:text-vasta-primary/80">Adicionar item</p>
                     </div>
                  </a>

                  <button onClick={copyLink} className="bg-vasta-surface p-5 rounded-[1.5rem] border border-vasta-border hover:border-vasta-accent/50 hover:shadow-lg hover:shadow-vasta-accent/5 transition-all group flex flex-col justify-between aspect-square relative overflow-hidden">
                     <div className="h-10 w-10 rounded-full bg-vasta-surface-soft flex items-center justify-center group-hover:bg-vasta-accent/10 group-hover:text-vasta-accent transition-colors">
                        <Copy size={18} />
                     </div>
                     <div>
                        <p className="font-bold text-sm text-vasta-text leading-tight">{copied ? 'Copiado!' : 'Copiar Link'}</p>
                        <p className="text-[10px] text-vasta-muted mt-1 group-hover:text-vasta-accent/80">Compartilhar perfil</p>
                     </div>
                     {copied && <div className="absolute inset-0 bg-emerald-500/10 animate-pulse" />}
                  </button>
               </div>

               {/* Instagram Integration Card - Highlight */}
               <a href="/dashboard/aparencia#instagram-integration" className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 p-5 rounded-[1.5rem] border border-pink-500/20 hover:border-pink-500/40 hover:shadow-lg hover:shadow-pink-500/5 transition-all group flex items-center justify-between relative overflow-hidden">
                  <div className="absolute inset-0 bg-white/40 dark:bg-black/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex items-center gap-4 relative z-10">
                     <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 text-white flex items-center justify-center shadow-md">
                        <Instagram size={20} />
                     </div>
                     <div>
                        <p className="font-bold text-sm text-vasta-text leading-tight">Conectar Instagram</p>
                        <p className="text-[10px] text-vasta-muted mt-0.5 group-hover:text-vasta-primary transition-colors">Exiba seus posts no perfil</p>
                     </div>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-vasta-surface border border-vasta-border flex items-center justify-center text-vasta-muted group-hover:text-vasta-text transition-colors relative z-10">
                     <ArrowUpRight size={16} />
                  </div>
               </a>

               {/* Premium Banner (Compact) */}
               <div className="flex-1 relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-stone-900 via-stone-800 to-black p-6 text-white shadow-xl flex flex-col justify-center gap-4 group">
                  <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 mix-blend-overlay"></div>
                  <div className="absolute right-0 top-0 w-32 h-32 bg-vasta-primary/40 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 group-hover:bg-vasta-primary/60 transition-colors"></div>

                  <div className="relative z-10">
                     <div className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-white/20 border border-white/10 mb-2 backdrop-blur-sm">PRO</div>
                     <h3 className="text-xl font-bold leading-tight">Desbloqueie todo o poder.</h3>
                     <p className="text-xs text-gray-400 mt-2 line-clamp-2">Taxas menores, domínio personalizado e temas exclusivos.</p>
                  </div>
                  <a href="/dashboard/billing" className="relative z-10 w-fit px-5 py-2.5 rounded-xl bg-white text-black text-xs font-bold hover:scale-105 transition-transform shadow-lg shadow-white/10">
                     Ver Planos
                  </a>
               </div>
            </div>
         </div>

         {/* Bottom Grid: Recent Sales & Funnel */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Recent Sales - Condensed */}
            <div className="bg-vasta-surface rounded-[2rem] border border-vasta-border p-6 sm:p-8">
               <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-lg text-vasta-text">Vendas Recentes</h3>
                  <a href="/dashboard/vendas" className="text-xs font-bold text-vasta-primary hover:text-vasta-primary/80 bg-vasta-primary/5 px-3 py-1.5 rounded-full transition-colors">
                     Ver todas
                  </a>
               </div>

               <div className="space-y-2">
                  {loading ? (
                     <div className="h-24 rounded-2xl bg-vasta-surface-soft animate-pulse" />
                  ) : recentOrders.length > 0 ? recentOrders.map((item, i) => (
                     <div key={i} className="group flex items-center justify-between p-3 rounded-2xl hover:bg-vasta-surface-soft transition-colors border border-transparent hover:border-vasta-border/50">
                        <div className="flex items-center gap-3 min-w-0">
                           <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${item.status === 'paid' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                              }`}>
                              <ShoppingBag size={18} />
                           </div>
                           <div className="min-w-0">
                              <p className="font-bold text-sm text-vasta-text truncate pr-2">{item.products?.title || 'Produto Indisponível'}</p>
                              <p className="text-[10px] text-vasta-muted">{new Date(item.created_at).toLocaleDateString('pt-BR')} • {item.buyer_email ? item.buyer_email.split('@')[0] : 'Anônimo'}</p>
                           </div>
                        </div>
                        <div className="text-right shrink-0">
                           <p className="font-bold text-sm text-vasta-text">R$ {item.amount.toFixed(2).replace('.', ',')}</p>
                           <p className={`text-[10px] font-bold uppercase ${item.status === 'paid' ? 'text-emerald-500' : 'text-amber-500'}`}>
                              {(item.status === 'paid' && 'Pago') ||
                                 (item.status === 'pending' && 'Pendente') ||
                                 (item.status === 'failed' && 'Falhou') ||
                                 (item.status === 'canceled' && 'Cancelado') ||
                                 item.status}
                           </p>
                        </div>
                     </div>
                  )) : (
                     <div className="py-8 text-center bg-vasta-surface-soft/30 rounded-2xl border border-dashed border-vasta-border">
                        <ShoppingBag className="mx-auto h-8 w-8 text-vasta-muted/50 mb-2" />
                        <p className="text-sm font-bold text-vasta-text">Nenhuma venda</p>
                        <p className="text-[10px] text-vasta-muted">Compartilhe seu link para começar!</p>
                     </div>
                  )}
               </div>
            </div>

            {/* Funnel - Improved Visuals */}
            <div className="bg-vasta-surface rounded-[2rem] border border-vasta-border p-6 sm:p-8 flex flex-col">
               <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-2">
                     <h3 className="font-bold text-lg text-vasta-text">Funil de Conversão</h3>
                     <span className="bg-vasta-surface-soft text-[10px] font-bold px-2 py-0.5 rounded text-vasta-muted border border-vasta-border">07 dias</span>
                  </div>
                  <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" title="Tracking Ativo" />
               </div>

               <div className="flex-1 grid grid-cols-3 gap-2 relative">
                  {/* Connector Line */}
                  <div className="absolute top-1/2 left-0 right-0 h-1 bg-vasta-surface-soft -translate-y-1/2 rounded-full z-0" />

                  {/* Steps */}
                  {[
                     { label: "Visitas", val: "--", icon: Wallet /* Placeholder icon, clearly not correct but visually ok for now */, color: "bg-blue-500" },
                     { label: "Cliques", val: "--", icon: ArrowUpRight, color: "bg-purple-500" },
                     { label: "Vendas", val: recentOrders.length, icon: CreditCard, color: "bg-emerald-500" }
                  ].map((step, idx) => (
                     <div key={idx} className="relative z-10 bg-vasta-surface border border-vasta-border hover:border-vasta-primary/50 transition-colors p-4 rounded-2xl text-center flex flex-col items-center justify-center gap-2 shadow-sm">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-vasta-muted">{step.label}</p>
                        <p className="text-2xl font-black text-vasta-text">{step.val}</p>
                        <div className={`h-1 w-8 rounded-full ${step.color} opacity-50`} />
                     </div>
                  ))}
               </div>

               <div className="mt-8 bg-vasta-surface-soft/50 rounded-xl p-3 flex items-start gap-3 border border-vasta-border/50">
                  <div className="p-1.5 bg-orange-500/10 text-orange-500 rounded-lg shrink-0">
                     <AlertCircle size={14} />
                  </div>
                  <div>
                     <p className="text-xs font-bold text-vasta-text">Analytics em calibração</p>
                     <p className="text-[10px] text-vasta-muted leading-tight mt-0.5">
                        Estamos coletando dados iniciais do seu perfil. Métricas de visitas e cliques aparecerão em breve.
                     </p>
                  </div>
               </div>
            </div>
         </div>


      </div>
   )
}
