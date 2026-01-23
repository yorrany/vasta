'use client';

import { useState, useEffect, useTransition } from 'react';
import { initiateInstagramAuth } from '@/actions/instagram-auth';
import { updateDisplayMode, savePostLink, disconnectIntegration, getMyInstagramFeed } from '@/actions/instagram';
import Image from 'next/image';
import {
    Instagram,
    LayoutGrid,
    GalleryHorizontal,
    Link as LinkIcon,
    Trash2,
    ExternalLink,
    Loader2,
    CheckCircle,
    X
} from 'lucide-react';

interface InstagramMedia {
    id: string;
    media_url: string;
    thumbnail_url?: string;
    media_type: string;
    custom_link?: string;
    caption?: string;
    username?: string;
}

export default function InstagramSettings() {
    const [isPending, startTransition] = useTransition();
    const [loadingFeed, setLoadingFeed] = useState(false);

    // State
    const [isConnected, setIsConnected] = useState(false);
    const [displayMode, setDisplayMode] = useState<'grid' | 'gallery' | 'simple_link'>('grid');
    const [feed, setFeed] = useState<InstagramMedia[]>([]);

    // Custom Link Editor
    const [selectedPost, setSelectedPost] = useState<InstagramMedia | null>(null);
    const [customLinkUrl, setCustomLinkUrl] = useState('');

    // Initial Fetch
    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setLoadingFeed(true);
        try {
            // We use the feed fetch as a proxy for connection status + fetching data
            // In a real app, you might separate "status" from "heavy feed fetch"
            const data = await getMyInstagramFeed();
            if (data) {
                setIsConnected(true);
                setFeed(data as InstagramMedia[]);
                // Ideally we also fetch the saved 'display_mode' from settings table here
                // For now, defaulting to grid or we need another action `getSettings`
            } else {
                setIsConnected(false);
            }
        } catch (e) {
            console.error(e);
            setIsConnected(false);
        } finally {
            setLoadingFeed(false);
        }
    }

    const handleConnect = async () => {
        try {
            // Get Auth URL from Server Action
            const url = await initiateInstagramAuth();
            if (url) {
                window.location.href = url;
            }
        } catch (error: any) {
            console.error("Connection Error:", error);
            alert(error.message || 'Erro ao iniciar conexão com Instagram.');
        }
    };

    const handleDisconnect = async () => {
        if (!confirm('Tem certeza que deseja desconectar o Instagram?')) return;

        startTransition(async () => {
            await disconnectIntegration();
            setIsConnected(false);
            setFeed([]);
        });
    };

    const handleModeChange = (mode: 'grid' | 'gallery' | 'simple_link') => {
        setDisplayMode(mode);
        startTransition(async () => {
            await updateDisplayMode(mode);
        });
    };

    const openLinkEditor = (post: InstagramMedia) => {
        setSelectedPost(post);
        setCustomLinkUrl(post.custom_link || '');
    };

    const saveLink = async () => {
        if (!selectedPost) return;

        // Optimistic update
        const updatedFeed = feed.map(p =>
            p.id === selectedPost.id ? { ...p, custom_link: customLinkUrl } : p
        );
        setFeed(updatedFeed);
        setSelectedPost(null);

        startTransition(async () => {
            await savePostLink(selectedPost.id, customLinkUrl);
        });
    };

    if (loadingFeed) {
        return <div className="p-8 flex justify-center"><Loader2 className="animate-spin w-8 h-8 text-gray-400" /></div>;
    }

    if (!isConnected) {
        return (
            <div className="border border-gray-200 dark:border-gray-800 rounded-xl p-8 flex flex-col items-center text-center space-y-4 bg-gray-50 dark:bg-gray-900/50">
                <div className="w-16 h-16 bg-pink-100 dark:bg-pink-900/20 rounded-full flex items-center justify-center mb-2">
                    <Instagram className="w-8 h-8 text-pink-600 dark:text-pink-400" />
                </div>
                <h3 className="text-xl font-semibold">Conectar Instagram</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                    Exiba suas fotos, reels ou um link para seu perfil diretamente na sua página.
                </p>
                <button
                    onClick={handleConnect}
                    className="bg-black dark:bg-white text-white dark:text-black px-6 py-2.5 rounded-full font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
                >
                    <Instagram className="w-4 h-4" />
                    Conectar com Instagram
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header / Status */}
            <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900 gap-3">
                <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-2.5 h-2.5 shrink-0 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                    <div className="min-w-0">
                        <span className="font-medium block truncate">Instagram Conectado</span>
                        {feed[0]?.username && <span className="text-gray-500 text-sm truncate block">@{feed[0].username}</span>}
                    </div>
                </div>
                <button
                    onClick={handleDisconnect}
                    disabled={isPending}
                    className="shrink-0 text-red-500 hover:text-red-600 text-sm font-medium flex items-center gap-1.5 px-3 py-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                    <Trash2 className="w-4 h-4 shrink-0" />
                    <span className="hidden sm:inline">Desconectar</span>
                </button>
            </div>

            {/* Display Mode Selector */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium">Modo de Exibição</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                        onClick={() => handleModeChange('grid')}
                        className={`relative p-4 rounded-xl border-2 text-left transition-all ${displayMode === 'grid'
                            ? 'border-black dark:border-white bg-gray-50 dark:bg-gray-800'
                            : 'border-transparent bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-100 dark:border-gray-800'
                            }`}
                    >
                        <div className="mb-3 w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                            <LayoutGrid className="w-5 h-5" />
                        </div>
                        <div className="font-medium">Grade</div>
                        <div className="text-sm text-gray-500 mt-1">Layout 3x3</div>
                        {displayMode === 'grid' && (
                            <div className="absolute top-4 right-4 text-green-500"><CheckCircle className="w-5 h-5" /></div>
                        )}
                    </button>

                    <button
                        onClick={() => handleModeChange('gallery')}
                        className={`relative p-4 rounded-xl border-2 text-left transition-all ${displayMode === 'gallery'
                            ? 'border-black dark:border-white bg-gray-50 dark:bg-gray-800'
                            : 'border-transparent bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-100 dark:border-gray-800'
                            }`}
                    >
                        <div className="mb-3 w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                            <GalleryHorizontal className="w-5 h-5" />
                        </div>
                        <div className="font-medium">Galeria</div>
                        <div className="text-sm text-gray-500 mt-1">Rolagem Horizontal</div>
                        {displayMode === 'gallery' && (
                            <div className="absolute top-4 right-4 text-green-500"><CheckCircle className="w-5 h-5" /></div>
                        )}
                    </button>

                    <button
                        onClick={() => handleModeChange('simple_link')}
                        className={`relative p-4 rounded-xl border-2 text-left transition-all ${displayMode === 'simple_link'
                            ? 'border-black dark:border-white bg-gray-50 dark:bg-gray-800'
                            : 'border-transparent bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-100 dark:border-gray-800'
                            }`}
                    >
                        <div className="mb-3 w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                            <LinkIcon className="w-5 h-5" />
                        </div>
                        <div className="font-medium">Botão Simples</div>
                        <div className="text-sm text-gray-500 mt-1">Link direto</div>
                        {displayMode === 'simple_link' && (
                            <div className="absolute top-4 right-4 text-green-500"><CheckCircle className="w-5 h-5" /></div>
                        )}
                    </button>
                </div>
            </div>

            {/* Grid Editor (Only in Grid Mode) */}
            {displayMode === 'grid' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">Conteúdo da Grade</h3>
                        <span className="text-sm text-gray-500">Toque em um post para adicionar link</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 md:gap-4 max-w-md mx-auto md:mx-0">
                        {feed.slice(0, 9).map((post) => (
                            <button
                                key={post.id}
                                onClick={() => openLinkEditor(post)}
                                className="group relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden focus:outline-none focus:ring-2 ring-offset-2 ring-black dark:ring-white"
                            >
                                <Image
                                    src={post.media_type === 'VIDEO' ? (post.thumbnail_url || post.media_url) : post.media_url}
                                    alt="Post"
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                {/* Link Indicator */}
                                {post.custom_link && (
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
                                        <LinkIcon className="w-6 h-6 text-white" />
                                    </div>
                                )}
                                {/* Hover Overlay */}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <span className="text-white text-xs font-medium px-2 py-1 bg-white/20 backdrop-blur-md rounded-full">
                                        {post.custom_link ? 'Editar Link' : 'Add Link'}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Edit Link Modal (Dialog) */}
            {selectedPost && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-sm shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-start">
                            <h3 className="text-lg font-semibold">Adicionar Link ao Post</h3>
                            <button onClick={() => setSelectedPost(null)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="aspect-square w-24 h-24 relative rounded-lg overflow-hidden mx-auto bg-gray-100">
                            <Image
                                src={selectedPost.media_type === 'VIDEO' ? (selectedPost.thumbnail_url || selectedPost.media_url) : selectedPost.media_url}
                                alt="Preview"
                                fill
                                className="object-cover"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">URL de Destino</label>
                            <input
                                type="url"
                                placeholder="https://minhaloja.com.br/produto/123"
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent focus:ring-2 ring-black dark:ring-white outline-none"
                                value={customLinkUrl}
                                onChange={(e) => setCustomLinkUrl(e.target.value)}
                            />
                            <p className="text-xs text-gray-500">Deixe vazio para usar o link original do Instagram.</p>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => setSelectedPost(null)}
                                className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={saveLink}
                                className="flex-1 px-4 py-2 rounded-lg bg-black dark:bg-white text-white dark:text-black font-medium hover:opacity-90 transition-opacity"
                            >
                                Salvar Link
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
