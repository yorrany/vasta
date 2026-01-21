import { NetIncomeCalculator } from "../../../components/NetIncomeCalculator";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Calculadora de Ganhos | Dashboard Vasta",
};

export default function CalculatorPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-black text-vasta-text tracking-tight mb-2">Calculadora de Ganhos</h1>
                <p className="text-vasta-muted">Simule seus ganhos líquidos e descubra o melhor plano para o seu momento.</p>
            </div>

            <NetIncomeCalculator />
        </div>
    );
}
