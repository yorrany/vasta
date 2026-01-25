"use client"

import { useState } from "react"
import { X, ShoppingBag, ChevronLeft, ChevronRight, Share2 } from "lucide-react"

interface Product {
    id: number
    title: string
    description: string
    price: number
    image_url: string | null
    gallery_urls?: string[]
    type: string
}

interface PublicProductModalProps {
    isOpen: boolean
    onClose: () => void
    product: Product | null
    onBuy: (product: Product) => void
    accentColor?: string
}

export function PublicProductModal({ isOpen, onClose, product, onBuy, accentColor = "#000", isDark = false }: PublicProductModalProps & { isDark?: boolean }) {
    const [activeImageIndex, setActiveImageIndex] = useState(0)

    if (!isOpen || !product) return null

    // Combine main image + gallery
    const allImages = [product.image_url, ...(product.gallery_urls || [])].filter(Boolean) as string[]

    const handleNextImage = () => {
        setActiveImageIndex((prev) => (prev + 1) % allImages.length)
    }

    const handlePrevImage = () => {
        setActiveImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length)
    }

    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className={`relative w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col md:flex-row h-[85vh] md:h-auto md:max-h-[85vh] ${isDark ? 'bg-stone-900' : 'bg-white'}`}>

                {/* Close Button (Mobile) */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-50 p-2 bg-black/50 text-white rounded-full md:hidden backdrop-blur-md"
                >
                    <X size={20} />
                </button>

                {/* Image Section */}
                <div className="w-full md:w-1/2 bg-black relative flex items-center justify-center h-1/2 md:h-auto min-h-[300px]">
                    {allImages.length > 0 ? (
                        <>
                            <img
                                src={allImages[activeImageIndex]}
                                alt={product.title}
                                className="w-full h-full object-contain"
                            />

                            {/* Navigation Arrows */}
                            {allImages.length > 1 && (
                                <>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handlePrevImage() }}
                                        className="absolute left-4 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 backdrop-blur-sm transition-all"
                                    >
                                        <ChevronLeft size={24} />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleNextImage() }}
                                        className="absolute right-4 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 backdrop-blur-sm transition-all"
                                    >
                                        <ChevronRight size={24} />
                                    </button>

                                    {/* Dots Indicator */}
                                    <div className="absolute bottom-4 flex gap-2">
                                        {allImages.map((_, idx) => (
                                            <div
                                                key={idx}
                                                className={`h-1.5 rounded-full transition-all duration-300 ${idx === activeImageIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/40'}`}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </>
                    ) : (
                        <div className="text-white/30 text-6xl">🛍️</div>
                    )}
                </div>

                {/* Info Section */}
                <div className={`flex-1 flex flex-col p-6 md:p-10 overflow-y-auto ${isDark ? 'bg-[#0B0E14] text-gray-100' : 'bg-white text-gray-900'}`}>
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-2">{product.title}</h2>
                            <span className={`inline-block px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider opacity-70 ${isDark ? 'bg-white/10' : 'bg-gray-100'}`}>
                                {product.type === 'digital' ? 'Produto Digital' : product.type === 'service' ? 'Serviço' : 'Produto Físico'}
                            </span>
                        </div>
                        <button
                            onClick={onClose}
                            className={`hidden md:flex p-2 rounded-full transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <div className={`prose max-w-none mb-8 flex-1 overflow-y-auto custom-scrollbar ${isDark ? 'prose-invert' : 'prose-stone'}`}>
                        <p className="whitespace-pre-wrap text-base leading-relaxed opacity-80">{product.description}</p>
                    </div>

                    <div className={`mt-auto pt-6 border-t ${isDark ? 'border-white/10' : 'border-gray-100'}`}>
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm opacity-60 font-medium">Preço total</span>
                            <span className="text-3xl font-bold" style={{ color: accentColor }}>
                                {product.price > 0 ? `R$ ${product.price.toFixed(2).replace('.', ',')}` : 'Grátis'}
                            </span>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => onBuy(product)}
                                className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-base hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl text-white"
                                style={{ backgroundColor: accentColor }}
                            >
                                <ShoppingBag size={20} />
                                {product.price > 0 ? 'Comprar Agora' : 'Acessar Conteúdo'}
                            </button>
                            <button
                                className={`p-4 rounded-xl border transition-colors ${isDark ? 'border-white/10 hover:bg-white/5' : 'border-gray-200 hover:bg-gray-50'}`}
                                title="Compartilhar"
                            >
                                <Share2 size={20} />
                            </button>
                        </div>
                        <p className="text-center text-xs opacity-40 mt-4">
                            Pagamento seguro via Stripe • Entrega imediata
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
