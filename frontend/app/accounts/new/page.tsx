'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createAccount } from '@/lib/api';

const CATEGORIES = [
    'nature', 'cricket', 'memes', 'quotes', 'travel', 'food',
    'fitness', 'music', 'fashion', 'tech', 'other',
];

export default function NewAccountPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({
        page_name: '', username: '', category: 'nature',
        instagram_user_id: '', access_token: '',
        app_id: '', app_secret: '',
        posting_mode: 'manual', auto_viral_threshold: '0.70',
        watermark_text: '', allowed_submitters: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const data = {
                ...form,
                auto_viral_threshold: parseFloat(form.auto_viral_threshold),
                watermark_text: form.watermark_text || `@${form.username}`,
            };
            await createAccount(data);
            router.push('/');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to create account');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="page-header">
                <h1 className="text-2xl font-bold mb-1">Add Instagram Page</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '.9rem' }}>
                    Connect a new Instagram page to start automating content
                </p>
            </div>

            <div className="p-6 max-w-2xl">
                <form onSubmit={handleSubmit} className="card space-y-5">
                    {error && (
                        <div className="p-3 rounded-lg text-sm" style={{ background: 'rgba(239,68,68,.1)', color: 'var(--accent-red)', border: '1px solid rgba(239,68,68,.3)' }}>
                            ⚠️ {error}
                        </div>
                    )}

                    {/* Page Info */}
                    <div>
                        <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-secondary)' }}>
                            Page Information
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium mb-1">Page Name *</label>
                                <input name="page_name" value={form.page_name} onChange={handleChange}
                                    className="input" placeholder="e.g. My Nature Page" required />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Instagram Username *</label>
                                    <input name="username" value={form.username} onChange={handleChange}
                                        className="input" placeholder="e.g. naturepage" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Category *</label>
                                    <select name="category" value={form.category} onChange={handleChange} className="input">
                                        {CATEGORIES.map(c => (
                                            <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Watermark Text</label>
                                <input name="watermark_text" value={form.watermark_text} onChange={handleChange}
                                    className="input" placeholder={`@${form.username || 'yourpage'}`} />
                            </div>
                        </div>
                    </div>

                    <hr style={{ borderColor: 'var(--border)' }} />

                    {/* Instagram API */}
                    <div>
                        <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-secondary)' }}>
                            Instagram API Credentials
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium mb-1">Instagram User ID</label>
                                <input name="instagram_user_id" value={form.instagram_user_id} onChange={handleChange}
                                    className="input" placeholder="Your numeric Instagram User ID" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Access Token</label>
                                <input name="access_token" value={form.access_token} onChange={handleChange}
                                    className="input" placeholder="Long-lived access token" type="password" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium mb-1">App ID</label>
                                    <input name="app_id" value={form.app_id} onChange={handleChange}
                                        className="input" placeholder="Facebook App ID" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">App Secret</label>
                                    <input name="app_secret" value={form.app_secret} onChange={handleChange}
                                        className="input" placeholder="Facebook App Secret" type="password" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <hr style={{ borderColor: 'var(--border)' }} />

                    {/* Posting Mode */}
                    <div>
                        <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-secondary)' }}>
                            Automation Settings
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium mb-1">Posting Mode</label>
                                <select name="posting_mode" value={form.posting_mode} onChange={handleChange} className="input">
                                    <option value="manual">Manual (approve each post)</option>
                                    <option value="auto">Auto (post if score passes)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Auto Viral Threshold</label>
                                <input name="auto_viral_threshold" value={form.auto_viral_threshold} onChange={handleChange}
                                    className="input" type="number" min="0" max="1" step="0.05" />
                                <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                                    0.0 – 1.0 (higher = stricter)
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Allowed Submitters */}
                    <div>
                        <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-secondary)' }}>
                            📩 Allowed Submitters (Auto-Publish)
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Instagram Usernames</label>
                            <input name="allowed_submitters" value={form.allowed_submitters} onChange={handleChange}
                                className="input" placeholder="e.g. cricketfan1, user2, user3 (comma-separated)" />
                            <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                                Reels shared or tagged from these users will be auto-published without approval.
                            </div>
                        </div>
                    </div>

                    <hr style={{ borderColor: 'var(--border)' }} />

                    {/* Submit */}
                    <div className="flex gap-3 pt-2">
                        <button type="submit" className="btn btn-primary flex-1 justify-center" disabled={loading}>
                            {loading ? <><span className="loader" style={{ width: 16, height: 16, borderWidth: 2 }}></span> Creating...</> : '✓ Create Page'}
                        </button>
                        <button type="button" className="btn btn-ghost" onClick={() => router.push('/')}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
