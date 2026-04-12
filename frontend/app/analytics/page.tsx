'use client';

import { useEffect, useState } from 'react';
import { getAnalytics } from '@/lib/api';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, Legend,
} from 'recharts';

interface AccountStats {
    id: number;
    page_name: string;
    username: string;
    slug: string;
    category: string;
    total_published: number;
    total_pending: number;
    total_rejected: number;
    avg_viral_score: number;
    total_likes: number;
    total_comments: number;
    total_views: number;
    total_followers_gained: number;
}

interface TimeSeriesPoint {
    date: string;
    count: number;
    page_name: string;
}

interface RecentPost {
    id: number;
    caption: string;
    thumbnail_url: string | null;
    viral_score: number;
    published_at: string;
    page_name: string;
    username: string;
    likes: number;
    comments: number;
    views: number;
}

const CUSTOM_TOOLTIP_STYLE = {
    background: '#111827',
    border: '1px solid #1f2937',
    borderRadius: 8,
    color: '#f9fafb',
    fontSize: 12,
};

export default function AnalyticsPage() {
    const [data, setData] = useState<{ accounts: AccountStats[]; timeSeries: TimeSeriesPoint[]; recentPosts: RecentPost[] } | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedAccount, setSelectedAccount] = useState<string>('all');

    useEffect(() => {
        const id = selectedAccount === 'all' ? undefined : selectedAccount;
        setLoading(true);
        getAnalytics(id)
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [selectedAccount]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="loader"></div>
                <span className="ml-3" style={{ color: 'var(--text-secondary)' }}>Loading analytics...</span>
            </div>
        );
    }

    const accounts = data?.accounts || [];
    const timeSeries = data?.timeSeries || [];
    const recentPosts = data?.recentPosts || [];

    // Aggregate totals
    const totals = accounts.reduce((acc, a) => ({
        published: acc.published + (Number(a.total_published) || 0),
        pending: acc.pending + (Number(a.total_pending) || 0),
        likes: acc.likes + (Number(a.total_likes) || 0),
        views: acc.views + (Number(a.total_views) || 0),
        followers: acc.followers + (Number(a.total_followers_gained) || 0),
    }), { published: 0, pending: 0, likes: 0, views: 0, followers: 0 });

    const barData = accounts.map(a => ({
        name: a.page_name.length > 12 ? a.page_name.slice(0, 12) + '…' : a.page_name,
        published: Number(a.total_published) || 0,
        pending: Number(a.total_pending) || 0,
        likes: Number(a.total_likes) || 0,
        views: Number(a.total_views) || 0,
    }));

    // Time series grouped by date
    const dateMap: Record<string, number> = {};
    timeSeries.forEach(p => {
        const d = p.date?.slice(0, 10);
        dateMap[d] = (dateMap[d] || 0) + Number(p.count);
    });
    const timeData = Object.entries(dateMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, count]) => ({ date: date.slice(5), count }));

    return (
        <div>
            <div className="page-header flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold mb-1">Analytics</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '.9rem' }}>Performance across all your Instagram pages</p>
                </div>
                <select value={selectedAccount} onChange={e => setSelectedAccount(e.target.value)}
                    className="input" style={{ width: 'auto' }}>
                    <option value="all">All Pages</option>
                    {accounts.map(a => <option key={a.id} value={String(a.id)}>{a.page_name}</option>)}
                </select>
            </div>

            <div className="p-6 space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Total Published', value: totals.published, icon: '📤', color: 'var(--accent)' },
                        { label: 'Total Pending', value: totals.pending, icon: '⏳', color: 'var(--accent-yellow)' },
                        { label: 'Total Likes', value: totals.likes.toLocaleString(), icon: '❤️', color: 'var(--accent-red)' },
                        { label: 'Total Views', value: totals.views.toLocaleString(), icon: '👁️', color: 'var(--accent-green)' },
                    ].map(stat => (
                        <div key={stat.label} className="card text-center">
                            <div className="text-2xl mb-1">{stat.icon}</div>
                            <div className="text-2xl font-bold mb-0.5" style={{ color: stat.color }}>{stat.value}</div>
                            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {/* Posts per account bar chart */}
                    <div className="card">
                        <div className="font-semibold mb-4">Posts per Page</div>
                        {barData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={barData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                                    <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                                    <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                                    <Tooltip contentStyle={CUSTOM_TOOLTIP_STYLE} />
                                    <Legend wrapperStyle={{ fontSize: 12, color: '#9ca3af' }} />
                                    <Bar dataKey="published" name="Published" fill="#6366f1" radius={[3, 3, 0, 0]} />
                                    <Bar dataKey="pending" name="Pending" fill="#f59e0b" radius={[3, 3, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : <EmptyChart />}
                    </div>

                    {/* Time series line chart */}
                    <div className="card">
                        <div className="font-semibold mb-4">Posts Published (Last 30 Days)</div>
                        {timeData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={220}>
                                <LineChart data={timeData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                                    <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                                    <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                                    <Tooltip contentStyle={CUSTOM_TOOLTIP_STYLE} />
                                    <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2}
                                        dot={{ fill: '#6366f1', r: 3 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : <EmptyChart />}
                    </div>
                </div>

                {/* Page Leaderboard */}
                {accounts.length > 0 && (
                    <div className="card">
                        <div className="font-semibold mb-4">Page Leaderboard</div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>
                                        {['Page', 'Category', 'Published', 'Pending', 'Avg Score', 'Likes', 'Views'].map(h => (
                                            <th key={h} className="text-left pb-3 pr-4 font-medium">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {accounts.map(a => (
                                        <tr key={a.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                            <td className="py-2.5 pr-4">
                                                <div className="font-medium">{a.page_name}</div>
                                                <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>@{a.username}</div>
                                            </td>
                                            <td className="py-2.5 pr-4 capitalize text-xs" style={{ color: 'var(--text-secondary)' }}>{a.category}</td>
                                            <td className="py-2.5 pr-4 font-semibold" style={{ color: 'var(--accent)' }}>{Number(a.total_published) || 0}</td>
                                            <td className="py-2.5 pr-4" style={{ color: 'var(--accent-yellow)' }}>{Number(a.total_pending) || 0}</td>
                                            <td className="py-2.5 pr-4">
                                                <span style={{ color: Number(a.avg_viral_score) >= 0.5 ? 'var(--accent-green)' : 'var(--text-secondary)' }}>
                                                    {a.avg_viral_score ? (Number(a.avg_viral_score) * 100).toFixed(1) + '%' : '—'}
                                                </span>
                                            </td>
                                            <td className="py-2.5 pr-4">{Number(a.total_likes || 0).toLocaleString()}</td>
                                            <td className="py-2.5">{Number(a.total_views || 0).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Recent Published Posts */}
                {recentPosts.length > 0 && (
                    <div className="card">
                        <div className="font-semibold mb-4">Recent Published Posts</div>
                        <div className="space-y-3">
                            {recentPosts.map(p => (
                                <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'var(--bg-secondary)' }}>
                                    {p.thumbnail_url && (
                                        <img src={p.thumbnail_url} alt="" className="w-12 h-16 object-cover rounded" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm truncate">{p.caption || '(no caption)'}</div>
                                        <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                                            {p.page_name} • {p.published_at ? new Date(p.published_at).toLocaleDateString() : '—'}
                                        </div>
                                    </div>
                                    <div className="text-right text-xs space-y-0.5">
                                        {p.likes != null && <div>❤️ {Number(p.likes).toLocaleString()}</div>}
                                        {p.views != null && <div>👁️ {Number(p.views).toLocaleString()}</div>}
                                        <div style={{ color: 'var(--accent)' }}>
                                            {(Number(p.viral_score) * 100).toFixed(1)}%
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function EmptyChart() {
    return (
        <div className="flex items-center justify-center h-[220px] text-sm" style={{ color: 'var(--text-secondary)' }}>
            No data yet
        </div>
    );
}
