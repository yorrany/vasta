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
        <div className="flex h-full flex-col min-w-0 overflow-hidden">
            {/* Search Bar */}
            <div className="relative mb-4 sm:mb-6 shrink-0">
                <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-vasta-muted" size={18} />
                <input
                    type="text"
                    placeholder="Cole ou pesquise um link"
                    className="w-full rounded-2xl bg-vasta-surface-soft border border-vasta-border py-2.5 sm:py-3 pl-10 sm:pl-12 pr-3 sm:pr-4 text-sm sm:text-base text-vasta-text outline-none focus:border-vasta-primary focus:ring-1 focus:ring-vasta-primary transition-all"
                    onPaste={handlePaste}
                    onChange={handleChange}
                    autoFocus
                />
            </div>

            <div className="flex flex-1 gap-2 sm:gap-4 lg:gap-6 min-h-0 overflow-hidden">
                {/* Sidebar Categories */}
                <div className="w-24 sm:w-32 lg:w-40 shrink-0 space-y-1 overflow-y-auto pr-1 sm:pr-2 custom-scrollbar">
                    {CATEGORIES.map((cat, i) => (
                        <button
                            key={cat.label}
                            className={`flex w-full items-center gap-1.5 sm:gap-2 lg:gap-3 rounded-lg sm:rounded-xl px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs lg:text-sm font-medium transition-colors ${i === 0 ? 'bg-vasta-surface-soft text-vasta-text' : 'text-vasta-muted hover:bg-vasta-surface-soft hover:text-vasta-text'}`}
                            title={cat.label}
                        >
                            <cat.icon size={14} className="sm:w-4 sm:h-4 shrink-0" />
                            <span className="truncate hidden sm:inline">{cat.label}</span>
                        </button>
                    ))}
                    <button className="flex w-full items-center gap-1.5 sm:gap-2 lg:gap-3 rounded-lg sm:rounded-xl px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs lg:text-sm font-medium text-vasta-muted hover:bg-vasta-surface-soft hover:text-vasta-text transition-colors" title="Ver todos">
                        <span className="flex h-3 w-3 sm:h-4 sm:w-4 items-center justify-center font-bold shrink-0">•••</span>
                        <span className="truncate hidden sm:inline">Ver todos</span>
                    </button>
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar min-w-0">
                    {/* Quick Actions Grid */}
                    <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6">
                        {QUICK_ACTIONS.map(action => (
                            <button
                                key={action.label}
                                onClick={() => onSelectType(action.type)}
                                className="flex flex-col items-start gap-2 sm:gap-4 rounded-xl sm:rounded-2xl bg-vasta-surface-soft/50 p-3 sm:p-4 transition-all hover:scale-[1.02] hover:bg-vasta-surface-soft border border-vasta-border/50 hover:border-vasta-border min-w-0"
                            >
                                <span className="text-xs sm:text-sm font-medium text-vasta-text truncate w-full">{action.label}</span>
                                <div className={`rounded-lg p-1.5 sm:p-2 ${action.bg} ${action.color} shrink-0`}>
                                    <action.icon size={18} className="sm:w-5 sm:h-5" />
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Suggested Apps List */}
                    <div className="min-w-0">
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
                                    onClick={() => {
                                        // Map app names to integration types
                                        if (app.name === 'Instagram') onSelectType('instagram')
                                        else if (app.name === 'TikTok') onSelectType('tiktok')
                                        else if (app.name === 'YouTube') onSelectType('youtube')
                                        else onSelectType('link')
                                    }}
                                    className="flex w-full items-center justify-between rounded-xl p-2 hover:bg-vasta-surface-soft transition-colors group min-w-0"
                                >
                                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                                        <div className={`h-8 w-8 sm:h-10 sm:w-10 shrink-0 rounded-xl ${app.color} text-white flex items-center justify-center shadow-sm`}>
                                            {/* Icon placeholder */}
                                            <span className="font-bold text-[10px] sm:text-xs">{app.name[0]}</span>
                                        </div>
                                        <div className="text-left min-w-0 flex-1">
                                            <div className="font-medium text-xs sm:text-sm text-vasta-text truncate">{app.name}</div>
                                            <div className="text-[10px] sm:text-xs text-vasta-muted line-clamp-1">{app.desc}</div>
                                        </div>
                                    </div>
                                    <div className="opacity-0 sm:opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-vasta-muted shrink-0 ml-2">
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
