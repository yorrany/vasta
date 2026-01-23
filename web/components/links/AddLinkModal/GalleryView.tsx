"use client"

import { Search, Link, LayoutGrid, ShoppingBag, MessageSquare, Calendar, Type } from "lucide-react"
import { isValidUrl } from "./types"

interface GalleryViewProps {
    onSelectType: (type: 'link' | 'collection' | 'product' | 'form') => void
    onUrlInput: (url: string) => void
}

const QUICK_ACTIONS = [
    { label: 'Coleção', icon: LayoutGrid, type: 'collection' as const, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { label: 'Link', icon: Link, type: 'link' as const, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Produto', icon: ShoppingBag, type: 'product' as const, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { label: 'Formulário', icon: MessageSquare, type: 'form' as const, color: 'text-pink-500', bg: 'bg-pink-500/10' },
]

const CATEGORIES = [
    { label: 'Sugeridos', icon: Search }, // Using Search as generic bulb replacement
    { label: 'Comércio', icon: ShoppingBag },
    { label: 'Social', icon: MessageSquare }, // approximate
    { label: 'Mídia', icon: LayoutGrid }, // approximate
    { label: 'Contato', icon: MessageSquare },
    { label: 'Eventos', icon: Calendar },
    { label: 'Texto', icon: Type },
]

export function GalleryView({ onSelectType, onUrlInput }: GalleryViewProps) {

    const handlePaste = (e: React.ClipboardEvent) => {
        const text = e.clipboardData.getData('text')
        if (isValidUrl(text)) {
            e.preventDefault()
            onUrlInput(text)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const text = e.target.value
        if (isValidUrl(text)) {
            onUrlInput(text)
        }
    }

    return (
        <div className="flex h-full flex-col">
            {/* Search Bar */}
            <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-vasta-muted" size={20} />
                <input
                    type="text"
                    placeholder="Cole ou pesquise um link"
                    className="w-full rounded-2xl bg-vasta-surface-soft border border-vasta-border py-3 pl-12 pr-4 text-vasta-text outline-none focus:border-vasta-primary focus:ring-1 focus:ring-vasta-primary transition-all"
                    onPaste={handlePaste}
                    onChange={handleChange}
                    autoFocus
                />
            </div>

            <div className="flex flex-1 gap-6 min-h-0">
                {/* Sidebar Categories */}
                <div className="w-40 shrink-0 space-y-1 overflow-y-auto pr-2 custom-scrollbar">
                    {CATEGORIES.map((cat, i) => (
                        <button
                            key={cat.label}
                            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${i === 0 ? 'bg-vasta-surface-soft text-vasta-text' : 'text-vasta-muted hover:bg-vasta-surface-soft hover:text-vasta-text'}`}
                        >
                            <cat.icon size={16} />
                            {cat.label}
                        </button>
                    ))}
                    <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-vasta-muted hover:bg-vasta-surface-soft hover:text-vasta-text transition-colors">
                        <span className="flex h-4 w-4 items-center justify-center font-bold">•••</span>
                        Ver todos
                    </button>
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {/* Quick Actions Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        {QUICK_ACTIONS.map(action => (
                            <button
                                key={action.label}
                                onClick={() => onSelectType(action.type)}
                                className="flex flex-col items-start gap-4 rounded-2xl bg-vasta-surface-soft/50 p-4 transition-all hover:scale-[1.02] hover:bg-vasta-surface-soft border border-vasta-border/50 hover:border-vasta-border"
                            >
                                <span className="text-sm font-medium text-vasta-text">{action.label}</span>
                                <div className={`rounded-lg p-2 ${action.bg} ${action.color}`}>
                                    <action.icon size={20} />
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Suggested Apps List */}
                    <div>
                        <h3 className="text-xs font-semibold text-vasta-muted uppercase mb-3">Sugeridos</h3>
                        {/* Visual Only for now */}
                        <div className="space-y-1">
                            {[
                                { name: 'Instagram', desc: 'Mostre seus posts e reels', color: 'bg-gradient-to-tr from-yellow-500 via-red-500 to-purple-500' },
                                { name: 'TikTok', desc: 'Compartilhe seus TikToks no seu perfil', color: 'bg-black' },
                                { name: 'YouTube', desc: 'Compartilhe vídeos do YouTube', color: 'bg-red-600' },
                                { name: 'Spotify', desc: 'Compartilhe suas músicas favoritas', color: 'bg-green-500' },
                            ].map(app => (
                                <button
                                    key={app.name}
                                    onClick={() => onSelectType('link')} // Default to link form for these
                                    className="flex w-full items-center justify-between rounded-xl p-2 hover:bg-vasta-surface-soft transition-colors group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`h-10 w-10 shrink-0 rounded-xl ${app.color} text-white flex items-center justify-center shadow-sm`}>
                                            {/* Icon placeholder */}
                                            <span className="font-bold text-xs">{app.name[0]}</span>
                                        </div>
                                        <div className="text-left">
                                            <div className="font-medium text-sm text-vasta-text">{app.name}</div>
                                            <div className="text-xs text-vasta-muted">{app.desc}</div>
                                        </div>
                                    </div>
                                    <div className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-vasta-muted">
                                        →
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
