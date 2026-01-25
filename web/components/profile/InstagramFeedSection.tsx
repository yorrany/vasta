'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Instagram, LayoutGrid, GalleryHorizontal, Link as LinkIcon } from 'lucide-react';
import { getPublicInstagramFeed } from '@/actions/instagram';

// We need a public action for settings too if we want to honor "display_mode".
// For MVP, let's assume Grid if not fetched, or create `getPublicInstagramSettings`.
// Actually, let's just use a hardcoded grid for now to test, OR fetch settings via action.

// Correct approach: We need an action for settings.
// I will reuse `getInstagramSettings` but expose it via `actions/instagram.ts` as `getPublicInstagramSettings`.
// For now, I'll default to 'grid'.

interface InstagramMedia {
    id: string;
    media_url: string;
    thumbnail_url?: string;
    media_type: string;
    custom_link?: string;
    caption?: string;
    username?: string;
    permalink: string;
}

export function InstagramFeedSection({ userId, theme, isPreview = false }: { userId: string, theme: string, isPreview?: boolean }) {
    const [feed, setFeed] = useState<InstagramMedia[]>([]);
    const [loading, setLoading] = useState(true);

    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        async function load() {
            try {
                const data = await getPublicInstagramFeed(userId);
                if (data) setFeed(data as InstagramMedia[]);
            } catch (err: any) {
                console.error("IG Feed Load Error", err);
                setErrorMsg(err.message || 'Erro desconhecido');
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [userId]);

    if (loading) return null;
    if (errorMsg) return <div className="text-red-500 text-center py-4">Erro Instagram: {errorMsg}</div>;
    if (!feed || feed.length === 0) return null; // Hide section if no content or not connected

    // Default to Grid for Public Profile for now
    // We can enhance later to respect settings
    const displayMode = 'grid';

    // Theme adaptations
    const isNeo = theme === 'neo';
    const isNoir = theme === 'noir';

    const handleLinkClick = (e: React.MouseEvent) => {
        if (isPreview) {
            e.preventDefault();
        }
    }

    const marginClass = isPreview ? 'mt-6 lg:mt-0' : 'mt-12 lg:mt-0';
    const headerClass = isPreview ? 'text-[10px] mb-3' : 'text-sm mb-6';
    const iconSize = isPreview ? 12 : 16;
    const buttonClass = isPreview ? 'px-3 py-1.5 text-xs' : 'px-5 py-2 text-sm';
    const buttonIconSize = isPreview ? 12 : 14;

    const gapClass = isNeo ? 'gap-0' : (isPreview ? 'gap-1' : 'gap-1 md:gap-2');

    return (
        <div className={`${marginClass} ${loading ? 'opacity-50' : 'opacity-100'} transition-opacity`}>
            <h3 className={`text-center lg:text-left font-bold uppercase tracking-widest opacity-50 font-sans flex items-center gap-4 ${isNeo ? 'text-black' : ''} ${headerClass}`}>
                <span className="h-px flex-1 bg-current opacity-20 lg:hidden"></span>
                <span className="flex items-center gap-2"><Instagram size={iconSize} /> Instagram</span>
                <span className="h-px flex-1 bg-current opacity-20"></span>
            </h3>

            <div className={`grid grid-cols-3 ${gapClass} ${isNeo ? 'border-4 border-black bg-black' : ''} rounded-xl overflow-hidden`}>
                {feed.slice(0, 9).map((post, index) => (
                    <a
                        key={post.id}
                        href={post.custom_link || post.permalink}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={handleLinkClick}
                        className={`group relative aspect-square block overflow-hidden bg-gray-100 dark:bg-gray-800 ${isNeo ? 'border border-black rounded-none' : ''}`}
                    >
                        {post.media_type === 'VIDEO' ? (
                            <Image
                                src={post.thumbnail_url || post.media_url}
                                alt={post.caption || 'Instagram Video'}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                                priority={index < 4}
                            />
                        ) : (
                            <Image
                                src={post.media_url}
                                alt={post.caption || 'Instagram Post'}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                                priority={index < 4}
                            />
                        )}

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />

                        {/* Type Icon (Video/Carousel) could go here */}
                    </a>
                ))}
            </div>

            {/* Follow Button */}
            {feed[0]?.username && (
                <div className={`flex justify-center ${isPreview ? 'mt-4' : 'mt-6'}`}>
                    <a
                        href={`https://instagram.com/${feed[0].username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={handleLinkClick}
                        className={`
                            flex items-center gap-2 rounded-full font-medium transition-all ${buttonClass}
                            ${isNeo
                                ? 'bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none text-black'
                                : isNoir
                                    ? 'bg-white/5 border border-white/10 hover:bg-white/10 text-white'
                                    : 'bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20'
                            }
                        `}
                    >
                        <Instagram size={buttonIconSize} />
                        Seguir @{feed[0].username}
                    </a>
                </div>
            )}
        </div>
    );
}
