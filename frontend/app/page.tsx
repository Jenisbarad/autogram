'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAccounts } from '@/lib/api';

interface Account {
  id: number;
  page_name: string;
  username: string;
  slug: string;
  category: string;
  pending_count: number;
  published_count: number;
  rejected_count: number;
  posting_mode: string;
}

const categoryIcons: Record<string, string> = {
  nature: '🌿', cricket: '🏏', memes: '😂', quotes: '💬',
  travel: '✈️', food: '🍕', fitness: '💪', music: '🎵',
  fashion: '👗', tech: '💻', default: '📱',
};

export default function HomePage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAccounts()
      .then(d => setAccounts(d.accounts || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Header */}
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1">Instagram Pages</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '.9rem' }}>
            Manage all your Instagram automation pages
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/submit" className="btn btn-secondary bg-purple-600/20 text-purple-400 border border-purple-500/30 hover:bg-purple-600/30 transition-colors">
            🚀 Submit Reel
          </Link>
          <Link href="/accounts/new" className="btn btn-primary">
            ➕ Add Page
          </Link>
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="loader"></div>
            <span className="ml-3" style={{ color: 'var(--text-secondary)' }}>Loading accounts...</span>
          </div>
        ) : accounts.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📷</div>
            <h2 className="text-xl font-semibold mb-2">No pages yet</h2>
            <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
              Add your first Instagram page to get started
            </p>
            <Link href="/accounts/new" className="btn btn-primary">
              ➕ Add First Page
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {accounts.map(acc => {
              const icon = categoryIcons[acc.category?.toLowerCase()] || categoryIcons.default;
              return (
                <div key={acc.id} className="card slide-up hover:border-indigo-500 transition-colors">
                  {/* Top */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                      style={{ background: 'var(--bg-secondary)' }}>{icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate">{acc.page_name}</div>
                      <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>@{acc.username}</div>
                    </div>
                    <span className={`badge ${acc.posting_mode === 'auto' ? 'badge-approved' : 'badge-pending'}`}>
                      {acc.posting_mode}
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {[
                      { label: 'Pending', value: acc.pending_count, color: 'var(--accent-yellow)' },
                      { label: 'Published', value: acc.published_count, color: 'var(--accent-green)' },
                      { label: 'Rejected', value: acc.rejected_count, color: 'var(--accent-red)' },
                    ].map(stat => (
                      <div key={stat.label} className="text-center p-2 rounded-lg" style={{ background: 'var(--bg-secondary)' }}>
                        <div className="text-lg font-bold" style={{ color: stat.color }}>{stat.value || 0}</div>
                        <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{stat.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Category */}
                  <div className="text-xs mb-4 capitalize" style={{ color: 'var(--text-secondary)' }}>
                    Category: <span style={{ color: 'var(--text-primary)' }}>{acc.category}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link href={`/dashboard/${acc.slug}`}
                      className="btn btn-primary flex-1 justify-center text-center">
                      Open Dashboard
                    </Link>
                    <Link href={`/accounts/${acc.id}/settings`}
                      className="btn btn-ghost">⚙️</Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
