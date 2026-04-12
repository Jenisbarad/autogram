'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { getAccountBySlug, getAccountPosts, findContent } from '@/lib/api';
import PostCard from '@/components/PostCard';

interface Account {
    id: number;
    page_name: string;
    username: string;
    category: string;
    slug: string;
    posting_mode: string;
    pending_count?: number;
    published_count?: number;
}

interface Post {
    id: number;
    media_url: string;
    thumbnail_url: string | null;
    caption: string;
    hashtags: string;
    resolution: string;
    duration: number;
    source: string;
    source_url: string;
    viral_score: number;
    status: string;
    created_at: string;
}

const STATUS_TABS = ['pending', 'published', 'rejected'] as const;
type StatusTab = typeof STATUS_TABS[number];

export default function DashboardPage() {
    const params = useParams();
    const slug = typeof params.slug === 'string' ? params.slug : Array.isArray(params.slug) ? params.slug[0] : '';

    const [account, setAccount] = useState<Account | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [tab, setTab] = useState<StatusTab>('pending');
    const [loadingAccount, setLoadingAccount] = useState(true);
    const [loadingPosts, setLoadingPosts] = useState(false);
    const [discovering, setDiscovering] = useState(false);
    const [discoverPlatform, setDiscoverPlatform] = useState('both');
    const [discoverMsg, setDiscoverMsg] = useState('');
    const [error, setError] = useState('');

    // Load account by slug
    useEffect(() => {
        if (!slug) return;
        setLoadingAccount(true);
        getAccountBySlug(slug)
            .then(d => setAccount(d.account))
            .catch(() => setError('Account not found'))
            .finally(() => setLoadingAccount(false));
    }, [slug]);

    // Load posts
    const loadPosts = useCallback(() => {
        if (!account) return;
        setLoadingPosts(true);
        getAccountPosts(account.id, tab, 50)
            .then(d => setPosts(d.posts || []))
            .catch(console.error)
            .finally(() => setLoadingPosts(false));
    }, [account, tab]);

    useEffect(() => {
        loadPosts();
    }, [loadPosts]);

    // Poll for new posts while discovering
    useEffect(() => {
        if (!discovering) return;
        const interval = setInterval(loadPosts, 5000);
        return () => clearInterval(interval);
    }, [discovering, loadPosts]);

    async function handleFindContent() {
        if (!account) return;
        setDiscovering(true);
        setDiscoverMsg('');
        try {
            const res = await findContent(account.id, discoverPlatform);
            setDiscoverMsg(`✅ ${res.message} — Content will appear below as it's processed.`);
        } catch (err: unknown) {
            setDiscoverMsg('❌ ' + (err instanceof Error ? err.message : 'Failed to start discovery'));
        } finally {
            setTimeout(() => setDiscovering(false), 30000);
        }
    }

    function removePost(id: number) {
        setPosts(prev => prev.filter(p => p.id !== id));
    }

    if (loadingAccount) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="loader"></div>
                <span className="ml-3" style={{ color: 'var(--text-secondary)' }}>Loading dashboard...</span>
            </div>
        );
    }

    if (error || !account) {
        return (
            <div className="p-6 text-center py-20">
                <div className="text-4xl mb-4">😕</div>
                <div className="text-lg font-semibold mb-2">Page not found</div>
                <div style={{ color: 'var(--text-secondary)' }}>{error || 'This Instagram page does not exist.'}</div>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="page-header">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold mb-1">{account.page_name}</h1>
                        <div className="flex items-center gap-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                            <span>@{account.username}</span>
                            <span>•</span>
                            <span className="capitalize">{account.category}</span>
                            <span>•</span>
                            <span className={`badge ${account.posting_mode === 'auto' ? 'badge-approved' : 'badge-pending'}`}>
                                {account.posting_mode} mode
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <select
                            value={discoverPlatform}
                            onChange={(e) => setDiscoverPlatform(e.target.value)}
                            disabled={discovering}
                            className="input bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                            style={{ minWidth: 120 }}
                        >
                            <option value="both">Both</option>
                            <option value="instagram">Instagram</option>
                            <option value="youtube">YouTube</option>
                        </select>
                        <button
                            onClick={handleFindContent}
                            disabled={discovering}
                            className="btn btn-primary pulse-glow"
                            style={{ minWidth: 160 }}
                        >
                            {discovering ? (
                                <><span className="loader" style={{ width: 16, height: 16, borderWidth: 2 }}></span> Discovering...</>
                            ) : (
                                '🔍 Find Content'
                            )}
                        </button>
                    </div>
                </div>

                {discoverMsg && (
                    <div className="mt-3 text-sm px-3 py-2 rounded-lg"
                        style={{
                            background: discoverMsg.startsWith('✅') ? 'rgba(16,185,129,.1)' : 'rgba(239,68,68,.1)',
                            color: discoverMsg.startsWith('✅') ? 'var(--accent-green)' : 'var(--accent-red)',
                            border: '1px solid',
                            borderColor: discoverMsg.startsWith('✅') ? 'rgba(16,185,129,.3)' : 'rgba(239,68,68,.3)',
                        }}>
                        {discoverMsg}
                    </div>
                )}
            </div>

            {/* Content Area */}
            <div className="p-6">
                {/* Status Tabs */}
                <div className="flex gap-2 mb-6">
                    {STATUS_TABS.map(s => (
                        <button
                            key={s}
                            onClick={() => setTab(s)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize`}
                            style={{
                                background: tab === s ? 'var(--accent)' : 'var(--bg-card)',
                                border: '1px solid',
                                borderColor: tab === s ? 'var(--accent)' : 'var(--border)',
                                color: tab === s ? '#fff' : 'var(--text-secondary)',
                            }}
                        >
                            {s}
                            {s === 'pending' && posts.length > 0 && tab === 'pending' && (
                                <span className="ml-2 text-xs rounded-full px-1.5 py-0.5 font-bold"
                                    style={{ background: 'var(--accent-yellow)', color: '#000' }}>
                                    {posts.length}
                                </span>
                            )}
                        </button>
                    ))}

                    <div className="ml-auto">
                        <button onClick={loadPosts} className="btn btn-ghost text-sm" disabled={loadingPosts}>
                            {loadingPosts ? <span className="loader" style={{ width: 14, height: 14 }} /> : '↻ Refresh'}
                        </button>
                    </div>
                </div>

                {/* Posts Grid */}
                {loadingPosts ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="loader"></div>
                        <span className="ml-3" style={{ color: 'var(--text-secondary)' }}>Loading posts...</span>
                    </div>
                ) : posts.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="text-4xl mb-3">
                            {tab === 'pending' ? '📭' : tab === 'published' ? '📤' : '🗑️'}
                        </div>
                        <div className="text-lg font-semibold mb-2">
                            {tab === 'pending' ? 'No pending content' : tab === 'published' ? 'No published posts yet' : 'No rejected posts'}
                        </div>
                        {tab === 'pending' && (
                            <div style={{ color: 'var(--text-secondary)', fontSize: '.9rem' }}>
                                Click <strong>Find Content</strong> to discover viral videos for this page
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="posts-grid">
                        {posts.map(post => (
                            <PostCard key={post.id} post={post} onRemove={removePost} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
