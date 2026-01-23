"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { AddLinkState, AddLinkView } from "./types"
import { GalleryView } from "./GalleryView"
import { FormView } from "./FormView"

interface AddLinkModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    initialState?: AddLinkState // Allow opening directly in a specific state (e.g. from paste)
}

export function AddLinkModal({ isOpen, onClose, onSuccess, initialState }: AddLinkModalProps) {
    const [state, setState] = useState<AddLinkState>({ view: 'gallery' })

    // Sync with props when they change (e.g. paste triggered while modal closed, or just opening)
    useEffect(() => {
        if (isOpen) {
            if (initialState) {
                setState(initialState)
            } else {
                // Default to gallery if no specific state requested
                setState({ view: 'gallery' })
            }
        }
    }, [isOpen, initialState])

    const handleSelectType = (type: string) => {
        if (type === 'link') {
            setState({ view: 'form' })
        } else {
            // Placeholder for other types
            alert("Not implemented yet: " + type)
        }
    }

    const handleUrlInput = (url: string) => {
        setState({ view: 'form', url })
    }

    if (!isOpen) return null

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            role="dialog"
            aria-modal="true"
        >
            <div className="w-full max-w-2xl h-[600px] bg-vasta-surface rounded-3xl border border-vasta-border shadow-2xl p-6 relative flex flex-col animate-in zoom-in-95 duration-200 overflow-hidden">

                {/* Header acts as close area if needed, but we put X absolute */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 z-10 text-vasta-muted hover:text-vasta-text transition-colors p-1 rounded-full hover:bg-vasta-surface-soft"
                    title="Close"
                >
                    <X size={24} />
                </button>

                {/* Header Title dynamic based on view? No, static "Add" is fine like screenshot, or hidden in FormView */}
                {state.view === 'gallery' && (
                    <h2 className="text-xl font-bold text-vasta-text mb-4">Adicionar</h2>
                )}

                <div className="flex-1 overflow-hidden">
                    {state.view === 'gallery' ? (
                        <GalleryView
                            onSelectType={handleSelectType}
                            onUrlInput={handleUrlInput}
                        />
                    ) : (
                        <FormView
                            initialUrl={state.url}
                            initialTitle={state.title}
                            onBack={() => setState({ view: 'gallery' })}
                            onSuccess={() => {
                                onSuccess()
                                onClose()
                            }}
                        />
                    )}
                </div>
            </div>
        </div>
    )
}
