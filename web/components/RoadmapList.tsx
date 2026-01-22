"use client";

import useSWR from "swr";
import { ArrowBigUp, Loader2, Sparkles, CheckCircle2, Clock, Check } from "lucide-react";
import { useAuth } from "../lib/AuthContext";
import { useState } from "react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface RoadmapFeature {
    id: string;
    title: string;
    description: string;
    status: "planned" | "in_progress" | "live";
    votes_count: number;
}

interface RoadmapData {
    features: RoadmapFeature[];
    total_votes: number;
}

export function RoadmapList() {
    const { user, openAuthModal } = useAuth();
    // Use internal API route
    const apiUrl = "/api";
    const { data, error, mutate } = useSWR<RoadmapData>(`${apiUrl}/roadmap`, fetcher, {
        refreshInterval: 5000,
    });

    const [votingFor, setVotingFor] = useState<string | null>(null);

    const handleVote = async (featureId: string) => {
        if (!user) {
            openAuthModal("signin");
            return;
        }

        setVotingFor(featureId);

        // Optimistic Update
        mutate(
            (currentData) => {
                if (!currentData) return undefined;
                return {
                    ...currentData,
                    features: currentData.features.map(f => {
                        if (f.id === featureId) {
                            // Simple toggle simulation logic for optimistic UI
                            // In reality we don't know if user already voted from this stripped public payload
                            // So we just blindly increment. Correct logic requires fetching "my votes" or checking a "voted" boolean in payload
                            return { ...f, votes_count: f.votes_count + 1 };
                        }
                        return f;
                    })
                };
            },
            false // do not revalidate immediately
        );

        try {
            const token = (await import("../lib/supabase/client")).createClient().auth.getSession().then(s => s.data.session?.access_token);

            await fetch(`${apiUrl}/roadmap/${featureId}/vote`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${await token}`,
                    "Content-Type": "application/json",
                },
            });
            // Revalidate to get true state
            mutate();
        } catch (e) {
            console.error("Vote failed", e);
            mutate(); // Revert on error
        } finally {
            setVotingFor(null);
        }
    };

    if (!data && !error) {
        return (
            <div className="flex justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-vasta-muted" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center p-12 bg-red-500/5 rounded-2xl border border-red-500/10">
                <p className="font-bold text-red-500">Erro ao carregar roadmap.</p>
            </div>
        );
    }

    const features = data?.features || [];

    const StatusBadge = ({ status }: { status: string }) => {
        switch (status) {
            case 'live':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wide bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        No Ar
                    </span>
                )
            case 'in_progress':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wide bg-amber-500/10 text-amber-500 border border-amber-500/20">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Construindo
                    </span>
                )
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wide bg-vasta-muted/10 text-vasta-muted border border-vasta-muted/20">
                        <Clock className="w-3 h-3" />
                        Planejado
                    </span>
                )
        }
    }

    return (
        <div className="grid gap-4">
            {features.map((feature) => (
                <div
                    key={feature.id}
                    className="group relative flex gap-4 p-5 rounded-2xl bg-vasta-surface border border-vasta-border/50 hover:border-vasta-primary/30 transition-all hover:bg-vasta-surface-soft hover:shadow-lg hover:shadow-vasta-primary/5"
                >
                    {/* Vote Action */}
                    <button
                        onClick={() => handleVote(feature.id)}
                        disabled={!!votingFor}
                        className="flex flex-col items-center justify-center gap-1 h-16 w-14 shrink-0 rounded-xl bg-vasta-bg border border-vasta-border hover:border-vasta-primary hover:text-vasta-primary transition-all active:scale-95 group/vote"
                    >
                        <ArrowBigUp className={`w-6 h-6 ${votingFor === feature.id ? "animate-bounce text-vasta-primary" : "text-vasta-muted group-hover/vote:text-vasta-primary"}`} />
                        <span className="text-xs font-bold text-vasta-text">{feature.votes_count}</span>
                    </button>

                    <div className="flex-1 min-w-0 pt-1">
                        <div className="flex items-center justify-between gap-4 mb-2">
                            <h3 className="text-base font-bold text-vasta-text group-hover:text-vasta-primary transition-colors">
                                {feature.title}
                            </h3>
                            <StatusBadge status={feature.status} />
                        </div>
                        <p className="text-sm text-vasta-muted leading-relaxed line-clamp-2">
                            {feature.description}
                        </p>

                        {feature.status === 'in_progress' && (
                            <div className="mt-4 w-full h-1 bg-vasta-bg rounded-full overflow-hidden">
                                <div className="h-full bg-amber-500/50 w-2/3 animate-pulse rounded-full" />
                            </div>
                        )}
                    </div>
                </div>
            ))}

            {features.length === 0 && (
                <div className="text-center py-12 text-vasta-muted">
                    Nenhuma feature cadastrada no momento.
                </div>
            )}
        </div>
    );
}
