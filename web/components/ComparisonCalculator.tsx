"use client"

import { useState, useMemo } from "react"
import { Calculator, Check, AlertCircle, TrendingUp, DollarSign } from "lucide-react"

export function ComparisonCalculator() {
    const [revenue, setRevenue] = useState<number>(10000)
    const [ticket, setTicket] = useState<number>(100)

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(val)
    }

    const results = useMemo(() => {
        // Avoid division by zero
        const avgTicket = ticket > 0 ? ticket : 1
        const transactions = Math.ceil(revenue / avgTicket)

        // Competitors Fees (Standard Market Rates)
        // Hotmart: 9.90% + R$ 1.00 per transaction
        const hotmartFeeTotal = (revenue * 0.099) + (transactions * 1.00)
        const hotmartNet = revenue - hotmartFeeTotal

        // Kiwify: 8.99% + R$ 2.49 per transaction
        const kiwifyFeeTotal = (revenue * 0.0899) + (transactions * 2.49)
        const kiwifyNet = revenue - kiwifyFeeTotal

        // Vasta Plans
        // Start: 8% flat
        const vastaStartFee = revenue * 0.08
        const vastaStartNet = revenue - vastaStartFee

        // Pro: 4% + R$ 49/mo
        const vastaProFee = (revenue * 0.04) + 49
        const vastaProNet = revenue - vastaProFee

        // Business: 1% + R$ 99/mo
        const vastaBusinessFee = (revenue * 0.01) + 99
        const vastaBusinessNet = revenue - vastaBusinessFee

        // Find Best Vasta Plan
        const vastaPlans = [
            { name: "Start", net: vastaStartNet, feeString: "8%" },
            { name: "Pro", net: vastaProNet, feeString: "4% + R$49/mês" },
            { name: "Business", net: vastaBusinessNet, feeString: "1% + R$99/mês" }
        ]

        // Sort by Net Income descending
        const bestVasta = vastaPlans.sort((a, b) => b.net - a.net)[0]

        // Calculate max value for graph scaling
        const maxNet = Math.max(vastaStartNet, vastaProNet, vastaBusinessNet)

        return {
            transactions,
            hotmart: {
                net: hotmartNet,
                feeTotal: hotmartFeeTotal
            },
            kiwify: {
                net: kiwifyNet,
                feeTotal: kiwifyFeeTotal
            },
            vasta: {
                net: bestVasta.net,
                feeTotal: revenue - bestVasta.net,
                planName: bestVasta.name,
                feeString: bestVasta.feeString
            },
            maxNet
        }
    }, [revenue, ticket])

    const scrollToPlans = () => {
        const plansSection = document.getElementById('precos')
        if (plansSection) {
            plansSection.scrollIntoView({ behavior: 'smooth' })
        }
    }

    return (
        <div className="w-full max-w-7xl mx-auto p-6 md:p-10 rounded-[2.5rem] bg-vasta-surface border border-vasta-border shadow-2xl relative overflow-hidden flex flex-col gap-10">
            {/* Decorative Elements */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-vasta-primary/5 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl" />

            <div className="relative z-10">
                <div className="text-center mb-10">
                    <h2 className="text-3xl md:text-4xl font-black text-vasta-text mb-4">
                        Quanto você está <span className="text-red-500">perdendo</span> em taxas?
                    </h2>
                    <p className="text-vasta-muted max-w-xl mx-auto">
                        Compare o Vasta com as principais plataformas do mercado e veja a diferença no seu bolso.
                    </p>
                </div>

                {/* Main Content Grid */}
                <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">

                    {/* INPUTS */}
                    <div className="space-y-6 h-full flex flex-col justify-center">
                        {/* Faturamento Mensal Slider */}
                        <div className="bg-vasta-bg p-6 md:p-8 rounded-3xl border border-vasta-border shadow-inner">
                            <label className="block text-sm font-bold text-vasta-muted mb-4 uppercase tracking-wider">
                                Faturamento Mensal
                            </label>
                            <div className="mb-6">
                                <span className="block text-4xl font-black text-vasta-text">
                                    {formatCurrency(revenue)}
                                </span>
                            </div>
                            <input
                                type="range"
                                min="1000"
                                max="500000"
                                step="1000"
                                value={revenue}
                                onChange={(e) => setRevenue(Number(e.target.value))}
                                aria-label="Faturamento Mensal"
                                className="w-full h-3 bg-vasta-surface-soft rounded-lg appearance-none cursor-pointer accent-vasta-primary hover:accent-vasta-primary/80 transition-all"
                            />
                            <div className="flex justify-between text-[10px] text-vasta-muted font-medium mt-3">
                                <span>R$ 1k</span>
                                <span>R$ 500k+</span>
                            </div>
                        </div>

                        {/* Ticket Médio Slider */}
                        <div className="bg-vasta-bg p-6 md:p-8 rounded-3xl border border-vasta-border shadow-inner">
                            <div className="flex justify-between items-center mb-4">
                                <label className="block text-sm font-bold text-vasta-muted uppercase tracking-wider">
                                    Ticket Médio (Valor do Produto)
                                </label>
                                <div className="group relative">
                                    <AlertCircle className="w-4 h-4 text-vasta-muted cursor-help" />
                                    <div className="absolute bottom-full right-0 mb-2 w-64 p-3 bg-black text-white text-xs rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 shadow-xl">
                                        Usamos o ticket médio para calcular as taxas fixas por transação cobradas pelos concorrentes (ex: R$ 2,49).
                                    </div>
                                </div>
                            </div>

                            <div className="mb-6 flex items-baseline gap-2">
                                <span className="block text-4xl font-black text-vasta-text">
                                    {formatCurrency(ticket)}
                                </span>
                                <span className="text-xs text-vasta-muted font-bold">
                                    (~ {results.transactions} vendas/mês)
                                </span>
                            </div>

                            <input
                                type="range"
                                min="10"
                                max="5000"
                                step="10"
                                value={ticket}
                                onChange={(e) => setTicket(Number(e.target.value))}
                                aria-label="Ticket Médio"
                                className="w-full h-3 bg-vasta-surface-soft rounded-lg appearance-none cursor-pointer accent-vasta-primary hover:accent-vasta-primary/80 transition-all"
                            />
                            <div className="flex justify-between text-[10px] text-vasta-muted font-medium mt-3">
                                <span>R$ 10</span>
                                <span>R$ 5k</span>
                            </div>
                        </div>
                    </div>

                    {/* RESULTS */}
                    <div className="h-full flex flex-col justify-between gap-6">
                        {/* Vasta Card (Highlighted) */}
                        <div className="relative group overflow-hidden p-8 rounded-[2rem] bg-gradient-to-br from-emerald-500/10 to-vasta-primary/5 border border-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300 transform hover:-translate-y-1">
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className="relative z-10 flex justify-between items-center mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
                                        <DollarSign size={24} className="stroke-[3px]" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-vasta-text">Na Vasta</h3>
                                        <div className="text-xs font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full w-fit mt-1">
                                            Melhor Opção: Plano {results.vasta.planName}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="relative z-10">
                                <p className="text-sm font-bold text-vasta-text/60 mb-2">Você recebe líquido:</p>
                                <p className="text-5xl lg:text-6xl font-black text-emerald-600 tracking-tighter">
                                    {formatCurrency(results.vasta.net)}
                                </p>
                                <p className="mt-4 text-xs font-bold text-vasta-muted border-t border-emerald-500/10 pt-3">
                                    Taxas totais: {formatCurrency(results.vasta.feeTotal)} ({results.vasta.feeString})
                                </p>
                            </div>
                        </div>

                        {/* Comparative Graph - Mobile/Desktop */}
                        <div className="flex items-end justify-between h-32 px-4 gap-4 mt-2 mb-2">
                           {/* Hotmart Bar */}
                           <div className="flex flex-col items-center justify-end h-full flex-1 group relative">
                              <span className="text-[10px] font-bold text-red-400 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">-{formatCurrency(results.vasta.net - results.hotmart.net)}</span>
                              <div 
                                style={{ height: `${(results.hotmart.net / results.maxNet) * 100}%` }} 
                                className="w-full bg-red-400/20 rounded-t-lg border-t border-x border-red-400/30 relative hover:bg-red-400/30 transition-all"
                              >
                              </div>
                              <span className="text-[10px] font-bold text-vasta-muted mt-2">Hotmart</span>
                           </div>

                           {/* Kiwify Bar */}
                           <div className="flex flex-col items-center justify-end h-full flex-1 group relative">
                              <span className="text-[10px] font-bold text-red-400 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">-{formatCurrency(results.vasta.net - results.kiwify.net)}</span>
                              <div 
                                style={{ height: `${(results.kiwify.net / results.maxNet) * 100}%` }} 
                                className="w-full bg-red-400/20 rounded-t-lg border-t border-x border-red-400/30 relative hover:bg-red-400/30 transition-all"
                              >
                              </div>
                              <span className="text-[10px] font-bold text-vasta-muted mt-2">Kiwify</span>
                           </div>

                           {/* Vasta Bar */}
                           <div className="flex flex-col items-center justify-end h-full flex-1 relative">
                              <span className="text-[10px] font-bold text-emerald-500 mb-1">Ganhador</span>
                              <div 
                                style={{ height: `100%` }} 
                                className="w-full bg-emerald-500 rounded-t-lg shadow-[0_0_20px_rgba(16,185,129,0.3)] relative"
                              >
                                <div className="absolute inset-0 bg-gradient-to-t from-black/0 to-white/20"></div>
                              </div>
                              <span className="text-xs font-black text-emerald-500 mt-2">Vasta</span>
                           </div>
                        </div>

                        {/* Competitors */}
                        <div className="grid gap-3">
                            {/* Kiwify */}
                            <div className="p-5 rounded-3xl bg-vasta-bg border border-vasta-border opacity-90 hover:opacity-100 transition-opacity hover:border-vasta-border/80">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h4 className="font-bold text-vasta-text text-sm mb-1">Na Kiwify</h4>
                                        <p className="text-2xl font-bold text-vasta-muted tracking-tight">
                                            {formatCurrency(results.kiwify.net)}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs font-bold text-red-400 bg-red-400/10 px-2 py-1 rounded-lg mb-1 inline-block">
                                            -{formatCurrency(results.vasta.net - results.kiwify.net)}
                                        </div>
                                        <p className="text-[10px] text-vasta-muted">Taxa: 8.99% + R$ 2,49</p>
                                    </div>
                                </div>
                            </div>

                            {/* Hotmart */}
                            <div className="p-5 rounded-3xl bg-vasta-bg border border-vasta-border opacity-90 hover:opacity-100 transition-opacity hover:border-vasta-border/80">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h4 className="font-bold text-vasta-text text-sm mb-1">Na Hotmart</h4>
                                        <p className="text-2xl font-bold text-vasta-muted tracking-tight">
                                            {formatCurrency(results.hotmart.net)}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs font-bold text-red-500 bg-red-500/10 px-2 py-1 rounded-lg mb-1 inline-block">
                                            -{formatCurrency(results.vasta.net - results.hotmart.net)}
                                        </div>
                                        <p className="text-[10px] text-vasta-muted">Taxa: 9.90% + R$ 1,00</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Disclaimer (Full Width) */}
                <div className="mt-8 p-5 rounded-2xl bg-vasta-bg/50 border border-vasta-border/50 text-[10px] text-vasta-muted/80 leading-relaxed text-center max-w-4xl mx-auto">
                    <p>
                        <strong>* Bases de comparação (Jan/2025):</strong> Hotmart: 9.90% + R$ 1,00 por transação. | Kiwify: 8.99% + R$ 2,49 por transação. | Vasta: Planos Start (8%), Pro (4% + mensalidade) ou Business (1% + mensalidade). O cálculo seleciona automaticamente o melhor plano para seu volume.
                    </p>
                </div>
            </div>

            {/* Footer CTA */}
            <div className="pt-2 border-t border-vasta-border/50 text-center">
                <p className="text-vasta-muted mb-6 text-sm font-medium">
                    Não deixe seu dinheiro na mesa. Mude para a Vasta hoje mesmo.
                </p>
                <button
                    onClick={scrollToPlans}
                    className="inline-flex items-center gap-3 bg-vasta-primary text-vasta-bg px-10 py-5 rounded-2xl font-black text-lg shadow-xl shadow-vasta-primary/20 hover:scale-105 hover:shadow-2xl hover:shadow-vasta-primary/30 transition-all duration-300 group"
                >
                    Começar a economizar agora
                    <TrendingUp className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    )
}
