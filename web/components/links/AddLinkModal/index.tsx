"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { AddLinkState, AddLinkView } from "./types"
import { GalleryView } from "./GalleryView"
import { FormView } from "./FormView"
import { ProductModal } from "../../products/ProductModal"
import { FormModal } from "../../forms/FormModal"
import { CollectionModal } from "../../collections/CollectionModal"
import { IntegrationView } from "../../integrations/IntegrationView"

interface AddLinkModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    initialState?: AddLinkState // Allow opening directly in a specific state (e.g. from paste)
}

export function AddLinkModal({ isOpen, onClose, onSuccess, initialState }: AddLinkModalProps) {
    const [state, setState] = useState<AddLinkState>({ view: 'gallery' })
    const [productModalOpen, setProductModalOpen] = useState(false)

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
        switch (type) {
            case 'link':
                setState({ view: 'form' })
                break
            case 'product':
                setProductModalOpen(true)
                break
            case 'collection':
                setState({ view: 'collection' })
                break
            case 'form':
                setState({ view: 'form-modal' })
                break
            case 'instagram':
                setState({ view: 'instagram', integrationType: 'instagram' })
                break
            case 'tiktok':
                setState({ view: 'tiktok', integrationType: 'tiktok' })
                break
            case 'youtube':
                setState({ view: 'youtube', integrationType: 'youtube' })
                break
            default:
                alert("Tipo não implementado: " + type)
        }
    }

    const handleUrlInput = (url: string) => {
        setState({ view: 'form', url })
    }

    const handleBack = () => {
        setState({ view: 'gallery' })
    }

    const handleSuccess = () => {
        onSuccess()
        onClose()
        setState({ view: 'gallery' })
    }

    if (!isOpen) return null

    // Product modal is separate because it has its own overlay
    if (productModalOpen) {
        return (
            <>
                <ProductModal
                    isOpen={productModalOpen}
                    onClose={() => {
                        setProductModalOpen(false)
                        onClose()
                    }}
                    onSuccess={handleSuccess}
                />
            </>
        )
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4 overflow-x-hidden overflow-y-auto"
            role="dialog"
            aria-modal="true"
        >
            <div className="w-full max-w-2xl h-[600px] max-h-[90vh] bg-vasta-surface rounded-3xl border border-vasta-border shadow-2xl p-4 sm:p-6 relative flex flex-col animate-in zoom-in-95 duration-200 overflow-hidden">

                {/* Header acts as close area if needed, but we put X absolute */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10 text-vasta-muted hover:text-vasta-text transition-colors p-1 rounded-full hover:bg-vasta-surface-soft"
                    title="Close"
                >
                    <X size={24} />
                </button>

                {/* Header Title dynamic based on view */}
                {state.view === 'gallery' && (
                    <h2 className="text-xl font-bold text-vasta-text mb-4">Adicionar</h2>
                )}

                <div className="flex-1 overflow-hidden min-w-0">
                    {state.view === 'gallery' ? (
                        <GalleryView
                            onSelectType={handleSelectType}
                            onUrlInput={handleUrlInput}
                        />
                    ) : state.view === 'form' ? (
                        <FormView
                            initialUrl={state.url}
                            initialTitle={state.title}
                            onBack={handleBack}
                            onSuccess={handleSuccess}
                        />
                    ) : state.view === 'form-modal' ? (
                        <FormModal
                            isOpen={true}
                            onSuccess={handleSuccess}
                            onBack={handleBack}
                            embedded={true}
                        />
                    ) : state.view === 'collection' ? (
                        <CollectionModal
                            isOpen={true}
                            onSuccess={handleSuccess}
                            onBack={handleBack}
                            embedded={true}
                        />
                    ) : state.view === 'instagram' || state.view === 'tiktok' || state.view === 'youtube' ? (
                        <IntegrationView
                            type={state.integrationType || 'instagram'}
                            onBack={handleBack}
                            onSuccess={handleSuccess}
                        />
                    ) : null}
                </div>
            </div>
        </div>
    )
}
