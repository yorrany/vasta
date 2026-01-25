"use client"

import { ArrowLeft } from "lucide-react"
import { LinkForm } from "../LinkForm"

interface FormViewProps {
    initialUrl?: string
    initialTitle?: string
    platform?: string
    onBack: () => void
    onSuccess: () => void
}

export function FormView({ initialUrl, initialTitle, platform, onBack, onSuccess }: FormViewProps) {
    return (
        <div className="flex flex-col animate-in slide-in-from-right-10 duration-200 fade-in">
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-sm font-medium text-vasta-muted hover:text-vasta-text transition-colors mb-4 w-fit"
            >
                <ArrowLeft size={16} />
                Voltar para galeria
            </button>

            <div>
                <h2 className="text-xl font-bold text-vasta-text mb-4">Adicionar Link</h2>
                <LinkForm
                    initialUrl={initialUrl}
                    initialTitle={initialTitle}
                    platform={platform}
                    onSuccess={onSuccess}
                    onCancel={onBack}
                />
            </div>
        </div>
    )
}
