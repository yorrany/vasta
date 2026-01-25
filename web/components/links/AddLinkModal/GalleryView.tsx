"use client"

import { Search, Link, LayoutGrid, ShoppingBag, MessageSquare, Calendar, Type } from "lucide-react"
import { isValidUrl } from "./types"

interface GalleryViewProps {
    onSelectType: (type: 'link' | 'collection' | 'product' | 'form') => void
    onUrlInput: (url: string) => void
}

const QUICK_ACTIONS = [
    { label: 'Link', icon: Link, type: 'link' as const, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Coleção', icon: LayoutGrid, type: 'collection' as const, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { label: 'Produto', icon: ShoppingBag, type: 'product' as const, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { label: 'Formulário', icon: MessageSquare, type: 'form' as const, color: 'text-pink-500', bg: 'bg-pink-500/10' },
]

const CATEGORIES = [
    { id: 'sugeridos', label: 'Sugeridos', icon: Search },
    { id: 'comercio', label: 'Comércio', icon: ShoppingBag },
    { id: 'social', label: 'Social', icon: MessageSquare },
    { id: 'midia', label: 'Mídia', icon: LayoutGrid },
    { id: 'contato', label: 'Contato', icon: MessageSquare },
    { id: 'eventos', label: 'Eventos', icon: Calendar },
    { id: 'texto', label: 'Texto', icon: Type },
]

interface GalleryItem {
    name: string
    desc: string
    icon: any
    type: string
    color: string
    categories: string[]
}

const ITEMS: GalleryItem[] = [
    // Social
    { name: 'Instagram', desc: 'Mostre seus posts e reels', icon: MessageSquare, type: 'link', color: 'bg-gradient-to-tr from-yellow-500 via-red-500 to-purple-500', categories: ['sugeridos', 'social'] },
    { name: 'TikTok', desc: 'Compartilhe seus TikToks', icon: MessageSquare, type: 'link', color: 'bg-black', categories: ['sugeridos', 'social'] },
    { name: 'YouTube', desc: 'Destaque vídeos do seu canal', icon: LayoutGrid, type: 'link', color: 'bg-red-600', categories: ['sugeridos', 'social', 'midia'] },
    { name: 'Spotify', desc: 'Músicas, álbuns ou playlists', icon: LayoutGrid, type: 'link', color: 'bg-green-500', categories: ['sugeridos', 'midia'] },
    { name: 'X / Twitter', desc: 'Mostre seus últimos tweets', icon: MessageSquare, type: 'link', color: 'bg-black', categories: ['social'] },
    { name: 'LinkedIn', desc: 'Conecte-se profissionalmente', icon: MessageSquare, type: 'link', color: 'bg-blue-700', categories: ['social'] },

    // Comércio
    { name: 'Produto', desc: 'Venda um produto único', icon: ShoppingBag, type: 'product', color: 'bg-orange-500', categories: ['comercio'] },
    { name: 'Coleção', desc: 'Agrupe vários produtos', icon: LayoutGrid, type: 'collection', color: 'bg-purple-500', categories: ['comercio'] },

    // Contato
    { name: 'WhatsApp', desc: 'Botão direto para conversa', icon: MessageSquare, type: 'link', color: 'bg-green-500', categories: ['contato'] },
    { name: 'Email', desc: 'Receba emails diretamente', icon: MessageSquare, type: 'link', color: 'bg-gray-500', categories: ['contato'] },
    { name: 'Formulário', desc: 'Capture leads e respostas', icon: MessageSquare, type: 'form', color: 'bg-pink-500', categories: ['contato'] },

    // Texto
    { name: 'Título', desc: 'Adicione um cabeçalho', icon: Type, type: 'header', color: 'bg-gray-800', categories: ['texto'] },
    { name: 'Parágrafo', desc: 'Adicione texto explicativo', icon: Type, type: 'text', color: 'bg-gray-600', categories: ['texto'] },

    // Eventos
    { name: 'Evento', desc: 'Promova um evento', icon: Calendar, type: 'link', color: 'bg-red-500', categories: ['eventos'] },
]

export function GalleryView({ onSelectType, onUrlInput }: GalleryViewProps) {
    const [selectedCategory, setSelectedCategory] = useState('sugeridos')
    const [searchQuery, setSearchQuery] = useState('')

    const handlePaste = (e: React.ClipboardEvent) => {
        const text = e.clipboardData.getData('text')
        if (isValidUrl(text)) {
            e.preventDefault()
            onUrlInput(text)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const text = e.target.value
        setSearchQuery(text)
        if (isValidUrl(text)) {
            // Optional: debounce or just let user finish typing if they want to paste?
            // Current UX implies immediate action on URL detection which is fine.
            onUrlInput(text)
        }
    }

    const filteredItems = ITEMS.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.desc.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory = selectedCategory === 'all' || item.categories.includes(selectedCategory)

        return searchQuery ? matchesSearch : matchesCategory
    })

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
                    value={searchQuery}
                    autoFocus
                />
            </div>

            <div className="flex flex-1 gap-6 min-h-0">
                {/* Sidebar Categories */}
                <div className="w-40 shrink-0 space-y-1 overflow-y-auto pr-2 custom-scrollbar">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => {
                                setSelectedCategory(cat.id)
                                setSearchQuery('') // Clear search when changing category for clarity? Or keep it? Clearing is usually safer UX here.
                            }}
                            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${selectedCategory === cat.id
                                ? 'bg-vasta-surface-soft text-vasta-text'
                                : 'text-vasta-muted hover:bg-vasta-surface-soft hover:text-vasta-text'
                                }`}
                        >
                            <cat.icon size={16} />
                            {cat.label}
                        </button>
                    ))}
                    <button
                        onClick={() => setSelectedCategory('all')}
                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${selectedCategory === 'all'
                            ? 'bg-vasta-surface-soft text-vasta-text'
                            : 'text-vasta-muted hover:bg-vasta-surface-soft hover:text-vasta-text'
                            }`}
                    >
                        <span className="flex h-4 w-4 items-center justify-center font-bold">•••</span>
                        Ver todos
                    </button>
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {/* Quick Actions Grid - Only show on Sugeridos and no search */}
                    {selectedCategory === 'sugeridos' && !searchQuery && (
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
                    )}

                    {/* Apps List */}
                    <div>
                        <h3 className="text-xs font-semibold text-vasta-muted uppercase mb-3">
                            {searchQuery ? 'Resultados' : (selectedCategory === 'all' ? 'Todos os Itens' : CATEGORIES.find(c => c.id === selectedCategory)?.label)}
                        </h3>

                        <div className="space-y-1">
                            {filteredItems.map(item => (
                                <button
                                    key={item.name}
                                    onClick={() => onSelectType(item.type as any)}
                                    className="flex w-full items-center justify-between rounded-xl p-2 hover:bg-vasta-surface-soft transition-colors group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`h-10 w-10 shrink-0 rounded-xl ${item.color} text-white flex items-center justify-center shadow-sm`}>
                                            <item.icon size={20} />
                                        </div>
                                        <div className="text-left">
                                            <div className="font-medium text-sm text-vasta-text">{item.name}</div>
                                            <div className="text-xs text-vasta-muted">{item.desc}</div>
                                        </div>
                                    </div>
                                    <div className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-vasta-muted">
                                        →
                                    </div>
                                </button>
                            ))}

                            {filteredItems.length === 0 && (
                                <div className="py-8 text-center text-vasta-muted text-sm">
                                    Nenhum item encontrado.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
