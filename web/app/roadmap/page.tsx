import { RoadmapList } from "../../components/RoadmapList";
import { Sparkles, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Roadmap Público | Vasta",
    description: "Acompanhe e vote nas próximas funcionalidades do Vasta.",
};

export default function RoadmapPage() {
    return (
        <main className="min-h-screen bg-vasta-bg">
            {/* Header */}
            <div className="border-b border-vasta-border bg-vasta-surface/50 backdrop-blur-xl sticky top-0 z-10">
                <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="group flex items-center gap-2 text-sm font-bold text-vasta-muted hover:text-vasta-text transition-colors">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Voltar
                    </Link>
                    <div className="flex items-center gap-2">
                        <div className="h-6 w-px bg-vasta-border mx-2" />
                        <span className="text-sm font-black text-vasta-text tracking-tight uppercase">Roadmap</span>
                    </div>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-6 py-12 md:py-20">
                {/* Intro */}
                <div className="mb-12 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-vasta-primary/10 border border-vasta-primary/20 text-vasta-primary text-xs font-bold uppercase tracking-wider mb-6 animate-fade-in-up">
                        <Sparkles className="w-3 h-3" />
                        Construindo em Público
                    </div>

                    <h1 className="text-4xl md:text-6xl font-black text-vasta-text mb-6 tracking-tighter leading-[0.9]">
                        O futuro do Vasta <br />
                        <span className="text-vasta-muted">é você quem decide.</span>
                    </h1>

                    <p className="text-lg text-vasta-muted max-w-xl leading-relaxed">
                        Nossa transparência é total. Vote nas funcionalidades que você mais precisa e acompanhe o desenvolvimento em tempo real.
                    </p>
                </div>

                {/* List */}
                <RoadmapList />

                {/* Footer info */}
                <div className="mt-20 pt-10 border-t border-vasta-border text-center">
                    <p className="text-sm text-vasta-muted">
                        Tem uma ideia que não está aqui? <a href="#" className="text-vasta-primary hover:underline">Entre em contato</a>.
                    </p>
                </div>
            </div>
        </main>
    );
}
