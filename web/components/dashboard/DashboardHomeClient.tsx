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
   Instagram,
   MousePointerClick
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
       <div className="space-y-8">
          
          {/* Welcome Section */}
          <div className="flex flex-col gap-2">
             <h1 className="text-3xl font-black text-vasta-text tracking-tight">
                Visão Geral
             </h1>
             <p className="text-vasta-muted">
                Acompanhe o desempenho da sua loja e acesse atalhos rápidos.
             </p>
          </div>

          {/* Top Grid: Revenue & Shortcuts */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

             {/* Main Chart Card */}
             <div className="xl:col-span-2 rounded-[2.5rem] bg-vasta-surface p-8 shadow-2xl shadow-black/5 border border-vasta-border relative overflow-hidden flex flex-col justify-between min-h-[360px] group">
                <div className="absolute inset-0 bg-gradient-to-br from-vasta-primary/5 via-transparent to-transparent opacity-50" />
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 relative z-10">
                   <div>
                      <div className="flex items-center gap-2 text-vasta-muted mb-2">
                         <Wallet className="w-5 h-5" />
                         <span className="text-xs font-bold uppercase tracking-wider opacity-80">Faturamento (7 dias)</span>
                      </div>
                      <h2 className="text-4xl sm:text-5xl font-black text-vasta-text tracking-tighter">
                         R$ {loading ? '...' : totalRevenueWeek.toFixed(2).replace('.', ',')}
                      </h2>
                   </div>

                   <div className="flex gap-2">
                      <div className="px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2 border border-emerald-500/20 shadow-sm backdrop-blur-sm">
                         <TrendingUp size={16} />
                         <span>+0% esta semana</span>
                      </div>
                   </div>
                </div>

                {/* Chart Bars */}
                <div className="flex items-end justify-between h-48 sm:h-56 gap-4 sm:gap-6 relative z-10">
                   {loading ? (
                      <div className="w-full h-full flex items-center justify-center text-vasta-muted text-sm font-medium animate-pulse">Carregando dados...</div>
                   ) : weeklyRevenue.length > 0 ? weeklyRevenue.map((item, idx) => (
                      <div key={idx} className="flex flex-col items-center gap-4 flex-1 group/bar cursor-pointer">
                         <div className="relative w-full flex items-end justify-center h-full"> 
                            {/* Bar Tooltip */}
                             <div className="absolute -top-12 opacity-0 group-hover/bar:opacity-100 transition-all duration-300 transform translate-y-2 group-hover/bar:translate-y-0 bg-vasta-text text-vasta-bg text-xs font-bold px-3 py-1.5 rounded-lg shadow-xl pointer-events-none whitespace-nowrap z-20">
                                {item.price}
                                <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-vasta-text rotate-45"></div>
                             </div>

                             <div
                                className={`w-full max-w-[48px] rounded-t-2xl transition-all duration-500 ease-out relative overflow-hidden ${item.active
                                   ? 'bg-gradient-to-t from-vasta-primary to-vasta-primary-soft shadow-lg shadow-vasta-primary/25'
                                   : 'bg-vasta-surface-soft hover:bg-vasta-primary/60 dark:bg-white/5'
                                   }`}
                                style={{ height: item.val === 0 ? '6px' : `${Math.max(item.heightPct, 8)}%` }}
                             >
                                {item.active && (
                                   <div className="absolute inset-0 bg-white/20 blur-sm animate-pulse" />
                                )}
                             </div>
                         </div>
                         <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider ${item.active ? 'text-vasta-text' : 'text-vasta-muted group-hover/bar:text-vasta-text/70 transition-colors'}`}>
                            {item.day}
                         </span>
                      </div>
                   )) : (
                      <div className="w-full text-center text-sm text-vasta-muted flex flex-col items-center justify-center h-full border-2 border-dashed border-vasta-border/50 rounded-2xl bg-vasta-surface-soft/20">
                         <BarChart3 className="mb-3 opacity-30 w-10 h-10" />
                         <span className="font-medium">Sem vendas esta semana</span>
                      </div>
                   )}
                </div>
             </div>

             {/* Right Column: Key Actions */}
             <div className="space-y-6 flex flex-col">

                {/* Shortcuts Grid */}
                <div className="grid grid-cols-2 gap-4 flex-1">
                   <a href="/dashboard/minha-loja" className="bg-vasta-surface p-6 rounded-[2rem] border border-vasta-border hover:border-vasta-primary/50 hover:shadow-xl hover:shadow-vasta-primary/10 transition-all duration-300 group flex flex-col justify-between aspect-square relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                         <ArrowUpRight size={18} className="text-vasta-primary" />
                      </div>
                      <div className="h-12 w-12 rounded-2xl bg-vasta-surface-soft group-hover:bg-vasta-primary group-hover:text-white dark:group-hover:text-black transition-colors duration-300 flex items-center justify-center text-vasta-text shadow-sm">
                         <Plus size={24} strokeWidth={2.5} />
                      </div>
                      <div>
                         <p className="font-bold text-base text-vasta-text leading-tight mb-1">Novo Produto</p>
                         <p className="text-xs text-vasta-muted group-hover:text-vasta-primary/80 transition-colors">Adicionar item</p>
                      </div>
                   </a>

                   <button onClick={copyLink} className="bg-vasta-surface p-6 rounded-[2rem] border border-vasta-border hover:border-vasta-accent/50 hover:shadow-xl hover:shadow-vasta-accent/10 transition-all duration-300 group flex flex-col justify-between aspect-square relative overflow-hidden">
                      <div className="h-12 w-12 rounded-2xl bg-vasta-surface-soft group-hover:bg-vasta-accent group-hover:text-white transition-colors duration-300 flex items-center justify-center text-vasta-text shadow-sm">
                         <Copy size={22} strokeWidth={2.5} />
                      </div>
                      <div>
                         <p className="font-bold text-base text-vasta-text leading-tight mb-1">{copied ? 'Copiado!' : 'Copiar Link'}</p>
                         <p className="text-xs text-vasta-muted group-hover:text-vasta-accent/80 transition-colors">Divulgar perfil</p>
                      </div>
                      {copied && <div className="absolute inset-0 bg-emerald-500/10 backdrop-blur-[1px] flex items-center justify-center animate-in fade-in zoom-in duration-200" ><div className="bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">Copiado!</div></div>}
                   </button>
                </div>

                {/* Instagram Banner */}
                <a href="/dashboard/aparencia#instagram-integration" className="relative overflow-hidden rounded-[2rem] p-[1px] group">
                   <div className="absolute inset-0 bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 opacity-20 group-hover:opacity-100 transition-opacity duration-300" />
                   <div className="relative bg-vasta-surface h-full rounded-[calc(2rem-1px)] p-6 flex items-center justify-between hover:bg-vasta-surface-soft/50 transition-colors">
                      <div className="flex items-center gap-4">
                         <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 p-[2px]">
                            <div className="h-full w-full rounded-full bg-vasta-surface border-2 border-transparent flex items-center justify-center text-vasta-text group-hover:bg-transparent group-hover:text-white transition-colors">
                               <Instagram size={20} />
                            </div>
                         </div>
                         <div>
                            <p className="font-bold text-base text-vasta-text">Instagram</p>
                            <p className="text-xs text-vasta-muted group-hover:text-vasta-accent transition-colors">Conectar feed</p>
                         </div>
                      </div>
                      <ArrowUpRight className="text-vasta-muted group-hover:text-vasta-text transition-colors" />
                   </div>
                </a>
             </div>
          </div>

          {/* Bottom Grid: Sales & Funnel */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

             {/* Recent Sales */}
             <div className="bg-vasta-surface rounded-[2.5rem] border border-vasta-border p-8 flex flex-col h-full shadow-sm">
                <div className="flex items-center justify-between mb-8">
                   <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-vasta-primary/10 text-vasta-primary rounded-xl">
                        <ShoppingBag size={20} />
                      </div>
                      <h3 className="font-bold text-xl text-vasta-text">Vendas Recentes</h3>
                   </div>
                   <a href="/dashboard/vendas" className="text-xs font-bold text-vasta-text hover:text-vasta-primary bg-vasta-surface-soft hover:bg-vasta-primary/10 px-4 py-2 rounded-full transition-all border border-vasta-border">
                      Ver tudo
                   </a>
                </div>

                <div className="space-y-3 flex-1">
                   {loading ? (
                      <div className="space-y-3">
                         {[1,2,3].map(i => <div key={i} className="h-16 rounded-2xl bg-vasta-surface-soft animate-pulse" />)}
                      </div>
                   ) : recentOrders.length > 0 ? recentOrders.map((item, i) => (
                      <div key={i} className="group flex items-center justify-between p-4 rounded-2xl hover:bg-vasta-surface-soft/80 transition-all border border-transparent hover:border-vasta-border/50 cursor-pointer">
                         <div className="flex items-center gap-4 min-w-0">
                            <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 border border-white/5 shadow-sm ${item.status === 'paid' ? 'bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 text-emerald-500' : 'bg-gradient-to-br from-amber-500/10 to-amber-500/5 text-amber-500'
                               }`}>
                               <ShoppingBag size={20} />
                            </div>
                            <div className="min-w-0">
                               <p className="font-bold text-sm text-vasta-text truncate pr-4">{item.products?.title || 'Produto Indisponível'}</p>
                               <p className="text-xs text-vasta-muted">{new Date(item.created_at).toLocaleDateString('pt-BR')} • {item.buyer_email ? item.buyer_email.split('@')[0] : 'Cliente'}</p>
                            </div>
                         </div>
                         <div className="text-right shrink-0">
                            <p className="font-bold text-sm text-vasta-text">R$ {item.amount.toFixed(2).replace('.', ',')}</p>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide mt-1 ${
                               item.status === 'paid' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
                            }`}>
                               {item.status === 'paid' ? 'Pago' : item.status}
                            </span>
                         </div>
                      </div>
                   )) : (
                      <div className="flex-1 min-h-[200px] flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-vasta-border/50 rounded-2xl bg-vasta-surface-soft/20">
                         <div className="h-16 w-16 rounded-full bg-vasta-surface border border-vasta-border flex items-center justify-center mb-4 text-vasta-muted">
                            <ShoppingBag size={24} />
                         </div>
                         <p className="text-base font-bold text-vasta-text mb-1">Ainda sem vendas</p>
                         <p className="text-xs text-vasta-muted max-w-[200px]">Compartilhe o link da sua loja para começar a vender!</p>
                      </div>
                   )}
                </div>
             </div>

             {/* Conversion Funnel */}
             <div className="bg-vasta-surface rounded-[2.5rem] border border-vasta-border p-8 flex flex-col h-full shadow-sm">
                <div className="flex items-center justify-between mb-8">
                   <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-vasta-primary/10 text-vasta-primary rounded-xl">
                        <TrendingUp size={20} />
                      </div>
                      <h3 className="font-bold text-xl text-vasta-text">Funil de Conversão</h3>
                   </div>
                   <div className="flex items-center gap-2 px-3 py-1 bg-vasta-surface-soft rounded-full border border-vasta-border">
                      <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] font-bold text-vasta-muted uppercase tracking-wide">Tempo Real</span>
                   </div>
                </div>

                <div className="flex-1 flex flex-col justify-center gap-4 relative">
                   {/* Visual Connection Line */}
                   <div className="absolute left-[23px] top-6 bottom-6 w-0.5 bg-gradient-to-b from-blue-500/20 via-purple-500/20 to-emerald-500/20" />

                   {[
                      { label: "Visitas no Perfil", val: "0", sub: "visualizações únicas", icon: Wallet, color: "text-blue-500", bg: "bg-blue-500" },
                      { label: "Cliques em Produtos", val: "0", sub: "intenção de compra", icon: MousePointerClick, color: "text-purple-500", bg: "bg-purple-500" },
                      { label: "Vendas Realizadas", val: recentOrders.length, sub: "conversão total", icon: CreditCard, color: "text-emerald-500", bg: "bg-emerald-500" }
                   ].map((step, idx) => (
                      <div key={idx} className="relative z-10 bg-vasta-surface hover:bg-vasta-surface-soft transition-colors border border-vasta-border p-5 rounded-2xl flex items-center justify-between group">
                         <div className="flex items-center gap-4">
                            <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 border border-vasta-border shadow-sm z-10 bg-vasta-surface ${step.color}`}>
                               {/* Icon Placeholder since I need to import MousePointerClick */}
                               {idx === 0 && <Wallet size={20} />}
                               {idx === 1 && <ArrowUpRight size={20} />}
                               {idx === 2 && <ShoppingBag size={20} />}
                            </div>
                            <div>
                               <p className="text-xs font-bold text-vasta-muted uppercase tracking-wider mb-0.5">{step.label}</p>
                               <p className="text-xs text-vasta-muted opacity-60">{step.sub}</p>
                            </div>
                         </div>
                         <div className="text-right">
                           <p className="text-2xl font-black text-vasta-text group-hover:scale-110 transition-transform origin-right">{step.val}</p>
                         </div>
                      </div>
                   ))}
                </div>
                
                <div className="mt-6 pt-6 border-t border-vasta-border flex items-center gap-3 text-vasta-muted opacity-60">
                   <AlertCircle size={14} />
                   <p className="text-[10px]">Dados de visitas e cliques atualizados a cada 15 minutos.</p>
                </div>
             </div>
          </div>
       </div>
    )
}
