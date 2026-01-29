
"use client"

import { useEffect, useState } from "react"
import { BarChart3, ArrowUpRight, MousePointer2, Smartphone, Monitor } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/lib/AuthContext"

export default function AnalyticsPage() {
    const { user } = useAuth()
    const supabase = createClient()
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({
        visits: 0,
        clicks: 0,
        ctr: 0
    })
    const [topLinks, setTopLinks] = useState<any[]>([])
    const [dailyVisits, setDailyVisits] = useState<any[]>([])

    const fetchAnalytics = async () => {
        if (!user) return

        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        // 1. Fetch Events (Views & Clicks)
        const { data: events } = await supabase
            .from('analytics_events')
            .select('*')
            .eq('profile_id', user.id)
            .gte('created_at', thirtyDaysAgo.toISOString())

        if (events) {
            const views = events.filter((e: any) => e.type === 'view')
            const clicks = events.filter((e: any) => e.type === 'click')

            const totalVisits = views.length
            const totalClicks = clicks.length
            const ctr = totalVisits > 0 ? (totalClicks / totalVisits) * 100 : 0

            setStats({
                visits: totalVisits,
                clicks: totalClicks,
                ctr
            })

            // 2. Prepare Chart Data (Last 7 Days)
            const last7Days = Array.from({ length: 7 }, (_, i) => {
                const d = new Date()
                d.setDate(d.getDate() - (6 - i))
                return d
            })

            const chartData = last7Days.map(date => {
                const dayStr = date.toLocaleDateString('pt-BR', { weekday: 'narrow' }).toUpperCase()
                const dateStr = date.toISOString().split('T')[0]

                const dayViews = views.filter((e: any) => e.created_at.startsWith(dateStr)).length
                const isToday = date.getDate() === new Date().getDate()

                return {
                    day: dayStr,
                    val: dayViews,
                    active: isToday
                }
            })

            // Normalize for UI
            const maxVal = Math.max(...chartData.map(d => d.val)) || 1
            setDailyVisits(chartData.map(d => ({ ...d, heightPct: (d.val / maxVal) * 100 })))

            // 3. Top Links logic
            // We need to count clicks per link_id
            const linkCounts: Record<string, number> = {}
            clicks.forEach((c: any) => {
                if (c.link_id) {
                    linkCounts[c.link_id] = (linkCounts[c.link_id] || 0) + 1
                }
            })

            // We need link titles. Let's fetch links or rely on what we have?
            // Better to fetch active links to map IDs
            if (Object.keys(linkCounts).length > 0) {
                const { data: linksData } = await supabase
                    .from('links')
                    .select('id, title, url')
                    .in('id', Object.keys(linkCounts))

                if (linksData) {
                    const sortedLinks = linksData.map(l => ({
                        ...l,
                        clicks: linkCounts[l.id] || 0
                    })).sort((a, b) => b.clicks - a.clicks).slice(0, 5) // Top 5

                    setTopLinks(sortedLinks)
                }
            }
        }
        setLoading(false)
    }

    useEffect(() => {
        if (!user) return

        fetchAnalytics()

        // Realtime Subscription
        const channel = supabase
            .channel('analytics_realtime')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'analytics_events',
                    filter: `profile_id=eq.${user.id}`
                },
                (payload: any) => {
                    // Refresh data when a new event occurs
                    fetchAnalytics()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [user])


    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
            <div>
                <h1 className="text-2xl font-bold text-vasta-text">Analytics</h1>
                <p className="text-sm text-vasta-muted">Visão geral do desempenho do seu perfil nos últimos 30 dias.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-vasta-surface p-6 rounded-[2rem] border border-vasta-border shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                            <ArrowUpRight size={20} />
                        </div>
                        <span className="text-xs font-bold uppercase text-vasta-muted tracking-wider">Total de Visitas</span>
                    </div>
                    <div className="text-4xl font-black text-vasta-text">{loading ? '-' : stats.visits}</div>
                </div>

                <div className="bg-vasta-surface p-6 rounded-[2rem] border border-vasta-border shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
                            <MousePointer2 size={20} />
                        </div>
                        <span className="text-xs font-bold uppercase text-vasta-muted tracking-wider">Cliques Totais</span>
                    </div>
                    <div className="text-4xl font-black text-vasta-text">{loading ? '-' : stats.clicks}</div>
                </div>

                <div className="bg-vasta-surface p-6 rounded-[2rem] border border-vasta-border shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                            <BarChart3 size={20} />
                        </div>
                        <span className="text-xs font-bold uppercase text-vasta-muted tracking-wider">Taxa de Clique (CTR)</span>
                    </div>
                    <div className="text-4xl font-black text-vasta-text">{loading ? '-' : `${stats.ctr.toFixed(1)}%`}</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Chart */}
                <div className="bg-vasta-surface p-8 rounded-[2rem] border border-vasta-border">
                    <h3 className="font-bold text-lg text-vasta-text mb-8">Visitas (7 dias)</h3>

                    <div className="flex items-end justify-between h-48 gap-4">
                        {loading ? (
                            <div className="w-full text-center text-vasta-muted text-xs">Carregando...</div>
                        ) : dailyVisits.length > 0 ? dailyVisits.map((item, idx) => (
                            <div key={idx} className="flex flex-col items-center gap-3 flex-1">
                                <div
                                    className={`w-full max-w-[40px] rounded-t-xl transition-all duration-500 ${item.active ? 'bg-vasta-primary' : 'bg-vasta-surface-soft'}`}
                                    style={{ height: item.val === 0 ? '4px' : `${Math.max(item.heightPct, 5)}%` }}
                                />
                                <span className="text-[10px] font-bold text-vasta-muted">{item.day}</span>
                            </div>
                        )) : (
                            <div className="w-full text-center text-vasta-muted text-xs">Sem dados recentes</div>
                        )}
                    </div>
                </div>

                {/* Top Links */}
                <div className="bg-vasta-surface p-8 rounded-[2rem] border border-vasta-border">
                    <h3 className="font-bold text-lg text-vasta-text mb-6">Links Mais Clicados</h3>

                    <div className="space-y-4">
                        {loading ? (
                            <div className="text-xs text-vasta-muted">Carregando...</div>
                        ) : topLinks.length > 0 ? topLinks.map((link, i) => (
                            <div key={link.id} className="flex items-center justify-between p-3 rounded-xl bg-vasta-surface-soft/50 border border-vasta-border/50">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="h-6 w-6 rounded-full bg-vasta-text text-vasta-bg flex items-center justify-center text-xs font-bold shrink-0">
                                        {i + 1}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-vasta-text truncate">{link.title}</p>
                                        <p className="text-[10px] text-vasta-muted truncate">{link.url}</p>
                                    </div>
                                </div>
                                <div className="text-sm font-bold text-vasta-text pl-2">{link.clicks}</div>
                            </div>
                        )) : (
                            <div className="p-8 text-center border border-dashed border-vasta-border rounded-xl">
                                <p className="text-sm text-vasta-muted">Nenhum clique registrado ainda.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
