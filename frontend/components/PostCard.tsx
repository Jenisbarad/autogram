'use client';

import { useState, useRef } from 'react';
import { publishPost, rejectPost, updateCaption } from '@/lib/api';

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

interface PostCardProps {
    post: Post;
    onRemove: (id: number) => void;
}

function ViralScoreBar({ score }: { score: number }) {
    const pct = Math.round(score * 100);
    const color = pct >= 70 ? '#10b981' : pct >= 40 ? '#f59e0b' : '#ef4444';
    return (
        <div>
            <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                <span>Viral Score</span>
                <span style={{ color, fontWeight: 700 }}>{pct}%</span>
            </div>
            <div className="score-bar">
                <div className="score-fill" style={{ width: `${pct}%`, background: color }} />
            </div>
        </div>
    );
}

const SOURCE_ICONS: Record<string, string> = {
    youtube: '▶️', reddit: '🤖', pexels: '🎞️', instagram: '📸', instagram_dm: '📩', default: '🌐',
};

const SOURCE_COLORS: Record<string, string> = {
    youtube: '#ef4444',
    reddit: '#f97316',
    pexels: '#3b82f6',
    instagram: '#a855f7',
    instagram_dm: '#ec4899',
    default: '#6b7280',
};

export default function PostCard({ post, onRemove }: PostCardProps) {
    const [loading, setLoading] = useState<'publish' | 'reject' | null>(null);
    const [editingCaption, setEditingCaption] = useState(false);
    const [caption, setCaption] = useState(post.caption || '');
    const [hashtags, setHashtags] = useState(post.hashtags || '');
    const [error, setError] = useState('');
    const [videoError, setVideoError] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    async function handlePublish() {
        setLoading('publish');
        setError('');
        try {
            await publishPost(post.id);
            onRemove(post.id);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Publish failed');
        } finally {
            setLoading(null);
        }
    }

    async function handleReject() {
        setLoading('reject');
        setError('');
        try {
            await rejectPost(post.id);
            onRemove(post.id);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Reject failed');
        } finally {
            setLoading(null);
        }
    }

    async function handleSaveCaption() {
        try {
            await updateCaption(post.id, caption, hashtags);
            setEditingCaption(false);
        } catch {
            setError('Failed to save caption');
        }
    }

    const sourceIcon = SOURCE_ICONS[post.source?.toLowerCase()] || SOURCE_ICONS.default;
    const dur = post.duration ? `${Math.round(post.duration)}s` : '—';

    return (
        <div className="card slide-up flex flex-col gap-3 hover:border-indigo-500/50 transition-colors">
            {/* Video Preview */}
            <div className="relative rounded-lg overflow-hidden bg-gray-900 cursor-pointer"
                style={{ aspectRatio: '9/16', maxHeight: 280 }}
                onClick={() => {
                    if (videoRef.current) {
                        if (videoRef.current.paused) videoRef.current.play();
                        else videoRef.current.pause();
                    }
                }}>
                {post.media_url && !videoError ? (
                    <video
                        ref={videoRef}
                        src={post.media_url}
                        poster={post.thumbnail_url || undefined}
                        className="w-full h-full object-cover"
                        loop
                        muted
                        playsInline
                        onError={() => setVideoError(true)}
                    />
                ) : post.thumbnail_url ? (
                    <img src={post.thumbnail_url} alt="thumbnail" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
                        <span className="text-3xl mb-2">🎬</span>
                        <span className="text-xs">Media unavailable</span>
                    </div>
                )}

                {/* Overlay badges */}
                <div className="absolute top-2 left-2 flex gap-1">
                    <span className="badge" style={{ background: 'rgba(0,0,0,.7)' }}>{sourceIcon} {post.source}</span>
                </div>
                <div className="absolute top-2 right-2">
                    <span className="badge" style={{ background: 'rgba(0,0,0,.7)' }}>{dur}</span>
                </div>
                <div className="absolute bottom-2 text-center w-full">
                    <span className="text-xs text-gray-400">▶ click to play</span>
                </div>
            </div>

            {/* Stats Row */}
            <div className="flex items-center gap-2 flex-wrap">
                <span className="badge badge-pending text-xs">{post.resolution}</span>
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {new Date(post.created_at).toLocaleDateString()}
                </span>
                {post.source_url && (
                    <a href={post.source_url} target="_blank" rel="noreferrer"
                        className="text-xs ml-auto hover:underline" style={{ color: 'var(--accent)' }}>
                        Source ↗
                    </a>
                )}
            </div>

            {/* Viral Score */}
            <ViralScoreBar score={parseFloat(String(post.viral_score)) || 0} />

            {/* Caption */}
            <div>
                {editingCaption ? (
                    <div className="space-y-2">
                        <textarea value={caption} onChange={e => setCaption(e.target.value)}
                            rows={3} className="input text-xs resize-none" placeholder="Caption..." />
                        <textarea value={hashtags} onChange={e => setHashtags(e.target.value)}
                            rows={2} className="input text-xs resize-none" placeholder="#hashtags..." />
                        <div className="flex gap-2">
                            <button onClick={handleSaveCaption} className="btn btn-primary text-xs py-1 px-3">Save</button>
                            <button onClick={() => setEditingCaption(false)} className="btn btn-ghost text-xs py-1 px-3">Cancel</button>
                        </div>
                    </div>
                ) : (
                    <div className="cursor-pointer group" onClick={() => setEditingCaption(true)}>
                        <div className="text-xs leading-relaxed line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                            {caption || '(No caption)'}
                        </div>
                        <div className="text-xs mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            style={{ color: 'var(--accent)' }}>✏️ Edit caption</div>
                    </div>
                )}
            </div>

            {/* Error */}
            {error && (
                <div className="text-xs p-2 rounded" style={{ background: 'rgba(239,68,68,.1)', color: 'var(--accent-red)' }}>
                    {error}
                </div>
            )}

            {/* Prominent Source Badge */}
            <div style={{
                background: `${SOURCE_COLORS[post.source?.toLowerCase()] || SOURCE_COLORS.default}22`,
                border: `1px solid ${SOURCE_COLORS[post.source?.toLowerCase()] || SOURCE_COLORS.default}55`,
                borderRadius: 8,
                padding: '6px 10px',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
            }}>
                <span style={{ fontSize: 14 }}>{sourceIcon}</span>
                <span style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: SOURCE_COLORS[post.source?.toLowerCase()] || SOURCE_COLORS.default,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                }}>
                    {post.source || 'Unknown Source'}
                </span>
                {post.source_url && (
                    <a href={post.source_url} target="_blank" rel="noreferrer"
                        className="ml-auto text-xs hover:underline"
                        style={{ color: SOURCE_COLORS[post.source?.toLowerCase()] || SOURCE_COLORS.default }}>
                        View ↗
                    </a>
                )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-auto">
                <button onClick={handlePublish} disabled={!!loading} className="btn btn-publish text-sm justify-center">
                    {loading === 'publish'
                        ? <><span className="loader" style={{ width: 14, height: 14, borderWidth: 2 }}></span> Publishing...</>
                        : '✓ Publish'}
                </button>
                <button onClick={handleReject} disabled={!!loading} className="btn btn-reject text-sm justify-center">
                    {loading === 'reject'
                        ? <><span className="loader" style={{ width: 14, height: 14, borderWidth: 2 }}></span></>
                        : '✗ Reject'}
                </button>
            </div>
        </div>
    );
}
