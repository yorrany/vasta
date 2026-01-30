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
        <div className="w-full max-w-7xl mx-auto p-8 lg:p-12 rounded-[3rem] bg-vasta-surface border border-vasta-border shadow-2xl relative overflow-hidden flex flex-col gap-12">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-vasta-primary/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative z-10 text-center max-w-2xl mx-auto">
                <h2 className="text-3xl md:text-5xl font-black text-vasta-text mb-4 tracking-tight">
                    Quanto você perde <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-amber-500">em taxas abusivas?</span>
                </h2>
                <p className="text-lg text-vasta-muted">
                    Compare o Vasta com as plataformas tradicionais e veja o impacto no seu lucro líquido anual.
                </p>
            </div>

            <div className="relative z-10 grid lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Column: Controls */}
                <div className="lg:col-span-5 space-y-4">
                    <div className="bg-vasta-bg/50 backdrop-blur-sm p-8 rounded-[2rem] border border-vasta-border/50">
                        <label className="block text-xs font-bold text-vasta-muted mb-6 uppercase tracking-wider flex justify-between">
                            <span>Faturamento Mensal</span>
                            <span className="text-vasta-primary">{formatCurrency(revenue)}</span>
                        </label>
                        <input
                            type="range"
                            min="1000"
                            max="500000"
                            step="1000"
                            value={revenue}
                            onChange={(e) => setRevenue(Number(e.target.value))}
                            className="w-full h-2 bg-vasta-surface-soft rounded-lg appearance-none cursor-pointer accent-vasta-primary"
                        />
                         <div className="flex justify-between text-[10px] text-vasta-muted font-medium mt-3">
                            <span>Iniciante</span>
                            <span>Escala</span>
                        </div>
                    </div>

                    <div className="bg-vasta-bg/50 backdrop-blur-sm p-8 rounded-[2rem] border border-vasta-border/50">
                        <div className="flex justify-between items-center mb-6">
                            <label className="block text-xs font-bold text-vasta-muted uppercase tracking-wider">
                                Ticket Médio
                            </label>
                            <span className="text-xs font-bold text-vasta-primary">{formatCurrency(ticket)}</span>
                        </div>
                        <input
                            type="range"
                            min="10"
                            max="5000"
                            step="10"
                            value={ticket}
                            onChange={(e) => setTicket(Number(e.target.value))}
                            className="w-full h-2 bg-vasta-surface-soft rounded-lg appearance-none cursor-pointer accent-vasta-primary"
                        />
                         <div className="flex justify-between text-[10px] text-vasta-muted font-medium mt-3">
                            <span>E-book</span>
                            <span>Mentoria</span>
                        </div>
                    </div>

                    {/* Disclaimer */}
                    <p className="text-[10px] text-vasta-muted/60 leading-relaxed px-4 text-center lg:text-left">
                        *Cálculo baseado nas taxas públicas de Jan/2025. O Plano Vasta é selecionado automaticamente para garantir a maior economia possível para o seu volume.
                    </p>
                </div>

                {/* Right Column: Visual Result */}
                <div className="lg:col-span-7 bg-vasta-bg rounded-[2.5rem] border border-vasta-border p-8 lg:p-10 relative overflow-hidden group">
                     <div className="absolute top-0 right-0 p-32 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none group-hover:bg-emerald-500/20 transition-colors duration-700" />
                    
                    <div className="relative z-10 flex flex-col gap-8 h-full">
                        {/* Winner Header */}
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-vasta-border/50 pb-8">
                            <div>
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-wider mb-2">
                                    <TrendingUp size={12} />
                                    Economia Anual Estimada
                                </div>
                                <div className="text-4xl md:text-5xl font-black text-vasta-text tracking-tight">
                                    <span className="text-emerald-500">+{formatCurrency((results.vasta.net - results.hotmart.net) * 12)}</span>
                                </div>
                                <p className="text-xs text-vasta-muted mt-2">
                                    Dinheiro que sobra no seu bolso com a Vasta em comparação a Hotmart.
                                </p>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-bold text-vasta-text mb-1">Seu Recebimento Líquido</div>
                                <div className="text-2xl md:text-3xl font-black text-vasta-text">{formatCurrency(results.vasta.net)}<span className="text-sm text-vasta-muted font-medium">/més</span></div>
                            </div>
                        </div>

                        {/* Graph Visualization */}
                        <div className="flex items-end gap-2 h-48 md:h-56 mt-auto">
                            {/* Hotmart */}
                            <div className="flex-1 flex flex-col justify-end group/bar relative h-full">
                                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-red-500/10 text-red-500 text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap">
                                    -{formatCurrency(results.vasta.net - results.hotmart.net)}
                                </span>
                                <div 
                                    style={{ height: `${(results.hotmart.net / results.maxNet) * 100}%` }} 
                                    className="w-full bg-vasta-border/40 rounded-t-xl relative overflow-hidden transition-all duration-500 group-hover/bar:bg-red-500/20"
                                >
                                     {/* Pattern overlay */}
                                     <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
                                </div>
                                <span className="text-[10px] font-bold text-vasta-muted mt-3 text-center uppercase tracking-wide">Hotmart</span>
                            </div>

                            {/* Kiwify */}
                            <div className="flex-1 flex flex-col justify-end group/bar relative h-full">
                                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-red-500/10 text-red-500 text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap">
                                    -{formatCurrency(results.vasta.net - results.kiwify.net)}
                                </span>
                                <div 
                                    style={{ height: `${(results.kiwify.net / results.maxNet) * 100}%` }} 
                                    className="w-full bg-vasta-border/40 rounded-t-xl relative overflow-hidden transition-all duration-500 group-hover/bar:bg-red-500/20"
                                >
                                    <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
                                </div>
                                <span className="text-[10px] font-bold text-vasta-muted mt-3 text-center uppercase tracking-wide">Kiwify</span>
                            </div>

                            {/* Vasta */}
                            <div className="flex-1 flex flex-col justify-end relative h-full">
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2">
                                     <div className="h-8 w-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30 animate-bounce-slow">
                                        <Check className="h-4 w-4 text-white" strokeWidth={4} />
                                     </div>
                                </div>
                                <div 
                                    style={{ height: `100%` }} 
                                    className="w-full bg-gradient-to-b from-emerald-400 to-emerald-600 rounded-t-xl relative shadow-[0_0_40px_rgba(16,185,129,0.3)] hover:shadow-[0_0_60px_rgba(16,185,129,0.5)] transition-shadow duration-500"
                                >
                                    <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%,100%_100%] bg-[position:-100%_0,0_0] bg-no-repeat animate-[shine_3s_infinite]" />
                                </div>
                                <div className="mt-3 text-center">
                                    <span className="block text-xs font-black text-vasta-text uppercase tracking-wide">Vasta</span>
                                    <span className="block text-[9px] font-bold text-emerald-500">{results.vasta.planName}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="text-center pt-8 border-t border-vasta-border/50">
                <button
                    onClick={scrollToPlans}
                    className="inline-flex items-center gap-2 bg-vasta-text text-vasta-bg px-8 py-4 rounded-xl font-bold hover:scale-105 transition-transform"
                >
                    Ver planos detalhados <TrendingUp size={16} />
                </button>
            </div>
        </div>
    )
}
