"use client";

import { useState, useMemo } from "react";
import { Check, Info, TrendingUp, DollarSign, Calculator } from "lucide-react";

export function NetIncomeCalculator() {
    const [revenue, setRevenue] = useState<number>(5000); // Default revenue
    const [selectedPlan, setSelectedPlan] = useState<"start" | "pro" | "business">("start");

    const plans = {
        start: {
            name: "Vasta Start",
            monthlyPrice: 0,
            fee: 0.08, // 8%
            features: ["Sem mensalidade", "Até 3 produtos"],
            color: "text-vasta-muted",
            borderColor: "border-vasta-border",
        },
        pro: {
            name: "Vasta Pro",
            monthlyPrice: 49.90,
            fee: 0.04, // 4%
            features: ["Produtos ilimitados", "Domínio próprio"],
            color: "text-indigo-500",
            borderColor: "border-indigo-500",
        },
        business: {
            name: "Vasta Business",
            monthlyPrice: 99.90,
            fee: 0.01, // 1%
            features: ["Menor taxa", "Suporte WhatsApp"],
            color: "text-vasta-primary",
            borderColor: "border-vasta-primary",
        },
    };

    const results = useMemo(() => {
        const plan = plans[selectedPlan];
        const feeAmount = revenue * plan.fee;
        const netIncome = revenue - feeAmount - plan.monthlyPrice;

        // Comparison (Savings vs Start)
        const startFeeAmount = revenue * plans.start.fee;
        const startNetIncome = revenue - startFeeAmount - plans.start.monthlyPrice;
        const savings = netIncome - startNetIncome;

        return {
            feeAmount,
            netIncome,
            savings,
        };
    }, [revenue, selectedPlan]);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(val);
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-6 md:p-10 rounded-3xl bg-vasta-surface border border-vasta-border/50 shadow-2xl relative overflow-hidden group">
            {/* Background Decor */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-vasta-primary/5 rounded-full blur-3xl group-hover:bg-vasta-primary/10 transition-all duration-700" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-all duration-700" />

            <div className="relative z-10 flex flex-col md:flex-row gap-8">
                {/* Left: Controls */}
                <div className="flex-1 space-y-8">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 rounded-lg bg-vasta-surface-soft border border-vasta-border/50">
                                <Calculator className="w-5 h-5 text-vasta-primary" />
                            </div>
                            <h3 className="text-xl font-bold text-vasta-text">Simule seus ganhos</h3>
                        </div>
                        <p className="text-sm text-vasta-muted">
                            Veja quanto você economiza escalando com o Vasta.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <label className="block text-sm font-bold text-vasta-text">
                            Faturamento Mensal Estimado
                        </label>
                        <div className="relative group/input">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <span className="text-vasta-muted font-bold text-lg">R$</span>
                            </div>
                            <input
                                type="number"
                                value={revenue}
                                onChange={(e) => setRevenue(Number(e.target.value))}
                                className="block w-full pl-12 pr-4 py-4 bg-vasta-bg border border-vasta-border rounded-xl text-lg font-bold text-vasta-text focus:ring-2 focus:ring-vasta-primary/20 focus:border-vasta-primary transition-all outline-none"
                                placeholder="5000"
                            />
                            <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-vasta-primary to-vasta-accent scale-x-0 group-focus-within/input:scale-x-100 transition-transform duration-500" />
                        </div>
                        <div className="flex justify-between text-xs font-bold text-vasta-muted uppercase tracking-wider">
                            <button onClick={() => setRevenue(1000)} className="hover:text-vasta-primary transition-colors">1k</button>
                            <button onClick={() => setRevenue(5000)} className="hover:text-vasta-primary transition-colors">5k</button>
                            <button onClick={() => setRevenue(10000)} className="hover:text-vasta-primary transition-colors">10k</button>
                            <button onClick={() => setRevenue(50000)} className="hover:text-vasta-primary transition-colors">50k</button>
                            <button onClick={() => setRevenue(100000)} className="hover:text-vasta-primary transition-colors">100k</button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="block text-sm font-bold text-vasta-text">
                            Escolha um Plano
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {(Object.entries(plans) as [keyof typeof plans, typeof plans.start][]).map(([key, plan]) => (
                                <button
                                    key={key}
                                    onClick={() => setSelectedPlan(key)}
                                    className={`relative flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-300 ${selectedPlan === key
                                            ? `${plan.borderColor} bg-vasta-surface shadow-lg scale-[1.02]`
                                            : "border-vasta-border/50 bg-vasta-surface-soft/50 hover:bg-vasta-surface-soft hover:border-vasta-border"
                                        }`}
                                >
                                    <p className={`text-xs font-bold uppercase mb-1 ${selectedPlan === key ? plan.color : "text-vasta-muted"}`}>
                                        {plan.name.replace("Vasta ", "")}
                                    </p>
                                    <p className="text-lg font-black text-vasta-text">
                                        {(plan.fee * 100).toFixed(0)}%
                                    </p>
                                    {selectedPlan === key && (
                                        <div className="absolute -top-2 -right-2 w-5 h-5 bg-vasta-text rounded-full flex items-center justify-center shadow-md">
                                            <Check className="w-3 h-3 text-vasta-bg" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Results */}
                <div className="flex-1 rounded-2xl bg-vasta-bg border border-vasta-border p-6 flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <DollarSign className="w-32 h-32 text-vasta-text" />
                    </div>

                    <div className="space-y-6 relative z-10">
                        <div>
                            <p className="text-sm font-medium text-vasta-muted mb-1">Seu Lucro Líquido</p>
                            <p className="text-4xl md:text-5xl font-black text-vasta-text tracking-tighter">
                                {formatCurrency(results.netIncome)}
                            </p>
                        </div>

                        <div className="space-y-3 pt-6 border-t border-vasta-border/50 border-dashed">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-vasta-muted">Taxas de transação</span>
                                <span className="font-bold text-red-500">
                                    - {formatCurrency(results.feeAmount)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-vasta-muted">Mensalidade do Plano</span>
                                <span className="font-bold text-red-500">
                                    - {formatCurrency(plans[selectedPlan].monthlyPrice)}
                                </span>
                            </div>
                        </div>

                        {results.savings > 0 && (
                            <div className="mt-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3 animate-fade-in-up">
                                <div className="p-2 rounded-full bg-emerald-500/20">
                                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-wide">Economia anual projetada</p>
                                    <p className="text-lg font-black text-emerald-500">
                                        {formatCurrency(results.savings * 12)}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-8 pt-6 border-t border-vasta-border/50">
                        <button className="w-full py-3 rounded-xl bg-vasta-text text-vasta-bg font-bold hover:bg-vasta-text-soft transition-colors shadow-lg shadow-vasta-text/10">
                            Começar com {plans[selectedPlan].name}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
